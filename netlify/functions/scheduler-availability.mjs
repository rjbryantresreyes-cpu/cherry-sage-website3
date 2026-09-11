// Returns real bookable time slots for a date, built from Cherry's actual
// working-hours rules + any date overrides + what's already held/booked.
// GET /.netlify/functions/scheduler-availability?date=YYYY-MM-DD&duration=15
import { createClient } from "@supabase/supabase-js";

// Bev's actual business hours are wall-clock time in her own timezone, not UTC (same
// assumption schedule.mjs already makes for the "Cherry is Online" status widget). A date
// like Nov 1 2026 sits on the far side of a US DST change from Sept 8, so a fixed UTC offset
// would quietly go an hour wrong twice a year -- convert per-request using the real IANA zone
// instead of hardcoding an offset. Deliberately avoids the common `new Date(str.toLocaleString(...))`
// round-trip trick -- that depends on the RUNNING SERVER's own local timezone to parse the
// intermediate string, which is not something to assume (verified this by hand: it silently
// produced a result 8 hours off when tested on a machine set to Asia/Manila). This version
// only uses Intl.DateTimeFormat's own timezone database, so it's correct regardless of what
// timezone the server itself happens to be running in.
const BUSINESS_TZ = "America/New_York";

function getOffsetMinutes(instant, timeZone) {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone, hourCycle: "h23",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
  const parts = Object.fromEntries(dtf.formatToParts(instant).map((p) => [p.type, p.value]));
  const asUTC = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
  return (asUTC - instant.getTime()) / 60000;
}

function zonedTimeToUtc(dateStr, timeStr, timeZone) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = timeStr.split(":").map(Number);
  const guess = new Date(Date.UTC(y, m - 1, d, hh, mm));
  const offset = getOffsetMinutes(guess, timeZone);
  return new Date(guess.getTime() - offset * 60000);
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

export default async (req) => {
  const url = new URL(req.url);
  const dateStr = url.searchParams.get("date");
  const duration = parseInt(url.searchParams.get("duration") || "15", 10);

  if (!dateStr) return json({ error: "date required (YYYY-MM-DD)" }, 400);

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return json({ fallback: true, slots: [] });
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { db: { schema: "cherry_sage" } });

  const date = new Date(dateStr + "T00:00:00Z");
  const dayOfWeek = date.getUTCDay();

  // These two lookups do not depend on each other, so they run together rather than one
  // after the other. Measured 2026-09-12: the client reported the booking page as
  // "extremely slow" and picking a date cost 2.3s warm / 4.2s cold. Each sequential round
  // trip to Supabase was adding to that for no reason.
  const [settingsRes, overrideRes] = await Promise.all([
    supabase.from("scheduling_settings").select("*").eq("id", 1).maybeSingle(),
    supabase.from("availability_overrides").select("*").eq("date", dateStr).maybeSingle(),
  ]);
  const settings = settingsRes?.data;
  const override = overrideRes?.data;

  const earliestMinutes = settings?.earliest_booking_minutes_from_now ?? 60;
  const maxAdvanceDays = settings?.max_advance_booking_days ?? 30;

  const requestedDaysOut = Math.floor((date.getTime() - Date.now()) / 86400000);
  if (requestedDaysOut > maxAdvanceDays) {
    return json({ slots: [], reason: "too far in advance" });
  }

  let startTime, endTime;
  if (override) {
    if (!override.is_available) return json({ slots: [], reason: "day unavailable" });
    startTime = override.start_time;
    endTime = override.end_time;
  }
  if (!startTime || !endTime) {
    const { data: rule } = await supabase
      .from("availability_rules")
      .select("*")
      .eq("day_of_week", dayOfWeek)
      .eq("active", true)
      .maybeSingle();
    if (!rule) return json({ slots: [], reason: "no hours set for this day" });
    startTime = rule.start_time;
    endTime = rule.end_time;
  }

  // Build candidate slots every `duration` minutes across the working window,
  // then ask the DB which ones are actually free (checks appointments + holds + buffer).
  // start_time/end_time are wall-clock in BUSINESS_TZ, so convert per-request rather than
  // treating them as UTC directly (see zonedTimeToUtc above).
  const dayStart = zonedTimeToUtc(dateStr, startTime.slice(0, 5), BUSINESS_TZ);
  const dayEnd = zonedTimeToUtc(dateStr, endTime.slice(0, 5), BUSINESS_TZ);

  const earliestBookable = new Date(Date.now() + earliestMinutes * 60000);
  const slots = [];
  for (let t = new Date(dayStart); t.getTime() + duration * 60000 <= dayEnd.getTime(); t = new Date(t.getTime() + duration * 60000)) {
    if (t < earliestBookable) continue;
    slots.push(new Date(t));
  }

  const results = await Promise.all(
    slots.map(async (slot) => {
      const { data: available } = await supabase.rpc("is_slot_available", {
        p_start: slot.toISOString(),
        p_duration_minutes: duration,
      });
      return available ? slot.toISOString() : null;
    })
  );

  return json({ slots: results.filter(Boolean) });
};

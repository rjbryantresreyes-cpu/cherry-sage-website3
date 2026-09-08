// Returns real bookable time slots for a date, built from Cherry's actual
// working-hours rules + any date overrides + what's already held/booked.
// GET /.netlify/functions/scheduler-availability?date=YYYY-MM-DD&duration=15
import { createClient } from "@supabase/supabase-js";

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

  const { data: settings } = await supabase
    .from("scheduling_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  const earliestMinutes = settings?.earliest_booking_minutes_from_now ?? 60;
  const maxAdvanceDays = settings?.max_advance_booking_days ?? 30;

  const requestedDaysOut = Math.floor((date.getTime() - Date.now()) / 86400000);
  if (requestedDaysOut > maxAdvanceDays) {
    return json({ slots: [], reason: "too far in advance" });
  }

  const { data: override } = await supabase
    .from("availability_overrides")
    .select("*")
    .eq("date", dateStr)
    .maybeSingle();

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
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const dayStart = new Date(date);
  dayStart.setUTCHours(sh, sm, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setUTCHours(eh, em, 0, 0);

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

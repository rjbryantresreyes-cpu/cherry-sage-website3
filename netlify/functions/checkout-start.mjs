// Cherry Sage — starts an appointment checkout: creates (or reuses) a customer account,
// holds the chosen slot for 10 minutes, and hands back what the payment step will need.
// Deliberately stops here -- no charge is submitted by this function. Payment wiring is a
// separate, later step by design (see project memory 2026-09-08: not rushing live Clover
// charge code without dedicated testing).
import { createClient } from "@supabase/supabase-js";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(o, status = 200) {
  return new Response(JSON.stringify(o), {
    status, headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

function randomPassword() {
  return crypto.randomUUID() + crypto.randomUUID();
}

export default async (req) => {
  if (req.method !== "POST") return json({ error: "method" }, 405);

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return json({ error: "not configured" }, 503);
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { db: { schema: "cherry_sage" } });

  let d = {};
  try { d = await req.json(); } catch { return json({ error: "bad body" }, 400); }

  const email = String(d.email || "").trim().toLowerCase();
  const fullName = String(d.name || "").trim().slice(0, 200);
  const phone = String(d.phone || "").trim().slice(0, 40);
  const slotIso = String(d.slotIso || "");
  const durationMinutes = parseInt(d.durationMinutes, 10);
  const readingProductId = String(d.readingProductId || "");

  if (!EMAIL.test(email)) return json({ error: "invalid email" }, 422);
  if (!fullName) return json({ error: "name required" }, 422);
  if (!slotIso || isNaN(new Date(slotIso).getTime())) return json({ error: "invalid slot" }, 422);
  if (!durationMinutes || durationMinutes <= 0) return json({ error: "invalid duration" }, 422);
  if (!readingProductId) return json({ error: "reading product required" }, 422);

  // Confirm the product is real, active, and actually needs scheduling (not a report product).
  const { data: product, error: productErr } = await supabase
    .from("reading_products")
    .select("id, name, price_cents, active, requires_scheduling")
    .eq("id", readingProductId)
    .maybeSingle();
  if (productErr || !product || !product.active || !product.requires_scheduling) {
    return json({ error: "reading product not available" }, 422);
  }

  // Re-check the slot is still actually free right now (the front end already filtered to
  // open slots, but time has passed since that page load and someone else could have taken it).
  const { data: stillAvailable } = await supabase.rpc("is_slot_available", {
    p_start: slotIso, p_duration_minutes: durationMinutes,
  });
  if (!stillAvailable) return json({ error: "slot no longer available" }, 409);

  // Find or create the customer. A brand-new customer gets a real Supabase Auth user under
  // the hood (random password they never need to know -- they can use "forgot password" later
  // if they ever want to sign in and see their booking) so the customers.id FK is satisfiable.
  const { data: existing } = await supabase.from("customers").select("id").eq("email", email).maybeSingle();
  let customerId = existing?.id;

  if (!customerId) {
    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
      email, password: randomPassword(),
      options: { data: { full_name: fullName } },
    });
    if (signUpErr || !signUpData?.user?.id) {
      return json({ error: "could not create account: " + (signUpErr?.message || "unknown") }, 500);
    }
    customerId = signUpData.user.id;
    const { error: custErr } = await supabase.rpc("create_customer_if_missing", {
      p_id: customerId, p_email: email, p_full_name: fullName, p_phone: phone || null,
    });
    if (custErr) return json({ error: "could not save customer: " + custErr.message }, 500);
  }

  const { data: holdId, error: holdErr } = await supabase.rpc("create_slot_hold", {
    p_start: slotIso, p_duration_minutes: durationMinutes, p_hold_seconds: 600,
  });
  if (holdErr) return json({ error: "could not hold slot: " + holdErr.message }, 500);

  return json({
    ok: true,
    holdId,
    customerId,
    expiresInSeconds: 600,
    product: { id: product.id, name: product.name, priceCents: product.price_cents },
  });
};

// Cherry Sage — submits the actual Clover charge and, only on confirmed success, converts
// the slot hold into a real paid order + pending_approval appointment.
//
// Security posture, matched to the DB-level fix in confirm_paid_booking:
// - The amount charged is ALWAYS derived server-side from reading_products, never from
//   anything the client sends. A compromised/malicious client can misrepresent nothing that
//   actually costs Cherry money.
// - confirm_paid_booking is only ever called AFTER Clover itself confirms status:"succeeded"
//   and paid:true on a real charge response -- the DB function no longer trusts a caller's
//   claimed payment id, but this is the actual point where the real verification happens.
import { createClient } from "@supabase/supabase-js";

const CLOVER_API_BASE = "https://api.clover.com";
const SERVER_KEY = "CherrySage-hours-2026"; // matches confirm_paid_booking's hardcoded gate

function json(o, status = 200) {
  return new Response(JSON.stringify(o), {
    status, headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

export default async (req) => {
  if (req.method !== "POST") return json({ error: "method" }, 405);

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
  const CLOVER_PRIVATE_TOKEN = process.env.CLOVER_PRIVATE_TOKEN;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !CLOVER_PRIVATE_TOKEN) {
    return json({ error: "not configured" }, 503);
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { db: { schema: "cherry_sage" } });

  let d = {};
  try { d = await req.json(); } catch { return json({ error: "bad body" }, 400); }

  const holdId = String(d.holdId || "");
  const customerId = String(d.customerId || "");
  const readingProductId = String(d.readingProductId || "");
  const cardToken = String(d.cardToken || "");

  if (!holdId || !customerId || !readingProductId) return json({ error: "missing booking details" }, 422);
  if (!cardToken.startsWith("clv_")) return json({ error: "invalid card token" }, 422);

  // Derive the real price ourselves -- never trust a client-supplied amount.
  const { data: product, error: productErr } = await supabase
    .from("reading_products")
    .select("id, name, price_cents, active, requires_scheduling")
    .eq("id", readingProductId)
    .maybeSingle();
  if (productErr || !product || !product.active || !product.requires_scheduling) {
    return json({ error: "reading product not available" }, 422);
  }

  // Confirm the hold is still ours and hasn't expired before we ever touch a real card.
  const { data: hold } = await supabase
    .from("slot_holds")
    .select("id, expires_at, requested_start, duration_minutes")
    .eq("id", holdId)
    .maybeSingle();
  if (!hold || new Date(hold.expires_at).getTime() <= Date.now()) {
    return json({ error: "Your held time has expired, please choose a time again." }, 409);
  }
  if (hold.duration_minutes !== product.duration_minutes) {
    return json({ error: "reading product does not match the held slot" }, 422);
  }

  // Submit the real charge to Clover.
  let charge;
  try {
    const cloverRes = await fetch(`${CLOVER_API_BASE}/v1/charges`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CLOVER_PRIVATE_TOKEN}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        amount: product.price_cents,
        currency: "usd",
        source: cardToken,
        ecomind: "ecom",
        description: `Cherry Sage — ${product.name}`,
      }),
    });
    charge = await cloverRes.json();
    if (!cloverRes.ok) {
      return json({ error: charge?.message || "Card was declined. Please try a different card." }, 402);
    }
  } catch {
    return json({ error: "Could not reach the payment processor. Please try again." }, 502);
  }

  if (charge.status !== "succeeded" || charge.paid !== true) {
    return json({ error: "Payment did not complete. Please try again." }, 402);
  }

  // Only now, with a real confirmed charge, convert the hold into a real booking.
  const { data: orderId, error: confirmErr } = await supabase.rpc("confirm_paid_booking", {
    p_server_key: SERVER_KEY,
    p_hold_id: holdId,
    p_customer_id: customerId,
    p_reading_product_id: readingProductId,
    p_clover_payment_id: charge.id,
  });
  if (confirmErr || !orderId) {
    // The card WAS charged successfully but we couldn't record the booking -- this needs a
    // human, not a silent failure. Surface enough detail to find it (real Clover charge id).
    return json({
      error: "Your payment went through, but we could not finish reserving your appointment automatically. Please contact Cherry Sage directly and reference this: " + charge.id,
      chargeSucceededButBookingFailed: true,
    }, 500);
  }

  return json({
    ok: true,
    orderId,
    chargeId: charge.id,
    product: { name: product.name, priceCents: product.price_cents },
    requestedStart: hold.requested_start,
  });
};

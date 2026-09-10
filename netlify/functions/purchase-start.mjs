// Cherry Sage — starts a NON-scheduled purchase (Buy Minutes instant, or a numerology report):
// finds or creates the customer, hands back what the payment step needs. No slot/hold concept
// at all, this is for products where requires_scheduling is false. Mirrors checkout-start.mjs's
// customer-lookup + abuse-defense pattern.
import { createClient } from "@supabase/supabase-js";
import { getStore } from "@netlify/blobs";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(o, status = 200) {
  return new Response(JSON.stringify(o), {
    status, headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

async function tooManyStarts(ip) {
  try {
    const store = getStore("checkout-abuse");
    const key = `purchase-start-ip:${ip}`;
    const now = Date.now();
    const windowMs = 10 * 60 * 1000;
    const rec = (await store.get(key, { type: "json" })) || { attempts: [] };
    rec.attempts = rec.attempts.filter((t) => now - t < windowMs);
    if (rec.attempts.length >= 15) return true;
    rec.attempts.push(now);
    await store.setJSON(key, rec);
    return false;
  } catch { return false; }
}

export default async (req) => {
  if (req.method !== "POST") return json({ error: "method" }, 405);

  const clientIp = req.headers.get("x-nf-client-connection-ip") || "unknown";
  if (await tooManyStarts(clientIp)) {
    return json({ error: "Too many attempts from this connection. Please try again later." }, 429);
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return json({ error: "not configured" }, 503);
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { db: { schema: "cherry_sage" } });

  let d = {};
  try { d = await req.json(); } catch { return json({ error: "bad body" }, 400); }

  const email = String(d.email || "").trim().toLowerCase();
  const fullName = String(d.name || "").trim().slice(0, 200);
  const phone = String(d.phone || "").trim().slice(0, 40);
  const readingProductId = String(d.readingProductId || "");

  if (!EMAIL.test(email)) return json({ error: "invalid email" }, 422);
  if (!fullName) return json({ error: "name required" }, 422);
  if (!readingProductId) return json({ error: "product required" }, 422);

  const { data: product, error: productErr } = await supabase
    .from("reading_products")
    .select("id, name, price_cents, active, requires_scheduling")
    .eq("id", readingProductId)
    .maybeSingle();
  if (productErr || !product || !product.active || product.requires_scheduling) {
    return json({ error: "product not available" }, 422);
  }

  const { data: customerId, error: custErr } = await supabase.rpc("create_customer_if_missing", {
    p_email: email, p_full_name: fullName, p_phone: phone || null,
  });
  if (custErr || !customerId) return json({ error: "could not save customer: " + (custErr?.message || "unknown") }, 500);

  return json({
    ok: true,
    customerId,
    product: { id: product.id, name: product.name, priceCents: product.price_cents },
  });
};

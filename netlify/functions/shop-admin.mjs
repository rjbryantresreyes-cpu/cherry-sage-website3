// Cherry Sage — Bev's shop/pricing admin. Same PIN pattern as dashboard-summary.mjs/
// sage-updates.mjs (checked here, not the broken STATUS_ADMIN_KEY env var appointments-admin.mjs
// relies on). Lets her rename products, change prices, and turn items on/off without touching code.
import { createClient } from "@supabase/supabase-js";

const PIN = "0011";

function json(o, status = 200) {
  return new Response(JSON.stringify(o), {
    status, headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

export default async (req) => {
  const pin = req.headers.get("x-dashboard-pin") || "";
  if (pin !== PIN) return json({ error: "unauthorized" }, 403);

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return json({ error: "not configured" }, 503);
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { db: { schema: "cherry_sage" } });

  if (req.method === "GET") {
    const { data, error } = await supabase.rpc("admin_list_products", { p_pin: pin });
    if (error) return json({ error: error.message }, 500);
    return json({ products: data || [] });
  }

  if (req.method === "POST") {
    let d = {};
    try { d = await req.json(); } catch { return json({ error: "bad body" }, 400); }
    const id = String(d.id || "");
    if (!id) return json({ error: "missing product id" }, 400);
    const { data, error } = await supabase.rpc("admin_update_product", {
      p_pin: pin,
      p_id: id,
      p_name: d.name != null ? String(d.name).trim() : null,
      p_price_cents: d.priceCents != null ? Math.round(Number(d.priceCents)) : null,
      p_active: d.active != null ? Boolean(d.active) : null,
    });
    if (error) return json({ error: error.message }, 400);
    return json({ ok: true, product: data });
  }

  return json({ error: "method" }, 405);
};

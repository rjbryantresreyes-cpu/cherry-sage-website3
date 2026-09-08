// Cherry Sage — Bev's appointment approval dashboard backend.
// Admin-key gated (same STATUS_ADMIN_KEY as set-hours.html/moderate-comments.html). The real
// enforcement lives in the SECURITY DEFINER Postgres functions themselves (admin_list_appointments/
// admin_update_appointment), which check the key again before touching anything -- this function's
// own check is a fast-fail, not the actual security boundary.
import { createClient } from "@supabase/supabase-js";

function json(o, status = 200) {
  return new Response(JSON.stringify(o), {
    status, headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

const ALLOWED_STATUS = ["approved", "declined", "alternate_offered", "cancelled"];

export default async (req) => {
  const KEY = process.env.STATUS_ADMIN_KEY;
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return json({ error: "not configured" }, 503);
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { db: { schema: "cherry_sage" } });

  if (req.method === "GET") {
    const url = new URL(req.url);
    const key = url.searchParams.get("key");
    if (!KEY || key !== KEY) return json({ error: "unauthorized" }, 401);
    const status = url.searchParams.get("status") || "pending_approval";
    const { data, error } = await supabase.rpc("admin_list_appointments", {
      p_admin_key: key,
      p_status: status === "all" ? null : status,
    });
    if (error) return json({ error: error.message }, 400);
    return json({ appointments: data || [] });
  }

  if (req.method === "POST") {
    let d = {};
    try { d = await req.json(); } catch { return json({ error: "bad body" }, 400); }
    if (!KEY || d.key !== KEY) return json({ error: "unauthorized" }, 401);
    const id = String(d.id || "");
    const status = String(d.status || "");
    if (!id || !ALLOWED_STATUS.includes(status)) return json({ error: "bad request" }, 400);
    const { error } = await supabase.rpc("admin_update_appointment", {
      p_admin_key: d.key,
      p_id: id,
      p_status: status,
      p_alternate_start: d.alternateStart || null,
      p_decision_note: d.note || null,
    });
    if (error) return json({ error: error.message }, 400);
    return json({ ok: true });
  }

  return json({ error: "method" }, 405);
};

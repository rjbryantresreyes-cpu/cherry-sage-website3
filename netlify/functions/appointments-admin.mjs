// Cherry Sage — Bev's appointment approval dashboard backend.
// Admin-key gated (same STATUS_ADMIN_KEY as set-hours.html/moderate-comments.html). The real
// enforcement lives in the SECURITY DEFINER Postgres functions themselves (admin_list_appointments/
// admin_update_appointment), which check the key again before touching anything -- this function's
// own check is a fast-fail, not the actual security boundary.
import { createClient } from "@supabase/supabase-js";

const CLOVER_API_BASE = "https://api.clover.com";

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

    const { data, error } = await supabase.rpc("admin_update_appointment", {
      p_admin_key: d.key,
      p_id: id,
      p_status: status,
      p_alternate_start: d.alternateStart || null,
      p_decision_note: d.note || null,
    });
    if (error) return json({ error: error.message }, 400);
    const details = (data && data[0]) || null;

    var refundResult = null;
    if (status === "declined" && details?.clover_payment_id) {
      refundResult = await refundCloverCharge(details.clover_payment_id, details.amount_cents);
    }

    if (details?.customer_email) {
      await sendStatusEmail(details, status, refundResult);
    }

    return json({ ok: true, refund: refundResult });
  }

  return json({ error: "method" }, 405);
};

async function refundCloverCharge(chargeId, amountCents) {
  const CLOVER_PRIVATE_TOKEN = process.env.CLOVER_PRIVATE_TOKEN;
  if (!CLOVER_PRIVATE_TOKEN) return { attempted: false, reason: "not configured" };
  try {
    const res = await fetch(`${CLOVER_API_BASE}/v1/refunds`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CLOVER_PRIVATE_TOKEN}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({ charge: chargeId, amount: amountCents, reason: "requested_by_customer" }),
    });
    const raw = await res.text();
    let body = {};
    try { body = raw ? JSON.parse(raw) : {}; } catch { /* non-JSON response, fall through with raw text below */ }
    if (!res.ok || (body.status !== "succeeded" && body.status !== "pending")) {
      return { attempted: true, succeeded: false, error: body?.message || raw?.slice(0, 200) || `refund failed (HTTP ${res.status})` };
    }
    return { attempted: true, succeeded: true, refundId: body.id, status: body.status };
  } catch (e) {
    return { attempted: true, succeeded: false, error: String(e) };
  }
}

async function sendStatusEmail(details, status, refundResult) {
  const when = fmt(details.requested_start);
  const name = esc(details.customer_name || "");
  let subject, body;

  if (status === "approved") {
    subject = "Your appointment with Cherry Sage is confirmed";
    body = `<p>Great news, ${name}. Your <strong>${esc(details.product_name)}</strong> reading is confirmed for ${when}.</p>` +
      `<p>Cherry looks forward to speaking with you.</p>`;
  } else if (status === "alternate_offered") {
    const alt = fmt(details.alternate_start);
    subject = "A different time for your Cherry Sage reading";
    body = `<p>Hi ${name}, your requested time (${when}) doesn't quite work, but Cherry can do <strong>${alt}</strong> instead.</p>` +
      `<p>Reply to this email to confirm, or to find another time.</p>`;
  } else if (status === "declined") {
    subject = "Your Cherry Sage appointment request";
    var refundLine = refundResult?.succeeded
      ? "<p>Your payment has been refunded.</p>"
      : "<p>We're processing your refund now, if you don't see it in a few business days please reply to this email.</p>";
    body = `<p>Hi ${name}, unfortunately Cherry isn't able to make ${when} work.</p>` + refundLine +
      `<p>Please feel free to request a different time whenever you're ready.</p>`;
  } else {
    return;
  }

  const KEY = process.env.BREVO_KEY;
  if (!KEY) return;
  try {
    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": KEY, "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        sender: { name: "Cherry Sage", email: "admin@cherrysage.com" },
        to: [{ email: details.customer_email }],
        subject, htmlContent: body,
      }),
    });
  } catch { /* non-fatal */ }
}

function fmt(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-US", {
    timeZone: "America/New_York", weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit",
  }) + " Eastern";
}

function esc(s) {
  return String(s || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

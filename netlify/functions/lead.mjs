// Cherry Sage — lead capture. Durable by default (Netlify Blobs), forwards to Brevo when keyed.
// Every email opt-in (hero card, deck, Ivy weekly) and the contact form POST here.
import { getStore } from "@netlify/blobs";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async (req) => {
  if (req.method !== "POST") return json({ error: "method" }, 405);

  let d = {};
  try {
    const ct = req.headers.get("content-type") || "";
    if (ct.includes("application/json")) d = await req.json();
    else { const t = await req.text(); d = Object.fromEntries(new URLSearchParams(t)); }
  } catch { return json({ error: "bad body" }, 400); }

  // invisible captcha: honeypot field (humans never fill it) + too-fast submit = bot
  if (String(d.website || d.hp || "").trim()) return json({ ok: true, bot: 1 });
  if (d.t && Date.now() - Number(d.t) < 1500) return json({ ok: true, bot: 1 });

  const email = String(d.email || "").trim().toLowerCase();
  const source = String(d.source || "site").slice(0, 60);
  const name = String(d.name || "").slice(0, 120);
  const message = String(d.message || "").slice(0, 2000);
  if (!EMAIL.test(email)) return json({ error: "invalid email" }, 422);

  const record = { email, source, name, message, ts: new Date().toISOString(),
                   ua: req.headers.get("user-agent") || "" };

  // 1) durable store — always works, no external key needed
  let stored = false;
  try {
    const store = getStore("leads");
    await store.setJSON(`${Date.now()}-${email}`, record);
    stored = true;
  } catch (e) { /* blobs unavailable in some local runs; continue */ }

  // 2) forward to Brevo when a live key is configured
  let brevo = "skipped";
  const KEY = process.env.BREVO_KEY;
  const LIST = process.env.BREVO_LIST_ID;
  // SOURCE is a single mutable attribute -- a contact's later activity (checkout, contact form)
  // overwrites it, so it can't reliably identify "who opted into weekly tips" over time. List
  // membership is additive and stable, so weekly-tips opt-ins ALSO join a dedicated list (14,
  // "Weekly Tips Subscribers") regardless of whatever they do afterward.
  const WEEKLY_TIPS_SOURCES = ["weekly-tips-hero", "weekly-tips-draw", "popup-shuffle", "chat-weekly"];
  const WEEKLY_TIPS_LIST_ID = 14;
  if (KEY) {
    try {
      const listIds = LIST ? [Number(LIST)] : [];
      if (WEEKLY_TIPS_SOURCES.includes(source)) listIds.push(WEEKLY_TIPS_LIST_ID);
      const body = { email, updateEnabled: true,
        attributes: { SOURCE: source, ...(name ? { FIRSTNAME: name } : {}), ...(message ? { MESSAGE: message } : {}) },
        ...(listIds.length ? { listIds } : {}) };
      const r = await fetch("https://api.brevo.com/v3/contacts", {
        method: "POST",
        headers: { "api-key": KEY, "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify(body),
      });
      brevo = r.ok ? "ok" : `error ${r.status}`;
    } catch { brevo = "network"; }
  }

  // 3) notify Bev by email for the submissions she'd want to see right away
  // (contact, feedback, appointment requests, numerology report requests — NOT newsletter/opt-in captures)
  let notified = "skipped";
  const NOTIFY_TO = process.env.NOTIFY_EMAIL;
  const wantsNotify = source === "contact" || source === "feedback" || source === "appointment" || source.startsWith("report:");
  if (KEY && NOTIFY_TO && wantsNotify) {
    try {
      const label = source.startsWith("report:") ? `Report request — ${source.slice(7)}`
        : source === "feedback" ? "New feedback"
        : source === "appointment" ? "New appointment request"
        : "New contact form message";
      const r = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "api-key": KEY, "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({
          sender: { name: "Cherry Sage Website", email: "admin@cherrysage.com" },
          to: [{ email: NOTIFY_TO }],
          replyTo: { email },
          subject: `${label} — from ${name || email}`,
          htmlContent: `<p><strong>${label}</strong></p>` +
            `<p>From: ${name ? `${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;` : escapeHtml(email)}</p>` +
            (message ? `<p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>` : "") +
            `<p style="color:#888;font-size:12px">Reply to this email to write back directly to ${escapeHtml(email)}.</p>`,
        }),
      });
      notified = r.ok ? "ok" : `error ${r.status}`;
    } catch { notified = "network"; }
  }

  return json({ ok: true, stored, brevo, notified });
};

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status, headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

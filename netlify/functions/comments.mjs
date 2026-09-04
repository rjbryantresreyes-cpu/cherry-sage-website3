// Cherry Sage — per-post blog/article comments. Moderated: every comment starts "pending"
// and only shows publicly once approved via moderate-comments.html (admin-key gated).
import { getStore } from "@netlify/blobs";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SLUG = /^[a-z0-9-]{1,200}$/;

export default async (req) => {
  const store = getStore("comments");
  const url = new URL(req.url);

  if (req.method === "GET") {
    const admin = url.searchParams.get("admin");
    if (admin) {
      const KEY = process.env.STATUS_ADMIN_KEY;
      if (!KEY || url.searchParams.get("key") !== KEY) return json({ error: "unauthorized" }, 401);
      const { blobs } = await store.list();
      const all = await Promise.all(blobs.map((b) => store.get(b.key, { type: "json" })));
      const pending = all.filter((c) => c && c.status === "pending").sort((a, b) => b.ts.localeCompare(a.ts));
      return json({ pending });
    }
    const post = String(url.searchParams.get("post") || "");
    if (!SLUG.test(post)) return json({ error: "bad post" }, 400);
    const { blobs } = await store.list({ prefix: `${post}::` });
    const all = await Promise.all(blobs.map((b) => store.get(b.key, { type: "json" })));
    const approved = all
      .filter((c) => c && c.status === "approved")
      .sort((a, b) => a.ts.localeCompare(b.ts))
      .map((c) => ({ name: c.name || "Anonymous", message: c.message, ts: c.ts }));
    return json({ comments: approved });
  }

  if (req.method === "POST") {
    let d = {};
    try { d = await req.json(); } catch { return json({ error: "bad body" }, 400); }

    // admin moderation action
    if (d.action === "approve" || d.action === "reject") {
      const KEY = process.env.STATUS_ADMIN_KEY;
      if (!KEY || d.key !== KEY) return json({ error: "unauthorized" }, 401);
      const id = String(d.id || "");
      const rec = await store.get(id, { type: "json" });
      if (!rec) return json({ error: "not found" }, 404);
      if (d.action === "reject") { await store.delete(id); return json({ ok: true, deleted: true }); }
      rec.status = "approved";
      await store.setJSON(id, rec);
      return json({ ok: true, approved: true });
    }

    // public new-comment submission
    if (String(d.website || d.hp || "").trim()) return json({ ok: true, bot: 1 });
    if (d.t && Date.now() - Number(d.t) < 1500) return json({ ok: true, bot: 1 });

    const postSlug = String(d.postSlug || "");
    const postTitle = String(d.postTitle || postSlug).slice(0, 200);
    const name = String(d.name || "").slice(0, 120);
    const email = String(d.email || "").trim().toLowerCase();
    const message = String(d.message || "").trim().slice(0, 2000);
    if (!SLUG.test(postSlug)) return json({ error: "bad post" }, 400);
    if (email && !EMAIL.test(email)) return json({ error: "invalid email" }, 422);
    if (!message) return json({ error: "empty message" }, 422);

    const ts = new Date().toISOString();
    const id = `${postSlug}::${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const record = { id, postSlug, postTitle, name, email, message, status: "pending", ts };
    await store.setJSON(id, record);

    // notify Bev so she can approve it
    const KEY = process.env.BREVO_KEY;
    const NOTIFY_TO = process.env.NOTIFY_EMAIL;
    if (KEY && NOTIFY_TO) {
      try {
        await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: { "api-key": KEY, "content-type": "application/json", accept: "application/json" },
          body: JSON.stringify({
            sender: { name: "Cherry Sage Website", email: "admin@cherrysage.com" },
            to: [{ email: NOTIFY_TO }],
            ...(email ? { replyTo: { email } } : {}),
            subject: `New comment awaiting approval — ${postTitle}`,
            htmlContent: `<p><strong>New comment on "${escapeHtml(postTitle)}"</strong></p>` +
              `<p>From: ${escapeHtml(name || "Anonymous")}${email ? ` &lt;${escapeHtml(email)}&gt;` : ""}</p>` +
              `<p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>` +
              `<p style="color:#888;font-size:12px">Approve or reject it at /moderate-comments.html</p>`,
          }),
        });
      } catch { /* non-fatal */ }
    }

    return json({ ok: true, pending: true });
  }

  return json({ error: "method" }, 405);
};

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function json(o, status = 200) {
  return new Response(JSON.stringify(o), {
    status, headers: { "content-type": "application/json", "cache-control": "no-store", "access-control-allow-origin": "*" },
  });
}

// Cherry Sage — Bev's dashboard home. Authenticated via Supabase Auth (magic link); every number
// here comes from a real system (Supabase for bookings, Netlify Blobs for contact-form leads,
// Brevo for email marketing), nothing is invented or placeholder.
import { createClient } from "@supabase/supabase-js";
import { getStore } from "@netlify/blobs";

function json(o, status = 200) {
  return new Response(JSON.stringify(o), {
    status, headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

export default async (req) => {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
  const BREVO_KEY = process.env.BREVO_KEY;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return json({ error: "not configured" }, 503);

  const authHeader = req.headers.get("authorization") || "";
  const accessToken = authHeader.replace(/^Bearer\s+/i, "");
  if (!accessToken) return json({ error: "sign in required" }, 401);

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    db: { schema: "cherry_sage" },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  const { data: summary, error: rpcErr } = await supabase.rpc("dashboard_summary");
  if (rpcErr) {
    const msg = /unauthorized/i.test(rpcErr.message || "") ? "not authorized for this dashboard" : "could not load summary";
    return json({ error: msg }, rpcErr.message?.includes("unauthorized") ? 403 : 500);
  }

  // Contact-form leads (Netlify Blobs) -- best-effort, never fails the whole summary.
  let recentLeads = 0, totalLeads = 0;
  try {
    const store = getStore("leads");
    const { blobs } = await store.list();
    totalLeads = blobs.length;
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    recentLeads = blobs.filter((b) => {
      const ts = Date.parse(b.key.split("_")[0]) || 0;
      return ts >= cutoff;
    }).length;
  } catch { /* blobs unavailable in some contexts; leave at 0 */ }

  // Brevo: contact list size + the most recent campaign's real stats.
  let brevo = { contactCount: null, recentCampaigns: [] };
  if (BREVO_KEY) {
    try {
      const contactsRes = await fetch("https://api.brevo.com/v3/contacts?limit=1", {
        headers: { "api-key": BREVO_KEY, accept: "application/json" },
      });
      if (contactsRes.ok) {
        const cData = await contactsRes.json();
        brevo.contactCount = typeof cData.count === "number" ? cData.count : null;
      }
    } catch { /* non-fatal */ }
    try {
      const campRes = await fetch("https://api.brevo.com/v3/emailCampaigns?limit=5&sort=desc&status=sent", {
        headers: { "api-key": BREVO_KEY, accept: "application/json" },
      });
      if (campRes.ok) {
        const cData = await campRes.json();
        brevo.recentCampaigns = (cData.campaigns || []).map((c) => ({
          name: c.name,
          sentDate: c.sentDate,
          // campaignStats, never globalStats -- globalStats can silently read 0/0 on real sends.
          delivered: c.statistics?.campaignStats?.[0]?.delivered ?? null,
          opens: c.statistics?.campaignStats?.[0]?.uniqueViews ?? null,
          clicks: c.statistics?.campaignStats?.[0]?.uniqueClicks ?? null,
        }));
      }
    } catch { /* non-fatal */ }
  }

  return json({
    ...summary,
    leads: { total: totalLeads, last30Days: recentLeads },
    brevo,
  });
};

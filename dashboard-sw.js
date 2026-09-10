// Minimal service worker, scoped to /dashboard.html only. Exists purely so the browser treats
// this page as an installable app (Chrome/Android require a fetch handler to show the install
// prompt) -- it never caches anything, every request just goes straight to the network, so the
// dashboard always shows live data, never a stale offline copy.
self.addEventListener("fetch", () => {});

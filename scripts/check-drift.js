// Guardrail: fails the build if the self-service builder scripts (build-pages.js,
// build-articles.js) have drifted from the real live site's shared chrome (nav, footer,
// the guest-article bottom CTA) or from its current asset cache-busting versions
// (site.css?v=N, funnel.js?v=N, etc.)
//
// Why this exists: those two scripts carry copies of the site's HTML as JS template
// literals, not as .html files. The project's usual habit of "bump ?v= sitewide via
// sed" or "update the nav everywhere" only ever touches *.html, so it silently skips
// these two scripts every time -- found 2026-09-09/10 after they'd drifted from a real
// nav redesign and a CTA copy change with nobody noticing until an audit went looking.
// This check turns that into a loud, immediate build failure instead of a silent one.
//
// Compares by MEANING (which links exist, in what order, labeled how), not raw markup --
// this site's HTML has never been fully normalized (documented single/double-quote and
// attribute-order variants across pages, harmless cosmetically), so a raw-string diff
// would false-positive constantly and train everyone to ignore this check.
//
// Runs first in `npm run build`, before either generator, so a real drift blocks the
// whole deploy rather than shipping a newly-published page with stale chrome.
import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BUILDER_SCRIPTS = ["scripts/build-pages.js", "scripts/build-articles.js"];

function extractBlock(src, startMark, endMark) {
  const s = src.indexOf(startMark);
  if (s < 0) return null;
  const e = src.indexOf(endMark, s);
  if (e < 0) return null;
  return src.slice(s, e + endMark.length);
}

// Reduces a chunk of HTML to "what a visitor actually sees and can click": an ordered
// list of href::visible-text pairs. Ignores quote style, attribute order, whitespace.
function linkSignature(html) {
  if (html === null) return null;
  const out = [];
  const re = /<a\b[^>]*?href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/g;
  let m;
  while ((m = re.exec(html))) {
    const text = m[2].replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
    out.push(`${m[1]}::${text}`);
  }
  return out;
}

// Reduces a chunk of HTML to its visible text only (tags stripped, whitespace collapsed)
// -- for chunks like the article CTA where the wording itself, not just links, matters.
function textSignature(html) {
  if (html === null) return null;
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function assetVersions(src) {
  const out = {};
  for (const m of src.matchAll(/([\w.-]+\.(?:css|js))\?v=(\d+)/g)) out[m[1]] = m[2];
  return out;
}

function sigEqual(a, b) {
  if (a === null || b === null) return a === b;
  return JSON.stringify(a) === JSON.stringify(b);
}

// Any real, hand-authored/migrated HTML file at the repo root is a valid "ground truth"
// reference -- deliberately NOT hardcoding one filename so this doesn't break if a
// specific page ever gets renamed or removed. Pages produced by either build script
// (carrying a cs-generated marker) are excluded so the check never compares the
// pipeline's output against itself.
const allHtml = readdirSync(ROOT).filter((f) => f.endsWith(".html"));
const realPages = allHtml.filter((f) => {
  const src = readFileSync(join(ROOT, f), "utf8");
  return !src.includes("<!-- cs-generated:pages -->") && !src.includes("<!-- cs-generated:articles -->");
});

function consensus(files, startMark, endMark, sigFn, label) {
  const groups = new Map(); // JSON signature -> {sig, files}
  for (const f of files) {
    const src = readFileSync(join(ROOT, f), "utf8");
    const block = extractBlock(src, startMark, endMark);
    if (block === null) continue;
    const sig = sigFn(block);
    const key = JSON.stringify(sig);
    if (!groups.has(key)) groups.set(key, { sig, files: [] });
    groups.get(key).files.push(f);
  }
  if (groups.size === 0) return { sig: null, warning: `No live page carries ${label} -- nothing to check against.` };
  const sorted = [...groups.values()].sort((a, b) => b.files.length - a.files.length);
  if (sorted.length === 1) return { sig: sorted[0].sig, warning: null };
  return {
    sig: sorted[0].sig,
    warning: `${label}: live pages disagree with each other in substance (${sorted.length} distinct real versions) -- using the majority (${sorted[0].files.length}/${files.length} pages). Minority example: ${sorted[1].files[0]}.`,
  };
}

const failed = [];
const warnings = [];

const header = consensus(realPages, '<header class="site-header">', "</header>", linkSignature, "site header");
const footer = consensus(realPages, '<footer class="footer">', "</footer>", linkSignature, "footer");
const postCta = consensus(realPages, '<div class="post-cta', "</div>", textSignature, "article bottom CTA");
for (const c of [header, footer, postCta]) if (c.warning) warnings.push(c.warning);

// Reference asset versions: majority vote across all real pages, same reasoning as above.
const versionVotes = {}; // asset -> {version -> count}
for (const f of realPages) {
  const v = assetVersions(readFileSync(join(ROOT, f), "utf8"));
  for (const [asset, ver] of Object.entries(v)) {
    versionVotes[asset] ??= {};
    versionVotes[asset][ver] = (versionVotes[asset][ver] || 0) + 1;
  }
}
const refVersions = {};
for (const [asset, votes] of Object.entries(versionVotes)) {
  refVersions[asset] = Object.entries(votes).sort((a, b) => b[1] - a[1])[0][0];
}

for (const file of BUILDER_SCRIPTS) {
  const src = readFileSync(join(ROOT, file), "utf8");

  const h = linkSignature(extractBlock(src, '<header class="site-header">', "</header>"));
  if (header.sig !== null && !sigEqual(h, header.sig)) {
    failed.push(`${file}: embedded nav links don't match the live site (a link, its target, or its label differs). Re-copy the <header> block from a real page (e.g. index.html).`);
  }

  const f = linkSignature(extractBlock(src, '<footer class="footer">', "</footer>"));
  if (footer.sig !== null && !sigEqual(f, footer.sig)) {
    failed.push(`${file}: embedded footer links don't match the live site.`);
  }

  if (file === "scripts/build-articles.js" && postCta.sig !== null) {
    const c = textSignature(extractBlock(src, '<div class="post-cta', "</div>"));
    if (c !== postCta.sig) {
      failed.push(`${file}: embedded article bottom CTA wording doesn't match real live articles.`);
    }
  }

  const fileVersions = assetVersions(src);
  for (const [asset, refV] of Object.entries(refVersions)) {
    if (fileVersions[asset] && fileVersions[asset] !== refV) {
      failed.push(`${file}: ${asset} is pinned to v=${fileVersions[asset]}, but the live site is on v=${refV}.`);
    }
  }
}

for (const w of warnings) console.warn(`[check-drift] WARNING: ${w}`);

if (failed.length) {
  console.error("\n[check-drift] BUILD BLOCKED — the self-service builder scripts are out of sync with the live site:\n");
  for (const msg of failed) console.error("  - " + msg);
  console.error("\nFix scripts/build-pages.js and/or scripts/build-articles.js to match a real live page, verify with a real test build, then re-run.\n");
  process.exit(1);
}

console.log("[check-drift] OK — builder scripts match the live site's shared chrome, article CTA, and asset versions.");

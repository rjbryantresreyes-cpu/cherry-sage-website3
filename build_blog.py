# -*- coding: utf-8 -*-
# Beautiful, image-rich blog + post pages. Supersedes build_posts output for blog/posts.
import json, os, re, html as H
import build_site as B

SP=r"C:\Users\GT\AppData\Local\Temp\claude\G--Shared-drives-BBC-Drive\a4016963-7403-46d2-b23a-0dd187ead902\scratchpad"
ROOT=r"C:\BBC\cherry-sage-website3"
posts=json.load(open(os.path.join(SP,"wp_posts.json"),encoding="utf-8"))
cats={c["id"]:H.unescape(c["name"]) for c in json.load(open(os.path.join(SP,"wp_cats.json"),encoding="utf-8"))}
fm={p["id"]:p.get("featured_media") for p in json.load(open(os.path.join(SP,"wp_fm.json"),encoding="utf-8"))}
media=json.load(open(os.path.join(SP,"wp_media.json"),encoding="utf-8"))
def pick(m):
    s=(m.get("media_details",{}) or {}).get("sizes",{}) or {}
    for k in ("medium_large","medium","large","custom-thumbnail","full"):
        if k in s and s[k].get("source_url"): return s[k]["source_url"]
    return m.get("source_url")
mid2url={m["id"]:pick(m) for m in media}
# self-host images: remap any downloaded cherrysage.com image to its local copy
IMGMAP=json.load(open(os.path.join(ROOT,"img_map.json"),encoding="utf-8")) if os.path.exists(os.path.join(ROOT,"img_map.json")) else {}
mid2url={k:IMGMAP.get(v,v) for k,v in mid2url.items()}
# varied fallback images (fixes "same pic" on articles) — rotate through the local blog image pool
_pool=sorted("/assets/blog/"+f for f in os.listdir(os.path.join(ROOT,"assets","blog"))
             if f.lower().endswith((".jpg",".jpeg",".png"))) if os.path.isdir(os.path.join(ROOT,"assets","blog")) else []
FALLBACKS=_pool or ["/assets/bev_portrait.jpg"]
KNOWN={p["slug"] for p in posts}

def img_for(p):
    mid=fm.get(p["id"])
    u=mid2url.get(mid) if mid else None
    return u or FALLBACKS[p["id"]%len(FALLBACKS)]

def _plain(raw):
    t=re.sub(r'\[/?[a-zA-Z][^\]]*\]',' ',raw or "")   # drop shortcodes
    t=re.sub(r'<[^>]+>',' ',t)                          # drop tags
    return re.sub(r'\s+',' ',H.unescape(t)).strip()
def excerpt(p,n=120):
    t=_plain(p.get("excerpt",{}).get("rendered",""))
    if len(t)<25:                                       # empty or shortcode-only -> use body
        t=_plain(p["content"]["rendered"])
    return (t[:n].rsplit(' ',1)[0]+"…") if len(t)>n else t

def fix_encoding(t):
    # repair common mojibake / lost-byte artifacts from the WP import
    reps={'�':"'", 'â€™':"'", 'â€œ':'"', 'â€\x9d':'"', 'â€"':'—', 'â€“':'–',
          'â€¦':'…', 'Ã©':'é', 'Â':'', '':"'", '':'"', '':'"'}
    for a,b in reps.items(): t=t.replace(a,b)
    return t
def clean(content):
    c=re.sub(r'<script[\s\S]*?</script>','',content,flags=re.I)
    c=re.sub(r'<style[\s\S]*?</style>','',c,flags=re.I)
    c=re.sub(r'<link[^>]*>','',c,flags=re.I)
    # strip Avada/Fusion + any WordPress shortcodes (attrs may use curly quotes, no ] inside)
    c=re.sub(r'\[/?[a-zA-Z][^\]]*\]','',c)
    # the page title is the H1 — demote any in-content h1 to h2 for correct heading hierarchy
    c=re.sub(r'<(/?)h1(\b[^>]*)>', r'<\1h2\2>', c, flags=re.I)
    # tidy empties left behind
    c=re.sub(r'<p>\s*(?:&nbsp;|\s)*</p>','',c,flags=re.I)
    c=fix_encoding(c)
    # unwrap dead Google+ links (service shut down 2019) — keep the text, drop the link
    c=re.sub(r'<a\b[^>]*plus\.google\.com[^>]*>(.*?)</a>', r'\1', c, flags=re.I|re.S)
    # normalise protocol-relative links so they resolve
    c=re.sub(r'(href|src)="//', r'\1="https://', c, flags=re.I)
    # drop responsive srcset/sizes (keep single src) — avoids many remote variants
    c=re.sub(r'\s+srcset="[^"]*"','',c,flags=re.I)
    c=re.sub(r'\s+sizes="[^"]*"','',c,flags=re.I)
    # swap any inline remote images for their local copies
    for _u,_l in IMGMAP.items(): c=c.replace(_u,_l)
    def rl(m):
        slug=m.group(1); return f'href="/{slug}.html"' if slug in KNOWN else 'href="/"'
    c=re.sub(r'href="https?://(?:www\.)?cherrysage\.com/([a-z0-9\-]+)/?"',rl,c,flags=re.I)
    return c

def cat_name(ids):
    for i in ids:
        n=cats.get(i,"")
        if n and n!="Uncategorized": return n
    return "Reading"

for p in posts:
    p["_t"]=fix_encoding(re.sub(r'&#8211;|&ndash;','-',H.unescape(p["title"]["rendered"])).replace('&amp;','&').strip())
    p["_c"]=cat_name(p.get("categories",[]))
    p["_d"]=p.get("date","")[:10]
    p["_img"]=img_for(p); p["_ex"]=fix_encoding(excerpt(p))
    p["_feat"]="Featured Articles" in [cats.get(i,"") for i in p.get("categories",[])]

posts.sort(key=lambda x:x["_d"],reverse=True)
# drop empty/Fusion-only posts (no real REST content) — they render as thin pages, bad UX/SEO.
def _wc(p):
    c=p["content"]["rendered"]; t=re.sub(r'\[/?[a-zA-Z][^\]]*\]',' ',c); t=re.sub(r'<[^>]+>',' ',t)
    return len(re.sub(r'\s+',' ',H.unescape(t)).strip().split())
_excluded=[p for p in posts if _wc(p)<30]
for _p in _excluded:
    _f=os.path.join(ROOT,_p["slug"]+".html")
    if os.path.exists(_f): os.remove(_f)
if _excluded: print("excluded empty posts:",len(_excluded))
posts=[p for p in posts if _wc(p)>=30]
blogposts=[p for p in posts if not p["_feat"]]
featured=[p for p in posts if p["_feat"]]

# ---- post pages (with featured image hero) ----
by_cat={}
for p in blogposts: by_cat.setdefault(p["_c"],[]).append(p)
def related(p):
    same=[q for q in by_cat.get(p["_c"],[]) if q["slug"]!=p["slug"]][:3]
    if not same: return ""
    it="".join(f'<a class="bcard reveal" href="/{q["slug"]}.html"><div class="bc-img" style="background-image:url(\'{q["_img"]}\')"></div><div class="bc-body"><span class="cat-chip">{q["_c"]}</span><h3>{q["_t"]}</h3></div></a>' for q in same)
    return f'<section class="section section-tint"><div class="wrap"><div class="section-head reveal"><p class="eyebrow">Keep reading</p><h2>More on {p["_c"]}</h2></div><div class="blog-cards">{it}</div></div></section>'
for p in posts:
    _pcrumb=f'<nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span class="bc-sep">›</span><a href="/blog.html">Blog</a><span class="bc-sep">›</span><span aria-current="page">{H.escape(p["_c"])}</span></nav>'
    body=f'''<section class="page-hero post-head"><div class="ph-glow" aria-hidden="true"></div><div class="wrap reveal"><p class="eyebrow">{p["_c"]} · {p["_d"]}</p><h1>{p["_t"]}</h1></div></section>
<section class="section"><div class="wrap post-wrap">
  {_pcrumb}
  <img class="post-hero-img" src="{p["_img"]}" alt="{p["_t"]}">
  <article class="post-content reveal">{clean(p["content"]["rendered"])}</article>
  <div class="post-cta reveal"><p class="eyebrow">Ready for the real thing?</p><h3>Talk it through with Cherry</h3><p>An honest reading goes far beyond an article. First-timers get 5 free minutes.</p><a class="btn btn-primary" href="/shop.html">Buy Minutes Now</a></div>
</div></section>
{related(p)}'''
    _absimg = p["_img"] if str(p["_img"]).startswith("http") else B.SITE_URL+p["_img"]
    _art=json.dumps({"@context":"https://schema.org","@type":"Article",
        "headline":p["_t"][:110],"description":p["_ex"],"image":[_absimg],
        "datePublished":p.get("date"),"dateModified":p.get("modified") or p.get("date"),
        "articleSection":p["_c"],
        "author":{"@type":"Person","name":"Cherry Sage","url":B.SITE_URL+"/meet.html"},
        "publisher":{"@type":"Organization","name":"Cherry Sage","logo":{"@type":"ImageObject","url":B.SITE_URL+"/assets/logo.png"}},
        "mainEntityOfPage":{"@type":"WebPage","@id":B.SITE_URL+"/"+p["slug"]+".html"}},ensure_ascii=False)
    _bc=json.dumps({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[
        {"@type":"ListItem","position":1,"name":"Home","item":B.SITE_URL+"/"},
        {"@type":"ListItem","position":2,"name":"Blog","item":B.SITE_URL+"/blog.html"},
        {"@type":"ListItem","position":3,"name":p["_t"][:80]}]},ensure_ascii=False)
    head=f'<script type="application/ld+json">{_art}</script><script type="application/ld+json">{_bc}</script>'
    B.page(f'{p["slug"]}.html',p["_t"],p["_ex"],body,"blog.html",head_extra=head,og_type="article",og_image=(p["_img"] if str(p["_img"]).startswith("http") else p["_img"].lstrip("/")))
print("post pages:",len(posts))

import calendar
from collections import Counter, OrderedDict
def card(p):
    return f'''<a class="bcard reveal" href="/{p["slug"]}.html" data-cat="{H.escape(p["_c"])}" data-ym="{p["_d"][:7]}">
  <div class="bc-img" style="background-image:url('{p["_img"]}')"></div>
  <div class="bc-body"><span class="cat-chip">{p["_c"]}</span><h3>{p["_t"]}</h3><p>{p["_ex"]}</p><span class="bc-date">{p["_d"]}</span></div>
</a>'''
def crumb(items):
    parts=[]
    for i,(name,href) in enumerate(items):
        last=(i==len(items)-1)
        parts.append(f'<a href="{href}">{H.escape(name)}</a>' if (href and not last) else f'<span aria-current="page">{H.escape(name)}</span>')
    return '<nav class="breadcrumb" aria-label="Breadcrumb">'+'<span class="bc-sep">›</span>'.join(parts)+'</nav>'
def wordcloud(counter):
    if not counter: return ""
    mx=max(counter.values()); out=""
    for cat,n in counter.most_common():
        sz=0.82+(n/mx)*1.05
        out+=f'<button class="wc-tag" data-f="{H.escape(cat)}" style="font-size:{sz:.2f}rem">{cat}<span class="wc-n">{n}</span></button>'
    return f'<div class="wordcloud">{out}</div>'
def archive_list(ps):
    g=OrderedDict()
    for p in sorted(ps,key=lambda x:x["_d"],reverse=True):
        try:
            y,m,_=p["_d"].split("-"); key=(f"{calendar.month_name[int(m)]} {y}", f"{y}-{m}")
        except: key=("Earlier","")
        g.setdefault(key,0); g[key]=g[key]+1
    return '<ul class="archive-list">'+"".join(
        f'<li><button class="arch-item" data-ym="{ym}">{label}<span>({v})</span></button></li>' for (label,ym),v in g.items())+'</ul>'
AUTHOR='''<div class="author-card reveal">
  <img src="/assets/bev_portrait.jpg" alt="Cherry Sage, psychic reader and writer since 1999">
  <div><p class="eyebrow">From Cherry's desk</p><h3>Written by Cherry Sage</h3>
  <p>I have been reading and writing on the spiritual path since 1999. I add new reflections here often, so come back and see what is new.</p>
  <a class="card-link" href="/meet.html">Meet Cherry →</a></div>
</div>'''

# ---- BLOG index (featured + author + topics + archive + card grid) ----
f0=blogposts[0]
feat=f'''<a class="blog-featured reveal" href="/{f0["slug"]}.html">
  <div class="bf-img" style="background-image:url('{f0["_img"]}')"></div>
  <div class="bf-body"><span class="cat-chip">Latest · {f0["_c"]}</span><h2>{f0["_t"]}</h2><span class="bc-date">{f0["_d"]}</span><p style="color:var(--ink-soft)">{f0["_ex"]}</p><span class="card-link">Read the post →</span></div>
</a>'''
cards="".join(card(p) for p in blogposts)   # include all so archive/topics/count match the grid
_cc=Counter(p["_c"] for p in blogposts)
chips='<button class="bchip on" data-f="all">All topics</button>'+"".join(f'<button class="bchip" data-f="{H.escape(c)}">{c}</button>' for c,_ in _cc.most_common())
FILT_JS='''<script>(function(){
var cards=[].slice.call(document.querySelectorAll('.blog-cards .bcard'));
function apply(attr,val){cards.forEach(function(cd){cd.style.display=(val==='all'||cd.dataset[attr]===val)?'':'none';});
var c=document.getElementById('blogCount');if(c){var n=cards.filter(function(x){return x.style.display!=='none';}).length;c.textContent=n+' post'+(n===1?'':'s');}}
function sel(el,grp){[].slice.call(document.querySelectorAll(grp)).forEach(function(x){x.classList.remove('on');});if(el)el.classList.add('on');}
[].slice.call(document.querySelectorAll('.bchip')).forEach(function(ch){ch.addEventListener('click',function(){sel(ch,'.bchip');apply('cat',ch.dataset.f);});});
[].slice.call(document.querySelectorAll('.wc-tag')).forEach(function(t){t.addEventListener('click',function(){sel(null,'.bchip');apply('cat',t.dataset.f);});});
[].slice.call(document.querySelectorAll('.arch-item')).forEach(function(a){a.addEventListener('click',function(){sel(null,'.bchip');apply('ym',a.dataset.ym);});});
})();</script>'''
blog=B.hero_banner("The Cherry Sage blog","Insight, honesty, and a little wonder",
  "Real writing on numerology, love, accuracy, predictions, and the spiritual path, since 1999. New reflections added often.")+f'''
<section class="section"><div class="wrap">
{crumb([("Home","/"),("Blog",None)])}
{feat}
{AUTHOR}
<div class="blog-toolbar reveal"><div class="bchips">{chips}</div><span id="blogCount" class="blog-count">{len(blogposts)} posts</span></div>
<div class="blog-layout">
  <div class="blog-main"><div class="blog-cards">{cards}</div></div>
  <aside class="blog-side">
    <div class="side-box reveal"><h4>Browse by topic</h4>{wordcloud(_cc)}</div>
    <div class="side-box reveal"><h4>Archive</h4>{archive_list(blogposts)}</div>
    <div class="side-box side-cta reveal"><h4>Ready for a reading?</h4><p>An honest phone reading goes far beyond an article.</p><a class="btn btn-primary" href="/shop.html">Buy Minutes</a></div>
  </aside>
</div></div></section>{FILT_JS}'''+B.cta()
B.page("blog.html","Blog","Honest writing on numerology, love, accuracy, predictions and the spiritual path from Cherry Sage. Browse by topic or archive.",blog,"blog.html")

# ---- ARTICLES (guest/featured) with category nav + breadcrumbs + varied images ----
if featured:
    fc="".join(card(p) for p in featured)
    _ac=Counter(p["_c"] for p in featured)
    achips='<button class="bchip on" data-f="all">All</button>'+"".join(f'<button class="bchip" data-f="{H.escape(c)}">{c}</button>' for c,_ in _ac.most_common())
    abody=B.hero_banner("Guest &amp; featured articles","Voices we've shared the page with",
      "Featured and guest pieces from Cherry Sage, browse them by category below.")+f'''
<section class="section"><div class="wrap">
{crumb([("Home","/"),("Articles",None)])}
<div class="blog-toolbar reveal"><div class="bchips">{achips}</div><span id="blogCount" class="blog-count">{len(featured)} articles</span></div>
<div class="blog-cards">{fc}</div>
</div></section>{FILT_JS}'''+B.cta()
else:
    abody=B.hero_banner("Guest &amp; featured articles","Voices we've shared the page with","Featured pieces from Cherry Sage.")+B.cta()
B.page("articles.html","Guest Articles","Featured and guest articles from Cherry Sage, browsable by category.",abody,"articles.html")
print("blog + articles rebuilt. blog posts:",len(blogposts),"featured:",len(featured))

# expose newest few for home preview
import json as J
open(os.path.join(ROOT,"_home_preview.json"),"w",encoding="utf-8").write(J.dumps([{"slug":p["slug"],"t":p["_t"],"c":p["_c"],"img":p["_img"],"ex":p["_ex"]} for p in blogposts[:3]]))

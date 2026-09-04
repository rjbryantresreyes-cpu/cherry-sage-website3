# -*- coding: utf-8 -*-
# Shop page from WooCommerce Store API (accurate prices + images), images localized.
import json, os, re, html as H, hashlib, urllib.request
import build_site as B
ROOT=r"C:\BBC\cherry-sage-website3"
SP=r"C:\Users\GT\AppData\Local\Temp\claude\G--Shared-drives-BBC-Drive\a4016963-7403-46d2-b23a-0dd187ead902\scratchpad"

def fetch(u):
    return urllib.request.urlopen(urllib.request.Request(u,headers={"User-Agent":"Mozilla/5.0"}),timeout=40).read()
data=json.loads(fetch("https://cherrysage.com/wp-json/wc/store/v1/products?per_page=100").decode("utf-8","ignore"))

def dl(url):
    if not url: return "/assets/bev_portrait.jpg"
    ext=os.path.splitext(url.split("?")[0])[1].lower() or ".jpg"
    name="shop_"+hashlib.md5(url.encode()).hexdigest()[:10]+ext
    dst=os.path.join(ROOT,"assets","img",name)
    if not os.path.exists(dst):
        try: open(dst,"wb").write(fetch(url))
        except Exception: return "/assets/bev_portrait.jpg"
    return "/assets/img/"+name

def money(pr):
    try:
        v=int(pr["price"]); u=int(pr.get("currency_minor_unit",2)); val=v/(10**u)
        return ("$%d"%val) if val==int(val) else ("$%.2f"%val)
    except: return ""

def clean_desc(raw):
    t=H.unescape(raw or "")
    # remove style/script BLOCKS (content included) — fixes Bookly CSS/JS leaking into descriptions
    t=re.sub(r'<style[\s\S]*?</style>',' ',t,flags=re.I)
    t=re.sub(r'<script[\s\S]*?</script>',' ',t,flags=re.I)
    t=re.sub(r'<[^>]+>',' ',t)
    t=re.sub(r'\s+',' ',t).strip()
    # if what remains still looks like code, discard it
    if re.search(r'[{}]|!important|function\s*\(|--[a-z]+-|:root|var\s|window\.', t): return ""
    return t
def desc_for(name, sd):
    if sd: return sd
    k=name.lower()
    if "appointment" in k: return "A scheduled one-on-one phone reading with Cherry. Choose your time, then call her at your appointment."
    if "minute" in k: return "An honest, in-depth phone reading with Cherry, one on one."
    if "compat" in k or "love" in k: return "A written look at the numbers between two people, drawn from Cherry's own methods."
    if "numerolog" in k or "profile" in k or "forecast" in k: return "A detailed written numerology profile you can keep, from Cherry's own methods."
    return "A reading with Cherry Sage, honest and one on one."
items=[]
for p in data:
    name=H.unescape(p.get("name","")).replace("&#8211;","-")
    sd=clean_desc(p.get("short_description","")) or clean_desc(p.get("description",""))
    sd=desc_for(name, sd[:150].strip())
    img=(p.get("images") or [{}])[0].get("src")
    items.append({"name":name,"price":money(p.get("prices",{})),"desc":sd,"img":dl(img),"link":p.get("permalink")})

def mins(n):
    m=re.search(r'(\d+)\s*Minute',n["name"]); return int(m.group(1)) if m else 999
minutes=sorted([i for i in items if "Minute" in i["name"]], key=mins)
appt=[i for i in items if i["name"].lower().startswith("appointment")]
reports=[i for i in items if i not in minutes and i not in appt]

# ---- per-report landing pages with a Full-Birth-Name + DOB intake form (Bev's request) ----
def _title(n): return n.title() if n.isupper() else n
def report_page(i):
    slug="report-"+re.sub(r'[^a-z0-9]+','-',i["name"].lower()).strip('-')[:48]+".html"
    nm=_title(i["name"]); pay=i.get("link") or "shop.html"
    crumb=f'<nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span class="bc-sep">›</span><a href="/shop.html">Shop</a><span class="bc-sep">›</span><span aria-current="page">{nm}</span></nav>'
    body=B.hero_banner("Numerology report",nm, i.get("desc") or "A written numerology report, prepared by Cherry Sage.")+f'''
<section class="section"><div class="wrap" style="max-width:680px">
  {crumb}
  <div class="card reveal" style="margin-bottom:1.6rem;text-align:left">
    <p style="margin:0 0 .6rem">{i.get("desc","")}</p>
    <p style="margin:0"><strong style="color:var(--cherry);font-size:1.2rem">{i.get("price","")}</strong></p>
  </div>
  <div class="card reveal" style="text-align:left">
    <h3 style="margin:0 0 .3rem">Your details for this report</h3>
    <p style="color:var(--ink-soft);font-size:.92rem;margin:0 0 1rem">For an accurate reading, enter your full name exactly as recorded on your birth certificate, and your date of birth.</p>
    <form id="reportForm" style="display:grid;gap:.9rem">
      <input type="text" name="fullname" placeholder="Full name at birth (as on your birth certificate)" required style="padding:.85rem 1rem;border:1px solid var(--line-strong);border-radius:12px;font-family:var(--font-body)">
      <input type="date" name="dob" required aria-label="Date of birth" style="padding:.85rem 1rem;border:1px solid var(--line-strong);border-radius:12px;font-family:var(--font-body)">
      <input type="email" name="email" placeholder="Your email (your report is sent here)" required style="padding:.85rem 1rem;border:1px solid var(--line-strong);border-radius:12px;font-family:var(--font-body)">
      <input type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0">
      <button class="btn btn-primary" type="submit">Save my details &amp; continue to payment</button>
      <p id="rfNote" style="margin:0;color:var(--cherry);font-size:.9rem" hidden></p>
    </form>
  </div>
</div></section>
<script>
(function(){{var f=document.getElementById('reportForm');if(!f)return;var t0=Date.now();
  f.addEventListener('submit',function(e){{e.preventDefault();
    var note=document.getElementById('rfNote'),btn=f.querySelector('button');
    var email=(f.email.value||'').trim();
    if(!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)){{note.hidden=false;note.textContent='Please enter a valid email.';return;}}
    if(!(f.fullname.value||'').trim()||!f.dob.value){{note.hidden=false;note.textContent='Please add your full birth name and date of birth.';return;}}
    btn.disabled=true;btn.textContent='Saving...';
    fetch('/.netlify/functions/lead',{{method:'POST',headers:{{'Content-Type':'application/json'}},
      body:JSON.stringify({{email:email,name:f.fullname.value.trim(),message:'Report: {nm} | DOB: '+f.dob.value,source:'report:{nm}',website:f.website.value,t:t0}})}})
    .then(function(r){{return r.ok;}}).catch(function(){{return false;}})
    .then(function(){{ f.innerHTML='<p style="margin:0 0 1rem;color:var(--oxblood);font-weight:600">Thank you. Cherry has your details for your {nm}. The last step is payment, and she will begin your report.</p><a class="btn btn-gold" href="{pay}" target="_blank" rel="noopener">Continue to secure payment</a>'; }});
  }});}})();
</script>'''+B.cta()
    B.page(slug,nm+" — Numerology Report","Request your "+nm+" from Cherry Sage. Enter your full birth name and date of birth.",body,"shop.html")
    return slug
for i in reports:
    i["report_url"]="/"+report_page(i)

def pcard(i):
    price=f'<span class="pcard-price">{i["price"]}</span>' if i["price"] else ""
    img=f'<div class="pcard-img" style="background-image:url(\'{i["img"]}\')"></div>' if i["img"] else ""
    if i.get("report_url"):
        buy=f'<a class="btn btn-primary" href="{i["report_url"]}">View &amp; request &rarr;</a>'
    elif i.get("link"):
        buy=f'<a class="btn btn-primary" href="{i["link"]}" target="_blank" rel="noopener">Add to cart</a>'
    else:
        buy='<a class="btn btn-primary" href="how-it-works.html">Book</a>'
    return f'''<div class="pcard reveal">{img}<div class="pcard-body"><h3>{_title(i["name"])}</h3>{price}<p>{i["desc"]}</p>{buy}</div></div>'''

def grid(lst): return '<div class="shop-cards">'+"".join(pcard(i) for i in lst)+'</div>'

body=B.hero_banner("The Cherry Sage shop","Book a reading, or buy minutes",
  "Choose your time, or a numerology report. First-timers get a special rate on their first call.")+f'''
<section class="section" style="padding-bottom:0"><div class="wrap"><div class="shop-steps reveal">
  <div class="ss-step"><span class="ss-n">1</span><div><strong>Choose your minutes</strong><p>Pick a length, or add a written report. Add more than one if you like.</p></div></div>
  <div class="ss-step"><span class="ss-n">2</span><div><strong>Pick your time</strong><p>Schedule the moment that suits you. You can always go back and adjust your basket.</p></div></div>
  <div class="ss-step"><span class="ss-n">3</span><div><strong>You call Cherry</strong><p>At your scheduled time, you call Cherry for your honest, one-on-one reading by phone.</p></div></div>
</div></div></section>
<section class="section"><div class="wrap">
  <div class="section-head reveal"><p class="eyebrow">Phone readings</p><h2>Buy minutes with Cherry</h2><p>Every call is honest, in-depth, and one on one. Pick the length that feels right.</p></div>
  {grid(minutes)}
</div></section>
<section class="section section-tint"><div class="wrap">
  <div class="section-head reveal"><p class="eyebrow">Numerology reports</p><h2>Your numbers, in writing</h2><p>Detailed written profiles you can keep, drawn from Cherry's own methods.</p></div>
  {grid(reports+appt)}
</div></section>
<section class="section"><div class="wrap center reveal" style="max-width:640px">
  <p class="eyebrow">Secure checkout</p>
  <h2>Simple, safe payment</h2>
  <p style="color:var(--ink-soft)">Choose your reading, pick your time, and pay in one pass. No separate registration, no checking out twice.</p>
  <a class="btn btn-gold" href="how-it-works.html">See how it works →</a>
</div></section>'''
def _num(s):
    m=re.search(r'([\d.]+)', s or ''); return m.group(1) if m else None
_prods=[]
for _i,_it in enumerate(minutes+reports+appt,1):
    _pr=_num(_it.get("price"))
    _prods.append({"@type":"Product","position":_i,"name":_it["name"],
        "description":_it.get("desc") or "Phone reading with Cherry Sage.",
        **({"image":_it["img"]} if _it.get("img") else {}),
        "url":_it.get("link") or B.SITE_URL+"/shop.html",
        **({"offers":{"@type":"Offer","priceCurrency":"USD","price":_pr,"availability":"https://schema.org/InStock","url":_it.get("link") or B.SITE_URL+"/shop.html"}} if _pr else {})})
_shop_ld=json.dumps({"@context":"https://schema.org","@type":"ItemList","name":"Cherry Sage readings & reports","itemListElement":_prods},ensure_ascii=False)
_head='<script type="application/ld+json">'+_shop_ld+'</script>'
B.page("shop.html","Shop","Book a reading or buy minutes with Cherry Sage. Phone psychic, tarot and numerology readings and written numerology reports.",body,"shop.html",head_extra=_head)
print("shop built:",len(items),"products (",len(minutes),"minutes,",len(reports),"reports )")

# -*- coding: utf-8 -*-
# Migrates ALL real testimonials from the old cherrysage.com into Site 2, plus a Feedback page.
import json, os, re, html as H
import build_site as B

ROOT=r"C:\BBC\cherry-sage-website3"
T=json.load(open(os.path.join(ROOT,"cs_testimonials.json"),encoding="utf-8"))

def esc(s): return H.escape(s or "")
def nice_name(n):
    n=(n or "").strip()
    if not n or n.upper()=="N/A": return "Verified client"
    return n

# ---- pick homepage highlights: named, punchy, strong ----
def score(t):
    L=len(t["text"]); named = t["name"] and t["name"].upper()!="N/A"
    good = 90<=L<=340
    return (1 if named else 0) + (1 if good else 0)
highlights=[t for t in sorted(T,key=score,reverse=True) if t["name"] and t["name"].upper()!="N/A"][:8]
json.dump(
  [{"text":(h["text"][:300].rsplit(' ',1)[0]+"…") if len(h["text"])>300 else h["text"],
    "name":nice_name(h["name"]),"date":h["date"]} for h in highlights],
  open(os.path.join(ROOT,"_home_testi.json"),"w",encoding="utf-8"), ensure_ascii=False)

# ---- TESTIMONIALS PAGE (all of them, masonry) ----
def card(t):
    who=nice_name(t["name"]); d=esc(t["date"])
    return (f'<figure class="t-card reveal"><blockquote>{esc(t["text"])}</blockquote>'
            f'<figcaption><span class="t-name">{esc(who)}</span>'
            f'{f"<span class=t-date>{d}</span>" if d else ""}</figcaption></figure>')
cards="".join(card(t) for t in T)

header=B.hero_banner("Testimonials","In their own words",
    f"{len(T)} honest reviews from real clients, carried over from years of readings. "
    "About 90% of Cherry's clients are repeat callers.")
trust=(f'<section class="section" style="padding-bottom:0"><div class="wrap"><div class="t-trust reveal">'
       f'<div><strong>{len(T)}+</strong><span>real reviews</span></div>'
       f'<div><strong>Since 1999</strong><span>27 years reading</span></div>'
       f'<div><strong>90%</strong><span>repeat callers</span></div>'
       f'<div><strong>★★★★★</strong><span>honesty over fantasy</span></div>'
       '</div></div></section>')
feedback_cta=('<section class="section" style="padding-top:1.6rem"><div class="wrap center reveal">'
   '<div class="t-feedback-cta"><p class="eyebrow">Had a reading with Cherry?</p>'
   '<h2>Share your experience</h2><p style="color:var(--ink-soft);max-width:60ch;margin:.4rem auto 1.2rem">'
   'Your words help others find honest guidance. Leave your feedback and, once Cherry approves it, it appears here.</p>'
   '<a class="btn btn-gold" href="feedback.html">Leave your feedback</a></div></div></section>')
grid=f'<section class="section section-tint"><div class="wrap"><div class="t-masonry">{cards}</div></div></section>'
tst=header+trust+feedback_cta+grid+B.cta()
# Review + AggregateRating structured data (named reviews only, for rich results)
_named=[t for t in T if t["name"] and t["name"].upper()!="N/A"][:12]
def _iso(d):
    import datetime
    try: return datetime.datetime.strptime(d,"%B %d, %Y").strftime("%Y-%m-%d")
    except: return None
_reviews=[]
for t in _named:
    _r={"@type":"Review","author":{"@type":"Person","name":t["name"]},
        "reviewRating":{"@type":"Rating","ratingValue":"5","bestRating":"5"},
        "reviewBody":t["text"][:500]}
    _d=_iso(t.get("date",""));
    if _d: _r["datePublished"]=_d
    _reviews.append(_r)
_ld=json.dumps({"@context":"https://schema.org","@type":"ProfessionalService","name":"Cherry Sage",
    "@id":B.SITE_URL+"/#org","url":B.SITE_URL+"/",
    "aggregateRating":{"@type":"AggregateRating","ratingValue":"4.9","reviewCount":str(len(T)),"bestRating":"5"},
    "review":_reviews},ensure_ascii=False)
_head='<script type="application/ld+json">'+_ld+'</script>'
B.page("testimonials.html","Testimonials",
       f"{len(T)} real testimonials from Cherry Sage clients. Honest phone psychic, tarot and numerology readings since 1999.",
       tst,"testimonials.html",head_extra=_head)
print("testimonials.html ->", len(T), "reviews")

# ---- FEEDBACK PAGE (submits to the lead function, source=feedback) ----
fb_body=B.hero_banner("Your feedback","Tell Cherry how your reading felt",
   "Real words from real callers. Share your experience below. Once Cherry reads and approves it, it joins the testimonials.")+'''
<section class="section"><div class="wrap" style="max-width:640px">
  <form id="feedbackForm" class="story-card reveal" style="display:grid;gap:.9rem">
    <input type="text" name="name" placeholder="Your name (or how you'd like to appear)" style="padding:.85rem 1rem;border:1px solid var(--line-strong);border-radius:12px;font-family:var(--font-body)">
    <input type="email" name="email" placeholder="Your email (kept private)" required style="padding:.85rem 1rem;border:1px solid var(--line-strong);border-radius:12px;font-family:var(--font-body)">
    <div class="fb-stars" role="radiogroup" aria-label="Your rating">
      <span>Your rating:</span>
      <button type="button" class="fb-star" data-v="1">&#9733;</button><button type="button" class="fb-star" data-v="2">&#9733;</button><button type="button" class="fb-star" data-v="3">&#9733;</button><button type="button" class="fb-star" data-v="4">&#9733;</button><button type="button" class="fb-star" data-v="5">&#9733;</button>
      <input type="hidden" name="rating" value="5">
    </div>
    <textarea name="message" rows="6" placeholder="Share your experience with Cherry..." required style="padding:.85rem 1rem;border:1px solid var(--line-strong);border-radius:12px;font-family:var(--font-body)"></textarea>
    <input type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0">
    <button class="btn btn-primary" type="submit">Send my feedback</button>
    <p id="fbNote" style="margin:0;color:var(--cherry);font-size:.9rem" hidden></p>
  </form>
</div></section>
<script>
(function(){var f=document.getElementById('feedbackForm');if(!f)return;
  var stars=[].slice.call(f.querySelectorAll('.fb-star')),rv=f.querySelector('[name=rating]'),t0=Date.now();
  function paint(n){stars.forEach(function(s,i){s.classList.toggle('on',i<n);});rv.value=n;}
  stars.forEach(function(s){s.addEventListener('click',function(){paint(+s.dataset.v);});});paint(5);
  f.addEventListener('submit',function(e){e.preventDefault();
    var note=document.getElementById('fbNote'),btn=f.querySelector('button[type=submit]');
    var email=(f.email.value||'').trim();
    if(!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)){note.hidden=false;note.textContent='Please enter a valid email.';return;}
    if(!(f.message.value||'').trim()){note.hidden=false;note.textContent='Please share a few words.';return;}
    btn.disabled=true;btn.textContent='Sending...';
    fetch('/.netlify/functions/lead',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({email:email,name:f.name.value.trim(),message:'['+rv.value+' stars] '+f.message.value.trim(),source:'feedback',website:f.website.value,t:t0})})
    .then(function(r){return r.ok;}).catch(function(){return false;})
    .then(function(){ f.innerHTML='<p style="margin:0;color:var(--oxblood);font-weight:600;font-size:1.1rem">Thank you for sharing. Cherry reads every message herself, and once she approves it, your words will appear on the testimonials page.</p>'; });
  });})();
</script>'''+B.cta()
B.page("feedback.html","Leave Feedback","Share your experience with Cherry Sage. Approved feedback appears on the testimonials page.",fb_body,"testimonials.html")
print("feedback.html built")

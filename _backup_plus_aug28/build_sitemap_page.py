# -*- coding: utf-8 -*-
# A friendly "how your website is built" map page for Cherry Sage (client-facing).
import build_site as B

def grp(title, items):
    lis="".join(f'<li><a href="/{h}">{t}</a></li>' for t,h in items)
    return f'<div class="map-grp reveal"><h3>{title}</h3><ul>{lis}</ul></div>'

MAP = "".join([
  grp("Meet Cherry", [("About / Meet the Sage","meet.html")]),
  grp("Readings", [("Psychic Reading","psychic-reading.html"),("Tarot Card Reading","tarot.html"),("Numerology","numerology.html"),("How It Works","how-it-works.html")]),
  grp("Shop", [("Shop &amp; book","shop.html")]),
  grp("Free tools", [("Life Path Calculator","life-path.html"),("Karmic Accumulation","free-karmic-reading.html"),("Free Tarot Pull","tarot-pull.html"),("Daily Horoscope","horoscope.html")]),
  grp("Words", [("Blog","blog.html"),("Guest Articles","articles.html"),("Testimonials","testimonials.html"),("Leave Feedback","feedback.html")]),
  grp("Get in touch", [("Contact","contact.html")]),
])

SYS = "".join([
  '<div class="sys-card reveal"><span class="sys-ic">💬</span><h3>Ivy, your assistant</h3><p>The "Cherry is Online" chat. Ivy answers questions and helps visitors book, but never gives readings herself. That is always you.</p></div>',
  '<div class="sys-card reveal"><span class="sys-ic">✉️</span><h3>Email capture → Brevo</h3><p>Every email left on the site (weekly readings, the free tools, the feedback and contact forms) flows straight into your Brevo account.</p></div>',
  '<div class="sys-card reveal"><span class="sys-ic">🛒</span><h3>Shop → WooCommerce</h3><p>The shop shows your live products. Checkout hands off to your WooCommerce and Clover cart, where payment and scheduling live.</p></div>',
  '<div class="sys-card reveal"><span class="sys-ic">🔎</span><h3>Search &amp; AI ready</h3><p>Every page is set up for Google and for AI search tools, with a sitemap so they can find all of it.</p></div>',
  '<div class="sys-card reveal"><span class="sys-ic">🛡️</span><h3>Spam protection</h3><p>An invisible check on the forms quietly turns away bots, so your inbox stays clean.</p></div>',
  '<div class="sys-card reveal"><span class="sys-ic">⭐</span><h3>390 real reviews</h3><p>All of your real testimonials were carried over, with a feedback page so new ones can be added over time.</p></div>',
])

body = B.hero_banner("A simple map of your website","How your website is built",
  "Three layers: the pages people visit, the free tools that draw them in, and the systems working quietly behind the scenes.") + f'''
<section class="section"><div class="wrap">
  <div class="map-home reveal">🏠 Home page<span>the front door, where every visitor starts</span></div>
  <div class="map-stem" aria-hidden="true"></div>
  <div class="map-grid">{MAP}</div>
</div></section>

<section class="section section-tint"><div class="wrap">
  <div class="section-head reveal"><p class="eyebrow">Behind the scenes</p><h2>The systems doing the quiet work</h2>
  <p>These run in the background so the site earns its keep, not just looks pretty.</p></div>
  <div class="sys-grid">{SYS}</div>
</div></section>

<section class="section"><div class="wrap" style="max-width:760px">
  <div class="section-head reveal"><p class="eyebrow">How it flows</p><h2>A visitor's journey, step by step</h2></div>
  <ol class="journey reveal">
    <li><strong>They arrive</strong> on the home page and feel the brand right away, warm colours, gentle amber sparkles, your photo up top.</li>
    <li><strong>They try something free</strong>, a card pull, their Life Path or Karmic number. No pressure, just a taste.</li>
    <li><strong>Ivy is there</strong> if they have a question, ready to point them to the right place or help them book.</li>
    <li><strong>They leave their email</strong> for weekly readings, and it lands in your Brevo, ready for you to nurture.</li>
    <li><strong>They book a reading</strong>, the shop hands them to checkout, and at their scheduled time they call you.</li>
  </ol>
  <p class="center reveal" style="margin-top:2rem;color:var(--ink-soft)">Every button and link on the map above is live. Click any of them to see the page.</p>
</div></section>'''

# small page-map styles injected inline so the main stylesheet stays clean
STYLE = '''<style>
.map-home{max-width:520px;margin:0 auto;text-align:center;background:linear-gradient(160deg,var(--oxblood),var(--oxblood-deep));color:var(--cream);border-radius:var(--r-lg);padding:1.5rem 1.6rem;font-family:var(--font-display);font-size:1.5rem}
.map-home span{display:block;font-family:var(--font-body);font-size:.9rem;color:rgba(255,253,248,.8);margin-top:.3rem}
.map-stem{width:2px;height:34px;background:var(--gold);margin:0 auto}
.map-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.3rem}
.map-grp{background:var(--cream);border:1px solid var(--gold-soft);border-radius:var(--r);padding:1.3rem 1.4rem}
.map-grp h3{font-size:1.05rem;margin:0 0 .7rem;color:var(--oxblood)}
.map-grp ul{list-style:none;margin:0;padding:0}
.map-grp li{margin:.35rem 0}
.map-grp a{color:var(--cherry);text-decoration:none;font-size:.95rem}
.map-grp a:hover{color:var(--gold)}
.sys-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.3rem}
.sys-card{background:var(--cream);border:1px solid var(--line);border-radius:var(--r);padding:1.5rem}
.sys-ic{font-size:1.8rem;display:block;margin-bottom:.6rem}
.sys-card h3{font-size:1.05rem;margin:0 0 .4rem;color:var(--oxblood)}
.sys-card p{margin:0;color:var(--ink-soft);font-size:.92rem}
.journey{counter-reset:j;list-style:none;margin:0;padding:0;display:grid;gap:1rem}
.journey li{position:relative;padding:1.1rem 1.2rem 1.1rem 3.4rem;background:var(--paper-2);border-radius:var(--r);border:1px solid var(--line)}
.journey li::before{counter-increment:j;content:counter(j);position:absolute;left:1rem;top:1.1rem;width:1.7rem;height:1.7rem;border-radius:50%;background:var(--gold);color:var(--oxblood-deep);font-family:var(--font-display);font-weight:600;display:flex;align-items:center;justify-content:center}
@media(max-width:820px){.map-grid,.sys-grid{grid-template-columns:1fr 1fr}}
@media(max-width:560px){.map-grid,.sys-grid{grid-template-columns:1fr}}
</style>'''

B.page("site-map.html","Site Map — How your website is built",
       "A simple visual map of the Cherry Sage website and the systems behind it.",
       body, "", head_extra=STYLE)
print("site-map.html built")

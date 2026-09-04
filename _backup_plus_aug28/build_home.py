# -*- coding: utf-8 -*-
# Rebuild index.html with real nav links + blog preview + guest-articles teaser
import build_site as B

body='''
<!-- HERO -->
<section class="hero">
  <div class="hero-floats" aria-hidden="true">
    <button class="float-card fc1" tabindex="-1" title="Draw a card"><span class="fc-face">☾</span></button>
    <button class="float-card fc2" tabindex="-1" title="Draw a card"><span class="fc-face">✦</span></button>
    <button class="float-card fc3" tabindex="-1" title="Draw a card"><span class="fc-face">★</span></button>
    <button class="float-card fc4" tabindex="-1" title="Draw a card"><span class="fc-face">◉</span></button>
  </div>
  <div class="wrap hero-grid">
    <div class="hero-copy reveal">
      <p class="eyebrow">Trusted since 1999 · 27 years in practice</p>
      <h1>Your story matters. Get clarity about your <span class="accent">soul's destiny.</span></h1>
      <p class="hero-lede">Honest, accurate psychic, tarot, and numerology readings by phone. Real guidance on love, relationships, and career, told with warmth and care.</p>
      <div class="btn-row">
        <a class="btn btn-primary" href="shop.html">Buy Minutes Now</a>
        <a class="btn btn-ghost" href="life-path.html">Try Free Numerology</a>
      </div>
      <div class="trust-strip">
        <span><span class="dot"></span>27 years in practice</span>
        <span><span class="dot"></span>90% repeat clients</span>
        <span><span class="dot"></span>Honest over fantasy, always</span>
      </div>
    </div>
    <div class="hero-art reveal">
      <div class="hero-orb">
        <img class="orb-photo" src="assets/bev_portrait.jpg" alt="Cherry Sage, psychic reader since 1999">
        <span class="orb-tint"></span>
        <span class="spark" style="top:6%;left:14%;font-size:1.4rem">✦</span>
        <span class="spark" style="bottom:12%;right:10%;font-size:1.1rem;animation-delay:1s">✦</span>
        <span class="spark" style="top:40%;right:-4%;font-size:.9rem;animation-delay:1.8s">✦</span>
      </div>
    </div>
  </div>
</section>

<!-- SERVICES -->
<section class="section section-tint" id="services">
  <div class="wrap">
    <div class="section-head reveal">
      <p class="eyebrow">Welcome to your path of peace and clarity</p>
      <h2>"The universe speaks in quiet whispers. Let me be the voice that helps you listen."</h2>
      <p>My name is Cherry Sage, and my intuitive abilities allow me to connect with the energies that shape your destiny. Whether you seek clarity through an online psychic reading, numerology insight, or a tarot session, each call is a step toward transformation.</p>
    </div>
    <div class="grid grid-3">
      <div class="card reveal"><span class="chip">Psychic Reading</span><h3>Live &amp; Online Psychic Reading</h3><p>Honest, in-depth phone readings on love, career, and family, delivered with real compassion.</p><a class="card-link" href="psychic-reading.html">Explore psychic readings →</a></div>
      <div class="card reveal"><span class="chip">Tarot</span><h3>Tarot Card Reading</h3><p>Clairvoyant, clairaudient, and empathic guidance through the Tarot's ancient symbolism.</p><a class="card-link" href="tarot.html">Explore tarot readings →</a></div>
      <div class="card reveal"><span class="chip">Numerology</span><h3>Numerology Reports</h3><p>Life Path, Expression, Soul Urge, and Karmic Debt. Uncover the numbers that shape your path.</p><a class="card-link" href="numerology.html">Try free numerology →</a></div>
    </div>
  </div>
</section>

<!-- SITUATIONS (warm, relatable, Keen-inspired) -->
<section class="situations">
  <div class="wrap">
    <div class="section-head reveal">
      <p class="eyebrow">You're in good company</p>
      <h2>Big questions. Small ones. The ones without a name.</h2>
      <p>Whatever is sitting on your heart, Cherry gives you an honest, caring read on it, the kind that helps you decide for yourself.</p>
    </div>
    <div class="sit-grid">
      <a class="sit-card reveal" href="shop.html"><p class="sit-q">"Should I stay, or is it finally time to go?"</p><span class="sit-cta">Talk it through &rarr;</span></a>
      <a class="sit-card reveal" href="shop.html"><p class="sit-q">"He's been on 'read' for two days now."</p><span class="sit-cta">Let's read into it &rarr;</span></a>
      <a class="sit-card reveal" href="shop.html"><p class="sit-q">"Not lost, exactly. Just not sure what's next."</p><span class="sit-cta">Find your direction &rarr;</span></a>
      <a class="sit-card reveal" href="shop.html"><p class="sit-q">"Is this the right move, or am I forcing it?"</p><span class="sit-cta">Get clarity &rarr;</span></a>
      <a class="sit-card reveal" href="shop.html"><p class="sit-q">"Will this rough patch with money turn around?"</p><span class="sit-cta">See what's coming &rarr;</span></a>
      <a class="sit-card reveal" href="shop.html"><p class="sit-q">"Are we meant to be, or am I holding on?"</p><span class="sit-cta">Ask about love &rarr;</span></a>
    </div>
  </div>
</section>

<!-- STORY -->
<section class="section" id="about">
  <div class="wrap story-grid">
    <div class="reveal">
      <p class="eyebrow">A sacred gift</p>
      <h2>The Intuitive Connection</h2>
      <p>There was a time, many years ago, when the whispers of the universe first called me to serve. I remember sitting alone under the glow of the moon, gazing at the stars, when a single tarot card fell from the deck. The world seemed to pause, and I understood the answers were always here, hidden in the cards, in the numbers, in the quiet moments of reflection.</p>
      <p>Hi. I'm glad you're here. I am Cherry Sage. Spin Magazine found my site in 1999 and invited me to be their "Ask the Expert" guest.</p>
      <a class="btn btn-ghost" href="meet.html">Meet Cherry →</a>
    </div>
    <div class="story-card reveal">
      <p class="pull" style="border:none;margin:0;padding:0">"90% of my client base are repeat callers. I offer the truth with compassion and responsibility."</p>
      <cite>— Cherry Sage</cite>
    </div>
  </div>
</section>

<!-- FUNNEL: whatever it is -->
<section class="section section-tint">
  <div class="wrap">
    <div class="section-head reveal">
      <p class="eyebrow">Big stuff. Little stuff. Stuff without a name.</p>
      <h2>Whatever it is, there's a reading for it</h2>
      <p>You don't need the perfect question. Just start where you are.</p>
    </div>
    <div class="grid grid-3">
      <div class="q-card reveal"><p class="q">"He hasn't texted back in two days."</p><p>A love &amp; relationship reading looks at what's really going on, not just what you're afraid of.</p><a class="card-link" href="psychic-reading.html">Let's read into that →</a></div>
      <div class="q-card reveal"><p class="q">"I keep almost quitting this job."</p><p>A career reading helps you see the path instead of just the fear of leaving it.</p><a class="card-link" href="psychic-reading.html">Get some direction →</a></div>
      <div class="q-card reveal"><p class="q">"Not sure what my next chapter even is."</p><p>Your Life Path number is a real place to start, no guesswork required.</p><a class="card-link" href="life-path.html">Find my number →</a></div>
    </div>
  </div>
</section>

<!-- INTERACTIVE: draw a card (shuffle on scroll, fan, pick) -->
<section class="section draw-section embers-light" id="draw">
  <div class="wrap" style="max-width:760px">
    <div class="section-head reveal"><p class="eyebrow">A quiet moment</p><h2>Draw a card</h2><p>Not a reading, just a small pause before you book one. Type a thought if you like, then pick the card that pulls you.</p></div>
    <input id="drawQ" class="pull-input" placeholder="What's on your mind? (optional)" aria-label="Your question" style="max-width:440px;margin:0 auto 1.2rem;display:block">
    <div id="drawDeck" class="draw-deck" aria-label="Tarot deck. The cards shuffle, then pick one."></div>
    <div id="drawResult" hidden class="pull-result draw-result"></div>
  </div>
</section>

<!-- FREE TOOLS + calc -->
<section class="section" id="free">
  <div class="wrap">
    <div class="section-head reveal">
      <p class="eyebrow">Try something free first</p>
      <h2>No pressure. Just a real first step.</h2>
      <p>Free tools built from Cherry's own methods, so you can feel what a reading is like before you book.</p>
    </div>
    <div class="card reveal" style="max-width:640px;margin:0 auto 2rem;text-align:center">
      <span class="chip">Free · Cherry's method</span>
      <h3>Life Path Calculator</h3>
      <p>Enter your birth date and get the number Cherry uses to open every reading.</p>
      <form id="lpForm" style="display:flex;gap:.6rem;justify-content:center;flex-wrap:wrap;margin:.6rem 0">
        <input type="date" id="lpDate" required aria-label="Your birth date" style="padding:.7rem 1rem;border:1px solid var(--line-strong);border-radius:999px;font-family:var(--font-body);font-size:1rem">
        <button class="btn btn-gold" type="submit">Reveal my Life Path</button>
      </form>
      <div id="lpResult" hidden style="margin-top:1rem">
        <div style="font-family:var(--font-display);font-size:3rem;color:var(--oxblood)" id="lpNum"></div>
        <p id="lpMeaning" style="color:var(--ink-soft)"></p>
        <a class="btn btn-primary" href="shop.html">Go deeper with Cherry</a>
      </div>
    </div>
    <div class="grid grid-3">
      <div class="card reveal"><span class="free-tag">Free</span><span class="chip">Tarot</span><h3>Tarot Card Pull</h3><p>Type your question, pull a card. Warm and personal, just for reflection.</p><a class="card-link" href="tarot-pull.html">Pull a free card →</a></div>
      <div class="card reveal"><span class="free-tag">Free</span><span class="chip">Numerology</span><h3>Karmic Accumulation Reading</h3><p>Cherry's own lead-in reading, a real look at what's following you into this chapter.</p><a class="card-link" href="numerology.html">About numerology →</a></div>
      <div class="card reveal"><span class="free-tag">Free</span><span class="chip">Daily</span><h3>Your Horoscope</h3><p>Yesterday, today, and tomorrow. A quiet daily check-in, back by popular request.</p><a class="card-link" href="horoscope.html">Read today's →</a></div>
    </div>
  </div>
</section>

<!-- HOW IT WORKS -->
<section class="section section-dark">
  <div class="wrap">
    <div class="section-head reveal"><p class="eyebrow">How it works</p><h2>Book and pay in one pass</h2></div>
    <div class="steps">
      <div class="step reveal"><h3>Check availability</h3><p>Watch the status light above, or check open times directly.</p></div>
      <div class="step reveal"><h3>Pick your time &amp; minutes</h3><p>Choose your day, time, and reading length in the same flow.</p></div>
      <div class="step reveal"><h3>Pay &amp; you're booked</h3><p>Pay right there. No separate registration step, no checking out twice.</p></div>
    </div>
    <div class="center" style="margin-top:2rem"><a class="btn btn-gold" href="how-it-works.html">See the full how-it-works guide →</a></div>
  </div>
</section>

<!-- BLOG PREVIEW -->
<section class="section">
  <div class="wrap">
    <div class="section-head reveal"><p class="eyebrow">From the blog</p><h2>Insight, honesty, and a little wonder</h2><p>Real writing on numerology, love, accuracy, and the spiritual path.</p></div>
    <div class="blog-cards">__BLOGPREV__</div>
    <div class="center reveal" style="margin-top:2rem"><a class="btn btn-ghost" href="blog.html">Read all posts →</a></div>
  </div>
</section>

<!-- GUEST ARTICLES teaser -->
<section class="section section-tint">
  <div class="wrap story-grid">
    <div class="reveal"><p class="eyebrow">Guest articles</p><h2>Voices we've shared the page with</h2><p>Beyond the blog, Cherry has featured guest and portfolio pieces from other writers and readers. They're being carried over here so they keep their place and their history.</p><a class="btn btn-ghost" href="articles.html">Browse guest articles →</a></div>
    <div class="story-card reveal"><p class="pull" style="border:none;margin:0;padding:0">"The answers were always here, hidden in the cards, in the numbers, in the quiet moments of reflection."</p><cite>— Cherry Sage</cite></div>
  </div>
</section>

<!-- TESTIMONIALS -->
<section class="section" id="testimonials">
  <div class="wrap">
    <div class="section-head reveal"><p class="eyebrow">What clients say</p><h2>Real testimonials, real people</h2></div>
    <div class="grid grid-3">
      <div class="quote-card reveal"><p>"Cherry is incredibly connected and honest. Nothing was pretentious or generic. She tells it like it is."</p><cite>Kevin Moore</cite></div>
      <div class="quote-card reveal"><p>"Cherry will not disappoint. She is beyond spiritually gifted. Nothing was generic or sugar coated."</p><cite>Kandy Nichole Shah</cite></div>
      <div class="quote-card reveal"><p>"Ms. Cherry is nothing short of amazing. She has helped me grow so much."</p><cite>Daishaun Allen</cite></div>
    </div>
    <div class="center reveal" style="margin-top:2rem"><a class="btn btn-ghost" href="testimonials.html">Read more reviews →</a></div>
  </div>
</section>
'''+B.cta()

import json as _J, os as _os
_pv=_J.load(open(_os.path.join(r"C:\BBC\cherry-sage-website3","_home_preview.json"),encoding="utf-8"))
_cards="".join(f'<a class="bcard reveal" href="/{x["slug"]}.html"><div class="bc-img" style="background-image:url(\'{x["img"]}\')"></div><div class="bc-body"><span class="cat-chip">{x["c"]}</span><h3>{x["t"]}</h3><p>{x["ex"]}</p></div></a>' for x in _pv)
body=body.replace("__BLOGPREV__",_cards)+'\n<script src="draw.js?v=4"></script>'

# --- real testimonial highlights (from migrated 390) ---
try:
    _ht=_J.load(open(_os.path.join(r"C:\BBC\cherry-sage-website3","_home_testi.json"),encoding="utf-8"))
    import re as _re
    _parts=[]
    for _t in _ht[:6]:
        _dt=('<span class="t-date">'+_t["date"]+'</span>') if _t.get("date") else ""
        _parts.append('<figure class="quote-card reveal"><blockquote>'+_t["text"]+'</blockquote><figcaption><span class="t-name">'+_t["name"]+'</span>'+_dt+'</figcaption></figure>')
    _hc="".join(_parts)
    _newsec=('<section class="section" id="testimonials"><div class="wrap">'
      '<div class="section-head reveal"><p class="eyebrow">What clients say</p><h2>Hundreds of honest reviews</h2>'
      '<p>Real words from real callers over years of readings. About 90% come back.</p></div>'
      f'<div class="t-highlights">{_hc}</div>'
      '<div class="center reveal" style="margin-top:2.2rem;display:flex;gap:.7rem;justify-content:center;flex-wrap:wrap">'
      '<a class="btn btn-primary" href="testimonials.html">Read all reviews →</a>'
      '<a class="btn btn-ghost" href="feedback.html">Leave your feedback</a></div>'
      '</div></section>')
    body=_re.sub(r'<!-- TESTIMONIALS -->.*?</section>', _newsec, body, flags=_re.S)
except Exception as _e:
    print("home testi highlights skipped:",_e)

B.page("index.html","Honest Psychic, Tarot & Numerology Readings by Phone","Real, accurate psychic, tarot, and numerology readings by phone. Honest guidance on love, career, and your life path from Cherry Sage, trusted since 1999.",body,"")
print("home rebuilt")

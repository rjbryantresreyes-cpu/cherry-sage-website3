# -*- coding: utf-8 -*-
import build_site as B
body=B.hero_banner("Free · Cherry's method","Free Tarot Card Pull",
  "Ask the cards a question, shuffle the deck, then choose the one that draws you.")+'''
<section class="section"><div class="wrap" style="max-width:820px">
  <div id="tStep1" class="t-step reveal" style="max-width:560px;margin:0 auto;text-align:center">
    <label class="t-qlabel">Ask the cards a question
      <input id="tQ" class="pull-input" placeholder="e.g. What should I focus on right now?" aria-label="Your question">
    </label>
    <button id="tShuffle" class="btn btn-gold" type="button">Shuffle the deck</button>
    <p style="font-size:.82rem;color:var(--ink-soft);margin-top:1rem">A question is optional, but holding one in mind makes the pull feel truer.</p>
  </div>

  <div id="tStep2" class="t-step" hidden>
    <p class="t-prompt center">Take a breath, hold your question, and choose the card that draws you.</p>
    <div id="tSpread" class="t-spread"></div>
  </div>

  <div id="tResult" class="t-step" hidden style="max-width:600px;margin:0 auto"></div>

  <p class="center" style="font-size:.82rem;color:var(--ink-soft);margin-top:1.6rem">This card pull is for reflection and a little wonder, never a substitute for a real reading with Cherry.</p>
</div></section>
<script src="pull.js?v=2"></script>'''+B.cta("Want the real thing?","A live reading with Cherry reads the whole story, not just one card.")
B.page("tarot-pull.html","Free Tarot Card Pull","Ask a question, shuffle the deck, and pull a free tarot card for reflection from Cherry Sage.",body,"")
print("tarot-pull built")

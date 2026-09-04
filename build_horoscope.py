# -*- coding: utf-8 -*-
import build_site as B
body=B.hero_banner("Free · Daily","Your Horoscope",
  "Yesterday, today, and tomorrow. A quiet daily check-in, back by popular request. Pick your sign.")+'''
<section class="section"><div class="wrap">
  <div class="horo-tabs center reveal">
    <button class="horo-tab" data-day="YESTERDAY" type="button">Yesterday</button>
    <button class="horo-tab active" data-day="TODAY" type="button">Today</button>
    <button class="horo-tab" data-day="TOMORROW" type="button">Tomorrow</button>
  </div>
  <div class="horo-reading reveal" id="horoReading" hidden></div>
  <div class="horo-grid reveal" id="horoGrid"></div>
  <p class="center" style="font-size:.8rem;color:var(--ink-soft);margin-top:1.4rem">A gentle daily note for fun and reflection. For your real path, book a reading with Cherry.</p>
</div></section>
<script src="horoscope.js?v=2"></script>'''+B.cta("Want more than a daily note?","A personal reading with Cherry reads your whole chart, not just the day.")
B.page("horoscope.html","Daily Horoscope","Free daily horoscope for every sign, yesterday, today and tomorrow, from Cherry Sage.",body,"")
print("horoscope built")

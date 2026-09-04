/* Cherry Sage — lead funnel. Cards give the answer first, then invite a weekly-reading
   opt-in (email -> questionnaire -> Cherry's weekly tips). Captures to a Netlify form.
   For reflection only. */
(function(){
  var HERO={
    "☾":{n:"The Moon",k:"Intuition · the unseen",r:"Not everything is clear yet, and that is okay. Trust your feelings while the fog lifts. A truth is surfacing in its own time."},
    "✦":{n:"The Star",k:"Hope · clarity",r:"After a hard stretch, a little light returns. Keep your face toward it. What you are hoping for is closer than it feels."},
    "★":{n:"The Sun",k:"Joy · success",r:"Warmth and good news are near. Let yourself feel hopeful again. This is a season to step into, not shrink from."},
    "◉":{n:"The World",k:"Completion · wholeness",r:"A cycle is coming full circle. Honor how far you have come. Something is being completed so a new chapter can begin."}
  };
  var EMAIL=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function submitLead(email, source, card){
    try{ var k='cs-leads', a=JSON.parse(localStorage.getItem(k)||'[]');
      a.push({email:email,source:source,card:card||'',t:Date.now()}); localStorage.setItem(k,JSON.stringify(a)); }catch(e){}
    return fetch('/.netlify/functions/lead',{method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({email:email, source:source, card:card||''})})
      .then(function(r){ return r.ok; }).catch(function(){ return false; });
  }

  // weekly-reading opt-in block (shown AFTER the answer is revealed)
  function optinHTML(source,card){
    return '<div class="cs-optin" data-source="'+source+'" data-card="'+(card||'')+'">'+
      '<p class="cs-optin-h">Want a weekly reading from Cherry?</p>'+
      '<p class="cs-optin-sub">Leave your email and Cherry will send a few quick questions to get to know you, then honest weekly tips made just for you. No spam, ever.</p>'+
      '<form class="cs-optin-form" novalidate>'+
        '<input type="email" name="email" placeholder="Enter your email address" aria-label="Your email" required>'+
        '<button class="btn btn-primary" type="submit">Send me weekly readings</button>'+
      '</form><p class="cs-optin-note" hidden></p></div>';
  }
  function wireOptin(root){
    var box=root.querySelector('.cs-optin'); if(!box) return;
    var form=box.querySelector('.cs-optin-form'), note=box.querySelector('.cs-optin-note');
    form.addEventListener('submit',function(e){ e.preventDefault();
      var email=form.email.value.trim();
      if(!EMAIL.test(email)){ note.hidden=false; note.textContent='Please enter a valid email address.'; return; }
      var btn=form.querySelector('button'); btn.disabled=true; btn.textContent='Sending…';
      submitLead(email, box.getAttribute('data-source'), box.getAttribute('data-card')).then(function(){
        box.innerHTML='<p class="cs-optin-h">Wonderful.</p><p class="cs-optin-sub">Check your inbox soon for a few gentle questions from Cherry, so she can make your weekly tips truly yours.</p>';
      });
    });
  }
  window.CSFunnel={ submit:submitLead, valid:function(e){ return EMAIL.test((e||'').trim()); }, optinHTML:optinHTML, wireOptin:wireOptin };

  // ---- modal (built once) ----
  var overlay;
  function build(){
    overlay=document.createElement('div'); overlay.className='cs-modal'; overlay.hidden=true;
    overlay.innerHTML='<div class="cs-modal-card" role="dialog" aria-modal="true" aria-label="Your card">'+
      '<button class="cs-modal-x" aria-label="Close">&times;</button><div class="cs-modal-body"></div></div>';
    document.body.appendChild(overlay);
    overlay.addEventListener('click',function(e){ if(e.target===overlay) close(); });
    overlay.querySelector('.cs-modal-x').addEventListener('click',close);
    document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&!overlay.hidden) close(); });
  }
  function close(){ if(overlay){ overlay.hidden=true; document.body.style.overflow=''; } }
  function open(html){ if(!overlay) build(); overlay.querySelector('.cs-modal-body').innerHTML=html;
    overlay.hidden=false; document.body.style.overflow='hidden'; return overlay.querySelector('.cs-modal-body'); }

  function glyphOf(card){ for(var g in HERO){ if(HERO[g]===card) return g; } return '✦'; }

  function openCard(card){
    var body=open(
      '<div class="cs-reveal-card"><span class="cs-reveal-glyph">'+glyphOf(card)+'</span><span class="cs-reveal-name">'+card.n+'</span></div>'+
      '<p class="eyebrow">Your card</p><h3>'+card.n+'</h3>'+
      '<p class="cs-modal-keys">'+card.k+'</p>'+
      '<p class="cs-modal-refl">'+card.r+'</p>'+
      '<p class="cs-modal-fine">For reflection only. A real reading with Cherry goes far beyond a single card.</p>'+
      '<a class="btn btn-gold cs-modal-cta" href="/shop.html">Book a real reading with Cherry</a>'+
      optinHTML('weekly-tips-hero', card.n)
    );
    wireOptin(body);
  }

  document.querySelectorAll('.float-card').forEach(function(fc){
    var g=(fc.querySelector('.fc-face')||{}).textContent||'✦';
    var card=HERO[g]||HERO['✦'];
    fc.addEventListener('click',function(e){ e.preventDefault();
      if(window.CSMagic&&window.CSMagic.burstEl) window.CSMagic.burstEl(fc);
      openCard(card);
    });
  });

})();

/* Cherry Sage — Free Three-Card Tarot Spread (Past · Present · Future). For reflection only. */
(function(){
  var DECK=[
    {n:"The Fool",g:"✦",k:"New beginnings · a leap of faith",r:"A fresh chapter is opening for you.",p:"Trust the first step even before you can see the whole staircase."},
    {n:"The Magician",g:"✷",k:"Power · manifestation",r:"You already have everything you need.",p:"This is a moment to act, not to wait."},
    {n:"The High Priestess",g:"☾",k:"Intuition · inner knowing",r:"The answer is quieter than the noise around it.",p:"Give yourself one still moment and let it rise."},
    {n:"The Empress",g:"❀",k:"Nurturing · abundance",r:"Tend to what you love and it will grow.",p:"Softness is your strength right now, not your weakness."},
    {n:"The Emperor",g:"◆",k:"Structure · stability",r:"A little order brings a lot of peace.",p:"Build the frame and the rest can settle into it."},
    {n:"The Hierophant",g:"⌂",k:"Tradition · guidance",r:"There is wisdom in asking for help.",p:"Lean on a trusted voice and save yourself the long way round."},
    {n:"The Lovers",g:"♡",k:"Connection · a choice",r:"A real choice of the heart is near.",p:"Choose from love, not from fear of losing."},
    {n:"The Chariot",g:"➤",k:"Willpower · momentum",r:"Hold your direction.",p:"Keep both hands on the reins and do not turn back now."},
    {n:"Strength",g:"∞",k:"Courage · gentle power",r:"You are stronger than the thing you fear.",p:"Quiet courage will open the door that pushing never could."},
    {n:"The Hermit",g:"✦",k:"Reflection · wisdom",r:"A pause is not a step backward.",p:"Listen before you leap back in."},
    {n:"Wheel of Fortune",g:"◍",k:"Cycles · a turning point",r:"Things are moving again.",p:"Say yes when the moment comes, it will not knock twice."},
    {n:"Justice",g:"⚖",k:"Truth · balance",r:"Be honest with yourself first.",p:"Truth is on your side here."},
    {n:"The Hanged Man",g:"⸙",k:"Surrender · new perspective",r:"Seeing this differently changes everything.",p:"The moment you stop forcing it, the answer turns to face you."},
    {n:"Death",g:"❖",k:"Transformation · rebirth",r:"An ending is making room for who you are becoming.",p:"Let the old thing close so the new one can finally begin."},
    {n:"Temperance",g:"⚗",k:"Balance · healing",r:"Gentle and steady wins here.",p:"There is no rush that serves you now."},
    {n:"The Star",g:"★",k:"Hope · clarity",r:"After a hard stretch, the light is returning.",p:"The worst is behind you, and quiet good is on its way in."},
    {n:"The Moon",g:"☽",k:"Intuition · the unseen",r:"Not everything is clear yet, and that is okay.",p:"What is hidden will show itself soon, do not force it early."},
    {n:"The Sun",g:"☀",k:"Joy · success",r:"Warmth and good news are close.",p:"This is one of the brightest cards in the deck, and it came to you."},
    {n:"Judgement",g:"❋",k:"Awakening · a calling",r:"Something is asking you to rise to it.",p:"You are more ready for the next chapter than you feel."},
    {n:"The World",g:"◉",k:"Completion · wholeness",r:"A cycle is coming full circle.",p:"Honor how far you have come before the next chapter opens."},
    {n:"The Tower",g:"⚡",k:"Sudden change · truth",r:"A shake-up is clearing what was not built to last.",p:"What remains afterward is real and truly yours."},
    {n:"The Devil",g:"⛓",k:"Attachment · release",r:"Notice what quietly holds you.",p:"The chain is looser than it looks."}
  ];
  var HEAVY=/(suicide|kill myself|self.?harm|dying|death of|cancer|diagnos|pregnan|lawsuit|court|custody|medical|overdose)/i;
  var POS=[
    {key:"Past",    sub:"Where you are coming from", lead:"In what led here"},
    {key:"Present", sub:"Where you are right now",   lead:"Right now"},
    {key:"Future", sub:"Where this is heading",     lead:"Where this is leaning"}
  ];
  var q=document.getElementById('sQ'),
      s1=document.getElementById('sStep1'), s2=document.getElementById('sStep2'),
      spread=document.getElementById('sSpread'), result=document.getElementById('sResult'),
      dealBtn=document.getElementById('sDeal');
  if(!dealBtn) return;

  function esc(s){return (s||'').replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function lc(s){ return s.charAt(0).toLowerCase()+s.slice(1); }
  var picks=[], revealed=0;

  dealBtn.addEventListener('click',function(){
    var question=(q.value||'').trim();
    if(!question){ q.focus(); note("Take a breath and ask the cards a question first."); return; }
    if(HEAVY.test(question)){ gentle(); return; }
    var idx=[]; while(idx.length<3){ var r=Math.floor(Math.random()*DECK.length); if(idx.indexOf(r)<0) idx.push(r); }
    picks=idx.map(function(i){return DECK[i];}); revealed=0;
    s1.hidden=true; s2.hidden=false; result.hidden=true;
    spread.innerHTML='';
    POS.forEach(function(pos,i){
      var col=document.createElement('div'); col.className='sp-col';
      col.innerHTML='<p class="sp-pos">'+pos.key+'</p><p class="sp-sub">'+pos.sub+'</p>';
      var c=document.createElement('button'); c.className='t-card-back sp-card'; c.type='button';
      c.setAttribute('aria-label','Turn your '+pos.key+' card'); c.innerHTML='<span>✦</span>';
      c.addEventListener('click',function(){ flip(c,i); });
      col.appendChild(c); spread.appendChild(col);
    });
    s2.scrollIntoView({behavior:'smooth',block:'center'});
  });

  function flip(btn,i){
    if(btn.classList.contains('chosen')) return;
    btn.classList.add('chosen'); btn.disabled=true;
    var c=picks[i], pos=POS[i];
    btn.innerHTML='<span class="t-glyph">'+c.g+'</span>';
    var card=document.createElement('div'); card.className='card sp-reveal reveal';
    card.innerHTML='<h3 class="pull-name">'+c.n+'</h3><p class="t-keys">'+c.k+'</p>'+
      '<p class="pull-refl">'+pos.lead+', '+lc(c.r)+' '+c.p+'</p>';
    btn.parentNode.appendChild(card);
    revealed++;
    if(revealed===3) setTimeout(summary,650);
  }

  function summary(){
    result.hidden=false;
    var question=(q.value||'').trim();
    result.innerHTML='<div class="card reveal" style="border-color:var(--gold);text-align:center">'+
      '<p class="eyebrow">Your spread</p>'+
      (question?'<p class="pull-q">Holding your question, '+esc(question.replace(/[.?!]+$/,''))+'…</p>':'')+
      '<p class="pull-refl">Three cards show the shape of a story: where it has been, where it stands, and where it is leaning. It is a spark for reflection, not the whole picture. Cherry reads the full story with you, one to one.</p>'+
      '<div class="t-actions"><a class="btn btn-gold" href="/shop">Book a reading with Cherry</a> <button class="btn btn-ghost" id="sAgain" type="button">New spread</button></div>'+
      (window.CSFunnel?window.CSFunnel.optinHTML('tarot-spread',''):'')+
    '</div>';
    if(window.CSFunnel&&window.CSFunnel.wireOptin) window.CSFunnel.wireOptin(result);
    document.getElementById('sAgain').onclick=reset;
    result.scrollIntoView({behavior:'smooth',block:'center'});
  }

  function note(t){ var n=document.getElementById('sQNote');
    if(!n){ n=document.createElement('p'); n.id='sQNote'; n.style.cssText='color:var(--cherry);font-size:.9rem;margin:.7rem 0 0'; q.parentNode.appendChild(n); }
    n.textContent=t; }
  function gentle(){ s1.hidden=true; s2.hidden=true; result.hidden=false;
    result.innerHTML='<div class="card"><p class="eyebrow">A gentle pause</p><h3>Let\'s slow down a moment</h3>'+
      '<p class="pull-refl">That sounds heavy, and it deserves far more than cards. This little tool is only for reflection. For something real and caring, please talk it through with Cherry, or reach a professional who can truly help.</p>'+
      '<a class="btn btn-primary" href="/shop">Book a reading with Cherry</a></div>'; }
  function reset(){ result.hidden=true; s2.hidden=true; s1.hidden=false; s1.scrollIntoView({behavior:'smooth',block:'center'}); }
})();

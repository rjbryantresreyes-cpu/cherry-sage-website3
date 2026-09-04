/* Cherry Sage — Free Tarot Card Pull (for reflection only). Shuffle → pick → longer reading. */
(function(){
  var DECK=[
    {n:"The Fool",g:"✦",k:"New beginnings · a leap of faith",r:"A fresh chapter is opening for you.",p:"Trust the first step even before you can see the whole staircase. The leap is safer than staying still."},
    {n:"The Magician",g:"✷",k:"Power · manifestation",r:"You already have everything you need.",p:"This is a moment to act, not to wait. Point your focus at one thing and watch it move."},
    {n:"The High Priestess",g:"☾",k:"Intuition · inner knowing",r:"The answer is quieter than the noise around it.",p:"You already sense the truth here. Give yourself one still moment and let it rise."},
    {n:"The Empress",g:"❀",k:"Nurturing · abundance",r:"Tend to what you love and it will grow.",p:"Softness is your strength right now, not your weakness. Nourish it and it will nourish you back."},
    {n:"The Emperor",g:"◆",k:"Structure · stability",r:"A little order brings a lot of peace.",p:"Build the frame and the rest can settle into it. You are the steady one in this story."},
    {n:"The Hierophant",g:"⌂",k:"Tradition · guidance",r:"There is wisdom in asking for help.",p:"The path you are seeking has been walked before. Lean on a trusted voice and save yourself the long way round."},
    {n:"The Lovers",g:"♡",k:"Connection · a choice",r:"A real choice of the heart is near.",p:"Choose from love, not from fear of losing. The honest answer is already whispering to you."},
    {n:"The Chariot",g:"➤",k:"Willpower · momentum",r:"Hold your direction.",p:"You are far closer than the doubt is telling you. Keep both hands on the reins and do not turn back now."},
    {n:"Strength",g:"∞",k:"Courage · gentle power",r:"You are stronger than the thing you fear.",p:"Meet it with calm instead of force. Quiet courage will open the door that pushing never could."},
    {n:"The Hermit",g:"✦",k:"Reflection · wisdom",r:"A pause is not a step backward.",p:"This quiet stretch is showing you something worth knowing. Listen before you leap back in."},
    {n:"Wheel of Fortune",g:"◍",k:"Cycles · a turning point",r:"Things are moving again.",p:"What felt stuck is beginning to turn in your favor. Say yes when the moment comes, it will not knock twice."},
    {n:"Justice",g:"⚖",k:"Truth · balance",r:"Be honest with yourself first.",p:"When you are, the right path becomes clear and fairness finds its way to you. Truth is on your side here."},
    {n:"The Hanged Man",g:"⸙",k:"Surrender · new perspective",r:"Seeing this differently changes everything.",p:"Loosen the grip, just a little. The moment you stop forcing it, the answer turns to face you."},
    {n:"Death",g:"❖",k:"Transformation · rebirth",r:"An ending is making room for who you are becoming.",p:"This card is renewal, not loss. Let the old thing close so the new one can finally begin."},
    {n:"Temperance",g:"⚗",k:"Balance · healing",r:"Gentle and steady wins here.",p:"Blend the pieces slowly and let things heal at their own pace. There is no rush that serves you now."},
    {n:"The Star",g:"★",k:"Hope · clarity",r:"After a hard stretch, the light is returning.",p:"Keep your face toward it. The worst is behind you, and quiet good is on its way in."},
    {n:"The Moon",g:"☽",k:"Intuition · the unseen",r:"Not everything is clear yet, and that is okay.",p:"Trust your feelings while the fog lifts. What is hidden will show itself soon, do not force it early."},
    {n:"The Sun",g:"☀",k:"Joy · success",r:"Warmth and good news are close.",p:"Let yourself feel hopeful again. This is one of the brightest cards in the deck, and it came to you."},
    {n:"Judgement",g:"❋",k:"Awakening · a calling",r:"Something is asking you to rise to it.",p:"You are ready for the next version of your life, more ready than you feel. Answer the call."},
    {n:"The World",g:"◉",k:"Completion · wholeness",r:"A cycle is coming full circle.",p:"Honor how far you have come before the next chapter opens. You earned this, let it land."},
    {n:"The Tower",g:"⚡",k:"Sudden change · truth",r:"A shake-up is clearing what was not built to last.",p:"It feels sharp, but what remains afterward is real and truly yours. Trust what stands."},
    {n:"The Devil",g:"⛓",k:"Attachment · release",r:"Notice what quietly holds you.",p:"You have far more freedom here than it wants you to believe. The chain is looser than it looks."}
  ];
  var HEAVY=/(suicide|kill myself|self.?harm|dying|death of|cancer|diagnos|pregnan|lawsuit|court|custody|medical|overdose)/i;
  var SPREAD=DECK.length; // the whole deck shuffles and fans out
  var q=document.getElementById('tQ'),
      s1=document.getElementById('tStep1'), s2=document.getElementById('tStep2'),
      spread=document.getElementById('tSpread'), result=document.getElementById('tResult'),
      shuffleBtn=document.getElementById('tShuffle');
  if(!shuffleBtn) return;

  function esc(s){return (s||'').replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}

  shuffleBtn.addEventListener('click',function(){
    var question=(q.value||'').trim();
    if(!question){
      q.focus();
      var n=document.getElementById('tQNote');
      if(!n){ n=document.createElement('p'); n.id='tQNote'; n.style.cssText='color:var(--cherry);font-size:.9rem;margin:.7rem 0 0'; q.parentNode.appendChild(n); }
      n.textContent='Take a breath and ask the cards a question first.'; return;
    }
    if(HEAVY.test(question)){ gentle(); return; }
    s1.hidden=true; s2.hidden=false; result.hidden=true;
    // build a face-down spread that "shuffles" in
    spread.innerHTML='';
    spread.classList.add('shuffling');
    for(var i=0;i<SPREAD;i++){
      var c=document.createElement('button');
      c.className='t-card-back'; c.type='button'; c.setAttribute('aria-label','Pick this card');
      c.style.setProperty('--i',i); c.style.setProperty('--n',SPREAD);
      c.innerHTML='<span>✦</span>';
      c.addEventListener('click',pick);
      spread.appendChild(c);
    }
    setTimeout(function(){ spread.classList.remove('shuffling'); spread.classList.add('fanned'); },700);
    s2.scrollIntoView({behavior:'smooth',block:'center'});
  });

  function pick(e){
    var chosen=e.currentTarget;
    [].slice.call(spread.querySelectorAll('.t-card-back')).forEach(function(b){ if(b!==chosen) b.classList.add('dim'); b.disabled=true; });
    chosen.classList.add('chosen');
    var c=DECK[Math.floor(Math.random()*DECK.length)];
    var question=(q.value||'').trim();
    var qline = question ? '<p class="pull-q">Holding your question, '+esc(question.replace(/[.?!]+$/,''))+'…</p>' : '';
    setTimeout(function(){
      result.hidden=false;
      result.innerHTML='<div class="card reveal t-reveal" style="border-color:var(--gold)">'+
        '<div class="t-face"><span class="t-glyph">'+c.g+'</span></div>'+
        '<p class="eyebrow">Your card</p><h2 class="pull-name">'+c.n+'</h2>'+
        '<p class="t-keys">'+c.k+'</p>'+
        qline+
        '<p class="pull-refl">'+c.r+' '+c.p+'</p>'+
        '<p class="t-forreflection">A single card is a spark, not the whole story. Cherry reads the full picture with you, one to one.</p>'+
        '<div class="t-actions"><a class="btn btn-gold" href="/shop.html">Book a reading with Cherry</a> <button class="btn btn-ghost" id="tAgain" type="button">Pull again</button></div>'+
        (window.CSFunnel?window.CSFunnel.optinHTML('tarot-pull',''):'')+
      '</div>';
      if(window.CSFunnel&&window.CSFunnel.wireOptin) window.CSFunnel.wireOptin(result);
      document.getElementById('tAgain').onclick=reset;
      result.scrollIntoView({behavior:'smooth',block:'center'});
    },520);
  }

  function gentle(){
    s1.hidden=true; s2.hidden=true; result.hidden=false;
    result.innerHTML='<div class="card t-reveal"><p class="eyebrow">A gentle pause</p><h2>Let\'s slow down a moment</h2>'+
      '<p class="pull-refl">That sounds heavy, and it deserves far more than a card. This little tool is only for reflection. For something real and caring, please talk it through with Cherry, or reach a professional who can truly help.</p>'+
      '<a class="btn btn-primary" href="/shop.html">Book a reading with Cherry</a> <button class="btn btn-ghost" id="tAgain" type="button">Start over</button></div>';
    document.getElementById('tAgain').onclick=reset;
  }
  function reset(){ result.hidden=true; s2.hidden=true; s1.hidden=false; if(q)q.value=q.value; s1.scrollIntoView({behavior:'smooth',block:'center'}); }
})();

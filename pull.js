/* Cherry Sage — Free Tarot Card Pull (for reflection only). Deck is always visible and
   shuffleable for fun; drawing an actual card + reading needs a question first. */
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
    {n:"The Devil",g:"⛓",k:"Attachment · release",r:"Notice what quietly holds you.",p:"You have far more freedom here than it wants you to believe. The chain is looser than it looks."},
    {n:"Ace of Wands",g:"△",k:"Wands · a new spark",r:"A fresh burst of inspiration is arriving.",p:"Something in you wants to begin. Follow the spark before you talk yourself out of it."},
    {n:"Two of Wands",g:"△",k:"Wands · looking ahead",r:"You're standing at the edge of a bigger plan.",p:"You have more say in what comes next than it feels like. Decide the direction, then take the step."},
    {n:"Three of Wands",g:"△",k:"Wands · expansion",r:"What you started is starting to move.",p:"The waiting has a purpose. Keep watching the horizon, the returns are on their way."},
    {n:"Four of Wands",g:"△",k:"Wands · celebration",r:"A moment worth marking is here.",p:"Let yourself enjoy this one fully. You built toward it, and it's allowed to feel good."},
    {n:"Five of Wands",g:"△",k:"Wands · friction",r:"Some tension is just noise, not danger.",p:"Not every disagreement needs winning. Notice what's actually at stake before you spend your energy on it."},
    {n:"Six of Wands",g:"△",k:"Wands · recognition",r:"Something you did is being seen.",p:"Let the win land. You don't have to downplay it or explain it away."},
    {n:"Seven of Wands",g:"△",k:"Wands · standing firm",r:"You're allowed to hold your ground.",p:"You've earned the position you're in. Defend it calmly, you don't need to raise your voice to keep it."},
    {n:"Eight of Wands",g:"△",k:"Wands · fast movement",r:"Things are about to move quickly.",p:"News or momentum is closing in. Stay ready, this one doesn't like to wait."},
    {n:"Nine of Wands",g:"△",k:"Wands · quiet resilience",r:"You're closer to done than you feel.",p:"You've carried this further than most would have. One more stretch of steady effort and you're through."},
    {n:"Ten of Wands",g:"△",k:"Wands · carrying too much",r:"You're holding more than your share.",p:"It's alright to set part of this down, or hand it to someone else. Not all of it has to stay on your shoulders."},
    {n:"Page of Wands",g:"△",k:"Wands · eager beginnings",r:"A small, exciting idea wants your attention.",p:"It doesn't have to be fully formed yet. Let yourself get curious about it before you judge it."},
    {n:"Knight of Wands",g:"△",k:"Wands · bold action",r:"You're ready to move before you're fully sure.",p:"That's alright, some things only make sense once you're already in motion. Go, but keep one eye open."},
    {n:"Queen of Wands",g:"△",k:"Wands · warm confidence",r:"Your own warmth is your real strength here.",p:"People are drawn to how sure of yourself you are right now. Let that confidence lead."},
    {n:"King of Wands",g:"△",k:"Wands · steady vision",r:"You already know where this is going.",p:"Lead from that certainty. Others will follow the clarity in you before they follow a plan."},
    {n:"Ace of Cups",g:"❧",k:"Cups · an open heart",r:"Something tender is beginning.",p:"Let yourself feel it fully instead of guarding against it. This one is asking to be received, not managed."},
    {n:"Two of Cups",g:"❧",k:"Cups · real connection",r:"A genuine bond is forming or deepening.",p:"This is mutual, not one-sided. Let it be as easy as it actually feels."},
    {n:"Three of Cups",g:"❧",k:"Cups · shared joy",r:"This is a season for celebrating together.",p:"Whatever you're marking, you don't have to mark it alone. Let the people who care about you in."},
    {n:"Four of Cups",g:"❧",k:"Cups · quiet withdrawal",r:"Something good may be right in front of you, unnoticed.",p:"It's fine to sit with the flatness for now, but look up before you decide nothing is being offered."},
    {n:"Five of Cups",g:"❧",k:"Cups · grief and what's left",r:"You're allowed to grieve what didn't work out.",p:"But turn around when you're ready, there's still something standing that hasn't been touched."},
    {n:"Six of Cups",g:"❧",k:"Cups · looking back gently",r:"Something from your past is worth revisiting.",p:"Not to live there, just to remember what it taught you. Old warmth can still be useful now."},
    {n:"Seven of Cups",g:"❧",k:"Cups · too many options",r:"Not everything glittering here is real.",p:"Slow down before you choose. One of these matters more than the rest, the others are just noise."},
    {n:"Eight of Cups",g:"❧",k:"Cups · walking away",r:"You're allowed to leave something that isn't serving you.",p:"Even if it once meant a lot. Walking toward something truer isn't the same as giving up."},
    {n:"Nine of Cups",g:"❧",k:"Cups · quiet satisfaction",r:"You're closer to content than you're giving yourself credit for.",p:"Let yourself actually enjoy what's already going right, instead of waiting for the next thing."},
    {n:"Ten of Cups",g:"❧",k:"Cups · lasting happiness",r:"A deeper kind of peace is within reach.",p:"This isn't a fleeting high, it's the steady kind. Let yourself trust it."},
    {n:"Page of Cups",g:"❧",k:"Cups · a gentle message",r:"Something tender is trying to reach you.",p:"It might come as a feeling, a message, or an idea. Stay open, it's coming from a good place."},
    {n:"Knight of Cups",g:"❧",k:"Cups · following the heart",r:"Someone, maybe you, is leading with feeling right now.",p:"That's not weakness here, it's honesty. Let the heart have its say."},
    {n:"Queen of Cups",g:"❧",k:"Cups · emotional wisdom",r:"You understand more than you're saying out loud.",p:"Trust that quiet knowing. You read people and situations more clearly than you think."},
    {n:"King of Cups",g:"❧",k:"Cups · calm depth",r:"You can hold big feelings without being swept away by them.",p:"That steadiness is exactly what's needed right now, for yourself or for someone leaning on you."},
    {n:"Ace of Swords",g:"✧",k:"Swords · sudden clarity",r:"A truth is cutting through the confusion.",p:"Whatever just became clear to you, trust it. This is the kind of clarity that doesn't come around often."},
    {n:"Two of Swords",g:"✧",k:"Swords · a stuck decision",r:"You're avoiding a choice by refusing to look at it.",p:"Take the blindfold off, even if the answer is uncomfortable. Staying still isn't actually neutral."},
    {n:"Three of Swords",g:"✧",k:"Swords · honest heartbreak",r:"Something painful is true, and it hurts to admit.",p:"Let yourself feel it rather than around it. This particular pain does ease with time."},
    {n:"Four of Swords",g:"✧",k:"Swords · rest first",r:"You need real rest before the next move.",p:"Nothing is asking you to push through exhaustion right now. Recovery is the productive choice here."},
    {n:"Five of Swords",g:"✧",k:"Swords · a hollow win",r:"Winning this particular argument may cost more than it's worth.",p:"Ask what you actually want out of this before you keep fighting for it."},
    {n:"Six of Swords",g:"✧",k:"Swords · moving toward calmer water",r:"You're leaving a harder chapter behind.",p:"The way forward may feel uncertain, but it's genuinely calmer than where you've been."},
    {n:"Seven of Swords",g:"✧",k:"Swords · watch the angle",r:"Something here isn't fully out in the open.",p:"That includes your own strategy, not just others'. Make sure what you're doing can survive daylight."},
    {n:"Eight of Swords",g:"✧",k:"Swords · a trap made of thought",r:"You're more free to act than it feels like right now.",p:"The restriction is coming from your own mind more than from the situation. Look again."},
    {n:"Nine of Swords",g:"✧",k:"Swords · 3am worry",r:"The fear feels bigger at night than it is in daylight.",p:"Whatever is keeping you up, it usually looks different in the morning. Be gentle with yourself tonight."},
    {n:"Ten of Swords",g:"✧",k:"Swords · rock bottom, then dawn",r:"Something has run its full course and ended.",p:"This is the hardest point of it, which also means it's the end of it. What comes after is genuinely lighter."},
    {n:"Page of Swords",g:"✧",k:"Swords · staying alert",r:"Pay attention, something worth knowing is circling.",p:"Ask the sharp questions. Curiosity serves you better than assumptions right now."},
    {n:"Knight of Swords",g:"✧",k:"Swords · fast and direct",r:"You're moving straight at this, no hesitation.",p:"That directness will get you there quickly. Just make sure you're not outrunning the details."},
    {n:"Queen of Swords",g:"✧",k:"Swords · clear-eyed honesty",r:"You see this situation for exactly what it is.",p:"Trust your own clarity, even if the honest read isn't the comfortable one."},
    {n:"King of Swords",g:"✧",k:"Swords · sound judgment",r:"A clear, fair decision is within your reach.",p:"Set the emotion aside for a moment and look at the facts. The right call is more obvious than it seems."},
    {n:"Ace of Pentacles",g:"◈",k:"Pentacles · a real opportunity",r:"Something solid and promising is being offered.",p:"This one is worth taking seriously. Plant it well and give it time to grow."},
    {n:"Two of Pentacles",g:"◈",k:"Pentacles · keeping balance",r:"You're juggling more than one priority right now.",p:"You can keep both in the air, just don't be afraid to adjust the rhythm when one needs more attention."},
    {n:"Three of Pentacles",g:"◈",k:"Pentacles · working together",r:"This goes better with the right people beside you.",p:"You don't have to carry the whole thing alone. Let collaboration do some of the lifting."},
    {n:"Four of Pentacles",g:"◈",k:"Pentacles · holding tight",r:"You're gripping something out of fear of losing it.",p:"Security matters, but so does breathing room. Check whether you're protecting yourself or just afraid to loosen up."},
    {n:"Five of Pentacles",g:"◈",k:"Pentacles · a harder season",r:"Things have felt tight or lonely lately.",p:"But help is closer than it looks from where you're standing. It's alright to actually ask for it."},
    {n:"Six of Pentacles",g:"◈",k:"Pentacles · give and receive",r:"Support is flowing, in one direction or both.",p:"If you're the one giving, notice what it costs you. If you're receiving, let yourself actually accept it."},
    {n:"Seven of Pentacles",g:"◈",k:"Pentacles · patient investment",r:"What you've planted needs a little more time.",p:"The growth is happening even where you can't see it yet. Don't dig it up to check."},
    {n:"Eight of Pentacles",g:"◈",k:"Pentacles · quiet mastery",r:"Steady, careful effort is paying off.",p:"You're getting genuinely good at this through repetition, not luck. Keep at it."},
    {n:"Nine of Pentacles",g:"◈",k:"Pentacles · earned ease",r:"You built this comfort yourself, so enjoy it.",p:"You don't need anyone's permission to appreciate what your own effort created."},
    {n:"Ten of Pentacles",g:"◈",k:"Pentacles · lasting foundation",r:"Something here is built to outlast this moment.",p:"Whatever you're creating, financially or otherwise, has real staying power. Keep building it with care."},
    {n:"Page of Pentacles",g:"◈",k:"Pentacles · a practical start",r:"A grounded, real opportunity is worth a closer look.",p:"It might not be glamorous, but it's genuinely useful. Give it a real chance."},
    {n:"Knight of Pentacles",g:"◈",k:"Pentacles · steady progress",r:"Slow and consistent is winning here.",p:"You don't need to rush this. Reliable effort is exactly what this moment is asking for."},
    {n:"Queen of Pentacles",g:"◈",k:"Pentacles · grounded care",r:"You know how to make things feel stable for others.",p:"That gift is real. Just make sure some of that care comes back around to you too."},
    {n:"King of Pentacles",g:"◈",k:"Pentacles · quiet abundance",r:"What you've built is more solid than you give it credit for.",p:"You've earned this stability through real work. Trust it, and use it to help others when you can."}
  ];
  var HEAVY=/(suicide|kill myself|self.?harm|dying|death of|cancer|diagnos|pregnan|lawsuit|court|custody|medical|overdose)/i;
  var SPREAD=DECK.length; // the whole deck shuffles and fans out

  // Support multiple copies of this widget on one page (e.g. homepage + its own page),
  // each scoped by a data-scope attribute on a wrapping element, falling back to the
  // original unscoped ids so the existing tarot-pull.html markup keeps working untouched.
  var widgets=document.querySelectorAll('[data-tarot-widget]');
  if(widgets.length===0 && document.getElementById('tShuffle')) widgets=[document.body];

  widgets.forEach(function(scope){ initWidget(scope); });

  function initWidget(scope){
    var q=scope.querySelector('#tQ'),
        spread=scope.querySelector('#tSpread'), result=scope.querySelector('#tResult'),
        shuffleBtn=scope.querySelector('#tShuffle');
    if(!shuffleBtn||!spread) return;

    function esc(s){return (s||'').replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}

    function buildDeck(){
      result.hidden=true;
      spread.hidden=false;
      spread.innerHTML='';
      spread.style.setProperty('--n',SPREAD);
      spread.classList.remove('fanned');
      spread.classList.add('shuffling');
      for(var i=0;i<SPREAD;i++){
        var c=document.createElement('button');
        c.className='t-card-back'; c.type='button'; c.setAttribute('aria-label','Pick this card');
        c.style.setProperty('--i',i); c.style.setProperty('--n',SPREAD);
        c.innerHTML='<span>✦</span>';
        c.addEventListener('click',pick);
        spread.appendChild(c);
      }
      setTimeout(function(){
        spread.classList.remove('shuffling'); spread.classList.add('fanned');
        var scroller=spread.parentNode;
        if(scroller&&scroller.classList.contains('t-spread-scroll')){
          scroller.scrollLeft=(scroller.scrollWidth-scroller.clientWidth)/2;
        }
      },700);
    }

    // Deck is visible and shuffleable right away, no question required for this part.
    buildDeck();
    shuffleBtn.addEventListener('click',buildDeck);

    function pick(e){
      var question=(q&&q.value||'').trim();
      if(!question){
        if(q) q.focus();
        var n=scope.querySelector('#tQNote');
        if(!n){ n=document.createElement('p'); n.id='tQNote'; n.style.cssText='color:var(--cherry);font-size:.9rem;margin:.7rem 0 0;text-align:center'; (q?q.parentNode:spread.parentNode).appendChild(n); }
        n.textContent='Take a breath and ask the cards a question first, then choose your card.';
        return;
      }
      if(HEAVY.test(question)){ gentle(); return; }

      var chosen=e.currentTarget;
      [].slice.call(spread.querySelectorAll('.t-card-back')).forEach(function(b){ if(b!==chosen) b.classList.add('dim'); b.disabled=true; });
      chosen.classList.add('chosen');
      var c=DECK[Math.floor(Math.random()*DECK.length)];
      var qline='<p class="pull-q">Holding your question, '+esc(question.replace(/[.?!]+$/,''))+'…</p>';
      setTimeout(function(){
        spread.hidden=true;
        result.hidden=false;
        result.innerHTML='<div class="card reveal t-reveal" style="border-color:var(--gold)">'+
          '<div class="t-face"><span class="t-glyph">'+c.g+'</span></div>'+
          '<p class="eyebrow">Your card</p><h2 class="pull-name">'+c.n+'</h2>'+
          '<p class="t-keys">'+c.k+'</p>'+
          qline+
          '<p class="pull-refl">'+c.r+' '+c.p+'</p>'+
          '<p class="t-forreflection">A single card is a spark, not the whole story. Cherry reads the full picture with you, one to one.</p>'+
          '<div class="t-actions"><a class="btn btn-gold" href="/shop">Book a reading with Cherry</a> <button class="btn btn-ghost" id="tAgain" type="button">Pull again</button></div>'+
          (window.CSFunnel?window.CSFunnel.optinHTML('tarot-pull',''):'')+
        '</div>';
        if(window.CSFunnel&&window.CSFunnel.wireOptin) window.CSFunnel.wireOptin(result);
        var again=scope.querySelector('#tAgain');
        if(again) again.onclick=function(){ if(q)q.value=''; buildDeck(); };
        result.scrollIntoView({behavior:'smooth',block:'center'});
      },520);
    }

    function gentle(){
      spread.hidden=true;
      result.hidden=false;
      result.innerHTML='<div class="card t-reveal"><p class="eyebrow">A gentle pause</p><h2>Let\'s slow down a moment</h2>'+
        '<p class="pull-refl">That sounds heavy, and it deserves far more than a card. This little tool is only for reflection. For something real and caring, please talk it through with Cherry, or reach a professional who can truly help.</p>'+
        '<a class="btn btn-primary" href="/shop">Book a reading with Cherry</a> <button class="btn btn-ghost" id="tAgain" type="button">Start over</button></div>';
      var again=scope.querySelector('#tAgain');
      if(again) again.onclick=function(){ if(q)q.value=''; buildDeck(); };
    }
  }
})();

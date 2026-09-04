/* Cherry Sage — daily horoscope. Self-contained, varies by sign + day. For fun and reflection. */
(function(){
  var grid=document.getElementById('horoGrid'); if(!grid) return;
  var reading=document.getElementById('horoReading');
  var SIGNS=[["Aries","♈","Mar 21 - Apr 19"],["Taurus","♉","Apr 20 - May 20"],["Gemini","♊","May 21 - Jun 20"],
    ["Cancer","♋","Jun 21 - Jul 22"],["Leo","♌","Jul 23 - Aug 22"],["Virgo","♍","Aug 23 - Sep 22"],
    ["Libra","♎","Sep 23 - Oct 22"],["Scorpio","♏","Oct 23 - Nov 21"],["Sagittarius","♐","Nov 22 - Dec 21"],
    ["Capricorn","♑","Dec 22 - Jan 19"],["Aquarius","♒","Jan 20 - Feb 18"],["Pisces","♓","Feb 19 - Mar 20"]];
  var OPEN=["A gentle shift is in the air for you.","The day carries a quiet, hopeful energy.","Something you have been waiting on begins to move.","Trust the softer voice inside you today.","A small window of clarity is opening.","The pace eases, and you can finally breathe.","Your intuition is especially clear right now.","A door you thought was closed is not fully shut.","There is a calm strength moving with you today.","An old worry starts to loosen its grip."];
  var LOVE=["In matters of the heart, honesty opens more than it closes.","Someone is thinking of you more than they let on.","Let love be simple today, not a puzzle to solve.","A tender conversation could shift everything.","Give yourself the patience you would give a dear friend.","If your heart feels heavy, be gentle with it.","A small act of warmth comes back to you."];
  var WORK=["At work, a steady step forward beats a dramatic leap.","Your effort is being noticed, even if quietly.","Say yes to the opportunity that scares you a little.","Rest is part of the work today, not a detour from it.","Trust your gut on the decision you keep circling.","A practical choice today makes room for a bigger one soon.","Focus on one thing, and it will carry the rest."];
  var CLOSE=["Move gently, and let the day meet you halfway.","Keep your heart open and your expectations kind.","Small steps today, real momentum tomorrow.","You are more ready than you feel.","Whatever comes, you can meet it.","Let the quiet moments guide you."];
  var day='TODAY', current=null, curBtn=null;
  function seed(s){var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
  function step(n){return (Math.imul(n,1103515245)+12345)>>>0;}
  function dateFor(d){var x=new Date();if(d==='YESTERDAY')x.setDate(x.getDate()-1);if(d==='TOMORROW')x.setDate(x.getDate()+1);return x.getFullYear()+'-'+(x.getMonth()+1)+'-'+x.getDate();}
  function gen(sign){var n=seed(sign+dateFor(day));var a=step(n),b=step(a),c=step(b),e=step(c);
    return OPEN[a%OPEN.length]+" "+LOVE[b%LOVE.length]+" "+WORK[c%WORK.length]+" "+CLOSE[e%CLOSE.length];}
  SIGNS.forEach(function(s){
    var btn=document.createElement('button'); btn.className='horo-tile'; btn.type='button'; btn.dataset.sign=s[0];
    btn.innerHTML='<span class="ht-sym">'+s[1]+'</span><span class="ht-name">'+s[0]+'</span><span class="ht-date">'+s[2]+'</span>';
    btn.onclick=function(){ current=s[0]; curBtn=btn; grid.querySelectorAll('.horo-tile').forEach(function(x){x.classList.remove('sel')}); btn.classList.add('sel'); show(); };
    grid.appendChild(btn);
  });
  function show(){ if(!current) return; var lbl=day.charAt(0)+day.slice(1).toLowerCase();
    reading.hidden=false;
    reading.innerHTML='<p class="eyebrow">'+current+' · '+lbl+'</p><h3 class="horo-h">'+current+'</h3><p class="horo-text">'+gen(current)+'</p><a class="btn btn-primary" href="shop.html">Go deeper with Cherry</a>';
    reading.scrollIntoView({behavior:'smooth',block:'center'});
  }
  document.querySelectorAll('.horo-tab').forEach(function(t){ t.onclick=function(){
    day=t.dataset.day; document.querySelectorAll('.horo-tab').forEach(function(x){x.classList.remove('active')}); t.classList.add('active'); show();
  };});
})();

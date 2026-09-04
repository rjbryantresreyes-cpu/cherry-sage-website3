/* Cherry Sage — floating amber embers across every section. Warm on dark, soft gold on light. */
(function(){
  if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function isDark(sec){
    if(sec.classList.contains('section-dark')||sec.classList.contains('cta')) return true;
    // fallback: sample background luminance
    var bg=getComputedStyle(sec).backgroundColor||'';
    var m=bg.match(/rgba?\(([^)]+)\)/);
    if(m){ var p=m[1].split(',').map(parseFloat); var lum=0.2126*p[0]+0.7152*p[1]+0.0722*p[2];
      if(p[3]!==0 && lum<110) return true; }
    return false;
  }

  var secs=[].slice.call(document.querySelectorAll('main section, .hero, .draw-section'));
  // de-dupe
  var seen=[]; secs=secs.filter(function(s){ if(seen.indexOf(s)>-1) return false; seen.push(s); return true; });

  secs.forEach(function(sec){
    var dark=isDark(sec);
    if(getComputedStyle(sec).position==='static') sec.style.position='relative';
    var c=document.createElement('canvas'); c.className='embers-canvas'; c.setAttribute('aria-hidden','true');
    sec.insertBefore(c, sec.firstChild);
    var ctx=c.getContext('2d'), es=[], W=0,H=0, DPR=Math.min(window.devicePixelRatio||1,2), raf, vis=true;
    var fill = dark ? [233,173,74]  : [198,142,52];
    var glow = dark ? [226,140,46]  : [214,158,70];
    var maxA = dark ? 0.72 : 0.52;
    var blur = dark ? 10 : 7;
    var dens = dark ? 26 : 32;   // lower = more embers

    function spawn(seed){ return {x:Math.random()*W, y:seed?Math.random()*H:H+Math.random()*40,
      r:Math.random()*1.8+0.7, vy:-(Math.random()*0.34+0.14), vx:(Math.random()-0.5)*0.22,
      life:0, drift:Math.random()*6.28}; }
    function size(){ W=sec.clientWidth; H=sec.clientHeight; c.width=W*DPR; c.height=H*DPR; ctx.setTransform(DPR,0,0,DPR,0,0); }
    function init(){ size(); var N=Math.max(18,Math.min(64,Math.round((W*H)/(dens*900)))); es=[];
      for(var i=0;i<N;i++){ var e=spawn(false); e.y=Math.random()*H; e.life=Math.random()*120; es.push(e); } }
    function tick(){
      if(!vis){ raf=requestAnimationFrame(tick); return; }
      ctx.clearRect(0,0,W,H);
      for(var i=0;i<es.length;i++){ var e=es[i];
        e.drift+=0.02; e.x+=e.vx+Math.sin(e.drift)*0.12; e.y+=e.vy; e.vx+=(Math.random()-0.5)*0.015; e.life++;
        // ember rises the full height; fades in near the bottom, fades out only near the top
        var a=maxA;
        if(e.life<46) a*=e.life/46;                       // gentle fade-in at birth
        if(e.y < H*0.16) a*=Math.max(0, e.y/(H*0.16));    // fade out as it reaches the top
        if(e.y<-14){ es[i]=spawn(false); continue; }       // respawn only after reaching the top
        ctx.beginPath(); ctx.arc(e.x,e.y,e.r,0,6.2832);
        ctx.fillStyle='rgba('+fill[0]+','+fill[1]+','+fill[2]+','+a.toFixed(3)+')';
        ctx.shadowBlur=blur; ctx.shadowColor='rgba('+glow[0]+','+glow[1]+','+glow[2]+','+(a*0.85).toFixed(3)+')';
        ctx.fill();
      }
      ctx.shadowBlur=0; raf=requestAnimationFrame(tick);
    }
    init(); tick();
    // pause offscreen sections for performance
    if('IntersectionObserver' in window){
      new IntersectionObserver(function(en){ en.forEach(function(x){ vis=x.isIntersecting; }); },{rootMargin:'120px'}).observe(sec);
    }
    var t; window.addEventListener('resize',function(){ clearTimeout(t); t=setTimeout(init,220); });
  });
})();

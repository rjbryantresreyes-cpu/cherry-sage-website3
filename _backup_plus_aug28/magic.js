/* Cherry Sage — ambient magic: gold sparkle burst on click, twinkle on scroll, shimmer on reveal.
   On-palette (gold/amber/oxblood), subtle, respects reduced-motion. */
(function(){
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var GOLD=[201,162,74], AMBER=[226,150,60], CREAM=[247,236,214];

  // full-screen overlay canvas for click bursts + scroll twinkles
  var cv=document.createElement('canvas');
  cv.setAttribute('aria-hidden','true');
  cv.style.cssText='position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999';
  document.addEventListener('DOMContentLoaded',function(){ document.body.appendChild(cv); });
  if(document.body) document.body.appendChild(cv);
  var ctx=cv.getContext('2d'), DPR=Math.min(window.devicePixelRatio||1,2), W=0,H=0, parts=[], running=false;
  function size(){ W=window.innerWidth; H=window.innerHeight; cv.width=W*DPR; cv.height=H*DPR; ctx.setTransform(DPR,0,0,DPR,0,0); }
  size(); window.addEventListener('resize',size);

  function col(base,a){ return 'rgba('+base[0]+','+base[1]+','+base[2]+','+a.toFixed(3)+')'; }
  function star(x,y,r,rot,a,base){
    ctx.save(); ctx.translate(x,y); ctx.rotate(rot);
    ctx.fillStyle=col(base,a); ctx.shadowBlur=8; ctx.shadowColor=col(base,a*0.9);
    ctx.beginPath();
    for(var i=0;i<4;i++){ ctx.rotate(Math.PI/2);
      ctx.moveTo(0,0); ctx.quadraticCurveTo(r*0.28,r*0.28,0,r); ctx.quadraticCurveTo(-r*0.28,r*0.28,0,0);
    }
    ctx.fill(); ctx.restore();
  }
  function loop(){
    ctx.clearRect(0,0,W,H); var alive=false;
    for(var i=0;i<parts.length;i++){ var p=parts[i]; if(p.dead) continue; alive=true;
      p.x+=p.vx; p.y+=p.vy; p.vy+=p.g; p.vx*=0.97; p.rot+=p.vr; p.life++;
      var t=p.life/p.max, a=(t<0.5? t*2 : 1-(t-0.5)*2)*p.a;
      if(t>=1){ p.dead=true; continue; }
      if(p.kind==='dot'){ ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,6.2832);
        ctx.fillStyle=col(p.base,a); ctx.shadowBlur=10; ctx.shadowColor=col(p.base,a); ctx.fill(); }
      else star(p.x,p.y,p.r,p.rot,a,p.base);
    }
    ctx.shadowBlur=0;
    if(alive) requestAnimationFrame(loop); else { running=false; parts=[]; ctx.clearRect(0,0,W,H); }
  }
  function run(){ if(!running){ running=true; requestAnimationFrame(loop); } }

  function burst(x,y,n,spread){
    if(reduce) return;
    n=n||14;
    for(var i=0;i<n;i++){
      var ang=Math.random()*6.2832, sp=Math.random()*(spread||3.4)+0.6;
      var base = Math.random()<0.55?GOLD:(Math.random()<0.6?AMBER:CREAM);
      var starK = Math.random()<0.5;
      parts.push({x:x,y:y, vx:Math.cos(ang)*sp, vy:Math.sin(ang)*sp - 0.6, g:0.045+Math.random()*0.03,
        r:starK?(Math.random()*6+4):(Math.random()*2+1), rot:Math.random()*6.28, vr:(Math.random()-0.5)*0.3,
        life:0, max:38+Math.random()*34, a:0.9, base:base, kind:starK?'star':'dot'});
    }
    run();
  }
  // click anywhere -> sparkle at cursor
  document.addEventListener('click',function(e){
    if(e.clientX==null) return;
    // a touch more sparkle on buttons/links
    var big = e.target && e.target.closest && e.target.closest('a,button,.card,.q-card,.draw-card,.bcard,.pcard');
    burst(e.clientX, e.clientY, big?18:11, big?4:3);
  }, true);

  // scroll -> occasional drifting twinkle near the viewport edges
  var lastY=window.pageYOffset, acc=0;
  window.addEventListener('scroll',function(){
    if(reduce) return;
    var y=window.pageYOffset, d=Math.abs(y-lastY); lastY=y; acc+=d;
    if(acc>140){ acc=0;
      var n=1+Math.floor(Math.random()*2);
      for(var i=0;i<n;i++){
        var x=Math.random()<0.5? Math.random()*W*0.28 : W-Math.random()*W*0.28;
        var yy=Math.random()*H;
        parts.push({x:x,y:yy, vx:(Math.random()-0.5)*0.4, vy:-(Math.random()*0.5+0.2), g:-0.004,
          r:Math.random()*5+3, rot:Math.random()*6.28, vr:(Math.random()-0.5)*0.12,
          life:0, max:60+Math.random()*40, a:0.55, base:Math.random()<0.7?GOLD:CREAM, kind:'star'});
      }
      run();
    }
  }, {passive:true});

  // expose for draw.js (spark on a chosen card center)
  window.CSMagic={
    burst:burst,
    burstEl:function(el){ if(!el||!el.getBoundingClientRect) return; var r=el.getBoundingClientRect();
      burst(r.left+r.width/2, r.top+r.height/2, 22, 4.5); }
  };

  // reveal shimmer: when a .reveal enters, add a one-time gold sweep
  if(!reduce && 'IntersectionObserver' in window){
    var ro=new IntersectionObserver(function(en){ en.forEach(function(e){
      if(e.isIntersecting){ e.target.classList.add('shimmer-once'); ro.unobserve(e.target);
        setTimeout(function(){ e.target.classList.remove('shimmer-once'); }, 1400); }
    }); },{threshold:0.2});
    function watch(){ document.querySelectorAll('.section-head.reveal, .hero-copy.reveal').forEach(function(n){ ro.observe(n); }); }
    if(document.readyState!=='loading') watch(); else document.addEventListener('DOMContentLoaded',watch);
  }
})();

/* Cherry Sage — Website 3 interactions */
(function(){
  // scroll reveal — anything already on screen at load (hero included) shows immediately,
  // never waits on the observer. Below-the-fold content still fades in on scroll.
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, {threshold:0.12, rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.reveal').forEach(function(el,i){
    el.style.transitionDelay=(i%3*0.08)+'s';
    var r=el.getBoundingClientRect();
    if(r.top < window.innerHeight && r.bottom > 0){ el.classList.add('in'); }
    else { io.observe(el); }
  });
  // safety net: never let anything stay invisible for more than a moment, on any device/browser
  setTimeout(function(){
    document.querySelectorAll('.reveal:not(.in)').forEach(function(el){ el.classList.add('in'); });
  }, 1200);

  // mobile nav
  var t=document.getElementById('navToggle'), n=document.getElementById('primaryNav');
  if(t&&n){ t.addEventListener('click',function(){ var o=n.classList.toggle('open'); t.setAttribute('aria-expanded',o); }); }
  n && n.querySelectorAll('a').forEach(function(a){ a.addEventListener('click',function(){ n.classList.remove('open'); }); });

  // Life Path calculator
  var LP = {
    1:"The Leader. Independent, driven, a pioneer. Your path is about standing in your own authority.",
    2:"The Peacemaker. Intuitive, sensitive, diplomatic. Your path is about connection, balance, and partnership.",
    3:"The Communicator. Creative, expressive, joyful. Your path is about sharing your voice and lifting others.",
    4:"The Builder. Grounded, loyal, disciplined. Your path is about creating something stable and lasting.",
    5:"The Free Spirit. Adventurous, adaptable, curious. Your path is about freedom, change, and experience.",
    6:"The Nurturer. Caring, responsible, devoted. Your path is about love, home, and service to others.",
    7:"The Seeker. Introspective, wise, spiritual. Your path is about truth, depth, and inner knowing.",
    8:"The Powerhouse. Ambitious, capable, abundant. Your path is about mastery, and using power with integrity.",
    9:"The Humanitarian. Compassionate, wise, giving. Your path is about healing and serving the greater good.",
    11:"A Master Number. The Intuitive. Heightened insight and spiritual awareness. You are here to inspire.",
    22:"A Master Number. The Master Builder. You can turn big dreams into real things that outlast you.",
    33:"A Master Number. The Master Teacher. Rare and devoted, here to uplift through compassion and truth."
  };
  function reduce(n){ while(n>9 && n!==11 && n!==22 && n!==33){ n=String(n).split('').reduce(function(a,d){return a+ +d;},0); } return n; }
  var f=document.getElementById('lpForm');
  if(f){ f.addEventListener('submit',function(e){
    e.preventDefault();
    var v=document.getElementById('lpDate').value; if(!v) return;
    var digits=v.replace(/[^0-9]/g,'');
    var sum=digits.split('').reduce(function(a,d){return a+ +d;},0);
    var lp=reduce(sum);
    document.getElementById('lpNum').textContent=lp;
    document.getElementById('lpMeaning').textContent=LP[lp]||'';
    document.getElementById('lpResult').hidden=false;
  }); }

  // chat widget (front-end stub for concept)
  var cw=document.getElementById('chatWidget');
  cw && cw.addEventListener('click',function(){ window.location.hash='#book'; });
})();

/* 2026-09-02: scale Bev's fixed 1600x480 page headers to fit width (keeps real text + SVG animations) */
(function(){
  function scaleHeaders(){
    document.querySelectorAll('.cs-hdr').forEach(function(h){
      var inner=h.querySelector('.cs-hdr-in'); if(!inner) return;
      var s=h.clientWidth/1600;
      inner.style.transform='scale('+s+')';
      inner.style.transformOrigin='top left';
      h.style.height=(480*s)+'px';
    });
  }
  window.addEventListener('resize',scaleHeaders,{passive:true});
  window.addEventListener('load',scaleHeaders);
  if(document.readyState!=='loading') scaleHeaders(); else document.addEventListener('DOMContentLoaded',scaleHeaders);
})();

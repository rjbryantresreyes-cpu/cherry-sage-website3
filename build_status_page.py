# -*- coding: utf-8 -*-
# Cherry's private "set your hours" page. She enters her admin key, sets weekly hours + holidays,
# and the site's online status flips automatically. Not linked in nav (private).
import build_site as B

DAYS=[("1","Monday"),("2","Tuesday"),("3","Wednesday"),("4","Thursday"),("5","Friday"),("6","Saturday"),("0","Sunday")]
rows="".join(f'''<tr><td>{name}</td>
  <td><label class="sw"><input type="checkbox" class="day-open" data-d="{d}" checked> Open</label></td>
  <td><input type="time" class="day-from" data-d="{d}" value="09:00"></td>
  <td><input type="time" class="day-to" data-d="{d}" value="21:00"></td></tr>''' for d,name in DAYS)

body=B.hero_banner("Cherry only &middot; private","Set your availability",
  "Set your hours here and your online status updates itself. No more turning it on and off by hand.")+f'''
<section class="section"><div class="wrap" style="max-width:720px">
  <div class="card reveal" style="text-align:left">
    <label style="display:grid;gap:.3rem;margin-bottom:1rem">Your access key
      <input id="adminKey" type="password" placeholder="Enter your key" style="padding:.7rem 1rem;border:1px solid var(--line-strong);border-radius:10px">
    </label>
    <label style="display:flex;align-items:center;gap:.5rem;margin-bottom:1rem"><input type="checkbox" id="always"> Always show me as online (24 hours)</label>
    <label style="display:flex;align-items:center;gap:.5rem;margin-bottom:1rem"><input type="checkbox" id="away"> I'm away / on vacation (show me offline)</label>
    <label style="display:grid;gap:.3rem;margin-bottom:1rem">Time zone
      <input id="tz" type="text" value="America/New_York" style="padding:.7rem 1rem;border:1px solid var(--line-strong);border-radius:10px">
    </label>
    <table class="hours-table"><thead><tr><th>Day</th><th></th><th>From</th><th>To</th></tr></thead><tbody>{rows}</tbody></table>
    <label style="display:grid;gap:.3rem;margin:1rem 0">Holiday / days off (one date per line, YYYY-MM-DD)
      <textarea id="holidays" rows="3" placeholder="2026-12-25" style="padding:.7rem 1rem;border:1px solid var(--line-strong);border-radius:10px;font-family:var(--font-body)"></textarea>
    </label>
    <button id="saveBtn" class="btn btn-primary">Save my hours</button>
    <p id="saveNote" style="margin:.8rem 0 0;color:var(--cherry)" hidden></p>
  </div>
</div></section>
<script>
(function(){{
  function load(){{ fetch('/.netlify/functions/schedule').then(function(r){{return r.json();}}).then(function(s){{
    document.getElementById('always').checked=!!s.always;
    document.getElementById('away').checked=!!s.away;
    document.getElementById('tz').value=s.tz||'America/New_York';
    (s.holidays||[]).length && (document.getElementById('holidays').value=(s.holidays||[]).join('\\n'));
    Object.keys(s.hours||{{}}).forEach(function(d){{
      var h=s.hours[d];
      var open=document.querySelector('.day-open[data-d="'+d+'"]');
      if(!open) return;
      if(!h){{ open.checked=false; }}
      else{{ open.checked=true;
        var f=document.querySelector('.day-from[data-d="'+d+'"]'), t=document.querySelector('.day-to[data-d="'+d+'"]');
        if(f) f.value=String(h[0]).padStart(2,'0')+':00'; if(t) t.value=String(h[1]).padStart(2,'0')+':00';
      }}
    }});
  }}).catch(function(){{}}); }}
  load();
  document.getElementById('saveBtn').addEventListener('click',function(){{
    var note=document.getElementById('saveNote'), key=document.getElementById('adminKey').value.trim();
    if(!key){{ note.hidden=false; note.textContent='Enter your access key first.'; return; }}
    var hours={{}};
    document.querySelectorAll('.day-open').forEach(function(o){{
      var d=o.dataset.d;
      if(!o.checked){{ hours[d]=null; return; }}
      var f=document.querySelector('.day-from[data-d="'+d+'"]').value, t=document.querySelector('.day-to[data-d="'+d+'"]').value;
      hours[d]=[parseInt(f,10), parseInt(t,10)];
    }});
    var holidays=(document.getElementById('holidays').value||'').split('\\n').map(function(x){{return x.trim();}}).filter(Boolean);
    var body={{ key:key, tz:document.getElementById('tz').value.trim(), always:document.getElementById('always').checked, away:document.getElementById('away').checked, hours:hours, holidays:holidays }};
    var btn=document.getElementById('saveBtn'); btn.disabled=true; btn.textContent='Saving...';
    fetch('/.netlify/functions/schedule',{{method:'POST',headers:{{'Content-Type':'application/json'}},body:JSON.stringify(body)}})
      .then(function(r){{return r.json();}}).then(function(res){{
        btn.disabled=false; btn.textContent='Save my hours'; note.hidden=false;
        note.style.color=res.ok?'var(--sage)':'var(--cherry)';
        note.textContent=res.ok?'Saved. Your status will update automatically from now on.':'That key was not accepted. Please check it.';
      }}).catch(function(){{ btn.disabled=false; btn.textContent='Save my hours'; note.hidden=false; note.textContent='Could not save, please try again.'; }});
  }});
}})();
</script>'''+B.cta()

STYLE='<style>.hours-table{width:100%;border-collapse:collapse;font-size:.92rem}.hours-table th,.hours-table td{padding:.45rem .4rem;border-bottom:1px solid var(--line);text-align:left}.hours-table input[type=time]{padding:.35rem .5rem;border:1px solid var(--line-strong);border-radius:8px}.sw{display:inline-flex;align-items:center;gap:.35rem;font-size:.9rem}</style>'
B.page("set-hours.html","Set Your Availability","Private availability settings for Cherry Sage.",body,"",head_extra=STYLE)
print("set-hours.html built")

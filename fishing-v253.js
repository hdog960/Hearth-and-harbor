/* Hearth & Harbor v2.5.3 · Lily Pond Fishing
   Original canvas artwork and real three-stage, touch-friendly fishing activity. */
(function(){'use strict';
const SPECIES=[
 {id:'sunfinch',name:'Sunfinch',season:-1,pattern:'glide',color:'#f2b75d',accent:'#fff0b2',detail:'A gentle golden fish that follows the warm surface.'},
 {id:'reedperch',name:'Reed Perch',season:-1,pattern:'zigzag',color:'#7cbca1',accent:'#e1f3b4',detail:'It slips between pond reeds and turns unexpectedly.'},
 {id:'moonminnow',name:'Moon Minnow',season:-1,pattern:'dart',color:'#8bafd7',accent:'#e6f3fc',detail:'Small, silvery, and quick as moonlight.'},
 {id:'pearlcarp',name:'Pearl Carp',season:-1,pattern:'stubborn',color:'#d8a0c4',accent:'#ffe9f5',detail:'A strong, lovely carp with a very determined pull.'},
 {id:'blossomkoi',name:'Blossom Koi',season:0,pattern:'glide',color:'#e995a0',accent:'#ffe0e6',detail:'Pink spring petals seem to drift along its scales.'},
 {id:'brookdarter',name:'Brook Darter',season:0,pattern:'dart',color:'#7cbece',accent:'#e5fdff',detail:'A spring visitor that darts through new water grass.'},
 {id:'honeygill',name:'Honeygill',season:1,pattern:'surge',color:'#eba454',accent:'#fff3aa',detail:'Summer sunshine seems to follow its bright fins.'},
 {id:'lotusguppy',name:'Lotus Guppy',season:1,pattern:'zigzag',color:'#d38ac5',accent:'#ffe0f9',detail:'A lively little guppy beneath the lotus leaves.'},
 {id:'ambertrout',name:'Amber Trout',season:2,pattern:'surge',color:'#c78964',accent:'#f7d9a7',detail:'Its shimmering autumn scales mirror fallen leaves.'},
 {id:'mossgudgeon',name:'Moss Gudgeon',season:2,pattern:'stubborn',color:'#789b64',accent:'#dce7b2',detail:'A shy fish that rests under the old wooden dock.'},
 {id:'frostsmelt',name:'Frost Smelt',season:3,pattern:'dart',color:'#a4cbe5',accent:'#f3ffff',detail:'A bright speck in the still winter pond.'},
 {id:'snowkoi',name:'Snowfall Koi',season:3,pattern:'glide',color:'#e8e5f6',accent:'#fff9ff',detail:'Soft white fins ripple like fresh snowfall.'}
];
const SEASONS=['Spring','Summer','Autumn','Winter'];
const cap=(v,max)=>Number.isFinite(Number(v))?Math.max(0,Math.min(max,Math.floor(Number(v)))):0;
function safeRecord(raw){
 const r=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{};
 const counts={},best={};
 for(const f of SPECIES){counts[f.id]=cap(r.counts?.[f.id],99);best[f.id]=cap(r.best?.[f.id],3)}
 return {counts,best,total:cap(r.total,9999),donated:[...new Set(Array.isArray(r.donated)?r.donated:[])].filter(id=>SPECIES.some(f=>f.id===id)).slice(0,12),lastDay:cap(r.lastDay,9999),daily:cap(r.daily,99)};
}
function setup(api){
 const {getState,showModal,notify,save,updateUI,task}=api;
 let session=null,frame=0;
 const $=id=>document.getElementById(id);
 const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;',"'":'&#39;'}[c]));
 const fishById=id=>SPECIES.find(f=>f.id===id);
 function record(){const n=getState().nature;n.fishing=safeRecord(n.fishing);return n.fishing}
 const available=()=>SPECIES.filter(f=>f.season<0||f.season===getState().season);
 function cozy(){try{return localStorage.getItem('hh-fish-cozy')==='1'}catch(e){return false}}
 function setCozy(x){try{localStorage.setItem('hh-fish-cozy',x?'1':'0')}catch(e){}}
 function stop(){if(frame)cancelAnimationFrame(frame);frame=0;if(session){session.closed=true;session=null}}
 function bind(){
  const root=$('modalContent');if(!root)return;
  root.querySelectorAll('[data-fish]').forEach(b=>b.onclick=()=>{
   const cmd=b.dataset.fish,id=b.dataset.id;
   if(cmd==='pond')return overview();if(cmd==='start')return start(id);if(cmd==='random'){const list=available();return start(list[Math.floor(Math.random()*list.length)].id)}
   if(cmd==='aquarium')return aquarium();if(cmd==='register')return register(id);
  });
  const toggle=$('fishCozy');if(toggle)toggle.onchange=e=>setCozy(e.target.checked);
 }
 function overview(){
  stop();const s=getState(),r=record(),a=available(),found=SPECIES.filter(f=>r.counts[f.id]>0).length;
  const entries=SPECIES.map(f=>{
   const owned=r.counts[f.id],active=a.includes(f);
   return '<div class="fishing-entry '+(owned?'seen':'')+'"><div class="fishing-entry-icon" style="--fish-hue:'+f.color+'">🐟</div><div><strong>'+esc(owned?f.name:'Mystery fish')+'</strong><small>'+esc(f.season<0?'All seasons':SEASONS[f.season])+' · '+esc(owned?f.detail:'Try the pond when it visits')+'</small><small>'+(owned?'Caught '+owned+' · best '+r.best[f.id]+'★':active?'Swimming in the pond today':'Returns another season')+'</small></div>'+(active?'<button data-fish="start" data-id="'+f.id+'">Cast</button>':'')+'</div>';
  }).join('');
  showModal('fishing-book','<div class="fishing-ui"><div class="fishing-eyebrow">MAPLEWOOD • LILY POND</div><h2>🎣 The Pond Almanac</h2><p>Cast where the fish swims. Hook the bobber when it dips, then gently reel without snapping the line.</p><div class="fishing-stats"><span>🐟 '+found+' / '+SPECIES.length+' species</span><span>🍃 '+SEASONS[s.season]+'</span></div><button class="fishing-primary" data-fish="random">🌊 Cast into Lily Pond</button><div class="fishing-list">'+entries+'</div><button class="fishing-muted" data-fish="aquarium">🏛️ Museum Aquarium Log</button><label class="fishing-relaxed"><input type="checkbox" id="fishCozy" '+(cozy()?'checked':'')+'> Cozy fishing · gentle line and longer bite window</label></div>');
  bind();
 }
 function aquarium(){
  stop();const r=record();
  const rows=SPECIES.map(f=>{const caught=r.counts[f.id]>0,registered=r.donated.includes(f.id);
   return '<div class="fishing-entry '+(registered?'seen':'')+'"><div class="fishing-entry-icon" style="--fish-hue:'+f.color+'">'+(registered?'✦':'◇')+'</div><div><strong>'+esc(caught?f.name:'Unidentified fish')+'</strong><small>'+(registered?esc(f.detail):caught?'A specimen can be documented by the curator.':'Catch this species to add its story to the aquarium log.')+'</small></div>'+(registered?'<span class="fishing-done">✓</span>':caught?'<button data-fish="register" data-id="'+f.id+'">Register</button>':'')+'</div>';
  }).join('');
  showModal('fishing-aquarium','<div class="fishing-ui"><div class="fishing-eyebrow">THE LITTLE MUSEUM</div><h2>🏛️ Pond Life Gallery</h2><p>The curator maintains illustrated records of fish caught at Lily Pond. Recording a specimen never takes away your cooking ingredients.</p><div class="fishing-stats"><span>✦ '+r.donated.length+' / '+SPECIES.length+' recorded</span></div><div class="fishing-list">'+rows+'</div><button data-fish="pond" class="fishing-muted">Back to the Pond Almanac</button></div>');bind();
 }
 function register(id){
  const fish=fishById(id),r=record(),s=getState();
  if(!fish||!r.counts[id]||r.donated.includes(id))return aquarium();
  r.donated.push(id);s.coins=Math.min(999999,s.coins+8);
  save();updateUI();notify(fish.name+' added to the museum log · +8 coins!');aquarium();
 }
 function start(id){
  const f=fishById(id);
  if(!f||!available().includes(f)){notify('That fish visits during another season.');return overview()}
  stop();const relaxed=cozy(),now=performance.now();
  showModal('fishing-game','<div class="fishing-ui fishing-playing"><div class="fishing-eyebrow">THE POND • '+esc(f.name.toUpperCase())+'</div><h2 id="fishingTitle">Cast your line!</h2><p id="fishingHelp">Tap the water to aim your bobber near the moving shadow, then cast.</p><div class="fishing-hud"><span id="fishingStage">1 / 3 · CAST</span><span id="fishingClock">No rush</span></div><div class="fishing-water"><canvas id="fishingCanvas" width="760" height="660" aria-label="Illustrated pond fishing game. Tap water to aim."></canvas></div><div class="fishing-gauge" id="fishingGauge" hidden><div id="fishingTension"></div></div><div class="fishing-action"><button class="fishing-primary" id="fishingDo">🎣 Cast line</button><button class="fishing-muted" id="fishingBack">Back</button></div><p class="fishing-message" id="fishingMessage" aria-live="polite">No penalties for trying again.</p></div>');
  const cv=$('fishingCanvas'),g=cv.getContext('2d');
  const s={fish:f,canvas:cv,g,phase:'cast',relaxed,last:now,time:0,phaseTime:0,aim:185,shadow:185,bobber:185,castQuality:0,hookWindow:0,biteAt:1.2,progress:0,tension:33,holding:false,brokenTime:0,lastTap:0,closed:false,eff:0};
  session=s;cv.style.touchAction='none';
  function coordinate(e){const r=cv.getBoundingClientRect();return Math.max(28,Math.min(352,(e.clientX-r.left)*380/r.width))}
  cv.onpointerdown=e=>{if(s.phase==='cast'){cv.setPointerCapture?.(e.pointerId);s.aim=coordinate(e)}else if(s.phase==='reel'){s.holding=true;cv.setPointerCapture?.(e.pointerId)}};
  cv.onpointermove=e=>{if(s.phase==='cast'&&(e.buttons||e.pointerType==='touch'))s.aim=coordinate(e)};
  cv.onpointerup=e=>{if(s.phase==='cast')s.aim=coordinate(e);else s.holding=false};
  cv.onpointercancel=()=>s.holding=false;
  $('fishingDo').onpointerdown=()=>{if(s.phase==='reel')s.holding=true};
  $('fishingDo').onpointerup=()=>{if(s.phase==='reel')s.holding=false};
  $('fishingDo').onpointercancel=()=>s.holding=false;
  $('fishingDo').onclick=()=>{
   if(s.closed)return;
   if(s.phase==='cast')cast(s);
   else if(s.phase==='bite')hook(s);
   else if(s.phase==='reel'){const now=performance.now();if(now-s.lastTap<135)return;s.lastTap=now;s.tension=Math.min(100,s.tension+4);s.progress=Math.min(100,s.progress+(s.relaxed?4:3));checkReel(s)}
  };
  $('fishingBack').onclick=overview;
  frame=requestAnimationFrame(t=>loop(s,t));
 }
 function cast(s){
  s.castQuality=Math.abs(s.aim-s.shadow);s.bobber=s.aim;
  s.phase='bite';s.phaseTime=0;s.biteAt=.95+s.castQuality/150;s.hookWindow=0;
  $('fishingTitle').textContent='Watch the bobber';
  $('fishingHelp').textContent='The fish will nibble. Tap HOOK when the bobber dips and ripples appear.';
  $('fishingStage').textContent='2 / 3 · WAIT FOR A BITE';
  $('fishingDo').textContent='🎣 Hook!';
  $('fishingClock').textContent=s.relaxed?'Cozy timing':'Wait for the splash';
 }
 function hook(s){
  const good=s.hookWindow>0||s.relaxed&&s.phaseTime>s.biteAt*.75;
  if(!good){$('fishingMessage').textContent='A little early! Watch for the bobber to dip.';return}
  s.phase='reel';s.phaseTime=0;s.tension=30;s.progress=0;s.holding=false;
  $('fishingTitle').textContent='Gently reel it in!';
  $('fishingHelp').textContent='Hold REEL to pull the fish closer. Let go when line tension climbs. Or tap repeatedly.';
  $('fishingStage').textContent='3 / 3 · REEL IN';
  $('fishingDo').textContent='🎣 Reel / hold';
  $('fishingGauge').hidden=false;
  $('fishingClock').textContent='Keep the line safe';
  $('fishingMessage').textContent='Hold, release, and find your rhythm.';
 }
 function checkReel(s){
  if(s.progress>=100){finish(s);return}
  if(!s.relaxed&&s.tension>=99||!s.relaxed&&s.tension>=94&&s.brokenTime>=.43)fail(s,'The fish slipped away when the line grew too tight.');
 }
 function fail(s,msg){
  if(s.closed)return;s.closed=true;if(frame)cancelAnimationFrame(frame);
  showModal('fishing-result','<div class="fishing-ui fishing-result"><div class="fishing-eyebrow">LILY POND</div><h2>🍃 The fish got away</h2><p>'+esc(msg)+' Nothing was lost. Each fish has a different rhythm.</p><div class="fishing-action"><button class="fishing-primary" data-fish="start" data-id="'+s.fish.id+'">Try again</button><button data-fish="pond" class="fishing-muted">Pond Almanac</button></div></div>');bind();
 }
 function finish(s){
  if(s.closed)return;s.closed=true;if(frame)cancelAnimationFrame(frame);
  const st=getState(),r=record(),id=s.fish.id,first=!r.counts[id],stars=s.tension<75?3:2;
  r.counts[id]=Math.min(99,r.counts[id]+1);r.best[id]=Math.max(r.best[id],stars);r.total=Math.min(9999,r.total+1);
  if(r.lastDay!==st.day){r.lastDay=st.day;r.daily=0}
  r.daily=Math.min(99,r.daily+1);
  if(!Array.isArray(st.fish))st.fish=[];st.fish.push(s.fish.name);st.fish=st.fish.slice(-60);
  if(st.cooking?.pantry)st.cooking.pantry.fish=Math.min(99,(st.cooking.pantry.fish||0)+1);
  st.needs.fun=Math.min(100,(st.needs.fun||0)+(first?9:4));
  if(first)st.coins=Math.min(999999,(st.coins||0)+12);
  if(typeof task==='function')task('fish');
  save();updateUI();
  showModal('fishing-result','<div class="fishing-ui fishing-result"><div class="fishing-eyebrow">A LITTLE POND DISCOVERY</div><div class="fishing-trophy" style="--fish-hue:'+s.fish.color+'">🐟</div><h2>✦ '+esc(s.fish.name)+'!</h2><p>'+esc(s.fish.detail)+'</p><div class="fishing-stats"><span>'+stars+' ★ gentle catch</span><span>🍳 +1 fish ingredient</span>'+(first?'<span>🪙 +12 first catch</span>':'')+'</div><p>Your catch is recorded in the Pond Almanac, and a fresh ingredient is in your Hearth Kitchen pantry.</p><div class="fishing-action"><button class="fishing-primary" data-fish="start" data-id="'+id+'">Cast again</button><button class="fishing-muted" data-fish="aquarium">Museum Log</button><button class="fishing-muted" data-fish="pond">Almanac</button></div></div>');bind();
 }
 function loop(s,now){
  if(s!==session||s.closed||!s.canvas.isConnected)return;
  const dt=Math.min(.05,Math.max(0,(now-s.last)/1000));s.last=now;
  if(!document.hidden){
   s.time+=dt;s.phaseTime+=dt;
   const pattern=s.fish.pattern,t=s.time;
   let dx=pattern==='dart'?Math.sin(Math.floor(t*2.1)*2.7)*118:pattern==='zigzag'?Math.sin(t*2.4)*85:pattern==='stubborn'?Math.sin(t*.53)*35:pattern==='surge'?Math.sin(t*1.4)*92:Math.sin(t*.85)*65;
   s.shadow=Math.max(44,Math.min(336,190+dx));
   if(s.phase==='bite'){
    if(s.phaseTime>=s.biteAt){s.hookWindow=Math.max(0,(s.relaxed?3.5:1.25)-(s.phaseTime-s.biteAt));}
    if(!s.relaxed&&s.phaseTime>s.biteAt+1.25)fail(s,'You missed the bobber dipping. Keep an eye on those ripples!');
    if($('fishingClock'))$('fishingClock').textContent=s.hookWindow>0?'💦 BITE!':s.relaxed?'Cozy fishing':'Waiting…';
   }
   if(s.phase==='reel'){
    const surge=pattern==='surge'?Math.max(0,Math.sin(t*3.8))*13:pattern==='dart'?Math.max(0,Math.sin(t*5.2))*9:pattern==='stubborn'?8:3;
    s.tension=Math.max(5,Math.min(100,s.tension+dt*(s.holding?(s.relaxed?14:29)+surge:-(s.relaxed?35:22))));
    if(s.holding)s.progress=Math.min(100,s.progress+dt*(s.relaxed?45:30));
    else s.progress=Math.max(0,s.progress-dt*(pattern==='stubborn'?4:1.8));
    s.brokenTime=s.tension>93?s.brokenTime+dt:Math.max(0,s.brokenTime-dt*3);
    const bar=$('fishingTension');if(bar){bar.style.width=s.tension+'%';bar.style.background=s.tension>78?'#e88183':s.tension>58?'#f2c26c':'#7bc8aa'}
    $('fishingStage').textContent='3 / 3 · '+Math.floor(s.progress)+'% REELED';
    checkReel(s);
   }
   paint(s);
  }
  if(!s.closed)frame=requestAnimationFrame(t=>loop(s,t));
 }
 function oval(c,x,y,rx,ry,color){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill()}
 function paint(s){
  const c=s.g;c.setTransform(2,0,0,2,0,0);
  const sky=c.createLinearGradient(0,0,0,330);sky.addColorStop(0,'#e9f6de');sky.addColorStop(.38,'#b0dfd2');sky.addColorStop(1,'#74bcbc');
  c.fillStyle=sky;c.fillRect(0,0,380,330);
  // Hand-illustrated pond banks, aquatic plants, reflections and a dock.
  oval(c,196,280,264,145,'#d3e6b3');oval(c,186,199,280,143,'#78bdb2');oval(c,189,180,263,128,'#8ad6cc');
  for(let i=0;i<8;i++){const xx=(i*61+14)%370,yy=118+(i*35)%165;oval(c,xx,yy,26,4,'#b5e5d9');oval(c,xx+7,yy-2,10,2,'#e0f9e8')}
  for(let i=0;i<10;i++){let x=(i*73+21)%380,y=210+(i*47)%120;oval(c,x,y,15,8,'#5da58a');oval(c,x-4,y-3,8,4,'#9ed2a0');if(i%3===0)oval(c,x+3,y-8,6,6,'#f4b6d2')}
  c.fillStyle='#b88760';c.fillRect(0,268,104,62);for(let i=0;i<5;i++){c.fillStyle=i%2?'#d3aa76':'#c99b70';c.fillRect(0,273+i*10,104,7)}
  for(let i=0;i<12;i++){const x=(i*57+33)%370,y=30+(i*41)%250;oval(c,x,y,5,2,'#b8eadb')}
  const fishX=s.phase==='cast'?s.shadow:(s.phase==='bite'?s.shadow:s.bobber+34*Math.sin(s.time*2));
  const fishY=s.phase==='reel'?196:173+10*Math.sin(s.time*1.8);
  c.globalAlpha=.48;oval(c,fishX,fishY,29,13,'#347f88');c.beginPath();c.moveTo(fishX+23,fishY);c.lineTo(fishX+38,fishY-12);c.lineTo(fishX+38,fishY+11);c.fill();c.globalAlpha=1;
  const buoyX=s.phase==='cast'?s.aim:s.bobber,buoyY=s.phase==='bite'&&s.hookWindow>0?134:140;
  if(s.phase!=='cast'){
   c.strokeStyle='#f4f9e9';c.lineWidth=2;c.beginPath();c.moveTo(37,273);c.lineTo(buoyX,buoyY);c.stroke();
   oval(c,buoyX,buoyY+7,14,4,'#b4ece6');
   oval(c,buoyX,buoyY,7,10,'#fff9e6');c.fillStyle='#e87683';c.fillRect(buoyX-6,buoyY-5,12,6);
   if(s.hookWindow>0){c.strokeStyle='#fffde4';c.lineWidth=3;for(let i=0;i<3;i++){c.beginPath();c.arc(buoyX,buoyY,18+i*11,0,Math.PI*2);c.stroke()}}
  }else{
   c.strokeStyle='#fff8d3';c.lineWidth=2;c.setLineDash([5,5]);c.beginPath();c.moveTo(s.aim,90);c.lineTo(s.aim,254);c.stroke();c.setLineDash([]);
   oval(c,s.aim,145,8,11,'#e57988');oval(c,s.aim,138,8,5,'#fffae5');
  }
  if(s.phase==='reel'){
   const p=s.progress/100;c.fillStyle='#fff7df';c.fillRect(28,20,324,21);c.fillStyle='#83c2a1';c.fillRect(32,24,316*p,13);
   c.fillStyle='#44665b';c.font='bold 12px system-ui';c.textAlign='center';c.fillText('REEL PROGRESS · '+Math.floor(s.progress)+'%',190,36);
  }else{c.textAlign='center';c.font='bold 13px system-ui';c.fillStyle='#276c70';c.fillText(s.phase==='cast'?'AIM FOR THE MOVING SHADOW':'WAIT FOR THE SPLASH',190,32)}
  c.fillStyle='#3b6c67';c.font='12px system-ui';c.fillText('LILY POND  •  '+s.fish.name,190,316);
 }
 return {overview,aquarium,start,stop,safeRecord,species:SPECIES};
}
window.HearthFishing={setup,safeRecord,species:SPECIES};
})();
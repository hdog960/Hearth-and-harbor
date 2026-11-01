/* Hearth & Harbor — The Meadow Net v2.5.2. Original touch-first bug catching. */
(function(){'use strict';
const insects=[
{id:'butterfly',name:'Honeywing Butterfly',season:-1,mode:'flutter',color:'#efb45a',museum:true},
{id:'ladybird',name:'Clover Ladybird',season:0,mode:'hop',color:'#e97883'},
{id:'dewbug',name:'Dewdrop Beetle',season:0,mode:'scuttle',color:'#53bba8',museum:true},
{id:'cicada',name:'Golden Cicada',season:1,mode:'perch',color:'#d9af62',museum:true},
{id:'dragonfly',name:'Lagoon Dragonfly',season:1,mode:'dart',color:'#57cdd0',museum:true},
{id:'embermoth',name:'Ember Moth',season:2,mode:'flutter',color:'#d68b7c'},
{id:'grasshopper',name:'Amber Grasshopper',season:2,mode:'hop',color:'#94b86e'},
{id:'frostmoth',name:'Frostlace Moth',season:3,mode:'float',color:'#b0c7ec'}];
const seasons=['Spring','Summer','Autumn','Winter'];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function safeRecord(r){r=r&&typeof r==='object'&&!Array.isArray(r)?r:{};return {
counts:Object.fromEntries(insects.map(i=>[i.id,clamp(Math.floor(Number(r.counts?.[i.id])||0),0,99)])),
best:Object.fromEntries(insects.map(i=>[i.id,clamp(Math.floor(Number(r.best?.[i.id])||0),0,3)])),
total:clamp(Math.floor(Number(r.total)||0),0,9999)}}
function setup(api){
 let active=null,raf=0;
 const state=api.getState,modal=api.showModal,save=api.save,notify=api.notify,refresh=api.updateUI;
 const getRecord=()=>{const s=state().nature;s.bugHunt=safeRecord(s.bugHunt);return s.bugHunt};
 const available=()=>insects.filter(i=>i.season<0||i.season===state().season);
 const cozy=()=>{try{return localStorage.getItem('hearth-bug-cozy')==='1'}catch(e){return false}};
 function stop(){if(raf)cancelAnimationFrame(raf);raf=0;if(active)active.done=true;active=null}
 function connect(){
  document.querySelectorAll('#modalContent [data-bug]').forEach(b=>b.onclick=()=>{const v=b.dataset.bug;if(v==='start')start(b.dataset.id);else if(v==='retry')start(active?.insect.id||available()[0].id);else if(v==='random'){const a=available();start(a[Math.floor(Math.random()*a.length)].id)}else journal()});
  const toggle=document.getElementById('bugCozy');if(toggle)toggle.onchange=()=>{try{localStorage.setItem('hearth-bug-cozy',toggle.checked?'1':'0')}catch(e){}};
 }
 function journal(){
  stop();const r=getRecord();const found=insects.filter(i=>r.counts[i.id]>0).length;
  const rows=insects.map(i=>{const known=r.counts[i.id]>0,now=i.season<0||i.season===state().season;
   return '<div class="bug-card"><span class="bug-symbol" style="color:'+i.color+'">'+(i.mode==='scuttle'?'✹':'✿')+'</span><div class="bug-details"><b>'+(known?i.name:'Mystery insect')+'</b><small>'+(i.season<0?'Year-round':seasons[i.season])+' · '+(known?'Caught '+r.counts[i.id]+' · Best '+r.best[i.id]+'★':now?'Look closely in the meadow.':'Returns in another season')+'</small></div>'+(now?'<button data-bug="start" data-id="'+i.id+'">Catch</button>':'')+'</div>'}).join('');
  modal('bug-book','<section class="bug-app"><p class="bug-eyebrow">MAPLEWOOD NATURE CLUB</p><h2>🦋 The Meadow Net</h2><p>Every creature moves differently. Watch its rhythm, aim your net, and swing gently.</p><div class="bug-stats">'+found+' / 8 discovered <span>'+seasons[state().season]+'</span></div><div class="bug-cards">'+rows+'</div><button class="bug-big" data-bug="random">🌷 Explore this season</button><label class="bug-cozy"><input id="bugCozy" type="checkbox" '+(cozy()?'checked':'')+'> Cozy mode — no timer, bigger net</label><p class="bug-note">Original museum insects caught here are also added to your museum satchel for donation.</p></section>');connect()
 }
 function start(id){
  const insect=insects.find(i=>i.id===id);
  if(!insect||!available().includes(insect)){notify('That little creature is not here this season.');return journal()}
  stop();const relaxed=cozy();
  modal('bug-play','<section class="bug-app bug-playing"><p class="bug-eyebrow">A LITTLE MEADOW ADVENTURE</p><h2>'+insect.name+'</h2><p>Follow the insect, then release to swing. Or use the large button.</p><div class="bug-stats"><span id="bugTimer">'+(relaxed?'Cozy mode':'20.0 seconds')+'</span><span id="bugTries">3 swings</span></div><div class="bug-frame"><canvas id="bugArena" width="380" height="350" aria-label="Moving bug and aiming net"></canvas></div><div class="bug-controls"><button id="bugSwing">🕸️ Swing net</button><button class="bug-back" data-bug="book">Back</button></div><p class="bug-note" id="bugMessage">Watch its movement before swinging.</p></section>');
  connect();const canvas=document.getElementById('bugArena'),ctx=canvas.getContext('2d');
  const s={insect,canvas,ctx,relaxed,done:false,t:0,last:performance.now(),time:20,attempts:0,aim:{x:190,y:165},bug:{x:190,y:160},swing:0,dodge:0,seed:Math.random()*4};active=s;canvas.style.touchAction='none';
  function aim(e){const b=canvas.getBoundingClientRect();s.aim={x:clamp((e.clientX-b.left)*380/b.width,24,356),y:clamp((e.clientY-b.top)*350/b.height,26,320)}}
  canvas.onpointerdown=e=>{canvas.setPointerCapture?.(e.pointerId);aim(e)};
  canvas.onpointermove=e=>{if(e.buttons||e.pointerType==='touch')aim(e)};
  canvas.onpointerup=e=>{aim(e);swing(s)};
  document.getElementById('bugSwing').onclick=()=>swing(s);
  raf=requestAnimationFrame(t=>loop(s,t))
 }
 function swing(s){
  if(!s||s.done)return;
  s.attempts++;s.swing=.28;
  const dist=Math.hypot(s.aim.x-s.bug.x,s.aim.y-s.bug.y);
  if(dist<=(s.relaxed?72:48)){caught(s);return}
  s.dodge=.4;document.getElementById('bugMessage').textContent='It dodged! Follow its pattern and try again.';
  if(!s.relaxed&&s.attempts>=3){end(s,false);return}
  if(!s.relaxed)document.getElementById('bugTries').textContent=(3-s.attempts)+' swings left';
 }
 function caught(s){
  s.done=true;const r=getRecord(),st=state(),id=s.insect.id,first=r.counts[id]===0;
  r.counts[id]=Math.min(99,r.counts[id]+1);
  r.best[id]=Math.max(r.best[id],s.attempts===1?3:s.attempts===2?2:1);
  r.total=Math.min(9999,r.total+1);
  if(s.insect.museum)st.nature.found[id]=Math.min(99,(st.nature.found[id]||0)+1);
  st.needs.fun=Math.min(100,(st.needs.fun||0)+(first?7:2));
  if(first)st.coins=Math.min(999999,st.coins+12);
  save();refresh();end(s,true,first);
 }
 function end(s,won,first){
  if(s!==active)return;s.done=true;cancelAnimationFrame(raf);
  const text=won?'You gently caught the '+s.insect.name+'! '+(first?'First discovery: +12 coins and +7 Fun.':'Your journal has been updated.')+(s.insect.museum?' You can donate a specimen at the Little Museum.':''):'The insect slipped away. No coins or catches were lost.';
  modal('bug-result','<section class="bug-app bug-result"><p class="bug-eyebrow">THE MEADOW NET</p><h2>'+(won?'🌼 Lovely catch!':'🍃 Try another swing')+'</h2><div class="bug-result-emblem">'+(won?'✦ 🦋 ✦':'🕸️')+'</div><p>'+text+'</p><div class="bug-controls"><button data-bug="retry">Try again</button><button class="bug-back" data-bug="book">Field Journal</button></div></section>');connect();
 }
 function movement(s){
  const t=s.t,k=s.insect.mode,r=s.seed;let x=190,y=160;
  if(k==='flutter'){x+=75*Math.sin(t*1.35+r)+26*Math.sin(t*3.2);y+=45*Math.sin(t*1.9+r)}
  else if(k==='scuttle'){x+=112*Math.sin(t*.85+r);y=252+14*Math.sin(t*3)}
  else if(k==='perch'){const flight=t%3.7>2.7;x+=flight?63*Math.sin(t*2.3):32*Math.sin(t*.3);y=flight?133+44*Math.sin(t*2.5):202}
  else if(k==='dart'){x+=96*Math.sin(Math.floor(t*1.6)*2.1+r);y+=76*Math.sin(Math.floor(t*1.3)*1.7+r)}
  else if(k==='hop'){x+=90*Math.sin(Math.floor(t*1.2)*1.1+r);y=240-Math.max(0,Math.sin(t*3.7))*56}
  else{x+=83*Math.sin(t*.9+r);y+=44*Math.sin(t*1.1)}
  s.bug.x=clamp(x,40,340);s.bug.y=clamp(y,60,280)
 }
 const ell=(c,x,y,rx,ry,color)=>{c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill()};
 function artwork(s){
  const c=s.ctx,t=s.t,i=s.insect,b=s.bug,a=s.aim;
  const sky=c.createLinearGradient(0,0,0,350);sky.addColorStop(0,'#def4d3');sky.addColorStop(.6,'#97d9a6');sky.addColorStop(1,'#6bbd8d');
  c.fillStyle=sky;c.fillRect(0,0,380,350);
  for(let k=0;k<17;k++){ell(c,10+k*24,54+(k%3)*8,34,26,k%3?'#79bd83':'#8fd1a4')}
  ell(c,190,345,260,89,'#89bc80');ell(c,190,346,184,56,'#e4d7a4');
  for(let k=0;k<12;k++){const x=(k*79+31)%370,y=160+(k*67)%135;
   c.fillStyle='#459f6e';c.fillRect(x,y,3,19);
   for(let j=0;j<5;j++){let angle=j*6.283/5;ell(c,x+Math.cos(angle)*8,y-12+Math.sin(angle)*8,5,5,['#f5b4d0','#ffe6a0','#cdb0ef'][k%3])}
   ell(c,x,y-12,4,4,'#fff0b2')}
  ell(c,b.x,b.y+27,24,5,'#6ca47b');
  c.save();c.translate(b.x,b.y);
  if(['flutter','float','dart'].includes(i.mode)){
   const wing=18+Math.abs(Math.sin(t*12))*7;ell(c,-17,-5,wing,20,i.color);ell(c,17,-5,wing,20,i.color);
   ell(c,-17,-5,10,12,'#f9eac9');ell(c,17,-5,10,12,'#f9eac9');ell(c,0,2,6,22,'#555866')
  }else if(i.mode==='hop'){
   ell(c,0,0,20,12,i.color);ell(c,-13,1,8,7,'#f6ecd0');
   c.strokeStyle='#4f6b5b';c.lineWidth=3;c.beginPath();c.moveTo(-8,7);c.lineTo(-30,27);c.moveTo(9,7);c.lineTo(30,25);c.stroke()
  }else{
   ell(c,0,0,21,24,i.color);ell(c,-7,1,10,16,'#e2edc7');ell(c,7,1,10,16,'#e2edc7');
   c.strokeStyle='#557064';c.lineWidth=2;c.beginPath();c.moveTo(0,-18);c.lineTo(0,20);c.stroke()
  }
  ell(c,-5,-7,2,3,'#fff');ell(c,7,-7,2,3,'#fff');c.restore();
  const radius=s.relaxed?67:46;c.strokeStyle=s.dodge>0?'#f19475':'#fffdf1';c.lineWidth=3;c.setLineDash([8,7]);c.beginPath();c.arc(a.x,a.y,radius,0,6.283);c.stroke();c.setLineDash([]);
  c.strokeStyle='#547c65';c.lineWidth=7;c.beginPath();c.moveTo(a.x+22,a.y+22);c.lineTo(a.x+67,a.y+70);c.stroke();
  c.strokeStyle=s.swing?'#ffda90':'#f5fff2';c.lineWidth=4;c.beginPath();c.arc(a.x,a.y,23,0,6.283);c.stroke();
  c.font='bold 12px system-ui';c.textAlign='center';c.fillStyle='#356852';c.fillText('FOLLOW  •  AIM  •  SWING',190,26)
 }
 function loop(s,now){
  if(active!==s||s.done||!s.canvas.isConnected)return;
  const dt=Math.min(.05,Math.max(0,(now-s.last)/1000));s.last=now;
  if(!document.hidden){s.t+=dt;s.swing=Math.max(0,s.swing-dt);s.dodge=Math.max(0,s.dodge-dt);if(!s.relaxed)s.time=Math.max(0,s.time-dt);movement(s);artwork(s);
   const el=document.getElementById('bugTimer');if(el)el.textContent=s.relaxed?'🍵 Cozy mode':s.time.toFixed(1)+' seconds';
   if(!s.relaxed&&s.time===0){end(s,false);return}}
  raf=requestAnimationFrame(n=>loop(s,n))
 }
 return {journal,stop,safeRecord,insects};
}
window.HearthBugHunt={setup,safeRecord,insects};
})();
/* Hearth & Harbor v2.5.25 — Home & Town Traditions
 * Long-lived 3-act household memories: real home action -> real village
 * commission -> real home action on separate in-game days. Small, permanent
 * décor/comfort rewards. Uses existing save and all existing gameplay.
 */
(function(root){'use strict';
const HOMES=['player','h0','h1','h2','h3','h4','h5'];
const PEOPLE=['player','mabel','rosie','oliver','jun','bea','finn'];
const TRACKS={
 welcome:{title:'The Welcome House',subtitle:'A friendly place with a handmade invitation',
  icon:'🌷',memory:'A Wreath for Everyone',color:'#e3a4b6',
  story:['Make a welcoming space for a real conversation at home.','Help Bea paint a welcome card for someone new.','Tidy the room before guests arrive.'],
  steps:[['home','chat'],['trade','bea'],['home','tidy']]},
 supper:{title:'Sunday at the Table',subtitle:'A kitchen that feeds its neighbors',
  icon:'🥧',memory:'Our Favorite Sunday',color:'#eac38a',
  story:['Enjoy a genuine meal activity inside your home.','Wrap and deliver an actual cooked dish to Oliver.','Make time for a warm conversation at home.'],
  steps:[['home','meal'],['trade','oliver'],['home','chat']]},
 orchard:{title:'Roots by the Window',subtitle:'An inspired household that shares its harvest',
  icon:'🍃',memory:'Little Orchard Days',color:'#9cc2a0',
  story:['Finish a favorite hobby in this household.','Pack a real market delivery for Rosie.','Read a quiet chapter at home to remember the day.'],
  steps:[['home','hobby'],['trade','rosie'],['home','read']]}
};
const KEYS=Object.keys(TRACKS),OWN=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const object=o=>o!==null&&typeof o==='object'&&!Array.isArray(o);
const dayOK=n=>Number.isInteger(n)&&n>=1&&n<=9999;
const bounded=(n,a,b)=>Number.isInteger(n)?Math.min(b,Math.max(a,n)):a;
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fresh=()=>({started:false,stage:0,lastDay:0,completedDay:0,memories:[]});
function clean(raw){
 const v=object(raw)?raw:{},homes={};
 for(const home of HOMES){
  const old=object(v.homes?.[home])?v.homes[home]:{},row={};
  for(const key of KEYS){
   const s=object(old[key])?old[key]:{},done=dayOK(s.completedDay)?s.completedDay:0;
   let stage=bounded(s.stage,0,3);
   const started=s.started===true||stage>0||done>0;
   if(done)stage=3;else if(stage===3)stage=2;
   const stamps=Array.isArray(s.memories)?s.memories.filter(m=>object(m)&&dayOK(m.day)&&PEOPLE.includes(m.actor)&&['home','trade'].includes(m.kind)).slice(0,3)
    .map(m=>({day:m.day,actor:m.actor,kind:m.kind})):[];
   row[key]={started,stage,lastDay:dayOK(s.lastDay)?s.lastDay:0,completedDay:done,memories:stamps};
  }
  homes[home]=row;
 }
 const focus=HOMES.includes(v.focus)?v.focus:'player';
 const daily={};for(const home of HOMES)daily[home]=dayOK(v.daily?.[home])?v.daily[home]:0;
 return {homes,focus,daily};
}
function setup(api){
 const {getState,save,updateUI,notify,showModal,closeModal}=api;
 const state=()=>getState(),record=()=>{
  const s=state();if(!object(s.homeTraditions)||!object(s.homeTraditions.homes)||!HOMES.every(h=>object(s.homeTraditions.homes[h])))s.homeTraditions=clean(s.homeTraditions);
  return s.homeTraditions;
 };
 let viewing='player';
 const owned=(h,key)=>record().homes[h]?.[key]||null;
 const completed=(h,key)=>!!owned(h,key)?.completedDay;
 const comfortBonus=h=>HOMES.includes(h)?KEYS.filter(id=>completed(h,id)).length*3:0;
 const visibleHome=h=>h==='player'?'Your Cottage':api.getHomeLabel?.(h)||'Home '+h.slice(1);
 const completedCount=h=>KEYS.filter(k=>completed(h,k)).length;
 const next=(h,key)=>{
  const s=owned(h,key);if(!s)return '';
  if(s.completedDay)return 'Completed on Day '+s.completedDay+' · permanent framed memory';
  if(!s.started)return 'Not started · begin a household story when you are ready';
  const step=TRACKS[key].steps[s.stage];
  const tip=TRACKS[key].story[s.stage];
  const label=step[0]==='home'?'At this home':step[1]==='bea'?'At Bea’s Art Corner':step[1]==='oliver'?'At Honeybun Café':'At Rosie’s Market';
  return label+': '+tip+(s.lastDay===state().day?' · The next chapter begins tomorrow.':'');
 };
 function board(home=viewing){
  viewing=HOMES.includes(home)?home:'player';
  const rec=record(),focus=rec.focus;
  const tabs=HOMES.map(h=>'<button type="button" data-act="ht-view" data-id="'+h+'" class="'+(h===viewing?'ht-selected':'')+'" aria-pressed="'+(viewing===h)+'">'+esc(visibleHome(h))+'</button>').join('');
  const rows=KEYS.map(id=>{
   const t=TRACKS[id],r=owned(viewing,id),done=r.completedDay>0;
   const step=r.stage;
   const dots=t.steps.map((pair,i)=>'<span class="'+(i<step?'ht-finished':i===step&&r.started?'ht-current':'')+'" aria-label="Chapter '+(i+1)+(i<step?' complete':i===step?' next':' locked')+'">'+(i<step?'✓':i+1)+'</span>').join('');
   return '<article class="ht-story '+(done?'ht-done':'')+'"><div class="ht-story-head"><div class="ht-seal">'+t.icon+'</div><div><small>'+esc(t.memory)+'</small><h3>'+t.title+'</h3><p>'+t.subtitle+'</p></div></div>'+
    '<div class="ht-chapters" role="group" aria-label="'+t.title+' chapters">'+dots+'</div>'+
    '<p class="ht-next">'+(done?'A finished memory hangs on the wall.':next(viewing,id))+'</p>'+
    (done?'<div class="ht-earned">✦ Framed memory · +3 permanent home comfort</div>':!r.started?
     '<button data-act="ht-start" data-id="'+viewing+'|'+id+'">Begin this tradition</button>':
     '<div class="ht-active">Chapter '+(step+1)+' of 3 · '+(focus===viewing?'Town visits credit this home':'Set this home as your town-work focus')+'</div>')+
   '</article>';
  }).join('');
  const recent=KEYS.filter(k=>owned(viewing,k).memories.length).flatMap(id=>owned(viewing,id).memories.map(m=>({id,...m})))
   .sort((a,b)=>b.day-a.day).slice(0,7).map(m=>'<li><span>✦</span> Day '+m.day+' · '+TRACKS[m.id].title+' · '+(m.kind==='trade'?'Village work':'Home routine')+' ('+esc(api.getPersonLabel?.(m.actor)||m.actor)+')</li>').join('');
  showModal('home-traditions','<div class="ht-ui"><div class="ht-eyebrow">HOME & TOWN · GROWING TOGETHER</div><div class="ht-cover"><small>THE LITTLE HOUSEHOLD MEMORY BOOK</small><h2>Home & Town Traditions</h2><p>Make your house part of Maplewood’s story. Finish real Daybook routines and shop commissions on separate in-game days to earn tiny illustrated keepsakes for the walls.</p><div class="ht-comfort">✦ '+completedCount(viewing)+' / 3 memories framed · +'+comfortBonus(viewing)+' home comfort</div></div>'+
   '<div class="ht-tabs" role="group" aria-label="Choose a household">'+tabs+'</div><div class="ht-focus"><strong>Town-work focus: '+esc(visibleHome(focus))+'</strong><small>Only this household receives credit when you complete a village commission.</small>'+
   (focus!==viewing?'<button data-act="ht-focus" data-id="'+viewing+'">Focus village work on '+esc(visibleHome(viewing))+'</button>':'<span>✓ Selected for village work</span>')+'</div>'+
   '<button class="ht-trades-link" data-act="ht-trades">🧺 Visit Village Trades for shop chapters</button><div class="ht-grid">'+rows+'</div><h3>Moments worth remembering</h3><ul class="ht-journal">'+(recent||'<li>Begin a tradition, then complete its first home activity.</li>')+'</ul><p class="ht-help">Home chapters must be completed inside the chosen cottage or residence. Only a new, genuinely completed daily routine or real delivered shop commission counts. One chapter per household each in-game day. Repeated taps or practice runs never advance the book.</p><button class="ht-close" data-act="ht-close">Return to the village</button></div>');
 }
 function focus(h){
  if(!HOMES.includes(h))return board();
  const r=record();
  if(r.focus!==h){r.focus=h;save();updateUI();}
  return board(h);
 }
 function start(h,key){
  if(!HOMES.includes(h)||!OWN(TRACKS,key))return board();
  const r=record(),current=owned(h,key);
  if(!current.started){
   current.started=true;r.focus=h;save();updateUI();
   notify('A new tradition begins at '+visibleHome(h)+'! '+TRACKS[key].story[0]);
  }
  return board(h);
 }
 function advance(h,key,kind,actor,day){
  const r=record(),s=owned(h,key);
  if(!s||!s.started||s.completedDay||s.stage>=3||r.daily[h]===day||s.lastDay>=day)return false;
  const required=TRACKS[key].steps[s.stage];
  if(required[0]!==kind)return false;
  s.stage++;s.lastDay=day;r.daily[h]=day;
  s.memories.push({day,actor,kind});s.memories=s.memories.slice(-3);
  if(s.stage===3)s.completedDay=day;
  // Caller owns the normal action's save and update. Never mint coins/items.
  return {home:h,key,stage:s.stage,finished:!!s.completedDay};
 }
 function recordHome(home,actor,action,first=true,day=state().day){
  if(!first||!HOMES.includes(home)||!PEOPLE.includes(actor)||!dayOK(day)||day!==state().day)return false;
  if(home==='player'?actor!=='player':actor==='player')return false;
  if(!['chat','tidy','meal','hobby','read'].includes(action))return false;
  for(const key of KEYS){
   const s=owned(home,key);
   if(s?.started&&!s.completedDay&&TRACKS[key].steps[s.stage]?.[0]==='home'&&TRACKS[key].steps[s.stage][1]===action){
    const made=advance(home,key,'home',actor,day);
    return made||false;
   }
  }
  return false;
 }
 function recordTrade(id,day=state().day){
  if(!['bea','rosie','oliver'].includes(id)||!dayOK(day)||day!==state().day)return false;
  const home=record().focus;
  for(const key of KEYS){
   const s=owned(home,key);
   if(s?.started&&!s.completedDay&&TRACKS[key].steps[s.stage]?.[0]==='trade'&&TRACKS[key].steps[s.stage][1]===id){
    return advance(home,key,'trade','player',day)||false;
   }
  }
  return false;
 }
 function drawWall(g,home){
  if(!HOMES.includes(home)||!completedCount(home))return;
  const slots={welcome:424,supper:726,orchard:932};
  for(const key of KEYS){
   if(!completed(home,key))continue;
   const x=slots[key],y=159,color=TRACKS[key].color;
   g.save();g.translate(x,y);
   g.fillStyle='#92725b55';g.fillRect(-31,-25,66,64);
   g.fillStyle='#7a5949';g.fillRect(-31,-33,62,64);
   g.fillStyle='#dfae77';g.fillRect(-27,-29,54,56);
   g.fillStyle='#fff2db';g.fillRect(-22,-24,44,46);
   g.fillStyle=color;g.fillRect(-19,-21,38,39);
   if(key==='welcome'){
    g.strokeStyle='#5e9a6e';g.lineWidth=4;g.beginPath();g.arc(0,-3,12,0,Math.PI*2);g.stroke();
    for(let k=0;k<6;k++){
     const a=k*Math.PI/3,cx=Math.cos(a)*13,cy=-3+Math.sin(a)*13;
     g.fillStyle=k%2?'#fce5b9':'#fff2e1';g.beginPath();g.ellipse(cx,cy,5,3,a,0,Math.PI*2);g.fill();
    }
    g.fillStyle='#c27e72';g.beginPath();g.ellipse(0,13,6,3,0,0,Math.PI*2);g.fill();
   }else if(key==='supper'){
    g.fillStyle='#a47b63';g.beginPath();g.ellipse(0,8,15,5,0,0,Math.PI*2);g.fill();
    g.fillStyle='#fff4d5';g.beginPath();g.ellipse(0,0,16,10,0,0,Math.PI*2);g.fill();
    g.fillStyle='#dfae6f';g.beginPath();g.ellipse(0,-3,12,6,0,0,Math.PI*2);g.fill();
    g.fillStyle='#f8e3b7';g.beginPath();g.ellipse(-3,-5,4,2,0,0,Math.PI*2);g.fill();
    g.strokeStyle='#fff4eb';g.lineWidth=2;g.beginPath();g.moveTo(-7,-13);g.quadraticCurveTo(-11,-18,-6,-20);g.moveTo(7,-13);g.quadraticCurveTo(2,-18,7,-20);g.stroke();
   }else{
    g.fillStyle='#9e7954';g.fillRect(-14,7,28,7);
    for(const [cx,cy,col] of [[-10,-3,'#d88e85'],[6,0,'#e2b874'],[4,-11,'#accc88']]){
     g.fillStyle=col;g.beginPath();g.ellipse(cx,cy,9,9,0,0,Math.PI*2);g.fill();
     g.strokeStyle='#537f56';g.lineWidth=2;g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+3,cy-10);g.stroke();
    }
   }
   g.fillStyle='#fff1d4';g.fillRect(-13,22,26,4);
   g.restore();
  }
 }
 function handle(action,arg){
  if(action==='ht-board')return board(HOMES.includes(arg)?arg:viewing);
  if(action==='ht-view')return board(arg);
  if(action==='ht-focus')return focus(arg);
  if(action==='ht-start'){
   const [home,key,...rest]=String(arg||'').split('|');
   if(rest.length)return board();
   return start(home,key);
  }
  if(action==='ht-close')return closeModal();
 }
 return {board,focus,start,recordHome,recordTrade,drawWall,comfortBonus,handle,
  get record(){return record()},get viewing(){return viewing},completed,next,TRACKS};
}
root.HearthHomeTraditions={clean,setup,TRACKS,HOMES,KEYS};
})(window);

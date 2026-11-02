/* Hearth & Harbor v2.6 — The Village Memory Walk
 * Three permanent public exhibits earned from actual home memories and
 * completed EXISTING town improvements, never a paid build or a fake memory.
 * Installing and daily visits require walking to the real town coordinates.
 */
(function(root){'use strict';
const SPOTS=[
 {id:'blossoms',name:'Garden of Little Beginnings',site:'Blossom Promenade',town:'flowers',
  kind:['tradition','corner'],x:625,y:974,walkX:625,walkY:1031,
  icon:'🌷',accent:'#edb3bc',ink:'#b76a81',intro:'The village keeps a little place for the people who made it home.',
  reminder:'Finish the Blossom Promenade and a genuine home tradition or personal corner.'},
 {id:'lanterns',name:'Stories Beneath the Lanterns',site:'Lantern Plaza',town:'lanterns',
  kind:['project'],x:754,y:563,walkX:822,walkY:605,
  icon:'🏮',accent:'#f2d18e',ink:'#ac805b',intro:'Stories of friends helping friends shine on even after sunset.',
  reminder:'Finish Lantern Plaza and a real two-resident roommate project.'},
 {id:'table',name:'The Village Welcome Table',site:"Rosie's Orchard Cart",town:'cart',
  kind:['supper'],x:385,y:911,walkX:450,walkY:971,
  icon:'🍰',accent:'#acc9b0',ink:'#729e81',intro:'A table can hold a memory long after the last plate is cleared.',
  reminder:'Finish Rosie’s Orchard Cart and a genuine home or cottage supper.'}
];
const HOMES=['player','h0','h1','h2','h3','h4','h5'];
const DAY_MAX=9999;
const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const dayOK=n=>Number.isInteger(n)&&n>=1&&n<=DAY_MAX;
const sourceOK=s=>typeof s==='string'&&s.length>=1&&s.length<=90&&/^[a-z0-9:|_-]+$/i.test(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;','\u0027':'&#39;'}[c]));
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
const byId=id=>SPOTS.find(x=>x.id===id);
function clean(raw){
 const s=obj(raw)?raw:{},placed={},visits={},history=[];
 for(const spot of SPOTS){
  const e=s.placed?.[spot.id];
  if(obj(e)&&HOMES.includes(e.home)&&spot.kind.includes(e.kind)&&sourceOK(e.source)&&
   dayOK(e.eventDay)&&dayOK(e.day)&&e.day>=e.eventDay)
   placed[spot.id]={home:e.home,kind:e.kind,source:e.source,eventDay:e.eventDay,day:e.day};
  const v=s.visits?.[spot.id];if(dayOK(v))visits[spot.id]=v;
 }
 if(Array.isArray(s.history))for(const h of s.history.slice(-30)){
  if(!obj(h)||!byId(h.id)||!['install','visit'].includes(h.kind)||!dayOK(h.day))continue;
  if(history.some(x=>x.id===h.id&&x.kind===h.kind&&x.day===h.day))continue;
  history.push({id:h.id,kind:h.kind,day:h.day});
 }
 return {placed,visits,history:history.slice(-18)};
}
function setup(api){
 const state=()=>api.getState();
 const data=()=>{
  const s=state();
  if(!obj(s.memoryWalk)||!obj(s.memoryWalk.placed)||!obj(s.memoryWalk.visits)||!Array.isArray(s.memoryWalk.history))
   s.memoryWalk=clean(s.memoryWalk);
  return s.memoryWalk;
 };
 let arrival=null;
 const proof=spot=>(api.getMemories?.()||[]).filter(e=>
  obj(e)&&HOMES.includes(e.home)&&spot.kind.includes(e.kind)&&
  sourceOK(e.source)&&dayOK(e.day)&&e.day<=state().day).slice(-45);
 const active=spot=>!!data().placed[spot.id];
 const townReady=spot=>(state().stewardship?.phases?.[spot.town]||0)>=2;
 const unlocked=spot=>townReady(spot)&&proof(spot).length>0;
 const installation=spot=>data().placed[spot.id]||null;
 const total=()=>SPOTS.filter(active).length;
 const eventTitle=e=>{
  if(e.kind==='tradition')return 'A tradition worth keeping';
  if(e.kind==='corner')return 'Someone found their favorite place';
  if(e.kind==='project')return 'A project finished together';
  return 'A meal shared around the table';
 };
 const homeName=h=>esc(api.getHomeLabel?.(h)||h);
 function choose(id,home,source){
  const spot=byId(id),matches=spot&&proof(spot).filter(e=>e.home===home&&e.source===source);
  if(!spot||active(spot)||!townReady(spot)||matches?.length!==1)return false;
  // Only moving to the art installation counts; menu selection cannot award it.
  arrival=null;
  api.closeModal?.();
  api.travelTo?.(spot.walkX,spot.walkY,()=>{
   if(!api.isTown?.()||!townReady(spot)||active(spot))return;
   if(!proof(spot).some(e=>e.home===home&&e.source===source))return;
   arrival={id,home,source,day:state().day};
   site(id);
  });
  return true;
 }
 function install(id){
  const spot=byId(id),a=arrival;
  if(!spot||!a||a.id!==id||a.day!==state().day||!api.isTown?.()||active(spot)||!townReady(spot))return false;
  const event=proof(spot).find(e=>e.home===a.home&&e.source===a.source);
  if(!event)return false;
  arrival=null;
  data().placed[id]={home:event.home,source:event.source,kind:event.kind,eventDay:event.day,day:state().day};
  data().history.push({id,kind:'install',day:state().day});data().history=data().history.slice(-18);
  const completed=total()===3;
  if(completed){
   state().needs.fun=clamp((Number.isFinite(state().needs?.fun)?state().needs.fun:0)+6,0,100);
   api.notify?.('✨ The entire Memory Walk is complete. A storybook tree now stands in the village!');
  }else api.notify?.('🌷 '+spot.name+' has become part of the village forever.');
  api.save?.();api.updateUI?.();site(id);
  return true;
 }
 function visit(id){
  const spot=byId(id);
  if(!spot||!active(spot)||!api.isTown?.())return false;
  const e=installation(spot);
  if(data().visits[id]===state().day){site(id);return false}
  data().visits[id]=state().day;
  if(obj(state().needs)){
   state().needs.fun=clamp((Number.isFinite(state().needs.fun)?state().needs.fun:0)+4,0,100);
   state().needs.social=clamp((Number.isFinite(state().needs.social)?state().needs.social:0)+2,0,100);
  }
  data().history.push({id,kind:'visit',day:state().day});data().history=data().history.slice(-18);
  api.save?.();api.updateUI?.();
  api.notify?.('✨ A remembered story brightens your day. +4 Fun · +2 Social.');
  site(id);
  return {id,day:state().day,eventDay:e.eventDay};
 }
 function travel(id){
  const spot=byId(id);if(!spot||!active(spot))return false;
  arrival=null;api.closeModal?.();
  api.travelTo?.(spot.walkX,spot.walkY,()=>visit(id));
  return true;
 }
 function site(id){
  const spot=byId(id);if(!spot)return board();
  const e=installation(spot),selected=arrival?.id===id&&arrival?.day===state().day,ready=townReady(spot);
  api.showModal?.('memory-walk-site','<div class="mw26-book"><div class="mw26-hero"><small>MAPLEWOOD · OUR LIVING STORY</small><h2>'+spot.icon+' '+spot.name+'</h2><p>'+spot.intro+'</p></div>'+
   (e?'<div class="mw26-portrait"><b>'+eventTitle(e)+'</b><p>From '+homeName(e.home)+' · First lived on Day '+e.eventDay+' · Installed on Day '+e.day+'</p>'+
    '<p>'+(data().visits[id]===state().day?'✓ Enjoyed this story today. Come again another day.':'Come close and listen to the memory while you are here.')+'</p></div>'+
    '<button data-act="mw26-travel" data-id="'+id+'">🚶 Visit this exhibit again</button>':
    selected?'<div class="mw26-portrait"><b>Ready to install your true story</b><p>Your walk brought a genuine memory from '+homeName(arrival.home)+'. This permanent public display will honor the original day and home.</p><button data-act="mw26-install" data-id="'+id+'">✦ Add this story to Maplewood</button></div>':
    '<p>'+(!ready?'The public '+spot.site+' must be completed first.':spot.reminder)+'</p>')+
   '<button data-act="mw26-board">Back to the Memory Walk</button></div>');
 }
 function board(){
  const r=data(),cards=SPOTS.map(spot=>{
   const e=installation(spot),good=townReady(spot),possibilities=proof(spot);
   const actions=e?'<button data-act="mw26-travel" data-id="'+spot.id+'">🚶 Walk to the finished exhibit</button>':
    good&&possibilities.length?'<div class="mw26-choices">'+possibilities.slice(-8).reverse().map(ev=>
     '<button data-act="mw26-choose" data-id="'+spot.id+'|'+ev.home+'|'+ev.source+'">🚶 Carry '+eventTitle(ev).toLowerCase()+' · Day '+ev.day+' · '+homeName(ev.home)+'</button>').join('')+'</div>':
    '<p class="mw26-hint">'+spot.reminder+'</p>';
   return '<article class="mw26-card"><div class="mw26-art">'+spot.icon+'</div><div class="mw26-cardbody"><h3>'+spot.name+'</h3><small>'+spot.site+' · '+(e?'✓ Installed':'Awaiting village stories')+'</small><p>'+spot.intro+'</p>'+actions+'</div></article>';
  }).join('');
  api.showModal?.('memory-walk','<section class="mw26-book"><header class="mw26-hero"><small>THE VILLAGE WE GROW · v2.6</small><h2>🌿 The Village Memory Walk</h2>'+
   '<p>Homes make memories. Maplewood shares them. Restore real village places, complete genuine household stories, and walk to three original public displays to preserve what happened here.</p>'+
   '<b>'+total()+'/3 permanent story installations</b></header><div class="mw26-progress"><i style="width:'+(total()/3*100)+'%"></i></div><div class="mw26-grid">'+cards+'</div>'+
   (total()===3?'<p class="mw26-finale">✦ The Village Story Tree now blooms by the town square. Your memories have become part of the place.</p>':'')+
   '<p class="mw26-note">No new currency or construction fees. The original Chronicle story stays in its household; this is a public tribute, not an heirloom transfer or fabricated family connection. You must actually walk to the exhibit before installation. Finished sites provide a small, strictly once-daily +4 Fun and +2 Social when visited. No passive income or repeatable exploits.</p>'+
   '<button data-act="mw26-back">Return to Maplewood</button></section>');
 }
 function handle(action,id){
  if(action==='mw26-board')return board();
  if(action==='mw26-site')return site(id);
  if(action==='mw26-install')return install(id);
  if(action==='mw26-travel')return travel(id);
  if(action==='mw26-choose'){
   const parts=typeof id==='string'?id.split('|'):[],spot=parts.shift(),home=parts.shift(),source=parts.join('|');
   return choose(spot,home,source);
  }
  if(action==='mw26-back'){arrival=null;api.closeModal?.();return true}
  return false;
 }
 function hit(x,y){
  for(const spot of SPOTS)if(active(spot)&&Math.hypot(x-spot.x,(y-(spot.y-44)))<52)return spot;
  return null;
 }
 function draw(g,{season=0,tick=0}={}){
  for(const spot of SPOTS){
   if(!active(spot))continue;
   const e=installation(spot),t=(Number.isFinite(tick)?tick:0),x=spot.x,y=spot.y;
   g.save();g.translate(x,y);
   g.fillStyle='#2f52483c';g.beginPath();g.ellipse(0,8,65,19,0,0,6.283);g.fill();
   // Carved sandstone foundation, bevels and brass memorial plaque.
   g.fillStyle='#876a59';g.fillRect(-47,-15,94,22);
   g.fillStyle='#e1c6a1';g.fillRect(-51,-22,102,16);
   g.fillStyle='#f5e2bc';g.fillRect(-44,-19,88,7);
   g.fillStyle='#85664f';g.fillRect(-33,-106,66,84);
   g.fillStyle='#d6ad81';g.fillRect(-29,-102,58,75);
   g.fillStyle='#fff2d3';g.fillRect(-25,-98,50,61);
   g.fillStyle=spot.accent;g.fillRect(-22,-94,44,49);
   if(spot.id==='blossoms'){
    // Original flower-lattice memorial and a blooming vine.
    g.strokeStyle='#678762';g.lineWidth=3;g.beginPath();g.moveTo(-16,-50);g.quadraticCurveTo(17,-79,-14,-93);g.stroke();
    for(let j=0;j<5;j++){const xx=Math.sin(j*2.4)*13,yy=-53-j*9;
     g.fillStyle=['#f8ebc7','#eab8a5','#f3d389'][j%3];
     for(let k=0;k<4;k++){const a=k*Math.PI/2;g.beginPath();g.ellipse(xx+Math.cos(a)*5,yy+Math.sin(a)*5,4,3,a,0,6.283);g.fill();}
     g.fillStyle='#e4a46d';g.beginPath();g.arc(xx,yy,2,0,6.283);g.fill();
    }
   }else if(spot.id==='lanterns'){
    // Double lantern, gently luminous with real day/night animation.
    g.fillStyle='#b27d5c';g.fillRect(-18,-89,36,5);g.fillRect(-13,-84,4,30);g.fillRect(9,-84,4,30);
    g.fillStyle='#fff5c8';g.fillRect(-17,-80,34,25);g.fillStyle='#e2a476';g.fillRect(-13,-75,26,15);
    g.fillStyle='#fff4ce';g.beginPath();g.arc(0,-65,4+Math.sin(t*2)*.65,0,6.283);g.fill();
    g.fillStyle='#8c6d64';g.fillRect(-19,-55,38,5);
   }else{
    // Table setting: glazed plates, berry tart and embroidered cloth.
    g.fillStyle='#fff0d6';g.fillRect(-20,-78,40,15);g.fillStyle='#a77d68';g.fillRect(-15,-63,30,10);
    g.fillStyle='#fcf2dc';g.beginPath();g.ellipse(0,-78,17,10,0,0,6.283);g.fill();
    g.fillStyle='#d88b8e';g.beginPath();g.ellipse(0,-78,11,6,0,0,6.283);g.fill();
    for(const a of [-8,0,8]){g.fillStyle='#f4d8ae';g.beginPath();g.arc(a,-79,2.5,0,6.283);g.fill()}
   }
   g.fillStyle='#765740';g.fillRect(-18,-40,36,9);
   g.fillStyle='#f9edcf';g.font='bold 8px system-ui';g.textAlign='center';g.fillText('DAY '+e.eventDay,0,-33);
   if(season===3){g.fillStyle='#fbf1e2';g.fillRect(-49,-23,98,3)}
   g.restore();
  }
  if(total()===3){
   // Story Tree appears once all three physically installed exhibits exist.
   const t=Number.isFinite(tick)?tick:0;
   g.save();g.translate(881,1150);
   g.fillStyle='#32554845';g.beginPath();g.ellipse(0,3,69,19,0,0,6.283);g.fill();
   g.fillStyle='#78583f';g.fillRect(-15,-78,30,80);g.fillStyle='#aa7d54';g.fillRect(-7,-74,10,70);
   for(let i=0;i<5;i++){const x=Math.sin(i*2.6)*33,y=-93-i*11;
    g.fillStyle=['#90ba88','#bdd2a5','#78a778'][i%3];g.beginPath();g.ellipse(x,y,43,28,i*.4,0,6.283);g.fill();
   }
   for(let i=0;i<8;i++){const xx=Math.sin(i*2.7+t*.13)*34,yy=-92-(i%3)*18;
    g.fillStyle=['#eab3ad','#f0d393','#c7b6d6'][i%3];g.beginPath();g.arc(xx,yy,4,0,6.283);g.fill();
   }
   g.fillStyle='#f7e6bb';g.fillRect(-48,1,96,19);g.fillStyle='#68826d';g.font='bold 10px system-ui';g.textAlign='center';g.fillText('OUR VILLAGE',0,14);g.restore();
  }
 }
 return {clean,choose,install,visit,travel,site,board,handle,hit,draw,proof,total,unlocked,installation,get data(){return data()}};
}
root.HearthMemoryWalk={setup,clean,SPOTS};
})(window);

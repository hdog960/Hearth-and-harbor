/* Hearth & Harbor v2.5.12 — Rooms With Purpose.
 * Functional furniture combinations and day-limited home bonuses.
 * Runs offline; uses only the existing local save.
 */
(function(root){'use strict';
const ZONES=[
 {id:'reading',name:'Storybook Nook',icon:'📚',need:'fun',amount:6,action:'read',pair:['books','lamp'],
  story:'The lamp makes every page feel a little more magical.',
  tip:'Place a storybook shelf and honey lamp within 220 world units.'},
 {id:'rest',name:'Restful Retreat',icon:'🛏️',need:'energy',amount:8,action:'rest',pair:['bed','rug'],
  story:'Soft textures and a comfortable bed invite a longer, sweeter nap.',
  tip:'Bring a patchwork rug close to a cloud-soft bed.'},
 {id:'gather',name:'Gathering Corner',icon:'💗',need:'social',amount:7,action:'chat',pair:['sofa','flowers'],
  story:'A place to sit and fresh flowers make conversations feel special.',
  tip:'Arrange a peach sofa beside a flower vase.'},
 {id:'creative',name:'Creative Corner',icon:'🎨',need:'fun',amount:7,action:'hobby',pair:['chair','plant'],
  story:'A little greenery makes it easier to relax into a favorite hobby.',
  tip:'Place a wooden chair close to a fern in a pot.'}
];
const IDS=['player','h0','h1','h2','h3','h4','h5'];
const PEOPLE=['player','mabel','rosie','oliver','jun','bea','finn'];
const owns=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const validObj=o=>o&&typeof o==='object'&&!Array.isArray(o);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const zone=id=>ZONES.find(z=>z.id===id);
function clean(raw){
 const src=validObj(raw)?raw:{},focus={},uses={},daily={},unlocks={};
 for(const id of IDS){
  focus[id]=ZONES.some(z=>z.id===src.focus?.[id])?src.focus[id]:(id==='player'?'reading':'gather');
  const count=src.uses?.[id];uses[id]=Number.isInteger(count)?clamp(count,0,9999):0;
  const flags=src.unlocks?.[id];unlocks[id]=flags===true||uses[id]>=3;
 }
 for(const id of PEOPLE){
  const rec=src.daily?.[id];
  const day=Number.isInteger(rec?.day)?clamp(rec.day,0,9999):0;
  const kinds=Array.isArray(rec?.kinds)?[...new Set(rec.kinds.filter(v=>ZONES.some(z=>z.id===v)))].slice(0,4):[];
  daily[id]={day,kinds};
 }
 return {focus,uses,daily,unlocks};
}
function positions(items){
 return (Array.isArray(items)?items:[]).filter(x=>x&&typeof x.kind==='string'&&Number.isFinite(x.x)&&Number.isFinite(x.y??x.z))
 .map(x=>({kind:x.kind,x:x.x,y:x.y??x.z}));
}
function detect(items){
 const list=positions(items);
 return ZONES.map(z=>{
  const left=list.filter(o=>o.kind===z.pair[0]);
  const right=list.filter(o=>o.kind===z.pair[1]);
  let matched=null,dist=Infinity;
  for(const a of left)for(const b of right){
   const d=Math.hypot(a.x-b.x,a.y-b.y);
   if(d<dist){dist=d;matched=[a,b];}
  }
  return {id:z.id,name:z.name,ready:!!matched&&dist<=220,pair:matched,
   distance:matched?Math.round(dist):null};
 });
}
function setup(api){
 const {getState,save,updateUI,notify,showModal,closeModal}=api;
 const state=()=>getState();
 const record=()=>{
  const s=state();
  if(!validObj(s.functionalHomes)||!validObj(s.functionalHomes.daily)||!IDS.every(id=>owns(s.functionalHomes.focus||{},id)))s.functionalHomes=clean(s.functionalHomes);
  return s.functionalHomes;
 };
 const homeItems=(id)=>{
  const s=state();return id==='player'?s.placed||[]:s.residenceProps?.[id]||[];
 };
 const found=id=>detect(homeItems(id));
 const active=(id)=>found(id).filter(x=>x.ready);
 const selected=(id)=>record().focus[id]||'reading';
 const label=id=>id==='player'?'Your cottage':'Residence '+id.slice(1);
 function focusHome(id,pick){
  if(!IDS.includes(id)||!zone(pick))return board(id);
  const r=record();r.focus[id]=pick;save();updateUI();
  notify(zone(pick).icon+' '+zone(pick).name+' is the focus for '+label(id)+'.');
  board(id);
 }
 function reward(actor,homeId,action,needs,once,day){
  if(!once||!PEOPLE.includes(actor)||!IDS.includes(homeId)||!validObj(needs)||!Number.isInteger(day)||day<1||day>9999)return false;
  if((actor==='player'&&homeId!=='player')||(actor!=='player'&&homeId==='player'))return false;
  const options=active(homeId),z=options.find(o=>zone(o.id).action===action);
  if(!z)return false;
  const rec=record(),entry=rec.daily[actor]||{day:0,kinds:[]};
  if(entry.day===day&&entry.kinds.includes(z.id))return false;
  const current=entry.day===day?entry.kinds:[],focus=selected(homeId)===z.id;
  const info=zone(z.id),bonus=info.amount+(focus?3:0);
  needs[info.need]=clamp((Number.isFinite(needs[info.need])?needs[info.need]:0)+bonus,0,100);
  rec.daily[actor]={day,kinds:[...current,z.id].slice(0,4)};
  rec.uses[homeId]=clamp((rec.uses[homeId]||0)+1,0,9999);
  if(rec.uses[homeId]>=3&&!rec.unlocks[homeId]){
   rec.unlocks[homeId]=true;
   notify('🏡 '+label(homeId)+' earned its own hand-painted House Charm!');
  }else notify(info.icon+' '+info.story+' +'+bonus+' '+info.need+'.');
  // The caller persists with its normal action save. No additional payouts or writes.
  return true;
 }
 function board(id='player'){
  const homeId=IDS.includes(id)?id:'player',rec=record(),areas=found(homeId),focus=selected(homeId);
  const cards=areas.map(item=>{
   const z=zone(item.id),sel=focus===z.id;
   return '<article class="hf-zone '+(item.ready?'ready':'locked')+'"><div class="hf-zonehead"><span>'+z.icon+'</span><div><b>'+z.name+'</b><small>'+(item.ready?'✓ Functional space ready':'◇ Not arranged yet')+'</small></div></div><p>'+z.story+'</p><p class="hf-tip">'+(item.ready?'Furniture is placed '+item.distance+' units apart.':z.tip)+'</p><p class="hf-effect">'+z.action+' · +'+z.amount+' '+z.need+' once per resident each game day'+(sel?' · +3 focus bonus':'')+'</p><button data-act="hf-focus" data-id="'+homeId+'|'+z.id+'" aria-pressed="'+sel+'">'+(sel?'★ Selected focus':'Make this room’s focus')+'</button></article>';
  }).join('');
  const houseTabs=IDS.map(h=>'<button data-act="hf-board" data-id="'+h+'" '+(h===homeId?'aria-pressed="true"':'')+'>'+ (h==='player'?'🌼 My Cottage':'🏡 '+h.toUpperCase())+'</button>').join('');
  showModal('functional-home','<div class="hf-ui"><div class="hf-kicker">A HOUSE IS A HOME · v2.5.12</div><h2>🏡 Rooms With Purpose</h2><p>Move furnishings close together to make a true reading nook, relaxing bedroom, gathering corner or creative space. Their bonuses happen only when someone completes a real Daybook activity, not by repeatedly tapping a chair.</p><div class="hf-homes">'+houseTabs+'</div><div class="hf-summary"><b>'+label(homeId)+'</b> · '+areas.filter(x=>x.ready).length+' / 4 spaces ready · '+rec.uses[homeId]+' meaningful uses'+(rec.unlocks[homeId]?' · ✓ House Charm earned':' · House Charm after 3 uses')+'</div><div class="hf-cards">'+cards+'</div><p class="hf-foot">The focus is optional. You may rearrange furniture whenever you like. Furniture purchases still cost only ordinary in-game coins.</p><button class="hf-back" data-act="hf-close">Return to your home</button></div>');
 }
 function inspect(homeId,index){
  if(!IDS.includes(homeId)||!Number.isInteger(index)||index<0||index>50)return;
  const item=homeItems(homeId)[index];if(!item)return;
  const names={bed:'Cloud-soft bed',sofa:'Peach sofa',plant:'Fern in pot',books:'Storybook shelf',
   lamp:'Honey lamp',rug:'Patchwork rug',chair:'Wooden chair',flowers:'Flower vase'};
  if(!owns(names,item.kind))return;
  const activated=active(homeId).filter(z=>zone(z.id).pair.includes(item.kind));
  const useful={bed:'rest',sofa:'chat',plant:'hobby',books:'read',lamp:'read',rug:'rest',chair:'hobby',flowers:'chat'};
  const action=useful[item.kind];
  const isPlayer=homeId==='player',userScene=api.getScene();
  const guided=isPlayer||!!api.getControlledResident();
  showModal('furniture-inspector','<div class="hf-ui"><div class="hf-kicker">A SPECIAL LITTLE CORNER</div><h2>'+names[item.kind]+'</h2><p>Every furnishing contributes to the character of the room. Pair it with a neighboring piece to make this space functional.</p><div class="hf-summary">'+(activated.length?'✓ Helps create: '+activated.map(z=>z.name).join(', '):'Not part of a complete functional corner yet. Open the room guide to find its matching piece.')+'</div><div class="hf-actions">'+(guided&&userScene===(isPlayer?'home':'residence')?'<button data-act="hf-use" data-id="'+action+'">Use through Daybook · '+action+'</button>':'<p>Guide a resident through their Daybook to make use of this furniture.</p>')+'<button data-act="hf-board" data-id="'+homeId+'">See the room guide</button><button data-act="hf-close">Close</button></div></div>');
 }
 function use(action){
  if(!['rest','chat','hobby','read'].includes(action)||!['home','residence'].includes(api.getScene()))return;
  closeModal();
  api.queueAction(action);
 }
 function handle(action,arg){
  if(action==='hf-board')return board(arg);
  if(action==='hf-close')return closeModal();
  if(action==='hf-focus'){const [homeId,pick]=String(arg).split('|');return focusHome(homeId,pick);}
  if(action==='hf-use')return use(arg);
 }
 function draw(g,homeId){
  if(!IDS.includes(homeId))return;
  const rec=record(),zones=found(homeId).filter(x=>x.ready);
  // Small painted station details are anchored to the actual furnished positions.
  g.save();
  for(const z of zones){
   const mid={x:(z.pair[0].x+z.pair[1].x)/2,y:(z.pair[0].y+z.pair[1].y)/2};
   const c=selected(homeId)===z.id?'#e8d19b':'#e4f0cd';
   g.globalAlpha=.78;g.fillStyle=c;g.beginPath();g.ellipse(mid.x,mid.y+13,32,9,0,0,Math.PI*2);g.fill();g.globalAlpha=1;
   g.strokeStyle='#fff2d2';g.lineWidth=2;g.beginPath();g.moveTo(mid.x-15,mid.y+14);g.lineTo(mid.x+15,mid.y+14);g.stroke();
  }
  if(rec.unlocks[homeId]){
   const x=homeId==='player'?770:873,y=homeId==='player'?159:204;
   g.fillStyle='#7d5a48';g.fillRect(x-25,y-24,50,49);g.fillStyle='#d7a978';g.fillRect(x-21,y-20,42,40);
   g.fillStyle='#fff2d9';g.fillRect(x-16,y-15,32,30);
   g.fillStyle='#d78f8e';g.beginPath();g.moveTo(x,y+9);g.lineTo(x-12,y-2);g.lineTo(x-12,y-10);g.lineTo(x,y-17);g.lineTo(x+12,y-10);g.lineTo(x+12,y-2);g.closePath();g.fill();
   g.fillStyle='#f8e4b7';g.fillRect(x-4,y-5,8,13);
  }
  g.restore();
 }
 return {board,handle,reward,inspect,found,active,draw,focusHome,record,homeItems};
}
root.HearthFunctionalHomes={clean,detect,positions,ZONES,setup,IDS,PEOPLE};
})(window);

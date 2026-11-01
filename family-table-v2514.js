/* Hearth & Harbor v2.5.15 — Supper Together (evolving At Our Table)
   Prepared meals become home gatherings with conversation choices and persistent rituals.
   All interactions use actual dishes, existing household residents and an arrival callback.
 */
(function(root){'use strict';
const RECIPES={
 toast:{name:'Cinnamon Toast',icon:'🍞'},salad:{name:'Orchard Fruit Salad',icon:'🍎'},
 soup:{name:'Garden Vegetable Soup',icon:'🥕'},pancakes:{name:'Berry Pancakes',icon:'🥞'},
 eggs:{name:'Sunny Morning Eggs',icon:'🍳'},noodles:{name:'Herb Garden Noodles',icon:'🍜'},
 fishplate:{name:'Harbor Grilled Fish',icon:'🐟'},tart:{name:'Honeybun Berry Tart',icon:'🥧'},
 biscuits:{name:'Honey Cloud Biscuits',icon:'🍪'},jam:{name:'Orchard Apple Jam',icon:'🍯'},
 skewers:{name:'Picnic Garden Skewers',icon:'🥗'},dumplings:{name:'Little Garden Dumplings',icon:'🥟'}
};
const FAVORITES={mabel:'salad',rosie:'jam',oliver:'tart',jun:'dumplings',bea:'skewers',finn:'fishplate'};
const NAMES={mabel:'Mabel',rosie:'Rosie',oliver:'Oliver',jun:'Jun',bea:'Bea',finn:'Finn'};
const HOMES=['player','h0','h1','h2','h3','h4','h5'];
const TOPICS=[
 {id:'remember',title:'📖 Tell a favorite little story',intro:'You trade stories from past seasons and laugh over the smallest details.',
  social:9,fun:5,bond:3,tension:1},
 {id:'celebrate',title:'🌼 Celebrate a tiny achievement',intro:'Everyone finds something kind to say about a neighbor at the table.',
  social:7,fun:10,bond:2,tension:2},
 {id:'dream',title:'🌠 Imagine tomorrow together',intro:'You imagine a cozy tomorrow and make plans for a shared adventure.',
  social:10,fun:7,bond:2,tension:3}
];
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k),valid=o=>o&&typeof o==='object'&&!Array.isArray(o);
const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
const cleanDay=d=>Number.isInteger(d)&&d>=1&&d<=9999?d:0;
const memberNames=ids=>ids.map(x=>NAMES[x]).filter(Boolean);
function clean(raw){
 const src=valid(raw)?raw:{},days={},counts={},memories=[];
 for(const h of HOMES){
  days[h]=cleanDay(src.days?.[h]);
  const n=src.counts?.[h];counts[h]=Number.isInteger(n)?clamp(n,0,9999):0;
 }
 if(Array.isArray(src.memories)){
  for(const r of src.memories.slice(-140)){
   if(!valid(r)||!HOMES.includes(r.home)||!own(RECIPES,r.recipe)||!Number.isInteger(r.quality)||r.quality<1||r.quality>3||!cleanDay(r.day)||!TOPICS.some(t=>t.id===r.topic))continue;
   const guests=Array.isArray(r.guests)?[...new Set(r.guests.filter(id=>own(NAMES,id)))].slice(0,2):[];
   if(r.home==='player'&&guests.length||r.home!=='player'&&!guests.length)continue;
   if(memories.some(m=>m.home===r.home&&m.day===r.day))continue;
   memories.push({home:r.home,day:r.day,recipe:r.recipe,quality:r.quality,topic:r.topic,guests});
  }
 }
 return {days,counts,memories:memories.slice(-40)};
}
function setup(api){
 const {getState,save,updateUI,notify,showModal,closeModal,getScene,getHome,getMembers,walkTo}=api;
 const state=()=>getState();
 const store=()=>{
  const s=state();
  if(!valid(s.familyTable)||!valid(s.familyTable.days)||!valid(s.familyTable.counts)||!Array.isArray(s.familyTable.memories))s.familyTable=clean(s.familyTable);
  return s.familyTable;
 };
 const current=()=>{
  const scene=getScene();
  if(scene!=='residence'&&scene!=='home')return null;
  const home=scene==='home'?'player':getHome();
  return HOMES.includes(home)?home:null;
 };
 const members=()=>current()==='player'?[]:[...new Set(getMembers().filter(id=>own(NAMES,id)))].slice(0,2);
 const label=home=>home==='player'?"Poppy's Cottage":'Neighbor Household '+home.slice(1);
 const dishes=()=>{
  const list=state().cooking?.dishes;
  return Array.isArray(list)?list:[];
 };
 const eligible=(d)=>valid(d)&&own(RECIPES,d.id)&&Number.isInteger(d.quality)&&d.quality>=1&&d.quality<=3;
 const served=h=>store().days[h]===state().day;
 let pending=null, gathering=null;
 const LINENS={sage:'🌿 Clover-green linen',rose:'🌷 Rosewater linen',honey:'🍯 Golden-honey linen'};
 const seats=guests=>['Poppy',...memberNames(guests)];
 function memories(){
  const list=store().memories.slice().reverse().slice(0,12);
  return '<h3>Little dinners, lovingly remembered</h3><div class="ft-history">'+(list.map(r=>{
   const t=TOPICS.find(x=>x.id===r.topic);
   return '<div class="ft-memory"><span>'+RECIPES[r.recipe].icon+'</span><div><b>'+RECIPES[r.recipe].name+' · '+('★'.repeat(r.quality))+'</b><small>'+label(r.home)+' · Day '+r.day+(r.guests.length?' · '+memberNames(r.guests).join(' & '):' · A quiet night in')+'</small><small>'+t.title+'</small></div></div>';
  }).join('')||'<p>Your first shared supper is waiting to become a memory.</p>')+'</div>';
 }
 function board(){
  pending=null;
  const h=current(),r=store(),list=dishes(),m=members();
  const active=h!==null,ready=active&&(h==='player'||m.length>0),today=ready&&served(h);
  const plates=list.map((d,i)=>eligible(d)?'<div class="ft-plate"><span>'+RECIPES[d.id].icon+'</span><div><b>'+RECIPES[d.id].name+'</b><small>'+('★'.repeat(d.quality))+' quality · already cooked in Hearth Kitchen</small></div><button data-act="ft-pick" data-id="'+i+'" '+(!ready||today?'disabled':'')+'>'+(today?'Enjoyed today':'Serve')+'</button></div>':'').join('');
  showModal('family-table','<div class="ft-ui"><div class="ft-eyebrow">HEARTH & HARBOR · FAMILY TRADITIONS</div><h2>🍽️ At Our Table</h2><p>Bring something you cooked yourself, share a little story, and make an ordinary evening into a memory. One plate serves the whole table. No extra grocery purchases or cooking shortcuts.</p><div class="ft-banner">'+(!active?'Visit your cottage or one of Maplewood’s homes to gather at a table.':!ready?'This household is empty. Move a neighbor in before hosting a dinner.':today?'💌 This home has already shared its special dinner today. Come back tomorrow.':h==='player'?'🌷 A quiet supper in your own cottage · write down a small memory.':'💗 Supper with '+memberNames(m).join(' & ')+' · each resident has their own favorite dish.')+'</div>'+ (active?'<div class="ft-milestone">'+label(h)+' · '+r.counts[h]+' dinners hosted'+(r.counts[h]>=3?' · ✨ A family-table keepsake earned':' · an in-world keepsake after 3 dinners')+'</div>':'')+'<h3>Choose a prepared dish</h3>'+(plates||'<p class="ft-empty">Your cooked-meal shelf is empty. Prepare a dish in Hearth Kitchen before hosting.</p>')+'<div class="ft-options"><button data-act="ft-kitchen">🍳 Open Hearth Kitchen</button><button data-act="ft-close">Back to the village</button></div>'+memories()+'</div>');
 }
 function pick(index){
  const h=current(),m=members(),st=state(),d=dishes()[index];
  if(!Number.isInteger(index)||index<0||index>=30||!h||!eligible(d)||(h!=='player'&&!m.length)||served(h))return board();
  pending={home:h,day:st.day,index,recipe:d.id,quality:d.quality,guests:m};
  const favorite=memberNames(m.filter(id=>FAVORITES[id]===d.id));
  showModal('family-table-choice','<div class="ft-ui"><div class="ft-eyebrow">SET A PLACE FOR EVERYONE</div><h2>'+RECIPES[d.id].icon+' '+RECIPES[d.id].name+'</h2><p>'+('★'.repeat(d.quality))+' · '+(m.length?'Made to share with '+memberNames(m).join(' & '):'A little moment of peace at home')+'.</p>'+(favorite.length?'<div class="ft-banner">💗 '+favorite.join(' & ')+' will be especially delighted — it’s a favorite dish!</div>':'')+'<h3>What shall we talk about?</h3><p>Each choice brings a different kind of joy. You will walk to the dining area before the meal is served.</p><div class="ft-topics">'+TOPICS.map(t=>'<button data-act="ft-topic" data-id="'+t.id+'">'+t.title+'</button>').join('')+'</div><button class="ft-back" data-act="ft-board">Choose another dish</button></div>');
 }
 function start(topic){
  if(!pending||!TOPICS.some(t=>t.id===topic))return board();
  const p=pending;
  if(current()!==p.home||state().day!==p.day||served(p.home))return board();
  pending={...p,topic,stage:'walking',places:[],linen:'sage',candle:false};
  closeModal();
  // Walk and arrive first; do not spend a single ingredient until the actual setting is complete.
  walkTo(p.home==='player'?{x:725,y:391}:{x:738,y:393},()=>arrive());
 }
 function validPending(p){
  if(!p||current()!==p.home||state().day!==p.day||served(p.home))return false;
  if(members().join('|')!==p.guests.join('|'))return false;
  const d=dishes()[p.index];
  return eligible(d)&&d.id===p.recipe&&d.quality===p.quality;
 }
 function arrive(){
  if(!pending||pending.stage!=='walking')return false;
  if(!validPending(pending)){pending=null;notify('Dinner plans changed. Your cooked meal is still safe.');return false}
  pending.stage='setting';showSetting();return true;
 }
 function showSetting(){
  if(!pending||pending.stage!=='setting')return false;
  const p=pending,who=seats(p.guests),complete=p.places.length===who.length;
  const host=who.length===1?'yourself':who.join(' · ');
  const renderPlace=(person,i)=>'<button class="ft-seat '+(p.places.includes(i)?'is-set':'')+'" data-act="ft-place" data-id="'+i+'" aria-pressed="'+p.places.includes(i)+'"><span class="ft-seat-dish">'+(p.places.includes(i)?RECIPES[p.recipe].icon:'○')+'</span><b>'+person+'</b><small>'+(p.places.includes(i)?'✓ Place ready':'Tap to set this place')+'</small></button>';
  showModal('family-table-setting','<div class="ft-ui ft-setting"><div class="ft-eyebrow">A HANDS-ON LITTLE MOMENT</div><h2>🍽️ Set the supper table</h2><p>You have arrived. Make a cozy place for '+host+' before serving <b>'+RECIPES[p.recipe].name+'</b>. Nothing is consumed until you finish setting every place.</p><div class="ft-linen" role="group" aria-label="Choose table linen">'+Object.entries(LINENS).map(([id,label])=>'<button data-act="ft-linen" data-id="'+id+'" aria-pressed="'+(p.linen===id)+'">'+label+'</button>').join('')+'</div><div class="ft-seating ft-'+p.linen+'"><div class="ft-table-center"><span>✦</span> '+RECIPES[p.recipe].icon+' <span>✦</span></div><div class="ft-seats">'+who.map(renderPlace).join('')+'</div></div><button class="ft-candle" data-act="ft-candle" aria-pressed="'+p.candle+'">'+(p.candle?'🕯️ Candle glowing · tap to put it out':'🕯️ Light a little candle')+'</button><p class="ft-setting-progress">'+p.places.length+'/'+who.length+' places set '+(complete?'· Ready to share!':'· Tap each empty plate')+'</p><button class="ft-main" data-act="ft-serve" '+(complete?'':'disabled')+'>🍲 Serve the supper</button><button class="ft-back" data-act="ft-abandon">Leave the table (keep your meal)</button></div>');
  return true;
 }
 function setPlace(i){
  if(!pending||pending.stage!=='setting'||!validPending(pending))return false;
  if(!Number.isInteger(i)||i<0||i>=seats(pending.guests).length)return false;
  if(!pending.places.includes(i))pending.places.push(i);
  return showSetting();
 }
 function linen(id){if(!pending||pending.stage!=='setting'||!Object.prototype.hasOwnProperty.call(LINENS,id))return false;pending.linen=id;return showSetting();}
 function candle(){if(!pending||pending.stage!=='setting')return false;pending.candle=!pending.candle;return showSetting();}
 function abandon(){pending=null;closeModal();notify('Your prepared dish is still safely on the shelf.');}

 function finish(){
  const p=pending;
  if(!p||p.stage!=='setting'||p.places.length!==seats(p.guests).length||!validPending(p))return false;
  const h=current(),now=state(),r=store(),m=members();
  if(!h||h!==p.home||now.day!==p.day||served(h)||h!=='player'&&!m.length){pending=null;return false;}
  if(m.join('|')!==p.guests.join('|')){pending=null;notify('The household changed before dinner. Choose another time.');return false;}
  const list=dishes(),d=list[p.index];
  if(!eligible(d)||d.id!==p.recipe||d.quality!==p.quality){pending=null;notify('That cooked dish is no longer on the shelf.');return false;}
  const topic=TOPICS.find(t=>t.id===p.topic);
  if(!topic){pending=null;return false;}
  // Mark the day before the reward; do not allow another callback to serve twice.
  list.splice(p.index,1);
  r.days[h]=now.day;r.counts[h]=clamp((r.counts[h]||0)+1,0,9999);
  const favorite=[];
  now.needs.hunger=clamp((now.needs.hunger||0)+16+d.quality*5,0,100);
  now.needs.fun=clamp((now.needs.fun||0)+topic.fun,0,100);
  now.needs.social=clamp((now.needs.social||0)+(m.length?topic.social:2),0,100);
  if(!m.length)now.needs.fun=clamp(now.needs.fun+4,0,100);
  for(const id of m){
   const rec=now.residentLife?.[id];
   if(rec?.needs){
    rec.needs.food=clamp((rec.needs.food||0)+20+d.quality*5,0,100);
    rec.needs.social=clamp((rec.needs.social||0)+topic.social+(FAVORITES[id]===d.id?4:0),0,100);
    rec.needs.fun=clamp((rec.needs.fun||0)+Math.ceil(topic.fun/2),0,100);
   }
   if(FAVORITES[id]===d.id)favorite.push(id);
   now.relations[id]=clamp((now.relations[id]||0)+2+(FAVORITES[id]===d.id?2:0),0,100);
  }
  if(m.length===2){
   const pair=m.slice().sort().join('|');
   now.townBonds[pair]=clamp((now.townBonds[pair]||0)+topic.bond,0,100);
   now.townTensions[pair]=clamp((now.townTensions[pair]||0)-topic.tension,0,100);
  }
  if(h==='player')api.completeHomeMeal();
  r.memories.push({home:h,day:now.day,recipe:d.id,quality:d.quality,topic:topic.id,guests:m});
  r.memories=r.memories.slice(-40);
  gathering={home:h,day:now.day,guests:m,topic:topic.id,recipe:d.id,linen:p.linen,candle:p.candle,elapsed:0,duration:26};
  if(typeof api.onDinnerStart==='function'){
   const starts=api.onDinnerStart(m);
   gathering.starts=Array.isArray(starts)?starts.filter(v=>v&&m.includes(v.id)&&Number.isFinite(v.x)&&Number.isFinite(v.y)):[];
  }
  pending=null;save();updateUI();
  showModal('family-table-result','<div class="ft-ui"><div class="ft-eyebrow">THE LITTLE MOMENTS ARE THE BIG ONES</div><h2>🍽️ An evening to remember</h2><div class="ft-platter">'+RECIPES[d.id].icon+' <span>'+RECIPES[d.id].name+'</span></div><p class="ft-story">'+topic.intro+'</p><div class="ft-banner">'+(m.length?'💗 '+memberNames(m).join(' & ')+' shared dinner. ':'🌷 A peaceful supper at home. ')+(favorite.length?'Favorite dish for '+memberNames(favorite).join(' & ')+'! ':'')+'Your homemade meal restored needs and created a lasting memory.</div>'+(r.counts[h]===3?'<p>✨ Three suppers together! A new family-table keepsake now appears inside this home.</p>':'')+'<button class="ft-main" data-act="ft-board">Open family table scrapbook</button><button class="ft-back" data-act="ft-close">Return to the home</button></div>');
  notify('A new household dinner memory is saved! 💌');
  return true;
 }
 function handle(action,id){
  if(action==='ft-board')return board();
  if(action==='ft-pick')return pick(Number(id));
  if(action==='ft-topic')return start(id);
  if(action==='ft-place')return setPlace(Number(id));
  if(action==='ft-linen')return linen(id);
  if(action==='ft-candle')return candle();
  if(action==='ft-serve')return finish();
  if(action==='ft-abandon')return abandon();
  if(action==='ft-close'){pending=null;return closeModal();}
  if(action==='ft-kitchen'){pending=null;return api.openKitchen();}
 }
 function gatheringActive(home=current()){
  return !!(gathering&&home===gathering.home&&state().day===gathering.day&&gathering.elapsed<gathering.duration&&members().join('|')===gathering.guests.join('|'));
 }
 function update(dt){
  if(!gathering)return;
  if(!gatheringActive()){gathering=null;return;}
  if(typeof api.isModalOpen==='function'&&api.isModalOpen())return;
  if(!Number.isFinite(dt)||dt<=0)return;
  gathering.elapsed+=Math.min(.1,dt);
  if(gathering.elapsed>=gathering.duration){
   if(typeof api.onDinnerEnd==='function')api.onDinnerEnd(gathering.guests);
   gathering=null;
  }
 }
 function dinnerPose(id,home=current(),tick=0){
  if(!gatheringActive(home))return null;
  const index=gathering.guests.indexOf(id);
  if(index<0)return null;
  const targetX=index===0?602:795,targetY=515+(index%2)*17;
  const start=gathering.starts?.find(v=>v.id===id);
  const walk=Math.min(1,gathering.elapsed/4);
  const ease=walk*walk*(3-2*walk);
  const x=start?start.x+(targetX-start.x)*ease:targetX,y=start?start.y+(targetY-start.y)*ease:targetY;
  return {x,y,dir:'front',moving:!!start&&walk<1,expression:'happy',act:gathering.topic==='celebrate'?'✨':gathering.topic==='dream'?'🌟':'💗',
   phase:'supper',action:'meal',progress:Math.min(1,gathering.elapsed/gathering.duration),bob:Math.sin(tick*3.3+index)*2};
 }
 function drawFront(g,{home=current(),tick=0}={}){
  if(!gatheringActive(home))return false;
  const x=690,y=423;
  g.save();g.fillStyle='#fff7dc';g.globalAlpha=.75;
  for(let i=0;i<gathering.guests.length+1;i++){
   const a=i*1.6+tick*2.6;
   g.beginPath();g.ellipse(x-28+i*28,y-35+Math.sin(a)*4,3,6,0,0,Math.PI*2);g.fill();
  }
  g.globalAlpha=1;g.fillStyle=gathering.linen==='honey'?'#f1d69e':gathering.linen==='rose'?'#f3c7d5':'#c4dcc4';g.fillRect(x-60,y-10,120,6);
  // Individual laid napkins and silverware; visible above the original pixel characters.
  const count=gathering.guests.length+1;
  for(let i=0;i<count;i++){
   const nx=x-(count-1)*27+i*54,ny=y+7;
   g.fillStyle=gathering.linen==='honey'?'#e5b878':gathering.linen==='rose'?'#e7a8b9':'#95b69b';
   g.fillRect(nx-20,ny,15,12);
   g.fillStyle='#fff9e9';g.fillRect(nx-18,ny+2,11,8);
   g.fillStyle='#b7bfc1';g.fillRect(nx+11,ny-2,3,21);
   g.fillRect(nx+17,ny-1,2,15);
  }
  if(gathering.candle){g.fillStyle='#ffe5a2';g.beginPath();g.ellipse(x,y-49+Math.sin(tick*6)*3,5,9,0,0,Math.PI*2);g.fill();
   g.fillStyle='#ecb68c';g.fillRect(x-3,y-44,6,18);}
  g.restore();return true;
 }
 function draw(g,{home,day,tick=0}={}){
  if(!HOMES.includes(home))return;
  const r=store(),last=r.memories.slice().reverse().find(m=>m.home===home);
  const recent=last&&last.day===day,heirloom=r.counts[home]>=3;
  if(!recent&&!heirloom)return;
  g.save();
  if(recent){
   const x=690,y=431;
   g.fillStyle='rgba(73,91,72,.14)';g.beginPath();g.ellipse(x,y+14,72,18,0,0,Math.PI*2);g.fill();
   g.fillStyle='#916a52';g.fillRect(x-66,y-10,132,29);
   g.fillStyle='#e9c79d';g.fillRect(x-73,y-16,146,14);
   g.fillStyle='#fff3d7';g.beginPath();g.ellipse(x,y-17,34,10,0,0,Math.PI*2);g.fill();
   g.fillStyle=['#b8cfa6','#e6b67e','#d7a2a9'][last.quality-1];
   g.beginPath();g.ellipse(x,y-19,23,5,0,0,Math.PI*2);g.fill();
   for(let i=0;i<3;i++){
    g.fillStyle='rgba(255,249,219,.55)';
    g.beginPath();g.ellipse(x-18+i*18+Math.sin(tick+i)*3,y-42-Math.sin(tick+i)*4,3,7,0,0,Math.PI*2);g.fill();
   }
  }
  if(heirloom){
   // Real wall frame; does not overlap the saved aspirations wall art.
   const x=home==='player'?908:913,y=home==='player'?164:211;
   g.fillStyle='#8b644f';g.fillRect(x-29,y-28,58,54);
   g.fillStyle='#dbb889';g.fillRect(x-25,y-24,50,46);
   g.fillStyle='#fff2da';g.fillRect(x-20,y-19,40,36);
   g.fillStyle='#e4a6a9';g.beginPath();g.ellipse(x,y+6,13,8,0,0,Math.PI*2);g.fill();
   g.fillStyle='#e6ba73';g.fillRect(x-1,y-10,3,13);
   g.fillStyle='#83ad86';g.beginPath();g.ellipse(x-8,y-8,9,4,-.4,0,Math.PI*2);g.fill();
  }
  g.restore();
 }
 return {board,pick,start,arrive,showSetting,setPlace,linen,candle,abandon,finish,handle,draw,drawFront,dinnerPose,gatheringActive,update,served,current,members,record:store,recipes:RECIPES};
}
root.HearthFamilyTable={clean,setup,RECIPES,FAVORITES,TOPICS,HOMES};
})(window);

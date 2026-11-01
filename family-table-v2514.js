/* Hearth & Harbor v2.5.14 — At Our Table
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
 let pending=null;
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
  pending={...p,topic};
  closeModal();
  // Reach a real kitchen/dining location in the currently occupied room.
  walkTo(p.home==='player'?{x:725,y:391}:{x:738,y:393},()=>finish());
 }
 function finish(){
  const p=pending;
  if(!p)return false;
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
  pending=null;save();updateUI();
  showModal('family-table-result','<div class="ft-ui"><div class="ft-eyebrow">THE LITTLE MOMENTS ARE THE BIG ONES</div><h2>🍽️ An evening to remember</h2><div class="ft-platter">'+RECIPES[d.id].icon+' <span>'+RECIPES[d.id].name+'</span></div><p class="ft-story">'+topic.intro+'</p><div class="ft-banner">'+(m.length?'💗 '+memberNames(m).join(' & ')+' shared dinner. ':'🌷 A peaceful supper at home. ')+(favorite.length?'Favorite dish for '+memberNames(favorite).join(' & ')+'! ':'')+'Your homemade meal restored needs and created a lasting memory.</div>'+(r.counts[h]===3?'<p>✨ Three suppers together! A new family-table keepsake now appears inside this home.</p>':'')+'<button class="ft-main" data-act="ft-board">Open family table scrapbook</button><button class="ft-back" data-act="ft-close">Return to the home</button></div>');
  notify('A new household dinner memory is saved! 💌');
  return true;
 }
 function handle(action,id){
  if(action==='ft-board')return board();
  if(action==='ft-pick')return pick(Number(id));
  if(action==='ft-topic')return start(id);
  if(action==='ft-close'){pending=null;return closeModal();}
  if(action==='ft-kitchen'){pending=null;return api.openKitchen();}
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
 return {board,pick,start,finish,handle,draw,served,current,members,record:store,recipes:RECIPES};
}
root.HearthFamilyTable={clean,setup,RECIPES,FAVORITES,TOPICS,HOMES};
})(window);

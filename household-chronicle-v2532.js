/* Hearth & Harbor v2.5.32 — Household Chronicle
 * Preserve and present genuine, already-earned family/home moments as an
 * eventual Generations foundation. No menu-created memories or passive income.
 */
(function(root){'use strict';
const HOMES=['player','h0','h1','h2','h3','h4','h5'];
const PEOPLE=['player','mabel','rosie','oliver','jun','bea','finn'];
const KINDS=['move','project','supper','tradition','corner'];
const PROJECTS={morning:'The Breakfast Table',story:'Our Storybook Corner',evening:'The Evening Lantern'};
const TRADITIONS={welcome:'The Welcome House',supper:'Sunday at the Table',orchard:'Roots by the Window'};
const CORNERS={mabel:'Mabel’s Garden Nook',rosie:'Rosie’s Tea Corner',oliver:'Oliver’s Breakfast Corner',jun:'Jun’s Story Nook',bea:'Bea’s Painter’s Posies',finn:'Finn’s Maker’s Light'};
const OWN=(x,k)=>Object.prototype.hasOwnProperty.call(x,k);
const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x),validDay=x=>Number.isInteger(x)&&x>0&&x<=9999;
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const validSource=x=>typeof x==='string'&&x.length>0&&x.length<=90&&/^[a-z0-9:|_-]+$/i.test(x);
const safeActors=x=>Array.isArray(x)?[...new Set(x.filter(id=>PEOPLE.includes(id)))].slice(0,2):[];
const bound=(n,min,max)=>Math.min(max,Math.max(min,n));
function clean(raw){
 const src=obj(raw)?raw:{},events=[],pins={};
 for(const home of HOMES)pins[home]=[];
 if(Array.isArray(src.events))for(const e of src.events.slice(-600)){
  if(!obj(e)||!HOMES.includes(e.home)||!KINDS.includes(e.kind)||!validDay(e.day)||
   !validSource(e.source)||events.some(x=>x.home===e.home&&x.source===e.source))continue;
  const actors=safeActors(e.actors);
  let detail=typeof e.detail==='string'?e.detail:'';
  if(e.kind==='project'&&!OWN(PROJECTS,detail)||e.kind==='tradition'&&!OWN(TRADITIONS,detail)||
   e.kind==='corner'&&!OWN(CORNERS,detail))continue;
  if(e.kind==='move'&&actors.length!==2||e.kind==='project'&&actors.length!==2||
   e.kind==='supper'&&e.home!=='player'&&actors.length===0||
   e.kind==='corner'&&actors.length!==1)continue;
  if(!['project','tradition','corner'].includes(e.kind))detail='';
  events.push({home:e.home,day:e.day,kind:e.kind,source:e.source,actors,detail});
 }
 events.sort((a,b)=>a.day-b.day||a.source.localeCompare(b.source));
 // retain up to 30 dated events per home across multiple generations
 const seen={};const kept=[];for(const e of events){const total=seen[e.home]||0;if(total>=30)continue;seen[e.home]=total+1;kept.push(e)}
 for(const home of HOMES){
  const arr=Array.isArray(src.pins?.[home])?src.pins[home]:[];
  for(const source of arr)if(validSource(source)&&kept.some(e=>e.home===home&&e.source===source)&&!pins[home].includes(source)&&pins[home].length<2)pins[home].push(source);
 }
 return {events:kept,pins};
}
function setup(api){
 const state=()=>api.getState();
 const data=()=>{
  const s=state();if(!obj(s.householdChronicle)||!Array.isArray(s.householdChronicle.events)||!obj(s.householdChronicle.pins))
   s.householdChronicle=clean(s.householdChronicle);
  return s.householdChronicle;
 };
 const name=id=>String(api.getPersonLabel?.(id)||id==='player'?'Poppy':id).slice(0,36);
 const label=home=>home==='player'?'Your Cottage':String(api.getHomeLabel?.(home)||home).slice(0,50);
 const headline=e=>{
  if(e.kind==='move')return 'A Home Shared Together';
  if(e.kind==='project')return PROJECTS[e.detail];
  if(e.kind==='tradition')return TRADITIONS[e.detail];
  if(e.kind==='corner')return CORNERS[e.detail];
  return 'Around the Family Table';
 };
 const body=e=>{
  const who=e.actors.map(name).join(' and ');
  if(e.kind==='move')return who+' began a new chapter under one roof.';
  if(e.kind==='project')return who+' completed a shared project with their own real routines.';
  if(e.kind==='tradition')return 'A three-chapter home and town tradition became part of this home’s story.';
  if(e.kind==='corner')return who+' found a favorite place worth remembering.';
  return (who||'The household')+' shared a real home supper.';
 };
 const sortEvents=home=>data().events.filter(e=>e.home===home).sort((a,b)=>b.day-a.day||b.source.localeCompare(a.source));
 function record(entry){
  if(!obj(entry)||!HOMES.includes(entry.home)||!KINDS.includes(entry.kind)||!validDay(entry.day)||!validSource(entry.source)||
   entry.day>state().day||data().events.some(e=>e.home===entry.home&&e.source===entry.source))return false;
  const raw={events:[...data().events,entry],pins:data().pins};
  const result=clean(raw);
  if(!result.events.some(e=>e.home===entry.home&&e.source===entry.source))return false;
  state().householdChronicle=result;return true;
 }
 function collect(){
  const s=state(),candidate=[];
  for(const m of Array.isArray(s.householdMoves)?s.householdMoves:[]){
   if(obj(m)&&validDay(m.day)&&m.day<=s.day&&HOMES.includes(m.home)&&PEOPLE.includes(m.who)&&PEOPLE.includes(m.with)&&m.who!==m.with)
    candidate.push({home:m.home,kind:'move',day:m.day,actors:[m.who,m.with],source:'move:'+m.day+':'+m.who+':'+m.with});
  }
  for(const m of Array.isArray(s.roommateProjects?.history)?s.roommateProjects.history:[]){
   if(obj(m)&&HOMES.includes(m.home)&&OWN(PROJECTS,m.project)&&Array.isArray(m.pair)&&validDay(m.day)&&m.day<=s.day)
    candidate.push({home:m.home,kind:'project',day:m.day,detail:m.project,actors:m.pair,source:'project:'+m.day+':'+m.home+':'+m.project});
  }
  for(const m of Array.isArray(s.familyTable?.memories)?s.familyTable.memories:[]){
   if(obj(m)&&HOMES.includes(m.home)&&validDay(m.day)&&m.day<=s.day)
    candidate.push({home:m.home,kind:'supper',day:m.day,actors:m.home==='player'?['player']:m.guests,source:'supper:'+m.day+':'+m.home});
  }
  for(const home of HOMES){
   for(const id of Object.keys(TRADITIONS)){
    const m=s.homeTraditions?.homes?.[home]?.[id];
    if(obj(m)&&validDay(m.completedDay)&&m.completedDay<=s.day)
     candidate.push({home,kind:'tradition',day:m.completedDay,detail:id,actors:home==='player'?['player']:safeActors(m.memories?.map(x=>x.actor)),
      source:'tradition:'+home+':'+id});
   }
  }
  const corners=Array.isArray(s.personalCorners?.memories)?s.personalCorners.memories:[];
  for(const home of HOMES.filter(h=>h!=='player'))for(const id of Object.keys(CORNERS)){
   const records=corners.filter(m=>obj(m)&&m.home===home&&m.id===id&&validDay(m.day)&&m.day<=s.day).sort((a,b)=>a.day-b.day);
   if(records.length>=3&&(s.personalCorners?.counts?.[home+'|'+id]||0)>=3)
    candidate.push({home,kind:'corner',day:records[2].day,detail:id,actors:[id],source:'corner:'+home+':'+id});
  }
  candidate.sort((a,b)=>a.day-b.day||a.source.localeCompare(b.source));
  let added=0;for(const entry of candidate)if(record(entry))added++;
  return added;
 }
 function toggle(home,source){
  if(!HOMES.includes(home)||!validSource(source))return false;
  const d=data(),target=d.events.find(e=>e.home===home&&e.source===source);if(!target)return false;
  const current=d.pins[home]||[],i=current.indexOf(source);
  if(i!==-1)current.splice(i,1);
  else {if(current.length>=2){api.notify?.('Choose a memory to unpin first. Each home has two display spaces.');return false}current.push(source)}
  api.save?.();api.updateUI?.();return true;
 }
 function displayed(home){return (data().pins[home]||[]).map(s=>data().events.find(e=>e.home===home&&e.source===s)).filter(Boolean)}
 const comfort=home=>HOMES.includes(home)?displayed(home).length:0;
 function board(home='player'){
  collect();
  const here=HOMES.includes(home)?home:'player',events=sortEvents(here),pinned=data().pins[here]||[];
  const tabs=HOMES.map(h=>'<button data-act="hc32-view" data-id="'+h+'" aria-pressed="'+(h===here)+'">'+esc(label(h))+'</button>').join('');
  const cards=events.map(e=>{
   const selected=pinned.includes(e.source);
   return '<article class="hc32-memory"><span class="hc32-icon">'+({move:'🏡',project:'💗',supper:'🥧',tradition:'🌷',corner:'✿'}[e.kind])+'</span><div class="hc32-body"><small>DAY '+e.day+' · '+e.kind.toUpperCase()+'</small><h3>'+esc(headline(e))+'</h3><p>'+esc(body(e))+'</p><button data-act="hc32-pin" data-id="'+here+'|'+e.source+'" aria-pressed="'+selected+'" '+(!selected&&pinned.length>=2?'disabled':'')+'>'+(selected?'✓ Displayed in this home':'Display this memory')+'</button></div></article>';
  }).join('');
  api.showModal('household-chronicle','<section class="hc32-book"><div class="hc32-cover"><small>AN EVERYDAY FAMILY HISTORY</small><h2>The Household Chronicle</h2><p>Every home has a story. Remember real suppers, friendships, keepsakes, traditions and new beginnings. Choose which two memories belong on the display in this home.</p><b>'+events.length+' recorded memories · '+pinned.length+'/2 displayed</b></div><div class="hc32-tabs" role="group" aria-label="Household selection">'+tabs+'</div><h3>'+esc(label(here))+'</h3><div class="hc32-grid">'+(cards||'<p class="hc32-empty">There are no completed memories here yet. Visit, cook together, decorate and complete real home stories to begin the chronicle.</p>')+'</div><p class="hc32-note">Displaying memories is free and optional. Each visible display adds +1 home comfort (maximum +2), within the original comfort cap. Old completed moments are imported from your existing save. This journal preserves family stories for a future Generations system without forcing aging or changing anyone’s relationships.</p><button data-act="hc32-back" class="hc32-back">Return to the household</button></section>');
 }
 function handle(action,id,activeHome){
  if(action==='hc32-view')return board(id);
  if(action==='hc32-pin'){
   const split=typeof id==='string'?id.indexOf('|'):-1;
   if(split===-1)return false;
   const home=id.slice(0,split),source=id.slice(split+1);
   if(!HOMES.includes(home)||!toggle(home,source))return false;
   return board(home);
  }
  if(action==='hc32-board')return board(HOMES.includes(id)?id:activeHome);
  if(action==='hc32-back')return api.back?.();
  return false;
 }
 function draw(g,home){
  if(!HOMES.includes(home))return;
  const photos=displayed(home);
  for(let i=0;i<photos.length;i++){
   const m=photos[i],x=i===0?428:725,y=1035;
   g.save();g.translate(x,y);
   g.fillStyle='#314e4533';g.beginPath();g.ellipse(0,11,53,12,0,0,6.283);g.fill();
   g.fillStyle='#a97857';g.fillRect(-46,-80,92,86);
   g.fillStyle='#f5d9ae';g.fillRect(-41,-75,82,74);
   g.fillStyle='#fff6df';g.fillRect(-35,-68,70,55);
   const ink={move:'#aed5bd',project:'#e8b8ab',supper:'#f2cb8b',tradition:'#b8c6e1',corner:'#c0b7d6'}[m.kind];
   g.fillStyle=ink;g.fillRect(-31,-64,62,46);
   // Actual distinct miniature illustrated memories in a standing frame.
   if(m.kind==='move'){
    g.fillStyle='#f7e0c1';g.beginPath();g.moveTo(-21,-39);g.lineTo(0,-57);g.lineTo(21,-39);g.closePath();g.fill();
    g.fillStyle='#fef4d8';g.fillRect(-17,-40,34,22);g.fillStyle='#a9847a';g.fillRect(-4,-34,9,16);
   }else if(m.kind==='project'){
    g.fillStyle='#fff3d6';for(const p of [-13,13]){g.beginPath();g.arc(p,-45,8,0,6.283);g.fill()}g.fillRect(-19,-33,38,9);
   }else if(m.kind==='supper'){
    g.fillStyle='#fff5e1';g.beginPath();g.ellipse(0,-39,23,13,0,0,6.283);g.fill();
    g.fillStyle='#bc855d';g.beginPath();g.ellipse(0,-41,15,7,0,0,6.283);g.fill();
   }else if(m.kind==='tradition'){
    g.strokeStyle='#fff2db';g.lineWidth=5;g.beginPath();g.arc(0,-41,15,0,6.283);g.stroke();
    for(const px of [-13,0,13]){g.fillStyle='#e5f3da';g.beginPath();g.arc(px,-46,5,0,6.283);g.fill()}
   }else{
    g.fillStyle='#f0e9cc';g.fillRect(-18,-51,36,21);
    g.fillStyle='#6aaf83';g.beginPath();g.ellipse(-8,-53,11,7,-.4,0,6.283);g.ellipse(10,-52,11,7,.5,0,6.283);g.fill();
   }
   g.fillStyle='#b79168';g.fillRect(-11,-1,22,23);g.fillRect(-28,21,56,6);
   g.fillStyle='#705748';g.font='bold 9px system-ui';g.textAlign='center';g.fillText('DAY '+m.day,0,-4);
   g.restore();
  }
 }
 return {clean,collect,record,toggle,displayed,comfort,board,handle,draw,get data(){return data()},headline,body};
}
root.HearthHouseholdChronicle={clean,setup,HOMES,KINDS};
})(window);

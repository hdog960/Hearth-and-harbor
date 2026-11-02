/* Hearth & Harbor v2.5.29 — Together At Home
 * Genuine paired-roommate projects assembled from separate, real completed
 * household actions. No payments for picking a project or scheduling tasks.
 */
(function(root){'use strict';
const PEOPLE=['mabel','rosie','oliver','jun','bea','finn'],HOMES=['h0','h1','h2','h3','h4','h5'];
const PROJECTS={
 morning:{title:'A Breakfast Worth Sharing',icon:'🥐',actions:['meal','tidy'],gift:'A hand-thrown breakfast teapot',description:'One roommate prepares breakfast; the other makes their little home welcoming.',color:'#e4bc8f'},
 story:{title:'The Storybook Corner',icon:'📖',actions:['read','hobby'],gift:'A hand-bound illustrated storybook',description:'One reads aloud while the other makes something beautiful.',color:'#a9bcad'},
 evening:{title:'The Evening Lantern',icon:'🏮',actions:['chat','meal'],gift:'A glowing amber lantern',description:'One welcomes a friend while the other makes a comforting supper.',color:'#edbb91'}
};
const IDS=Object.keys(PROJECTS),own=(v,k)=>Object.prototype.hasOwnProperty.call(v,k);
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const dayOK=v=>Number.isInteger(v)&&v>=1&&v<=9999,clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function fresh(){return {day:0,project:'',pair:[],done:[],finishedDay:0,keepsakes:[]};}
function clean(raw){
 const src=object(raw)?raw:{},homes={},history=[];
 for(const home of HOMES){
  const row=object(src.homes?.[home])?src.homes[home]:{},pair=Array.isArray(row.pair)&&row.pair.length===2&&
    row.pair.every(id=>PEOPLE.includes(id))&&row.pair[0]!==row.pair[1]?row.pair.slice():[];
  const day=dayOK(row.day)?row.day:0,project=own(PROJECTS,row.project)&&pair.length?row.project:'';
  const done=project&&Array.isArray(row.done)?[...new Set(row.done.filter(p=>pair.includes(p)))].slice(0,2):[];
  homes[home]={day:project?day:0,project:day?project:'',pair:day&&project?pair:[],done:day&&project?done:[],
   finishedDay:dayOK(row.finishedDay)?row.finishedDay:0,
   keepsakes:Array.isArray(row.keepsakes)?[...new Set(row.keepsakes.filter(id=>IDS.includes(id)))].slice(0,3):[]};
 }
 if(Array.isArray(src.history))for(const item of src.history.slice(-100)){
  if(!object(item)||!HOMES.includes(item.home)||!IDS.includes(item.project)||!dayOK(item.day)||
    !Array.isArray(item.pair)||item.pair.length!==2||!item.pair.every(id=>PEOPLE.includes(id))||item.pair[0]===item.pair[1])continue;
  if(history.some(x=>x.home===item.home&&x.day===item.day))continue;
  history.push({home:item.home,project:item.project,day:item.day,pair:item.pair.slice()});
 }
 return {homes,history:history.slice(-36)};
}
function setup(api){
 const state=()=>api.getState();
 const db=()=>{
  const s=state();if(!object(s.roommateProjects)||!object(s.roommateProjects.homes)||!HOMES.every(h=>object(s.roommateProjects.homes[h])))s.roommateProjects=clean(s.roommateProjects);
  return s.roommateProjects;
 };
 const residents=home=>!HOMES.includes(home)?[]:
  [...new Set((api.getHomeMembers?.(home)||[]).filter(id=>PEOPLE.includes(id)&&api.getResidentHome?.(id)===home))].slice(0,2);
 const record=home=>HOMES.includes(home)?db().homes[home]:null;
 const canPlay=home=>residents(home).length===2;
 const finishedToday=home=>record(home)?.finishedDay===state().day;
 const keepsakes=home=>record(home)?.keepsakes||[];
 const comfort=home=>keepsakes(home).length*2;
 const label=id=>esc(api.getPersonLabel?.(id)||id);
 const homeLabel=home=>esc(api.getHomeLabel?.(home)||home);
 function pending(home){
  if(!canPlay(home)||!dayOK(state().day)||finishedToday(home))return null;
  const r=record(home);
  if(r.day!==state().day||!own(PROJECTS,r.project)||r.pair.length!==2||
    !r.pair.every(id=>residents(home).includes(id)))return null;
  return r;
 }
 function arm(home,id,swap=false){
  if(!canPlay(home)||!IDS.includes(id)||!dayOK(state().day)||finishedToday(home))return false;
  const pair=residents(home);
  if(swap)pair.reverse();
  const rec=record(home);
  if(rec.day===state().day&&rec.project===id&&rec.pair.join('|')===pair.join('|'))return false;
  rec.day=state().day;rec.project=id;rec.pair=pair;rec.done=[];
  api.save();api.updateUI?.();
  api.notify?.('The roommates have a new shared project. Real routines will bring it to life.');
  return true;
 }
 function recordAction(home,id,action,first=true,day=state().day){
  if(!first||!dayOK(day)||day!==state().day||!HOMES.includes(home)||!PEOPLE.includes(id))return false;
  const rec=pending(home);if(!rec||rec.done.includes(id))return false;
  const index=rec.pair.indexOf(id);
  if(index<0||PROJECTS[rec.project].actions[index]!==action)return false;
  rec.done.push(id);
  if(rec.done.length<2)return {stage:1,project:rec.project};
  // Both *different* residents completed their respective genuine actions
  // on the current day. Claim first to keep any reentrant/UI taps idempotent.
  rec.finishedDay=day;
  if(!rec.keepsakes.includes(rec.project))rec.keepsakes.push(rec.project);
  db().history.push({home,project:rec.project,day,pair:rec.pair.slice()});
  db().history=db().history.slice(-36);
  for(const member of rec.pair){
   const needs=api.getNeeds?.(member);
   if(object(needs)){
    needs.social=clamp((Number.isFinite(needs.social)?needs.social:0)+6,0,100);
    needs.fun=clamp((Number.isFinite(needs.fun)?needs.fun:0)+5,0,100);
   }
  }
  if(!object(state().townBonds))state().townBonds={};
  const key=rec.pair.slice().sort().join('|');
  state().townBonds[key]=clamp((state().townBonds[key]||0)+2,0,100);
  api.notify?.('💗 '+label(rec.pair[0])+' and '+label(rec.pair[1])+' finished '+PROJECTS[rec.project].title+'! A shared keepsake is now on their wall shelf.');
  // Caller already owns the activity's normal save/update; no free rewards
  // from menu choices, ghost animations, the planner or imported schedules.
  return {stage:2,project:rec.project,home};
 }
 function arrange(home){
  const rec=pending(home);if(!rec)return false;
  const todo=rec.pair.map((member,i)=>({member,action:PROJECTS[rec.project].actions[i]})).filter(p=>!rec.done.includes(p.member));
  // Atomic preflight: preserve every roommate's existing schedule and
  // never queue just the first half if the second plan has no capacity.
  for(const {member,action} of todo){
   const old=api.getSchedule?.(home,member);
   if(!Array.isArray(old)||old.length>=3&&!old.includes(action))return false;
  }
  for(const {member,action} of todo){
   const old=api.getSchedule(home,member);
   if(!old.includes(action)&&!api.addSchedule?.(home,member,action))return false;
  }
  api.notify?.('The household Daybook plans are ready. Close this book to watch both residents work.');
  return true;
 }
 function board(home){
  if(!HOMES.includes(home))return;
  const people=residents(home),rec=record(home),active=pending(home),total=rec.keepsakes.length;
  const rows=IDS.map(id=>{
   const p=PROJECTS[id],isCurrent=active?.project===id,owned=rec.keepsakes.includes(id);
   const actors=active&&isCurrent?active.pair:people;
   const part=actors.length===2?p.actions.map((a,i)=>'<div class="rm29-step '+(isCurrent&&active.done.includes(actors[i])?'rm29-done':'')+'">'+
     '<b>'+label(actors[i])+'</b><span>'+({meal:'🥣 Prepare a meal',tidy:'🧺 Tidy the room',read:'📖 Read a chapter',hobby:'🎨 Practice a hobby',chat:'💗 Have a conversation'}[a])+'</span>'+
     (isCurrent&&active.done.includes(actors[i])?'<small>✓ Completed today</small>':'<small>Waiting for a real routine</small>')+'</div>').join(''):'<p>This activity needs two housemates living together.</p>';
   return '<article class="rm29-card '+(isCurrent?'rm29-selected':'')+'"><div class="rm29-head"><span>'+p.icon+'</span><div><small>'+esc(p.gift)+(owned?' · Collected':'')+'</small><h3>'+p.title+'</h3></div></div><p>'+p.description+'</p>'+
     (isCurrent?'<div class="rm29-steps">'+part+'</div><div class="rm29-progress">'+active.done.length+' of 2 genuine home routines finished</div>':'')+
     '<div class="rm29-buttons"><button data-act="rm29-choose" data-id="'+id+'" '+(!canPlay(home)||finishedToday(home)||isCurrent?'disabled':'')+'>'+(isCurrent?'✓ Chosen for today':finishedToday(home)?'Today’s project finished':'Choose this project')+'</button>'+
     (isCurrent?'<button data-act="rm29-swap" data-id="'+id+'">Swap responsibilities (resets today’s partial progress)</button>':'')+'</div></article>';
  }).join('');
  const entries=db().history.filter(x=>x.home===home).slice(-5).reverse().map(m=>'<li>Day '+m.day+' · '+esc(PROJECTS[m.project].title)+' · '+m.pair.map(label).join(' and ')+'</li>').join('');
  api.showModal('roommate-projects','<div class="rm29-ui"><div class="rm29-cover"><small>TWO PEOPLE · ONE LITTLE HOME</small><h2>Together at Home</h2><p>Plan a little collaboration for two real roommates. One resident completes the first activity and their housemate completes the second; both must genuinely finish in this home today.</p><div class="rm29-summary">'+total+' of 3 shelf keepsakes · +'+comfort(home)+' permanent home comfort</div></div>'+
    '<p class="rm29-intro">'+(canPlay(home)?people.map(label).join(' and ')+' share '+homeLabel(home)+'.':homeLabel(home)+' needs two residents before a joint project can begin.')+'</p>'+
    '<div class="rm29-grid">'+rows+'</div>'+
    (active?'<button class="rm29-auto" data-act="rm29-plan">🗓️ Add these tasks to both residents’ independent plans</button><p class="rm29-note">This does not overwrite existing schedules. Roommates must finish their own real activities. Plans pause if you guide that resident directly.</p>':'')+
    '<div class="rm29-history"><h3>Shared home memories</h3><ul>'+(entries||'<li>When a real collaboration is finished, the moment will be remembered here.</li>')+'</ul></div>'+
    '<p class="rm29-note">Only one completed project per home per in-game day. Picking or scheduling a project provides no coins, cooking dishes, need rewards or skill experience. Each unique project adds a permanent illustrated object to the home’s wall shelf.</p>'+
    '<button class="rm29-back" data-act="rm29-back">Return to Household Daybook</button></div>');
 }
 function handle(action,id,home){
  if(!HOMES.includes(home))return false;
  if(action==='rm29-board')return board(home);
  if(action==='rm29-choose')arm(home,id);
  else if(action==='rm29-swap')arm(home,id,true);
  else if(action==='rm29-plan'&&!arrange(home))api.notify?.('One of the independent Daybook plans is full. Clear or finish a task first.');
  else if(action==='rm29-back')return api.openDaybook?.();
  return board(home);
 }
 function drawWall(g,home){
  if(!HOMES.includes(home)||!keepsakes(home).length)return;
  const has=keepsakes(home);g.save();g.translate(580,228);
  // Hand-painted shelf and three different authored keepsakes. Vector geometry
  // stays legible at small phone scale and sits below the existing wall frames.
  g.fillStyle='#6a5048';g.fillRect(-123,18,246,14);g.fillStyle='#dfa979';g.fillRect(-129,12,258,11);
  g.fillStyle='#f6dcb8';g.fillRect(-125,13,248,4);
  for(const [i,id] of IDS.entries()){
   if(!has.includes(id))continue;
   const x=-78+i*77,p=PROJECTS[id];
   g.save();g.translate(x,0);
   if(id==='morning'){
    g.fillStyle='#f1d1a1';g.beginPath();g.ellipse(0,2,19,9,0,0,Math.PI*2);g.fill();
    g.fillStyle='#d5a27b';g.fillRect(-13,-19,27,24);
    g.fillStyle='#fff1d2';g.fillRect(-10,-16,20,18);
    g.strokeStyle='#f0d7b4';g.lineWidth=5;g.beginPath();g.arc(15,-8,9,-1.7,1.5);g.stroke();
    g.fillStyle='#c88e6a';g.beginPath();g.ellipse(0,-21,17,5,0,0,Math.PI*2);g.fill();
    g.fillStyle='#f6e1bc';g.beginPath();g.ellipse(0,-22,12,3,0,0,Math.PI*2);g.fill();
   }else if(id==='story'){
    g.fillStyle='#b77875';g.beginPath();g.moveTo(-23,6);g.lineTo(-21,-30);g.lineTo(0,-23);g.lineTo(0,8);g.closePath();g.fill();
    g.fillStyle='#83a69a';g.beginPath();g.moveTo(0,8);g.lineTo(0,-23);g.lineTo(23,-30);g.lineTo(23,6);g.closePath();g.fill();
    g.strokeStyle='#fff1d9';g.lineWidth=2;g.beginPath();g.moveTo(0,-23);g.lineTo(0,8);g.moveTo(-18,-18);g.lineTo(-4,-15);g.moveTo(6,-15);g.lineTo(18,-18);g.stroke();
   }else{
    g.fillStyle='#b07959';g.fillRect(-17,-23,34,31);g.fillStyle='#f8d38c';g.fillRect(-13,-19,26,22);
    g.fillStyle='#fff1c0';g.beginPath();g.ellipse(0,-8,9,13,0,0,Math.PI*2);g.fill();
    g.strokeStyle='#8b6b5e';g.lineWidth=4;g.beginPath();g.arc(0,-24,10,Math.PI,Math.PI*2);g.stroke();
    g.fillStyle='#b7795d';g.fillRect(-22,8,44,4);
   }
   g.fillStyle=p.color;g.beginPath();g.arc(0,15,3,0,Math.PI*2);g.fill();g.restore();
  }
  g.restore();
 }
 return {board,handle,arm,pending,arrange,recordAction,drawWall,comfort,keepsakes,canPlay,
  get data(){return db()}};
}
root.HearthRoommateProjects={clean,setup,PROJECTS,HOMES,PEOPLE};
})(window);

/* Hearth & Harbor v2.8.3 — Little Sprouts + Family Seasons Sampler.
 * First ACTUAL younger character, Pip. Separate from adult romance, employment,
 * resident housing array and optional adult aging. Guardianship is a player
 * choice, earned through three genuine days of face-to-face child activities.
 * No automatic adoption, biological ancestry, punitive neglect or passive pay.
 */
(function(root){'use strict';
const CHILD={id:'pip',name:'Pip',stage:'Child',skin:'#d69e7c',hair:'#58424c',outfit:'#eab16e',kind:'overalls',style:3,x:790,y:898,emoji:'🌱'};
const ACTIONS={
 story:{name:'The Cloud-Boat Story',icon:'📚',need:'curiosity',steps:[
  {say:'Pip opens a storybook. Where should the cloud-boat sail?',answers:[['Over the berry fields','A cloud-boat discovers a sea of strawberry flowers.'],['Past the moonlit hill','The clouds leave a trail of silver stars.']]},
  {say:'A tiny animal waves from the shore. What do you imagine?',answers:[['A fox with a map','Pip draws a winding route in the book.'],['A sleepy hedgehog','You give the little traveler a cozy bed.']]},
  {say:'Every story needs an ending. What happens?',answers:[['They find their friends','A warm reunion fills the last page.'],['They discover a new island','Pip decides that tomorrow deserves its own adventure.']]}
 ]},
 garden:{name:'A Tiny Nature Trail',icon:'🍃',need:'confidence',steps:[
  {say:'Pip spots something in the grass. What should you explore?',answers:[['Little footprints','You follow a careful trail without disturbing anything.'],['A fallen feather','You notice the feather’s beautiful striped pattern.']]},
  {say:'There are two lovely places to look next.',answers:[['Under the clover','A tiny ladybug has made a home.'],['Beside the old tree','A green leaf catches the afternoon light.']]},
  {say:'How should you finish this outing?',answers:[['Sketch what you saw','Pip records a lovely field-guide memory.'],['Leave it untouched','Pip learns to be a gentle visitor in nature.']]}
 ]},
 art:{name:'The Friendship Sketch',icon:'🎨',need:'joy',steps:[
  {say:'Pip spreads out the crayons. What should you draw first?',answers:[['A little cottage','A welcoming home appears on the page.'],['A blooming garden','The sketch bursts with springtime flowers.']]},
  {say:'Now choose a special color.',answers:[['Honey gold','Pip adds a warm golden glow.'],['Berry pink','A happy swirl brings the picture to life.']]},
  {say:'What detail completes the drawing?',answers:[['Two waving friends','Pip grins at the little friendship picture.'],['A tiny secret star','You hide a star only the two of you know about.']]}
 ]}
};
const KINDS=Object.keys(ACTIONS),obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const validDay=x=>Number.isInteger(x)&&x>=1&&x<=9999;
const clamp=x=>Math.max(0,Math.min(100,Number.isFinite(x)?x:0));
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const defaults=()=>({guardian:null,guardianDay:0,needs:{joy:62,curiosity:55,confidence:50},daily:{day:0,done:[]},days:[],memories:[],evenings:[],skills:{story:0,garden:0,art:0},meetings:[],homeHelps:[],dream:root.HearthPipDreams.clean(null),projects:[],mentor:root.HearthPipGuides.clean(null,[]),growth:root.HearthPipGrowth.clean(null),adventures:[],legacyKeepsakes:[],familyRituals:[],helperProjects:[],neighborResponses:[]});
function clean(raw){
 const src=obj(raw)?raw:{},d=defaults(),needs=obj(src.needs)?src.needs:{},daily=obj(src.daily)?src.daily:{},memories=[],days=[];
 const guardian=src.guardian==='player'&&validDay(src.guardianDay)?'player':null;
 const guardianDay=guardian?src.guardianDay:0;
 const verifiedDays=Array.isArray(src.days)?src.days.filter(validDay).sort((a,b)=>a-b):[];
 for(const x of verifiedDays)if(!days.includes(x)&&days.length<40)days.push(x);
 if(Array.isArray(src.memories))for(const x of src.memories.slice(-120)){
  if(!obj(x)||!KINDS.includes(x.kind)||!validDay(x.day)||!Number.isInteger(x.choiceMask)||x.choiceMask<0||x.choiceMask>7)continue;
  if(memories.some(m=>m.day===x.day&&m.kind===x.kind))continue;
  memories.push({day:x.day,kind:x.kind,choiceMask:x.choiceMask});
 }
 const skills={};
 for(const kind of KINDS){
  const old=Array.isArray(src.memories)?src.memories.filter(m=>obj(m)&&m.kind===kind&&validDay(m.day)&&Number.isInteger(m.choiceMask)&&m.choiceMask>=0&&m.choiceMask<=7):[];
  const learned=new Set(old.map(m=>m.day)).size;
  const claimed=obj(src.skills)&&Number.isInteger(src.skills[kind])&&src.skills[kind]>=0&&src.skills[kind]<=999?src.skills[kind]:0;
  skills[kind]=Math.max(learned,claimed);
 }
 const safeDaily=validDay(daily.day)?daily.day:0;
 const done=Array.isArray(daily.done)?[...new Set(daily.done.filter(x=>KINDS.includes(x)))].slice(0,3):[];
 return {guardian,guardianDay,needs:Object.fromEntries(Object.keys(d.needs).map(k=>[k,typeof needs[k]==='number'&&Number.isFinite(needs[k])?clamp(needs[k]):d.needs[k]])),daily:{day:safeDaily,done},days,memories:memories.slice(-40),evenings:root.HearthPipRoutines.cleanEvenings(src.evenings),skills,meetings:root.HearthPipNeighbors.clean(src.meetings),homeHelps:root.HearthPipHomeHelp.clean(src.homeHelps),dream:root.HearthPipDreams.clean(src.dream),projects:root.HearthPipProjects.clean(src.projects),mentor:root.HearthPipGuides.clean(src.mentor,src.meetings),growth:root.HearthPipGrowth.clean(src.growth),adventures:root.HearthPipAdventures.clean(src.adventures),legacyKeepsakes:root.HearthPipLegacy.clean(src.legacyKeepsakes),familyRituals:root.HearthPipRituals.clean(src.familyRituals),helperProjects:root.HearthPipHelpers?.clean?.(src.helperProjects)||[],neighborResponses:root.HearthPipResponses?.clean?.(src.neighborResponses)||[]};
}
function setup(api){
 const state=()=>api.getState(),data=()=>{
  const s=state();if(!obj(s.youngResidents)||!obj(s.youngResidents.pip))s.youngResidents={pip:defaults()};
  const c=s.youngResidents.pip;
  if(!obj(c.needs)||!obj(c.daily)||!Array.isArray(c.days)||!Array.isArray(c.memories)||!Array.isArray(c.evenings)||!obj(c.skills)||!Array.isArray(c.meetings)||!Array.isArray(c.homeHelps)||!obj(c.dream)||!Array.isArray(c.projects)||!obj(c.mentor)||!obj(c.growth)||!Array.isArray(c.adventures)||!Array.isArray(c.legacyKeepsakes)||!Array.isArray(c.familyRituals)||!Array.isArray(c.helperProjects)||!Array.isArray(c.neighborResponses))s.youngResidents.pip=clean(c);
  return s.youngResidents.pip;
 };
 let session=null;
 const day=()=>validDay(state().day)?state().day:1;
 const isHome=()=>data().guardian==='player';
 const home=()=>isHome()?'player':null;
 const inPlace=()=>neighbors.walkingNow()||api.getScene?.()===routines.location().scene;
 const routines=root.HearthPipRoutines.setup({
  getState:state,getChild:data,getScene:api.getScene,isNearby:api.isNearby,
  getAdults:api.getAdults,isWalkable:api.isWalkable,
  showModal:api.showModal,notify:api.notify,save:api.save,
  updateUI:api.updateUI,openBook:()=>entry()
 });
 const neighbors=root.HearthPipNeighbors.setup({
  getState:state,getChild:data,getScene:api.getScene,
  getAdults:api.getAdults,getPlayer:api.getPlayer,
  goTown:api.goTown,nearestWalkable:api.nearestWalkable,isWalkable:api.isWalkable,
  findPath:api.findPath,isMovementBlocked:api.isMovementBlocked,
  isPaused:api.isPaused,showModal:api.showModal,notify:api.notify,
  save:api.save,updateUI:api.updateUI,openBook:()=>entry(),
  childPosition:()=>position(),isPlayerNearChild:d=>api.isNearby?.(position(),d)===true,
  nameOfAdult:id=>api.getAdults?.().find(a=>a.id===id)?.name||id,
  onMeetingCompleted:(record,previous)=>guides.completedMeeting(record,previous),
  isMentorVisit:()=>guides.visitingNow()
 });
 const homeHelp=root.HearthPipHomeHelp.setup({
  getState:state,getChild:data,getScene:api.getScene,
  nearChild:d=>api.isNearby?.(position(),d)===true,
  ownDone:api.ownDone,ownHold:api.ownHold,
  queueAction:api.queueOwnAction,closeModal:api.closeModal,
  save:api.save,updateUI:api.updateUI,notify:api.notify,openBook:()=>entry()
 });
 const dreams=root.HearthPipDreams.setup({
  getState:state,getChild:data,getScene:api.getScene,
  nearChild:d=>api.isNearby?.(position(),d)===true,
  save:api.save,updateUI:api.updateUI,notify:api.notify,openBook:()=>entry()
 });
 const projects=root.HearthPipProjects.setup({
  getState:state,getChild:data,getScene:api.getScene,
  nearChild:d=>api.isNearby?.(position(),d)===true,
  location:()=>routines.location(),
  save:api.save,updateUI:api.updateUI,notify:api.notify,openBook:()=>entry(),
  showModal:api.showModal
 });
 const guides=root.HearthPipGuides.setup({
  getState:state,getChild:data,getScene:api.getScene,
  location:()=>routines.location(),getAdults:api.getAdults,
  nearChild:d=>api.isNearby?.(position(),d)===true,
  name:id=>api.getAdults?.().find(a=>a.id===id)?.name||id,
  save:api.save,updateUI:api.updateUI,notify:api.notify,
  openBook:()=>entry(),showModal:api.showModal
 });
 const growth=root.HearthPipGrowth.setup({
  getState:state,getChild:data,getScene:api.getScene,
  nearChild:d=>api.isNearby?.(position(),d)===true,
  save:api.save,updateUI:api.updateUI,notify:api.notify,
  openBook:()=>entry()
 });
 const adventures=root.HearthPipAdventures.setup({
  getState:state,getChild:data,getScene:api.getScene,
  getAdults:api.getAdults,getPlayer:api.getPlayer,childPosition:()=>position(),
  isWalkable:api.isWalkable,nearestWalkable:api.nearestWalkable,
  closeModal:api.closeModal,closeTalk:api.closeTalk,
  save:api.save,updateUI:api.updateUI,notify:api.notify,
  openBook:()=>entry(),showModal:api.showModal
 });
 const helpers=root.HearthPipHelpers?.setup?.({
  getState:state,getChild:data,getScene:api.getScene,
  getAdults:api.getAdults,getPlayer:api.getPlayer,childPosition:()=>position(),
  isWalkable:api.isWalkable,nearestWalkable:api.nearestWalkable,
  otherAdventure:()=>!!adventures.status(),
  name:id=>api.getAdults?.().find(a=>a.id===id)?.name||id,
  save:api.save,updateUI:api.updateUI,notify:api.notify,
  showModal:api.showModal,closeModal:api.closeModal,closeTalk:api.closeTalk,
  openBook:()=>entry(),bondAdult:api.bondAdult,
  onProjectCompleted:record=>worldKeepsakes.completed(record)
 })||{panel:()=>'',draw:()=>false,drawRibbon:()=>false,handle:()=>false,hit:()=>null};
 const worldKeepsakes=root.HearthPipWorldKeepsakes?.setup?.({
  getState:state,getChild:data,getScene:api.getScene,
  getHelper:()=>helpers,getPlayer:api.getPlayer,getAdults:api.getAdults,
  getChildPosition:()=>position(),isWalkable:api.isWalkable,
  nearestWalkable:api.nearestWalkable,isPaused:api.isPaused,
  showModal:api.showModal,closeModal:api.closeModal,
  name:id=>api.getAdults?.().find(a=>a.id===id)?.name||id
 })||{completed:()=>false,drawActor:()=>false,drawDisplay:()=>false,
  drawCelebration:()=>false,displays:()=>[],hit:()=>null,approach:()=>null,
  inspect:()=>false,actorMood:()=>false,advance:()=>{},handle:()=>false};
 const responses=root.HearthPipResponses?.setup?.({
  getState:state,getChild:data,getScene:api.getScene,
  getDisplays:()=>worldKeepsakes.displays(),getAdults:api.getAdults,
  getPlayer:api.getPlayer,getChildPosition:()=>position(),
  isWalkable:api.isWalkable,nearestWalkable:api.nearestWalkable,
  hasCompetingEvent:api.hasCompetingEvent,
  name:id=>api.getAdults?.().find(a=>a.id===id)?.name||id,
  bondAdult:api.bondAdult,save:api.save,updateUI:api.updateUI,
  notify:api.notify,showModal:api.showModal,closeTalk:api.closeTalk,
  openBook:()=>entry()
 })||{panel:()=>'',handle:()=>false,mark:()=>false,drawAdult:()=>false,
  drawChild:()=>false,schedule:(id,entry)=>entry,eligible:()=>false,dialogue:()=>null};
 const familyLegacy=root.HearthPipLegacy.setup({
  getState:state,getChild:data,getScene:api.getScene,
  nearChild:d=>api.isNearby?.(position(),d)===true,
  isChildBusy:()=>!!homeHelp.pending,
  isQueued:api.isQueued,
  ownDone:api.ownDone,ownHold:api.ownHold,
  queueAction:api.queueOwnAction,closeModal:api.closeModal,showModal:api.showModal,
  save:api.save,updateUI:api.updateUI,notify:api.notify,openBook:()=>entry()
 });
 const rituals=root.HearthPipRituals.setup({
  getState:state,getChild:data,getScene:api.getScene,getPlayer:api.getPlayer,
  getChildPosition:()=>position(),nearChild:d=>api.isNearby?.(position(),d)===true,
  hasKeepsake:key=>familyLegacy.earned(key),
  walkToFrame:api.walkHomeFrame,
  isPaused:api.isPaused,isBusy:api.isOwnRoutineBusy,
  childBusy:()=>!!homeHelp.pending||!!familyLegacy.pending,
  ownDone:api.ownDone,isQueued:api.isQueued,queueAction:api.queueOwnAction,
  closeModal:api.closeModal,showModal:api.showModal,
  save:api.save,updateUI:api.updateUI,notify:api.notify,openBook:()=>entry()
 });
 const position=()=>{const p=homeHelp.pose()||familyLegacy.pose()||rituals.pose()||neighbors.escortPose()||routines.location();return {x:p.x,y:p.y}};
 function status(){
  const d=data(),today=day(),current=d.daily.day===today?d.daily.done:[],ready=new Set(d.memories.filter(m=>m.day<=today).map(m=>m.day)).size>=3&&KINDS.every(k=>d.memories.some(m=>m.kind===k&&m.day<=today));
  return {id:'pip',name:'Pip',stage:growth.visual().name,guardian:d.guardian,guardianDay:d.guardianDay,home:home(),day:today,needs:{...d.needs},done:current.slice(),careDays:d.days.length,ready,memories:d.memories.slice()};
 }
 const canBegin=kind=>{
  if(!KINDS.includes(kind)||session)return false;
  if(!inPlace()||!api.isNearby?.(position(),115))return false;
  const d=data();return d.daily.day!==day()||!d.daily.done.includes(kind);
 };
 function entry(){
  const d=data(),s=status(),routine=routines.location(),friend=s.guardian?'Your home is Pip’s safe place.':'Pip visits Maplewood from a nearby family home.';
  const bars=Object.entries(s.needs).map(([key,val])=>'<div class="ls272-stat"><label>'+esc(key[0].toUpperCase()+key.slice(1))+' · '+val+'/100</label><span><i style="width:'+val+'%"></i></span></div>').join('');
  const nearby=inPlace()&&api.isNearby?.(position(),115);
  const activities=KINDS.map(k=>'<button data-act="ls272-start" data-id="'+k+'" '+(s.done.includes(k)||!nearby?'disabled':'')+'><b>'+ACTIONS[k].icon+' '+ACTIONS[k].name+'</b><small>'+(s.done.includes(k)?'A happy memory already made today':!nearby?'Visit Pip in the world first':'Play a real three-part activity together')+'</small></button>').join('');
  api.showModal?.('little-sprouts','<section class="ls272-book"><header class="ls272-cover"><small>GENERATIONS · THE FIRST LITTLE SPROUT</small><h2>🌱 Pip’s Daybook</h2><p>'+friend+' Pip is a child and has their own needs, drawings and memories—not adult jobs or romance.</p></header><div class="ls272-profile"><span>🌼</span><div><b>Pip · '+esc(s.stage)+'</b><small>'+(s.guardian?'Poppy is Pip’s chosen guardian · since Day '+s.guardianDay:'A young friend learning about Maplewood')+'</small></div></div>'+bars+'<p class="ls272-progress">'+s.careDays+' / 3 different care days · All three kinds of shared activities needed to offer guardianship.</p><h3>Spend a real afternoon together</h3>'+(nearby?'':'<button data-act="ls272-visit">📍 Visit Pip in the playable world</button>')+'<div class="ls272-choices">'+activities+'</div>'+(s.ready&&!s.guardian&&nearby?'<div class="ls272-guardian"><strong>🏡 An invitation of trust</strong><p>After these real shared days, you may choose to welcome Pip into your cottage as a guardian. This is optional, not automatic. Pip will live with you in the playable cottage, while other adults and save records remain unchanged.</p><button data-act="ls272-guardian">🌷 Become Pip’s guardian</button></div>':'')+(s.guardian?'<div class="ls272-guardian"><strong>🏡 Your shared cottage</strong><p>Pip lives at your cottage and joins you for stories, nature walks and sketching. No forced aging, penalties or invented biological family links.</p></div>':'')+'<p class="ls272-progress">'+routine.icon+' Today: '+routine.label+'</p>'+routines.card()+'<h3>Our actual memories</h3><ul class="ls272-memories">'+(s.memories.length?s.memories.slice(-12).reverse().map(m=>'<li>Day '+m.day+' · '+ACTIONS[m.kind].icon+' '+ACTIONS[m.kind].name+'</li>').join(''):'<li>Spend time together to start a genuine scrapbook.</li>')+'</ul>'+growth.panel()+familyLegacy.panel()+rituals.panel()+adventures.panel()+helpers.panel()+responses.panel()+dreams.panel()+projects.panel()+homeHelp.panel()+guides.panel()+neighbors.page()+'<button class="ls272-secondary" data-act="ls272-close">Close Pip’s Daybook</button></section>');
 }
 function begin(kind){
  if(!canBegin(kind)){api.notify?.('Visit Pip in person and choose an activity not yet enjoyed today.');return false}
  session={kind,day:day(),step:0,mask:0};
  page();return true;
 }
 function page(){
  if(!session)return false;
  if(session.day!==day()||!inPlace()||!api.isNearby?.(position(),115)){session=null;api.notify?.('The outing was interrupted. Nothing was earned.');return false}
  const kind=session.kind,action=ACTIONS[kind],step=action.steps[session.step];
  if(!step){session=null;return false}
  api.showModal?.('little-sprouts','<section class="ls272-book"><header class="ls272-cover"><small>'+action.icon+' PART '+(session.step+1)+' OF 3</small><h2>'+action.name+'</h2><p>'+step.say+'</p></header><div class="ls272-activity">'+step.answers.map(([title],i)=>'<button data-act="ls272-choose" data-id="'+i+'"><b>'+esc(title)+'</b><small>Choose and experience this little moment</small></button>').join('')+'</div><button class="ls272-secondary" data-act="ls272-cancel">End the activity without a memory</button></section>');
  return true;
 }
 function choose(choice){
  if(!session||!Number.isInteger(choice)||choice<0||choice>1)return false;
  if(session.day!==day()||!inPlace()||!api.isNearby?.(position(),115)){session=null;return false}
  const action=ACTIONS[session.kind],step=action.steps[session.step];
  if(!step)return false;
  if(choice===1)session.mask|=1<<session.step;
  const result=step.answers[choice][1];session.step++;
  if(session.step<3){
   api.showModal?.('little-sprouts','<section class="ls272-book"><div class="ls272-cover"><small>🌷 A SHARED LITTLE MOMENT</small><h2>Part '+session.step+' finished</h2><p>'+esc(result)+'</p></div><button data-act="ls272-next">Continue our activity</button><button class="ls272-secondary" data-act="ls272-cancel">Stop for now</button></section>');
   return true;
  }
  const d=data(),today=day(),kind=session.kind,mask=session.mask;session=null;
  if(d.daily.day!==today)d.daily={day:today,done:[]};
  if(d.daily.done.includes(kind))return false;
  d.daily.done.push(kind);
  if(!d.days.includes(today)){d.days.push(today);d.days=d.days.slice(-40)}
  d.memories.push({day:today,kind,choiceMask:mask});d.memories=d.memories.slice(-40);
  d.skills[kind]=Math.min(999,(Number.isInteger(d.skills[kind])?d.skills[kind]:0)+1);
  const key=action.need;d.needs[key]=Math.min(100,d.needs[key]+16);
  for(const other of Object.keys(d.needs).filter(x=>x!==key))d.needs[other]=Math.min(100,d.needs[other]+4);
  api.save?.();api.updateUI?.();api.notify?.('🌷 A real new memory with Pip! '+key+' +16.');
  api.showModal?.('little-sprouts','<section class="ls272-book"><div class="ls272-cover"><small>✦ A NEW SHARED MEMORY</small><h2>'+action.icon+' '+action.name+'</h2><p>'+esc(result)+'</p></div><p>A Day '+today+' memory was earned through all three parts. Pip grows more confident and curious through real care, not passive rewards.</p><button data-act="ls272-book">Open Pip’s Daybook</button></section>');
  return true;
 }
 function guardian(){
  const d=data(),s=status();
  if(s.guardian||!s.ready)return false;
  if(!inPlace()||!api.isNearby?.(position(),115))return false;
  d.guardian='player';d.guardianDay=day();session=null;
  api.save?.();api.updateUI?.();
  api.notify?.('🏡 You welcomed Pip into your home. Pip will be there when you visit your cottage.');
  entry();return true;
 }
 function tick(minutes){
  if(!Number.isFinite(minutes)||minutes<=0)return;
  // Very gradual natural changes; no illness, eviction or neglect punishment.
  const d=data(),decay=Math.min(minutes,40)*.003;
  for(const key of Object.keys(d.needs))d.needs[key]=Math.max(20,Math.round((d.needs[key]-decay)*100)/100);
 }
 function draw(g,{scene,tick=0,drawSprite}={}){
  if(!g||!drawSprite||(scene!=='town'&&scene!=='home')||scene!==api.getScene?.()||!inPlace())return;
  const base=routines.location(),escort=neighbors.escortPose(),participation=homeHelp.pose()||familyLegacy.pose()||rituals.pose(),routine=participation?{...base,...participation,label:'Helping Poppy in the cottage',icon:'🏡'}:escort?{...base,...escort,label:'A village walk with Poppy',icon:'🌼'}:base;
  const pos=position(),phase=routine.moving?Math.abs(Math.sin((routine.stride??tick*4)*Math.PI))*2.7:Math.sin(tick*1.7)*.6;
  if(!escort){if(routine.mentorVisit)guides.draw(g,routine,tick);else if(!participation&&routine.project)projects.drawProp(g,routine,tick);else routines.drawProp(g,routine,tick)}
  drawSprite(CHILD,pos.x,pos.y+phase,routine);
  growth.drawAccessory(g,pos.x,pos.y+phase,tick);
  helpers.drawRibbon(g,pos,tick);
  neighbors.drawAura(g,tick,pos);
  dreams.drawBadge(g,pos.x,pos.y,tick);
  if(scene==='town'||scene==='home'){
   g.save();g.font='bold 13px monospace';g.textAlign='center';
   g.fillStyle='#39685c';g.fillRect(pos.x-32,pos.y-92,64,21);
   g.fillStyle='#fff4d9';g.fillText('PIP 🌱',pos.x,pos.y-77);
   g.restore();
  }
 }
 function advance(dt){neighbors.advance(dt);rituals.follow(dt);worldKeepsakes.advance(dt)}
 function hit(x,y,scene){
  if(scene!==api.getScene?.()||!inPlace()||!Number.isFinite(x)||!Number.isFinite(y))return false;
  const p=position();return Math.abs(x-p.x)<=46&&Math.abs(y-(p.y-46))<=71;
 }
 function handle(action,id){
  if(action.startsWith('pr273-'))return routines.handle(action,id);
  if(action.startsWith('pn275-'))return neighbors.handle(action,id);
  if(action.startsWith('ph276-'))return homeHelp.handle(action,id);
  if(action.startsWith('pd277-'))return dreams.handle(action,id);
  if(action.startsWith('pi278-'))return projects.handle(action,id);
  if(action.startsWith('pm279-'))return guides.handle(action,id);
  if(action.startsWith('pg280-'))return growth.handle(action,id);
  if(action.startsWith('pa281-'))return adventures.handle(action,id);
  if(action.startsWith('ph284-'))return helpers.handle(action,id);
  if(action.startsWith('pw285-'))return worldKeepsakes.handle(action,id);
  if(action.startsWith('pr287-'))return responses.handle(action,id);
  if(action.startsWith('pl282-'))return familyLegacy.handle(action,id);
  if(action.startsWith('pf283-'))return rituals.handle(action,id);
  if(action==='ls272-book')return entry();
  if(action==='ls272-start')return begin(id);
  if(action==='ls272-choose')return choose(Number(id));
  if(action==='ls272-next')return page();
  if(action==='ls272-guardian')return guardian();
  if(action==='ls272-cancel'){session=null;api.notify?.('The afternoon can continue another time.');return entry()}
  if(action==='ls272-close'){session=null;return api.closeModal?.()}
  return false;
 }
 return {status,position,entry,begin,choose,page,guardian,canBegin,hit,draw,handle,tick,advance,routines,neighbors,homeHelp,dreams,projects,guides,growth,adventures,helpers,worldKeepsakes,responses,familyLegacy,rituals,get data(){return data()},get session(){return session},CHILD,ACTIONS};
}
root.HearthLittleSprouts={setup,clean,defaults,CHILD,ACTIONS};
})(window);

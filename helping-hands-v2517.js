/* Hearth & Harbor v2.5.17 — Helping Hands
 * Real in-home collaborative chores: player arrives, interacts, then a real
 * resident joins an animated scene. No reward without completion or guest.
 */
(function(root){'use strict';
const PEOPLE=['mabel','rosie','oliver','jun','bea','finn'];
const HOMES=['h0','h1','h2','h3','h4','h5'];
const NAMES={mabel:'Mabel',rosie:'Rosie',oliver:'Oliver',jun:'Jun',bea:'Bea',finn:'Finn'};
const PLANS={
 garden:{title:'Window Garden',icon:'🪴',station:{x:464,y:768},intro:'Help your neighbor give the little window plants some care.',story:'Together you made room for something lovely to grow.',steps:[
  {ask:'Prepare the pot for fresh soil',answer:'soil',options:[['soil','🟤 Soft soil'],['paint','🎨 Paint'],['book','📖 Book']]},
  {ask:'Give the new roots a gentle drink',answer:'water',options:[['water','💧 Watering can'],['scarf','🧣 Scarf'],['lamp','💡 Lamp']]},
  {ask:'Help the new leaves greet the light',answer:'sun',options:[['sun','☀️ Sunny sill'],['box','📦 Storage box'],['shade','🌙 Dark cupboard']]}]},
 tidy:{title:'Cozy Sorting',icon:'🧺',station:{x:615,y:788},intro:'Find the right homes for all the little objects around the room.',story:'A freshly cared-for room feels wonderful when you share the work.',steps:[
  {ask:'Where should the storybook go?',answer:'shelf',options:[['shelf','📚 Book shelf'],['sink','🚰 Sink'],['garden','🪴 Plant pot']]},
  {ask:'Where should the soft scarf go?',answer:'basket',options:[['chair','🪑 Chair'],['basket','🧺 Linen basket'],['oven','🥧 Oven']]},
  {ask:'Where should the cushions settle?',answer:'sofa',options:[['sofa','🛋️ Cozy sofa'],['door','🚪 Doorstep'],['pond','🎣 Pond']]}]},
 craft:{title:'Memory Craft',icon:'🎨',station:{x:737,y:783},intro:'Work together on a tiny handmade decoration for the household.',story:'Your little handmade details gave the home a story of its own.',steps:[
  {ask:'Choose the paper for the keepsake',answer:'paper',options:[['paper','📜 Handmade paper'],['stone','🪨 Pebble'],['pot','🍲 Cooking pot']]},
  {ask:'Choose a cheerful little detail',answer:'flower',options:[['spoon','🥄 Spoon'],['flower','🌸 Pressed flower'],['boot','👢 Rain boot']]},
  {ask:'Finish the craft so it will last',answer:'ribbon',options:[['ribbon','🎀 Soft ribbon'],['water','💧 Water'],['sand','🏖️ Sand']]}]}
};
const PLAN_IDS=Object.keys(PLANS);
const valid=o=>o!==null&&typeof o==='object'&&!Array.isArray(o);
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
function clean(input){
 const raw=valid(input)?input:{},days={},counts={},memories=[];
 for(const id of PEOPLE){
  const d=raw.days?.[id],n=raw.counts?.[id];
  days[id]=Number.isInteger(d)&&d>=1&&d<=9999?d:0;
  counts[id]=Number.isInteger(n)?clamp(n,0,9999):0;
 }
 if(Array.isArray(raw.memories)){
  for(const row of raw.memories.slice(-160)){
   if(!valid(row)||!PEOPLE.includes(row.id)||!HOMES.includes(row.home)||!PLAN_IDS.includes(row.plan)||!Number.isInteger(row.day)||row.day<1||row.day>9999)continue;
   if(memories.some(m=>m.day===row.day&&m.id===row.id))continue;
   memories.push({id:row.id,home:row.home,plan:row.plan,day:row.day});
  }
 }
 return {days,counts,memories:memories.slice(-36)};
}
function setup(api){
 const {getState,getScene,getHome,getMembers,getResidentNeeds,save,updateUI,notify,showModal,closeModal,walkTo}=api;
 const state=()=>getState();
 const store=()=>{
  const s=state();
  if(!valid(s.helpingHands)||!valid(s.helpingHands.days)||!valid(s.helpingHands.counts)||!Array.isArray(s.helpingHands.memories))s.helpingHands=clean(s.helpingHands);
  return s.helpingHands;
 };
 const home=()=>getScene()==='residence'&&HOMES.includes(getHome())?getHome():null;
 const members=()=>home()?[...new Set(getMembers().filter(id=>PEOPLE.includes(id)))].slice(0,2):[];
 const ready=id=>members().includes(id)&&store().days[id]!==state().day;
 let pending=null,scene=null;
 const paragraph=(x)=>String(x).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 function board(){
  pending=null;
  const h=home(),crew=members();
  const cards=crew.map(id=>{
   const done=store().days[id]===state().day;
   return '<article class="hh-person"><div class="hh-character">'+({mabel:'🌷',rosie:'🍎',oliver:'🥐',jun:'📖',bea:'🎨',finn:'🐟'}[id])+'</div><div class="hh-member"><b>'+NAMES[id]+'</b><small>'+ (done?'✓ Helped at home today · tomorrow is another day':'Ready to help · choose a hands-on project')+'</small><div class="hh-task-picker">'+PLAN_IDS.map(p=>'<button data-act="hh-select" data-id="'+id+'|'+p+'" '+(done?'disabled':'')+'>'+PLANS[p].icon+' '+PLANS[p].title+'</button>').join('')+'</div></div></article>';
  }).join('');
  const history=store().memories.slice().reverse().filter(m=>!h||m.home===h).slice(0,9).map(m=>
   '<div class="hh-memory"><span>'+PLANS[m.plan].icon+'</span><p><b>'+NAMES[m.id]+' · '+PLANS[m.plan].title+'</b><small> Day '+m.day+' · '+PLANS[m.plan].story+'</small></p></div>').join('');
  showModal('helping-hands','<section class="hh-ui"><div class="hh-kicker">COOPERATIVE HOME LIFE</div><h2>🌷 Helping Hands</h2><p>Choose a real housemate and a project. Poppy walks over, then you work together through three easy tactile steps. Every resident can join one project each in-game day. No extra groceries or coins are needed.</p><div class="hh-banner">'+(!h?'Visit an occupied neighbor home to help out.':!crew.length?'This house needs residents before you can help together.':crew.length+' neighbor'+(crew.length===1?'':'s')+' currently at home · '+store().memories.filter(m=>m.home===h).length+' memories saved here')+'</div>'+cards+'<h3>Little memories</h3><div class="hh-history">'+(history||'<p>Finish a project with a neighbor to remember it here.</p>')+'</div><button data-act="hh-close" class="hh-close">Back to the household</button></section>');
 }
 function select(arg){
  const [id,plan]=String(arg).split('|');
  if(!PEOPLE.includes(id)||!PLAN_IDS.includes(plan)||!home()||!ready(id))return board();
  const p=PLANS[plan];
  pending={id,plan,home:home(),day:state().day,step:0,mistakes:0,stage:'walking'};
  closeModal();
  walkTo(p.station,()=>arrive());
 }
 function fresh(){
  return !!(pending&&home()===pending.home&&state().day===pending.day&&ready(pending.id));
 }
 function arrive(){
  if(!pending||pending.stage!=='walking')return false;
  if(!fresh()){pending=null;return false}
  pending.stage='playing';return renderStep();
 }
 function renderStep(){
  if(!pending||pending.stage!=='playing')return false;
  const task=PLANS[pending.plan],step=task.steps[pending.step];
  if(!step)return false;
  const title=NAMES[pending.id],n=pending.step;
  const options=step.options.map(([id,label])=>'<button data-act="hh-answer" data-id="'+id+'">'+label+'</button>').join('');
  showModal('helping-hands-activity','<div class="hh-ui hh-activity"><div class="hh-kicker">'+title.toUpperCase()+' & POPPY · '+task.title.toUpperCase()+'</div><h2>'+task.icon+' '+task.title+'</h2><p>'+task.intro+'</p><div class="hh-progress"><span>STEP '+(n+1)+' OF 3</span><div>'+task.steps.map((_,i)=>'<i class="'+(i<=n?'full':'')+'"></i>').join('')+'</div></div><div class="hh-stage"><div class="hh-partner">🌼</div><div class="hh-stage-center">'+task.icon+'<small>Working together</small></div><div class="hh-partner">'+({mabel:'🌷',rosie:'🍎',oliver:'🥐',jun:'📖',bea:'🎨',finn:'🐟'}[pending.id])+'</div></div><h3>'+step.ask+'</h3><div class="hh-choices">'+options+'</div><small class="hh-hint">'+(pending.mistakes?'Try a different item — there is no penalty.':'Choose the object that makes sense for this step.')+'</small><button class="hh-close" data-act="hh-cancel">Leave this project (no rewards lost)</button></div>');
  return true;
 }
 function answer(input){
  if(!pending||pending.stage!=='playing')return false;
  if(!fresh()){pending=null;closeModal();return false}
  const task=PLANS[pending.plan],step=task.steps[pending.step];
  if(!step.options.some(([id])=>id===input))return false;
  if(input!==step.answer){pending.mistakes++;notify('A little mix-up! You can try again.');renderStep();return false}
  pending.step++;pending.mistakes=0;
  if(pending.step<task.steps.length){renderStep();return true}
  return finish();
 }
 function finish(){
  if(!pending||pending.stage!=='playing'||pending.step!==3||!fresh())return false;
  const p=pending,r=store(),s=state(),neighbor=getResidentNeeds(p.id);
  // Claim once BEFORE any rewards; no repeated taps can create another completion.
  r.days[p.id]=s.day;
  r.counts[p.id]=clamp(r.counts[p.id]+1,0,9999);
  r.memories.push({id:p.id,home:p.home,plan:p.plan,day:p.day});
  r.memories=r.memories.slice(-36);
  if(valid(neighbor)){
   neighbor.social=clamp((neighbor.social||0)+10,0,100);
   neighbor.fun=clamp((neighbor.fun||0)+8,0,100);
  }
  if(valid(s.needs)){
   s.needs.social=clamp((s.needs.social||0)+8,0,100);
   s.needs.fun=clamp((s.needs.fun||0)+7,0,100);
  }
  if(!valid(s.relations))s.relations={};
  s.relations[p.id]=clamp((s.relations[p.id]||0)+3,0,100);
  scene={...p,elapsed:0,duration:18,start:typeof api.onSceneStart==='function'?api.onSceneStart(p.id):null};
  pending=null;
  save();updateUI();
  showModal('helping-hands-result','<div class="hh-ui"><div class="hh-kicker">A LITTLE JOB, DONE TOGETHER</div><h2>'+PLANS[p.plan].icon+' '+PLANS[p.plan].title+'</h2><div class="hh-result">🌼 💗 '+({mabel:'🌷',rosie:'🍎',oliver:'🥐',jun:'📖',bea:'🎨',finn:'🐟'}[p.id])+'</div><p>'+PLANS[p.plan].story+'</p><div class="hh-banner">A memory was saved! Poppy and '+NAMES[p.id]+' both feel happier and closer today.'+(r.counts[p.id]===3?' ✨ Three little projects together — a keepsake is now on the wall!':'')+'</div><button class="hh-main" data-act="hh-board">See our little memories</button><button data-act="hh-close" class="hh-close">Return home</button></div>');
  notify('You and '+NAMES[p.id]+' made a lovely little memory! 💗');
  return true;
 }
 function cancel(){pending=null;closeModal();notify('The project can be enjoyed another time. No rewards were claimed.');}
 function active(){return !!(scene&&home()===scene.home&&state().day===scene.day&&members().includes(scene.id)&&scene.elapsed<scene.duration);}
 function update(dt){
  if(!scene)return;
  if(!active()){scene=null;return}
  if(typeof api.isPaused==='function'&&api.isPaused())return;
  if(typeof api.isModalOpen==='function'&&api.isModalOpen())return;
  if(!Number.isFinite(dt)||dt<=0)return;
  scene.elapsed+=Math.min(dt,.1);
  if(scene.elapsed>=scene.duration){
   if(typeof api.onSceneEnd==='function')api.onSceneEnd(scene.id);
   scene=null;
  }
 }
 function pose(id){
  if(!active()||id!==scene.id)return null;
  const p=PLANS[scene.plan].station,from=valid(scene.start)?scene.start:p;
  const t=Math.min(1,scene.elapsed/3),ease=t*t*(3-2*t);
  return {x:from.x+(p.x+74-from.x)*ease,y:from.y+(p.y+12-from.y)*ease,
   moving:t<1,dir:'front',expression:'happy',phase:'help',act:PLANS[scene.plan].icon};
 }
 function draw(g,{home:h,tick=0}={}){
  if(!HOMES.includes(h))return;
  const r=store(),mem=r.memories.filter(m=>m.home===h),keepsake=mem.length>=3;
  if(!keepsake&&!active())return;
  g.save();
  if(keepsake){
   const x=814,y=198;
   g.fillStyle='#7e5b48';g.fillRect(x-25,y-24,50,48);
   g.fillStyle='#e4bd88';g.fillRect(x-21,y-20,42,40);
   g.fillStyle='#fff2d7';g.fillRect(x-17,y-16,34,32);
   g.fillStyle='#89b695';g.fillRect(x-10,y+5,20,6);
   g.fillStyle='#e7a2b0';g.beginPath();g.ellipse(x,y-2,9,9,0,0,Math.PI*2);g.fill();
  }
  if(active()&&h===scene.home){
   const p=PLANS[scene.plan].station;
   g.globalAlpha=.85;g.fillStyle='#886754';g.fillRect(p.x-47,p.y-28,94,27);
   g.fillStyle='#e6c79b';g.fillRect(p.x-53,p.y-34,106,12);
   g.globalAlpha=1;
   for(let i=0;i<3;i++){
    g.fillStyle=i%2?'#eaa7b7':'#9ccb98';g.beginPath();
    g.ellipse(p.x-27+i*27,p.y-42+Math.sin(tick*3+i)*3,8,6,0,0,Math.PI*2);g.fill();
   }
  }
  g.restore();
 }
 function handle(action,id){
  if(action==='hh-board')return board();
  if(action==='hh-select')return select(id);
  if(action==='hh-answer')return answer(id);
  if(action==='hh-cancel')return cancel();
  if(action==='hh-close'){pending=null;return closeModal()}
 }
 return {board,select,arrive,renderStep,answer,finish,cancel,handle,active,pose,draw,update,record:store};
}
root.HearthHelpingHands={setup,clean,PLANS,PEOPLE,HOMES};
})(window);

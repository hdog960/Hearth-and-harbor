/* Hearth & Harbor v2.7.2 — Little Sprouts.
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
const defaults=()=>({guardian:null,guardianDay:0,needs:{joy:62,curiosity:55,confidence:50},daily:{day:0,done:[]},days:[],memories:[]});
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
 const safeDaily=validDay(daily.day)?daily.day:0;
 const done=Array.isArray(daily.done)?[...new Set(daily.done.filter(x=>KINDS.includes(x)))].slice(0,3):[];
 return {guardian,guardianDay,needs:Object.fromEntries(Object.keys(d.needs).map(k=>[k,typeof needs[k]==='number'&&Number.isFinite(needs[k])?clamp(needs[k]):d.needs[k]])),daily:{day:safeDaily,done},days,memories:memories.slice(-40)};
}
function setup(api){
 const state=()=>api.getState(),data=()=>{
  const s=state();if(!obj(s.youngResidents)||!obj(s.youngResidents.pip))s.youngResidents={pip:defaults()};
  const c=s.youngResidents.pip;
  if(!obj(c.needs)||!obj(c.daily)||!Array.isArray(c.days)||!Array.isArray(c.memories))s.youngResidents.pip=clean(c);
  return s.youngResidents.pip;
 };
 let session=null;
 const day=()=>validDay(state().day)?state().day:1;
 const isHome=()=>data().guardian==='player';
 const home=()=>isHome()?'player':null;
 const inPlace=()=>api.getScene?.()===(isHome()?'home':'town');
 const position=()=>{
  if(isHome())return {x:765,y:756};
  const slot=Math.floor(((state().minute||0)%1440)/360)%4;
  return [{x:790,y:898},{x:680,y:896},{x:733,y:821},{x:790,y:898}][slot];
 };
 function status(){
  const d=data(),today=day(),current=d.daily.day===today?d.daily.done:[],ready=new Set(d.memories.filter(m=>m.day<=today).map(m=>m.day)).size>=3&&KINDS.every(k=>d.memories.some(m=>m.kind===k&&m.day<=today));
  return {id:'pip',name:'Pip',stage:'Child',guardian:d.guardian,guardianDay:d.guardianDay,home:home(),day:today,needs:{...d.needs},done:current.slice(),careDays:d.days.length,ready,memories:d.memories.slice()};
 }
 const canBegin=kind=>{
  if(!KINDS.includes(kind)||session)return false;
  if(!inPlace()||!api.isNearby?.(position(),115))return false;
  const d=data();return d.daily.day!==day()||!d.daily.done.includes(kind);
 };
 function entry(){
  const d=data(),s=status(),friend=s.guardian?'Your home is Pip’s safe place.':'Pip visits Maplewood from a nearby family home.';
  const bars=Object.entries(s.needs).map(([key,val])=>'<div class="ls272-stat"><label>'+esc(key[0].toUpperCase()+key.slice(1))+' · '+val+'/100</label><span><i style="width:'+val+'%"></i></span></div>').join('');
  const nearby=inPlace()&&api.isNearby?.(position(),115);
  const activities=KINDS.map(k=>'<button data-act="ls272-start" data-id="'+k+'" '+(s.done.includes(k)||!nearby?'disabled':'')+'><b>'+ACTIONS[k].icon+' '+ACTIONS[k].name+'</b><small>'+(s.done.includes(k)?'A happy memory already made today':!nearby?'Visit Pip in the world first':'Play a real three-part activity together')+'</small></button>').join('');
  api.showModal?.('little-sprouts','<section class="ls272-book"><header class="ls272-cover"><small>GENERATIONS · THE FIRST LITTLE SPROUT</small><h2>🌱 Pip’s Daybook</h2><p>'+friend+' Pip is a child and has their own needs, drawings and memories—not adult jobs or romance.</p></header><div class="ls272-profile"><span>🌼</span><div><b>Pip · Child</b><small>'+(s.guardian?'Poppy is Pip’s chosen guardian · since Day '+s.guardianDay:'A young friend learning about Maplewood')+'</small></div></div>'+bars+'<p class="ls272-progress">'+s.careDays+' / 3 different care days · All three kinds of shared activities needed to offer guardianship.</p><h3>Spend a real afternoon together</h3>'+(nearby?'':'<button data-act="ls272-visit">📍 Visit Pip in the playable world</button>')+'<div class="ls272-choices">'+activities+'</div>'+(s.ready&&!s.guardian&&nearby?'<div class="ls272-guardian"><strong>🏡 An invitation of trust</strong><p>After these real shared days, you may choose to welcome Pip into your cottage as a guardian. This is optional, not automatic. Pip will live with you in the playable cottage, while other adults and save records remain unchanged.</p><button data-act="ls272-guardian">🌷 Become Pip’s guardian</button></div>':'')+(s.guardian?'<div class="ls272-guardian"><strong>🏡 Your shared cottage</strong><p>Pip lives at your cottage and joins you for stories, nature walks and sketching. No forced aging, penalties or invented biological family links.</p></div>':'')+'<h3>Our actual memories</h3><ul class="ls272-memories">'+(s.memories.length?s.memories.slice(-12).reverse().map(m=>'<li>Day '+m.day+' · '+ACTIONS[m.kind].icon+' '+ACTIONS[m.kind].name+'</li>').join(''):'<li>Spend time together to start a genuine scrapbook.</li>')+'</ul><button class="ls272-secondary" data-act="ls272-close">Close Pip’s Daybook</button></section>');
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
  const pos=position(),phase=Math.sin(tick*2.5)*1.5;
  drawSprite(CHILD,pos.x,pos.y+phase);
  if(scene==='town'||scene==='home'){
   g.save();g.font='bold 13px monospace';g.textAlign='center';
   g.fillStyle='#39685c';g.fillRect(pos.x-32,pos.y-92,64,21);
   g.fillStyle='#fff4d9';g.fillText('PIP 🌱',pos.x,pos.y-77);
   g.restore();
  }
 }
 function hit(x,y,scene){
  if(scene!==api.getScene?.()||!inPlace()||!Number.isFinite(x)||!Number.isFinite(y))return false;
  const p=position();return Math.abs(x-p.x)<=46&&Math.abs(y-(p.y-46))<=71;
 }
 function handle(action,id){
  if(action==='ls272-book')return entry();
  if(action==='ls272-start')return begin(id);
  if(action==='ls272-choose')return choose(Number(id));
  if(action==='ls272-next')return page();
  if(action==='ls272-guardian')return guardian();
  if(action==='ls272-cancel'){session=null;api.notify?.('The afternoon can continue another time.');return entry()}
  if(action==='ls272-close'){session=null;return api.closeModal?.()}
  return false;
 }
 return {status,position,entry,begin,choose,page,guardian,canBegin,hit,draw,handle,tick,get data(){return data()},get session(){return session},CHILD,ACTIONS};
}
root.HearthLittleSprouts={setup,clean,defaults,CHILD,ACTIONS};
})(window);

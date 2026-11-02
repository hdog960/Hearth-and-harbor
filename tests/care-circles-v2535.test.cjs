/* Hearth & Harbor v2.5.35 — Little Acts of Care genuine activity QA */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const w={window:{}};vm.runInNewContext(read('care-circles-v2535.js'),w,{filename:'care-circles-v2535.js'});
const C=w.window.HearthCareCircles;
function fixture(overrides={}){
 const homeOf={mabel:'h0',rosie:'h0',oliver:'h1',jun:'h1',bea:'h2',finn:'h2'};
 const needs={};const done={},plans={};for(const id of C.IDS){needs[id]={food:55,energy:55,fun:55,social:55};done[id]=[]}
 const state={day:1,coins:200,needs:{social:50},householdFunds:{},townBonds:{'mabel|rosie':5},careCircles:C.clean(null),...overrides};
 let saves=0,updates=0,modal={key:'',html:''};const notices=[];
 const api={getState:()=>state,save:()=>saves++,updateUI:()=>updates++,notify:x=>notices.push(x),
  getResidentHome:id=>homeOf[id],getHomeMembers:home=>Object.keys(homeOf).filter(id=>homeOf[id]===home),
  getPersonLabel:id=>({mabel:'Mabel',rosie:'Rosie',oliver:'Oliver',jun:'Jun',bea:'Bea',finn:'Finn'})[id],
  getHomeLabel:home=>'Cottage '+home,getNeeds:id=>needs[id],getDone:id=>done[id],
  getSchedule:(_home,id)=>plans[id]||[],addSchedule:(_home,id,action)=>{
   if((plans[id]||[]).length>=3)return false;
   (plans[id]??=[]).push(action);saves++;return true;
  },showModal:(key,html)=>modal={key,html},back:()=>modal={key:'daybook',html:'Home Daybook'}};
 const c=C.setup(api);return {state,homeOf,needs,done,plans,c,api,notices,get saves(){return saves},get updates(){return updates},get modal(){return modal}};
}
const care=(f,recipient='rosie',need='food',home='h0')=>{assert.equal(f.c.choose(home,recipient,need),true);return f.c.current(home)};
const finish=(f,recipient='rosie',need='food',home='h0')=>{
 const r=care(f,recipient,need,home);return f.c.completed(home,r.carer,C.CARE[need].action,true,f.state.day);
};
function canvas(){return {n:0,save(){this.n++},restore(){this.n++},translate(){this.n++},fillRect(){this.n++},
 beginPath(){this.n++},arc(){this.n++},ellipse(){this.n++},fill(){this.n++},stroke(){this.n++},strokeRect(){this.n++},
 fillText(){this.n++}}}
test('legacy save initializes optional empty care history and six real homes',()=>{
 const f=fixture();assert.equal(JSON.stringify(f.c.data),JSON.stringify({requests:{},daily:{},personDaily:{},history:[],keepsakes:[]}));
 assert.equal(C.HOMES.length,6);assert.equal(Object.keys(C.CARE).length,4);assert.equal(f.c.comfort('h0'),0);
});
test('import rejects forged home, identity, day, status and need',()=>{
 const c=C.clean({requests:{
  h0:{day:2,carer:'mabel',recipient:'rosie',need:'food',status:'pending'},
  h1:{day:2,carer:'oliver',recipient:'oliver',need:'food',status:'pending'},
  h2:{day:2,carer:'hacker',recipient:'bea',need:'food',status:'pending'},
  h3:{day:0,carer:'bea',recipient:'finn',need:'social',status:'pending'},
  h4:{day:2,carer:'mabel',recipient:'rosie',need:'unknown',status:'pending'},
  h5:{day:2,carer:'mabel',recipient:'rosie',need:'food',status:'paid'}
 }});
 assert.equal(Object.keys(c.requests).length,1);
 assert.equal(c.requests.h0.recipient,'rosie');
});
test('import bounds deduplicated true-shaped history and six known unique keepsake homes',()=>{
 const x=C.clean({history:[
  {home:'h0',day:2,carer:'mabel',recipient:'rosie',need:'food'},
  {home:'h0',day:2,carer:'mabel',recipient:'rosie',need:'food'},
  {home:'h0',day:3,carer:'mabel',recipient:'mabel',need:'food'},
  {home:'h9',day:1,carer:'mabel',recipient:'rosie',need:'food'}
 ],keepsakes:['h0','h0','h5','h9'],personDaily:{mabel:3,hacker:2}});
 assert.equal(x.history.length,1);assert.equal(JSON.stringify(x.keepsakes),JSON.stringify(['h0','h5']));
 assert.equal(Object.keys(x.personDaily).length,1);
});
test('cannot ask for care without two current housemates or invent a third person',()=>{
 const f=fixture();assert.equal(f.c.choose('h4','mabel','food'),false);
 f.homeOf.mabel='h5';assert.equal(f.c.choose('h0','rosie','food'),false);
 assert.equal(f.c.choose('h0','fake','food'),false);assert.equal(f.saves,0);
});
test('only a real need below 60 can unlock an appropriate care response',()=>{
 const f=fixture();f.needs.rosie.food=60;
 assert.equal(f.c.choose('h0','rosie','food'),false);
 f.needs.rosie.food=59;assert.equal(f.c.choose('h0','rosie','food'),true);
 assert.equal(f.c.current('h0').need,'food');
});
test('the four distinct needs use existing meal, chat, read and tidy household actions',()=>{
 const mapping={food:'meal',social:'chat',fun:'read',energy:'tidy'};
 for(const [need,action] of Object.entries(mapping)){
  const f=fixture();const r=care(f,'rosie',need);
  assert.equal(C.CARE[need].action,action);assert.equal(r.carer,'mabel');
 }
});
test('care cannot be promised after caregiver has already finished corresponding action today',()=>{
 const f=fixture();f.done.mabel.push('meal');
 assert.equal(f.c.choose('h0','rosie','food'),false);
 assert.equal(f.saves,0);
});
test('starting a request only records intention and never changes needs, cash or relationships',()=>{
 const f=fixture(),r=care(f);
 assert.equal(r.recipient,'rosie');assert.equal(f.saves,1);
 assert.equal(f.needs.rosie.food,55);assert.equal(f.state.coins,200);
 assert.equal(f.state.townBonds['mabel|rosie'],5);assert.equal(f.c.data.history.length,0);
});
test('an active caring request cannot be accidentally replaced without cancellation',()=>{
 const f=fixture();care(f);
 assert.equal(f.c.choose('h0','mabel','energy'),false);
 assert.equal(f.c.current('h0').need,'food');
 assert.equal(f.c.cancel('h0'),true);
 assert.equal(f.c.choose('h0','mabel','energy'),true);
});
test('cancellation removes pending work but grants nothing and can be used once',()=>{
 const f=fixture();care(f);assert.equal(f.c.cancel('h0'),true);
 assert.equal(f.c.current('h0'),null);assert.equal(f.c.cancel('h0'),false);
 assert.equal(f.needs.rosie.food,55);assert.equal(f.c.data.history.length,0);
 assert.equal(f.state.coins,200);
});
test('a real correct first-time completed caregiver action restores need and records kindness',()=>{
 const f=fixture(),r=finish(f);
 assert.equal(r.need,'food');assert.equal(r.gain,12);
 assert.equal(f.needs.rosie.food,67);assert.equal(f.needs.mabel.social,57);
 assert.equal(f.state.townBonds['mabel|rosie'],6);
 assert.equal(f.c.data.history.length,1);assert.equal(f.c.current('h0'),null);
 assert.equal(f.saves,1,'genuine completed household activity already owns save');
});
test('wrong caregiver, action, home and repeated activity never award a rescue',()=>{
 const f=fixture();care(f);
 for(const args of [['h0','rosie','meal',true,1],['h0','mabel','read',true,1],
 ['h1','mabel','meal',true,1],['h0','mabel','meal',false,1],['h0','mabel','meal',true,2]]){
  assert.equal(f.c.completed(...args),false);
 }
 assert.equal(f.c.data.history.length,0);assert.equal(f.needs.rosie.food,55);
});
test('one completed act of care per home/day prevents repeated help from farming rewards',()=>{
 const f=fixture();finish(f);
 for(let i=0;i<12;i++)assert.equal(f.c.completed('h0','mabel','meal'),false);
 assert.equal(f.c.choose('h0','mabel','social'),false);
 assert.equal(f.c.data.history.length,1);assert.equal(f.state.townBonds['mabel|rosie'],6);
});
test('daily recipient and caregiver guards persist even if residents change homes',()=>{
 const f=fixture();finish(f);
 f.homeOf.rosie='h1';f.homeOf.jun='h0';
 assert.equal(f.c.choose('h1','rosie','food'),false);
 assert.equal(f.c.choose('h0','mabel','food'),false);
});
test('moving the recipient during a pending request never grants ghost care',()=>{
 const f=fixture();care(f);f.homeOf.rosie='h3';
 assert.equal(f.c.current('h0'),null);
 assert.equal(f.c.completed('h0','mabel','meal'),false);
 assert.equal(f.c.data.history.length,0);
});
test('an uncompleted request expires next day without a memory or help',()=>{
 const f=fixture();care(f);f.state.day=2;
 assert.equal(f.c.current('h0'),null);
 assert.equal(f.c.completed('h0','mabel','meal'),false);
 assert.equal(f.c.data.history.length,0);
});
test('new real days allow more care and three genuine days earn one unique permanent quilt',()=>{
 const f=fixture();for(let day=1;day<=3;day++){f.state.day=day;f.needs.rosie.food=55;const r=finish(f);assert.equal(r.keepsake,day===3)}
 assert.equal(f.c.data.history.length,3);assert.equal(f.c.comfort('h0'),2);
 assert.equal(JSON.stringify(f.c.data.keepsakes),JSON.stringify(['h0']));
});
test('more caring days never duplicate a keepsake or exceed the two comfort points',()=>{
 const f=fixture();for(let day=1;day<=5;day++){f.state.day=day;f.needs.rosie.food=55;finish(f)}
 assert.equal(f.c.data.keepsakes.length,1);assert.equal(f.c.comfort('h0'),2);
});
test('different homes hold independent requests, completions and keepsake ownership',()=>{
 const f=fixture();care(f,'rosie','food','h0');
 const r=f.c.choose('h1','jun','food');assert.equal(r,true);
 assert.equal(f.c.completed('h1','oliver','meal').home,'h1');
 assert.equal(f.c.data.history.length,1);
 assert.ok(f.c.current('h0'));
 assert.equal(f.c.comfort('h0'),0);assert.equal(f.c.comfort('h1'),0);
});
test('real care is capped: target already satiated by other real actions is never overfilled',()=>{
 const f=fixture();care(f);f.needs.rosie.food=99;
 const out=f.c.completed('h0','mabel','meal',true,1);
 assert.equal(out.gain,0);assert.equal(f.needs.rosie.food,99);
 assert.equal(f.c.data.history.length,1);
});
test('needs and bonds always stay at 100 or lower with no invented cash',()=>{
 const f=fixture();care(f);
 f.needs.mabel.social=100;f.state.townBonds['mabel|rosie']=100;
 f.c.completed('h0','mabel','meal');
 assert.equal(f.needs.mabel.social,100);
 assert.equal(f.state.townBonds['mabel|rosie'],100);
 assert.equal(f.state.coins,200);
});
test('a real saved care record and earned quilt survive JSON save/reload',()=>{
 const f=fixture();for(let day=1;day<=3;day++){f.state.day=day;f.needs.rosie.food=55;finish(f)}
 const saved=JSON.parse(JSON.stringify(f.c.data));
 const reloaded=fixture({day:4,careCircles:C.clean(saved)});
 assert.equal(reloaded.c.comfort('h0'),2);
 assert.equal(reloaded.c.data.history.length,3);
 assert.equal(reloaded.c.current('h0'),null);
});
test('one-tap planning uses an existing schedule without replacing or duplicating tasks',()=>{
 const f=fixture();care(f);f.plans.mabel=['read','meal'];
 assert.equal(f.c.queue('h0'),true);
 assert.equal(JSON.stringify(f.plans.mabel),JSON.stringify(['read','meal']));
 assert.equal(f.c.data.history.length,0);
});
test('full independent schedules are never overwritten by optional care planning',()=>{
 const f=fixture();care(f);f.plans.mabel=['rest','read','tidy'];
 assert.equal(f.c.queue('h0'),false);
 assert.equal(JSON.stringify(f.plans.mabel),JSON.stringify(['rest','read','tidy']));
});
test('a newly queued caring activity runs through existing schedule infrastructure, without reward',()=>{
 const f=fixture();care(f);
 assert.equal(f.c.queue('h0'),true);
 assert.equal(JSON.stringify(f.plans),JSON.stringify({mabel:['meal']}));
 assert.equal(f.c.data.history.length,0);assert.equal(f.needs.rosie.food,55);
});
test('the care journal lists actual resident needs and shows a genuine pending request',()=>{
 const f=fixture();care(f);f.c.view('h0');
 assert.equal(f.modal.key,'care-circles');
 assert.match(f.modal.html,/Little Acts of Care/);
 assert.match(f.modal.html,/Mabel is helping Rosie/);
 assert.equal((f.modal.html.match(/data-act="cc35-choose"/g)||[]).length,8);
 assert.match(f.modal.html,/data-act="cc35-queue"/);
 assert.match(f.modal.html,/data-act="cc35-cancel"/);
});
test('completed care changes UI only after actual activity and displays authentic memory',()=>{
 const f=fixture();finish(f);f.c.view('h0');
 assert.match(f.modal.html,/completed a meaningful caring activity today/);
 assert.match(f.modal.html,/Day 1/);
 assert.doesNotMatch(f.modal.html,/data-act="cc35-queue"/);
});
test('home selector, real action buttons and back route work without fake placeholders',()=>{
 const f=fixture();f.c.handle('cc35-view','h1','h0');assert.match(f.modal.html,/Cottage h1/);
 f.c.handle('cc35-choose','h0|rosie|food','h0');assert.equal(f.c.current('h0').need,'food');
 f.c.handle('cc35-cancel','h0','h0');assert.equal(f.c.current('h0'),null);
 f.c.handle('cc35-back',null,'h0');assert.equal(f.modal.key,'daybook');
});
test('the in-world home canvas draws real unfinished care and a permanent quilt after three days',()=>{
 const f=fixture(),g=canvas();f.c.draw(g,'h0');assert.equal(g.n,0);
 care(f);f.c.draw(g,'h0');assert.ok(g.n>9);
 f.c.cancel('h0');const before=g.n;f.c.draw(g,'h0');assert.equal(g.n,before);
 for(let day=1;day<=3;day++){f.state.day=day;f.needs.rosie.food=55;finish(f)}
 const n=g.n;f.c.draw(g,'h0');assert.ok(g.n>n+15);
 const x=g.n;f.c.draw(g,'h2');assert.equal(g.n,x);
});
test('completed real guided home actions integrate care in same existing save transaction',()=>{
 const f=fixture(),g=read('game.js'),a=g.indexOf('function runHouseholdAction(id,kind){'),b=g.indexOf('function queueHouseholdAction(kind){',a);
 assert.ok(a>=0&&b>a);
 const code=g.slice(a,b);
 const record={mabel:{done:[]},rosie:{done:[]}},people=[{id:'mabel',name:'Mabel'},{id:'rosie',name:'Rosie'}];
 let saved=0,updated=0;
 const context={
  HOME_ACTIONS:{meal:{icon:'🥣',desc:'A hot meal',boost:{food:14}}},
  scene:'residence',controlledResident:'mabel',activeResidence:'h0',state:f.state,
  lifeFor:id=>({needs:f.needs[id]}),residentDayRecord:id=>record[id],homeComfort:()=>25,
  clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),roomResidents:()=>people,
  NPCS:people,residentHome:()=> 'h0',
  homeAspirations:{recordAction(){}},traditions:{recordHome(){}},householdRoles:{complete(){}},
  functionalHomes:{reward(){}},manualDaybooks:{finish(){}},householdRhythms:{complete(){}},
  roommateProjects:{recordAction(){}},personalCorners:{recordAction(){}},mentorship:{completed(){}},
  careCircles:f.c,lifeSeasons:{completed(){},wisdom(){}},familyRoots:{completedChat(){}},chronicle:{collect(){}},notify(){},
  save:()=>saved++,updateUI:()=>updated++
 };
 care(f);vm.runInNewContext(code,context,{filename:'game-real-care-action.js'});
 context.runHouseholdAction('mabel','meal');
 assert.equal(f.c.data.history.length,1);assert.equal(f.needs.rosie.food>55,true);
 assert.equal(saved,1);assert.equal(updated,1);
 context.runHouseholdAction('mabel','meal');assert.equal(f.c.data.history.length,1);
 assert.equal(saved,2,'normal repeated activity may save but cannot grant repeated care');
});
test('actual guided and autonomous completion hooks, comfort and scene art exist in real game',()=>{
 const g=read('game.js');
 for(const term of ["HearthCareCircles.clean(raw.careCircles)","HearthCareCircles.setup({",
  "careCircles.completed(activeResidence,id,kind,true,state.day)",
  "careCircles.completed(activeResidence,n.id,kind,true,state.day)",
  "careCircles.comfort(home)","careCircles.draw(ctx,activeResidence)",
  "btn('💗 Little Acts of Care','cc35-board')",
  "if(action.startsWith('cc35-'))"])
  assert.ok(g.includes(term),term);
});
test('the app keeps prior save key, mentorship and housemate collaboration without new network',()=>{
 const g=read('game.js');for(const x of [
  "const SAVE='hearth-harbor-save-v1'","HearthMentorship.setup({","HearthFamilyRoots.setup({","HearthHouseholdChronicle.setup({",
  "HearthRoommateProjects.setup({"])assert.ok(g.includes(x),x);
 assert.doesNotMatch(read('care-circles-v2535.js'),/fetch\(|WebSocket|XMLHttpRequest|new Image\(|setInterval|localStorage|\.coins\s*[+]=/);
});
test('iPhone loads care logic/style before the real game and precaches them for offline use',()=>{
 const html=read('index.html'),sw=read('sw.js'),css=read('care-circles-v2535.css');
 for(const p of ['care-circles-v2535.js','care-circles-v2535.css'])assert.ok(html.includes(p)&&sw.includes("'./"+p+"'"));
 assert.ok(html.indexOf('care-circles-v2535.js')<html.indexOf('game.js'));
 assert.match(sw,/const CACHE='hearth-harbor-v[0-9]+-[a-z-]+'/);
 for(const p of ['@media(max-width:390px)','@media(min-width:710px)','touch-action:manipulation','button:focus-visible','prefers-reduced-motion:reduce'])assert.ok(css.includes(p),p);
});

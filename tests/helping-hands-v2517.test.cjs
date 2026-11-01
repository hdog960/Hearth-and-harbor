/* Hearth & Harbor v2.5.17 Helping Hands regression tests.
 * Run: node --test tests/helping-hands-v2517.test.cjs */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const js=read('helping-hands-v2517.js'),game=read('game.js'),index=read('index.html'),sw=read('sw.js');
const browser={window:{}};vm.runInNewContext(js,browser,{filename:'helping-hands-v2517.js'});
const H=browser.window.HearthHelpingHands;
function harness(){
 let home='h0',inScene='residence',members=['mabel','rosie'],arrive=null,modal=false,paused=false;
 let saved=0,ui=0,notices=[],modals=[],beginnings=[],endings=[];
 const state={day:1,minute:730,needs:{fun:25,social:30},relations:{mabel:20,rosie:19},
  residentLife:{mabel:{needs:{fun:30,social:35}},rosie:{needs:{fun:46,social:28}}},
  helpingHands:{days:{},counts:{},walls:{},memories:[]},townBonds:{},cooking:{dishes:[{id:'toast',quality:2}]},
  householdRhythms:{memories:[]},unrelated:{wedding:'preserved'}};
 const api={getState:()=>state,getScene:()=>inScene,getHome:()=>home,
  getMembers:()=>members,getResidentNeeds:id=>state.residentLife[id]?.needs||null,
  save:()=>saved++,updateUI:()=>ui++,notify:txt=>notices.push(txt),
  showModal:(id,markup)=>{modal=true;modals.push({id,markup})},closeModal:()=>{modal=false},
  walkTo:(dest,cb)=>{arrive={dest,cb}},isPaused:()=>paused,isModalOpen:()=>modal,
  onSceneStart:id=>{beginnings.push(id);return {x:350,y:650}},
  onSceneEnd:id=>endings.push(id)
 };
 const module=H.setup(api);
 return {module,state,modals,notices,beginnings,endings,
  walk:()=>arrive?.cb(),setHome:h=>home=h,setScene:s=>inScene=s,setMembers:ids=>members=ids,
  setPaused:v=>paused=v,closeModal:()=>{modal=false},
  get arrival(){return arrive},get saves(){return saved},get redraws(){return ui}};
}
function begin(x,id='mabel',kind='garden'){
 x.module.select(id+'|'+kind);
 assert.ok(x.arrival,'walk should start');
 assert.equal(x.walk(),true,'actual arrival starts the activity');
 assert.equal(x.modals.at(-1).id,'helping-hands-activity');
}
function finishSteps(x,kind){
 const plan=H.PLANS[kind];
 for(const step of plan.steps)assert.equal(x.module.answer(step.answer),true);
}
test('six real neighbors and three genuinely different hands-on activities are available',()=>{
 assert.equal(H.PEOPLE.length,6);assert.equal(Object.keys(H.PLANS).length,3);
 assert.equal(new Set(H.PEOPLE).size,6);
 assert.ok(Object.keys(H.PLANS).every(id=>H.PLANS[id].steps.length===3));
 const answers=Object.values(H.PLANS).map(p=>p.steps.map(s=>s.answer).join('|'));
 assert.equal(new Set(answers).size,3);
 for(const plan of Object.values(H.PLANS))for(const step of plan.steps){
  assert.equal(step.options.length,3);
  assert.equal(step.options.filter(o=>o[0]===step.answer).length,1);
 }
});
test('a home must be occupied by a real resident before a project can start',()=>{
 const x=harness();
 x.setScene('town');x.module.select('mabel|garden');assert.equal(x.arrival,null);
 x.setScene('residence');x.setMembers([]);x.module.select('mabel|garden');assert.equal(x.arrival,null);
 x.setMembers(['rosie']);x.module.select('mabel|garden');assert.equal(x.arrival,null);
 x.module.select('fake|garden');assert.equal(x.arrival,null);
 x.module.select('rosie|impossible');assert.equal(x.arrival,null);
 assert.equal(x.saves,0);
});
test('selecting a project makes Poppy travel and changes nothing until every step is complete',()=>{
 const x=harness();
 x.module.select('mabel|garden');
 assert.ok(x.arrival.dest.x>0);
 assert.equal(x.state.needs.fun,25);
 assert.equal(x.state.relations.mabel,20);
 assert.equal(x.state.helpingHands.memories.length,0);
 assert.equal(x.saves,0);
 assert.equal(x.walk(),true);
 const first=x.modals.at(-1).markup;
 assert.match(first,/STEP 1 OF 3/);assert.match(first,/data-act="hh-answer"/);
 assert.equal(x.state.cooking.dishes.length,1,'no cooking inventory touched');
 assert.equal(x.saves,0);
});
test('incorrect or unknown choices do not advance, consume, cost or punish',()=>{
 const x=harness();begin(x);
 assert.equal(x.module.answer('paint'),false);
 assert.equal(x.module.answer('__proto__'),false);
 assert.equal(x.saves,0);assert.equal(x.state.needs.fun,25);
 assert.match(x.modals.at(-1).markup,/Try a different item/);
 assert.match(x.modals.at(-1).markup,/STEP 1 OF 3/);
 assert.equal(x.module.answer('soil'),true);
 assert.match(x.modals.at(-1).markup,/STEP 2 OF 3/);
 assert.equal(x.module.answer('water'),true);
 assert.match(x.modals.at(-1).markup,/STEP 3 OF 3/);
});
test('each of the three activities can be completed and rewards are only awarded once per resident/day',()=>{
 const x=harness();
 const tasks=['garden','tidy','craft'],ids=['mabel','rosie','mabel'];
 for(let i=0;i<tasks.length;i++){
  x.state.day=i+1;
  begin(x,ids[i],tasks[i]);
  finishSteps(x,tasks[i]);
  assert.equal(x.state.helpingHands.memories.length,i+1);
  assert.equal(x.state.helpingHands.days[ids[i]],i+1);
  assert.equal(x.saves,i+1);
  assert.equal(x.module.answer(H.PLANS[tasks[i]].steps[2].answer),false,'repeat callback blocked');
 }
 assert.equal(x.state.relations.mabel,26);
 assert.equal(x.state.relations.rosie,22);
 assert.equal(x.state.needs.fun,46);
 assert.equal(x.state.needs.social,54);
 assert.equal(x.state.helpingHands.walls.h0,true,'third project earns a permanent house keepsake');
 assert.equal(x.state.cooking.dishes.length,1,'no ingredients consumed');
 assert.equal(x.state.unrelated.wedding,'preserved');
});
test('same-day cap survives imported saved state and different project choice',()=>{
 const x=harness();begin(x);finishSteps(x,'garden');
 x.state.helpingHands=H.clean(JSON.parse(JSON.stringify(x.state.helpingHands)));
 x.module.select('mabel|craft');
 assert.equal(x.modals.at(-1).id,'helping-hands','same-day entry blocked');
 assert.equal(x.saves,1);
 assert.equal(x.state.relations.mabel,23);
 x.state.day=2;
 begin(x,'mabel','craft');finishSteps(x,'craft');
 assert.equal(x.state.helpingHands.counts.mabel,2);
});
test('leaving before or during the task preserves all real needs and progress',()=>{
 const x=harness();x.module.select('mabel|tidy');
 x.module.cancel();assert.equal(x.saves,0);
 begin(x,'mabel','tidy');x.module.answer('shelf');
 x.module.cancel();assert.equal(x.saves,0);
 assert.equal(x.state.helpingHands.memories.length,0);
 assert.equal(x.state.relations.mabel,20);
 assert.equal(x.state.needs.social,30);
});
test('changed house, date or resident roster rejects stale arrival and in-progress completion',()=>{
 const cases=[
  x=>x.setHome('h1'),x=>x.state.day++,x=>x.setMembers(['rosie']),x=>x.setScene('town')
 ];
 for(const disturb of cases){
  const x=harness();x.module.select('mabel|craft');
  disturb(x);assert.equal(x.walk(),false);
  assert.equal(x.saves,0);
 }
 for(const disturb of cases){
  const x=harness();begin(x,'mabel','garden');x.module.answer('soil');
  disturb(x);assert.equal(x.module.answer('water'),false);
  assert.equal(x.saves,0);
 }
});
test('real character pose animates into position and gameplay pauses behind result modal',()=>{
 const x=harness();begin(x,'rosie','craft');finishSteps(x,'craft');
 assert.equal(x.beginnings.length,1);
 const at0=x.module.pose('rosie');assert.equal(at0.x,350);
 assert.equal(at0.y,650);assert.equal(at0.moving,true);
 assert.equal(x.module.pose('mabel'),null);
 x.module.update(.1);
 assert.equal(x.module.pose('rosie').x,350,'result modal pauses movement');
 x.closeModal();x.setPaused(true);x.module.update(.1);
 assert.equal(x.module.pose('rosie').x,350,'game pause blocks movement');
 x.setPaused(false);
 for(let i=0;i<45;i++)x.module.update(.1);
 assert.equal(x.module.pose('rosie').moving,false);
 for(let i=0;i<136;i++)x.module.update(.1);
 assert.equal(x.module.active(),false);
 assert.equal(x.endings.length,1);
});
test('house keepsake drawing remains after memories rotate out of the 36-slot scrapbook',()=>{
 const x=harness();for(let day=1;day<=3;day++){
  x.state.day=day;begin(x,'mabel',day===2?'tidy':day===1?'garden':'craft');
  finishSteps(x,day===2?'tidy':day===1?'garden':'craft');
 }
 let draws=0;const methods=new Set(['save','restore','fillRect','beginPath','ellipse','fill']);
 const c=new Proxy({},{get(o,k){return methods.has(k)?()=>draws++:o[k]}});
 x.module.draw(c,{home:'h0',tick:1});
 assert.ok(draws>=8);
 x.state.helpingHands.memories=[];
 x.state.day=99;
 const before=draws;x.module.draw(c,{home:'h0',tick:1});
 assert.ok(draws>before,'wall art remains independently unlocked');
 x.module.draw(c,{home:'h2',tick:1});assert.equal(x.state.helpingHands.walls.h2,false);
});
test('sanitizer rejects malicious keys, invalid names, unbounded counts and duplicate memories',()=>{
 const c=H.clean({
  days:{mabel:12,rosie:-3,unknown:999},
  counts:{mabel:999999,rosie:2},
  walls:{h0:true,h6:true},
  memories:[
   {id:'mabel',home:'h0',plan:'garden',day:12},
   {id:'mabel',home:'h0',plan:'craft',day:12},
   {id:'rosie',home:'h0',plan:'tidy',day:11},
   {id:'fake',home:'h0',plan:'garden',day:4},
   {id:'mabel',home:'h0',plan:'__proto__',day:5},
   {id:'rosie',home:'bad',plan:'tidy',day:6},
   {id:'jun',home:'h1',plan:'craft',day:0}
  ]
 });
 assert.equal(Object.keys(c.days).length,6);assert.equal(c.days.rosie,0);
 assert.equal(c.counts.mabel,9999);
 assert.equal(c.walls.h0,true);assert.equal(c.walls.h1,false);
 assert.equal(c.memories.length,2);
 assert.equal(H.clean(null).memories.length,0);
});
test('full game loads new actions, resident sprite choreography, save schema and offline styles',()=>{
 for(const part of [
  'window.HearthHelpingHands.clean(raw.helpingHands)',
  'helpingHands.handle(action,id)',
  'helpingHands.pose(n.id)',
  'helpingHands.draw(ctx',
  'helpingHands.active()',
  'helpingHands.update(dt)',
  "btn('🌷 Helping Hands · Together at Home','hh-board')"
 ])assert.ok(game.includes(part),'Missing integration: '+part);
 assert.ok(index.indexOf('helping-hands-v2517.js')<index.indexOf('game.js'));
 for(const asset of ['helping-hands-v2517.js','helping-hands-v2517.css']){
  assert.ok(index.includes(asset));assert.ok(sw.includes("'./"+asset+"'"));
 }
 assert.match(sw,/const CACHE='hearth-harbor-v[0-9]+-[a-z-]+'/); // Cache advances on every release.
});

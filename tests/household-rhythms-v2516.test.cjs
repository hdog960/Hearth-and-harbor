/* Hearth & Harbor v2.5.16 — Thoughtful Households regression tests
 * Run: node --test tests/household-rhythms-v2516.test.cjs
 */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const dir=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(dir,f),'utf8');
const core=read('game.js'),html=read('index.html'),sw=read('sw.js'),src=read('household-rhythms-v2516.js');
const window={};vm.runInNewContext(src,{window},{filename:'household-rhythms-v2516.js'});
const E=window.HearthHouseholdRhythms;
const good={food:83,energy:83,social:83,fun:83};
function harness(){
 const state={day:1,minute:12*60,residentLife:{},townBonds:{},townTensions:{'mabel|rosie':9},
  householdRhythms:{daily:{},memories:[]},unrelated:{otherGoals:12}};
 for(const id of E.PEOPLE)state.residentLife[id]={needs:{...good}};
 let home=['mabel','rosie'],saveCount=0,uiCount=0,notes=[];
 const plans={mabel:null,rosie:null},done={mabel:[],rosie:[]};
 const n=E.setup({
  getState:()=>state,getResidents:()=>home.map(id=>({id})),getAspiration:id=>plans[id]||null,
  getDone:id=>done[id]||[],save:()=>saveCount++,updateUI:()=>uiCount++,
  notify:x=>notes.push(x)
 });
 return {state,n,done,plans,notes,setHome:ids=>home=ids,
  get saves(){return saveCount},get updates(){return uiCount}};
}
test('all six distinct neighbors have valid personality-guided interests and actions',()=>{
 assert.equal(E.PEOPLE.length,6);
 assert.equal(Object.keys(E.PERSONALITY).length,6);
 assert.equal(new Set(E.PEOPLE).size,6);
 for(const id of E.PEOPLE){
  const p=E.PERSONALITY[id];
  assert.ok(p.title&&p.comfort&&p.icon);
  assert.ok(E.ACTIONS.includes(p.preferred));
 }
});
test('urgent personal needs always take priority over aspirations or social plans',()=>{
 const cases=[
  [{energy:16,food:10,social:5,fun:5},'rest'],
  [{energy:70,food:10,social:5,fun:5},'meal'],
  [{energy:70,food:70,social:10,fun:5},'chat'],
  [{energy:70,food:70,social:70,fun:10},'hobby']
 ];
 for(const [needs,action] of cases){
  const result=E.intention({id:'mabel',needs,done:[],roommate:true,
   aspiration:{action:'tidy',label:'A beautiful house'},minute:720});
  assert.equal(result.action,action);
  assert.equal(result.priority,'care');
 }
 assert.equal(E.intention({id:'mabel',needs:{...good,social:10},roommate:false}).action,'hobby');
});
test('an unfinished real aspiration step outranks casual interests after basic care',()=>{
 const x=harness();
 x.plans.mabel={action:'tidy',label:'Tend a beautiful home'};
 assert.equal(x.n.plan({id:'mabel'},[]).action,'tidy');
 assert.match(x.n.plan({id:'mabel'},[]).reason,/Tend a beautiful home/);
 assert.equal(x.n.plan({id:'mabel'},['tidy']).action,'chat');
 x.plans.mabel={action:'chat',label:'Connect with a neighbor'};
 x.setHome(['mabel']);
 assert.equal(x.n.plan({id:'mabel'},[]).action,'read','cannot have a fictional housemate');
});
test('a shared action is planned before hobbies, while personality matters after sharing',()=>{
 const x=harness();
 assert.equal(x.n.plan({id:'rosie'},[]).action,'chat');
 assert.equal(x.n.complete('mabel','chat'),true);
 assert.equal(x.n.plan({id:'mabel'},[]).action,'hobby');
 assert.equal(x.n.plan({id:'rosie'},[]).action,'chat','Rosie likes hosting even after shared moment');
 assert.equal(x.n.plan({id:'mabel'},['hobby']).action,'tidy');
});
test('the first completed household care interaction makes exactly one shared memory per pair/day',()=>{
 const x=harness();
 assert.equal(x.n.complete('mabel','chat'),true);
 assert.equal(x.state.householdRhythms.memories.length,1);
 assert.equal(x.state.householdRhythms.memories[0].action,'chat');
 assert.equal(x.state.townBonds['mabel|rosie'],2);
 assert.equal(x.state.townTensions['mabel|rosie'],7);
 assert.equal(x.state.residentLife.mabel.needs.social,88);
 assert.equal(x.state.residentLife.rosie.needs.social,90);
 assert.equal(x.n.complete('rosie','meal'),false,'cannot exploit different actor');
 assert.equal(x.n.complete('mabel','tidy'),false,'cannot exploit different action');
 assert.equal(x.state.householdRhythms.memories.length,1);
 assert.equal(x.state.townBonds['mabel|rosie'],2);
 assert.equal(x.saves,0,'actual action completion in main game owns persistence');
});
test('new day permits another moment but house changes and invalid actions never do',()=>{
 const x=harness();x.n.complete('mabel','chat');
 x.state.day=2;
 assert.equal(x.n.complete('rosie','meal'),true);
 assert.equal(x.state.householdRhythms.memories.length,2);
 assert.equal(x.state.townBonds['mabel|rosie'],4);
 x.setHome(['mabel']);
 assert.equal(x.n.complete('mabel','chat'),false,'solo resident cannot fabricate shared care');
 assert.equal(x.n.complete('be a','chat'),false);
 assert.equal(x.n.complete('mabel','hobby'),false,'only genuine shared care actions count');
 assert.equal(x.state.unrelated.otherGoals,12);
});
test('daily pair guard persists across reloads without duplicating friends, currency or inventory',()=>{
 const x=harness();
 x.n.complete('rosie','tidy');
 x.state.householdRhythms=E.clean(JSON.parse(JSON.stringify(x.state.householdRhythms)));
 assert.equal(x.n.todayPair('mabel','rosie'),true);
 assert.equal(x.n.complete('mabel','chat'),false);
 assert.equal(x.state.townBonds['mabel|rosie'],2);
 assert.equal(x.state.householdRhythms.memories.length,1);
 assert.equal(Object.keys(x.state).includes('coins'),false);
});
test('save sanitizer excludes invalid resident IDs, duplicate memories and malformed dates',()=>{
 const clean=E.clean({
  daily:{'mabel|rosie':4,'rosie|mabel':3,'mabel|hack':4,'mabel|jun':-1,'bea|finn':3},
  memories:[
   {day:4,actor:'mabel',other:'rosie',action:'chat'},
   {day:4,actor:'rosie',other:'mabel',action:'meal'},
   {day:3,actor:'bea',other:'finn',action:'tidy'},
   {day:3,actor:'mabel',other:'finn',action:'hobby'},
   {day:0,actor:'mabel',other:'jun',action:'chat'},
   {day:3,actor:'__proto__',other:'jun',action:'meal'}
  ]
 });
 assert.equal(Object.keys(clean.daily).length,2);
 assert.equal(clean.memories.length,2);
 assert.equal(E.clean(null).memories.length,0);
});
test('current-day emotional reaction only appears for residents actually in this home',()=>{
 const x=harness();
 assert.equal(x.n.reaction('mabel'),null);
 x.n.complete('mabel','tidy');
 assert.equal(x.n.reaction('mabel'),'🌿');
 assert.equal(x.n.reaction('rosie'),'🌿');
 x.setHome(['finn','jun']);
 assert.equal(x.n.reaction('mabel'),null);
 x.state.day=2;x.setHome(['mabel','rosie']);
 assert.equal(x.n.reaction('mabel'),null);
});
test('household Daybook displays believable daily intentions and dated memories',()=>{
 const x=harness();
 const p=x.n.panel();
 assert.match(p,/Household Rhythms/);
 assert.match(p,/Gentle gardener/);
 assert.match(p,/Warm host/);
 x.n.complete('mabel','meal');
 const doc=x.n.panel();
 assert.match(doc,/A little kitchen kindness|shared a simple homemade meal/);
 assert.match(doc,/Day 1/);
 assert.doesNotMatch(doc,/data-act="fake-reward"/);
});
test('main game connects autonomous and guided actions with aspirations, visible care and migration',()=>{
 for(const token of [
  'window.HearthHouseholdRhythms.clean(raw.householdRhythms)',
  'householdRhythms.plan(n,residentDayRecord(n.id).done)',
  'householdRhythms.complete(n.id,kind)',
  'householdRhythms.complete(id,kind)',
  'householdRhythms.panel()',
  'householdRhythms.reaction(n.id)',
  'homeAspirations.status(id)',
  'homeAspirations.PATHS[p.path]'
 ])assert.ok(core.includes(token),'integration missing '+token);
 assert.ok(html.indexOf('household-rhythms-v2516.js')<html.indexOf('game.js'));
 for(const asset of ['household-rhythms-v2516.js','household-rhythms-v2516.css']){
  assert.ok(html.includes(asset));assert.ok(sw.includes("'./"+asset+"'"));
 }
 assert.match(sw,/hearth-harbor-v2516-thoughtful-households/);
});

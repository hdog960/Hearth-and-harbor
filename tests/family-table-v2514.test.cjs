/* Hearth & Harbor v2.5.14 — At Our Table regressions.
   Run: node --test tests/family-table-v2514.test.cjs */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const moduleSrc=read('family-table-v2514.js'),core=read('game.js'),kitchen=read('kitchen.js');
const html=read('index.html'),worker=read('sw.js');
const browser={window:{}};vm.runInNewContext(moduleSrc,browser,{filename:'family-table-v2514.js'});
const F=browser.window.HearthFamilyTable;
const meals=[
 {id:'jam',quality:3},{id:'tart',quality:2},{id:'salad',quality:1},
 {id:'dumplings',quality:2},{id:'eggs',quality:1},{id:'toast',quality:3}
];
function harness(custom={}){
 let writes=0,redraw=0,walks=0,modals=[],notes=[],arrive,scene='residence',house='h0';
 let guests=['rosie','oliver'],homeMeal=0;
 const state={day:1,season:0,coins:100,hearts:3,
  needs:{hunger:25,social:35,fun:32},
  cooking:{dishes:meals.map(x=>({...x}))},
  residentLife:{
   rosie:{needs:{food:26,social:30,fun:45}},
   oliver:{needs:{food:35,social:38,fun:50}},
   mabel:{needs:{food:34,social:27,fun:32}}
  },
  relations:{rosie:10,oliver:6,mabel:2},
  townBonds:{},townTensions:{'oliver|rosie':9},
  familyTable:F.clean(null),unrelated:{wedding:'still here'},...custom};
 const module=F.setup({getState:()=>state,save:()=>writes++,updateUI:()=>redraw++,
  notify:x=>notes.push(x),showModal:(kind,html)=>modals.push({kind,html}),
  closeModal:()=>{},getScene:()=>scene,getHome:()=>house,getMembers:()=>guests,
  walkTo:(where,callback)=>{walks++;arrive=callback},
  openKitchen:()=>modals.push({kind:'kitchen'}),
  completeHomeMeal:()=>homeMeal++});
 return {state,module,notes,modals,
  setScene:(s,h)=>{scene=s;house=h??house},
  setGuests:x=>guests=x,
  arrive:()=>arrive?.(),
  get walks(){return walks},get writes(){return writes},get redraw(){return redraw},get homeMeal(){return homeMeal}};
}
function prepare(x,index=0,topic='remember'){
 x.module.pick(index);
 assert.equal(x.modals.at(-1).kind,'family-table-choice');
 x.module.start(topic);
}
test('12 supported recipes and all resident favorites exactly match the real kitchen',()=>{
 const source=kitchen.slice(kitchen.indexOf('const RECIPES={'),kitchen.indexOf('const STEP='));
 const ids=[...source.matchAll(/^\s*(\w+):\{name:/gm)].map(x=>x[1]).sort();
 assert.equal(ids.length,12);
 assert.equal(JSON.stringify(ids),JSON.stringify(Object.keys(F.RECIPES).sort()));
 assert.deepEqual(Object.keys(F.FAVORITES).sort(),['bea','finn','jun','mabel','oliver','rosie']);
});
test('two residents share exactly one prepared dish only after the player arrives',()=>{
 const x=harness(),s=x.state;
 const before={count:s.cooking.dishes.length,coins:s.coins,hearts:s.hearts,friend:s.relations.rosie};
 x.module.board();assert.equal(x.modals.at(-1).kind,'family-table');
 prepare(x,0);
 assert.equal(x.walks,1);
 assert.equal(s.cooking.dishes.length,before.count,'no food eaten until the walk finishes');
 assert.equal(x.writes,0,'the selection should be side effect free');
 assert.equal(x.arrive(),true);
 assert.equal(s.cooking.dishes.length,before.count-1);
 assert.equal(s.cooking.dishes[0].id,'tart','the one selected dish is gone');
 assert.equal(s.coins,before.coins,'no fake money');
 assert.equal(s.hearts,before.hearts,'no duplicate income');
 assert.equal(s.familyTable.days.h0,1);
 assert.equal(s.familyTable.counts.h0,1);
 assert.equal(s.familyTable.memories.length,1);
 assert.equal(s.familyTable.memories[0].recipe,'jam');
 assert.equal(s.residentLife.rosie.needs.food,61);
 assert.ok(s.relations.rosie>before.friend);
 assert.equal(s.townBonds['oliver|rosie'],3);
 assert.equal(s.townTensions['oliver|rosie'],8);
 assert.equal(x.writes,1);assert.equal(x.redraw,1);
 assert.equal(s.unrelated.wedding,'still here');
});
test('favorite meals grant extra relationship benefits without paying coins',()=>{
 const favorite=harness();prepare(favorite,0);favorite.arrive();
 assert.equal(favorite.state.relations.rosie,14,'Rosie loves jam: +4');
 assert.equal(favorite.state.relations.oliver,8,'Oliver gets normal +2');
 assert.equal(favorite.state.residentLife.rosie.needs.social,43,'favorite social boost');
 assert.equal(favorite.state.coins,100);
});
test('daily serving cap survives save import and blocks duplicate meal callbacks',()=>{
 const x=harness();prepare(x,0);x.arrive();
 const after=x.state.cooking.dishes.length,friend=x.state.relations.oliver;
 assert.equal(x.arrive(),false,'arrival cannot happen twice');
 x.module.pick(0);assert.equal(x.modals.at(-1).kind,'family-table');
 assert.equal(x.writes,1);
 assert.equal(x.state.cooking.dishes.length,after);
 x.state.familyTable=F.clean(JSON.parse(JSON.stringify(x.state.familyTable)));
 assert.equal(x.module.served('h0'),true);
 assert.equal(x.state.relations.oliver,friend);
 x.state.day=2;prepare(x,0,'celebrate');x.arrive();
 assert.equal(x.state.cooking.dishes.length,after-1);
 assert.equal(x.state.familyTable.counts.h0,2);
});
test('a stale dish, changed household or changed game day invalidates the pending transaction',()=>{
 const a=harness();prepare(a,0);
 a.state.cooking.dishes.splice(0,1);
 assert.equal(a.arrive(),false);
 assert.equal(a.state.familyTable.counts.h0,0);
 assert.equal(a.writes,0);
 const b=harness();prepare(b,0);b.setGuests(['mabel']);
 assert.equal(b.arrive(),false);assert.equal(b.state.cooking.dishes.length,6);
 const c=harness();prepare(c,0);c.state.day=2;
 assert.equal(c.arrive(),false);assert.equal(c.writes,0);
 const d=harness();prepare(d,0);d.setScene('town');
 assert.equal(d.arrive(),false);assert.equal(d.writes,0);
});
test('every home earns a distinct keepsake after three actual different-day suppers',()=>{
 const x=harness();
 for(let day=1;day<=3;day++){
  x.state.day=day;
  prepare(x,0,['remember','celebrate','dream'][day-1]);
  assert.equal(x.arrive(),true);
 }
 assert.equal(x.state.familyTable.counts.h0,3);
 assert.equal(x.state.familyTable.memories.length,3);
 const names=new Set(x.state.familyTable.memories.map(m=>m.topic));
 assert.equal(names.size,3,'three distinctive storytelling themes');
 const funcs=new Set(['save','restore','beginPath','ellipse','fill','fillRect']);
 let calls=0;const g=new Proxy({},{get(o,k){if(funcs.has(k))return()=>calls++;return o[k]}});
 x.module.draw(g,{home:'h0',day:3,tick:0.9});
 assert.ok(calls>20);
 x.state.day=4;
 const before=calls;
 x.module.draw(g,{home:'h0',day:4,tick:0.9});
 assert.ok(calls>before,'permanent wall keepsake survives beyond last meal day');
});
test('quiet cottage supper is available without residents and advances the real meal aspiration',()=>{
 const x=harness();x.setScene('home');x.setGuests([]);
 x.module.board();assert.match(x.modals.at(-1).html,/quiet supper/);
 prepare(x,0,'dream');assert.equal(x.arrive(),true);
 assert.equal(x.state.familyTable.counts.player,1);
 assert.equal(x.homeMeal,1);
 assert.ok(x.state.needs.hunger>25);
 assert.equal(x.state.familyTable.memories[0].guests.length,0);
 assert.equal(x.state.townBonds['oliver|rosie'],undefined);
});
test('vacant residences cannot create pretend residents or consume prepared food',()=>{
 const x=harness();x.setGuests([]);
 x.module.board();assert.match(x.modals.at(-1).html,/household is empty/);
 x.module.pick(0);assert.equal(x.walks,0);
 assert.equal(x.state.cooking.dishes.length,6);
 assert.equal(x.writes,0);
});
test('import sanitizer validates recipe IDs, households, quality and unique date memories',()=>{
 const saved=F.clean({
  days:{player:2,h0:3,h1:-1,other:99999},
  counts:{player:3,h0:999999,other:8},
  memories:[
   {home:'h0',day:3,recipe:'jam',quality:3,topic:'remember',guests:['rosie','oliver']},
   {home:'h0',day:3,recipe:'tart',quality:2,topic:'dream',guests:['oliver']},
   {home:'player',day:2,recipe:'toast',quality:1,topic:'dream',guests:[]},
   {home:'player',day:3,recipe:'toast',quality:1,topic:'dream',guests:['rosie']},
   {home:'h0',day:4,recipe:'__proto__',quality:3,topic:'remember',guests:['rosie']},
   {home:'h0',day:4,recipe:'jam',quality:7,topic:'remember',guests:['rosie']},
   {home:'h2',day:5,recipe:'salad',quality:1,topic:'invalid',guests:['bea']},
   {home:'unlisted',day:4,recipe:'tart',quality:1,topic:'remember',guests:[]}
  ]});
 assert.equal(saved.days.h0,3);
 assert.equal(saved.days.h1,0);
 assert.equal(saved.counts.h0,9999);
 assert.equal(saved.memories.length,2);
 assert.equal(Object.keys(saved.days).length,7);
 assert.equal(F.clean(null).memories.length,0);
});
test('full game and kitchen link the dinner flow; all assets are offline preloaded',()=>{
 for(const token of [
  'familyTable:window.HearthFamilyTable.clean(raw.familyTable)',
  'familyTable.draw(ctx',{ /* noop */ }
 ]){if(typeof token==='string')assert.ok(core.includes(token),token);}
 for(const token of ['familyTable.handle','openFamilyTable:()=>familyTable.board()',
  "completeHomeMeal:()=>homeAspirations.recordAction('player','meal'"]){
  assert.ok(core.includes(token),token);
 }
 assert.ok(kitchen.includes('data-act="cook-table"'));
 assert.ok(kitchen.includes("case 'cook-table':return this.a.openFamilyTable()"));
 assert.ok(html.indexOf('family-table-v2514.js')<html.indexOf('game.js'));
 for(const asset of ['family-table-v2514.js','family-table-v2514.css']){
  assert.ok(html.includes(asset));assert.ok(worker.includes("'./"+asset+"'"));
 }
 assert.match(worker,/hearth-harbor-v2514-at-our-table/);
});

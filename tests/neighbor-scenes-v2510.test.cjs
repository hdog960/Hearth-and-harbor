/* Hearth & Harbor v2.5.10 — Little Moments Together.
   Run: node --test tests/neighbor-scenes-v2510.test.cjs */
'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.join(__dirname,'..');
const get=file=>fs.readFileSync(path.join(root,file),'utf8');
const moduleSrc=get('neighbor-scenes-v2510.js');
const browser={window:{}};
vm.runInNewContext(moduleSrc,browser,{filename:'neighbor-scenes-v2510.js'});
const Engine=browser.window.HearthNeighborScenes;
const SCENES=Engine.SCENES;
function fresh(day=1,option={}){
 let saveCount=0,uiCount=0,visits=0,modals=[],notes=[];
 const people=[...new Set(SCENES.flatMap(s=>s.pair))].map(id=>({id,x:280,y:400,moving:0,routineRoute:[]}));
 const state={
  day,minute:12*60,season:Math.floor((day-1)/7)%4,
  stewardship:{phases:{flowers:2,lanterns:2,cart:2,deck:2}},
  neighborScenes:Engine.clean(null),
  townBonds:{},townTensions:{},relations:{},needs:{fun:20,social:30},hearts:0,
  residents:{homes:'preserved'},
  ...option
 };
 const important={};
 const scenarios=Engine.setup({
  getState:()=>state,save:()=>saveCount++,updateUI:()=>uiCount++,
  notify:t=>notes.push(t),
  showModal:(type,markup)=>modals.push({type,markup}),
  closeModal:()=>{},
  getNPCs:()=>people,
  getNormalRoutine:id=>important[id]||{h:'daily-work',where:[500,670],doing:'working'},
  protectedRoutine:r=>/^date-|^wedding-|^home-|^rest-care|^promise-|^visit-/.test(String(r.h||''))||!!r.eventId,
  travelTo:(x,y,arrival)=>{visits++;arrival();}
 });
 return {state,people,important,scenarios,modals,notes,
  get saves(){return saveCount},get updates(){return uiCount},get visits(){return visits}};
}
function arrival(x,s){
 x.state.minute=(s.start+.5)*60;
 const positions=s.positions;
 for(let i=0;i<2;i++){
  const resident=x.people.find(n=>n.id===s.pair[i]);
  resident.x=positions[i][0];resident.y=positions[i][1];resident.moving=0;resident.routineRoute=[];
 }
}
test('four distinct resident pairs occupy real, different upgraded locations',()=>{
 assert.equal(SCENES.length,4);
 assert.equal(new Set(SCENES.map(s=>s.id)).size,4);
 assert.equal(new Set(SCENES.map(s=>s.upgrade)).size,4);
 for(const s of SCENES){
  assert.equal(s.pair.length,2);
  assert.notEqual(s.pair[0],s.pair[1]);
  assert.equal(s.choices.length,2);
  assert.ok(s.choices.every(c=>c.label&&c.text));
  assert.ok(s.positions[0][0]!==s.positions[1][0]);
  assert.ok(s.walk[0]>100&&s.walk[0]<1400&&s.walk[1]>200&&s.walk[1]<1460);
 }
 assert.equal(Engine.bondKey(['rosie','oliver']),'oliver|rosie');
});
test('the scene schedule rotates by in-game season day and alternating cycles',()=>{
 const entries=[[1,'flower'],[6,'orchard'],[7,'pond'],[8,'lantern'],[13,'orchard'],[14,'pond'],[15,'flower']];
 for(const [day,id]of entries){
  const x=fresh(day);assert.equal(x.scenarios.sceneForDay().id,id);
 }
 for(const day of [2,3,4,5,9,10,11,12])assert.equal(fresh(day).scenarios.current(),null);
 const x=fresh(1);x.state.stewardship.phases.flowers=0;
 assert.equal(x.scenarios.current(),null);
});
test('a protected wedding, date, private visit or home routine cancels both partners, not one',()=>{
 const x=fresh(1);const s=x.scenarios.current();arrival(x,s);
 const daily={h:'work',where:[400,700],doing:'work'};
 assert.equal(x.scenarios.schedule('mabel',daily).neighborScene,s.id);
 for(const bad of [{h:'date-harbor'},{h:'wedding-anniversary'},{h:'home-h0'},{h:'rest-care'},{h:'visit-story'},{h:'meeting',eventId:'other'}]){
  x.important.jun={...daily,...bad};
  assert.equal(x.scenarios.schedule('mabel',daily),daily);
  assert.equal(x.scenarios.schedule('jun',daily),daily);
  assert.equal(x.scenarios.canGather(),false);
  x.scenarios.booklet();
  assert.doesNotMatch(x.modals.at(-1).markup,/data-act="nm-visit"/);
 }
 delete x.important.jun;
 assert.equal(x.scenarios.canGather(),true);
});
test('neighbors must physically arrive before the player can take part',()=>{
 const x=fresh(6),s=x.scenarios.current();
 x.state.minute=15*60;
 x.scenarios.visit(s.id);
 assert.equal(x.visits,1);
 assert.equal(x.modals.at(-1).type,'neighbor-moments');
 assert.equal(x.saves,0);
 arrival(x,s);
 x.scenarios.visit(s.id);
 assert.equal(x.modals.at(-1).type,'neighbor-join');
 const alice=x.people.find(n=>n.id===s.pair[0]);
 alice.moving=1;
 x.scenarios.choose(s.id+'|0');
 assert.equal(x.saves,0);
 alice.moving=0;
 x.scenarios.choose(s.id+'|0');
 assert.equal(x.saves,1);
 assert.equal(x.modals.at(-1).type,'neighbor-result');
});
test('four scenes earn exactly one meaningful social memory, and never farm repeats',()=>{
 const entries=[[1,'flower'],[6,'orchard'],[7,'pond'],[8,'lantern']];
 for(const [day,id] of entries){
  const x=fresh(day),s=x.scenarios.current();arrival(x,s);
  x.state.townTensions[Engine.bondKey(s.pair)]=8;
  x.scenarios.join(id);
  assert.equal(x.modals.at(-1).type,'neighbor-join');
  x.scenarios.choose(id+'|1');
  const k=Math.floor((day-1)/7)+':'+id,pair=Engine.bondKey(s.pair);
  assert.equal(x.state.neighborScenes.completed[k].choice,1);
  assert.equal(x.state.neighborScenes.history.length,1);
  assert.equal(x.state.townBonds[pair],s.choices[1].bond);
  assert.equal(x.state.townTensions[pair],8-s.choices[1].tension);
  assert.equal(x.state.relations[s.pair[0]],s.choices[1].friend);
  assert.equal(x.state.relations[s.pair[1]],s.choices[1].friend);
  assert.equal(x.state.hearts,2);
  assert.equal(x.saves,1);
  assert.equal(x.updates,1);
  assert.equal(x.state.residents.homes,'preserved');
  x.scenarios.choose(id+'|0');
  assert.equal(x.saves,1);
  assert.equal(x.state.hearts,2);
  x.scenarios.booklet();
  assert.match(x.modals.at(-1).markup,/Your shared memories/);
 }
});
test('only valid cycle-specific memories import, rejecting invalid pair references and stale data',()=>{
 const saved=Engine.clean({
  completed:{
   '0:flower':{choice:0},'1:flower':{choice:0},
   '1:lantern':{choice:1},'2:orchard':{choice:4},
   '0:unrecognized':{choice:0},'foo':{choice:1}
  },
  history:[
   {cycle:0,id:'flower',choice:0},{cycle:0,id:'flower',choice:1},
   {cycle:1,id:'flower',choice:0},{cycle:1,id:'lantern',choice:1},
   {cycle:1,id:'orchard',choice:0},{cycle:0,id:'__proto__',choice:0}
  ]
 });
 assert.equal(Object.keys(saved.completed).length,2);
 assert.equal(saved.history.length,3);
 assert.equal(Object.keys(Engine.clean(null).completed).length,0);
});
test('contextual conversations change after helping a pair; finished scenes remain visible',()=>{
 const x=fresh(1),s=x.scenarios.current();arrival(x,s);
 assert.match(x.scenarios.entryText('mabel'),/planned at/);
 x.scenarios.choose('flower|0');
 assert.match(x.scenarios.entryText('mabel'),/keep remembering/);
 const methods=new Set(['save','restore','beginPath','ellipse','fill','fillRect','strokeRect',
  'translate','moveTo','lineTo','stroke','fillText']);
 let calls=0;
 const g=new Proxy({},{get(o,k){if(methods.has(k))return()=>{calls++};return o[k]}});
 x.scenarios.draw(g,{tick:5});
 for(const id of s.pair){
  const n=x.people.find(n=>n.id===id);
  assert.equal(x.scenarios.activity(g,n,{neighborScene:s.id},5),true);
 }
 assert.ok(calls>25);
});
test('scene choices require valid IDs and participants; no remote reward exploit',()=>{
 const x=fresh(1);
 x.scenarios.choose('flower|0');
 x.scenarios.choose('orchard|0');
 x.scenarios.choose('flower|-1');
 x.scenarios.choose('flower|NaN');
 assert.equal(x.saves,0);
 arrival(x,x.scenarios.current());
 x.scenarios.choose('flower|99');
 assert.equal(x.saves,0);
 x.scenarios.choose('flower|0');assert.equal(x.saves,1);
});
test('script order, runtime integration, previous features and offline cache are preserved',()=>{
 const game=get('game.js'),html=get('index.html'),sw=get('sw.js');
 for(const term of ['window.HearthNeighborScenes.clean','neighborScenes.schedule','neighborScenes.activity',
 'neighborScenes.draw','neighborScenes.entryText','neighborScenes.handle','nm-book']){
  assert.ok(game.includes(term),'missing '+term);
 }
 assert.ok(html.indexOf('neighbor-scenes-v2510.js')<html.indexOf('game.js'));
 for(const asset of ['neighbor-scenes-v2510.js','neighbor-scenes-v2510.css']){
  assert.ok(html.includes(asset));assert.ok(sw.includes("'./"+asset+"'"));
 }
 assert.match(sw,/const CACHE='hearth-harbor-v[0-9]+-[a-z-]+'/); // Cache advances with releases.
});

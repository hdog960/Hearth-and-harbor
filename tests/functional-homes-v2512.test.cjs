/* Hearth & Harbor v2.5.12 — Rooms With Purpose
   Run: node --test tests/functional-homes-v2512.test.cjs
*/
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..'),read=n=>fs.readFileSync(path.join(root,n),'utf8');
const moduleText=read('functional-homes-v2512.js'),core=read('game.js'),html=read('index.html'),worker=read('sw.js');
const runtime={window:{}};vm.runInNewContext(moduleText,runtime,{filename:'functional-homes-v2512.js'});
const F=runtime.window.HearthFunctionalHomes;
const furniture=[
 {kind:'books',x:375,z:430},{kind:'lamp',x:440,z:445},
 {kind:'bed',x:700,z:600},{kind:'rug',x:735,z:635},
 {kind:'sofa',x:490,z:750},{kind:'flowers',x:540,z:755},
 {kind:'chair',x:630,z:895},{kind:'plant',x:680,z:895}
];
function create(custom={}){
 let saves=0,updates=0,modals=[],messages=[],queued=[],closed=0,scene='home',resident=null;
 const state={day:1,coins:80,hearts:4,name:'Poppy',placed:furniture.map(o=>({...o})),
   residenceProps:{h0:furniture.map(o=>({kind:o.kind,x:o.x,y:o.z})),h1:[]},
   functionalHomes:{focus:{},daily:{},uses:{},unlocks:{}},
   unrelated:{marriages:8},...custom};
 const engine=F.setup({
  getState:()=>state,save:()=>saves++,updateUI:()=>updates++,
  notify:s=>messages.push(s),showModal:(id,html)=>modals.push({id,html}),
  closeModal:()=>closed++,getScene:()=>scene,getControlledResident:()=>resident,
  queueAction:kind=>queued.push(kind)
 });
 return {engine,state,messages,modals,queued,setScene:v=>scene=v,setResident:v=>resident=v,
   get saves(){return saves},get updates(){return updates},get closed(){return closed}};
}
test('four functional spaces require real nearby furniture rather than decoration quantity',()=>{
 assert.equal(F.ZONES.length,4);
 const found=F.detect(furniture);assert.ok(found.every(x=>x.ready));
 assert.ok(found.every(x=>x.distance<=220));
 const distant=F.detect([{kind:'books',x:0,z:0},{kind:'lamp',x:245,z:0}]);
 assert.equal(distant.find(x=>x.id==='reading').ready,false);
 assert.equal(F.detect([{kind:'books',x:20,z:20}]).filter(x=>x.ready).length,0);
 assert.equal(F.detect([{kind:'books',x:20,z:20},{kind:'lamp',x:35,z:25}]).filter(x=>x.ready).length,1);
 const residence=furniture.map(o=>({kind:o.kind,x:o.x,y:o.z}));
 assert.ok(F.detect(residence).every(x=>x.ready),'residence y coordinates work');
});
test('existing drawn-in beds, bookshelves and sofas count toward functional corners',()=>{
 const compact=[
  {kind:'rug',x:390,z:530},
  {kind:'lamp',x:435,z:390},
  {kind:'flowers',x:700,z:560}
 ];
 const x=create({placed:compact,residenceProps:{
  h0:compact.map(o=>({kind:o.kind,x:o.x,y:o.z})),h1:[]
 }});
 const a=x.engine.active('player').map(x=>x.id);
 assert.ok(a.includes('rest'),'default bed + purchased rug');
 assert.ok(a.includes('reading'),'default bookshelf + purchased lamp');
 assert.ok(a.includes('gather'),'default sofa + purchased flowers');
 const b=x.engine.active('h0').map(x=>x.id);
 assert.ok(b.includes('rest')&&b.includes('reading')&&b.includes('gather'),
  'six room addresses share their actual built-in stations');
 assert.ok(!a.includes('creative'),'creative nook still requires a plant and chair');
});
test('one real completed reading session awards a capped themed bonus, never free currency',()=>{
 const x=create(),needs={fun:31,energy:25,social:27};
 assert.equal(x.engine.reward('player','player','read',needs,true,1),true);
 assert.equal(needs.fun,40,'6 nook + 3 selected focus');
 assert.equal(x.state.coins,80);assert.equal(x.state.hearts,4);
 assert.equal(x.engine.reward('player','player','read',needs,true,1),false);
 assert.equal(x.engine.reward('player','player','read',needs,false,1),false);
 assert.equal(needs.fun,40);
 assert.equal(x.state.functionalHomes.uses.player,1);
 assert.equal(x.saves,0,'caller alone owns the household routine save');
});
test('different functional actions and a room focus affect only matching needs',()=>{
 const x=create(),n={fun:10,energy:10,social:10};
 assert.equal(x.engine.reward('player','player','rest',n,true,1),true);assert.equal(n.energy,18);
 assert.equal(x.engine.reward('player','player','chat',n,true,1),true);assert.equal(n.social,17);
 x.engine.focusHome('player','creative');assert.equal(x.saves,1);
 x.state.day=2;
 assert.equal(x.engine.reward('player','player','hobby',n,true,2),true);
 assert.equal(n.fun,20,'7 creative +3 focus');
 assert.equal(x.state.coins,80);
 assert.equal(x.state.functionalHomes.unlocks.player,true,'house charm after three real uses');
});
test('same calendar day cannot repeatedly boost the same activity even after reload',()=>{
 const x=create(),n={fun:22};
 assert.equal(x.engine.reward('player','player','read',n,true,1),true);
 x.state.functionalHomes=F.clean(JSON.parse(JSON.stringify(x.state.functionalHomes)));
 assert.equal(x.engine.reward('player','player','read',n,true,1),false);
 assert.equal(n.fun,31);
 x.state.day=2;
 assert.equal(x.engine.reward('player','player','read',n,true,2),true);
 assert.equal(n.fun,40);
 assert.equal(x.state.functionalHomes.uses.player,2);
});
test('resident bonuses require the correct owned house and context',()=>{
 const x=create(),n={social:8,fun:7};
 assert.equal(x.engine.reward('rosie','player','chat',n,true,1),false);
 assert.equal(x.engine.reward('player','h0','chat',n,true,1),false);
 assert.equal(x.engine.reward('rosie','h0','chat',n,true,1),true);
 assert.equal(x.engine.reward('oliver','h0','chat',n,true,1),true);
 assert.equal(x.engine.reward('mabel','h1','chat',n,true,1),false,'empty room is not activated');
 assert.equal(x.state.functionalHomes.uses.h0,2);
 assert.equal(x.state.unrelated.marriages,8);
});
test('moving a matching furnishing away immediately disables its nook bonus',()=>{
 const x=create(),n={fun:40};
 assert.equal(x.engine.reward('player','player','read',n,true,1),true);
 x.state.day=2;
 x.state.placed.find(v=>v.kind==='lamp').x=900;
 assert.equal(x.engine.active('player').some(v=>v.id==='reading'),false);
 assert.equal(x.engine.reward('player','player','read',n,true,2),false);
 assert.equal(n.fun,49);
});
test('tapping a furnishing offers a real Daybook activity and never pays out instantly',()=>{
 const x=create();const needs={fun:25,energy:25,social:25};
 x.engine.inspect('player',0);
 assert.equal(x.modals.at(-1).id,'furniture-inspector');
 assert.match(x.modals.at(-1).html,/Use through Daybook/);
 assert.equal(x.engine.reward('player','player','read',needs,false,1),false);
 x.engine.handle('hf-use','read');
 assert.deepEqual(x.queued,['read']);
 assert.equal(x.closed,1);
 assert.equal(x.state.coins,80);
 assert.equal(needs.fun,25);
 x.setScene('residence');x.setResident(null);x.engine.inspect('h0',0);
 assert.doesNotMatch(x.modals.at(-1).html,/data-act="hf-use"/);
 x.setResident('mabel');x.engine.inspect('h0',0);
 assert.match(x.modals.at(-1).html,/data-act="hf-use"/);
});
test('room focus selection is saved, visible and rejects unrecognized category IDs',()=>{
 const x=create();
 x.engine.board('player');
 assert.equal(x.modals.at(-1).id,'functional-home');
 assert.match(x.modals.at(-1).html,/4 \/ 4 spaces ready/);
 x.engine.focusHome('player','gather');
 assert.equal(x.state.functionalHomes.focus.player,'gather');
 assert.equal(x.saves,1);assert.equal(x.updates,1);
 x.engine.focusHome('player','__proto__');
 assert.equal(x.state.functionalHomes.focus.player,'gather');
 x.engine.board('h0');
 assert.match(x.modals.at(-1).html,/Residence 0/);
 assert.match(x.modals.at(-1).html,/spaces ready/);
});
test('older saves and corrupt entries sanitize all homes and known actors without losing valid progress',()=>{
 const r=F.clean({focus:{player:'__proto__',h0:'rest'},
  uses:{player:2,h0:100000},daily:{player:{day:8,kinds:['read','reading','reading','gather']},
    mabel:{day:-9,kinds:['rest']}},
  unlocks:{player:false,h0:false}});
 assert.equal(r.focus.player,'reading');
 assert.equal(r.focus.h0,'rest');
 assert.equal(r.uses.h0,9999);
 assert.equal(r.daily.player.day,8);
 assert.equal(r.daily.player.kinds.length,2);
 assert.equal(r.daily.mabel.day,0);
 assert.equal(r.unlocks.h0,true);
 assert.equal(Object.keys(r.focus).length,7);
 assert.equal(Object.keys(r.daily).length,7);
 const empty=F.clean(null);assert.equal(empty.uses.player,0);
});
test('real canvas decorations render and source integration keeps old gameplay intact',()=>{
 const x=create(),n={fun:60};
 for(const kind of ['read','rest','chat'])x.engine.reward('player','player',kind,n,true,1);
 let calls=0;
 const names=new Set(['save','restore','fillRect','strokeRect','beginPath','ellipse','fill',
   'moveTo','lineTo','stroke','closePath']);
 const g=new Proxy({},{get(o,k){if(names.has(k))return()=>{calls++};return o[k]}});
 x.engine.draw(g,'player');x.engine.draw(g,'h0');
 assert.ok(calls>35);
 for(const token of [
  'window.HearthFunctionalHomes.clean(raw.functionalHomes)',
  "functionalHomes.reward('player','player',kind,state.needs,once,state.day)",
  'functionalHomes.reward(id,activeResidence,kind,life.needs,once,state.day)',
  'functionalHomes.reward(n.id,activeResidence,kind,ns,once,state.day)',
  'functionalHomes.inspect','functionalHomes.draw','functionalHomes.handle',
  "queueOwnHomeAction(near.kind)"
 ])assert.ok(core.includes(token),'missing '+token);
 assert.ok(html.indexOf('functional-homes-v2512.js')<html.indexOf('game.js'));
 for(const asset of ['functional-homes-v2512.js','functional-homes-v2512.css']){
  assert.ok(html.includes(asset));assert.ok(worker.includes("'./"+asset+"'"));
 }
 assert.match(worker,/const CACHE='hearth-harbor-v[0-9]+-[a-z-]+'/); // Offline cache evolves each release.
});

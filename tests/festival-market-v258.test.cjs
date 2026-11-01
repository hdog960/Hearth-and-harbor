/* Hearth & Harbor v2.5.8 Festival Market regression suite.
   node --test tests/festival-market-v258.test.cjs */
'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const mod=read('festival-market-v258.js'),game=read('game.js'),html=read('index.html'),sw=read('sw.js');
const context={window:{}};
vm.runInNewContext(mod,context,{filename:'festival-market-v258.js'});
const E=context.window.HearthFestivalMarket;
function world(init={}){
 let writes=0,redraws=0,travels=0,notes=[],windows=[];
 const state={
  day:3,season:0,coins:400,hearts:0,
  needs:{hunger:30,fun:30,social:30},
  relations:{bea:0,oliver:0,rosie:0},
  stewardship:{phases:{cart:2,lanterns:2}},
  cooking:{dishes:[{id:'tart',quality:3},{id:'salad',quality:2},{id:'skewers',quality:1},{id:'dumplings',quality:2}],pantry:{}},
  festivalMarket:E.clean(null),preserved:{homes:6},
  ...init
 };
 const market=E.setup({
  getState:()=>state,save:()=>writes++,updateUI:()=>redraws++,
  notify:m=>notes.push(m),showModal:(kind,body)=>windows.push({kind,body}),
  closeModal:()=>{},isTown:()=>true,openKitchen:()=>notes.push('kitchen'),
  travelTo:(_x,_y,arrive)=>{travels++;arrive()}
 });
 return {market,state,notes,windows,get writes(){return writes},get redraws(){return redraws},get travels(){return travels}};
}
function decorateAll(market){
 market.handle('fmarket-start','');
 for(let i=0;i<6;i++){
  market.handle('fmarket-brush',String(i%3));
  market.handle('fmarket-tile',String(i));
 }
 market.handle('fmarket-finish','');
}
test('festival dates, navigation and safe old-save migration',()=>{
 assert.equal(E.isOpen(1),false);assert.equal(E.isOpen(2),false);
 assert.equal(E.isOpen(3),true);assert.equal(E.isOpen(5),true);assert.equal(E.isOpen(6),false);
 assert.equal(E.isOpen(10),true);
 const r=E.clean({crafts:{
  '0:0':{stars:3,colors:Array(12).fill(1)},
  '0:1':{stars:2,colors:Array(12).fill(1)},
  'fake':{stars:3,colors:[]}},
  supper:{'0:0':{recipe:'tart',quality:3},'1:1':{recipe:'nope',quality:3}},
  tastes:{'3':1,'4':9,'0':1}});
 assert.equal(Object.keys(r.crafts).length,1);
 assert.equal(Object.keys(r.supper).length,1);
 assert.equal(Object.keys(r.tastes).length,1);
 const x=world({day:1});
 x.market.travel('crafts');
 assert.equal(x.travels,0);
 assert.equal(x.windows.at(-1).kind,'market-overview');
 assert.equal(x.state.preserved.homes,6);
});
test('all twelve accepted dishes exactly match the actual Hearth Kitchen',()=>{
 const kitchen=read('kitchen.js');
 const snippet=kitchen.slice(kitchen.indexOf('const RECIPES={'),kitchen.indexOf('const STEP='));
 const ids=[...snippet.matchAll(/^\s*(\w+):\{name:/gm)].map(m=>m[1]);
 assert.equal(ids.length,12);
 assert.deepEqual(ids.sort(),Object.keys(E.RECIPES).sort());
});
test('four crafts complete, earn once each cycle, and archive with varied quality',()=>{
 const x=world();let start=400;
 for(let season=0;season<4;season++){
  x.state.day=3+season*7;x.state.season=season;
  const entry=x.market.hit(371,608);
  assert.equal(entry.id,'crafts');
  x.market.travel('crafts');
  assert.equal(x.windows.at(-1).kind,'market-crafts');
  decorateAll(x.market);
  const k=season+':'+season;
  assert.equal(x.state.festivalMarket.crafts[k].stars,3);
  start-=8;assert.equal(x.state.coins,start);
  const before={coins:x.state.coins,friend:x.state.relations.bea,writes:x.writes};
  decorateAll(x.market);
  assert.deepEqual({coins:x.state.coins,friend:x.state.relations.bea,writes:x.writes},before);
 }
 assert.equal(x.writes,4);
 assert.equal(x.redraws,4);
 assert.equal(x.state.relations.bea,20); // +4 friendship +1 for completed lanterns, 4 seasons
 x.market.overview();assert.match(x.windows.at(-1).body,/market scrapbook/i);
 assert.match(x.windows.at(-1).body,/Blossom Banner/);
});
test('paint limit and poor color variety cannot fabricate 3-star craft',()=>{
 const x=world({coins:7});
 x.market.handle('fmarket-start','');
 for(let i=0;i<6;i++)x.market.handle('fmarket-tile',String(i));
 x.market.handle('fmarket-finish','');
 assert.equal(x.state.coins,7);
 assert.equal(Object.keys(x.state.festivalMarket.crafts).length,0);
 x.state.coins=8;x.market.handle('fmarket-finish','');
 assert.equal(x.state.festivalMarket.crafts['0:0'].stars,1);
 assert.equal(x.state.coins,0);
});
test('community meals consume exactly one real cooked plate and do not farm rewards',()=>{
 const x=world();
 for(let season=0;season<4;season++){
  x.state.day=3+7*season;x.state.season=season;
  const count=x.state.cooking.dishes.length;
  const old=x.state.relations.oliver;
  x.market.travel('treats');
  assert.equal(x.windows.at(-1).kind,'market-treats');
  x.market.handle('fmarket-donate','0');
  assert.equal(x.state.cooking.dishes.length,count-1);
  assert.ok(x.state.relations.oliver>old);
  const saved={count:x.state.cooking.dishes.length,hearts:x.state.hearts,friend:x.state.relations.oliver,writes:x.writes};
  x.market.handle('fmarket-donate','0');
  assert.deepEqual({count:x.state.cooking.dishes.length,hearts:x.state.hearts,friend:x.state.relations.oliver,writes:x.writes},saved);
  assert.ok(x.state.festivalMarket.supper[season+':'+season]);
 }
 assert.equal(x.state.cooking.dishes.length,0);
 assert.equal(x.writes,4);
});
test('taste purchase is bounded to one per day and stays affordable and optional',()=>{
 const x=world({coins:16});
 x.market.handle('fmarket-taste','');
 assert.equal(x.state.coins,8);
 const before={hunger:x.state.needs.hunger,writes:x.writes};
 x.market.handle('fmarket-taste','');
 assert.equal(x.state.coins,8);
 assert.equal(x.writes,before.writes);
 x.state.day=4;x.market.handle('fmarket-taste','');
 assert.equal(x.state.coins,0);
 x.state.day=5;x.market.handle('fmarket-taste','');
 assert.equal(x.state.coins,0);
 assert.equal(x.writes,2);
});
test('painted booth signs match the touch targets; runtime and offline assets stay wired',()=>{
 const x=world();
 assert.equal(x.market.hit(371,608).id,'crafts');
 assert.equal(x.market.hit(866,785).id,'treats');
 assert.equal(x.market.hit(371,690),null);
 x.state.day=2;assert.equal(x.market.hit(371,608),null);
 x.state.day=3;
 const methods=new Set(['save','restore','translate','beginPath','moveTo','quadraticCurveTo','stroke','fill','lineTo','fillRect','strokeRect','ellipse','fillText']);
 let calls=0;const g=new Proxy({},{get(o,k){if(methods.has(k))return()=>{calls++};return o[k]}});
 for(let season=0;season<4;season++)x.market.decorate(g,{day:3+7*season,season,tick:1});
 assert.ok(calls>40);
 assert.ok(game.includes('festivalMarket:window.HearthFestivalMarket.clean(raw.festivalMarket)'));
 for(const field of ['festivalMarket.hit','festivalMarket.visit','festivalMarket.decorate','festivalMarket.handle','fmarket-overview']){
  assert.ok(game.includes(field),field);
 }
 assert.ok(html.indexOf('festival-market-v258.js')<html.indexOf('game.js'));
 for(const f of ['festival-market-v258.js','festival-market-v258.css']){
  assert.ok(html.includes(f));assert.ok(sw.includes("'./"+f+"'"));
 }
 assert.match(sw,/const CACHE='hearth-harbor-v[0-9]+-[a-z-]+'/); // New releases intentionally roll the offline cache.
});

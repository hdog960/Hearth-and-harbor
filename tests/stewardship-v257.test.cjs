/* Hearth & Harbor v2.5.7 — town stewardship regression checks
 * Run: node --test tests/stewardship-v257.test.cjs
 * No packages or browser required.
 */
'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const code=fs.readFileSync(path.join(root,'stewardship-v257.js'),'utf8');
const game=fs.readFileSync(path.join(root,'game.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
const scope={window:{}};
vm.runInNewContext(code,scope,{filename:'stewardship-v257.js'});
const Engine=scope.window.HearthStewardship;
function create(opts={}){
 let saves=0,updates=0,trips=[],modals=[];
 const state={
  day:1,season:0,coins:1000,
  needs:{hunger:15,fun:18,social:20,energy:30},
  cooking:{pantry:{berry:95,apple:7,carrot:99,herb:8}},
  stewardship:Engine.clean(null),preserved:{household:'existing'},
  ...opts
 };
 const town=Engine.setup({
  getState:()=>state,save:()=>saves++,updateUI:()=>updates++,
  notify:()=>{},showModal:(name,html)=>modals.push({name,html}),
  closeModal:()=>{},
  travelTo:(x,y,cb)=>{trips.push([x,y]);cb()}
 });
 return {town,state,modals,trips,get saves(){return saves},get updates(){return updates}};
}
function build(town,id){town.contribute(id);town.contribute(id);}
test('old saves and malformed project data are sanitized without resetting other systems',()=>{
 const clean=Engine.clean({phases:{flowers:2,lanterns:90,deck:-3,cart:'2',inject:2},
  visits:{flowers:5,cart:Infinity,deck:-5}});
 assert.deepEqual([...Object.keys(clean.phases)].sort(),['cart','deck','flowers','lanterns']);
 assert.equal(clean.phases.flowers,2);assert.equal(clean.phases.lanterns,2);
 assert.equal(clean.phases.deck,0);assert.equal(clean.phases.cart,0);
 assert.equal(clean.visits.cart,0);assert.equal(clean.visits.flowers,5);
 assert.equal(Engine.clean(undefined).phases.flowers,0);
 const x=create();build(x.town,'flowers');
 assert.equal(x.state.preserved.household,'existing');
});
test('four permanent upgrades each cost exactly two payments; repeated build cannot charge twice',()=>{
 const x=create(),{town,state}=x;
 let total=0;
 for(const project of Engine.PROJECTS){
  const first=state.coins;
  town.contribute(project.id);assert.equal(town.level(project.id),1);
  town.contribute(project.id);assert.equal(town.level(project.id),2);
  const cost=project.cost[0]+project.cost[1];total+=cost;
  assert.equal(state.coins,first-cost);
  const paid=state.coins,saveCount=x.saves;
  town.contribute(project.id);assert.equal(state.coins,paid);
  assert.equal(x.saves,saveCount);
 }
 assert.equal(total,375);
 assert.equal(state.coins,625);
 assert.equal(x.saves,8);
 assert.equal(x.updates,8);
 town.board();assert.match(x.modals.at(-1).html,/4 of 4 projects completed/);
});
test('missing coins cannot advance a project or push balance below zero',()=>{
 const x=create({coins:22});
 x.town.contribute('flowers');
 assert.equal(x.town.level('flowers'),0);assert.equal(x.state.coins,22);assert.equal(x.saves,0);
 x.state.coins=30;x.town.contribute('flowers');
 assert.equal(x.town.level('flowers'),1);assert.equal(x.state.coins,0);
 x.town.contribute('flowers');
 assert.equal(x.town.level('flowers'),1);assert.equal(x.state.coins,0);
});
test('daily activities award exactly once per day and seasonal pantry parcels respect 99 cap',()=>{
 const x=create(),{town,state}=x;
 for(const p of Engine.PROJECTS)build(town,p.id);
 for(const p of Engine.PROJECTS){
  const prior=x.saves;
  town.use(p.id);assert.equal(x.saves,prior+1);
  town.use(p.id);assert.equal(x.saves,prior+1);
 }
 assert.equal(state.cooking.pantry.berry,97);
 assert.equal(state.stewardship.visits.cart,1);
 state.day=2;town.travel('cart');assert.equal(x.trips.length,1);
 assert.equal(state.cooking.pantry.berry,99);
 state.day=8;state.season=1;town.use('cart');assert.equal(state.cooking.pantry.apple,9);
 state.day=15;state.season=2;town.use('cart');assert.equal(state.cooking.pantry.carrot,99);
 state.day=22;state.season=3;town.use('cart');assert.equal(state.cooking.pantry.herb,10);
});
test('four completed projects have distinct tappable locations',()=>{
 const x=create();
 for(const p of Engine.PROJECTS)build(x.town,p.id);
 for(const [wx,wy,id] of [[443,773,'cart'],[640,814,'flowers'],[1054,1219,'deck'],[602,609,'lanterns']]){
  assert.equal(x.town.hit(wx,wy).id,id);
 }
 assert.equal(x.town.hit(1400,1400),null);
});
test('project rendering and seasonal market scenes run without missing Canvas2D methods',()=>{
 const x=create();
 for(const p of Engine.PROJECTS)build(x.town,p.id);
 let drawCalls=0;
 const methods=new Set(['save','restore','fillRect','translate','scale','beginPath','arc','ellipse','fill','stroke','moveTo','lineTo','quadraticCurveTo','fillText','strokeRect']);
 const g=new Proxy({},{get(o,key){if(methods.has(key))return()=>{drawCalls++};return o[key]}});
 x.town.drawBoard(g,1165,903);
 for(let season=0;season<4;season++){
  x.state.season=season;x.state.day=3+season*7;
  x.town.drawProjects(g,{season,tick:4});
  x.town.festivalStalls(g,{season,day:x.state.day,tick:4});
 }
 assert.ok(drawCalls>1000);
});
test('the live runtime loads the module and caches the same version',()=>{
 assert.match(game,/stewardship:window\.HearthStewardship\.clean\(raw\.stewardship\)/);
 for(const s of ['stewardship.drawProjects','stewardship.festivalStalls','stewardship.hit',
 'stewardship.use','stewardship.board','stew-build','stew-travel','projectboard']){
  assert.ok(game.includes(s),s);
 }
 assert.ok(html.indexOf('stewardship-v257.js')<html.indexOf('game.js'));
 for(const name of ['stewardship-v257.js','stewardship-v257.css']){
  assert.ok(html.includes(name));
  assert.ok(sw.includes("'./"+name+"'"));
 }
 assert.match(sw,/hearth-harbor-v257-village-we-grow/);
});

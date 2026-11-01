/* Hearth & Harbor v2.5.11 — Roots & Keepsakes regressions.
   Run: node --test tests/aspirations-v2511.test.cjs */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),read=n=>fs.readFileSync(path.join(root,n),'utf8');
const moduleSrc=read('aspirations-v2511.js'),game=read('game.js'),html=read('index.html'),sw=read('sw.js');
const browser={window:{}};vm.runInNewContext(moduleSrc,browser,{filename:'aspirations-v2511.js'});
const Engine=browser.window.HearthAspirations;
function create(initial={}){
 const state={day:1,coins:100,hearts:0,relations:{},name:'Poppy',
  // Fresh default saves historically contain empty top-level records.
  homeAspirations:{people:{},memories:[]},unrelated:{weddings:'untouched'},...initial};
 let saves=0,updates=0,notices=[],modals=[];
 const game=Engine.setup({getState:()=>state,save:()=>saves++,updateUI:()=>updates++,
  notify:m=>notices.push(m),showModal:(name,markup)=>modals.push({name,markup}),closeModal:()=>{}});
 return {state,game,notices,modals,get saves(){return saves},get updates(){return updates}};
}
const context=id=>({scene:id==='player'?'home':'residence',members:[id]});
test('all seven playable characters have three aspiration tracks initialized on fresh and legacy saves',()=>{
 assert.equal(Engine.IDS.length,7);assert.equal(Object.keys(Engine.PATHS).length,3);
 const x=create();for(const id of Engine.IDS){
  assert.ok(x.game.status(id));assert.equal(x.game.status(id).path,Engine.DEFAULT[id]);
  assert.equal(x.game.status(id).stage,0);assert.equal(x.game.status(id).lastDay,0);
 }
 assert.equal(Engine.clean(undefined).memories.length,0);
 assert.equal(x.state.unrelated.weddings,'untouched');
});
test('every aspiration requires three completed relevant activities over three different days',()=>{
 const x=create(),paths=Object.keys(Engine.PATHS);let achievements=0;
 for(const id of Engine.IDS)for(const path of paths){
  x.game.select(id,path);const start=x.state.hearts;
  for(const step of Engine.PATHS[path].steps){
   assert.equal(x.game.recordAction(id,'not-an-action',context(id)),false);
   assert.equal(x.game.recordAction(id,step.action,context(id)),true,id+' '+path+' '+step.action);
   assert.equal(x.game.recordAction(id,step.action,context(id)),false,'repeat same day');
   assert.equal(x.game.status(id).lastDay,x.state.day);
   x.state.homeAspirations=Engine.clean(JSON.parse(JSON.stringify(x.state.homeAspirations)));
   assert.equal(x.game.status(id).lastDay,x.state.day,'save reload protects one-per-day');
   x.state.day++;
  }
  assert.ok(x.game.status(id).finished[path],id+' '+path);
  assert.equal(x.game.status(id).path,null,'no hidden auto-select after completion');
  assert.equal(x.state.hearts,start+4);
  assert.equal(x.game.recordAction(id,'meal',context(id)),false,'no reward farming');
  achievements++;
 }
 assert.equal(achievements,21);
 assert.equal(x.state.homeAspirations.memories.length,21);
 assert.equal(x.state.hearts,84);
 assert.equal(x.state.coins,130,'one-time 10 coin reward for each player path');
 assert.equal(x.state.unrelated.weddings,'untouched');
});
test('wrong room, actor, unfinished action and member ownership cannot trigger milestones',()=>{
 const x=create();
 const wrong=[
  ['player','tidy',{scene:'residence',members:['player']}],
  ['player','tidy',{scene:'town'}],
  ['mabel','tidy',{scene:'home',members:['mabel']}],
  ['mabel','tidy',{scene:'residence',members:['rosie']}],
  ['mabel','read',{scene:'residence',members:['mabel']}]
 ];
 for(const [id,kind,ctx] of wrong)assert.equal(x.game.recordAction(id,kind,ctx),false);
 assert.equal(x.saves,0);assert.equal(x.state.hearts,0);
 assert.equal(x.game.recordAction('mabel','tidy',{scene:'residence',members:['mabel']}),true);
 assert.equal(x.game.status('mabel').stage,1);
});
test('changing unfinished track resets its steps but cannot reset the per-day cap',()=>{
 const x=create();
 x.game.recordAction('player','tidy',context('player'));
 assert.equal(x.game.status('player').stage,1);
 x.game.select('player','storyteller');assert.equal(x.game.status('player').stage,0);
 assert.equal(x.game.recordAction('player','read',context('player')),false,'same calendar day');
 x.state.day=2;
 assert.equal(x.game.recordAction('player','read',context('player')),true);
 x.game.select('player','maker');assert.equal(x.game.status('player').stage,0);
 x.game.select('player','storyteller');assert.equal(x.game.status('player').stage,0);
});
test('completing a nondefault aspiration remains completed after reload and requires manual next selection',()=>{
 const x=create();
 x.game.select('rosie','storyteller');
 for(const step of Engine.PATHS.storyteller.steps){assert.equal(x.game.recordAction('rosie',step.action,context('rosie')),true);x.state.day++;}
 assert.equal(x.game.status('rosie').path,null);
 x.state.homeAspirations=Engine.clean(JSON.parse(JSON.stringify(x.state.homeAspirations)));
 assert.equal(x.game.status('rosie').path,null);
 assert.equal(x.game.recordAction('rosie','meal',context('rosie')),false);
 x.game.select('rosie','storyteller');
 assert.equal(x.game.status('rosie').path,null,'cannot repeat completed path');
 x.game.select('rosie','nurturer');
 assert.equal(x.game.status('rosie').path,'nurturer');
});
test('autonomous residents use the same cap and must belong to the visited home',()=>{
 const x=create();
 assert.equal(x.game.recordAction('oliver','meal',{scene:'residence',members:['oliver','rosie']}),true);
 assert.equal(x.game.recordAction('oliver','meal',{scene:'residence',members:['oliver','rosie']}),false);
 assert.equal(x.game.recordAction('rosie','meal',{scene:'residence',members:['oliver','rosie']}),true);
 assert.equal(x.game.recordAction('finn','read',{scene:'residence',members:['oliver','rosie']}),false);
 assert.equal(x.game.status('oliver').stage,1);
 assert.equal(x.game.status('rosie').stage,1);
});
test('import validation drops unexpected paths, invalid memories and prototype names',()=>{
 const clean=Engine.clean({people:{player:{path:'__proto__',stage:99,lastDay:-8,finished:{maker:7,storyteller:0}},
  mabel:{path:null,stage:2,lastDay:9,finished:{maker:8}},
  rosie:{path:'nurturer',stage:2,lastDay:13,finished:{nurturer:13}} },
  memories:[{id:'player',path:'maker',day:7},{id:'player',path:'maker',day:7},
   {id:'mabel',path:'maker',day:8},{id:'rosie',path:'__proto__',day:13},
   {id:'finn',path:'maker',day:9000}]});
 assert.equal(clean.people.player.path,null,'finished default is not reselected');
 assert.equal(clean.people.player.stage,0);
 assert.equal(clean.people.player.lastDay,0);
 assert.equal(clean.people.mabel.path,null);
 assert.equal(clean.people.mabel.stage,0);
 assert.equal(clean.people.rosie.path,null);
 assert.equal(clean.memories.length,2);
 const x=create();x.game.select('player','__proto__');
 assert.equal(x.game.status('player').path,'maker');
});
test('completed family keepsakes render on the actual home and resident walls',()=>{
 const x=create();
 for(const id of ['player','mabel','rosie'])for(const path of Object.keys(Engine.PATHS)){
  x.game.select(id,path);
  for(const step of Engine.PATHS[path].steps){x.game.recordAction(id,step.action,context(id));x.state.day++;}
 }
 const supported=new Set(['save','restore','fillRect','strokeRect','beginPath','ellipse','fill','moveTo','bezierCurveTo']);
 let calls=0;const gfx=new Proxy({},{get(o,k){if(supported.has(k))return()=>{calls++};return o[k]}});
 x.game.drawWall(gfx,{home:'player'});
 x.game.drawWall(gfx,{home:'h0',members:['mabel','rosie']});
 assert.ok(calls>100,'actual frame drawing commands executed');
 x.game.board();
 assert.equal(x.modals.at(-1).name,'aspirations');
 assert.match(x.modals.at(-1).markup,/9 lasting household keepsakes/);
});
test('runtime hooks only advance completed actions; scripts and offline cache are consistent',()=>{
 for(const term of [
  "homeAspirations.recordAction('player',kind,{scene:'home'})",
  "homeAspirations.recordAction(id,kind,{scene:'residence'",
  "homeAspirations.recordAction(n.id,kind,{scene:'residence'",
  'homeAspirations.drawWall','homeAspirations.handle',
  'homeAspirations:window.HearthAspirations.clean(raw.homeAspirations)',
  'asp-board']){
  assert.ok(game.includes(term),'missing integration '+term);
 }
 assert.ok(html.indexOf('aspirations-v2511.js')<html.indexOf('game.js'));
 for(const asset of ['aspirations-v2511.js','aspirations-v2511.css']){
  assert.ok(html.includes(asset));
  assert.ok(sw.includes("'./"+asset+"'"));
 }
 assert.match(sw,/hearth-harbor-v2511-roots-and-keepsakes/);
});

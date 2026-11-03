/* Hearth & Harbor v2.7.5 — authentic childhood neighbor stroll regression gates */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
const env={window:{}};
for(const name of ['pip-routines-v273.js','pip-neighbors-v275.js','little-sprouts-v272.js','family-atlas-v271.js'])
 vm.runInNewContext(read(name),env,{filename:name});
const P=env.window.HearthPipNeighbors,L=env.window.HearthLittleSprouts,A=env.window.HearthFamilyAtlas;
function fixture(opts={}){
 const state={day:9,minute:120,coins:400,youngResidents:{pip:L.defaults()},weddingPlans:{},familyRoots:{chosen:{}},...opts};
 let scene='town',player={x:790,y:898},modal=null,saves=0,updates=0,goes=0;const alerts=[];
 const adults=[
  {id:'mabel',name:'Mabel',x:720,y:594,job:'Florist'},
  {id:'rosie',name:'Rosie',x:396,y:757,job:'Merchant'},
  {id:'oliver',name:'Oliver',x:948,y:525,job:'Baker'},
  {id:'jun',name:'Jun',x:423,y:935,job:'Bookseller'},
  {id:'bea',name:'Bea',x:794,y:803,job:'Artist'},
  {id:'finn',name:'Finn',x:1035,y:1095,job:'Fisher'}];
 const api={getState:()=>state,getScene:()=>scene,isNearby:(p,d)=>Math.hypot(p.x-player.x,p.y-player.y)<=d,
  getAdults:()=>adults,getPlayer:()=>({...player}),
  goTown:()=>{scene='town';player={x:566,y:621};goes++},nearestWalkable:p=>p,isWalkable:()=>true,
  isPaused:()=>false,showModal:(name,html)=>{modal={name,html}},closeModal:()=>{modal=null},
  save:()=>saves++,updateUI:()=>updates++,notify:s=>alerts.push(s)};
 const pip=L.setup(api);return {pip,state,adults,alerts,get modal(){return modal},get saves(){return saves},get updates(){return updates},get goes(){return goes},
  setScene:s=>scene=s,setPlayer:(x,y)=>{player={x,y}},get player(){return player},api};
}
function complete(f,id='bea',mask=0){assert.equal(f.pip.neighbors.start(id),true);assert.equal(f.pip.neighbors.answer(mask&1),true);assert.equal(f.pip.neighbors.step(),true);assert.equal(f.pip.neighbors.answer((mask>>1)&1),true)}
function guarded(){const f=fixture();f.state.youngResidents.pip.guardian='player';f.state.youngResidents.pip.guardianDay=7;f.setScene('home');f.setPlayer(765,756);return f}
test('all six genuine adult characters have unique child-safe local neighbor experiences',()=>{
 assert.deepEqual(JSON.parse(JSON.stringify(P.ADULTS)),['mabel','rosie','oliver','jun','bea','finn']);
 const titles=Object.values(P.STORIES).map(s=>s.title);
 assert.equal(new Set(titles).size,6);
 for(const entry of Object.values(P.STORIES)){assert.equal(entry.question.length,2);assert.equal(entry.options.length,2);assert.equal(entry.options.every(x=>x.length===2),true)}
});
test('fresh save never invents a meeting or permanent child adult friendship',()=>{
 const f=fixture();assert.deepEqual(JSON.parse(JSON.stringify(f.pip.data.meetings)),[]);
 assert.equal(f.pip.neighbors.walkingNow(),false);assert.equal(f.saves,0);
});
test('old v2.7.4 child saves migrate without changes to adult households or guardians',()=>{
 const older=L.clean({guardian:'player',guardianDay:6,memories:[{day:4,kind:'story',choiceMask:1}],skills:{story:2}});
 assert.equal(older.guardian,'player');assert.equal(older.skills.story,2);
 assert.deepEqual(JSON.parse(JSON.stringify(older.meetings)),[]);
});
test('invalid child encounter saves cannot inject unknown people, fake days or masks',()=>{
 const c=P.clean([{id:'bea',day:3,mask:0},{id:'bea',day:3,mask:3},{id:'pip',day:3,mask:1},
  {id:'mabel',day:-5,mask:1},{id:'finn',day:4,mask:8},{id:'jun',day:5,mask:'1'},{id:'jun',day:6,mask:3}]);
 assert.deepEqual(JSON.parse(JSON.stringify(c)),[{id:'bea',day:3,mask:0},{id:'jun',day:6,mask:3}]);
});
test('a real nearby adult is found from their live on-screen coordinates',()=>{
 const f=fixture();assert.equal(f.pip.neighbors.adultNear()?.id,'bea');
 assert.match(f.pip.neighbors.page(),/Bea is really here/);
});
test('not being near Pip prevents a fake remote encounter',()=>{
 const f=fixture();f.setPlayer(100,100);
 assert.equal(f.pip.neighbors.adultNear(),null);assert.equal(f.pip.neighbors.start('bea'),false);
 assert.equal(f.saves,0);
});
test('a villager far from Pip cannot be selected through a menu',()=>{
 const f=fixture();assert.equal(f.pip.neighbors.start('finn'),false);assert.equal(f.pip.neighbors.start('mabel'),false);
 assert.equal(f.pip.data.meetings.length,0);
});
test('moving the actual neighbor away removes that encounter option',()=>{
 const f=fixture();f.adults.find(a=>a.id==='bea').x=1300;
 assert.equal(f.pip.neighbors.adultNear()?.id,null);
 assert.equal(f.pip.neighbors.start('bea'),false);
});
test('one button does not reward anything; the encounter needs both genuine choices',()=>{
 const f=fixture();assert.equal(f.pip.neighbors.start('bea'),true);
 assert.match(f.modal.html,/1 OF 2/);
 assert.equal(f.saves,0);assert.equal(f.pip.neighbors.answer(1),true);
 assert.equal(f.pip.data.meetings.length,0);assert.equal(f.saves,0);
});
test('a completed two-part child-friendly encounter earns a genuine dated memory',()=>{
 const f=fixture();complete(f,'bea',3);
 assert.equal(f.pip.data.meetings.length,1);
 assert.deepEqual(JSON.parse(JSON.stringify(f.pip.data.meetings[0])),{id:'bea',day:9,mask:3});
 assert.equal(f.saves,1);assert.equal(f.updates,1);
});
test('each completed neighbor moment restores small bounded curiosity and confidence',()=>{
 const f=fixture();const first={...f.pip.data.needs};complete(f);
 assert.equal(f.pip.data.needs.curiosity,first.curiosity+6);
 assert.equal(f.pip.data.needs.confidence,first.confidence+4);
 assert.equal(f.state.coins,400);
});
test('adult romance, money, household move and weddings never change from childhood encounters',()=>{
 const f=fixture({coins:400,relations:{bea:88},weddingPlans:{'bea|finn':{status:'married',marriedDay:3}},householdMoves:[]});
 const before=JSON.stringify({relations:f.state.relations,weddings:f.state.weddingPlans,moves:f.state.householdMoves});
 complete(f);
 assert.equal(JSON.stringify({relations:f.state.relations,weddings:f.state.weddingPlans,moves:f.state.householdMoves}),before);
 assert.equal(f.state.coins,400);
});
test('one meeting per person per day, preventing repeated passive farming',()=>{
 const f=fixture();complete(f);
 assert.equal(f.pip.neighbors.start('bea'),false);
 assert.equal(f.pip.neighbors.answer(0),false);
 assert.equal(f.pip.data.meetings.length,1);
});
test('another real in-range neighbor can participate on that same day',()=>{
 const f=fixture();complete(f);
 f.adults.find(a=>a.id==='mabel').x=795;f.adults.find(a=>a.id==='mabel').y=830;
 f.adults.find(a=>a.id==='bea').x=1400;
 complete(f,'mabel',1);assert.equal(f.pip.data.meetings.length,2);assert.equal(f.saves,2);
});
test('the same neighbor can make a distinct memory on a later in-game day',()=>{
 const f=fixture();complete(f);f.state.day=10;complete(f);
 assert.equal(f.pip.data.meetings.length,2);
 assert.deepEqual(JSON.parse(JSON.stringify(f.pip.data.meetings.map(m=>m.day))),[9,10]);
});
test('cancel midway never creates an invented adult encounter',()=>{
 const f=fixture();f.pip.neighbors.start('bea');f.pip.neighbors.answer(0);
 f.pip.neighbors.handle('pn275-cancel');assert.equal(f.pip.data.meetings.length,0);assert.equal(f.saves,0);
});
test('if the actual adult leaves during the activity, the experience cannot finish',()=>{
 const f=fixture();f.pip.neighbors.start('bea');f.pip.neighbors.answer(0);
 f.adults.find(a=>a.id==='bea').y=1350;
 assert.equal(f.pip.neighbors.step(),false);assert.equal(f.pip.data.meetings.length,0);
});
test('day rollover cancels half-finished child neighbor encounters',()=>{
 const f=fixture();f.pip.neighbors.start('bea');f.pip.neighbors.answer(1);
 f.state.day++;assert.equal(f.pip.neighbors.step(),false);assert.equal(f.saves,0);
});
test('invalid choices do not advance the two-step dialogue',()=>{
 const f=fixture();f.pip.neighbors.start('bea');
 assert.equal(f.pip.neighbors.answer(-1),false);assert.equal(f.pip.neighbors.answer(2),false);
 assert.equal(f.pip.neighbors.answer(NaN),false);assert.equal(f.pip.data.meetings.length,0);
});
test('guardian walk cannot start without voluntary guardian, cottage and real proximity',()=>{
 const f=fixture();assert.equal(f.pip.neighbors.startWalk(),false);
 f.state.youngResidents.pip.guardian='player';f.state.youngResidents.pip.guardianDay=6;
 assert.equal(f.pip.neighbors.startWalk(),false);
 f.setScene('home');f.setPlayer(200,400);assert.equal(f.pip.neighbors.startWalk(),false);
 assert.equal(f.goes,0);
});
test('real optional walk follows player through the actual town, never auto-grants rewards',()=>{
 const f=guarded();
 assert.equal(f.pip.neighbors.startWalk(),true);assert.equal(f.goes,1);
 assert.equal(f.pip.neighbors.walkingNow(),true);assert.equal(f.pip.neighbors.escortPose().x,528);
 assert.equal(f.saves,0);assert.equal(f.pip.data.meetings.length,0);
});
test('Pip moves toward a changing player target and uses walking frames/facing',()=>{
 const f=guarded();f.pip.neighbors.startWalk();const before=f.pip.position();
 f.setPlayer(805,816);f.pip.advance(.3);const after=f.pip.position();
 assert.ok(after.x>before.x&&after.y>before.y);
 assert.equal(f.pip.neighbors.escortPose().moving,true);
 assert.equal(f.pip.hit(after.x,after.y-45,'town'),true);
});
test('Pip can visit an existing villager after walking close together',()=>{
 const f=guarded();f.pip.neighbors.startWalk();
 const p=f.pip.position();f.adults.find(a=>a.id==='bea').x=p.x+20;f.adults.find(a=>a.id==='bea').y=p.y;
 assert.equal(f.pip.neighbors.adultNear()?.id,'bea');
 complete(f);assert.equal(f.pip.data.meetings.length,1);
});
test('after the walk ends, Pip returns to their true cottage schedule, not town',()=>{
 const f=guarded();f.pip.neighbors.startWalk();assert.equal(f.pip.neighbors.stopWalk(),true);
 assert.equal(f.pip.neighbors.walkingNow(),false);
 assert.equal(f.pip.hit(f.player.x,f.player.y-45,'town'),false);
 assert.equal(f.pip.routines.location().scene,'home');
});
test('changing scenes or days ends an unfinished walk without permanent escort state',()=>{
 const f=guarded();f.pip.neighbors.startWalk();f.setScene('home');f.pip.advance(.2);
 assert.equal(f.pip.neighbors.walkingNow(),false);
 const g=guarded();g.pip.neighbors.startWalk();g.state.day=10;g.pip.advance(.2);
 assert.equal(g.pip.neighbors.walkingNow(),false);
});
test('the escort action only lives in this play session and is not saved into old child files',()=>{
 const f=guarded();f.pip.neighbors.startWalk();
 const clean=L.clean(JSON.parse(JSON.stringify(f.pip.data)));
 assert.equal(clean.guardian,'player');assert.equal(clean.meetings.length,0);
 assert.equal(Object.prototype.hasOwnProperty.call(clean,'walking'),false);
});
test('real adult-neighbor history enters Atlas timeline but never creates family kinship',()=>{
 const f=fixture();complete(f);
 const atlas=A.setup({getState:()=>f.state,getResidentHome:()=>null,getYoungResident:()=>f.pip.status(),
  getPersonLabel:id=>id,getHomeLabel:x=>x,getPortraits:()=>[],showModal(){}});
 const ev=atlas.events();assert.equal(ev.filter(x=>x.kind==='child-neighbor').length,1);
 assert.deepEqual(JSON.parse(JSON.stringify(ev.find(x=>x.kind==='child-neighbor').ids)),['pip','bea']);
 assert.equal(atlas.graph().edges.some(x=>x.ids.includes('pip')&&x.kind==='marriage'),false);
});
test('phony neighbor records never create timeline events about fabricated people',()=>{
 const f=fixture();f.state.youngResidents.pip.meetings=[{day:3,id:'unknown',mask:0},{day:3,id:'bea',mask:8},{day:15,id:'bea',mask:0}];
 const a=A.setup({getState:()=>f.state,getResidentHome:()=>null,getYoungResident:()=>f.pip.status()});
 assert.equal(a.events().filter(x=>x.kind==='child-neighbor').length,0);
});
test('mobile asset order, offline cache, menu and actual world update are wired',()=>{
 const html=read('index.html'),sw=read('sw.js'),game=read('game.js'),css=read('pip-neighbors-v275.css'),little=read('little-sprouts-v272.js');
 for(const file of ['pip-neighbors-v275.js','pip-neighbors-v275.css']){assert.ok(html.includes(file));assert.ok(sw.includes("'./"+file+"'"))}
 assert.ok(html.indexOf('pip-neighbors-v275.js')<html.indexOf('little-sprouts-v272.js'));
 assert.ok(html.indexOf('little-sprouts-v272.js')<html.indexOf('game.js'));
 assert.match(html,/v=2\.7\.5/);assert.match(sw,/hearth-harbor-v275-neighbor-walks/);
 assert.match(css,/:focus-visible/);assert.match(css,/@media\(max-width:380px\)/);
 assert.match(game,/littleSprouts\.advance\(dt\)/);assert.match(game,/getAdults:\(\)=>NPCS\.map/);
 assert.match(little,/neighbors\.page\(\)/);assert.match(little,/neighbors\.escortPose\(\)/);
 assert.match(game,/const SAVE='hearth-harbor-save-v1'/);
});
test('world encounters use no timers, server, direct adult romance or independent storage',()=>{
 const src=read('pip-neighbors-v275.js');
 assert.doesNotMatch(src,/setInterval|setTimeout|XMLHttpRequest|WebSocket|localStorage|fetch\(|new Image\(/);
 assert.doesNotMatch(src,/romance|weddingPlans|money\s*\+=/);
});

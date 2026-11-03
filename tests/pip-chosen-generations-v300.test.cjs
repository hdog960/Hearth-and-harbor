/* Hearth & Harbor v3.0 — explicitly chosen, evidence-backed growing years. */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),
 fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=x=>fs.readFileSync(path.join(__dirname,'..',x),'utf8');
const env={window:{}};
for(const f of ['wren-neighbor-v295.js','pip-home-echoes-v299.js',
 'pip-family-bond-v294.js','pip-growth-v280.js','pip-projects-v278.js',
 'pip-guides-v279.js','pip-routines-v273.js','pip-home-autonomy-v291.js','family-atlas-v271.js'])
 vm.runInNewContext(read(f),env,{filename:f});
const {HearthPipGrowth:G,HearthYoungNeighbors:W,HearthPipHomeEchoes:H,
 HearthPipFamilyBond:B,HearthPipRoutines:R,HearthFamilyAtlas:A}=env.window;
const plain=x=>JSON.parse(JSON.stringify(x));
const peers=[
 {day:4,kind:'story',first:0,last:0},
 {day:5,kind:'color',first:1,last:0},
 {day:6,kind:'nature',first:0,last:1},
 {day:7,kind:'story',first:0,last:1},
 {day:8,kind:'color',first:1,last:1},
 {day:9,kind:'nature',first:0,last:0}
];
const wren={friendships:peers,club:{foundation:peers.slice(0,3),chapters:[
 {kind:'story',day:11,first:0,last:1,source:peers[0]},
 {kind:'color',day:12,first:1,last:0,source:peers[1]}
 ]}};
const echoes={records:[
 {day:15,kind:'story',homeKind:'read',choice:0,peer:peers[0]},
 {day:16,kind:'color',homeKind:'hobby',choice:1,peer:peers[1]}
]};
const bond={chapters:[{id:1,day:17,choice:0},{id:2,day:19,choice:1}]};
function fixture({day=27,guardian='player',guardianDay=2,early=false,
  wrenData=wren,echoesData=echoes,bondData=bond,growth={stage:2,firstDay:14,secondDay:20},
  scene='home',near=true,moving=false,busy=false}={}){
 const c={guardian,guardianDay,growth:plain(growth),familyBond:plain(bondData),
  homeEchoes:plain(echoesData),needs:{confidence:62,joy:67,curiosity:72},
  skills:{story:7,art:7,garden:7},homeHelps:[],meetings:[],projects:[],evenings:[]};
 const state={day,minute:850,coins:430,relations:{bea:28},
  youngResidents:{pip:c,wren:plain(wrenData)},familyRoots:{chosen:{}},weddingPlans:{}};
 let where=scene,isNear=near,walking=moving,occupied=busy,modal=null,saves=0,updates=0,notices=[];
 const api={getState:()=>state,getChild:()=>state.youngResidents.pip,getScene:()=>where,
  nearChild:()=>isNear,isPlayerMoving:()=>walking,
  isOtherFamilyActivity:()=>occupied,isDialogOpen:()=>!!modal,
  showModal:(key,html)=>modal={key,html},closeModal:()=>modal=null,
  save:()=>saves++,updateUI:()=>updates++,notify:x=>notices.push(x),
  openBook:()=>{modal={key:'little-sprouts',html:'Pip Daybook'};return true}};
 const g=G.setup(api);
 return {g,state,c,api,get modal(){return modal},get saves(){return saves},
  get updates(){return updates},notices,setDay:x=>state.day=x,
  setScene:x=>where=x,setNear:x=>isNear=x,setMoving:x=>walking=x,
  setBusy:x=>occupied=x,close:()=>modal=null,
  pick(choice='0'){assert.equal(g.consider(),true);
   assert.match(modal.html,/pg300-choose/);
   assert.equal(g.handle('pg300-choose',choice),true)}
 };
}
test('legacy save has exactly the same first two growth receipts and optional third stage is off',()=>{
 assert.deepEqual(plain(G.clean(null)),{stage:0,firstDay:0,secondDay:0});
 assert.deepEqual(plain(G.clean({stage:2,firstDay:14,secondDay:20})),
  {stage:2,firstDay:14,secondDay:20});
 assert.equal(G.STAGES.length,4);
 assert.equal(G.CHAPTERS.length,3);
 assert.equal(G.STAGES[3].name,'Young Teen');
});
test('genuine friendship history, two club chapters, home stories and family bonds validate',()=>{
 const child=fixture().c;
 const old=G.evidence(child,27,wren);
 assert.equal(old.postIndependentDays,7);
 assert.equal(old.peerDays,6);assert.equal(old.clubChapters,2);
 assert.equal(old.homeStories,2);assert.equal(old.familyBond,2);
 assert.equal(W.clean(wren).club.chapters.length,2);
 assert.equal(H.clean(echoes,2).records.length,2);
 assert.equal(B.clean(bond,2).chapters.length,2);
});
test('long genuine history unlocks but does not automatically claim the new chapter',()=>{
 const f=fixture(),p=f.g.progress();
 assert.equal(p.stage,2);assert.equal(p.chapters[2].ready,true);
 assert.equal(p.chapters[2].goals.length,5);
 assert.equal(f.g.stage,2);assert.equal(f.saves,0);
 assert.equal(f.g.canClaim(3),false,'no direct one-click transition');
 assert.match(f.g.panel(),/Talk about growing into the teen years/);
 assert.equal(f.c.growth.stage,2);
});
test('seven days must pass after independently earned stage two, with no timer auto-claim',()=>{
 const f=fixture({day:26});assert.equal(f.g.progress().counts.postIndependentDays,6);
 assert.equal(f.g.consider(),false);
 f.setDay(27);assert.equal(f.g.consider(),true);
 assert.equal(f.c.growth.stage,2);assert.equal(f.saves,0);
});
test('each earned experience is individually required, not a Daybook click',()=>{
 for(const config of [
  {wrenData:{friendships:peers.slice(0,4),club:wren.club}},
  {wrenData:{friendships:peers,club:{foundation:peers.slice(0,3),chapters:wren.club.chapters.slice(0,1)}}},
  {echoesData:{records:echoes.records.slice(0,1)}},
  {bondData:{chapters:bond.chapters.slice(0,1)}}]){
  const f=fixture(config);assert.equal(f.g.consider(),false);
  assert.equal(f.saves,0);
 }
});
test('imported fake club chapters with no earlier verified sources cannot unlock age',()=>{
 const forged={friendships:peers,club:{foundation:[],chapters:wren.club.chapters}};
 const f=fixture({wrenData:forged});
 assert.equal(f.g.progress().counts.clubChapters,0);
 assert.equal(f.g.consider(),false);
});
test('only Pip in Poppy cottage and chosen guardianship can request the transition',()=>{
 for(const opts of [
  {guardian:null},{guardianDay:28},{scene:'town'},{near:false},
  {moving:true},{busy:true}]){
  const f=fixture(opts);assert.equal(f.g.consider(),false);
  assert.equal(f.saves,0);
 }
});
test('first option updates the physical stage, keeps prior receipts, and never pays currency',()=>{
 const f=fixture(),before=plain(f.state);
 f.pick('0');
 assert.equal(f.g.stage,3);assert.equal(f.g.visual().name,'Young Teen');
 assert.equal(f.g.visual().scale,1.045);
 assert.deepEqual(plain(f.c.growth),
  {stage:3,firstDay:14,secondDay:20,thirdDay:27,thirdChoice:0});
 assert.equal(f.saves,1);assert.equal(f.updates,1);
 assert.equal(f.state.coins,before.coins);
 assert.deepEqual(plain(f.state.relations),before.relations);
 assert.deepEqual(plain(f.c.needs),before.youngResidents.pip.needs);
 assert.equal(f.g.consider(),false);
 assert.equal(f.g.decide(1),false);
});
test('second option is a distinct lasting choice with different original pixel detail',()=>{
 const f=fixture();f.pick('1');
 assert.equal(f.c.growth.thirdChoice,1);
 assert.equal(f.g.progress().thirdChoice,1);
 const strokes=[],g={save(){},restore(){},fillStyle:'',fillRect(...v){strokes.push([this.fillStyle,...v])},
  fillText(){}};
 assert.equal(f.g.drawAccessory(g,553,720,1),true);
 assert.equal(f.g.drawWall(g,1),true);
 assert.ok(strokes.some(x=>x[0]==='#bc98ac'));
 assert.ok(strokes.some(x=>x[0]==='#d3a7b8'));
});
test('different options produce different original, visible wall and worn colors',()=>{
 const a=fixture(),b=fixture();a.pick('0');b.pick('1');
 const colors=f=>{const rows=[],g={save(){},restore(){},fillStyle:'',
  fillRect(...args){rows.push(this.fillStyle)},fillText(){}};
  f.g.drawAccessory(g,500,700,0);f.g.drawWall(g,0);return rows};
 assert.ok(colors(a).includes('#87bdad'));
 assert.ok(colors(b).includes('#d3a7b8'));
});
test('stale days, moving out of reach, interruptions, and modal closure cannot claim',()=>{
 const future=fixture();future.g.consider();future.setDay(28);
 assert.equal(future.g.decide(1),false);assert.equal(future.saves,0);
 const far=fixture();far.g.consider();far.setNear(false);
 assert.equal(far.g.decide(1),false);assert.equal(far.saves,0);
 const busy=fixture();busy.g.consider();busy.setBusy(true);
 assert.equal(busy.g.decide(0),false);assert.equal(busy.saves,0);
 const closed=fixture();closed.g.consider();closed.close();closed.g.advance();
 assert.equal(closed.g.teenPrompt,null);
 assert.equal(closed.g.decide(0),false);assert.equal(closed.saves,0);
});
test('malformed button input or an unconfirmed direct call never changes age',()=>{
 const f=fixture();
 assert.equal(f.g.decide(0),false);
 f.g.consider();
 for(const id of ['','2','01','NaN','true']){
  assert.equal(f.g.handle('pg300-choose',id),false);
 }
 assert.equal(f.c.growth.stage,2);assert.equal(f.saves,0);
});
test('invalid or future-dated teen receipts cannot advance physical stage early',()=>{
 const malformed=[
  {stage:3,firstDay:14,secondDay:20,thirdDay:20,thirdChoice:0},
  {stage:3,firstDay:14,secondDay:20,thirdDay:27,thirdChoice:2},
  {stage:3,firstDay:14,secondDay:20,thirdDay:0,thirdChoice:0},
  {stage:3,firstDay:14,secondDay:20,thirdDay:27},
 ];
 for(const raw of malformed)assert.equal(G.clean(raw).stage,2);
 const early=fixture({day:26,growth:{stage:3,firstDay:14,secondDay:20,thirdDay:27,thirdChoice:0}});
 assert.equal(early.g.stage,2);
 early.setDay(27);assert.equal(early.g.stage,3);
 const unguarded=fixture({guardian:null,growth:{stage:3,firstDay:14,secondDay:20,thirdDay:27,thirdChoice:1}});
 assert.equal(unguarded.g.stage,0);
});
test('the two older childhood milestones remain separate, legitimate and non-teen',()=>{
 const f=fixture({growth:{stage:1,firstDay:14,secondDay:0}});
 assert.equal(f.g.stage,1);assert.equal(f.g.consider(),false);
 assert.equal(f.g.celebrate(3),false);
 assert.equal(f.g.progress().chapters[2].ready,false);
});
test('the original living day gets a new walkable teen routine, not a fake home',()=>{
 const f=fixture();f.pick('0');
 const state=f.state,c=f.c;
 const r=R.setup({getState:()=>state,getChild:()=>c,getScene:()=> 'home',
  getAdults:()=>[],isWalkable:()=>true,adjustHomePose:p=>p,isNearby:()=>true});
 const at=r.location();
 assert.equal(at.growthStage,3);
 assert.equal(at.x,611);assert.equal(at.y,756);
 assert.match(at.label,/Planning a little adventure/);
 assert.equal(at.prop,'book');
 assert.ok(at.route.some(x=>/little adventure/.test(x.title)));
});
test('care-focused teen routine selects alternate real cottage station and craft prop',()=>{
 const f=fixture();f.pick('1');const state=f.state,c=f.c;
 const r=R.setup({getState:()=>state,getChild:()=>c,getScene:()=> 'home',
  getAdults:()=>[],isWalkable:()=>true,adjustHomePose:p=>p,isNearby:()=>true});
 const at=r.location();assert.equal(at.x,655);assert.equal(at.y,795);
 assert.match(at.label,/welcome journal/);assert.equal(at.prop,'crayon');
});
test('the existing chosen child dream still owns its scheduled station and now changes theme',()=>{
 const f=fixture();f.pick('0');const state=f.state,c=f.c;
 c.dream={focus:'stories',chosenDay:3};
 const r=R.setup({getState:()=>state,getChild:()=>c,getScene:()=> 'home',
  getAdults:()=>[],isWalkable:()=>true,adjustHomePose:p=>p,isNearby:()=>true});
 const at=r.location();assert.equal(at.growthStage,3);
 assert.equal(at.project,true);assert.match(at.label,/A Curious/);
});
test('Family Atlas records a third, authored growth event without adult kinship',()=>{
 const f=fixture();f.pick('1');
 const atlas=A.setup({getState:()=>f.state,getResidentHome:()=>null,
  getYoungResident:()=>({guardian:'player',guardianDay:2}),
  getPersonLabel:id=>id,getPortraits:()=>[]});
 const childEvents=atlas.events().filter(e=>e.kind==='child-growth');
 assert.equal(childEvents.length,3);
 assert.ok(childEvents.some(e=>e.day===27&&/kindness/.test(e.detail)));
 const g=atlas.graph();
 assert.ok(g.edges.every(e=>!(e.kind==='marriage'&&e.ids.includes('pip'))));
});
test('the real iPhone game includes both historical and new milestone action routing',()=>{
 const game=read('game.js'),child=read('little-sprouts-v272.js'),html=read('index.html'),sw=read('sw.js');
 assert.match(game,/action\.startsWith\('pg280-'\)/);
 assert.match(game,/action\.startsWith\('pg300-'\)/);
 assert.match(child,/growth\.handle\(action,id\)/);
 assert.match(child,/growth\.advance\?\.\(\)/);
 assert.match(game,/littleSprouts\.growth\.visual\(\)\.scale/);
 assert.match(game,/littleSprouts\.growth\.drawWall\(ctx,tick\)/);
 assert.ok(html.includes('pip-growth-v280.js?v=3.0'));
 assert.ok(html.includes('pip-routines-v273.js?v=3.0'));
 assert.ok(html.includes('pip-projects-v278.js?v=3.0'));
 assert.ok(html.includes('little-sprouts-v272.js?v=3.0'));
 assert.ok(html.includes('game.js?v=3.0'));
 assert.match(sw,/hearth-harbor-v300-chosen-generations/);
 assert.match(game,/const SAVE='hearth-harbor-save-v1'/);
});
test('new stage adds no network, background aging, timers, jobs or romance to Pip',()=>{
 const sources=read('pip-growth-v280.js')+read('pip-routines-v273.js');
 assert.doesNotMatch(sources,/fetch\(|WebSocket|XMLHttpRequest|setInterval|setTimeout/);
 const core=read('game.js'),adults=core.slice(core.indexOf('const NPCS=['),core.indexOf('const HEX=n=>'));
 assert.doesNotMatch(adults,/id:'pip'/);
 assert.match(sources,/A choice, NEVER A TIMER|GENERATION/i);
});

test('a chosen teen walks to changed dream stations without scheduled teleportation',()=>{
 const f=fixture();f.pick('0');
 const H=env.window.HearthPipHomeAutonomy;
 let destination={scene:'home',x:700,y:730,project:true,growthStage:3,
  facing:'front',label:'First activity',prop:'book',slot:2,icon:'📘'};
 const h=H.setup({getState:()=>f.state,getChild:()=>f.c,getScene:()=> 'home',
  getSchedule:()=>destination,getOverridePose:()=>null,isChildSessionActive:()=>false,
  isWalkable:()=>true,nearestWalkable:p=>p,findPath:(_from,to)=>[to],
  isPaused:()=>false});
 h.advance(.05);
 const start=h.pose();assert.ok(start,'project work is now an actual walking actor');
 assert.equal(start.x,700);
 destination={...destination,x:610,y:760,label:'New self-chosen dream station'};
 h.advance(.1);
 const next=h.pose();assert.ok(next);
 assert.ok(next.x<700&&next.x>610,'Pip must walk toward the new station, not teleport');
 assert.ok(next.moving);
 const old=H.setup({getState:()=>f.state,getChild:()=>({...f.c,growth:{stage:2,firstDay:14,secondDay:20}}),
  getScene:()=> 'home',getSchedule:()=>({...destination,growthStage:2}),getOverridePose:()=>null,
  isChildSessionActive:()=>false,isWalkable:()=>true,nearestWalkable:p=>p,
  findPath:(_a,b)=>[b],isPaused:()=>false});
 old.advance(.1);assert.equal(old.pose(),null,'preexisting guided project behavior remains');
});

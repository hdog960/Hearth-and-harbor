/* Hearth & Harbor v2.8.1 — real-world stage-specific 3-stop adventures regression */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=x=>fs.readFileSync(path.join(__dirname,'..',x),'utf8');
const env={window:{}};
for(const f of ['pip-growth-v280.js','pip-legacy-v282.js','pip-adventures-v281.js','pip-projects-v278.js','pip-guides-v279.js','pip-routines-v273.js','pip-neighbors-v275.js','pip-home-help-v276.js','pip-dreams-v277.js','little-sprouts-v272.js','family-atlas-v271.js'])
 vm.runInNewContext(read(f),env,{filename:f});
const H=env.window.HearthPipAdventures,L=env.window.HearthLittleSprouts,A=env.window.HearthFamilyAtlas;
const plain=x=>JSON.parse(JSON.stringify(x));
const NPCS=[
 {id:'mabel',name:'Mabel',x:720,y:594},{id:'rosie',name:'Rosie',x:396,y:757},{id:'oliver',name:'Oliver',x:948,y:525},
 {id:'jun',name:'Jun',x:423,y:935},{id:'bea',name:'Bea',x:794,y:803},{id:'finn',name:'Finn',x:1035,y:1095}
];
function fixture({stage=1,guardian=true,day=25}={}){
 const child=L.defaults();
 if(guardian){child.guardian='player';child.guardianDay=2}
 if(stage){child.growth={stage,firstDay:3,secondDay:stage===2?15:0}}
 const state={day,minute:830,coins:470,youngResidents:{pip:child},familyRoots:{chosen:{}},weddingPlans:{}};
 let scene='town',player={x:720,y:594},pip={x:710,y:595},modal=null,saves=0,updates=0,walkable=()=>true,nearest=p=>p;
 const adults=plain(NPCS),notices=[];
 const api={getState:()=>state,getChild:()=>state.youngResidents.pip,getScene:()=>scene,
 getAdults:()=>adults,getPlayer:()=>({...player}),childPosition:()=>({...pip}),
 isWalkable:(x,y,s)=>walkable(x,y,s),nearestWalkable:(p,s)=>nearest(p,s),
 showModal:(id,html)=>{modal={id,html}},closeModal:()=>{modal=null},
 save:()=>saves++,updateUI:()=>updates++,notify:x=>notices.push(x),openBook:()=>{},closeTalk:()=>{}};
 const a=H.setup(api);
 return {a,api,state,adults,notices,get saves(){return saves},get updates(){return updates},get modal(){return modal},
 child:()=>state.youngResidents.pip,setScene:v=>scene=v,setPlayer:(x,y)=>{player={x,y}},
 setPip:(x,y)=>{pip={x,y}},visit:(id)=>{const n=adults.find(x=>x.id===id);player={x:n.x,y:n.y};pip={x:n.x-10,y:n.y+1}},
 walkTo:(p)=>{player={x:p.x,y:p.y};pip={x:p.x-15,y:p.y+5}},setWalkable:fn=>walkable=fn,setNearest:fn=>nearest=fn};
}
function traverse(f,id='mabel',choice=0){
 f.visit(id);assert.equal(f.a.start(id),true);
 for(let i=0;i<3;i++){
  const p=f.a.status().spots[i];
  f.walkTo(p);
  assert.equal(f.a.arrive(i),true);
 }
 assert.equal(f.a.choose(choice),true);
}
test('six adventures use actual Maplewood adults, different topics and genuine developmental gates',()=>{
 assert.deepEqual(Object.keys(H.LOCATIONS),['mabel','rosie','bea','jun','oliver','finn']);
 assert.equal(new Set(Object.values(H.LOCATIONS).map(d=>d.title)).size,6);
 for(const d of Object.values(H.LOCATIONS)){
  assert.equal(d.tasks.length,3);assert.equal(d.answers.length,2);
  assert.ok([1,2].includes(d.stage));assert.ok(['joy','confidence','curiosity'].includes(d.need));
 }
});
test('before a real milestone, no grown child adventures are available',()=>{
 const f=fixture({stage:0});assert.equal(f.a.eligible('mabel'),false);
 assert.equal(f.a.start('mabel'),false);
});
test('growing child stage one unlocks three appropriate neighbors only',()=>{
 const f=fixture({stage:1});
 assert.equal(f.a.eligible('mabel'),true);
 for(const id of ['rosie','bea']){f.visit(id);assert.equal(f.a.eligible(id),true)}
 for(const id of ['jun','oliver','finn']){f.visit(id);assert.equal(f.a.eligible(id),false)}
});
test('independent child stage two unlocks all six real age-appropriate town challenges',()=>{
 const f=fixture({stage:2});
 for(const id of Object.keys(H.LOCATIONS)){f.visit(id);assert.equal(f.a.eligible(id),true)}
});
test('without a chosen guardian, forged stage records cannot unlock activities',()=>{
 const f=fixture({stage:2,guardian:false});
 assert.equal(f.a.eligible('mabel'),false);assert.equal(f.a.eligible('jun'),false);
});
test('a session cannot begin while Pip is still physically back at the cottage',()=>{
 const f=fixture();f.setPip(900,1000);assert.equal(f.a.start('mabel'),false);
});
test('distant player tapping a talk menu cannot launch a remote child activity',()=>{
 const f=fixture();f.setPlayer(1200,1000);assert.equal(f.a.start('mabel'),false);
});
test('town-only activity cannot begin from a different scene',()=>{
 const f=fixture();f.setScene('home');assert.equal(f.a.start('mabel'),false);
});
test('each adventure starts only where the actual villager is in world space',()=>{
 const f=fixture();f.visit('mabel');const original=f.adults[0];
 original.x=1200;original.y=1120;
 assert.equal(f.a.start('mabel'),false);
 f.visit('mabel');assert.equal(f.a.start('mabel'),true);
 assert.ok(f.a.status().spots.every(p=>Math.hypot(p.x-original.x,p.y-original.y)<163));
});
test('planning does not instantly award a child needs boost, cash, save record or currency',()=>{
 const f=fixture();const needs={...f.child().needs};
 assert.equal(f.a.start('mabel'),true);assert.equal(f.saves,0);
 assert.equal(f.child().adventures.length,0);assert.deepEqual(plain(f.child().needs),needs);
 assert.equal(f.state.coins,470);
});
test('three distinct walkable physical stops are required, in exact order',()=>{
 const f=fixture();f.a.start('mabel');
 const s=f.a.status();assert.equal(s.spots.length,3);
 assert.ok(s.spots.every((p,i)=>s.spots.every((q,j)=>i===j||Math.hypot(p.x-q.x,p.y-q.y)>27)));
 assert.equal(f.a.arrive(2),false);assert.equal(f.a.arrive(1),false);
 assert.equal(f.a.status().step,0);
});
test('tapping the marker without walking to it does not count the stop',()=>{
 const f=fixture();f.a.start('mabel');
 const p=f.a.status().spots[0];assert.ok(f.a.hit(p.x,p.y-18));
 assert.equal(f.a.arrive(0),false);assert.equal(f.a.status().step,0);
});
test('a marker can only be activated by tapping its actual 2.5D world position',()=>{
 const f=fixture();f.a.start('mabel');const p=f.a.status().spots[0];
 assert.deepEqual(plain(f.a.hit(p.x,p.y-18)),{x:p.x,y:p.y,step:0});
 assert.equal(f.a.hit(120,280),null);
});
test('only the next glowing town object accepts a real tap',()=>{
 const f=fixture();f.a.start('mabel');const pts=f.a.status().spots;
 assert.equal(f.a.hit(pts[2].x,pts[2].y-18),null);
 f.walkTo(pts[0]);f.a.arrive(0);
 assert.equal(f.a.hit(pts[0].x,pts[0].y-18),null);
 assert.ok(f.a.hit(pts[1].x,pts[1].y-18));
});
test('after two real stops the child is still unpaid and the third is highlighted',()=>{
 const f=fixture();f.a.start('mabel');const s=f.a.status();
 for(let i=0;i<2;i++){f.walkTo(s.spots[i]);assert.equal(f.a.arrive(i),true)}
 assert.equal(f.a.status().step,2);
 assert.equal(f.saves,0);assert.equal(f.child().adventures.length,0);
});
test('the third real-world stop opens an age-specific final decision and does not save yet',()=>{
 const f=fixture();f.a.start('mabel');const s=f.a.status();
 for(let i=0;i<3;i++){f.walkTo(s.spots[i]);assert.equal(f.a.arrive(i),true)}
 assert.equal(f.a.status().readyChoice,true);assert.match(f.modal.html,/ALL THREE REAL STOPS FOUND/);
 assert.equal(f.saves,0);assert.equal(f.child().adventures.length,0);
});
test('three authentic world stops and a meaningful choice earn one bounded childhood memory',()=>{
 const f=fixture();traverse(f,'mabel',1);
 assert.deepEqual(plain(f.child().adventures),[{day:25,id:'mabel',stage:1,choice:1}]);
 assert.equal(f.saves,1);assert.equal(f.updates,1);
 assert.equal(f.state.coins,470);
});
test('child gains only modest bounded needs from the new real-world challenge',()=>{
 const f=fixture();const before={...f.child().needs};
 traverse(f,'mabel',0);
 assert.equal(f.child().needs.curiosity,before.curiosity+7);
 assert.equal(f.child().needs.joy,before.joy+2);
 assert.equal(f.child().skills.story,0);
});
test('each of six guides rewards a different genuine stage challenge and save type',()=>{
 for(const id of Object.keys(H.LOCATIONS)){
  const stage=H.LOCATIONS[id].stage,f=fixture({stage});
  traverse(f,id,0);
  assert.equal(f.child().adventures[0].id,id);
  assert.equal(f.child().adventures[0].stage,stage);
 }
});
test('an adventure can be earned at most once per genuine game day',()=>{
 const f=fixture();traverse(f);
 f.visit('bea');assert.equal(f.a.start('bea'),false);
 assert.equal(f.child().adventures.length,1);assert.equal(f.saves,1);
});
test('an older child may earn a new and different world challenge on a later day',()=>{
 const f=fixture({stage:2});traverse(f,'jun',1);
 f.state.day=26;traverse(f,'finn',0);
 assert.deepEqual(plain(f.child().adventures.map(r=>r.day)),[25,26]);
});
test('cancelling an unfinished town journey never saves a fabricated child memory',()=>{
 const f=fixture();f.a.start('mabel');
 f.walkTo(f.a.status().spots[0]);f.a.arrive(0);
 assert.equal(f.a.stop(),true);
 assert.equal(f.child().adventures.length,0);assert.equal(f.saves,0);
});
test('walking out of town interrupts a real child adventure',()=>{
 const f=fixture();f.a.start('mabel');f.setScene('home');
 assert.equal(f.a.status(),null);
 assert.equal(f.child().adventures.length,0);
});
test('day rollover interrupts the current task and resets progress with no payout',()=>{
 const f=fixture();f.a.start('mabel');f.state.day=26;
 assert.equal(f.a.status(),null);
 assert.equal(f.saves,0);
});
test('a real adult disappearing from Maplewood interrupts the adventure',()=>{
 const f=fixture();f.a.start('mabel');f.adults.splice(0,1);
 assert.equal(f.a.status(),null);assert.equal(f.saves,0);
});
test('a real adult moving far away invalidates frozen station objects',()=>{
 const f=fixture();f.a.start('mabel');f.adults[0].x+=400;
 assert.equal(f.a.status(),null);
});
test('a child walking out of range cannot finish the final choice remotely',()=>{
 const f=fixture();f.a.start('mabel');const s=f.a.status();
 for(let i=0;i<3;i++){f.walkTo(s.spots[i]);f.a.arrive(i)}
 f.setPip(200,200);assert.equal(f.a.choose(0),false);assert.equal(f.saves,0);
});
test('a child losing the earned growth stage during an activity cannot complete it',()=>{
 const f=fixture();f.a.start('mabel');
 f.child().growth={stage:0,firstDay:0,secondDay:0};
 assert.equal(f.a.status(),null);assert.equal(f.saves,0);
});
test('walkability and physical room around the real neighbor are prerequisites to beginning',()=>{
 const f=fixture();f.setWalkable(()=>false);f.setNearest(()=>null);
 assert.equal(f.a.start('mabel'),false);
 assert.equal(f.a.session,null);assert.equal(f.saves,0);
});
test('a crowded world that collapses all stops to one location must refuse launch',()=>{
 const f=fixture();f.setWalkable(()=>false);
 f.setNearest(()=>({x:720,y:594}));
 assert.equal(f.a.start('mabel'),false);
});
test('choosing a final answer prematurely cannot award a memory',()=>{
 const f=fixture();f.a.start('mabel');
 assert.equal(f.a.choose(0),false);
 assert.equal(f.saves,0);assert.equal(f.child().adventures.length,0);
});
test('malformed choice indexes are never rewarded at the third world stop',()=>{
 const f=fixture();f.a.start('mabel');const s=f.a.status();
 for(let i=0;i<3;i++){f.walkTo(s.spots[i]);f.a.arrive(i)}
 for(const v of [-1,2,NaN,undefined])assert.equal(f.a.choose(v),false);
 assert.equal(f.saves,0);
});
test('the original child save migrates with no invented adventure history',()=>{
 const c=L.clean({guardian:'player',guardianDay:3,growth:{stage:1,firstDay:4},skills:{story:6},homeHelps:[{day:8,kind:'read'}]});
 assert.deepEqual(plain(c.adventures),[]);
 assert.equal(c.growth.stage,1);assert.equal(c.skills.story,6);
 assert.equal(c.homeHelps.length,1);
});
test('new childhood adventure saves survive a round trip without erasing earlier activities',()=>{
 const f=fixture();f.child().homeHelps=[{day:6,kind:'tidy'}];traverse(f,'mabel',1);
 const restored=L.clean(plain(f.child()));
 assert.equal(restored.adventures[0].id,'mabel');
 assert.equal(restored.homeHelps.length,1);assert.equal(restored.growth.stage,1);
});
test('malformed, future-invalid formats, duplicates and non-stage-matching events are sanitized',()=>{
 const s=H.clean([{day:3,id:'mabel',stage:1,choice:0},{day:3,id:'rosie',stage:1,choice:1},
 {day:4,id:'jun',stage:1,choice:1},{day:-4,id:'bea',stage:1,choice:0},
 {day:5,id:'finn',stage:2,choice:3},{day:6,id:'jun',stage:2,choice:0}]);
 assert.deepEqual(plain(s),[{day:3,id:'mabel',stage:1,choice:0},{day:6,id:'jun',stage:2,choice:0}]);
});
test('active three-stop markers are genuinely painted on the town Canvas, not UI stickers',()=>{
 const f=fixture();f.a.start('mabel');
 const calls=[],g={save(){},restore(){},fillRect(){calls.push(1)},set globalAlpha(n){}};
 assert.equal(f.a.draw(g,1),true);assert.ok(calls.length>15);
});
test('no world markers appear after finishing the task or outside the valid scene',()=>{
 const f=fixture();f.a.start('mabel');f.setScene('home');
 assert.equal(f.a.draw({save(){},restore(){},fillRect(){}},1),false);
});
test('the family Atlas records authentic three-stop adventures without creating spouse or biological edges',()=>{
 const f=fixture();traverse(f,'mabel',1);
 const atlas=A.setup({getState:()=>f.state,getResidentHome:()=>null,getYoungResident:()=>({guardian:'player',guardianDay:2}),getPortraits:()=>[]});
 const events=atlas.events().filter(x=>x.kind==='child-adventure');
 assert.equal(events.length,1);assert.equal(events[0].day,25);
 assert.equal(atlas.graph().edges.some(x=>x.kind==='marriage'&&x.ids.includes('pip')),false);
});
test('forged future-dated or invented child outings never enter the real Atlas',()=>{
 const f=fixture();f.child().adventures=[{day:60,id:'jun',stage:2,choice:1},{day:10,id:'fake',stage:1,choice:0}];
 const atlas=A.setup({getState:()=>f.state,getResidentHome:()=>null,getYoungResident:()=>({guardian:'player',guardianDay:2}),getPortraits:()=>[]});
 assert.equal(atlas.events().filter(x=>x.kind==='child-adventure').length,0);
});
test('tap-to-walk through physical town markers, real NPC conversation and game UI are connected',()=>{
 const game=read('game.js'),child=read('little-sprouts-v272.js');
 assert.match(game,/littleSprouts\.adventures\.hit\(wx,wy\)/);
 assert.match(game,/littleSprouts\.adventures\.arrive\(pipAdventure\.step\)/);
 assert.match(game,/littleSprouts\.adventures\.draw\(ctx,tick\)/);
 assert.match(game,/Pip’s growing adventure/);
 assert.match(child,/adventures\.panel\(\)/);
 assert.match(game,/const SAVE='hearth-harbor-save-v1'/);
});
test('the v2.8.1 phone/offline cache, script order and touch accessibility are real',()=>{
 const html=read('index.html'),sw=read('sw.js'),css=read('pip-adventures-v281.css');
 for(const file of ['pip-adventures-v281.js','pip-adventures-v281.css']){
  assert.ok(html.includes(file));assert.ok(sw.includes("'./"+file+"'"));
 }
 assert.ok(html.indexOf('pip-adventures-v281.js')<html.indexOf('little-sprouts-v272.js'));
 assert.match(html,/v=2\.8\.2/);assert.match(sw,/hearth-harbor-v282-family-legacy/);
 assert.match(css,/:focus-visible/);assert.match(css,/@media\(max-width:380px\)/);
});
test('the childhood adventure system creates no second save key, subscription or network work',()=>{
 const src=read('pip-adventures-v281.js');
 assert.doesNotMatch(src,/fetch\(|XMLHttpRequest|WebSocket|localStorage|setInterval|setTimeout|new Image\(/);
});

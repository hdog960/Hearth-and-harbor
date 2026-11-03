/* Hearth & Harbor v2.7.8 — genuine autonomous child projects QA */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const env={window:{}};
for(const file of ['pip-projects-v278.js','pip-guides-v279.js','pip-routines-v273.js','pip-neighbors-v275.js','pip-home-help-v276.js','pip-dreams-v277.js','little-sprouts-v272.js','family-atlas-v271.js'])
 vm.runInNewContext(read(file),env,{filename:file});
const P=env.window.HearthPipProjects,R=env.window.HearthPipRoutines,L=env.window.HearthLittleSprouts,A=env.window.HearthFamilyAtlas;
const plain=x=>JSON.parse(JSON.stringify(x));
function fixture({guardian=true,focus='stories',day=9,minute=850}={}){
 const child=L.defaults();if(guardian){child.guardian='player';child.guardianDay=3}
 if(focus){child.dream.focus=focus;child.dream.chosenDay=4}
 const state={day,minute,coins:310,youngResidents:{pip:child},familyRoots:{chosen:{}},weddingPlans:{}};
 let scene='home',near=true,player={x:0,y:0},modal=null,saves=0,updates=0;const notices=[];
 const api={getState:()=>state,getScene:()=>scene,isNearby:(p,r)=>near&&Math.hypot(p.x-player.x,p.y-player.y)<=r,
  getPlayer:()=>player,getAdults:()=>[],isWalkable:()=>true,nearestWalkable:p=>p,goTown:()=>{scene='town'},
  isPaused:()=>false,ownDone:()=>false,ownHold:()=>null,queueOwnAction:()=>false,
  save:()=>saves++,updateUI:()=>updates++,notify:x=>notices.push(x),closeModal:()=>{},
  showModal:(id,html)=>{modal={id,html}}};
 const pip=L.setup(api);const p=pip.position();player={x:p.x,y:p.y};
 return {pip,api,state,notices,get modal(){return modal},get saves(){return saves},get updates(){return updates},
  get player(){return player},setScene:x=>scene=x,setNear:x=>near=x,setPlayer:(x,y)=>{player={x,y}},
  child:()=>state.youngResidents.pip};
}
function complete(f,mask=0){
 assert.equal(f.pip.projects.start(),true);
 assert.equal(f.pip.projects.choose(mask&1),true);
 assert.equal(f.pip.projects.page(),true);
 assert.equal(f.pip.projects.choose((mask>>1)&1),true);
}
test('a child without a chosen dream keeps the exact original route',()=>{
 const child=L.defaults(),old=R.plan(845,'town');
 assert.deepEqual(plain(P.schedule(845,child,8,R.plan)),plain(old));
});
test('a newly welcomed child without an aspiration also keeps the original cottage routine',()=>{
 const f=fixture({focus:null});
 assert.deepEqual(plain(f.pip.routines.location()),plain(R.plan(850,'player')));
});
test('all three dreams produce distinct genuine afternoon cottage locations',()=>{
 const states=Object.keys(P.DREAMS).map(focus=>fixture({focus}).pip.routines.location());
 assert.deepEqual(states.map(x=>[x.x,x.y]),[[562,734],[809,422],[741,830]]);
 assert.equal(new Set(states.map(x=>x.label)).size,3);
});
test('dreams also influence physical morning routine stations and props',()=>{
 const x=Object.keys(P.DREAMS).map(focus=>fixture({focus,minute:490}).pip.routines.location());
 assert.deepEqual(x.map(p=>[p.x,p.y]),[[675,745],[718,611],[687,739]]);
 assert.equal(new Set(x.map(p=>p.prop)).size,3);
});
test('the bedtime and quiet portions of the day remain gentle and unaltered',()=>{
 const f=fixture({minute:1350}),p=f.pip.routines.location();
 assert.equal(p.slot,3);assert.equal(p.project,false);assert.equal(p.prop,'pillow');
 assert.equal(p.x,765);assert.equal(p.y,756);
});
test('a chosen dream without genuine guardianship never changes the outside childhood route',()=>{
 const f=fixture({guardian:false});
 assert.deepEqual(plain(f.pip.routines.location()),plain(R.plan(850,null)));
 assert.equal(f.pip.projects.eligible(),false);
});
test('an invalid or future-dated dream selection never relocates Pip',()=>{
 const child=L.defaults();child.guardian='player';child.guardianDay=3;
 child.dream.focus='stories';child.dream.chosenDay=99;
 assert.deepEqual(plain(P.schedule(850,child,9,R.plan)),plain(R.plan(850,'player')));
 child.dream.focus='nonexistent';child.dream.chosenDay=3;
 assert.deepEqual(plain(P.schedule(850,child,9,R.plan)),plain(R.plan(850,'player')));
});
test('animated routes ease between physical stations rather than teleporting',()=>{
 const f=fixture({focus:'kindness',minute:720});
 const a=f.pip.routines.location();f.state.minute=755;const b=f.pip.routines.location();
 f.state.minute=795;const c=f.pip.routines.location();
 assert.equal(a.moving,true);assert.equal(b.moving,true);assert.equal(c.moving,false);
 assert.ok(b.x>a.x&&b.x<c.x);
});
test('the four dated daily stops remain displayed in Pip Daybook with new dream titles',()=>{
 const f=fixture({focus:'discover',minute:850});
 const p=f.pip.routines.location(),html=f.pip.routines.card();
 assert.equal(p.route.length,4);assert.equal(p.route[1].title,'A Miniature Nature Watch');
 assert.equal(p.route[2].title,'The Field Notes Corner');
 assert.match(html,/The Field Notes Corner/);
 assert.match(html,/A Miniature Nature Watch/);
});
test('previously earned dream chapters change the visual autonomous project stage',()=>{
 const f=fixture();f.child().dream.achievements.stories=[{stage:1,day:5}];
 assert.equal(f.pip.routines.location().stage,1);
 f.child().dream.achievements.stories.push({stage:2,day:7});
 assert.equal(f.pip.routines.location().stage,2);
});
test('forged future achievement dates cannot prematurely upgrade the artwork',()=>{
 const f=fixture();f.child().dream.achievements.stories=[{stage:2,day:30}];
 assert.equal(f.pip.routines.location().stage,0);
});
test('dream switching updates real world position and future tasks immediately',()=>{
 const f=fixture(),before=f.pip.position();
 f.pip.dreams.choose('kindness');
 assert.notDeepEqual(plain(f.pip.position()),plain(before));
 assert.equal(f.pip.routines.location().prop,'table-flower');
});
test('the player must actually stand beside the child at the project station',()=>{
 const f=fixture();f.setPlayer(200,300);
 assert.equal(f.pip.projects.start(),false);
 assert.equal(f.saves,0);
});
test('a project cannot be remotely initiated from a different world scene',()=>{
 const f=fixture();f.setScene('town');
 assert.equal(f.pip.projects.eligible(),false);assert.equal(f.pip.projects.start(),false);
});
test('projects are part of Pip’s real independent day even before Poppy joins',()=>{
 const f=fixture();const p=f.pip.routines.location();
 assert.equal(p.project,true);
 assert.equal(p.focus,'stories');
 assert.match(f.pip.projects.panel(),/independently follows/);
 assert.equal(f.saves,0);
});
test('Pip cannot start a project outside the morning and afternoon work periods',()=>{
 for(const minute of [80,350,1080,1240]){
  const f=fixture({minute});
  assert.equal(f.pip.projects.eligible(),false);
 }
});
test('a real little project requires two explicit choices before recording a memory',()=>{
 const f=fixture();assert.equal(f.pip.projects.start(),true);
 assert.match(f.modal.html,/1 OF 2/);assert.equal(f.saves,0);
 assert.equal(f.pip.projects.choose(1),true);assert.equal(f.saves,0);
 assert.equal(f.pip.projects.page(),true);assert.match(f.modal.html,/2 OF 2/);
 assert.equal(f.pip.projects.choose(0),true);assert.equal(f.saves,1);
 assert.deepEqual(plain(f.child().projects),[{day:9,dream:'stories',slot:2,mask:1}]);
});
test('a completed project awards only bounded childhood curiosity and joy',()=>{
 const f=fixture(),before={...f.child().needs};complete(f,3);
 assert.equal(f.child().needs.curiosity,before.curiosity+7);
 assert.equal(f.child().needs.joy,before.joy+3);
 assert.equal(f.state.coins,310);assert.equal(f.child().skills.story,0);
});
test('only one real shared project can be completed per day even if dream changes',()=>{
 const f=fixture();complete(f);
 f.child().dream.focus='kindness';f.setPlayer(809,422);
 assert.equal(f.pip.projects.start(),false);
 assert.equal(f.child().projects.length,1);assert.equal(f.saves,1);
});
test('a new in-game day can create a different genuine project memory',()=>{
 const f=fixture();complete(f);f.state.day=10;f.child().dream.focus='discover';f.setPlayer(741,830);
 complete(f,2);
 assert.deepEqual(plain(f.child().projects),[{day:9,dream:'stories',slot:2,mask:0},{day:10,dream:'discover',slot:2,mask:2}]);
});
test('cancelling an unfinished two-part project creates no memory',()=>{
 const f=fixture();f.pip.projects.start();f.pip.projects.choose(1);
 f.pip.projects.handle('pi278-cancel');
 assert.equal(f.child().projects.length,0);assert.equal(f.saves,0);
});
test('day rollover aborts unfinished projects instead of awarding remote rewards',()=>{
 const f=fixture();f.pip.projects.start();f.pip.projects.choose(1);
 f.state.day=10;assert.equal(f.pip.projects.page(),false);
 assert.equal(f.child().projects.length,0);
});
test('switching selected dreams mid-activity invalidates the project session',()=>{
 const f=fixture();f.pip.projects.start();f.pip.projects.choose(0);
 f.child().dream.focus='kindness';assert.equal(f.pip.projects.page(),false);
 assert.equal(f.saves,0);
});
test('a shift from morning to afternoon requires restarting at the new real station',()=>{
 const f=fixture({minute:600});f.pip.projects.start();f.pip.projects.choose(1);
 f.state.minute=850;f.setPlayer(562,734);
 assert.equal(f.pip.projects.page(),false);assert.equal(f.saves,0);
});
test('Pip leaving the cottage, or no longer nearby, cancels an unfinished activity',()=>{
 const f=fixture();f.pip.projects.start();f.pip.projects.choose(0);
 f.setNear(false);assert.equal(f.pip.projects.page(),false);assert.equal(f.child().projects.length,0);
 const g=fixture();g.pip.projects.start();g.pip.projects.choose(0);g.setScene('town');
 assert.equal(g.pip.projects.page(),false);
});
test('wrong answer indexes never advance the real session',()=>{
 const f=fixture();f.pip.projects.start();
 for(const input of [-1,2,NaN,undefined])assert.equal(f.pip.projects.choose(input),false);
 assert.equal(f.child().projects.length,0);assert.equal(f.saves,0);
});
test('child project old save migration never fabricates a record or changes guardian',()=>{
 const old=L.clean({guardian:'player',guardianDay:3,skills:{story:8},dream:{focus:'stories',chosenDay:4}});
 assert.equal(old.guardian,'player');assert.equal(old.skills.story,8);
 assert.deepEqual(plain(old.projects),[]);
});
test('the save cleaner rejects duplicate/future-invalid shapes and confines memory fields',()=>{
 const out=P.clean([{day:3,dream:'stories',slot:1,mask:2},{day:3,dream:'kindness',slot:2,mask:0},
  {day:4,dream:'fake',slot:2,mask:1},{day:5,dream:'stories',slot:4,mask:2},
  {day:6,dream:'discover',slot:2,mask:4},{day:7,dream:'discover',slot:2,mask:1}]);
 assert.deepEqual(plain(out),[{day:3,dream:'stories',slot:1,mask:2},{day:7,dream:'discover',slot:2,mask:1}]);
});
test('a save round trip keeps real project memories and all earlier household data',()=>{
 const f=fixture();f.child().homeHelps=[{day:6,kind:'read'}];complete(f);
 const imported=L.clean(JSON.parse(JSON.stringify(f.child())));
 assert.equal(imported.projects.length,1);assert.equal(imported.homeHelps.length,1);
 assert.equal(imported.dream.focus,'stories');
});
test('projects draw different real canvas world props and gained aspiration details',()=>{
 const samples=Object.keys(P.DREAMS).map(focus=>fixture({focus}).pip.routines.location());
 const fills=[];const g={save(){},restore(){},fillRect(){fills.push(1)}};
 for(const sample of samples)assert.equal(P.DREAMS[sample.focus]!==undefined,true);
 for(const sample of samples)assert.equal(fixture({focus:sample.focus}).pip.projects.drawProp(g,sample,1),true);
 assert.ok(fills.length>=20);
});
test('extra painted star details appear only after earned chapter receipts',()=>{
 const f=fixture(),g={save(){},restore(){},fillRect(){calls++}};
 let calls=0;
 f.pip.projects.drawProp(g,f.pip.routines.location(),1);const basic=calls;
 f.child().dream.achievements.stories=[{stage:1,day:7}];calls=0;
 f.pip.projects.drawProp(g,f.pip.routines.location(),1);const first=calls;
 f.child().dream.achievements.stories.push({stage:2,day:8});calls=0;
 f.pip.projects.drawProp(g,f.pip.routines.location(),1);const second=calls;
 assert.ok(basic<first&&first<second);
});
test('actual little sprite uses the changing dream prop, not a fixed menu sticker',()=>{
 const f=fixture(),drawing=[],g={save(){},restore(){},fillRect(){},fillText(){}};
 f.pip.draw(g,{scene:'home',tick:2,drawSprite:(child,x,y,routine)=>drawing.push({child:child.id,project:routine.project,focus:routine.focus,x,y})});
 assert.equal(drawing.length,1);assert.equal(drawing[0].child,'pip');
 assert.equal(drawing[0].focus,'stories');assert.equal(drawing[0].x,562);
});
test('family Atlas shows only completed Pip projects as genuine memories',()=>{
 const f=fixture();complete(f);
 const atlas=A.setup({getState:()=>f.state,getResidentHome:()=>null,getYoungResident:()=>({guardian:'player',guardianDay:3}),getPortraits:()=>[]});
 const events=atlas.events().filter(e=>e.kind==='child-project');
 assert.equal(events.length,1);assert.equal(events[0].day,9);
 assert.equal(atlas.graph().edges.some(e=>e.kind==='marriage'&&e.ids.includes('pip')),false);
});
test('future-dated forged project data cannot appear in the truthful family Atlas',()=>{
 const f=fixture();f.child().projects=[{day:85,dream:'stories',slot:2,mask:1}];
 const atlas=A.setup({getState:()=>f.state,getResidentHome:()=>null,getYoungResident:()=>({guardian:'player',guardianDay:3})});
 assert.equal(atlas.events().filter(e=>e.kind==='child-project').length,0);
});
test('iPhone asset order and offline cache include the fully working autonomous renderer',()=>{
 const html=read('index.html'),sw=read('sw.js'),game=read('game.js'),css=read('pip-projects-v278.css'),little=read('little-sprouts-v272.js');
 for(const file of ['pip-projects-v278.js','pip-projects-v278.css']){assert.ok(html.includes(file));assert.ok(sw.includes("'./"+file+"'"))}
 assert.ok(html.indexOf('pip-projects-v278.js')<html.indexOf('pip-routines-v273.js'));
 assert.ok(html.indexOf('pip-projects-v278.js')<html.indexOf('little-sprouts-v272.js'));
 assert.match(html,/v=2\.7\.9/);assert.match(sw,/hearth-harbor-v279-maplewood-guides/);
 assert.match(css,/:focus-visible/);assert.match(css,/@media\(max-width:380px\)/);
 assert.match(little,/projects\.drawProp\(g,routine,tick\)/);assert.match(little,/projects\.panel\(\)/);
 assert.match(game,/routine\?\.project\?Math\.floor\(tick\*2\.5\)%2:0/);
 assert.match(game,/const SAVE='hearth-harbor-save-v1'/);
});
test('autonomy and projects add no network services, payments, browser timers or second save key',()=>{
 const s=read('pip-projects-v278.js');
 assert.doesNotMatch(s,/fetch\(|XMLHttpRequest|WebSocket|localStorage|setInterval|setTimeout|new Image\(/);
});

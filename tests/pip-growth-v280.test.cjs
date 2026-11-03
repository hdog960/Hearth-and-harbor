/* Hearth & Harbor v2.8.0 — real optional childhood growing seasons regression */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const env={window:{}};
for(const file of ['pip-growth-v280.js','pip-legacy-v282.js','pip-adventures-v281.js','pip-projects-v278.js','pip-guides-v279.js','pip-routines-v273.js',
 'pip-neighbors-v275.js','pip-home-help-v276.js','pip-dreams-v277.js','little-sprouts-v272.js','family-atlas-v271.js'])
 vm.runInNewContext(read(file),env,{filename:file});
const G=env.window.HearthPipGrowth,P=env.window.HearthPipProjects,R=env.window.HearthPipRoutines,L=env.window.HearthLittleSprouts,A=env.window.HearthFamilyAtlas;
const plain=x=>JSON.parse(JSON.stringify(x));
function fixture({guardian=true,focus='stories',day=25,minute=850}={}){
 const c=L.defaults();if(guardian){c.guardian='player';c.guardianDay=2}
 if(focus){c.dream.focus=focus;c.dream.chosenDay=4}
 const state={day,minute,coins:450,youngResidents:{pip:c},familyRoots:{chosen:{}},weddingPlans:{},relations:{bea:70}};
 let scene='home',near=true,player={x:0,y:0},modal=null,saves=0,updates=0;const notices=[];
 const api={getState:()=>state,getScene:()=>scene,isNearby:(p,d)=>near&&Math.hypot(player.x-p.x,player.y-p.y)<=d,
  getPlayer:()=>({...player}),getAdults:()=>[],isWalkable:()=>true,nearestWalkable:p=>p,goTown:()=>{scene='town'},
  isPaused:()=>false,ownDone:()=>false,ownHold:()=>null,queueOwnAction:()=>false,
  save:()=>saves++,updateUI:()=>updates++,notify:x=>notices.push(x),showModal:(id,html)=>{modal={id,html}},closeModal:()=>{}};
 const pip=L.setup(api);const p=pip.position();player={x:p.x,y:p.y};
 return {pip,state,api,notices,get saves(){return saves},get updates(){return updates},get modal(){return modal},
  c:()=>state.youngResidents.pip,setScene:x=>scene=x,setNear:x=>near=x,
  setPlayer:(x,y)=>{player={x,y}},nextToPip(){const p=pip.position();player={x:p.x,y:p.y}}};
}
function first(f){
 const c=f.c();
 c.skills.story=2;c.skills.garden=2;
 c.homeHelps=[{day:3,kind:'read'},{day:4,kind:'tidy'}];
 c.mentor.counts.bea=2;c.mentor.last.bea=5;
 c.evenings=[{day:6,mask:1}];
}
function second(f){
 first(f);const c=f.c();
 c.skills.story=4;c.skills.garden=4;c.skills.art=4;
 c.homeHelps.push({day:7,kind:'meal'},{day:8,kind:'hobby'});
 c.mentor.counts.jun=2;c.mentor.last.jun=10;
 c.evenings.push({day:9,mask:0},{day:10,mask:2});
 c.projects=[{day:11,dream:'stories',slot:1,mask:0},
  {day:12,dream:'stories',slot:2,mask:1},{day:13,dream:'discover',slot:2,mask:3}];
 c.dream.achievements.stories=[{stage:1,day:14},{stage:2,day:15}];
}
test('initial saved young resident remains an actual child with no fabricated aging',()=>{
 const f=fixture();assert.equal(f.pip.status().stage,'Child');
 assert.equal(f.pip.growth.stage,0);assert.equal(f.pip.growth.visual().scale,.76);
 assert.deepEqual(plain(f.c().growth),{stage:0,firstDay:0,secondDay:0});
});
test('old v2.7.9 Pip save migrates the optional growth field without losing any earlier data',()=>{
 const c=L.clean({guardian:'player',guardianDay:3,skills:{story:8},
  mentor:{counts:{bea:3},last:{bea:5}},dream:{focus:'stories',chosenDay:4}});
 assert.equal(c.growth.stage,0);assert.equal(c.skills.story,8);
 assert.equal(c.mentor.counts.bea,3);assert.equal(c.dream.focus,'stories');
});
test('a new unguarded child cannot advance developmental milestones',()=>{
 const f=fixture({guardian:false});first(f);second(f);
 assert.equal(f.pip.growth.progress().stage,0);
 assert.equal(f.pip.growth.celebrate(1),false);
});
test('the first chapter requires five genuinely different parts of childhood life',()=>{
 const f=fixture();let p=f.pip.growth.progress();assert.equal(p.chapters[0].ready,false);
 assert.equal(p.chapters[0].goals.length,5);
 first(f);p=f.pip.growth.progress();
 assert.equal(p.chapters[0].ready,true);
 assert.equal(p.chapters[1].ready,false);
});
test('fewer than two independent kinds of learning cannot unlock the first chapter',()=>{
 const f=fixture();first(f);f.c().skills.garden=0;
 assert.equal(f.pip.growth.progress().chapters[0].ready,false);
});
test('household chores must be on two genuine different days for chapter one',()=>{
 const f=fixture();first(f);f.c().homeHelps=[{day:3,kind:'read'},{day:3,kind:'tidy'}];
 assert.equal(f.pip.growth.progress().counts.home,1);
 assert.equal(f.pip.growth.celebrate(1),false);
});
test('a missing bedtime memory blocks stage one even if the other goals are completed',()=>{
 const f=fixture();first(f);f.c().evenings=[];
 assert.equal(f.pip.growth.celebrate(1),false);
});
test('lifetime villager encounters, not a remote menu, satisfy the actual neighbor requirement',()=>{
 const f=fixture();first(f);
 f.c().mentor.counts.bea=0;f.c().mentor.counts.jun=1;
 assert.equal(f.pip.growth.celebrate(1),false);
});
test('opening the milestone Daybook and reading progress do not automatically age Pip',()=>{
 const f=fixture();first(f);
 const before=plain(f.c()),html=f.pip.growth.panel();
 assert.match(html,/Finding My Own Feet/);assert.match(html,/Celebrate/);
 assert.deepEqual(plain(f.c()),before);assert.equal(f.saves,0);
});
test('the player must stand beside Pip inside the actual cottage to choose a milestone',()=>{
 const f=fixture();first(f);f.setPlayer(90,90);
 assert.equal(f.pip.growth.celebrate(1),false);
 f.nextToPip();f.setScene('town');assert.equal(f.pip.growth.celebrate(1),false);
 assert.equal(f.saves,0);
});
test('the first chosen development stage is saved, visibly grown and only grants a small one-time encouragement',()=>{
 const f=fixture();first(f);const needs={...f.c().needs};
 assert.equal(f.pip.growth.celebrate(1),true);
 assert.equal(f.pip.status().stage,'Growing Child');
 assert.equal(f.c().growth.firstDay,25);assert.equal(f.c().growth.stage,1);
 assert.equal(f.pip.growth.visual().scale,.84);
 assert.equal(f.c().needs.confidence,needs.confidence+8);assert.equal(f.c().needs.joy,needs.joy+6);
 assert.equal(f.state.coins,450);assert.equal(f.saves,1);
});
test('the first milestone can never be celebrated twice',()=>{
 const f=fixture();first(f);f.pip.growth.celebrate(1);
 assert.equal(f.pip.growth.celebrate(1),false);assert.equal(f.saves,1);
 assert.equal(f.c().growth.stage,1);
});
test('stage two requires stage one to have been explicitly celebrated first',()=>{
 const f=fixture();second(f);
 assert.equal(f.pip.growth.celebrate(2),false);
 assert.equal(f.pip.growth.progress().chapters[1].ready,false);
});
test('a deeper second chapter asks for seven earned longer-term progression goals',()=>{
 const f=fixture();second(f);f.pip.growth.celebrate(1);
 const p=f.pip.growth.progress();
 assert.equal(p.chapters[1].goals.length,7);
 assert.equal(p.chapters[1].ready,true);
});
test('stage two must follow full completion of an actual chosen dream',()=>{
 const f=fixture();second(f);f.pip.growth.celebrate(1);
 f.c().dream.achievements.stories=[{stage:1,day:14}];
 assert.equal(f.pip.growth.celebrate(2),false);
});
test('stage two requires three genuine shared independent project days',()=>{
 const f=fixture();second(f);f.pip.growth.celebrate(1);
 f.c().projects=[{day:11,dream:'stories',slot:1,mask:0}];
 assert.equal(f.pip.growth.celebrate(2),false);
});
test('stage two requires a breadth of two different real villagers',()=>{
 const f=fixture();second(f);f.pip.growth.celebrate(1);
 f.c().mentor.counts.jun=0;
 assert.equal(f.pip.growth.celebrate(2),false);
});
test('stage two requires lasting activity practice, not repeated Daybook views',()=>{
 const f=fixture();second(f);f.pip.growth.celebrate(1);
 f.c().skills.art=1;
 assert.equal(f.pip.growth.celebrate(2),false);
});
test('second chosen milestone changes Pip to a larger independent child and records the actual date',()=>{
 const f=fixture();second(f);f.pip.growth.celebrate(1);
 assert.equal(f.pip.growth.celebrate(2),true);
 assert.equal(f.pip.status().stage,'Independent Child');assert.equal(f.pip.growth.stage,2);
 assert.equal(f.pip.growth.visual().scale,.92);
 assert.equal(f.c().growth.firstDay,25);assert.equal(f.c().growth.secondDay,25);
 assert.equal(f.saves,2);assert.equal(f.state.coins,450);
});
test('earned growth remains opt-in and carries forward into future real days',()=>{
 const f=fixture();second(f);f.pip.growth.celebrate(1);f.pip.growth.celebrate(2);
 f.state.day=40;assert.equal(f.pip.growth.stage,2);
 assert.equal(f.pip.growth.progress().chapters.every(c=>c.claimed),true);
});
test('previous chapter receipts persist in the original save format after a round trip',()=>{
 const f=fixture();second(f);f.pip.growth.celebrate(1);f.pip.growth.celebrate(2);
 const next=L.clean(plain(f.c()));
 assert.deepEqual(plain(next.growth),{stage:2,firstDay:25,secondDay:25});
 assert.equal(next.mentor.counts.bea,2);assert.equal(next.projects.length,3);
});
test('a malformed growth save never grants a second stage, but preserves a legitimate first receipt',()=>{
 for(const input of [{stage:2,firstDay:0,secondDay:3},
 {stage:'2',firstDay:4,secondDay:5},{stage:1,firstDay:-2},{stage:5,firstDay:0}]){
  const g=G.clean(input);assert.equal(g.stage,0);
 }
 const incomplete=G.clean({stage:2,firstDay:9,secondDay:8});
 assert.equal(incomplete.stage,1);
 assert.equal(incomplete.firstDay,9);assert.equal(incomplete.secondDay,0);
});
test('future-dated growth records do not change actual physical age early',()=>{
 const f=fixture();f.c().growth={stage:2,firstDay:30,secondDay:40};
 assert.equal(f.pip.growth.stage,0);
 f.state.day=35;assert.equal(f.pip.growth.stage,1);
 f.state.day=42;assert.equal(f.pip.growth.stage,2);
});
test('without verified guardianship, forged growth records cannot activate a child stage',()=>{
 const f=fixture({guardian:false});f.c().growth={stage:2,firstDay:10,secondDay:12};
 assert.equal(f.pip.growth.stage,0);
});
test('growing child moves to an expanded real morning project station',()=>{
 const f=fixture({minute:490});first(f);
 const before=f.pip.routines.location();
 f.pip.growth.celebrate(1); // player is beside Pip at its initial spot
 const after=f.pip.routines.location();
 assert.equal(after.growthStage,1);
 assert.ok(after.x>before.x&&after.y<before.y);
 assert.match(after.label,/A Growing/);
});
test('independent child has its own larger afternoon project and artwork detail',()=>{
 const f=fixture({minute:850});second(f);
 f.pip.growth.celebrate(1);f.nextToPip();f.pip.growth.celebrate(2);
 const at=f.pip.routines.location();
 assert.equal(at.growthStage,2);
 assert.equal(at.x,544);assert.equal(at.y,720);
 assert.match(at.label,/An Independent/);
});
test('the original routine remains unchanged for a child without an active dream',()=>{
 const f=fixture({focus:null,minute:850});first(f);f.pip.growth.celebrate(1);
 const p=f.pip.routines.location();
 assert.deepEqual(plain(p),plain(R.plan(850,'player')));
});
test('old aspirational stage visual artwork remains independent of growing physical stage',()=>{
 const f=fixture();first(f);f.pip.growth.celebrate(1);
 const place=f.pip.routines.location();assert.equal(place.growthStage,1);
 assert.equal(place.stage,0);
});
test('the grown child carries a visibly illustrated accessory in actual 2.5D space',()=>{
 const f=fixture(),g={save(){},restore(){},fillRect(){calls.push('rect')}};
 const calls=[];f.pip.growth.drawAccessory(g,560,730,1);assert.equal(calls.length,0);
 first(f);f.pip.growth.celebrate(1);
 f.pip.growth.drawAccessory(g,560,730,1);assert.ok(calls.length>=4);
});
test('independent-child accessory adds original detailed sprite artwork',()=>{
 const f=fixture();second(f);
 const g={save(){},restore(){},fillRect(){count++}};let count=0;
 f.pip.growth.celebrate(1);f.pip.growth.drawAccessory(g,560,730,1);const earlier=count;
 f.pip.growth.celebrate(2);count=0;f.pip.growth.drawAccessory(g,560,730,1);
 assert.ok(count>earlier);
});
test('the growth wall chart is actually drawn in Poppy cottage only once earned',()=>{
 const f=fixture();const calls=[],g={save(){},restore(){},fillRect(){calls.push('rect')},fillText(){calls.push('text')}};
 assert.equal(f.pip.growth.drawWall(g,1),false);assert.equal(calls.length,0);
 first(f);f.pip.growth.celebrate(1);
 assert.equal(f.pip.growth.drawWall(g,1),true);assert.ok(calls.includes('text'));
 calls.length=0;f.setScene('town');assert.equal(f.pip.growth.drawWall(g,1),false);assert.equal(calls.length,0);
});
test('maturity never inserts Pip into adult romance, jobs, wages or existing resident array',()=>{
 const game=read('game.js'),block=game.slice(game.indexOf("const NPCS=["),game.indexOf("const HEX=n=>"));
 assert.doesNotMatch(block,/id:'pip'/);
 assert.match(game,/littleSprouts\.growth\.visual\(\)\.scale/);
 assert.match(game,/littleSprouts\.growth\.drawWall\(ctx,tick\)/);
});
test('family timeline gains only recorded growth events and no adult marriage edges',()=>{
 const f=fixture();second(f);f.pip.growth.celebrate(1);f.pip.growth.celebrate(2);
 const atlas=A.setup({getState:()=>f.state,getResidentHome:()=>null,getYoungResident:()=>({guardian:'player',guardianDay:2}),getPortraits:()=>[]});
 const ev=atlas.events().filter(e=>e.kind==='child-growth');
 assert.equal(ev.length,2);assert.ok(ev.every(e=>e.day===25));
 assert.equal(atlas.graph().edges.some(e=>e.kind==='marriage'&&e.ids.includes('pip')),false);
});
test('future forged and unguarded growth entries never enter family-history timeline',()=>{
 const f=fixture({guardian:false});f.c().growth={stage:2,firstDay:70,secondDay:80};
 const atlas=A.setup({getState:()=>f.state,getResidentHome:()=>null,getYoungResident:()=>({guardian:null}),getPortraits:()=>[]});
 assert.equal(atlas.events().filter(e=>e.kind==='child-growth').length,0);
});
test('all initial child needs, earlier project and neighbor progression remain unchanged by opening the growth book',()=>{
 const f=fixture();first(f);
 const before=plain(f.c()),money=f.state.coins;
 f.pip.growth.panel();
 assert.deepEqual(plain(f.c()),before);assert.equal(f.state.coins,money);
});
test('new child growth module maintains existing save key, PWA offline assets and load order',()=>{
 const html=read('index.html'),sw=read('sw.js'),css=read('pip-growth-v280.css'),child=read('little-sprouts-v272.js'),game=read('game.js');
 for(const file of ['pip-growth-v280.js','pip-growth-v280.css']){assert.ok(html.includes(file));assert.ok(sw.includes("'./"+file+"'"))}
 assert.ok(html.indexOf('pip-growth-v280.js')<html.indexOf('pip-projects-v278.js'));
 assert.ok(html.indexOf('pip-growth-v280.js')<html.indexOf('little-sprouts-v272.js'));
 assert.match(html,/v=2\.8\.2/);assert.match(sw,/hearth-harbor-v282-family-legacy/);
 assert.match(css,/:focus-visible/);assert.match(css,/@media\(max-width:380px\)/);
 assert.match(child,/growth\.panel\(\)/);assert.match(child,/growth\.drawAccessory\(g,pos\.x/);
 assert.match(game,/const SAVE='hearth-harbor-save-v1'/);
});
test('the development system has no timers, money store, network service or artificial calendar aging',()=>{
 const s=read('pip-growth-v280.js');
 assert.doesNotMatch(s,/fetch\(|XMLHttpRequest|WebSocket|localStorage|setTimeout|setInterval|new Image\(/);
 assert.doesNotMatch(s,/coins\s*\+=|adultJob|weddingPlans/);
});

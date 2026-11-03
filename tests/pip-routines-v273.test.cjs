/* Hearth & Harbor v2.7.3 — Pip's Living Day regression gates */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const context={window:{}};
vm.runInNewContext(read('pip-growth-v280.js'),context,{filename:'pip-growth-v280.js'});vm.runInNewContext(read('pip-adventures-v281.js'),context,{filename:'pip-adventures-v281.js'});vm.runInNewContext(read('pip-projects-v278.js'),context,{filename:'pip-projects-v278.js'});vm.runInNewContext(read('pip-guides-v279.js'),context,{filename:'pip-guides-v279.js'});vm.runInNewContext(read('pip-routines-v273.js'),context,{filename:'pip-routines-v273.js'});
vm.runInNewContext(read('pip-neighbors-v275.js'),context,{filename:'pip-neighbors-v275.js'});vm.runInNewContext(read('pip-home-help-v276.js'),context,{filename:'pip-home-help-v276.js'});vm.runInNewContext(read('pip-dreams-v277.js'),context,{filename:'pip-dreams-v277.js'});vm.runInNewContext(read('little-sprouts-v272.js'),context,{filename:'little-sprouts-v272.js'});
const P=context.window.HearthPipRoutines,L=context.window.HearthLittleSprouts;
function fixture(options={}){
 const state={day:8,minute:120,coins:250,weddingPlans:{},familyRoots:{chosen:{}},youngResidents:{pip:L.defaults()},...options};
 let scene='town',player={x:790,y:898},modal={id:'',html:''},saves=0,updates=0,alerts=[];
 const api={getState:()=>state,getScene:()=>scene,isNearby:(p,d)=>Math.hypot(p.x-player.x,p.y-player.y)<=d,showModal:(id,html)=>modal={id,html},
 save:()=>saves++,updateUI:()=>updates++,notify:x=>alerts.push(x),closeModal:()=>{modal={id:'',html:''}}};
 const pip=L.setup(api);
 return {state,pip,api,alerts,setScene:x=>scene=x,setPlayer:(x,y)=>player={x,y},
 get modal(){return modal},get saves(){return saves},get updates(){return updates}};
}
function withGuardian(){const f=fixture();f.state.youngResidents.pip.guardian='player';f.state.youngResidents.pip.guardianDay=5;f.state.minute=1200;f.setScene('home');f.setPlayer(765,756);return f}
test('the child has a deterministic four-part playable village routine',()=>{
 const frames=[P.plan(120,null),P.plan(490,null),P.plan(850,null),P.plan(1220,null)];
 assert.deepEqual(frames.map(x=>x.slot),[0,1,2,3]);
 assert.deepEqual(frames.map(x=>x.label),['Quiet village hours','Clover meadow play','Story circle by the garden','Lantern walk']);
 assert.equal(frames.every(x=>x.scene==='town'),true);
});
test('actual old world position remains grounded at first load and after reopening the save',()=>{
 const a=P.plan(120,null),b=P.plan(120,null);
 assert.equal(a.x,790);assert.equal(a.y,898);
 assert.equal(JSON.stringify(a),JSON.stringify(b));
});
test('movement between real routine spots animates rather than teleporting',()=>{
 const a=P.plan(360,null),b=P.plan(395,null),c=P.plan(435,null);
 assert.equal(a.moving,true);assert.equal(b.moving,true);assert.equal(c.moving,false);
 assert.ok(a.x>b.x&&b.x>c.x);assert.equal(c.x,680);
});
test('daily route changes character position and physical tap hitbox',()=>{
 const f=fixture();assert.equal(f.pip.hit(790,855,'town'),true);
 f.state.minute=490;
 assert.ok(f.pip.position().x<700);
 assert.equal(f.pip.hit(790,855,'town'),false);
 assert.equal(f.pip.hit(f.pip.position().x,f.pip.position().y-45,'town'),true);
});
test('player-led activities remain proximity checked at Pip’s new scheduled location',()=>{
 const f=fixture();f.state.minute=490;f.setPlayer(200,500);
 assert.equal(f.pip.begin('story'),false);
 const p=f.pip.position();f.setPlayer(p.x,p.y);
 assert.equal(f.pip.begin('story'),true);
 assert.equal(f.pip.routines.eligible(),false);
});
test('Cottage childhood routine changes only after opted-in guardian exists',()=>{
 const f=fixture();assert.equal(f.pip.routines.location().scene,'town');
 f.state.youngResidents.pip.guardian='player';f.state.youngResidents.pip.guardianDay=6;
 assert.equal(f.pip.routines.location().scene,'home');
 assert.equal(f.pip.position().x,765);
});
test('home routine has storytime, creativity and wind-down with actual prop transitions',()=>{
 const seq=[100,510,830,1200].map(n=>P.plan(n,'player'));
 assert.deepEqual(seq.map(x=>x.prop),['pillow','book','crayon','pillow']);
 assert.deepEqual(seq.map(x=>x.slot),[0,1,2,3]);
 assert.equal(seq.every(x=>x.scene==='home'),true);
});
test('routine props render actual small objects next to the moving child',()=>{
 const f=fixture(),calls=[];
 const g={save(){},restore(){},fillRect(){calls.push('rect')},beginPath(){},arc(){},fill(){}};
 for(const t of [100,550,850,1230]){f.state.minute=t;f.pip.routines.drawProp(g,f.pip.routines.location(),1)}
 assert.ok(calls.length>=8);
});
test('one real activity per day feeds mastery chapters, not a view/open button',()=>{
 const f=fixture();f.pip.entry();
 const m=f.pip.routines.mastery();assert.equal(m.story.days,0);assert.equal(m.story.rank,0);
 assert.equal(f.saves,0);assert.match(f.modal.html,/Pip.s Living Day/);
 assert.match(f.modal.html,/Storytelling/);
});
test('mastery ranks track unique legitimate dates for each kind',()=>{
 const memories=[{kind:'story',day:1,choiceMask:0},{kind:'story',day:2,choiceMask:1},{kind:'story',day:2,choiceMask:1},
 {kind:'story',day:3,choiceMask:2},{kind:'art',day:4,choiceMask:7},{kind:'garden',day:9,choiceMask:0}];
 const x=P.mastery(memories,8);assert.equal(x.story.rank,1);assert.equal(x.story.days,3);assert.equal(x.story.next,1);
 assert.equal(x.art.rank,0);assert.equal(x.garden.days,0);
});
test('mastery rank is capped without inventing age stages or currency',()=>{
 const memories=Array.from({length:22},(_,i)=>({kind:'art',day:i+1,choiceMask:1}));
 const m=P.mastery(memories,30);assert.equal(m.art.rank,3);
 assert.equal(m.art.next,null);assert.equal(m.art.label,'Sketchbook Star');
});
test('morning and unguarded child cannot trigger a bedtime ritual',()=>{
 const f=fixture();assert.equal(f.pip.routines.start(),false);
 f.state.minute=1200;assert.equal(f.pip.routines.start(),false);
 f.state.youngResidents.pip.guardian='player';f.state.youngResidents.pip.guardianDay=4;
 f.setScene('home');f.setPlayer(765,756);f.state.minute=600;
 assert.equal(f.pip.routines.start(),false);assert.equal(f.saves,0);
});
test('guardian must visit Pip in actual cottage after 6 PM for ritual',()=>{
 const f=withGuardian();f.setPlayer(200,450);
 assert.equal(f.pip.routines.eligible(),false);assert.equal(f.pip.routines.start(),false);
 f.setPlayer(765,756);assert.equal(f.pip.routines.eligible(),true);
});
test('bedtime requires two real choices, each prompting an independent scene',()=>{
 const f=withGuardian();assert.equal(f.pip.routines.start(),true);
 assert.match(f.modal.html,/BEDTIME · 1 OF 2/);
 assert.equal(f.pip.routines.choose(1),true);assert.equal(f.saves,0);
 assert.match(f.modal.html,/Continue our bedtime ritual/);
 assert.equal(f.pip.routines.page(),true);assert.match(f.modal.html,/BEDTIME · 2 OF 2/);
 assert.equal(f.pip.routines.choose(0),true);assert.equal(f.saves,1);
 assert.equal(f.pip.data.evenings.length,1);assert.equal(f.pip.data.evenings[0].mask,1);
});
test('genuine evening care restores small, bounded emotional needs, not coins',()=>{
 const f=withGuardian();const joy=f.pip.data.needs.joy,confidence=f.pip.data.needs.confidence;
 f.pip.routines.start();f.pip.routines.choose(0);f.pip.routines.page();f.pip.routines.choose(1);
 assert.equal(f.pip.data.needs.joy,joy+9);assert.equal(f.pip.data.needs.confidence,confidence+5);
 assert.equal(f.state.coins,250);assert.equal(f.updates,1);
});
test('no two bedtime memories can be earned on the same game day',()=>{
 const f=withGuardian();f.pip.routines.start();f.pip.routines.choose(1);f.pip.routines.page();f.pip.routines.choose(1);
 assert.equal(f.pip.routines.start(),false);assert.equal(f.pip.data.evenings.length,1);
});
test('second night can be completed on the next actual day',()=>{
 const f=withGuardian();for(const day of [8,9]){
  f.state.day=day;assert.equal(f.pip.routines.start(),true);
  f.pip.routines.choose(0);f.pip.routines.page();f.pip.routines.choose(0);
 }
 assert.deepEqual(JSON.parse(JSON.stringify(f.pip.data.evenings.map(x=>x.day))),[8,9]);
});
test('cancel and interrupted evening do not record a memory',()=>{
 const f=withGuardian();f.pip.routines.start();f.pip.routines.choose(0);
 f.pip.routines.handle('pr273-cancel');
 assert.equal(f.pip.data.evenings.length,0);assert.equal(f.saves,0);
 assert.equal(f.pip.routines.start(),true);
 f.state.minute=100;assert.equal(f.pip.routines.page(),false);
 assert.equal(f.pip.data.evenings.length,0);
});
test('leaving cottage or day rollover invalidates a half-finished memory',()=>{
 const f=withGuardian();f.pip.routines.start();f.pip.routines.choose(0);
 f.setScene('town');assert.equal(f.pip.routines.page(),false);
 f.setScene('home');f.pip.routines.start();f.pip.routines.choose(0);
 f.state.day=9;assert.equal(f.pip.routines.choose(1),false);
 assert.equal(f.pip.data.evenings.length,0);
});
test('tampered choices outside the two valid options cannot progress or reward',()=>{
 const f=withGuardian();f.pip.routines.start();
 assert.equal(f.pip.routines.choose(-1),false);assert.equal(f.pip.routines.choose(2),false);
 assert.equal(f.pip.routines.choose(NaN),false);
 assert.equal(f.pip.routines.session.step,0);
});
test('save import sanitizes duplicate, out-of-range and forged bedtime memories',()=>{
 const out=P.cleanEvenings([{day:3,mask:1},{day:3,mask:2},{day:4,mask:7},{day:-1,mask:0},{day:5,mask:3}]);
 assert.deepEqual(JSON.parse(JSON.stringify(out)),[{day:3,mask:1},{day:5,mask:3}]);
 const old=L.clean(null);assert.equal(old.evenings.length,0);
});
test('old Pip saves retain guardian and real earlier child memories on upgrade',()=>{
 const old=L.clean({guardian:'player',guardianDay:3,needs:{joy:70,curiosity:60,confidence:60},days:[2,3,4],memories:[{day:4,kind:'story',choiceMask:1}]});
 assert.equal(old.guardian,'player');assert.equal(old.memories.length,1);assert.deepEqual(JSON.parse(JSON.stringify(old.evenings)),[]);
});
test('recorded evenings survive a save round trip without duplication',()=>{
 const f=withGuardian();f.pip.routines.start();f.pip.routines.choose(1);f.pip.routines.page();f.pip.routines.choose(0);
 const restored=L.clean(JSON.parse(JSON.stringify(f.pip.data)));
 assert.equal(restored.evenings.length,1);assert.equal(restored.evenings[0].day,8);
});
test('ritual buttons are never actionable merely by opening Pip’s menu',()=>{
 const f=withGuardian();f.pip.entry();
 assert.match(f.modal.html,/Start a cozy bedtime ritual/);assert.equal(f.saves,0);
 assert.equal(f.pip.data.evenings.length,0);
});
test('Pip uses genuine in-world animation, not a prerecorded decorative sticker',()=>{
 const game=read('game.js'),pip=read('little-sprouts-v272.js');
 assert.match(game,/routine\?\.moving\?Math\.floor\(tick\*8\)%2:routine\?\.project\?Math\.floor\(tick\*2\.5\)%2:0/);
 assert.match(game,/routine\?\.facing\|\|'front'/);
 assert.match(pip,/routines\.location\(\)/);assert.match(pip,/routines\.drawProp\(g,routine,tick\)/);
 assert.match(pip,/drawSprite\(CHILD,pos\.x,pos\.y\+phase,routine\)/);
});
test('phone asset order, cache, scrolling and accessibility gates include v2.7.3',()=>{
 const html=read('index.html'),sw=read('sw.js'),css=read('pip-routines-v273.css'),game=read('game.js');
 for(const file of ['pip-routines-v273.js','pip-routines-v273.css']){
  assert.ok(html.includes(file));assert.ok(sw.includes("'./"+file+"'"));
 }
 assert.ok(html.indexOf('pip-routines-v273.js')<html.indexOf('little-sprouts-v272.js'));
 assert.ok(html.indexOf('little-sprouts-v272.js')<html.indexOf('game.js'));
 assert.match(html,/v=2\.8\.1/);assert.match(sw,/hearth-harbor-v281-growing-adventures/);
 assert.match(css,/:focus-visible/);assert.match(css,/@media\(max-width:380px\)/);
 assert.match(css,/prefers-reduced-motion/);assert.match(game,/Pip.s Growing Adventures v2\.8\.1/);
 assert.match(game,/const SAVE='hearth-harbor-save-v1'/);
});
test('new routines have no timers, network, embedded payment or second storage key',()=>{
 const src=read('pip-routines-v273.js');
 assert.doesNotMatch(src,/setInterval|setTimeout|XMLHttpRequest|WebSocket|localStorage|fetch\(|new Image\(/);
});

test('skills are earned only through completed child gameplay and never from opening menus',()=>{
 const f=fixture();assert.deepEqual(JSON.parse(JSON.stringify(f.pip.data.skills)),{story:0,garden:0,art:0});
 f.pip.entry();assert.equal(f.pip.data.skills.story,0);
 f.pip.begin('story');f.pip.choose(0);assert.equal(f.pip.data.skills.story,0);
 f.pip.page();f.pip.choose(0);f.pip.page();f.pip.choose(1);
 assert.equal(f.pip.data.skills.story,1);assert.equal(f.pip.routines.mastery().story.days,1);
});
test('old child memory history migrates into verified lifetime skill counters',()=>{
 const imported=L.clean({memories:[{day:2,kind:'art',choiceMask:1},{day:3,kind:'art',choiceMask:3},
 {day:3,kind:'art',choiceMask:3},{day:4,kind:'story',choiceMask:0},{day:6,kind:'hacked',choiceMask:0}]});
 assert.deepEqual(JSON.parse(JSON.stringify(imported.skills)),{story:1,garden:0,art:2});
 assert.equal(P.mastery(imported.memories,8,imported.skills).art.rank,1);
});
test('earned mastery remains permanent after rolling scrapbook trims early memories',()=>{
 const f=fixture();for(let day=1;day<=18;day++){
  f.state.day=day;f.state.minute=120;
  for(const kind of ['story','garden','art']){
   assert.equal(f.pip.begin(kind),true);
   f.pip.choose(0);f.pip.page();f.pip.choose(0);f.pip.page();f.pip.choose(0);
  }
 }
 assert.equal(f.pip.data.memories.length,40);assert.equal(f.pip.data.skills.story,18);
 assert.equal(f.pip.routines.mastery().story.days,18);
 const restored=L.clean(JSON.parse(JSON.stringify(f.pip.data)));
 assert.equal(restored.skills.story,18);
 assert.equal(P.mastery(restored.memories,18,restored.skills).story.days,18);
});
test('malformed forged lifetime counters are bounded and old memories remain safe',()=>{
 const bad=L.clean({skills:{story:'999',garden:100000,art:-1},memories:[{day:3,kind:'story',choiceMask:1}]});
 assert.deepEqual(JSON.parse(JSON.stringify(bad.skills)),{story:1,garden:0,art:0});
});

/* Hearth & Harbor v2.8.5 — persistent, physically inspectable village craft art */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const env={window:{}};
for(const f of ['pip-growth-v280.js','pip-legacy-v282.js','pip-rituals-v283.js',
 'pip-adventures-v281.js','pip-helpers-v284.js','pip-world-keepsakes-v285.js',
 'pip-projects-v278.js','pip-guides-v279.js','pip-routines-v273.js',
 'pip-neighbors-v275.js','pip-home-help-v276.js','pip-dreams-v277.js',
 'little-sprouts-v272.js','family-atlas-v271.js'])
 vm.runInNewContext(read(f),env,{filename:f});
const W=env.window.HearthPipWorldKeepsakes,H=env.window.HearthPipHelpers,L=env.window.HearthLittleSprouts;
const plain=x=>JSON.parse(JSON.stringify(x));
const adults=Object.keys(W.SITE).map(id=>({id,name:id[0].toUpperCase()+id.slice(1),x:720,y:594}));
function fixture({guardian=true,grown=true,met=true,day=30,earned=[],scene='town'}={}){
 const child=L.defaults();
 if(guardian){child.guardian='player';child.guardianDay=2}
 if(grown)child.growth={stage:1,firstDay:3,secondDay:0};
 if(met)for(const id of Object.keys(W.SITE)){child.mentor.counts[id]=1;child.mentor.last[id]=4}
 child.helperProjects=plain(earned);
 const state={day,season:0,coins:400,youngResidents:{pip:child}};
 let atScene=scene,poppy={x:720,y:594},pip={x:708,y:591},modal=null,saves=0,paused=false,
  helper={session:null},blocked=false,notices=[];
 const api={getState:()=>state,getChild:()=>state.youngResidents.pip,getScene:()=>atScene,
  getHelper:()=>helper,getPlayer:()=>({...poppy}),getChildPosition:()=>({...pip}),
  getAdults:()=>adults,isWalkable:()=>!blocked,nearestWalkable:p=>!blocked?p:null,
  isPaused:()=>paused,showModal:(id,html)=>{modal={id,html}},
  closeModal:()=>{modal=null},name:id=>id.toUpperCase(),save:()=>saves++,
  notify:x=>notices.push(x)};
 const w=W.setup(api);
 return {w,state,child,api,helper,adults,get modal(){return modal},get saves(){return saves},
  setScene:v=>atScene=v,setPoppy:(x,y)=>{poppy={x,y}},setPip:(x,y)=>pip={x,y},
  setPaused:v=>paused=v,setBlocked:v=>blocked=v,notices};
}
const record=(id='mabel',day=25,plan=1,finish=0)=>({day,id,plan,finish});
const drawing=()=>{const rects=[],g={save(){},restore(){},fillRect(...a){rects.push(a)}};
 return {g,rects}};
test('all six village keepsakes have concrete distinct destinations and art themes',()=>{
 const locations=W.SITE;
 assert.equal(Object.keys(locations).length,6);
 assert.equal(new Set(Object.values(locations).map(x=>x.kind)).size,6);
 assert.equal(new Set(Object.values(locations).map(x=>x.x+':'+x.y)).size,6);
});
test('older unplayed saves start with zero new physical objects',()=>{
 const f=fixture();assert.equal(f.w.displays().length,0);
 assert.equal(f.w.hit(733,475),null);assert.equal(f.saves,0);
});
test('a real earlier completed project creates one persistent world decoration',()=>{
 const f=fixture({earned:[record()]});
 const d=f.w.displays();assert.equal(d.length,1);
 assert.equal(d[0].id,'mabel');assert.equal(d[0].day,25);
 assert.equal(d[0].type,'pip-keepsake');assert.equal(d[0].plan,1);
 assert.equal(f.state.coins,400);assert.equal(f.saves,0);
});
test('6 real villagers produce six individual inspectable displays with varied pixel silhouettes',()=>{
 const ids=Object.keys(W.SITE),f=fixture({earned:ids.map((id,i)=>record(id,20+i,i%2,(i+1)%2))});
 const rows=f.w.displays();assert.equal(rows.length,6);
 for(const d of rows){const {g,rects}=drawing();assert.equal(f.w.drawDisplay(g,d,1.4),true);
  assert.ok(rects.length>=9);assert.ok(f.w.hit(d.x,d.y-36));}
});
test('extra activity days for one villager do not duplicate the physical keepsake',()=>{
 const f=fixture({earned:[record('mabel',10),record('mabel',11),record('mabel',12)]});
 assert.equal(f.w.displays().length,1);assert.equal(f.w.displays()[0].day,10);
});
test('pre-guardian and invalid stage records cannot appear in real village',()=>{
 const options=[
  {guardian:false,earned:[record()]},{grown:false,earned:[record()]},
  {met:false,earned:[record()]},{earned:[record('mabel',1)]},
  {earned:[record('mabel',99)]}
 ];
 for(const o of options){const f=fixture(o);assert.equal(f.w.displays().length,0)}
});
test('bad saved IDs, option strings and malformed values are rejected',()=>{
 const f=fixture({earned:[
  {day:15,id:'none',plan:1,finish:0},
  {day:16,id:'mabel',plan:'<script>',finish:0},
  {day:17,id:'rosie',plan:1,finish:4},record('jun',20)]});
 assert.equal(f.w.displays().length,1);assert.equal(f.w.displays()[0].id,'jun');
});
test('offscreen or alternate scenes never claim physical craft objects',()=>{
 const f=fixture({earned:[record()]});f.setScene('home');
 assert.equal(f.w.displays().length,0);assert.equal(f.w.hit(733,475),null);
 assert.equal(f.w.inspect('mabel'),false);
});
test('obstructed project sites are omitted rather than placed inside blocked scenery',()=>{
 const f=fixture({earned:[record()]});f.setBlocked(true);
 assert.equal(f.w.displays().length,0);
});
test('real art is hit-tested at its actual world coordinates only',()=>{
 const f=fixture({earned:[record()]}),p=f.w.displays()[0];
 assert.equal(f.w.hit(p.x,p.y-36).id,'mabel');
 assert.equal(f.w.hit(p.x+125,p.y-36),null);
 assert.equal(f.w.hit(p.x,p.y+110),null);
});
test('a saved keepsake can be inspected ONLY after walking close to its actual placement',()=>{
 const f=fixture({earned:[record()]});
 const p=f.w.displays()[0];
 f.setPoppy(1200,1290);assert.equal(f.w.inspect('mabel'),false);
 assert.ok(f.w.approach('mabel'));
 f.setPoppy(p.x+50,p.y+25);
 assert.equal(f.w.inspect('mabel'),true);assert.match(f.modal.html,/Petal Welcome Flags/);
 assert.match(f.modal.html,/Day 25/);assert.match(f.modal.html,/A gentle garden message/);
 assert.match(f.modal.html,/Toward the butterflies/);
 assert.equal(f.saves,0);assert.equal(f.state.coins,400);
});
test('inspection is a read-only memory, with no repeat farming or forced new dialogue',()=>{
 const f=fixture({earned:[record()]});const p=f.w.displays()[0];
 f.setPoppy(p.x+50,p.y+25);
 for(let i=0;i<4;i++){assert.equal(f.w.inspect('mabel'),true);assert.equal(f.w.handle('pw285-close'),true)}
 assert.equal(f.state.coins,400);assert.equal(f.saves,0);assert.equal(f.w.handle('pw285-nope'),false);
});
test('tiny character crafting motions require a genuine active in-person work phase',()=>{
 const f=fixture(),s={id:'mabel',day:30,phase:'work',step:0,
  origin:{x:720,y:594},spots:[{x:695,y:624},{x:770,y:630}]};
 f.helper.session=s;
 assert.equal(f.w.actorMood('player'),true);
 assert.equal(f.w.actorMood('child','pip'),true);
 assert.equal(f.w.actorMood('adult','mabel'),true);
 assert.equal(f.w.actorMood('adult','jun'),false);
 for(const [role,id,pos] of [['player','player',{x:720,y:594}],
  ['child','pip',{x:708,y:591}],['adult','mabel',{x:720,y:594}]]){
  const {g,rects}=drawing();
  assert.equal(f.w.drawActor(g,role,id,pos,1.0),true);assert.ok(rects.length>=5);
 }
});
test('gestures stop if Pip or Poppy leaves, day changes, or another scene begins',()=>{
 const f=fixture();f.helper.session={id:'mabel',day:30,phase:'work',step:0,
  origin:{x:720,y:594},spots:[{x:695,y:624},{x:770,y:630}]};
 f.setPip(999,1250);assert.equal(f.w.actorMood('child','pip'),false);
 f.setPip(708,591);f.setPoppy(1000,1100);assert.equal(f.w.actorMood('player'),false);
 f.setPoppy(720,594);f.state.day=31;assert.equal(f.w.actorMood('player'),false);
 f.state.day=30;f.setScene('home');assert.equal(f.w.actorMood('player'),false);
});
test('no staged animation for a menu-only plan before any real craft objects',()=>{
 const f=fixture();f.helper.session={id:'mabel',day:30,phase:'plan',step:0,
  origin:{x:720,y:594},spots:[{x:695,y:624},{x:770,y:630}]};
 assert.equal(f.w.actorMood('player'),false);
});
test('true completion triggers a time-limited original pixel celebration without extra pay',()=>{
 const f=fixture({earned:[record('mabel',30)]});
 assert.equal(f.w.completed(record('mabel',30)),true);
 const {g,rects}=drawing();assert.equal(f.w.drawCelebration(g,1.2),true);assert.ok(rects.length>=9);
 assert.equal(f.saves,0);assert.equal(f.state.coins,400);
 f.setPaused(true);f.w.advance(10);assert.equal(f.w.celebration.seconds,4.5);
 f.setPaused(false);for(let i=0;i<30;i++)f.w.advance(.2);
 assert.equal(f.w.celebration,null);
});
test('not-yet-earned receipt cannot trigger a fake celebration',()=>{
 const f=fixture();assert.equal(f.w.completed(record('mabel',30)),false);
 assert.equal(f.w.celebration,null);
});
test('celebration disappears after leaving town or advancing to a new game day',()=>{
 const f=fixture({earned:[record('mabel',30)]});
 f.w.completed(record('mabel',30));f.setScene('home');f.w.advance(.2);
 assert.equal(f.w.celebration,null);
 f.setScene('town');f.w.completed(record('mabel',30));f.state.day=31;f.w.advance(.2);
 assert.equal(f.w.celebration,null);
});
test('game-world architecture has correct load order and safe old save key',()=>{
 const game=read('game.js'),html=read('index.html'),sw=read('sw.js'),child=read('little-sprouts-v272.js');
 assert.ok(html.includes('pip-world-keepsakes-v285.js?v=2.8.5'));
 assert.ok(html.includes('pip-world-keepsakes-v285.css?v=2.8.5'));
 assert.ok(html.indexOf('pip-helpers-v284.js')<html.indexOf('pip-world-keepsakes-v285.js'));
 assert.ok(html.indexOf('pip-world-keepsakes-v285.js')<html.indexOf('little-sprouts-v272.js'));
 assert.ok(html.includes('little-sprouts-v272.js?v=2.9.2'));
 assert.ok(html.includes('game.js?v=2.9.2'));
 assert.match(sw,/hearth-harbor-v292-pips-own-ideas/);
 for(const file of ['pip-world-keepsakes-v285.js','pip-world-keepsakes-v285.css'])
  assert.ok(sw.includes("'./"+file+"'"));
 assert.match(game,/littleSprouts\.worldKeepsakes\.displays/);
 assert.match(game,/littleSprouts\.worldKeepsakes\.drawDisplay/);
 assert.match(game,/littleSprouts\.worldKeepsakes\.drawActor/);
 assert.match(game,/littleSprouts\.worldKeepsakes\.hit/);
 assert.match(game,/littleSprouts\.worldKeepsakes\.inspect/);
 assert.match(child,/onProjectCompleted:record=>worldKeepsakes\.completed/);
 assert.match(game,/const SAVE='hearth-harbor-save-v1'/);
});
test('small phone keepsake modal supports touch, visible focus and reduced motion',()=>{
 const css=read('pip-world-keepsakes-v285.css');
 assert.match(css,/:focus-visible/);assert.match(css,/@media\(max-width:380px\)/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(css,/min-height:48px/);
});
test('keepsake art never adds network requests, background timers or secondary storage',()=>{
 const code=read('pip-world-keepsakes-v285.js');
 assert.doesNotMatch(code,/fetch\(|XMLHttpRequest|WebSocket|localStorage|setInterval|setTimeout/);
});

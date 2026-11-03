/* Hearth & Harbor v2.8.7 — The Village Remembers: future-day NPC responses */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const env={window:{}};
for(const file of ['pip-growth-v280.js','pip-helpers-v284.js','pip-world-keepsakes-v285.js','pip-responses-v287.js'])
 vm.runInNewContext(read(file),env,{filename:file});
const H=env.window.HearthPipHelpers,W=env.window.HearthPipWorldKeepsakes,R=env.window.HearthPipResponses;
const plain=x=>JSON.parse(JSON.stringify(x));
const ids=Object.keys(R.ANSWERS);
function fixture({day=12,minute=720,guardian=true,grown=true,known=true,receipt=true,
  scene='town',responses=[],id='mabel'}={}){
 const site=W.SITE[id],child={
  guardian:guardian?'player':null,guardianDay:guardian?3:0,
  growth:grown?{stage:1,firstDay:4,secondDay:0}:{stage:0,firstDay:0,secondDay:0},
  mentor:{counts:{},last:{}},helperProjects:receipt?[{day:8,id,plan:1,finish:0}]:[],
  neighborResponses:plain(responses),needs:{curiosity:55,confidence:50,joy:62}
 };
 if(known)child.mentor.counts[id]=1;
 const state={day,minute,youngResidents:{pip:child},coins:520,relations:{[id]:18},weddingPlans:{},familyRoots:{chosen:{}},householdMoves:[]};
 let currentScene=scene,adult={id,x:site.x+70,y:site.y+24},player={x:site.x+48,y:site.y+21},
  pip={x:site.x+40,y:site.y+21},modal=null,saves=0,updates=0,alerts=[],blocked=false,special=false;
 const api={
  getState:()=>state,getChild:()=>child,getScene:()=>currentScene,
  getDisplays:()=>currentScene==='town'?[{id,x:site.x,y:site.y,plan:1,finish:0,day:8}]:[],
  getAdults:()=>[adult],getPlayer:()=>({...player}),getChildPosition:()=>({...pip}),
  isWalkable:()=>!blocked,nearestWalkable:p=>!blocked?p:null,
  hasCompetingEvent:()=>special,name:()=>id.toUpperCase(),
  closeTalk:()=>{},showModal:(name,html)=>{modal={name,html}},
  save:()=>saves++,updateUI:()=>updates++,notify:s=>alerts.push(s),
  bondAdult:(who,value)=>state.relations[who]=Math.min(100,(state.relations[who]||0)+value),
  openBook:()=>{modal={name:'book',html:'daybook'}}
 };
 const r=R.setup(api);
 return {r,child,state,site,api,alerts,get modal(){return modal},get saves(){return saves},
  get updates(){return updates},setScene:s=>currentScene=s,setMinute:m=>state.minute=m,
  moveAdult:(x,y)=>{adult.x=x;adult.y=y},movePlayer:(x,y)=>{player={x,y}},
  movePip:(x,y)=>pip={x,y},setBlocked:v=>blocked=v,setSpecial:v=>special=v};
}
test('six unique authored neighbor replies reflect earlier real work',()=>{
 assert.equal(ids.length,6);
 assert.equal(new Set(ids.map(id=>R.ANSWERS[id].start)).size,6);
 for(const id of ids){
  const d=R.ANSWERS[id];assert.equal(d.options.length,2);
  assert.equal(d.outcomes.length,2);assert.ok(['curiosity','confidence','joy'].includes(d.need));
 }
});
test('a fresh save without a real completed helper project has no follow-up visit',()=>{
 const f=fixture({receipt:false});
 assert.equal(f.r.original('mabel'),null);
 assert.equal(f.r.eligible('mabel'),false);
 assert.equal(f.r.panel(),'');
 assert.equal(f.r.schedule('mabel',{h:'base',where:[10,20]}).h,'base');
 assert.equal(f.r.begin('mabel'),false);
 assert.equal(f.saves,0);
});
test('no guardian, no developmental chapter or no real acquaintance blocks false histories',()=>{
 for(const o of [{guardian:false},{grown:false},{known:false}]){
  const f=fixture(o);
  assert.equal(f.r.original('mabel'),null);assert.equal(f.r.eligible('mabel'),false);
 }
});
test('adult visits actual earned art during 10 AM–4 PM, then returns to ordinary routine',()=>{
 const f=fixture(),base={h:5,where:[200,600],label:'normal'};
 const morning=f.r.schedule('mabel',base);
 assert.equal(morning.childReply,true);assert.equal(morning.where[0],f.site.x+78);
 assert.equal(morning.where[1],f.site.y+21);
 assert.notEqual(morning.h,base.h);assert.equal(morning.label,'normal');
 f.setMinute(580);assert.deepEqual(plain(f.r.schedule('mabel',base)),base);
 f.setMinute(960);assert.deepEqual(plain(f.r.schedule('mabel',base)),base);
});
test('return visits never override another explicit couple/shared social event',()=>{
 const f=fixture(),base={h:5,where:[100,700]};f.setSpecial(true);
 assert.deepEqual(plain(f.r.schedule('mabel',base)),base);
 assert.equal(f.r.eligible('mabel'),false);
});
test('the work must be from a previous day, never immediately same-day',()=>{
 const f=fixture({day:8});
 assert.equal(f.r.eligible('mabel'),false);
 assert.equal(f.r.schedule('mabel',{h:'base',where:[1,2]}).h,'base');
});
test('no one teleports: schedule only requests a destination, not a character mutation',()=>{
 const f=fixture(),before=f.api.getAdults()[0],old=plain(before);
 const route=f.r.schedule('mabel',{h:0,where:[300,400]});
 assert.ok(route.where[0]>0);assert.deepEqual(plain(before),old);
 assert.equal(f.saves,0);
});
test('a genuine in-world visit needs Poppy, Pip and adult next to saved craft',()=>{
 const f=fixture();assert.equal(f.r.eligible('mabel'),true);
 f.movePlayer(1200,1300);assert.equal(f.r.eligible('mabel'),false);
 f.movePlayer(f.site.x+48,f.site.y+21);
 f.movePip(1200,1300);assert.equal(f.r.eligible('mabel'),false);
 f.movePip(f.site.x+40,f.site.y+21);
 f.moveAdult(1200,1300);assert.equal(f.r.eligible('mabel'),false);
});
test('a missing or blocked physical display cannot be used from a menu',()=>{
 const f=fixture();f.setBlocked(true);
 assert.equal(f.r.schedule('mabel',{h:0,where:[100,100]}).h,0);
 assert.equal(f.r.begin('mabel'),false);
});
test('village words remember BOTH choices made in the earlier actual project',()=>{
 const f=fixture(),phrase=f.r.dialogue('mabel');
 assert.ok(phrase.includes(H.PROJECTS.mabel.first[1]));
 assert.ok(phrase.includes(H.PROJECTS.mabel.last[0]));
 assert.ok(phrase.includes(R.ANSWERS.mabel.note));
});
test('talking by the real returned villager opens a choice, not an instant reward',()=>{
 const f=fixture();assert.equal(f.r.begin('mabel'),true);
 assert.ok(f.modal.html.includes('pr287-choose'));
 assert.ok(f.modal.html.includes(H.PROJECTS.mabel.first[1]));
 assert.equal(f.child.neighborResponses.length,0);
 assert.equal(f.saves,0);assert.equal(f.state.coins,520);
});
test('leaving the spot or losing the adult before choosing prevents reward',()=>{
 const f=fixture();f.r.begin('mabel');f.moveAdult(1350,1280);
 assert.equal(f.r.choose(0),false);
 assert.equal(f.child.neighborResponses.length,0);
 assert.equal(f.saves,0);
});
test('one real follow-through creates truthful dated memory and improves real bonds once',()=>{
 const f=fixture(),before=plain(f.child.needs);
 f.r.begin('mabel');assert.equal(f.r.choose(0),true);
 assert.deepEqual(plain(f.child.neighborResponses),[{id:'mabel',day:12,choice:0}]);
 assert.equal(f.child.needs.curiosity,before.curiosity+4);
 assert.equal(f.state.relations.mabel,20);
 assert.equal(f.state.coins,520);assert.equal(f.saves,1);assert.equal(f.updates,1);
 assert.match(f.modal.html,/Day 12/);
});
test('both reflection outcomes are distinct and provide persisted follow-up dialogue',()=>{
 const a=fixture(),b=fixture();a.r.begin('mabel');a.r.choose(0);b.r.begin('mabel');b.r.choose(1);
 assert.notEqual(a.r.dialogue('mabel'),b.r.dialogue('mabel'));
 assert.ok(a.r.dialogue('mabel').includes(R.ANSWERS.mabel.outcomes[0]));
 assert.ok(b.r.dialogue('mabel').includes(R.ANSWERS.mabel.outcomes[1]));
});
test('a response cannot be replayed or farmed on later days',()=>{
 const f=fixture();f.r.begin('mabel');f.r.choose(1);
 f.state.day=13;assert.equal(f.r.eligible('mabel'),false);
 assert.equal(f.r.begin('mabel'),false);
 assert.equal(f.r.choose(0),false);
 assert.equal(f.saves,1);assert.equal(f.state.relations.mabel,20);
});
test('ending the visit without selecting a story saves no new data',()=>{
 const f=fixture();f.r.begin('mabel');f.r.handle('pr287-cancel');
 assert.equal(f.child.neighborResponses.length,0);assert.equal(f.saves,0);
});
test('changing scene or game day during response cancels without a false memory',()=>{
 const f=fixture();f.r.begin('mabel');f.setScene('home');
 assert.equal(f.r.choose(1),false);assert.equal(f.saves,0);
 const g=fixture();g.r.begin('mabel');g.state.day++;
 assert.equal(g.r.choose(1),false);assert.equal(g.saves,0);
});
test('invalid choice values cannot advance the community story',()=>{
 const f=fixture();f.r.begin('mabel');
 for(const n of [-1,2,'1',null,NaN])assert.equal(f.r.choose(n),false);
 assert.equal(f.child.neighborResponses.length,0);
});
test('old and manipulated records are sanitized to one truthful entry per adult',()=>{
 const clean=plain(R.clean([{id:'mabel',day:12,choice:0},{id:'mabel',day:15,choice:1},
  {id:'evil',day:9,choice:0},{id:'jun',day:-1,choice:0},
  {id:'bea',day:16,choice:'<script>'},{id:'rosie',day:14,choice:1}]));
 assert.deepEqual(clean,[{id:'mabel',day:12,choice:0},{id:'rosie',day:14,choice:1}]);
 const f=fixture({responses:[{id:'mabel',day:4,choice:0}]});
 assert.equal(f.r.response('mabel'),null,'response cannot predate the project');
});
test('the original 2-choice record creates a tiny lasting variation on REAL pixel art',()=>{
 const a=fixture({responses:[{id:'mabel',day:10,choice:0}]});
 const b=fixture({responses:[{id:'mabel',day:10,choice:1}]});
 const draws=()=>{const calls=[],g={save(){},restore(){},fillRect(...x){calls.push([g.fillStyle,...x])}};return {g,calls}};
 const p={id:'mabel',x:a.site.x,y:a.site.y},x=draws(),y=draws();
 assert.equal(a.r.mark(x.g,p),true);assert.equal(b.r.mark(y.g,p),true);
 assert.notDeepEqual(x.calls,y.calls);
 assert.equal(fixture().r.mark(x.g,p),false);
});
test('an adult visibly recognizes real family history near the existing object',()=>{
 const f=fixture({responses:[{id:'mabel',day:10,choice:1}]}),calls=[];
 const g={save(){},restore(){},fillRect(...a){calls.push(a)}};
 assert.equal(f.r.drawAdult(g,'mabel',{x:f.site.x+60,y:f.site.y+20},2),true);
 assert.ok(calls.length>=3);
 assert.equal(f.r.drawAdult(g,'jun',{x:0,y:0},2),false);
});
test('Pip may visibly respond only when REALLY near a previously met adult and their project',()=>{
 const f=fixture({responses:[{id:'mabel',day:10,choice:1}]}),calls=[];
 const g={save(){},restore(){},fillRect(...a){calls.push(a)}};
 assert.equal(f.r.drawChild(g,{x:f.site.x+40,y:f.site.y+10},2),true);
 assert.ok(calls.length>=2);
 assert.equal(f.r.drawChild(g,{x:1200,y:1200},2),false);
});
test('new visual ambient dialogue does not invent family romance, income or parentage',()=>{
 const f=fixture(),before={weddings:plain(f.state.weddingPlans),moves:plain(f.state.householdMoves)};
 f.r.begin('mabel');f.r.choose(1);
 assert.deepEqual(plain(f.state.weddingPlans),before.weddings);
 assert.deepEqual(plain(f.state.householdMoves),before.moves);
 assert.equal(f.child.guardian,'player');
});
test('every authored adult has a distinct visit tied to its real project',()=>{
 for(const id of ids){
  const f=fixture({id});
  assert.equal(f.r.eligible(id),true,'missing '+id);
  assert.equal(f.r.begin(id),true);
  assert.equal(f.r.choose(0),true);
  assert.equal(f.child.neighborResponses[0].id,id);
 }
});
test('phone assets, original save, existing NPC pathing and Atlas are integrated',()=>{
 const html=read('index.html'),sw=read('sw.js'),game=read('game.js'),
  little=read('little-sprouts-v272.js'),atlas=read('family-atlas-v271.js'),css=read('pip-responses-v287.css');
 assert.ok(html.includes('pip-responses-v287.js?v=2.8.7'));
 assert.ok(html.includes('pip-responses-v287.css?v=2.8.7'));
 assert.ok(html.indexOf('pip-world-keepsakes-v285.js')<html.indexOf('pip-responses-v287.js'));
 assert.ok(html.indexOf('pip-responses-v287.js')<html.indexOf('little-sprouts-v272.js'));
 for(const s of ['pip-responses-v287.js','pip-responses-v287.css'])assert.ok(sw.includes("'./"+s+"'"));
 assert.match(sw,/hearth-harbor-v289-living-cottage-visits/);
 assert.match(game,/littleSprouts\.responses\.schedule\(n\.id,baseEntry\)/);
 assert.match(game,/littleSprouts\.responses\.drawAdult/);
 assert.match(game,/littleSprouts\.responses\.mark/);
 assert.match(game,/littleSprouts\.responses\.drawChild/);
 assert.match(game,/littleSprouts\.responses\.dialogue/);
 assert.match(game,/pr287-direct/);
 assert.match(little,/responses\.panel\(\)/);
 assert.match(little,/root\.HearthPipResponses\?\.clean\?\.\(src\.neighborResponses\)/);
 assert.match(atlas,/child-neighbor-response/);
 assert.match(game,/const SAVE='hearth-harbor-save-v1'/);
 assert.match(css,/:focus-visible/);assert.match(css,/@media\(max-width:380px\)/);
});
test('no new network, account, background loop, timer, passive rewards or third-party images',()=>{
 const s=read('pip-responses-v287.js');
 assert.doesNotMatch(s,/fetch\(|XMLHttpRequest|WebSocket|localStorage|setInterval|setTimeout|new Image\(/);
});

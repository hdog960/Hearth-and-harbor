/* Hearth & Harbor v2.8.3 — real family wall-to-furniture rituals and quilt tests */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'),env={window:{}};
for(const f of ['pip-growth-v280.js','pip-legacy-v282.js','pip-rituals-v283.js','pip-adventures-v281.js',
 'pip-projects-v278.js','pip-guides-v279.js','pip-routines-v273.js','pip-neighbors-v275.js',
 'pip-home-help-v276.js','pip-dreams-v277.js','little-sprouts-v272.js','family-atlas-v271.js'])
 vm.runInNewContext(read(f),env,{filename:f});
const R=env.window.HearthPipRituals,L=env.window.HearthLittleSprouts,A=env.window.HearthFamilyAtlas;
const plain=x=>JSON.parse(JSON.stringify(x));
function fixture({day=20,season=0,guardian=true,keeps=['welcome','supper','orchard'],stage=2,near=true,scene='home'}={}){
 const c=L.defaults(),original=R.SEASONS;
 if(guardian){c.guardian='player';c.guardianDay=2}
 if(stage>0)c.growth={stage,firstDay:3,secondDay:stage>=2?6:0};
 c.legacyKeepsakes=keeps.map(key=>({key,day:8,action:env.window.HearthPipLegacy.TRACKS[key].action}));
 const homeTraditions={homes:{player:Object.fromEntries(['welcome','supper','orchard'].map(key=>[key,{completedDay:5}]))}};
 const state={day,season,minute:800,coins:515,homeTraditions,youngResidents:{pip:c},familyRoots:{chosen:{}},weddingPlans:{}};
 let where=scene,isNear=near,isBusy=false,busyChild=false,queueOk=true,playingPaused=false,modal='',closeCount=0,saves=0,updates=0;
 let player={x:770,y:650},pipBase={x:775,y:670},frameArrival=null,frameTarget=null;
 const queued=[],done=new Set(),notices=[];
 let ritual;
 const p=()=>ritual?.pose?.()||pipBase;
 const api={getState:()=>state,getChild:()=>state.youngResidents.pip,getScene:()=>where,
  getPlayer:()=>({...player}),getChildPosition:()=>({...p()}),
  nearChild:d=>isNear&&Math.hypot(player.x-p().x,player.y-p().y)<=d,
  hasKeepsake:key=>c.legacyKeepsakes.some(k=>k.key===key&&k.day<=state.day&&
   state.homeTraditions.homes.player[key].completedDay<=k.day),
  isBusy:()=>isBusy,childBusy:()=>busyChild,ownDone:k=>done.has(k),
  isQueued:k=>queued.includes(k),queueAction:k=>{if(!queueOk)return false;queued.push(k);return true},
  walkToFrame:(spot,after)=>{frameTarget=spot;frameArrival=after;return true},
  closeModal:()=>{modal='';closeCount++},showModal:(id,html)=>{modal=html},
  isPaused:()=>playingPaused,save:()=>saves++,updateUI:()=>updates++,notify:x=>notices.push(x),
  openBook:()=>{modal='Pip Daybook'}};
 ritual=R.setup(api);
 const visit=()=>{if(!frameArrival)throw Error('No actual walking callback');
  const f=frameArrival;frameArrival=null;player={...frameTarget};ritual.follow(4);return f(frameTarget)};
 const hold=(kind)=>{player=kind==='meal'?{x:755,y:415}:kind==='hobby'?{x:555,y:760}:kind==='chat'?{x:765,y:555}:{x:685,y:675};ritual.follow(3);return ritual.complete(kind,true,state.day)};
 const full=(key,first=0,last=0)=>{assert.equal(ritual.plan(key),true);assert.equal(visit(),true);
  assert.equal(ritual.chooseFirst(first),true);assert.equal(hold(R.THEMES[key].action),true);
  assert.equal(ritual.chooseLast(last),true)};
 return {ritual,state,c:()=>state.youngResidents.pip,queued,notices,visit,hold,full,done,
  get modal(){return modal},get saves(){return saves},get updates(){return updates},get closeCount(){return closeCount},
  get frameTarget(){return frameTarget},
  setScene:x=>where=x,setNear:x=>isNear=x,setBusy:x=>isBusy=x,setChildBusy:x=>busyChild=x,
  setQueueOk:x=>queueOk=x,clearQueue:()=>{queued.length=0},pause:x=>playingPaused=x,
  setPlayer:(x,y)=>{player={x,y}},setPip:(x,y)=>{pipBase={x,y}},setFrameRejected:()=>{api.walkToFrame=()=>false}};
}
test('real family rituals have three individually written openings, final decisions and furniture activities',()=>{
 assert.deepEqual(Object.keys(R.THEMES),['welcome','supper','orchard']);
 for(const key of Object.keys(R.THEMES)){
  const t=R.THEMES[key];
  assert.equal(t.first.length,2);assert.equal(t.last.length,2);
  assert.ok(t.first.every(x=>x.length===2));assert.ok(t.last.every(x=>x.length===2));
  assert.ok(['chat','meal','hobby'].includes(t.action));
 }
});
test('brand-new younger resident migrates with no invented ritual memory',()=>{
 const c=L.clean(null);
 assert.deepEqual(plain(c.familyRituals),[]);
});
test('guardianship is genuinely required for a family ritual',()=>{
 const f=fixture({guardian:false});
 assert.equal(f.ritual.plan('welcome'),false);
 assert.equal(f.saves,0);
});
test('no ritual is available without the corresponding physically earned framed heirloom',()=>{
 const f=fixture({keeps:['welcome']});
 assert.equal(f.ritual.canStart('supper'),false);
 assert.equal(f.ritual.canStart('orchard'),false);
 assert.equal(f.ritual.canStart('welcome'),true);
});
test('an underage child cannot pretend they inherited a keepsake',()=>{
 const f=fixture({stage:0});f.c().legacyKeepsakes=[{key:'welcome',day:8,action:'tidy'}];
 // Real legacy model checks the previously earned growth date before display.
 const view=f.ritual.panel();assert.match(view,/family/);
 assert.equal(env.window.HearthPipRituals.recordsFor(f.state,f.c(),20).length,0);
});
test('must be in cottage and actually near Pip to begin a family tradition',()=>{
 const f=fixture({scene:'town'});assert.equal(f.ritual.plan('welcome'),false);
 f.setScene('home');f.setNear(false);assert.equal(f.ritual.plan('welcome'),false);
 f.setNear(true);assert.equal(f.ritual.plan('welcome'),true);
});
test('already occupied Poppy Daybook cannot begin a second interrupting ritual',()=>{
 const f=fixture();f.setBusy(true);assert.equal(f.ritual.plan('welcome'),false);
 f.setBusy(false);f.setChildBusy(true);assert.equal(f.ritual.plan('welcome'),false);
});
test('previously finished Poppy household action cannot be replayed for a fake ritual receipt',()=>{
 const f=fixture();f.done.add('chat');assert.equal(f.ritual.plan('welcome'),false);
});
test('a true ritual begins by ordering world walking and writes no instant reward',()=>{
 const f=fixture();const needs=plain(f.c().needs);
 assert.equal(f.ritual.plan('welcome'),true);
 assert.deepEqual(plain(f.frameTarget),{x:708,y:365});
 assert.equal(f.ritual.status().phase,'walking');
 assert.equal(f.saves,0);assert.deepEqual(plain(f.c().needs),needs);assert.equal(f.state.coins,515);
});
test('failing to reach wall safely declines the activity with no phantom memory',()=>{
 const f=fixture();f.setFrameRejected();
 assert.equal(f.ritual.plan('welcome'),false);
 assert.equal(f.ritual.session,null);assert.equal(f.saves,0);
});
test('the wall arrival callback must use the actual destination and authentic proximity',()=>{
 const f=fixture();f.ritual.plan('welcome');
 assert.equal(f.ritual.arrive('welcome',{x:900,y:600}),false);
 assert.equal(f.ritual.status().phase,'walking');
 assert.equal(f.visit(),true);
 assert.equal(f.ritual.status().phase,'story');
});
test('a genuine arrival exposes a key-specific first decision, not a payout',()=>{
 const f=fixture();f.ritual.plan('supper');f.visit();
 assert.match(f.modal,/What makes a meal worth remembering/);
 assert.match(f.modal,/pf283-first/);
 assert.equal(f.c().familyRituals.length,0);
});
test('the ritual participant follows Poppy in the real cottage instead of occupying a separate menu',()=>{
 const f=fixture();f.ritual.plan('orchard');
 const origin=f.ritual.pose();f.setPlayer(640,520);f.ritual.follow(1);
 const next=f.ritual.pose();
 assert.ok(Math.hypot(origin.x-next.x,origin.y-next.y)>10);
 assert.equal(next.participating,true);
});
test('walking animation pauses during modal interaction while keeping a visible child',()=>{
 const f=fixture();f.ritual.plan('welcome');f.pause(true);const p=plain(f.ritual.pose());
 f.setPlayer(720,450);f.ritual.follow(.2);
 assert.deepEqual(plain(f.ritual.pose()),p);
});
test('choosing an opening story queues the actual Poppy household routine and still awards nothing',()=>{
 const f=fixture();f.ritual.plan('welcome');f.visit();
 assert.equal(f.ritual.chooseFirst(1),true);
 assert.deepEqual(f.queued,['chat']);
 assert.equal(f.ritual.status().phase,'queued');
 assert.equal(f.saves,0);assert.equal(f.c().familyRituals.length,0);
});
test('if actual Daybook scheduling fails, ritual ends without any record',()=>{
 const f=fixture();f.ritual.plan('welcome');f.visit();f.setQueueOk(false);
 assert.equal(f.ritual.chooseFirst(0),false);
 assert.equal(f.ritual.session,null);assert.equal(f.saves,0);
});
test('a different household task never completes this scheduled family ritual',()=>{
 const f=fixture();f.ritual.plan('welcome');f.visit();f.ritual.chooseFirst(0);
 assert.equal(f.ritual.complete('meal',true,20),false);
 assert.equal(f.ritual.complete('chat',false,20),false);
 assert.equal(f.saves,0);
});
test('household action must be completed on the same actual in-game day',()=>{
 const f=fixture();f.ritual.plan('welcome');f.visit();f.ritual.chooseFirst(0);
 assert.equal(f.ritual.complete('chat',true,19),false);
 assert.equal(f.saves,0);
});
test('a real Poppy timed action opens the final choice without saving an unchosen story',()=>{
 const f=fixture();f.ritual.plan('welcome');f.visit();f.ritual.chooseFirst(0);
 assert.equal(f.hold('chat'),true);
 assert.equal(f.ritual.status().phase,'final');
 assert.match(f.modal,/pf283-last/);
 assert.equal(f.c().familyRituals.length,0);assert.equal(f.saves,0);
});
test('the final choice records day, actual season, earned heirloom and both personal decisions',()=>{
 const f=fixture({season:2});f.full('welcome',1,0);
 assert.deepEqual(plain(f.c().familyRituals),[{day:20,key:'welcome',season:2,first:1,last:0}]);
 assert.equal(f.saves,1);assert.equal(f.updates,1);
});
test('a full real family ritual modestly restores Pip needs but never generates coins',()=>{
 const f=fixture();const needs={...f.c().needs};f.full('orchard',0,1);
 assert.equal(f.c().needs.curiosity,needs.curiosity+4);
 assert.equal(f.c().needs.joy,needs.joy+2);
 assert.equal(f.state.coins,515);
});
test('all three heirlooms produce individually valid physical story-to-furniture routines',()=>{
 for(const key of Object.keys(R.THEMES)){
  const f=fixture();f.full(key,1,1);
  assert.equal(f.c().familyRituals[0].key,key);
  assert.equal(f.queued[0],R.THEMES[key].action);
 }
});
test('one true memory per game day means no repeat even with another heirloom',()=>{
 const f=fixture();f.full('welcome');
 assert.equal(f.ritual.plan('supper'),false);
 assert.equal(f.c().familyRituals.length,1);
 assert.equal(f.saves,1);
});
test('a second later day supports a new genuinely shared family moment',()=>{
 const f=fixture();f.full('welcome');
 f.state.day=21;f.setPlayer(770,650);f.setPip(770,660);
 f.full('supper',1,0);
 assert.deepEqual(plain(f.c().familyRituals.map(r=>r.day)),[20,21]);
});
test('canceling the opening story earns nothing',()=>{
 const f=fixture();f.ritual.plan('welcome');f.visit();
 assert.equal(f.ritual.cancel(),true);
 assert.equal(f.c().familyRituals.length,0);assert.equal(f.saves,0);
});
test('canceling after Poppy completed household activity but before final choice still saves nothing',()=>{
 const f=fixture();f.ritual.plan('welcome');f.visit();f.ritual.chooseFirst(0);f.hold('chat');
 assert.equal(f.ritual.cancel(),true);
 assert.equal(f.c().familyRituals.length,0);assert.equal(f.saves,0);
});
test('clearing the real Poppy Daybook queue cancels an unfinished ritual immediately',()=>{
 const f=fixture();f.ritual.plan('welcome');f.visit();f.ritual.chooseFirst(0);
 f.clearQueue();
 assert.equal(f.ritual.status(),null);
 assert.equal(f.ritual.complete('chat',true,20),false);
});
test('leaving the cottage cancels the old ritual session and restores normal Pip position',()=>{
 const f=fixture();f.ritual.plan('welcome');f.setScene('town');
 assert.equal(f.ritual.status(),null);assert.equal(f.ritual.pose(),null);
});
test('changing game day between the wall and household activity gives no memory',()=>{
 const f=fixture();f.ritual.plan('supper');f.visit();f.ritual.chooseFirst(0);
 f.state.day=21;
 assert.equal(f.ritual.complete('meal',true,21),false);assert.equal(f.ritual.session,null);
});
test('changing seasons during a planned memory does not fabricate last season’s patch',()=>{
 const f=fixture();f.ritual.plan('supper');f.visit();f.state.season=1;
 assert.equal(f.ritual.chooseFirst(0),false);assert.equal(f.ritual.session,null);
});
test('losing the real family heirloom mid-session invalidates the promised family reward',()=>{
 const f=fixture();f.ritual.plan('welcome');f.visit();
 f.c().legacyKeepsakes=[];
 assert.equal(f.ritual.chooseFirst(0),false);assert.equal(f.ritual.status(),null);
});
test('invalid answer indexes never advance or save a memory',()=>{
 const f=fixture();f.ritual.plan('welcome');f.visit();
 for(const i of [-1,2,NaN,undefined])assert.equal(f.ritual.chooseFirst(i),false);
 assert.equal(f.ritual.status().phase,'story');assert.equal(f.saves,0);
});
test('malformed final response indexes can never earn a false family memory',()=>{
 const f=fixture();f.ritual.plan('welcome');f.visit();f.ritual.chooseFirst(0);f.hold('chat');
 for(const i of [-1,2,NaN,undefined])assert.equal(f.ritual.chooseLast(i),false);
 assert.equal(f.c().familyRituals.length,0);assert.equal(f.saves,0);
});
test('child and adult can use the family wall as a real physically inspectable scene',()=>{
 const f=fixture();
 assert.equal(f.ritual.frameHit(708,239),'welcome');
 assert.equal(f.ritual.frameHit(800,239),'supper');
 assert.equal(f.ritual.frameHit(892,239),'orchard');
 assert.equal(f.ritual.frameHit(920,500),null);
 assert.equal(f.ritual.inspect('supper'),true);
 assert.match(f.modal,/Our Family Seasons Sampler/);
});
test('unearned frames cannot be interacted with in the real physical cottage',()=>{
 const f=fixture({keeps:['welcome']});
 assert.equal(f.ritual.frameHit(800,239),null);
 assert.equal(f.ritual.inspect('supper'),false);
 f.setScene('town');assert.equal(f.ritual.frameHit(708,239),null);
});
test('imported family memories are strictly sanitized by day and valid choices',()=>{
 const result=R.clean([{day:10,key:'welcome',season:0,first:0,last:1},
  {day:10,key:'supper',season:1,first:1,last:0},{day:11,key:'fake',season:2,first:0,last:0},
  {day:12,key:'orchard',season:4,first:1,last:1},{day:13,key:'supper',season:3,first:1,last:0}]);
 assert.deepEqual(plain(result),[
  {day:10,key:'welcome',season:0,first:0,last:1},
  {day:13,key:'supper',season:3,first:1,last:0}]);
});
test('imported rituals without a genuine earlier made heirloom never count as history',()=>{
 const f=fixture({keeps:['welcome']});
 f.c().familyRituals=[{day:13,key:'supper',season:2,first:0,last:1}];
 assert.equal(f.ritual.history().length,0);
 assert.equal(f.ritual.bonus,0);
});
test('future-dated or pre-guardian memories cannot appear in current sampler',()=>{
 const f=fixture();
 f.c().familyRituals=[{day:90,key:'welcome',season:1,first:0,last:0},
  {day:1,key:'supper',season:0,first:0,last:0}];
 assert.equal(f.ritual.history().length,0);
});
test('a ritual cannot predate its actually crafted family heirloom',()=>{
 const f=fixture();
 f.c().familyRituals=[{day:7,key:'welcome',season:1,first:0,last:0}];
 assert.equal(f.ritual.history().length,0);
});
test('three true distinct seasons unlock one bounded physical cottage quilt, not coins',()=>{
 const f=fixture();f.c().familyRituals=[
 {day:11,key:'welcome',season:0,first:0,last:0},
 {day:12,key:'supper',season:1,first:1,last:0},
 {day:13,key:'orchard',season:2,first:1,last:1}];
 assert.equal(f.ritual.earnedSeasons().length,3);
 assert.equal(f.ritual.quilt,true);assert.equal(f.ritual.bonus,1);
 assert.equal(f.state.coins,515);
});
test('three memories from the same season never unlock a false seasonal quilt',()=>{
 const f=fixture();f.c().familyRituals=[11,12,13].map(day=>({day,key:'welcome',season:0,first:0,last:0}));
 assert.equal(f.ritual.earnedSeasons().length,1);
 assert.equal(f.ritual.quilt,false);assert.equal(f.ritual.bonus,0);
});
test('season sampler evolves visually from the first patch to complete quilt artwork',()=>{
 const f=fixture(),calls=[],g={save(){},restore(){},fillRect(){calls.push(1)}};
 assert.equal(f.ritual.draw(g,1),false);
 f.c().familyRituals=[{day:11,key:'welcome',season:0,first:0,last:0}];
 assert.equal(f.ritual.draw(g,1),true);
 const first=calls.length;calls.length=0;
 f.c().familyRituals.push({day:12,key:'supper',season:1,first:1,last:0},{day:13,key:'orchard',season:2,first:1,last:1});
 assert.equal(f.ritual.draw(g,1),true);assert.ok(calls.length>first);
});
test('true child rituals survive original save-key round trip and respect cap',()=>{
 const f=fixture();f.full('welcome',1,1);
 const clean=L.clean(plain(f.c()));
 assert.deepEqual(plain(clean.familyRituals),[{day:20,key:'welcome',season:0,first:1,last:1}]);
 assert.equal(clean.legacyKeepsakes.length,3);assert.equal(clean.growth.stage,2);
});
test('family Atlas records completed lived season rituals but never invents parents',()=>{
 const f=fixture();f.full('supper');
 const atlas=A.setup({getState:()=>f.state,getResidentHome:()=>null,getYoungResident:()=>({guardian:'player',guardianDay:2}),getPortraits:()=>[]});
 const events=atlas.events().filter(x=>x.kind==='child-family-ritual');
 assert.equal(events.length,1);assert.equal(events[0].day,20);
 assert.equal(atlas.graph().edges.some(e=>e.kind==='marriage'&&e.ids.includes('pip')),false);
});
test('family Atlas excludes future dated and ungrounded ritual records',()=>{
 const f=fixture();f.c().familyRituals=[{day:30,key:'welcome',season:0,first:0,last:0},
 {day:12,key:'supper',season:1,first:0,last:0}];f.c().legacyKeepsakes=[];
 const atlas=A.setup({getState:()=>f.state,getResidentHome:()=>null,getYoungResident:()=>({guardian:'player',guardianDay:2}),getPortraits:()=>[]});
 assert.equal(atlas.events().filter(x=>x.kind==='child-family-ritual').length,0);
});
test('actual world family frame taps, Poppy pathfinding and true timed task hooks are present',()=>{
 const game=read('game.js'),child=read('little-sprouts-v272.js');
 assert.match(game,/littleSprouts\.rituals\.frameHit\(wx,wy\)/);
 assert.match(game,/goTo\(accessible,\(\)=>littleSprouts\.rituals\.inspect\(memoryFrame\)\)/);
 assert.match(game,/littleSprouts\.rituals\.complete\(kind,once,state\.day\)/);
 assert.match(child,/rituals\.follow\(dt\)/);
 assert.match(child,/rituals\.pose\(\)/);
 assert.match(game,/littleSprouts\.rituals\.draw\(ctx,tick\)/);
 assert.match(game,/const SAVE='hearth-harbor-save-v1'/);
});
test('mobile PWA scripts load in correct order and original visual controls are accessible',()=>{
 const html=read('index.html'),sw=read('sw.js'),css=read('pip-rituals-v283.css');
 for(const file of ['pip-rituals-v283.js','pip-rituals-v283.css']){
  assert.ok(html.includes(file));assert.ok(sw.includes("'./"+file+"'"));
 }
 assert.ok(html.indexOf('pip-legacy-v282.js')<html.indexOf('pip-rituals-v283.js'));
 assert.ok(html.indexOf('pip-rituals-v283.js')<html.indexOf('little-sprouts-v272.js'));
 assert.match(html,/v=2\.8\.3/);assert.match(sw,/hearth-harbor-v283-family-seasons/);
 assert.match(css,/:focus-visible/);assert.match(css,/@media\(max-width:380px\)/);
});
test('no backend, persistent timers, passive money or second save system was introduced',()=>{
 const src=read('pip-rituals-v283.js');
 assert.doesNotMatch(src,/fetch\(|XMLHttpRequest|WebSocket|localStorage|setTimeout|setInterval|new Image\(/);
 assert.doesNotMatch(src,/coins\s*\+=|weddingPlans|adultJob/);
});

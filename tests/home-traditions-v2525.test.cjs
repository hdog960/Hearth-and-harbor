/* Hearth & Harbor v2.5.25 — Home & Town Traditions regression suite */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const context={window:{}};vm.runInNewContext(read('home-traditions-v2525.js'),context);
vm.runInNewContext(read('village-trades-v2523.js'),context);
const M=context.window.HearthHomeTraditions,V=context.window.HearthVillageTrades;
function fixture(extra={}){
 const state={day:1,coins:250,name:'Poppy',hearts:0,
  needs:{hunger:80,fun:65,energy:70,social:65},
  relations:{bea:10,rosie:10,oliver:10},
  cooking:{pantry:{berry:8,apple:8,carrot:8,herb:8},dishes:[{id:'tart',quality:3}]},
  homeTraditions:M.clean(null),villageTrades:V.clean(null),...extra};
 let saves=0,updates=0,views=[],toasts=[];
 const callbacks={
  getState:()=>state,save:()=>saves++,updateUI:()=>updates++,
  notify:x=>toasts.push(x),showModal:(screen,html)=>views.push({screen,html}),
  closeModal:()=>{},getHomeLabel:h=>'Residence '+h,getPersonLabel:id=>id==='player'?'Poppy':id
 };
 const traditions=M.setup(callbacks);
 return {state,traditions,callbacks,get saves(){return saves},get updates(){return updates},
  get last(){return views.at(-1)},get toasts(){return toasts}};
}
const nextDay=x=>x.state.day++;
test('legacy saves create seven independent homes and three optional empty traditions',()=>{
 const r=M.clean(null);
 assert.equal(Object.keys(r.homes).length,7);
 assert.equal(r.focus,'player');
 for(const h of M.HOMES)for(const key of M.KEYS){
  assert.equal(r.homes[h][key].started,false);
  assert.equal(r.homes[h][key].stage,0);
  assert.equal(r.homes[h][key].completedDay,0);
 }
});
test('import sanitizer filters unknown homes, titles, invalid dates, forged stages and memories',()=>{
 const r=M.clean({focus:'__proto__',daily:{player:-1,h0:7,bad:44},
  homes:{player:{welcome:{started:true,stage:48,lastDay:4,completedDay:0,memories:[
  {day:1,actor:'player',kind:'home'},{day:2,actor:'robot',kind:'home'},{day:4,actor:'player',kind:'trade'}
  ]},supper:{stage:-500}},bad:{welcome:{stage:3,completedDay:5}}}});
 assert.equal(r.focus,'player');
 assert.equal(r.daily.player,0);assert.equal(r.daily.h0,7);
 assert.equal(r.homes.player.welcome.stage,2,'a forged completed stage without completed date is not final');
 assert.equal(r.homes.player.welcome.memories.length,2);
 assert.equal(r.homes.player.supper.stage,0);
 assert.equal(Object.keys(r.homes).length,7);
});
test('only three unique storylines exist; each has genuine home, trade, home stages',()=>{
 assert.equal(M.KEYS.length,3);
 assert.deepEqual(Array.from(M.TRACKS.welcome.steps.map(s=>s[0])),['home','trade','home']);
 assert.equal(M.TRACKS.supper.steps[1][1],'oliver');
 assert.equal(M.TRACKS.orchard.steps[1][1],'rosie');
});
test('opening a book or tapping an inactive task never creates progress or rewards',()=>{
 const x=fixture();x.traditions.board();
 assert.equal(x.last.screen,'home-traditions');
 assert.equal(x.traditions.recordHome('player','player','chat'),false);
 assert.equal(x.traditions.recordTrade('bea'),false);
 assert.equal(x.traditions.comfortBonus('player'),0);
 assert.equal(x.saves,0);
});
test('starting a tradition records a household intention and focuses its real shop work',()=>{
 const x=fixture();
 x.traditions.start('h1','welcome');
 assert.equal(x.traditions.record.focus,'h1');
 assert.equal(x.traditions.record.homes.h1.welcome.started,true);
 assert.equal(x.traditions.record.homes.h1.welcome.stage,0);
 assert.equal(x.saves,1);assert.equal(x.updates,1);
 assert.match(x.last.html,/Town-work focus/);
});
test('wrong actor and wrong home do not complete a household activity',()=>{
 const x=fixture();x.traditions.start('h0','welcome');
 assert.equal(x.traditions.recordHome('h0','player','chat'),false);
 assert.equal(x.traditions.recordHome('player','mabel','chat'),false);
 assert.equal(x.traditions.recordHome('h0','mabel','read'),false);
 assert.equal(x.traditions.recordHome('h0','mabel','chat',false),false);
 assert.equal(x.traditions.record.homes.h0.welcome.stage,0);
});
test('welcoming story takes three real, ordered activities on separate days and awards a permanent frame',()=>{
 const x=fixture();x.traditions.start('player','welcome');
 const first=x.traditions.recordHome('player','player','chat',true);
 assert.equal(first.stage,1);assert.equal(x.traditions.record.homes.player.welcome.lastDay,1);
 assert.equal(x.traditions.recordTrade('bea'),false,'cannot run a second chapter today');
 nextDay(x);
 assert.equal(x.traditions.recordTrade('rosie'),false,'wrong business');
 const second=x.traditions.recordTrade('bea');
 assert.equal(second.stage,2);assert.equal(x.traditions.recordHome('player','player','tidy'),false);
 nextDay(x);
 const third=x.traditions.recordHome('player','player','tidy',true);
 assert.equal(third.finished,true);assert.equal(third.stage,3);
 assert.equal(x.traditions.comfortBonus('player'),3);
 assert.equal(x.traditions.record.homes.player.welcome.completedDay,3);
 assert.equal(x.traditions.record.homes.player.welcome.memories.length,3);
 assert.equal(x.state.coins,250,'book itself creates no money');
 assert.equal(x.saves,1,'real activity callers own their existing save');
});
test('completed story is permanent and repeated events cannot farm comfort or currencies',()=>{
 const x=fixture();x.traditions.start('player','welcome');
 x.traditions.recordHome('player','player','chat');
 nextDay(x);x.traditions.recordTrade('bea');
 nextDay(x);x.traditions.recordHome('player','player','tidy');
 for(let i=0;i<40;i++){nextDay(x);assert.equal(x.traditions.recordHome('player','player','tidy'),false);assert.equal(x.traditions.recordTrade('bea'),false);}
 assert.equal(x.traditions.comfortBonus('player'),3);
 assert.equal(x.traditions.record.homes.player.welcome.memories.length,3);
});
test('Sunday Table requires a meal then real Oliver delivery then a conversation',()=>{
 const x=fixture();x.traditions.start('player','supper');
 assert.equal(x.traditions.recordHome('player','player','chat'),false);
 assert.equal(x.traditions.recordHome('player','player','meal').stage,1);
 nextDay(x);assert.equal(x.traditions.recordTrade('oliver').stage,2);
 nextDay(x);assert.equal(x.traditions.recordHome('player','player','chat').finished,true);
 assert.equal(x.traditions.comfortBonus('player'),3);
});
test('Orchard story needs an actual hobby, Rosie delivery, then reading',()=>{
 const x=fixture();x.traditions.start('h2','orchard');
 assert.equal(x.traditions.recordHome('h2','bea','hobby').stage,1);
 nextDay(x);assert.equal(x.traditions.recordTrade('rosie').stage,2);
 nextDay(x);assert.equal(x.traditions.recordHome('h2','bea','read').finished,true);
 assert.equal(x.traditions.comfortBonus('h2'),3);
 assert.equal(x.traditions.comfortBonus('player'),0);
});
test('trade credits only the chosen household, not every active house',()=>{
 const x=fixture();
 x.traditions.start('h0','welcome');x.traditions.recordHome('h0','mabel','chat');
 x.traditions.start('player','welcome');x.traditions.recordHome('player','player','chat');
 nextDay(x);
 assert.equal(x.traditions.record.focus,'player');
 assert.equal(x.traditions.recordTrade('bea').home,'player');
 assert.equal(x.traditions.record.homes.h0.welcome.stage,1);
 x.traditions.focus('h0');
 assert.equal(x.traditions.recordTrade('bea').home,'h0');
});
test('only one chapter per household per game day, even across different active stories',()=>{
 const x=fixture();x.traditions.start('player','welcome');x.traditions.start('player','supper');
 assert.equal(x.traditions.recordHome('player','player','chat').key,'welcome');
 assert.equal(x.traditions.recordHome('player','player','meal'),false);
 nextDay(x);assert.equal(x.traditions.recordHome('player','player','meal').key,'supper');
});
test('old-save serialized/reloaded multi-day progress remains exact',()=>{
 const x=fixture();x.traditions.start('h4','welcome');x.traditions.recordHome('h4','jun','chat');
 const serialized=JSON.stringify(x.traditions.record);
 const loaded=fixture({day:2,homeTraditions:M.clean(JSON.parse(serialized))});
 assert.equal(loaded.traditions.record.homes.h4.welcome.stage,1);
 assert.equal(loaded.traditions.record.focus,'h4');
 assert.equal(loaded.traditions.recordTrade('bea').stage,2);
 assert.equal(loaded.traditions.comfortBonus('h4'),0);
 loaded.state.day=3;loaded.traditions.recordHome('h4','jun','tidy');
 assert.equal(loaded.traditions.comfortBonus('h4'),3);
});
test('a completed home can earn all three frames for a bounded nine-point comfort benefit',()=>{
 const x=fixture();for(const key of M.KEYS)x.traditions.start('player',key);
 const tasks=[['chat','bea','tidy'],['meal','oliver','chat'],['hobby','rosie','read']];
 for(const t of tasks){x.traditions.recordHome('player','player',t[0]);nextDay(x);
  x.traditions.recordTrade(t[1]);nextDay(x);x.traditions.recordHome('player','player',t[2]);nextDay(x);}
 assert.equal(x.traditions.comfortBonus('player'),9);
 assert.equal(x.traditions.comfortBonus('h0'),0);
 assert.equal(Object.values(x.traditions.record.homes.player).filter(r=>r.completedDay).length,3);
});
test('invalid keys, malformed control IDs and invalid shop tokens do not mutate storage',()=>{
 const x=fixture(),pre=JSON.stringify(x.state.homeTraditions);
 for(const bad of ['wrong','__proto__','h9','h-1'])x.traditions.start(bad,'welcome');
 for(const bad of ['wrong','__proto__','constructor'])x.traditions.start('h0',bad);
 x.traditions.handle('ht-start','h0|welcome|evil');
 x.traditions.handle('ht-focus','nothome');
 assert.equal(JSON.stringify(x.state.homeTraditions),pre);
});
test('time travel, forged daily repeats and malformed activities are ignored',()=>{
 const x=fixture();x.traditions.start('player','welcome');
 assert.equal(x.traditions.recordHome('player','player','chat',true,2),false);
 assert.equal(x.traditions.recordHome('player','player','trade',true,1),false);
 assert.equal(x.traditions.recordTrade('bea',3),false);
 assert.equal(x.traditions.recordHome('player','player','chat',true,1).stage,1);
 x.state.day=0;assert.equal(x.traditions.recordTrade('bea'),false);
});
test('book includes seven real home tabs, current progress, focus, memories and eligible actions',()=>{
 const x=fixture();x.traditions.start('h1','welcome');
 x.traditions.recordHome('h1','mabel','chat');x.traditions.board('h1');
 const html=x.last.html;
 assert.equal((html.match(/data-act="ht-view"/g)||[]).length,7);
 assert.match(html,/Chapter 2 of 3/);
 assert.match(html,/Day 1/);
 assert.match(html,/Town-work focus/);
 assert.match(html,/aria-pressed="true"/);
 assert.match(html,/ht-chapters/);
 assert.match(html,/data-act="ht-trades"/);
});
test('completed framed keepsakes render using real Canvas artwork and no external images',()=>{
 const x=fixture();x.traditions.start('player','welcome');x.traditions.recordHome('player','player','chat');
 nextDay(x);x.traditions.recordTrade('bea');nextDay(x);x.traditions.recordHome('player','player','tidy');
 let drawings=0;
 const g={save(){},restore(){},translate(){},beginPath(){},arc(){drawings++},ellipse(){drawings++},
  fillRect(){drawings++},fill(){drawings++},stroke(){drawings++},moveTo(){},quadraticCurveTo(){},lineTo(){}};
 x.traditions.drawWall(g,'player');
 assert.ok(drawings>8);
 drawings=0;x.traditions.drawWall(g,'h3');assert.equal(drawings,0);
 assert.doesNotMatch(read('home-traditions-v2525.js'),/fetch\(|XMLHttpRequest|WebSocket|Image\(/);
});
test('a real completed Bea commission calls progress once; cancel and wrong choices cannot advance',()=>{
 const x=fixture();x.traditions.start('player','welcome');x.traditions.recordHome('player','player','chat');
 x.state.day=2;let notices=0;
 const v=V.setup({...x.callbacks,closeModal:()=>{},isTown:()=>true,
  travelTo:(_a,_b,done)=>done(),openKitchen:()=>{},
  notify:()=>notices++,onCompleted:(id,day)=>x.traditions.recordTrade(id,day)});
 v.start('bea');const wrong=['rose','sage','honey','sky'].find(s=>s!==v.session.offer.sequence[0]);
 v.choose(wrong);
 assert.equal(x.traditions.record.homes.player.welcome.stage,1);
 for(const name of v.session.offer.sequence)v.choose(name);
 assert.equal(v.session,null);
 assert.equal(v.data.totals.bea,1);
 assert.equal(x.traditions.record.homes.player.welcome.stage,2);
 assert.equal(x.state.coins,266,'actual commission costs 6 and pays 22');
 v.start('bea');assert.equal(v.session,null);
 assert.equal(x.traditions.record.homes.player.welcome.stage,2);
});
test('real trade cancellation does not trigger household chapter progress',()=>{
 const x=fixture();x.traditions.start('player','welcome');x.traditions.recordHome('player','player','chat');nextDay(x);
 const v=V.setup({...x.callbacks,isTown:()=>true,travelTo:(_a,_b,done)=>done(),
  openKitchen:()=>{},onCompleted:(id,day)=>x.traditions.recordTrade(id,day)});
 v.start('bea');v.choose(v.session.offer.sequence[0]);v.cancel();
 assert.equal(x.traditions.record.homes.player.welcome.stage,1);
 assert.equal(x.state.coins,250);
});
test('code connects true Daybook, autonomous routines, manual care and hobby studio, never just menu taps',()=>{
 const s=read('game.js');
 for(const token of ["traditions.recordHome('player','player',kind,true,state.day)",
  "traditions.recordHome(activeResidence,n.id,kind,true,state.day)",
  "traditions.recordHome(activeResidence,id,kind,true,state.day)",
  "traditions.recordHome(activeResidence,id,'hobby',true,state.day)",
  "onCompleted:(id,day)=>traditions.recordTrade(id,day)",
  "traditions.comfortBonus(home)",
  "traditions.comfortBonus('player')",
  "traditions.drawWall(ctx,activeResidence)",
  "traditions.drawWall(ctx,'player')"]){assert.ok(s.includes(token),token);}
 assert.match(read('village-trades-v2523.js'),/api\.onCompleted\?\.\(id,world\.day\)/);
});
test('old save key, all twelve recipes and incumbent household systems remain connected',()=>{
 const s=read('game.js'),k=read('kitchen.js');
 assert.match(s,/const SAVE='hearth-harbor-save-v1'/);
 assert.match(s,/homeTraditions:window.HearthHomeTraditions.clean\(raw.homeTraditions\)/);
 assert.match(s,/const traditions=window.HearthHomeTraditions.setup\(/);
 assert.match(s,/HearthHouseholdRhythms.setup/);
 assert.match(s,/HearthHobbyStudio.setup/);
 assert.match(k,/dumplings:\{name:'Little Garden Dumplings'/);
});
test('all new assets load before game and precache for offline iPhone play',()=>{
 const html=read('index.html'),sw=read('sw.js');
 for(const asset of ['home-traditions-v2525.js','home-traditions-v2525.css'])assert.ok(html.includes(asset)&&sw.includes("'./"+asset+"'"));
 assert.ok(html.indexOf('home-traditions-v2525.js')<html.indexOf('game.js'));
 assert.match(sw,/const CACHE='hearth-harbor-v[0-9]+-[a-z-]+'/);
});
test('touch UI has narrow iPhone styles, accessible focus, readable history and reduced motion',()=>{
 const css=read('home-traditions-v2525.css');
 for(const term of ['@media(max-width:390px)','@media(min-width:760px)','button:focus-visible','min-height:48px','touch-action:manipulation','prefers-reduced-motion:reduce'])assert.ok(css.includes(term),term);
 assert.ok(read('village-trades-v2523.css').includes('.vt-next-piece{'));
});

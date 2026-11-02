/* Hearth & Harbor v2.5.27 — real independent household schedules */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const w={window:{}};vm.runInNewContext(read('household-schedules-v2527.js'),w,{filename:'household-schedules-v2527.js'});
const S=w.window.HearthHouseholdSchedules;
function harness(raw=null){
 const state={day:1,coins:275,householdSchedules:S.clean(raw),needs:{fun:75},residentLife:{},householdAuto:{}};
 const where={mabel:'h0',rosie:'h0',oliver:'h1',jun:'h1',bea:'h2',finn:'h2'};
 let saves=0,updates=0,notes=[];
 const callbacks={getState:()=>state,getResidentHome:id=>where[id],
  getHomeMembers:home=>Object.keys(where).filter(id=>where[id]===home),
  getPersonLabel:id=>({mabel:'Mabel',rosie:'Rosie',oliver:'Oliver',jun:'Jun',bea:'Bea',finn:'Finn'})[id],
  notify:m=>notes.push(m),save:()=>saves++,updateUI:()=>updates++};
 const schedules=S.setup(callbacks);
 return {state,where,schedules,callbacks,get saves(){return saves},get updates(){return updates},get notes(){return notes}};
}
function simulator(h,auto={mabel:true,rosie:true}){
 const game=read('game.js'),start=game.indexOf('function updateRoomAutonomy(dt){'),end=game.indexOf('function toggleHouseholdAutonomy(id){',start);
 assert.ok(start>0&&end>start,'test the actual room-autonomy implementation');
 const calls=[],c={
  scene:'residence',activeResidence:'h0',speed:1,modal:null,talk:null,placement:null,controlledResident:null,
  familyTable:{gatheringActive:()=>false},helpingHands:{active:()=>false},hobbyStudio:{active:()=>false},
  roomAutonomy:new Map(),roomResidents:()=>[{id:'mabel'},{id:'rosie'}],
  residentAutoEnabled:id=>auto[id]===true,
  autoRoomPosition:()=>({x:0,y:0}),autoDestination:(_kind,_n,i)=>({x:10+i,y:15+i}),
  residentAutoMode:()=> 'hobby',schedules:h.schedules,
  finishAutonomousAction:(n,kind)=>calls.push([n.id,kind]),Math,Map
 };
 vm.runInNewContext(game.slice(start,end),c,{filename:'game-autonomy-v2527.js'});
 return {c,calls,tick:n=>{for(let i=0;i<n;i++)c.updateRoomAutonomy(1)}};
}
test('legacy saves get an empty safe optional schedule record',()=>{
 assert.equal(JSON.stringify(S.clean(null)),JSON.stringify({plans:{},history:[]}));
 assert.equal(S.PEOPLE.length,6);assert.equal(Object.keys(S.ACTIONS).length,6);
});
test('malformed imported records reject unknown people, invalid actions, dates, locations, and nested objects',()=>{
 const c=S.clean({plans:{
  mabel:{home:'h0',day:1,tasks:['rest','bogus','chat','read','tidy']},
  rosie:{home:'h9',day:1,tasks:['meal']},
  oliver:{home:'h1',day:-1,tasks:['meal']},
  "__proto__":{home:'h0',day:2,tasks:['meal']},
  bea:{home:'h2',day:1,tasks:{0:'rest'}}
 },history:[{actor:'mabel',home:'h0',action:'chat',day:1},
   {actor:'intruder',home:'h0',action:'chat',day:1},{actor:'bea',home:'h0',action:'teleport',day:1}]});
 assert.equal(Object.keys(c.plans).length,1);
 assert.equal(JSON.stringify(c.plans.mabel.tasks),JSON.stringify(['rest','chat','read']));
 assert.equal(c.history.length,1);
});
test('three-step limit is per resident, not per household',()=>{
 const h=harness();
 for(const a of ['rest','meal','read'])assert.equal(h.schedules.add('h0','mabel',a),true);
 assert.equal(h.schedules.add('h0','mabel','tidy'),false);
 assert.equal(h.schedules.add('h0','rosie','chat'),true);
 assert.equal(JSON.stringify(h.schedules.current('h0','mabel')),JSON.stringify(['rest','meal','read']));
 assert.equal(JSON.stringify(h.schedules.current('h0','rosie')),JSON.stringify(['chat']));
 assert.equal(h.saves,4);
 assert.equal(h.state.coins,275);
});
test('planner rejects absent or moved residents and cannot assign to wrong homes',()=>{
 const h=harness();
 assert.equal(h.schedules.add('h5','mabel','rest'),false);
 assert.equal(h.schedules.add('h0','player','rest'),false);
 assert.equal(h.schedules.add('h9','mabel','rest'),false);
 assert.equal(h.schedules.add('h0','fake','rest'),false);
 assert.equal(h.schedules.add('h0','rosie','invalid'),false);
 assert.equal(h.saves,0);
});
test('saved schedule never advances or rewards from merely adding a task',()=>{
 const h=harness();
 h.schedules.add('h0','mabel','tidy');
 assert.equal(h.schedules.data.history.length,0);
 assert.equal(h.state.coins,275);
 assert.equal(h.schedules.peek('h0','mabel'),'tidy');
 assert.equal(h.saves,1);
});
test('completed task is removed only after a matching true action finish',()=>{
 const h=harness();
 h.schedules.add('h0','mabel','read');h.schedules.add('h0','mabel','chat');
 assert.equal(h.schedules.completed('h0','mabel','chat'),false);
 assert.equal(h.schedules.peek('h0','mabel'),'read');
 assert.equal(h.schedules.completed('h0','mabel','read'),true);
 assert.equal(h.schedules.peek('h0','mabel'),'chat');
 assert.equal(h.schedules.data.history.length,1);
 assert.equal(h.schedules.data.history[0].action,'read');
 assert.equal(h.saves,2,'actual action caller saves completion; no extra write');
});
test('finishing the last task deletes queue while retaining honest dated history',()=>{
 const h=harness();h.schedules.add('h0','rosie','hobby');
 assert.equal(h.schedules.completed('h0','rosie','hobby'),true);
 assert.equal(h.schedules.peek('h0','rosie'),null);
 assert.equal(Object.keys(h.schedules.data.plans).length,0);
 assert.equal(h.schedules.data.history[0].day,1);
 assert.equal(h.state.coins,275);
});
test('clearing a resident plan does not clear their roommate’s scheduled work',()=>{
 const h=harness();h.schedules.add('h0','mabel','chat');h.schedules.add('h0','rosie','meal');
 assert.equal(h.schedules.clear('h0','mabel'),true);
 assert.equal(h.schedules.peek('h0','mabel'),null);
 assert.equal(h.schedules.peek('h0','rosie'),'meal');
 assert.equal(h.schedules.clear('h0','mabel'),false);
});
test('undo last removes only last step without affecting the current first step',()=>{
 const h=harness();h.schedules.add('h0','mabel','rest');h.schedules.add('h0','mabel','read');
 assert.equal(h.schedules.removeLast('h0','mabel'),true);
 assert.equal(h.schedules.peek('h0','mabel'),'rest');
 assert.equal(h.schedules.removeLast('h0','mabel'),true);
 assert.equal(h.schedules.removeLast('h0','mabel'),false);
});
test('schedule survives a JSON save/reload and is genuinely day scoped',()=>{
 const h=harness();h.schedules.add('h0','mabel','meal');
 const reload=harness(JSON.parse(JSON.stringify(h.schedules.data)));
 assert.equal(reload.schedules.peek('h0','mabel'),'meal');
 reload.state.day=2;
 assert.equal(reload.schedules.peek('h0','mabel'),null);
 assert.equal(reload.schedules.completed('h0','mabel','meal'),false);
 assert.equal(reload.schedules.add('h0','mabel','read'),true);
 assert.equal(reload.schedules.peek('h0','mabel'),'read');
});
test('moving resident invalidates old home schedule, and cannot complete from new home',()=>{
 const h=harness();h.schedules.add('h0','mabel','chat');
 h.where.mabel='h1';
 assert.equal(h.schedules.peek('h0','mabel'),null);
 assert.equal(h.schedules.peek('h1','mabel'),null);
 assert.equal(h.schedules.completed('h0','mabel','chat'),false);
 assert.equal(h.schedules.add('h1','mabel','read'),true);
 assert.equal(h.schedules.peek('h1','mabel'),'read');
});
test('forged action arguments never mutate schedules or saved state',()=>{
 const h=harness();h.schedules.add('h0','mabel','chat');
 const before=JSON.stringify(h.schedules.data),saved=h.saves;
 for(const id of ['mabel|__proto__','mabel|chat|extra','nobody|read','mabel',''])assert.equal(h.schedules.handle('hp27-add',id,'h0'),false);
 assert.equal(h.schedules.handle('hp27-clear','mabel|extra','h0'),false);
 assert.equal(h.schedules.handle('hp27-undo','nobody','h0'),false);
 assert.equal(h.schedules.handle('hp27-add','mabel|read','fake'),false);
 assert.equal(JSON.stringify(h.schedules.data),before);
 assert.equal(h.saves,saved);
});
test('plan view has two independent residents, six real controls per resident and separate clear buttons',()=>{
 const h=harness();h.schedules.add('h0','mabel','rest');
 const html=h.schedules.panel('h0',null);
 assert.match(html,/Everybody Has a Little Day/);
 assert.match(html,/Mabel/);assert.match(html,/Rosie/);
 assert.equal((html.match(/data-act="hp27-add"/g)||[]).length,12);
 assert.equal((html.match(/data-act="hp27-clear"/g)||[]).length,2);
 assert.match(html,/aria-label="Step 1: Rest"/);
 assert.match(html,/Step 1/);
});
test('currently guided resident shows a clear schedule-pause explanation',()=>{
 const h=harness();h.schedules.add('h0','mabel','read');
 const html=h.schedules.panel('h0','mabel');
 assert.match(html,/Plans pause while you directly guide this resident/);
 assert.match(html,/Independent plan · 0\/3 steps/);
});
test('empty house cannot invent placeholder people',()=>{
 const h=harness();
 assert.match(h.schedules.panel('h5',null),/This home is empty right now/);
 assert.equal((h.schedules.panel('h5',null).match(/data-act="hp27-add"/g)||[]).length,0);
});
test('history stays bounded even after many real scheduled completions',()=>{
 const h=harness();
 for(let d=1;d<=45;d++){h.state.day=d;h.schedules.add('h0','mabel','meal');h.schedules.completed('h0','mabel','meal')}
 assert.equal(h.schedules.data.history.length,24);
 assert.equal(h.schedules.data.history[0].day,22);
 assert.equal(h.schedules.data.history.at(-1).day,45);
});
test('actual room update handles two separately planned residents simultaneously',()=>{
 const h=harness();
 h.schedules.add('h0','mabel','read');h.schedules.add('h0','rosie','meal');
 const sim=simulator(h,{mabel:false,rosie:false});
 sim.tick(9);
 assert.equal(JSON.stringify(sim.calls.sort((a,b)=>a[0].localeCompare(b[0]))),JSON.stringify([['mabel','read'],['rosie','meal']]));
 assert.equal(h.schedules.peek('h0','mabel'),null);
 assert.equal(h.schedules.peek('h0','rosie'),null);
 assert.equal(h.schedules.data.history.length,2);
});
test('planned tasks override casual autonomy and run sequentially before normal routines',()=>{
 const h=harness();h.schedules.add('h0','mabel','tidy');h.schedules.add('h0','mabel','read');
 const sim=simulator(h,{mabel:true,rosie:false});
 sim.tick(17);
 const first=sim.calls.filter(x=>x[0]==='mabel').slice(0,2);
 assert.equal(JSON.stringify(first),JSON.stringify([['mabel','tidy'],['mabel','read']]));
 assert.equal(h.schedules.peek('h0','mabel'),null);
});
test('paused game or modal cannot advance work or finish a plan',()=>{
 const h=harness();h.schedules.add('h0','mabel','rest');const sim=simulator(h,{mabel:false,rosie:false});
 sim.c.speed=0;sim.tick(12);assert.equal(sim.calls.length,0);
 sim.c.speed=1;sim.c.modal='daybook';sim.tick(12);assert.equal(sim.calls.length,0);
 sim.c.modal=null;sim.tick(9);assert.equal(sim.calls.length,1);
});
test('cleared work in motion never pays a ghost completion',()=>{
 const h=harness();h.schedules.add('h0','mabel','read');const sim=simulator(h,{mabel:false,rosie:false});
 sim.tick(4);
 h.schedules.clear('h0','mabel');
 sim.tick(8);
 assert.equal(sim.calls.length,0);
 assert.equal(h.schedules.data.history.length,0);
});
test('time advance mid-task invalidates yesterday’s schedule without paying it',()=>{
 const h=harness();h.schedules.add('h0','mabel','meal');const sim=simulator(h,{mabel:false,rosie:false});
 sim.tick(4);h.state.day=2;sim.tick(8);
 assert.equal(sim.calls.length,0);assert.equal(h.schedules.data.history.length,0);
});
test('full game connects optional schedules to real in-room movement and completion guards',()=>{
 const g=read('game.js');
 for(const a of ["window.HearthHouseholdSchedules.clean(raw.householdSchedules)",
  "window.HearthHouseholdSchedules.setup({",
  "schedules.peek(activeResidence,id)","schedules.completed(activeResidence,id,r.action)",
  "if(action==='hp27-board')","schedules.handle(action,id,activeResidence)",
  "btn('🗓️ Plan everyone’s day','hp27-board')",
  "residentAutoEnabled(n.id)||r.planned"])assert.ok(g.includes(a),a);
 assert.match(g,/function finishAutonomousAction\(n,kind\)/);
 assert.match(g,/function runHouseholdAction\(id,kind\)/);
});
test('original save, kitchen, and household roles and traditions remain compatible',()=>{
 const g=read('game.js');
 assert.match(g,/const SAVE='hearth-harbor-save-v1'/);
 assert.match(g,/HearthHouseholdRoles.clean\(raw.householdRoles\)/);
 assert.match(g,/HearthHomeTraditions.clean\(raw.homeTraditions\)/);
 assert.match(g,/const HOUSEHOLD|const HOME_ACTIONS=/);
 assert.doesNotMatch(read('household-schedules-v2527.js'),/fetch\(|XMLHttpRequest|WebSocket|\.coins\s*[+=]|localStorage/);
});
test('offline worker loads schedules before the game and supports narrow phones and reduced motion',()=>{
 const html=read('index.html'),sw=read('sw.js'),css=read('household-schedules-v2527.css');
 for(const file of ['household-schedules-v2527.js','household-schedules-v2527.css'])assert.ok(html.includes(file)&&sw.includes("'./"+file+"'"));
 assert.ok(html.indexOf('household-schedules-v2527.js')<html.indexOf('game.js'));
 assert.match(sw,/hearth-harbor-v2527-household-schedules/);
 for(const token of ['@media(max-width:390px)','touch-action:manipulation','button:focus-visible','prefers-reduced-motion:reduce'])
  assert.ok(css.includes(token),token);
});

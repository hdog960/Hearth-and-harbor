/* Hearth & Harbor v2.5.28 — Daybook Baton manual-routine handoff QA */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const context={window:{}};vm.runInNewContext(read('manual-daybooks-v2528.js'),context,{filename:'manual-daybooks-v2528.js'});
const D=context.window.HearthManualDaybooks;
function fixture(seed,opts={}){
 const state={day:1,coins:250,manualDaybooks:D.clean(seed),...opts};
 const location={mabel:'h0',rosie:'h0',oliver:'h1',jun:'h1',bea:'h2',finn:'h2'};
 const callbacks={getState:()=>state,getResidentHome:id=>location[id],
  getHomeMembers:home=>Object.keys(location).filter(id=>location[id]===home),
  getPersonLabel:id=>({mabel:'Mabel',rosie:'Rosie',oliver:'Oliver',jun:'Jun',bea:'Bea',finn:'Finn'})[id]||id};
 const book=D.setup(callbacks);return {state,location,book,callbacks};
}
const json=x=>JSON.stringify(x);
const game=()=>read('game.js');
function block(start,next){
 const s=game(),a=s.indexOf(start),b=s.indexOf(next,a+start.length);
 assert.ok(a>=0&&b>a,'actual game function exists: '+start);
 return s.slice(a,b);
}
function direct(h){
 let saves=0,notices=[],targets=[],updates=0,closes=0;
 const c={scene:'residence',activeResidence:'h0',controlledResident:null,
  householdCurrent:null,householdQueue:[],householdHold:null,householdBusy:false,
  roomAutonomy:new Map(),player:{x:0,y:0,target:null,facing:'back'},
  manualDaybooks:h.book,roomResidents:()=>[{id:'mabel'},{id:'rosie'}],
  roomPositions:()=>[{x:580,y:690},{x:729,y:740}],
  NPCS:[{id:'mabel',name:'Mabel'},{id:'rosie',name:'Rosie'}],
  updateRoutineStrip:()=>{},updateUI:()=>updates++,save:()=>saves++,
  closeModal:()=>closes++,notify:t=>notices.push(t),
  nextHouseholdAction:()=>{const kind=c.householdQueue.shift();c.householdCurrent=kind||null;
   c.householdBusy=!!kind;c.manualDaybooks.remember(c.activeResidence,c.controlledResident,kind,c.householdQueue);targets.push(kind);},
  stopRoutine:preserve=>{if(!preserve&&c.controlledResident)h.book.clear(c.activeResidence,c.controlledResident);c.householdHold=null;c.householdQueue=[];c.householdBusy=false;c.householdCurrent=null;c.player.target=null}
 };
 vm.runInNewContext(block('function selectHouseholdResident(id){','function residentDayRecord(id){'),c,{filename:'game-daybook-handoff.js'});
 return {c,targets,get saves(){return saves},get notices(){return notices},get closes(){return closes},get updates(){return updates}};
}
test('legacy save creates a clean optional plan record with six known resident IDs',()=>{
 const h=fixture(null);
 assert.equal(json(h.book.data),json({plans:{}}));
 assert.equal(D.PEOPLE.length,6);assert.equal(D.HOMES.length,6);assert.equal(D.ACTIONS.length,6);
});
test('malformed imported manual plans are sanitized by actor, home, day and action name',()=>{
 const a=D.clean({plans:{
  mabel:{home:'h0',day:1,tasks:['read','bogus','meal',null,'chat','tidy','rest']},
  rosie:{home:'h7',day:1,tasks:['read']},
  oliver:{home:'h1',day:10000,tasks:['meal']},
  bea:{home:'h2',day:2,tasks:{0:'chat'}},
  intruder:{home:'h0',day:1,tasks:['rest']}
 }});
 assert.equal(Object.keys(a.plans).length,1);
 assert.equal(json(a.plans.mabel.tasks),json(['read','meal','chat','tidy']));
});
test('player is not an eligible manual resident, preserving her own established Daybook',()=>{
 const h=fixture();
 assert.equal(h.book.eligible('h0','player'),false);
 assert.equal(h.book.remember('h0','player','rest',['chat']),false);
 assert.equal(h.book.get('h0','player').length,0);
});
test('remember captures one in-progress task and three waiting tasks without duplicating current',()=>{
 const h=fixture();
 assert.equal(h.book.remember('h0','mabel','read',['meal','chat','tidy']),true);
 assert.equal(json(h.book.get('h0','mabel')),json(['read','meal','chat','tidy']));
 assert.equal(h.book.remember('h0','mabel','read',['meal','chat','tidy']),false);
 assert.equal(Object.keys(h.book.data.plans).length,1);
});
test('more than four imported activities cannot expand the single resident queue',()=>{
 const h=fixture();
 h.book.remember('h0','rosie','meal',['chat','read','tidy','rest','hobby','read']);
 assert.equal(json(h.book.get('h0','rosie')),json(['meal','chat','read','tidy']));
});
test('a completed manual activity consumes the front only, not its roommate or later steps',()=>{
 const h=fixture();
 h.book.remember('h0','mabel','read',['meal']);
 h.book.remember('h0','rosie','tidy',[]);
 assert.equal(h.book.finish('h0','mabel','meal'),false);
 assert.equal(h.book.finish('h0','mabel','read'),true);
 assert.equal(json(h.book.get('h0','mabel')),json(['meal']));
 assert.equal(json(h.book.get('h0','rosie')),json(['tidy']));
 assert.equal(h.book.finish('h0','mabel','meal'),true);
 assert.equal(h.book.finish('h0','mabel','meal'),false);
});
test('clearing one resident never deletes the other resident’s plan',()=>{
 const h=fixture();
 h.book.remember('h0','mabel','read',['chat']);h.book.remember('h0','rosie','meal',[]);
 assert.equal(h.book.clear('h0','mabel'),true);assert.equal(h.book.clear('h0','mabel'),false);
 assert.equal(h.book.get('h0','mabel').length,0);
 assert.equal(json(h.book.get('h0','rosie')),json(['meal']));
});
test('plans survive JSON local-save round-trip without duplicating tasks or needs',()=>{
 const h=fixture();h.book.remember('h0','mabel','rest',['read','hobby']);
 const saved=JSON.parse(JSON.stringify(h.state.manualDaybooks));
 const reloaded=fixture(saved,{coins:250});
 assert.equal(json(reloaded.book.get('h0','mabel')),json(['rest','read','hobby']));
 assert.equal(reloaded.state.coins,250);
 assert.equal(reloaded.book.finish('h0','mabel','rest'),true);
 assert.equal(json(reloaded.book.get('h0','mabel')),json(['read','hobby']));
});
test('stale day plans expire without granting completed activities or money',()=>{
 const h=fixture();h.book.remember('h0','mabel','read',['tidy']);
 h.state.day=2;
 assert.equal(h.book.get('h0','mabel').length,0);
 assert.equal(h.book.finish('h0','mabel','read'),false);
 assert.equal(h.state.coins,250);
 h.book.remember('h0','mabel','chat',[]);
 assert.equal(json(h.book.get('h0','mabel')),json(['chat']));
});
test('moving a resident invalidates the former home’s manual queue',()=>{
 const h=fixture();h.book.remember('h0','mabel','meal',['chat']);
 h.location.mabel='h1';
 assert.equal(h.book.get('h0','mabel').length,0);assert.equal(h.book.get('h1','mabel').length,0);
 assert.equal(h.book.finish('h0','mabel','meal'),false);
 assert.equal(h.book.remember('h1','mabel','read',[]),true);
 assert.equal(json(h.book.get('h1','mabel')),json(['read']));
});
test('suspending one resident during a timed hold hands current and waiting tasks to storage',()=>{
 const h=fixture(),d=direct(h);
 d.c.selectHouseholdResident('mabel');d.c.householdCurrent='read';d.c.householdQueue=['meal','chat'];
 d.c.householdHold={kind:'read',remaining:1.2,duration:3.8};d.c.player.target={x:14};
 d.c.selectHouseholdResident('rosie');
 assert.equal(d.c.controlledResident,'rosie');assert.equal(d.c.householdHold,null);
 assert.equal(d.c.player.target,null);
 assert.equal(json(h.book.get('h0','mabel')),json(['read','meal','chat']));
 assert.equal(h.state.coins,250);
});
test('switching back to a resident resumes the original front action in its original order',()=>{
 const h=fixture(),d=direct(h);
 d.c.selectHouseholdResident('mabel');d.c.householdCurrent='read';d.c.householdQueue=['meal'];
 d.c.selectHouseholdResident('rosie');
 d.c.selectHouseholdResident('mabel');
 assert.equal(d.c.controlledResident,'mabel');
 assert.equal(d.c.householdCurrent,'read');
 assert.equal(json(d.c.householdQueue),json(['meal']));
 assert.equal(json(h.book.get('h0','mabel')),json(['read','meal']));
 assert.equal(d.targets.at(-1),'read');
});
test('switching to a resident already being guided does not restart their active hold',()=>{
 const h=fixture(),d=direct(h);
 d.c.selectHouseholdResident('mabel');d.c.householdHold={kind:'read',remaining:2,duration:3.8};
 const before=d.saves;
 d.c.selectHouseholdResident('mabel');
 assert.equal(d.c.householdHold.remaining,2);
 assert.equal(d.saves,before);
 assert.ok(d.closes>=2);
});
test('stopping direct control saves the resident’s Daybook for return without bonus rewards',()=>{
 const h=fixture(),d=direct(h);
 d.c.selectHouseholdResident('rosie');d.c.householdCurrent='tidy';d.c.householdQueue=['hobby'];
 d.c.stopGuidingResident();
 assert.equal(d.c.controlledResident,null);
 assert.equal(json(h.book.get('h0','rosie')),json(['tidy','hobby']));
 assert.equal(d.c.householdHold,null);assert.equal(h.state.coins,250);
 d.c.selectHouseholdResident('rosie');
 assert.equal(d.c.householdCurrent,'tidy');
});
test('separate saved plans for two people remain independent across multiple switches',()=>{
 const h=fixture(),d=direct(h);
 d.c.selectHouseholdResident('mabel');d.c.householdCurrent='read';d.c.householdQueue=['chat'];
 d.c.selectHouseholdResident('rosie');d.c.householdCurrent='meal';d.c.householdQueue=['tidy'];
 d.c.selectHouseholdResident('mabel');assert.equal(json(h.book.get('h0','rosie')),json(['meal','tidy']));
 d.c.selectHouseholdResident('rosie');assert.equal(json(h.book.get('h0','mabel')),json(['read','chat']));
 assert.equal(d.targets.filter(x=>x==='read').length>=1,true);
});
test('the actual manual queue function saves work as soon as it is added, before completion',()=>{
 const h=fixture(),targets=[],c={scene:'residence',activeResidence:'h0',controlledResident:'mabel',
  householdBusy:false,householdCurrent:null,householdQueue:[],
  HOME_ACTIONS:{read:{icon:'📚',name:'Read',spot:[300,400]},chat:{icon:'💗',name:'Chat',spot:[700,500]}},
  manualDaybooks:h.book,save:()=>targets.push('saved'),updateRoutineStrip:()=>{},notify:()=>{},
  nearestWalkable:p=>p,goTo:(pos,cb)=>targets.push(pos),householdHold:null};
 vm.runInNewContext(block('function queueHouseholdAction(kind){','function residenceRoomMenu(){'),c);
 c.queueHouseholdAction('read');c.queueHouseholdAction('chat');
 assert.equal(json(h.book.get('h0','mabel')),json(['read','chat']));
 assert.equal(c.householdCurrent,'read');
 assert.equal(c.householdQueue.length,1);
 assert.equal(targets.filter(x=>x==='saved').length,2);
 assert.equal(targets.some(x=>typeof x==='object'),true,'actual in-room walk started');
});
test('the actual stopRoutine function deletes an intentional interruption without rewards',()=>{
 const h=fixture(),c={scene:'residence',activeResidence:'h0',controlledResident:'mabel',manualDaybooks:h.book,
  householdHold:{kind:'chat'},householdQueue:['meal'],householdCurrent:'read',
  householdBusy:true,player:{target:{x:1}},updateRoutineStrip:()=>{},save:()=>{c.saved=(c.saved||0)+1}};
 h.book.remember('h0','mabel','read',['meal']);
 vm.runInNewContext(block('function stopRoutine(preserve=false){','// v2.3.3:'),c);
 c.stopRoutine();
 assert.equal(h.book.get('h0','mabel').length,0);assert.equal(c.householdHold,null);
 assert.equal(c.householdQueue.length,0);assert.equal(c.saved,1);
});
test('a preserve-only pause does not erase a suspended resident’s plan',()=>{
 const h=fixture(),c={scene:'residence',activeResidence:'h0',controlledResident:'mabel',manualDaybooks:h.book,
  householdHold:{kind:'chat'},householdQueue:['meal'],householdCurrent:'read',
  householdBusy:true,player:{target:{x:1}},updateRoutineStrip:()=>{},save:()=>{throw Error('preserve is not a cancel')}};
 h.book.remember('h0','mabel','read',['meal']);
 vm.runInNewContext(block('function stopRoutine(preserve=false){','// v2.3.3:'),c);
 c.stopRoutine(true);
 assert.equal(json(h.book.get('h0','mabel')),json(['read','meal']));
 assert.equal(c.householdHold,null);
});
test('a real finished manual Daybook action clears only its matching step in the original game',()=>{
 const h=fixture();h.book.remember('h0','mabel','read',['meal']);
 let saves=0,awards=0;
 const resident={needs:{fun:22,energy:55,social:30,food:40}};
 const day={done:[]};
 const c={HOME_ACTIONS:{read:{boost:{fun:19,energy:-3},icon:'📚',desc:'A nice chapter'}},
  scene:'residence',controlledResident:'mabel',activeResidence:'h0',
  lifeFor:()=>resident,residentDayRecord:()=>day,homeComfort:()=>30,clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),
  hasFavoriteFurnishing:()=>false,NPCS:[{id:'mabel',name:'Mabel'}],roomResidents:()=>[{id:'mabel'}],
  state:{needs:{social:65},householdFunds:{}},homeAspirations:{recordAction:()=>awards++},
  traditions:{recordHome:()=>{}},householdRoles:{complete:()=>{}},functionalHomes:{reward:()=>{}},
  manualDaybooks:h.book,householdRhythms:{complete:()=>{}},roommateProjects:{recordAction:()=>{}},personalCorners:{recordAction:()=>{}},mentorship:{completed:()=>{}},careCircles:{completed:()=>{}},lifeSeasons:{completed:()=>{},wisdom:()=>{}},heirlooms:{completed:()=>{}},familyPortraits:{completed:()=>{}},chronicle:{collect:()=>{}},notify:()=>{},save:()=>saves++,updateUI:()=>{}};
 vm.runInNewContext(block('function runHouseholdAction(id,kind){','function queueHouseholdAction(kind){'),c);
 assert.equal(h.book.get('h0','mabel')[0],'read');
 c.runHouseholdAction('mabel','read');
 assert.equal(json(h.book.get('h0','mabel')),json(['meal']));
 assert.equal(day.done.length,1);assert.equal(awards,1);assert.equal(saves,1);
 c.runHouseholdAction('mabel','read');
 assert.equal(awards,1,'repeating the same activity cannot mint another once-per-day bonus');
 assert.equal(json(h.book.get('h0','mabel')),json(['meal']));
});
test('the Daybook summary shows only the correct household’s pending activities',()=>{
 const h=fixture();h.book.remember('h0','mabel','read',['meal']);h.book.remember('h1','oliver','tidy',[]);
 const html=h.book.summary('h0');
 assert.match(html,/Saved Daybook Routines/);assert.match(html,/Mabel/);
 assert.doesNotMatch(html,/Oliver/);assert.match(html,/2 unfinished/);
 assert.match(html,/tap their name to resume/);
});
test('no DOM injection is possible through the imported resident name in the summary',()=>{
 const h=fixture();h.book.remember('h0','mabel','read',[]);
 h.callbacks.getPersonLabel=()=>'<img onerror=alert(1)>';
 const html=h.book.summary('h0');assert.doesNotMatch(html,/<img/);
 assert.match(html,/&lt;img/);
});
test('the game integrates same-day saves and preserves pending plans on room transitions',()=>{
 const s=game();
 for(const term of [
  "window.HearthManualDaybooks.clean(raw.manualDaybooks)",
  "window.HearthManualDaybooks.setup({",
  "if(controlledResident)manualDaybooks.remember(activeResidence,controlledResident,householdCurrent,householdQueue);",
  "if(controlledResident)manualDaybooks.remember(home,controlledResident,householdCurrent,householdQueue);",
  "stopRoutine(true);controlledResident=null",
  "manualDaybooks.finish(activeResidence,id,kind)",
  "manualDaybooks.remember(activeResidence,controlledResident,householdCurrent,householdQueue);save();",
  "manualDaybooks.summary(activeResidence)"
 ])assert.ok(s.includes(term),term);
});
test('Poppy’s personal queue, autonomous schedules, relationships, and the old save key remain intact',()=>{
 const s=game();
 for(const term of ["const SAVE='hearth-harbor-save-v1'","const schedules=window.HearthHouseholdSchedules.setup",
  "householdRoles:window.HearthHouseholdRoles.clean","homeTraditions:window.HearthHomeTraditions.clean",
  "function queueOwnHomeAction(kind){","function updateRoomAutonomy(dt){"])assert.ok(s.includes(term),term);
 assert.doesNotMatch(read('manual-daybooks-v2528.js'),/fetch\(|WebSocket|XMLHttpRequest|localStorage|\.coins\s*[+=]/);
});
test('manual Daybooks fully preload offline and have a phone-responsive decorative UI',()=>{
 const html=read('index.html'),sw=read('sw.js'),css=read('manual-daybooks-v2528.css');
 for(const file of ['manual-daybooks-v2528.js','manual-daybooks-v2528.css'])
  assert.ok(html.includes(file)&&sw.includes("'./"+file+"'"));
 assert.ok(html.indexOf('manual-daybooks-v2528.js')<html.indexOf('game.js'));
 assert.match(sw,/const CACHE='hearth-harbor-v[0-9]+-[a-z-]+'/);
 for(const token of ['@media(max-width:390px)','prefers-reduced-motion:reduce','.db28-person{','.db28-book{'])assert.ok(css.includes(token),token);
 assert.match(html,/<title>Hearth & Harbor · [^<]+ v2\.(?:5\.\d+|6\.\d+|7\.\d+)<\/title>/);
});

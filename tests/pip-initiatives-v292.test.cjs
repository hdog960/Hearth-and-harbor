/* Hearth & Harbor v2.9.2 — Pip's own little ideas, earned only in real play */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),
 fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const env={window:{}};
for(const f of ['pip-home-help-v276.js','pip-initiatives-v292.js'])
 vm.runInNewContext(read(f),env,{filename:f});
const P=env.window.HearthPipInitiatives,H=env.window.HearthPipHomeHelp;
const plain=x=>JSON.parse(JSON.stringify(x));
const K=P.KINDS;
function fixture({day=10,minute=800,guardian=true,scene='home',interest='read',
 records=[],leadDays=0,learnDays=0,disabled=[],blocked=false}={}){
 const child={guardian:guardian?'player':null,guardianDay:guardian?3:0,
  needs:{joy:55,confidence:50,curiosity:58},
  childInitiatives:{records:plain(records),leadDays,learnDays}};
 const state={day,minute,youngResidents:{pip:child},coins:600,relations:{jun:30}};
 let where=scene,busy=false,other=false,blockedFloor=blocked,
  selected=interest,modal=null,hold=null,saves=0,updates=0,queued=[],queueOK=true,
  player={x:650,y:760},pip={x:680,y:785},done=new Set(disabled);
 const notes=[];
 const walkable=(x,y)=>!blockedFloor&&Number.isFinite(x)&&Number.isFinite(y);
 const api={getState:()=>state,getChild:()=>child,getScene:()=>where,
  getPlayer:()=>({...player}),getChildPosition:()=>({...pip}),
  getInterest:()=>({kind:selected}),ownDone:k=>done.has(k),
  isOwnRoutineBusy:()=>busy,queueOwnAction:k=>{if(!queueOK)return false;queued.push(k);busy=true;return true},
  isOtherFamilyActivity:()=>other,getHold:()=>hold,
  nearestWalkable:p=>!blockedFloor?{...p}:null,
  isWalkable:(x,y)=>walkable(x,y),
  showModal:(name,html)=>modal={name,html},closeModal:()=>modal=null,
  openBook:()=>{modal={name:'book',html:'Daybook'};return true},
  save:()=>saves++,updateUI:()=>updates++,notify:s=>notes.push(s)};
 const m=P.setup(api);
 return {m,api,state,child,notes,queued,get modal(){return modal},
  get saves(){return saves},get updates(){return updates},
  setScene:s=>where=s,setMinute:n=>state.minute=n,setDay:n=>state.day=n,
  setInterest:k=>selected=k,setPlayer:(x,y)=>player={x,y},
  setPip:(x,y)=>pip={x,y},setBusy:x=>busy=x,setOther:x=>other=x,
  setBlocked:x=>blockedFloor=x,setQueueOK:x=>queueOK=x,
  setDone:(k,b=true)=>{if(b)done.add(k);else done.delete(k)},
  setHold:x=>hold=x,
  completeReal(kind,once=true){
   done.add(kind);const at=m.spot(kind);
   if(at){player={x:at.x+12,y:at.y+20};pip={x:at.x,y:at.y}}
   hold=null;return m.completed(kind,once,state.day)
  }};
}
test('all four child-authored ideas have distinct writing, work and personal consequences',()=>{
 assert.deepEqual(plain(K),['read','tidy','meal','hobby']);
 for(const k of K){const s=P.STORIES[k];assert.ok(H.TASKS[k]);assert.ok(s.name);
  assert.ok(s.intro.length>40);assert.notEqual(s.lead,s.learn);assert.equal(s.outcome.length,2)}
 assert.equal(new Set(K.map(k=>P.STORIES[k].name)).size,4);
});
test('unclaimed guardianship cannot initiate a new fictitious family scene',()=>{
 const f=fixture({guardian:false});
 assert.equal(f.m.ready(),false);assert.equal(f.m.request(),false);
 assert.equal(f.m.panel(),'');assert.equal(f.saves,0);
});
test('child suggestions are afternoon events, not automatic overnight jobs',()=>{
 for(const minute of [0,360,659,1050,1400]){
  const f=fixture({minute});assert.equal(f.m.ready(),false);
  assert.equal(f.m.request(),false);
 }
 assert.equal(fixture({minute:660}).m.ready(),true);
});
test('nearby is necessary to open an idea, not to have an idea in the first place',()=>{
 const f=fixture();f.setPlayer(1300,1350);
 assert.equal(f.m.ready(),false);
 assert.equal(f.m.canOffer(),true,'Pip may plan to approach Poppy while far away');
 f.setOther(true);assert.equal(f.m.canOffer(),false);
});

test('a real in-world conversation requires Poppy close to Pip',()=>{
 const f=fixture();f.setPlayer(1400,1300);
 assert.equal(f.m.ready(),false);assert.equal(f.m.request(),false);
 f.setPlayer(650,760);assert.equal(f.m.ready(),true);
});
test('proposed activity follows actual earned reading preference rather than a random reward',()=>{
 const f=fixture({day:10,interest:'read'});
 assert.equal(f.m.category(),'read');assert.equal(f.m.request(),true);
 assert.match(f.modal.html,/A story to share/);
 assert.match(f.modal.html,/favorite things/);
});
test('Pip occasionally asks to explore another genuine activity instead of being scripted',()=>{
 const f=fixture({day:12,interest:'read'});
 assert.equal(f.m.category(),K[(12+1)%4]);
});
test('already used Poppy chores are not requested again on the same day',()=>{
 const f=fixture({day:10,interest:'read',disabled:['read']});
 assert.notEqual(f.m.category(),'read');
 for(const k of K)f.setDone(k);
 assert.equal(f.m.category(),null);assert.equal(f.m.request(),false);
});
test('a real family visit, timed activity or blocked house takes priority',()=>{
 const f=fixture();f.setOther(true);
 assert.equal(f.m.ready(),false);
 f.setOther(false);f.setBusy(true);assert.equal(f.m.ready(),false);
 f.setBusy(false);f.setBlocked(true);assert.equal(f.m.ready(),false);
});
test('the request itself is a child-authored choice, not a new save or instant needs boost',()=>{
 const f=fixture(),before=plain(f.child);
 assert.equal(f.m.request(),true);
 assert.match(f.modal.html,/pi292-choose/);
 assert.match(f.modal.html,/Let Pip take the lead/);
 assert.match(f.modal.html,/Show Pip how/);
 assert.deepEqual(plain(f.child),before);assert.equal(f.saves,0);
});
test('the player may decline the idea and still talk to Pip again today',()=>{
 const f=fixture();f.m.request();assert.equal(f.m.cancel(),true);
 assert.equal(f.m.prompt,null);assert.equal(f.saves,0);
 assert.equal(f.m.ready(),true);
});
test('Poppy can open Pip’s existing Daybook without accepting work',()=>{
 const f=fixture();f.m.request();
 assert.equal(f.m.handle('pi292-daybook'),true);
 assert.equal(f.modal.name,'book');assert.equal(f.saves,0);
 assert.equal(f.m.pending,null);
});
test('a deliberate choice queues Poppy’s ORIGINAL household action, not a virtual completion',()=>{
 const f=fixture();f.m.request();
 assert.equal(f.m.choose(0),true);
 assert.equal(f.queued.length,1);
 assert.equal(f.queued[0],'read');
 assert.deepEqual(plain(f.m.pending),{day:10,kind:'read',choice:0});
 assert.equal(f.child.childInitiatives.records.length,0);
 assert.equal(f.saves,0);assert.equal(f.state.coins,600);
});
test('invalid choices and malformed input cannot be used to earn new relationship points',()=>{
 const f=fixture();f.m.request();
 for(const choice of [-1,2,NaN,'0',null])assert.equal(f.m.choose(choice),false);
 assert.equal(f.queued.length,0);assert.equal(f.saves,0);
});
test('a full queue cleanly rejects the plan without leaving a phantom child request',()=>{
 const f=fixture();f.m.request();f.setQueueOK(false);
 assert.equal(f.m.choose(0),false);
 assert.equal(f.m.pending,null);assert.equal(f.child.childInitiatives.records.length,0);
 assert.equal(f.saves,0);
});
test('Pip physically heads to the actual household furniture after asking',()=>{
 const f=fixture();const original={x:720,y:800,label:'Creative afternoon',prop:'crayon'};
 f.m.request();f.m.choose(0);
 const destination=f.m.schedule(original),at=f.m.spot('read');
 assert.equal(destination.x,at.x);assert.equal(destination.y,at.y);
 assert.equal(destination.prop,'book');
 assert.match(destination.label,/Pip’s idea/);
 assert.equal(original.x,720);
});
test('the child is not granted a fake destination when custom furniture blocks the room',()=>{
 const f=fixture();f.m.request();f.m.choose(0);
 f.setBlocked(true);
 const base={x:720,y:800};assert.equal(f.m.schedule(base),base);
 assert.equal(f.completeReal('read',true),false);
 assert.equal(f.saves,0);
});
test('a genuine timed completion must be once=true, exact kind and exact game day',()=>{
 for(const variant of ['again','wrong','wrongday']){
  const f=fixture();f.m.request();f.m.choose(0);
  const kind=variant==='wrong'?'meal':'read';
  const once=variant==='again'?false:true;
  if(variant==='wrongday')f.setDay(11);
  assert.equal(f.completeReal(kind,once),false);
  assert.equal(f.saves,0);assert.equal(f.child.childInitiatives.records.length,0);
 }
});
test('activity time has to include Pip physically at the proper furniture',()=>{
 const f=fixture();f.m.request();f.m.choose(1);
 f.setDone('read');f.setPip(1400,1300);
 assert.equal(f.m.completed('read',true,10),false);
 assert.equal(f.saves,0);assert.equal(f.child.childInitiatives.records.length,0);
});
test('successful child-led activity records one true date and only +4 confidence',()=>{
 const f=fixture();f.m.request();f.m.choose(0);
 assert.equal(f.completeReal('read',true),true);
 assert.deepEqual(plain(f.child.childInitiatives.records),[{day:10,kind:'read',choice:0}]);
 assert.equal(f.child.childInitiatives.leadDays,1);
 assert.equal(f.child.childInitiatives.learnDays,0);
 assert.equal(f.child.needs.confidence,54);
 assert.equal(f.child.needs.curiosity,58);
 assert.equal(f.state.coins,600);
 assert.equal(f.saves,1);assert.equal(f.updates,1);
});
test('successful Poppy-taught session changes Pip’s actual curiosity without extra coins',()=>{
 const f=fixture();f.m.request();f.m.choose(1);
 assert.equal(f.completeReal('read',true),true);
 assert.equal(f.child.childInitiatives.learnDays,1);
 assert.equal(f.child.needs.curiosity,62);
 assert.equal(f.child.needs.confidence,50);
 assert.equal(f.state.coins,600);
});
test('every separate type of child-initiated routine has a matching real furniture action',()=>{
 for(const kind of K){
  // Force this genuine interest through a day whose variety pick is off.
  const f=fixture({day:10,interest:kind});
  assert.equal(f.m.category(),kind);
  f.m.request();f.m.choose(1);
  assert.equal(f.completeReal(kind,true),true,kind);
  assert.equal(f.child.childInitiatives.records[0].kind,kind);
 }
});
test('same-day repeated callbacks cannot farm confidence or overwrite a child choice',()=>{
 const f=fixture();f.m.request();f.m.choose(0);f.completeReal('read',true);
 const old=plain(f.child);
 assert.equal(f.m.completed('read',true,10),false);
 assert.equal(f.m.request(),false);
 assert.deepEqual(plain(f.child),old);assert.equal(f.saves,1);
});
test('crossing a day or exiting the cottage cancels a pending request with no reward',()=>{
 const f=fixture();f.m.request();f.m.choose(0);f.setDay(11);f.m.advance();
 assert.equal(f.m.pending,null);
 assert.equal(f.saves,0);
 const g=fixture();g.m.request();g.m.choose(0);g.setScene('town');g.m.advance();
 assert.equal(g.m.pending,null);assert.equal(g.saves,0);
});
test('genuinely repeated trust builds a lasting different response to Pip’s initiative',()=>{
 const old=[{day:4,kind:'read',choice:0},{day:5,kind:'hobby',choice:0},{day:6,kind:'tidy',choice:0}];
 const f=fixture({records:old,leadDays:3,day:10});assert.equal(f.m.request(),true);
 assert.match(f.modal.html,/little more confident/);
 assert.equal(f.saves,0);
});
test('later Poppy coaching develops a different family memory without inventing adult ties',()=>{
 const old=[{day:4,kind:'read',choice:1},{day:5,kind:'hobby',choice:1},{day:6,kind:'tidy',choice:1}];
 const f=fixture({records:old,learnDays:3,day:10});f.m.request();
 assert.match(f.modal.html,/patiently Poppy has taught/);
 assert.equal(f.state.relations.jun,30);
});
test('older saves and manipulated histories sanitize invalid, duplicate and pre-guardian entries',()=>{
 const history={records:[{day:1,kind:'read',choice:0},
  {day:4,kind:'meal',choice:0},{day:4,kind:'hobby',choice:1},
  {day:5,kind:'wrong',choice:1},{day:6,kind:'tidy',choice:'0'},
  {day:9,kind:'hobby',choice:1}],leadDays:5000,learnDays:-1};
 const out=plain(P.clean(history,3));
 assert.deepEqual(out.records,[{day:4,kind:'meal',choice:0},{day:9,kind:'hobby',choice:1}]);
 assert.equal(out.leadDays,1);assert.equal(out.learnDays,1);
 assert.deepEqual(plain(P.clean(null,3)),{records:[],leadDays:0,learnDays:0});
});
test('the last 40 true dates and cumulative counts survive a long childhood safely',()=>{
 const raw={records:Array.from({length:48},(_,i)=>({day:i+5,kind:K[i%4],choice:i%2})),
  leadDays:24,learnDays:24};
 const clean=plain(P.clean(raw,3));
 assert.equal(clean.records.length,40);
 assert.equal(clean.leadDays,24);assert.equal(clean.learnDays,24);
});
test('a child-shaped in-world hint appears only when a genuine possible idea exists',()=>{
 const f=fixture(),calls=[];
 const g={save(){},restore(){},fillStyle:null,fillRect(...a){calls.push(a)}};
 assert.equal(f.m.drawHint(g,{x:680,y:785},0),true);
 assert.ok(calls.length>=4);
 f.m.request();
 assert.equal(f.m.drawHint(g,{x:680,y:785},0),false);
});
test('the actual timed household hold renders distinct original child-led hand art',()=>{
 const f=fixture();f.m.request();f.m.choose(0);
 const p=f.m.spot('read'),rects=[];
 const g={save(){},restore(){},fillStyle:null,fillRect(...a){rects.push(a)}};
 assert.equal(f.m.drawDuringHold(g,p,0),false);
 f.setHold({kind:'read',remaining:2,duration:3.8});
 assert.equal(f.m.drawDuringHold(g,p,0),true);
 assert.ok(rects.length>=4);
 assert.equal(f.m.drawDuringHold(g,{x:1000,y:1000},0),false);
});
test('phone source uses existing real 3.8s action and child world tap, no new navigation tab',()=>{
 const html=read('index.html'),sw=read('sw.js'),game=read('game.js'),
  little=read('little-sprouts-v272.js'),css=read('pip-initiatives-v292.css');
 assert.ok(html.includes('pip-initiatives-v292.js?v=2.9.3'));
 assert.ok(html.includes('pip-initiatives-v292.css?v=2.9.2'));
 assert.ok(html.indexOf('pip-initiatives-v292.js')<html.indexOf('little-sprouts-v272.js'));
 for(const f of ['pip-initiatives-v292.js','pip-initiatives-v292.css'])
  assert.ok(sw.includes("'./"+f+"'"));
 assert.match(sw,/hearth-harbor-v293-pip-comes-to-you/);
 assert.match(game,/littleSprouts\.initiatives\.completed\(kind,once,state\.day\)/);
 assert.match(game,/if\(!littleSprouts\.initiatives\.request\(\)\)littleSprouts\.entry\(\)/);
 assert.match(game,/householdHold=\{kind,where,id,remaining:3\.8,duration:3\.8\}/);
 assert.match(little,/getSchedule:\(\)=>approaches\.schedule\(initiatives\.schedule\(routines\.location\(\)\)\)/);
 assert.match(little,/initiatives\.drawDuringHold\(g,pos,tick\)/);
 assert.match(little,/initiatives\.panel\(\)/);
 assert.match(little,/childInitiatives:root\.HearthPipInitiatives\?\.clean/);
 assert.match(read('family-atlas-v271.js'),/child-home-initiative/);
 assert.ok(html.includes('family-atlas-v271.js?v=2.9.2'));
 assert.match(game,/const SAVE='hearth-harbor-save-v1'/);
 assert.match(css,/:focus-visible/);
 assert.match(css,/@media\(max-width:380px\)/);
});
test('no external services, passive money, countdown polling or extra save keys',()=>{
 const s=read('pip-initiatives-v292.js');
 assert.doesNotMatch(s,/fetch\(|XMLHttpRequest|WebSocket|localStorage|setInterval|setTimeout|new Image\(/);
 const f=fixture(),old=plain(f.child);
 for(let i=0;i<60;i++){f.m.advance(.016);f.m.panel();f.m.drawHint({save(){},restore(){},fillRect(){}},{x:680,y:785},i)}
 assert.deepEqual(plain(f.child),old);assert.equal(f.saves,0);
});

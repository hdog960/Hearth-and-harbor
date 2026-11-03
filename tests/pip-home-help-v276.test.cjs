/* Hearth & Harbor v2.7.6 — real child household collaboration regression */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=x=>fs.readFileSync(path.join(__dirname,'..',x),'utf8');
const env={window:{}};for(const f of ['pip-growth-v280.js','pip-projects-v278.js','pip-guides-v279.js','pip-routines-v273.js','pip-neighbors-v275.js','pip-home-help-v276.js','pip-dreams-v277.js','little-sprouts-v272.js'])vm.runInNewContext(read(f),env,{filename:f});
const H=env.window.HearthPipHomeHelp,L=env.window.HearthLittleSprouts;
function fixture({guardian=true,close=true,queue=true}={}){
 const state={day:7,minute:720,coins:550,youngResidents:{pip:L.defaults()},familyRoots:{chosen:{}},weddingPlans:{}};
 if(guardian){state.youngResidents.pip.guardian='player';state.youngResidents.pip.guardianDay=4}
 let scene='home',near=true,queued=[],hold=null,completed=new Set(),saves=0,updates=0,closes=0,modal='',alerts=[];
 const api={getState:()=>state,getChild:()=>state.youngResidents.pip,getScene:()=>scene,nearChild:()=>near,
 ownDone:kind=>completed.has(kind),ownHold:()=>hold,
 queueAction:kind=>{if(!queue)return false;queued.push(kind);return true},
 closeModal:()=>{if(close)closes++},openBook:()=>{modal='book'},save:()=>saves++,updateUI:()=>updates++,notify:x=>alerts.push(x)};
 const h=H.setup(api);
 return {h,state,alerts,api,get queued(){return queued},get saves(){return saves},get updates(){return updates},get closes(){return closes},
 get modal(){return modal},setScene:x=>scene=x,setNear:x=>near=x,setHold:x=>hold=x,markDone:x=>completed.add(x)};
}
function finish(f,kind,day){f.state.day=day;assert.equal(f.h.plan(kind),true);assert.equal(f.h.complete(kind,true,day),true)}
test('unmodified old child save has no invented collaborative home actions',()=>{
 const old=L.clean(null);assert.deepEqual(JSON.parse(JSON.stringify(old.homeHelps)),[]);
 const f=fixture({guardian:false});assert.equal(f.h.profile().keepsake,false);
 assert.equal(f.h.plan('read'),false);assert.equal(f.saves,0);
});
test('saved home help requires strictly valid days, kinds and one memory per day',()=>{
 const r=H.clean([{day:3,kind:'read'},{day:3,kind:'tidy'},{day:-1,kind:'read'},{day:4,kind:'adult-job'},{day:5,kind:'meal'},{day:6,kind:'hobby'}]);
 assert.deepEqual(JSON.parse(JSON.stringify(r)),[{day:3,kind:'read'},{day:5,kind:'meal'},{day:6,kind:'hobby'}]);
});
test('old guardian and child learning progress are preserved during save migration',()=>{
 const old=L.clean({guardian:'player',guardianDay:3,skills:{story:7},memories:[{day:4,kind:'story',choiceMask:1}]});
 assert.equal(old.guardian,'player');assert.equal(old.skills.story,7);
 assert.equal(old.memories.length,1);assert.deepEqual(JSON.parse(JSON.stringify(old.homeHelps)),[]);
});
test('only a genuinely opted-in player guardian may begin home help',()=>{
 const f=fixture({guardian:false});
 for(const kind of ['read','tidy','meal','hobby'])assert.equal(f.h.canPlan(kind),false);
 assert.equal(f.closes,0);
});
test('a remote menu cannot schedule an activity with an absent Pip',()=>{
 const f=fixture();f.setNear(false);assert.equal(f.h.plan('read'),false);
 assert.equal(f.queued.length,0);assert.equal(f.saves,0);
});
test('a character in a different scene cannot start phantom cottage helping',()=>{
 const f=fixture();f.setScene('town');assert.equal(f.h.plan('tidy'),false);assert.equal(f.saves,0);
});
test('valid planning schedules a real Poppy Daybook task, closes modal and grants no reward',()=>{
 const f=fixture();const initial={...f.state.youngResidents.pip.needs};assert.equal(f.h.plan('read'),true);
 assert.deepEqual(f.queued,['read']);assert.equal(f.closes,1);
 assert.equal(f.saves,0);assert.deepEqual(JSON.parse(JSON.stringify(f.state.youngResidents.pip.needs)),initial);
 assert.equal(f.h.pending.kind,'read');
});
test('a full Daybook refuses the invitation and never leaves a ghost pending plan',()=>{
 const f=fixture({queue:false});assert.equal(f.h.plan('meal'),false);
 assert.equal(f.h.pending,null);assert.equal(f.saves,0);
});
test('an existing completed Poppy task cannot be reused for a fake first daily reward',()=>{
 const f=fixture();f.markDone('read');assert.equal(f.h.plan('read'),false);
 assert.equal(f.queued.length,0);assert.equal(f.saves,0);
});
test('only genuinely completed same-type same-day Poppy actions can finish a plan',()=>{
 const f=fixture();f.h.plan('read');
 assert.equal(f.h.complete('read',false,7),false);
 assert.equal(f.h.complete('meal',true,7),false);
 assert.equal(f.h.complete('read',true,6),false);
 assert.equal(f.h.profile().records.length,0);
 assert.equal(f.h.complete('read',true,7),true);
 assert.equal(f.h.profile().records.length,1);
});
test('real completed home action awards small care benefits and one lasting memory',()=>{
 const f=fixture();f.h.plan('meal');assert.equal(f.h.complete('meal',true,7),true);
 assert.deepEqual(JSON.parse(JSON.stringify(f.state.youngResidents.pip.homeHelps)),[{day:7,kind:'meal'}]);
 assert.equal(f.state.youngResidents.pip.needs.confidence,57);
 assert.equal(f.state.youngResidents.pip.needs.joy,65);
 assert.equal(f.saves,1);assert.equal(f.updates,1);assert.equal(f.state.coins,550);
});
test('no duplicate rewards for repeating the same day’s finished household task',()=>{
 const f=fixture();finish(f,'tidy',7);assert.equal(f.h.plan('meal'),false);
 assert.equal(f.h.complete('tidy',true,7),false);
 assert.equal(f.h.profile().records.length,1);assert.equal(f.saves,1);
});
test('a new real day permits another household help moment',()=>{
 const f=fixture();finish(f,'read',7);finish(f,'tidy',8);
 assert.equal(f.h.profile().records.length,2);
 assert.equal(f.h.profile().keepsake,false);
});
test('three distinct activities on three different days earn the visual household banner',()=>{
 const f=fixture();finish(f,'read',7);finish(f,'tidy',8);finish(f,'meal',9);
 assert.equal(f.h.profile().keepsake,true);
 assert.equal(f.h.profile().types,3);assert.equal(f.h.profile().days,3);
 assert.equal(f.saves,3);
});
test('repeating one activity over three days does not fabricate a three-kind keepsake',()=>{
 const f=fixture();finish(f,'read',7);finish(f,'read',8);finish(f,'read',9);
 assert.equal(f.h.profile().keepsake,false);
});
test('old forged future-dated memories cannot earn the home banner early',()=>{
 const f=fixture();f.state.youngResidents.pip.homeHelps=H.clean([{day:7,kind:'read'},{day:8,kind:'tidy'},{day:90,kind:'meal'}]);
 assert.equal(f.h.profile().keepsake,false);
});
test('unfinished planned help is session-only and not persisted as a fake memory',()=>{
 const f=fixture();f.h.plan('hobby');assert.equal(f.h.profile().records.length,0);
 const importAgain=L.clean(JSON.parse(JSON.stringify(f.state.youngResidents.pip)));
 assert.deepEqual(JSON.parse(JSON.stringify(importAgain.homeHelps)),[]);
 assert.equal(Object.hasOwn(importAgain,'pending'),false);
});
test('leaving the cottage invalidates the plan and prevents late rewards',()=>{
 const f=fixture();f.h.plan('read');f.setScene('town');assert.equal(f.h.complete('read',true,7),false);
 assert.equal(f.h.pending,null);f.setScene('home');assert.equal(f.h.profile().records.length,0);
});
test('day rollover invalidates unfinished help, without any child gain',()=>{
 const f=fixture();f.h.plan('read');f.state.day=8;
 assert.equal(f.h.complete('read',true,8),false);assert.equal(f.h.pending,null);assert.equal(f.saves,0);
});
test('the player can cancel a plan without deleting or changing previously earned memories',()=>{
 const f=fixture();finish(f,'meal',7);f.state.day=8;f.h.plan('read');
 assert.equal(f.h.cancel(),true);assert.equal(f.h.complete('read',true,8),false);
 assert.equal(f.h.profile().records.length,1);assert.equal(f.saves,1);
});
test('Pip visibly helps at the true furniture station only while Poppy performs the actual hold',()=>{
 const f=fixture();f.h.plan('read');
 assert.equal(f.h.pose(),null);
 f.setHold({kind:'read',remaining:2,duration:3.8});const p=f.h.pose();
 assert.ok(p&&p.participating&&Number.isFinite(p.x)&&p.y<500);
 f.setHold({kind:'tidy',remaining:2,duration:3.8});assert.equal(f.h.pose(),null);
});
test('the earned family banner draws actual Canvas art only in the real cottage',()=>{
 const f=fixture();const calls=[],g={save(){},restore(){},fillRect(){calls.push('rect')},beginPath(){},moveTo(){calls.push('move')},
 lineTo(){},closePath(){},fill(){},fillText(){calls.push('text')}};
 f.h.drawBanner(g,1);assert.equal(calls.length,0);
 finish(f,'read',7);finish(f,'tidy',8);finish(f,'hobby',9);
 f.h.drawBanner(g,1);assert.ok(calls.includes('rect'));assert.ok(calls.includes('move'));
 calls.length=0;f.setScene('town');f.h.drawBanner(g,1);assert.equal(calls.length,0);
});
test('home help panel features original activities and earned progress, not instant claims',()=>{
 const f=fixture();const html=f.h.panel();
 assert.match(html,/Little Helping Hands/);assert.match(html,/ph276-plan/);
 assert.match(html,/of 3 kinds/);assert.match(html,/Daybook/);
 assert.equal(f.saves,0);
});
test('the home helper never touches adult marriage, currency or legacy records',()=>{
 const f=fixture();f.state.weddingPlans['mabel|rosie']={status:'married',marriedDay:3};
 const before=JSON.stringify({weddings:f.state.weddingPlans,coins:f.state.coins,relations:f.state.familyRoots});
 finish(f,'hobby',7);
 assert.equal(JSON.stringify({weddings:f.state.weddingPlans,coins:f.state.coins,relations:f.state.familyRoots}),before);
});
test('all four help kinds are valid Poppy household tasks in the unchanged game',()=>{
 const s=read('game.js');
 for(const kind of ['read','tidy','meal','hobby'])assert.ok(s.includes(kind+":{name:"),'household task missing: '+kind);
 assert.match(s,/littleSprouts\.homeHelp\.complete\(kind,once,state\.day\)/);
 assert.match(s,/queueOwnAction:kind=>queueOwnHomeAction\(kind\)/);
});
test('iPhone offline load order, save key and actual world drawing are connected',()=>{
 const html=read('index.html'),sw=read('sw.js'),game=read('game.js'),css=read('pip-home-help-v276.css'),child=read('little-sprouts-v272.js');
 for(const file of ['pip-home-help-v276.js','pip-home-help-v276.css']){assert.ok(html.includes(file));assert.ok(sw.includes("'./"+file+"'"))}
 assert.ok(html.indexOf('pip-home-help-v276.js')<html.indexOf('little-sprouts-v272.js'));
 assert.ok(html.indexOf('little-sprouts-v272.js')<html.indexOf('game.js'));
 assert.match(html,/v=2\.8\.0/);assert.match(sw,/hearth-harbor-v280-growing-seasons/);
 assert.match(css,/:focus-visible/);assert.match(css,/@media\(max-width:380px\)/);
 assert.match(game,/littleSprouts\.homeHelp\.drawBanner\(ctx,tick\)/);
 assert.match(game,/littleSprouts\.homeHelp\.profile\(\)\.keepsake\?2:0/);
 assert.match(child,/homeHelp\.pose\(\)/);
 assert.match(game,/const SAVE='hearth-harbor-save-v1'/);
});
test('the new care system has no remote service, paid transaction, independent storage or timers',()=>{
 const src=read('pip-home-help-v276.js');
 assert.doesNotMatch(src,/setInterval|setTimeout|XMLHttpRequest|WebSocket|localStorage|fetch\(|new Image\(/);
});

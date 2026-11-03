/* Hearth & Harbor v2.8.2 — authentic family tradition handoff QA */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const env={window:{}};
for(const f of ['home-traditions-v2525.js','pip-growth-v280.js','pip-legacy-v282.js','pip-rituals-v283.js',
 'pip-adventures-v281.js','pip-projects-v278.js','pip-guides-v279.js','pip-routines-v273.js',
 'pip-neighbors-v275.js','pip-home-help-v276.js','pip-dreams-v277.js','little-sprouts-v272.js','family-atlas-v271.js'])
 vm.runInNewContext(read(f),env,{filename:f});
const H=env.window.HearthPipLegacy,L=env.window.HearthLittleSprouts,T=env.window.HearthHomeTraditions,A=env.window.HearthFamilyAtlas;
const plain=x=>JSON.parse(JSON.stringify(x));
function fixture({stage=1,guardian=true,day=25,tradition=true,near=true,scene='home',queue=true}={}){
 const c=L.defaults();
 if(guardian){c.guardian='player';c.guardianDay=3}
 if(stage){c.growth={stage,firstDay:5,secondDay:stage===2?15:0}}
 c.mentor.counts.jun=1;c.mentor.counts.bea=1;
 c.homeHelps=[{day:8,kind:'meal'}];c.skills.garden=2;
 const records={};
 for(const id of Object.keys(H.TRACKS))records[id]={completedDay:tradition?7:0};
 const state={day,minute:890,coins:500,youngResidents:{pip:c},
  homeTraditions:{homes:{player:records}},familyRoots:{chosen:{}},weddingPlans:{}};
 const done=new Set(),queued=[],notices=[];
 let where=scene,closeCount=0,saves=0,updates=0,busy=false,hold=null,modal='';
 let actuallyNear=near,canQueue=queue;
 const api={getState:()=>state,getChild:()=>state.youngResidents.pip,getScene:()=>where,
  nearChild:()=>actuallyNear,isChildBusy:()=>busy,isQueued:k=>queued.includes(k),ownDone:k=>done.has(k),
  ownHold:()=>hold,queueAction:k=>{if(!canQueue)return false;queued.push(k);return true},
  closeModal:()=>closeCount++,showModal:(id,html)=>{modal=html},
  save:()=>saves++,updateUI:()=>updates++,notify:x=>notices.push(x),openBook:()=>{modal='full Pip Daybook'}};
 const handoff=H.setup(api);
 return {handoff,state,api,queued,notices,done,get saves(){return saves},get updates(){return updates},
  get closeCount(){return closeCount},get modal(){return modal},child:()=>state.youngResidents.pip,clearQueue:()=>{queued.length=0},
  setScene:x=>where=x,setNear:x=>actuallyNear=x,setBusy:x=>busy=x,setHold:x=>hold=x,setQueue:x=>canQueue=x};
}
function finish(f,key){
 const kind=H.TRACKS[key].action;
 assert.equal(f.handoff.plan(key),true);
 assert.equal(f.handoff.complete(kind,true,f.state.day),true);
}
test('three generations handoffs derive from real pre-existing adult 3-act traditions',()=>{
 assert.deepEqual(Object.keys(H.TRACKS),['welcome','supper','orchard']);
 assert.equal(H.TRACKS.welcome.tradition,'welcome');
 assert.equal(H.TRACKS.supper.tradition,'supper');
 assert.equal(H.TRACKS.orchard.tradition,'orchard');
 assert.deepEqual(Object.values(H.TRACKS).map(x=>x.action),['tidy','meal','hobby']);
});
test('a first-time child does not have any invented family shelf keepsakes',()=>{
 const d=L.clean(null);assert.deepEqual(plain(d.legacyKeepsakes),[]);
});
test('before explicit guardianship, tradition crafting is unavailable',()=>{
 const f=fixture({guardian:false});
 assert.equal(f.handoff.canPlan('welcome'),false);
 assert.equal(f.handoff.plan('supper'),false);assert.equal(f.saves,0);
});
test('an underage Pip cannot hand down tradition just by pressing a journal button',()=>{
 const f=fixture({stage:0});
 for(const k of Object.keys(H.TRACKS))assert.equal(f.handoff.canPlan(k),false);
 assert.equal(f.handoff.earned('welcome'),false);
});
test('a Growing Child can share welcome and supper heirlooms but not advanced orchard yet',()=>{
 const f=fixture();
 assert.equal(f.handoff.canPlan('welcome'),true);
 assert.equal(f.handoff.canPlan('supper'),true);
 assert.equal(f.handoff.canPlan('orchard'),false);
});
test('Independent Child unlocks the more complex orchard print',()=>{
 const f=fixture({stage:2});
 assert.equal(f.handoff.canPlan('orchard'),true);
});
test('an incomplete adult household tradition blocks family handoff no matter Pip progress',()=>{
 const f=fixture({tradition:false,stage:2});
 for(const key of Object.keys(H.TRACKS))assert.equal(f.handoff.canPlan(key),false);
});
test('a future completed adult tradition cannot be credited early',()=>{
 const f=fixture({stage:2});
 f.state.homeTraditions.homes.player.welcome.completedDay=45;
 assert.equal(f.handoff.canPlan('welcome'),false);
});
test('welcome handoff requires actual relationships with two different real villagers',()=>{
 const f=fixture();
 f.child().mentor.counts.bea=0;
 assert.equal(f.handoff.canPlan('welcome'),false);
 f.child().meetings=[{id:'bea',day:15,mask:1}];
 assert.equal(f.handoff.canPlan('welcome'),true);
});
test('repeated meeting a single villager never substitutes for knowing two people',()=>{
 const f=fixture();
 f.child().mentor.counts.bea=0;f.child().mentor.counts.jun=6;
 assert.equal(f.handoff.canPlan('welcome'),false);
});
test('supper handoff needs a previously completed authentic Pip meal-help day',()=>{
 const f=fixture();f.child().homeHelps=[];
 assert.equal(f.handoff.canPlan('supper'),false);
 f.child().homeHelps=[{day:9,kind:'meal'}];
 assert.equal(f.handoff.canPlan('supper'),true);
});
test('an invented future meal-help record is not accepted as a childhood requirement',()=>{
 const f=fixture();f.child().homeHelps=[{day:99,kind:'meal'}];
 assert.equal(f.handoff.canPlan('supper'),false);
});
test('orchard handoff requires at least two genuinely learned nature sessions',()=>{
 const f=fixture({stage:2});f.child().skills.garden=1;
 assert.equal(f.handoff.canPlan('orchard'),false);
 f.child().memories=[{day:8,kind:'garden',choiceMask:0},{day:9,kind:'garden',choiceMask:1}];
 assert.equal(f.handoff.canPlan('orchard'),true);
});
test('stage prerequisites and earlier actual milestone receipts are persisted',()=>{
 const f=fixture({stage:2});
 assert.equal(f.handoff.canPlan('orchard'),true);
 f.child().growth={stage:2,firstDay:30,secondDay:35};
 assert.equal(f.handoff.canPlan('orchard'),false);
});
test('a remote menu cannot schedule an actual cottage activity',()=>{
 const f=fixture({near:false});
 assert.equal(f.handoff.plan('welcome'),false);
 assert.equal(f.queued.length,0);assert.equal(f.saves,0);
});
test('Pip and Poppy need to be in the actual cottage, never the town',()=>{
 const f=fixture({scene:'town'});
 assert.equal(f.handoff.canPlan('supper'),false);
 assert.equal(f.handoff.plan('supper'),false);
});
test('a family tradition plan enters the true Poppy Daybook with zero instant rewards',()=>{
 const f=fixture();const childBefore=plain(f.child().needs);
 assert.equal(f.handoff.plan('welcome'),true);
 assert.deepEqual(f.queued,['tidy']);
 assert.deepEqual(plain(f.child().legacyKeepsakes),[]);
 assert.deepEqual(plain(f.child().needs),childBefore);
 assert.equal(f.saves,0);assert.equal(f.closeCount,1);
});
test('when Poppy Daybook has no space, the plan is rejected without a ghost record',()=>{
 const f=fixture({queue:false});
 assert.equal(f.handoff.plan('welcome'),false);
 assert.equal(f.handoff.pending,null);
 assert.equal(f.saves,0);
});
test('Poppy cannot reuse an already completed same-day routine for a fake new heirloom',()=>{
 const f=fixture();f.done.add('tidy');
 assert.equal(f.handoff.canPlan('welcome'),false);
 assert.equal(f.handoff.plan('welcome'),false);
});
test('the normal household-help child session cannot be overwritten by a second plan',()=>{
 const f=fixture();f.setBusy(true);
 assert.equal(f.handoff.plan('welcome'),false);
});
test('a second family shelf plan cannot overwrite an unfinished first one',()=>{
 const f=fixture();f.handoff.plan('welcome');
 assert.equal(f.handoff.plan('supper'),false);
 assert.deepEqual(f.queued,['tidy']);
});
test('a real timed Poppy activity creates physical child furniture participation',()=>{
 const f=fixture();f.handoff.plan('welcome');
 assert.equal(f.handoff.pose(),null);
 f.setHold({kind:'tidy',remaining:1.1,duration:3.8});
 const pose=f.handoff.pose();
 assert.ok(pose&&pose.participating&&pose.legacy);
 assert.ok(Number.isFinite(pose.x)&&Number.isFinite(pose.y));
});
test('an unrelated household hold never pretends Pip helped with the family tradition',()=>{
 const f=fixture();f.handoff.plan('welcome');f.setHold({kind:'meal',remaining:1,duration:3.8});
 assert.equal(f.handoff.pose(),null);
});
test('only the right first completed daybook action can award the exact family memory',()=>{
 const f=fixture();f.handoff.plan('welcome');
 assert.equal(f.handoff.complete('meal',true,25),false);
 assert.equal(f.handoff.complete('tidy',false,25),false);
 assert.equal(f.handoff.complete('tidy',true,24),false);
 assert.equal(f.saves,0);
 assert.equal(f.handoff.complete('tidy',true,25),true);
 assert.deepEqual(plain(f.child().legacyKeepsakes),[{key:'welcome',day:25,action:'tidy'}]);
});
test('finishing a genuine handoff gives only child needs and a tiny permanent decoration',()=>{
 const f=fixture();const needs={...f.child().needs};
 finish(f,'welcome');
 assert.equal(f.child().needs.confidence,needs.confidence+5);
 assert.equal(f.child().needs.joy,needs.joy+2);
 assert.equal(f.handoff.bonus,1);assert.equal(f.state.coins,500);
 assert.equal(f.saves,1);assert.equal(f.updates,1);
});
test('the same family keepsake cannot pay twice or be crafted repeatedly',()=>{
 const f=fixture();finish(f,'welcome');
 assert.equal(f.handoff.complete('tidy',true,25),false);
 assert.equal(f.handoff.plan('welcome'),false);
 assert.equal(f.child().legacyKeepsakes.length,1);
 assert.equal(f.saves,1);
});
test('all three different keepsakes may be earned on different days',()=>{
 const f=fixture({stage:2});finish(f,'welcome');
 f.state.day=26;finish(f,'supper');
 f.state.day=27;finish(f,'orchard');
 assert.equal(f.handoff.bonus,3);
 assert.deepEqual(plain(f.child().legacyKeepsakes.map(x=>x.key)),['welcome','supper','orchard']);
});
test('a cancelled planned handoff never creates a physical item or saved record',()=>{
 const f=fixture();f.handoff.plan('welcome');f.handoff.handle('pl282-cancel');
 assert.equal(f.handoff.pending,null);
 assert.equal(f.handoff.complete('tidy',true,25),false);
 assert.equal(f.saves,0);
});
test('leaving the cottage clears an unfinished plan and prevents later fake credit',()=>{
 const f=fixture();f.handoff.plan('welcome');f.setScene('town');
 assert.equal(f.handoff.pending,null);
 f.setScene('home');assert.equal(f.handoff.complete('tidy',true,25),false);
});
test('clearing a queued Poppy Daybook task cancels the associated heirloom intention',()=>{
 const f=fixture();f.handoff.plan('welcome');
 f.clearQueue();
 assert.equal(f.handoff.pending,null);
 assert.equal(f.handoff.complete('tidy',true,25),false);
 assert.equal(f.saves,0);
});
test('imported keepsake without a genuinely finished original adult tradition earns no bonus',()=>{
 const f=fixture({tradition:false});
 f.child().legacyKeepsakes=[{key:'welcome',day:20,action:'tidy'}];
 assert.equal(f.handoff.earned('welcome'),false);assert.equal(f.handoff.bonus,0);
});
test('imported keepsake cannot appear before actual chosen guardian and child stage dates',()=>{
 const f=fixture();
 f.child().legacyKeepsakes=[{key:'welcome',day:4,action:'tidy'}];
 assert.equal(f.handoff.earned('welcome'),false);
 f.child().legacyKeepsakes=[{key:'welcome',day:20,action:'tidy'}];
 assert.equal(f.handoff.earned('welcome'),true);
});
test('day rollover invalidates unfinished craft intentions without a reward',()=>{
 const f=fixture();f.handoff.plan('welcome');
 f.state.day=26;assert.equal(f.handoff.complete('tidy',true,26),false);
 assert.equal(f.handoff.pending,null);assert.equal(f.saves,0);
});
test('adult tradition disappearing invalidates an unfinished plan without inventing legacy',()=>{
 const f=fixture();f.handoff.plan('welcome');
 f.state.homeTraditions.homes.player.welcome.completedDay=0;
 assert.equal(f.handoff.complete('tidy',true,25),false);
});
test('going underage in imported save cannot earn or display premature family heirlooms',()=>{
 const f=fixture();f.handoff.plan('welcome');
 f.child().growth={stage:0,firstDay:0,secondDay:0};
 assert.equal(f.handoff.complete('tidy',true,25),false);
});
test('save cleaning rejects forged, duplicate and malformed generational records',()=>{
 const c=H.clean([{key:'welcome',day:3,action:'tidy'},{key:'welcome',day:4,action:'tidy'},
 {key:'fake',day:5,action:'meal'},{key:'orchard',day:6,action:'meal'},
 {key:'supper',day:7,action:'meal'},{key:'orchard',day:8,action:'hobby'}]);
 assert.deepEqual(plain(c),[{key:'welcome',day:3,action:'tidy'},
 {key:'supper',day:7,action:'meal'},{key:'orchard',day:8,action:'hobby'}]);
});
test('old child save loads empty family history while preserving older growth, homehelp and dreams',()=>{
 const old=L.clean({guardian:'player',guardianDay:3,growth:{stage:1,firstDay:6},
 homeHelps:[{day:8,kind:'meal'}],dream:{focus:'stories',chosenDay:5}});
 assert.deepEqual(plain(old.legacyKeepsakes),[]);
 assert.equal(old.growth.stage,1);
 assert.equal(old.homeHelps.length,1);assert.equal(old.dream.focus,'stories');
});
test('existing saved keepsakes are maintained through an actual child save round trip',()=>{
 const f=fixture();finish(f,'welcome');
 const clean=L.clean(plain(f.child()));
 assert.deepEqual(plain(clean.legacyKeepsakes),[{key:'welcome',day:25,action:'tidy'}]);
});
test('the family shelf draws three distinct handmade frames only in the actual cottage',()=>{
 const f=fixture({stage:2});const calls=[],g={save(){},restore(){},fillRect(){calls.push(1)}};
 assert.equal(f.handoff.draw(g,1),false);
 finish(f,'welcome');f.state.day=26;finish(f,'supper');f.state.day=27;finish(f,'orchard');
 assert.equal(f.handoff.draw(g,1),true);
 assert.ok(calls.length>=24,'all three physical keepsake frames contain multiple painted parts');
 calls.length=0;f.setScene('town');assert.equal(f.handoff.draw(g,1),false);assert.equal(calls.length,0);
});
test('earned family comforts are bounded and tied to actual valid dated records',()=>{
 const f=fixture();f.child().legacyKeepsakes=[{key:'welcome',day:80,action:'tidy'}];
 assert.equal(f.handoff.bonus,0);
 f.child().legacyKeepsakes=[{key:'welcome',day:24,action:'tidy'}];
 assert.equal(f.handoff.bonus,1);
});
test('a directly openable journal is functional, informative and offers real Daybook work',()=>{
 const f=fixture();f.handoff.board();
 assert.match(f.modal,/Our Little Legacy Shelf/);
 assert.match(f.modal,/pl282-plan/);
 assert.match(f.modal,/Home & Town/);
 assert.equal(f.saves,0);
});
test('the real original Home & Town Traditions act cycle enables a genuine handoff, not an arbitrary claim',()=>{
 const f=fixture({tradition:false,day:1});
 f.state.homeTraditions=T.clean(null);
 const homes=T.setup({getState:()=>f.state,save:()=>{},updateUI:()=>{},notify:()=>{},showModal:()=>{},closeModal:()=>{}});
 homes.start('player','welcome');
 assert.equal(homes.recordHome('player','player','chat',true,1).stage,1);
 f.state.day=2;
 assert.equal(homes.recordTrade('bea',2).stage,2);
 f.state.day=3;
 const last=homes.recordHome('player','player','tidy',true,3);
 assert.equal(last.finished,true);
 assert.equal(f.state.homeTraditions.homes.player.welcome.completedDay,3);
 f.state.day=25;
 assert.equal(f.handoff.canPlan('welcome'),true);
 finish(f,'welcome');
 assert.equal(f.child().legacyKeepsakes.length,1);
});
test('family Atlas records genuine family handoffs as dated memories, not ancestry',()=>{
 const f=fixture();finish(f,'welcome');
 const atlas=A.setup({getState:()=>f.state,getResidentHome:()=>null,getYoungResident:()=>({guardian:'player',guardianDay:3}),getPortraits:()=>[]});
 const events=atlas.events().filter(x=>x.kind==='child-family-legacy');
 assert.equal(events.length,1);assert.equal(events[0].day,25);
 assert.equal(atlas.graph().edges.some(e=>e.kind==='marriage'&&e.ids.includes('pip')),false);
});
test('future and ungrounded family shelf entries never become genuine historical events',()=>{
 const f=fixture({tradition:false});
 f.child().legacyKeepsakes=[{key:'welcome',day:90,action:'tidy'}];
 const atlas=A.setup({getState:()=>f.state,getResidentHome:()=>null,getYoungResident:()=>({guardian:'player',guardianDay:3})});
 assert.equal(atlas.events().filter(e=>e.kind==='child-family-legacy').length,0);
});
test('the true home-completion hook and illustrated wall are wired into original gameplay',()=>{
 const game=read('game.js'),child=read('little-sprouts-v272.js');
 assert.match(game,/littleSprouts\.familyLegacy\.complete\(kind,once,state\.day\)/);
 assert.match(game,/littleSprouts\.familyLegacy\.draw\(ctx,tick\)/);
 assert.match(game,/littleSprouts\.familyLegacy\.bonus/);
 assert.match(game,/Our Little Legacy Shelf/);
 assert.match(child,/familyLegacy\.pose\(\)/);
 assert.match(child,/familyLegacy\.panel\(\)/);
 assert.match(game,/const SAVE='hearth-harbor-save-v1'/);
});
test('iPhone HTML resource order, service-worker cache and accessible styled controls are correct',()=>{
 const html=read('index.html'),sw=read('sw.js'),css=read('pip-legacy-v282.css');
 for(const file of ['pip-legacy-v282.js','pip-legacy-v282.css']){
  assert.ok(html.includes(file));assert.ok(sw.includes("'./"+file+"'"));
 }
 assert.ok(html.indexOf('pip-legacy-v282.js')<html.indexOf('little-sprouts-v272.js'));
 assert.match(html,/v=2\.8\.3/);assert.match(sw,/hearth-harbor-v283-family-seasons/);
 assert.match(css,/:focus-visible/);assert.match(css,/@media\(max-width:380px\)/);
});
test('no network calls, second storage, passive timers, subscriptions, fictional adults or personal data are added',()=>{
 const src=read('pip-legacy-v282.js');
 assert.doesNotMatch(src,/fetch\(|XMLHttpRequest|WebSocket|localStorage|setTimeout|setInterval|new Image\(/);
 assert.doesNotMatch(src,/weddingPlans|adultJob|coins\s*\+=/);
});

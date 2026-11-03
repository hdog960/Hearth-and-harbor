/* Hearth & Harbor v2.7.7 — genuine childhood dreams regression */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=x=>fs.readFileSync(path.join(__dirname,'..',x),'utf8');
const env={window:{}};
for(const file of ['pip-growth-v280.js','pip-projects-v278.js','pip-guides-v279.js','pip-routines-v273.js','pip-neighbors-v275.js','pip-home-help-v276.js','pip-dreams-v277.js','little-sprouts-v272.js','family-atlas-v271.js'])
 vm.runInNewContext(read(file),env,{filename:file});
const D=env.window.HearthPipDreams,L=env.window.HearthLittleSprouts,A=env.window.HearthFamilyAtlas;
const compact=x=>JSON.parse(JSON.stringify(x));
function fixture(options={}){
 const state={day:9,minute:720,coins:300,youngResidents:{pip:L.defaults()},familyRoots:{chosen:{}},weddingPlans:{},...options};
 let scene='home',near=true,saves=0,updates=0,modal={id:'',html:''};const notices=[];
 const api={getState:()=>state,getChild:()=>state.youngResidents.pip,getScene:()=>scene,nearChild:()=>near,
   save:()=>saves++,updateUI:()=>updates++,notify:s=>notices.push(s),openBook:()=>{modal={id:'book',html:'open'}},
   showModal:(id,html)=>{modal={id,html}},isNearby:()=>near,closeModal:()=>{}};
 const dreams=D.setup(api);return {state,api,dreams,notices,get saves(){return saves},get updates(){return updates},get modal(){return modal},
   setScene:x=>scene=x,setNear:x=>near=x,child:()=>state.youngResidents.pip};
}
function guardian(f){f.child().guardian='player';f.child().guardianDay=3;}
function memory(f,kind,days){for(const day of days)f.child().memories.push({day,kind,choiceMask:0});f.child().skills[kind]=days.length;}
function help(f,kind,day){f.child().homeHelps.push({day,kind});}
function evening(f,day){f.child().evenings.push({day,mask:0});}
function meet(f,id,day){f.child().meetings.push({id,day,mask:0});}
test('the three dreams and all six chapters have original age-appropriate goals',()=>{
 assert.deepEqual(Object.keys(D.DREAMS),['stories','kindness','discover']);
 for(const dream of Object.values(D.DREAMS)){
  assert.equal(dream.chapters.length,2);
  assert.ok(dream.chapters.every(c=>c.goals.length>=1));
 }
});
test('older saves default to no chosen dream or fabricated achievement',()=>{
 const old=L.clean(null);assert.equal(old.dream.focus,null);
 assert.equal(old.dream.chosenDay,0);
 for(const key of Object.keys(D.DREAMS))assert.equal(old.dream.achievements[key].length,0);
});
test('childhood dreaming does not unlock before explicit real guardianship',()=>{
 const f=fixture();assert.equal(f.dreams.choose('stories'),false);
 assert.equal(f.dreams.claim(1),false);assert.equal(f.saves,0);
});
test('the guardian must physically meet Pip, not choose from a remote menu',()=>{
 const f=fixture();guardian(f);f.setNear(false);
 assert.equal(f.dreams.choose('stories'),false);
 assert.match(f.dreams.panel(),/disabled/);assert.equal(f.saves,0);
});
test('Pip cannot choose a dream in the wrong scene',()=>{
 const f=fixture();guardian(f);f.setScene('town');
 assert.equal(f.dreams.choose('kindness'),false);assert.equal(f.saves,0);
});
test('a valid dream selection is optional, saved, and does not award a chapter',()=>{
 const f=fixture();guardian(f);
 assert.equal(f.dreams.choose('stories'),true);
 assert.equal(f.child().dream.focus,'stories');assert.equal(f.child().dream.chosenDay,9);
 assert.equal(f.child().dream.achievements.stories.length,0);assert.equal(f.saves,1);
});
test('invalid dream ID cannot alter an existing save',()=>{
 const f=fixture();guardian(f);f.dreams.choose('stories');const snapshot=JSON.stringify(f.child().dream);
 assert.equal(f.dreams.choose('fake'),false);assert.equal(JSON.stringify(f.child().dream),snapshot);
});
test('two story days are required for first Keeper of Stories chapter',()=>{
 const f=fixture();guardian(f);f.dreams.choose('stories');
 memory(f,'story',[5]);assert.equal(f.dreams.progress().chapters[0].ready,false);
 assert.equal(f.dreams.claim(1),false);
 memory(f,'story',[5,6]);assert.equal(f.dreams.progress().chapters[0].ready,true);
 assert.equal(f.dreams.claim(1),true);assert.equal(f.child().dream.achievements.stories.length,1);
});
test('clicking the book or clicking an unearned chapter never generates a memory',()=>{
 const f=fixture();guardian(f);f.dreams.choose('discover');
 const before=JSON.stringify(f.child());
 f.dreams.panel();assert.equal(f.dreams.claim(1),false);
 assert.equal(JSON.stringify(f.child()),before);
});
test('earned story chapter 2 requires story, bedtime and Jun memories together',()=>{
 const f=fixture();guardian(f);f.dreams.choose('stories');
 memory(f,'story',[2,3,4]);assert.equal(f.dreams.claim(1),true);
 assert.equal(f.dreams.claim(2),false);
 evening(f,6);assert.equal(f.dreams.claim(2),false);
 meet(f,'jun',7);assert.equal(f.dreams.claim(2),true);
 assert.equal(f.child().dream.achievements.stories.length,2);
});
test('chapter 2 cannot be claimed before chapter 1, even with all goal evidence',()=>{
 const f=fixture();guardian(f);f.dreams.choose('stories');
 memory(f,'story',[2,3,4]);evening(f,6);meet(f,'jun',7);
 assert.equal(f.dreams.claim(2),false);assert.equal(f.dreams.claim(1),true);
});
test('Kindness chapter one needs two genuinely different home help days',()=>{
 const f=fixture();guardian(f);f.dreams.choose('kindness');help(f,'meal',5);
 assert.equal(f.dreams.claim(1),false);
 help(f,'meal',6);assert.equal(f.dreams.claim(1),true);
});
test('Kindness chapter two requires three days, three home tasks and bedtime',()=>{
 const f=fixture();guardian(f);f.dreams.choose('kindness');
 help(f,'read',4);help(f,'tidy',5);help(f,'meal',6);
 assert.equal(f.dreams.claim(1),true);assert.equal(f.dreams.claim(2),false);
 evening(f,7);assert.equal(f.dreams.claim(2),true);
});
test('Explorer chapter one is earned only with two distinct nature days',()=>{
 const f=fixture();guardian(f);f.dreams.choose('discover');memory(f,'garden',[4,5]);
 assert.equal(f.dreams.claim(1),true);
});
test('Explorer chapter two needs nature, two different villagers and an art day',()=>{
 const f=fixture();guardian(f);f.dreams.choose('discover');
 memory(f,'garden',[3,4,5]);assert.equal(f.dreams.claim(1),true);
 meet(f,'bea',5);meet(f,'bea',6);memory(f,'art',[7]);
 assert.equal(f.dreams.claim(2),false);
 meet(f,'jun',8);assert.equal(f.dreams.claim(2),true);
});
test('future-dated activities and forged kind IDs cannot unlock dreams',()=>{
 const f=fixture();guardian(f);f.dreams.choose('discover');
 f.child().memories=[{day:70,kind:'garden',choiceMask:1},{day:90,kind:'garden',choiceMask:2},{day:8,kind:'fake',choiceMask:0}];
 assert.equal(f.dreams.claim(1),false);
});
test('unique days prevent inflated event counts when old save data repeats',()=>{
 const c=L.defaults();
 c.memories=[{kind:'story',day:5,choiceMask:0},{kind:'story',day:5,choiceMask:0}];
 assert.equal(D.tally(c,9).story,1);
 c.homeHelps=[{kind:'meal',day:5},{kind:'read',day:5}];
 assert.equal(D.tally(c,9).help,1);
});
test('finished chapters grant one bounded child encouragement, not coins or adult rewards',()=>{
 const f=fixture();guardian(f);f.dreams.choose('stories');memory(f,'story',[4,5]);
 const old={...f.child().needs},money=f.state.coins;
 assert.equal(f.dreams.claim(1),true);
 assert.equal(f.child().needs.joy,old.joy+5);assert.equal(f.child().needs.confidence,old.confidence+3);
 assert.equal(f.state.coins,money);
 assert.equal(f.dreams.claim(1),false);
});
test('claimed chapters survive changing dreams and never pay twice',()=>{
 const f=fixture();guardian(f);memory(f,'story',[2,3]);
 f.dreams.choose('stories');f.dreams.claim(1);
 f.dreams.choose('kindness');f.dreams.choose('stories');
 assert.equal(f.dreams.claim(1),false);
 assert.equal(f.child().dream.achievements.stories.length,1);
});
test('old save with capped scrapbook respects previously earned lifetime skill counts',()=>{
 const child=L.clean({guardian:'player',guardianDay:4,skills:{story:8},memories:[{day:7,kind:'story',choiceMask:2}]});
 assert.equal(D.tally(child,9).story,8);
});
test('suspicious imported dream IDs, dates and stages are safely sanitized',()=>{
 const x=D.clean({focus:'fake',chosenDay:6,achievements:{stories:[{stage:1,day:3},{stage:1,day:3},{stage:9,day:8}],
 fake:[{stage:1,day:4}],kindness:[{stage:2,day:'8'}]}});
 assert.equal(x.focus,null);assert.equal(x.achievements.stories.length,1);
 assert.equal(x.achievements.kindness.length,0);
});
test('a save round trip retains focus and legitimate earned chapters',()=>{
 const f=fixture();guardian(f);f.dreams.choose('stories');memory(f,'story',[5,6]);f.dreams.claim(1);
 const next=L.clean(JSON.parse(JSON.stringify(f.child())));
 assert.equal(next.dream.focus,'stories');assert.equal(next.dream.achievements.stories[0].day,9);
});
test('invalid stage and remote claim requests cannot create records or gains',()=>{
 const f=fixture();guardian(f);f.dreams.choose('stories');memory(f,'story',[3,4]);
 f.setNear(false);
 assert.equal(f.dreams.claim(1),false);assert.equal(f.dreams.claim(99),false);
 assert.equal(f.child().dream.achievements.stories.length,0);
});
test('first earned chapter draws a visible companion badge in the real world',()=>{
 const f=fixture();guardian(f);f.dreams.choose('stories');memory(f,'story',[3,4]);f.dreams.claim(1);
 const calls=[],g={save(){},restore(){},fillRect(){calls.push('rect')}};
 f.dreams.drawBadge(g,550,650,1);assert.ok(calls.length>=3);
});
test('full dream earns a physical illustrated cottage keepsake, not a fake HUD image',()=>{
 const f=fixture();guardian(f);f.dreams.choose('stories');memory(f,'story',[3,4,5]);evening(f,6);meet(f,'jun',7);
 f.dreams.claim(1);f.dreams.claim(2);
 const calls=[],g={save(){},restore(){},fillRect(){calls.push('rect')}};
 f.dreams.drawKeepsake(g,1);assert.ok(calls.length>=6);
 f.setScene('town');calls.length=0;f.dreams.drawKeepsake(g,1);assert.equal(calls.length,0);
});
test('no dream reward marker appears without genuinely claimed chapters',()=>{
 const f=fixture();guardian(f);f.dreams.choose('stories');
 const calls=[],g={save(){},restore(){},fillRect(){calls.push('rect')}};
 f.dreams.drawBadge(g,550,650,1);f.dreams.drawKeepsake(g,1);
 assert.equal(calls.length,0);
});
test('Atlas records real milestone days for Pip without creating parentage or marriage',()=>{
 const f=fixture();guardian(f);f.dreams.choose('stories');memory(f,'story',[3,4]);f.dreams.claim(1);
 const atlas=A.setup({getState:()=>f.state,getResidentHome:()=>null,getYoungResident:()=>({guardian:'player',guardianDay:3}),getPortraits:()=>[]});
 const events=atlas.events().filter(x=>x.kind==='child-dream');
 assert.equal(events.length,1);assert.equal(events[0].day,9);
 assert.equal(atlas.graph().edges.some(x=>x.kind==='marriage'&&x.ids.includes('pip')),false);
});
test('UI and iPhone assets load childhood aspiration before child and persist old save key',()=>{
 const html=read('index.html'),sw=read('sw.js'),game=read('game.js'),css=read('pip-dreams-v277.css'),little=read('little-sprouts-v272.js');
 for(const file of ['pip-dreams-v277.js','pip-dreams-v277.css']){assert.ok(html.includes(file));assert.ok(sw.includes("'./"+file+"'"))}
 assert.ok(html.indexOf('pip-dreams-v277.js')<html.indexOf('little-sprouts-v272.js'));
 assert.match(html,/v=2\.8\.0/);assert.match(sw,/hearth-harbor-v280-growing-seasons/);
 assert.match(css,/:focus-visible/);assert.match(css,/@media\(max-width:380px\)/);
 assert.match(little,/dreams\.panel\(\)/);assert.match(game,/littleSprouts\.dreams\.drawKeepsake\(ctx,tick\)/);
 assert.match(game,/const SAVE='hearth-harbor-save-v1'/);
});
test('dream chapter source has no network services, purchases, timers or second storage key',()=>{
 const src=read('pip-dreams-v277.js');assert.doesNotMatch(src,/fetch\(|XMLHttpRequest|WebSocket|localStorage|setInterval|setTimeout|new Image\(/);
});

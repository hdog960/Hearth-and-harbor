/* Hearth & Harbor v2.7.2 — real first younger resident QA */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const env={window:{}};vm.runInNewContext(read('pip-growth-v280.js'),env,{filename:'pip-growth-v280.js'});vm.runInNewContext(read('pip-adventures-v281.js'),env,{filename:'pip-adventures-v281.js'});vm.runInNewContext(read('pip-projects-v278.js'),env,{filename:'pip-projects-v278.js'});vm.runInNewContext(read('pip-guides-v279.js'),env,{filename:'pip-guides-v279.js'});vm.runInNewContext(read('pip-routines-v273.js'),env,{filename:'pip-routines-v273.js'});vm.runInNewContext(read('pip-neighbors-v275.js'),env,{filename:'pip-neighbors-v275.js'});vm.runInNewContext(read('pip-home-help-v276.js'),env,{filename:'pip-home-help-v276.js'});vm.runInNewContext(read('pip-dreams-v277.js'),env,{filename:'pip-dreams-v277.js'});vm.runInNewContext(read('little-sprouts-v272.js'),env,{filename:'little-sprouts-v272.js'});
vm.runInNewContext(read('family-atlas-v271.js'),env,{filename:'family-atlas-v271.js'});
const L=env.window.HearthLittleSprouts,A=env.window.HearthFamilyAtlas;
function fixture(options={}){
 const state={day:5,minute:120,youngResidents:{pip:L.defaults()},weddingPlans:{},familyRoots:{chosen:{}},...options};
 let scene='town',player={x:740,y:890},modal={name:'',html:''},saves=0,updates=0;const notes=[];
 const api={getState:()=>state,save:()=>saves++,updateUI:()=>updates++,notify:v=>notes.push(v),showModal:(name,html)=>{modal={name,html}},
 closeModal:()=>{modal={name:'',html:''}},getScene:()=>scene,isNearby:(p,d)=>Math.hypot(player.x-p.x,player.y-p.y)<=d};
 const sprout=L.setup(api);
 return {state,sprout,notes,api,get modal(){return modal},get saves(){return saves},get updates(){return updates},setScene:v=>scene=v,setPlayer:(x,y)=>player={x,y}};
}
function complete(f,kind,mask=0){assert.equal(f.sprout.begin(kind),true);for(let i=0;i<3;i++){assert.equal(f.sprout.choose((mask>>i)&1),true);if(i<2)assert.equal(f.sprout.page(),true)}}
test('first genuine younger character is separate from six adult resident IDs',()=>{
 const f=fixture(),s=f.sprout.status();
 assert.equal(s.id,'pip');assert.equal(s.name,'Pip');assert.equal(s.stage,'Child');assert.equal(s.guardian,null);
 assert.equal(s.home,null);assert.equal(s.needs.curiosity,55);assert.equal(f.saves,0);
});
test('old saves gain strictly bounded optional child field without mutating adult systems',()=>{
 const old={day:3,coins:300,relations:{mabel:50}},f=fixture(old);
 assert.equal(f.sprout.data.guardian,null);assert.equal(f.state.relations.mabel,50);assert.equal(f.state.coins,300);
 assert.equal(Object.keys(f.state.youngResidents).length,1);
});
test('import sanitation rejects false guardians, bad dates, negative needs and injected strings',()=>{
 const v=L.clean({guardian:'mabel',guardianDay:2,needs:{joy:-5,curiosity:120,confidence:Infinity},days:[-1,5,5,'7'],daily:{day:5,done:['story','bogus','story']},
 memories:[{day:5,kind:'story',choiceMask:2},{day:5,kind:'story',choiceMask:2},{day:9,kind:'fake',choiceMask:0},{day:6,kind:'art',choiceMask:99}]});
 assert.equal(v.guardian,null);assert.equal(v.guardianDay,0);
 assert.equal(v.needs.joy,0);assert.equal(v.needs.curiosity,100);assert.equal(v.needs.confidence,50);
 assert.equal(v.days.length,1);assert.equal(v.daily.done.length,1);assert.equal(v.memories.length,1);
});
test('invalid past or future child guardianship date never activates an imported link',()=>{
 for(const day of [0,-3,'hello',NaN]){const c=L.clean({guardian:'player',guardianDay:day});assert.equal(c.guardian,null)}
});
test('child only appears in town before guardian is chosen',()=>{
 const f=fixture();assert.equal(f.sprout.hit(790,855,'town'),true);
 assert.equal(f.sprout.hit(790,855,'home'),false);
 f.setScene('home');assert.equal(f.sprout.hit(790,855,'town'),false);
});
test('the interactive child has a distinct drawn world character and label',()=>{
 const f=fixture(),calls=[],g={save(){},restore(){},fillRect(){calls.push('rect')},fillText(){calls.push('text')}};
 f.sprout.draw(g,{scene:'town',tick:3,drawSprite:(child,x,y)=>calls.push('sprite:'+child.id)});
 assert.ok(calls.includes('sprite:pip'));assert.ok(calls.includes('text'));
 calls.length=0;f.sprout.draw(g,{scene:'home',tick:3,drawSprite:()=>calls.push('sprite')});assert.equal(calls.length,0);
});
test('Pip cannot be managed through adult jobs, wages, romance, or marriages',()=>{
 const game=read('game.js');
 assert.match(game,/const NPCS=\[/);
 const adultBlock=game.slice(game.indexOf('const NPCS=['),game.indexOf('const HEX=n=>'));
 assert.doesNotMatch(adultBlock,/id:'pip'/);
 assert.match(game,/const littleSprouts=window\.HearthLittleSprouts\.setup/);
});
test('choosing an activity requires a real nearby physical visit',()=>{
 const f=fixture();f.setPlayer(100,500);
 assert.equal(f.sprout.canBegin('story'),false);assert.equal(f.sprout.begin('story'),false);
 assert.equal(f.saves,0);assert.equal(f.sprout.data.memories.length,0);
});
test('a nonlocal Daybook includes a way to walk to the real child in the game',()=>{
 const f=fixture();f.setPlayer(100,500);f.sprout.entry();
 assert.match(f.modal.html,/ls272-visit/);
 assert.match(f.modal.html,/Visit Pip in the playable world/);
});
test('first story requires three actual prompted choices',()=>{
 const f=fixture();assert.equal(f.sprout.begin('story'),true);
 assert.match(f.modal.html,/PART 1 OF 3/);
 assert.equal(f.sprout.status().memories.length,0);assert.equal(f.saves,0);
 assert.equal(f.sprout.choose(1),true);assert.equal(f.sprout.status().memories.length,0);
 assert.equal(f.sprout.page(),true);assert.match(f.modal.html,/PART 2 OF 3/);
 assert.equal(f.sprout.choose(0),true);assert.equal(f.sprout.page(),true);
 assert.match(f.modal.html,/PART 3 OF 3/);
 assert.equal(f.sprout.choose(1),true);assert.equal(f.sprout.status().memories.length,1);
 assert.equal(f.sprout.data.memories[0].choiceMask,5);
});
test('each playable activity improves the appropriate need, limited to once per day',()=>{
 const f=fixture();complete(f,'garden');
 assert.equal(f.sprout.data.needs.confidence,66);assert.equal(f.sprout.data.daily.done.length,1);
 assert.equal(f.sprout.begin('garden'),false);
 assert.equal(f.sprout.data.memories.length,1);
});
test('story, art and nature all have independent three-part playful choices',()=>{
 const f=fixture();for(const kind of ['story','art','garden'])complete(f,kind);
 assert.equal(f.sprout.data.daily.done.length,3);assert.equal(f.sprout.data.memories.length,3);
 assert.equal(f.sprout.status().careDays,1);assert.equal(f.sprout.status().ready,false);
});
test('canceled activity cannot award a child memory',()=>{
 const f=fixture();f.sprout.begin('story');f.sprout.choose(1);
 f.sprout.handle('ls272-cancel','');assert.equal(f.sprout.data.memories.length,0);
 assert.equal(f.sprout.status().careDays,0);assert.equal(f.saves,0);
});
test('wrong, negative and out-of-range choices never advance the game',()=>{
 const f=fixture();f.sprout.begin('art');
 assert.equal(f.sprout.choose(-1),false);assert.equal(f.sprout.choose(3),false);
 assert.equal(f.sprout.choose(NaN),false);assert.equal(f.sprout.session.step,0);
});
test('the current day changing interrupts a scene rather than awarding fabricated memories',()=>{
 const f=fixture();f.sprout.begin('story');f.sprout.choose(0);
 f.state.day++;assert.equal(f.sprout.page(),false);assert.equal(f.sprout.status().memories.length,0);
});
test('leaving the child location interrupts an unfinished activity without reward',()=>{
 const f=fixture();f.sprout.begin('story');f.sprout.choose(0);
 f.setScene('home');assert.equal(f.sprout.page(),false);
 assert.equal(f.sprout.status().memories.length,0);assert.equal(f.saves,0);
});
test('guardian invitation requires at least three distinct real days and all three kinds of care',()=>{
 const f=fixture();for(const kind of ['story','art','garden'])complete(f,kind);
 assert.equal(f.sprout.guardian(),false);
 f.state.day=6;complete(f,'story');assert.equal(f.sprout.guardian(),false);
 f.state.day=7;complete(f,'art');
 assert.equal(f.sprout.status().ready,true);assert.equal(f.sprout.status().careDays,3);
});
test('forged days list without real diverse memories never unlocks guardian choice',()=>{
 const f=fixture({youngResidents:{pip:L.clean({days:[1,2,3,4],memories:[]})}});
 assert.equal(f.sprout.status().careDays,4);assert.equal(f.sprout.status().ready,false);
 assert.equal(f.sprout.guardian(),false);
});
test('guardian choice is explicitly player-confirmed and never automatic',()=>{
 const f=fixture();for(const [day,kind] of [[5,'story'],[6,'garden'],[7,'art']]){f.state.day=day;complete(f,kind)}
 assert.equal(f.sprout.status().guardian,null);
 assert.equal(f.sprout.guardian(),true);
 assert.equal(f.sprout.status().guardian,'player');assert.equal(f.sprout.status().home,'player');
 assert.equal(f.sprout.status().guardianDay,7);assert.equal(f.saves,4);
 assert.equal(f.sprout.guardian(),false);
});
test('after guardian selection Pip physically moves from village to Poppy cottage',()=>{
 const f=fixture();for(const [day,kind] of [[5,'story'],[6,'garden'],[7,'art']]){f.state.day=day;complete(f,kind)}f.sprout.guardian();
 assert.equal(f.sprout.status().home,'player');
 f.setScene('home');f.setPlayer(715,766);
 assert.equal(f.sprout.hit(765,710,'home'),true);assert.equal(f.sprout.canBegin('story'),true);
 assert.equal(f.sprout.hit(790,855,'town'),false);
 const calls=[];f.sprout.draw({save(){},restore(){},fillRect(){},fillText(){}},{scene:'home',drawSprite:c=>calls.push(c.id)});
 assert.deepEqual(calls,['pip']);
});
test('guardian relation appears in actual family Atlas only after explicit real care',()=>{
 const f=fixture();
 const api={getState:()=>f.state,getPersonLabel:id=>id,getResidentHome:id=>({mabel:'h0',rosie:'h0'})[id],getYoungResident:()=>f.sprout.status(),showModal(){}};
 const atlas=A.setup(api);
 assert.equal(atlas.graph().nodes.length,8);
 assert.equal(atlas.graph().edges.filter(e=>e.kind==='guardian').length,0);
 for(const [day,kind] of [[5,'story'],[6,'garden'],[7,'art']]){f.state.day=day;complete(f,kind)}f.sprout.guardian();
 assert.equal(atlas.graph().edges.filter(e=>e.kind==='guardian').length,1);
 assert.equal(atlas.graph().households.find(h=>h.id==='player').people.includes('pip'),true);
 assert.equal(atlas.events().some(e=>e.kind==='guardian'&&e.day===7),true);
});
test('kinship never calls guardianship an adult marriage or a biological parent',()=>{
 const f=fixture();const api={getState:()=>f.state,getPersonLabel:id=>id,getResidentHome:()=>null,getYoungResident:()=>f.sprout.status(),showModal(){}};
 const atlas=A.setup(api);for(const [d,k] of [[5,'story'],[6,'garden'],[7,'art']]){f.state.day=d;complete(f,k)}f.sprout.guardian();
 const g=atlas.graph();assert.ok(g.edges.some(e=>e.kind==='guardian'&&e.ids.includes('pip')));
 assert.equal(g.edges.some(e=>e.kind==='marriage'&&e.ids.includes('pip')),false);
});
test('minigame does not award coins, create fake parents, or grant passive income',()=>{
 const f=fixture({coins:400,hearts:12,weddingPlans:{},familyRoots:{chosen:{}}});
 complete(f,'art');f.sprout.tick(1000);
 assert.equal(f.state.coins,400);assert.equal(f.state.hearts,12);
 assert.deepEqual(f.state.weddingPlans,{});assert.equal(f.sprout.status().guardian,null);
});
test('needs decay gently but cannot trigger punishment, eviction or a negative meter',()=>{
 const f=fixture();f.sprout.tick(9999);
 assert.ok(f.sprout.status().needs.joy>=20);assert.equal(f.sprout.status().guardian,null);
 assert.ok(f.sprout.data.needs.curiosity<=100);
});
test('child choices do not invoke remote APIs, payment calls or new localStorage keys',()=>{
 const src=read('little-sprouts-v272.js');assert.doesNotMatch(src,/fetch\(|WebSocket|XMLHttpRequest|setInterval|localStorage|new Image\(/);
});
test('iPhone loads Pip scripts before core and caches sprites, Atlas and UI offline',()=>{
 const html=read('index.html'),sw=read('sw.js'),game=read('game.js'),css=read('little-sprouts-v272.css');
 for(const file of ['little-sprouts-v272.js','little-sprouts-v272.css']){
  assert.ok(html.includes(file));assert.ok(sw.includes("'./"+file+"'"));
 }
 assert.ok(html.indexOf('little-sprouts-v272.js')<html.indexOf('game.js'));
 assert.match(html,/v=2\.8\.1/);assert.match(sw,/hearth-harbor-v281-growing-adventures/);
 assert.match(css,/:focus-visible/);assert.match(css,/@media\(max-width:380px\)/);
 assert.match(game,/youngResidents:\{pip:window\.HearthLittleSprouts\.clean\(raw\.youngResidents\?\.pip\)\}/);
 assert.match(game,/littleSprouts\.hit\(wx,wy,'town'\)/);
 assert.match(game,/littleSprouts\.draw\(ctx,\{scene,tick,drawSprite/);
 assert.match(game,/littleSprouts\.tick\(elapsed\)/);
 assert.match(game,/btn\('🌱 Pip & Little Sprouts','ls272-book'\)/);
 assert.match(game,/const SAVE='hearth-harbor-save-v1'/);
});

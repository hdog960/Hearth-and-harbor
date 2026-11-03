/* Hearth & Harbor v2.7.1 — evidence-based Family Connections Atlas QA */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const context={window:{}};vm.runInNewContext(read('family-atlas-v271.js'),context,{filename:'family-atlas-v271.js'});
vm.runInNewContext(read('family-portraits-v270.js'),context,{filename:'family-portraits-v270.js'});
const A=context.window.HearthFamilyAtlas,F=context.window.HearthFamilyPortraits;
function harness(overrides={}){
 const homes={mabel:'h0',rosie:'h0',oliver:'h1',jun:'h1',bea:'h2',finn:'h2'};
 const state={day:9,weddingPlans:{},familyRoots:{chosen:{},history:[]},householdMoves:[],...overrides};
 const pictures={};let modal=null,saves=0,opened=null;
 const api={getState:()=>state,getResidentHome:id=>homes[id],
  getPersonLabel:id=>id==='player'?'Poppy':id[0].toUpperCase()+id.slice(1),
  getHomeLabel:home=>home==='player'?'Poppy Cottage':'Home '+home,
  getPortraits:home=>pictures[home]||[],
  showModal:(key,html)=>{modal={key,html}},
  openPortraitAlbum:home=>{opened=home;return true},
  save:()=>saves++};
 const a=A.setup(api);
 const normalize=x=>JSON.parse(JSON.stringify(x));
 return {a,api,homes,state,pictures,normalize,get modal(){return modal},get opened(){return opened},get saves(){return saves}};
}
test('fresh save has eight actual residents including Pip and no invented bloodline links',()=>{
 const f=harness(),g=f.normalize(f.a.graph());
 assert.equal(g.nodes.length,8);assert.equal(g.households.length,7);
 assert.equal(g.edges.filter(e=>e.kind==='marriage'||e.kind==='chosen').length,0);
 assert.equal(g.nodes.find(n=>n.id==='player').home,'player');
 assert.equal(g.edges.filter(e=>e.kind==='household').length,3);
});
test('co-residents are not automatically married or chosen family',()=>{
 const f=harness(),links=f.a.graph().edges.filter(e=>e.key==='mabel|rosie');
 assert.equal(links.length,1);assert.equal(links[0].kind,'household');assert.equal(links[0].day,0);
});
test('an authoritative completed marriage creates a distinct formal link',()=>{
 const f=harness({weddingPlans:{'mabel|rosie':{status:'married',marriedDay:3}}});
 const links=f.normalize(f.a.graph().edges.filter(e=>e.key==='mabel|rosie'));
 assert.deepEqual(links.map(e=>e.kind),['marriage','household']);assert.equal(links[0].day,3);
});
test('engagement, scheduled wedding, forged IDs, future wedding cannot create family links',()=>{
 const f=harness({weddingPlans:{
 'mabel|rosie':{status:'engaged',marriedDay:1},
 'bea|oliver':{status:'scheduled',marriedDay:1},
 'mabel|mabel':{status:'married',marriedDay:2},
 'fake|rosie':{status:'married',marriedDay:2},
 'jun|oliver':{status:'married',marriedDay:25}
 }});
 assert.equal(f.a.graph().edges.filter(e=>e.kind==='marriage').length,0);
});
test('chosen-family bond is shown only when active and real',()=>{
 const f=harness({familyRoots:{chosen:{'mabel|rosie':{status:'active',home:'h0',day:4}}}});
 assert.equal(f.a.graph().edges.filter(e=>e.kind==='chosen').length,1);
 assert.equal(f.a.events().filter(e=>e.kind==='chosen').length,1);
});
test('an ended chosen-family link is preserved in history but not falsely active',()=>{
 const f=harness({familyRoots:{chosen:{'mabel|rosie':{status:'ended',home:'h0',day:3,endedDay:7}}}});
 assert.equal(f.a.graph().edges.filter(e=>e.kind==='chosen').length,0);
 assert.deepEqual(f.normalize(f.a.events().map(e=>e.kind)),['released','chosen']);
});
test('marriage takes display precedence over chosen-family without erasing its past',()=>{
 const f=harness({weddingPlans:{'mabel|rosie':{status:'married',marriedDay:6}},familyRoots:{chosen:{'mabel|rosie':{status:'active',day:2,home:'h0'}}}});
 const g=f.a.graph();
 assert.equal(g.edges.filter(e=>e.kind==='marriage').length,1);
 assert.equal(g.edges.filter(e=>e.kind==='chosen').length,0);
 assert.equal(f.a.events().filter(e=>e.kind==='chosen').length,1);
});
test('a marriage remains valid even when spouses live at different actual homes',()=>{
 const f=harness({weddingPlans:{'mabel|rosie':{status:'married',marriedDay:5}}});
 f.homes.rosie='h3';
 assert.equal(f.a.graph().edges.filter(e=>e.kind==='marriage').length,1);
 assert.equal(f.a.graph().edges.filter(e=>e.kind==='household'&&e.key==='mabel|rosie').length,0);
});
test('moves update housing only; a move does not manufacture a family bond',()=>{
 const f=harness({householdMoves:[{who:'rosie',with:'mabel',home:'h0',day:5}]});
 assert.equal(f.a.events().filter(e=>e.kind==='move').length,1);
 assert.equal(f.a.graph().edges.filter(e=>['marriage','chosen'].includes(e.kind)).length,0);
});
test('forged and future house moves never enter authentic timeline',()=>{
 const f=harness({householdMoves:[{who:'rosie',with:'rosie',home:'h0',day:2},{who:'rosie',with:'mabel',home:'h9',day:3},{who:'rosie',with:'mabel',home:'h0',day:30},{who:'mabel',with:'rosie',home:'h0',day:3}]});
 assert.equal(f.a.events().filter(e=>e.kind==='move').length,1);
});
test('verified portraits are linked to history but not treated as lineage',()=>{
 const f=harness();f.pictures.h0=[{pair:'mabel|rosie',theme:'story',day:4,link:'marriage',linkDay:2}];
 const timeline=f.normalize(f.a.events());
 assert.equal(timeline.length,1);assert.equal(timeline[0].kind,'portrait');
 assert.equal(f.a.graph().edges.filter(e=>e.kind==='marriage').length,0);
});
test('a portrait event requires real date, known theme and pair',()=>{
 const f=harness();f.pictures.h0=[{pair:'mabel|rosie',theme:'hack',day:2},{pair:'notreal|rosie',theme:'story',day:2},{pair:'mabel|rosie',theme:'story',day:21},{pair:'mabel|rosie',theme:'story',day:6}];
 assert.equal(f.a.events().filter(e=>e.kind==='portrait').length,1);
});
test('overview gives real seven-person record, six NPC homes and Poppy Cottage',()=>{
 const f=harness();f.a.overview();
 assert.equal(f.modal.key,'family-atlas');assert.match(f.modal.html,/Our Connections Atlas/);
 assert.match(f.modal.html,/Poppy Cottage/);assert.match(f.modal.html,/Home h5/);
 assert.doesNotMatch(f.modal.html,/Married partners/);
});
test('people, houses, and pair view work with responsive buttons',()=>{
 const f=harness({weddingPlans:{'mabel|rosie':{status:'married',marriedDay:3}}});
 f.a.handle('fa271-person','mabel');assert.match(f.modal.html,/Mabel/);
 f.a.handle('fa271-home','h0');assert.match(f.modal.html,/Current occupants/);
 f.a.handle('fa271-pair','mabel|rosie');assert.match(f.modal.html,/Married partners/);
 f.a.handle('fa271-board','');assert.match(f.modal.html,/People of Maplewood/);
});
test('invalid user-facing person/home/pair IDs safely return to overview',()=>{
 const f=harness();
 for(const [act,id] of [['fa271-person','<script>'],['fa271-home','h9'],['fa271-pair','notreal|rosie']]){
  f.a.handle(act,id);assert.match(f.modal.html,/Our Connections Atlas/);
 }
});
test('pair timeline never mixes unrelated couples into shared history',()=>{
 const f=harness({weddingPlans:{'mabel|rosie':{status:'married',marriedDay:3},'bea|finn':{status:'married',marriedDay:5}}});
 f.a.pairPage('mabel|rosie');
 assert.match(f.modal.html,/Day 3/);assert.doesNotMatch(f.modal.html,/Day 5/);
});
test('house record does not falsely relocate unrelated marriage events to current home',()=>{
 const f=harness({weddingPlans:{'mabel|rosie':{status:'married',marriedDay:3}}});
 f.a.home('h0');assert.match(f.modal.html,/Married partners/);
 assert.doesNotMatch(f.modal.html,/Day 3 · Married in Maplewood/);
});
test('tapping an authentic wall portrait opens its verified provenance',()=>{
 const f=harness();f.pictures.h0=[{home:'h0',pair:'mabel|rosie',theme:'story',day:5,link:'chosen',linkDay:3}];
 assert.equal(f.a.portrait('h0',0),true);
 assert.match(f.modal.html,/Our Storybook Afternoon/);assert.match(f.modal.html,/Day 5/);
 assert.match(f.modal.html,/chosen family/);assert.match(f.modal.html,/fa271-pair/);
});
test('nonexistent or nonresident picture index never opens invented details',()=>{
 const f=harness();
 for(const [home,i] of [['h0',0],['h9',0],['h0',-1],['h0',3],['player',0]])
  assert.equal(f.a.portrait(home,i),false);
 assert.equal(f.modal,null);
});
test('atlas navigation to already-built portrait album remains functional',()=>{
 const f=harness();f.a.handle('fa271-album','h0');assert.equal(f.opened,'h0');
 f.a.handle('fa271-album','bad');assert.equal(f.opened,'h0');
 f.a.handle('fa271-portraits','');assert.equal(f.opened,undefined);
});
test('no opening, exploring or tapping rewards currencies, mutates save, or creates kinship',()=>{
 const f=harness();const snapshot=JSON.stringify(f.state);
 f.a.overview();f.a.person('mabel');f.a.home('h0');f.a.pairPage('mabel|rosie');
 assert.equal(JSON.stringify(f.state),snapshot);assert.equal(f.saves,0);
});
test('display names from saves are HTML escaped in illustrated atlas',()=>{
 const f=harness();f.api.getPersonLabel=id=>id==='mabel'?'<img src=x onerror=alert(1)>':id;
 f.a.overview();
 assert.match(f.modal.html,/&lt;img/);assert.doesNotMatch(f.modal.html,/<img src=x/);
});
test('in-world picture hit detects only the actually drawn framed wall area',()=>{
 const env={window:{}};vm.runInNewContext(read('family-portraits-v270.js'),env);
 const X=env.window.HearthFamilyPortraits, state={day:9,weddingPlans:{'mabel|rosie':{status:'married',marriedDay:3}},
 familyPortraits:X.clean({portraits:[{home:'h0',pair:'mabel|rosie',theme:'story',day:6,link:'marriage',linkDay:3}]})};
 const x=X.setup({getState:()=>state,getHomeMembers:()=>['mabel','rosie']});
 assert.equal(x.hit('h0',459,375),0);assert.equal(x.hit('h0',750,390),-1);
 assert.equal(x.hit('h1',459,375),-1);assert.equal(x.hit('h0',459,490),-1);
});
test('iPhone load order, offline assets, menu and wall interaction are all wired',()=>{
 const html=read('index.html'),sw=read('sw.js'),game=read('game.js'),css=read('family-atlas-v271.css');
 for(const file of ['family-atlas-v271.js','family-atlas-v271.css']){assert.ok(html.includes(file));assert.ok(sw.includes("'./"+file+"'"))}
 assert.ok(html.indexOf('family-atlas-v271.js')<html.indexOf('game.js'));
 assert.match(html,/v=2\.7\.8/);assert.match(sw,/hearth-harbor-v278-independent-projects/);
 assert.match(css,/:focus-visible/);assert.match(css,/@media\(max-width:380px\)/);assert.match(css,/prefers-reduced-motion/);
 for(const hook of ['window.HearthFamilyAtlas.setup({','familyAtlas.portrait(activeResidence,portraitIndex)','familyPortraits.hit(activeResidence,wx,wy)','familyAtlas.handle(action,id)',"btn('🌳 Connections Atlas','fa271-board')"])assert.ok(game.includes(hook),hook);
 assert.doesNotMatch(game,/fp27-board'\)\}\}/);
});
test('read-only atlas has no added service, timer, network connection or independent storage key',()=>{
 const source=read('family-atlas-v271.js');
 assert.doesNotMatch(source,/fetch\(|WebSocket|XMLHttpRequest|setInterval|localStorage|new Image\(/);
});

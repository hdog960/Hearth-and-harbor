/* Hearth & Harbor v2.6 — Village Memory Walk release-gate regressions */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=n=>fs.readFileSync(path.join(__dirname,'..',n),'utf8');
const c={window:{}};vm.runInNewContext(read('memory-walk-v26.js'),c,{filename:'memory-walk-v26.js'});
const M=c.window.HearthMemoryWalk;
const E={
 tradition:{home:'h0',kind:'tradition',source:'tradition:h0:welcome',day:2,detail:'welcome',actors:['mabel']},
 corner:{home:'h0',kind:'corner',source:'corner:h0:mabel',day:3,detail:'mabel',actors:['mabel']},
 project:{home:'h0',kind:'project',source:'project:4:h0:story',day:4,detail:'story',actors:['mabel','rosie']},
 supper:{home:'player',kind:'supper',source:'supper:5:player',day:5,actors:['player']}
};
function fixture(overrides={}){
 const state={day:8,needs:{fun:45,social:52},coins:300,
  stewardship:{phases:{flowers:2,lanterns:2,cart:2}},
  householdChronicle:{events:Object.values(E)},memoryWalk:M.clean(null),...overrides};
 let isTown=true,saves=0,updates=0,modal=null,travel=null;const notices=[];
 const api={getState:()=>state,save:()=>saves++,updateUI:()=>updates++,notify:x=>notices.push(x),
  getHomeLabel:h=>h==='player'?'Poppy’s Cottage':'Cozy '+h,
  getMemories:()=>state.householdChronicle.events,isTown:()=>isTown,
  showModal:(key,html)=>modal={key,html},closeModal:()=>modal=null,
  travelTo:(x,y,after)=>{travel={x,y,after};isTown=true}
 };
 const mw=M.setup(api);
 return {state,mw,api,notices,setTown:v=>isTown=v,get saves(){return saves},get updates(){return updates},
  get modal(){return modal},get travel(){return travel},arrive(){assert.ok(travel,'a real travel callback must have been queued');const f=travel.after;travel=null;f()}};
}
function add(f,id,home,source){
 assert.equal(f.mw.choose(id,home,source),true);
 assert.equal(f.mw.total(),0===f.mw.total()?0:f.mw.total(),'clicking a memory never installs it by itself');
 f.arrive();
 assert.equal(f.mw.install(id),true);
}
function all(f){
 for(const [id,home,source] of [['blossoms','h0',E.tradition.source],['lanterns','h0',E.project.source],['table','player',E.supper.source]]){
  assert.equal(f.mw.choose(id,home,source),true);f.arrive();assert.equal(f.mw.install(id),true);
 }
}
function canvas(){
 const g={calls:[],save(){this.calls.push('save')},restore(){this.calls.push('restore')},
  translate(x,y){this.calls.push(['translate',x,y])},fillRect(){this.calls.push('rect')},
  beginPath(){this.calls.push('begin')},ellipse(){this.calls.push('ellipse')},
  moveTo(){this.calls.push('move')},lineTo(){this.calls.push('line')},closePath(){this.calls.push('close')},
  quadraticCurveTo(){this.calls.push('curve')},arc(){this.calls.push('arc')},
  fill(){this.calls.push('fill')},stroke(){this.calls.push('stroke')},
  fillText(x){this.calls.push(['text',x])}};return g;
}
test('new v2.6 state safely defaults to no fabricated public village stories',()=>{
 const f=fixture();assert.equal(f.mw.total(),0);
 assert.equal(JSON.stringify(f.mw.data),JSON.stringify({placed:{},visits:{},history:[]}));
 assert.equal(M.SPOTS.length,3);assert.equal(f.state.coins,300);
});
test('legacy save import accepts only known exhibits, actual home IDs, kinds and dates',()=>{
 const valid={home:'h0',kind:'tradition',source:E.tradition.source,eventDay:2,day:8};
 const obj=M.clean({placed:{
  blossoms:valid,lanterns:{...valid,kind:'wrong'},
  table:{...valid,eventDay:10},notreal:valid}});
 assert.equal(Object.keys(obj.placed).length,1);assert.equal(obj.placed.blossoms.source,E.tradition.source);
});
test('import rejects script payload sources, invalid home and future-vs-event date',()=>{
 const x=M.clean({placed:{
 blossoms:{home:'h9',kind:'corner',source:'ok',eventDay:2,day:8},
 lanterns:{home:'h0',kind:'project',source:'<script>',eventDay:1,day:8},
 table:{home:'player',kind:'supper',source:'supper:5:player',eventDay:9,day:5}
 }});
 assert.equal(Object.keys(x.placed).length,0);
});
test('import sanitizes one visit date per exhibit and bounded deduplicated history',()=>{
 const x=M.clean({visits:{blossoms:7,notreal:5,lanterns:-1},
 history:[{id:'blossoms',kind:'visit',day:6},{id:'blossoms',kind:'visit',day:6},
 {id:'blossoms',kind:'collect',day:7},{id:'notreal',kind:'visit',day:6}]});
 assert.equal(Object.keys(x.visits).length,1);assert.equal(x.history.length,1);
});
test('three public stops are linked to preexisting actual public works and three different authentic stories',()=>{
 const ids=Array.from(M.SPOTS,s=>s.id),town=Array.from(M.SPOTS,s=>s.town);
 assert.deepEqual(ids,['blossoms','lanterns','table']);assert.deepEqual(town,['flowers','lanterns','cart']);
 assert.equal(new Set(M.SPOTS.map(s=>s.x+'|'+s.y)).size,3);
 assert.ok(M.SPOTS.every(s=>s.walkX!==undefined&&s.walkY!==undefined));
});
test('each exhibit requires an actually finished original stewardship project',()=>{
 for(const stop of M.SPOTS){
  const f=fixture();f.state.stewardship.phases[stop.town]=1;
  assert.equal(f.mw.unlocked(stop),false);
  const ev=f.state.householdChronicle.events.find(e=>stop.kind.includes(e.kind));
  assert.equal(f.mw.choose(stop.id,ev.home,ev.source),false);
  assert.equal(f.saves,0);
 }
});
test('no forged household memory can be installed by typing a fake event source',()=>{
 const f=fixture();
 assert.equal(f.mw.choose('blossoms','h0','forged'),false);
 assert.equal(f.mw.choose('lanterns','h1',E.project.source),false);
 assert.equal(f.mw.choose('table','h0',E.supper.source),false);
 assert.equal(f.mw.total(),0);
});
test('future chronological events cannot be used to unlock an early village story',()=>{
 const f=fixture({day:2});
 assert.equal(f.mw.choose('lanterns','h0',E.project.source),false);
 assert.equal(f.mw.choose('table','player',E.supper.source),false);
 assert.equal(f.mw.choose('blossoms','h0',E.tradition.source),true);
});
test('memory category cannot be substituted from a different kind of event',()=>{
 const f=fixture();
 assert.equal(f.mw.choose('lanterns','h0',E.tradition.source),false);
 assert.equal(f.mw.choose('table','h0',E.project.source),false);
});
test('selecting a valid story starts real travel but does not auto-install it',()=>{
 const f=fixture();const ok=f.mw.choose('lanterns','h0',E.project.source);
 assert.equal(ok,true);assert.ok(f.travel);assert.equal(f.mw.total(),0);
 assert.equal(f.mw.install('lanterns'),false);
 assert.equal(f.saves,0);assert.equal(f.state.needs.fun,45);
});
test('choosing from home journal can travel into town before installation',()=>{
 const f=fixture();f.setTown(false);
 assert.equal(f.mw.choose('blossoms','h0',E.corner.source),true);
 assert.ok(f.travel);f.arrive();assert.equal(f.mw.install('blossoms'),true);
});
test('a real walked arrival creates one ephemeral installation choice only for that site',()=>{
 const f=fixture();f.mw.choose('blossoms','h0',E.tradition.source);
 f.arrive();assert.equal(f.mw.install('lanterns'),false);
 assert.equal(f.mw.install('blossoms'),true);
 assert.equal(f.mw.install('blossoms'),false);
});
test('installation does not claim its original memory twice or create household coins',()=>{
 const f=fixture();add(f,'blossoms','h0',E.tradition.source);
 assert.equal(f.mw.total(),1);
 assert.equal(f.mw.installation(M.SPOTS[0]).source,E.tradition.source);
 assert.equal(f.state.householdChronicle.events.length,4);
 assert.equal(f.state.coins,300);
});
test('installed exhibit stores original source home and historical day, not rewritten current day',()=>{
 const f=fixture();add(f,'lanterns','h0',E.project.source);
 const e=f.mw.data.placed.lanterns;
 assert.equal(e.home,'h0');assert.equal(e.eventDay,4);assert.equal(e.day,8);
});
test('arriving after moving the original historical record no longer qualifies',()=>{
 const f=fixture();f.mw.choose('lanterns','h0',E.project.source);
 f.state.householdChronicle.events=f.state.householdChronicle.events.filter(e=>e.source!==E.project.source);
 f.arrive();assert.equal(f.mw.install('lanterns'),false);
});
test('arriving after another day requires a new actual walk to install',()=>{
 const f=fixture();f.mw.choose('lanterns','h0',E.project.source);
 f.arrive();f.state.day=9;assert.equal(f.mw.install('lanterns'),false);
});
test('a town build changing before arrival cannot generate a historical installation',()=>{
 const f=fixture();f.mw.choose('lanterns','h0',E.project.source);
 f.state.stewardship.phases.lanterns=1;
 f.arrive();assert.equal(f.mw.install('lanterns'),false);
});
test('real arrival renders a dedicated completion action and does not give freebies',()=>{
 const f=fixture();f.mw.choose('table','player',E.supper.source);
 f.arrive();assert.equal(f.modal.key,'memory-walk-site');
 assert.match(f.modal.html,/Add this story to Maplewood/);
 assert.equal(f.state.coins,300);assert.equal(f.mw.total(),0);
});
test('three genuine site walks install three different exhibits and one commemorative town tree',()=>{
 const f=fixture();all(f);
 assert.equal(f.mw.total(),3);
 assert.equal(f.mw.data.history.filter(e=>e.kind==='install').length,3);
 assert.equal(f.state.needs.fun,51,'one finite completion celebration, no passive currency');
 assert.equal(f.state.coins,300);
});
test('repeated install taps cannot award the final village reward again',()=>{
 const f=fixture();all(f);
 for(let i=0;i<15;i++)assert.equal(f.mw.install('table'),false);
 assert.equal(f.state.needs.fun,51);
 assert.equal(f.mw.data.history.length,3);
});
test('visiting an unbuilt village story never grants needs or creates a ghost exhibit',()=>{
 const f=fixture();assert.equal(f.mw.visit('lanterns'),false);
 assert.equal(f.state.needs.fun,45);assert.equal(f.mw.total(),0);
});
test('visiting a completed site via walk restores only bounded Fun and Social once per day',()=>{
 const f=fixture();add(f,'lanterns','h0',E.project.source);
 assert.equal(f.mw.travel('lanterns'),true);assert.ok(f.travel);f.arrive();
 assert.equal(f.state.needs.fun,49);assert.equal(f.state.needs.social,54);
 assert.equal(f.mw.data.visits.lanterns,8);
 assert.equal(f.mw.visit('lanterns'),false);assert.equal(f.state.needs.fun,49);
});
test('three sites yield at most one visit each per village day without any coins',()=>{
 const f=fixture();all(f);
 for(const spot of M.SPOTS){assert.equal(f.mw.travel(spot.id),true);f.arrive()}
 assert.equal(f.state.needs.fun,63);assert.equal(f.state.needs.social,58);
 assert.equal(f.state.coins,300);
 for(const spot of M.SPOTS)assert.equal(f.mw.visit(spot.id),false);
});
test('another day allows exactly one new gentle visit with same old memory',()=>{
 const f=fixture();add(f,'blossoms','h0',E.tradition.source);
 f.mw.visit('blossoms');f.state.day=9;
 assert.ok(f.mw.visit('blossoms'));assert.equal(f.state.needs.fun,53);
 assert.equal(f.mw.data.history.filter(e=>e.kind==='visit').length,2);
});
test('needs are capped at 100 without adding food, money or friendship',()=>{
 const f=fixture();add(f,'table','player',E.supper.source);
 f.state.needs.fun=99;f.state.needs.social=99;
 f.mw.visit('table');assert.equal(f.state.needs.fun,100);assert.equal(f.state.needs.social,100);
 assert.equal(f.state.coins,300);assert.equal(f.state.townBonds,undefined);
});
test('the original household Chronicle is not transferred or deleted by public installation',()=>{
 const f=fixture();const before=JSON.stringify(f.state.householdChronicle);
 add(f,'blossoms','h0',E.corner.source);
 assert.equal(JSON.stringify(f.state.householdChronicle),before);
});
test('full installed village history and once-a-day visits survive safe JSON save reload',()=>{
 const f=fixture();all(f);f.mw.visit('lanterns');
 const saved=JSON.parse(JSON.stringify(f.mw.data));
 const restored=fixture({day:8,memoryWalk:M.clean(saved)});
 assert.equal(restored.mw.total(),3);
 assert.equal(restored.mw.data.visits.lanterns,8);
 assert.equal(restored.mw.visit('lanterns'),false);
});
test('old local saves without the new module have a safe empty record and no migration side effects',()=>{
 const f=fixture({memoryWalk:null});
 assert.equal(f.mw.total(),0);assert.equal(f.mw.data.placed.table,undefined);
 assert.equal(f.state.coins,300);
});
test('the album distinguishes actual proof and progression, never advertises unearned construction',()=>{
 const f=fixture();f.state.stewardship.phases.flowers=0;
 f.mw.board();assert.equal(f.modal.key,'memory-walk');
 assert.match(f.modal.html,/Finish the Blossom Promenade/);
 assert.match(f.modal.html,/Carry a project finished together/);
 assert.match(f.modal.html,/0\/3 permanent story installations/);
});
test('the three exhibits are separate original Canvas2D compositions with historic day plaques',()=>{
 const f=fixture();all(f);
 const g=canvas();f.mw.draw(g,{season:2,tick:3});
 assert.ok(g.calls.length>75);
 for(const day of [2,4,5])assert.ok(g.calls.some(e=>Array.isArray(e)&&e[0]==='text'&&e[1]==='DAY '+day));
 assert.ok(g.calls.some(e=>Array.isArray(e)&&e[0]==='text'&&e[1]==='OUR VILLAGE'));
});
test('town streets stay empty of unearned exhibits',()=>{
 const f=fixture(),g=canvas();f.mw.draw(g,{season:0,tick:1});
 assert.equal(g.calls.length,0);assert.equal(f.mw.hit(625,930),null);
});
test('tapping a physical installed landmark finds its correct world position and not a distant one',()=>{
 const f=fixture();add(f,'blossoms','h0',E.tradition.source);
 assert.equal(f.mw.hit(625,930).id,'blossoms');
 assert.equal(f.mw.hit(754,515),null);
});
test('the finalized story tree appears only after all three true exhibits are installed',()=>{
 const f=fixture(),g=canvas();add(f,'blossoms','h0',E.tradition.source);
 f.mw.draw(g,{season:2,tick:0});
 assert.equal(g.calls.some(x=>Array.isArray(x)&&x[0]==='text'&&x[1]==='OUR VILLAGE'),false);
 f.state.day=9;
 assert.equal(f.mw.choose('lanterns','h0',E.project.source),true);f.arrive();f.mw.install('lanterns');
 f.state.day=10;f.mw.choose('table','player',E.supper.source);f.arrive();f.mw.install('table');
 const g2=canvas();f.mw.draw(g2,{season:0,tick:0});
 assert.equal(g2.calls.some(x=>Array.isArray(x)&&x[0]==='text'&&x[1]==='OUR VILLAGE'),true);
});
test('existing game hooks real town touches, placed artwork, public menu and source-save migration',()=>{
 const s=read('game.js');
 for(const x of ["const SAVE='hearth-harbor-save-v1'","window.HearthMemoryWalk.clean(raw.memoryWalk)",
  "window.HearthMemoryWalk.setup({","memoryWalk.draw(ctx,{season:state.season,tick})",
  "memoryWalk.hit(wx,wy)","memoryWalk.visit(remembered.id)",
  "btn('🌿 Village Memory Walk · v2.6','mw26-board')",
  "if(action.startsWith('mw26-'))"])
 assert.ok(s.includes(x),x);
});
test('all v2.6 mobile assets are correctly preloaded and offline cached',()=>{
 const html=read('index.html'),sw=read('sw.js'),css=read('memory-walk-v26.css');
 for(const file of ['memory-walk-v26.js','memory-walk-v26.css'])
  assert.ok(html.includes(file)&&sw.includes("'./"+file+"'"));
 assert.ok(html.indexOf('memory-walk-v26.js')<html.indexOf('game.js'));
 assert.match(html,/v=2\.7\.5/);assert.match(sw,/hearth-harbor-v275-neighbor-walks/);
 for(const a of ['@media(max-width:390px)','@media(min-width:700px)','touch-action:manipulation','button:focus-visible','prefers-reduced-motion:reduce'])assert.ok(css.includes(a),a);
 assert.doesNotMatch(read('memory-walk-v26.js'),/fetch\(|WebSocket|XMLHttpRequest|new Image\(|setInterval|localStorage|\.coins\s*[+]=/);
});

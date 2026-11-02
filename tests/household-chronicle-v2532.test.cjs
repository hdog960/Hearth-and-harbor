/* Hearth & Harbor v2.5.32 — Household Chronicle regression */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=n=>fs.readFileSync(path.join(__dirname,'..',n),'utf8');
const ctx={window:{}};vm.runInNewContext(read('household-chronicle-v2532.js'),ctx,{filename:'household-chronicle-v2532.js'});
const M=ctx.window.HearthHouseholdChronicle;
function harness(save={}){
 const state={day:12,coins:250,townBonds:{},householdChronicle:M.clean(null),
  householdMoves:[],roommateProjects:{history:[]},familyTable:{memories:[]},homeTraditions:{homes:{}},personalCorners:{memories:[],counts:{}},...save};
 let saves=0,updates=0,modal={key:'',html:''},alerts=[];
 const names={mabel:'Mabel',rosie:'Rosie',oliver:'Oliver',jun:'Jun',bea:'Bea',finn:'Finn',player:'Poppy'};
 const api={getState:()=>state,save:()=>saves++,updateUI:()=>updates++,notify:x=>alerts.push(x),
  getHomeLabel:h=>'Apartment '+h,getPersonLabel:id=>names[id]||id,
  showModal:(key,html)=>modal={key,html},back:()=>modal={key:'daybook',html:'The household Daybook'}};
 const memory=M.setup(api);
 return {state,memory,api,get saves(){return saves},get updates(){return updates},get modal(){return modal},get alerts(){return alerts}};
}
const entry=(home,day,kind,source,actors,detail='')=>({home,day,kind,source,actors,detail});
function canvas(){const c={calls:[],save(){this.calls.push('save')},restore(){this.calls.push('restore')},translate(x,y){this.calls.push(['move',x,y])},fillRect(){this.calls.push('rect')},beginPath(){this.calls.push('begin')},ellipse(){this.calls.push('ellipse')},arc(){this.calls.push('arc')},fill(){this.calls.push('fill')},stroke(){this.calls.push('stroke')},moveTo(){this.calls.push('line')},lineTo(){this.calls.push('line')},closePath(){this.calls.push('close')},fillText(t){this.calls.push(['text',t])}};return c}
test('legacy saves create seven separate home archives and no phantom portraits',()=>{
 const h=harness();assert.equal(M.HOMES.length,7);
 assert.equal(h.memory.data.events.length,0);assert.equal(Object.keys(h.memory.data.pins).length,7);
 for(const id of M.HOMES)assert.equal(h.memory.comfort(id),0);
});
test('import rejects unknown homes, kinds, forged sources and unreasonable days',()=>{
 const imported=M.clean({events:[
  entry('h0',1,'move','move:1:mabel:rosie',['mabel','rosie']),
  entry('h9',1,'move','fake',['mabel','rosie']),
  entry('h0',1,'unknown','unknown:1',['mabel']),
  entry('h0',-1,'supper','supper:-1:h0',['mabel']),
  entry('h0',1,'supper','<svg>',['mabel']),
  entry('h0',1,'corner','corner:h0:mabel',['hacker'],'mabel'),
  entry('h0',1,'project','project:1:h0:notreal',['mabel','rosie'],'notreal')
 ]});
 assert.equal(imported.events.length,1);
 assert.equal(imported.events[0].source,'move:1:mabel:rosie');
});
test('duplicate real source cannot be inserted twice or award any bonus',()=>{
 const h=harness(),e=entry('h0',2,'move','move:2:mabel:rosie',['mabel','rosie']);
 assert.equal(h.memory.record(e),true);
 assert.equal(h.memory.record(e),false);
 assert.equal(h.memory.data.events.length,1);
 assert.equal(h.state.coins,250);assert.equal(h.state.townBonds['mabel|rosie'],undefined);
});
test('future dates cannot be forged through direct recording',()=>{
 const h=harness();assert.equal(h.memory.record(entry('h0',13,'supper','supper:13:h0',['mabel'])),false);
 assert.equal(h.memory.data.events.length,0);
});
test('existing genuine moves are backfilled from the old housing history',()=>{
 const h=harness({householdMoves:[{home:'h0',who:'mabel',with:'rosie',day:3}]});
 assert.equal(h.memory.collect(),1);
 assert.equal(h.memory.data.events[0].kind,'move');
 assert.equal(h.memory.data.events[0].day,3);
 assert.equal(h.memory.collect(),0,'an unchanged history never duplicates itself');
});
test('existing authentic roommate project completions are recovered by type and household',()=>{
 const h=harness({roommateProjects:{history:[
  {day:4,home:'h0',project:'story',pair:['mabel','rosie']},
  {day:5,home:'h1',project:'morning',pair:['oliver','jun']}
 ]}});
 assert.equal(h.memory.collect(),2);
 assert.equal(h.memory.data.events.find(x=>x.home==='h0').detail,'story');
 assert.equal(h.memory.data.events.find(x=>x.home==='h1').detail,'morning');
});
test('real family supper memories backfill both cottage and neighbor households',()=>{
 const h=harness({familyTable:{memories:[
  {home:'player',day:3,recipe:'toast',quality:2,topic:'memory',guests:[]},
  {home:'h2',day:4,recipe:'soup',quality:3,topic:'celebrate',guests:['bea','finn']}
 ]}});
 assert.equal(h.memory.collect(),2);
 assert.equal(h.memory.data.events.find(x=>x.home==='player').actors[0],'player');
 assert.equal(h.memory.data.events.find(x=>x.home==='h2').actors.length,2);
});
test('completed old three-chapter traditions are not lost during an update',()=>{
 const h=harness({homeTraditions:{homes:{
  player:{welcome:{completedDay:4,memories:[{day:4,actor:'player',kind:'home'}]}},
  h0:{orchard:{completedDay:9,memories:[{day:7,actor:'mabel',kind:'home'},{day:9,actor:'rosie',kind:'home'}]}}
 }}});
 assert.equal(h.memory.collect(),2);
 assert.equal(h.memory.data.events.find(x=>x.home==='h0').detail,'orchard');
 assert.equal(h.memory.data.events.find(x=>x.home==='player').detail,'welcome');
});
test('old personal corner keepsakes backfill only after three genuine days',()=>{
 const h=harness({personalCorners:{counts:{'h0|mabel':3,'h0|rosie':2},memories:[
  {home:'h0',id:'mabel',day:2},{home:'h0',id:'mabel',day:3},{home:'h0',id:'mabel',day:4},
  {home:'h0',id:'rosie',day:2},{home:'h0',id:'rosie',day:3}
 ]}});
 assert.equal(h.memory.collect(),1);
 assert.equal(h.memory.data.events[0].kind,'corner');
 assert.equal(h.memory.data.events[0].day,4);
});
test('reconcile combines all five memory types from legacy save without duplicating on reload',()=>{
 const h=harness({householdMoves:[{home:'h0',who:'mabel',with:'rosie',day:2}],
  familyTable:{memories:[{home:'h0',day:3,guests:['mabel','rosie']}]},
  roommateProjects:{history:[{home:'h0',day:4,project:'morning',pair:['mabel','rosie']}]},
  homeTraditions:{homes:{h0:{welcome:{completedDay:5,memories:[]}}}},
  personalCorners:{counts:{'h0|mabel':3},memories:[{home:'h0',id:'mabel',day:2},{home:'h0',id:'mabel',day:3},{home:'h0',id:'mabel',day:6}]}
 });
 assert.equal(h.memory.collect(),5);
 const again=harness({...h.state,householdChronicle:M.clean(JSON.parse(JSON.stringify(h.memory.data)))});
 assert.equal(again.memory.collect(),0);
 assert.equal(again.memory.data.events.length,5);
});
test('each home displays only its own events and never fabricates a memory for an empty home',()=>{
 const h=harness();h.memory.record(entry('h0',4,'supper','supper:4:h0',['mabel','rosie']));
 h.memory.board('h1');assert.match(h.modal.html,/no completed memories/i);assert.doesNotMatch(h.modal.html,/Around the Family Table/);
 h.memory.board('h0');assert.match(h.modal.html,/Around the Family Table/);
});
test('player can pin two distinct real memories for one residence, without paying',()=>{
 const h=harness();for(let i=1;i<=3;i++)h.memory.record(entry('h0',i,'supper','supper:'+i+':h0',['mabel','rosie']));
 assert.equal(h.memory.toggle('h0','supper:1:h0'),true);
 assert.equal(h.memory.toggle('h0','supper:2:h0'),true);
 assert.equal(h.memory.comfort('h0'),2);
 assert.equal(h.memory.toggle('h0','supper:3:h0'),false);
 assert.equal(h.memory.comfort('h0'),2);assert.equal(h.state.coins,250);
});
test('unpinning a displayed memory frees a slot for another earned moment',()=>{
 const h=harness();for(let i=1;i<=3;i++)h.memory.record(entry('h0',i,'supper','supper:'+i+':h0',['mabel','rosie']));
 h.memory.toggle('h0','supper:1:h0');h.memory.toggle('h0','supper:2:h0');
 assert.equal(h.memory.toggle('h0','supper:1:h0'),true);
 assert.equal(h.memory.toggle('h0','supper:3:h0'),true);
 assert.deepEqual(Array.from(h.memory.data.pins.h0),['supper:2:h0','supper:3:h0']);
});
test('cannot pin a forged or borrowed memory from another household',()=>{
 const h=harness();h.memory.record(entry('h0',2,'supper','supper:2:h0',['mabel']));
 assert.equal(h.memory.toggle('h1','supper:2:h0'),false);
 assert.equal(h.memory.toggle('h0','notreal'),false);
 assert.equal(h.saves,0);
});
test('pins survive save reload, and preserve home-specific event captions',()=>{
 const h=harness();h.memory.record(entry('h0',2,'move','move:2:mabel:rosie',['mabel','rosie']));
 h.memory.toggle('h0','move:2:mabel:rosie');
 const next=harness({householdChronicle:M.clean(JSON.parse(JSON.stringify(h.memory.data)))});
 assert.equal(next.memory.comfort('h0'),1);
 assert.equal(next.memory.comfort('h1'),0);
 assert.match(next.memory.body(next.memory.displayed('h0')[0]),/Mabel and Rosie/);
});
test('archive retains newest 60 real memories per home in chronological order',()=>{
 const h=harness({day:500});
 for(let day=1;day<=80;day++)h.memory.record(entry('h0',day,'supper','supper:'+day+':h0',['mabel']));
 assert.equal(h.memory.data.events.length,60);
 assert.equal(h.memory.data.events[0].day,21);
 assert.equal(h.memory.data.events.at(-1).day,80);
});
test('all seven homes archive separately so a full first home does not delete another',()=>{
 const h=harness({day:500});
 for(let day=1;day<=75;day++)h.memory.record(entry('h0',day,'supper','supper:'+day+':h0',['mabel']));
 h.memory.record(entry('h1',1,'supper','supper:1:h1',['oliver']));
 assert.equal(h.memory.data.events.filter(e=>e.home==='h0').length,60);
 assert.equal(h.memory.data.events.filter(e=>e.home==='h1').length,1);
});
test('pinned art is physically drawn on the actual Canvas2D room surface',()=>{
 const h=harness();h.memory.record(entry('h0',2,'move','move:2:mabel:rosie',['mabel','rosie']));
 const c=canvas();h.memory.draw(c,'h0');assert.equal(c.calls.length,0);
 h.memory.toggle('h0','move:2:mabel:rosie');h.memory.draw(c,'h0');
 assert.ok(c.calls.length>14);
 assert.ok(c.calls.some(x=>Array.isArray(x)&&x[0]==='text'&&x[1]==='DAY 2'));
});
test('the second memory produces a second physical frame, not a repeated display',()=>{
 const h=harness();for(let i=1;i<=2;i++){h.memory.record(entry('h0',i,'supper','supper:'+i+':h0',['mabel']));h.memory.toggle('h0','supper:'+i+':h0')}
 const c=canvas();h.memory.draw(c,'h0');
 assert.equal(c.calls.filter(x=>Array.isArray(x)&&x[0]==='move').length,2);
 assert.equal(c.calls.filter(x=>Array.isArray(x)&&x[0]==='text').length,2);
});
test('different memory categories render differently without stock art or network',()=>{
 const kinds=[['move','', ['mabel','rosie']],['project','story',['mabel','rosie']],['supper','',['mabel']],['tradition','welcome',['mabel']],['corner','mabel',['mabel']]];
 for(let i=0;i<kinds.length;i++){
  const [kind,detail,actors]=kinds[i],h=harness();
  const source=kind+':'+i+':h0';h.memory.record(entry('h0',2,kind,source,actors,detail));h.memory.toggle('h0',source);
  const c=canvas();h.memory.draw(c,'h0');
  assert.ok(c.calls.length>14,kind);
 }
 assert.doesNotMatch(read('household-chronicle-v2532.js'),/fetch\(|XMLHttpRequest|WebSocket|new Image\(/);
});
test('household selector and button actions are genuine, accessible UI controls',()=>{
 const h=harness();h.memory.record(entry('h0',2,'supper','supper:2:h0',['mabel']));
 h.memory.handle('hc32-board','h0','player');
 assert.equal(h.modal.key,'household-chronicle');
 assert.equal((h.modal.html.match(/data-act="hc32-view"/g)||[]).length,7);
 assert.match(h.modal.html,/aria-pressed/);
 h.memory.handle('hc32-pin','h0|supper:2:h0','player');
 assert.equal(h.memory.comfort('h0'),1);assert.equal(h.saves,1);
 h.memory.handle('hc32-back',null,'player');assert.equal(h.modal.key,'daybook');
});
test('the journal never awards needs, coins, housing wages or relationship scores',()=>{
 const h=harness(),oldCoins=h.state.coins,oldBonds=JSON.stringify(h.state.townBonds);
 h.memory.record(entry('h0',2,'move','move:2:mabel:rosie',['mabel','rosie']));
 h.memory.toggle('h0','move:2:mabel:rosie');h.memory.board('h0');h.memory.draw(canvas(),'h0');
 assert.equal(h.state.coins,oldCoins);assert.equal(JSON.stringify(h.state.townBonds),oldBonds);
});
test('real game connects Chronicle to moves, real activities, Studio, saves, scene and home comfort',()=>{
 const s=read('game.js');
 for(const token of ["window.HearthHouseholdChronicle.clean(raw.householdChronicle)","window.HearthHouseholdChronicle.setup({",
  "chronicle.collect();","chronicle.comfort(home)","chronicle.comfort('player')",
  "chronicle.draw(ctx,activeResidence)","chronicle.draw(ctx,'player')",
  "btn('📖 Household Chronicle','hc32-board')",
  "if(action.startsWith('hc32-'))"])
  assert.ok(s.includes(token),token);
});
test('iPhone scripts, CSS, cache and save key are safe',()=>{
 const html=read('index.html'),sw=read('sw.js'),css=read('household-chronicle-v2532.css');
 for(const name of ['household-chronicle-v2532.js','household-chronicle-v2532.css'])assert.ok(html.includes(name)&&sw.includes("'./"+name+"'"));
 assert.ok(html.indexOf('household-chronicle-v2532.js')<html.indexOf('game.js'));
 assert.match(sw,/const CACHE='hearth-harbor-v[0-9]+-[a-z-]+'/);
 assert.match(read('game.js'),/const SAVE='hearth-harbor-save-v1'/);
 for(const key of ['@media(max-width:390px)','@media(min-width:660px)','touch-action:manipulation','button:focus-visible','prefers-reduced-motion:reduce'])assert.ok(css.includes(key),key);
});

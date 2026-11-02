/* Hearth & Harbor v2.5.23 — real Village Trades integration and safety regression.
 * Run: node --test tests/village-trades-v2523.test.cjs
 */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const context={window:{}};vm.runInNewContext(read('village-trades-v2523.js'),context);
const T=context.window.HearthVillageTrades;
function harness(custom={}){
 const state={
  day:1,season:0,minute:8*60,coins:250,hearts:0,
  needs:{hunger:80,energy:80,fun:80,social:80},relations:{rosie:10,oliver:12,bea:8},
  cooking:{pantry:{berry:8,apple:8,carrot:8,herb:8},dishes:[{id:'tart',quality:3},{id:'salad',quality:1}],xp:0,made:0},
  villageTrades:T.clean(null),...custom
 };
 let saved=0,updated=0,notices=[],modal={key:'',html:''},closed=0,trips=[],kitchen=0,atTown=true;
 const trades=T.setup({
  getState:()=>state,save:()=>saved++,updateUI:()=>updated++,
  notify:s=>notices.push(s),showModal:(k,html)=>modal={key:k,html},
  closeModal:()=>closed++,isTown:()=>atTown,
  travelTo:(x,y,done)=>{trips.push([x,y]);atTown=true;done()},
  openKitchen:()=>kitchen++
 });
 return {trades,state,get modal(){return modal},get saved(){return saved},
  get updated(){return updated},get notices(){return notices},get trips(){return trips},
  get closed(){return closed},get kitchen(){return kitchen},setTown:value=>atTown=value};
}
function complete(t,id){
 const s=t.trades.session;assert.ok(s,'active commission');
 for(const piece of s.offer.sequence)t.trades.choose(piece);
 assert.equal(t.trades.session,null);
 assert.equal(t.modal.key,'trade-result');
}
test('old saves receive a clean empty record and strict imported records are bounded',()=>{
 const a=T.clean(null);
 assert.equal(a.totals.rosie,0);
 assert.equal(Object.keys(a.daily).length,0);
 const b=T.clean({daily:{'1':['rosie','rosie','oliver','fake'],'-5':['bea'],'10000':['bea']},
  totals:{rosie:Infinity,oliver:-4,bea:15},memories:[
   {day:1,id:'bea',stars:3},{day:1,id:'bea',stars:1},{day:3,id:'bad',stars:3},
   {day:2,id:'oliver',stars:2,dish:'<script>'}]});
 assert.equal(JSON.stringify(b.daily),JSON.stringify({'1':['rosie','oliver']}));
 assert.equal(b.totals.rosie,0);assert.equal(b.totals.oliver,0);assert.equal(b.totals.bea,15);
 assert.equal(b.memories.length,2);
 assert.equal(b.memories[1].dish,'');
});
test('four seasons rotate real produce, ink palettes and parcel patterns without random churn',()=>{
 for(const day of [1,5,8,15,22,29,365]){
  for(const id of T.IDS){const a=T.offer(day,id),b=T.offer(day,id);assert.equal(JSON.stringify(a),JSON.stringify(b));assert.equal(a.sequence.length,3)}
 }
 assert.equal(T.offer(0,'rosie'),null);
 assert.equal(T.offer(1,'invalid'),null);
 assert.notEqual(T.offer(1,'bea').sequence.join(','),T.offer(8,'bea').sequence.join(','));
 assert.equal(T.offer(1,'rosie').stock.id,'berry');
});
test('the journal displays three actual shops with ready and short-supply states',()=>{
 const t=harness();t.trades.board();
 assert.equal(t.modal.key,'trade-board');
 for(const name of ['Rosie','Oliver','Bea'])assert.ok(t.modal.html.includes(name));
 assert.equal((t.modal.html.match(/data-act="trade-travel"/g)||[]).length,3);
 assert.match(t.modal.html,/village work journal/);
 assert.match(t.modal.html,/Bring 2 Berries/);
 const poor=harness({cooking:{pantry:{berry:0},dishes:[]}});
 poor.trades.board();assert.match(poor.modal.html,/gather supplies first/);
});
test('walking to a real shop uses supplied town route and opens that station',()=>{
 const t=harness();t.trades.travel('rosie');
 assert.equal(t.trips.length,1);assert.equal(t.trips[0][0],589);assert.equal(t.trips[0][1],809);
 assert.equal(t.modal.key,'trade-station');
 assert.equal(t.closed,1);
});
test('Rosie requires actual pantry produce and three correctly sorted actions before paying',()=>{
 const t=harness(),before=t.state.cooking.pantry.berry;
 t.trades.start('rosie');assert.equal(t.modal.key,'trade-game');
 assert.match(t.modal.html,/vt-illustration/);
 assert.match(t.modal.html,/role="progressbar"/);
 assert.equal(t.state.coins,250);
 complete(t,'rosie');
 assert.equal(t.state.cooking.pantry.berry,before-2);
 assert.equal(t.state.coins,272);
 assert.equal(t.state.relations.rosie,14);
 assert.equal(t.state.needs.fun,87);
 assert.equal(t.state.needs.social,85);
 assert.equal(t.trades.data.totals.rosie,1);
 assert.equal(t.saved,1);
 assert.equal(t.updated,1);
 assert.equal(t.trades.complete('rosie'),true);
 assert.equal(t.trades.data.memories[0].item,'berry');
});
test('wrong crate picks are gentle but do not advance, consume, or earn rewards',()=>{
 const t=harness(),old=t.state.cooking.pantry.berry;
 t.trades.start('rosie');const right=t.trades.session.offer.sequence[0];
 t.trades.choose(['berry','apple','carrot','herb'].find(v=>v!==right));
 assert.equal(t.trades.session.done.length,0);
 assert.equal(t.trades.session.mistakes,1);
 assert.equal(t.state.cooking.pantry.berry,old);
 assert.equal(t.saved,0);
 assert.match(t.modal.html,/Nothing was used or lost/);
 complete(t,'rosie');
 assert.match(t.modal.html,/★★☆/);
});
test('Oliver can wrap a real 3-star cooked tart once, receiving the correct quality tip',()=>{
 const t=harness();
 t.trades.station('oliver');
 assert.match(t.modal.html,/Honeybun Berry Tart/);
 assert.match(t.modal.html,/Orchard Fruit Salad/);
 t.trades.start('oliver:0');complete(t,'oliver');
 assert.equal(t.state.cooking.dishes.length,1);
 assert.equal(t.state.cooking.dishes[0].id,'salad');
 assert.equal(t.state.coins,287);
 assert.equal(t.trades.data.memories[0].dish,'tart');
 assert.equal(t.state.cooking.xp,0,'shop work cannot mint chef XP');
});
test('one-star prepared dish still works, with a smaller tip',()=>{
 const t=harness();t.trades.start('oliver:1');complete(t,'oliver');
 assert.equal(t.state.coins,279);
 assert.equal(t.state.cooking.dishes.length,1);
 assert.equal(t.state.cooking.dishes[0].id,'tart');
});
test('invalid and forged plate indices never create an active commission',()=>{
 const t=harness();
 for(const token of ['oliver:-1','oliver:Infinity','oliver:999','oliver:0:extra','oliver:01','olive:0']){
  t.trades.start(token);assert.equal(t.trades.session,null);
 }
 assert.equal(t.state.cooking.dishes.length,2);assert.equal(t.saved,0);
});
test('Bea makes a four-color-choice worktop and charges supplies only on successful card completion',()=>{
 const t=harness();t.trades.start('bea');
 assert.match(t.modal.html,/Rosy pink/);assert.match(t.modal.html,/Harbor blue/);
 assert.equal(t.state.coins,250);
 complete(t,'bea');
 assert.equal(t.state.coins,266,'22 payment minus 6 art supplies');
 assert.equal(t.trades.data.memories[0].stars,3);
 assert.equal(t.state.relations.bea,12);
});
test('cancelling a worktop before completion never costs materials or coins',()=>{
 const t=harness();t.trades.start('bea');t.trades.choose(t.trades.session.offer.sequence[0]);
 t.trades.cancel();
 assert.equal(t.state.coins,250);assert.equal(t.saved,0);
 assert.equal(t.trades.session,null);
 assert.equal(t.modal.key,'trade-board');
});
test('each shop pays at most once per in-game day, including repeat submissions and reloads',()=>{
 const t=harness();t.trades.start('rosie');complete(t,'rosie');
 const balance=t.state.coins,stock=t.state.cooking.pantry.berry;
 t.trades.choose('apple');t.trades.start('rosie');t.trades.station('rosie');
 assert.equal(t.trades.session,null);
 assert.equal(t.state.coins,balance);assert.equal(t.state.cooking.pantry.berry,stock);
 const reloaded=harness({villageTrades:T.clean(JSON.parse(JSON.stringify(t.trades.data)))});
 assert.equal(reloaded.trades.complete('rosie'),true);
 assert.equal(reloaded.trades.available('rosie'),false);
 reloaded.state.day=2;
 assert.equal(reloaded.trades.complete('rosie'),false);
});
test('all three distinct commissions may be finished once on the same day, no duplicate payouts',()=>{
 const t=harness();for(const id of T.IDS){t.trades.start(id==='oliver'?'oliver:0':id);complete(t,id)}
 assert.equal(t.trades.total,3);
 assert.equal(t.state.coins,250+22+37+16);
 assert.equal(t.saved,3);
 assert.deepEqual(Array.from(t.trades.data.daily['1']),Array.from(T.IDS));
});
test('changing real inventory mid-work prevents delivery and forfeits no extra resources',()=>{
 const t=harness();t.trades.start('oliver:0');t.state.cooking.dishes.splice(0,1);
 for(const step of t.trades.session.offer.sequence)t.trades.choose(step);
 assert.equal(t.state.coins,250);assert.equal(t.saved,0);
 assert.equal(t.trades.data.totals.oliver,0);
 assert.equal(t.modal.key,'trade-board');
 assert.match(t.notices.at(-1),/no longer on the shelf/);
});
test('missing produce or cash at final checkout blocks any paid delivery',()=>{
 const t=harness();t.trades.start('rosie');t.state.cooking.pantry.berry=0;
 for(const step of t.trades.session.offer.sequence)t.trades.choose(step);
 assert.equal(t.state.coins,250);assert.equal(t.saved,0);
 assert.equal(t.trades.data.totals.rosie,0);
 const b=harness();b.trades.start('bea');b.state.coins=0;
 for(const step of b.trades.session.offer.sequence)b.trades.choose(step);
 assert.equal(b.saved,0);assert.equal(b.state.coins,0);assert.equal(b.trades.data.totals.bea,0);
});
test('a third contribution unlocks a persistent handcrafted shop ribbon, no extra monetary bonus',()=>{
 const t=harness();
 for(const day of [1,2,3]){t.state.day=day;t.trades.start('bea');complete(t,'bea')}
 assert.equal(t.trades.data.totals.bea,3);
 assert.match(t.modal.html,/permanent hand-painted ribbon/);
 assert.equal(t.state.coins,250+16*3);
 assert.equal(t.trades.data.memories.length,3);
});
test('the physical village noticeboard is illustrated without external images or offscreen servers',()=>{
 const t=harness();let ops=0;
 const ctx={save:()=>{},restore:()=>{},translate:()=>{},fillRect:()=>ops++,strokeRect:()=>ops++,
  beginPath:()=>{},moveTo:()=>{},lineTo:()=>{},closePath:()=>{},fill:()=>ops++,stroke:()=>{},arc:()=>{},fillText:()=>ops++};
 t.trades.drawBoard(ctx,479,957,1,0);
 assert.ok(ops>4);
 assert.doesNotMatch(read('village-trades-v2523.js'),/fetch\(|XMLHttpRequest|WebSocket/);
});
test('all three services connect to actual in-world affordances and game action routes',()=>{
 const game=read('game.js');
 for(const term of ['HearthVillageTrades.clean(raw.villageTrades)','HearthVillageTrades.setup({',
  "put('tradeboard',479,957", "if(type==='tradeboard')", "if(action==='trade-board')return trades.board()",
  "if(action.startsWith('trade-'))return trades.handle(action,id)", "trades.station('oliver')","trades.station('rosie')",
  "btn('🧺 Village Trades & Kindness','trade-board')"]){
  assert.ok(game.includes(term),term);
 }
});
test('old save key and other existing game systems are untouched',()=>{
 const game=read('game.js');
 assert.match(game,/const SAVE='hearth-harbor-save-v1'/);
 assert.match(game,/festivalMarket:window.HearthFestivalMarket.clean/);
 assert.match(game,/familyTable:window.HearthFamilyTable.clean/);
 assert.match(game,/householdRhythms:window.HearthHouseholdRhythms.clean/);
});
test('the new module is loaded before the game and fully available offline on iPhone',()=>{
 const html=read('index.html'),worker=read('sw.js');
 assert.ok(html.indexOf('village-trades-v2523.js')<html.indexOf('game.js'));
 for(const file of ['village-trades-v2523.js','village-trades-v2523.css']){
  assert.ok(html.includes(file));assert.ok(worker.includes("'./"+file+"'"));
 }
 assert.match(worker,/hearth-harbor-v2523-village-trades/);
});
test('responsive, keyboard and reduced-motion shop styling is present',()=>{
 const css=read('village-trades-v2523.css');
 for(const t of ['@media(max-width:390px)','@media(min-width:740px)','button:focus-visible','min-height:59px',
  'touch-action:manipulation','prefers-reduced-motion:reduce'])assert.ok(css.includes(t),t);
});

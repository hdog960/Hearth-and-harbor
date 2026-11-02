/* Hearth & Harbor v2.5.24 — Café service, fair economy, old-save safeguards.
 * Run: node --test tests/cafe-work-v2524.test.cjs
 */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const base=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(base,f),'utf8');
const c={window:{}};vm.runInNewContext(read('cafe-work-v2524.js'),c,{filename:'cafe-work-v2524.js'});
const C=c.window.HearthCafeWork;
function harness(extra={}){
 const state={day:1,coins:250,needs:{fun:65,energy:82,social:76,hunger:70},
  cafeWork:C.clean(null),garden:[0,0,0,0],gardenBoost:[false,false,false,false],inventory:[],quests:{},...extra};
 let count=0,updates=0,quest=0,modal={kind:'',html:''},notices=[];
 const cafe=C.setup({getState:()=>state,save:()=>count++,updateUI:()=>updates++,notify:m=>notices.push(m),
  showModal:(kind,html)=>modal={kind,html},onPaidShift:()=>quest++});
 return {state,cafe,get saves(){return count},get ui(){return updates},get quest(){return quest},
  get modal(){return modal},get notices(){return notices}};
}
function serve(t){
 while(t.cafe.session){
  const s=t.cafe.session,o=s.orders[s.index],stage=s.step;
  t.cafe.choose(o[stage]);
 }
}
test('old saves get explicit safe café and garden record defaults',()=>{
 const r=C.clean(null);
 assert.equal(r.shiftDay,0);assert.equal(r.shifts,0);assert.equal(r.best,0);
 assert.equal(r.harvestDay,0);assert.equal(r.plots.length,0);assert.equal(r.memories.length,0);
});
test('imported shift data clamps invalid counts, duplicate days, bad harvest plots and metadata',()=>{
 const r=C.clean({shiftDay:-10,shifts:Infinity,best:99,harvestDay:10000,plots:[0,0,1,5,-1,3,2],
  memories:[{day:1,stars:2},{day:1,stars:3},{day:2,stars:0},{day:3,stars:3}]});
 assert.equal(r.shiftDay,0);assert.equal(r.shifts,0);assert.equal(r.best,3);assert.equal(r.harvestDay,0);
 assert.equal(JSON.stringify(r.plots),JSON.stringify([0,1,3,2]));
 assert.equal(r.memories.length,2);
});
test('each shift generates three real resident orders with pastry and drink, varying by day',()=>{
 for(const day of [1,2,7,8,15,22,365]){
  const a=C.orders(day),b=C.orders(day);
  assert.equal(a.length,3);assert.equal(JSON.stringify(a),JSON.stringify(b));
  assert.ok(a.every(o=>C.SELECTIONS.pastry.some(p=>p.id===o.pastry)&&C.SELECTIONS.drink.some(d=>d.id===o.drink)));
 }
 assert.notEqual(JSON.stringify(C.orders(1)),JSON.stringify(C.orders(8)));
 assert.equal(C.orders(0).length,0);
});
test('a playable shift asks for precise pastries and drinks in alternating steps',()=>{
 const t=harness();t.cafe.start();
 assert.equal(t.modal.kind,'cafe24-game');
 assert.match(t.modal.html,/Serve with a smile/);
 assert.match(t.modal.html,/cafe24-select/);
 assert.match(t.modal.html,/role="progressbar"/);
 assert.match(t.modal.html,/aria-valuemax="6"/);
 assert.match(t.modal.html,/hc24-art/);
 let s=t.cafe.session,o=s.orders[0];assert.equal(s.step,'pastry');
 t.cafe.choose(o.pastry);
 assert.equal(s.step,'drink');
 assert.equal(s.index,0);
 assert.match(t.modal.html,/complete the drink/);
 t.cafe.choose(o.drink);
 assert.equal(s.index,1);assert.equal(s.prepared.length,1);
 assert.equal(s.step,'pastry');
 assert.equal(t.state.coins,250);
});
test('three correctly served orders complete one honest paid 45 coin shift',()=>{
 const t=harness();t.cafe.start();serve(t);
 assert.equal(t.modal.kind,'cafe24-result');
 assert.equal(t.state.coins,295);assert.equal(t.state.needs.fun,74);assert.equal(t.state.needs.energy,69);
 assert.equal(t.cafe.record.shifts,1);assert.equal(t.cafe.record.shiftDay,1);
 assert.equal(t.cafe.record.best,3);assert.equal(t.cafe.record.memories.length,1);
 assert.equal(t.quest,1);assert.equal(t.saves,1);assert.equal(t.ui,1);
 assert.match(t.modal.html,/★★★/);
});
test('mistakes never skip to the next guest, but produce a truthful lower grade',()=>{
 const t=harness();t.cafe.start();
 const s=t.cafe.session;
 const wrong=C.SELECTIONS.pastry.find(x=>x.id!==s.orders[0].pastry).id;
 t.cafe.choose(wrong);
 assert.equal(s.index,0);assert.equal(s.step,'pastry');assert.equal(s.mistakes,1);
 assert.equal(t.state.coins,250);assert.equal(t.saves,0);
 assert.match(t.modal.html,/nothing is wasted/);
 serve(t);
 assert.equal(t.cafe.record.best,2);
 assert.equal(t.cafe.record.memories[0].stars,2);
});
test('many mistakes cannot reduce quality below one star or charge supplies',()=>{
 const t=harness();t.cafe.start();
 for(let i=0;i<7;i++){
  const wrong=C.SELECTIONS.pastry.find(x=>x.id!==t.cafe.session.orders[0].pastry).id;
  t.cafe.choose(wrong);
 }
 serve(t);
 assert.equal(t.cafe.record.best,1);
 assert.equal(t.state.coins,295);
 assert.equal(t.quest,1);
});
test('legacy instant work action is now a real shift and cannot pay without six inputs',()=>{
 const game=read('game.js');
 assert.match(game,/if\(action==='work'\)return cafeWork.start\(\)/);
 assert.doesNotMatch(game,/if\(action==='work'\)\{task\('work'\);coins\(45\)/);
 const t=harness();t.cafe.start();
 assert.equal(t.saves,0);assert.equal(t.quest,0);assert.equal(t.state.coins,250);
});
test('a second shift on the same day stays playable practice with no farming',()=>{
 const t=harness();t.cafe.start();serve(t);
 t.cafe.start();assert.match(t.modal.html,/Practice: no coin reward/);
 serve(t);
 assert.equal(t.modal.kind,'cafe24-result');
 assert.match(t.modal.html,/no extra coins or need rewards/);
 assert.equal(t.state.coins,295);assert.equal(t.quest,1);
 assert.equal(t.state.needs.fun,74);assert.equal(t.state.needs.energy,69);
 assert.equal(t.cafe.record.shifts,1);assert.equal(t.cafe.record.memories.length,1);
});
test('paid shift guard survives a JSON export and reload; day two pays again',()=>{
 const t=harness();t.cafe.start();serve(t);
 const snapshot=C.clean(JSON.parse(JSON.stringify(t.cafe.record)));
 const reload=harness({cafeWork:snapshot,coins:295});
 assert.equal(reload.cafe.paidToday(),true);
 reload.cafe.start();serve(reload);
 assert.equal(reload.state.coins,295);
 reload.state.day=2;
 assert.equal(reload.cafe.paidToday(),false);
 reload.cafe.start();serve(reload);
 assert.equal(reload.state.coins,340);
 assert.equal(reload.cafe.record.shifts,2);
});
test('abandoning a shift gives no coins, XP, memories, or quest progress',()=>{
 const t=harness();t.cafe.start();
 t.cafe.choose(t.cafe.session.orders[0].pastry);
 t.cafe.cancel();
 assert.equal(t.cafe.session,null);assert.equal(t.modal.kind,'cafe');
 assert.equal(t.state.coins,250);assert.equal(t.quest,0);assert.equal(t.saves,0);
 assert.equal(t.cafe.record.memories.length,0);
});
test('fake choice tokens never advance or mutate the actual session',()=>{
 const t=harness();t.cafe.start();
 const session=t.cafe.session;
 for(const v of ['undefined','__proto__','<script>','',null])t.cafe.choose(v);
 assert.equal(session.index,0);assert.equal(session.step,'pastry');
 assert.equal(t.state.coins,250);
});
test('garden payout limits are once per plot per in-game day, not once globally',()=>{
 const t=harness();
 for(let i=0;i<4;i++){assert.equal(t.cafe.canHarvest(i),true);assert.equal(t.cafe.recordHarvest(i),true)}
 assert.equal(JSON.stringify(t.cafe.record.plots),JSON.stringify([0,1,2,3]));
 for(let i=0;i<4;i++){assert.equal(t.cafe.canHarvest(i),false);assert.equal(t.cafe.recordHarvest(i),false)}
 assert.equal(t.cafe.record.harvestDay,1);
 t.state.day=2;assert.equal(t.cafe.canHarvest(0),true);
 assert.equal(t.cafe.recordHarvest(0),true);
 assert.equal(JSON.stringify(t.cafe.record.plots),JSON.stringify([0]));
});
test('invalid, repeated or out-of-range garden harvests do not alter records',()=>{
 const t=harness();
 for(const i of [-1,4,10,'0',null,NaN]){
  assert.equal(t.cafe.recordHarvest(i),false);
 }
 assert.equal(t.cafe.record.harvestDay,0);
 assert.equal(t.cafe.record.plots.length,0);
});
test('garden UI and payout path both enforce harvest caps without deleting growing blossoms',()=>{
 const game=read('game.js');
 assert.ok(game.includes('cafeWork.canHarvest(i)'),"UI read");
 assert.ok(game.includes('disabled'),"button locked after paid harvest");
 assert.ok(game.includes('if(!cafeWork.recordHarvest(i))'),"transaction guard before resetting plot");
 assert.ok(game.includes("This plot needs until tomorrow for another harvest."));
 assert.ok(game.includes('const reward=state.gardenBoost[i]?38:24'),"existing reward unchanged");
});
test('game uses same save key and sanitizes new café record on old imports',()=>{
 const game=read('game.js');
 assert.match(game,/const SAVE='hearth-harbor-save-v1'/);
 assert.match(game,/cafeWork:window.HearthCafeWork.clean\(raw.cafeWork\)/);
 assert.match(game,/const cafeWork=window.HearthCafeWork.setup\(/);
 assert.match(game,/onPaidShift:\(\)=>task\('work'\)/);
 assert.match(game,/function cafe\(\)\{return cafeWork.cafe\(\)\}/);
});
test('iPhone offline cache loads the café module before main game, with responsive styles',()=>{
 const html=read('index.html'),sw=read('sw.js'),css=read('cafe-work-v2524.css');
 for(const file of ['cafe-work-v2524.js','cafe-work-v2524.css'])assert.ok(html.includes(file)&&sw.includes("'./"+file+"'"));
 assert.ok(html.indexOf('cafe-work-v2524.js')<html.indexOf('game.js'));
 assert.match(sw,/hearth-harbor-v2524-cafe-service/);
 for(const key of ['@media(max-width:390px)','min-height:61px','button:focus-visible','prefers-reduced-motion:reduce'])assert.ok(css.includes(key),key);
});

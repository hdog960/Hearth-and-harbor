/* Hearth & Harbor v2.5.15 — Supper Together QA
   Run: node --test tests/supper-together-v2515.test.cjs */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file),'utf8');
const core=read('game.js'),moduleSrc=read('family-table-v2514.js'),html=read('index.html'),sw=read('sw.js');
const browser={window:{}};vm.runInNewContext(moduleSrc,browser,{filename:'family-table-v2514.js'});
const F=browser.window.HearthFamilyTable;
function setup(guestIds=['rosie','oliver']){
 let scene=guestIds===null?'home':'residence',home=scene==='home'?'player':'h0',guests=guestIds||[];
 let modal=true,writes=0,redraw=0,meetings=0,walk,notes=[],forms=[],served=[],kitchen=0;
 const state={day:1,minute:16*60,needs:{hunger:40,fun:40,social:40},relations:{rosie:10,oliver:9,mabel:8},
  residentLife:{rosie:{needs:{food:30,social:40,fun:30}},oliver:{needs:{food:44,social:40,fun:30}},mabel:{needs:{food:50,social:35,fun:20}}},
  cooking:{dishes:[{id:'jam',quality:3},{id:'soup',quality:2},{id:'toast',quality:1}]},
  townBonds:{},townTensions:{},familyTable:F.clean(null)};
 const game=F.setup({getState:()=>state,save:()=>writes++,updateUI:()=>redraw++,
  notify:t=>notes.push(t),showModal:(id,markup)=>{modal=true;forms.push({id,markup})},
  closeModal:()=>{modal=false},getScene:()=>scene,getHome:()=>home,getMembers:()=>guests,
  walkTo:(pos,callback)=>{walk={pos,callback}},
  onDinnerStart:ids=>{meetings++;served.push([...ids])},
  isModalOpen:()=>modal,openKitchen:()=>{kitchen++},
  completeHomeMeal:()=>{}});
 return {state,game,forms,notes,served,
  setScene:(s,h)=>{scene=s;home=h||home},setGuests:x=>guests=x,
  arrive:()=>walk?.callback(),close:()=>{modal=false},get walked(){return walk},
  get writes(){return writes},get redraw(){return redraw},get meetings(){return meetings},get kitchen(){return kitchen}};
}
function start(x,topic='remember',index=0){
 x.game.pick(index);x.game.start(topic);assert.ok(x.walked,'walk starts');
 return x.arrive();
}
function placeAll(x,count){for(let i=0;i<count;i++)assert.equal(x.game.setPlace(i),true);}
test('arrival leads to an interactive setup scene without consuming food or awarding friendship',()=>{
 const x=setup();assert.equal(start(x),true);
 assert.equal(x.forms.at(-1).id,'family-table-setting');
 assert.match(x.forms.at(-1).markup,/0\/3 places set/);
 assert.match(x.forms.at(-1).markup,/data-act="ft-place"/);
 assert.match(x.forms.at(-1).markup,/data-act="ft-linen"/);
 assert.match(x.forms.at(-1).markup,/data-act="ft-candle"/);
 assert.match(x.forms.at(-1).markup,/data-act="ft-serve" disabled/);
 assert.equal(x.state.cooking.dishes.length,3);
 assert.equal(x.state.relations.rosie,10);
 assert.equal(x.writes,0);
});
test('players can set seats in any order, but cannot serve early or double-charge a plate',()=>{
 const x=setup();start(x);
 assert.equal(x.game.finish(),false);
 assert.equal(x.game.setPlace(2),true);
 assert.equal(x.game.setPlace(2),true,'same place can be reviewed');
 assert.match(x.forms.at(-1).markup,/1\/3 places set/);
 assert.equal(x.game.finish(),false);
 assert.equal(x.game.setPlace(0),true);
 assert.equal(x.game.finish(),false);
 assert.equal(x.game.setPlace(1),true);
 assert.match(x.forms.at(-1).markup,/3\/3 places set/);
 assert.doesNotMatch(x.forms.at(-1).markup,/data-act="ft-serve" disabled/);
 assert.equal(x.game.finish(),true);
 assert.equal(x.state.cooking.dishes.length,2);
 assert.equal(x.writes,1);
 assert.equal(x.game.finish(),false);
 assert.equal(x.writes,1);
 assert.equal(x.meetings,1);
});
test('linen patterns and candle are customizable but cost no ingredients or coins',()=>{
 const x=setup();start(x,'celebrate');
 assert.equal(x.game.linen('rose'),true);
 assert.match(x.forms.at(-1).markup,/ft-rose/);
 assert.equal(x.game.linen('__proto__'),false);
 assert.equal(x.game.candle(),true);
 assert.match(x.forms.at(-1).markup,/Candle glowing/);
 assert.equal(x.game.candle(),true);
 assert.equal(x.game.linen('honey'),true);
 assert.match(x.forms.at(-1).markup,/ft-honey/);
 placeAll(x,3);x.game.finish();
 assert.equal(x.state.cooking.dishes.length,2);
 assert.equal(x.writes,1);
});
test('a quiet cottage supper requires only Poppy’s own place, not invented guests',()=>{
 const x=setup(null);start(x);
 assert.match(x.forms.at(-1).markup,/0\/1 places set/);
 assert.equal(x.game.setPlace(1),false);
 x.game.setPlace(0);assert.equal(x.game.finish(),true);
 assert.equal(x.state.familyTable.counts.player,1);
 assert.equal(x.state.familyTable.memories[0].guests.length,0);
 assert.equal(x.served[0].length,0);
});
test('abandoning the meal setup preserves the entire real prepared dish shelf',()=>{
 const x=setup();start(x);x.game.setPlace(0);
 x.game.abandon();
 assert.equal(x.state.cooking.dishes.length,3);
 assert.equal(x.writes,0);
 assert.equal(x.meetings,0);
 assert.match(x.notes.at(-1),/safely on the shelf/);
 assert.equal(x.game.finish(),false);
});
test('changing the recipe, resident list or scene while setting a table blocks the reward',()=>{
 for(const disruption of [
  x=>x.state.cooking.dishes.splice(0,1),
  x=>x.setGuests(['mabel']),
  x=>x.state.day++,
  x=>x.setScene('town')
 ]){
  const x=setup();start(x);placeAll(x,3);disruption(x);
  assert.equal(x.game.finish(),false);
  assert.equal(x.writes,0);
  assert.equal(x.meetings,0);
  assert.equal(x.state.familyTable.counts.h0,0);
 }
});
test('a completed dinner seats actual resident IDs at distinct animated positions',()=>{
 const x=setup();start(x);placeAll(x,3);assert.equal(x.game.finish(),true);
 assert.equal(x.meetings,1);assert.equal(JSON.stringify(x.served),JSON.stringify([['rosie','oliver']]));
 const first=x.game.dinnerPose('rosie','h0',1.25);
 const second=x.game.dinnerPose('oliver','h0',1.25);
 assert.ok(first&&second);
 assert.notEqual(first.x,second.x);
 assert.notEqual(first.y,second.y);
 assert.equal(first.expression,'happy');
 assert.equal(first.action,'meal');
 assert.equal(x.game.dinnerPose('mabel','h0',1.25),null);
 assert.equal(x.game.dinnerPose('rosie','h1',1.25),null);
});
test('gathering timer pauses behind the result modal and ends without permanent NPC duplication',()=>{
 const x=setup();start(x);placeAll(x,3);x.game.finish();
 assert.equal(x.game.gatheringActive('h0'),true);
 for(let i=0;i<280;i++)x.game.update(.1);
 assert.equal(x.game.gatheringActive('h0'),true,'modal must freeze animation');
 x.close();
 for(let i=0;i<90;i++)x.game.update(.1);
 assert.equal(x.game.gatheringActive('h0'),true);
 x.game.update(20); // guard clamps absurd frame times
 assert.equal(x.game.gatheringActive('h0'),true);
 for(let i=0;i<180;i++)x.game.update(.1);
 assert.equal(x.game.gatheringActive('h0'),false);
 assert.equal(x.game.dinnerPose('rosie','h0',99),null);
});
test('real resident dinner positions ease from their previous home locations and return to autonomy',()=>{
 let callback=0,ended=0,arrive,modal=true;
 const state={
  day:1,needs:{hunger:10,fun:10,social:10},relations:{rosie:2,oliver:2},
  cooking:{dishes:[{id:'tart',quality:3}]},townBonds:{},townTensions:{},
  familyTable:F.clean(null),residentLife:{rosie:{needs:{food:10,social:10,fun:10}},oliver:{needs:{food:10,social:10,fun:10}}}
 };
 const e=F.setup({
  getState:()=>state,getScene:()=> 'residence',getHome:()=> 'h0',
  getMembers:()=>['rosie','oliver'],save:()=>{},updateUI:()=>{},notify:()=>{},
  showModal:()=>{modal=true},closeModal:()=>{modal=false},
  walkTo:(_,cb)=>{arrive=cb},isModalOpen:()=>modal,
  onDinnerStart:()=>{callback++;return [{id:'rosie',x:350,y:650},{id:'oliver',x:870,y:785}]},
  onDinnerEnd:()=>{ended++}
 });
 e.pick(0);e.start('remember');arrive();
 e.setPlace(0);e.setPlace(1);e.setPlace(2);
 assert.equal(e.finish(),true);
 assert.equal(callback,1);
 let first=e.dinnerPose('rosie','h0',0);
 assert.equal(first.x,350);
 assert.equal(first.y,650);
 assert.equal(first.moving,true);
 modal=false;
 for(let i=0;i<20;i++)e.update(.1);
 let mid=e.dinnerPose('rosie','h0',2);
 assert.ok(mid.x>350&&mid.x<602);
 assert.ok(mid.y<650&&mid.y>515);
 for(let i=0;i<230;i++)e.update(.1);
 let seat=e.dinnerPose('rosie','h0',25);
 assert.equal(Math.round(seat.x),602);
 assert.equal(Math.round(seat.y),515);
 assert.equal(seat.moving,false);
 for(let i=0;i<42;i++)e.update(.1);
 assert.equal(e.gatheringActive('h0'),false);
 assert.equal(ended,1);
});
test('new animated supper decorations use Canvas2D and do not render in unrelated homes',()=>{
 const x=setup();start(x,'dream');placeAll(x,3);x.game.candle();x.game.finish();
 let calls=0;
 const known=new Set(['save','restore','beginPath','ellipse','fill','fillRect']);
 const canvas=new Proxy({},{get(o,k){if(known.has(k))return()=>calls++;return o[k]}});
 assert.equal(x.game.drawFront(canvas,{home:'h1',tick:1}),false);
 assert.equal(x.game.drawFront(canvas,{home:'h0',tick:1}),true);
 assert.ok(calls>=20);
});
test('renderer uses real resident sprites, actual animated poses, and pauses autonomy for the supper',()=>{
 for(const token of [
  'familyTable.dinnerPose(n.id,activeResidence,tick)',
  'familyTable.gatheringActive()',
  'familyTable.drawFront(ctx',
  'familyTable.update(dt)',
  'onDinnerStart:(guests)=>',
  'roomAutonomy.set(id,',
  'Hearth & Harbor: Thoughtful Households v2.5.16'
 ])assert.ok(core.includes(token),token);
 assert.ok(html.includes('supper-together-v2515.css'));
 assert.ok(sw.includes("'./supper-together-v2515.css'"));
 assert.match(sw,/const CACHE='hearth-harbor-v[0-9]+-[a-z-]+'/); // Release cache changes each version.
});

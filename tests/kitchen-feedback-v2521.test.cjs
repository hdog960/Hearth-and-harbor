/* Hearth & Harbor v2.5.21 — cooking feedback and honest score recap.
 * Run: node --test tests/kitchen-feedback-v2521.test.cjs
 */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const craftContext={window:{}};
vm.runInNewContext(read('kitchen-craft-v2519.js'),craftContext);
function harness(relaxed=true){
 const board={outerHTML:'',contains:()=>false};
 const gesture={style:{setProperty:()=>{}},classList:{toggle:()=>{}},addEventListener:()=>{}};
 const modal={scrollTop:300};
 const document={
  activeElement:null,
  querySelector:q=>q==='#modal .modal-card'?modal:null,
  getElementById:id=>({kCraft:board,kGesture:gesture,kStepProgress:{setAttribute:()=>{}},kProgressFill:{style:{}},kPercent:{textContent:''}})[id]||null
 };
 const state={coins:250,day:1,cooking:{pantry:{bread:8,butter:8,berry:8,apple:8,carrot:8,herb:8,flour:8,milk:8,egg:8,noodle:8,fish:8,honey:8,onion:8,potato:8},dishes:[],xp:0,made:0,mastered:{},servedDaily:{},relaxed}};
 const ctx={window:{HearthKitchenCraft:craftContext.window.HearthKitchenCraft,HearthKitchenArt:{plated:id=>'<svg data-plate="'+id+'"></svg>',stage:(id,k)=>'<svg data-stage="'+id+'-'+k+'"></svg>'}},document};
 vm.runInNewContext(read('kitchen.js'),ctx,{filename:'kitchen.js'});
 const view={screen:'',html:''};let saves=0;
 const kitchen=new ctx.window.HearthKitchen({
  getState:()=>state,getResidents:()=>[],save:()=>saves++,notify:()=>{},
  showModal:(screen,html)=>{view.screen=screen;view.html=html},
  coins:n=>state.coins+=n,changeNeed:()=>{},openFamilyTable:()=>{}
 });
 return {kitchen,state,view,modal,board,get saves(){return saves}};
}
function chop(x){for(let i=0;i<4;i++)x.kitchen.handle('cook-craft','cut:'+i)}
function garnish(x){for(const [i,ingredient] of ['berry','leaf','petal'].entries()){x.kitchen.handle('cook-craft','pick:'+ingredient);x.kitchen.handle('cook-craft','place:'+i)}}
function stirByTap(x){for(let i=0;i<5;i++)x.kitchen.handle('cook-tap')}
test('first step stays uncluttered and completed craft creates a small next-step encouragement',()=>{
 const x=harness();x.kitchen.begin('salad');
 assert.equal(x.view.screen,'cook-step');
 assert.doesNotMatch(x.view.html,/k-step-feedback/);
 chop(x);
 assert.equal(x.kitchen.session.index,1);
 assert.match(x.view.html,/class="k-step-feedback" role="status" aria-live="polite"/);
 assert.match(x.view.html,/Slice the ingredients complete!/);
 assert.match(x.view.html,/A lovely touch!/);
 assert.match(x.view.html,/aria-label="3 out of 3 stars"/);
 assert.equal(x.modal.scrollTop,0);
});
test('final plate details both real skill scores without duplicate XP or currency',()=>{
 const x=harness(),startCoins=x.state.coins;
 x.kitchen.begin('salad');chop(x);garnish(x);
 assert.equal(x.view.screen,'cook-result');
 assert.match(x.view.html,/k-technique-recap" role="list"/);
 assert.match(x.view.html,/Slice the ingredients/);
 assert.match(x.view.html,/Make it beautiful/);
 assert.match(x.view.html,/aria-label="3 of 3 stars"/);
 assert.equal((x.view.html.match(/role="listitem"/g)||[]).length,2);
 assert.equal(x.state.cooking.dishes[0].quality,3);
 assert.equal(x.state.cooking.xp,20);
 assert.equal(x.state.coins,startCoins);
 assert.equal(x.saves,2,'one reservation and one completed plate');
 assert.equal(x.kitchen.session,null);
});
test('accessible tap fallback produces a truthful middle-grade recap with original quality scoring',()=>{
 const x=harness();x.kitchen.begin('toast');stirByTap(x);
 assert.match(x.view.html,/Made with care!/);
 assert.match(x.view.html,/aria-label="2 out of 3 stars"/);
 x.kitchen.handle('cook-tap');
 assert.equal(x.view.screen,'cook-result');
 assert.equal(x.state.cooking.dishes[0].quality,2);
 assert.match(x.view.html,/Catch the golden flip/);
 assert.equal((x.view.html.match(/role="listitem"/g)||[]).length,2);
});
test('mistimed heat can still create a valid one-star dish with supportive feedback',()=>{
 const x=harness(false);x.kitchen.begin('toast');stirByTap(x);
 x.kitchen.flipStart=Date.now()-800;
 x.kitchen.handle('cook-tap');
 assert.equal(x.view.screen,'cook-result');
 assert.equal(x.state.cooking.dishes[0].quality,1);
 assert.match(x.view.html,/Keep practicing/);
 assert.match(x.view.html,/aria-label="1 of 3 stars"/);
 assert.equal(x.state.cooking.dishes.length,1);
});
test('leaving before plating never creates a dish or extra reward',()=>{
 const x=harness();x.kitchen.begin('salad');
 x.kitchen.handle('cook-craft','cut:0');x.kitchen.abandon();
 assert.equal(x.state.cooking.dishes.length,0);
 assert.equal(x.state.cooking.xp,0);
 assert.equal(x.saves,1,'ingredients are reserved only once');
});
test('feedback adapts to small phones and reduced-motion settings',()=>{
 const css=read('kitchen-craft-v2519.css');
 for(const token of ['.k-step-feedback{','@media(max-width:390px)','k-technique-recap','k-technique-row','@media(prefers-reduced-motion:reduce){.k-feedback-flourish'])assert.ok(css.includes(token),token);
});
test('feedback remains transient and does not introduce a second save key',()=>{
 const kitchen=read('kitchen.js'),game=read('game.js');
 assert.match(game,/const SAVE='hearth-harbor-save-v1'/);
 assert.doesNotMatch(kitchen,/localStorage|sessionStorage|hearth-harbor-save-v2/);
 assert.match(kitchen,/techniqueGrade=score/);
});

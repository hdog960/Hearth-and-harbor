/* Hearth & Harbor v2.5.20 — Kitchen Polish integration tests.
 * Run: node --test tests/kitchen-polish-v2520.test.cjs
 */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const craftSource=read('kitchen-craft-v2519.js'),kitchenSource=read('kitchen.js');
const styles=read('kitchen-craft-v2519.css'),core=read('game.js');
const html=read('index.html'),worker=read('sw.js');
const c={window:{}};vm.runInNewContext(craftSource,c);
const C=c.window.HearthKitchenCraft;
function harness(){
 const scroller={scrollTop:240},inputs={},
  view={stage:null,markup:'',focusId:null,focusOptions:null,step:0,
    outer:'',aria:null,percentage:'',fillWidth:''};
 const board={contains:el=>el?.parent===board,outerHTML:''};
 const progress={setAttribute:(k,v)=>{if(k==='aria-valuenow')view.aria=v}};
 const fill={style:{set width(v){view.fillWidth=v}}};
 const percent={set textContent(v){view.percentage=v}};
 const gesture={style:{setProperty:()=>{}},classList:{toggle:()=>{}},addEventListener:()=>{}};
 const document={
  activeElement:null,
  getElementById:id=>({kCraft:board,kStepProgress:progress,kProgressFill:fill,kPercent:percent,kGesture:gesture})[id]||null,
  querySelector:selector=>{
   if(selector==='#modal .modal-card')return scroller;
   const match=selector.match(/^\[data-act="cook-craft"\]\[data-id="([\w:-]+)"\]$/);
   if(!match)return null;
   const id=match[1];
   if(!inputs[id])inputs[id]={dataset:{id},parent:board,disabled:false,
    focus:options=>{view.focusId=id;view.focusOptions=options;document.activeElement=inputs[id]}};
   return inputs[id];
  }
 };
 const context={document,window:{HearthKitchenCraft:C,
  HearthKitchenArt:{plated:id=>'<svg data-plate="'+id+'"></svg>',stage:(id,step)=>'<svg data-stage="'+id+'-'+step+'"></svg>'}}};
 vm.runInNewContext(kitchenSource,context,{filename:'kitchen.js'});
 const pantry={bread:10,butter:10,berry:10,apple:10,carrot:10,herb:10,flour:10,milk:10,egg:10,noodle:10,fish:10,honey:10,onion:10,potato:10};
 const state={coins:200,day:1,cooking:{pantry,dishes:[],mastered:{},servedDaily:{},xp:0,made:0,relaxed:true}};
 let saves=0,notice=[];
 const kitchen=new context.window.HearthKitchen({
  getState:()=>state,getResidents:()=>[],
  showModal:(step,markup)=>{view.step++;view.stage=step;view.markup=markup},
  save:()=>saves++,notify:v=>notice.push(v),coins:n=>state.coins+=n,
  changeNeed:()=>{},openFamilyTable:()=>{}
 });
 const focus=id=>{const b=document.querySelector('[data-act="cook-craft"][data-id="'+id+'"]');document.activeElement=b;return b};
 return {kitchen,board,document,view,scroller,focus,state,notice,get saves(){return saves}};
}
test('craft views keep the original SVG illustration but make the active worktop primary',()=>{
 const x=harness();x.kitchen.begin('salad');
 assert.equal(x.view.stage,'cook-step');
 assert.match(x.view.markup,/k-craft-step/);
 assert.match(x.view.markup,/k-craft-hero/);
 assert.match(x.view.markup,/data-stage="salad-chop"/);
 assert.match(x.view.markup,/id="kCraft"/);
 assert.match(x.view.markup,/data-act="cook-craft"/);
 assert.doesNotMatch(x.view.markup,/data-act="cook-tap"/);
});
test('craft progress has one visible progress indicator with screen reader updates',()=>{
 const x=harness();x.kitchen.begin('salad');
 assert.match(x.view.markup,/role="progressbar"/);
 assert.match(x.view.markup,/aria-valuemin="0"/);
 assert.match(x.view.markup,/aria-valuemax="100"/);
 assert.match(x.view.markup,/aria-valuenow="0"/);
 assert.match(x.view.markup,/id="kPercent" role="status" aria-live="polite"/);
 assert.doesNotMatch(x.view.markup,/kc-bar/,'duplicate board bar removed');
 const m=C.make('chop','salad');
 assert.match(m.render(),/0 of 4 placed/);
 assert.match(m.render(),/aria-live="polite"/);
});
test('selecting a recipe and advancing to its next stage resets modal scroll',()=>{
 const x=harness();x.kitchen.begin('salad');
 assert.equal(x.scroller.scrollTop,0);
 x.scroller.scrollTop=251;
 for(let i=0;i<4;i++)x.kitchen.handle('cook-craft','cut:'+i);
 assert.equal(x.kitchen.session.index,1);
 assert.equal(x.kitchen.craft.state.kind,'garnish');
 assert.equal(x.scroller.scrollTop,0,'the newly loaded step starts at its heading');
});
test('progress on a valid cut updates the actual main indicator without duplicate coins',()=>{
 const x=harness();x.kitchen.begin('salad');
 const coins=x.state.coins,saves=x.saves;
 x.kitchen.handle('cook-craft','cut:0');
 assert.equal(x.view.aria,'25');
 assert.equal(x.view.percentage,'25% PREPARED');
 assert.equal(x.view.fillWidth,'25%');
 assert.equal(x.state.coins,coins);
 assert.equal(x.saves,saves);
});
test('valid ingredient and cut taps restore keyboard focus to the next actionable target',()=>{
 const x=harness();x.kitchen.begin('salad');
 x.focus('cut:0');x.kitchen.handle('cook-craft','cut:0');
 assert.equal(x.view.focusId,'cut:1');
 assert.equal(x.view.focusOptions.preventScroll,true);
 for(let i=1;i<4;i++)x.kitchen.handle('cook-craft','cut:'+i);
 x.focus('pick:berry');x.kitchen.handle('cook-craft','pick:berry');
 assert.equal(x.view.focusId,'place:0');
 x.focus('place:0');x.kitchen.handle('cook-craft','place:0');
 assert.equal(x.view.focusId,'pick:leaf','next ingredient is immediately reachable');
});
test('a wrong but valid ingredient choice preserves keyboard focus and no progress is awarded',()=>{
 const x=harness();x.kitchen.begin('salad');
 for(let i=0;i<4;i++)x.kitchen.handle('cook-craft','cut:'+i);
 x.focus('pick:leaf');x.kitchen.handle('cook-craft','pick:leaf');
 x.focus('place:0');x.kitchen.handle('cook-craft','place:0');
 assert.equal(x.kitchen.session.progress,0);
 assert.equal(x.view.focusId,'place:0','focus remains on accessible error target');
 assert.match(x.board.outerHTML,/Try another combination/);
});
test('noninteractive or forged activity selectors are not used for focus restoration',()=>{
 const x=harness();x.kitchen.begin('salad');
 x.focus('cut:0');
 x.kitchen.handle('cook-craft','cut:0"][aria-pressed="true"]');
 assert.equal(x.kitchen.session.progress,0);
 assert.equal(x.view.focusId,'cut:0','malformed token cannot steer focus away from the original safe control');
 assert.equal(x.saves,1,'the only write is the original ingredient reservation');
});
test('short screens and keyboard-only input have reachable, high-contrast visible controls',()=>{
 for(const token of [
  '.k-craft-step .k-craft-hero{height:104px',
  '@media(max-width:390px)',
  '.k-craft-step button:focus-visible',
  '.k-craft-step .kc-positions button{min-height:76px}',
  '.k-craft-step .kc-feedback{display:flex',
  '.k-craft-step .k-craft-controls .k-craft-instructions'
 ])assert.ok(styles.includes(token),token);
 assert.ok(read('kitchen-v21.css').includes('max-height:min(92dvh,860px)'));
});
test('reduced motion and classic cooking methods remain supported',()=>{
 assert.match(styles,/@media\(prefers-reduced-motion:reduce\)/);
 const x=harness();x.kitchen.begin('toast');
 assert.equal(x.kitchen.craft,null,'stir is still a genuine original input step');
 assert.match(x.view.markup,/data-act="cook-tap"/);
 assert.doesNotMatch(x.view.markup,/k-craft-hero/);
});
test('closing a half-complete recipe removes residual craft state without minting dishes',()=>{
 const x=harness();x.kitchen.begin('salad');
 x.kitchen.handle('cook-craft','cut:0');
 x.kitchen.abandon();
 assert.equal(x.kitchen.session,null);
 assert.equal(x.kitchen.craft,null);
 assert.equal(x.state.cooking.dishes.length,0);
 assert.match(core,/kitchen\.session=null;kitchen\.craft=null;kitchen\.pointer=null/);
});
test('all cooking art and responsive technique assets are cached offline before the main game',()=>{
 assert.ok(html.indexOf('kitchen-craft-v2519.js')<html.indexOf('kitchen.js'));
 for(const asset of ['kitchen-craft-v2519.js','kitchen-craft-v2519.css']){
  assert.ok(html.includes(asset));assert.ok(worker.includes("'./"+asset+"'"));
 }
 assert.ok(worker.includes("'./kitchen-variety-art.js'"));
 assert.ok(worker.includes("'./kitchen-art.js'"));
 assert.match(worker,/const CACHE='hearth-harbor-v[0-9]+-[a-z-]+'/);
});

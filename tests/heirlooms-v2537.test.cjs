/* Hearth & Harbor v2.5.37 — The Heirloom Cabinet */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const w={window:{}};vm.runInNewContext(read('heirlooms-v2537.js'),w,{filename:'heirlooms-v2537.js'});
const M=w.window.HearthHeirlooms;
const project='project:1:h0:story',supper='supper:2:h0',nook='corner:h0:mabel',homeMemory='tradition:player:welcome';
function fixture(extra={}){
 const homes={mabel:'h0',rosie:'h0',oliver:'h1',jun:'h1',bea:'h2',finn:'h2'};
 const done={};const plans={};for(const id of M.RESIDENTS)done[id]=[];
 const memories=[
  {home:'h0',kind:'project',source:project,day:1,actors:['mabel','rosie'],detail:'story'},
  {home:'h0',kind:'supper',source:supper,day:2,actors:['mabel','rosie']},
  {home:'h0',kind:'corner',source:nook,day:3,actors:['mabel'],detail:'mabel'},
  {home:'h1',kind:'move',source:'move:1:oliver:jun',day:1,actors:['oliver','jun']},
  {home:'player',kind:'tradition',source:homeMemory,day:2,actors:['player'],detail:'welcome'},
  {home:'h2',kind:'supper',source:'supper:3:h2',day:3,actors:['bea','finn']}
 ];
 const state={day:8,coins:300,townBonds:{},heirlooms:M.clean(null),householdChronicle:{events:memories},...extra};
 let saves=0,updates=0,modal={key:'',html:''};const notices=[],playerTasks=[];
 const api={getState:()=>state,save:()=>saves++,updateUI:()=>updates++,notify:s=>notices.push(s),
  getResidentHome:id=>homes[id],getHomeMembers:home=>Object.keys(homes).filter(id=>homes[id]===home),
  getPersonLabel:id=>id==='player'?'Poppy':({mabel:'Mabel',rosie:'Rosie',oliver:'Oliver',jun:'Jun',bea:'Bea',finn:'Finn'})[id],
  getHomeLabel:home=>home==='player'?'Poppy’s Cottage':'Cozy '+home,
  getDone:id=>done[id],getMemories:home=>state.householdChronicle.events.filter(e=>e.home===home),
  getSchedule:(_home,id)=>plans[id]||[],addSchedule:(_home,id,act)=>{if((plans[id]||[]).length>=3)return false;(plans[id]??=[]).push(act);saves++;return true},
  queuePlayerHobby:()=>{if(playerTasks.length>=3)return false;playerTasks.push('hobby');return true},
  isElder:id=>id==='mabel',
  showModal:(key,html)=>modal={key,html},back:()=>modal={key:'daybook',html:'Household Daybook'}
 };
 const mod=M.setup(api);
 return {mod,state,homes,done,plans,api,playerTasks,notices,get saves(){return saves},get updates(){return updates},get modal(){return modal}};
}
const make=(f,home='h0',maker='mabel',source=project)=>{
 assert.equal(f.mod.begin(home,maker,source),true,'a genuine achievement may start craft');
 const r=f.mod.completed(home,maker,'hobby',true,f.state.day);assert.ok(r?.finished,'real finished hobby creates original');
 return r.item;
};
function painting(){return {calls:[],save(){this.calls.push('save')},restore(){this.calls.push('restore')},
 translate(x,y){this.calls.push(['translate',x,y])},fillRect(){this.calls.push('rect')},
 beginPath(){this.calls.push('begin')},ellipse(){this.calls.push('ellipse')},arc(){this.calls.push('arc')},
 fill(){this.calls.push('fill')},stroke(){this.calls.push('stroke')},
 moveTo(){this.calls.push('move')},lineTo(){this.calls.push('line')},closePath(){this.calls.push('close')},
 fillText(t){this.calls.push(['text',t])}}}
test('old saves have no invented heirlooms, no new currency and unchanged original six plus cottage homes',()=>{
 const f=fixture();assert.equal(JSON.stringify(f.mod.data),JSON.stringify({items:[],pending:{},daily:{},makerDay:{},giftDay:{},history:[]}));
 assert.equal(M.HOMES.length,7);assert.equal(Object.keys(M.KINDS).length,5);
 assert.equal(f.mod.comfort('player'),0);assert.equal(f.state.coins,300);
});
test('import refuses forged provenance fields, unknown artist, invalid day, fake homes and duplicate ids',()=>{
 const row={origin:'h0',holder:'h0',source:project,kind:'project',maker:'mabel',day:8,eventDay:1,gifts:0,lastGiftDay:0};
 const x=M.clean({items:[row,row,{...row,holder:'h1',maker:'hacker'},
  {...row,source:'<svg>',kind:'project'}, {...row,source:'ok',kind:'not-real'},
  {...row,source:'ok2',eventDay:18},{...row,source:'ok3',holder:'h9'}]});
 assert.equal(x.items.length,1);assert.equal(x.items[0].source,project);
});
test('import keeps genuine-shaped distinct items up to two per holder, maximum 42 total',()=>{
 const base={origin:'h0',holder:'h0',source:'s',kind:'supper',maker:'mabel',day:8,eventDay:2,gifts:0,lastGiftDay:0};
 const x=M.clean({items:[{...base,source:'a'},{...base,source:'b'},{...base,source:'c'}]});
 assert.equal(x.items.length,2);
});
test('save history and daily import discards malformed or repeated data',()=>{
 const x=M.clean({pending:{h0:{day:4,maker:'mabel',source:project},h1:{day:4,maker:'hacker',source:'f'}},
  daily:{h0:5,h9:2},makerDay:{mabel:6,hacker:4},giftDay:{h0:7,h9:2},
  history:[{day:3,home:'h0',origin:'h0',source:project,kind:'made',person:'mabel'},
   {day:3,home:'h0',origin:'h0',source:project,kind:'made',person:'mabel'},
   {day:3,home:'h0',origin:'h0',source:project,kind:'forge',person:'mabel'}]});
 assert.equal(Object.keys(x.pending).length,1);assert.equal(Object.keys(x.daily).length,1);
 assert.equal(Object.keys(x.makerDay).length,1);assert.equal(Object.keys(x.giftDay).length,1);
 assert.equal(x.history.length,1);
});
test('all five handcrafted heirloom types correspond to proven authentic historical event categories',()=>{
 const f=fixture();assert.equal(f.mod.proof('h0').length,3);
 for(const event of f.state.householdChronicle.events)assert.ok(M.KINDS[event.kind],event.kind);
 assert.equal(f.mod.proof('player')[0].source,homeMemory);
});
test('no provenance event: no crafting from fake names or future history',()=>{
 const f=fixture();assert.equal(f.mod.begin('h0','mabel','not-a-memory'),false);
 f.state.householdChronicle.events.push({home:'h0',day:20,kind:'supper',source:'supper:future'});
 assert.equal(f.mod.begin('h0','mabel','supper:future'),false);
 assert.equal(f.mod.data.pending.h0,undefined);
});
test('a neighbor cannot craft in a home where they do not actually live',()=>{
 const f=fixture();assert.equal(f.mod.begin('h0','oliver',project),false);
 f.homes.mabel='h2';assert.equal(f.mod.begin('h0','mabel',project),false);
 assert.equal(f.saves,0);
});
test('crafting intention does not award an object, money, needs, or comfort',()=>{
 const f=fixture();assert.equal(f.mod.begin('h0','mabel',project),true);
 assert.equal(f.mod.data.items.length,0);assert.equal(f.mod.comfort('h0'),0);
 assert.equal(f.state.coins,300);assert.equal(f.saves,1);
 assert.equal(f.mod.current('h0').source,project);
});
test('an unfinished craft cannot be silently overwritten by choosing another memory',()=>{
 const f=fixture();f.mod.begin('h0','mabel',project);
 assert.equal(f.mod.begin('h0','rosie',supper),false);
 assert.equal(f.mod.current('h0').source,project);
});
test('canceling an unfinished craft never creates an item or penalizes money',()=>{
 const f=fixture();f.mod.begin('h0','mabel',project);
 assert.equal(f.mod.cancel('h0'),true);assert.equal(f.mod.cancel('h0'),false);
 assert.equal(f.mod.data.items.length,0);assert.equal(f.state.coins,300);
});
test('wrong action, wrong maker, repeat and incorrect dates cannot complete a craft',()=>{
 const f=fixture();f.mod.begin('h0','mabel',project);
 for(const args of [['h0','mabel','read',true,8],['h0','rosie','hobby',true,8],
  ['h0','mabel','hobby',false,8],['h0','mabel','hobby',true,7],['h1','mabel','hobby',true,8]])
 assert.equal(f.mod.completed(...args),false);
 assert.equal(f.mod.data.items.length,0);
});
test('finishing an actually completed first real hobby creates one original heirloom at origin home',()=>{
 const f=fixture(),item=make(f);
 assert.equal(item.origin,'h0');assert.equal(item.holder,'h0');
 assert.equal(item.kind,'project');assert.equal(item.maker,'mabel');assert.equal(item.eventDay,1);
 assert.equal(f.mod.comfort('h0'),2);assert.equal(f.state.coins,300);
 assert.equal(f.mod.data.history[0].kind,'made');
});
test('elder crafter earns a visible brass accent but no unearned stat bonus',()=>{
 const f=fixture(),item=make(f);
 assert.equal(item.elderMade,true);
 assert.equal(f.mod.comfort('h0'),2);
});
test('the exact same historical event cannot be crafted twice after cancellation, time or transfer',()=>{
 const f=fixture();make(f);
 f.state.day=9;assert.equal(f.mod.begin('h0','mabel',project),false);
 assert.equal(f.mod.data.items.length,1);
});
test('daily one-craft-per-home and maker guards require future real practice',()=>{
 const f=fixture();make(f);
 assert.equal(f.mod.begin('h0','rosie',supper),false);
 f.state.day=9;assert.equal(f.mod.begin('h0','rosie',supper),true);
});
test('a resident already done with Hobby cannot start a retroactive fake craft',()=>{
 const f=fixture();f.done.mabel=['hobby'];assert.equal(f.mod.begin('h0','mabel',project),false);
});
test('a partial craft expires next day and cannot be finished retroactively',()=>{
 const f=fixture();f.mod.begin('h0','mabel',project);
 f.state.day=9;assert.equal(f.mod.current('h0'),null);
 assert.equal(f.mod.completed('h0','mabel','hobby',true,9),false);
});
test('moving maker to a different residence invalidates their incomplete activity',()=>{
 const f=fixture();f.mod.begin('h0','mabel',project);
 f.homes.mabel='h2';
 assert.equal(f.mod.current('h0'),null);
 assert.equal(f.mod.completed('h0','mabel','hobby'),false);
});
test('a cottage hobby really can make a unique Poppy heirloom',()=>{
 const f=fixture(),item=make(f,'player','player',homeMemory);
 assert.equal(item.origin,'player');assert.equal(item.maker,'player');
 assert.equal(f.mod.comfort('player'),2);
});
test('queue crafting uses an existing NPC independent Daybook, not an invented action',()=>{
 const f=fixture();f.mod.begin('h0','mabel',project);
 assert.equal(f.mod.queue('h0'),true);assert.equal(JSON.stringify(f.plans.mabel),JSON.stringify(['hobby']));
 assert.equal(f.mod.data.items.length,0);
 assert.equal(f.mod.queue('h0'),true);assert.equal(f.plans.mabel.length,1);
});
test('full schedules cannot be overwritten by queueing the heirloom crafting activity',()=>{
 const f=fixture();f.mod.begin('h0','mabel',project);
 f.plans.mabel=['meal','read','tidy'];
 assert.equal(f.mod.queue('h0'),false);assert.equal(f.plans.mabel.length,3);
});
test('Poppy crafting queues the real cottage hobby rather than generating a keepsake',()=>{
 const f=fixture();f.mod.begin('player','player',homeMemory);
 assert.equal(f.mod.queue('player'),true);assert.equal(JSON.stringify(f.playerTasks),JSON.stringify(['hobby']));
 assert.equal(f.mod.data.items.length,0);
});
test('two handmade objects grant a bounded four comfort in that real home',()=>{
 const f=fixture();make(f);
 f.state.day=9;make(f,'h0','rosie',supper);
 assert.equal(f.mod.items('h0').length,2);assert.equal(f.mod.comfort('h0'),4);
 f.state.day=10;assert.equal(f.mod.begin('h0','mabel',nook),false);
});
test('a physical heirloom can be gifted once to an actually occupied different house',()=>{
 const f=fixture();make(f);
 assert.equal(f.mod.gift('h0',project,'h1','jun'),true);
 assert.equal(f.mod.items('h0').length,0);assert.equal(f.mod.items('h1').length,1);
 assert.equal(f.mod.comfort('h0'),0);assert.equal(f.mod.comfort('h1'),2);
 assert.equal(f.mod.data.items.length,1);
 assert.equal(f.mod.data.history.at(-1).person,'jun');
});
test('original historical proof stays with origin home even after its physical heirloom leaves',()=>{
 const f=fixture();make(f);f.mod.gift('h0',project,'h1','jun');
 assert.ok(f.mod.proof('h0').some(e=>e.source===project));
 assert.equal(f.mod.proof('h1').some(e=>e.source===project),false);
 assert.equal(f.mod.begin('h0','mabel',project),false);
});
test('cannot give an heirloom to the same home, a ghost resident or an empty home',()=>{
 const f=fixture();make(f);
 for(const [home,id] of [['h0','rosie'],['h1','hacker'],['h5','mabel']])
 assert.equal(f.mod.gift('h0',project,home,id),false);
 assert.equal(f.mod.data.items[0].holder,'h0');
});
test('cannot give to an already-full recipient cabinet',()=>{
 const f=fixture();make(f);
 f.state.day=9;make(f,'h0','rosie',supper);
 f.state.day=10;make(f,'h1','oliver','move:1:oliver:jun');
 f.state.day=11;f.state.householdChronicle.events.push({home:'h1',source:'supper:11:h1',kind:'supper',day:11});
 make(f,'h1','jun','supper:11:h1');
 assert.equal(f.mod.gift('h0',project,'h1','jun'),false);
});
test('gift limits prevent same-day return loops and moves can continue on later days',()=>{
 const f=fixture();make(f);
 assert.equal(f.mod.gift('h0',project,'h1','jun'),true);
 assert.equal(f.mod.gift('h0',project,'h0','mabel'),false);
 f.state.day=9;assert.equal(f.mod.gift('h0',project,'h0','rosie'),true);
 assert.equal(f.mod.data.items.length,1);assert.equal(f.mod.data.items[0].gifts,2);
});
test('a home can give or receive at most one heirloom on a single game day',()=>{
 const f=fixture();make(f);f.state.day=9;make(f,'h0','rosie',supper);
 assert.equal(f.mod.gift('h0',project,'h1','oliver'),true);
 assert.equal(f.mod.gift('h0',supper,'h2','bea'),false);
});
test('a gifted heirloom survives JSON save/reload without duplicating its provenance',()=>{
 const f=fixture();make(f);f.mod.gift('h0',project,'h1','jun');
 const saved=JSON.parse(JSON.stringify(f.mod.data));
 const next=fixture({day:9,heirlooms:M.clean(saved)});
 assert.equal(next.mod.items('h1').length,1);
 assert.equal(next.mod.items('h0').length,0);
 assert.equal(next.mod.comfort('h1'),2);
 assert.equal(next.mod.data.items[0].maker,'mabel');
});
test('all five event types draw distinct original framed miniature mementos',()=>{
 const events=[
  ['h0','mabel',project],['h0','mabel',supper],
  ['h0','mabel',nook],['h1','oliver','move:1:oliver:jun'],['player','player',homeMemory]
 ];
 for(const [home,maker,source] of events){
  const f=fixture();const item=make(f,home,maker,source);
  const g=painting();f.mod.draw(g,home);assert.ok(g.calls.length>19,item.kind);
  assert.ok(g.calls.some(x=>Array.isArray(x)&&x[0]==='text'&&x[1]==='DAY '+item.eventDay));
 }
});
test('the real-world renderer only draws objects at their actual current owner residence',()=>{
 const f=fixture(),g=painting();f.mod.draw(g,'h0');assert.equal(g.calls.length,0);
 make(f);f.mod.draw(g,'h0');const painted=g.calls.length;assert.ok(painted>0);
 f.mod.gift('h0',project,'h1','jun');f.mod.draw(g,'h0');assert.equal(g.calls.length,painted);
 f.mod.draw(g,'h1');assert.ok(g.calls.length>painted);
});
test('cabinet book provides real source events, matching craft maker, gift targets and tactile buttons',()=>{
 const f=fixture();f.mod.board('h0');assert.equal(f.modal.key,'heirloom-cabinet');
 assert.match(f.modal.html,/The Heirloom Cabinet/);
 assert.match(f.modal.html,/Together Figurine/);
 assert.match(f.modal.html,/Let Mabel make it/);
 assert.match(f.modal.html,/aria-pressed/);
 f.mod.handle('hl37-make','h0|mabel|'+project,'h0');
 assert.match(f.modal.html,/Queue the real crafting activity/);
 assert.match(f.modal.html,/Set this craft aside/);
});
test('the complete UI gift control moves object and switches view to the recipient',()=>{
 const f=fixture();make(f);
 f.mod.handle('hl37-gift','h0|'+project+'|h1|jun','h0');
 assert.equal(f.mod.data.items[0].holder,'h1');
 assert.match(f.modal.html,/Cozy h1/);
 f.mod.handle('hl37-back',null,'h1');assert.equal(f.modal.key,'daybook');
});
test('actual game observes all genuine first hobby paths, unchanged save, home comfort and physical art',()=>{
 const g=read('game.js');
 for(const needle of ["const SAVE='hearth-harbor-save-v1'",
  "window.HearthHeirlooms.clean(raw.heirlooms)","window.HearthHeirlooms.setup({",
  "heirlooms.completed('player','player',kind,true,state.day)",
  "heirlooms.completed(activeResidence,id,kind,true,state.day)",
  "heirlooms.completed(activeResidence,n.id,kind,true,state.day)",
  "heirlooms.completed(activeResidence,id,'hobby',true,state.day)",
  "heirlooms.comfort('player')","heirlooms.comfort(home)",
  "heirlooms.draw(ctx,'player')","heirlooms.draw(ctx,activeResidence)",
  "btn('✦ The Heirloom Cabinet','hl37-board')",
  "if(action.startsWith('hl37-'))"])
 assert.ok(g.includes(needle),needle);
});
test('offline mobile assets are loaded in safe order, with accessible responsive UI and no outside services',()=>{
 const html=read('index.html'),sw=read('sw.js'),css=read('heirlooms-v2537.css');
 for(const asset of ['heirlooms-v2537.js','heirlooms-v2537.css'])assert.ok(html.includes(asset)&&sw.includes("'./"+asset+"'"));
 assert.ok(html.indexOf('heirlooms-v2537.js')<html.indexOf('game.js'));
 assert.match(sw,/hearth-harbor-v2537-heirloom-cabinet/);
 for(const k of ['@media(max-width:390px)','@media(min-width:680px)','touch-action:manipulation','button:focus-visible','prefers-reduced-motion:reduce'])assert.ok(css.includes(k),k);
 assert.doesNotMatch(read('heirlooms-v2537.js'),/fetch\(|WebSocket|XMLHttpRequest|new Image\(|setInterval|localStorage|\.coins\s*[+]=/);
});

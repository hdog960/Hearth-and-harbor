/* Hearth & Harbor v2.5.36 — Seasons of Life real adult aging QA */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const c={window:{}};vm.runInNewContext(read('life-seasons-v2536.js'),c,{filename:'life-seasons-v2536.js'});
const L=c.window.HearthLifeSeasons;
function fixture(extra={}){
 const homes={mabel:'h0',rosie:'h0',oliver:'h1',jun:'h1',bea:'h2',finn:'h2'};
 const needs={},done={},plans={};for(const id of L.IDS){needs[id]={food:67,fun:45,social:52,energy:65};done[id]=[]}
 const state={day:1,coins:300,townBonds:{'mabel|rosie':10},lifeSeasons:L.clean(null),...extra};
 let saves=0,updated=0,modal={key:'',html:''};const messages=[];
 const callbacks={getState:()=>state,save:()=>saves++,updateUI:()=>updated++,notify:s=>messages.push(s),
  getResidentHome:id=>homes[id],getHomeMembers:home=>Object.keys(homes).filter(id=>homes[id]===home),
  getPersonLabel:id=>({mabel:'Mabel',rosie:'Rosie',oliver:'Oliver',jun:'Jun',bea:'Bea',finn:'Finn'})[id],
  getHomeLabel:h=>'Cozy '+h,getNeeds:id=>needs[id],getDone:id=>done[id],
  getSchedule:(_home,id)=>plans[id]||[],addSchedule:(_home,id,act)=>{
   if((plans[id]||[]).length>=3)return false;(plans[id]??=[]).push(act);saves++;return true},
  showModal:(key,html)=>modal={key,html},back:()=>modal={key:'daybook',html:'Home Daybook'}};
 const life=L.setup(callbacks);return {state,homes,needs,done,plans,life,messages,callbacks,get saves(){return saves},get updated(){return updated},get modal(){return modal}};
}
function ctx(){return {n:0,save(){this.n++},restore(){this.n++},translate(){this.n++},fillRect(){this.n++},beginPath(){this.n++},arc(){this.n++},quadraticCurveTo(){this.n++},fill(){this.n++},stroke(){this.n++},moveTo(){this.n++},lineTo(){this.n++},closePath(){this.n++},fillText(){this.n++}}}
const enable=f=>{assert.equal(f.life.toggle(),true);assert.equal(f.life.data.enabled,true)};
function birthday(f,id='mabel'){
 const p=f.life.data.profiles[id];f.state.day=p.nextDay;assert.equal(f.life.nextDay(f.state.day)>0,true);
 return f.life.data.pending[id];
}
function celebrate(f,id='mabel',action='meal'){
 const home=f.homes[id],partner=Object.entries(f.homes).find(([other,h])=>other!==id&&h===home)?.[0];
 assert.equal(f.life.begin(home,id,action),true);
 return f.life.completed(home,partner,action,true,f.state.day);
}
test('legacy saves disable adult aging and preserve original independent adult lives',()=>{
 const f=fixture(),a=f.life.data;
 assert.equal(a.enabled,false);assert.equal(Object.keys(a.profiles).length,0);
 assert.equal(f.life.chapter('mabel'),0);assert.equal(f.state.coins,300);
 assert.equal(L.IDS.length,6);assert.equal(L.STAGES.length,3);
});
test('strict saved record import filters invalid days, residents and malformed actions',()=>{
 const x=L.clean({enabled:'true',profiles:{mabel:{years:4,nextDay:20},hacker:{years:7,nextDay:40},rosie:{years:-1,nextDay:8}},
 pending:{mabel:{day:9,until:30,year:1},rosie:{day:11,until:16,year:1},finn:{day:5,until:9,year:300}},
 sessions:{h0:{day:4,celebrant:'mabel',host:'rosie',action:'meal'},h1:{day:2,celebrant:'mabel',host:'mabel',action:'chat'}},
 history:[{home:'h0',day:5,year:1,celebrant:'mabel',host:'rosie',action:'chat'},{home:'h0',day:5,year:1,celebrant:'mabel',host:'rosie',action:'meal'}],
 keepsakes:['h0','h0','h9']});
 assert.equal(x.enabled,false);assert.equal(Object.keys(x.profiles).length,1);
 assert.equal(x.pending.mabel,undefined);assert.equal(x.pending.rosie.until,16);
 assert.equal(Object.keys(x.sessions).length,1);assert.equal(x.history.length,1);
 assert.equal(JSON.stringify(x.keepsakes),JSON.stringify(['h0']));
});
test('opt in creates staggered future milestones without awarding anything today',()=>{
 const f=fixture();enable(f);
 assert.equal(f.life.data.profiles.mabel.nextDay,5);assert.equal(f.life.data.profiles.finn.nextDay,25);
 assert.equal(f.life.data.history.length,0);assert.equal(f.life.comfort('h0'),0);
 assert.equal(f.needs.mabel.social,52);assert.equal(f.state.coins,300);
 assert.equal(f.saves,1);
});
test('day transitions before birthdays never create an event or advance years',()=>{
 const f=fixture();enable(f);
 for(let day=2;day<5;day++){f.state.day=day;assert.equal(f.life.nextDay(day),0)}
 assert.equal(f.life.data.profiles.mabel.years,0);
 assert.equal(f.life.data.pending.mabel,undefined);
});
test('the first real birthday arrives on the existing seasonal year calendar, not instantly',()=>{
 const f=fixture();enable(f);const p=birthday(f);
 assert.equal(p.year,1);assert.equal(p.day,5);assert.equal(p.until,11);
 assert.equal(f.life.stageFor('mabel').name,'Young Adult');
 assert.equal(f.life.data.history.length,0,'clock milestone never pays or completes a party');
});
test('each resident has their own staggered milestone and identity intact',()=>{
 const f=fixture();enable(f);f.state.day=9;assert.equal(f.life.nextDay(9),2,'both elapsed residents reached their first milestones');
 assert.equal(f.life.data.profiles.mabel.years,1);assert.equal(f.life.data.profiles.rosie.years,1);
 assert.equal(f.life.data.profiles.jun.years,0);assert.equal(f.life.data.pending.rosie.year,1);
});
test('a pending celebration expires after seven in-game days without invented rewards',()=>{
 const f=fixture();enable(f);birthday(f);
 f.state.day=12;f.life.nextDay(12);
 assert.equal(f.life.available('mabel','h0'),null);
 assert.equal(f.life.data.history.length,0);
});
test('pausing freezes all adult milestone dates even if many days pass',()=>{
 const f=fixture();enable(f);f.state.day=3;f.life.toggle();
 assert.equal(f.life.data.enabled,false);
 f.state.day=60;assert.equal(f.life.nextDay(60),0);
 assert.equal(f.life.chapter('mabel'),0);
 f.life.toggle();
 assert.equal(f.life.data.profiles.mabel.nextDay,62);
 assert.equal(f.life.data.profiles.rosie.nextDay,66);
});
test('pause preserves an active birthday window and unpauses into the same window',()=>{
 const f=fixture();enable(f);birthday(f);
 f.life.toggle();f.state.day=20;f.life.toggle();
 assert.equal(f.life.data.pending.mabel.day,20);
 assert.equal(f.life.data.pending.mabel.until,26);
 assert.ok(f.life.available('mabel','h0'));
});
test('after two actual village years, a grown adult chapter appears',()=>{
 const f=fixture();enable(f);
 birthday(f);f.state.day=33;f.life.nextDay(33);
 assert.equal(f.life.data.profiles.mabel.years,2);
 assert.equal(f.life.stageFor('mabel').name,'Adult');
 assert.equal(f.life.stageFor('rosie').name,'Young Adult');
});
test('five village years lead to elder chapter with retained learned skills',()=>{
 const f=fixture();enable(f);
 for(let k=0;k<5;k++){const p=f.life.data.profiles.mabel;f.state.day=p.nextDay;f.life.nextDay(f.state.day)}
 assert.equal(f.life.data.profiles.mabel.years,5);
 assert.equal(f.life.stageFor('mabel').name,'Elder');
 f.life.toggle();assert.equal(f.life.stageFor('mabel').name,'Elder','pausing never reverses older sprite chapter');
});
test('no real resident home or single-resident household can start a birthday celebration',()=>{
 const f=fixture();enable(f);birthday(f);
 f.homes.rosie='h3';
 assert.equal(f.life.begin('h0','mabel','meal'),false);
 assert.equal(f.life.begin('h5','mabel','meal'),false);
 assert.equal(f.life.data.sessions.h0,undefined);
});
test('a player cannot start a birthday meal for another home or a stranger',()=>{
 const f=fixture();enable(f);birthday(f);
 assert.equal(f.life.begin('h1','mabel','meal'),false);
 assert.equal(f.life.begin('h0','hacker','meal'),false);
 assert.equal(f.life.begin('h0','mabel','hacker'),false);
 assert.equal(f.life.data.history.length,0);
});
test('booking a birthday gathering is free and requires subsequent real action completion',()=>{
 const f=fixture();enable(f);birthday(f);
 assert.equal(f.life.begin('h0','mabel','meal'),true);
 assert.equal(f.life.session('h0').host,'rosie');
 assert.equal(f.life.data.history.length,0);
 assert.equal(f.state.coins,300);
 assert.equal(f.needs.mabel.social,52);
});
test('a birthday host who already completed the action cannot pretend to cook again',()=>{
 const f=fixture();enable(f);birthday(f);f.done.rosie.push('meal');
 assert.equal(f.life.begin('h0','mabel','meal'),false);
 assert.equal(f.life.begin('h0','mabel','chat'),true);
});
test('wrong actor, action, stale day and repeated completion do not award birthdays',()=>{
 const f=fixture();enable(f);birthday(f);f.life.begin('h0','mabel','meal');
 for(const args of [['h0','mabel','meal',true,5],['h0','rosie','chat',true,5],['h0','rosie','meal',false,5],['h0','rosie','meal',true,4],['h1','rosie','meal',true,5]])
  assert.equal(f.life.completed(...args),false);
 assert.equal(f.life.data.history.length,0);
});
test('a genuine first completed host meal earns one bounded birthday memory',()=>{
 const f=fixture();enable(f);birthday(f);const out=celebrate(f);
 assert.equal(out.celebrant,'mabel');assert.equal(out.year,1);
 assert.equal(f.life.data.history.length,1);assert.equal(f.needs.mabel.social,56);
 assert.equal(f.needs.rosie.social,56);
 assert.equal(f.state.townBonds['mabel|rosie'],11);
 assert.equal(f.state.coins,300);
});
test('chat is a real alternative to cooking and never pays for the menu selection',()=>{
 const f=fixture();enable(f);birthday(f);
 assert.equal(f.life.begin('h0','mabel','chat'),true);
 assert.equal(f.life.data.history.length,0);
 assert.equal(f.life.completed('h0','rosie','chat').celebrant,'mabel');
});
test('same birthday cannot farm rewards through second session or repeated actions',()=>{
 const f=fixture();enable(f);birthday(f);celebrate(f);
 for(let i=0;i<12;i++){assert.equal(f.life.completed('h0','rosie','meal'),false);assert.equal(f.life.begin('h0','mabel','chat'),false)}
 assert.equal(f.life.data.history.length,1);assert.equal(f.needs.mabel.social,56);
});
test('a canceled or interrupted party gives no birthday rewards',()=>{
 const f=fixture();enable(f);birthday(f);f.life.begin('h0','mabel','chat');
 assert.equal(f.life.cancel('h0'),true);
 assert.equal(f.life.completed('h0','rosie','chat'),false);
 assert.equal(f.life.data.history.length,0);
});
test('new day invalidates party session but birthday window remains available',()=>{
 const f=fixture();enable(f);birthday(f);f.life.begin('h0','mabel','meal');
 f.state.day=6;f.life.nextDay(6);
 assert.equal(f.life.session('h0'),null);
 assert.ok(f.life.available('mabel','h0'));
 assert.equal(f.life.data.history.length,0);
});
test('moving the celebrant away invalidates a genuine pending party',()=>{
 const f=fixture();enable(f);birthday(f);f.life.begin('h0','mabel','meal');
 f.homes.mabel='h4';
 assert.equal(f.life.session('h0'),null);
 assert.equal(f.life.completed('h0','rosie','meal'),false);
});
test('scheduling never overwrites existing work and does not grant early rewards',()=>{
 const f=fixture();enable(f);birthday(f);f.life.begin('h0','mabel','meal');
 f.plans.rosie=['read','tidy','hobby'];assert.equal(f.life.queue('h0'),false);
 f.plans.rosie=['read'];assert.equal(f.life.queue('h0'),true);
 assert.equal(JSON.stringify(f.plans.rosie),JSON.stringify(['read','meal']));
 assert.equal(f.life.queue('h0'),true);assert.equal(f.plans.rosie.length,2);
 assert.equal(f.life.data.history.length,0);
});
test('real second birthday celebration earns permanent original home garland, no duplicate',()=>{
 const f=fixture();enable(f);birthday(f);celebrate(f);
 f.state.day=f.life.data.profiles.mabel.nextDay;f.life.nextDay(f.state.day);
 const second=celebrate(f);
 assert.equal(second.earned,true);assert.equal(f.life.comfort('h0'),2);
 assert.equal(f.life.data.keepsakes.length,1);
 f.state.day=f.life.data.profiles.mabel.nextDay;f.life.nextDay(f.state.day);
 celebrate(f);assert.equal(f.life.data.keepsakes.length,1);
});
test('earned garland and birthdays remain in save after JSON roundtrip even with aging paused',()=>{
 const f=fixture();enable(f);birthday(f);celebrate(f);
 f.state.day=f.life.data.profiles.mabel.nextDay;f.life.nextDay(f.state.day);celebrate(f);
 f.life.toggle();
 const loaded=fixture({lifeSeasons:L.clean(JSON.parse(JSON.stringify(f.life.data))),day:f.state.day+4});
 assert.equal(loaded.life.comfort('h0'),2);assert.equal(loaded.life.data.history.length,2);
 assert.equal(loaded.life.data.enabled,false);
});
test('visual garland and authentic pending birthday plaque render only when unlocked or active',()=>{
 const f=fixture(),g=ctx();f.life.draw(g,'h0');assert.equal(g.n,0);
 enable(f);birthday(f);f.life.begin('h0','mabel','meal');f.life.draw(g,'h0');
 assert.ok(g.n>=7,'a real birthday session paints the in-world plaque');f.life.cancel('h0');
 const before=g.n;f.life.draw(g,'h0');assert.equal(g.n,before);
 celebrate(f);f.state.day=f.life.data.profiles.mabel.nextDay;f.life.nextDay(f.state.day);celebrate(f);
 f.life.draw(g,'h0');assert.ok(g.n-before>18);
 const after=g.n;f.life.draw(g,'h4');assert.equal(g.n,after);
});
test('only actual completed elder mentor lesson grants once-daily small care and history',()=>{
 const f=fixture();enable(f);
 for(let k=0;k<5;k++){f.state.day=f.life.data.profiles.mabel.nextDay;f.life.nextDay(f.state.day)}
 assert.equal(f.life.stageFor('mabel').name,'Elder');
 const result=f.life.wisdom('h0','mabel','rosie',true,f.state.day);
 assert.equal(result.mentor,'mabel');assert.equal(f.needs.mabel.social,55);
 assert.equal(f.needs.rosie.fun,48);
 assert.equal(f.life.data.wisdom.length,1);
 assert.equal(f.life.wisdom('h0','mabel','rosie',true,f.state.day),false);
});
test('younger adults, false lesson completions and moved students never grant elder wisdom',()=>{
 const f=fixture();enable(f);
 assert.equal(f.life.wisdom('h0','mabel','rosie',true),false);
 for(let i=0;i<5;i++){f.state.day=f.life.data.profiles.mabel.nextDay;f.life.nextDay(f.state.day)}
 assert.equal(f.life.wisdom('h0','mabel','rosie',false),false);
 f.homes.rosie='h4';assert.equal(f.life.wisdom('h0','mabel','rosie',true),false);
 assert.equal(f.life.data.wisdom.length,0);
});
test('elder wisdom care is bounded by original needs and requires voluntary aging enabled',()=>{
 const f=fixture();enable(f);
 for(let k=0;k<5;k++){f.state.day=f.life.data.profiles.mabel.nextDay;f.life.nextDay(f.state.day)}
 f.needs.mabel.social=99;f.needs.rosie.fun=99;f.life.toggle();
 assert.equal(f.life.wisdom('h0','mabel','rosie',true),false);
 f.life.toggle();
 assert.equal(f.life.wisdom('h0','mabel','rosie',true).mentor,'mabel');
 assert.equal(f.needs.mabel.social,100);assert.equal(f.needs.rosie.fun,100);
});
test('actual game uses existing calendar transition and genuine house action paths',()=>{
 const g=read('game.js');
 for(const needle of ["window.HearthLifeSeasons.clean(raw.lifeSeasons)","window.HearthLifeSeasons.setup({",
  "processHousingDay();lifeSeasons.nextDay(state.day);",
  "lifeSeasons.completed(activeResidence,id,kind,true,state.day)",
  "lifeSeasons.completed(activeResidence,n.id,kind,true,state.day)",
  "lifeSeasons.wisdom(activeResidence,s.mentor,s.learner,true,state.day)",
  "lifeSeasons.draw(ctx,activeResidence)","lifeSeasons.chapter(o.id)===2",
  "lifeSeasons.comfort(home)","btn('🍂 Seasons of Life · Birthdays','ls36-board')",
  "if(action.startsWith('ls36-'))"])assert.ok(g.includes(needle),needle);
});
test('interactive birthday book shows all six adults and real calendar, toggle and celebration actions',()=>{
 const f=fixture();f.life.board('h0');
 assert.equal(f.modal.key,'life-seasons');
 assert.match(f.modal.html,/Enable life seasons/);
 assert.equal((f.modal.html.match(/class="ls36-person"/g)||[]).length,6);
 enable(f);birthday(f);f.life.board('h0');
 assert.match(f.modal.html,/Mabel/);
 assert.match(f.modal.html,/Prepare a birthday meal/);
 assert.match(f.modal.html,/Share birthday stories/);
 assert.match(f.modal.html,/Next birthday milestone/);
});
test('action buttons genuinely toggle, select, cancel and return to household',()=>{
 const f=fixture();f.life.handle('ls36-toggle',null,'h0');
 assert.equal(f.life.data.enabled,true);
 birthday(f);
 f.life.handle('ls36-start','h0|mabel|chat','h0');assert.equal(f.life.session('h0').action,'chat');
 f.life.handle('ls36-cancel','h0','h0');assert.equal(f.life.session('h0'),null);
 f.life.handle('ls36-back',null,'h0');assert.equal(f.modal.key,'daybook');
});
test('new assets load before game.js, offline service worker caches and iPhone CSS supports narrow UI',()=>{
 const html=read('index.html'),sw=read('sw.js'),css=read('life-seasons-v2536.css');
 for(const p of ['life-seasons-v2536.js','life-seasons-v2536.css'])assert.ok(html.includes(p)&&sw.includes("'./"+p+"'"));
 assert.ok(html.indexOf('life-seasons-v2536.js')<html.indexOf('game.js'));
 assert.match(sw,/hearth-harbor-v2536-seasons-of-life/);
 for(const needle of ['@media(max-width:390px)','@media(min-width:680px)','touch-action:manipulation','button:focus-visible','prefers-reduced-motion:reduce'])assert.ok(css.includes(needle),needle);
 assert.doesNotMatch(read('life-seasons-v2536.js'),/fetch\(|XMLHttpRequest|WebSocket|new Image\(|setInterval|localStorage|\.coins\s*[+]=/);
});

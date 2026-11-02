/* Hearth & Harbor v2.5.31 — Personal Corners regression tests */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const w={window:{}};vm.runInNewContext(read('personal-corners-v2531.js'),w);
const M=w.window.HearthPersonalCorners;
const furniture={mabel:'plant',rosie:'chair',oliver:'rug',jun:'books',bea:'flowers',finn:'lamp'};
const tasks={mabel:'hobby',rosie:'chat',oliver:'meal',jun:'read',bea:'hobby',finn:'tidy'};
function fixture(extra={}){
 const homes={mabel:'h0',rosie:'h0',oliver:'h1',jun:'h1',bea:'h2',finn:'h2'};
 const props={h0:[{kind:'plant',x:430,y:730},{kind:'chair',x:700,y:755}],
  h1:[{kind:'rug',x:600,y:860},{kind:'books',x:350,y:620}],
  h2:[{kind:'flowers',x:510,y:795},{kind:'lamp',x:850,y:780}],h3:[],h4:[],h5:[]};
 const needs={};for(const id of M.IDS)needs[id]={fun:45,social:50,energy:80,food:70};
 const state={day:1,coins:200,personalCorners:M.clean(null),...extra};
 let alerts=[];const callbacks={
  getState:()=>state,getHomeMembers:home=>Object.keys(homes).filter(id=>homes[id]===home),
  getResidentHome:id=>homes[id],getProps:home=>props[home],getNeeds:id=>needs[id],
  notify:s=>alerts.push(s)
 };
 const mod=M.setup(callbacks);return {mod,state,homes,props,needs,alerts};
}
function context(){
 return {n:0,save(){this.n++},restore(){this.n++},translate(){this.n++},fillRect(){this.n++},
  beginPath(){this.n++},ellipse(){this.n++},fill(){this.n++},arc(){this.n++},stroke(){this.n++},
  moveTo(){this.n++},lineTo(){this.n++},closePath(){this.n++}};
}
test('legacy saves initialize safe optional personal data without changing money or residents',()=>{
 const a=M.clean(null);assert.equal(JSON.stringify(a),JSON.stringify({daily:{},counts:{},memories:[]}));
 const h=fixture();assert.equal(h.mod.comfort('h0'),4);assert.equal(h.state.coins,200);
});
test('all six residents have intentionally different actual existing furnish preferences',()=>{
 assert.equal(M.IDS.length,6);assert.equal(Object.keys(M.FAVORITES).length,6);
 assert.equal(new Set(Object.values(M.FAVORITES).map(x=>x.prop)).size,6);
 for(const id of M.IDS){assert.equal(M.FAVORITES[id].prop,furniture[id]);assert.equal(M.FAVORITES[id].action,tasks[id])}
});
test('every matched furnishing adds only two actual comfort points for each current resident',()=>{
 const h=fixture();assert.equal(h.mod.comfort('h0'),4);
 h.props.h0.pop();assert.equal(h.mod.comfort('h0'),2);
 h.props.h0=[];assert.equal(h.mod.comfort('h0'),0);
});
test('residence has a maximum of four added personality comfort regardless of spare furniture',()=>{
 const h=fixture();for(let i=0;i<18;i++)h.props.h0.push({kind:'plant',x:420+i*2,y:650});
 assert.equal(h.mod.comfort('h0'),4);
});
test('empty homes and wrong residents cannot invent a personal corner or reward',()=>{
 const h=fixture();assert.equal(h.mod.corner('h5','mabel'),null);
 assert.equal(h.mod.recordAction('h5','mabel','hobby'),false);
 assert.equal(h.mod.corner('h0','jun'),null);
 assert.equal(h.mod.recordAction('h0','jun','read'),false);
});
test('missing favorite furnishing means even correct authentic activities cannot earn bonus or memories',()=>{
 const h=fixture();h.props.h0=[];
 assert.equal(h.mod.recordAction('h0','mabel','hobby',true),false);
 assert.equal(h.mod.data.memories.length,0);assert.equal(h.needs.mabel.fun,45);
});
test('genuine daily first completion helps actor and a housemate, with no money or XP',()=>{
 const h=fixture(),r=h.mod.recordAction('h0','mabel','hobby',true);
 assert.equal(r.count,1);assert.equal(h.needs.mabel.fun,48);
 assert.equal(h.needs.rosie.social,53);assert.equal(h.state.coins,200);
 assert.equal(h.mod.data.memories.length,1);
});
test('wrong activity, non-first activities and forged dates never earn a personal memory',()=>{
 const h=fixture();for(const args of [
 ['h0','mabel','meal',true,1],['h0','mabel','hobby',false,1],
 ['h0','mabel','hobby',true,2],['h0','mabel','hobby',true,0],
 ['h0','hacker','hobby',true,1]])assert.equal(h.mod.recordAction(...args),false);
 assert.equal(h.mod.data.memories.length,0);
});
test('only one personal ritual per resident per in-game day, including repeated taps',()=>{
 const h=fixture();h.mod.recordAction('h0','mabel','hobby');
 for(let i=0;i<20;i++)assert.equal(h.mod.recordAction('h0','mabel','hobby'),false);
 assert.equal(h.mod.data.counts['h0|mabel'],1);assert.equal(h.needs.mabel.fun,48);
});
test('moving homes on the same day cannot farm an additional personal routine',()=>{
 const h=fixture();h.mod.recordAction('h0','mabel','hobby');
 h.homes.mabel='h1';h.props.h1.push({kind:'plant',x:475,y:750});
 assert.equal(h.mod.recordAction('h1','mabel','hobby'),false);
 assert.equal(h.mod.comfort('h0'),2);assert.equal(h.mod.comfort('h1'),4);
});
test('three different days of genuine matching activity earn a bespoke handmade memento',()=>{
 const h=fixture();
 for(let day=1;day<=3;day++){h.state.day=day;h.mod.recordAction('h0','mabel','hobby',true)}
 assert.equal(h.mod.corner('h0','mabel').completed,true);
 assert.equal(h.mod.corner('h0','mabel').count,3);
 assert.match(h.alerts.at(-1),/handmade memento/);
});
test('personal keepsakes remain recorded across JSON serialization and reload',()=>{
 const h=fixture();for(let day=1;day<=3;day++){h.state.day=day;h.mod.recordAction('h0','mabel','hobby')}
 const reloaded=fixture({personalCorners:M.clean(JSON.parse(JSON.stringify(h.mod.data))),day:4});
 assert.equal(reloaded.mod.corner('h0','mabel').completed,true);
 assert.equal(reloaded.mod.comfort('h0'),4);
});
test('memento is hidden when owner moves away or required furniture is removed',()=>{
 const h=fixture();for(let day=1;day<=3;day++){h.state.day=day;h.mod.recordAction('h0','mabel','hobby')}
 h.homes.mabel='h4';assert.equal(h.mod.corner('h0','mabel'),null);
 h.homes.mabel='h0';h.props.h0=h.props.h0.filter(x=>x.kind!=='plant');
 assert.equal(h.mod.corner('h0','mabel').ready,false);
});
test('import filter rejects forged actors, invalid dates, unknown homes and duplicate memories',()=>{
 const rec=M.clean({daily:{mabel:{day:2,home:'h0'},intruder:{day:2,home:'h0'},rosie:{day:-2,home:'h1'}},
 counts:{'h0|mabel':12,'h7|mabel':3,'h0|__proto__':3,'h1|jun':-8},
 memories:[{day:1,id:'mabel',home:'h0'},{day:1,id:'mabel',home:'h0'},{day:2,id:'unknown',home:'h0'},{day:3,id:'jun',home:'h3'}]});
 assert.equal(Object.keys(rec.daily).length,1);
 assert.equal(rec.counts['h0|mabel'],12);
 assert.equal(Object.keys(rec.counts).length,1);
 assert.equal(rec.memories.length,2);
});
test('all six original personal art accents are painted at real furniture positions',()=>{
 const h=fixture(),g=context();
 for(const home of ['h0','h1','h2']){let n=g.n;h.mod.draw(g,home,{tick:1});assert.ok(g.n-n>20,home)}
});
test('home without appropriate furniture paints no personal ornaments',()=>{
 const h=fixture(),g=context();h.mod.draw(g,'h5',{tick:1});assert.equal(g.n,0);
 h.props.h0=[];h.mod.draw(g,'h0',{tick:1});assert.equal(g.n,0);
});
test('Daybook panel lists real furniture wishes, daily milestones and current resident names',()=>{
 const h=fixture();const html=h.mod.panel('h0');
 assert.match(html,/The Corners That Feel Like Us/);
 assert.match(html,/Mabel/);assert.match(html,/Rosie/);
 assert.match(html,/Little Garden Nook/);assert.match(html,/Tea with Friends/);
 assert.match(html,/\+4 \/ 4 personality comfort/);
 assert.doesNotMatch(html,/Oliver/);
});
test('resident daily ritual history remains bounded to last 36 real completions',()=>{
 const h=fixture();for(let day=1;day<=60;day++){h.state.day=day;h.mod.recordAction('h0','mabel','hobby',true)}
 assert.equal(h.mod.data.memories.length,36);
 assert.equal(h.mod.data.memories[0].day,25);
 assert.equal(h.mod.data.memories.at(-1).day,60);
});
test('real game hooks all three completion paths and hobby studio also credits paired projects',()=>{
 const g=read('game.js');
 for(const word of ["HearthPersonalCorners.clean(raw.personalCorners)","HearthPersonalCorners.setup({",
 "personalCorners.recordAction(activeResidence,n.id,kind,true,state.day)",
 "personalCorners.recordAction(activeResidence,id,kind,true,state.day)",
 "personalCorners.recordAction(activeResidence,id,'hobby',true,state.day)",
 "roommateProjects.recordAction(activeResidence,id,'hobby',true,state.day)",
 "personalCorners.comfort(home)","personalCorners.draw(g,activeResidence,{tick})",
 "personalCorners.panel(activeResidence)"])assert.ok(g.includes(word),word);
});
test('all extra effects are small, capped, and not another currency or idle income stream',()=>{
 const h=fixture();
 for(let day=1;day<=35;day++){h.state.day=day;h.mod.recordAction('h0','mabel','hobby',true)}
 assert.equal(h.needs.mabel.fun,100);assert.equal(h.needs.rosie.social,100);
 assert.equal(h.state.coins,200);
 assert.doesNotMatch(read('personal-corners-v2531.js'),/fetch\(|WebSocket|XMLHttpRequest|setTimeout|setInterval|localStorage|\.coins\s*[+]=/);
});
test('module and stylesheet are loaded before main game and offline precached',()=>{
 const html=read('index.html'),sw=read('sw.js'),css=read('personal-corners-v2531.css');
 for(const asset of ['personal-corners-v2531.js','personal-corners-v2531.css'])assert.ok(html.includes(asset)&&sw.includes("'./"+asset+"'"));
 assert.ok(html.indexOf('personal-corners-v2531.js')<html.indexOf('game.js'));
 assert.match(sw,/hearth-harbor-v2531-personal-corners/);
 for(const token of ['@media(max-width:390px)','@media(min-width:680px)','prefers-reduced-motion:reduce','.pc31-person'])assert.ok(css.includes(token),token);
});
test('legacy saves keep original key, all household modules and actual recipe system',()=>{
 const g=read('game.js');
 for(const t of ["const SAVE='hearth-harbor-save-v1'","HearthRoommateProjects.setup({","HearthHouseholdSchedules.setup({","HearthHouseholdRoles.setup({","HearthHomeTraditions.setup({","HearthKitchen"])assert.ok(g.includes(t),t);
});

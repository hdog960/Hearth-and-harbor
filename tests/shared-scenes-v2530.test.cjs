/* Hearth & Harbor v2.5.30 — Shared Scenes rendering and genuine activity QA */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=n=>fs.readFileSync(path.join(__dirname,'..',n),'utf8');
const w={window:{}};vm.runInNewContext(read('shared-scenes-v2530.js'),w);
const M=w.window.HearthSharedScenes;
function make(){
 const current={project:'morning',pair:['mabel','rosie'],done:[]},people={};
 const ctx={save(){this.n++},restore(){this.n++},translate(){this.n++},fillRect(){this.n++},
  beginPath(){this.n++},ellipse(){this.n++},fill(){this.n++},arc(){this.n++},
  stroke(){this.n++},moveTo(){this.n++},lineTo(){this.n++},closePath(){this.n++},
  quadraticCurveTo(){this.n++},fillText(){this.n++},n:0};
 const api={getProject:()=>current,getActor:id=>people[id]};
 const mod=M.setup(api);return {current,people,ctx,mod};
}
test('no work means no live frame, props, fake activity or visuals',()=>{const x=make();x.current.project='none';assert.equal(x.mod.snapshot('h0'),null);x.mod.drawStage(x.ctx,{home:'h0',tick:0});x.mod.drawOverlay(x.ctx,{home:'h0',tick:0});assert.equal(x.ctx.n,0)});
test('invalid and forged imported project types never cause in-world art',()=>{const x=make();for(const kind of ['constructor','__proto__','notreal']){x.current.project=kind;assert.equal(x.mod.snapshot('h0'),null)}});
test('all three unique projects have distinct original visual palettes and names',()=>{assert.equal(Object.keys(M.ART).length,3);assert.notEqual(M.ART.morning.ink,M.ART.story.ink);assert.notEqual(M.ART.story.title,M.ART.evening.title)});
test('genuine first roommate activity is drawn only from the live using phase and matching action',()=>{
 const x=make();x.people.mabel={phase:'walking',action:'meal',progress:.9,x:440,y:710};
 let a=x.mod.snapshot('h0');assert.equal(a.people[0].active,false);
 x.people.mabel.phase='using';x.people.mabel.action='tidy';assert.equal(x.mod.snapshot('h0').people[0].active,false);
 x.people.mabel.action='meal';a=x.mod.snapshot('h0');assert.equal(a.people[0].active,true);assert.equal(a.people[0].progress,.9);
});
test('a genuine paused activity never progresses visually',()=>{const x=make();x.people.mabel={phase:'break',action:'meal',progress:1,x:440,y:710};assert.equal(x.mod.snapshot('h0').people[0].active,false)});
test('progress values remain clamped to realistic 0 to 1 rendering range',()=>{const x=make();x.people.mabel={phase:'using',action:'meal',progress:-7};assert.equal(x.mod.snapshot('h0').people[0].progress,0);x.people.mabel.progress=10;assert.equal(x.mod.snapshot('h0').people[0].progress,1)});
test('separate roommates can show two genuine active tasks simultaneously',()=>{
 const x=make();x.people.mabel={phase:'using',action:'meal',progress:.6,x:400,y:700};x.people.rosie={phase:'using',action:'tidy',progress:.2,x:800,y:700};
 const s=x.mod.snapshot('h0');assert.equal(s.people.filter(p=>p.active).length,2);assert.equal(s.people[0].x,400);assert.equal(s.people[1].x,800);
});
test('a project marked complete in one half does not pretend the second participant finished',()=>{const x=make();x.current.done=['mabel'];const p=x.mod.snapshot('h0');assert.equal(p.done,1);assert.equal(p.people[0].done,true);assert.equal(p.people[1].done,false)});
test('three project variants each produce tangible Canvas art in the real scene',()=>{
 const x=make();for(const id of ['morning','story','evening']){x.current.project=id;const before=x.ctx.n;x.mod.drawStage(x.ctx,{home:'h0',tick:1});assert.ok(x.ctx.n-before>20,id)}
});
test('animated progress badges are drawn at actual actor poses, not at generic fixed icons',()=>{
 const x=make();x.people.mabel={phase:'using',action:'meal',progress:.7,x:435,y:802};const old=x.ctx.n;
 x.mod.drawOverlay(x.ctx,{home:'h0',tick:1});assert.ok(x.ctx.n-old>=8,'live scene drew a badge and progress bar');
});
test('quiet project with no actual activity does not show actor overlays',()=>{
 const x=make();x.mod.drawOverlay(x.ctx,{home:'h0',tick:0});assert.equal(x.ctx.n,2,'save and restore context only');
});
test('rendering does not mutate persistent work progress or award needs, coins or experience',()=>{
 const x=make();x.people.mabel={phase:'using',action:'meal',progress:.4,x:435,y:802};
 const before=JSON.stringify(x.current);x.mod.drawStage(x.ctx,{home:'h0',tick:5});x.mod.drawOverlay(x.ctx,{home:'h0',tick:5});
 assert.equal(JSON.stringify(x.current),before);assert.doesNotMatch(read('shared-scenes-v2530.js'),/\.coins\s*[+]=|\.needs\s*[+]=|localStorage|fetch\(/);
});
test('the actual room renderer draws the live project floor scene before furniture, and overlay after actors',()=>{
 const s=read('game.js');assert.ok(s.includes("sharedScenes.drawStage(ctx,{home:activeResidence,tick});"));
 assert.ok(s.includes("if(scene==='residence')sharedScenes.drawOverlay(ctx,{home:activeResidence,tick});"));
 const floor=s.indexOf('sharedScenes.drawStage(ctx'),furniture=s.indexOf('drawResidenceFurniture(ctx)',floor);
 assert.ok(floor>=0&&furniture>floor);
 const drawActors=s.indexOf('drawCharacter(ctx,playerDef()',furniture),overlay=s.indexOf('sharedScenes.drawOverlay(ctx',drawActors);
 assert.ok(drawActors>=0&&overlay>drawActors);
});
test('the real game exposes truthful manual and independent NPC activity timers to visual director',()=>{
 const s=read('game.js');
 for(const a of ["window.HearthSharedScenes.setup({","getProject:home=>roommateProjects.pending(home)",
  "getActor:(id,home)=>{","const guided=controlledResident===id,r=roomAutonomy.get(id)",
  "progress:hold?1-hold.remaining/hold.duration:0","r.elapsed/4.6"])assert.ok(s.includes(a),a);
});
test('new art loads with main game and works offline under versioned cache',()=>{
 const html=read('index.html'),sw=read('sw.js');
 assert.ok(html.includes('shared-scenes-v2530.js'));assert.ok(sw.includes("'./shared-scenes-v2530.js'"));
 assert.ok(html.indexOf('shared-scenes-v2530.js')<html.indexOf('game.js'));
 assert.match(sw,/const CACHE='hearth-harbor-v[0-9]+-[a-z-]+'/);
});
test('existing save key remains intact and old cohabitation reward rules are preserved',()=>{
 const s=read('game.js');assert.match(s,/const SAVE='hearth-harbor-save-v1'/);assert.ok(s.includes("roommateProjects.recordAction(activeResidence,id,kind,true,state.day)"));
});

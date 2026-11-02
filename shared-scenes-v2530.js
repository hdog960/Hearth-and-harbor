/* Hearth & Harbor v2.5.30 — Shared Scenes
 * A live in-world depiction of genuine two-resident project state.
 * Strictly visual: never generates completion, needs, money or timers.
 */
(function(root){'use strict';
const ACTION_ICONS={meal:'🥣',tidy:'🧺',read:'📖',hobby:'🎨',chat:'💗'};
const ART={
 morning:{title:'The Breakfast Table',ink:'#b77b59',paper:'#f7e6c5',blush:'#ebaf8d'},
 story:{title:'An Open Story',ink:'#628d81',paper:'#f3eacb',blush:'#b8cabc'},
 evening:{title:'A Warm Glow',ink:'#9e765a',paper:'#f6dfa9',blush:'#f1c280'}
};
const known=(n)=>typeof n==='number'&&Number.isFinite(n);
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
function snapshot(project,live){
 if(!project||!Object.prototype.hasOwnProperty.call(ART,project.project)||
  !Array.isArray(project.pair)||project.pair.length!==2||project.pair[0]===project.pair[1])return null;
 const actions={morning:['meal','tidy'],story:['read','hobby'],evening:['chat','meal']}[project.project];
 const completed=Array.isArray(project.done)?project.done:[];
 const participants=project.pair.map((id,i)=>{
  const state=live?.[id],active=state?.phase==='using'&&state.action===actions[i];
  return {id,action:actions[i],done:completed.includes(id),
   active,progress:active?clamp(known(state.progress)?state.progress:0,0,1):0,
   x:known(state?.x)?state.x:0,y:known(state?.y)?state.y:0};
 });
 return {project:project.project,people:participants,done:participants.filter(p=>p.done).length,art:ART[project.project]};
}
function setup(api){
 function details(home){
  const project=api.getProject?.(home);
  if(!project)return null;
  const live={};
  for(const person of project.pair||[]){
   const p=api.getActor?.(person,home);
   if(p)live[person]=p;
  }
  return snapshot(project,live);
 }
 function illustration(g,type,tick){
  // Three unique original living-room objects, built out of Canvas geometry,
  // shaded to read as tangible objects rather than standalone toolbar icons.
  if(type==='morning'){
   g.fillStyle='#bb815f';g.fillRect(-35,-12,70,23);
   g.fillStyle='#f8edcb';g.beginPath();g.ellipse(0,-16,34,10,0,0,6.283);g.fill();
   for(let i=-1;i<=1;i++){g.fillStyle=i===0?'#cf8d63':'#e6b47e';g.beginPath();g.ellipse(i*14,-19,12,6,0,0,6.283);g.fill()}
   g.fillStyle='#e9d6ac';g.fillRect(40,-39,27,31);g.fillStyle='#9c8068';g.fillRect(44,-34,18,23);
   g.strokeStyle='#e9d6ac';g.lineWidth=4;g.beginPath();g.arc(65,-23,9,-1.7,1.4);g.stroke();
   g.strokeStyle='#ffefcd';g.lineWidth=2;g.beginPath();g.moveTo(-6,-40);g.quadraticCurveTo(-13,-48,-8,-55);g.stroke();
  }else if(type==='story'){
   g.fillStyle='#ab7d69';g.fillRect(-45,-18,91,28);
   g.fillStyle='#e9d8a8';g.beginPath();g.moveTo(-37,-25);g.lineTo(-3,-36);g.lineTo(0,0);g.lineTo(-36,2);g.closePath();g.fill();
   g.fillStyle='#f6e7c0';g.beginPath();g.moveTo(0,0);g.lineTo(-3,-36);g.lineTo(37,-25);g.lineTo(36,2);g.closePath();g.fill();
   g.strokeStyle='#a08a73';g.lineWidth=2;g.beginPath();g.moveTo(0,-33);g.lineTo(0,1);for(let i=0;i<3;i++){g.moveTo(-30,-18+i*7);g.lineTo(-9,-24+i*7);g.moveTo(10,-25+i*7);g.lineTo(30,-19+i*7)}g.stroke();
   g.fillStyle='#a5c69a';g.beginPath();g.ellipse(46,-33,13,8,-.3,0,6.283);g.fill();
  }else{
   g.fillStyle='#b4896c';g.fillRect(-43,-3,87,9);g.fillStyle='#8a6c5b';g.fillRect(-28,-40,56,36);
   g.fillStyle='#ffdda0';g.fillRect(-21,-34,42,27);
   g.fillStyle='#fff1c9';g.beginPath();g.ellipse(0,-22,11+Math.sin(tick*2)*.8,11,0,0,6.283);g.fill();
   g.strokeStyle='#e6c08e';g.lineWidth=3;g.beginPath();g.arc(0,-40,16,Math.PI,Math.PI*2);g.stroke();
   for(let i=0;i<3;i++){g.fillStyle='#ead0b0';g.beginPath();g.arc(37+i*9,-21+i*2,3,0,6.283);g.fill()}
  }
 }
 function drawStage(g,{home,tick=0}={}){
  const s=details(home);if(!s)return;
  g.save();g.translate(572,916);
  // A grounded, modest shared work area on the residence floor.
  g.fillStyle='#31494333';g.beginPath();g.ellipse(0,13,126,37,0,0,6.283);g.fill();
  g.fillStyle='#98755f';g.beginPath();g.ellipse(0,3,121,34,0,0,6.283);g.fill();
  g.fillStyle='#e7cda7';g.beginPath();g.ellipse(0,-1,112,28,0,0,6.283);g.fill();
  g.fillStyle=s.art.paper;g.beginPath();g.ellipse(0,-5,101,22,0,0,6.283);g.fill();
  illustration(g,s.project,tick);
  // Original in-world wood and brass project plaque with two distinct
  // completion notches, not a reused icon asset.
  g.fillStyle='#795b4d';g.fillRect(-116,35,232,28);
  g.fillStyle='#d7ad7c';g.fillRect(-112,37,224,23);
  g.fillStyle='#fff1d1';g.fillRect(-106,40,212,16);
  g.fillStyle=s.art.ink;g.font='bold 12px system-ui';g.textAlign='center';g.fillText(s.art.title,0,52);
  s.people.forEach((person,i)=>{
   const x=i===0?-101:101;
   g.fillStyle=person.done?'#6b9d79':person.active?'#e6b87c':'#b4a28c';
   g.beginPath();g.arc(x,29,8,0,6.283);g.fill();
   g.fillStyle='#fff3d7';g.font='bold 10px system-ui';g.fillText(person.done?'✓':String(i+1),x,32);
  });
  g.restore();
 }
 function drawOverlay(g,{home,tick=0}={}){
  const s=details(home);if(!s)return;
  g.save();
  for(const [i,p] of s.people.entries()){
   // Floating progress label follows actual NPC coordinates. Never display
   // a fake active indicator unless the actual home activity is underway.
   if(!p.active&&!p.done)continue;
   const x=p.x|| (i===0?465:742),y=p.y||685;
   const bob=p.active?Math.sin(tick*3.4+i)*2:0;
   g.fillStyle='#304e4938';g.beginPath();g.ellipse(x,y-184+bob,38,19,0,0,6.283);g.fill();
   g.fillStyle=p.done?'#d9ecce':'#fff0d1';g.fillRect(x-37,y-204+bob,74,29);
   g.fillStyle=p.done?'#528162':'#9c7952';g.fillRect(x-34,y-201+bob,68,22);
   g.font='15px system-ui';g.textAlign='center';g.fillStyle='#fff3df';
   g.fillText(p.done?'✓':ACTION_ICONS[p.action],x,y-184+bob);
   if(p.active){
    g.fillStyle='#e0d8bb';g.fillRect(x-36,y-170+bob,72,4);
    g.fillStyle='#79bb93';g.fillRect(x-36,y-170+bob,72*p.progress,4);
   }
  }
  g.restore();
 }
 return {snapshot:home=>details(home),drawStage,drawOverlay};
}
root.HearthSharedScenes={setup,snapshot,ART};
})(window);

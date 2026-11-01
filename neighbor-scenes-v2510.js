/* Hearth & Harbor v2.5.10 — Little Moments Together
   Shared resident scenes at actual completed village upgrades.
   Coordinates, narrative, social state and gameplay remain deterministic. */
(function(root){'use strict';
const SCENES=[
 {id:'flower',upgrade:'flowers',name:'The Poetry Garden',icon:'🌸',pair:['mabel','jun'],
  day:1,evenCycle:true,start:11,end:15,center:[640,926],positions:[[594,952],[680,956]],walk:[642,1000],
  doing:['arranging flowers for a poem','reading a poem among the flowers'],
  introduction:'Mabel and Jun are trying to find a verse beautiful enough for the new garden. Mabel wants the flowers to tell the story; Jun believes a little poetry would help.',
  choices:[
   {label:'🌷 Arrange the flowers together',text:'You organize the blossoms by color while Jun names each shade like a line of poetry. Mabel says the flowers have never looked happier.',bond:5,tension:3,friend:2,fun:9,social:5},
   {label:'📖 Read a poem aloud',text:'Jun reads a little poem as Mabel scatters petals across the stone path. Both laugh when a flower lands on the last line.',bond:4,tension:6,friend:3,fun:5,social:9}]},
 {id:'lantern',upgrade:'lanterns',name:'The Lantern Workshop',icon:'🏮',pair:['bea','finn'],
  day:1,evenCycle:false,start:11,end:15,center:[612,755],positions:[[568,782],[660,782]],walk:[619,823],
  doing:['painting a string of lanterns','carefully hanging hand-painted lanterns'],
  introduction:'Bea has painted every lantern differently, and Finn knows how to make them sway gently without tangling. They ask you which little detail the square needs most.',
  choices:[
   {label:'🎨 Add tiny painted stars',text:'The three of you paint a sky full of little stars, one for each neighbor who helped build the plaza.',bond:5,tension:4,friend:3,fun:8,social:6},
   {label:'🏮 Raise the lanterns together',text:'Finn guides the rope while Bea counts each bright lantern. You pull the final knot, and the entire plaza seems to glow.',bond:4,tension:5,friend:2,fun:6,social:9}]},
 {id:'orchard',upgrade:'cart',name:'A Shared Orchard Table',icon:'🍎',pair:['rosie','oliver'],
  day:6,start:14,end:18,center:[443,824],positions:[[375,885],[474,893]],walk:[418,936],
  doing:['preparing orchard baskets with Oliver','sharing a fresh recipe with Rosie'],
  introduction:'Rosie has a crate of bright apples, and Oliver has an idea for a little communal tasting table. They are arguing playfully over which ingredient should go first.',
  choices:[
   {label:'🍎 Make an orchard tasting tray',text:'Rosie picks the best slices while Oliver arranges them like flower petals. Everyone at the table gets a little taste of home.',bond:5,tension:5,friend:3,fun:7,social:8},
   {label:'🥐 Help write a recipe card',text:'You write down their combined recipe. Rosie adds a cheerful doodle and Oliver signs his name in flour-dusted handwriting.',bond:4,tension:7,friend:2,fun:5,social:10}]},
 {id:'pond',upgrade:'deck',name:'Stories by the Water',icon:'🐟',pair:['finn','jun'],
  day:7,start:10,end:14,center:[1054,1270],positions:[[993,1373],[1090,1364]],walk:[1041,1435],
  doing:['showing Jun the quiet pond','making notes about the creatures Finn has seen'],
  introduction:'Finn points out the gentle ripples on the pond while Jun tries to write down a story about the fish. The afternoon feels as calm as a page in a favorite book.',
  choices:[
   {label:'🐟 Help sketch the fish',text:'Finn names the fish as Jun sketches them. You add little watercolors to the page and agree to leave it on the deck.',bond:5,tension:5,friend:3,fun:9,social:5},
   {label:'📚 Trade stories beside the water',text:'You tell a tale about an adventurous little fish. Finn supplies the ending, and Jun decides it should become a storybook.',bond:4,tension:6,friend:2,fun:7,social:8}]}
];
const NAMES={mabel:'Mabel',jun:'Jun',bea:'Bea',finn:'Finn',rosie:'Rosie',oliver:'Oliver'};
const VALID=new Set(Object.keys(NAMES));
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const cycle=d=>Math.floor((d-1)/7);
const seasonDay=d=>(d-1)%7+1;
const bondKey=pair=>pair.slice().sort().join('|');
function clean(raw){
 const src=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{};
 const out={completed:{},history:[]};
 if(src.completed&&typeof src.completed==='object'&&!Array.isArray(src.completed)){
  for(const [key,x] of Object.entries(src.completed).slice(-100)){
   const match=/^([0-9]{1,4}):(flower|lantern|orchard|pond)$/.exec(key);
   if(!match||!x||typeof x!=='object'||!Number.isInteger(x.choice)||x.choice<0||x.choice>1)continue;
   const c=Number(match[1]);if(c>1428)continue;
   if((match[2]==='flower'&&c%2!==0)||(match[2]==='lantern'&&c%2!==1))continue;
   out.completed[key]={choice:x.choice};
  }
 }
 if(Array.isArray(src.history)){
  for(const x of src.history.slice(-100)){
   if(!x||!Number.isInteger(x.cycle)||x.cycle<0||x.cycle>1428||typeof x.id!=='string'||!SCENES.some(s=>s.id===x.id)||!Number.isInteger(x.choice)||x.choice<0||x.choice>1)continue;
   if((x.id==='flower'&&x.cycle%2!==0)||(x.id==='lantern'&&x.cycle%2!==1))continue;
   const key=x.cycle+':'+x.id;
   if(!out.history.some(r=>r.cycle+':'+r.id===key))out.history.push({cycle:x.cycle,id:x.id,choice:x.choice});
  }
 }
 out.completed=Object.fromEntries(Object.entries(out.completed).slice(-60));
 out.history=out.history.slice(-36);
 return out;
}
function setup(api){
 const {getState,save,updateUI,notify,showModal,closeModal,getNPCs,getNormalRoutine}=api;
 const state=()=>getState();
 const record=()=>{const s=state();if(!s.neighborScenes||typeof s.neighborScenes!=='object'||Array.isArray(s.neighborScenes))s.neighborScenes=clean(null);return s.neighborScenes;};
 const upgraded=s=>(state().stewardship?.phases?.[s.upgrade]||0)===2;
 function sceneForDay(day=state().day){
  if(!Number.isInteger(day)||day<1||day>9999)return null;
  const d=seasonDay(day),c=cycle(day);
  return SCENES.find(s=>s.day===d&&(s.evenCycle===undefined||(c%2===0)===s.evenCycle))||null;
 }
 const current=()=>{const s=sceneForDay();return s&&upgraded(s)?s:null};
 const key=s=>cycle(state().day)+':'+s.id;
 const done=s=>Boolean(record().completed[key(s)]);
 const nowHour=()=>state().minute/60;
 function active(s=current()){
  return !!(s&&nowHour()>=s.start&&nowHour()<s.end);
 }
 function highPriority(id){
  const routine=getNormalRoutine(id);
  return !!(routine&&(api.protectedRoutine(routine)||String(routine.h||'').includes('village-')&&String(routine.h||'').includes('event')));
 }
 function canGather(s=current()){
  return !!(s&&active(s)&&s.pair.every(id=>!highPriority(id)));
 }
 function schedule(id,normal){
  const s=current();
  if(!s||!s.pair.includes(id)||!canGather(s)||api.protectedRoutine(normal))return normal;
  const side=s.pair.indexOf(id);
  return {...normal,villageRole:false,h:'neighbor-scene-'+s.id,where:s.positions[side],doing:s.doing[side],icon:s.icon,mood:'happy',neighborScene:s.id};
 }
 function participantsReady(s=current()){
  if(!canGather(s))return false;
  const npcs=getNPCs();
  return s.pair.every((id,i)=>{
   const n=npcs.find(n=>n.id===id);
   return !!(n&&!n.moving&&!n.routineRoute?.length&&Math.hypot(n.x-s.positions[i][0],n.y-s.positions[i][1])<85);
  });
 }
 function entryText(id){
  const s=current();
  if(!s||!s.pair.includes(id))return null;
  if(done(s))return '“I keep remembering that lovely '+s.name.toLowerCase()+' moment. It helped us understand each other a little better.”';
  if(!canGather(s))return null;
  return '“'+NAMES[s.pair.find(n=>n!==id)]+' and I have a little project planned at '+s.name+'. You should come join us!”';
 }
 function booklet(){
  const s=sceneForDay(),opened=s&&upgraded(s),ready=opened&&active(s),r=record();
  const day=state().day;
  const neighborsFree=Boolean(opened&&canGather(s));
  const plans=SCENES.map(e=>{
   const built=upgraded(e),finished=r.completed[cycle(day)+':'+e.id];
   const which=e.id==='flower'?'Season day 1 · alternating cycles':e.id==='lantern'?'Season day 1 · alternating cycles':e.id==='orchard'?'Season day 6':'Season day 7';
   return '<article class="nm-scene '+(s?.id===e.id?'up-next':'')+'"><span class="nm-icon">'+e.icon+'</span><div><b>'+e.name+'</b><small>'+NAMES[e.pair[0]]+' & '+NAMES[e.pair[1]]+'</small><small>'+which+'</small><small>'+(built?'✓ '+['Blossom Promenade','Lantern Plaza','Orchard Cart','Lily Pond Deck'][SCENES.indexOf(e)]+' built':'🌿 Build '+e.upgrade+' upgrade first')+'</small>'+(s?.id===e.id&&ready?'<p>Visiting hours '+e.start+':00–'+e.end+':00 · '+(participantsReady(e)?'Both neighbors are here!':'The neighbors are on their way.')+'</p>':'')+'</div>'+(s?.id===e.id&&ready&&neighborsFree&&!finished?'<button data-act="nm-visit" data-id="'+e.id+'">Go see</button>':s?.id===e.id&&finished?'<span class="nm-finished">✓ Saved</span>':'')+'</article>';
  }).join('');
  const history=[...r.history].reverse().slice(0,12).map(e=>{
   const obj=SCENES.find(s=>s.id===e.id);
   return '<div class="nm-memory"><span>'+obj.icon+'</span><div><b>'+obj.name+'</b><small>'+['Spring','Summer','Autumn','Winter'][e.cycle%4]+' · Cycle '+(e.cycle+1)+' · '+obj.choices[e.choice].label+'</small></div></div>';
  }).join('');
  showModal('neighbor-moments','<div class="nm-ui"><div class="nm-kicker">VILLAGE SOCIAL LIFE · SHARED STORIES</div><h2>💌 Little Moments Together</h2><p>As Maplewood grows, its residents discover new things to do together. Build a place, visit during its social hours and join two neighbors for a small, one-of-a-kind memory.</p><div class="nm-status">'+(s?(opened?s.icon+' Today: '+s.name+' · '+(ready?'Visit '+s.start+':00–'+s.end+':00'+(neighborsFree?'':' · Neighbors currently busy elsewhere'):nowHour()>=s.end?'The meetup has finished for today':'Opens at '+s.start+':00'):s.icon+' Today’s place needs a little building first'):'🌙 A peaceful day · Neighbor outings happen on days 1, 6 and 7')+'</div><div class="nm-roster">'+plans+'</div><h3>Your shared memories</h3><div class="nm-history">'+(history||'<p>A little story is waiting somewhere in the village.</p>')+'</div><button class="nm-back" data-act="nm-close">Back to Maplewood</button></div>');
 }
 function visit(id){
  const s=current();if(!s||s.id!==id||!canGather(s)||done(s))return booklet();
  closeModal();api.travelTo(s.walk[0],s.walk[1],()=>join(id));
 }
 function join(id){
  const s=current();
  if(!s||s.id!==id||!canGather(s)){notify('The neighbors will meet again another day.');return booklet();}
  if(done(s))return booklet();
  if(!participantsReady(s)){
   notify(NAMES[s.pair[0]]+' and '+NAMES[s.pair[1]]+' have not both arrived yet. You can visit them once they reach the meeting spot.');
   return booklet();
  }
  const keyPair=bondKey(s.pair),bond=state().townBonds?.[keyPair]||0,tension=state().townTensions?.[keyPair]||0;
  showModal('neighbor-join','<div class="nm-ui"><div class="nm-kicker">THE VILLAGE IS MORE BEAUTIFUL TOGETHER</div><h2>'+s.icon+' '+s.name+'</h2><div class="nm-friends">'+NAMES[s.pair[0]]+' <span>💗</span> '+NAMES[s.pair[1]]+'</div><p class="nm-quote">'+s.introduction+'</p><p>Friendship between these neighbors: '+bond+'/100'+(tension>0?' · A little tension: '+tension+'/100':'')+'. Your choice can bring them closer together.</p><div class="nm-choices">'+s.choices.map((c,i)=>'<button data-act="nm-choose" data-id="'+s.id+'|'+i+'">'+c.label+'</button>').join('')+'</div><button class="nm-back" data-act="nm-book">Community Stories</button></div>');
 }
 function choose(raw){
  const [id,choiceRaw]=String(raw).split('|'),choice=Number(choiceRaw),s=current();
  if(!s||id!==s.id||!Number.isInteger(choice)||choice<0||choice>1||!canGather(s)||done(s)||!participantsReady(s))return booklet();
  const r=record(),value=s.choices[choice],k=key(s),keyPair=bondKey(s.pair),st=state();
  r.completed[k]={choice};r.completed=Object.fromEntries(Object.entries(r.completed).slice(-60));
  r.history.push({cycle:cycle(st.day),id:s.id,choice});r.history=r.history.slice(-36);
  st.townBonds[keyPair]=clamp((st.townBonds[keyPair]||0)+value.bond,0,100);
  st.townTensions[keyPair]=clamp((st.townTensions[keyPair]||0)-value.tension,0,100);
  for(const id of s.pair)st.relations[id]=clamp((st.relations[id]||0)+value.friend,0,100);
  st.needs.fun=clamp(st.needs.fun+value.fun,0,100);
  st.needs.social=clamp(st.needs.social+value.social,0,100);
  st.hearts=clamp((st.hearts||0)+2,0,1000000);
  save();updateUI();
  showModal('neighbor-result','<div class="nm-ui"><div class="nm-kicker">A MEMORY WORTH KEEPING</div><h2>'+s.icon+' '+s.name+'</h2><p class="nm-quote">'+value.text+'</p><div class="nm-status">💞 '+NAMES[s.pair[0]]+' and '+NAMES[s.pair[1]]+' have grown closer. +'+value.bond+' village bond · +'+value.friend+' friendship with each · +2 Hearts · Fun and Social restored.</div><p>Visit the shared memories book anytime to remember this little day together.</p><button class="nm-main" data-act="nm-book">Open Shared Memories</button><button class="nm-back" data-act="nm-close">Back to Maplewood</button></div>');
  notify('A shared memory has been saved! 💌');
 }
 function handle(action,id){
  if(action==='nm-book')return booklet();
  if(action==='nm-close')return closeModal();
  if(action==='nm-visit')return visit(id);
  if(action==='nm-join')return join(id);
  if(action==='nm-choose')return choose(id);
 }
 function activity(g,n,entry,tick){
  const s=current();
  if(!s||entry?.neighborScene!==s.id||!participantsReady(s))return false;
  const x=n.x+31,y=n.y-60,wave=Math.sin(tick*2+n.x*.01)*3;
  const ellipse=(xx,yy,rx,ry,c)=>{g.fillStyle=c;g.beginPath();g.ellipse(xx,yy,rx,ry,0,0,Math.PI*2);g.fill()};
  g.save();g.lineWidth=2;
  if(s.id==='flower'){
   g.strokeStyle='#608b62';g.beginPath();g.moveTo(x-10,y+13);g.lineTo(x-10,y-17);g.stroke();
   for(let i=0;i<5;i++){const a=i*Math.PI*2/5;ellipse(x-10+Math.cos(a)*9,y-17+Math.sin(a)*9,7,6,'#e99cbb');}
   ellipse(x-10,y-17,5,5,'#fbe4a6');
   g.fillStyle='#fff1d6';g.fillRect(x+1,y-10,25,20);
   for(let i=0;i<3;i++){g.fillStyle='#b5aa8d';g.fillRect(x+5,y-6+i*6,16,2);}
  }else if(s.id==='lantern'){
   g.strokeStyle='#ae815d';g.beginPath();g.moveTo(x-17,y+13);g.lineTo(x+18,y-21);g.stroke();
   for(let i=0;i<3;i++){g.fillStyle=['#f1b97b','#db9cb5','#b5cde5'][i];g.fillRect(x+i*13-17,y+i*6-12+wave,13,17);}
  }else if(s.id==='orchard'){
   g.fillStyle='#b48865';g.fillRect(x-23,y-9,47,22);
   for(let i=0;i<4;i++)ellipse(x-15+i*10,y-13+wave*.2,7,6,i%2?'#e9bd78':'#e99773');
   g.strokeStyle='#80654a';g.beginPath();g.moveTo(x-20,y-13);g.lineTo(x-13,y-22);g.lineTo(x+13,y-22);g.lineTo(x+20,y-13);g.stroke();
  }else{
   g.strokeStyle='#846344';g.beginPath();g.moveTo(x-17,y+12);g.lineTo(x-5,y-28);g.lineTo(x+22,y-38);g.stroke();
   g.strokeStyle='#b3c6cc';g.beginPath();g.moveTo(x+22,y-38);g.lineTo(x+22,y+2+wave);g.stroke();
   ellipse(x+22,y+5+wave,4,4,'#ef9c8a');
   g.fillStyle='#fdf1cd';g.fillRect(x-26,y-1,20,15);
  }
  ellipse(x+30,y-35+wave,2.5,2.5,'#fff3ba');
  g.restore();return true;
 }
 function draw(g,{tick=0}={}){
  const s=current();if(!s||!active(s))return;
  const ready=participantsReady(s),complete=done(s);
  const x=s.center[0],y=s.center[1];
  if(!ready&&!complete)return;
  g.save();
  // Small communal scene furnishing rendered in the landscape, not as floating UI icons.
  g.fillStyle='rgba(65,86,64,.18)';g.beginPath();g.ellipse(x,y+31,65,17,0,0,Math.PI*2);g.fill();
  g.fillStyle='#a57757';g.fillRect(x-45,y+1,90,24);
  g.fillStyle='#deb483';g.fillRect(x-51,y-5,102,14);
  for(let i=0;i<5;i++){g.fillStyle=['#e9a9bd','#ead28a','#9dcab4'][i%3];g.fillRect(x-36+i*18,y-9+Math.sin(tick+i)*2,9,5);}
  if(complete){
   g.fillStyle='#f8e9c6';g.fillRect(x-25,y-55,50,32);
   g.strokeStyle='#95684d';g.lineWidth=4;g.strokeRect(x-25,y-55,50,32);
   g.fillStyle='#cf9f64';g.font='bold 19px system-ui';g.textAlign='center';g.fillText('♥',x,y-32);
  }
  g.restore();
 }
 return {booklet,schedule,sceneForDay,current,active,canGather,participantsReady,entryText,visit,join,choose,handle,activity,draw,record,done};
}
root.HearthNeighborScenes={setup,clean,SCENES,bondKey,seasonDay};
})(window);

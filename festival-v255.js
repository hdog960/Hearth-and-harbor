/* Hearth & Harbor v2.5.5 — Festival Days.
   Four original, distinct, touch-first village activities. No external assets. */
(function(root){'use strict';
const THEMES=[
 {name:'Petal Parade',subtitle:'The village gathers to weave crowns of spring flowers.',icon:'🌷',host:['mabel','bea'],words:['Mabel has brought armfuls of flowers.','Bea paints the brightest petals she can find.'],colors:['#ed8fbe','#f8cd6c','#9cabe7','#8bd4b2'],symbols:['🌸','🌼','🪻','🌿']},
 {name:'Lantern Tide',subtitle:'Make a little wish and send a lantern over the summer harbor.',icon:'🏮',host:['finn','jun'],words:['Finn is watching the lanterns skim the water.','Jun has a wish written on a tiny scrap of paper.'],colors:['#ffcd77','#eea0a1','#9accd0','#d5b2f0'],symbols:['✨','🏮','🌟','💫']},
 {name:'Harvest Home',subtitle:'Help Rosie sort the colorful autumn leaves for the market garlands.',icon:'🍁',host:['rosie','oliver'],words:['Rosie has arranged baskets for the harvest garlands.','Oliver brought sweet rolls for everyone working.'],colors:['#e98c5a','#d7b65a','#a36f92','#9bc580'],symbols:['🍁','🍂','🍃','🌿']},
 {name:'Winter Wishlights',subtitle:'Trace a little constellation to light up the winter sky.',icon:'❄️',host:['jun','oliver'],words:['Jun knows the oldest village winter stories.','Oliver has a thermos of cocoa for the stargazers.'],colors:['#a5c9ee','#f5e2a4','#b9b1e9','#e4c8d8'],symbols:['⭐','✨','❄️','🌟']}
];
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const seasonDay=day=>((day-1)%7)+1;
const cycle=day=>Math.floor((day-1)/7);
function active(day){return seasonDay(day)>=3&&seasonDay(day)<=5}
function clean(raw){
 const r=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{},played={};
 if(r.played&&typeof r.played==='object'&&!Array.isArray(r.played)){
  for(const [k,v] of Object.entries(r.played).slice(-80)){
   if(/^[0-9]{1,4}:[0-3]$/.test(k)&&Number.isInteger(v)&&v>=1&&v<=3)played[k]=v;
  }
 }
 const memories=Array.isArray(r.memories)?r.memories.filter(m=>m&&Number.isInteger(m.cycle)&&m.cycle>=0&&m.cycle<=1500&&Number.isInteger(m.season)&&m.season>=0&&m.season<4&&Number.isInteger(m.stars)&&m.stars>=1&&m.stars<=3).slice(-24).map(m=>({cycle:m.cycle,season:m.season,stars:m.stars})):[];
 return {played,memories};
}
function setup(api){
 const {getState,save,updateUI,showModal,notify}=api;
 let session=null,frame=0;
 const get=()=>{const s=getState();s.festivals=clean(s.festivals);return s.festivals};
 const now=()=>getState();
 const theme=()=>THEMES[now().season]||THEMES[0];
 const todayKey=()=>cycle(now().day)+':'+now().season;
 const hasPlayed=()=>!!get().played[todayKey()];
 const nearby=()=>active(now().day);
 const label=()=>nearby()?'FESTIVAL OPEN · DAYS 3–5':'NEXT FESTIVAL · DAY 3';
 function calendar(){
  stop();
  const s=now(),r=get(),t=theme(),d=seasonDay(s.day),open=active(s.day),done=hasPlayed();
  const upcoming=d<3?3-d:10-d;
  const past=r.memories.slice(-8).reverse().map(m=>'<div class="hf-memory">'+THEMES[m.season].icon+' '+THEMES[m.season].name+' · '+('★'.repeat(m.stars))+' · Season '+(m.cycle+1)+'</div>').join('');
  showModal('festival-calendar','<div class="hf-ui"><div class="hf-kicker">MAPLEWOOD · COMMUNITY CALENDAR</div><div class="hf-banner"><div class="hf-stamp">'+t.icon+'</div><div><h2>'+t.name+'</h2><p>'+t.subtitle+'</p></div></div><div class="hf-status">'+(open?'🎊 Happening now! Day '+d+' of 7':'🌱 Opens in '+upcoming+' in-game day'+(upcoming===1?'':'s'))+' · '+label()+'</div><p>Every season brings a different celebration. Festival days are the third, fourth and fifth day of each seven-day season, and return with the seasons. No real-world deadlines.</p><div class="hf-hosts"><span>💌 Hosted by '+t.host.map(id=>({mabel:'Mabel',bea:'Bea',finn:'Finn',jun:'Jun',rosie:'Rosie',oliver:'Oliver'})[id]).join(' & ')+'</span><span>'+ (done?'✓ Festival memory collected':'✨ One keepsake reward per season') +'</span></div><button class="hf-friends" data-act="comm-board">💌 Meet the festival hosts & help the village</button><button class="hf-primary" data-act="festival-visit">'+(open?'🌷 Visit the festival plaza':'🗺️ See the festival plaza')+'</button><div class="hf-calendar">'+THEMES.map((e,i)=>'<div class="hf-season '+(i===s.season?'selected':'')+'"><b>'+e.icon+' '+['Spring','Summer','Autumn','Winter'][i]+'</b><small>'+e.name+'</small></div>').join('')+'</div><h3>Your festival scrapbook</h3>'+(past||'<p>Your first festival memory is waiting to be made.</p>')+'</div>');
 }
 function stop(){if(frame)cancelAnimationFrame(frame);frame=0;if(session)session.closed=true;session=null;}
 function play(){
  if(!active(now().day)){calendar();notify('The village is preparing. The festival opens on day 3!');return;}
  stop();
  const s=now(),kind=s.season;
  session={kind,round:0,good:0,flowers:[],started:performance.now(),closed:false,selection:0};
  showModal('festival-game','<div class="hf-ui hf-play"><div class="hf-kicker">'+['SPRING · PETAL PARADE','SUMMER · LANTERN TIDE','AUTUMN · HARVEST HOME','WINTER · WISHLIGHTS'][kind]+'</div><h2>'+THEMES[kind].icon+' '+THEMES[kind].name+'</h2><p id="hfInstruction"></p><canvas id="hfCanvas" width="360" height="310" aria-label="Illustrated festival activity"></canvas><div id="hfControls" class="hf-controls"></div><p id="hfProgress" class="hf-progress" aria-live="polite"></p><button class="hf-back" data-act="festival-exit">Leave the activity</button></div>');
  const c=document.getElementById('hfCanvas');
  c.addEventListener('pointerdown',e=>{if(!session||session.closed)return;e.preventDefault();const b=c.getBoundingClientRect(),x=(e.clientX-b.left)*360/b.width,y=(e.clientY-b.top)*310/b.height;tap(x,y);});
  updatePlay();
  frame=requestAnimationFrame(loop);
 }
 function describe(){
  if(!session)return;
  const k=session.kind;
  const instructions=[
    'Design a five-flower crown. Tap blossoms below to arrange a colorful garland.',
    'Send three lanterns into the sky. Release when the glowing marker crosses the gold band.',
    'Sort six falling leaves into the matching baskets. Tap a basket or its matching color button.',
    'Trace the winter constellation. Tap each glowing numbered star in order, or use the accessible Connect button.'
  ];
  document.getElementById('hfInstruction').textContent=instructions[k];
 }
 function updatePlay(){
  if(!session)return;
  describe();
  const s=session,k=s.kind;
  const ctr=document.getElementById('hfControls'),progress=document.getElementById('hfProgress');
  if(k===0)ctr.innerHTML=THEMES[0].symbols.map((sym,i)=>'<button data-act="festival-petal" data-id="'+i+'" aria-label="Place '+['pink blossom','gold daisy','purple bloom','green sprig'][i]+'">'+sym+'</button>').join('');
  if(k===1)ctr.innerHTML='<button class="hf-primary" data-act="festival-release">🏮 Release lantern</button><button data-act="festival-assist">✨ Gentle launch</button>';
  if(k===2)ctr.innerHTML=['🍁 Coral','🍂 Gold','🍃 Plum'].map((v,i)=>'<button data-act="festival-sort" data-id="'+i+'">'+v+'</button>').join('');
  if(k===3)ctr.innerHTML='<button class="hf-primary" data-act="festival-next">✨ Connect next star</button>';
  progress.textContent=(k===0?'Flowers':k===1?'Lanterns':k===2?'Leaves':'Stars')+' · '+s.round+' / '+[5,3,6,6][k];
 }
 function step(ok,color){
  if(!session)return;
  session.good+=ok?1:0;session.flowers.push(color||0);session.round++;
  if(session.round>=[5,3,6,6][session.kind])return finish();
  updatePlay();
 }
 function tap(x,y){
  const s=session;if(!s)return;
  if(s.kind===0){if(y>=237){const n=clamp(Math.floor((x-20)/80),0,3);step(true,n)}}
  else if(s.kind===1)release(false);
  else if(s.kind===2){if(y>=210)sort(clamp(Math.floor(x/120),0,2));}
  else if(s.kind===3){const p=star(s.round);if(Math.hypot(x-p[0],y-p[1])<=45)step(true,s.round);else notify('Find the next numbered star ✨');}
 }
 const star=n=>[[63,208],[123,121],[207,155],[274,66],[289,209],[175,250]][n];
 function release(assist){
  if(!session||session.kind!==1)return;
  const elapsed=(performance.now()-session.started)/1000;
  const phase=(Math.sin(elapsed*(assist?.8:2.7))+1)/2;
  const hit=assist||(phase>.57&&phase<.85);
  step(hit,phase);
 }
 function sort(i){
  if(!session||session.kind!==2)return;
  const needed=[1,0,2,1,2,0][session.round];
  step(i===needed,i);
 }
 function finish(){
  const s=session;if(!s)return;
  const kind=s.kind,score=kind===0?new Set(s.flowers).size: s.good;
  const stars=kind===0?(score>=3?3:score>=2?2:1):score>=[3,3,5,6][kind]?3:score>=[2,2,3,4][kind]?2:1;
  stop();const st=now(),r=get(),key=todayKey(),first=!r.played[key];
  if(first){
   r.played[key]=stars;r.memories.push({cycle:cycle(st.day),season:kind,stars});r.memories=r.memories.slice(-24);
   st.coins=Math.min(1000000,st.coins+25+stars*5);
   st.hearts=Math.min(1000000,st.hearts+3);
   st.needs.fun=clamp(st.needs.fun+12+stars*3,0,100);
   st.needs.social=clamp(st.needs.social+14,0,100);
   for(const id of THEMES[kind].host)st.relations[id]=clamp((st.relations[id]||0)+3,0,100);
   save();updateUI();
  }
  showModal('festival-results','<div class="hf-ui"><div class="hf-kicker">A MEMORY WORTH KEEPING</div><h2>'+THEMES[kind].icon+' '+THEMES[kind].name+'</h2><div class="hf-score">'+('★'.repeat(stars))+'<span>'+('☆'.repeat(3-stars))+'</span></div><p>'+['A little effort made the square glow.','A lovely afternoon with your neighbors!','An unforgettable festival day!'][stars-1]+'</p><p>'+(first?'🪙 +'+(25+stars*5)+' coins · 💗 +3 friendship with each host · Fun and Social restored.':'A sweet encore! Your original reward and scrapbook memory are already saved for this season.')+'</p><button class="hf-primary" data-act="festival-calendar">📖 Open festival scrapbook</button><button class="hf-back" data-act="festival-exit">Back to the village</button></div>');
  notify(first?'A festival memory has been saved! ✨':'Thanks for celebrating again! ✨');
 }
 function loop(){
  if(!session||session.closed)return;
  draw();frame=requestAnimationFrame(loop);
 }
 function draw(){
  const s=session,el=document.getElementById('hfCanvas');if(!s||!el)return;
  const g=el.getContext('2d'),k=s.kind,t=THEMES[k],time=(performance.now()-s.started)/1000;
  g.clearRect(0,0,360,310);
  const grad=g.createLinearGradient(0,0,0,310);grad.addColorStop(0,['#ffe2ee','#9fd3e4','#f4d09c','#344d81'][k]);grad.addColorStop(1,['#fff5d4','#fde8b8','#fff2d3','#9ab6dc'][k]);g.fillStyle=grad;g.fillRect(0,0,360,310);
  const dot=(x,y,r,color)=>{g.fillStyle=color;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill()};
  const label=(v,x,y,size=18,color='#34524c')=>{g.fillStyle=color;g.font='800 '+size+'px system-ui';g.textAlign='center';g.fillText(v,x,y);};
  if(k===0){
   g.strokeStyle='#628c60';g.lineWidth=11;g.beginPath();g.ellipse(180,145,118,65,0,0,Math.PI*2);g.stroke();
   for(let i=0;i<5;i++){const a=-Math.PI*.9+i*.43,x=180+Math.cos(a)*120,y=145+Math.sin(a)*68;
     dot(x,y,20,'#f9efcf');if(i<s.round){const colors=t.colors[s.flowers[i]];for(let j=0;j<6;j++){const aa=j*Math.PI/3;dot(x+Math.cos(aa)*15,y+Math.sin(aa)*15,11,colors)}dot(x,y,9,'#fff9d5')}else label('+',x,y+7,22,'#8aa780')}
   t.colors.forEach((c,i)=>{dot(58+i*81,273,21,c);dot(58+i*81,273,8,'#ffefc6')});
   label('The flower crown',180,32,16);
  }else if(k===1){
   for(let i=0;i<21;i++){dot(15+i*17,45+(i%3)*21,1.5,'#fff4d2')}
   for(let i=0;i<s.round;i++){const x=85+i*98,y=70+i%2*26;g.fillStyle=t.colors[i];g.fillRect(x-13,y-22,26,31);dot(x,y-22,13,'#ffedb2');dot(x,y+7,7,'#e89c60')}
   g.fillStyle='#386e82';g.fillRect(0,257,360,53);
   const marker=(Math.sin(time*2.7)+1)/2,gx=26+marker*308;
   g.fillStyle='#f7dfa0';g.fillRect(26+308*.57,218,308*.28,21);
   g.fillStyle='#5c9eaa';g.fillRect(26,224,308,9);
   dot(gx,228,13,'#fff0ba');dot(gx,228,5,'#eaac73');
   label('Release in the glowing golden band',180,190,14);
  }else if(k===2){
   for(let i=0;i<12;i++)dot(20+i*31,38+Math.sin(i+time)*8,3,'#fff3d2');
   const sequence=[1,0,2,1,2,0],need=sequence[s.round];
   label('Match the leaf to its color basket',180,36,15);
   const x=180+Math.sin(time*1.6)*25,y=91+Math.sin(time*1.9)*8;
   g.save();g.translate(x,y);g.rotate(Math.sin(time)*.23);dot(0,0,26,[t.colors[0],t.colors[1],t.colors[2]][need]);g.fillStyle='#fff0c2';g.fillRect(-2,10,4,37);g.restore();
   for(let i=0;i<3;i++){const xx=60+i*120;g.fillStyle='#916c4d';g.fillRect(xx-44,210,88,80);g.fillStyle=t.colors[i];g.fillRect(xx-38,214,76,18);label(['CORAL','GOLD','PLUM'][i],xx,262,14,'#fff8e6')}
  }else{
   for(let i=0;i<28;i++)dot(12+(i*83)%337,14+(i*67)%285,1+i%3,'#f8f1d1');
   const pts=Array.from({length:6},(_,i)=>star(i));
   g.strokeStyle='#f7e6ae';g.lineWidth=3;g.beginPath();pts.forEach(([x,y],i)=>{if(i===0)g.moveTo(x,y);else if(i<s.round)g.lineTo(x,y)});g.stroke();
   pts.forEach(([x,y],i)=>{dot(x,y,i===s.round?24:17,i<s.round?'#ffe09a':'#e7ebff');label(String(i+1),x,y+5,15,'#465985');});
   label('A wish written in the stars',180,32,16,'#fff5d7');
  }
 }
 function handle(action,id){
  if(action==='festival-calendar')return calendar();
  if(action==='festival-exit'){stop();api.closeModal();return;}
  if(!session)return;
  if(action==='festival-petal'&&session.kind===0){const n=Number(id);if(Number.isInteger(n)&&n>=0&&n<4)step(true,n)}
  else if(action==='festival-release')release(false);
  else if(action==='festival-assist')release(true);
  else if(action==='festival-sort'&&session.kind===2){const n=Number(id);if(Number.isInteger(n)&&n>=0&&n<3)sort(n)}
  else if(action==='festival-next'&&session.kind===3)step(true,session.round);
 }
 function drawTown(g,{season=0,day=1,tick=0}={}){
  if(!active(day))return;
  const theme=THEMES[season];g.save();g.translate(605,612);
  // Festive cobbles, seasonal pennants, and warm lights around the open plaza.
  g.strokeStyle='#fff3d1';g.lineWidth=5;g.beginPath();g.arc(0,22,124,Math.PI,0);g.stroke();
  for(let i=0;i<14;i++){const a=Math.PI+i*Math.PI/13,x=Math.cos(a)*123,y=22+Math.sin(a)*123;
   g.fillStyle=theme.colors[i%4];g.beginPath();g.moveTo(x-9,y);g.lineTo(x+9,y);g.lineTo(x,y+19);g.fill();
   g.fillStyle='#fff2c7';g.fillRect(x-2,y-5,4,4);
  }
  for(let i=0;i<9;i++){const x=-115+i*29,y=98+Math.sin(i*2+tick)*3;g.fillStyle=theme.colors[i%4];g.fillRect(x,y,10,5);}
  g.restore();
 }
 function drawStand(g,x,y,season=0,day=1){
  const theme=THEMES[season];g.save();g.translate(x,y);
  g.fillStyle='#725b4e';g.fillRect(-41,-98,10,99);g.fillRect(31,-98,10,99);
  g.fillStyle='#fff1d5';g.fillRect(-58,-126,116,48);
  g.strokeStyle='#a7816a';g.lineWidth=4;g.strokeRect(-58,-126,116,48);
  g.fillStyle=theme.colors[0];g.fillRect(-52,-119,104,7);g.fillRect(-51,-88,102,5);
  g.textAlign='center';g.font='30px system-ui';g.fillText(theme.icon,0,-88);
  g.fillStyle=active(day)?'#e5a959':'#86a5a1';g.fillRect(-25,-57,50,12);
  g.font='bold 11px system-ui';g.fillStyle='#365e53';g.fillText('FESTIVAL',0,-48);
  g.restore();
 }
 function gatherPoint(id,day,minute){
  if(!active(day)||minute<10*60||minute>=19*60)return null;
  const index=['mabel','rosie','oliver','jun','bea','finn'].indexOf(id);
  return index<0?null:[[480,615],[493,732],[668,548],[790,694],[735,796],[834,594]][index];
 }
 function neighborLine(id){
  const t=theme();return t.host.includes(id)?t.words[t.host.indexOf(id)]:[
   'It makes the whole village feel like one big family.',
   'Even the little streets look different on festival days.',
   'I love seeing familiar faces all gathered together.'
  ][['mabel','rosie','oliver','jun','bea','finn'].indexOf(id)%3];
 }
 return {calendar,play,handle,stop,drawTown,drawStand,gatherPoint,neighborLine,active,theme,nearby};
}
root.HearthFestival={setup,clean,active,seasonDay,THEMES};
})(window);

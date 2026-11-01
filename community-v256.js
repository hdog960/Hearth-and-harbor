/* Hearth & Harbor v2.5.6 — Together in Maplewood.
   Resident-led, save-safe festival collaborations with three distinct interactive modes. */
(function(root){'use strict';
const PEOPLE={mabel:'Mabel',bea:'Bea',finn:'Finn',jun:'Jun',rosie:'Rosie',oliver:'Oliver'};
const MOMENTS=[
 {season:0,id:'mabel',mode:'pattern',title:'Weave a Petal Garland',intro:'“We need a garland worthy of the very first spring bloom!” Mabel offers you her basket of petals.',after:'Mabel hangs your garland on the village arch, just where everyone can admire it.',symbol:'🌸',accent:'#df8fb6'},
 {season:0,id:'bea',mode:'catch',title:'Catch the Dancing Petals',intro:'“The breeze is making my watercolor come alive!” Bea invites you to catch the drifting petals for a new mural.',after:'Bea paints your collected colors into a tiny mural beside the plaza.',symbol:'🦋',accent:'#92b8d9'},
 {season:1,id:'finn',mode:'timing',title:'Ring the Harbor Bells',intro:'“Let’s make some music for the boats!” Finn needs help timing the lantern launch bells.',after:'Finn rings out a bright chime across the glittering harbor.',symbol:'🔔',accent:'#e5c174'},
 {season:1,id:'jun',mode:'pattern',title:'Write a Wish Ribbon',intro:'“The words need a little pattern.” Jun unfolds a beautiful collection of colored wish ribbons.',after:'Jun hangs your written wish where the evening breeze can find it.',symbol:'🎐',accent:'#9ac3c6'},
 {season:2,id:'rosie',mode:'catch',title:'Gather the Orchard Bounty',intro:'“Careful, they’re rolling away!” Rosie needs help gathering little apples for the shared harvest table.',after:'Rosie sets an overflowing basket of fruit by the festival table.',symbol:'🍎',accent:'#d88d6d'},
 {season:2,id:'oliver',mode:'timing',title:'Keep the Oven Chorus',intro:'“A perfect bake is all about rhythm!” Oliver asks you to chime as the pastry batches come out.',after:'Oliver shares a tray of warm pastries with everyone gathered.',symbol:'🥐',accent:'#d7ad69'},
 {season:3,id:'jun',mode:'pattern',title:'Stitch the Star Quilt',intro:'“Every star is someone’s story.” Jun lays out little colored squares for the village quilt.',after:'Jun wraps the finished winter quilt around the plaza bench.',symbol:'⭐',accent:'#a6b4df'},
 {season:3,id:'oliver',mode:'timing',title:'Stir the Cocoa Kettle',intro:'“Just the right moment for one more stir.” Oliver sets up a communal cocoa pot.',after:'Oliver serves warm mugs to all the festival visitors.',symbol:'☕',accent:'#d9b1a1'}
];
const palette=['#e890a8','#eac66f','#83b8ad'];
const glyph=['🌸','⭐','🌿'];
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const cycle=day=>Math.floor((day-1)/7);
function clean(input){
 const source=input&&typeof input==='object'&&!Array.isArray(input)?input:{},moments={},portraits=[];
 if(source.moments&&typeof source.moments==='object'&&!Array.isArray(source.moments)){
  for(const [key,val] of Object.entries(source.moments).slice(-100)){
   const match=/^([0-9]{1,4}):(mabel|bea|finn|jun|rosie|oliver)$/.exec(key);
   if(!match||!val||typeof val!=='object'||!Number.isInteger(val.stars)||val.stars<1||val.stars>3||Number(match[1])>1428)continue;
   if(!MOMENTS.some(x=>x.season===Number(match[1])%4&&x.id===match[2]))continue;
   moments[key]={stars:val.stars};
  }
 }
 if(Array.isArray(source.portraits))for(const n of source.portraits.slice(-100)){
  if(Number.isInteger(n)&&n>=0&&n<=1428&&!portraits.includes(n))portraits.push(n);
 }
 return {moments:Object.fromEntries(Object.entries(moments).slice(-60)),portraits:portraits.slice(-60)};
}
function setup(api){
 const {getState,save,showModal,closeModal,notify,updateUI}=api;
 let session=null,raf=0;
 const state=()=>getState();
 const record=()=>{const s=state();if(!s.community||typeof s.community!=='object'||Array.isArray(s.community))s.community=clean(s.community);return s.community};
 const hosts=()=>MOMENTS.filter(m=>m.season===state().season);
 const key=id=>cycle(state().day)+':'+id;
 const festivalOpen=()=>{const d=((state().day-1)%7)+1;return d>=3&&d<=5};
 const completed=id=>!!record().moments[key(id)];
 const hasPortrait=()=>record().portraits.includes(cycle(state().day));
 const moment=id=>hosts().find(x=>x.id===id);
 const readable=()=>hosts().map(m=>({name:PEOPLE[m.id],task:m.title,done:completed(m.id),stars:record().moments[key(m.id)]?.stars||0,id:m.id}));
 function stop(){if(raf)cancelAnimationFrame(raf);raf=0;if(session)session.closed=true;session=null;}
 function board(){
  stop();const h=hosts(),s=state(),open=festivalOpen();
  const r=record(),done=h.filter(m=>!!r.moments[key(m.id)]).length;
  const archive=Object.entries(r.moments).map(([k,v])=>{const [n,id]=k.split(':'),c=Number(n),m=MOMENTS.find(x=>x.id===id&&x.season===c%4);return m?{cycle:c,title:m.title,name:PEOPLE[id],stars:v.stars,icon:m.symbol}:null}).filter(Boolean).sort((a,b)=>b.cycle-a.cycle).slice(0,12);
  const archiveHtml=archive.map(a=>'<div class="hcm-archive-item"><span>'+a.icon+'</span><div><b>'+a.name+' · '+a.title+'</b><small>'+['Spring','Summer','Autumn','Winter'][a.cycle%4]+' · Cycle '+(a.cycle+1)+(r.portraits.includes(a.cycle)?' · 🖼️ Portrait':'')+'</small></div><strong>'+('★'.repeat(a.stars))+'</strong></div>').join('');
  showModal('community-board','<div class="hcm-ui"><div class="hcm-eyebrow">FESTIVAL FRIENDS · COMMUNITY STORIES</div><h2>💌 Together in Maplewood</h2><p>Festivals are special because of the neighbors who make them happen. Walk over to a host and help with a personal little project.</p><div class="hcm-stage">'+(open?'🎊 Neighbors are gathering at the Festival Plaza!':'🌱 Festival neighbors gather during days 3–5 of each season.')+'<br>Community memories this season: <b>'+done+' / '+h.length+'</b></div><div class="hcm-roster">'+h.map(m=>'<article class="hcm-neighbor"><span class="hcm-avatar">'+m.symbol+'</span><div><b>'+PEOPLE[m.id]+'</b><small>'+m.title+(completed(m.id)?' · ★'.repeat(record().moments[key(m.id)].stars)+' · Complete':' · A new story')+'</small></div><button data-act="comm-find" data-id="'+m.id+'" '+(!open?'disabled':'')+'>'+(!open?'Opens day 3':completed(m.id)?'Visit again':'Go meet')+'</button></article>').join('')+'</div><p class="hcm-hint">Talk to a resident in the world to start their project. You can revisit a finished activity without earning duplicate rewards.</p><div class="hcm-portrait">'+(hasPortrait()?'🖼️ Your community portrait is hanging in the scrapbook. Everyone came together!':done>=2?'🖼️ Your portrait is ready!':'🖼️ Help both festival hosts to add a community portrait to your scrapbook.')+'</div><h3>Your shared memories</h3><div class="hcm-archive">'+(archiveHtml||'<p>Your first memory is still waiting for you.</p>')+'</div><button class="hcm-light" data-act="festival-calendar">Back to Festival Calendar</button></div>');
 }
 function open(id){
  stop();const m=moment(id);
  if(!festivalOpen()||!m){notify('Visit during the festival and talk to one of this season’s hosts.');return board();}
  const played=completed(id);
  showModal('community-intro','<div class="hcm-ui"><div class="hcm-eyebrow">'+PEOPLE[id]+' · FESTIVAL MOMENT</div><h2>'+m.symbol+' '+m.title+'</h2><p class="hcm-quote">'+m.intro+'</p><p>Play a short, relaxed activity together. Success changes the village and creates a memory with '+PEOPLE[id]+'.</p>'+(played?'<p>✓ You already saved this memory this season. This visit is just for fun.</p>':'<p>✨ Your first completion this season earns a small friendship reward.</p>')+'<button class="hcm-main" data-act="comm-play" data-id="'+id+'">Let’s do this together!</button><button class="hcm-light" data-act="comm-board">See the community board</button></div>');
 }
 function target(s){return (s.round+s.spec.season+Object.keys(PEOPLE).indexOf(s.spec.id)+cycle(s.day))%3}
 function point(s,time){return {x:180+Math.sin(time*1.45+s.round*2.2)*72,y:142+Math.cos(time*1.19+s.round*.8)*42}}
 function play(id){
  const m=moment(id);if(!m||!festivalOpen()){board();return;}
  stop();session={spec:m,day:state().day,round:0,hits:0,started:performance.now(),closed:false};
  showModal('community-game','<div class="hcm-ui hcm-game"><div class="hcm-eyebrow">'+PEOPLE[id]+' · '+m.title.toUpperCase()+'</div><h2>'+m.symbol+' Let’s make something together</h2><p id="hcmDirections"></p><canvas id="hcmCanvas" width="360" height="286" aria-label="Festival resident mini game"></canvas><div class="hcm-buttons" id="hcmButtons"></div><div id="hcmCounter" class="hcm-count" aria-live="polite"></div><button class="hcm-light" data-act="comm-exit">Stop this activity</button></div>');
  const c=document.getElementById('hcmCanvas');
  c.addEventListener('pointerdown',e=>{if(!session)return;e.preventDefault();const b=c.getBoundingClientRect(),x=(e.clientX-b.left)*360/b.width,y=(e.clientY-b.top)*286/b.height;tap(x,y)});
  refresh();
  raf=requestAnimationFrame(loop);
 }
 function refresh(){
  const s=session;if(!s)return;
  const d=document.getElementById('hcmDirections'),b=document.getElementById('hcmButtons'),count=document.getElementById('hcmCounter');
  if(s.spec.mode==='pattern'){
   d.textContent='Match the highlighted pattern tile. Choose the matching color below; there are four turns.';
   b.innerHTML=glyph.map((label,i)=>'<button data-act="comm-pattern" data-id="'+i+'" aria-label="Choose '+['pink blossom','gold star','green leaf'][i]+'">'+label+'</button>').join('');
  }else if(s.spec.mode==='timing'){
   d.textContent='Tap the chime when it passes the bright golden zone. Use Gentle Rhythm for a relaxed alternative.';
   b.innerHTML='<button class="hcm-main" data-act="comm-chime">🔔 Chime!</button><button data-act="comm-assist">🌿 Gentle rhythm</button>';
  }else{
   d.textContent='Tap the floating treasure in the picture, or use Gather Together if touching moving targets is difficult.';
   b.innerHTML='<button class="hcm-main" data-act="comm-gather">🤝 Gather together</button>';
  }
  count.textContent='Little moments · '+s.round+' / 4';
 }
 function attempt(ok){
  if(!session)return;
  session.hits+=Number(ok);session.round++;
  if(session.round===4)return finish();
  refresh();
 }
 function tap(x,y){
  const s=session;if(!s)return;
  if(s.spec.mode==='pattern'){if(y>=226)attempt(clamp(Math.floor(x/120),0,2)===target(s));}
  else if(s.spec.mode==='timing')chime(false);
  else {const t=point(s,(performance.now()-s.started)/1000);attempt(Math.hypot(x-t.x,y-t.y)<45);}
 }
 function chime(gentle){
  const s=session;if(!s||s.spec.mode!=='timing')return;
  const timing=(Math.sin((performance.now()-s.started)/1000*2.4+s.round*.8)+1)/2;
  attempt(gentle||(timing>=.47&&timing<=.79));
 }
 function finish(){
  const s=session;if(!s)return;
  const m=s.spec,stars=s.hits>=4?3:s.hits>=2?2:1;
  stop();const st=state(),r=record(),k=key(m.id),first=!r.moments[k],hadPortrait=r.portraits.includes(cycle(st.day));
  let portraitNow=false;
  if(first){
   r.moments[k]={stars};
   st.needs.fun=clamp(st.needs.fun+9,0,100);
   st.needs.social=clamp(st.needs.social+11,0,100);
   st.relations[m.id]=clamp((st.relations[m.id]||0)+4,0,100);
   st.hearts=clamp((st.hearts||0)+3,0,1000000);
   // A single small prize only when BOTH distinct residents have been helped.
   if(!hadPortrait&&hosts().every(h=>!!r.moments[key(h.id)])){
     r.portraits.push(cycle(st.day));r.portraits=r.portraits.slice(-60);
     st.coins=clamp(st.coins+12,0,1000000);
     portraitNow=true;
   }
   save();updateUI();
  }
  showModal('community-results','<div class="hcm-ui"><div class="hcm-eyebrow">A SHARED VILLAGE MEMORY</div><h2>'+m.symbol+' '+m.title+'</h2><div class="hcm-stars">'+('★'.repeat(stars))+('☆'.repeat(3-stars))+'</div><p class="hcm-quote">'+m.after+'</p><p>'+(first?'💗 +4 friendship · +3 hearts · Fun and Social restored':'You have already shared this special moment this season. Enjoy the memory!')+'</p>'+(portraitNow?'<div class="hcm-portrait">🖼️ Together at last! You and the hosts earned the Community Portrait, plus 12 coins.</div>':'')+'<button class="hcm-main" data-act="comm-board">Open the Community Scrapbook</button><button class="hcm-light" data-act="comm-exit">Back to the festival</button></div>');
  notify(portraitNow?'A community portrait was added to your scrapbook! 🖼️':'What a lovely time together! 🌷');
 }
 function handle(action,id){
  if(action==='comm-board')return board();
  if(action==='comm-open')return open(id);
  if(action==='comm-play')return play(id);
  if(action==='comm-exit'){stop();closeModal();return;}
  if(!session)return;
  if(action==='comm-pattern'&&session.spec.mode==='pattern'){const index=Number(id);if(Number.isInteger(index)&&index>=0&&index<=2)attempt(index===target(session))}
  else if(action==='comm-chime')chime(false);
  else if(action==='comm-assist')chime(true);
  else if(action==='comm-gather'&&session.spec.mode==='catch')attempt(true);
 }
 function loop(){
  if(!session||session.closed)return;
  draw();raf=requestAnimationFrame(loop);
 }
 function draw(){
  const s=session,c=document.getElementById('hcmCanvas');if(!s||!c)return;
  const g=c.getContext('2d'),m=s.spec,t=(performance.now()-s.started)/1000;
  g.clearRect(0,0,360,286);
  const grad=g.createLinearGradient(0,0,360,286);grad.addColorStop(0,'#fff6de');grad.addColorStop(1,m.accent);g.fillStyle=grad;g.fillRect(0,0,360,286);
  const circle=(x,y,r,color)=>{g.fillStyle=color;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill()};
  const title=(str,x,y,size=17,color='#385e55')=>{g.font='800 '+size+'px system-ui';g.fillStyle=color;g.textAlign='center';g.fillText(str,x,y);};
  for(let i=0;i<22;i++)circle(18+i*17,28+(i%4)*25,1.5,'#fff5cf');
  if(m.mode==='pattern'){
   title('Repeat the village pattern',180,36,18);
   for(let i=0;i<4;i++){
    const x=62+i*79,y=105;
    circle(x,y,28,i===s.round?'#fff9e7':'#e1d6bd');
    title(i<s.round?'✓':i===s.round?glyph[target(s)]:'✦',x,y+8,26);
   }
   title('Choose a matching ornament',180,183,14);
   for(let i=0;i<3;i++){circle(60+i*120,251,30,palette[i]);title(glyph[i],60+i*120,261,27);}
  }else if(m.mode==='timing'){
   title('Keep the rhythm',180,40,19);
   g.fillStyle='#638e85';g.fillRect(29,128,302,20);
   g.fillStyle='#f6da93';g.fillRect(29+302*.47,120,302*.32,37);
   const phase=(Math.sin(t*2.4+s.round*.8)+1)/2,x=29+phase*302;
   circle(x,138,17,'#fffdf0');circle(x,138,8,'#e7a26b');
   for(let i=0;i<4;i++)circle(120+i*40,218,10,i<s.round?'#efc178':'#e8e1d1');
   title('Tap when the chime is golden',180,93,14);
  }else{
   title('Gather the drifting treasures',180,39,17);
   const p=point(s,t);
   circle(p.x,p.y,36,'#fff1cb');
   circle(p.x,p.y,24,m.accent);
   title(m.symbol,p.x,p.y+11,31);
   title('Touch the moving treasure',180,253,14);
  }
 }
 function drawTown(g,{day,season,tick=0}){
  if(!festivalOpen()||season!==state().season)return;
  const h=hosts(),r=state().community||{moments:{},portraits:[]};
  for(let i=0;i<h.length;i++){
   if(!r.moments[cycle(day)+':'+h[i].id])continue;
   const x=492+i*230,y=578-i*17;
   g.save();g.translate(x,y);g.globalAlpha=.92;
   g.strokeStyle=h[i].accent;g.lineWidth=7;g.beginPath();g.moveTo(-24,-40);g.quadraticCurveTo(0,-29+Math.sin(tick+i)*4,24,-40);g.stroke();
   for(let j=0;j<4;j++){g.fillStyle=palette[(j+i)%3];g.beginPath();g.arc(-20+j*13,-38+Math.sin(j+tick)*3,5,0,Math.PI*2);g.fill();}
   g.restore();
  }
  if(r.portraits.includes(cycle(day))){
   g.save();g.translate(618,512);
   g.fillStyle='#98745b';g.fillRect(-31,-26,62,59);
   g.fillStyle='#f9e8b6';g.fillRect(-25,-20,50,46);
   g.fillStyle='#a8bfa1';g.fillRect(-20,-15,40,34);
   g.fillStyle='#f6d3a2';for(let i=0;i<3;i++){g.beginPath();g.arc(-12+i*12,1,7,0,Math.PI*2);g.fill()}
   g.restore();
  }
 }
 return {board,open,play,handle,stop,drawTown,hosts,readable,festivalOpen,cleanRecord:record};
}
root.HearthCommunity={clean,setup,MOMENTS};
})(window);

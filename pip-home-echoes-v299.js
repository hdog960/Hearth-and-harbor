/* Hearth & Harbor v2.9.9 — Pip's Stories Brought Home.
 * Family stories exist only after an earlier genuine child-peer outing AND
 * a separate real completed, timed shared cottage activity with Poppy.
 * No forced guardianship, passive reward, currency, timers or new save key.
 */
(function(root){'use strict';
const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const dayOK=x=>Number.isInteger(x)&&x>0&&x<=9999;
const finite=Number.isFinite;
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const STORIES={
 story:{name:'The Tale That Came Home',icon:'📘',tasks:['read'],
  intro:'Pip remembers a story made with Wren, and how that adventure changed after everyone found a way home.',
  question:'As you read side by side, what belongs on the next page?',
  choices:['Make room for Wren in the next adventure','Give the friends a safe place to return'],
  after:['Pip draws an extra little boat so the next adventure can include Wren.',
   'Pip draws a warm cottage lantern that guides friends home.'],
  ink:['#91b5c9','#ebc189']},
 color:{name:'Colors Across Two Homes',icon:'🎨',tasks:['hobby'],
  intro:'Pip remembers painting the Maplewood sky with Wren. At home, those colors tell a new story.',
  question:'While finishing today’s real shared artwork, what would you like to remember?',
  choices:['Every friend can choose a different color','A little color can help someone feel welcome'],
  after:['Pip paints two different bright skies on the same little canvas.',
   'Pip paints a soft welcoming ribbon for friends who feel shy.'],
  ink:['#91bdb0','#d4a4b9']},
 nature:{name:'A Little Promise Travels Home',icon:'🍀',tasks:['tidy','meal'],
  intro:'Pip remembers gentle discoveries in the meadow with Wren. Even an ordinary cottage task can carry that care home.',
  question:'What should your little household promise be?',
  choices:['Notice the little things before changing them','Make spaces welcoming for other people'],
  after:['Pip draws the little leaf exactly as it rested on the path.',
   'Pip adds a winding pathway so everyone can enjoy the garden.'],
  ink:['#a5c68b','#e5b981']}
};
const KINDS=Object.keys(STORIES);
function validPeer(r){
 return obj(r)&&dayOK(r.day)&&KINDS.includes(r.kind)&&[0,1].includes(r.first)&&[0,1].includes(r.last);
}
function clean(raw,guardianDay=0){
 const seenDays=new Set(),seenKinds=new Set(),records=[];
 const min=dayOK(guardianDay)?guardianDay:10000;
 if(Array.isArray(raw?.records))for(const r of raw.records.slice(-24)){
  if(!obj(r)||!dayOK(r.day)||r.day<min||!KINDS.includes(r.kind)||
    ![0,1].includes(r.choice)||!STORIES[r.kind].tasks.includes(r.homeKind)||
    !validPeer(r.peer)||r.peer.kind!==r.kind||r.peer.day>=r.day||
    seenDays.has(r.day)||seenKinds.has(r.kind))continue;
  seenDays.add(r.day);seenKinds.add(r.kind);
  records.push({day:r.day,kind:r.kind,choice:r.choice,homeKind:r.homeKind,
   peer:{day:r.peer.day,kind:r.peer.kind,first:r.peer.first,last:r.peer.last}});
 }
 return {records:records.sort((a,b)=>a.day-b.day).slice(0,3)};
}
function setup(api){
 const state=()=>api.getState(),child=()=>api.getChild(),scene=()=>api.getScene?.();
 const day=()=>dayOK(state()?.day)?state().day:1;
 const guarded=()=>child()?.guardian==='player'&&dayOK(child()?.guardianDay)&&child().guardianDay<=day();
 const records=()=>clean(child()?.homeEchoes,child()?.guardianDay).records.filter(r=>r.day<=day());
 const currentHelp=()=>Array.isArray(child()?.homeHelps)?
  child().homeHelps.find(r=>obj(r)&&r.day===day()&&
   ['read','hobby','tidy','meal'].includes(r.kind)):null;
 const peer=()=>{
  const rows=api.getPeerRecords?.();
  return Array.isArray(rows)?rows.filter(r=>validPeer(r)&&r.day<day()):[];
 };
 let prompt=null;
 function candidate(){
  const home=currentHelp();if(!home||!guarded()||records().some(r=>r.day===day()))return null;
  const done=new Set(records().map(r=>r.kind));
  const old=peer().slice().reverse();
  for(const r of old){
   if(!done.has(r.kind)&&STORIES[r.kind].tasks.includes(home.kind))
    return {kind:r.kind,homeKind:home.kind,peer:{day:r.day,kind:r.kind,first:r.first,last:r.last}};
  }
  return null;
 }
 function near(){
  const p=api.getPlayer?.(),c=api.getChildPosition?.();
  return !!p&&!!c&&[p.x,p.y,c.x,c.y].every(finite)&&dist(p,c)<=130;
 }
 function ready(){
  return guarded()&&scene()==='home'&&!prompt&&
   !api.isPlayerMoving?.()&&!api.isOtherActivity?.()&&near()&&!!candidate();
 }
 function request(){
  if(!ready())return false;
  const source=candidate(),t=STORIES[source.kind];
  prompt={day:day(),source};
  api.showModal?.('little-sprouts','<section class="ls272-book"><header class="ls272-cover"><small>🏡 GENERATIONS · A REAL COTTAGE AFTERNOON</small><h2>'+t.icon+' '+esc(t.name)+'</h2><p>'+esc(t.intro)+'</p></header><p>Pip and Poppy genuinely finished today’s shared cottage activity. Pip is now remembering an earlier day physically spent with Wren. This story changes only when both are here and you choose how to remember it.</p><p><strong>'+esc(t.question)+'</strong></p><div class="ls272-activity">'+t.choices.map((v,i)=>'<button data-act="phe299-choose" data-id="'+i+'">'+esc(v)+'</button>').join('')+'</div><button class="ls272-secondary" data-act="phe299-cancel">Maybe another day</button></section>');
  return true;
 }
 function cancel(){const had=!!prompt;prompt=null;return had}
 function choose(choice){
  const p=prompt;
  if(!p||p.day!==day()||![0,1].includes(choice)||!guarded()||
   scene()!=='home'||!near()||api.isPlayerMoving?.()||api.isOtherActivity?.()){
   prompt=null;return false;
  }
  const expected=candidate();
  if(!expected||expected.kind!==p.source.kind||expected.homeKind!==p.source.homeKind||
   expected.peer.day!==p.source.peer.day||
   expected.peer.first!==p.source.peer.first||expected.peer.last!==p.source.peer.last){
   prompt=null;return false;
  }
  const prev=records(),row={day:day(),kind:expected.kind,choice,homeKind:expected.homeKind,peer:expected.peer},
   updated=clean({records:[...prev,row]},child().guardianDay);
  if(updated.records.length!==prev.length+1){prompt=null;return false}
  child().homeEchoes=updated;prompt=null;
  api.save?.();api.updateUI?.();
  const story=STORIES[row.kind];
  api.notify?.('💛 Pip brought a true friendship memory home. A new cottage picture is now displayed.');
  api.showModal?.('little-sprouts','<section class="ls272-book"><header class="ls272-cover"><small>🌼 A MEMORY FOR TWO HOMES · DAY '+day()+'</small><h2>'+story.icon+' '+esc(story.name)+'</h2><p>'+esc(story.after[choice])+'</p></header><p>Today’s real cottage activity and an earlier shared day with Wren have become one lasting memory. No currency, needs or friendship points were granted.</p><button data-act="phe299-book">Back to Pip’s Daybook</button></section>');
  return true;
 }
 function latestLine(){
  const r=records().slice(-1)[0];
  return r?STORIES[r.kind].after[r.choice]:'';
 }
 function panel(){
  if(!guarded())return '';
  const r=records(),c=candidate(),t=c&&STORIES[c.kind];
  const rows=r.slice().reverse().map(e=>'<li>Day '+e.day+' · '+STORIES[e.kind].icon+' '+esc(STORIES[e.kind].name)+' · '+esc(STORIES[e.kind].after[e.choice])+'</li>').join('');
  return '<section class="pb294-panel"><details><summary>🏡 Friendship Stories at Home · '+r.length+' / 3</summary><div class="pb294-body"><p>When Pip really makes a memory in Maplewood with Wren, finishing a later genuine shared cottage activity can bring that experience home. The little gallery on the cottage wall records the choices you made together.</p>'+
   (r.length===3?'<p>✿ Three different stories have become a family gallery.</p>':
   c?'<p>Today’s finished '+esc(c.homeKind)+' activity and an earlier '+STORIES[c.kind].icon+' outing can become a family memory.</p>':
   '<p>For a new story, first complete a real friendship outing with Wren on a previous day, then finish a matching shared cottage activity with Pip.</p>')+
   (ready()?'<button data-act="phe299-share">🌷 Listen to Pip’s story together</button>':'')+
   '<ul class="pb294-history">'+(rows||'<li>No real friendship story has come home yet.</li>')+'</ul></div></details></section>';
 }
 // Distinct original framed pixel illustrations; drawn in the world rather
 // than assembled from emoji, remote art, or clickable overlay panels.
 const SITES={story:{x:714,y:194},color:{x:767,y:194},nature:{x:820,y:194}};
 function drawWall(g,tick=0){
  if(!g||scene()!=='home'||!guarded()||!records().length)return false;
  g.save();
  for(const r of records()){
   const t=STORIES[r.kind],site=SITES[r.kind],x=site.x,y=site.y;
   g.fillStyle='#69554f';g.fillRect(x-19,y-17,38,46);
   g.fillStyle='#d5ae86';g.fillRect(x-16,y-14,32,40);
   g.fillStyle='#fff2d7';g.fillRect(x-13,y-11,26,34);
   g.fillStyle=t.ink[r.choice];g.fillRect(x-10,y-8,20,26);
   if(r.kind==='story'){
    g.fillStyle='#fff2d3';g.fillRect(x-7,y-3,6,13);g.fillRect(x+1,y-3,6,13);
    g.fillStyle='#587c91';g.fillRect(x,y-2,2,10);
   }else if(r.kind==='color'){
    g.fillStyle='#f8deab';g.fillRect(x-7,y-5,8,9);
    g.fillStyle='#86b3a1';g.fillRect(x+2,y-1,7,10);
    g.fillStyle='#f9f0d8';g.fillRect(x-1,y+7,7,4);
   }else{
    g.fillStyle='#f0efd0';g.fillRect(x-2,y-5,5,17);
    g.fillRect(x-7,y-3,5,9);g.fillRect(x+3,y-6,5,10);
    g.fillStyle='#5b896e';g.fillRect(x,y-7,2,20);
   }
   g.fillStyle=r.choice===0?'#f4e1ad':'#f2b6cd';g.fillRect(x-8,y+15,16,3);
   g.fillStyle='#7c5c53';g.fillRect(x-2,y-20,5,5);
   if(r.day===day()&&Math.sin(tick*1.6+site.x)>.95){
    g.fillStyle='#fff7c8';g.fillRect(x+16,y-20,3,3);
   }
  }
  g.restore();return true;
 }
 function drawHint(g,pos,tick=0){
  if(!g||!pos||!ready()||scene()!=='home')return false;
  const x=Math.round(pos.x+23),y=Math.round(pos.y-98+Math.sin(tick*1.7)*2);
  g.save();
  g.fillStyle='#4b6c69';g.fillRect(x-10,y-9,23,21);
  g.fillStyle='#ffeed3';g.fillRect(x-8,y-11,19,18);
  g.fillStyle=STORIES[candidate().kind].ink[0];g.fillRect(x-5,y-8,13,12);
  g.fillStyle='#ffebba';g.fillRect(x+8,y+7,4,6);
  g.restore();return true;
 }
 function advance(){
  if(prompt&&(prompt.day!==day()||scene()!=='home'||!guarded()||
   api.isDialogOpen?.()===false))prompt=null;
 }
 function handle(action,id){
  if(action==='phe299-share')return request();
  if(action==='phe299-choose')return choose(Number(id));
  if(action==='phe299-cancel'){cancel();return api.openBook?.()}
  if(action==='phe299-book'){prompt=null;return api.openBook?.()}
  return false;
 }
 return {clean,records,candidate,ready,request,choose,cancel,panel,drawWall,drawHint,latestLine,advance,handle,
  get prompt(){return prompt}};
}
root.HearthPipHomeEchoes={setup,clean,STORIES};
})(window);
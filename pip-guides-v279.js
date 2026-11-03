/* Hearth & Harbor v2.7.9 — Maplewood's Little Guides
 * Six real resident bonds from genuinely completed neighbor meetings.
 * Optional guided afternoon visits occur at live NPC coordinates, never fake
 * NPC locations or passive payouts. Poppy can join for a two-part reflection.
 */
(function(root){'use strict';
const IDS=['mabel','rosie','oliver','jun','bea','finn'];
const DESIGNS={
 mabel:{icon:'🌸',title:'Petal Patterns',color:'#dd9fb4',need:'curiosity',
  questions:[
   {text:'Mabel invites Pip to look closely at a flower. What would you notice?',options:[['The colors in each petal','Pip notices a whole rainbow in the petals.'],['How the stems hold up the bloom','Mabel shows how even small stems can be strong.']]},
   {text:'How can Pip care for this little flower garden?',options:[['Make a gentle garden sign','Pip leaves a hand-drawn sign to welcome visitors.'],['Give the new shoots room','You both leave space for flowers to grow.']]}
  ]},
 rosie:{icon:'🍓',title:'The Welcome Stand',color:'#d18d92',need:'confidence',
  questions:[
   {text:'Rosie lets Pip help plan a welcoming market table. Where do you begin?',options:[['Arrange the little fruit baskets','Pip makes a tidy pattern with the baskets.'],['Draw a cheerful sign','Rosie smiles at the colorful hello.']]},
   {text:'What might make the next customer feel welcome?',options:[['Offer a kind greeting','Pip practices saying hello with a big smile.'],['Make room for everyone','You help clear a little space at the market.']]}
  ]},
 oliver:{icon:'🥐',title:'A Little Recipe Idea',color:'#c69e77',need:'confidence',
  questions:[
   {text:'Oliver asks Pip to imagine a new bakery treat. What sounds lovely?',options:[['A tiny fruit pie','Pip sketches colorful berries on a golden crust.'],['A star-shaped bun','Oliver pretends to dust the bun with stardust.']]},
   {text:'How could the bakery share something kind today?',options:[['Make a thank-you card','Pip writes a little note for the neighbors.'],['Invite somebody to sit down','Pip remembers that company can be a wonderful gift.']]}
  ]},
 jun:{icon:'📚',title:'A Pocket-Sized Story',color:'#a795bd',need:'curiosity',
  questions:[
   {text:'Jun finds a strange drawing in an old book. What story might it tell?',options:[['A map to a secret garden','Pip imagines paths beneath a friendly old tree.'],['A tiny boat on a lake','Jun wonders how far such a boat could sail.']]},
   {text:'What should Pip learn about keeping stories safe?',options:[['Look after the book pages','You carefully close the old book together.'],['Share the tale with someone','Pip practices telling the story in their own words.']]}
  ]},
 bea:{icon:'🎨',title:'Colors of the Village',color:'#dcb88d',need:'joy',
  questions:[
   {text:'Bea brings out her little paint set. What would Pip like to sketch?',options:[['Sunshine on a cottage roof','Pip draws a golden patch of afternoon light.'],['Flowers beside the path','Bea shows how to paint delicate petals.']]},
   {text:'Where could a finished painting bring joy?',options:[['Give it to a neighbor','Pip hopes the drawing will brighten someone’s day.'],['Keep it in a scrapbook','Bea helps Pip remember the lovely afternoon.']]}
  ]},
 finn:{icon:'🐟',title:'The Patient Pond Watch',color:'#89b9b3',need:'curiosity',
  questions:[
   {text:'Finn points out gentle ripples near the pond. What might they mean?',options:[['A fish swimming below','Pip watches quietly without disturbing the water.'],['A breeze moving across the surface','Finn explains how even a tiny wind makes waves.']]},
   {text:'How should Pip care for the pond on the next visit?',options:[['Keep a field journal','Pip draws the plants and wildlife in a tiny notebook.'],['Leave the creatures undisturbed','Finn praises Pip’s gentle approach to nature.']]}
  ]}
};
const DREAMS={
 stories:{label:'storytelling',color:'#bd85a4',prop:'page',extra:'Pip looks for a story in every new detail'},
 kindness:{label:'kindness',color:'#d49e78',prop:'heart',extra:'Pip notices the little ways people care for one another'},
 discover:{label:'discoveries',color:'#87b79b',prop:'leaf',extra:'Pip watches closely and asks curious questions'}
};
const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const validDay=x=>Number.isInteger(x)&&x>=1&&x<=9999;
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const validId=id=>IDS.includes(id);
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const num=x=>Number.isFinite(x);
function clean(raw,meetings){
 const src=obj(raw)?raw:{},counts={},last={},source=obj(src.counts)?src.counts:{},past=obj(src.last)?src.last:{};
 for(const id of IDS){
  const dates=new Set();
  if(Array.isArray(meetings))for(const m of meetings){
   if(obj(m)&&m.id===id&&validDay(m.day)&&Number.isInteger(m.mask)&&m.mask>=0&&m.mask<=3)dates.add(m.day);
  }
  const historical=dates.size,previous=Number.isInteger(source[id])&&source[id]>=0&&source[id]<=999?source[id]:0;
  counts[id]=Math.max(historical,previous);
  const previousDay=validDay(past[id])?past[id]:0;
  last[id]=Math.max(previousDay,...dates,0);
 }
 const chosen=validId(src.chosen)&&counts[src.chosen]>=2?src.chosen:null;
 const chosenDay=chosen&&validDay(src.chosenDay)?src.chosenDay:0;
 const enabled=chosenDay>0&&src.enabled===true;
 const used=new Set(),guided=[];
 if(Array.isArray(src.guided))for(const m of src.guided.slice(-110)){
  if(!obj(m)||!validId(m.id)||!validDay(m.day)||!Object.hasOwn(DREAMS,m.focus)||
   !Number.isInteger(m.mask)||m.mask<0||m.mask>3||used.has(m.day))continue;
  used.add(m.day);guided.push({day:m.day,id:m.id,focus:m.focus,mask:m.mask});
 }
 guided.sort((a,b)=>a.day-b.day);
 return {chosen:chosenDay?chosen:null,chosenDay,enabled,counts,last,guided:guided.slice(-36)};
}
function attendancePose(base,child,minute,day,adults,isWalkable){
 const ment=child?.mentor,focus=child?.dream?.focus;
 if(!obj(ment)||child?.guardian!=='player'||!validDay(child.guardianDay)||child.guardianDay>day||
  !ment.enabled||!validId(ment.chosen)||!validDay(ment.chosenDay)||ment.chosenDay>day||
  !obj(ment.counts)||!Number.isInteger(ment.counts[ment.chosen])||ment.counts[ment.chosen]<2||
  !num(minute)||minute<720||minute>=1020)return base;
 const adult=Array.isArray(adults)?adults.find(a=>obj(a)&&a.id===ment.chosen&&num(a.x)&&num(a.y)):null;
 if(!adult)return base;
 const offsets=[[-64,27],[59,27],[-45,-33],[52,-30]];
 const at=offsets.map(([dx,dy])=>({x:Math.round(adult.x+dx),y:Math.round(adult.y+dy)}))
  .find(p=>!isWalkable||isWalkable(p.x,p.y,'town')===true);
 if(!at)return base;
 const deco=DESIGNS[adult.id],dream=Object.hasOwn(DREAMS,focus)?DREAMS[focus]:DREAMS.discover;
 const title='An afternoon with '+adult.name,route=Array.isArray(base?.route)?base.route.map(x=>({...x})):[];
 if(route.length>2)route[2]={...route[2],title,icon:deco.icon,note:'A real supervised village visit'};
 return {...base,scene:'town',x:at.x,y:at.y,moving:false,facing:'side',
  icon:deco.icon,prop:'guide-'+adult.id,label:title,note:deco.title+' · '+dream.extra,
  next:base.next,route,mentorVisit:true,mentorId:adult.id,mentorName:adult.name,
  mentorTheme:Object.hasOwn(DREAMS,focus)?focus:'discover'};
}
function setup(api){
 const state=()=>api.getState(),child=()=>api.getChild(),day=()=>validDay(state().day)?state().day:1;
 const data=()=>{const c=child();if(!obj(c.mentor))c.mentor=clean(null,c.meetings);return c.mentor};
 const guardian=()=>child().guardian==='player'&&validDay(child().guardianDay)&&child().guardianDay<=day();
 const inHome=()=>guardian()&&api.getScene?.()==='home'&&api.nearChild?.(130)===true;
 const outing=()=>api.location?.()?.mentorVisit===true;
 const inTown=()=>outing()&&api.getScene?.()==='town'&&api.nearChild?.(140)===true;
 const actual=()=>{
  const pose=api.location?.(),a=(api.getAdults?.()||[]).find(n=>n.id===pose?.mentorId);
  return a&&num(a.x)&&num(a.y)&&Math.hypot(a.x-pose.x,a.y-pose.y)<110?a:null;
 };
 const affinity=()=>IDS.map(id=>({id,score:data().counts[id]||0,title:DESIGNS[id].title,icon:DESIGNS[id].icon,
  unlocked:(data().counts[id]||0)>=2,tier:(data().counts[id]||0)>=4?'Trusted guide':(data().counts[id]||0)>=2?'Village friend':(data().counts[id]||0)>=1?'Getting acquainted':'Not yet met'}));
 function completedMeeting(record,before){
  if(!obj(record)||!validId(record.id)||!validDay(record.day)||record.day!==day()||
   !Number.isInteger(record.mask)||record.mask<0||record.mask>3||
   !Array.isArray(before)||before.some(m=>obj(m)&&m.id===record.id&&m.day===record.day))return false;
  const d=data(),id=record.id;
  const known=new Set(before.filter(m=>obj(m)&&m.id===id&&validDay(m.day)&&
   Number.isInteger(m.mask)&&m.mask>=0&&m.mask<=3).map(m=>m.day)).size;
  // Genuine completed prior neighbor events are the only way to advance the
  // durable six tiny counters (the old scrapbook is intentionally bounded).
  d.counts[id]=clamp(Math.max(d.counts[id]||0,known)+1,0,999);
  d.last[id]=record.day;
  return true;
 }
 function choose(id){
  if(!inHome()||!validId(id)||(data().counts[id]||0)<2||data().chosen===id)return false;
  const d=data();d.chosen=id;d.chosenDay=day();d.enabled=false;
  api.save?.();api.updateUI?.();
  api.notify?.('🌼 You and Pip chose '+(api.name?.(id)||id)+' as a favorite village guide. An afternoon visit is optional.');
  api.openBook?.();return true;
 }
 function toggle(){
  const d=data();
  if(!guardian()||!d.chosen||!validDay(d.chosenDay)||d.chosenDay>day())return false;
  if(!d.enabled&&!inHome())return false;
  if(d.enabled&&!inHome()&&!inTown())return false;
  d.enabled=!d.enabled;
  api.save?.();api.updateUI?.();
  api.notify?.(d.enabled?'🌿 Pip may now spend afternoons with '+(api.name?.(d.chosen)||d.chosen)+' when that villager is genuinely in town.':'🏡 Pip’s guided afternoon visits are paused.');
  api.openBook?.();return true;
 }
 const records=()=>data().guided||[];
 let session=null;
 const eligible=()=>guardian()&&inTown()&&!!actual()&&!records().some(r=>r.day===day())&&!session;
 function panel(){
  const d=data(),name=id=>esc(api.name?.(id)||id),list=affinity();
  const connections=list.map(a=>'<div class="pm279-guide"><span>'+a.icon+'</span><div><strong>'+name(a.id)+' · '+a.tier+'</strong><small>'+a.score+' genuine visit days'+(a.unlocked?' · Can become Pip’s guide':' · Meet on 2 different days to choose')+'</small></div>'+
   (inHome()&&a.unlocked&&d.chosen!==a.id?'<button data-act="pm279-choose" data-id="'+a.id+'">Choose</button>':'')+'</div>').join('');
  const visiting=outing(),near=inTown(),mentor=d.chosen?name(d.chosen):null;
  const sessions=records().filter(r=>r.day<=day()).slice(-6).reverse().map(r=>'<li>Day '+r.day+' · '+DESIGNS[r.id].icon+' '+name(r.id)+' · '+esc(DREAMS[r.focus].label)+'</li>').join('');
  return '<section class="pm279-panel"><div class="pm279-cover"><small>MAPLEWOOD · CHILDHOOD CONNECTIONS</small><h3>🌸 Pip’s Village Guides</h3><p>Real visits with real neighbors build familiarity. After two different days together, Pip can choose a favorite guide and, only if you allow it, spend afternoons near that villager in the playable town.</p></div>'+
   '<h3>People Pip is getting to know</h3><div class="pm279-list">'+connections+'</div>'+
   (guardian()?'<div class="pm279-outing"><strong>🏡 Our afternoon arrangement</strong><p>'+(mentor?'Favorite guide: '+mentor+'.':'Choose a guide after two genuine meetings on separate days.')+'</p>'+
    (d.chosen?(d.enabled?
     '<p>Afternoon visits are enabled (noon–5 PM), only when the real villager is there. Pip returns to their cottage routine outside these hours.</p>'+
      (inHome()||near?'<button data-act="pm279-toggle">End guided afternoons</button>':'<small>To end a visit, meet Pip in the village or at home outside visit hours.</small>'):
     '<p>Guided afternoons are currently off. Pip stays in the original cottage routine.</p>'+
      (inHome()?'<button data-act="pm279-toggle">Allow guided afternoon visits</button>':'<small>Visit Pip at home to opt in.</small>')):'')+'</div>':'')+
   (visiting?'<div class="pm279-now"><strong>🌷 Pip is with '+mentor+' in the real village</strong><p>'+
    (near?'You are close enough to join them.':'Walk to Pip and the real villager to join their afternoon.')+'</p>'+
    (eligible()?'<button data-act="pm279-start">Share a little guide reflection</button>':records().some(r=>r.day===day())?'<small>✓ Today’s shared guide reflection is complete.</small>':'')+'</div>':'')+
   '<h3>Our real guide memories</h3><ul class="pm279-history">'+(sessions||'<li>No completed guide reflections yet.</li>')+'</ul>'+
   '<p class="pm279-note">Friendship here means familiar neighbors, not a new legal guardian or invented family tie. An unattended afternoon earns no currency or memories.</p></section>';
 }
 function start(){
  if(!eligible())return false;
  const a=actual(),pose=api.location?.(),focus=Object.hasOwn(DREAMS,child().dream?.focus)?child().dream.focus:'discover';
  session={day:day(),id:a.id,focus,step:0,mask:0,poseId:pose.mentorId};
  return page();
 }
 function validSession(){
  const p=api.location?.();
  return !!session&&session.day===day()&&p?.mentorVisit&&p.mentorId===session.id&&
   inTown()&&actual()?.id===session.id&&
   (Object.hasOwn(DREAMS,child().dream?.focus)?child().dream.focus:'discover')===session.focus&&
   !records().some(r=>r.day===day());
 }
 function page(){
  if(!validSession()){session=null;return false}
  const def=DESIGNS[session.id],q=def.questions[session.step],theme=DREAMS[session.focus];if(!q)return false;
  api.showModal?.('little-sprouts','<section class="ls272-book pm279-story"><div class="ls272-cover"><small>'+def.icon+' A REAL GUIDED AFTERNOON · '+(session.step+1)+' OF 2</small><h2>'+esc(def.title)+'</h2><p>'+esc(theme.extra)+'. '+esc(q.text)+'</p></div><div class="ls272-activity">'+q.options.map(([text],i)=>'<button data-act="pm279-answer" data-id="'+i+'">'+esc(text)+'</button>').join('')+'</div><button class="ls272-secondary" data-act="pm279-cancel">Leave the reflection unfinished</button></section>');
  return true;
 }
 function answer(choice){
  if(!Number.isInteger(choice)||choice<0||choice>1||!validSession()){session=null;return false}
  const q=DESIGNS[session.id].questions[session.step];if(!q){session=null;return false}
  if(choice===1)session.mask|=1<<session.step;
  const reply=q.options[choice][1];session.step++;
  if(session.step<2){
   api.showModal?.('little-sprouts','<section class="ls272-book pm279-story"><div class="ls272-cover"><small>A LITTLE MOMENT TO REMEMBER</small><h2>🌼 Learning with a friend</h2><p>'+esc(reply)+'</p></div><button data-act="pm279-next">Continue our reflection</button><button class="ls272-secondary" data-act="pm279-cancel">Stop for today</button></section>');
   return true;
  }
  const r={day:session.day,id:session.id,focus:session.focus,mask:session.mask};session=null;
  if(records().some(x=>x.day===r.day))return false;
  const c=child(),need=DESIGNS[r.id].need;
  c.mentor.guided=clean({...data(),guided:[...records(),r]},c.meetings).guided;
  c.needs[need]=Math.min(100,Math.max(0,c.needs[need]||0)+7);
  c.needs.joy=Math.min(100,Math.max(0,c.needs.joy||0)+2);
  api.save?.();api.updateUI?.();
  api.notify?.('🌼 A real afternoon with '+(api.name?.(r.id)||r.id)+' is remembered. '+need+' +7 · Joy +2.');
  api.showModal?.('little-sprouts','<section class="ls272-book pm279-story"><div class="ls272-cover"><small>A GENUINE VILLAGE MEMORY</small><h2>'+DESIGNS[r.id].icon+' '+esc(DESIGNS[r.id].title)+'</h2><p>'+esc(reply)+'</p></div><p>Pip was with the actual villager. This experience is a childhood memory—not a new family relation.</p><button data-act="pm279-book">Return to Pip’s Daybook</button></section>');
  return true;
 }
 function handle(action,id){
  if(action==='pm279-choose')return choose(id);
  if(action==='pm279-toggle')return toggle();
  if(action==='pm279-start')return start();
  if(action==='pm279-next')return page();
  if(action==='pm279-answer')return answer(Number(id));
  if(action==='pm279-cancel'){session=null;return api.openBook?.()}
  if(action==='pm279-book')return api.openBook?.();
  return false;
 }
 function draw(g,pose,tick=0){
  if(!g||!pose?.mentorVisit||!validId(pose.mentorId))return false;
  const col=DREAMS[pose.mentorTheme]?.color||'#87b79b',x=Math.round(pose.x+38),y=Math.round(pose.y-24);
  g.save();
  // Original pixel-sized, persistent village learning prop beside the sprite.
  g.fillStyle='#806b52';g.fillRect(x-21,y+16,45,5);g.fillRect(x-16,y+21,5,9);g.fillRect(x+17,y+21,5,9);
  g.fillStyle='#f9e4bb';g.fillRect(x-14,y-8,27,25);g.fillStyle=col;g.fillRect(x-11,y-4,21,16);
  g.fillStyle='#fff4dc';g.fillRect(x-3,y+1,6,6);
  g.fillStyle='#c79b74';g.fillRect(x+15,y-13,6,26);
  g.fillStyle=DESIGNS[pose.mentorId].color;g.fillRect(x+14,y-18,11,10);
  if(Math.sin(tick*2.4)>0){g.fillStyle='#fff7df';g.fillRect(x+18,y-15,4,4)}
  g.restore();return true;
 }
 return {clean,attendancePose,completedMeeting,choose,toggle,panel,start,page,answer,eligible,affinity,handle,draw,
  visitingNow:outing,get session(){return session},get data(){return data()}};
}
root.HearthPipGuides={setup,clean,attendancePose,DESIGNS,DREAMS,IDS};
})(window);

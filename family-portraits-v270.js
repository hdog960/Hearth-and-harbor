/* Hearth & Harbor v2.7.0 — Family Portraits: first playable Generations prelude.
 * Portraits are earned by two real co-residents with an existing marriage or
 * voluntary chosen-family link, each completing the selected genuine activity.
 * Does not create children, bloodlines, relationships, passive income or items.
 */
(function(root){'use strict';
const IDS=['mabel','rosie','oliver','jun','bea','finn'],HOMES=['h0','h1','h2','h3','h4','h5'];
const THEMES={
 story:{title:'Our Storybook Afternoon',icon:'📚',action:'read',description:'Each person reads in their own household routine.'},
 hearth:{title:'A Heart-to-Heart',icon:'💗',action:'chat',description:'Each person completes a genuine conversation.'},
 maker:{title:'Made with Love',icon:'🎨',action:'hobby',description:'Each person spends time on a real creative hobby.'}
};
const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const dayOK=x=>Number.isInteger(x)&&x>=1&&x<=9999;
const pair=ids=>ids.slice().sort().join('|');
const pairOK=k=>typeof k==='string'&&k.split('|').length===2&&k.split('|').every(x=>IDS.includes(x))&&k.split('|')[0]!==k.split('|')[1]&&pair(k.split('|'))===k;
const esc=x=>String(x).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const clean=raw=>{
 const src=obj(raw)?raw:{},pending={},portraits=[],seen=new Set(),perHome={};
 for(const home of HOMES){
  const x=obj(src.pending)?src.pending[home]:null;
  if(obj(x)&&pairOK(x.pair)&&THEMES[x.theme]&&dayOK(x.day)){
   const ids=x.pair.split('|'),done=Array.isArray(x.done)?[...new Set(x.done.filter(id=>ids.includes(id)))].slice(0,2):[];
   pending[home]={pair:x.pair,theme:x.theme,day:x.day,done};
  }
 }
 if(Array.isArray(src.portraits))for(const x of src.portraits.slice(-50)){
  if(!obj(x)||!HOMES.includes(x.home)||!pairOK(x.pair)||!THEMES[x.theme]||!dayOK(x.day)||!dayOK(x.linkDay)||x.linkDay>x.day||!['marriage','chosen'].includes(x.link))continue;
  const key=x.pair+'|'+x.theme;
  if(seen.has(key)||(perHome[x.home]||0)>=2||portraits.length>=12)continue;
  seen.add(key);perHome[x.home]=(perHome[x.home]||0)+1;
  portraits.push({home:x.home,pair:x.pair,theme:x.theme,day:x.day,link:x.link,linkDay:x.linkDay});
 }
 return {pending,portraits};
};
function setup(api){
 const state=()=>api.getState();
 const data=()=>{
  const s=state();
  if(!obj(s.familyPortraits)||!obj(s.familyPortraits.pending)||!Array.isArray(s.familyPortraits.portraits))
   s.familyPortraits=clean(s.familyPortraits);
  return s.familyPortraits;
 };
 const residents=home=>(api.getHomeMembers?.(home)||[]).filter(id=>IDS.includes(id));
 const actualPair=home=>{const ids=residents(home);return ids.length===2?pair(ids):null};
 const relation=(key,at=state().day)=>{
  if(!pairOK(key)||!dayOK(at))return null;
  const wedding=state().weddingPlans?.[key];
  if(wedding?.status==='married'&&dayOK(wedding.marriedDay)&&wedding.marriedDay<=at)
   return {kind:'marriage',day:wedding.marriedDay};
  const chosen=state().familyRoots?.chosen?.[key];
  if(chosen&&dayOK(chosen.day)&&chosen.day<=at&&chosen.status==='active')
   return {kind:'chosen',day:chosen.day};
  return null;
 };
 const supported=x=>{
  const rel=relation(x.pair,x.day);
  // A later marriage must not erase an earlier, genuine chosen-family portrait.
  const chosen=state().familyRoots?.chosen?.[x.pair];
  const wasChosen=x.link==='chosen'&&chosen&&chosen.day===x.linkDay&&chosen.day<=x.day&&
   (chosen.status==='active'||chosen.status==='ended'&&chosen.endedDay>=x.day);
  const marriage=state().weddingPlans?.[x.pair];
  const wasMarried=x.link==='marriage'&&marriage?.status==='married'&&marriage.marriedDay===x.linkDay&&marriage.marriedDay<=x.day;
  return !!(wasChosen||wasMarried||(rel&&rel.kind===x.link&&rel.day===x.linkDay));
 };
 const items=home=>data().portraits.filter(p=>(!home||p.home===home)&&supported(p));
 const comfort=home=>Math.min(4,items(home).length*2);
 const session=home=>{
  const p=data().pending[home];
  if(!p)return null;
  if(p.day!==state().day||p.pair!==actualPair(home)||!relation(p.pair)){delete data().pending[home];return null}
  return p;
 };
 function canBegin(home,theme){
  const key=actualPair(home),t=THEMES[theme];
  if(!HOMES.includes(home)||!key||!t)return {ok:false,why:'Two real residents must share this home.'};
  if(!relation(key))return {ok:false,why:'An existing marriage or chosen-family promise is required.'};
  if(session(home))return {ok:false,why:'Finish or cancel the current portrait first.'};
  if(items(home).length>=2)return {ok:false,why:'This home already displays two family portraits.'};
  if(items().some(x=>x.pair===key&&x.theme===theme))return {ok:false,why:'This family has already made this portrait.'};
  const already=key.split('|').filter(id=>(api.getDone?.(id)||[]).includes(t.action));
  if(already.length)return {ok:false,why:'Someone already did that activity today. Choose another theme or try tomorrow.'};
  return {ok:true,key};
 }
 function begin(home,theme){
  const e=canBegin(home,theme);
  if(!e.ok){api.notify?.(e.why);return false}
  data().pending[home]={pair:e.key,theme,day:state().day,done:[]};
  api.save?.();board(home);return true;
 }
 function cancel(home){
  if(!HOMES.includes(home)||!session(home))return false;
  delete data().pending[home];api.save?.();board(home);return true;
 }
 function queue(home,id){
  const s=session(home),t=s&&THEMES[s.theme];
  if(!s||!s.pair.split('|').includes(id)||s.done.includes(id)||!t)return false;
  if((api.getDone?.(id)||[]).includes(t.action)){api.notify?.('That activity was already completed today. Try again tomorrow.');return false}
  if(!api.addSchedule?.(home,id,t.action)){api.notify?.('The Daybook is full. Guide this resident manually or clear a slot.');return false}
  api.notify?.('The real activity was added to '+api.getPersonLabel(id)+'’s Daybook. It must finish to count.');
  board(home);return true;
 }
 function completed(home,id,action,once,day){
  const s=HOMES.includes(home)&&session(home),t=s&&THEMES[s.theme];
  if(!s||!t||once!==true||day!==s.day||action!==t.action||
   !s.pair.split('|').includes(id)||s.done.includes(id))return false;
  s.done.push(id);
  if(s.done.length===2){
   const rel=relation(s.pair),key=s.pair+'|'+s.theme;
   if(!rel||items(home).length>=2||items().some(x=>x.pair+'|'+x.theme===key)){delete data().pending[home];return false}
   data().portraits.push({home,pair:s.pair,theme:s.theme,day,link:rel.kind,linkDay:rel.day});
   delete data().pending[home];
   api.notify?.('🖼️ A real family portrait is now hanging in '+api.getHomeLabel(home)+'! +2 home comfort');
  }else api.notify?.('💗 '+api.getPersonLabel(id)+' finished their part. One more genuine activity completes the portrait.');
  api.save?.();api.updateUI?.();return true;
 }
 function board(home){
  if(!HOMES.includes(home)){
   const rows=HOMES.map(h=>{
    const people=residents(h),key=actualPair(h),rel=key&&relation(key),count=items(h).length;
    return '<div class="fp27-house"><strong>🏡 '+esc(api.getHomeLabel(h))+'</strong><p>'+esc(people.map(id=>api.getPersonLabel(id)).join(' & ')||'No current residents')+'</p><small>'+(rel?(rel.kind==='marriage'?'Married family':'Chosen family'):'No active family connection')+' · '+count+'/2 portraits</small><button data-act="fp27-open" data-id="'+h+'">Open this family album</button></div>';
   }).join('');
   api.showModal?.('family-portraits','<section class="fp27-book"><header class="fp27-cover"><small>GENERATIONS · FIRST CHAPTER</small><h2>🖼️ Our Family Portraits</h2><p>Only lived relationships become lasting pictures. A wedding or chosen-family promise is never invented, and both residents must truly take part.</p></header><div class="fp27-grid">'+rows+'</div></section>');
   return;
  }
  const people=residents(home),s=session(home),rel=actualPair(home)&&relation(actualPair(home));
  const portraits=items(home).map(x=>'<div class="fp27-memory"><span>🖼️</span><div><strong>'+THEMES[x.theme].title+'</strong><small>Day '+x.day+' · '+x.pair.split('|').map(id=>esc(api.getPersonLabel(id))).join(' & ')+' · '+(x.link==='marriage'?'Marriage':'Chosen family')+' since Day '+x.linkDay+'</small></div></div>').join('');
  const choices=Object.keys(THEMES).map(id=>{
   const t=THEMES[id],check=canBegin(home,id);
   return '<button data-act="fp27-begin" data-id="'+home+':'+id+'" '+(check.ok?'':'disabled')+'><b>'+t.icon+' '+t.title+'</b><small>'+esc(check.ok?t.description:check.why)+'</small></button>';
  }).join('');
  const progress=s?'<div class="fp27-session"><h3>Making: '+THEMES[s.theme].title+'</h3><p>Each person must finish '+THEMES[s.theme].action+' today. Opening this book never completes the activity.</p>'+s.pair.split('|').map(id=>'<div class="fp27-step"><strong>'+esc(api.getPersonLabel(id))+'</strong> <span>'+(s.done.includes(id)?'✓ Finished':'Waiting for a real activity')+'</span>'+(s.done.includes(id)?'':'<button data-act="fp27-queue" data-id="'+home+':'+id+'">Add to Daybook</button>')+'</div>').join('')+'<button class="fp27-secondary" data-act="fp27-cancel" data-id="'+home+'">Cancel unfinished portrait</button></div>':'<h3>Choose a family memory</h3>'+choices;
  api.showModal?.('family-portraits','<section class="fp27-book"><header class="fp27-cover"><small>THE HOUSEHOLD ALBUM</small><h2>🖼️ '+esc(api.getHomeLabel(home))+'</h2><p>'+esc(people.map(id=>api.getPersonLabel(id)).join(' & ')||'An empty home')+'</p><small>'+(rel?(rel.kind==='marriage'?'Real marriage · Day ':'Chosen family · Day ')+rel.day:'A real family bond must be earned before starting')+'</small></header><div class="fp27-memories">'+(portraits||'<p>No portrait has been earned here yet.</p>')+'</div>'+progress+'<button class="fp27-secondary" data-act="fp27-back">← Other homes</button></section>');
 }
 function handle(action,id){
  if(action==='fp27-board'||action==='fp27-back')return board();
  if(action==='fp27-open')return board(id);
  if(action==='fp27-begin'){const args=String(id).split(':');return args.length===2&&begin(args[0],args[1])}
  if(action==='fp27-queue'){const args=String(id).split(':');return args.length===2&&queue(args[0],args[1])}
  if(action==='fp27-cancel')return cancel(id);
  return false;
 }
 // A picture is an actual wall object: the world tap opens its authentic record.
 function hit(home,x,y){
  const pictures=items(home);
  if(!Number.isFinite(x)||!Number.isFinite(y))return -1;
  for(let i=0;i<pictures.length;i++){
   const cx=i?698:459;
   if(x>=cx-64&&x<=cx+64&&y>=311&&y<=405)return i;
  }
  return -1;
 }
 function draw(g,home){
  const pictures=items(home);if(!pictures.length)return;
  pictures.forEach((p,i)=>{
   const x=i?698:459,y=385,ids=p.pair.split('|'),inks=p.theme==='hearth'?['#eab1a5','#f4c9a6']:p.theme==='story'?['#9dbab7','#e0d2a8']:['#c8add1','#e7c58c'];
   g.save();g.translate(x,y);g.fillStyle='#473c32';g.fillRect(-64,-74,128,94);
   g.fillStyle='#a47955';g.fillRect(-59,-69,118,84);g.fillStyle='#eddfc1';g.fillRect(-52,-62,104,70);
   g.fillStyle=inks[0];g.fillRect(-47,-57,94,57);g.fillStyle=inks[1];g.fillRect(-47,-20,94,20);
   // Two distinct miniature residents in a genuine shared keepsake, not icons.
   for(let n=0;n<2;n++){const xx=n?-23:23;g.fillStyle=['#c8916f','#e7b692','#f1c5a0','#a97659','#9f735a','#ebc7a5'][IDS.indexOf(ids[n])];g.beginPath();g.arc(xx,-34,13,0,Math.PI*2);g.fill();g.fillStyle='#5e4b48';g.beginPath();g.arc(xx,-42,13,Math.PI,Math.PI*2);g.fill();g.fillStyle=n?'#6f9da4':'#b8809c';g.fillRect(xx-16,-20,32,18)}
   g.fillStyle='#e3bd80';g.beginPath();g.arc(0,-7,5,0,Math.PI*2);g.fill();g.fillStyle='#523f35';g.font='bold 10px system-ui';g.textAlign='center';g.fillText('DAY '+p.day,0,12);g.restore();
  });
 }
 return {clean,begin,cancel,queue,completed,session,relation,canBegin,board,handle,items,comfort,draw,hit,get data(){return data()},THEMES};
}
root.HearthFamilyPortraits={setup,clean,IDS,HOMES,THEMES};
})(window);

/* Hearth & Harbor v2.8.8 — Pip's Homegrown Personality.
 * Four interests EARNED through genuine completed 3.8-second household
 * actions with Pip present, not free clicks, passive time or menu claims.
 * Interests change Pip's afternoon activity and small tangible home art.
 * Older homeHelp memories seed totals without ever resetting an old save.
 */
(function(root){'use strict';
const KINDS=['read','tidy','meal','hobby'];
const TRAITS={
 read:{name:'Little Storykeeper',verb:'reading another chapter',icon:'📚',
  detail:'Pip keeps a small story nook and likes imagining what happens next.',
  prop:'book',color:'#8b84b3',site:[460,472],afternoon:[675,746],need:'curiosity'},
 tidy:{name:'Thoughtful Helper',verb:'caring for a cozy corner',icon:'🧺',
  detail:'Pip has started noticing the little ways to take care of a shared home.',
  prop:'basket',color:'#be9272',site:[716,560],afternoon:[735,825],need:'confidence'},
 meal:{name:'Little Table Setter',verb:'preparing the little table',icon:'🥣',
  detail:'Pip remembers napkins, favorite flavors and whose place is at the table.',
  prop:'napkin',color:'#d3a070',site:[850,385],afternoon:[794,764],need:'confidence'},
 hobby:{name:'Curious Maker',verb:'drawing a new idea',icon:'🎨',
  detail:'Pip experiments with colors and creates something new each afternoon.',
  prop:'crayon',color:'#bb879f',site:[548,698],afternoon:[736,835],need:'joy'}
};
const dayOK=d=>Number.isInteger(d)&&d>=1&&d<=9999;
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const clampInt=x=>Number.isInteger(x)&&x>=0&&x<=999?x:0;
const empty=()=>({totals:{read:0,tidy:0,meal:0,hobby:0},last:null});
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function clean(raw,helps,guardianDay=0){
 const out=empty(),g=dayOK(guardianDay)?guardianDay:9999;
 const seen=new Set(),prior=[];
 if(Array.isArray(helps))for(const row of helps.slice(-120)){
  if(!object(row)||!dayOK(row.day)||row.day<g||!KINDS.includes(row.kind)||
    seen.has(row.day))continue;
  seen.add(row.day);prior.push({kind:row.kind,day:row.day});
  out.totals[row.kind]=Math.min(999,out.totals[row.kind]+1);
 }
 prior.sort((a,b)=>a.day-b.day||a.kind.localeCompare(b.kind));
 if(prior.length)out.last=prior[prior.length-1];
 if(object(raw)&&object(raw.totals)){
  for(const kind of KINDS)out.totals[kind]=Math.max(out.totals[kind],clampInt(raw.totals[kind]));
  const last=raw.last;
  if(object(last)&&KINDS.includes(last.kind)&&dayOK(last.day)&&last.day>=g&&
    (!out.last||last.day>=out.last.day))out.last={kind:last.kind,day:last.day};
 }
 return out;
}
function favorite(data){
 const a=object(data?.totals)?data.totals:{},last=data?.last?.kind;
 let best=null,score=1;
 for(const kind of KINDS){
  const n=clampInt(a[kind]);
  if(n>score||(n===score&&n>=2&&kind===last)){
   best=kind;score=n;
  }
 }
 return best;
}
function setup(api){
 const state=()=>api.getState(),child=()=>api.getChild();
 const day=()=>dayOK(state().day)?state().day:1;
 const owned=()=>child().guardian==='player'&&dayOK(child().guardianDay)&&child().guardianDay<=day();
 const info=()=>clean(child().homeRhythms,child().homeHelps,child().guardianDay);
 const profile=()=>{
  const d=info(),kind=owned()?favorite(d):null;
  return {kind,counts:{...d.totals},last:d.last,trait:kind?TRAITS[kind]:null,
   earned:KINDS.filter(k=>d.totals[k]>=2)};
 };
 function completed(receipt){
  const d=child();
  if(!owned()||api.getScene?.()!=='home'||!object(receipt)||!dayOK(receipt.day)||
    receipt.day!==day()||!KINDS.includes(receipt.kind))return false;
  if(!Array.isArray(d.homeHelps)||!d.homeHelps.some(r=>r.day===receipt.day&&r.kind===receipt.kind))return false;
  const before=clean(d.homeRhythms,d.homeHelps.filter(r=>r.day<receipt.day),d.guardianDay);
  if(before.last?.day===receipt.day)return false;
  const was=before.totals[receipt.kind];
  before.totals[receipt.kind]=Math.min(999,was+1);
  before.last={kind:receipt.kind,day:receipt.day};
  d.homeRhythms=before; // saved by the existing genuine homeHelp completion.
  if(was===1)api.notify?.('🌷 Two real shared '+receipt.kind+' days! '+TRAITS[receipt.kind].name+
   ' now has a handmade home detail.');
  else if(was===0)api.notify?.('🌱 Pip has a new interest in '+TRAITS[receipt.kind].verb+'.');
  return true;
 }
 function adjustPose(base){
  if(!base||!owned()||api.getScene?.()!=='home'||base.scene!=='home'||
    base.slot!==2||base.project||base.mentorVisit)return base;
  const p=profile(),t=p.trait;
  if(!t)return base;
  const desired={x:t.afternoon[0],y:t.afternoon[1]};
  const safe=api.nearestWalkable?.(desired,'home')||desired;
  if(!Number.isFinite(safe.x)||!Number.isFinite(safe.y)||
    Math.hypot(safe.x-desired.x,safe.y-desired.y)>65||
    api.isWalkable?.(safe.x,safe.y,'home')===false)return base;
  // Blend through the first scheduled hour rather than snapping Pip
  // abruptly to a new tile at noon.
  const minute=Number(state().minute);
  const blend=Number.isFinite(minute)?Math.max(0,Math.min(1,(minute-720)/65)):0;
  return {...base,x:base.x+(safe.x-base.x)*blend,y:base.y+(safe.y-base.y)*blend,
   moving:base.moving||blend>0&&blend<1,
   label:t.name+' · '+t.verb,note:t.detail,prop:t.prop,icon:t.icon};
 }
 function panel(){
  if(!owned())return '';
  const p=profile(),infoText=p.trait?
   '<strong>'+p.trait.icon+' '+esc(p.trait.name)+'</strong><small>'+esc(p.trait.detail)+'</small>':
   '<strong>🌱 A personality taking shape</strong><small>Pip’s own interests grow from the real things you do together.</small>';
  const marks=KINDS.map(k=>'<span title="'+esc(TRAITS[k].name)+'">'+TRAITS[k].icon+' '+p.counts[k]+
   (p.counts[k]>=2?' ✓':'')+'</span>').join('');
  return '<div class="ph288-identity">'+infoText+'<div class="ph288-marks">'+marks+
   '</div><small>Two genuinely finished shared days in a kind of home activity make a little illustrated keepsake. Pip’s strongest interest shapes their afternoon.</small></div>';
 }
 function drawHome(g,tick=0){
  if(!g||api.getScene?.()!=='home'||!owned())return false;
  const p=profile();if(!p.earned.length)return false;
  g.save();
  for(const kind of p.earned){
   const t=TRAITS[kind],x=t.site[0],y=t.site[1];
   g.fillStyle='#6d574b';g.fillRect(x-17,y-5,34,6);
   if(kind==='read'){
    g.fillStyle='#9077a2';g.fillRect(x-12,y-27,24,23);
    g.fillStyle='#fff0d5';g.fillRect(x-10,y-25,10,17);g.fillRect(x+2,y-25,8,17);
    g.fillStyle='#be8fa2';g.fillRect(x,y-25,2,18);
   }else if(kind==='tidy'){
    g.fillStyle='#a77c64';g.fillRect(x-14,y-20,28,17);
    g.fillStyle='#6f574c';g.fillRect(x-10,y-24,4,7);g.fillRect(x+6,y-24,4,7);
    g.fillStyle='#edcfaf';g.fillRect(x-10,y-18,20,6);
    g.fillStyle='#b8c7a5';g.fillRect(x-6,y-15,12,8);
   }else if(kind==='meal'){
    g.fillStyle='#f4e3c9';g.fillRect(x-16,y-28,32,23);
    g.fillStyle='#d5a577';g.fillRect(x-13,y-23,26,3);
    g.fillStyle='#9ebca8';g.fillRect(x-11,y-17,8,8);
    g.fillStyle='#ca8f93';g.fillRect(x+2,y-17,9,9);
   }else{
    g.fillStyle='#ebd9b7';g.fillRect(x-15,y-26,30,21);
    g.fillStyle='#ca8795';g.fillRect(x-11,y-29,5,21);
    g.fillStyle='#79a6b4';g.fillRect(x-1,y-30,5,22);
    g.fillStyle='#b7bd85';g.fillRect(x+9,y-25,4,17);
   }
   // A tiny natural sparkle only on the currently preferred memento.
   if(kind===p.kind&&Math.sin(tick*1.3)>.65){
    g.fillStyle='#fff2c7';g.fillRect(x+17,y-33,5,5);
   }
  }
  g.restore();return true;
 }
 function drawParticipation(g,pos,kind,tick=0){
  if(!g||!pos||!owned()||api.getScene?.()!=='home'||!KINDS.includes(kind)||
    api.getHold?.()?.kind!==kind)return false;
  const x=Math.round(pos.x+21),y=Math.round(pos.y-51+Math.sin(tick*7)*2);
  g.save();g.fillStyle='#ebbc99';g.fillRect(x-4,y-4,9,8);
  if(kind==='read'){
   g.fillStyle='#786487';g.fillRect(x+2,y-19,20,18);
   g.fillStyle='#fff0d6';g.fillRect(x+4,y-17,7,14);g.fillRect(x+13,y-17,7,14);
  }else if(kind==='tidy'){
   g.fillStyle='#9d7d67';g.fillRect(x,y-13,21,15);
   g.fillStyle='#c0a07b';g.fillRect(x+3,y-17,16,6);
   g.fillStyle='#98bba1';g.fillRect(x+6,y-11,10,9);
  }else if(kind==='meal'){
   g.fillStyle='#f2ddbc';g.fillRect(x,y-14,22,15);
   g.fillStyle='#a8bcae';g.fillRect(x+3,y-10,16,6);
   g.fillStyle='#c28b85';g.fillRect(x+9,y-17,5,6);
  }else{
   g.fillStyle='#efd6b6';g.fillRect(x,y-17,21,17);
   g.fillStyle='#ca879a';g.fillRect(x+3,y-21,4,21);
   g.fillStyle='#89aac2';g.fillRect(x+11,y-20,5,19);
  }
  g.restore();return true;
 }
 return {clean:info,profile,completed,adjustPose,panel,drawHome,drawParticipation};
}
root.HearthPipHomeRhythms={clean,setup,favorite,TRAITS,KINDS};
})(window);

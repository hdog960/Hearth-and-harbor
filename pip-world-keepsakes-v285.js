/* Hearth & Harbor v2.8.5 — Living Neighborhood Keepsakes
 * World-local craft art, genuine three-person craft motions, truthful
 * inspection and zero additional save data. Older helper receipts are the
 * only source of permanent town decorations. No menu-only rewards.
 */
(function(root){'use strict';
const SITE={
 mabel:{x:733,y:512,kind:'flag'},
 rosie:{x:600,y:817,kind:'basket'},
 oliver:{x:1008,y:603,kind:'recipe'},
 jun:{x:502,y:1111,kind:'story'},
 bea:{x:837,y:919,kind:'paint'},
 finn:{x:1095,y:1199,kind:'pond'}
};
const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const validDay=x=>Number.isInteger(x)&&x>=1&&x<=9999;
const finite=Number.isFinite,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function trusted(child,now){
 if(!obj(child)||child.guardian!=='player'||!validDay(child.guardianDay)||
   child.guardianDay>now||!Array.isArray(child.helperProjects))return [];
 const count=obj(child.mentor?.counts)?child.mentor.counts:{};
 return root.HearthPipHelpers.clean(child.helperProjects).filter(r=>
   r.day>=child.guardianDay&&r.day<=now&&
   Number.isInteger(count[r.id])&&count[r.id]>=1&&
   root.HearthPipGrowth.lifeStage(child,r.day)>=1);
}
function setup(api){
 const getState=()=>api.getState(),child=()=>api.getChild();
 const now=()=>validDay(getState().day)?getState().day:1;
 const records=()=>trusted(child(),now());
 const helper=()=>api.getHelper?.();
 let cachedKey='',cached=[],celebration=null;
 function displays(){
  if(api.getScene?.()!=='town')return [];
  const list=records(),first=new Map();
  for(const r of list)if(!first.has(r.id))first.set(r.id,r);
  const key=[now(),...first.values()].map(r=>typeof r==='number'?r:r.id+':'+r.day+':'+r.plan+':'+r.finish).join('|');
  if(key===cachedKey)return cached;
  const arr=[];
  for(const [id,record] of first){
   const site=SITE[id],def=root.HearthPipHelpers.PROJECTS[id];
   if(!site||!def)continue;
   let p=api.isWalkable?.(site.x,site.y,'town')===true?{x:site.x,y:site.y}:api.nearestWalkable?.(site,'town');
   if(!p||!finite(p.x)||!finite(p.y)||dist(site,p)>105||
     api.isWalkable?.(p.x,p.y,'town')!==true)continue;
   arr.push({type:'pip-keepsake',id,x:Math.round(p.x),y:Math.round(p.y),
    day:record.day,plan:record.plan,finish:record.finish,kind:site.kind});
  }
  cached=arr;cachedKey=key;
  return cached;
 }
 function hit(x,y){
  if(!finite(x)||!finite(y)||api.getScene?.()!=='town')return null;
  return displays().find(p=>Math.abs(x-p.x)<=35&&Math.abs(y-(p.y-36))<=48)||null;
 }
 function approach(id){
  const p=displays().find(x=>x.id===id);
  if(!p)return null;
  const dest=api.nearestWalkable?.({x:p.x+52,y:p.y+28},'town');
  return dest&&finite(dest.x)&&finite(dest.y)&&dist(p,dest)<=108&&api.isWalkable?.(dest.x,dest.y,'town')===true?dest:null;
 }
 function inspect(id){
  const p=displays().find(x=>x.id===id),n=api.getPlayer?.();
  if(!p||!n||!finite(n.x)||!finite(n.y)||dist(p,n)>112||
     api.getScene?.()!=='town')return false;
  const d=root.HearthPipHelpers.PROJECTS[id];
  const who=api.name?.(id)||id;
  api.showModal?.('little-sprouts','<section class="ls272-book pw285-card"><div class="ls272-cover"><small>MAPLEWOOD · A REAL NEIGHBORHOOD KEEPSAKE</small><h2>'+
   d.icon+' '+esc(d.name)+'</h2><p>Day '+p.day+' · Made together by Poppy, Pip and '+esc(who)+'.</p></div>'+
   '<div class="pw285-memory"><span>✎ Their idea</span><strong>'+esc(d.first[p.plan])+'</strong>'+
   '<span>✿ What Pip remembers</span><strong>'+esc(d.last[p.finish])+'</strong>'+
   '<p>'+esc(d.closing[p.finish])+'</p></div>'+
   '<p>This little work stays in Maplewood because your characters finished it in the real village. Visiting again is simply a memory, not a free reward.</p>'+
   '<button data-act="pw285-close">Back to Maplewood</button></section>');
  return true;
 }
 function handle(action){
  if(action==='pw285-close'){api.closeModal?.();return true}
  return false;
 }
 const active=()=>{
  if(api.getScene?.()!=='town')return null;
  const s=helper()?.session;
  if(!s||s.phase!=='work'||s.day!==now()||!SITE[s.id]||
    !Array.isArray(s.spots)||s.step<0||s.step>1)return null;
  const a=(api.getAdults?.()||[]).find(n=>n.id===s.id&&finite(n.x)&&finite(n.y));
  const p=api.getPlayer?.(),c=api.getChildPosition?.(),point=s.spots[s.step];
  if(!a||!p||!c||!point||!finite(point.x)||!finite(point.y)||
    !finite(p.x)||!finite(p.y)||!finite(c.x)||!finite(c.y)||
    dist(a,s.origin)>165||dist(a,p)>180||dist(a,c)>180||
    dist(p,c)>185||dist(p,point)>105||dist(c,point)>135)return null;
  return {id:s.id,point,adult:a,player:p,child:c,step:s.step,color:root.HearthPipHelpers.PROJECTS[s.id].colors[s.step]};
 };
 function roleCue(role,id){
  const a=active();if(!a)return null;
  if(role==='adult'&&id===a.id)return a;
  if(role==='player'||role==='child')return a;
  return null;
 }
 function actorMood(role,id){return !!roleCue(role,id)}
 function drawActor(g,role,id,pos,tick=0){
  const c=roleCue(role,id);
  if(!g||!c||!pos||!finite(pos.x)||!finite(pos.y))return false;
  const shift=Math.round(Math.sin(tick*8+(role==='child'?1.7:role==='adult'?3.1:0))*3);
  const x=Math.round(pos.x),y=Math.round(pos.y),short=role==='child';
  // These paper-and-hand motions are anchored to the ACTUAL actors,
  // not detached UI icons or teleporting shadow characters.
  g.save();
  const ox=role==='adult'?-25:25,py=short?-51:-73;
  g.fillStyle='#5d5360';g.fillRect(x+ox-9,y+py+shift,20,5);
  g.fillStyle='#e8bf94';g.fillRect(x+ox-10,y+py+shift-5,7,10);
  g.fillStyle=c.color;g.fillRect(x+ox-3,y+py+shift-7,16,14);
  g.fillStyle='#fff0cf';g.fillRect(x+ox,y+py+shift-4,10,7);
  g.fillStyle='#8b655e';g.fillRect(x+ox+4,y+py+shift-4,3,7);
  if(Math.sin(tick*6+ox)>-.2){
   g.fillStyle='#fff0b3';g.fillRect(x+ox+12,y+py+shift-18,5,5);
   g.fillRect(x+ox+17,y+py+shift-9,3,3);
  }
  g.restore();return true;
 }
 function drawDisplay(g,p,tick=0){
  if(!g||!p||!SITE[p.id]||!root.HearthPipHelpers.PROJECTS[p.id])return false;
  const d=root.HearthPipHelpers.PROJECTS[p.id],x=Math.round(p.x),y=Math.round(p.y);
  const wave=Math.round(Math.sin(tick*1.8+p.x*.01)*2);
  g.save();
  g.fillStyle='#355d4c66';g.fillRect(x-26,y-3,52,8);
  g.fillStyle='#795e55';g.fillRect(x-19,y-12,38,9);
  g.fillStyle='#a98669';g.fillRect(x-16,y-17,32,7);
  if(p.kind==='flag'||p.kind==='story'){
   g.fillStyle='#73566a';g.fillRect(x-2,y-72,5,60);
   g.fillStyle=d.colors[p.plan];g.fillRect(x+3,y-70+wave,29,23);
   g.fillStyle='#fff2cf';g.fillRect(x+6,y-67+wave,21,16);
   if(p.kind==='flag'){
    g.fillStyle='#c76a87';g.fillRect(x+13,y-64+wave,6,6);g.fillRect(x+9,y-58+wave,14,4);
    g.fillStyle='#6c936f';g.fillRect(x+15,y-54+wave,3,5);
   }else{
    g.fillStyle='#6c769d';g.fillRect(x+12,y-63+wave,11,3);g.fillRect(x+10,y-57+wave,16,3);
    g.fillRect(x+13,y-51+wave,10,3);
   }
  }else if(p.kind==='basket'){
   g.fillStyle=d.colors[0];g.fillRect(x-19,y-40,38,25);
   g.fillStyle='#725d53';g.fillRect(x-13,y-47,5,9);g.fillRect(x+9,y-47,5,9);g.fillRect(x-9,y-49,17,4);
   g.fillStyle='#f4ca79';g.fillRect(x-12,y-35,9,9);g.fillRect(x+5,y-32,8,8);
   g.fillStyle='#bf666e';g.fillRect(x-1,y-36,7,8);
   g.fillStyle=d.colors[1];g.fillRect(x-5,y-49,10,6);
  }else if(p.kind==='recipe'){
   g.fillStyle='#785d57';g.fillRect(x-17,y-52,34,42);
   g.fillStyle='#fff0d1';g.fillRect(x-13,y-49,26,33);
   g.fillStyle='#ad7b65';g.fillRect(x-9,y-44,18,3);
   g.fillStyle=d.colors[0];g.fillRect(x-9,y-37,18,9);
   g.fillStyle='#c08c65';g.fillRect(x-9,y-24,18,3);
  }else if(p.kind==='paint'){
   g.fillStyle='#785b62';g.fillRect(x-16,y-54,32,42);g.fillRect(x-3,y-12,6,12);
   g.fillStyle='#f3e5ca';g.fillRect(x-12,y-51,24,32);
   const cols=[d.colors[0],d.colors[1],'#87a9ba','#a5bc8f'];
   cols.forEach((c,i)=>{g.fillStyle=c;g.fillRect(x-9+(i%2)*11,y-47+Math.floor(i/2)*12,9,10)});
  }else if(p.kind==='pond'){
   g.fillStyle='#6e5a53';g.fillRect(x-3,y-65,6,53);
   g.fillStyle=d.colors[0];g.fillRect(x-23,y-65,47,30);
   g.fillStyle='#e2f3d9';g.fillRect(x-19,y-61,39,22);
   g.fillStyle='#558f93';g.fillRect(x-14,y-57,28,6);g.fillRect(x-10,y-48,21,3);
   g.fillStyle='#72a786';g.fillRect(x+9,y-44,6,5);
  }
  g.fillStyle='#fff5d0';g.fillRect(x-4,y-10,8,4);
  g.restore();return true;
 }
 function completed(record){
  if(!obj(record)||!SITE[record.id]||!validDay(record.day)||record.day!==now()||
    !records().some(r=>r.day===record.day&&r.id===record.id))return false;
  const p=(api.getPlayer?.()||{});
  if(!finite(p.x)||!finite(p.y))return false;
  celebration={id:record.id,day:record.day,x:p.x,y:p.y,seconds:4.5};
  cachedKey=''; // make the new persistent real art appear immediately.
  return true;
 }
 function advance(dt){
  if(!celebration)return;
  if(api.getScene?.()!=='town'||now()!==celebration.day){
   celebration=null;return;
  }
  if(!finite(dt)||dt<=0||api.isPaused?.())return;
  celebration.seconds=Math.max(0,celebration.seconds-Math.min(dt,.20));
  if(celebration.seconds===0)celebration=null;
 }
 function drawCelebration(g,tick=0){
  if(!g||!celebration||api.getScene?.()!=='town')return false;
  g.save();
  const d=root.HearthPipHelpers.PROJECTS[celebration.id];
  for(let i=0;i<9;i++){
   const angle=i*6.28318/9+tick*.9,r=23+(4.5-celebration.seconds)*21;
   const x=Math.round(celebration.x+Math.cos(angle)*r),y=Math.round(celebration.y-78+Math.sin(angle)*r*.42);
   g.fillStyle=i%2?d.colors[0]:'#fff0c2';g.fillRect(x,y,6,6);
  }
  g.restore();return true;
 }
 return {trusted:records,displays,hit,approach,inspect,handle,active,actorMood,drawActor,drawDisplay,
  drawCelebration,completed,advance,get celebration(){return celebration}};
}
root.HearthPipWorldKeepsakes={setup,trusted,SITE};
})(window);

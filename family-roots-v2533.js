/* Hearth & Harbor v2.5.33 — Family Roots
 * Existing marriages stay authoritative. Chosen family is earned, optional,
 * non-romantic and independent of shared housing or future bloodline data.
 * No fabricated children, parents, age stages or background rewards.
 */
(function(root){'use strict';
const IDS=['mabel','rosie','oliver','jun','bea','finn'],HOMES=['h0','h1','h2','h3','h4','h5'];
const VALID_PROJECTS=['morning','story','evening'];
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const obj=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const dayOK=d=>Number.isInteger(d)&&d>=1&&d<=9999;
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const pair=ids=>ids.slice().sort().join('|');
const split=k=>typeof k==='string'?k.split('|'):[];
const validPair=k=>{const ids=split(k);return ids.length===2&&ids[0]!==ids[1]&&IDS.includes(ids[0])&&IDS.includes(ids[1])&&pair(ids)===k};
function clean(raw){
 const src=obj(raw)?raw:{},chosen={},careDay={},history=[];
 for(const [key,row] of Object.entries(obj(src.chosen)).slice(0,30)){
  if(!validPair(key)||!obj(row)||!dayOK(row.day)||!HOMES.includes(row.home)||!['active','ended'].includes(row.status))continue;
  const end=row.status==='ended'&&dayOK(row.endedDay)&&row.endedDay>=row.day?row.endedDay:0;
  if(row.status==='ended'&&!end)continue;
  chosen[key]={day:row.day,home:row.home,status:row.status,endedDay:end};
 }
 for(const [key,day] of Object.entries(obj(src.careDay)).slice(0,30))if(validPair(key)&&dayOK(day))careDay[key]=day;
 if(Array.isArray(src.history))for(const m of src.history.slice(-80)){
  if(!obj(m)||!validPair(m.key)||!HOMES.includes(m.home)||!dayOK(m.day)||!['pledge','release'].includes(m.kind))continue;
  if(history.some(x=>x.key===m.key&&x.day===m.day&&x.kind===m.kind))continue;
  history.push({key:m.key,home:m.home,day:m.day,kind:m.kind});
 }
 return {chosen,careDay,history:history.slice(-30)};
}
function setup(api){
 const state=()=>api.getState();
 const data=()=>{
  const s=state();
  if(!obj(s.familyRoots)||!obj(s.familyRoots.chosen)||!obj(s.familyRoots.careDay)||!Array.isArray(s.familyRoots.history))s.familyRoots=clean(s.familyRoots);
  return s.familyRoots;
 };
 const currentHome=id=>IDS.includes(id)?api.getResidentHome?.(id):null;
 const occupants=home=>HOMES.includes(home)?[...new Set((api.getHomeMembers?.(home)||[]).filter(id=>IDS.includes(id)&&currentHome(id)===home))].slice(0,2):[];
 const name=id=>esc(api.getPersonLabel?.(id)||id);
 const homeName=h=>esc(api.getHomeLabel?.(h)||h);
 const weddings=()=>obj(state().weddingPlans)?state().weddingPlans:{};
 const spouse=key=>validPair(key)&&weddings()[key]?.status==='married'&&dayOK(weddings()[key]?.marriedDay)?weddings()[key]:null;
 const chosen=key=>validPair(key)?data().chosen[key]||null:null;
 const isActive=key=>chosen(key)?.status==='active';
 function sharedDays(key){
  if(!validPair(key))return 0;
  const ids=split(key),events=state().roommateProjects?.history;
  if(!Array.isArray(events))return 0;
  const days=new Set();
  for(const e of events){
   if(!obj(e)||!HOMES.includes(e.home)||!dayOK(e.day)||e.day>state().day||!VALID_PROJECTS.includes(e.project)||
    !Array.isArray(e.pair)||e.pair.length!==2||!e.pair.every(id=>IDS.includes(id)))continue;
   if(pair(e.pair)===key)days.add(e.day);
  }
  return days.size;
 }
 const bond=key=>clamp(Number.isFinite(state().townBonds?.[key])?state().townBonds[key]:0,0,100);
 const tension=key=>clamp(Number.isFinite(state().townTensions?.[key])?state().townTensions[key]:0,0,100);
 function eligibility(home){
  const members=occupants(home);
  if(members.length!==2||!dayOK(state().day))return {ok:false,reason:'Two real residents need to share this home.',key:null};
  const key=pair(members);
  if(spouse(key))return {ok:false,reason:'These partners already share a marriage promise.',key};
  if(isActive(key))return {ok:false,reason:'These two are already chosen family.',key};
  if(tension(key)>=8)return {ok:false,reason:'Their current tension needs some time and care first.',key};
  const count=sharedDays(key);
  if(count<2)return {ok:false,reason:'Complete two shared roommate projects on different in-game days ('+count+'/2).',key};
  if(bond(key)<4)return {ok:false,reason:'Their bond needs to reach four friendship points ('+bond(key)+'/4).',key};
  return {ok:true,reason:'Two days of cooperation have made this a family they chose.',key};
 }
 function pledge(home){
  const e=eligibility(home);if(!e.ok)return false;
  const d=data(),was=d.chosen[e.key];
  if(was?.day===state().day)return false; // prevents instant same-day toggles
  d.chosen[e.key]={day:state().day,home,status:'active',endedDay:0};
  d.history.push({key:e.key,home,day:state().day,kind:'pledge'});
  d.history=d.history.slice(-30);
  api.save?.();api.updateUI?.();
  const ids=split(e.key);
  api.notify?.('🌿 '+ids.map(name).join(' and ')+' chose to be family. Their promise will be remembered.');
  return true;
 }
 function release(home){
  const members=occupants(home),key=members.length===2?pair(members):null;
  return releaseLink(key);
 }
 function releaseLink(key){
  if(!validPair(key)||!isActive(key)||!dayOK(state().day))return false;
  const record=data().chosen[key],home=record.home;
  if(record.day===state().day)return false;
  record.status='ended';record.endedDay=state().day;
  data().history.push({key,home,day:state().day,kind:'release'});
  data().history=data().history.slice(-30);
  api.save?.();api.updateUI?.();
  api.notify?.('Their chosen-family promise has ended. The earlier memories remain in the family record.');
  return true;
 }
 // Called solely after the existing genuine first completion of "chat".
 // The original in-home action still owns the save/update, never this bonus.
 function completedChat(home,id,first=true,day=state().day){
  if(!first||!dayOK(day)||day!==state().day||!HOMES.includes(home)||!IDS.includes(id))return false;
  const members=occupants(home);
  if(members.length!==2||!members.includes(id))return false;
  const key=pair(members);
  if(!isActive(key)||spouse(key)||data().careDay[key]===day)return false;
  const a=api.getNeeds?.(members[0]),b=api.getNeeds?.(members[1]);
  if(!obj(a)||!obj(b))return false;
  data().careDay[key]=day;
  for(const needs of [a,b])needs.social=clamp((Number.isFinite(needs.social)?needs.social:0)+4,0,100);
  if(!obj(state().townBonds))state().townBonds={};
  state().townBonds[key]=clamp(bond(key)+1,0,100);
  if(obj(state().townTensions)&&Number.isFinite(state().townTensions[key])&&state().townTensions[key]>0)
   state().townTensions[key]=clamp(state().townTensions[key]-1,0,100);
  return {key,day,home};
 }
 function cards(){
  const rows=[];
  for(const home of HOMES){
   const members=occupants(home),current=members.length===2?pair(members):null;
   const e=current?eligibility(home):null,married=current?spouse(current):null,chosenLink=current?chosen(current):null;
   const relationship=members.length===2?(married?'Married partners · since Day '+married.marriedDay:
    isActive(current)?'Chosen family · since Day '+chosenLink.day:
    'Housemates · '+sharedDays(current)+' shared project days'):members.length===1?'One resident at home':'A quiet, unoccupied home';
   const badge=members.map(id=>'<span class="fr33-person"><span class="fr33-face">✿</span><strong>'+name(id)+'</strong></span>').join('<span class="fr33-link" aria-hidden="true">⌁</span>');
   const actions=members.length===2&&!married?(
    isActive(current)?'<button data-act="fr33-release" data-id="'+home+'" '+(chosenLink.day===state().day?'disabled':'')+'>End chosen-family promise</button>':
    '<button data-act="fr33-pledge" data-id="'+home+'" '+(e.ok?'':'disabled')+'>🌿 Promise to be chosen family</button><small>'+esc(e.reason)+'</small>'):'';
   rows.push('<article class="fr33-house"><h3>'+homeName(home)+'</h3><div class="fr33-members">'+(badge||'<span class="fr33-empty">A little empty home</span>')+'</div><p>'+esc(relationship)+'</p>'+actions+'</article>');
  }
  return rows.join('');
 }
 function history(){
  // Marriage is derived from authoritative existing wedding save data,
  // not written again as a second conflicting relationship.
  const married=Object.entries(weddings()).filter(([k])=>!!spouse(k))
   .map(([key,w])=>({key,day:w.marriedDay,kind:'wedding'}));
  return [...data().history,...married].sort((a,b)=>b.day-a.day).slice(0,20);
 }
 function board(){
  const links=history().map(m=>{
   const ids=split(m.key),title=m.kind==='wedding'?'Married in Maplewood':m.kind==='pledge'?'A family chosen together':'A promise gently released';
   return '<li><b>Day '+m.day+'</b> · '+title+' · '+ids.map(name).join(' & ')+(m.kind==='pledge'&&isActive(m.key)&&chosen(m.key)?.day===m.day?'<button data-act="fr33-unbind" data-id="'+m.key+'" '+(m.day===state().day?'disabled':'')+'>End this promise (connection history remains)</button>':'')+'</li>';
  }).join('');
  api.showModal?.('family-roots','<section class="fr33-book"><header class="fr33-cover"><small>OUR PEOPLE · OUR PROMISES</small><h2>🌿 Family Roots</h2><p>Families take different shapes. The family record honors actual marriages, the people sharing a home, and bonds two friends deliberately choose after working together.</p></header><div class="fr33-grid">'+cards()+'</div><section class="fr33-history"><h3>Our family connections</h3><ul>'+(links||'<li>The first family connections are still growing.</li>')+'</ul></section><p class="fr33-note">Only real married partners are marked as spouses. Chosen family is never a blood relationship, romance, child or inheritance claim. Two different days of genuine joint projects and an existing friendship are needed before the optional promise. Afterwards, one real daily chat between co-residents helps both feel connected; viewing this book never changes anyone’s needs.</p><button data-act="fr33-back">Return to the Daybook</button></section>');
 }
 function handle(action,id){
  if(action==='fr33-pledge'&&HOMES.includes(id))pledge(id);
  else if(action==='fr33-release'&&HOMES.includes(id))release(id);
  else if(action==='fr33-unbind'&&validPair(id))releaseLink(id);
  else if(action==='fr33-back')return api.back?.();
  else if(action!=='fr33-board')return false;
  board();return true;
 }
 function draw(g,home){
  const members=occupants(home);
  if(members.length!==2||!isActive(pair(members)))return;
  g.save();g.translate(576,236);
  // A physically rendered paired-leaf ribbon in the actual room.
  g.fillStyle='#80624f';g.fillRect(-73,-18,146,32);
  g.fillStyle='#f5ddad';g.fillRect(-69,-15,138,26);
  g.fillStyle='#e7f0d4';g.fillRect(-64,-11,128,18);
  g.strokeStyle='#608b76';g.lineWidth=2;g.beginPath();g.moveTo(0,3);g.lineTo(0,-6);g.stroke();
  for(const x of [-13,13]){
   g.fillStyle=x<0?'#92bd92':'#b1c6a5';g.beginPath();g.ellipse(x,-4,17,8,x<0?-.35:.35,0,6.283);g.fill();
   g.fillStyle='#fcf4e1';g.beginPath();g.arc(x,-4,2,0,6.283);g.fill();
  }
  g.fillStyle='#8f6f56';g.font='bold 8px system-ui';g.textAlign='center';g.fillText('CHOSEN FAMILY',0,11);
  g.restore();
 }
 return {clean,board,handle,pledge,release,completedChat,eligibility,sharedDays,occupants,history,draw,
  get data(){return data()}};
}
root.HearthFamilyRoots={clean,setup,IDS,HOMES,validPair};
})(window);

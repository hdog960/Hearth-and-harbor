/* Hearth & Harbor v2.5.16 — Thoughtful Households.
 * Residents choose practical, personality-aware tasks and remember acts of care.
 * All real activity completion remains in game.js; this module never invents work.
 */
(function(root){'use strict';
const PEOPLE=['mabel','rosie','oliver','jun','bea','finn'];
const ACTIONS=['rest','meal','chat','hobby','read','tidy'];
const OWN=(obj,key)=>Object.prototype.hasOwnProperty.call(obj,key);
const valid=o=>o!==null&&typeof o==='object'&&!Array.isArray(o);
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const PERSONALITY={
 mabel:{title:'Gentle gardener',preferred:'hobby',comfort:'Soft flowers, a peaceful routine',icon:'🌷'},
 rosie:{title:'Warm host',preferred:'chat',comfort:'Food, friendship and lively company',icon:'🍎'},
 oliver:{title:'Thoughtful cook',preferred:'meal',comfort:'Cooking and caring for the household',icon:'🥐'},
 jun:{title:'Quiet storyteller',preferred:'read',comfort:'Books, inspiration and time to reflect',icon:'📖'},
 bea:{title:'Imaginative artist',preferred:'hobby',comfort:'A lovely corner for little creations',icon:'🎨'},
 finn:{title:'Easygoing maker',preferred:'hobby',comfort:'Hobbies and plenty of breathing room',icon:'🐟'}
};
const NAMES={mabel:'Mabel',rosie:'Rosie',oliver:'Oliver',jun:'Jun',bea:'Bea',finn:'Finn'};
const NARRATIVE={
 chat:{icon:'💗',label:'A kind conversation',verb:'listened to each other'},
 meal:{icon:'🥣',label:'A little kitchen kindness',verb:'shared a simple homemade meal'},
 tidy:{icon:'🌿',label:'A home cared for together',verb:'made their home feel lovely'}
};
const pairKey=(a,b)=>[a,b].sort().join('|');
function clean(input){
 const src=valid(input)?input:{},daily={},memories=[];
 if(valid(src.daily))for(const [pair,day] of Object.entries(src.daily)){
  const ids=pair.split('|');
  if(ids.length!==2||!PEOPLE.includes(ids[0])||!PEOPLE.includes(ids[1])||ids[0]>=ids[1])continue;
  if(!Number.isInteger(day)||day<1||day>9999)continue;
  daily[pair]=day;
 }
 if(Array.isArray(src.memories))for(const x of src.memories.slice(-100)){
  if(!valid(x)||!Number.isInteger(x.day)||x.day<1||x.day>9999||!PEOPLE.includes(x.actor)||!PEOPLE.includes(x.other)||x.actor===x.other||!OWN(NARRATIVE,x.action))continue;
  const pair=pairKey(x.actor,x.other);
  if(memories.some(m=>m.day===x.day&&pairKey(m.actor,m.other)===pair))continue;
  memories.push({day:x.day,actor:x.actor,other:x.other,action:x.action});
 }
 return {daily:Object.fromEntries(Object.entries(daily).slice(-15)),memories:memories.slice(-30)};
}
function intention({id,needs,done=[],minute=720,roommate=false,aspiration=null,shared=false}={}){
 if(!PEOPLE.includes(id))return {action:'read',reason:'A quiet moment is welcome'};
 const n=valid(needs)?needs:{};
 const need=(k)=>Number.isFinite(n[k])?clamp(n[k],0,100):60;
 const completed=Array.isArray(done)?done:[];
 if(need('energy')<44)return {action:'rest',reason:'Energy is low — rest comes before ambitions',priority:'care'};
 if(need('food')<46)return {action:'meal',reason:'Hungry — a home meal comes first',priority:'care'};
 if(roommate&&need('social')<44)return {action:'chat',reason:'Feeling lonely — time with a housemate matters',priority:'care'};
 if(need('fun')<40)return {action:completed.includes('hobby')?'read':'hobby',reason:'Needs a restorative creative break',priority:'care'};
 // A genuine outstanding aspiration step is prioritized, but never interrupts urgent needs.
 if(aspiration&&ACTIONS.includes(aspiration.action)&&!completed.includes(aspiration.action)){
  if(aspiration.action==='chat'&&!roommate)return {action:'read',reason:'Enjoying a peaceful book until company is available',priority:'gentle'};
  return {action:aspiration.action,reason:'Working toward '+String(aspiration.label||'a personal dream').slice(0,55),priority:'dream'};
 }
 if(roommate&&!shared&&!completed.includes('chat')&&minute>=9*60&&minute<21*60)
  return {action:'chat',reason:'Making a little time for someone at home',priority:'bond'};
 const p=PERSONALITY[id];
 if(!completed.includes(p.preferred))return {action:p.preferred,reason:p.comfort,priority:'personality'};
 if(!completed.includes('tidy'))return {action:'tidy',reason:'A little care keeps the room welcoming',priority:'home'};
 if(!completed.includes('read'))return {action:'read',reason:'A quiet chapter between responsibilities',priority:'home'};
 if(minute>=21*60||minute<7*60)return {action:'rest',reason:'Winding down for the evening',priority:'care'};
 return {action:['rest','hobby','meal','read'][(Math.floor(minute/150)+id.length)%4],
  reason:'A relaxed repeat after a satisfying day',priority:'gentle'};
}
function setup(api){
 const {getState,save,updateUI,notify,getResidents,getAspiration}=api;
 const state=()=>getState();
 function record(){
  const s=state();
  if(!valid(s.householdRhythms)||!valid(s.householdRhythms.daily)||!Array.isArray(s.householdRhythms.memories))s.householdRhythms=clean(s.householdRhythms);
  return s.householdRhythms;
 }
 const todayPair=(a,b)=>record().daily[pairKey(a,b)]===state().day;
 function plan(n,done=[]){
  const residents=getResidents();
  const other=residents.find(o=>o.id!==n.id);
  const aspiration=getAspiration(n.id);
  return intention({id:n.id,needs:state().residentLife[n.id]?.needs,
   done,minute:state().minute,roommate:!!other,
   aspiration,shared:other?todayPair(n.id,other.id):false});
 }
 function complete(id,kind){
  const people=getResidents();
  if(!PEOPLE.includes(id)||!NARRATIVE[kind]||!Number.isInteger(state().day)||state().day<1||state().day>9999)return false;
  if(!people.some(p=>p.id===id))return false;
  const roommate=people.find(p=>p.id!==id);
  if(!roommate||todayPair(id,roommate.id))return false;
  const s=state(),r=record(),pair=pairKey(id,roommate.id);
  r.daily[pair]=s.day;
  r.memories.push({day:s.day,actor:id,other:roommate.id,action:kind});
  r.memories=r.memories.slice(-30);
  const a=s.residentLife?.[id]?.needs,b=s.residentLife?.[roommate.id]?.needs;
  if(a){a.social=clamp((a.social||0)+5,0,100);a.fun=clamp((a.fun||0)+3,0,100)}
  if(b){b.social=clamp((b.social||0)+7,0,100);b.fun=clamp((b.fun||0)+3,0,100)}
  if(!valid(s.townBonds))s.townBonds={};
  if(!valid(s.townTensions))s.townTensions={};
  s.townBonds[pair]=clamp((s.townBonds[pair]||0)+2,0,100);
  s.townTensions[pair]=clamp((s.townTensions[pair]||0)-2,0,100);
  notify(NARRATIVE[kind].icon+' '+NAMES[id]+' and '+NAMES[roommate.id]+' '+NARRATIVE[kind].verb+'. A shared memory was made!');
  // The caller owns save and updateUI; no extra writes or rewards are generated.
  return true;
 }
 function panel(){
  const r=record(),residents=getResidents();
  const persons=residents.map(n=>{
   const p=plan(n,api.getDone(n.id)),profile=PERSONALITY[n.id],icon={rest:'💤',meal:'🥣',chat:'💗',read:'📚',hobby:profile.icon,tidy:'🧹'}[p.action];
   return '<div class="rh-person"><span class="rh-icon">'+profile.icon+'</span><div><b>'+NAMES[n.id]+' · '+profile.title+'</b><small>'+icon+' Next: '+({rest:'Rest',meal:'Eat',chat:'Connect',read:'Read',hobby:'Favorite hobby',tidy:'Tidy'}[p.action])+'</small><p>'+p.reason+'</p></div></div>';
  }).join('');
  const stories=r.memories.slice().reverse().filter(x=>residents.some(n=>n.id===x.actor||n.id===x.other)).slice(0,8).map(x=>
   '<div class="rh-memory"><span>'+NARRATIVE[x.action].icon+'</span><p><b>'+NAMES[x.actor]+' and '+NAMES[x.other]+'</b> '+NARRATIVE[x.action].verb+' <small>· Day '+x.day+'</small></p></div>').join('');
  return '<section class="rh-board"><div class="rh-kicker">THE LITTLE THINGS WE DO FOR ONE ANOTHER</div><h3>💗 Household Rhythms</h3><p>Neighbors care for their needs, follow their own interests, and make progress toward personal dreams. When they genuinely cook, chat, or tidy together, their relationship creates a memory once a day.</p>'+persons+'<h4>Recent moments together</h4><div class="rh-memories">'+(stories||'<p>There will be little stories to remember as your household grows closer.</p>')+'</div></section>';
 }
 return {plan,complete,panel,record,todayPair};
}
root.HearthHouseholdRhythms={clean,intention,setup,PERSONALITY,ACTIONS,NARRATIVE,PEOPLE};
})(window);

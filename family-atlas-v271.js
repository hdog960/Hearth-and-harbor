/* Hearth & Harbor v2.7.1 — Connections Atlas.
 * Read-only, evidence-based kinship foundation for eventual Generations.
 * A home is not a marriage, chosen family is not ancestry, and no fictional
 * guardians, children, surnames, succession or lineage are inferred.
 */
(function(root){'use strict';
const PEOPLE=['player','mabel','rosie','oliver','jun','bea','finn','pip'];
const ADULTS=PEOPLE.slice(1,-1);
const HOMES=['player','h0','h1','h2','h3','h4','h5'];
const THEMES={story:'Our Storybook Afternoon',hearth:'A Heart-to-Heart',maker:'Made with Love'};
const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const dayOK=x=>Number.isInteger(x)&&x>0&&x<=9999;
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pair=xs=>xs.slice().sort().join('|');
const pairOK=s=>typeof s==='string'&&s.split('|').length===2&&s.split('|').every(x=>ADULTS.includes(x))&&s.split('|')[0]!==s.split('|')[1]&&pair(s.split('|'))===s;
function setup(api){
 const state=()=>api.getState();
 const name=id=>String(api.getPersonLabel?.(id)||(id==='player'?'Poppy':id)).slice(0,38);
 const homeName=home=>String(api.getHomeLabel?.(home)||home).slice(0,60);
 const homeOf=id=>id==='player'?'player':id==='pip'?(api.getYoungResident?.()?.guardian==='player'?'player':null):api.getResidentHome?.(id);
 const today=()=>dayOK(state().day)?state().day:1;
 const residents=home=>home==='player'?['player',...(homeOf('pip')==='player'?['pip']:[])]:ADULTS.filter(id=>homeOf(id)===home);
 function graph(){
  const nodes=PEOPLE.map(id=>({id,home:HOMES.includes(homeOf(id))?homeOf(id):null,label:name(id)}));
  const edges=[],couples=new Set(),now=today(),weddings=obj(state().weddingPlans)?state().weddingPlans:{};
  const chosen=obj(state().familyRoots?.chosen)?state().familyRoots.chosen:{};
  for(const key of Object.keys(weddings).sort()){
   const w=weddings[key];if(!pairOK(key)||!obj(w)||w.status!=='married'||!dayOK(w.marriedDay)||w.marriedDay>now)continue;
   const ids=key.split('|');edges.push({key,ids,kind:'marriage',day:w.marriedDay,active:true});couples.add(key);
  }
  for(const key of Object.keys(chosen).sort()){
   const c=chosen[key];if(!pairOK(key)||!obj(c)||!dayOK(c.day)||c.day>now||!['active','ended'].includes(c.status))continue;
   if(c.status==='active'&&!couples.has(key))edges.push({key,ids:key.split('|'),kind:'chosen',day:c.day,active:true});
  }
  const youth=api.getYoungResident?.();
  if(youth?.guardian==='player'&&dayOK(youth.guardianDay)&&youth.guardianDay<=now)
   edges.push({key:'pip|player',ids:['player','pip'],kind:'guardian',day:youth.guardianDay,active:true});
  // Co-residents form a separate informational edge, never a kinship edge.
  for(const home of HOMES.slice(1)){
   const ids=residents(home);if(ids.length!==2)continue;
   const key=pair(ids);if(!pairOK(key))continue;
   edges.push({key,ids:key.split('|'),kind:'household',day:0,active:true,home});
  }
  return {nodes,edges,households:HOMES.map(home=>({id:home,people:residents(home).slice()}))};
 }
 function events(){
  const g=graph(),out=[],now=today(),chosen=obj(state().familyRoots?.chosen)?state().familyRoots.chosen:{},moves=Array.isArray(state().householdMoves)?state().householdMoves:[];
  for(const edge of g.edges.filter(x=>x.kind==='marriage'))out.push({day:edge.day,kind:'marriage',ids:edge.ids,title:'Married in Maplewood',detail:'An existing completed wedding',home:null});
  for(const [key,c] of Object.entries(chosen)){
   if(!pairOK(key)||!obj(c)||!dayOK(c.day)||c.day>now||!['active','ended'].includes(c.status))continue;
   const ids=key.split('|');out.push({day:c.day,kind:'chosen',ids,title:'A family chosen together',detail:'An earned voluntary promise',home:HOMES.includes(c.home)?c.home:null});
   if(c.status==='ended'&&dayOK(c.endedDay)&&c.endedDay>=c.day&&c.endedDay<=now)
    out.push({day:c.endedDay,kind:'released',ids,title:'A promise gently released',detail:'The memories still remain',home:HOMES.includes(c.home)?c.home:null});
  }
  for(const m of moves.slice(-24)){
   if(!obj(m)||!ADULTS.includes(m.who)||!ADULTS.includes(m.with)||m.who===m.with||!HOMES.slice(1).includes(m.home)||!dayOK(m.day)||m.day>now)continue;
   out.push({day:m.day,kind:'move',ids:[m.who,m.with],title:'A new shared home',detail:'The residents moved into a household',home:m.home});
  }
  const young=api.getYoungResident?.();
  if(young?.guardian==='player'&&dayOK(young.guardianDay)&&young.guardianDay<=now)
   out.push({day:young.guardianDay,kind:'guardian',ids:['player','pip'],title:'A Welcoming Home for Pip',detail:'An explicitly chosen guardianship, not biological parentage',home:'player'});
  for(const home of HOMES.slice(1)){
   const portraits=api.getPortraits?.(home)||[];
   for(const p of portraits){
    if(!obj(p)||!pairOK(p.pair)||!dayOK(p.day)||p.day>now||!Object.prototype.hasOwnProperty.call(THEMES,p.theme))continue;
    out.push({day:p.day,kind:'portrait',ids:p.pair.split('|'),title:THEMES[p.theme],detail:'A real earned family portrait',home});
   }
  }
  const unique=new Set();
  return out.filter(e=>{
   const k=e.day+'|'+e.kind+'|'+pair(e.ids)+'|'+e.title+'|'+(e.home||'');
   if(unique.has(k))return false;unique.add(k);return true;
  }).sort((a,b)=>b.day-a.day||a.kind.localeCompare(b.kind)).slice(0,70);
 }
 const labelKind=kind=>kind==='marriage'?'💍 Married partners':kind==='chosen'?'🌿 Chosen family':kind==='guardian'?'🌱 Chosen guardian':'🏡 Share a home';
 const peopleOf=ids=>ids.map(id=>esc(name(id))).join(' & ');
 const personButton=id=>'<button class="fa271-person-link" data-act="fa271-person" data-id="'+id+'">'+esc(name(id))+'</button>';
 const familyLink=e=>'<div class="fa271-link '+e.kind+'"><span class="fa271-symbol">'+(e.kind==='marriage'?'💍':e.kind==='chosen'?'🌿':e.kind==='guardian'?'🌱':'🏡')+'</span><div><strong>'+peopleOf(e.ids)+'</strong><small>'+labelKind(e.kind)+(e.day?' · since Day '+e.day:' · currently co-residing')+'</small></div><button data-act="fa271-pair" data-id="'+e.key+'">Explore</button></div>';
 const action=(act,id,label)=>'<button class="fa271-action" data-act="'+act+'"'+(id?' data-id="'+id+'"':'')+'>'+label+'</button>';
 function timeline(people=null,home=null,limit=14,requireAll=false){
  const hits=events().filter(e=>(!people||(requireAll?people.every(id=>e.ids.includes(id)):e.ids.some(id=>people.includes(id))))&&(!home||e.home===home)).slice(0,limit);
  return hits.length?hits.map(e=>'<li><strong>Day '+e.day+' · '+esc(e.title)+'</strong><span>'+peopleOf(e.ids)+'</span><small>'+esc(e.detail)+(e.home?' · '+esc(homeName(e.home)):'')+'</small></li>').join(''):'<li class="fa271-empty">No recorded milestones yet. Real play creates the story.</li>';
 }
 function overview(){
  const g=graph(),formal=g.edges.filter(e=>e.kind!=='household'),houses=g.households.map(h=>{
   const ids=h.people;
   return '<div class="fa271-home"><strong>🏡 '+esc(homeName(h.id))+'</strong><p>'+esc(ids.map(name).join(' & ')||'An empty household')+'</p>'+action('fa271-home',h.id,'Open household record')+'</div>';
  }).join('');
  api.showModal?.('family-atlas','<section class="fa271-book"><div class="fa271-cover"><small>GENERATIONS · THE TRUTH OF OUR STORIES</small><h2>🌳 Our Connections Atlas</h2><p>Every connection comes from a marriage, a chosen-family promise, or the actual household. Sharing a roof is never labeled as ancestry or romance.</p></div><div class="fa271-summary"><span>'+g.nodes.length+' known residents</span><span>'+formal.length+' real family bonds</span><span>'+g.households.length+' homes</span></div><h3>People of Maplewood</h3><div class="fa271-people">'+g.nodes.map(p=>personButton(p.id)).join('')+'</div><h3>Connections drawn from real life</h3><div class="fa271-links">'+(formal.length?formal.map(familyLink).join(''):'<p>No marriage or chosen-family connections recorded yet. Roommates remain roommates.</p>')+'</div><h3>Home by home</h3><div class="fa271-homes">'+houses+'</div><h3>Our real timeline</h3><ol class="fa271-timeline">'+timeline()+'</ol>'+action('fa271-portraits','','🖼️ Open Family Portraits')+'</section>');
 }
 function person(id){
  if(!PEOPLE.includes(id))return overview();
  const g=graph(),node=g.nodes.find(n=>n.id===id),active=g.edges.filter(e=>e.ids.includes(id)),proof=active.filter(e=>e.kind!=='household');
  const someone=proof.length?proof.map(familyLink).join(''):'<p>There are no recorded family ties for this person yet.</p>';
  api.showModal?.('family-atlas','<section class="fa271-book"><div class="fa271-cover"><small>THE PEOPLE WE KNOW</small><h2>🌼 '+esc(node.label)+'</h2><p>'+esc(node.home?homeName(node.home):'A visiting young resident')+' · A real resident, not an invented relative.</p></div><h3>Actual family connections</h3>'+someone+'<h3>Where they live</h3><div class="fa271-homes">'+(node.home?action('fa271-home',node.home,'🏡 '+esc(homeName(node.home))):'<p>Home unknown</p>')+'</div><h3>Memories involving '+esc(node.label)+'</h3><ol class="fa271-timeline">'+timeline([id])+'</ol>'+action('fa271-board','','← All connections')+'</section>');
 }
 function home(id){
  if(!HOMES.includes(id))return overview();
  const g=graph(),member=residents(id),connections=g.edges.filter(e=>e.ids.some(x=>member.includes(x)));
  api.showModal?.('family-atlas','<section class="fa271-book"><div class="fa271-cover"><small>ONE HOUSE, MANY STORIES</small><h2>🏡 '+esc(homeName(id))+'</h2><p>Current occupants are facts about housing, not proof of a family relationship.</p></div><h3>Current occupants</h3><div class="fa271-people">'+member.map(personButton).join('')+'</div><h3>Real links</h3><div class="fa271-links">'+(connections.length?connections.map(familyLink).join(''):'<p>Nothing to label as family yet.</p>')+'</div><h3>Memories attached to this home</h3><ol class="fa271-timeline">'+timeline(null,id)+'</ol>'+(id!=='player'?action('fa271-album',id,'🖼️ View portraits in this home'):'')+action('fa271-board','','← All connections')+'</section>');
 }
 function pairPage(key){
  if(!pairOK(key)&&key!=='pip|player')return overview();
  const ids=key.split('|'),g=graph(),edges=g.edges.filter(e=>e.key===key),named=peopleOf(ids);
  api.showModal?.('family-atlas','<section class="fa271-book"><div class="fa271-cover"><small>OUR SHARED CHAPTER</small><h2>🌿 '+named+'</h2><p>Connections are shown only when the original game records support them.</p></div><h3>What connects them?</h3>'+ (edges.length?edges.map(familyLink).join(''):'<p>No current bond. Previous shared memories may remain below.</p>')+'<h3>Genuine past moments</h3><ol class="fa271-timeline">'+timeline(ids,null,20,true)+'</ol><div class="fa271-people">'+ids.map(personButton).join('')+'</div>'+action('fa271-board','','← All connections')+'</section>');
 }
 function portrait(h,index){
  if(!HOMES.slice(1).includes(h)||!Number.isInteger(index)||index<0||index>1)return false;
  const p=(api.getPortraits?.(h)||[])[index];
  if(!obj(p)||!pairOK(p.pair)||!Object.prototype.hasOwnProperty.call(THEMES,p.theme)||!dayOK(p.day))return false;
  api.showModal?.('family-atlas','<section class="fa271-book"><div class="fa271-cover"><small>A REAL MEMORY ON THE WALL</small><h2>🖼️ '+esc(THEMES[p.theme])+'</h2><p>'+peopleOf(p.pair.split('|'))+' · Day '+p.day+' · '+esc(homeName(h))+'</p></div><div class="fa271-memory">This picture was earned by two real household activities. The original relationship is remembered as '+(p.link==='marriage'?'a marriage':'chosen family')+' since Day '+p.linkDay+'. It is a keepsake, not proof of parentage.</div>'+action('fa271-pair',p.pair,'Explore these people')+action('fa271-album',h,'View the household portrait album')+action('fa271-board','','← All connections')+'</section>');
  return true;
 }
 function handle(act,id){
  if(act==='fa271-board')return overview();
  if(act==='fa271-person')return person(id);
  if(act==='fa271-home')return home(id);
  if(act==='fa271-pair')return pairPage(id);
  if(act==='fa271-portraits')return api.openPortraitAlbum?.();
  if(act==='fa271-album'&&HOMES.slice(1).includes(id))return api.openPortraitAlbum?.(id);
  return false;
 }
 return {graph,events,overview,person,home,pairPage,portrait,handle,PEOPLE,HOMES};
}
root.HearthFamilyAtlas={setup,PEOPLE,HOMES};
})(window);

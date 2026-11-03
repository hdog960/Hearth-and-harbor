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
  // Completed real child/neighbor encounters are historical memories, never
  // marriage, parentage, guardianship or proof of an active family relationship.
  const visits=state().youngResidents?.pip?.meetings;
  if(Array.isArray(visits)){
   const visited=new Set();
   for(const m of visits.slice(-100)){
    if(!obj(m)||!ADULTS.includes(m.id)||!dayOK(m.day)||m.day>now||
     !Number.isInteger(m.mask)||m.mask<0||m.mask>3)continue;
    const key=m.day+'|'+m.id;if(visited.has(key))continue;visited.add(key);
    out.push({day:m.day,kind:'child-neighbor',ids:['pip',m.id],
     title:'A little neighbor moment',detail:'Pip met a real nearby resident and finished their two-part activity',home:null});
   }
  }
  // Authentic optional childhood aspiration milestones belong to Pip's real
  // household history, never a biological or marital kinship edge.
  const dreams=state().youngResidents?.pip?.dream;
  if(obj(dreams)&&obj(dreams.achievements)){
   const names={stories:['A Little Tale to Tell','The Storyteller’s Star'],
    kindness:['A Helping Hand','Home’s Little Hero'],
    discover:['First Clover Trail','A World of Wonders']};
   for(const [dream,titles] of Object.entries(names)){
    const entries=dreams.achievements[dream];
    if(!Array.isArray(entries))continue;
    for(const earned of entries.slice(0,2)){
     if(!obj(earned)||![1,2].includes(earned.stage)||!dayOK(earned.day)||earned.day>now)continue;
     out.push({day:earned.day,kind:'child-dream',ids:['player','pip'],
      title:titles[earned.stage-1],detail:'A chapter of Pip’s chosen aspiration was earned through actual care and play',
      home:'player'});
    }
   }
  }
  // Only completed real companion project days become history; unplayed
  // autonomous routines do not magically earn relationship or lineage links.
  const projects=state().youngResidents?.pip?.projects;
  if(Array.isArray(projects)){
   const seen=new Set();
   for(const rec of projects.slice(-24)){
    if(!obj(rec)||!['stories','kindness','discover'].includes(rec.dream)||
     !dayOK(rec.day)||rec.day>now||![1,2].includes(rec.slot)||
     !Number.isInteger(rec.mask)||rec.mask<0||rec.mask>3||seen.has(rec.day))continue;
    seen.add(rec.day);
    const names={stories:'A Shared Story Workshop',kindness:'A Welcome Home Project',discover:'A Tiny Discovery Journal'};
    out.push({day:rec.day,kind:'child-project',ids:['player','pip'],
     title:names[rec.dream],detail:'An actual cottage project completed together',
     home:'player'});
   }
  }
  // Personal, attended childhood guide reflections belong to lived
  // neighborhood history. A trusted village guide is NOT a legal guardian,
  // spouse, blood relative, or independent family connection edge.
  const guided=state().youngResidents?.pip?.mentor?.guided;
  if(Array.isArray(guided)){
   const seen=new Set();
   const titles={mabel:'Flower Notes with Mabel',rosie:'Market Kindness with Rosie',
    oliver:'Bakery Ideas with Oliver',jun:'Bookish Afternoon with Jun',
    bea:'Colors with Bea',finn:'Pond Observations with Finn'};
   for(const rec of guided.slice(-48)){
    if(!obj(rec)||!Object.hasOwn(titles,rec.id)||!dayOK(rec.day)||rec.day>now||
     !['stories','kindness','discover'].includes(rec.focus)||
     !Number.isInteger(rec.mask)||rec.mask<0||rec.mask>3||seen.has(rec.day))continue;
    seen.add(rec.day);
    out.push({day:rec.day,kind:'child-guide',ids:['pip',rec.id],
     title:titles[rec.id],detail:'An actual shared reflection beside a real village guide',
     home:null});
   }
  }
  // Only explicit, dated optional childhood milestones appear as memories.
  // Development is NOT biological aging, parentage, marriage or a new guardian.
  const youth=state().youngResidents?.pip,earnedGrowth=youth?.growth;
  if(youth?.guardian==='player'&&dayOK(youth.guardianDay)&&youth.guardianDay<=now&&obj(earnedGrowth)){
   const first=earnedGrowth.firstDay,second=earnedGrowth.secondDay;
   if(Number.isInteger(earnedGrowth.stage)&&earnedGrowth.stage>=1&&
      dayOK(first)&&first<=now&&first>=youth.guardianDay){
    out.push({day:first,kind:'child-growth',ids:['player','pip'],
     title:'Pip Finds Their Own Feet',
     detail:'A chosen developmental milestone earned through real family and village life',
     home:'player'});
    if(earnedGrowth.stage>=2&&dayOK(second)&&second>=first&&second<=now){
     out.push({day:second,kind:'child-growth',ids:['player','pip'],
      title:'Pip Is Ready for Bigger Adventures',
      detail:'A second optional childhood milestone earned through long-term genuine experiences',
      home:'player'});
    }
   }
  }
  // Only a three-stop real-world Pip adventure followed by its final choice
  // becomes dated neighborhood history; no adult-family or kinship edge.
  const grownAdventures=state().youngResidents?.pip?.adventures;
  if(Array.isArray(grownAdventures)){
   const seen=new Set(),names={
    mabel:['The Pollinator Path',1],rosie:['The Friendly Market Trail',1],
    bea:['Three Colors of Maplewood',1],jun:['The Little Story Trail',2],
    oliver:['The Thoughtful Recipe Hunt',2],finn:['Pondwatch Field Notes',2]};
   for(const r of grownAdventures.slice(-60)){
    if(!obj(r)||!Object.hasOwn(names,r.id)||!dayOK(r.day)||r.day>now||
      r.stage!==names[r.id][1]||![0,1].includes(r.choice)||seen.has(r.day))continue;
    seen.add(r.day);
    out.push({day:r.day,kind:'child-adventure',ids:['pip',r.id],
     title:names[r.id][0],
     detail:'A growing child completed three physical village stops with Poppy and a real neighbor',
     home:null});
   }
  }
  // Neighborhood Helpers: authentic in-town work with Poppy, Pip and one
  // real adult; no fabricated kinship, adult job or passive village payoff.
  const helperChild=state().youngResidents?.pip,helperRows=helperChild?.helperProjects;
  if(helperChild?.guardian==='player'&&dayOK(helperChild.guardianDay)&&helperChild.guardianDay<=now&&Array.isArray(helperRows)){
   const titles={mabel:'Petal Welcome Flags',rosie:'A Neighborly Market Basket',
    oliver:'The Little Recipe Exchange',jun:'The Village Story Pennant',
    bea:'The Kindness Color Swatches',finn:'A Gentle Pond Notice'},used=new Set();
   for(const r of helperRows.slice(-120)){
    if(!obj(r)||!Object.hasOwn(titles,r.id)||!dayOK(r.day)||r.day>now||
      r.day<helperChild.guardianDay||![0,1].includes(r.plan)||![0,1].includes(r.finish)||
      used.has(r.day)||root.HearthPipGrowth.lifeStage(helperChild,r.day)<1)continue;
    used.add(r.day);
    out.push({day:r.day,kind:'child-helper',ids:['player','pip',r.id],
      title:titles[r.id],detail:'Poppy, Pip and a real villager finished two physical craft stops and made shared decisions',
      home:null});
   }
  }
  // Real return visits only after earlier earned projects. This is a
  // dated adult-child village experience, never family parentage/romance.
  const responseChild=state().youngResidents?.pip;
  if(responseChild?.guardian==='player'&&dayOK(responseChild.guardianDay)&&responseChild.guardianDay<=now){
   const projects=root.HearthPipHelpers?.clean?.(responseChild.helperProjects)||[];
   for(const r of (root.HearthPipResponses?.clean?.(responseChild.neighborResponses)||[])){
    const source=projects.find(p=>p.id===r.id&&p.day<r.day&&p.day>=responseChild.guardianDay);
    if(!source||r.day>now||root.HearthPipGrowth.lifeStage(responseChild,source.day)<1)continue;
    out.push({day:r.day,kind:'child-neighbor-response',ids:['player','pip',r.id],
     title:'The Village Remembers · '+root.HearthPipHelpers.PROJECTS[r.id].name,
     detail:'Poppy and Pip returned in person to the completed village keepsake while its real adult maker was present',
     home:null});
   }
  }
  // Poppy's actual visits with Pip and an acquainted adult.
  // A visitor first walked through town to the cottage on a later day.
  // The event was only saved after a real timed home activity and final choice;
  // never add a fictitious parent, household member or marriage edge.
  const guestChild=state().youngResidents?.pip;
  if(guestChild?.guardian==='player'&&dayOK(guestChild.guardianDay)&&
     guestChild.guardianDay<=now&&root.HearthPipHomeVisits?.clean){
   const data=root.HearthPipHomeVisits.clean(guestChild.homeVisits);
   const seen=new Set();
   for(const r of data.memories){
    if(!dayOK(r.day)||r.day>now||r.day<=guestChild.guardianDay||
       !root.HearthPipHomeVisits.VISITS[r.id]||
       seen.has(r.id)||!Array.isArray(guestChild.meetings)||
       !guestChild.meetings.some(m=>m.id===r.id&&dayOK(m.day)&&m.day<r.day))continue;
    seen.add(r.id);
    out.push({day:r.day,kind:'child-cottage-visit',ids:['player','pip',r.id],
     title:'A Real Cottage Visit · '+root.HearthPipHomeVisits.VISITS[r.id].name,
     detail:'Poppy, Pip and the actual neighbor shared a completed household action after meeting at the front door',
     home:'player'});
   }
  }
  // Pip's genuinely initiated shared day: the original timed household
  // activity had to complete with both Poppy and Pip physically present.
  // This is a family-history moment, not an invented kinship edge.
  const ideasChild=state().youngResidents?.pip;
  if(ideasChild?.guardian==='player'&&dayOK(ideasChild.guardianDay)&&
    ideasChild.guardianDay<=now&&root.HearthPipInitiatives?.clean){
   const memories=root.HearthPipInitiatives.clean(ideasChild.childInitiatives,ideasChild.guardianDay).records;
   for(const r of memories){
    if(r.day>now||!root.HearthPipInitiatives.STORIES?.[r.kind])continue;
    out.push({day:r.day,kind:'child-home-initiative',ids:['player','pip'],
     title:'Pip’s Own Little Idea · '+root.HearthPipInitiatives.STORIES[r.kind].name,
     detail:r.choice===0?'Pip proposed and led an actually completed household activity with Poppy':
      'Pip proposed a real household activity and Poppy taught them how to do it together',
     home:'player'});
   }
  }
  // Real chosen family reflections are earned from multiple distinct
  // actual shared childhood days. Never interpret them as legal or
  // biological parentage or as an extra invented adult relationship.
  const bondChild=state().youngResidents?.pip;
  if(bondChild?.guardian==='player'&&dayOK(bondChild.guardianDay)&&
    bondChild.guardianDay<=now&&root.HearthPipFamilyBond?.clean){
   const authored=root.HearthPipFamilyBond.clean(bondChild.familyBond,bondChild.guardianDay).chapters;
   for(const r of authored){
    if(r.day>now||!root.HearthPipFamilyBond.CHAPTERS[r.id])continue;
    const story=root.HearthPipFamilyBond.CHAPTERS[r.id];
    out.push({day:r.day,kind:'child-family-bond',ids:['player','pip'],
     title:'Poppy & Pip · '+story.name,
     detail:'After genuinely shared family days: '+story.after[r.choice],
     home:'player'});
   }
  }
  // A true shared traditional keepsake is a childhood family memory,
  // never legal ancestry, marriage, a fictitious parent or a new guardian.
  const child=state().youngResidents?.pip,keeps=child?.legacyKeepsakes;
  if(child?.guardian==='player'&&dayOK(child.guardianDay)&&child.guardianDay<=now&&Array.isArray(keeps)){
   const tracks={welcome:['The Welcome Ribbon','tidy'],supper:['The Sunday Recipe Card','meal'],
    orchard:['The Orchard Window Print','hobby']},seen=new Set();
   for(const r of keeps.slice(-10)){
    if(!obj(r)||!Object.hasOwn(tracks,r.key)||r.action!==tracks[r.key][1]||
     !dayOK(r.day)||r.day>now||r.day<child.guardianDay||seen.has(r.key))continue;
    const adultDay=state().homeTraditions?.homes?.player?.[r.key]?.completedDay;
    if(!dayOK(adultDay)||adultDay>r.day)continue;
    seen.add(r.key);
    out.push({day:r.day,kind:'child-family-legacy',ids:['player','pip'],
     title:tracks[r.key][0],detail:'Pip and Poppy genuinely completed a household tradition and crafted a shared keepsake',
     home:'player'});
   }
  }
  // A completed wall-to-furniture family ritual is a genuine event, never
  // a new parent, legal tie or marriage edge.
  const resident=state().youngResidents?.pip,rituals=resident?.familyRituals;
  if(resident?.guardian==='player'&&dayOK(resident.guardianDay)&&resident.guardianDay<=now&&Array.isArray(rituals)){
   const recognized={welcome:'A Welcome Worth Remembering',supper:'The Story Behind Sunday Supper',
    orchard:'Our Little Orchard Almanac'},action={welcome:'tidy',supper:'meal',orchard:'hobby'},seen=new Set();
   for(const r of rituals.slice(-65)){
    if(!obj(r)||!Object.hasOwn(recognized,r.key)||!dayOK(r.day)||r.day>now||
     r.day<resident.guardianDay||!Number.isInteger(r.season)||r.season<0||r.season>3||
     ![0,1].includes(r.first)||![0,1].includes(r.last)||seen.has(r.day))continue;
    const craft=resident.legacyKeepsakes?.find(m=>obj(m)&&m.key===r.key&&m.action===action[r.key]&&
     dayOK(m.day)&&m.day<=r.day);
    const house=state().homeTraditions?.homes?.player?.[r.key]?.completedDay;
    if(!craft||!dayOK(house)||house>craft.day)continue;
    seen.add(r.day);
    out.push({day:r.day,kind:'child-family-ritual',ids:['player','pip'],
     title:recognized[r.key],
     detail:'Poppy and Pip physically visited their family keepsake, finished a real cottage activity and remembered the season',
     home:'player'});
   }
  }
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

/* Hearth & Harbor — Town Hearts v2.4.3
   Pure, save-safe resident relationship progression. Intentionally independent of Poppy's romance. */
(function(root){'use strict';
 const VALID=['mabel','rosie','oliver','jun','bea','finn'];
 const validId=id=>VALID.includes(id);
 const pairKey=p=>Array.isArray(p)&&p.length===2&&p.every(validId)&&p[0]!==p[1]?[...p].sort().join('|'):null;
 const clamp=(n,lo,hi)=>Math.min(hi,Math.max(lo,n));
 const number=(n,lo,hi)=>typeof n==='number'&&Number.isFinite(n)?clamp(n,lo,hi):0;
 const STAGES=['friends','curious','courting','partners'];
 function clean(raw){
  const out={};if(!raw||typeof raw!=='object'||Array.isArray(raw))return out;
  for(const [key,value] of Object.entries(raw).slice(0,30)){
   if(!key.includes('|')||pairKey(key.split('|'))!==key||!value||typeof value!=='object'||Array.isArray(value))continue;
   const stage=STAGES.includes(value.stage)?value.stage:'friends';
   out[key]={stage,affection:Math.floor(number(value.affection,0,100)),sharedDays:Math.floor(number(value.sharedDays,0,999)),lastDay:Math.floor(number(value.lastDay,0,9999))};
  }
  // Imported saves can't force residents into two simultaneous commitments.
  const claimed=new Set();
  for(const key of Object.keys(out).sort()){
   if(!['courting','partners'].includes(out[key].stage))continue;
   if(key.split('|').some(id=>claimed.has(id))){out[key].stage='curious';out[key].affection=Math.min(out[key].affection,30)}
   else key.split('|').forEach(id=>claimed.add(id));
  }
  return out;
 }
 function exclusiveWith(state,id){
  const entries=Object.entries(state.townHearts||{});
  for(const [key,record] of entries){if(key.split('|').includes(id)&&['courting','partners'].includes(record.stage))return key.split('|').find(v=>v!==id)}
  return null;
 }
 function available(state,pair){
  const key=pairKey(pair);if(!key)return false;
  for(const id of pair){
   if(['dating','partner'].includes(state.romance?.[id]?.stage))return false;
   const other=exclusiveWith(state,id);if(other&&other!==pair.find(x=>x!==id))return false;
  }
  return true;
 }
 function score(state,pair){return (state.townHearts?.[pairKey(pair)]?.affection||0)}
 function visitBonus(state,pair){if(!available(state,pair))return 0;return Math.min(10,score(state,pair)*0.15)}
 const friendlyLabel={friends:'Friends',curious:'Growing closer',courting:'Sweethearts',partners:'Committed partners'};
 function onVisit(state,pair,day,chemistry){
  const key=pairKey(pair);if(!key||!available(state,pair)||chemistry<2)return null;
  const bond=Math.max(0,(state.townBonds?.[key]||0)-(state.townTensions?.[key]||0));
  if(bond<12||(state.townTensions?.[key]||0)>=8||(state.visitCounts?.[key]||0)<2)return null;
  state.townHearts ||= {};
  const record=state.townHearts[key]||{stage:'friends',affection:0,sharedDays:0,lastDay:0};
  if(record.lastDay===day)return null; // One meaningful relationship beat per in-game day.
  const previous=record.stage;
  record.lastDay=day;record.sharedDays=Math.min(999,record.sharedDays+1);
  record.affection=Math.min(100,record.affection+5+Math.max(0,chemistry)*2);
  // Different visits must happen across days before a commitment is possible.
  if(record.sharedDays>=5&&record.affection>=60&&bond>=33&&record.stage==='courting')record.stage='partners';
  else if(record.sharedDays>=3&&record.affection>=34&&bond>=22&&record.stage==='curious')record.stage='courting';
  else if(record.sharedDays>=1&&record.affection>=12&&record.stage==='friends')record.stage='curious';
  state.townHearts[key]=record;
  if(record.stage===previous)return null;
  const names=pair.map(id=>VALID.includes(id)?id.charAt(0).toUpperCase()+id.slice(1):'Neighbor');
  const titles={curious:'A little spark',courting:'A blossoming romance',partners:'A promise to stay close'};
  const descriptions={curious:`${names[0]} and ${names[1]} noticed a new warmth in their friendship after spending time together. Nothing is decided yet.`,courting:`After several heartfelt afternoons, ${names[0]} and ${names[1]} have chosen to start dating.`,partners:`${names[0]} and ${names[1]} have chosen a lasting partnership. Their shared story continues, one ordinary day at a time.`};
  return {id:`r:${day}:${key}`,title:titles[record.stage],text:descriptions[record.stage],pair:pair.slice(),day,outcome:'romance',stage:record.stage};
 }
 function connections(state,npcs){
  return Object.entries(state.townHearts||{}).filter(([k,r])=>pairKey(k.split('|'))===k&&r.stage!=='friends')
   .sort((a,b)=>b[1].affection-a[1].affection).map(([key,r])=>({key,names:key.split('|').map(id=>npcs.find(n=>n.id===id)?.name||id),label:friendlyLabel[r.stage]||'Friends',stage:r.stage,affection:r.affection,sharedDays:r.sharedDays}));
 }
 root.HearthTownHearts=Object.freeze({clean,onVisit,available,visitBonus,connections,score,pairKey});
})(globalThis);

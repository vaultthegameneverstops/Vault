/* VAULT — vanilla JS component app. Data layer: VaultFeed.load() — swap this one function for a live news API. */
(function(){
"use strict";
window.__t0=Date.now();
var VaultFeed={
  // To go live: replace with fetch("https://your-news-api/...") and map results to the same story shape (see data.json).
  load:function(){return fetch("data.json?"+Date.now()).then(function(r){if(!r.ok)throw new Error(r.status);return r.json()})}
};
var D=null,filter="all",feedLimit=9,q="";
var SPORTS={mma:"MMA",nfl:"NFL",cfb:"College Football",cbb:"College Basketball",nba:"NBA"};
function secHash(sp){return sp==="nba"?"basketball":sp==="cfb"?"college":sp==="cbb"?"college-basketball":sp}
var NAV=[["home","Home"],["scores","Scores"],["mma","MMA"],["nfl","NFL"],["college","College Football"],["college-basketball","College Basketball"],["basketball","NBA"],["debates","Debates"],["trending","Trending"],["breaking","Breaking News",1],["social","Social"],["saved","Saved"]];
var $=function(s){return document.querySelector(s)};
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function byId(id){return D.stories.filter(function(s){return s.id===id})[0]}
function isBreaking(s){return s.label==="BREAKING"||s.label==="DEVELOPING"}
/* ---------- storage (polls) ---------- */
var mem={};
function sget(k){try{return localStorage.getItem(k)}catch(e){return mem[k]||null}}
function sset(k,v){try{localStorage.setItem(k,v)}catch(e){mem[k]=v}}
/* ---------- components ---------- */
var ILL={
helmet:'<path d="M40 120C30 60 80 30 130 32C180 34 205 70 200 120L200 142L150 142L142 124L110 124L100 148L55 148Z" fill="#fff"/><path d="M70 46C110 28 170 35 196 70" stroke="#3b82f6" stroke-width="10" fill="none"/><path d="M200 100h26M200 118h26M200 136h22M226 100v40h-30" stroke="#fff" stroke-width="5" fill="none"/><circle cx="112" cy="104" r="8" fill="#000" opacity=".45"/>',
ball:'<g transform="rotate(-28 120 100)"><ellipse cx="120" cy="100" rx="86" ry="48" fill="#fff"/><path d="M58 80Q50 100 58 120M182 80Q190 100 182 120" stroke="#3b82f6" stroke-width="6" fill="none"/><path d="M120 66v68M110 78h20M110 92h20M110 106h20M110 120h20" stroke="#111" stroke-width="4"/></g>',
octagon:'<polygon points="120,12 182,38 208,100 182,162 120,188 58,162 32,100 58,38" fill="rgba(255,255,255,.07)" stroke="#fff" stroke-width="6"/><polygon points="120,52 154,66 168,100 154,134 120,148 86,134 72,100 86,66" fill="none" stroke="#fff" stroke-width="2.5" opacity=".7"/><path d="M120 12v40M182 38l-28 28M208 100h-40M182 162l-28-28M120 188v-40M58 162l28-28M32 100h40M58 38l28 28" stroke="#fff" stroke-width="2.5" opacity=".6"/><circle cx="120" cy="100" r="13" fill="#3b82f6"/>',
glove:'<rect x="70" y="52" width="104" height="92" rx="36" fill="#fff"/><rect x="152" y="92" width="42" height="32" rx="15" fill="#fff"/><rect x="48" y="96" width="36" height="56" rx="6" fill="#3b82f6"/><path d="M100 54v40M124 54v40M148 54v40" stroke="#111" stroke-width="3" opacity=".6"/>',
hoop:'<rect x="62" y="16" width="104" height="72" fill="none" stroke="#fff" stroke-width="5"/><rect x="98" y="46" width="32" height="26" fill="none" stroke="#3b82f6" stroke-width="4"/><ellipse cx="114" cy="96" rx="30" ry="7" fill="none" stroke="#3b82f6" stroke-width="6"/><path d="M86 98l12 52M100 102l10 52M114 104v52M128 102l-10 52M142 98l-12 52" stroke="#fff" stroke-width="2.5"/><circle cx="178" cy="150" r="28" fill="#fff"/><path d="M150 150h56M178 122v56M158 132q20 18 0 36M198 132q-20 18 0 36" stroke="#111" stroke-width="2.5" fill="none"/>',
bball:'<circle cx="120" cy="100" r="74" fill="#fff"/><path d="M46 100h148M120 26v148M76 50q44 50 0 100M164 50q-44 50 0 100" stroke="#111" stroke-width="4" fill="none"/>',
trophy:'<rect x="34" y="96" width="50" height="84" fill="#fff"/><rect x="94" y="52" width="50" height="128" fill="#3b82f6"/><rect x="154" y="120" width="50" height="60" fill="#fff"/><g font-family="Impact,Arial Black,sans-serif" font-size="30" text-anchor="middle"><text x="59" y="136" fill="#111">2</text><text x="119" y="96" fill="#fff">1</text><text x="179" y="158" fill="#111">3</text></g>',
gavel:'<g transform="rotate(-32 120 100)"><rect x="66" y="52" width="108" height="42" rx="7" fill="#fff"/><rect x="58" y="46" width="16" height="54" rx="3" fill="#3b82f6"/><rect x="166" y="46" width="16" height="54" rx="3" fill="#3b82f6"/><rect x="112" y="94" width="16" height="84" rx="4" fill="#fff"/></g><rect x="40" y="176" width="130" height="10" fill="#3b82f6"/>',
chart:'<rect x="36" y="130" width="34" height="50" fill="#fff"/><rect x="82" y="104" width="34" height="76" fill="#fff"/><rect x="128" y="70" width="34" height="110" fill="#3b82f6"/><rect x="174" y="34" width="34" height="146" fill="#fff"/><path d="M30 186h184" stroke="#fff" stroke-width="3"/>'
};
var FIG={
figFb:'<g stroke-linecap="round" stroke-linejoin="round" fill="none" stroke="#fff" stroke-width="15"><path d="M112 66L132 112M118 78L152 98M112 80L92 102M132 112L168 150L164 186M132 112L104 150L88 186"/></g><circle cx="108" cy="50" r="18" fill="#fff"/><path d="M92 46q16-18 34-2" stroke="var(--acc,#3b82f6)" stroke-width="6" fill="none" stroke-linecap="round"/><ellipse cx="160" cy="104" rx="13" ry="8" transform="rotate(-30 160 104)" fill="var(--acc,#3b82f6)"/>',
figMma:'<g stroke-linecap="round" stroke-linejoin="round" fill="none" stroke="#fff" stroke-width="15"><path d="M120 66L114 112M122 78L152 90L166 70M118 80L98 96L112 72M114 112L140 148L150 186M114 112L90 148L74 186"/></g><circle cx="120" cy="48" r="17" fill="#fff"/><circle cx="168" cy="66" r="12" fill="var(--acc,#3b82f6)"/><circle cx="112" cy="68" r="11" fill="var(--acc,#3b82f6)"/>',
figBb:'<g stroke-linecap="round" stroke-linejoin="round" fill="none" stroke="#fff" stroke-width="15"><path d="M114 58L112 106M114 68L140 48L150 24M112 70L94 52L102 30M112 106L136 136L130 178M112 106L92 140L100 182"/></g><circle cx="114" cy="40" r="17" fill="#fff"/><circle cx="130" cy="12" r="14" fill="var(--acc,#3b82f6)"/><path d="M118 12h24M130 0v24" stroke="#000" stroke-width="2" opacity=".5"/>'
};
for(var k in FIG)ILL[k]=FIG[k];
var MOTIF={parsons:"helmet",stirling:"glove",cfp:"trophy","bears-lions":"helmet",eagles:"helmet",ufc336:"octagon","spurs-lakers":"bball",clippers:"hoop",davis:"bball",brawl:"octagon",smart:"bball",kalshi:"chart",chiefs:"ball",hokit:"glove",releases:"octagon",fiorot:"glove",harrison:"glove",rodgers:"helmet",niners:"ball",mendoza:"helmet",curry:"bball"};
var DEF={mma:"octagon",nfl:"ball",nba:"bball"};
var NAMES={parsons:["MICAH","PARSONS"],stirling:["NAVAJO","STIRLING"],hokit:["JOSH","HOKIT"],fiorot:["MANON","FIOROT"],harrison:["KAYLA","HARRISON"],mendoza:["FERNANDO","MENDOZA"],curry:["STEPHEN","CURRY"],smart:["MARCUS","SMART"],davis:["ANTHONY","DAVIS"],rodgers:["AARON","RODGERS"]};
/* team accent colors (accent only; no logos) */
var ACC={parsons:"#ffb612",rodgers:"#ffb612","bears-lions":"#ff6a1f",eagles:"#0042b3",chiefs:"#e31837",mendoza:"#b8c0c4",clippers:"#2f7bff",curry:"#ffc72c",niners:"#d4a24c"};
var SCENE={
mma:'<svg class="scene" viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><g fill="none" stroke="#fff" stroke-width="3"><polygon points="200,6 312,38 376,112 312,186 200,219 88,186 24,112 88,38"/><polygon points="200,40 270,62 310,112 270,162 200,184 130,162 90,112 130,62" opacity=".6"/><circle cx="200" cy="112" r="34"/><path d="M200 6V40M312 38L270 62M376 112H310M312 186L270 162M200 219V184M88 186L130 162M24 112H90M88 38L130 62" opacity=".6"/></g></svg>',
nfl:'<svg class="scene" viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><g stroke="#fff" fill="none"><path d="M0 40H400M0 85H400M0 130H400M0 175H400M0 220H400" stroke-width="2" opacity=".6"/><path d="M60 0V225M140 0V225M220 0V225M300 0V225" stroke-width="2" opacity=".35"/><path d="M360 225V120M330 120H390M330 120V60M390 120V60" stroke-width="6"/></g></svg>',
nba:'<svg class="scene" viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><g stroke="#fff" fill="none" stroke-width="3"><circle cx="200" cy="232" r="150"/><rect x="150" y="96" width="100" height="136"/><circle cx="200" cy="96" r="38"/><path d="M0 224H400M185 214h30M200 214v-16"/><circle cx="200" cy="190" r="9" stroke="#3b82f6" stroke-width="4"/></g></svg>'};
/* ---------- per-story slime backgrounds (generated, team colors) ---------- */
var PAL={ /* [base, blob1, blob2, blob3/accent] */
parsons:["#0c1320","#2b4470","#ffb612","#e8e8ea"],rodgers:["#0f0f10","#3a3a3f","#ffb612","#e8e8ea"],
"bears-lions":["#0b162a","#c83803","#3b4a6b","#f1f1f3"],eagles:["#03262a","#004c54","#003ba1","#a5acaf"],
chiefs:["#2a060c","#e31837","#ffb81c","#f1f1f3"],niners:["#2a0808","#aa0000","#b3995d","#f1f1f3"],
mendoza:["#080d18","#3b3d40","#a5acaf","#f1f1f3"],cfp:["#12090a","#b00020","#55555c","#d9d9de"],
clippers:["#071632","#1d428a","#c8102e","#a5acaf"],curry:["#071632","#1d428a","#ffc72c","#e8e8ea"],
"spurs-lakers":["#1b0d33","#552583","#fdb927","#a5acaf"],kalshi:["#1b0d33","#552583","#fdb927","#e8e8ea"],
davis:["#041a33","#002b5c","#e31837","#a5acaf"],smart:["#240810","#ce1141","#6d6d78","#e8e8ea"],
stirling:["#09101b","#3b82f6","#3a3a40","#f1f1f3"],ufc336:["#09101b","#2b4470","#c9a24b","#f1f1f3"],
brawl:["#0c0c0d","#d80000","#f1f1f3","#6d6d78"],hokit:["#14070a","#8c0b1a","#4a4a52","#f1f1f3"],
fiorot:["#08142e","#1b4fa8","#3b82f6","#f1f1f3"],harrison:["#09101b","#3b82f6","#c9a24b","#4a4a52"],
releases:["#101012","#55555c","#3b82f6","#d9d9de"],
_mma:["#09101b","#3b82f6","#4a4a52","#f1f1f3"],_nfl:["#0d121b","#284983","#b8993f","#f1f1f3"],_nba:["#1a0f08","#e8590c","#6d6d78","#f1f1f3"]};
function rngSeed(str){var h=2166136261;for(var i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return function(){h+=0x6D2B79F5;var t=Math.imul(h^h>>>15,1|h);t^=t+Math.imul(t^t>>>7,61|t);return((t^t>>>14)>>>0)/4294967296}}
function blobPath(cx,cy,rx,ry,r){var n=8,p=[],i;for(i=0;i<n;i++){var ang=i/n*Math.PI*2,k=.72+r()*.5;p.push([cx+Math.cos(ang)*rx*k,cy+Math.sin(ang)*ry*k])}
  var m=function(a,b){return[(a[0]+b[0])/2,(a[1]+b[1])/2]},d="M"+m(p[n-1],p[0]).map(f1).join(" ");
  for(i=0;i<n;i++){var q=p[i],e=m(p[i],p[(i+1)%n]);d+="Q"+q.map(f1).join(" ")+" "+e.map(f1).join(" ")}return d+"Z"}
function f1(v){return Math.round(v*10)/10}
function slime(id,sport,custom){
  var pal=custom||PAL[id]||PAL["_"+sport],r=rngSeed(id),s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" preserveAspectRatio="xMidYMid slice"><rect width="320" height="320" fill="'+pal[0]+'"/>',cols=[pal[1],pal[2],pal[1],pal[3],pal[2],pal[3],pal[1],pal[2],pal[3],pal[1]];
  for(var i=0;i<10;i++){var big=i<4,rx=(big?55:28)+r()*(big?40:22),ry=(big?42:22)+r()*(big?34:18);s+='<path fill="'+cols[i]+'" opacity="'+(big?1:.92)+'" d="'+blobPath(-20+r()*360,(big?70:20)+r()*(big?180:280),rx,ry,r)+'"/>'}
  s+='</svg>';return{bg:"url('data:image/svg+xml,"+encodeURIComponent(s).replace(/'/g,"%27")+"')",acc:pal[2]===pal[0]?pal[1]:((custom||PAL[id])?pal[2]:pal[1])}}
var SPLAB={mma:"MMA",nfl:"NFL",cfb:"CFB",cbb:"CBB",nba:"NBA"};
SCENE.cfb=SCENE.nfl;PAL._cfb=["#12090a","#ba0c2f","#3a3a40","#f1f1f3"];DEF.cfb="helmet";SCENE.cbb=SCENE.nba;PAL._cbb=["#0a1220","#1d4ed8","#e8590c","#f1f1f3"];DEF.cbb="hoop";
/* ---------- photo store (uploaded by the site owner, kept on this device) ---------- */
var photos={};
function getPhoto(id){return null}/* visitor photo uploads are disabled on the public site */
function savePhoto(id,p){photos[id]=p;try{localStorage.setItem("vault.photo."+id,JSON.stringify(p));return true}catch(e){return false}}
function delPhoto(id){delete photos[id];try{localStorage.removeItem("vault.photo."+id)}catch(e){}}
function Art(s,cls){
  var v=(s.id.length+s.id.charCodeAt(0))%3,P=getPhoto(s.id)||(s.img?{src:s.img,credit:s.credit,cutout:s.cutout}:null);
  var nm=s.name||NAMES[s.id],word=nm?'<span class="w nm" aria-hidden="true"><i>'+nm[0]+'</i>'+nm[1]+'</span>':'<span class="w" aria-hidden="true">'+esc(s.art||s.kicker)+'</span>';
  var body;
  if(P&&!P.cutout)body='<img class="photo" src="'+esc(P.src)+'" alt="'+esc(s.title)+'" loading="lazy">';
  else body=(P?'<img class="cutout" src="'+esc(P.src)+'" alt="'+esc(s.title)+'">':'<svg class="ill" aria-hidden="true" viewBox="0 0 240 200" preserveAspectRatio="xMidYMid meet">'+ILL[MOTIF[s.id]||DEF[s.sport]]+'</svg>');
  var cap=P?(P.credit?'<span class="cap">Photo: '+esc(P.credit)+'</span>':""):'<span class="cap">Original graphic</span>';
  var sl=slime(s.id,s.sport,s.pal),acc=' style="--acc:'+sl.acc+';--blobs:'+sl.bg+'"';
  var who=P&&P.who?String(P.who).slice(0,40):"",fr=who?'<span class="pframe" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="plate"><b>'+esc(who.toUpperCase())+'</b>'+(s.kicker?'<em>'+esc(s.kicker)+'</em>':"")+'</span>':"";
  if(P&&!P.cutout&&P.pos)body=body.replace('class="photo"','class="photo" style="object-position:50% '+(+P.pos||22)+'%"');
  return '<div class="art s-'+s.sport+' v'+v+(P&&!P.cutout?" has-photo":"")+' '+(cls||"")+'"'+acc+'>'+SCENE[s.sport]+(P&&!P.cutout?"":word)+body+(P&&!P.cutout&&!who?'<span class="w nm shade" aria-hidden="true">'+(nm?'<i>'+nm[0]+'</i>'+nm[1]:esc(s.art||s.kicker))+'</span>':"")+fr+'<span class="sp">'+SPLAB[s.sport]+'</span>'+cap+'</div>';
}
function Label(s){
  var l=s.label,c="";
  if(l==="DEBATE"||l==="TRADE ALERT")c="o";else if(l==="ANALYSIS"||l==="DRAMA")c="d";else if(l==="UNCONFIRMED")c="u";
  var out='<span class="lab '+c+'">'+(l==="BREAKING"?'<i class="dot"></i>':"")+esc(l)+'</span>';
  if(s.unconfirmed&&l!=="UNCONFIRMED")out+='<span class="lab u">UNCONFIRMED</span>';
  return out;
}
function asOf(s){var t=s.updated?new Date(s.updated):(D&&D.updatedAt&&s.time&&String(D.asOf||"").indexOf(s.time)===0?new Date(D.updatedAt):null);if(t&&!isNaN(t))return "As of "+t.toLocaleString([], {month:"short",day:"numeric",hour:"numeric",minute:"2-digit",timeZoneName:"short"});return "As of "+(s.time||"")}
function Meta(s){return '<div class="meta">'+Label(s)+'<span class="kick">'+esc(s.kicker)+' · '+esc(asOf(s))+'</span></div>'}
function Card(s,i){return '<article class="card" data-go="'+s.id+'" tabindex="0" role="link" aria-label="'+esc(s.title)+'" style="animation-delay:'+Math.min(i,10)*45+'ms">'+Art(s)+'<div class="card-b">'+Meta(s)+'<h3>'+esc(s.title)+'</h3><p>'+esc(s.dek)+'</p><div class="when"><span>'+esc((SPORTS[s.sport]||s.sport))+'</span>'+SaveBtn(s.id,true)+'</div></div></article>'}
function Hero(s){return '<article class="hero hero-a" data-go="'+s.id+'" tabindex="0" role="link" aria-label="'+esc(s.title)+'">'+Art(s)+'<div class="hero-b">'+Meta(s)+'<h1>'+esc(s.title)+'</h1><p>'+esc(s.dek)+'</p><span class="cta">Read the story →</span></div></article>'}
function Row(s,i,ranked){return '<button class="row" data-go="'+s.id+'"><span class="n">'+(ranked?(i+1):"▸")+'</span><span><div class="meta">'+Label(s)+'</div><h4>'+esc(s.title)+'</h4><div class="sub">'+esc(SPORTS[s.sport])+' · '+esc(asOf(s))+'</div></span></button>'}
function Poll(s){
  if(!s.poll)return"";var v=sget("vault.poll."+s.id);
  return '<div class="poll"><q>'+esc(s.poll.q)+'</q><div class="opts">'+["a","b"].map(function(k){return '<button class="opt'+(v===k?" me":"")+'" data-poll="'+s.id+'" data-opt="'+k+'" aria-pressed="'+(v===k)+'">'+esc(s.poll[k])+'</button>'}).join("")+'</div><small>'+(v?"Your pick is saved on this device.":"Tap to vote. Votes are stored only on this device for now.")+'</small></div>'
}
function DebateCard(s,i){return '<div class="dcard" style="animation-delay:'+i*60+'ms">'+Meta(s)+'<h3><a href="#story-'+s.id+'">'+esc(s.title)+'</a></h3>'+Poll(s)+'</div>'}
function Soon(){
  var l=(D.soon||[]).filter(function(x){return filter==="all"||x.sport===filter});
  if(!(D.soon&&D.soon.length))return"";
  return '<div class="soon">'+(D.soon||[]).map(function(x,i){
    var tag='<span class="lab '+(x.unconfirmed?"u":x.tag==="SCHEDULED"?"d":"o")+'">'+esc(x.tag)+'</span>';
    var inner='<div class="meta">'+tag+'<span class="kick">'+esc(SPORTS[x.sport]||x.sport)+' · '+esc(x.when)+'</span></div><h4>'+esc(x.title)+'</h4><p>'+esc(x.note)+'</p>';
    return x.story?'<button class="sn" data-go="'+esc(x.story)+'" style="animation-delay:'+i*40+'ms">'+inner+'</button>':'<div class="sn" style="animation-delay:'+i*40+'ms">'+inner+'</div>'}).join("")+'</div>'}
function Section(title,link,inner){return '<div class="sec-h"><h2>'+title+'</h2>'+(link||"")+'</div>'+inner}
function Chips(){return '<div class="chips" role="group" aria-label="Filter by sport">'+[["all","All"],["mma","MMA"],["nfl","NFL"],["cfb","College FB"],["cbb","College BB"],["nba","NBA"]].map(function(c){return '<button class="chip'+(filter===c[0]?" on":"")+'" data-f="'+c[0]+'" aria-pressed="'+(filter===c[0])+'">'+c[1]+'</button>'}).join("")+'</div>'}
function Side(){
  return '<aside class="side"><div class="box"><div class="box-h">Upcoming</div>'+D.events.map(function(e){return '<div class="ev"><div class="t">'+esc(e.when)+'</div><div><b>'+esc(e.title)+'</b><span><i>'+esc(e.sport)+'</i>'+esc(e.sub)+'</span></div></div>'}).join("")+'</div>'+
  '<div class="box"><div class="box-h">About this edition</div><div class="note"><span class="badge">'+esc(D.edition.toUpperCase())+'</span>Stories were summarized from the linked sources on '+esc(D.asOf)+'. Rumors are labeled. New stories are added every few hours, and this page refreshes itself.</div></div></aside>'
}
function Empty(t,s){return '<div class="empty"><b>'+esc(t)+'</b>'+esc(s)+'</div>'}
function filtered(list){return filter==="all"?list:list.filter(function(s){return s.sport===filter})}
/* ---------- VAULT Report (in-page animated video) ---------- */
var VP={t:null,i:0,sc:[],el:null,on:false,voice:true,id:null};
function vpScenes(s){
  var src=s.sources.map(function(x){return x.n}).join(", ");
  var sc=[{k:"title",text:s.title,say:"VAULT report. "+s.title+"."}];
  s.body.forEach(function(p){sc.push({k:"body",text:p,say:p})});
  sc.push({k:"end",text:"Sources: "+src,say:"Sources: "+src+". VAULT. The game never stops."});
  return sc;
}
function ytUrl(s){return 'https://www.youtube.com/results?search_query='+encodeURIComponent(s.tags.slice(0,2).join(' ')+' '+(s.sport==='mma'?'fight news':'news'))}
var WMK="<svg class=\"vp-wm\" viewBox=\"0 0 124 28\" aria-hidden=\"true\"><g opacity=\".85\"><g transform=\"scale(.4375)\"><path fill=\"#FFFFFF\" d=\"M2 6H20L31 32V58H26Z\"/><path fill=\"#93c5fd\" d=\"M62 6H44L33 32V58H38Z\"/></g><g transform=\"translate(36 5) scale(.5)\"><path fill=\"#FFFFFF\" fill-rule=\"evenodd\" transform=\"translate(0 0)\" d=\"M0 0H10L15 22L20 0H30L20 36H10Z\"/><path fill=\"#FFFFFF\" fill-rule=\"evenodd\" transform=\"translate(35 0)\" d=\"M0 36L11 0H21L32 36H22.5L20.5 29H11.5L9.5 36ZM13.7 22H18.3L16 11.5Z\"/><path fill=\"#FFFFFF\" fill-rule=\"evenodd\" transform=\"translate(72 0)\" d=\"M0 0H10V26L12 28H18L20 26V0H30V30L24 36H6L0 30Z\"/><path fill=\"#FFFFFF\" fill-rule=\"evenodd\" transform=\"translate(107 0)\" d=\"M0 0H10V27H28V36H0Z\"/><path fill=\"#FFFFFF\" fill-rule=\"evenodd\" transform=\"translate(140 0)\" d=\"M0 0H32V9H21V36H11V9H0Z\"/></g></g></svg>";
function Player(s,big){
  var sl=slime(s.id,s.sport,s.pal);
  return '<div class="vp'+(big?" vp-big":"")+'" data-vp="'+s.id+'" style="--acc:'+sl.acc+';--blobs:'+sl.bg+'"><div class="vp-bg"></div><div class="vp-bg vp-bg2"></div><div class="vp-stage" id="vps-'+s.id+(big?"-b":"")+'"><div class="vp-poster"><span class="lab">'+esc(s.label)+'</span><h3>'+esc(s.title)+'</h3></div></div>'+
   WMK+'<div class="vp-lt"><b>VAULT REPORT</b><span>'+esc(s.kicker)+'</span></div><button type="button" class="vp-play" data-vpa="start" aria-label="Watch the VAULT Report">▶ Watch the VAULT Report</button>'+
   '<div class="vp-bar"><i></i></div><div class="vp-ctl"><button type="button" data-vpa="toggle">Pause</button><button type="button" data-vpa="replay">Replay</button><button type="button" data-vpa="voice" aria-pressed="true">Voice: on</button><a class="yt" href="'+esc(ytUrl(s))+'" target="_blank" rel="noopener noreferrer">YouTube search ↗</a><span class="vp-cap">Original VAULT graphics · '+esc(s.time)+'</span></div></div>'
}
function vpStop(){clearTimeout(VP.t);VP.on=false;try{window.speechSynthesis&&speechSynthesis.cancel()}catch(e){}}
function vpWords(t,dur){var w=t.split(/\s+/),step=Math.min(140,dur*.55/Math.max(1,w.length));return w.map(function(x,i){return '<span class="wd" style="animation-delay:'+Math.round(i*step)+'ms">'+esc(x)+'</span>'}).join(" ")}
function vpScene(){
  var el=VP.el;if(!el)return;var sc=VP.sc[VP.i],stage=el.querySelector(".vp-stage"),words=sc.text.split(/\s+/).length,dur=Math.max(3800,words/2.5*1000+900);
  stage.innerHTML='<div class="vp-s k-'+sc.k+'"><span class="n">'+(sc.k==="title"?"BREAKING REPORT":sc.k==="end"?"THE GAME NEVER STOPS.":"KEY FACT "+VP.i)+'</span><p>'+(sc.k==="title"?esc(sc.text):vpWords(sc.text,dur))+'</p><i class="vp-wipe"></i></div>';
  var bar=el.querySelector(".vp-bar i");bar.style.transition="none";bar.style.width=(VP.i/VP.sc.length*100)+"%";void bar.offsetWidth;bar.style.transition="width "+dur+"ms linear";bar.style.width=((VP.i+1)/VP.sc.length*100)+"%";
  if(VP.voice){try{if(window.speechSynthesis){speechSynthesis.cancel();var u=new SpeechSynthesisUtterance(sc.say);u.rate=1.05;speechSynthesis.speak(u)}}catch(e){}}
  VP.on=true;el.classList.add("playing");el.querySelector('[data-vpa=toggle]').textContent="Pause";
  VP.t=setTimeout(function(){if(VP.i<VP.sc.length-1){VP.i++;vpScene()}else{VP.on=false;el.classList.remove("playing");el.classList.add("done");el.querySelector('[data-vpa=toggle]').textContent="Play"}},dur);
}
function vpAction(act,el){
  var id=el.getAttribute("data-vp");
  if(act==="start"||act==="replay"){vpStop();if(VP.el&&VP.el!==el){VP.el.classList.remove("playing","done","started")}VP.el=el;VP.id=id;VP.sc=vpScenes(byId(id));VP.i=0;el.classList.add("started");el.classList.remove("done");vpScene()}
  else if(act==="toggle"){if(!VP.el||VP.el!==el)return vpAction("start",el);if(VP.on){vpStop();el.classList.remove("playing");el.querySelector('[data-vpa=toggle]').textContent="Play"}else{if(el.classList.contains("done")){VP.i=0}vpScene()}}
  else if(act==="voice"){VP.voice=!VP.voice;document.querySelectorAll('[data-vpa=voice]').forEach(function(b){b.textContent="Voice: "+(VP.voice?"on":"off");b.setAttribute("aria-pressed",VP.voice)});if(!VP.voice){try{window.speechSynthesis&&speechSynthesis.cancel()}catch(e){}}else if(VP.on){vpScene()}}
}
/* ---------- Headline quiz ---------- */
var QZ={i:0,score:0,sel:null,done:false};
function quizList(){var l=[];D.stories.forEach(function(s){(s.quiz||[]).forEach(function(q){l.push({q:q,s:s})})});return l.slice(0,8)}
function Quiz(){
  var l=quizList();if(!l.length)return"";
  var best=sget("vault.quizbest");
  if(QZ.done){return '<div class="quiz"><div class="qz-end"><span class="n">SCORE</span><b class="hd">'+QZ.score+' / '+l.length+'</b><p>'+(QZ.score===l.length?"Perfect. You know the headlines.":QZ.score>=l.length/2?"Solid. Check the stories for the ones you missed.":"Read the top stories and try again.")+'</p>'+(best?'<small>Best on this device: '+esc(best)+' / '+l.length+'</small>':"")+'<button class="btn r" data-qz="again">Play again</button></div></div>'}
  var it=l[QZ.i],q=it.q,ans=QZ.sel!==null;
  return '<div class="quiz"><div class="qz-top"><span class="n">QUESTION '+(QZ.i+1)+' OF '+l.length+'</span><span class="n">SCORE '+QZ.score+'</span></div><div class="qz-bar"><i style="width:'+(QZ.i/l.length*100)+'%"></i></div><h3 class="hd">'+esc(q.q)+'</h3><div class="qz-o">'+q.o.map(function(o,k){var c=ans?(k===q.a?" ok":k===QZ.sel?" bad":""):"";return '<button class="qo'+c+'" data-qz="pick" data-k="'+k+'"'+(ans?" disabled":"")+'>'+esc(o)+'</button>'}).join("")+'</div>'+
   (ans?'<div class="qz-why"><b>'+(QZ.sel===q.a?"Correct.":"Not quite.")+'</b> '+esc(q.why)+' <a href="#story-'+it.s.id+'">Read: '+esc(it.s.title)+'</a></div><button class="btn r" data-qz="next">'+(QZ.i+1<l.length?"Next question":"See score")+'</button>':"")+'</div>'
}
/* ---------- views ---------- */
function vHome(){
  var hero=D.stories[0],rest=D.stories.slice(1);
  var feed=filtered(rest),shown=feed.slice(0,feedLimit);
  var main=Hero(hero)+Section("Watch: VAULT Report","<span class=\"kick\">Top headline</span>",Player(hero,true)+Videos(hero))+Section("Live Scores",'<a href="#scores">All scores →</a>',ScoreGrid(D.ticker.slice(0,6)))+Section("Coming Soon","<span class=\"kick\">Scheduled events and reports not yet confirmed</span>",Soon())+
   Section("Live Feed","",Chips()+(shown.length?'<div class="cards">'+shown.map(Card).join("")+'</div>':Empty("No stories","Nothing here yet for this filter."))+(feed.length>feedLimit?'<div style="text-align:center;margin-top:18px"><button class="btn" data-more="1">Load more stories</button></div>':""));
  ["mma","nfl","cfb","cbb","nba"].forEach(function(sp){
    var l=D.stories.filter(function(s){return s.sport===sp}).slice(0,3);
    main+=Section(SPORTS[sp],'<a href="#'+secHash(sp)+'">See all →</a>','<div class="cards">'+l.map(Card).join("")+'</div>');
  });
  main+=Section("Trending",'<a href="#trending">See all →</a>','<div class="list">'+D.trending.slice(0,5).map(function(id,i){return Row(byId(id),i,true)}).join("")+'</div>');
  var deb=D.stories.filter(function(s){return s.poll||s.label==="DEBATE"||s.label==="CONTROVERSY"}).slice(0,6);
  main+=Section("Headline Quiz","<span class=\"kick\">Test your knowledge</span>",Quiz());
  main+=Section("Fan Debates &amp; Controversy",'<a href="#debates">See all →</a>','<div class="deb">'+deb.map(function(s,i){return DebateCard(s,i)}).join("")+'</div>');
  return '<div class="grid"><div>'+main+'</div><div>'+Side()+'</div></div>';
}
function vSport(sp,title){
  var l=D.stories.filter(function(s){return s.sport===sp});
  return '<div class="banner art s-'+sp+'" style="--acc:'+slime("_"+sp,sp).acc+';--blobs:'+slime("banner-"+sp,sp).bg+'"><span class="w" aria-hidden="true">'+({cfb:"College FB",cbb:"College BB"}[sp]||title)+'</span><svg class="ill" aria-hidden="true" viewBox="0 0 360 200" preserveAspectRatio="xMidYMid meet"><g transform="translate(-10 40) scale(.7)" opacity=".6">'+ILL[{mma:"octagon",nfl:"ball",cfb:"helmet",cbb:"hoop",nba:"hoop"}[sp]]+'</g><g transform="translate(120 0)">'+ILL[{mma:"glove",nfl:"helmet",cfb:"helmet",cbb:"bball",nba:"bball"}[sp]]+'</g></svg><span class="sp">'+SPLAB[sp]+'</span></div><p class="page-s">'+l.length+' stories · '+esc(D.asOf)+'</p><div class="grid"><div><div class="cards">'+l.map(Card).join("")+'</div></div><div>'+Side()+'</div></div>';
}
function vTrending(){
  var l=D.trending.map(byId).filter(function(s){return filter==="all"||s.sport===filter});
  return '<h1 class="page-h">Trending</h1><p class="page-s">The stories fans are talking about most.</p><div class="grid"><div>'+Chips()+(l.length?'<div class="list">'+l.map(function(s,i){return Row(s,i,true)}).join("")+'</div>':Empty("Nothing trending","Try another filter."))+'</div><div>'+Side()+'</div></div>';
}
function vBreaking(){
  var l=filtered(D.stories.filter(function(s){return isBreaking(s)||s.label==="UNCONFIRMED"}));
  return '<h1 class="page-h">Breaking News</h1><p class="page-s">Breaking and developing stories. Unconfirmed reports are labeled.</p><div class="grid"><div>'+Chips()+(l.length?'<div class="cards">'+l.map(Card).join("")+'</div>':Empty("No breaking stories","Try another filter."))+'</div><div>'+Side()+'</div></div>';
}
function vSearch(){
  var t=q.trim().toLowerCase(),l=[];
  if(t){l=filtered(D.stories.filter(function(s){return(s.title+" "+s.dek+" "+s.kicker+" "+s.tags.join(" ")+" "+s.body.join(" ")+" "+s.label).toLowerCase().indexOf(t)>-1}))}
  return '<h1 class="page-h">Search</h1><p class="page-s">'+(t?l.length+' result'+(l.length===1?"":"s")+' for “'+esc(q.trim())+'”':"Type a team, fighter or topic in the search bar.")+'</p>'+Chips()+(l.length?'<div class="cards">'+l.map(Card).join("")+'</div>':(t?Empty("No matches","Try a team name, a fighter, or a word like “trade”."):""));
}
function Videos(s){
  var v=(s.videos||[]).filter(function(x){return x&&/^https:\/\/(www\.)?youtube\.com\/(watch\?v=|shorts\/|live\/)[\w-]+/.test(x.u||"")});
  if(!v.length)return "";
  return '<section class="vids"><h3 class="hd">Watch on YouTube</h3>'+v.map(function(x){return '<a class="vid" href="'+esc(x.u)+'" target="_blank" rel="noopener noreferrer"><span class="vid-p">▶</span><span class="vid-t"><b>'+esc(x.t)+'</b><em>Credit: '+esc(x.by)+' · YouTube ↗</em></span></a>'}).join("")+'<p class="vid-n">Videos belong to their creators and play on YouTube. VAULT only links to them.</p></section>'
}
function vStory(id){
  var s=byId(id);if(!s)return '<a class="back" href="#home">← Back</a>'+Empty("Story not found","It may have been removed.");
  var rel=D.stories.filter(function(x){return x.sport===s.sport&&x.id!==s.id}).slice(0,3);
  var warn=s.unconfirmed?'<div class="warn"><b>Unconfirmed.</b> VAULT has not been able to verify this report. It is shown because fans are discussing it.</div>':"";
  var srcs=s.sources.map(function(x){return x.u?'<a class="btn r" href="'+esc(x.u)+'" target="_blank" rel="noopener noreferrer">Source: '+esc(x.n)+' ↗</a>':'<span class="btn">Source: '+esc(x.n)+'</span>'}).join("");
  return '<a class="back" href="#'+secHash(s.sport)+'" data-back="1">← Back</a><div class="grid"><article>'+Art(s,"art-hero")+Meta(s)+'<h1>'+esc(s.title)+'</h1><p class="dek">'+esc(s.dek)+'</p><div class="by">By VAULT Desk · '+esc(asOf(s))+' · '+esc(SPORTS[s.sport])+'</div>'+warn+Actions(s)+(window.VX?VX.storyExtra(s):"")+Player(s,false)+Videos(s)+'<div class="prose">'+s.body.map(function(p){return '<p>'+esc(p)+'</p>'}).join("")+'</div>'+Poll(s)+'<div class="src">'+srcs+'</div><div class="tags">'+s.tags.map(function(t){return '<span>'+esc(t)+'</span>'}).join("")+'</div>'+
   (rel.length?Section("More "+SPORTS[s.sport],"",'<div class="cards">'+rel.map(Card).join("")+'</div>'):"")+'</article><div>'+Side()+'</div></div>';
}

/* ---------- saved, ratings, takes ---------- */
function jget(k,d){try{var v=JSON.parse(sget(k));return v==null?d:v}catch(e){return d}}
function savedList(){var l=jget("vault.saved",[]);return Array.isArray(l)?l:[]}
function isSaved(id){return savedList().indexOf(id)>-1}
function toggleSave(id){var l=savedList(),i=l.indexOf(id);if(i>-1)l.splice(i,1);else l.unshift(id);sset("vault.saved",JSON.stringify(l.slice(0,100)));renderNav(curNav)}
function SaveBtn(id,small){var on=isSaved(id);return '<button type="button" class="sv'+(on?" on":"")+(small?" sm":"")+'" data-save="'+esc(id)+'" aria-pressed="'+on+'" aria-label="'+(on?"Remove from saved":"Save story")+'">'+(on?"★ Saved":"☆ Save")+'</button>'}
function getRate(id){return +(sget("vault.rate."+id)||0)}
function Stars(id){var r=getRate(id),h="";for(var i=1;i<=5;i++)h+='<button type="button" class="st'+(i<=r?" on":"")+'" data-rate="'+esc(id)+'" data-v="'+i+'" aria-label="Rate '+i+' out of 5" aria-pressed="'+(i===r)+'">★</button>';return '<div class="stars" role="group" aria-label="Rate this story">'+h+'</div>'}
function Actions(s){var r=getRate(s.id);return '<div class="acts">'+SaveBtn(s.id)+'<div class="rate"><b>Worth it?</b>'+Stars(s.id)+'<small>'+(r?"You rated this "+r+"/5. Saved on this device.":"Rate this story 1–5. Saved on this device.")+'</small></div></div>'}
/* ---------- scores ---------- */
function isLive(g){return /LIVE|Q\d|H\d|\d+:\d+|HALF|OT/i.test(g.st||"")&&!/FINAL/i.test(g.st||"")}
var LGS={NFL:"nfl",NBA:"nba",WNBA:"nba",CFB:"cfb",NCAAF:"cfb",CBB:"cbb",NCAAB:"cbb",UFC:"mma",MMA:"mma"};
function Score(g){var live=isLive(g),aw=g.as>g.hs,hw=g.hs>g.as,fin=!live;return '<button type="button" class="sc'+(live?" live":"")+'" data-game="'+esc(gid(g))+'" aria-label="'+esc(teamName(g,"a")+" at "+teamName(g,"h")+", open game")+'"><div class="sc-h"><span>'+esc(g.lg)+'</span><b>'+(live?'<i class="dot"></i>':"")+esc(g.st||"FINAL")+'</b></div><div class="sc-r'+(fin&&aw?" w":"")+'"><span>'+esc(g.a)+'</span><b>'+esc(g.as)+'</b></div><div class="sc-r'+(fin&&hw?" w":"")+'"><span>'+esc(g.h)+'</span><b>'+esc(g.hs)+'</b></div><div class="sc-n">Tap for full game</div></button>'}
function ScoreGrid(l){return l.length?'<div class="scs">'+l.map(Score).join("")+'</div>':Empty("No scores yet","Check back soon.")}
function vScores(){
  var l=D.ticker.filter(function(g){return filter==="all"||LGS[String(g.lg).toUpperCase()]===filter}),lv=l.filter(isLive),fin=l.filter(function(g){return !isLive(g)});
  var ev=D.events.filter(function(e){return filter==="all"||LGS[String(e.sport).toUpperCase()]===filter});
  var t=D.updatedAt?new Date(D.updatedAt).toLocaleTimeString([], {hour:"numeric",minute:"2-digit"}):"";
  return '<h1 class="page-h">Live Scores</h1><p class="page-s">Scores as of the last VAULT update'+(t?" ("+t+")":"")+'. Live games update on their own while they are being played. The clock shown is the game clock at the last update.</p><div class="grid"><div>'+Chips()+
   (lv.length?Section("Live now","",ScoreGrid(lv)):"")+Section("Final","",ScoreGrid(fin))+
   Section("Up next","",ev.length?'<div class="list">'+ev.map(function(e){return '<div class="row"><span class="n">▸</span><span><div class="meta"><span class="lab d">'+esc(e.sport)+'</span><span class="kick">'+esc(e.when)+'</span></div><h4>'+esc(e.title)+'</h4><div class="sub">'+esc(e.sub)+'</div></span></div>'}).join("")+'</div>':Empty("Nothing scheduled","Try another filter."))+
   '</div><div>'+Side()+'</div></div>'}
/* ---------- debates ---------- */
function Take(s){var t=sget("vault.take."+s.id)||"";return '<div class="take"><label>Your take<input type="text" maxlength="140" data-take="'+esc(s.id)+'" placeholder="Say it in one line" value="'+esc(t)+'"></label><button type="button" class="btn" data-takesave="'+esc(s.id)+'">Save take</button>'+(t?'<small>Saved on this device.</small>':"")+'</div>'}
function vDebates(){
  var all=filtered(D.stories),con=all.filter(function(s){return s.label==="CONTROVERSY"}),deb=all.filter(function(s){return s.poll&&s.label!=="CONTROVERSY"||s.label==="DEBATE"&&!s.poll}),polled=all.filter(function(s){return s.poll});
  function dc(s,i){return '<div class="dcard" style="animation-delay:'+i*50+'ms">'+Meta(s)+'<h3><a href="#story-'+s.id+'">'+esc(s.title)+'</a></h3><p class="dk">'+esc(s.dek)+'</p>'+Poll(s)+Take(s)+'</div>'}
  return '<h1 class="page-h">Fan Debates &amp; Controversy</h1><p class="page-s">Pick a side and add your take. Votes and takes stay on this device for now.</p><div class="grid"><div>'+Chips()+
   Section("Controversy","<span class=\"kick\">Rule breaks, suspensions, drama</span>",con.length?'<div class="deb">'+con.map(dc).join("")+'</div>':Empty("No controversy right now","Check back soon."))+
   Section("Fan debates","<span class=\"kick\">Who is better, who is right</span>",deb.length?'<div class="deb">'+deb.map(dc).join("")+'</div>':Empty("No debates right now","Try another filter."))+
   '</div><div>'+Side()+'</div></div>'}
/* ---------- saved ---------- */
function vSaved(){
  var ids=savedList().filter(function(id){return byId(id)}),l=ids.map(byId),rated=D.stories.filter(function(s){return getRate(s.id)}).sort(function(a,b){return getRate(b.id)-getRate(a.id)});
  return '<h1 class="page-h">Saved</h1><p class="page-s">Stories you saved. Kept on this device.</p><div class="grid"><div>'+
   (l.length?'<div class="cards">'+l.map(Card).join("")+'</div>':Empty("Nothing saved yet","Tap ☆ Save on any story to keep it here."))+
   (rated.length?Section("Your ratings","<span class=\"kick\">Worth it?</span>",'<div class="list">'+rated.map(function(s){return '<button class="row" data-go="'+s.id+'"><span class="n">'+getRate(s.id)+'★</span><span><div class="meta">'+Label(s)+'</div><h4>'+esc(s.title)+'</h4><div class="sub">'+esc(SPORTS[s.sport])+' · '+esc(asOf(s))+'</div></span></button>'}).join("")+'</div>'):"")+
   '</div><div>'+Side()+'</div></div>'}
/* ---------- notifications (in-app) ---------- */
var ALERTS=[["breaking","Breaking"],["mma","MMA"],["nfl","NFL"],["cfb","College FB"],["cbb","College BB"],["nba","NBA"]];
function alertOn(k){var a=jget("vault.alerts",null);return a?a.indexOf(k)>-1:true}
function wants(s){return alertOn(s.sport)||(isBreaking(s)&&alertOn("breaking"))}
function notifs(){return jget("vault.notif",[]).filter(function(n){return byId(n.id)})}
function unread(){var seen=+(sget("vault.notifseen")||0);return notifs().filter(function(n){return n.ts>seen&&wants(byId(n.id))}).length}
function syncKnown(announce){
  var known=jget("vault.known",null),ids=D.stories.map(function(s){return s.id});
  if(!known){sset("vault.known",JSON.stringify(ids));return[]}
  var fresh=D.stories.filter(function(s){return known.indexOf(s.id)<0});
  if(fresh.length){var n=jget("vault.notif",[]);fresh.forEach(function(s){n.unshift({id:s.id,ts:Date.now()})});sset("vault.notif",JSON.stringify(n.slice(0,30)));sset("vault.known",JSON.stringify(known.concat(fresh.map(function(s){return s.id})).slice(-200)))}
  return fresh}
function bellUI(){
  var n=unread(),b=$("#bellN");if(b){b.textContent=n>9?"9+":n;b.hidden=!n}
  document.title=(n?"("+n+") ":"")+document.title.replace(/^\(\d+\)\s/,"")}
function notifPanel(){
  var p=$("#notif");if(!p)return;var seen=+(sget("vault.notifseen")||0),l=notifs().filter(function(n){return wants(byId(n.id))});
  p.innerHTML='<div class="nt-h"><b>Alerts</b><button type="button" data-nt="read">Mark all read</button></div><div class="nt-c">'+ALERTS.map(function(a){return '<button type="button" class="chip'+(alertOn(a[0])?" on":"")+'" data-alert="'+a[0]+'" aria-pressed="'+alertOn(a[0])+'">'+a[1]+'</button>'}).join("")+'</div>'+
   (l.length?'<div class="nt-l">'+l.slice(0,12).map(function(n){var s=byId(n.id);return '<button type="button" class="nt'+(n.ts>seen?" new":"")+'" data-go="'+s.id+'">'+Label(s)+'<span>'+esc(s.title)+'</span></button>'}).join("")+'</div>':'<p class="nt-e">No alerts yet. New stories you picked above show up here.</p>')+
   '<p class="nt-n">Alerts appear while VAULT is open. Phone push alerts are not available yet.</p>'}
function toast(s){var t=$("#toast");if(!t)return;t.innerHTML='<button type="button" data-go="'+s.id+'"><b>NEW</b> '+esc(s.title)+'</button>';t.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(function(){t.hidden=true},7000)}
function hideSplash(){var sp=$("#splash");if(!sp)return;var t0=window.__t0||0,wait=Math.max(0,1500-(Date.now()-t0));setTimeout(function(){sp.classList.add("out");setTimeout(function(){sp.remove()},500)},wait)}
function initBell(){
  var top=document.querySelector(".top-in");if(!top||$("#bell"))return;
  var b=document.createElement("button");b.id="bell";b.type="button";b.className="bell";b.setAttribute("aria-label","Alerts");b.setAttribute("aria-expanded","false");b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a6 6 0 0 0-6 6v4l-2 3h16l-2-3V9a6 6 0 0 0-6-6zM10 19a2 2 0 0 0 4 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg><i id="bellN" hidden></i>';
  top.appendChild(b);
  var p=document.createElement("div");p.id="notif";p.className="notif";p.hidden=true;document.body.appendChild(p);
  var t=document.createElement("div");t.id="toast";t.className="toast";t.hidden=true;document.body.appendChild(t)}
document.addEventListener("click",function(e){
  var t=e.target;
  var sv=t.closest("[data-save]");if(sv){e.stopPropagation();e.preventDefault();toggleSave(sv.getAttribute("data-save"));rerender(true);return}
  var rt=t.closest("[data-rate]");if(rt){e.stopPropagation();var id=rt.getAttribute("data-rate"),v=+rt.getAttribute("data-v");sset("vault.rate."+id,String(getRate(id)===v?0:v));rerender(true);return}
  var ts=t.closest("[data-takesave]");if(ts){e.stopPropagation();var id2=ts.getAttribute("data-takesave"),inp=document.querySelector('[data-take="'+id2+'"]');if(inp){sset("vault.take."+id2,inp.value.trim());rerender(true)}return}
  if(t.closest("[data-take]"))return;
  var bl=t.closest("#bell");if(bl){e.stopPropagation();var p=$("#notif");var open=p.hidden;if(open){notifPanel()}p.hidden=!open;bl.setAttribute("aria-expanded",open);if(!open){}return}
  var al=t.closest("[data-alert]");if(al){e.stopPropagation();var k=al.getAttribute("data-alert"),cur2=jget("vault.alerts",ALERTS.map(function(x){return x[0]})),i=cur2.indexOf(k);if(i>-1)cur2.splice(i,1);else cur2.push(k);sset("vault.alerts",JSON.stringify(cur2));notifPanel();bellUI();return}
  if(t.closest("[data-nt=read]")){e.stopPropagation();sset("vault.notifseen",String(Date.now()));notifPanel();bellUI();return}
  var np=$("#notif");if(np&&!np.hidden&&!t.closest("#notif")){np.hidden=true;sset("vault.notifseen",String(Date.now()));bellUI()}
  var tg=t.closest("#toast [data-go]");if(tg){$("#toast").hidden=true}
},true);

/* ---------- team names + game pages ---------- */
var TEAMS={
 NFL:{ARI:"Arizona Cardinals",ATL:"Atlanta Falcons",BAL:"Baltimore Ravens",BUF:"Buffalo Bills",CAR:"Carolina Panthers",CHI:"Chicago Bears",CIN:"Cincinnati Bengals",CLE:"Cleveland Browns",DAL:"Dallas Cowboys",DEN:"Denver Broncos",DET:"Detroit Lions",GB:"Green Bay Packers",HOU:"Houston Texans",IND:"Indianapolis Colts",JAX:"Jacksonville Jaguars",KC:"Kansas City Chiefs",LV:"Las Vegas Raiders",LAC:"Los Angeles Chargers",LAR:"Los Angeles Rams",MIA:"Miami Dolphins",MIN:"Minnesota Vikings",NE:"New England Patriots",NO:"New Orleans Saints",NYG:"New York Giants",NYJ:"New York Jets",PHI:"Philadelphia Eagles",PIT:"Pittsburgh Steelers",SF:"San Francisco 49ers",SEA:"Seattle Seahawks",TB:"Tampa Bay Buccaneers",TEN:"Tennessee Titans",WAS:"Washington Commanders"},
 NBA:{ATL:"Atlanta Hawks",BOS:"Boston Celtics",BKN:"Brooklyn Nets",CHA:"Charlotte Hornets",CHI:"Chicago Bulls",CLE:"Cleveland Cavaliers",DAL:"Dallas Mavericks",DEN:"Denver Nuggets",DET:"Detroit Pistons",GSW:"Golden State Warriors",GS:"Golden State Warriors",HOU:"Houston Rockets",IND:"Indiana Pacers",LAC:"Los Angeles Clippers",LAL:"Los Angeles Lakers",MEM:"Memphis Grizzlies",MIA:"Miami Heat",MIL:"Milwaukee Bucks",MIN:"Minnesota Timberwolves",NOP:"New Orleans Pelicans",NYK:"New York Knicks",OKC:"Oklahoma City Thunder",ORL:"Orlando Magic",PHI:"Philadelphia 76ers",PHX:"Phoenix Suns",POR:"Portland Trail Blazers",SAC:"Sacramento Kings",SAS:"San Antonio Spurs",SA:"San Antonio Spurs",TOR:"Toronto Raptors",UTA:"Utah Jazz",WAS:"Washington Wizards"},
 CFB:{UTAH:"Utah Utes",TCU:"TCU Horned Frogs",UGA:"Georgia Bulldogs",SCAR:"South Carolina Gamecocks",SMU:"SMU Mustangs",ND:"Notre Dame Fighting Irish",VT:"Virginia Tech Hokies",MIA:"Miami (FL) Hurricanes"},
 CBB:{ARIZ:"Arizona Wildcats",MISS:"Ole Miss Rebels",MARQ:"Marquette Golden Eagles",UVA:"Virginia Cavaliers",ASU:"Arizona State Sun Devils",LSU:"LSU Tigers",XAV:"Xavier Musketeers",TXAM:"Texas A&M Aggies",CONN:"UConn Huskies",DUKE:"Duke Blue Devils"}};
function lgKey(g){var l=String(g.lg||"").toUpperCase();return l==="NCAAF"?"CFB":l==="NCAAB"?"CBB":l==="WNBA"?"NBA":l}
function teamName(g,side){var ab=side==="a"?g.a:g.h,nm=side==="a"?g.an:g.hn;return nm||(TEAMS[lgKey(g)]||{})[ab]||ab}
function gid(g){return (String(g.lg)+"-"+g.a+"-"+g.h).toLowerCase().replace(/[^a-z0-9-]/g,"")}
function gameById(id){return D.ticker.filter(function(g){return gid(g)===id})[0]}
function Recap(g){
  var r=g.recap;
  if(!r)return '<div class="gm-n"><b>Recap coming</b>What people said and any controversy are added for the biggest games with each VAULT update.</div>';
  function ps(l){return (l||[]).map(function(p){return '<p>'+esc(p)+'</p>'}).join("")}
  var out='';
  if(r.sum&&r.sum.length)out+=Section("What happened","",'<div class="prose gm-p">'+ps(r.sum)+'</div>');
  if(r.said&&r.said.length)out+=Section("What people are saying","",'<div class="says">'+r.said.map(function(x){return '<div class="say"><b>'+esc(x.who)+'</b><p>'+esc(x.t)+'</p>'+(x.u?'<a href="'+esc(x.u)+'" target="_blank" rel="noopener noreferrer">'+esc(x.n||"Source")+' ↗</a>':"")+'</div>'}).join("")+'</div>');
  out+=Section("Controversy &amp; fallout","",r.con&&r.con.length?'<div class="prose gm-p con">'+ps(r.con)+'</div>':'<p class="gm-q">No controversy reported in the sources VAULT read for this game.</p>');
  if(r.src&&r.src.length)out+='<div class="src">'+r.src.filter(function(x){return /^https:\/\//.test(x.u||"")}).map(function(x){return '<a class="btn" href="'+esc(x.u)+'" target="_blank" rel="noopener noreferrer">Source: '+esc(x.n)+' ↗</a>'}).join("")+'</div>';
  return out}
function vGame(id){
  var g=gameById(id);if(!g)return '<a class="back" href="#scores">← Scores</a>'+Empty("Game not found","It may have dropped off the scoreboard. Check the Scores page.");
  var live=isLive(g),an=teamName(g,"a"),hn=teamName(g,"h"),aw=g.as>g.hs,hw=g.hs>g.as,tie=g.as===g.hs,lk=lgKey(g);
  var t=D.updatedAt?new Date(D.updatedAt).toLocaleTimeString([], {hour:"numeric",minute:"2-digit"}):"";
  var res=live?(tie?"Tied "+g.as+"-"+g.hs:(aw?an:hn)+" leads "+Math.max(g.as,g.hs)+"-"+Math.min(g.as,g.hs)):(tie?"Final: tied "+g.as+"-"+g.hs:"Final: "+(aw?an:hn)+" won "+Math.max(g.as,g.hs)+"-"+Math.min(g.as,g.hs));
  var words=[an,hn].map(function(n){return n.split(" ").slice(-1)[0].toLowerCase()}).concat([an.toLowerCase(),hn.toLowerCase()]);
  var rel=D.stories.filter(function(s){var h=(s.title+" "+s.tags.join(" ")).toLowerCase();return words.some(function(w){return w.length>3&&h.indexOf(w)>-1})}).slice(0,4);
  var more=D.ticker.filter(function(x){return gid(x)!==id&&lgKey(x)===lk}).slice(0,6);
  function row(name,ab,sc,win,rec){return '<div class="gm-t'+(win?" w":"")+'"><div><b>'+esc(name)+'</b><small>'+esc(ab)+(rec?'<em class="rec" aria-label="Record '+esc(rec)+'">'+esc(rec)+'</em>':'')+'</small></div><span>'+esc(sc)+'</span></div>'}
  return '<a class="back" href="#scores">← Scores</a><div class="grid"><article><div class="gm'+(live?" live":"")+'"><div class="gm-h"><span>'+esc(g.lg)+(g.note?" · "+esc(g.note):"")+'</span><b>'+(live?'<i class="dot"></i>':"")+esc(g.st||"FINAL")+'</b></div>'+
   row(an,g.a,g.as,!live&&aw,g.ar)+row(hn,g.h,g.hs,!live&&hw,g.hr)+'<div class="gm-f">'+esc(res)+'</div></div>'+
   Recap(g)+'<p class="page-s">Score as of the last VAULT update'+(t?" ("+t+")":"")+'. Away team on top, home team on the bottom.'+(g.ar||g.hr?' Records are season win-loss records as of the last VAULT update.':'')+' Scores from Sportradar data.</p>'+
   (rel.length?Section("Related stories","",'<div class="cards">'+rel.map(Card).join("")+'</div>'):"")+
   (more.length?Section("More "+esc(g.lg)+" scores","",ScoreGrid(more)):"")+'</article><div>'+Side()+'</div></div>'}
/* ---------- router ---------- */
var cur="home";
function route(){
  vpStop();VP.el=null;
  var h=(location.hash||"#home").slice(1),html,title="VAULT — The Game Never Stops";
  if(h.indexOf("story-")===0){html=vStory(h.slice(6));var s=byId(h.slice(6));if(s)title=s.title+" — VAULT"}
  else if(h==="mma")html=vSport("mma","MMA");
  else if(h==="nfl")html=vSport("nfl","NFL");
  else if(h==="college")html=vSport("cfb","College Football");
  else if(h==="college-basketball")html=vSport("cbb","College Basketball");
  else if(h==="scores")html=vScores();
  else if(h.indexOf("game-")===0){html=vGame(h.slice(5));var gg=gameById(h.slice(5));if(gg)title=teamName(gg,"a")+" at "+teamName(gg,"h")+" — VAULT"}
  else if(h==="debates")html=vDebates();
  else if(h==="saved")html=vSaved();
  else if(h==="basketball")html=vSport("nba","NBA");
  else if(h==="trending")html=vTrending();
  else if(h==="breaking")html=vBreaking();
  else if(h==="search")html=vSearch();
  else if(h==="social"&&window.VSocial)html=VSocial.view();
  else if(window.VLegal&&VLegal.match(h)){html=VLegal.view(h);title=VLegal.title(h)}
  else if(window.VX&&VX.match(h)){html=VX.view(h);title=VX.title(h)}
  else{h="home";html=vHome()}
  cur=h;
  var v=$("#view");v.classList.remove("noanim");v.style.animation="none";void v.offsetWidth;v.style.animation="";
  v.innerHTML=html;document.title=title;if(h==="social"&&window.VSocial)VSocial.after();
  var key=window.VX&&VX.match(h)?"vx":h.indexOf("story-")===0?(byId(h.slice(6))||{}).sport:h.indexOf("game-")===0?"scores":h;
  var navKey=key==="nba"?"basketball":key==="cfb"?"college":key==="cbb"?"college-basketball":key;
  renderNav(navKey);
}
function rerender(keepScroll){var y=window.scrollY;var v=$("#view");v.classList.add("noanim");v.innerHTML=({home:vHome,mma:function(){return vSport("mma","MMA")},nfl:function(){return vSport("nfl","NFL")},basketball:function(){return vSport("nba","NBA")},college:function(){return vSport("cfb","College Football")},"college-basketball":function(){return vSport("cbb","College Basketball")},scores:vScores,debates:vDebates,saved:vSaved,trending:vTrending,breaking:vBreaking,search:vSearch,social:function(){return window.VSocial?VSocial.view():""}}[cur]||function(){return window.VLegal&&VLegal.match(cur)?VLegal.view(cur):window.VX&&VX.match(cur)?VX.view(cur):cur.indexOf("game-")===0?vGame(cur.slice(5)):vStory(cur.slice(6))})();if(cur==="social"&&window.VSocial)VSocial.after();if(keepScroll)window.scrollTo(0,y)}
var curNav="home";
function renderNav(active){curNav=active;
  var h=NAV.map(function(n){return '<a href="#'+n[0]+'" class="'+(n[0]===active?"on":"")+'"'+(n[0]===active?' aria-current="page"':"")+'>'+n[1]+(n[0]==="saved"&&savedList().length?' ('+savedList().length+')':"")+(n[2]?'<i class="dot"></i>':"")+'</a>'}).join("");
  $("#nav").innerHTML=h;var n2=window.VX?VX.nav(cur):"";$("#nav2").innerHTML=n2;$("#drawerNav").innerHTML=h+(n2?'<div class="dr-h">MORE</div>'+n2:"");
}
/* ---------- photo upload modal ---------- */
var pending=null;
function closePhoto(){var m=$("#pmodal");if(m)m.remove();pending=null}
function openPhoto(id){
  closePhoto();var s=byId(id),P=getPhoto(id);pending=P?JSON.parse(JSON.stringify(P)):null;
  var m=document.createElement("div");m.id="pmodal";m.className="pm";
  m.innerHTML='<div class="pm-bg" data-pclose="1"></div><div class="pm-box" role="dialog" aria-modal="true" aria-labelledby="pmt"><h3 id="pmt" class="hd">Add photo</h3><p class="pm-s">'+esc(s.title)+'</p><div class="pm-prev" id="pmPrev"></div>'+
   '<label class="pm-f">Choose image<input type="file" id="pmFile" accept="image/png,image/jpeg,image/webp"></label>'+
   '<label class="pm-f">Photo credit (shown on the image)<input type="text" id="pmCredit" maxlength="60" placeholder="e.g. Your name or the photographer" value="'+esc(P&&P.credit||"")+'"></label>'+
   '<label class="pm-f">Player name for the frame (you type it; VAULT does not identify people)<input type="text" id="pmWho" maxlength="40" placeholder="e.g. First Last" value="'+esc(P&&P.who||(s.name?s.name.join(" "):""))+'"></label>'+
   '<label class="pm-f">Focus<select id="pmPos"><option value="10">Top (faces)</option><option value="22">Upper</option><option value="50">Center</option><option value="85">Bottom</option></select></label>'+
   '<label class="pm-c"><input type="checkbox" id="pmCut"'+(P&&P.cutout?" checked":"")+'> Transparent player cutout (PNG). Shown over the VAULT backdrop.</label>'+
   '<label class="pm-c"><input type="checkbox" id="pmRights"> I own this photo or have a license to use it.</label>'+
   '<p class="pm-s" id="pmMsg">Photos are saved on this device only.</p>'+
   '<div class="pm-b"><button class="btn r" id="pmSave" type="button">Save photo</button>'+(P?'<button class="btn" id="pmDel" type="button">Remove</button>':"")+'<button class="btn" data-pclose="1" type="button">Cancel</button></div></div>';
  document.body.appendChild(m);
  function prev(){var w=($("#pmWho")||{}).value||"",p=+($("#pmPos")||{}).value||22;$("#pmPrev").innerHTML=pending?'<div class="pm-fr"><img src="'+esc(pending.src)+'" alt="Preview of your photo" style="object-position:50% '+p+'%"><span class="pframe"><i></i><i></i><i></i><i></i></span>'+(w.trim()?'<span class="plate"><b>'+esc(w.trim().toUpperCase())+'</b></span>':"")+'</div>':'<span>No photo yet</span>'}
  if(P&&P.pos)$("#pmPos").value=String(P.pos);
  prev();$("#pmWho").addEventListener("input",prev);$("#pmPos").addEventListener("change",prev);
  $("#pmFile").addEventListener("change",function(ev){
    var f=ev.target.files[0];if(!f)return;
    if(!/^image\//.test(f.type)){$("#pmMsg").textContent="Please choose an image file.";return}
    var fr=new FileReader();fr.onload=function(){var im=new Image();im.onload=function(){
      var cut=$("#pmCut").checked||f.type==="image/png"&&false,max=$("#pmCut").checked?1000:1400,r=Math.min(1,max/Math.max(im.width,im.height));
      var c=document.createElement("canvas");c.width=Math.round(im.width*r);c.height=Math.round(im.height*r);c.getContext("2d").drawImage(im,0,0,c.width,c.height);
      pending={src:c.toDataURL($("#pmCut").checked?"image/png":"image/jpeg",.86),credit:"",cutout:$("#pmCut").checked};prev();$("#pmMsg").textContent="Preview ready. Add a credit and confirm the rights box, then save."};im.src=fr.result};fr.readAsDataURL(f)});
  $("#pmSave").addEventListener("click",function(){
    if(!pending){$("#pmMsg").textContent="Choose an image first.";return}
    if(!$("#pmRights").checked){$("#pmMsg").textContent="Please confirm you have the rights to this photo.";return}
    pending.credit=$("#pmCredit").value.trim();pending.who=$("#pmWho").value.trim();pending.pos=+$("#pmPos").value;pending.cutout=$("#pmCut").checked;
    var ok=savePhoto(id,pending);closePhoto();rerender(true);
  });
  var d=$("#pmDel");if(d)d.addEventListener("click",function(){delPhoto(id);closePhoto();rerender(true)});
  $("#pmFile").focus();
}
document.addEventListener("click",function(e){if(e.target.closest("[data-pclose]"))closePhoto()});
/* ---------- events ---------- */
function openDrawer(o){$("#drawer").hidden=!o;$("#burger").setAttribute("aria-expanded",o)}
document.addEventListener("click",function(e){
  var t=e.target;
  var va=t.closest("[data-vpa]");if(va){e.stopPropagation();vpAction(va.getAttribute("data-vpa"),va.closest(".vp"));return}
  var qz=t.closest("[data-qz]");if(qz){var act=qz.getAttribute("data-qz"),l=quizList();
    if(act==="pick"&&QZ.sel===null){QZ.sel=+qz.getAttribute("data-k");if(QZ.sel===l[QZ.i].q.a)QZ.score++}
    else if(act==="next"){if(QZ.i+1<l.length){QZ.i++;QZ.sel=null}else{QZ.done=true;var b=+(sget("vault.quizbest")||0);if(QZ.score>b)sset("vault.quizbest",String(QZ.score))}}
    else if(act==="again"){QZ={i:0,score:0,sel:null,done:false}}
    rerender(true);return}
  var pb=t.closest("[data-photo]");if(pb){e.stopPropagation();openPhoto(pb.getAttribute("data-photo"));return}
  var gm=t.closest("[data-game]");if(gm){location.hash="#game-"+gm.getAttribute("data-game");return}
  var go=t.closest("[data-go]");
  if(go){location.hash="#story-"+go.getAttribute("data-go");return}
  var f=t.closest("[data-f]");if(f){filter=f.getAttribute("data-f");feedLimit=9;rerender(true);return}
  if(t.closest("[data-more]")){feedLimit+=9;rerender(true);return}
  var p=t.closest("[data-poll]");if(p){sset("vault.poll."+p.getAttribute("data-poll"),p.getAttribute("data-opt"));rerender(true);return}
  if(t.closest("#burger")){openDrawer($("#drawer").hidden);return}
  if(t.closest("#drawerBg")||t.closest("#drawerNav a")){openDrawer(false)}
  if(t.closest("#qclear")){$("#q").value="";q="";$("#qclear").hidden=true;if(cur==="search")rerender();$("#q").focus()}
  if(t.closest("[data-back]")&&history.length>1){e.preventDefault();history.back()}
});
document.addEventListener("keydown",function(e){
  if(e.key==="Escape"){openDrawer(false);closePhoto()}
  if((e.key==="Enter"||e.key===" ")&&e.target.matches&&e.target.matches("[data-go]")){e.preventDefault();location.hash="#story-"+e.target.getAttribute("data-go")}
});
$("#q").addEventListener("input",function(e){
  q=e.target.value;$("#qclear").hidden=!q;
  if(cur!=="search"){filter="all";location.hash="#search"}else rerender();
});
$("#searchForm").addEventListener("submit",function(e){e.preventDefault();if(cur!=="search"){filter="all";location.hash="#search"}});
window.addEventListener("hashchange",function(){var np=$("#notif");if(np&&!np.hidden){np.hidden=true;sset("vault.notifseen",String(Date.now()))}route();window.scrollTo(0,0);bellUI()});
/* ---------- boot ---------- */
function ticker(){
  var one=D.ticker.map(function(g){var aw=g.as>g.hs;return '<a class="tk" href="#game-'+esc(gid(g))+'"><span class="lg">'+g.lg+(isLive(g)?' <i class="dot"></i> '+esc(String(g.st).replace(/^LIVE\s*/i,"")):"")+'</span><span class="'+(aw?"win":"")+'">'+g.a+' <b>'+g.as+'</b></span><span class="win">'+g.h+' <b>'+g.hs+'</b></span></a>'}).join("");
  $("#ticker").innerHTML=one+one;
}
function ago(t){var s=Math.max(0,Math.round((Date.now()-t)/1000));if(s<60)return "just now";var m=Math.round(s/60);if(m<60)return m+" min ago";return t.toLocaleTimeString([], {hour:"numeric",minute:"2-digit"})}
function liveBadge(){
  var t=D&&D.updatedAt?new Date(D.updatedAt):null,n=D&&D.ticker?D.ticker.filter(isLive).length:0;
  $("#live").innerHTML='<i class="dot"></i>'+(n?n+" live · ":"")+(t&&!isNaN(t)?"Updated "+ago(t):"")}
setInterval(function(){if(D)liveBadge()},15000);
/* Live scores layer: scores.json is rewritten by a fast scores-only job. Newer than data.json, it overrides ticker scores and clocks. */
var SC=null;
function applyScores(){
  if(!D||!SC||!SC.games||!D.ticker)return false;
  if(!(new Date(SC.updatedAt)>new Date(D.updatedAt)))return false;
  var byk={};D.ticker.forEach(function(g){byk[gid(g)]=g});
  SC.games.forEach(function(x){
    var g=byk[gid(x)];
    if(!g){if(!x.st)return;g={lg:x.lg,a:x.a,h:x.h,an:x.an,hn:x.hn};D.ticker.unshift(g);byk[gid(g)]=g}
    g.as=x.as;g.hs=x.hs;if(x.st)g.st=x.st;else delete g.st;
    if(x.an&&!g.an)g.an=x.an;if(x.hn&&!g.hn)g.hn=x.hn;if(x.ar)g.ar=x.ar;if(x.hr)g.hr=x.hr;if(x.note&&!g.note)g.note=x.note;
  });
  D.ticker=D.ticker.filter(isLive).concat(D.ticker.filter(function(g){return !isLive(g)}));
  D.updatedAt=SC.updatedAt;return true;
}
function loadScores(){
  return fetch("scores.json?"+Date.now()).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(s){
    if(!s||(SC&&s.updatedAt===SC.updatedAt))return;
    SC=s;
    if(applyScores()){ticker();liveBadge();if((cur==="home"||cur==="scores"||cur.indexOf("game-")===0)&&!document.getElementById("pmodal")&&!VP.on)rerender(true)}
  }).catch(function(){})
}
function refresh(){
  VaultFeed.load().then(function(d){
    var raw=JSON.stringify(d);if(raw===RAW)return;RAW=raw;
    D=d;applyScores();ticker();liveBadge();$("#footNote").textContent=D.edition+" · stories summarized from linked sources, "+D.asOf+" · rumors are labeled";
    var fr=syncKnown();fr.filter(wants).slice(0,1).forEach(toast);if(window.VX)VX.onFresh(fr);bellUI();
    if(!document.getElementById("pmodal")&&!VP.on)rerender(true);
  }).catch(function(){})
}
setInterval(refresh,120000);
setInterval(function(){if(D&&!document.hidden)loadScores()},15000);
document.addEventListener("visibilitychange",function(){if(!document.hidden){refresh();loadScores()}});
var RAW=null;
VaultFeed.load().then(function(d){
  RAW=JSON.stringify(d);D=d;ticker();liveBadge();$("#footNote").textContent=D.edition+" · stories summarized from linked sources, "+D.asOf+" · rumors are labeled";
  window.VaultApp={gid:gid,get D(){return D},esc:esc,byId:byId,Card:Card,Section:Section,Empty:Empty,Art:Art,SPORTS:SPORTS,Meta:Meta,toast:toast,rerender:rerender,renderNav:function(){renderNav(curNav)},cur:function(){return cur}};
  initBell();syncKnown();route();bellUI();hideSplash();loadScores();
}).catch(function(){$("#view").innerHTML=Empty("Could not load stories","Please refresh the page.");hideSplash()});
})();

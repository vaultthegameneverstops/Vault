/* VAULT FX: Live Arena (3D stadium + jumbotron), Arena view theater, split-flap scores, team colors, 3D tilt. Reads VaultApp.D; never writes data. */
(function(){
"use strict";
try{
var RM=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function $(s,r){return (r||document).querySelector(s)}

/* ---------- team colors ---------- */
var COL={
NFL:{ARI:"#97233F",ATL:"#A71930",BAL:"#241773",BUF:"#00338D",CAR:"#0085CA",CHI:"#C83803",CIN:"#FB4F14",CLE:"#FF3C00",DAL:"#003594",DEN:"#FB4F14",DET:"#0076B6",GB:"#203731",HOU:"#A71930",IND:"#002C5F",JAC:"#006778",JAX:"#006778",KC:"#E31837",LV:"#A5ACAF",LAC:"#0080C6",LA:"#003594",LAR:"#003594",MIA:"#008E97",MIN:"#4F2683",NE:"#002244",NO:"#D3BC8D",NYG:"#0B2265",NYJ:"#125740",PHI:"#004C54",PIT:"#FFB612",SF:"#AA0000",SEA:"#69BE28",TB:"#D50A0A",TEN:"#4B92DB",WAS:"#5A1414"},
NBA:{ATL:"#E03A3E",BOS:"#007A33",BKN:"#8f8f8f",CHA:"#00788C",CHI:"#CE1141",CLE:"#860038",DAL:"#00538C",DEN:"#FEC524",DET:"#C8102E",GSW:"#1D428A",HOU:"#CE1141",IND:"#FDBB30",LAC:"#C8102E",LAL:"#552583",MEM:"#5D76A9",MIA:"#98002E",MIL:"#00471B",MIN:"#236192",NOP:"#85714D",NYK:"#F58426",OKC:"#007AC1",ORL:"#0077C0",PHI:"#006BB6",PHX:"#E56020",POR:"#E03A3E",SAC:"#5A2D81",SAS:"#C4CED4",TOR:"#CE1141",UTA:"#753BBD",WAS:"#E31837"},
COL:{UGA:"#BA0C2F",CIN:"#E00122",PUR:"#CEB888",OKLA:"#841617",SDSU:"#A6192E",MD:"#E03A3E",BC:"#8A100B",UCF:"#BA9B37",DUKE:"#003087",CONN:"#1d3a7a",TEX:"#BF5700",ALA:"#9E1B32",MICH:"#FFCB05",OSU:"#BB0000",ARMY:"#D4BF91",UTSA:"#F15A22",GC:"#522398",COLO:"#CFB87C",WAKE:"#9E7E38",MSST:"#660000",VCU:"#FFB300",WASH:"#4B2E83",TCU:"#4D1979",TTU:"#CC0000",FSU:"#782F40",FLA:"#0021A5",TAMU:"#500000",GONZ:"#C8102E",BAY:"#154734",KU:"#0051BA",KAN:"#0051BA",UK:"#0033A0",UNC:"#7BAFD4",LOU:"#AD0000",SJU:"#BA0C2F",ISU:"#C8102E",TENN:"#FF8200",MIA:"#F47321",ARK:"#9D2235",MSU:"#18453B",USC:"#990000",UCLA:"#2D68C4",SMC:"#D80024",CREI:"#005CA9",PITT:"#003594",LSU:"#461D7C",ORE:"#154733",KSU:"#512888",GTWN:"#8D817B",ASU:"#8C1D40",SCAR:"#73000A",USU:"#8A8D8F",ND:"#0C2340",PSU:"#041E42",IOWA:"#FFCD00",AUB:"#E87722",OKST:"#FF7300",VAN:"#866D4B",ILL:"#E84A27",IU:"#990000",WIS:"#C5050C",NEB:"#E41C38",CLEM:"#F56600",UVA:"#F84C1E",XAV:"#0C2340",MARQ:"#003366",HOU:"#C8102E",BYU:"#002E5D",ARIZ:"#CC0033",UTAH:"#CC0000",SMU:"#CC0035",NCST:"#CC0000"}
};
function hue(s){var h=0;for(var i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))%360;return "hsl("+h+" 62% 46%)"}
var TCM={},LGM={};
function lum(h){h=String(h||"").replace("#","");if(h.length!==6)return .5;var r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);return (.299*r+.587*g+.114*b)/255}
function meta1(g){if(!g||!g.lg)return;var L=String(g.lg).toUpperCase();["a","h"].forEach(function(k){var ab=g[k];if(!ab)return;var c=g[k+"c"],c2=g[k+"c2"];if(c){var u=lum(c);TCM[L+"|"+ab]=(u>.86||u<.06)&&c2&&lum(c2)<=.86&&lum(c2)>=.06?c2:c}if(g[k+"lg"])LGM[L+"|"+ab]=g[k+"lg"]})}
function syncMeta(){try{games().forEach(meta1);if(PL&&PL.games)Object.keys(PL.games).forEach(function(id){meta1(PL.games[id])})}catch(_){}}
function tcol(lg,ab){lg=String(lg||"").toUpperCase();var m=lg==="NFL"?COL.NFL:lg==="NBA"?COL.NBA:COL.COL;return m[ab]||TCM[lg+"|"+ab]||hue(lg+ab)}
function logoURL(lg,ab,px){var u=LGM[String(lg||"").toUpperCase()+"|"+ab]||(window.VTeams&&(VTeams.byAbbr(lg,ab)||{}).lg);return u&&window.VLogo?VLogo.src(u,px||80):""}
function logoImg(lg,ab,cls,px){var u=logoURL(lg,ab,px);return u?'<img class="tlogo '+(cls||"")+'" src="'+esc(u)+'" alt="" loading="lazy" onerror="this.remove()">':""}
function centerLogo(g,cx,cy,r){var u=logoURL(g.lg,g.h,160);return u?'<image href="'+esc(u)+'" x="'+(cx-r)+'" y="'+(cy-r)+'" width="'+(2*r)+'" height="'+(2*r)+'" preserveAspectRatio="xMidYMid meet"/>':""}
function isLive(g){return /LIVE|Q\d|H\d|\d+:\d+|HALF|OT/i.test(g.st||"")&&!/FINAL/i.test(g.st||"")}
function football(g){var l=String(g.lg).toUpperCase();return l==="NFL"||l==="CFB"}
function clock(g){return isLive(g)?String(g.st).replace(/^LIVE\s*/i,""):"FINAL"}
function nm(g,k){return g[k+"n"]||g[k]}
function A(){return window.VaultApp}
function games(){var a=A();if(!a||!a.D||!a.D.ticker)return[];var t=a.D.ticker.slice();return t.filter(isLive).concat(t.filter(function(g){return !isLive(g)}))}
function gid(g){var a=A();return a?a.gid(g):(g.lg+"-"+g.a+"-"+g.h).toLowerCase()}

/* ---------- floors ---------- */
function fieldSVG(g){
 var ca=tcol(g.lg,g.a),ch=tcol(g.lg,g.h),s='<svg viewBox="0 0 720 360" preserveAspectRatio="none" aria-hidden="true">';
 for(var i=0;i<20;i++)s+='<rect x="'+(60+i*30)+'" y="0" width="30" height="360" fill="'+(i%2?"#2f8a46":"#348f4b")+'"/>';
 s+='<rect width="60" height="360" fill="'+ca+'"/><rect x="660" width="60" height="360" fill="'+ch+'"/>';
 s+='<g stroke="#fff" stroke-opacity=".85">';for(i=0;i<=20;i++){var x=60+i*30;s+='<line x1="'+x+'" y1="6" x2="'+x+'" y2="354" stroke-width="'+(i%20===0?3:i%2?1:2)+'"/>'}s+='</g>';
 s+='<g stroke="#fff" stroke-opacity=".7">';for(i=1;i<100;i++){if(i%5===0)continue;var hx=60+i*6;s+='<line x1="'+hx+'" y1="138" x2="'+hx+'" y2="146"/><line x1="'+hx+'" y1="214" x2="'+hx+'" y2="222"/><line x1="'+hx+'" y1="4" x2="'+hx+'" y2="12"/><line x1="'+hx+'" y1="348" x2="'+hx+'" y2="356"/>'}s+='</g>';
 s+='<g fill="#fff" fill-opacity=".85" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="22" text-anchor="middle">';
 [10,20,30,40,50,40,30,20,10].forEach(function(n,k){var x=60+(k+1)*60;s+='<text x="'+x+'" y="62">'+n+'</text><text x="'+x+'" y="318" transform="rotate(180 '+x+' 310)">'+n+'</text>'});s+='</g>';
 s+='<circle cx="360" cy="180" r="34" fill="#111C30" stroke="#fff" stroke-width="3"/><path fill="#fff" d="M340 166h9l8 18 3-18h8l-7 30h-8z"/>';var cl=centerLogo(g,360,180,40);if(cl)s=s.replace(/<circle cx="360" cy="180" r="34"[^>]*\/><path fill="#fff" d="M340[^"]*"\/>/,'<circle cx="360" cy="180" r="46" fill="rgba(255,255,255,.14)" stroke="#fff" stroke-width="3"/>'+cl);
 s+='<g font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="34" fill="#fff" fill-opacity=".92" text-anchor="middle" letter-spacing="6"><text transform="translate(42 180) rotate(-90)">'+esc(g.a)+'</text><text transform="translate(678 180) rotate(90)">'+esc(g.h)+'</text></g>';
 return s+'</svg>'}
var CSN=0;
function courtSVG(g){
 var pid="pl"+(++CSN),ca=tcol(g.lg,g.a),ch=tcol(g.lg,g.h),s='<svg viewBox="0 0 720 360" preserveAspectRatio="none" aria-hidden="true"><defs><pattern id="'+pid+'" width="720" height="18" patternUnits="userSpaceOnUse"><rect width="720" height="18" fill="#c98f55"/><rect y="9" width="720" height="9" fill="#c48a50"/><line x1="0" y1="18" x2="720" y2="18" stroke="#a87443" stroke-width="1"/></pattern></defs>';
 s+='<rect width="720" height="360" fill="url(#'+pid+')"/><rect x="0" y="0" width="720" height="360" fill="none" stroke="#1D4ED8" stroke-width="22"/>';
 s+='<g fill="none" stroke="#fff" stroke-width="3"><rect x="11" y="11" width="698" height="338"/><line x1="360" y1="11" x2="360" y2="349"/><circle cx="360" cy="180" r="46"/>';
 s+='<path d="M11 36H70A160 160 0 0 1 70 324H11"/><path d="M709 36H650A160 160 0 0 0 650 324H709"/></g>';
 s+='<rect x="11" y="132" width="146" height="96" fill="'+ca+'" stroke="#fff" stroke-width="3"/><rect x="563" y="132" width="146" height="96" fill="'+ch+'" stroke="#fff" stroke-width="3"/>';
 s+='<g fill="none" stroke="#fff" stroke-width="3"><circle cx="157" cy="180" r="46"/><circle cx="563" cy="180" r="46"/></g>';
 s+='<circle cx="360" cy="180" r="44" fill="#111C30"/><path fill="#fff" d="M343 165h9l8 18 3-18h8l-7 30h-8z"/>';var cl2=centerLogo(g,360,180,38);if(cl2)s=s.replace(/<circle cx="360" cy="180" r="44" fill="#111C30"\/><path fill="#fff" d="M343[^"]*"\/>/,'<circle cx="360" cy="180" r="44" fill="rgba(255,255,255,.18)"/>'+cl2);
 s+='<g font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="30" fill="#fff" fill-opacity=".55" text-anchor="middle" letter-spacing="4"><text transform="translate(250 190)">'+esc(g.a)+'</text><text transform="translate(470 190)">'+esc(g.h)+'</text></g>';
 return s+'</svg>'}
function goalSVG(fb){return fb?'<svg viewBox="0 0 120 110" aria-hidden="true"><g stroke="#ffd21f" stroke-width="5" fill="none" stroke-linecap="round"><path d="M60 110V46M24 46H96M24 46V2M96 46V2"/></g></svg>':'<svg viewBox="0 0 120 130" aria-hidden="true"><path d="M60 130V40" stroke="#2b302d" stroke-width="7"/><rect x="22" y="6" width="76" height="46" fill="rgba(255,255,255,.75)" stroke="#fff" stroke-width="4"/><rect x="47" y="24" width="26" height="20" fill="none" stroke="#e0262f" stroke-width="3"/><ellipse cx="60" cy="54" rx="14" ry="4" fill="none" stroke="#ff6a00" stroke-width="3"/></svg>'}
function jbHTML(g){
 var lv=isLive(g),aw=g.as>g.hs,hw=g.hs>g.as;
 return '<div class="jb"><div class="jb-top"><span>'+esc(g.lg)+(g.note?" · "+esc(g.note):"")+'</span><b>'+esc(clock(g))+'</b></div><div class="jb-mid">'+
 '<div class="jb-t'+(aw?" up":"")+'" style="--tc:'+tcol(g.lg,g.a)+'">'+logoImg(g.lg,g.a,"jbw",120)+'<span class="jb-ab">'+esc(g.a)+'</span><strong data-k="as">'+esc(g.as)+'</strong></div>'+
 '<div class="jb-t'+(hw?" up":"")+'" style="--tc:'+tcol(g.lg,g.h)+'">'+logoImg(g.lg,g.h,"jbw",120)+'<span class="jb-ab">'+esc(g.h)+'</span><strong data-k="hs">'+esc(g.hs)+'</strong></div></div>'+
 '<div class="jb-bot">'+(lv?"LIVE ON VAULT":"FINAL SCORE")+'</div></div>'}

/* ---------- split-flap ---------- */
function flapTo(el,oldV,newV){
 if(!el||String(oldV)===String(newV))return;
 if(RM){el.textContent=newV;return}
 el.innerHTML='<span class="flip"><span class="fo">'+esc(oldV)+'</span><span class="fn">'+esc(newV)+'</span></span>';
 clearTimeout(el._ft);el._ft=setTimeout(function(){el.textContent=newV},900)}


/* ---------- plays (plays.json, written by the live loop) ---------- */
var PL=null,plSig="",plSeen={},plBoot=Date.now(),lastBurst={};
var KIND={three:"Three",dunk:"Dunk",block:"Block",td:"Touchdown",fg:"Field goal",xp:"Extra point","2pt":"2-pt try",sf:"Safety",to:"Turnover",big:"Big play",run:"Scoring run",score:"Score",half:"Halftime",final:"Final"};
/* order plays by game time (period, then clock counting down); items without a game time keep their place */
function tkey(t){t=String(t||"");var m=/^(Q|H|OT)(\d*)\s+(\d+):(\d+)/.exec(t),per;
 if(m){per=m[1]==="Q"?+m[2]:m[1]==="H"?+m[2]:(m[1]==="OT"?4+(+m[2]||1):0);return per*10000+(3600-(+m[3]*60+ +m[4]))}
 if(/^Half/i.test(t))return 2*10000+3599;if(/^Final/i.test(t))return 99*10000;return null}
function plSort(l){var last=0;l.forEach(function(x,i){var k=tkey(x.t);if(k==null)k=last;else last=k;x._o=k*1000+i});l.sort(function(a,b){return a._o-b._o});return l}
function plays(id){return PL&&PL.games&&PL.games[id]?PL.games[id].plays||[]:[]}
function plRow(g,x,o){var c=x.tm?tcol(g.lg,x.tm):"#3a443f",h=x.hl;o=o||{};
 var fd=h&&o.fd?(football(g)?'<div class="pl-fd">'+miniField(g,h,!!o.anim)+'</div>':hoops(g)?'<div class="pl-fd">'+miniCourt(g,h,!!o.anim)+'</div>':""):"";
 return '<li class="pl'+(x.big?" big":"")+(h?" hl":"")+' k-'+esc(x.k)+'"><span class="pl-t">'+esc(x.t||"")+'</span><span class="pl-k" style="--tc:'+c+'">'+esc(KIND[x.k]||"Play")+(x.tm?" · "+esc(x.tm):"")+'</span>'+(h?'<span class="pl-hl">'+esc(hlTitle(h))+' <em>'+esc(hlSub(h))+'</em></span>':"")+(h&&String(x.key).indexOf("hl|")===0?"":'<span class="pl-x">'+esc(x.x)+'</span>')+fd+'</li>'}
function loadPlays(){
 return fetch("plays.json?"+Date.now()).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(d){
  var sig=JSON.stringify(d.games||{});if(sig===plSig)return;var first=!plSig;plSig=sig;PL=d;Object.keys(d.games||{}).forEach(function(id){plSort(d.games[id].plays||[])});syncMeta();
  Object.keys(d.games||{}).forEach(function(id){var e=d.games[id];(e.plays||[]).forEach(function(x){var k=id+"|"+x.key;if(plSeen[k])return;plSeen[k]=1;if(!first&&Date.now()-plBoot>8000&&x.big)bigPlay(id,e,x)})});
  render(false);gamePage();booth();bottomLine();bpRefresh();if((location.hash||"")==="#highlights")hlFill();
 }).catch(function(){})}
var toastQ=[],toastOn=false;
function bigPlay(id,e,x){
 var label=x.hl?hlKind(x.hl)+" · "+hlTitle(x.hl):(KIND[x.k]||"Big play")+(x.tm?" · "+(x.tm===e.a?e.an:x.tm===e.h?e.hn:x.tm):"");
 if(id===sel&&AR&&!AR.hidden){lastBurst[id]=Date.now();burst(x.tm?tcol(e.lg,x.tm):"#ffb21a",label)}
 toastQ.push({id:id,e:e,x:x,label:label});if(!toastOn)nextToast()}
function nextToast(){
 var t=toastQ.shift();if(!t){toastOn=false;return}toastOn=true;
 var el=document.getElementById("bpToast");if(!el){el=document.createElement("a");el.id="bpToast";el.className="bp";el.setAttribute("role","status");document.body.appendChild(el)}
 el.href="#game-"+t.id;el.style.setProperty("--tc",t.x.tm?tcol(t.e.lg,t.x.tm):"#ffb21a");
 el.innerHTML='<b>'+esc(t.label)+'</b><span>'+esc(t.e.a+" "+t.e.as+" · "+t.e.h+" "+t.e.hs+" · "+(t.x.t||""))+'</span><em>'+esc(t.x.x)+'</em>';
 el.classList.remove("show");void el.offsetWidth;el.classList.add("show");
 clearTimeout(nextToast.t);nextToast.t=setTimeout(function(){el.classList.remove("show");setTimeout(nextToast,400)},6500)}
var gpFilter="all";
function gamePage(){
 var h=(location.hash||"").slice(1);if(h.indexOf("game-")!==0)return;var id=h.slice(5),art=$("#view article"),gm=art&&art.querySelector(".gm");if(!gm)return;
 var box=art.querySelector(".pt");if(!box){box=document.createElement("section");box.className="pt";box.setAttribute("aria-label","Play tracker");(art.querySelector(".booth")||gm).insertAdjacentElement("afterend",box);
  box.addEventListener("click",function(ev){var b=ev.target.closest("[data-pf]");if(b){gpFilter=b.getAttribute("data-pf");gamePage()}})}
 var e=PL&&PL.games&&PL.games[id],l=(e?e.plays:[]).slice().reverse(),lv=e&&/LIVE|HALF/.test(e.st||"");
 var shown=gpFilter==="big"?l.filter(function(x){return x.big}):l;
 var g={lg:e?e.lg:"",a:e?e.a:"",h:e?e.h:""};
 var extra="";
 if(e&&e.fs){extra='<div class="pt-st"><div><b>'+esc(e.fs.a.yds!=null?e.fs.a.yds:"–")+'</b>'+esc(e.a)+' total yards</div><div><b>'+esc(e.fs.h.yds!=null?e.fs.h.yds:"–")+'</b>'+esc(e.h)+' total yards</div><div><b>'+esc(e.fs.a.to||0)+'–'+esc(e.fs.h.to||0)+'</b>Turnovers '+esc(e.a)+'–'+esc(e.h)+'</div></div>'}
 if(e&&e.sh&&hoops(g)){var mk={a:[0,0],h:[0,0]};e.sh.forEach(function(q){mk[q[3]][1]++;if(q[2])mk[q[3]][0]++});
  extra+='<div class="pt-sc"><div class="pt-sch">Shot chart <small>last '+e.sh.length+' shots · ● made · ✕ missed</small></div><div class="pl-fd">'+miniCourt(g,null,false,e.sh)+'</div><div class="pt-st">'+["a","h"].map(function(k){return '<div><b>'+mk[k][0]+'/'+mk[k][1]+'</b>'+esc(e[k])+' field goals</div>'}).join("")+'</div></div>'}
 if(e&&e.bs){extra+='<div class="pt-st">'+["a","h"].map(function(k){var b=e.bs[k];return b?'<div><b>'+esc(b.pts)+'</b>'+esc(b.ld)+' leads '+esc(e[k])+'</div>':""}).join("")+'</div>'}
 box.innerHTML='<div class="pt-h"><h2>Play tracker</h2>'+(lv?'<span class="pt-live"><i></i>Live</span>':"")+'<div class="pt-f" role="group" aria-label="Filter plays"><button type="button" data-pf="all" aria-pressed="'+(gpFilter==="all")+'">All plays</button><button type="button" data-pf="big" aria-pressed="'+(gpFilter==="big")+'">Big plays</button><a class="pt-hla" href="#highlights">All highlights</a></div></div>'+extra+
  (shown.length?'<ol class="pls">'+shown.map(function(x,i){return plRow(g,x,{fd:true,anim:i<3})}).join("")+'</ol>':'<p class="pt-e">'+(e?"No plays in this view yet.":"Plays show up here while VAULT is tracking this game live: scoring plays, turnovers, explosive gains and scoring runs.")+'</p>')+
  '<p class="pt-n">Tracked from ESPN\u2019s public scoreboard, checked every 5 minutes. Football: every scoring play, plus highlight plays (20+ yard passes, 15+ yard runs, takeaways, return scores) drawn on the field. Positions other than the passer, receiver and ball carrier are illustrative. Basketball: shot chart, threes, dunks and blocks from the play-by-play, plus scoring runs and leading scorers. Times for turnovers, gains and runs are when VAULT spotted them.</p>'}

/* ---------- highlight plays drawn on the field (x.hl from plays.json) ---------- */
var FX0=60,PX=6,HT=5.2;
function fxX(y){return FX0+Math.max(0,Math.min(100,+y||0))*PX}
function r1(n){return Math.round(n*10)/10}
function hlTitle(h){if(h.ty==="3pt"||h.ty==="dunk")return h.by||h.tm;if(h.ty==="blk")return (h.by||h.tm)+(h.vs?" rejects "+h.vs:" with the block");if((h.ty==="pass")&&h.qb&&h.rc)return h.qb+" to "+h.rc;if(h.ty==="int")return h.by?h.by+" picks it off":"Interception";if(h.ty==="fum")return "Fumble · "+h.def+" ball";return h.by||h.off+" big play"}
function hlSub(h){if(h.ty==="3pt")return (h.ft?h.ft+"-foot ":"")+"three"+(h.ast?" · assist "+h.ast:"");if(h.ty==="dunk")return "Slam dunk"+(h.ast?" · feed from "+h.ast:"");if(h.ty==="blk")return "Blocked shot";var y=Math.abs(h.yd||0),s=h.ty==="pass"?y+"-yard pass":h.ty==="rush"?y+"-yard run":h.ty==="ret"?y+"-yard return":h.ty==="int"?(h.qb?"Thrown by "+h.qb:"Takeaway"):"Takeaway";return s+(h.td?" · Touchdown":"")}
function hlTeam(h){return h.tm||(h.ty==="int"||h.ty==="fum"?h.def:h.off)}
function hlKind(h){if(h.ty==="3pt")return "Three";if(h.ty==="dunk")return "Dunk";if(h.ty==="blk")return "Block";return h.td?"Touchdown":h.ty==="int"||h.ty==="fum"?"Turnover":"Big play"}
function seg(p){var L=[0],t=0;for(var i=1;i<p.length;i++){t+=Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1]);L.push(t)}return{L:L,t:t||1}}
function rel(p){var o=p[0];return "M0,0 "+p.slice(1).map(function(q){return "L"+r1(q[0]-o[0])+","+r1(q[1]-o[1])}).join(" ")}
function abs(p){return "M"+p.map(function(q){return r1(q[0])+","+r1(q[1])}).join(" L")}
function arc(a,b,lift,n){var mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2-lift,o=[];for(var i=0;i<=n;i++){var t=i/n,u=1-t;o.push([u*u*a[0]+2*u*t*mx+t*t*b[0],u*u*a[1]+2*u*t*my+t*t*b[1]])}return o}
/* timeline (fractions of HT): .14 snap · .40 throw/handoff · .64 catch · .88 whistle */
function motion(p,times,anim){
 if(!anim||p.length<2)return "";var s=seg(p),pts=times.map(function(k){return k[1]});
 var kp=[],kt=[];times.forEach(function(k){kt.push(k[0]);kp.push(r1(s.L[Math.min(k[1],p.length-1)]/s.t*1000)/1000)});
 return '<animateMotion dur="'+HT+'s" repeatCount="indefinite" calcMode="linear" path="'+rel(p)+'" keyTimes="'+kt.join(";")+'" keyPoints="'+kp.join(";")+'"/>'}
function piece(x,y,c,cls,mv,lab){return '<g class="hp-pc'+(cls?" "+cls:"")+'" transform="translate('+r1(x)+' '+r1(y)+')"><ellipse class="hp-sh" cx="2" cy="3" rx="9.5" ry="7"/><circle r="'+(cls&&/key/.test(cls)?10.5:8)+'" fill="'+c+'"/>'+(lab?'<text y="3.5">'+esc(lab)+'</text>':"")+(mv||"")+'</g>'}
function simple(x0,y0,x1,y1,anim,t0,t1){return anim?'<animateMotion dur="'+HT+'s" repeatCount="indefinite" calcMode="linear" path="M0,0 L'+r1(x1-x0)+','+r1(y1-y0)+'" keyTimes="0;'+t0+';'+t1+';1" keyPoints="0;0;1;1"/>':""}
function initials(n){n=String(n||"");var w=n.replace(/\./g," ").split(/\s+/).filter(Boolean);return w.length>1?(w[0][0]+w[w.length-1][0]).toUpperCase():n.slice(0,2).toUpperCase()}
function playSVG(g,h,anim){
 if(!h||h.s==null)return "";anim=anim&&!RM;
 var dir=h.off===g.a?1:-1,D=dir*PX,cy=180,s=fxX(h.s),e=fxX(h.e!=null?h.e:h.s),yL=cy+(h.ln||0)*dir*92;
 var co=tcol(g.lg,h.off),cd=tcol(g.lg,h.def),o="",i;
 var OL=[-26,-13,0,13,26].map(function(dy){return[s-D,cy+dy]}),QB=[s-D*5,cy],RB=[s-D*7,cy+16],TE=[s-D*1.4,cy+40];
 var WR=[[s-D,cy-118],[s-D,cy+118],[s-D*1.2,cy-78]];
 var DL=[-33,-11,11,33].map(function(dy){return[s+D*1.4,cy+dy]}),LB=[-44,0,44].map(function(dy){return[s+D*5,cy+dy]}),CB=[[s+D*7,cy-116],[s+D*7,cy+116]],SF=[[s+D*14,cy-56],[s+D*14,cy+56]];
 var key,keyP,ball,end,ret=h.ty==="ret";
 if(h.ty==="pass"||h.ty==="int"){
  var w=0,bd=1e9;WR.forEach(function(p,k){var d=Math.abs(p[1]-yL);if(d<bd){bd=d;w=k}});
  var air=h.ty==="int"?Math.min(Math.max(12,Math.abs(h.e-h.s)*.5),30):Math.max(6,Math.abs(h.yd||0)*.72);
  var c=[s+D*air,yL+(h.ln?0:(WR[w][1]<cy?-20:20))];
  var qbd=[QB[0]-D*2,cy];
  if(h.ty==="pass"){
   end=[fxX(h.e),c[1]*.7+cy*.3];keyP=[WR[w],[c[0]-D*3,c[1]],c,end];
   var fl=arc(qbd,c,40+air*1.4,10);ball=[QB,qbd].concat(fl).concat([end]);
   o+='<path class="hp-air" d="'+abs(fl)+'">'+(anim?'<animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.40;.62;.9;1" dur="'+HT+'s" repeatCount="indefinite"/>':"")+'</path>';
   o+='<path class="hp-rt" pathLength="1" stroke="'+co+'" d="'+abs(keyP)+'">'+(anim?'<animate attributeName="stroke-dashoffset" values="1;1;0;0" keyTimes="0;.14;.88;1" dur="'+HT+'s" repeatCount="indefinite"/>':"")+'</path>';
   o+=arrowHead(keyP,co,anim);
   o+=piece(QB[0],QB[1],co,"qb",motion([QB,qbd],[[0,0],[.14,0],[.34,1],[1,1]],anim),initials(h.qb));
   var others=WR.filter(function(_,k){return k!==w});
   others.forEach(function(p){o+=piece(p[0],p[1],co,"",simple(p[0],p[1],p[0]+D*12,p[1]+(cy-p[1])*.35,anim,.14,.7))});
   key=piece(keyP[0][0],keyP[0][1],co,"key",motion(keyP,[[0,0],[.14,0],[.5,1],[.64,2],[.88,3],[1,3]],anim),initials(h.rc));
   if(!anim)key=piece(end[0],end[1],co,"key","",initials(h.rc));
   ball=motionBall(ball,[[0,0],[.14,0],[.34,1],[.40,1],[.64,ball.length-2],[.88,ball.length-1],[1,ball.length-1]],anim,end);
  }else{
   end=[fxX(h.e),c[1]];var picker=CB.concat(SF).reduce(function(a,p){return Math.abs(p[1]-c[1])<Math.abs(a[1]-c[1])?p:a});
   var fl2=arc(qbd,c,30,8);ball=[QB,qbd].concat(fl2).concat([end]);
   keyP=[picker,c,end];
   o+='<path class="hp-air" d="'+abs(fl2)+'"/>';
   o+='<path class="hp-rt" pathLength="1" stroke="'+cd+'" d="'+abs([c,end])+'">'+(anim?'<animate attributeName="stroke-dashoffset" values="1;1;0;0" keyTimes="0;.64;.88;1" dur="'+HT+'s" repeatCount="indefinite"/>':"")+'</path>'+arrowHead([c,end],cd,anim);
   o+=piece(QB[0],QB[1],co,"qb",motion([QB,qbd],[[0,0],[.14,0],[.34,1],[1,1]],anim),initials(h.qb));
   WR.forEach(function(p,k){o+=piece(p[0],p[1],co,"",simple(p[0],p[1],k===w?c[0]-D*2:p[0]+D*10,k===w?c[1]+8:p[1],anim,.14,.62))});
   key=piece(picker[0],picker[1],cd,"key",motion(keyP,[[0,0],[.14,0],[.64,1],[.88,2],[1,2]],anim),initials(h.by));
   if(!anim)key=piece(end[0],end[1],cd,"key","",initials(h.by));
   ball=motionBall(ball,[[0,0],[.14,0],[.34,1],[.40,1],[.64,ball.length-2],[.88,ball.length-1],[1,ball.length-1]],anim,end);
  }
 }else{
  var hole=[s+D*1.5,cy+(yL-cy)*.35],start=ret?[s,cy+(h.ln||0)*40]:RB;end=[fxX(h.e),cy+(yL-cy)*.55];
  var mid=[(hole[0]+end[0])/2,(hole[1]+end[1])/2+(dir>0?26:-26)];
  keyP=ret?[start,[start[0]+D*12,cy+30],mid,end]:[RB,[RB[0]+D*2,cy+4],hole,mid,end];
  var by=h.ty==="fum"?h.def:h.by;
  o+='<path class="hp-rt" pathLength="1" stroke="'+co+'" d="'+abs(keyP)+'">'+(anim?'<animate attributeName="stroke-dashoffset" values="1;1;0;0" keyTimes="0;.30;.88;1" dur="'+HT+'s" repeatCount="indefinite"/>':"")+'</path>'+arrowHead(keyP,co,anim);
  if(!ret){o+=piece(QB[0],QB[1],co,"qb",simple(QB[0],QB[1],QB[0]-D,QB[1]-10,anim,.14,.3));WR.forEach(function(p){o+=piece(p[0],p[1],co,"",simple(p[0],p[1],p[0]+D*7,p[1],anim,.14,.6))})}
  var tk=ret?[[0,0],[.14,0],[.4,1],[.64,2],[.88,3],[1,3]]:[[0,0],[.14,0],[.3,1],[.42,2],[.64,3],[.88,4],[1,4]];
  key=anim?piece(keyP[0][0],keyP[0][1],co,"key",motion(keyP,tk,anim),initials(h.by||by)):piece(end[0],end[1],co,"key","",initials(h.by||by));
  ball=motionBall(ret?keyP:[QB].concat(keyP.slice(1)),tk,anim,end);
 }
 if(!ret){OL.forEach(function(p){o+=piece(p[0],p[1],co,"ol",simple(p[0],p[1],p[0]+D*1.6,p[1],anim,.14,.5))});if(h.ty!=="rush")o+=piece(RB[0],RB[1],co,"",simple(RB[0],RB[1],RB[0]+D*3,RB[1]-20,anim,.14,.5));o+=piece(TE[0],TE[1],co,"",simple(TE[0],TE[1],TE[0]+D*5,TE[1]+6,anim,.14,.6))}
 var defs=ret?[[end[0]-D*18,cy-90],[end[0]-D*22,cy+70],[end[0]-D*14,cy+10],[end[0]-D*26,cy-20],[end[0]-D*30,cy+110],[end[0]-D*20,cy-140]]:DL.concat(LB,CB,SF);
 if(h.ty==="int"){var pk=keyP[0];defs=defs.filter(function(p){return p!==pk})}
 defs.forEach(function(p,k){var f=.45+(k%4)*.1,tx=p[0]+(end[0]-p[0])*f,ty=p[1]+(end[1]-p[1])*f;o+=piece(p[0],p[1],cd,"df",simple(p[0],p[1],tx,ty,anim,.14+(k%3)*.04,.9))});
 var los=ret?"":'<line class="hp-los" x1="'+r1(s)+'" y1="14" x2="'+r1(s)+'" y2="346"/>';
 var tdz=h.td?'<rect class="hp-tdz" x="'+(h.e>=50?660:0)+'" y="0" width="60" height="360" fill="'+co+'">'+(anim?'<animate attributeName="opacity" values="0;0;.85;0" keyTimes="0;.86;.92;1" dur="'+HT+'s" repeatCount="indefinite"/>':"")+'</rect>':"";
 var spot='<circle class="hp-spot" cx="'+r1(end[0])+'" cy="'+r1(end[1])+'" r="15">'+(anim?'<animate attributeName="r" values="0;0;24;15" keyTimes="0;.86;.92;1" dur="'+HT+'s" repeatCount="indefinite"/>':"")+'</circle>';
 return '<g class="hp">'+tdz+los+o+key+spot+ball+'</g>'}
function arrowHead(p,c,anim){var a=p[p.length-2],b=p[p.length-1],ang=Math.atan2(b[1]-a[1],b[0]-a[0])*180/Math.PI;
 return '<path class="hp-ah" fill="'+c+'" d="M0,0 L-15,-9 L-11,0 L-15,9Z" transform="translate('+r1(b[0])+' '+r1(b[1])+') rotate('+r1(ang)+')">'+(anim?'<animate attributeName="opacity" values="0;0;1;1" keyTimes="0;.84;.88;1" dur="'+HT+'s" repeatCount="indefinite"/>':"")+'</path>'}
function motionBall(p,times,anim,end){var b='<ellipse rx="5" ry="3.4" class="hp-ball"/><path class="hp-lace" d="M-2.5,0H2.5"/>';
 if(!anim)return '<g transform="translate('+r1(end[0])+' '+r1(end[1]-10)+')">'+b+'</g>';
 return '<g transform="translate('+r1(p[0][0])+' '+r1(p[0][1]-10)+')">'+b+motion(p,times,true)+'</g>'}
function miniField(g,h,anim){return fieldSVG(g).replace("</svg>",playSVG(g,h,anim)+"</svg>")}
function lastHl(id){var l=plays(id);for(var i=l.length-1;i>=0;i--)if(l[i].hl)return l[i];return null}
function hlCaption(g,x){var h=x.hl;return '<div class="ar-hl" style="--tc:'+tcol(g.lg,hlTeam(h))+'"><em>'+esc(hlKind(h))+" · "+esc(h.t||x.t||"")+'</em><b>'+esc(hlTitle(h))+'</b><span>'+esc(hlSub(h))+'</span></div>'}

/* ---------- basketball: shot chart + highlight plays on the court (e.sh, x.hl) ---------- */
var HB=4.2;
function hoopXY(side){return side==="a"?[670,180]:[50,180]}
function courtPt(x,y,side){x=+x||0;y=+y||0;return side==="a"?[709-y*7.43,11+x*6.76]:[11+y*7.43,349-x*6.76]}
function shotChart(g,sh,dim){if(!sh||!sh.length)return "";var o='<g class="hb-sc'+(dim?" dim":"")+'">';
 sh.forEach(function(s){var p=courtPt(s[0],s[1],s[3]),c=tcol(g.lg,s[3]==="a"?g.a:g.h);
  o+=s[2]?'<circle cx="'+r1(p[0])+'" cy="'+r1(p[1])+'" r="5.5" fill="'+c+'" stroke="#fff" stroke-width="1.6"/>':'<g class="hb-miss" transform="translate('+r1(p[0])+' '+r1(p[1])+')"><path d="M-4,-4L4,4M4,-4L-4,4" stroke="'+c+'" stroke-width="2.4"/></g>'});
 return o+'</g>'}
function hoopsSVG(g,h,anim,sh){
 anim=anim&&!RM;var o=shotChart(g,sh,!!h);if(!h)return o;
 var side=h.side||(h.tm===g.a?"a":"h");if(h.ty==="blk")side=side==="a"?"h":"a";var off=side==="a"?g.a:g.h,dfn=side==="a"?g.h:g.a,co=tcol(g.lg,off),cd=tcol(g.lg,dfn);
 var hp=hoopXY(side),sp=h.x!=null?courtPt(h.x,h.y,side):[hp[0]+(side==="a"?-140:140),180];
 if(h.ty==="dunk"&&Math.hypot(sp[0]-hp[0],sp[1]-hp[1])<40)sp=[hp[0]+(side==="a"?-150:150),hp[1]+(sp[1]<180?-70:70)];
 var dx=side==="a"?-1:1,key=[[hp[0]+dx*60,110],[hp[0]+dx*60,250],[hp[0]+dx*150,70],[hp[0]+dx*150,290],[hp[0]+dx*200,180]];
 var mates=key.filter(function(p){return Math.hypot(p[0]-sp[0],p[1]-sp[1])>60}).slice(0,4);
 var ds=mates.map(function(p){return [p[0]+(hp[0]-p[0])*.18,p[1]+(hp[1]-p[1])*.18]}).concat([[sp[0]+(hp[0]-sp[0])*.16,sp[1]+(hp[1]-sp[1])*.16]]);
 mates.forEach(function(p){o+=piece(p[0],p[1],co,"",simple(p[0],p[1],p[0]+dx*-14,p[1]+(p[1]<180?10:-10),anim,.1,.5))});
 var blkr=null;if(h.ty==="blk"){blkr=ds.pop();}
 ds.forEach(function(p){o+=piece(p[0],p[1],cd,"df",simple(p[0],p[1],p[0]+(sp[0]-p[0])*.25,p[1]+(sp[1]-p[1])*.25,anim,.12,.6))});
 var who=h.ty==="blk"?h.vs:h.by;
 if(h.ty==="dunk"){
  var path=[sp,[sp[0]+(hp[0]-sp[0])*.5,sp[1]+(hp[1]-sp[1])*.7],[hp[0]+dx*-6,hp[1]]];
  o+='<path class="hp-rt" pathLength="1" stroke="'+co+'" d="'+abs(path)+'">'+(anim?'<animate attributeName="stroke-dashoffset" values="1;1;0;0" keyTimes="0;.12;.62;1" dur="'+HB+'s" repeatCount="indefinite"/>':"")+'</path>';
  o+=anim?piece(sp[0],sp[1],co,"key",hmotion(path,[[0,0],[.12,0],[.4,1],[.62,2],[1,2]]),initials(who)):piece(path[2][0],path[2][1],co,"key","",initials(who));
  o+=hball(anim?path:null,[[0,0],[.12,0],[.4,1],[.62,2],[1,2]],path[2],-12);
 }else{
  var fl=arc(sp,hp,70+Math.hypot(hp[0]-sp[0],hp[1]-sp[1])*.25,12);
  o+=piece(sp[0],sp[1],co,"key",anim?'<animateMotion dur="'+HB+'s" repeatCount="indefinite" path="M0,0 L0,-6 L0,0" keyTimes="0;.3;.4" keyPoints="0;.5;1" calcMode="linear" />':"",initials(who));
  if(h.ty==="blk"){
   var mid=fl[5],dflect=[mid[0]+dx*40,mid[1]+(mid[1]<180?-60:60)];
   o+=piece(blkr[0],blkr[1],cd,"key blk",anim?hmotion([blkr,mid],[[0,0],[.2,0],[.46,1],[1,1]]):"",initials(h.by));
   var bp=fl.slice(0,6).concat([dflect]);
   o+='<path class="hp-air" d="'+abs(fl.slice(0,6))+'"/>';
   o+=hball(anim?bp:null,[[0,0],[.3,0],[.46,5],[.7,6],[1,6]],dflect,0);
  }else{
   o+='<path class="hp-air" d="'+abs(fl)+'">'+(anim?'<animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.3;.62;.9;1" dur="'+HB+'s" repeatCount="indefinite"/>':"")+'</path>';
   o+=hball(anim?fl:null,[[0,0],[.3,0],[.62,fl.length-1],[1,fl.length-1]],hp,0);
  }
 }
 if(h.ty!=="blk"){var pts=h.ty==="3pt"?"+3":"+2";
  o+='<circle class="hp-spot" cx="'+hp[0]+'" cy="'+hp[1]+'" r="18">'+(anim?'<animate attributeName="r" values="0;0;30;18" keyTimes="0;.6;.68;1" dur="'+HB+'s" repeatCount="indefinite"/>':"")+'</circle>'+
  '<text class="hb-pts" x="'+hp[0]+'" y="'+(hp[1]-34)+'" fill="'+co+'">'+pts+(anim?'<animate attributeName="opacity" values="0;0;1;1" keyTimes="0;.62;.68;1" dur="'+HB+'s" repeatCount="indefinite"/>':"")+'</text>'}
 return '<g class="hp">'+o+'</g>'}
function hmotion(p,times){var s2=seg(p),kp=[],kt=[];times.forEach(function(k){kt.push(k[0]);kp.push(r1(s2.L[Math.min(k[1],p.length-1)]/s2.t*1000)/1000)});
 return '<animateMotion dur="'+HB+'s" repeatCount="indefinite" calcMode="linear" path="'+rel(p)+'" keyTimes="'+kt.join(";")+'" keyPoints="'+kp.join(";")+'"/>'}
function hball(p,times,end,lift){var b='<circle r="6" class="hb-ball"/><path class="hb-seam" d="M-6,0H6M0,-6V6"/>';
 if(!p)return '<g transform="translate('+r1(end[0])+' '+r1(end[1]+lift)+')">'+b+'</g>';
 return '<g transform="translate('+r1(p[0][0])+' '+r1(p[0][1]+lift)+')">'+b+hmotion(p,times)+'</g>'}
function miniCourt(g,h,anim,sh){return courtSVG(g).replace("</svg>",hoopsSVG(g,h,anim,sh)+"</svg>")}
function hoops(g){var l=String(g.lg).toUpperCase();return l==="NBA"||l==="CBB"}

/* ---------- UFC fight card (scores.json "ufc", from the ESPN MMA scoreboard) ---------- */
var UFC=null;
function loadUFC(){return fetch("scores.json?u="+Date.now()).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(d){var n=JSON.stringify(d.ufc||null);if(n!==loadUFC.s){loadUFC.s=n;UFC=d.ufc||null;fightCard(true)}}).catch(function(){})}
function fcWhen(t){try{var d=new Date(t);return d.toLocaleString([], {weekday:"short",month:"short",day:"numeric",hour:"numeric",minute:"2-digit"})}catch(_){return ""}}
function fcFighter(f,side,b){var fin=b.state==="post";return '<div class="fc-f '+side+(fin&&f.w?" win":"")+(fin&&!f.w&&b.f.some(function(z){return z.w})?" lose":"")+'">'+(f.fl?'<img class="fc-fl" src="'+esc(f.fl)+'" alt="'+esc(f.ct||"")+'" loading="lazy" onerror="this.remove()">':"")+'<div><b>'+esc(f.n)+'</b><small>'+esc(f.r||"")+(f.ct?" · "+esc(f.ct):"")+'</small></div>'+(fin&&f.w?'<em>W</em>':"")+'</div>'}
function fcBout(b,i,n){var main=i===0,lv=b.state==="in",st=lv?"LIVE"+(b.rd?" · R"+b.rd:"")+(b.clk&&b.clk!=="-"?" "+b.clk:""):b.state==="post"?(b.det||"Final"):fcWhen(b.date);
 return '<li class="fc-b'+(main?" main":"")+(lv?" live":"")+'"><div class="fc-m"><span>'+(main?"Main event · ":i===1?"Co-main · ":"")+esc(b.wc||"")+'</span><b>'+(lv?'<i></i>':"")+esc(st)+'</b></div><div class="fc-v">'+fcFighter(b.f[0]||{n:"TBA"},"l",b)+'<span class="fc-vs">VS</span>'+fcFighter(b.f[1]||{n:"TBA"},"r",b)+'</div></li>'}
function fightCard(force){
 var on=(location.hash||"")==="#mma",view=$("#view");if(!view)return;var box=document.getElementById("fcBox");
 if(!on||!UFC||!UFC.bouts||!UFC.bouts.length){if(box&&!on)box.remove();return}
 if(box&&!force&&box.parentNode)return;
 if(!box){box=document.createElement("section");box.id="fcBox";box.className="fc";box.setAttribute("aria-label","UFC fight card")}
 var bs=UFC.bouts.slice().reverse(),lv=bs.some(function(b){return b.state==="in"}),done=bs.filter(function(b){return b.state==="post"}).length;
 box.innerHTML='<div class="fc-h"><div class="fc-k">'+(lv?'<i></i>Live now':UFC.state==="post"?"Results":"Next card")+' · UFC</div><h2>'+esc(UFC.name||"UFC")+'</h2><p>'+esc(fcWhen(UFC.date))+(UFC.venue?" · "+esc(UFC.venue):"")+' · '+bs.length+' bouts'+(done?" · "+done+" finished":"")+'</p></div><ol class="fc-l">'+bs.map(function(b,i){return fcBout(b,i,bs.length)}).join("")+'</ol><p class="pt-n">Fight card and results from ESPN’s public MMA scoreboard, checked every 5 minutes.</p>';
 if(!box.parentNode||box.parentNode!==view)view.insertBefore(box,view.firstChild)}

/* ---------- Highlights page (#highlights) ---------- */
var hlLg="all",hlIO=null;
function hlAll(){var out=[];if(!PL||!PL.games)return out;Object.keys(PL.games).forEach(function(id){var e=PL.games[id];(e.plays||[]).forEach(function(x,i){if(x.hl)out.push({id:id,e:e,x:x,i:i})})});
 out.sort(function(a,b){return String(b.x.at||"").localeCompare(String(a.x.at||""))||b.i-a.i});return out}
function hlCard(it,k){var e=it.e,h=it.x.hl,g={lg:e.lg,a:e.a,h:e.h};
 return '<a class="hlc" href="#game-'+esc(it.id)+'" style="--tc:'+tcol(e.lg,hlTeam(h))+'"><div class="hlc-f">'+(hoops(g)?miniCourt(g,h,true):miniField(g,h,true))+'</div><div class="hlc-b"><em>'+esc(e.lg)+" · "+esc(hlKind(h))+" · "+esc(h.t||"")+'</em><h3>'+esc(hlTitle(h))+'</h3><p>'+esc(hlSub(h))+'</p><small>'+logoImg(e.lg,e.a,"sm",40)+esc(e.a+" "+(h.sa!=null?h.sa:e.as)+" · ")+logoImg(e.lg,e.h,"sm",40)+esc(e.h+" "+(h.sh!=null?h.sh:e.hs))+(/LIVE|HALF/.test(e.st||"")?' · <b class="lv">LIVE</b>':"")+'</small></div></a>'}
function hlFill(){var box=document.getElementById("hlGrid");if(!box)return;var l=hlAll(),lgs={};l.forEach(function(it){lgs[it.e.lg]=1});
 var f=$("#hlF");if(f)f.innerHTML=["all"].concat(Object.keys(lgs)).map(function(k){return '<button type="button" data-hl="'+esc(k)+'" aria-pressed="'+(hlLg===k)+'">'+(k==="all"?"All":esc(k))+'</button>'}).join("");
 var shown=l.filter(function(it){return hlLg==="all"||it.e.lg===hlLg}).slice(0,40);
 box.innerHTML=shown.length?shown.map(hlCard).join(""):'<p class="pt-e">'+(PL?"No big plays yet. Highlights land here as they happen: 20+ yard passes, 15+ yard runs, takeaways and return scores, drawn on the field.":"Loading highlights…")+'</p>';
 if(hlIO)hlIO.disconnect();if(!window.IntersectionObserver)return;
 hlIO=new IntersectionObserver(function(en){en.forEach(function(x){var sv=x.target.querySelector("svg");if(!sv||!sv.pauseAnimations)return;if(x.isIntersecting)sv.unpauseAnimations();else sv.pauseAnimations()})},{rootMargin:"80px"});
 box.querySelectorAll(".hlc-f").forEach(function(el){hlIO.observe(el)})}
window.VHL={view:function(){return '<section class="hlv"><header class="hlv-h"><div class="hlv-k"><i></i>Live highlights</div><h1>Big plays, on the field</h1><p>Football: every 20+ yard pass, 15+ yard run, takeaway and return score. Hoops: threes, dunks and blocks. Each one drawn on the field or court with the players who made it.</p><div class="hlv-f" id="hlF" role="group" aria-label="Filter by league"></div></header><div class="hlv-g" id="hlGrid"></div><p class="pt-n">Plays and names from ESPN’s public play-by-play. Player positions other than the ball carrier, passer and receiver are illustrative.</p></section>'},
 after:function(){hlFill();var f=$("#hlF");if(f&&!f._b){f._b=1;f.addEventListener("click",function(ev){var b=ev.target.closest("[data-hl]");if(b){hlLg=b.getAttribute("data-hl");hlFill()}})}}};

/* ---------- Arena ---------- */
var AR=null,sel=null,st={rx:58,rz:-16,drag:false,idle:0,t0:performance.now(),vis:true},seen={};
function onArenaPage(){var h=(location.hash||"#home").slice(1);return h===""||h==="home"||h==="scores"}
function build(){
 var app=$("#app"),view=$("#view");if(!app||!view)return;
 AR=document.createElement("section");AR.className="arena";AR.id="arena";AR.setAttribute("aria-label","Live Arena");
 AR.innerHTML='<div class="ar-in"><div class="ar-stage" id="arStage" tabindex="0" aria-label="3D stadium. Drag or use arrow keys to look around."><div class="ar-cam"><div class="ar-world" id="arWorld"></div></div><div class="ar-fx" id="arFx"></div><div class="ar-hlw" id="arHlc" aria-live="polite"></div><div class="ar-hint" id="arHint">Drag to spin the stadium</div></div>'+
 '<div class="ar-side" id="arSide" aria-live="polite"></div></div>';
 app.insertBefore(AR,view);
 var stg=$("#arStage"),lx=0,ly=0;
 stg.addEventListener("pointerdown",function(e){st.drag=true;lx=e.clientX;ly=e.clientY;try{stg.setPointerCapture(e.pointerId)}catch(_){}hint()});
 stg.addEventListener("pointermove",function(e){if(!st.drag)return;st.rz+=(e.clientX-lx)*.35;st.rx=Math.max(34,Math.min(74,st.rx-(e.clientY-ly)*.2));lx=e.clientX;ly=e.clientY;st.idle=performance.now();apply()});
 ["pointerup","pointercancel","lostpointercapture"].forEach(function(t){stg.addEventListener(t,function(){st.drag=false;st.idle=performance.now()})});
 stg.addEventListener("keydown",function(e){var k=e.key;if(k==="ArrowLeft")st.rz-=8;else if(k==="ArrowRight")st.rz+=8;else if(k==="ArrowUp")st.rx=Math.min(74,st.rx+4);else if(k==="ArrowDown")st.rx=Math.max(34,st.rx-4);else return;e.preventDefault();st.idle=performance.now();hint();apply()});
 var ro=new ResizeObserver(function(){var w=stg.clientWidth,h=stg.clientHeight;var sc=Math.min(w/880,h/520);$("#arWorld").style.setProperty("--sc",Math.max(.34,Math.min(1.08,sc)).toFixed(3))});ro.observe(stg);
 var io=new IntersectionObserver(function(en){st.vis=en[0].isIntersecting});io.observe(stg);
 AR.addEventListener("click",function(e){
  var c=e.target.closest("[data-ar]");if(c){sel=c.getAttribute("data-ar");userSel=true;render(true);return}
  if(e.target.closest("#arTheater"))openTheater();
 });
 if(!RM)requestAnimationFrame(loop);
}
function hint(){var h=$("#arHint");if(h)h.classList.add("gone")}
function apply(){var w=$("#arWorld");if(!w)return;w.style.setProperty("--rx",st.rx.toFixed(2)+"deg");w.style.setProperty("--rz",st.rz.toFixed(2)+"deg")}
function loop(now){
 if(AR&&!AR.hidden&&st.vis&&!document.hidden&&!st.drag&&now-st.idle>2500){
  var t=(now-st.t0)/1000;st.rz+=((-16+Math.sin(t*.18)*26)-st.rz)*.02;st.rx+=((58+Math.sin(t*.11)*4)-st.rx)*.02;apply()}
 requestAnimationFrame(loop)}
var PRI={NFL:0,NBA:1,CFB:2,CBB:3},userSel=false;function pr(g){var k=String(g.lg).toUpperCase();return k in PRI?PRI[k]:9}
function current(){var l=games();if(!l.length)return null;var g=null;for(var i=0;i<l.length;i++)if(gid(l[i])===sel)g=l[i];if(g&&!userSel&&!isLive(g)&&l.some(isLive))g=null;
if(!g){var lv=l.filter(isLive),pool=lv.length?lv:l;g=pool.slice().sort(function(x,y){return pr(x)-pr(y)})[0];sel=gid(g)}return g}
var lastKind=null,lastSel=null;
function render(full){
 if(!AR)return;syncMeta();
 AR.hidden=!onArenaPage()||!games().length;if(AR.hidden)return;
 var g=current();if(!g)return;
 var fb=football(g),kind=(fb?"f":"c")+sel,w=$("#arWorld");
 if(full||kind!==lastKind){
  var ca=tcol(g.lg,g.a),ch=tcol(g.lg,g.h);
  w.className="ar-world"+(fb?"":" court");
  w.innerHTML='<div class="ar-ground"></div>'+
   '<div class="ar-st n" style="--c1:'+ch+';--c2:#d9e0dc"></div><div class="ar-st s" style="--c1:'+ca+';--c2:#d9e0dc"></div><div class="ar-st w" style="--c1:'+ca+';--c2:'+ch+'"></div><div class="ar-st e" style="--c1:'+ch+';--c2:'+ca+'"></div>'+
   '<div class="ar-floor">'+(fb?fieldSVG(g):courtSVG(g))+'<svg class="ar-play" id="arPlay" viewBox="0 0 720 360" preserveAspectRatio="none" aria-hidden="true"></svg>'+'</div><div class="ar-pool"></div>'+
   '<div class="ar-lead l" style="--lc:'+ca+'"></div><div class="ar-lead r" style="--lc:'+ch+'"></div>'+
   '<div class="ar-goal l">'+goalSVG(fb)+'</div><div class="ar-goal r">'+goalSVG(fb)+'</div>'+
   '<div class="ar-tw a"><i></i></div><div class="ar-tw b"><i></i></div><div class="ar-tw c"><i></i></div><div class="ar-tw d"><i></i></div>'+
   '<div class="ar-shadow"></div><div class="ar-jb"><div class="ar-bob"><div class="ar-box" style="--ca:'+ca+';--ch:'+ch+'"><div class="ar-f bk"></div><div class="ar-f lt"></div><div class="ar-f rt"></div><div class="ar-f tp"></div><div class="ar-f bt"></div><div class="ar-f fr" id="arScreen">'+jbHTML(g)+'</div></div></div></div>';
  lastKind=kind;arPlay.k=null;apply()}
 else{
  var scr=$("#arScreen"),oa=scr.querySelector('[data-k=as]').textContent,oh=scr.querySelector('[data-k=hs]').textContent;
  scr.innerHTML=jbHTML(g);
  if(lastSel===sel){flapTo(scr.querySelector('[data-k=as]'),oa,g.as);flapTo(scr.querySelector('[data-k=hs]'),oh,g.hs)}
 }
 lastSel=sel;arPlay(g);
 var lead=g.as===g.hs?"":g.as>g.hs?"l":"r";
 AR.querySelectorAll(".ar-lead").forEach(function(x){x.classList.toggle("on",!!lead&&x.classList.contains(lead)&&isLive(g))});
 side(g)}
function arPlay(g){
 var sv=document.getElementById("arPlay"),cap=document.getElementById("arHlc");if(!football(g)&&!hoops(g)){if(cap)cap.innerHTML="";return}
 var id=gid(g),e=PL&&PL.games&&PL.games[id],x=lastHl(id),k=x?id+"|"+x.key:id+"|"+(e&&e.sh?e.sh.length:0);if(k===arPlay.k)return;arPlay.k=k;
 if(cap)cap.innerHTML=x?hlCaption(g,x):"";if(!sv)return;
 sv.innerHTML=hoops(g)?hoopsSVG(g,x&&x.hl,true,e&&e.sh):x?playSVG(g,x.hl,true):"";try{sv.setCurrentTime(0)}catch(_){}}
function feed(g){var l=plays(gid(g)).slice(-4).reverse();return '<div class="ar-feed"><div class="ar-fh">Play tracker</div>'+(l.length?'<ol class="pls">'+l.map(function(x){return plRow(g,x)}).join("")+'</ol>':'<p class="pt-e">Scoring plays, turnovers and big gains land here as they happen.</p>')+'</div>'}
function side(g){
 var lv=isLive(g),aw=g.as>g.hs,hw=g.hs>g.as,an=nm(g,"a"),hn=nm(g,"h"),d=Math.abs(g.as-g.hs);
 var sum=lv?(d?(aw?an:hn)+" lead by "+d:"Tied at "+g.as):(d?(aw?an:hn)+" won "+Math.max(g.as,g.hs)+"–"+Math.min(g.as,g.hs):"Ended tied "+g.as+"–"+g.hs);
 var row=function(k,up){var r=g[k+"r"];return '<div class="ar-row'+(up?" up":"")+'"><u style="--tc:'+tcol(g.lg,g[k])+'"></u>'+logoImg(g.lg,g[k],"lg",120)+'<div><h3>'+esc(nm(g,k))+'</h3><small>'+esc(g[k])+(r?" · "+esc(r):"")+(k==="h"?" · home":"")+'</small></div><strong>'+esc(g[k+"s"])+'</strong></div>'};
 var l=games().slice(0,14);
 var chips=l.length>1?'<div class="ar-chips" role="group" aria-label="Pick a game">'+l.map(function(x){var id=gid(x),on=id===sel;return '<button type="button" class="ar-chip'+(isLive(x)?" live":"")+'" data-ar="'+esc(id)+'" aria-pressed="'+on+'"><em>'+esc(x.lg)+" · "+esc(clock(x))+'</em><span>'+logoImg(x.lg,x.a,"sm",40)+esc(x.a)+" "+esc(x.as)+'</span><span>'+logoImg(x.lg,x.h,"sm",40)+esc(x.h)+" "+esc(x.hs)+'</span></button>'}).join("")+'</div>':"";
 var sd=$("#arSide"),keep=sd.querySelector(".ar-chips"),sl=keep?keep.scrollLeft:0;
 sd.innerHTML='<div class="ar-kick'+(lv?"":" fin")+'"><i></i>'+(lv?"Live now":"Latest final")+" · "+esc(g.lg)+(g.note?" · "+esc(g.note):"")+" · "+esc(clock(g))+'</div>'+
  row("a",lv?false:aw)+row("h",lv?false:hw)+'<p class="ar-sum">'+esc(sum)+'</p>'+latestCall(g)+feed(g)+
  '<div class="ar-act"><a class="ar-btn pri" href="#game-'+esc(gid(g))+'">Full game</a><button type="button" class="ar-btn" id="arTheater"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h18v12H3zM8 21h8M12 17v4" fill="none" stroke="currentColor" stroke-width="2"/></svg>Arena view</button></div>'+chips;
 var nc=sd.querySelector(".ar-chips");if(nc)nc.scrollLeft=sl;
 if(lv){var up=aw?"a":hw?"h":null;sd.querySelectorAll(".ar-row").forEach(function(r,i){if(up&&((i===0&&up==="a")||(i===1&&up==="h")))r.classList.add("up")})}
}
function burst(color,label){
 var fx=$("#arFx");if(!fx||RM)return;var h="";
 for(var i=0;i<42;i++){var a=Math.random()*Math.PI*2,r=90+Math.random()*220;h+='<i style="--pc:'+(i%3?color:"#ffb21a")+';--dx:'+Math.round(Math.cos(a)*r*1.4)+'px;--dy:'+Math.round(Math.sin(a)*r)+'px;--rot:'+Math.round(Math.random()*720)+'deg;animation-delay:'+Math.round(Math.random()*120)+'ms"></i>'}
 fx.innerHTML=h+'<div class="ar-banner">'+esc(label)+'</div>';
 var s=$("#arScreen .jb");if(s)s.classList.add("flash");
 clearTimeout(burst.t);burst.t=setTimeout(function(){fx.innerHTML=""},2800)}

/* ---------- change detection ---------- */
var lastSig="",bootAt=Date.now();
function tick(){
 var l=games();var sig=JSON.stringify(l.map(function(g){return [gid(g),g.as,g.hs,g.st]}));
 if(sig===lastSig){if(AR){var want=!(onArenaPage()&&l.length);if(AR.hidden!==want)render(true)}return}
 var first=!lastSig;lastSig=sig;
 l.forEach(function(g){
  var id=gid(g),p=seen[id];
  if(!first&&Date.now()-bootAt>8000&&p&&(p[0]!==g.as||p[1]!==g.hs)){
   var scorer=g.as-p[0]>g.hs-p[1]?"a":"h",pts=Math.max(g.as-p[0],g.hs-p[1]);
   if(id===sel&&pts>0)setTimeout(function(){if(Date.now()-(lastBurst[id]||0)<5000)return;burst(tcol(g.lg,g[scorer]),nm(g,scorer)+" +"+pts)},350);
   else{var c=AR&&AR.querySelector('[data-ar="'+id+'"]');if(c)setTimeout(function(){var cc=AR.querySelector('[data-ar="'+id+'"]');if(cc)cc.classList.add("ping")},50)}
  }
  seen[id]=[g.as,g.hs]});
 render(false);thRender();bottomLine();bpRefresh()}

/* ---------- score cards: colors + flaps ---------- */
var cardSeen={};
function decorate(){
 var a=A();if(!a||!a.D)return;var map={};(a.D.ticker||[]).forEach(function(g){map[gid(g)]=g});
 document.querySelectorAll("#view .sc[data-game]").forEach(function(c){
  var g=map[c.getAttribute("data-game")];if(!g)return;
  if(!c._dec){c.style.setProperty("--ta",tcol(g.lg,g.a));c.style.setProperty("--th",tcol(g.lg,g.h));c._dec=1}
  var id=gid(g),p=cardSeen[id],bs=c.querySelectorAll(".sc-r b");
  if(p&&bs.length===2&&(p[0]!==g.as||p[1]!==g.hs)){flapTo(bs[0],p[0],g.as);flapTo(bs[1],p[1],g.hs);c.classList.add("scored")}
 });
 (a.D.ticker||[]).forEach(function(g){cardSeen[gid(g)]=[g.as,g.hs]})}

/* ---------- 3D tilt ---------- */
var TSEL=".card,.hero,.sc,.dcard",tcur=null;
if(window.matchMedia&&matchMedia("(hover:hover) and (pointer:fine)").matches&&!RM){
 document.addEventListener("pointermove",function(e){
  var el=e.target.closest&&e.target.closest(TSEL);
  if(tcur&&tcur!==el){tcur.classList.remove("t3d");tcur.classList.add("t3d-out");tcur.style.removeProperty("--tx");tcur.style.removeProperty("--ty");tcur=null}
  if(!el)return;var r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height,m=el.classList.contains("hero")?4:el.classList.contains("sc")?10:7;
  el.classList.remove("t3d-out");el.classList.add("t3d");tcur=el;
  el.style.setProperty("--ty",((x-.5)*m).toFixed(2)+"deg");el.style.setProperty("--tx",((.5-y)*m).toFixed(2)+"deg");
  el.style.setProperty("--gx",(x*100).toFixed(1)+"%");el.style.setProperty("--gy",(y*100).toFixed(1)+"%")},{passive:true});
 document.addEventListener("pointerleave",function(){if(tcur){tcur.classList.remove("t3d");tcur=null}});
}

/* ---------- Theater (Arena view) ---------- */
var TH=null,thI=0,thT=null;
function openTheater(){
 if(!TH){TH=document.createElement("div");TH.className="th";TH.setAttribute("role","dialog");TH.setAttribute("aria-modal","true");TH.setAttribute("aria-label","Arena view");
  TH.innerHTML='<div class="th-top"><h2>Arena <span>view</span></h2><button type="button" class="th-x" id="thX" aria-label="Close arena view">×</button></div><div class="th-cam" id="thCam"><div class="th-ring" id="thRing"></div></div><div class="th-bot"><button type="button" class="ar-btn" id="thP" aria-label="Previous game">←</button><p id="thCap"></p><button type="button" class="ar-btn" id="thN" aria-label="Next game">→</button></div>';
  document.body.appendChild(TH);
  $("#thX").onclick=closeTheater;$("#thP").onclick=function(){thGo(-1,true)};$("#thN").onclick=function(){thGo(1,true)};
  $("#thRing").addEventListener("click",function(e){var c=e.target.closest(".th-card");if(!c)return;var i=+c.getAttribute("data-i");if(i===thIdx())location.hash="game-"+c.getAttribute("data-g"),closeTheater();else{thI+=((i-thIdx()+thN()+thN()/2)%thN())-thN()/2;thPos();restartAuto()}});
  var sx=null;$("#thCam").addEventListener("pointerdown",function(e){sx=e.clientX});$("#thCam").addEventListener("pointerup",function(e){if(sx!==null&&Math.abs(e.clientX-sx)>40)thGo(e.clientX<sx?1:-1,true);sx=null});
  window.addEventListener("resize",function(){if(TH&&!TH.hidden)thRender(true)});
 }
 TH.hidden=false;document.body.style.overflow="hidden";
 var l=games();thI=0;for(var i=0;i<l.length;i++)if(gid(l[i])===sel)thI=i;
 thRender(true);$("#thX").focus();restartAuto();
 try{if(TH.requestFullscreen)TH.requestFullscreen().catch(function(){})}catch(_){}
 document.addEventListener("keydown",thKey)}
function closeTheater(){if(!TH)return;TH.hidden=true;document.body.style.overflow="";clearInterval(thT);document.removeEventListener("keydown",thKey);try{if(document.fullscreenElement)document.exitFullscreen()}catch(_){}var b=$("#arTheater");if(b)b.focus()}
function thKey(e){if(e.key==="Escape")closeTheater();else if(e.key==="ArrowRight")thGo(1,true);else if(e.key==="ArrowLeft")thGo(-1,true)}
function thList(){return games().slice(0,12)}
function thN(){return Math.max(1,thList().length)}
function thIdx(){var n=thN();return ((thI%n)+n)%n}
function thGo(d,user){thI+=d;thPos();if(user)restartAuto()}
function restartAuto(){clearInterval(thT);if(!RM&&thN()>1)thT=setInterval(function(){thGo(1)},6000)}
var thSig="";
function thRender(force){
 if(!TH||TH.hidden)return;var l=thList(),n=l.length,ring=$("#thRing");
 var vw=Math.min(window.innerWidth,1400),cw=Math.round(Math.max(240,Math.min(vw<700?vw*.84:vw*.5,620,(window.innerHeight-220)/.56*.9)));
 ring.style.setProperty("--cw",cw+"px");
 var sig=JSON.stringify(l)+cw;if(!force&&sig===thSig){thPos();return}thSig=sig;
 var R=n>1?Math.round(cw/2/Math.tan(Math.PI/n)+40):0;R=Math.max(R,n>2?cw*.62:cw*.55);
 ring._R=R;
 ring.innerHTML=l.map(function(g,i){return '<div class="th-card" data-i="'+i+'" data-g="'+esc(gid(g))+'" style="transform:rotateY('+(i*360/n)+'deg) translateZ('+R+'px)">'+jbHTML(g)+'</div>'}).join("");
 thPos()}
function thPos(){var ring=$("#thRing");if(!ring)return;var n=thN(),l=thList(),R=ring._R||0;
 ring.style.transform="translateZ("+(-R)+"px) rotateY("+(-thI*360/n)+"deg)";
 var k=thIdx();ring.querySelectorAll(".th-card").forEach(function(c,i){var d=Math.abs(i-k);d=Math.min(d,n-d);c.classList.toggle("off",i!==k);c.classList.toggle("far",d>1)});
 var g=l[k];$("#thCap").textContent=g?(nm(g,"a")+" at "+nm(g,"h")+" · "+(isLive(g)?"Live, "+clock(g):"Final")+" · "+(k+1)+" of "+n+". Tap the front screen for the full game."):"No games right now."}

/* ---------- VAULT Booth (virtual announcers; every fact comes from the tracked plays) ---------- */
/* ---------- Broadcast crews: every game gets its own two-person booth (fictional announcers) ---------- */
var H_SHORT='<path d="M-55 372C-62 300-16 290 4 296C40 296 62 318 55 372C50 344 30 330 6 332C-18 333-40 342-55 372Z" fill="$"/>',
 H_BUZZ='<path d="M-53 366C-56 312-24 300 0 300C26 300 56 312 53 366C44 340 26 328 0 328C-26 328-44 340-53 366Z" fill="$"/>',
 H_BALD='<path d="M-53 380C-56 360-52 350-48 346L-44 372ZM53 380C56 360 52 350 48 346L44 372Z" fill="$"/>',
 H_CURLY='<g fill="$"><circle cx="-38" cy="330" r="20"/><circle cx="-12" cy="314" r="22"/><circle cx="16" cy="314" r="22"/><circle cx="40" cy="332" r="20"/><circle cx="-50" cy="356" r="13"/><circle cx="50" cy="356" r="13"/></g>',
 H_LONG='<path d="M-58 470C-74 400-70 300 0 296C70 300 74 400 58 470L44 470C52 420 50 360 40 346C20 336-20 336-40 346C-50 360-52 420-44 470Z" fill="$"/><path d="M-50 360C-40 316 40 316 50 360C30 340-30 340-50 360Z" fill="$"/>',
 H_BUN='<circle cx="0" cy="292" r="20" fill="$"/><path d="M-54 372C-60 304-20 296 0 298C20 296 60 304 54 372C46 340 24 328 0 328C-24 328-46 340-54 372Z" fill="$"/>',
 H_SIDE='<path d="M-55 368C-60 306-20 294 8 298C42 300 60 322 54 368C48 336 34 324 -6 326C-30 328-46 340-55 368Z" fill="$"/><path d="M-6 300L-14 330" stroke="#0000" />';
function look(o){var d={skin:"#E9B996",skin2:"#D49E7B",jacket:"#14213D",lapel:"#0E1730",shirt:"#F1F5FB",tie:"#2563EB",brow:"#3B2A20",accent:"#2563EB",hairC:"#3B2A20",hs:H_SHORT,beard:null,glasses:false,f:false};for(var k in o)d[k]=o[k];d.hair=d.hs.split("$").join(d.hairC);return d}
var CREWS=[
 {rex:{n:"Rex Calloway",f:"Rex",i:"RC",c:"#2563EB",lk:look({}),v:{g:"m",p:1.0,r:1.05}},
  ice:{n:"Dante “Ice” Whitfield",f:"Ice",i:"DW",c:"#60A5FA",lk:look({skin:"#8D5A3B",skin2:"#7A4B30",jacket:"#3E7BD6",lapel:"#2F63B5",shirt:"#0B0F19",tie:null,brow:"#1A0F0A",accent:"#60A5FA",beard:"#1F140E",hairC:"#1A120D",hs:H_BUZZ}),v:{g:"m",p:.82,r:.97}}},
 {rex:{n:"Marcus Bell",f:"Marcus",i:"MB",c:"#f59e0b",lk:look({skin:"#6B4226",skin2:"#5A3720",jacket:"#2b2b2b",lapel:"#1c1c1c",tie:"#f59e0b",hairC:"#120c08",hs:H_BALD,beard:"#140d09",glasses:true,brow:"#120c08",accent:"#f59e0b"}),v:{g:"m",p:.9,r:1.08}},
  ice:{n:"Tony “Coach” Reyes",f:"Coach",i:"TR",c:"#fbbf24",lk:look({skin:"#C98E64",skin2:"#B07A52",jacket:"#5b1d1d",lapel:"#451515",tie:"#d4d4d4",hairC:"#9ca3af",hs:H_SIDE,brow:"#6b7280",accent:"#fbbf24"}),v:{g:"m",p:.75,r:.92}}},
 {rex:{n:"Lena Ortiz",f:"Lena",i:"LO",c:"#ec4899",lk:look({skin:"#D9A27C",skin2:"#C58C66",jacket:"#1e1b4b",lapel:"#151238",shirt:"#f5e9ef",tie:null,hairC:"#2a160d",hs:H_LONG,brow:"#2a160d",accent:"#ec4899",f:true}),v:{g:"f",p:1.1,r:1.06}},
  ice:{n:"“Big” Earl Jackson",f:"Earl",i:"EJ",c:"#f472b6",lk:look({skin:"#5C3A24",skin2:"#4C2F1D",jacket:"#3f3f46",lapel:"#27272a",tie:"#be185d",hairC:"#0f0a07",hs:H_BUZZ,beard:"#0f0a07",brow:"#0f0a07",accent:"#f472b6"}),v:{g:"m",p:.7,r:.9}}},
 {rex:{n:"Jim Halvorsen",f:"Jim",i:"JH",c:"#22c55e",lk:look({skin:"#F0C4A4",skin2:"#DCAA88",jacket:"#14532d",lapel:"#0f3d21",tie:"#facc15",hairC:"#d6d3d1",hs:H_SIDE,glasses:true,brow:"#a8a29e",accent:"#22c55e"}),v:{g:"m",p:.95,r:1.0}},
  ice:{n:"Keisha Monroe",f:"Keisha",i:"KM",c:"#4ade80",lk:look({skin:"#7B4B2E",skin2:"#683E25",jacket:"#f5f5f4",lapel:"#e7e5e4",shirt:"#14532d",tie:null,hairC:"#140c07",hs:H_CURLY,brow:"#140c07",accent:"#4ade80",f:true}),v:{g:"f",p:1.0,r:1.0}}},
 {rex:{n:"Sam “Sparky” Delgado",f:"Sparky",i:"SD",c:"#ef4444",lk:look({skin:"#C68A5E",skin2:"#B1774E",jacket:"#7f1d1d",lapel:"#5c1515",tie:"#fafafa",hairC:"#1c1917",hs:H_SHORT,brow:"#1c1917",accent:"#ef4444"}),v:{g:"m",p:1.15,r:1.14}},
  ice:{n:"Ray Booker",f:"Ray",i:"RB",c:"#f87171",lk:look({skin:"#8A5A3C",skin2:"#774C31",jacket:"#0c0a09",lapel:"#000",tie:"#ef4444",hairC:"#57534e",hs:H_BUZZ,beard:"#78716c",glasses:true,brow:"#57534e",accent:"#f87171"}),v:{g:"m",p:.8,r:.94}}},
 {rex:{n:"Nina Park",f:"Nina",i:"NP",c:"#a855f7",lk:look({skin:"#EBC6A3",skin2:"#D9B08C",jacket:"#3b0764",lapel:"#2e0550",shirt:"#f3e8ff",tie:null,hairC:"#0b0b0b",hs:H_BUN,brow:"#0b0b0b",accent:"#a855f7",f:true}),v:{g:"f",p:1.15,r:1.08}},
  ice:{n:"Doug “Tank” Brennan",f:"Tank",i:"DB",c:"#c084fc",lk:look({skin:"#E3A985",skin2:"#CF946F",jacket:"#1f2937",lapel:"#111827",tie:"#7c3aed",hairC:"#b45309",hs:H_SHORT,beard:"#b45309",brow:"#92400e",accent:"#c084fc"}),v:{g:"m",p:.68,r:.9}}},
 {rex:{n:"Cole Whitaker",f:"Cole",i:"CW",c:"#06b6d4",lk:look({skin:"#F2C9A8",skin2:"#DEB18E",jacket:"#0c4a6e",lapel:"#083344",tie:"#e2e8f0",hairC:"#a16207",hs:H_SHORT,brow:"#854d0e",accent:"#06b6d4"}),v:{g:"m",p:1.05,r:1.1}},
  ice:{n:"Andre Simms",f:"Dre",i:"AS",c:"#22d3ee",lk:look({skin:"#4A2E1C",skin2:"#3D2516",jacket:"#e2e8f0",lapel:"#cbd5e1",shirt:"#0c4a6e",tie:"#0e7490",hairC:"#0a0705",hs:H_CURLY,beard:"#0a0705",brow:"#0a0705",accent:"#22d3ee"}),v:{g:"m",p:.85,r:1.0}}},
 {rex:{n:"Priya Desai",f:"Priya",i:"PD",c:"#f97316",lk:look({skin:"#B8805A",skin2:"#A36F4C",jacket:"#431407",lapel:"#2f0e05",shirt:"#fff7ed",tie:null,hairC:"#0c0806",hs:H_LONG,brow:"#0c0806",accent:"#f97316",f:true}),v:{g:"f",p:1.05,r:1.04}},
  ice:{n:"Mike Kowalski",f:"Kowalski",i:"MK",c:"#fb923c",lk:look({skin:"#EDBB98",skin2:"#D9A47F",jacket:"#292524",lapel:"#1c1917",tie:"#ea580c",hairC:"#44403c",hs:H_BALD,beard:"#57534e",glasses:true,brow:"#44403c",accent:"#fb923c"}),v:{g:"m",p:.78,r:.95}}}
];
var CREW={rex:Object.assign({r:"Play-by-play"},CREWS[0].rex),ice:Object.assign({r:"Analyst"},CREWS[0].ice),sid:{n:"",f:"",r:"Sideline reporter",lk:null,v:{g:"f",p:1,r:1}}};
/* the VAULT studio: fictional hosts who whip around every live game */
var STUDIO={rex:{n:"Jordan Avery",f:"Jordan",i:"JA",c:"#facc15",r:"Studio host",lk:look({skin:"#A8714A",skin2:"#93613E",jacket:"#111827",lapel:"#030712",tie:"#facc15",hairC:"#0f0a07",hs:H_BUZZ,brow:"#0f0a07",accent:"#facc15"}),v:{g:"m",p:.95,r:1.06}},
 ice:{n:"Kim Sato",f:"Kim",i:"KS",c:"#fde047",r:"VAULT insider",lk:look({skin:"#EFCDAD",skin2:"#DDB794",jacket:"#7c2d12",lapel:"#5a200d",shirt:"#fff7ed",tie:null,hairC:"#0b0b0b",hs:H_BUN,glasses:true,brow:"#0b0b0b",accent:"#fde047",f:true}),v:{g:"f",p:1.08,r:1.04}}};
function hsh(s){var h=0;s=String(s);for(var i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;return h}
var CREW_ASSIGN={},CREW_N=0;
/* more games than hand-made crews: build extra fictional crews from name and look pools */
var FN_M=["Chris","Brett","Gus","Kenny","Troy","Dave","Lou","Jalen","Mateo","Hank","Victor","Owen","Terrence","Wes","Reggie","Paul"],FN_F=["Erin","Tasha","Molly","Gabriela","Joy","Renee","Hannah","Dana","Simone","Kara"],
 LN=["Abernathy","Castillo","Pryor","McGill","Nakamura","Sutton","Okafor","Lindqvist","Barrett","Fontaine","Hayes","Quinlan","Romero","Whitmore","Dalton","Esposito","Graves","Ibarra","Kincaid","Mercer","Ashford","Beaumont","Caldwell","Donnelly","Eckert","Farrow","Gallagher","Holloway","Iverson","Jett","Kessler","Lockhart","Marlowe","Novak","Osei","Pemberton","Rhodes","Salazar","Thibodeau","Underwood","Valdez","Winslow","Yates","Zimmer"],
 SK=[["#F0C4A4","#DCAA88"],["#E3A985","#CF946F"],["#C68A5E","#B1774E"],["#8D5A3B","#7A4B30"],["#5C3A24","#4C2F1D"],["#B8805A","#A36F4C"]],
 HC=["#1c1917","#3B2A20","#a16207","#9ca3af","#0b0b0b","#7c2d12"],JK=["#14213D","#1f2937","#3b0764","#7f1d1d","#0c4a6e","#14532d","#292524","#1e3a8a"],AC=["#2563EB","#ef4444","#22c55e","#f59e0b","#a855f7","#06b6d4","#ec4899","#f97316"];
var GEN_USED={};
function genPerson(seed,f){var r=rnd(hsh(seed)%2147483646+1),pk=function(a){return a[Math.floor(r()*a.length)]};var sk=pk(SK),fn,ln,t=0;do{fn=pk(f?FN_F:FN_M);ln=pk(LN);t++}while((GEN_USED[ln]||GEN_USED[fn+ln])&&t<200);GEN_USED[ln]=GEN_USED[fn+ln]=1;var ac=pk(AC),jk=pk(JK);
 return {n:fn+" "+ln,f:fn,i:fn[0]+ln[0],c:ac,lk:look({skin:sk[0],skin2:sk[1],jacket:jk,lapel:"#0b0f19",tie:f?null:pk(["#e2e8f0",ac,"#0f172a"]),hairC:pk(HC),hs:f?pk([H_LONG,H_BUN,H_CURLY]):pk([H_SHORT,H_BUZZ,H_BALD,H_SIDE,H_CURLY]),beard:!f&&r()<.4?pk(HC):null,glasses:r()<.3,brow:"#1c1917",accent:ac,f:f}),v:{g:f?"f":"m",p:+(f?1+r()*.2:.7+r()*.4).toFixed(2),r:+(.9+r()*.22).toFixed(2)}}}
function ensureCrews(n){n=Math.max(24,n);while(CREWS.length<n){var k=CREWS.length,fem=k%3===1;CREWS.push({rex:genPerson("p"+k,fem),ice:genPerson("c"+k,!fem&&k%4===0)})}
 CREWS.forEach(function(c,k){if(!c.sid)c.sid=genPerson("s"+k,k%2===0)})}
function allGids(){var o={};games().forEach(function(g){o[gid(g)]=1});if(PL&&PL.games)Object.keys(PL.games).forEach(function(k){o[k]=1});return Object.keys(o).sort()}
/* the same game always gets the same crew, on every page and every visit */
function assignCrews(){var ids=allGids(),sig=ids.join(",");if(sig===assignCrews.sig)return;assignCrews.sig=sig;ensureCrews(ids.length);var used={},out={};
 ids.forEach(function(id){var i=hsh(id)%CREWS.length,n=0;while(used[i]&&n<CREWS.length){i=(i+1)%CREWS.length;n++}used[i]=1;out[id]=i});CREW_ASSIGN=out}
function crewIdx(id){assignCrews();if(CREW_ASSIGN[id]==null){ensureCrews(0);CREW_ASSIGN[id]=hsh(id)%CREWS.length}return CREW_ASSIGN[id]}
function setCrew(id){var c=CREWS[crewIdx(id)];CREW={rex:Object.assign({r:"Play-by-play"},c.rex),ice:Object.assign({r:"Analyst"},c.ice),sid:Object.assign({r:"Sideline reporter"},c.sid)};return CREW}
function crewNames(id){var c=CREWS[crewIdx(id)];return c.rex.n.replace(/ “.*”/,"").split(" ").slice(-1)[0]+" & "+c.ice.n.replace(/ “.*”/,"").split(" ").slice(-1)[0]}


function avatar(k){var p=CREW[k];if(p.lk)return '<svg class="bo-av" viewBox="-80 290 160 200" aria-hidden="true"><rect x="-80" y="290" width="160" height="200" fill="#0B1324"/>'+personHead(p.lk)+'<rect x="-79" y="291" width="158" height="198" fill="none" stroke="'+p.c+'" stroke-width="5" rx="80"/></svg>';return '<svg class="bo-av" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="23" fill="#0B1324" stroke="'+p.c+'" stroke-width="2"/><path d="M10 40c3-8 8-11 14-11s11 3 14 11" fill="'+p.c+'" opacity=".35"/><circle cx="24" cy="19" r="8" fill="'+p.c+'" opacity=".55"/><path d="M13 19a11 11 0 0 1 22 0" fill="none" stroke="#DCE6F5" stroke-width="2.4"/><rect x="10" y="17" width="5" height="8" rx="2" fill="#DCE6F5"/><rect x="33" y="17" width="5" height="8" rx="2" fill="#DCE6F5"/><path d="M35 24c0 5-4 7-8 7" fill="none" stroke="#DCE6F5" stroke-width="1.6"/><text x="24" y="45.5" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-size="7" font-weight="900" fill="#fff">'+p.i+'</text></svg>'}
var TWO=["Trail Blazers","Red Storm","Blue Devils","Crimson Tide","Golden Bears","Tar Heels","Sun Devils","Horned Frogs","Red Raiders","Demon Deacons","Black Knights","Rainbow Warriors","Fighting Irish","Nittany Lions","Golden Gophers","Yellow Jackets","Blue Demons","Great Danes","River Hawks","Red Wolves","Golden Eagles","Scarlet Knights","Wolf Pack","Fighting Illini","Golden Flashes","Blue Raiders","Mean Green","Green Wave","Red Hawks","Delta Devils"];
function nick(full){full=String(full||"");for(var i=0;i<TWO.length;i++)if(full.slice(-TWO[i].length)===TWO[i])return TWO[i];var w=full.split(" ");return w[w.length-1]||full}
function pick(arr,seed){var h=0;seed=String(seed);for(var i=0;i<seed.length;i++)h=(h*33+seed.charCodeAt(i))>>>0;return arr[h%arr.length]}
function teamFull(e,t){return t===e.a?e.an:t===e.h?e.hn:t}
function scoreLine(e,sa,sh,scorer){
 if(sa==null||sh==null)return "";var A=nick(e.an),H=nick(e.hn);
 if(sa===sh)return "We're tied at "+sa;
 var lead=sa>sh?A:H,hi=Math.max(sa,sh),lo=Math.min(sa,sh);
 if(scorer&&teamFull(e,scorer)&&nick(teamFull(e,scorer))!==lead)return "The "+nick(teamFull(e,scorer))+" cut it to "+hi+"-"+lo;
 return "The "+lead+" lead it "+hi+"-"+lo}
function cleanDesc(x){return String(x||"").replace(/\s*TOUCHDOWN\.?/i,"").replace(/,\s*$/,"").replace(/\.\s*$/,"")+"."}
function calls(e,x){
 var N=x.tm?nick(teamFull(e,x.tm)):"",S=scoreLine(e,x.sa,x.sh,x.tm),k=x.key||x.x,out=[];
 function R(t,h){out.push({w:"rex",t:t,h:!!h})}function I(t){out.push({w:"ice",t:t})}
 if(x.k==="td"){R(pick(["TOUCHDOWN, "+N+"! ","Into the end zone! ",N+" punch it in! "],k)+cleanDesc(x.x),1);if(S)I(S+pick([". Put that one on the highlight reel.",". That's execution, "+CREW.rex.f+".",". Big swing on the scoreboard."],k+"i"))}
 else if(x.k==="fg"){var m=/^(\S+)\s+(\d+)\s+yard field goal/i.exec(x.x);R("The kick is up... and it's GOOD! "+(m?m[1]+" from "+m[2]+" yards.":cleanDesc(x.x)),1);if(S)I(S+pick([". Points are points.",". Three more on the board.",". You take those every time."],k+"i"))}
 else if(x.k==="xp"){R("Extra point is good."+(S?" "+S+".":""))}
 else if(x.k==="2pt"){R(cleanDesc(x.x),1);if(S)I(S+".")}
 else if(x.k==="sf"){R("SAFETY! Two points for the "+N+"!",1);if(S)I(S+".")}
 else if(x.k==="to"){var n=/turnover #(\d+)/i.exec(x.x);R("TURNOVER! The "+N+" take it away!",1);I(pick(["Huge for that "+N+" defense. Now go cash it in.","Possession is everything in this one, and the "+N+" just got an extra one."],k)+(n?" That's turnover number "+n[1]+" on the day.":""))}
 else if(x.k==="big"){var b=/(\d+)-yard (run|catch)/i.exec(x.x);R(b?"Look out! "+b[1]+"-yard "+b[2]+" for the "+N+"!":cleanDesc(x.x),1);I(b?"Longest "+b[2]+" of the day for them. That changes field position in a hurry.":"That's a chunk play.")}
 else if(x.k==="run"){var r=/(\d+)-0 burst/.exec(x.x);R("The "+N+" are rolling, "+(r?r[1]+"-0":"")+" burst!",x.big);I(x.big?pick(["Somebody call a timeout!","The building is waking up for the "+N+"."],k):S?S+".":"Nice little spurt.")}
 else if(x.k==="three"){var h3=x.hl||{};R(pick(["BANG! ","From downtown! ","Splash! "],k)+(h3.by||N)+(h3.ft?" from "+h3.ft+" feet!":" for three!"),x.big);if(S)I(S+(h3.ast?". Nice find by "+h3.ast+".":"."))}
 else if(x.k==="dunk"){var hd=x.hl||{};R(pick(["OH, HE THREW IT DOWN! ","SLAM! ","Rim-rattler! "],k)+(hd.by||N)+"!",1);I(hd.ast?"What a feed from "+hd.ast+".":pick(["You felt that one in the cheap seats.","Pure power."],k))}
 else if(x.k==="block"){var hb=x.hl||{};R(pick(["Get that outta here! ","REJECTED! ","Not in my house! "],k)+(hb.by||N)+(hb.vs?" sends back "+hb.vs+".":"."),1);I("That's a statement at the rim.")}
 else if(x.k==="big"&&x.hl&&x.hl.qb){R("Look out! "+cleanDesc(x.x),1);I(pick(["That's a chunk play.","Flipped the field in one snap."],k))}
 else if(x.k==="score"){R("Back and forth we go."+(S?" "+S+".":""))}
 else if(x.k==="half"){R("That'll do it for the first half. "+cleanDesc(x.x.replace(/^Halftime:\s*/i,"")));I("Plenty to talk about at the break.")}
 else if(x.k==="final"){R("And that's the ballgame! "+cleanDesc(x.x.replace(/^Final:\s*/i,"")),1);I(x.tm?"The "+nick(teamFull(e,x.tm))+" get it done. What a game.":"What a game.")}
 else R(cleanDesc(x.x));
 return out}
function intro(e,g){
 var lv=/LIVE|HALF/.test(e.st||""),note=g&&g.note?" for "+(/^(the )/i.test(g.note)?"":/game|semifinal|final|bowl|classic/i.test(g.note)?"the ":"")+g.note:"";
 var rec=function(k){var r=g&&g[k+"r"];return r?" ("+r+")":""};
 var st=lv?"We're live, "+String(e.st).replace(/^LIVE\s*/i,"")+" on the clock, and "+scoreLine(e,e.as,e.hs).replace(/^The /,"the ").replace(/^We're/,"we're")+".":"This one is in the books: "+scoreLine(e,e.as,e.hs).replace(/^The /,"the ").replace(/ lead it /," won it ")+".";
 return [{w:"rex",t:"Hello everybody, and welcome in to the VAULT Booth! I'm "+CREW.rex.n.replace(/ “.*?”/,"")+note+", with the "+e.an+rec("a")+" visiting the "+e.hn+rec("h")+". Alongside me as always, "+CREW.ice.n.replace(/ “.*?”/,"")+"."},{w:"ice",t:"Thanks, "+CREW.rex.f+". "+st+" "+pick(["Should be a fun one.","Lot on the line tonight.","Let's get to it."],e.an+e.hn)}]}
function lineHTML(l,isNew){var p=CREW[l.w];return '<li class="bo-l'+(l.h?" hype":"")+(isNew?" new":"")+'">'+avatar(l.w)+'<div><div class="bo-who">'+esc(p.n)+'<em>'+esc(l.when||"")+'</em></div><p class="bo-say">'+esc(l.t)+'</p></div></li>'}
var boSeen={},boAll=false;
function booth(){
 var h=(location.hash||"").slice(1);if(h.indexOf("game-")!==0)return;var id=h.slice(5),art=$("#view article"),gm=art&&art.querySelector(".gm");if(!gm)return;
 var e=PL&&PL.games&&PL.games[id],g=null;games().forEach(function(x){if(gid(x)===id)g=x});setCrew(id);
 if(!e&&g)e={lg:g.lg,a:g.a,h:g.h,an:nm(g,"a"),hn:nm(g,"h"),as:g.as,hs:g.hs,st:isLive(g)?g.st:"FINAL",plays:[]};
 if(!e)return;
 var box=art.querySelector(".booth");if(!box){box=document.createElement("section");box.className="booth";box.setAttribute("aria-label","The VAULT Booth");gm.insertAdjacentElement("afterend",box);
  box.addEventListener("click",function(ev){if(ev.target.closest(".bo-more")){boAll=!boAll;booth()}})}
 var lines=[];(e.plays||[]).slice().reverse().forEach(function(x){calls(e,x).forEach(function(c,i){c.when=i?"":(x.t||"");c.key=(x.key||x.x)+"|"+i;lines.push(c)})});var total=lines.length,show=boAll?lines:lines.slice(0,10);
 var first=!boSeen[id];boSeen[id]=boSeen[id]||{};
 var html=show.map(function(l){var nw=!first&&!boSeen[id][l.key];boSeen[id][l.key]=1;return lineHTML(l,nw)}).join("");
 lines.forEach(function(l){boSeen[id][l.key]=1});
 box.innerHTML='<div class="bo-h"><h2>The VAULT Booth</h2><span>'+(/LIVE|HALF/.test(e.st||"")?"Live call":"Game call")+' · '+esc(e.an)+' at '+esc(e.hn)+'</span></div>'+
  '<div class="bo-crew"><div class="bo-p">'+avatar("rex")+'<div><b>'+esc(CREW.rex.n)+'</b><small>'+CREW.rex.r+'</small></div></div><div class="bo-p">'+avatar("ice")+'<div><b>'+esc(CREW.ice.n)+'</b><small>'+CREW.ice.r+'</small></div></div></div>'+
  '<ol class="bo-lines">'+html+intro(e,g).map(function(l){return lineHTML(l,false)}).join("")+'</ol>'+
  (total>10?'<button type="button" class="bo-more">'+(boAll?"Show latest calls":"Show the full broadcast ("+total+" calls)")+'</button>':"")+
  '<p class="bo-n">'+esc(CREW.rex.f)+' and '+esc(CREW.ice.f)+' are VAULT’s virtual booth for this game, not real broadcasters. Every VAULT game gets its own crew. Their calls are written automatically from the plays VAULT tracks; every name, yard line and score comes from ESPN’s public play-by-play.</p>'}
function latestCall(g){var id=gid(g),e=PL&&PL.games&&PL.games[id];if(!e||!e.plays||!e.plays.length)return "";setCrew(id);var x=e.plays[e.plays.length-1],c=calls(e,x)[0];return '<div class="ar-call">'+avatar("rex")+'<p>“'+esc(c.t)+'”<small>'+esc(CREW.rex.n)+', VAULT Booth'+(x.t?" · "+esc(x.t):"")+'</small></p></div>'}

/* ---------- BottomLine crawl ---------- */
var blSig="";
function bottomLine(){
 var bl=document.getElementById("bl");
 if(!bl){bl=document.createElement("div");bl.id="bl";bl.className="bl";bl.setAttribute("role","region");bl.setAttribute("aria-label","VAULT BottomLine");bl.innerHTML='<div class="bl-tag"><i></i>BottomLine</div><div class="bl-wrap"><div class="bl-track" id="blTrack"></div></div>';document.body.appendChild(bl)}
 var items=[],a=A();
 games().filter(isLive).forEach(function(g){items.push('<a class="bl-it live" href="#game-'+esc(gid(g))+'"><b>'+esc(g.lg)+' · '+esc(clock(g))+'</b>'+esc(g.a)+' '+esc(g.as)+', '+esc(g.h)+' '+esc(g.hs)+'</a>')});
 var bigs=[];if(PL&&PL.games)Object.keys(PL.games).forEach(function(id){var e=PL.games[id];(e.plays||[]).forEach(function(x){if(x.big)bigs.push({id:id,e:e,x:x})})});
 bigs.sort(function(p,q){return String(q.x.at||"").localeCompare(String(p.x.at||""))});
 bigs.slice(0,6).forEach(function(b){items.push('<a class="bl-it big" href="#game-'+esc(b.id)+'"><b>'+esc(KIND[b.x.k]||"Big play")+'</b>'+esc(b.e.a+" vs "+b.e.h)+' <em>'+esc(b.x.x)+'</em></a>')});
 if(a&&a.D&&a.D.stories)a.D.stories.slice(0,5).forEach(function(s){items.push('<a class="bl-it" href="#story-'+esc(s.id)+'"><b>'+esc(a.SPORTS[s.sport]||s.sport)+'</b>'+esc(s.title)+'</a>')});
 games().filter(function(g){return !isLive(g)}).slice(0,6).forEach(function(g){items.push('<a class="bl-it" href="#game-'+esc(gid(g))+'"><b>'+esc(g.lg)+' · Final</b>'+esc(g.a)+' '+esc(g.as)+', '+esc(g.h)+' '+esc(g.hs)+'</a>')});
 var sig=items.join("");if(sig===blSig)return;blSig=sig;
 var t=document.getElementById("blTrack");t.innerHTML=sig+sig;
 requestAnimationFrame(function(){t.style.setProperty("--dur",Math.max(40,Math.round(t.scrollWidth/2/70))+"s")})}

/* ---------- trailer reveals ---------- */
var RVSEL=".hero,.card,.sc,.dcard,.sec-h,.box,.gm,.pt,.booth,.page-h,.page-s,.prose p,.art-hero,.quiz,.vx-card,.vx-h2,.foot-in";
var rvIO=null;
function words(el){if(el._wd||el.children.length)return;var t=el.textContent;if(!t||t.length>140)return;el._wd=1;el.innerHTML=t.split(/(\s+)/).map(function(w,i){return /^\s+$/.test(w)?w:'<span class="wd" style="--d:'+(i*0.035).toFixed(3)+'s">'+esc(w)+'</span>'}).join("");el.classList.add("wds")}
function reveal(root){
 if(RM)return;var v=$("#view");if(!v||v.classList.contains("noanim"))return;
 if(!rvIO)rvIO=new IntersectionObserver(function(en){var k=0;en.forEach(function(x){if(!x.isIntersecting)return;var el=x.target;rvIO.unobserve(el);el.style.transitionDelay=(k++*0.07).toFixed(2)+"s";el.classList.add("in");setTimeout(function(){el.classList.remove("rv","in");el.style.transitionDelay=""},1600)})},{rootMargin:"0px 0px -6% 0px",threshold:.08});
 (root||v).querySelectorAll(RVSEL).forEach(function(el){if(el._rv)return;el._rv=1;el.classList.add("rv");rvIO.observe(el)});
 v.querySelectorAll(".page-h").forEach(function(h){words(h);h.classList.add("wds");setTimeout(function(){h.classList.add("in")},120)})}
function flyIn(){if(RM||!AR)return;var t0=performance.now(),from={rx:84,rz:-150},to={rx:58,rz:-16},w=$("#arWorld");st.drag=true;
 (function step(now){var p=Math.min(1,(now-t0)/2400),e=1-Math.pow(1-p,4);st.rx=from.rx+(to.rx-from.rx)*e;st.rz=from.rz+(to.rz-from.rz)*e;if(w)w.style.setProperty("--fly",(0.55+0.45*e).toFixed(3));apply();if(p<1)requestAnimationFrame(step);else{st.drag=false;st.idle=performance.now();setTimeout(function(){AR.classList.add("settled")},1200)}})(t0)}

/* ---------- Broadcast play-by-play: every snap / possession from e.rp, written like a TV booth ---------- */
function lastName(raw){raw=String(raw||"").replace(/^#\d+\s+/,"").trim();var m=/^[A-Z][a-z]?\.\s?(.+)$/.exec(raw);var n=m?m[1]:raw.split(" ").slice(1).join(" ")||raw;return n.replace(/\s+(Jr\.?|Sr\.?|II|III|IV)$/,"").replace(/\.+$/,"")}
var NM="(?:#\\d+\\s+)?([A-Z][a-zA-Z]?\\.\\s?[A-Za-z][A-Za-z'\\-\\.]*(?:\\s(?:Jr\\.|II|III|IV))?|[A-Z][a-z'\\-]+(?:\\s[A-Z][A-Za-z'\\-]+){1,2})";
var RX={pass:new RegExp(NM+"\\s+pass(?:\\s+complete)?\\s*(short|deep)?\\s*(left|right|middle)?\\s*(?:to|intended for)\\s+"+NM),inc:new RegExp(NM+"\\s+pass\\s+incomplete\\s*(short|deep)?\\s*(left|right|middle)?(?:\\s+(?:to|intended for)\\s+"+NM+")?"),
 rush:new RegExp(NM+"\\s+(?:rush|run|scrambles|up the middle|kneels|(left|right)\\s+(end|tackle|guard))"),sack:new RegExp(NM+"\\s+sacked.*?\\("+NM),sack0:new RegExp(NM+"\\s+sacked"),
 to:/\bto\s+([A-Z]{2,5}\s?-?\d{1,2})\b/,intby:new RegExp("INTERCEPTED by\\s+"+NM,"i"),kick:new RegExp(NM+"\\s+(?:kicks|kickoff|punts)\\s+(\\d+)\\s+yards"),pen:/PENALTY on\s+([A-Z]{2,5})-?([^,]*),\s*([^,]+),\s*(\d+)\s+yards/i,fg:new RegExp(NM+"\\s+(\\d+)\\s+(?:yard|yd)\\s+(?:field goal|FG)","i")};
function team(e,ab){return ab===e.a?nick(e.an):ab===e.h?nick(e.hn):ab}
function other(e,ab){return ab===e.a?e.h:e.a}
function spot(tx,e){var all=String(tx).match(/\bto\s+(?:the\s+)?([A-Z]{2,5})\s?(-?\d{1,2})\b/g);if(!all)return "";var m=/([A-Z]{2,5})\s?(-?\d{1,2})$/.exec(all[all.length-1]);if(!m)return "";var n=+m[2];return n===50?"50":(e?yl(e,m[1]):m[1])+" "+n}
function yl(e,ab){return e&&(ab===e.a||ab===e.h)?team(e,ab):ab}
var ORD={"1st":"First","2nd":"Second","3rd":"Third","4th":"Fourth"};
var NW=["zero","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen","twenty"];
function wn(n){n=Math.abs(+n||0);return n<=20?NW[n]:String(n)}
function yds(n){n=Math.abs(n);return n===1?"a yard":wn(n)+" yards"}
function ddSay(dd,e){dd=String(dd||"");var m=/^(1st|2nd|3rd|4th) & (\w+) at (.+)$/.exec(dd);if(!m)return "";var at=m[3].replace(/^([A-Z]+) (\d+)$/,function(_,a,n){return (+n===50?"midfield":"the "+yl(e,a)+" "+n)});return ORD[m[1]]+" and "+(m[2]==="Goal"?"goal":m[2])+" at "+at.replace(/^the midfield/,"midfield")+"."}
function footballCall(e,p,k){
 var out=[],R=function(t,h){out.push({w:"rex",t:t,h:!!h})},I=function(t){out.push({w:"ice",t:t})},tx=p.tx||"",ty=p.ty||"",O=team(e,p.off),D=team(e,other(e,p.off)),dd=ddSay(p.dd,e),sp=spot(tx,e),m;
 var down=/^(3rd|4th)/.test(p.dd||""),first=/1ST DOWN/i.test(tx),S=scoreLine(e,p.sa,p.sh,p.off);
 if(/Kickoff/.test(ty)){m=RX.kick.exec(tx);R((m?lastName(m[1])+" kicks it away":"Here's the kick")+"... "+(/Touchback/i.test(tx)?"through the end zone, touchback.":(sp?"returned out to the "+sp+".":"and it's returned.")))}
 else if(/Punt/.test(ty)){m=RX.kick.exec(tx);R(dd+" "+(m?lastName(m[1])+" back to punt":"They'll punt it away")+"... "+(/Touchback/i.test(tx)?"into the end zone, touchback.":/fair catch/i.test(tx)?"fair catch called.":sp?"brought back to the "+sp+".":"and it's fielded."))}
 else if(/Two-minute/i.test(ty)){R("And that'll bring us to the two-minute warning. "+S+".");I(pick(["Two minutes is an eternity in this league, "+CREW.rex.f+".","Clock management time. Let's see who handles it better."],k))}
 else if(/Timeout/.test(ty)){m=/by\s+([A-Z]{2,5})/.exec(tx);R(m?"Timeout, "+team(e,m[1])+".":"We'll take a timeout here.")}
 else if(/End (Period|of Half|Game)/i.test(ty)){R(/2/.test(tx)?"And that's halftime. "+S+".":"That'll do it for the quarter. "+S+".")}
 else if(/Penalty/.test(ty)){m=RX.pen.exec(tx);R("Flag on the play."+(m?" "+m[3].replace(/^\w/,function(c){return c.toUpperCase()})+", "+team(e,m[1])+", "+m[4]+" yards"+(/No Play/i.test(tx)?", repeat the down.":"."):""));if(m)I(pick(["Can't do that. Self-inflicted wound.","That's a drive-killer if you're the "+team(e,m[1])+".","Discipline, "+CREW.rex.f+". You can't give away free yards."],k))}
 else if(/Interception/.test(ty)){m=RX.pass.exec(tx)||RX.inc.exec(tx);var ib=RX.intby.exec(tx);R(dd+" "+(m?lastName(m[1])+" throws":"The pass")+"... PICKED OFF! "+(ib?lastName(ib[1])+" with the interception!":D+" take it away!"),1);I(pick(["Terrible decision. He never saw the safety rotate.","Huge momentum swing. The "+D+" defense was waiting on that one.","You cannot throw that ball, "+CREW.rex.f+". Not there."],k))}
 else if(/Fumble/.test(ty)&&/Opponent/.test(ty)){R("FUMBLE! And the "+D+" recover!",1);I("Ball security! You just can't put it on the ground in a game like this.")}
 else if(/Sack/.test(ty)){m=RX.sack.exec(tx)||RX.sack0.exec(tx);R(dd+" "+(m?lastName(m[1]):"The quarterback")+" back to throw... under pressure... SACKED"+(m&&m[2]?" by "+lastName(m[2]):"")+"! Loss of "+yds(p.yd)+".",1);if(down)I(pick(["Huge stop on "+String(p.dd).split(" ")[0]+" down. That's how you get off the field.","The pocket collapsed in a hurry. Nowhere to go."],k))}
 else if(/Field Goal/.test(ty)){m=RX.fg.exec(tx);var good=/GOOD/i.test(tx)&&!/NO GOOD/i.test(tx);R((m?lastName(m[1])+" for "+m[2]:"The field goal try")+"... the kick is up... "+(good?"and it's GOOD!":"and it's NO GOOD!"),1);I(good?S+". "+pick(["Points are points.","They'll take the three."],k):pick(["Oh, that's a big miss. You have to make those.","Wide! Points left on the board."],k))}
 else if(/Pass/.test(ty)){
  if(/Incompletion|incomplete/i.test(ty+tx)){m=RX.inc.exec(tx);R(dd+" "+(m?lastName(m[1])+" drops back"+(m[3]?", looking "+m[3]:"")+"... throws"+(m[4]?" for "+lastName(m[4])+"...":"...")+" incomplete.":"Pass falls incomplete."));if(down)I(pick(["Big stop by the "+D+" defense.","Tight coverage. Nothing open there."],k))}
  else{m=RX.pass.exec(tx);var td=/Touchdown/i.test(ty)||/TOUCHDOWN/.test(tx),big=p.yd>=20,qb=m?lastName(m[1]):"",wr=m?lastName(m[4]):"",vb=pick(["fires","throws","delivers","zips it"],k+"v");
   var zone=m?(m[2]==="deep"?pick(["lets it fly","airs it out","goes deep"],k+"z")+(m[3]?" down the "+m[3]+" side":""):vb+(m[3]?(m[3]==="middle"?" over the middle":" to the "+m[3]):"")):"";
   R(dd+" "+(m?qb+"... "+zone+"... "+(td?wr+"... TOUCHDOWN! "+O+"!":big?wr+" has it! "+pick(["What a play!","Big gain!","Look at this!"],k+"b")+" "+(sp?"All the way to the "+sp+".":"Gain of "+wn(p.yd)+"."):"caught by "+wr+(sp?" at the "+sp:"")+". "+(p.yd>0?"Pickup of "+wn(p.yd)+".":"No gain.")):"Pass complete. Gain of "+wn(p.yd)+".")+(first&&!td?" "+pick(["First down.","Moves the chains.","That's a first down."],k+"f"):""),td||big);
   if(td)I(S+". "+pick(["Perfect throw, perfect route. Put it in the time capsule.","That's why he gets paid, "+CREW.rex.f+".","The defense blew the coverage and he made them pay."],k));else if(big)I(pick(["Look at the separation! He ran right by the corner.","That's the shot play, and it worked to perfection.","Huge chunk. That flips the field."],k));else if(down&&first)I(pick(["Big conversion. Keeps the drive alive.","Moved the chains on "+String(p.dd).split(" ")[0]+" down. Clutch."],k))}}
 else if(/Rush/.test(ty)){m=RX.rush.exec(tx);var td2=/Touchdown/i.test(ty)||/TOUCHDOWN/.test(tx);
  var rb=m?lastName(m[1]):"";R(dd+" "+(m?pick(["Handoff, "+rb,rb+" takes it",rb+" carries"],k+"r")+(m[2]?" "+m[2]+" side":/middle/.test(tx)?" up the middle":"")+"...":"Run play...")+" "+(td2?"he's IN! TOUCHDOWN "+O+"!":p.yd>=15?"he's loose! "+pick(["Breaks a tackle,","Cuts back,","Finds a crease,"],k+"c")+" "+wn(p.yd)+" yards!":p.yd>0?(p.yd<=3?"picks up "+yds(p.yd)+".":"good for "+wn(p.yd)+"."):p.yd===0?"stuffed. No gain.":"dropped for a loss of "+yds(p.yd)+".")+(first&&!td2?" "+pick(["First down.","Moves the chains."],k+"f"):""),td2||p.yd>=15);
  if(td2)I(S+". "+pick(["The offensive line just moved people.","Power football. They wanted it more.","Nobody laid a finger on him, "+CREW.rex.f+"."],k));else if(p.yd>=15)I(pick(["Huge hole on that side. Somebody missed an assignment.","Great vision, and he hit it full speed."],k));else if(down&&p.yd<=0)I("Stuffed! What a stand by the "+D+" defense.")}
 else if(tx)R(cleanDesc(tx));
 return out}
function hoopsCall(e,p,k){
 var out=[],R=function(t,h){out.push({w:"rex",t:t,h:!!h})},I=function(t){out.push({w:"ice",t:t})},tx=p.tx||"",ty=p.ty||"",T=team(e,p.tm),m=/^(.+?)\s+(makes|misses|blocks|Steal|Block|Defensive|Offensive|Turnover|Lost Ball|Bad Pass|Traveling)/.exec(tx)||/^Foul on\s+(.+?)\.?$/.exec(tx),who=m?lastName(m[1]):T,ft=/(\d+)-foot/.exec(tx),ast=/\((.+?) assists?\)/.exec(tx),S=scoreLine(e,p.sa,p.sh,p.tm);
 if(/Substitution|TVTimeOut|OfficialTV/.test(ty))return out;
 if(/FreeThrow/.test(ty)||/free throw/i.test(tx)){if(/1 of 2|1 of 3/.test(tx))R(who+" at the line... "+(/makes/.test(tx)?"first one is good.":"first one is off."));else R(/makes/.test(tx)?who+" knocks it down. "+S+".":who+" misses the free throw.");return out}
 if(/Dunk/.test(ty)||/dunk/i.test(tx)){if(/makes/.test(tx)){R(pick(["OH! ","SLAM! ","Look out! "],k)+who+" throws it DOWN!"+(ast?" Lob from "+lastName(ast[1])+"!":""),1);I(pick(["Posterized! That's going on every highlight show tonight.","Pure power at the rim.","You felt that one in the upper deck, "+CREW.rex.f+"."],k))}else R(who+" goes up for the slam... and it rattles out!");return out}
 if(/Block/.test(ty)){R("REJECTED! "+who+" with the block!",1);I("He's protecting the rim like it's his house, "+CREW.rex.f+".");return out}
 if(/Jump|LayUp|Shot/.test(ty)){var three=/three point/i.test(tx);
  if(/makes/.test(tx)){R(three?who+(ft?" from "+ft[1]+"...":" for three...")+" BANG!"+(ast?" "+lastName(ast[1])+" with the assist.":""):/layup/i.test(tx)?who+" to the rim... lays it in."+(ast?" Nice feed by "+lastName(ast[1])+".":""):who+" pulls up... good.",three);if(three&&Math.abs((p.sa||0)-(p.sh||0))<=6)I(S+". "+pick(["He's feeling it now.","Huge shot. Momentum's swinging.","Nothing but the bottom of the net."],k))}
  else R(three?who+" for three... no good.":/layup/i.test(tx)?who+" drives... can't finish.":who+" with the jumper... off the mark.");return out}
 if(/Rebound/.test(ty)){R((/Offensive/.test(ty)?"Offensive board, ":"Rebound, ")+who+".");return out}
 if(/Block/.test(ty)){R("REJECTED! "+who+" with the block!",1);I("He's protecting the rim like it's his house, "+CREW.rex.f+".");return out}
 if(/Steal/.test(ty)){R("Picked clean by "+who+"!",1);return out}
 if(/Turnover/.test(ty)){R("Turnover, "+T+".");return out}
 if(/Foul/.test(ty)){R("Whistle. Foul"+(m?" on "+who:"")+".");return out}
 if(/Timeout/i.test(ty)){R("Timeout on the floor. "+S+".");I(pick(["Good time to stop the bleeding.","Coach needs to settle them down."],k));return out}
 if(/End|Period|Half/.test(ty)){R("That'll end the period. "+S+".");return out}
 if(tx)R(cleanDesc(tx));
 return out}
function snapLines(e,g){
 var rp=e.rp||[],out=[],fb=football(g||e),n=0;
 rp.forEach(function(p){var cs=fb?footballCall(e,p,p.id):hoopsCall(e,p,p.id);cs=chat(cs,p.id);cs.forEach(function(c,i){c.when=p.t||"";c.key="rp|"+p.id+"|"+i;out.push(c)});
  if(cs.length){n++;if(n%7===0)sideline(e,g,hsh(p.id)%5).forEach(function(l,i){l.key="sl|"+p.id+"|"+i;out.push(l)});else if(n%4===0)banter(e,g,hsh(p.id)%7+n).forEach(function(l,i){l.key="rpb|"+p.id+"|"+i;out.push(l)})}});
 return out}

/* ---------- sideline reports (fictional VAULT reporters; every number comes from the feed) ---------- */
function sideline(e,g,n){
 var A=nick(e.an),H=nick(e.hn),k=gid(g)+"|sid|"+n,lv=/LIVE|HALF/.test(e.st||""),out=[],side=pick([H,A],k);
 var R=function(t){out.push({w:"rex",t:t})},S=function(t){out.push({w:"sid",t:t})};
 var facts=[];
 if(e.dr&&e.dr.d&&e.dr.tm){var m=/(\d+) plays?, (-?\d+) yards?, (\d+:\d+)/.exec(e.dr.d);if(m)facts.push("The "+team(e,e.dr.tm)+" are on a "+m[1]+"-play drive that has gone "+m[2]+" yards and taken "+m[3]+" off the clock.")}
 if(e.fs&&e.fs.a&&e.fs.h){facts.push("By the numbers: "+A+" "+e.fs.a.yds+" total yards, "+H+" "+e.fs.h.yds+".");if((e.fs.a.to||0)+(e.fs.h.to||0))facts.push("Turnovers: "+A+" "+(e.fs.a.to||0)+", "+H+" "+(e.fs.h.to||0)+". That's the stat both coaching staffs keep pointing at.")}
 if(e.bs&&e.bs.a&&e.bs.h)facts.push(e.bs.a.ld+" has "+e.bs.a.pts+" for the "+A+", and "+e.bs.h.ld+" has "+e.bs.h.pts+" for the "+H+".");
 if(e.sh&&e.sh.length){var mk={a:[0,0],h:[0,0]};e.sh.forEach(function(q){mk[q[3]][1]++;if(q[2])mk[q[3]][0]++});facts.push("Over the last stretch the "+A+" are "+mk.a[0]+" of "+mk.a[1]+" from the field, the "+H+" "+mk.h[0]+" of "+mk.h[1]+".")}
 if(g.ar&&g.hr)facts.push("The "+A+" came in "+g.ar+" and the "+H+" "+g.hr+", so there's plenty riding on this one.");
 var hls=(e.plays||[]).filter(function(x){return x.hl});if(hls.length)facts.push("The play everyone down here is still talking about: "+hls[hls.length-1].x);
 if(!facts.length)return out;
 R(pick(["Let's check in with "+CREW.sid.f+" on the sideline.","Let's go down to "+CREW.sid.f+".",CREW.sid.f+", what are you seeing down there?"],k));
 S(pick(["Thanks, "+CREW.rex.f+". ","Hey, "+CREW.rex.f+". ",""],k+"a")+"I'm down here on the "+side+" sideline. "+facts[n%facts.length]+(facts.length>1?" "+facts[(n+1)%facts.length]:""));
 R(pick(["Thanks, "+CREW.sid.f+".","Great stuff, "+CREW.sid.f+". Back to the action.","Appreciate it, "+CREW.sid.f+"."],k+"b"));
 out.forEach(function(l,i){l.key="sid|"+n+"|"+i});return out}
/* ---------- VAULT Whip-Around: the studio checks in on every live game ---------- */
function studioLines(round){
 var l=games().filter(isLive),out=[];CREW={rex:STUDIO.rex,ice:STUDIO.ice,sid:STUDIO.ice};
 if(!l.length){out.push({w:"rex",t:"Welcome to the VAULT Whip-Around. Nothing is live right now, so we'll be right here when the next game kicks off."});return out}
 if(!round)out.push({w:"rex",t:"Welcome to the VAULT Whip-Around! I'm "+STUDIO.rex.n+", alongside "+STUDIO.ice.n+". We've got "+l.length+" games going right now, and we'll take you to all of them."},{w:"ice",t:"Buckle up, "+STUDIO.rex.f+". There's a lot happening."});
 l.slice().sort(function(a,b){return pr(a)-pr(b)}).forEach(function(g,i){var id=gid(g),e=bpEntry(g),k=id+"|"+round,S=scoreLine(e,g.as,g.hs);
  out.push({w:"rex",t:pick(["Let's head to ","Over to ","Now let's check in on "],k)+nm(g,"a")+" at "+nm(g,"h")+". "+S+", "+clock(g)+" to go.",when:g.lg});
  var last=(e.rp&&e.rp.length?e.rp[e.rp.length-1]:null),hl=(e.plays||[]).filter(function(x){return x.hl}).slice(-1)[0];
  if(hl)out.push({w:"ice",t:pick(["The big moment there: ","What jumps out: ","Can't miss this one: "],k+"i")+hl.x,when:g.lg});
  else if(last&&last.tx)out.push({w:"ice",t:"Most recent play: "+cleanDesc(last.tx.replace(/^\(\d+:\d+\)\s*/,"")),when:g.lg});
  else out.push({w:"ice",t:pick((Math.abs(g.as-g.hs)<=8?["Tight one. Every possession matters.","Crunch-time feel to this one.","Keep an eye on this one."]:["One team is in control here.","They've built a cushion. Can the other side answer?","Keep an eye on this one."]),k+"j"),when:g.lg})});
 out.push({w:"rex",t:"That's a lap around VAULT. We'll keep whipping around as the scores change."});
 out.forEach(function(x,i){x.key="studio|"+round+"|"+i});return out}

/* ---------- HD broadcast voices: Kokoro neural TTS running in the visitor's browser (free, no server) ---------- */
var KV={"Rex Calloway":"am_michael","Dante “Ice” Whitfield":"am_onyx","Marcus Bell":"am_fenrir","Tony “Coach” Reyes":"bm_george","Lena Ortiz":"af_heart","“Big” Earl Jackson":"am_echo","Jim Halvorsen":"am_eric","Keisha Monroe":"af_nicole",
 "Sam “Sparky” Delgado":"am_puck","Ray Booker":"bm_lewis","Nina Park":"af_bella","Doug “Tank” Brennan":"am_adam","Cole Whitaker":"am_liam","Andre Simms":"bm_daniel","Priya Desai":"af_sarah","Mike Kowalski":"bm_fable"};
var KF=["af_jessica","af_kore","af_nova","af_river","af_sky","af_aoede","af_alloy","bf_emma","bf_isabella","bf_alice","bf_lily"],KM=["am_michael","am_onyx","am_fenrir","am_eric","am_puck","am_adam","am_liam","am_echo","bm_george","bm_lewis","bm_daniel","bm_fable"];
var VMAP=null,VUSED={};
/* every person on the air gets their own voice: a unique Kokoro voice, then pitch-shifted variants once the voices run out */
function buildVoices(){ensureCrews(CREWS.length);var people=[STUDIO.rex,STUDIO.ice];CREWS.forEach(function(c){people.push(c.rex,c.ice,c.sid)});
 VMAP=VMAP||{};var all=KM.concat(KF),rates=[1,.9,1.1,.84,1.16];
 people.forEach(function(p){if(!p||VMAP[p.n])return;var want=KV[p.n];if(want&&!VUSED[want+"|1"]){VMAP[p.n]={k:want,rt:1};VUSED[want+"|1"]=1;return}
  var pool=(p.v&&p.v.g==="f")?KF.concat(KM):KM.concat(KF),start=hsh(p.n)%pool.length;
  for(var r=0;r<rates.length;r++)for(var n=0;n<pool.length;n++){var v=pool[(start+n)%pool.length],key=v+"|"+rates[r];if(!VUSED[key]){VUSED[key]=1;VMAP[p.n]={k:v,rt:rates[r]};return}}
  VMAP[p.n]={k:pool[start],rt:1}})}
function kvoice(p){if(!VMAP||!VMAP[p.n])buildVoices();return (VMAP[p.n]||{k:"am_michael",rt:1})}
var HD={st:"off",w:null,n:0,cb:{},cache:{},dev:"",pct:0};
var HD_SRC='import{KokoroTTS}from"https://cdn.jsdelivr.net/npm/kokoro-js@1.2.1/+esm";let t;self.onmessage=async e=>{const m=e.data;'+
 'if(m.type==="load"){for(const o of m.opts){try{t=await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX",{dtype:o.dtype,device:o.device,progress_callback:p=>{if(p.status==="progress"&&/onnx/.test(p.file||""))self.postMessage({type:"progress",p:p.progress})}});self.postMessage({type:"ready",dev:o.device});return}catch(err){self.postMessage({type:"warn",msg:String(err)})}}self.postMessage({type:"error"});return}'+
 'if(m.type==="gen"){try{const a=await t.generate(m.text,{voice:m.voice,speed:m.speed||1});self.postMessage({type:"audio",id:m.id,blob:a.toBlob(),secs:a.audio.length/a.sampling_rate})}catch(err){self.postMessage({type:"fail",id:m.id})}}};';
function hdSupported(){return typeof Worker!=="undefined"&&typeof WebAssembly!=="undefined"}
function hdLoad(){
 if(HD.st==="loading"||HD.st==="ready"||!hdSupported())return;HD.st="loading";HD.pct=0;hdUI();
 var mobile=/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent);
 var go=function(opt,fallback){
  if(HD.w)try{HD.w.terminate()}catch(_){}
  try{HD.w=new Worker(URL.createObjectURL(new Blob([HD_SRC],{type:"text/javascript"})),{type:"module"})}catch(_){HD.st="error";hdUI();return}
  HD.w.onmessage=function(ev){var m=ev.data;
   if(m.type==="progress"){HD.pct=Math.max(HD.pct,Math.round(m.p||0));hdUI()}
   else if(m.type==="ready"){HD.st="ready";HD.dev=m.dev;hdUI();if(bpSound&&bpPlaying)hdPrefetch()}
   else if(m.type==="warn"){if(window.console)console.warn("VAULT HD voices:",m.msg)}
   else if(m.type==="error"){if(fallback){HD.pct=0;go(fallback,null)}else{HD.st="error";hdUI()}}
   else if(m.type==="audio"||m.type==="fail"){var c=HD.cb[m.id];delete HD.cb[m.id];if(c)c(m.type==="audio"?URL.createObjectURL(m.blob):null)}};
  HD.w.onerror=function(ev){if(window.console)console.warn("VAULT HD worker error:",ev&&ev.message);if(fallback){go(fallback,null)}else{HD.st="error";hdUI()}};
  HD.w.postMessage({type:"load",opts:[opt]})};
 var wasm={device:"wasm",dtype:"q8"};
 if(navigator.gpu&&!mobile&&navigator.gpu.requestAdapter){navigator.gpu.requestAdapter().then(function(a){if(a)go({device:"webgpu",dtype:"fp32"},wasm);else go(wasm,null)}).catch(function(){go(wasm,null)})}
 else go(wasm,null)}
function hdLine(l){
 var p=CREW[l.w],other=CREW[l.w==="rex"?"ice":"rex"],key=(l.key||l.t)+"|"+p.n;if(HD.cache[key])return HD.cache[key];
 var speed=(l.w==="rex"?1.08:0.98)*(l.h?1.06:1);
 var kv=kvoice(p);
 return HD.cache[key]=new Promise(function(res){var id=++HD.n;HD.cb[id]=function(u){res(u?{url:u,rt:kv.rt}:null)};HD.w.postMessage({type:"gen",id:id,text:l.t.replace(/[“”]/g,'"'),voice:kv.k,speed:speed})})}
function hdPrefetch(){if(HD.st!=="ready")return;for(var i=bpI;i<Math.min(bpQ.length,bpI+3);i++)hdLine(bpQ[i])}
function hdUI(){var b=$("#bpHD");if(!b)return;var t=b.querySelector("span");
 b.setAttribute("aria-pressed",HD.st==="ready");b.disabled=HD.st==="loading";
 t.textContent=HD.st==="loading"?"Loading voices "+HD.pct+"%":HD.st==="ready"?"HD voices on":HD.st==="error"?"HD voices unavailable":"HD voices";
 var n=$("#bpHDn");if(n)n.textContent=HD.st==="off"?"Real neural voices, a different one for every announcer. One-time download of about 90 MB, runs on your device.":HD.st==="loading"?"Downloading the voice model (one time). The booth keeps talking with device voices meanwhile.":HD.st==="ready"?(HD.dev==="webgpu"?"Neural voices running on your graphics chip.":"Neural voices running on your device. Slower phones may pause between lines."):HD.st==="error"?"This browser can't run the neural voices, so the booth uses your device's voices.":""}
/* stadium crowd bed under the call */
var AMB=null;
function ambience(on){try{
 if(on&&!AMB){var C=window.AudioContext||window.webkitAudioContext;if(!C)return;var ctx=new C(),len=ctx.sampleRate*4,buf=ctx.createBuffer(2,len,ctx.sampleRate);
  for(var ch=0;ch<2;ch++){var d=buf.getChannelData(ch),last=0;for(var i=0;i<len;i++){var w=Math.random()*2-1;last=(last+.02*w)/1.02;d[i]=last*3.2}}
  var src=ctx.createBufferSource();src.buffer=buf;src.loop=true;var f=ctx.createBiquadFilter();f.type="bandpass";f.frequency.value=700;f.Q.value=.6;var g=ctx.createGain();g.gain.value=.05;src.connect(f);f.connect(g);g.connect(ctx.destination);src.start();AMB={ctx:ctx,g:g}}
 else if(!on&&AMB){AMB.ctx.close();AMB=null}}catch(_){}}
function swell(){if(!AMB)return;var t=AMB.ctx.currentTime;AMB.g.gain.cancelScheduledValues(t);AMB.g.gain.setValueAtTime(.05,t);AMB.g.gain.linearRampToValueAtTime(.16,t+.4);AMB.g.gain.linearRampToValueAtTime(.05,t+3.5)}
var bpAudio=null;

/* ---------- live scores straight from ESPN's public scoreboard (CORS-enabled), every ~20 seconds ---------- */
var LV={ids:{},last:{},on:false};
var LVL=[["NFL","football/nfl","",20e3],["CFB","football/college-football","?groups=80&limit=300",30e3],["NBA","basketball/nba","",20e3],["CBB","basketball/mens-college-basketball","?groups=50&limit=400",45e3]];
var ESPN="https://site.api.espn.com/apis/site/v2/sports/";
function lvStatus(ev,lg){var t=(ev.status||{}).type||{},st=ev.status||{};if(t.name==="STATUS_HALFTIME")return "HALFTIME";if(t.state!=="in")return null;var c=String(st.displayClock||"").replace(/^0(\d:)/,"$1"),q=+st.period||0;
 if(lg==="NFL"||lg==="CFB")return "LIVE "+(q>4?"OT":"Q"+q)+" "+c;return "LIVE "+c}
function lvRow(ev,lg){var comp=(ev.competitions||[])[0]||{},cs=comp.competitors||[],h=cs.filter(function(c){return c.homeAway==="home"})[0],a=cs.filter(function(c){return c.homeAway==="away"})[0];if(!h||!a)return null;
 var t=(ev.status||{}).type||{},recent=t.state==="post"&&(Date.now()-new Date(ev.date))<6*3600e3;if(t.state!=="in"&&t.name!=="STATUS_HALFTIME"&&!recent)return null;
 var ta=a.team||{},th=h.team||{},r={lg:lg,a:ta.abbreviation,h:th.abbreviation,as:+a.score||0,hs:+h.score||0,an:ta.displayName,hn:th.displayName};
 var st=lvStatus(ev,lg);if(st)r.st=st;
 [["a",a],["h",h]].forEach(function(x){var tm=x[1].team||{};if(tm.logo)r[x[0]+"lg"]=tm.logo;if(tm.color)r[x[0]+"c"]="#"+tm.color;if(tm.alternateColor)r[x[0]+"c2"]="#"+tm.alternateColor;(x[1].records||[]).forEach(function(rc){if(rc.type==="total")r[x[0]+"r"]=rc.summary})});
 LV.ids[(lg+"-"+r.a+"-"+r.h).toLowerCase().replace(/[^a-z0-9-]/g,"")]={id:ev.id,path:LVL.filter(function(z){return z[0]===lg})[0][1],lg:lg};return r}
var LVROWS={};window.__LV=LV;window.__LVR=LVROWS;
function lvPoll(L){if(document.hidden){setTimeout(function(){lvPoll(L)},L[3]);return}
 fetch(ESPN+L[1]+"/scoreboard"+L[2],{cache:"no-store"}).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(d){
  var rows=[];(d.events||[]).forEach(function(ev){var r=lvRow(ev,L[0]);if(r)rows.push(r)});LVROWS[L[0]]=rows;
  var all=[];Object.keys(LVROWS).forEach(function(k){all=all.concat(LVROWS[k])});
  if(window.VaultLive)VaultLive.push({updatedAt:new Date().toISOString(),src:"ESPN live",games:all});
  all.forEach(function(r){var id=(r.lg+"-"+r.a+"-"+r.h).toLowerCase().replace(/[^a-z0-9-]/g,""),e=PL&&PL.games&&PL.games[id];if(e){e.as=r.as;e.hs=r.hs;e.st=r.st||"FINAL"}});
  var live=rows.some(function(r){return r.st});setTimeout(function(){lvPoll(L)},live?L[3]:Math.max(L[3],120e3))}).catch(function(){setTimeout(function(){lvPoll(L)},60e3)})}
function lvStart(){if(LV.on||!window.fetch)return;LV.on=true;LVL.forEach(function(L,i){setTimeout(function(){lvPoll(L)},1500+i*700)})}
/* the Booth's game: pull its play-by-play every ~12 seconds so the crew calls plays almost as they happen */
function lvBoothTick(){setTimeout(lvBoothTick,12e3);if(!BP||BP.hidden||document.hidden||!bpSel||bpSel==="studio")return;var m=LV.ids[bpSel];if(!m)return;
 fetch(ESPN+m.path+"/summary?event="+m.id,{cache:"no-store"}).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(s){
  var fb=m.lg==="NFL"||m.lg==="CFB",rp=[],comp=((s.header||{}).competitions||[])[0]||{},ab={};(comp.competitors||[]).forEach(function(c){ab[String((c.team||{}).id)]=(c.team||{}).abbreviation});
  if(fb){var dr=s.drives||{},dl=(dr.previous||[]).concat(dr.current?[dr.current]:[]),seen={};dl.forEach(function(d){(d.plays||[]).forEach(function(p){if(seen[p.id])return;seen[p.id]=1;var st=p.start||{},off=String(((st.team||{}).id)||((d.team||{}).id));
    rp.push({id:String(p.id),t:(((p.period||{}).number>4)?"OT":"Q"+(p.period||{}).number)+" "+((p.clock||{}).displayValue||""),dd:st.downDistanceText||"",ty:(p.type||{}).text||"",tx:String(p.text||"").replace(/^\(\d{1,2}:\d{2}\)\s*/,"").replace(/^(?:\([^)]*\)\s*|(?:No Huddle-)?Shotgun\s+|No Huddle\s+)+/,"").slice(0,260),yd:+p.statYardage||0,off:ab[off]||"",sc:!!p.scoringPlay,sa:+p.awayScore||0,sh:+p.homeScore||0})})});rp=rp.slice(-14)}
  else{(s.plays||[]).slice(-24).forEach(function(p){var n=(p.period||{}).number||1;rp.push({id:String(p.id),t:(m.lg==="CBB"?(n<=2?"H"+n:"OT"+(n-2)):(n<=4?"Q"+n:"OT"+(n-4)))+" "+((p.clock||{}).displayValue||""),ty:(p.type||{}).text||"",tx:String(p.text||"").slice(0,200),tm:ab[String((p.team||{}).id)]||"",sc:!!p.scoringPlay,v:+p.scoreValue||0,sa:+p.awayScore||0,sh:+p.homeScore||0})})}
  if(!PL)PL={games:{}};var e=PL.games[bpSel];if(!e){var g=bpCurGame();if(!g)return;e=PL.games[bpSel]={lg:g.lg,a:g.a,h:g.h,an:nm(g,"a"),hn:nm(g,"h"),plays:[]}}
  var old=(e.rp||[]).map(function(x){return x.id}).join();
  /* keep calls already queued: merge new snaps onto the end */
  var have={};(e.rp||[]).forEach(function(x){have[x.id]=1});e.rp=(e.rp||[]).concat(rp.filter(function(x){return !have[x.id]})).slice(-30);
  var last=rp[rp.length-1];if(last){e.as=last.sa;e.hs=last.sh}
  if(e.rp.map(function(x){return x.id}).join()!==old)bpRefresh()}).catch(function(){})}

/* ---------- THE BOOTH page (#booth): see and hear Rex & Dante ---------- */
var BP=null,bpSel=null,bpQ=[],bpI=0,bpT=null,bpSound=false,bpPlaying=true,bpVoices=null,bpSeenKeys={};
function rnd(seed){var s=seed;return function(){s=s*16807%2147483647;return (s-1)/2147483646}}
function person(id,x,o){
 var s='<g class="ann" id="'+id+'" transform="translate('+x+' 0)"><g class="ann-b">';
 s+='<ellipse class="halo" cx="0" cy="380" rx="120" ry="130" fill="url(#halo)"/>';
 s+='<path d="M-138 640C-138 525-104 476 0 466C104 476 138 525 138 640Z" fill="'+o.jacket+'"/>';
 s+='<path d="M-138 640C-138 525-104 476 0 466C104 476 138 525 138 640Z" fill="url(#shade)"/>';
 s+='<path d="M-30 468L0 535L30 468Z" fill="'+o.shirt+'"/>';
 if(o.tie)s+='<path d="M-9 478L9 478L13 560L0 576L-13 560Z" fill="'+o.tie+'"/>';
 s+='<path d="M-30 468L-62 486L-14 560Z" fill="'+o.lapel+'"/><path d="M30 468L62 486L14 560Z" fill="'+o.lapel+'"/>';
 s+='<rect x="-19" y="420" width="38" height="52" rx="12" fill="'+o.skin2+'"/>';
 s+='<g class="ann-h"><ellipse cx="-52" cy="388" rx="10" ry="15" fill="'+o.skin2+'"/><ellipse cx="52" cy="388" rx="10" ry="15" fill="'+o.skin2+'"/>';
 s+='<ellipse cx="0" cy="380" rx="52" ry="63" fill="'+o.skin+'"/>';
 s+='<path d="M-30 360q30-14 60 0" fill="none" stroke="'+o.skin2+'" stroke-width="0"/>';
 s+=o.hair;
 if(o.beard)s+='<path d="M-48 388C-46 452 46 452 48 388C38 420 22 430 0 431C-22 430-38 420-48 388Z" fill="'+o.beard+'"/>';
 if(o.f)s+='<circle cx="-52" cy="404" r="3.5" fill="#fde68a"/><circle cx="52" cy="404" r="3.5" fill="#fde68a"/>';
 s+='<g class="eyes"><ellipse cx="-19" cy="378" rx="5" ry="6.5" fill="#101522"/><ellipse cx="19" cy="378" rx="5" ry="6.5" fill="#101522"/><circle cx="-17" cy="376" r="1.6" fill="#fff"/><circle cx="21" cy="376" r="1.6" fill="#fff"/></g>';
 if(o.glasses)s+='<g fill="rgba(180,210,255,.18)" stroke="#0f172a" stroke-width="3"><rect x="-34" y="366" width="28" height="22" rx="6"/><rect x="6" y="366" width="28" height="22" rx="6"/><path d="M-6 374h12" fill="none"/></g>';
 s+='<path d="M-30 362q11-7 22-2M8 360q11-5 22 2" fill="none" stroke="'+o.brow+'" stroke-width="4" stroke-linecap="round"/>';
 s+='<path d="M-2 384q-6 14 2 17q5 1 8-1" fill="none" stroke="'+o.skin2+'" stroke-width="3" stroke-linecap="round"/>';
 s+='<g class="mouth"><ellipse cx="0" cy="415" rx="13" ry="4.5" fill="#4a1f24"/><path d="M-9 413h18" stroke="#fff" stroke-width="2" opacity=".8"/></g>';
 s+='<path d="M-60 386C-66 296 66 296 60 386" fill="none" stroke="#1b2333" stroke-width="9" stroke-linecap="round"/>';
 s+='<rect x="-70" y="370" width="20" height="38" rx="8" fill="#1b2333"/><rect x="50" y="370" width="20" height="38" rx="8" fill="#1b2333"/>';
 s+='<rect x="-68" y="378" width="4" height="22" rx="2" fill="'+o.accent+'"/><rect x="64" y="378" width="4" height="22" rx="2" fill="'+o.accent+'"/>';
 s+='<path d="M-60 402Q-52 436-20 424" fill="none" stroke="#1b2333" stroke-width="5" stroke-linecap="round"/><circle cx="-16" cy="423" r="7" fill="#26324a"/><circle class="mic" cx="-16" cy="423" r="3" fill="'+o.accent+'"/></g>';
 return s+'</g></g>'}
function personHead(o){return person("",0,o).replace('class="ann" id=""','class="ann-mini"')}
function boothSVG(g){
 g=g||{lg:"NFL",a:"",h:""};var fb=football(g),hp=hoops(g),r=rnd(hsh(gid(g)||"x")%100000+7),i,ca=tcol(g.lg,g.a),ch=tcol(g.lg,g.h);
 var la=logoURL(g.lg,g.a,160),lh=logoURL(g.lg,g.h,160),img=function(u,x,y,w){return u?'<image href="'+esc(u)+'" x="'+(x-w/2)+'" y="'+(y-w/2)+'" width="'+w+'" height="'+w+'" preserveAspectRatio="xMidYMid meet"/>':""};
 var crowd="";for(i=0;i<520;i++){var cx=Math.round(r()*1200),cy=Math.round(70+r()*250),c=r()<.62?ch:r()<.7?ca:r()<.5?"#DCE6F5":"#94a3b8";crowd+='<circle cx="'+cx+'" cy="'+cy+'" r="'+(1.2+r()*2.4).toFixed(1)+'" fill="'+c+'" opacity="'+(.35+r()*.55).toFixed(2)+'"/>'}
 var flash="";for(i=0;i<14;i++)flash+='<circle class="flash" cx="'+Math.round(r()*1200)+'" cy="'+Math.round(90+r()*200)+'" r="2.6" fill="#fff" style="animation-delay:'+(r()*6).toFixed(2)+'s"/>';
 var floor="";
 if(fb){
  floor+='<path d="M300 320H900L1130 470H70Z" fill="#2c8a46"/>';
  for(i=0;i<=20;i++){var t=i/20,xa=300+t*600,xb=70+t*1060;floor+='<line x1="'+xa.toFixed(0)+'" y1="320" x2="'+xb.toFixed(0)+'" y2="470" stroke="#fff" stroke-opacity="'+(i%2?0.22:0.55)+'" stroke-width="'+(i%10?1.3:2.6)+'"/>'}
  floor+='<path d="M300 320H330L101 470H70Z" fill="'+ca+'"/><path d="M870 320H900L1130 470H1099Z" fill="'+ch+'"/>';
  floor+=img(lh,600,392,64);
 }else if(hp){
  floor+='<path d="M330 320H870L1080 470H120Z" fill="#c98f55"/><path d="M330 320H870L1080 470H120Z" fill="none" stroke="#1D4ED8" stroke-width="6"/>';
  floor+='<path d="M600 320V470" stroke="#fff" stroke-width="2.4"/><ellipse cx="600" cy="392" rx="70" ry="22" fill="none" stroke="#fff" stroke-width="2.4"/>';
  floor+='<path d="M340 360H420L392 440H250Z" fill="'+ca+'" opacity=".9"/><path d="M860 360H780L808 440H950Z" fill="'+ch+'" opacity=".9"/>';
  floor+=img(lh,600,392,56);
 }else floor+='<path d="M300 320H900L1130 470H70Z" fill="#111827"/>';
 var jb='<g transform="translate(600 96)"><rect x="-150" y="-50" width="300" height="104" rx="6" fill="#0b0f17" stroke="#2A3A5A" stroke-width="3"/><rect x="-142" y="-42" width="140" height="88" fill="'+ca+'" opacity=".55"/><rect x="2" y="-42" width="140" height="88" fill="'+ch+'" opacity=".55"/>'+img(la,-72,-10,46)+img(lh,72,-10,46)+
  '<text id="jbA" x="-72" y="38" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-size="22" font-weight="900" fill="#fff">'+esc(g.as!=null?g.as:"")+'</text><text id="jbH" x="72" y="38" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-size="22" font-weight="900" fill="#fff">'+esc(g.hs!=null?g.hs:"")+'</text><path d="M0 -50V-80" stroke="#2A3A5A" stroke-width="4"/></g>';
 var lamps='<g class="lamps">'+[90,1110].map(function(x){return '<rect x="'+(x-5)+'" y="30" width="10" height="250" fill="#1E2B45"/><rect x="'+(x-38)+'" y="24" width="76" height="34" rx="4" fill="#DCE6F5"/><circle cx="'+x+'" cy="40" r="130" fill="url(#lamp)"/>'}).join("")+'</g>';
 var P=CREW.rex.lk,Q=CREW.ice.lk;
 var rex=person("annRex",350,P),ice=person("annIce",850,Q);
 var mon=function(x,id,txt){return '<g transform="translate('+x+' 486)"><path d="M-96 0H96L90 52H-90Z" fill="#0B1324" stroke="#2A3A5A" stroke-width="3"/><rect x="-86" y="8" width="172" height="38" rx="3" fill="#050913"/><text id="'+id+'" x="0" y="34" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-size="17" font-weight="900" fill="#DCE6F5">'+esc(txt)+'</text></g>'};
 return '<svg viewBox="0 0 1200 620" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>'+
  '<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#03060d"/><stop offset=".5" stop-color="#0b1426"/><stop offset="1" stop-color="#131f36"/></linearGradient>'+
  '<radialGradient id="lamp"><stop offset="0" stop-color="#fffbe8" stop-opacity=".95"/><stop offset=".3" stop-color="#cfe2ff" stop-opacity=".35"/><stop offset="1" stop-color="#60A5FA" stop-opacity="0"/></radialGradient>'+
  '<radialGradient id="halo"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>'+
  '<radialGradient id="spot" cx=".5" cy="0" r="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>'+
  '<linearGradient id="shade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".35"/><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".08"/></linearGradient>'+
  '<linearGradient id="desk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#22314f"/><stop offset="1" stop-color="#080e1b"/></linearGradient>'+
  '<linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".09"/><stop offset=".35" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#93C5FD" stop-opacity=".07"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>'+
  '<linearGradient id="haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9cc3ff" stop-opacity="0"/><stop offset="1" stop-color="#9cc3ff" stop-opacity=".12"/></linearGradient></defs>'+
  '<rect width="1200" height="620" fill="url(#sky)"/>'+
  '<path d="M0 60Q600 20 1200 60V330H0Z" fill="#0a1222"/><g>'+crowd+flash+'</g>'+
  '<path d="M0 300Q600 270 1200 300V330H0Z" fill="'+ch+'" opacity=".55"/><path d="M0 316H1200" stroke="#fff" stroke-opacity=".15"/>'+
  floor+lamps+jb+'<rect y="0" width="1200" height="470" fill="url(#haze)"/>'+
  '<rect width="1200" height="470" fill="url(#glass)"/>'+
  '<g fill="#060b15"><rect x="0" y="0" width="1200" height="18"/><rect x="296" y="0" width="14" height="470"/><rect x="590" y="0" width="20" height="470"/><rect x="890" y="0" width="14" height="470"/><rect x="0" y="460" width="1200" height="16"/></g>'+
  '<rect x="0" y="0" width="1200" height="620" fill="url(#spot)"/>'+
  '<g class="onair" transform="translate(0 196)"><rect x="540" y="26" width="120" height="34" rx="17" fill="#2b0a0d"/><circle class="onair-dot" cx="562" cy="43" r="7" fill="#ff3b4a"/><text x="612" y="49" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-size="15" font-weight="900" fill="#ffd0d4" letter-spacing="2">ON AIR</text></g>'+
  rex+ice+
  '<path d="M0 548H1200V620H0Z" fill="url(#desk)"/><path d="M0 538H1200V552H0Z" fill="#2A3A5A"/><path d="M0 552H1200" stroke="'+ch+'" stroke-width="3" opacity=".9"/>'+
  mon(600,"bsScore",g.a?g.a+" "+g.as+" – "+g.h+" "+g.hs:"VAULT")+mon(180,"bsClock",g.a?clock(g):"")+mon(1020,"bsLg",g.lg||"")+
  '<g transform="translate(600 592)">'+img(la,-250,-2,34)+img(lh,250,-2,34)+'<text text-anchor="middle" y="8" font-family="Arial Black,Arial,sans-serif" font-size="24" font-weight="900" letter-spacing="10" fill="#93C5FD" opacity=".9">VAULT BOOTH</text></g>'+
  [470,730].map(function(x,k){var c=k?CREW.ice.c:CREW.rex.c;return '<g transform="translate('+x+' 512)"><rect x="-4" y="0" width="8" height="34" fill="#94a3b8"/><rect x="-16" y="-24" width="32" height="26" rx="5" fill="'+c+'"/><text y="-6" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-size="11" font-weight="900" fill="#fff">V</text><ellipse cx="0" cy="-30" rx="10" ry="12" fill="#1f2937"/></g>'}).join("")+
  '</svg>'}
function bpGames(){var l=games().filter(function(g){return isLive(g)||(PL&&PL.games&&PL.games[gid(g)])});return l.length?l:games().slice(0,6)}
function bpEntry(g){var id=gid(g),e=PL&&PL.games&&PL.games[id];return e||{lg:g.lg,a:g.a,h:g.h,an:nm(g,"a"),hn:nm(g,"h"),as:g.as,hs:g.hs,st:isLive(g)?g.st:"FINAL",plays:[]}}
function chat(cs,k){
 if(cs.length>=2&&cs[0].w==="rex"&&cs[1].w==="ice"){var pre=pick(["",CREW.rex.f+", ","","You know, "+CREW.rex.f+", "],k+"p");if(pre)cs[1].t=pre+cs[1].t.charAt(0).toLowerCase()+cs[1].t.slice(1);
  var back=pick(["","Couldn't agree more, "+CREW.ice.f+".","","Great point, "+CREW.ice.f+".","Ha! Tell 'em, "+CREW.ice.f+".",""],k+"b");if(back)cs.push({w:"rex",t:back})}
 else if(cs.length===1&&cs[0].w==="rex"&&cs[0].h){var q=pick(["","What do you make of that, "+CREW.ice.f+"?","","How about that, "+CREW.ice.f+"?"],k+"q");if(q){cs[0].t+=" "+q;cs.push({w:"ice",t:pick(["That's a game-changer right there.","Momentum is a real thing, and you can feel it in this building.","Somebody on the other side has to answer, and soon.","That's the kind of play that wins you a game in November."],k+"a")})}}
 return cs}
function bpLines(g){var e=bpEntry(g);setCrew(gid(g));var out=intro(e,g).map(function(l,i){l.key="intro|"+i;return l});
 if(e.rp&&e.rp.length){return out.concat(snapLines(e,g))}(e.plays||[]).slice(-6).forEach(function(x){chat(calls(e,x),x.key||x.x).forEach(function(c,i){c.when=x.t||"";c.key=(x.key||x.x)+"|"+i;out.push(c)})});
 if(!(e.plays||[]).length)out.push({w:"rex",t:"We'll call every scoring play, turnover and big gain right here as it happens. Stay with us.",key:"wait"});return out}
function buildBooth(){
 BP=document.createElement("section");BP.id="boothPage";BP.className="bth";BP.hidden=true;BP.setAttribute("aria-label","The VAULT Booth");
 BP.innerHTML='<div class="bth-in"><header class="bth-h"><p class="bth-k"><i></i>Live from the VAULT Booth</p><h1 class="bth-t">The Booth.</h1><p class="bth-s">Every game gets its own booth. Pick a game and pull up a chair: its crew calls every play VAULT tracks, live, and only that game.</p></header>'+
  '<div class="bth-bar"><div class="bth-games" id="bpGames" role="tablist" aria-label="Booths: pick a game"></div><div class="bth-ctl"><button type="button" class="bth-btn hd" id="bpHD" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3zM5 11a7 7 0 0 0 14 0M12 18v3" fill="none" stroke="currentColor" stroke-width="2"/></svg><span>HD voices</span></button><button type="button" class="bth-btn pri" id="bpSound" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path class="w" d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2"/></svg><span>Listen live</span></button><button type="button" class="bth-btn" id="bpPlay" aria-pressed="true">Pause</button></div></div>'+
  '<p class="bth-hdn" id="bpHDn"></p><div class="bth-stage"><div class="bth-scene" id="bpScene">'+boothSVG()+'</div><div class="bth-cap" id="bpCap" aria-live="polite"><div class="bth-who" id="bpWho"></div><p id="bpSay"></p></div></div>'+
  '<div class="bth-cols"><section class="bth-crew" id="bpCrew"></section>'+
  '<section class="bth-tr"><h2>The call so far</h2><ol class="bo-lines" id="bpTr"></ol></section></div></div>';
 var view=$("#view");view.parentNode.insertBefore(BP,view.nextSibling);
 BP.addEventListener("click",function(e){
  var c=e.target.closest("[data-bp]");if(c){bpSel=c.getAttribute("data-bp");bpStart(true);return}
  if(e.target.closest("#bpHD")){if(HD.st==="off"||HD.st==="error"){HD.st="off";hdLoad()}if(!bpSound)$("#bpSound").click();return}
  if(e.target.closest("#bpSound")){bpSound=!bpSound;ambience(bpSound);var cn=navigator.connection||{};if(bpSound&&HD.st==="off"&&!cn.saveData&&cn.type!=="cellular"&&!/2g|3g/.test(cn.effectiveType||""))hdLoad();var b=$("#bpSound");b.setAttribute("aria-pressed",bpSound);b.querySelector("span").textContent=bpSound?"Sound on":"Listen live";if(!bpSound&&window.speechSynthesis)speechSynthesis.cancel();else{bpPlaying=true;$("#bpPlay").textContent="Pause";bpStart(false)}return}
  if(e.target.closest("#bpPlay")){bpPlaying=!bpPlaying;$("#bpPlay").textContent=bpPlaying?"Pause":"Play";$("#bpPlay").setAttribute("aria-pressed",bpPlaying);if(!bpPlaying){clearTimeout(bpT);clearInterval(bpType);bpTok++;if(window.speechSynthesis)speechSynthesis.cancel();if(bpAudio)bpAudio.pause();talk(null)}else bpNext()}});
 if(!("speechSynthesis" in window)&&!hdSupported())$("#bpSound").hidden=true;if(!hdSupported())$("#bpHD").hidden=true;hdUI();
}
function crewCards(g){var id=gid(g);setCrew(id);
 return '<h2>Tonight’s booth</h2><p class="bth-mu">'+esc(nm(g,"a"))+' at '+esc(nm(g,"h"))+'</p>'+
 '<div class="bth-card"><div class="bth-av">'+avatar("rex")+'</div><div><b>'+esc(CREW.rex.n)+'</b><small>Play-by-play</small><p>Calls the action the moment it lands.</p></div></div>'+
 '<div class="bth-card"><div class="bth-av">'+avatar("ice")+'</div><div><b>'+esc(CREW.ice.n)+'</b><small>Analyst</small><p>Brings the color: what the play means and why it mattered.</p></div></div>'+
 '<p class="bth-n">'+esc(CREW.rex.f)+' and '+esc(CREW.ice.f)+' are virtual announcers, not real people. Each VAULT game has its own two-person crew. Calls are written automatically from ESPN’s public play-by-play; every name, yard and score is real. Voices come from your device.</p>'}
var bpScenedFor=null;
function bpScene(g){var id=gid(g);if(bpScenedFor===id&&bpSel!=="studio")return;bpScenedFor=id;setCrew(id);var sc=$("#bpScene");if(sc)sc.innerHTML=boothSVG(g);var cr=$("#bpCrew");if(cr)cr.innerHTML=crewCards(g);
 BP.style.setProperty("--b1",tcol(g.lg,g.a));BP.style.setProperty("--b2",tcol(g.lg,g.h));bpVoices=null}
function bpCurGame(){var l=bpGames();var g=null;l.forEach(function(x){if(gid(x)===bpSel)g=x});if(!g){g=l.filter(isLive).sort(function(x,y){return pr(x)-pr(y)})[0]||l[0];bpSel=g?gid(g):null}return g}
function bpChips(){assignCrews();var box=$("#bpGames"),sl=box.scrollLeft,l=bpGames();box.innerHTML='<button type="button" role="tab" class="bth-chip studio" data-bp="studio" aria-selected="'+(bpSel==="studio")+'" aria-pressed="'+(bpSel==="studio")+'"><em><i></i>VAULT studio</em><span class="bt-sc">Whip-Around</span><small>🎙 Avery & Sato</small></button>'+l.slice(0,16).map(function(g){var id=gid(g);return '<button type="button" role="tab" class="bth-chip'+(isLive(g)?" live":"")+'" data-bp="'+esc(id)+'" aria-selected="'+(id===bpSel)+'" aria-pressed="'+(id===bpSel)+'"><em>'+(isLive(g)?'<i></i>':"")+esc(g.lg)+" · "+esc(clock(g))+'</em><span class="bt-sc">'+logoImg(g.lg,g.a,"sm",40)+esc(g.a)+" "+esc(g.as)+'<s>·</s>'+logoImg(g.lg,g.h,"sm",40)+esc(g.h)+" "+esc(g.hs)+'</span><small>🎙 '+esc(crewNames(id))+'</small></button>'}).join("");box.scrollLeft=sl}
function bpMon(g){if(!g)return;var t=$("#bsScore");if(t)t.textContent=g.a+" "+g.as+" – "+g.h+" "+g.hs;var c=$("#bsClock");if(c)c.textContent=clock(g);var a=$("#jbA"),h=$("#jbH");if(a)a.textContent=g.as;if(h)h.textContent=g.hs}
function bpTranscript(g){var ls=bpLines(g).slice().reverse();$("#bpTr").innerHTML=ls.map(function(l){return lineHTML(l,false)}).join("")}
function studioStart(){bpScenedFor="studio";CREW={rex:STUDIO.rex,ice:STUDIO.ice,sid:STUDIO.ice};var sc=$("#bpScene");if(sc)sc.innerHTML=boothSVG({lg:"",a:"",h:""});
 var cr=$("#bpCrew");if(cr)cr.innerHTML='<h2>The VAULT studio</h2><p class="bth-mu">Whip-Around: every live game, one show</p>'+
  '<div class="bth-card"><div class="bth-av">'+avatar("rex")+'</div><div><b>'+esc(STUDIO.rex.n)+'</b><small>Studio host</small><p>Takes you to every live game the moment something happens.</p></div></div>'+
  '<div class="bth-card"><div class="bth-av">'+avatar("ice")+'</div><div><b>'+esc(STUDIO.ice.n)+'</b><small>VAULT insider</small><p>The play that mattered in each game, and why.</p></div></div>'+
  '<p class="bth-n">Jordan and Kim are fictional VAULT reporters, not real people. Every score and play they mention comes from ESPN’s public data.</p>';
 BP.style.setProperty("--b1","#facc15");BP.style.setProperty("--b2","#2563eb");var t=$("#bsScore");if(t)t.textContent="WHIP-AROUND";var c=$("#bsClock");if(c)c.textContent=games().filter(isLive).length+" LIVE";
 bpChips();bpQ=studioLines(0);bpI=0;$("#bpTr").innerHTML=bpQ.slice().reverse().map(function(l){return lineHTML(l,false)}).join("");
 clearTimeout(bpT);if(window.speechSynthesis)speechSynthesis.cancel();if(bpAudio)bpAudio.pause();if(bpPlaying)bpNext()}
function bpStart(fromStart){if(bpSel==="studio"){studioStart();return}var g=bpCurGame();if(!g)return;bpScene(g);setCrew(gid(g));bpChips();bpMon(g);bpTranscript(g);bpQ=bpLines(g);bpI=fromStart||!bpSeenKeys[bpSel]?0:Math.max(0,bpQ.length-4);bpSeenKeys[bpSel]={};bpQ.forEach(function(l){bpSeenKeys[bpSel][l.key]=1});clearTimeout(bpT);if(window.speechSynthesis)speechSynthesis.cancel();if(bpAudio)bpAudio.pause();if(bpPlaying)bpNext()}
function talk(w){["annRex","annIce"].forEach(function(id){var el=document.getElementById(id);if(el){el.classList.toggle("talk",(w==="rex"&&id==="annRex")||(w==="ice"&&id==="annIce"));el.classList.toggle("look",!!w&&!((w==="rex"&&id==="annRex")||(w==="ice"&&id==="annIce")))}})}
var FEM=/female|samantha|victoria|karen|moira|tessa|fiona|serena|susan|zira|aria|jenny|ava|allison|kate|martha|nicky|catherine|libby|sonia|michelle|emma|olivia|google uk english female|google us english/i,
 MAL=/male|daniel|alex|fred|guy|matthew|davis|aaron|arthur|tom|eric|ryan|christopher|rishi|lee|oliver|gordon|reed|rocko|ralph|evan|nathan|thomas|george|james|brian|roger|andrew|tony|google uk english male/i;
var DVMAP={};
function pickVoices(){var v=(window.speechSynthesis&&speechSynthesis.getVoices()||[]).filter(function(x){return /^en/i.test(x.lang)});if(!v.length)return null;
 if(!pickVoices.n||pickVoices.n!==v.length){pickVoices.n=v.length;DVMAP={};var people=[STUDIO.rex,STUDIO.ice];ensureCrews(CREWS.length);CREWS.forEach(function(c){people.push(c.rex,c.ice,c.sid)});
  var used={},pitches=[1,.8,1.2,.7,1.3,.9,1.1];
  people.forEach(function(p){if(!p||DVMAP[p.n])return;var f=p.v&&p.v.g==="f",pool=v.filter(function(x){return f?FEM.test(x.name)&&!/\bmale\b/i.test(x.name):MAL.test(x.name)&&!/female/i.test(x.name)});if(!pool.length)pool=v;
   var st=hsh(p.n)%pool.length;for(var q=0;q<pitches.length;q++)for(var n=0;n<pool.length;n++){var c=pool[(st+n)%pool.length],key=c.name+"|"+pitches[q];if(!used[key]){used[key]=1;DVMAP[p.n]={voice:c,pitch:(p.v&&p.v.p||1)*pitches[q]};return}}
   DVMAP[p.n]={voice:pool[st],pitch:p.v&&p.v.p||1}})}
 return {rex:DVMAP[CREW.rex.n],ice:DVMAP[CREW.ice.n],sid:DVMAP[CREW.sid&&CREW.sid.n]}}
var bpBan=0;
function banter(e,g,n){
 var A=nick(e.an),H=nick(e.hn),out=[],lv=/LIVE|HALF/.test(e.st||""),k=gid(g)+"|"+n,S=scoreLine(e,e.as,e.hs);
 var opts=[];
 opts.push(function(){out.push({w:"rex",t:pick(["Let's reset for everybody just joining us. ","Quick look at the scoreboard. ","Here's where we stand. "],k)+S+(lv?", "+clock(g)+" to go in this one.":".")});out.push({w:"ice",t:pick(["Every possession matters from here, "+CREW.rex.f+".","Whoever wins the next few minutes wins this game.","I like the way both teams are competing."],k+"i")})});
 if(e.fs&&e.fs.a&&e.fs.h)opts.push(function(){out.push({w:"rex",t:"Total yards so far: "+A+" "+e.fs.a.yds+", "+H+" "+e.fs.h.yds+". "+CREW.ice.f+", what's jumping out at you?"});var ta=e.fs.a.to||0,th=e.fs.h.to||0;out.push({w:"ice",t:ta===th?"Turnovers are even at "+ta+", so this one comes down to who finishes drives.":"The turnover battle. "+(ta<th?A:H)+" are plus-"+Math.abs(ta-th)+" there, and that's the difference-maker."})});
 if(e.bs&&e.bs.a&&e.bs.h)opts.push(function(){out.push({w:"rex",t:e.bs.a.ld+" leads the "+A+" with "+e.bs.a.pts+". For the "+H+", it's "+e.bs.h.ld+" with "+e.bs.h.pts+"."});out.push({w:"ice",t:pick(["Stars showing up when it matters, "+CREW.rex.f+". That's what you love to see.","If "+e.bs.a.ld.split(" ").slice(-1)[0]+" stays hot, the "+A+" are dangerous.",e.bs.h.ld.split(" ").slice(-1)[0]+" has been the engine for the "+H+" all night."],k+"b")})});
 if(e.sh&&e.sh.length)opts.push(function(){var m={a:[0,0],h:[0,0]};e.sh.forEach(function(q){m[q[3]][1]++;if(q[2])m[q[3]][0]++});var pa=m.a[1]?Math.round(m.a[0]/m.a[1]*100):0,ph=m.h[1]?Math.round(m.h[0]/m.h[1]*100):0;
  out.push({w:"rex",t:"Shooting over the recent stretch: "+A+" "+m.a[0]+" of "+m.a[1]+", "+H+" "+m.h[0]+" of "+m.h[1]+"."});out.push({w:"ice",t:pa===ph?"Dead even. This is a make-or-miss game, "+CREW.rex.f+".":(pa>ph?A:H)+" are shooting it better, "+Math.max(pa,ph)+" percent. That's the gap."})});
 var hls=(e.plays||[]).filter(function(x){return x.hl});
 if(hls.length)opts.push(function(){var x=hls[hls.length-1];out.push({w:"rex",t:"Let's go back to that one. "+x.x});out.push({w:"ice",t:pick(["Watch it again and you see the whole thing develop. Beautiful.","That's the play people will be talking about tomorrow.","You can't teach that, "+CREW.rex.f+"."],k+"h")})});
 if(g.ar&&g.hr)opts.push(function(){out.push({w:"rex",t:"The "+A+" came in at "+g.ar+", the "+H+" at "+g.hr+"."});out.push({w:"ice",t:pick(["Records go out the window in a game like this.","You'd never know it from the way they're playing tonight.","Both teams know what's at stake."],k+"r")})});
 opts[n%opts.length]();out.forEach(function(l,i){l.key="ban|"+n+"|"+i});return out}
var bpType=null,bpTok=0;
/* text appears exactly when the voice starts, and is revealed at the speed it's spoken */
function sayReveal(txt,ms){var say=$("#bpSay"),t0=performance.now();clearInterval(bpType);if(RM||ms<=0){say.textContent=txt;return}
 bpType=setInterval(function(){var f=Math.min(1,(performance.now()-t0)/ms);say.textContent=txt.slice(0,Math.ceil(txt.length*f));if(f>=1)clearInterval(bpType)},30)}
function bpNext(){
 clearTimeout(bpT);if(!BP||BP.hidden||!bpPlaying)return;if(!bpQ.length)return;
 if(bpI>=bpQ.length){bpBan=(bpBan||0)+1;if(bpSel==="studio"){studioLines(bpBan).forEach(function(l){bpQ.push(l)})}else{var g0=bpCurGame(),e0=bpEntry(g0),xs=bpBan%3===0?sideline(e0,g0,bpBan):[];(xs.length?xs:banter(e0,g0,bpBan)).forEach(function(l){bpQ.push(l)})}}
 var l=bpQ[bpI++],p=CREW[l.w]||CREW.rex,txt=l.t,tok=++bpTok,cur=bpSel;
 var start=function(){if(tok!==bpTok)return;$("#bpWho").innerHTML=(l.w==="sid"?'<i class="bth-pip">'+avatar("sid")+'</i>':"")+'<b>'+esc(p.n)+'</b><span>'+esc(p.r)+(l.when?" · "+esc(l.when):"")+'</span>';
  var say=$("#bpSay");say.className=l.h?"hype":"";say.textContent="";talk(l.w);if(l.h&&bpSound)swell()};
 var done=function(){if(tok!==bpTok)return;clearInterval(bpType);$("#bpSay").textContent=txt;talk(null);bpT=setTimeout(bpNext,l.w==="rex"?250:400)};
 if(bpSound&&HD.st==="ready"){hdPrefetch();$("#bpCap").classList.add("wait");
  hdLine(l).then(function(r){if(tok!==bpTok||cur!==bpSel||!bpPlaying)return;$("#bpCap").classList.remove("wait");if(!r){speakDevice();return}
   if(bpAudio)bpAudio.pause();var a=bpAudio=new Audio(r.url);if(r.rt!==1){a.preservesPitch=false;a.mozPreservesPitch=false;a.webkitPreservesPitch=false;a.playbackRate=r.rt}
   a.onplaying=function(){start();sayReveal(txt,(a.duration||txt.length/14)/(r.rt||1)*1000*.92)};a.onended=done;a.onerror=function(){start();sayReveal(txt,0);setTimeout(done,txt.length*55)};
   var pr0=a.play();if(pr0&&pr0.catch)pr0.catch(function(){start();sayReveal(txt,0);setTimeout(done,txt.length*55)});hdPrefetch()});return}
 if(bpSound&&window.speechSynthesis){speakDevice();return}
 start();sayReveal(txt,txt.length*38);bpT=setTimeout(function(){if(bpPlaying)done()},Math.max(2400,txt.length*58));
 function speakDevice(){var u=new SpeechSynthesisUtterance(txt),vv=pickVoices(),dv=vv&&vv[l.w],pv=p.v||{p:1,r:1},began=false;if(dv&&dv.voice)u.voice=dv.voice;
  u.pitch=Math.max(.1,Math.min(2,dv?dv.pitch:pv.p));u.rate=pv.r*(l.h?1.08:1);
  u.onstart=function(){began=true;start();sayReveal(txt,txt.length*62/u.rate)};
  u.onboundary=function(ev){if(tok!==bpTok||ev.charIndex==null)return;clearInterval(bpType);var end=txt.indexOf(" ",ev.charIndex+(ev.charLength||1));$("#bpSay").textContent=txt.slice(0,end<0?txt.length:end)};
  u.onend=done;u.onerror=function(){if(!began){start();sayReveal(txt,0)}setTimeout(done,txt.length*50)};
  speechSynthesis.speak(u);setTimeout(function(){if(!began&&tok===bpTok){began=true;start();sayReveal(txt,txt.length*60)}},900)}}
function bpRefresh(){if(!BP||BP.hidden)return;if(bpSel==="studio"){bpChips();return}var g=bpCurGame();if(!g)return;bpScene(g);setCrew(gid(g));bpChips();bpMon(g);bpTranscript(g);var fresh=bpLines(g).filter(function(l){return !(bpSeenKeys[bpSel]||{})[l.key]});if(fresh.length){fresh.forEach(function(l){bpSeenKeys[bpSel][l.key]=1});bpQ=bpLines(g);bpI=bpQ.length-fresh.length;}}
function boothRoute(){
 var on=(location.hash||"").slice(1)==="booth";if(!BP)buildBooth();
 var view=$("#view");BP.hidden=!on;view.style.display=on?"none":"";if(AR&&on)AR.hidden=true;
 navLink();
 if(on){window.scrollTo(0,0);document.title="The Booth — VAULT";bpStart(false);var t=BP.querySelector(".bth-t");if(t){words(t);t.classList.remove("in");setTimeout(function(){t.classList.add("in")},80)}}
 else{clearTimeout(bpT);if(window.speechSynthesis)speechSynthesis.cancel();if(bpAudio)bpAudio.pause();ambience(false);if(bpSound){bpSound=false;var sb=$("#bpSound");if(sb){sb.setAttribute("aria-pressed","false");sb.querySelector("span").textContent="Listen live"}}}}
function navLink(){
 var on=(location.hash||"").slice(1)==="booth";
 ["#nav","#drawerNav"].forEach(function(sel){var n=$(sel);if(!n)return;var a=n.querySelector("a.bth-nav");
  if(!a){a=document.createElement("a");a.className="bth-nav";a.href="#booth";a.innerHTML='<i></i>The Booth';var h=n.querySelector('a[href="#scores"]');if(h&&h.nextSibling)n.insertBefore(a,h.nextSibling);else n.appendChild(a)}
  a.classList.toggle("on",on);if(on)n.querySelectorAll("a.on").forEach(function(x){if(x!==a)x.classList.remove("on")})})}
var parY=0;
function parallax(){if(RM)return;var y=window.scrollY;if(Math.abs(y-parY)<1)return;parY=y;var h=document.querySelector("#view .hero .art");if(h){var r=h.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight)h.style.setProperty("--py",(r.top*-0.12).toFixed(1)+"px")}}

/* ---------- boot ---------- */
function boot(){
 if(!A()||!A().D){setTimeout(boot,200);return}
 if(!RM)document.documentElement.classList.add("fx-anim");build();tick();decorate();bottomLine();reveal();flyIn();if(AR&&RM)AR.classList.add("settled");
 var v=$("#view");if(v){var mo=new MutationObserver(function(){decorate();booth();gamePage();reveal();fightCard(false);if((location.hash||"")==="#highlights"&&document.getElementById("hlGrid")&&!document.getElementById("hlGrid").children.length)window.VHL.after()});mo.observe(v,{childList:true})}
 setInterval(tick,1000);
 loadPlays();setInterval(function(){if(!document.hidden)loadPlays()},15000);lvStart();setTimeout(lvBoothTick,4000);loadUFC();setInterval(function(){if(!document.hidden)loadUFC()},60000);
 window.addEventListener("hashchange",function(){gpFilter="all";render(true);boothRoute();setTimeout(function(){booth();gamePage()},50)});boothRoute();var nv=$("#nav");if(nv){var nmo=new MutationObserver(function(){if(!nv.querySelector("a.bth-nav"))navLink()});nmo.observe(nv,{childList:true})}var dn=$("#drawerNav");if(dn){var dmo=new MutationObserver(function(){if(!dn.querySelector("a.bth-nav"))navLink()});dmo.observe(dn,{childList:true})}window.addEventListener("scroll",function(){requestAnimationFrame(parallax)},{passive:true});if(window.speechSynthesis)speechSynthesis.onvoiceschanged=function(){bpVoices=null}}
boot();
}catch(err){if(window.console)console.warn("VAULT FX off:",err)}
})();

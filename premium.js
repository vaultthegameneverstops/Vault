/* VAULT Plus — premium layer. Plans are DEMO only: no payment is collected. */
(function(){
var P=null,loading=false,failed=false;
var $=function(s,r){return(r||document).querySelector(s)};
function A(){return window.VaultApp||{}}
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function sg(k){try{return localStorage.getItem(k)}catch(e){return null}}
function ss(k,v){try{localStorage.setItem(k,v)}catch(e){}}
function jg(k,d){try{var v=JSON.parse(sg(k));return v==null?d:v}catch(e){return d}}
function stories(){return(A().D&&A().D.stories)||[]}
var PRICE={monthly:1.99,annual:14.99};
var CO=null;
function plan(){var p=jg("vault.plan",null);return p&&p.plan?p:{plan:"free",cycle:"annual"}}
function isPlus(){return true}
function money(n){return"$"+n.toFixed(2)}
/* ---------- badges ---------- */
function Bdg(k,t){if(k==="plus")return "";var m={live:"DATA FEED",snap:"SNAPSHOT"+(P?" · "+P.asOf:""),demo:"DEMO DATA",edit:"VAULT EDITORIAL",plus:"PLUS",orig:"VAULT ORIGINAL",op:"OPINION"};return '<span class="bd bd-'+k+'">'+esc(t||m[k])+'</span>'}
function Lock(title,txt){return '<div class="lockbox"><i class="lk-i" aria-hidden="true"></i><div><b>'+esc(title)+'</b><span>'+esc(txt||"Included with VAULT Plus.")+'</span></div><a class="btn-p" href="#plus">Unlock with Plus</a></div>'}
function Gate(inner,title,txt){return isPlus()?inner:'<div class="gate"><div class="gate-b" aria-hidden="true">'+inner+'</div>'+Lock(title,txt)+'</div>'}
function Head(kick,title,sub,badges){return '<header class="vx-h vx-in"><div class="vx-k">'+esc(kick)+'</div><h1 class="vx-t">'+esc(title)+'</h1><p class="vx-s">'+esc(sub)+'</p><div class="vx-b">'+(badges||"")+'</div></header>'}
/* ---------- math ---------- */
function wp(t){var g=t.w+t.l;return g?t.w/g:0}
function pct(n){return(Math.round(n*1000)/10).toFixed(1)+"%"}
function lg(k){return P.std[k]||[]}
function team(k,ab){return lg(k).filter(function(t){return t.ab===ab})[0]}
function gb(k,t){var g=lg(k).filter(function(x){return x.conf===t.conf&&x.div===t.div}),L=g.sort(function(a,b){return(b.w-b.l)-(a.w-a.l)})[0];return((L.w-t.w)+(t.l-L.l))/2}
function avgWp(k){var l=lg(k),s=0;l.forEach(function(t){s+=wp(t)});return s/l.length}
function fmtGb(n){return n===0?"—":String(n)}
/* ---------- charts ---------- */
function Ring(p,big,sub){var C=2*Math.PI*46,v=Math.max(0,Math.min(1,p))*C;return '<div class="ring"><svg viewBox="0 0 120 120" role="img" aria-label="'+esc(big+" "+sub)+'"><circle cx="60" cy="60" r="46" class="rg-t"/><circle cx="60" cy="60" r="46" class="rg-v" style="--c:'+C.toFixed(1)+';--v:'+v.toFixed(1)+'" transform="rotate(-90 60 60)"/></svg><div class="ring-c"><b>'+esc(big)+'</b><small>'+esc(sub)+'</small></div></div>'}
function HBar(label,val,max,txt,ref,note){var w=Math.max(2,Math.min(100,val/max*100)),r=ref!=null?'<i class="ref" style="left:'+Math.min(100,ref/max*100)+'%" title="Reference average"></i>':"";return '<div class="hb"><div class="hb-l"><span>'+esc(label)+'</span><b>'+esc(txt)+'</b></div><div class="hb-t"><span class="hb-f" style="width:'+w+'%"></span>'+r+'</div>'+(note?'<small>'+esc(note)+'</small>':"")+'</div>'}
function Duel(rows,an,bn){
  return '<div class="duel"><div class="du-h"><b>'+esc(an)+'</b><b>'+esc(bn)+'</b></div>'+rows.map(function(r){
    var m=Math.max(r.a,r.b,.0001),wa=r.a/m*100,wb=r.b/m*100,ea=r.a===r.b?"":(r.hi?r.a>r.b:r.a<r.b)?"win":"",eb=r.a===r.b?"":(r.hi?r.b>r.a:r.b<r.a)?"win":"";
    return '<div class="du-r"><div class="du-v '+ea+'">'+esc(r.fa)+'</div><div class="du-bars"><div class="du-side l"><span class="'+ea+'" style="width:'+wa+'%"></span></div><div class="du-lab">'+esc(r.l)+'</div><div class="du-side r"><span class="'+eb+'" style="width:'+wb+'%"></span></div></div><div class="du-v '+eb+'">'+esc(r.fb)+'</div></div>'}).join("")+'</div>'}
function Scatter(k,sel){
  var l=lg(k),mx=Math.max.apply(null,l.map(function(t){return Math.max(t.w,t.l)}))+1,W=320,H=250,pd=34;
  function X(v){return pd+v/mx*(W-pd-10)}function Y(v){return H-pd-v/mx*(H-pd-10)}
  var dots=l.map(function(t){var s=sel.indexOf(t.ab)>-1;return '<circle cx="'+X(t.l).toFixed(1)+'" cy="'+Y(t.w).toFixed(1)+'" r="'+(s?6:3.4)+'" class="'+(s?"sc-s":"sc-d")+'"><title>'+esc(t.name+" "+t.w+"-"+t.l)+'</title></circle>'+(s?'<text x="'+(X(t.l)+9).toFixed(1)+'" y="'+(Y(t.w)+4).toFixed(1)+'" class="sc-t">'+esc(t.ab)+'</text>':"")}).join("");
  return '<svg class="scat" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Every team: wins against losses"><line x1="'+X(0)+'" y1="'+Y(0)+'" x2="'+X(mx)+'" y2="'+Y(mx)+'" class="sc-l"/><line x1="'+X(0)+'" y1="'+Y(0)+'" x2="'+X(mx)+'" y2="'+Y(0)+'" class="sc-a"/><line x1="'+X(0)+'" y1="'+Y(0)+'" x2="'+X(0)+'" y2="'+Y(mx)+'" class="sc-a"/><text x="'+(W/2)+'" y="'+(H-6)+'" class="sc-x" text-anchor="middle">Losses →</text><text x="10" y="'+(H/2)+'" class="sc-x" text-anchor="middle" transform="rotate(-90 10 '+(H/2)+')">Wins →</text><text x="'+(X(mx)-4)+'" y="'+(Y(mx)+12)+'" class="sc-x" text-anchor="end">.500 line</text>'+dots+'</svg>'}
/* ---------- VAULT Rating (original editorial score) ---------- */
function rate(s){
  var D=A().D,txt=(s.title+" "+s.dek+" "+s.body.join(" ")).toLowerCase(),srcs=s.sources||[],links=srcs.filter(function(x){return x.u}).length;
  var cred=Math.min(99,30+Math.min(srcs.length,3)*14+(links?12:0));if(s.unconfirmed)cred=Math.min(cred,38);
  var kw=(txt.match(/controvers|fired|waive|accus|bench|feud|brawl|suspen|backlash|criticiz|disput|investigat|slam|blast|outrage|ejected|fine[sd]?\b|lawsuit|arrest/g)||[]).length;
  var con=Math.min(98,15+kw*11+(s.unconfirmed?15:0));
  var idx=D.stories.indexOf(s),imp=35+(idx===0?22:0)+((D.trending||[]).indexOf(s.id)>-1?15:0)+(/breaking/i.test(s.label||"")?12:0)+(srcs.length>=3?10:0)+Math.min(12,(s.tags||[]).length*3);imp=Math.min(98,imp);
  var all=Math.round(.4*imp+.35*cred+.25*con);
  var why=[];if(idx===0)why.push("Lead story on the front page");if((D.trending||[]).indexOf(s.id)>-1)why.push("Trending");if(srcs.length)why.push(srcs.length+" source"+(srcs.length>1?"s":"")+" named"+(links?", "+links+" linked":""));if(s.unconfirmed)why.push("Marked unconfirmed, so credibility is capped");if(kw)why.push(kw+" conflict word"+(kw>1?"s":"")+" in the text");
  return{imp:imp,cred:cred,con:con,all:all,why:why}}
function grade(n){return n>=80?"A":n>=65?"B":n>=50?"C":n>=35?"D":"E"}
function RatingBox(s){
  var r=rate(s);
  var det='<div class="rt-bars">'+HBar("Impact",r.imp,100,r.imp+"")+HBar("Credibility",r.cred,100,r.cred+"")+HBar("Controversy heat",r.con,100,r.con+"")+'</div><ul class="rt-why">'+r.why.map(function(w){return'<li>'+esc(w)+'</li>'}).join("")+'</ul>';
  return '<section class="rt vx-in" aria-label="VAULT Rating"><div class="rt-top"><div class="rt-n"><b>'+r.all+'</b><small>/100</small></div><div class="rt-m"><div class="rt-t">VAULT RATING '+Bdg("plus","PLUS")+'</div><p>Grade <b>'+grade(r.all)+'</b>. An original score from VAULT, worked out from the story\'s own sources, labels and coverage. Not a statistic.</p></div></div>'+
   Gate(det,"See the full breakdown","Impact, credibility and controversy scores, and why.")+'<small class="rt-f">Overall = 40% impact + 35% credibility + 25% controversy heat. '+Bdg("edit")+'</small></section>'}
/* ---------- plans ---------- */
var FEATS=[["Player Stats","Preview of the leaderboard","Every stat line + charts"],["Player Talk","Read-only preview","Rate and post takes"],["VAULT Rating","Score only","Full breakdown"],["VAULT Intel","Profiles + basic charts","Full stat charts + fight breakdowns"],["Matchup Lab","Headline numbers","Visual comparison + scatter"],["The Full Story","First 3 timeline entries","Full timeline + fact checks"],["My VAULT","3 favorites","Unlimited favorites"],["Priority Alerts","1 alert category","All 5 categories + keywords"],["VAULT Exclusive","Previews + 1 free read","Every report and ranking"]];
var pickCycle=null;
function vFree(){return Head("VAULT","Everything is free","Intel, Matchup Lab, The Full Story, My VAULT, Priority Alerts, Exclusive and Top Performances are open to everyone. There are no subscriptions and no payments.",Bdg("live"))+'<div class="catg vx-in">'+[["performances","Top Performances"],["intel","VAULT Intel"],["matchup","Matchup Lab"],["fullstory","The Full Story"],["myvault","My VAULT"],["alerts","Priority Alerts"],["exclusive","VAULT Exclusive"]].map(function(c){return '<a class="catc" href="#'+c[0]+'"><b>'+c[1]+'</b><p>Open →</p></a>'}).join("")+'</div>'}
function vPlus(){
  var p=plan(),cy=pickCycle||p.cycle,save=Math.round((1-PRICE.annual/(PRICE.monthly*12))*100);
  var co=CO&&CO.step?'<section class="panel co vx-in" aria-label="Checkout"><h3 class="hd2">Checkout '+Bdg("demo","DEMO — NO CHARGE")+'</h3><div class="co-r"><span>VAULT Plus · '+(CO.cy==="annual"?"annual":"monthly")+'</span><b>'+money(CO.cy==="annual"?PRICE.annual:PRICE.monthly)+'</b></div><div class="co-b"><button type="button" class="pay pay-a" data-vx="pay:apple">Pay with Apple Pay</button><button type="button" class="pay pay-p" data-vx="pay:paypal">Pay with PayPal</button></div><div class="notice"><b>These buttons are a demo.</b> VAULT is not connected to Apple Pay, PayPal or any payment service, so nothing is charged and no account or card details are collected. Pressing a button only switches on the demo plan on this device. If VAULT goes live with real payments, anyone under 18 should have a parent or guardian approve the purchase.</div><button type="button" class="btn-g" data-vx="coX">Cancel</button></section>':"";
  var rows=FEATS.map(function(f){return '<tr><th scope="row">'+esc(f[0])+'</th><td>'+esc(f[1])+'</td><td class="pl">'+esc(f[2])+'</td></tr>'}).join("");
  var CAT=[["performances","Top Performances","Ten major performances a week in NFL, NBA, college football, college hoops and UFC."],["performances","Comments","Rate a performance and post your take."],["intel","VAULT Intel","Fighter and team profiles with stat charts."],["matchup","Matchup Lab","Two fighters or teams, side by side."],["fullstory","The Full Story","Timelines, fact checks and sources."],["myvault","My VAULT","A feed built around your teams and athletes."],["alerts","Priority Alerts","Trades, injuries, signings, fights and controversies."],["exclusive","VAULT Exclusive","Weekly reports, rankings and explainers."]];
  var cat='<h2 class="vx-h2">Everything in VAULT Plus</h2><div class="catg vx-in">'+CAT.map(function(c){return '<a class="catc" href="#'+c[0]+'"><span class="pb">'+(isPlus()?"UNLOCKED":"PLUS")+'</span><b>'+esc(c[1])+'</b><p>'+esc(c[2])+'</p></a>'}).join("")+'</div>';
  return Head("MEMBERSHIP","VAULT Plus","Deeper analysis, the full timeline of every big story, and tools built around your teams.",Bdg("demo","DEMO — NO PAYMENTS")+Bdg("plus"))+
  co+'<div class="notice vx-in"><b>Demo mode.</b> VAULT has no payment provider connected, so nothing is charged and no card is collected. Prices below are placeholders. The plan buttons switch a demo plan on this device only.</div>'+
  '<div class="cyc vx-in" role="group" aria-label="Billing period"><button type="button" class="'+(cy==="monthly"?"on":"")+'" data-vx="cycle:monthly">Monthly</button><button type="button" class="'+(cy==="annual"?"on":"")+'" data-vx="cycle:annual">Annual <em>save '+save+'%</em></button></div>'+
  '<div class="plans vx-in"><article class="plan"><h2>Free</h2><div class="pr"><b>$0</b><span>forever</span></div><ul><li>All news, scores and game pages</li><li>Saves, ratings and fan debates</li><li>VAULT Rating score</li><li>Previews of every Plus tool</li></ul>'+(p.plan==="free"?'<div class="cur">Your current plan</div>':'<button class="btn-g" type="button" data-vx="plan:free">Switch to Free (demo)</button>')+'</article>'+
  '<article class="plan plus"><div class="ribbon">BEST VALUE</div><h2>VAULT Plus</h2><div class="pr"><b>'+money(cy==="annual"?PRICE.annual:PRICE.monthly)+'</b><span>/ '+(cy==="annual"?"year":"month")+' · placeholder</span></div>'+(cy==="annual"?'<div class="eq">'+money(PRICE.annual/12)+' a month, billed once a year (placeholder). Renews every year until you cancel. Cancel any time.</div>':'<div class="eq">Renews every month until you cancel. Cancel any time (demo).</div>')+'<div class="eq">Full price, no extra fees. Any tax is shown before you pay. <a href="#refunds">Refund policy</a></div>'+'<ul><li>Full VAULT Rating breakdown</li><li>VAULT Intel charts and fight-night breakdowns</li><li>Matchup Lab with visual comparisons</li><li>The Full Story: complete timelines and fact checks</li><li>Unlimited My VAULT favorites</li><li>All Priority Alerts plus keywords</li><li>Every VAULT Exclusive report and ranking</li></ul>'+(p.plan==="plus"&&p.cycle===cy?'<div class="cur">Your current plan · <a href="#account">Manage</a></div>':'<button class="btn-p big" type="button" data-vx="'+(p.plan==="plus"?"plan:plus:"+cy:"checkout:"+cy)+'">'+(p.plan==="plus"?"Switch to "+cy+" (demo)":"Continue to checkout (demo)")+'</button>')+'</article></div>'+
  cat+'<h2 class="vx-h2">Free vs Plus</h2><div class="tblw"><table class="cmp vx-in"><thead><tr><th></th><th>Free</th><th class="pl">Plus</th></tr></thead><tbody>'+rows+'</tbody></table></div>'}
function vAccount(){
  var p=plan(),plus=p.plan==="plus",since=p.since?new Date(p.since):null,ren=since?new Date(since.getTime()+(p.cycle==="annual"?365:30)*864e5):null;
  function d(x){return x?x.toLocaleDateString([], {month:"short",day:"numeric",year:"numeric"}):"—"}
  var fav=jg("vault.fav",{sports:[],teams:[],athletes:[]}),al=jg("vault.alerts",null);
  return Head("MEMBERSHIP","Manage subscription","Your plan, billing and data. Everything here is demo data stored on this device.",Bdg("demo","DEMO — NO PAYMENTS"))+
  '<div class="acct vx-in"><section class="ac"><h3>Plan</h3><div class="ac-big">'+(plus?"VAULT Plus":"Free")+(plus?" "+Bdg("plus"):"")+'</div><dl><dt>Billing period</dt><dd>'+(plus?(p.cycle==="annual"?"Annual · "+money(PRICE.annual)+" (placeholder)":"Monthly · "+money(PRICE.monthly)+" (placeholder)"):"None")+'</dd><dt>Started (demo)</dt><dd>'+(plus?d(since):"—")+'</dd><dt>Next renewal (demo)</dt><dd>'+(plus?d(ren):"—")+'</dd></dl>'+
   (plus?'<div class="ac-b"><button class="btn-g" data-vx="plan:plus:'+(p.cycle==="annual"?"monthly":"annual")+'" type="button">Switch to '+(p.cycle==="annual"?"monthly":"annual")+'</button><button class="btn-g danger" data-vx="plan:free" type="button">Cancel Plus (demo)</button></div>':'<div class="ac-b"><a class="btn-p" href="#plus">See VAULT Plus</a></div>')+'</section>'+
  '<section class="ac"><h3>Payment method</h3><div class="ac-big mu">Not connected</div><p>No payment provider is connected to VAULT yet. Real subscriptions will need one, and nothing on this screen charges money.</p><h3 class="sp">Pay with</h3><p>Apple Pay and PayPal are shown at checkout as a demo. Neither is connected.</p><h3 class="sp">Invoices</h3><p>None. Demo plans do not create invoices.</p></section>'+
  '<section class="ac"><h3>Your data on this device</h3><dl><dt>Favorites</dt><dd>'+(fav.sports.length+fav.teams.length+fav.athletes.length)+'</dd><dt>Alert rules</dt><dd>'+(al?"Customized":"Default")+'</dd><dt>Saved stories</dt><dd>'+jg("vault.saved",[]).length+'</dd></dl><div class="ac-b"><button class="btn-g danger" type="button" data-vx="reset">Reset My VAULT and alerts</button></div></section></div>'}
/* ---------- Full Story ---------- */
var TY={confirmed:"CONFIRMED",reported:"REPORTED",claim:"CLAIM",upcoming:"UPCOMING"};
function Src(n,u){return u?'<a class="srcl" href="'+esc(u)+'" target="_blank" rel="noopener noreferrer">'+esc(n)+' ↗</a>':'<span class="srcl nl">'+esc(n)+'</span>'}
function vFSIndex(){
  return Head("THE FULL STORY","The Full Story","Timelines, verified facts and source links for the biggest stories. Every entry says whether it is confirmed, reported, a claim or still ahead.",Bdg("snap")+Bdg("plus"))+
  '<div class="fsl vx-in">'+P.fullstory.map(function(f,i){var s=A().byId(f.story);return '<a class="fsc" href="#fullstory-'+esc(f.id)+'" style="animation-delay:'+i*70+'ms"><span class="st st-'+f.status.toLowerCase()+'">'+(f.status==="DEVELOPING"?'<i class="dot"></i>':"")+esc(f.status)+'</span><h3>'+esc(f.title)+'</h3><p>'+f.timeline.length+' timeline entries · '+f.facts.length+' facts checked · updated '+esc(f.updated)+'</p></a>'}).join("")+'</div>'+
  '<div class="notice vx-in">The Full Story packages are written from reporting VAULT has already linked. Updates are added when sources change. This is a '+'<b>snapshot as of '+esc(P.asOfLong)+'</b>, not a live feed.</div>'}
function vFS(id){
  var f=P.fullstory.filter(function(x){return x.id===id})[0];if(!f)return '<a class="back" href="#fullstory">← The Full Story</a>'+A().Empty("Not found","This package does not exist.");
  var plus=isPlus(),free=3;
  function tl(e,i){return '<li class="tl tl-'+e.type+'" style="animation-delay:'+i*60+'ms"><span class="tl-d"></span><div><div class="tl-w">'+esc(e.when)+' <em class="ty ty-'+e.type+'">'+TY[e.type]+'</em></div><p>'+esc(e.t)+'</p>'+(e.n?'<small>Source: '+Src(e.n,e.u)+'</small>':"")+'</div></li>'}
  var shown=f.timeline.slice(0,free).map(tl).join(""),rest=f.timeline.slice(free).map(function(e,i){return tl(e,i+free)}).join("");
  var facts='<div class="tblw"><table class="cmp facts"><thead><tr><th>Claim</th><th>Status</th><th>Source</th></tr></thead><tbody>'+f.facts.map(function(x){var lv=/anonym/i.test(x.s)?"ANONYMOUS SOURCES":/claim|said|tell/i.test(x.s)&&!/confirm/i.test(x.s)?"CLAIM":/confirm/i.test(x.s)?"CONFIRMED":"REPORTED";return '<tr><td>'+esc(x.c)+'</td><td><em class="ty ty-'+(lv==="CONFIRMED"?"confirmed":lv==="CLAIM"?"claim":"reported")+'">'+lv+'</em><small>'+esc(x.s)+'</small></td><td>'+Src(x.n,x.u)+'</td></tr>'}).join("")+'</tbody></table></div>';
  var srcs={};f.timeline.concat(f.facts).forEach(function(x){if(x.n)srcs[x.n]=srcs[x.n]||x.u});
  return '<a class="back" href="#fullstory">← The Full Story</a>'+Head("THE FULL STORY",f.title,"Updated "+f.updated+". Status: "+f.status.toLowerCase()+".",'<span class="st st-'+f.status.toLowerCase()+'">'+(f.status==="DEVELOPING"?'<i class="dot"></i>':"")+esc(f.status)+'</span>'+Bdg("snap")+(A().byId(f.story)?'<a class="vx-link" href="#story-'+esc(f.story)+'">Read the VAULT story →</a>':""))+
  '<div class="legend vx-in"><span><em class="ty ty-confirmed">CONFIRMED</em> on record</span><span><em class="ty ty-reported">REPORTED</em> by outlets, often from sources</span><span><em class="ty ty-claim">CLAIM</em> said by one side</span></div>'+
  '<h2 class="vx-h2">Timeline</h2><ol class="tls">'+shown+'</ol>'+(rest?(plus?'<ol class="tls">'+rest+'</ol>':'<div class="gate"><ol class="tls gate-b" aria-hidden="true">'+rest+'</ol>'+Lock("Full timeline","Plus shows every entry, including the latest developments.")+'</div>'):"")+
  '<h2 class="vx-h2">Fact check</h2>'+Gate(facts,"Fact check table","Each claim, how solid it is, and where it came from.")+
  '<h2 class="vx-h2">What we don\'t know yet</h2><ul class="unk vx-in">'+f.unknown.map(function(u){return'<li>'+esc(u)+'</li>'}).join("")+'</ul>'+
  '<h2 class="vx-h2">Developing updates</h2><ul class="upd vx-in">'+f.updates.map(function(u){return'<li><b>'+esc(u.t)+'</b> '+esc(u.x)+'</li>'}).join("")+'</ul>'+
  '<h2 class="vx-h2">Sources</h2><div class="srcs vx-in">'+Object.keys(srcs).map(function(n){return Src(n,srcs[n])}).join("")+'</div>'+RatingFor(f.story)}
function RatingFor(id){var s=A().byId(id);return s?'<h2 class="vx-h2">VAULT Rating</h2>'+RatingBox(s):""}
/* ---------- Intel ---------- */
function relStories(words){
  var w=words.filter(Boolean).map(function(x){return x.toLowerCase()});
  return stories().filter(function(s){var t=(s.title+" "+s.dek+" "+(s.tags||[]).join(" ")).toLowerCase();return w.some(function(x){return t.indexOf(x)>-1})}).slice(0,3)}
function Rel(l){return l.length?'<h2 class="vx-h2">In the news '+Bdg("live")+'</h2><div class="cards">'+l.map(A().Card).join("")+'</div>':""}
function tickerFor(ab){var T=(A().D&&A().D.ticker)||[],g=T.filter(function(x){return x.a===ab||x.h===ab})[0];return g?'<div class="notice vx-in">'+Bdg("live")+' Latest score in the VAULT feed: <b>'+esc(g.a)+' '+g.as+', '+esc(g.h)+' '+g.hs+'</b> ('+esc(g.st||"FINAL")+'). <a href="#game-'+esc(A().gid(g))+'">Open game page</a></div>':""}
function vIntel(){
  var tabs=[["f","Fighters"],["nfl","NFL teams"],["nba","NBA teams"],["cbb","College hoops"]];
  var fl=P.fighters.map(function(f){return '<a class="ic" href="#intel-f-'+f.id+'"><span class="ic-k">'+esc(f.cls)+'</span><b>'+esc(f.name)+'</b><span class="ic-r">'+esc(f.rec)+'</span></a>'}).join("");
  function tl(k,l){return '<div class="chips2">'+lg(k).slice().sort(function(a,b){return wp(b)-wp(a)||a.name.localeCompare(b.name)}).map(function(t){return '<a href="#intel-'+k+'-'+t.ab+'">'+esc(t.ab)+' <small>'+t.w+'-'+t.l+'</small></a>'}).join("")+'</div>'}
  var cb=P.cbb.map(function(t){return '<a href="#intel-cbb-'+encodeURIComponent(t.t.replace(/ /g,"_"))+'">'+t.r+'. '+esc(t.t)+' <small>'+esc(t.rec)+'</small></a>'}).join("");
  return Head("VAULT INTEL","VAULT Intel","Deep profiles for fighters and teams: records, standings context and charts. Numbers come from named sources and are labeled by date.",Bdg("snap")+Bdg("plus"))+
  '<h2 class="vx-h2">Fighters</h2><div class="ics vx-in">'+fl+'</div><h2 class="vx-h2">NFL teams</h2>'+tl("nfl")+'<h2 class="vx-h2">NBA teams</h2>'+tl("nba")+'<h2 class="vx-h2">College basketball · AP Top 14</h2><div class="chips2">'+cb+'</div>'+
  '<p class="foot-n">Team records from the standings snapshot of '+esc(P.asOfLong)+'. College hoops ranks from the AP poll (week 4). Check the live Scores page for tonight\'s results.</p>'}
function vFighter(id){
  var f=P.fighters.filter(function(x){return x.id===id})[0];if(!f)return vIntel();
  var tape=[["Record",f.rec],["Division",f.cls]];if(f.age)tape.push(["Age",f.age]);if(f.ht)tape.push(["Height",f.ht]);if(f.reach)tape.push(["Reach",f.reach+'"']);if(f.stance)tape.push(["Stance",f.stance]);if(f.ufc)tape.push(["UFC",f.ufc]);
  var w=f.w+f.l,ring=Ring(f.w/(w||1),pct(f.w/(w||1)),"wins");
  var adv="";
  if(f.slpm!=null){var a=P.wavg;adv='<div class="panel">'+HBar("Strikes landed / min",f.slpm,8,f.slpm.toFixed(2),a.slpm,"Marker = reference average "+a.slpm)+HBar("Strike accuracy",f.acc,100,f.acc+"%",a.acc,"Reference "+a.acc+"%")+HBar("Strikes absorbed / min (lower is better)",f.sapm,8,f.sapm.toFixed(2),a.sapm,"Reference "+a.sapm)+HBar("Strike defense",f.def_,100,f.def_+"%",a.def_,"Reference "+a.def_+"%")+HBar("Takedowns / 15 min",f.td,4,f.td.toFixed(2),a.td,"Reference "+a.td)+HBar("Takedown defense",f.tdd,100,f.tdd+"%",null)+'<small class="foot-n">Per-fight career averages. Reference average from '+esc(a.src.n)+'.</small></div>'}
  else if(f.fight){var g=f.fight,sa=g.sig[0]/g.sig[1];adv='<div class="panel"><h3 class="hd2">UFC Qatar, Nov 21 · fight-night numbers</h3>'+HBar("Significant strikes landed",g.sig[0],Math.max(g.sig[1],1),g.sig[0]+" of "+g.sig[1]+" ("+Math.round(sa*100)+"%)",null)+HBar("Head",g.head[0],Math.max(g.sig[0],1),g.head[0]+" of "+g.head[1])+HBar("Body",g.body[0],Math.max(g.sig[0],1),g.body[0]+" of "+g.body[1])+HBar("Legs",g.legs[0],Math.max(g.sig[0],1),g.legs[0]+" of "+g.legs[1])+'<div class="tape2"><div><b>'+g.kd+'</b><small>Knockdowns</small></div><div><b>'+g.ctrl+'</b><small>Control time</small></div><div><b>'+g.tot[0]+'/'+g.tot[1]+'</b><small>Total strikes</small></div></div><small class="foot-n">Accuracy is landed ÷ attempted. Source: ESPN fight stats.</small></div>'}
  var names=f.name.split(" ");
  return '<a class="back" href="#intel">← VAULT Intel</a>'+Head("FIGHTER PROFILE",f.name,(f.nick?"“"+f.nick+"” · ":"")+f.cls,Bdg("snap")+Bdg("plus"))+
  '<div class="two vx-in"><div class="panel c">'+ring+'<div class="tape">'+tape.map(function(t){return'<div><small>'+esc(t[0])+'</small><b>'+esc(String(t[1]))+'</b></div>'}).join("")+'</div></div>'+(adv?Gate(adv,"Performance breakdown","Striking, defense and grappling charts against a reference average."):"")+'</div>'+
  '<p class="foot-n">Sources: '+f.src.map(function(s){return Src(s.n,s.u)}).join(" · ")+'. Nothing here is estimated. A blank means the number was not available.</p>'+
  '<a class="vx-link" href="#matchup-f-'+f.id+'">Compare in Matchup Lab →</a>'+Rel(relStories([names[names.length-1],f.name]))+Talk({id:"f-"+f.id,n:f.name})}
function vTeam(k,ab){
  var t=team(k,ab);if(!t)return vIntel();var L=lg(k),p=wp(t),avg=avgWp(k),n=L.length;
  var rankAll=L.slice().sort(function(a,b){return wp(b)-wp(a)}).map(function(x){return x.ab}).indexOf(ab)+1;
  var conf=k==="nfl"?t.conf:t.conf+"ern Conference";
  var body='<div class="panel">'+HBar("Win percentage",p,1,pct(p),avg,"Marker = league average "+pct(avg))+HBar("Wins",t.w,Math.max.apply(null,L.map(function(x){return x.w})),String(t.w),null)+HBar("Losses",t.l,Math.max.apply(null,L.map(function(x){return x.l})),String(t.l),null)+'</div><div class="panel"><h3 class="hd2">Every team: wins vs losses</h3>'+Scatter(k,[ab])+'<small class="foot-n">Above the .500 line means a winning record. Your team is the large dot.</small></div>';
  return '<a class="back" href="#intel">← VAULT Intel</a>'+Head((k==="nfl"?"NFL":"NBA")+" TEAM PROFILE",t.name,t.conf+" · "+t.div,Bdg("snap")+Bdg("plus"))+tickerFor(ab)+
  '<div class="two vx-in"><div class="panel c">'+Ring(p,t.w+"-"+t.l,"record")+'<div class="tape"><div><small>Win %</small><b>'+pct(p)+'</b></div><div><small>League rank by win %</small><b>'+rankAll+' of '+n+'</b></div><div><small>Conference seed</small><b>'+t.cr+'</b></div><div><small>Division place</small><b>'+t.dr+'</b></div><div><small>Games behind division lead</small><b>'+fmtGb(gb(k,t))+'</b></div></div></div><div>'+Gate(body,"Team charts","Win percentage against the league and a full-league scatter.")+'</div></div>'+
  '<div class="notice vx-in">Game-by-game trends are not in VAULT\'s data yet, so none are shown. VAULT does not guess at streaks. Standings are a snapshot as of '+esc(P.asOf)+'.</div>'+
  '<a class="vx-link" href="#matchup-'+k+'-'+ab+'">Compare in Matchup Lab →</a>'+Rel(relStories([t.name,t.name.split(" ").slice(-1)[0]]))}
function vCbb(name){
  var t=P.cbb.filter(function(x){return x.t.replace(/ /g,"_")===decodeURIComponent(name)})[0];if(!t)return vIntel();
  var rec=t.rec.split("-"),w=+rec[0],l=+rec[1];
  return '<a class="back" href="#intel">← VAULT Intel</a>'+Head("COLLEGE BASKETBALL",t.t,"AP Top 25 · week 4 · No. "+t.r,Bdg("snap")+Bdg("plus"))+
  '<div class="two vx-in"><div class="panel c">'+Ring(w/(w+l),t.rec,"record")+'<div class="tape"><div><small>AP rank</small><b>No. '+t.r+'</b></div><div><small>Win %</small><b>'+pct(w/(w+l))+'</b></div><div><small>Games played</small><b>'+(w+l)+'</b></div></div></div><div class="panel"><h3 class="hd2">AP Top 14</h3>'+P.cbb.map(function(x){return '<div class="rk'+(x.t===t.t?" me":"")+'"><b>'+x.r+'</b><span>'+esc(x.t)+'</span><em>'+esc(x.rec)+'</em></div>'}).join("")+'</div></div><p class="foot-n">Sources: '+P.cbbSrc.map(function(s){return Src(s.n,s.u)}).join(" · ")+'.</p><a class="vx-link" href="#matchup-cbb-'+encodeURIComponent(t.t.replace(/ /g,"_"))+'">Compare in Matchup Lab →</a>'+Rel(relStories([t.t]))}
/* ---------- Matchup Lab ---------- */
var M={mode:"nfl",a:"SF",b:"BUF"};
var DEF={f:["prates","morales"],nfl:["SF","BUF"],nba:["SAS","LAL"],cbb:["Houston","Virginia"]};
function opts(mode){
  if(mode==="f")return P.fighters.map(function(f){return[f.id,f.name]});
  if(mode==="cbb")return P.cbb.map(function(t){return[t.t,"No. "+t.r+" "+t.t]});
  return lg(mode).slice().sort(function(a,b){return a.name.localeCompare(b.name)}).map(function(t){return[t.ab,t.name]})}
function sel(id,mode,v){return '<select class="sel" data-vx-sel="'+id+'" aria-label="Choose '+id+'">'+opts(mode).map(function(o){return '<option value="'+esc(o[0])+'"'+(o[0]===v?" selected":"")+'>'+esc(o[1])+'</option>'}).join("")+'</select>'}
function vMatchup(h){
  var m=h.match(/^matchup-(f|nfl|nba|cbb)-(.+)$/);
  if(m){var mode=m[1],v=decodeURIComponent(m[2]).replace(/_/g," ");if(mode!==M.mode||(M.a!==v&&M.b!==v)){M.mode=mode;var d=DEF[mode];M.a=v;M.b=d[0]===v?d[1]:d[0];if(mode==="cbb"&&!P.cbb.some(function(t){return t.t===v}))M.a=d[0]}}
  var mode=M.mode,rows="",an="",bn="",extra="",note="";
  var tabs=[["f","Fighters"],["nfl","NFL"],["nba","NBA"],["cbb","College hoops"]].map(function(t){return '<button type="button" class="'+(mode===t[0]?"on":"")+'" data-vx="mmode:'+t[0]+'">'+t[1]+'</button>'}).join("");
  if(mode==="f"){
    var fa=P.fighters.filter(function(x){return x.id===M.a})[0],fb=P.fighters.filter(function(x){return x.id===M.b})[0];if(!fa||!fb){M.a=DEF.f[0];M.b=DEF.f[1];return vMatchup("matchup")}
    an=fa.name;bn=fb.name;
    var wa=fa.w/(fa.w+fa.l),wb=fb.w/(fb.w+fb.l),R=[{l:"Win %",a:wa,b:wb,fa:pct(wa),fb:pct(wb),hi:1},{l:"Wins",a:fa.w,b:fb.w,fa:fa.w,fb:fb.w,hi:1},{l:"Losses",a:fa.l,b:fb.l,fa:fa.l,fb:fb.l,hi:0}];
    ["slpm|Strikes landed / min|1","acc|Strike accuracy %|1","sapm|Strikes absorbed / min|0","def_|Strike defense %|1","td|Takedowns / 15 min|1","tdd|Takedown defense %|1"].forEach(function(s){var q=s.split("|"),k=q[0];if(fa[k]!=null&&fb[k]!=null)R.push({l:q[1],a:fa[k],b:fb[k],fa:fa[k],fb:fb[k],hi:+q[2]})});
    if(fa.fight&&fb.fight){var A1=fa.fight,B1=fb.fight;R.push({l:"Sig. strikes landed (UFC Qatar)",a:A1.sig[0],b:B1.sig[0],fa:A1.sig[0],fb:B1.sig[0],hi:1},{l:"Sig. strike accuracy (UFC Qatar)",a:A1.sig[0]/A1.sig[1],b:B1.sig[0]/B1.sig[1],fa:pct(A1.sig[0]/A1.sig[1]),fb:pct(B1.sig[0]/B1.sig[1]),hi:1})}
    if(R.length<=3||!(fa.slpm!=null&&fb.slpm!=null||fa.fight&&fb.fight))note="Striking and grappling averages are only available for some fighters. Pairs with no shared stat show records only. Try Prates vs Morales, or Stirling vs Prochazka.";
    rows=R;
  }else if(mode==="cbb"){
    var ca=P.cbb.filter(function(x){return x.t===M.a})[0],cb=P.cbb.filter(function(x){return x.t===M.b})[0];if(!ca||!cb){M.a=DEF.cbb[0];M.b=DEF.cbb[1];return vMatchup("matchup")}
    an=ca.t;bn=cb.t;function pr(c){var r=c.rec.split("-");return{w:+r[0],l:+r[1]}}var pa=pr(ca),pb=pr(cb);
    rows=[{l:"Win %",a:pa.w/(pa.w+pa.l),b:pb.w/(pb.w+pb.l),fa:pct(pa.w/(pa.w+pa.l)),fb:pct(pb.w/(pb.w+pb.l)),hi:1},{l:"Wins",a:pa.w,b:pb.w,fa:pa.w,fb:pb.w,hi:1},{l:"Losses",a:pa.l,b:pb.l,fa:pa.l,fb:pb.l,hi:0},{l:"AP rank (lower is better)",a:ca.r,b:cb.r,fa:"No. "+ca.r,fb:"No. "+cb.r,hi:0}];
  }else{
    var ta=team(mode,M.a),tb=team(mode,M.b);if(!ta||!tb||ta===tb){M.a=DEF[mode][0];M.b=DEF[mode][1];ta=team(mode,M.a);tb=team(mode,M.b)}
    an=ta.name;bn=tb.name;
    rows=[{l:"Win %",a:wp(ta),b:wp(tb),fa:pct(wp(ta)),fb:pct(wp(tb)),hi:1},{l:"Wins",a:ta.w,b:tb.w,fa:ta.w,fb:tb.w,hi:1},{l:"Losses",a:ta.l,b:tb.l,fa:ta.l,fb:tb.l,hi:0},{l:"Conference seed (1 is best)",a:ta.cr,b:tb.cr,fa:ta.cr,fb:tb.cr,hi:0},{l:"Games behind division lead",a:gb(mode,ta),b:gb(mode,tb),fa:fmtGb(gb(mode,ta)),fb:fmtGb(gb(mode,tb)),hi:0}];
    extra='<div class="panel"><h3 class="hd2">Where both sit in the league</h3>'+Scatter(mode,[M.a,M.b])+'</div>';
  }
  var head='<div class="headline vx-in"><div><small>A</small><b>'+esc(an)+'</b></div><span>VS</span><div><small>B</small><b>'+esc(bn)+'</b></div></div>';
  var plainT='<div class="tblw"><table class="cmp"><thead><tr><th>'+esc(an)+'</th><th></th><th>'+esc(bn)+'</th></tr></thead><tbody>'+rows.slice(0,3).map(function(r){return '<tr><td>'+esc(r.fa)+'</td><th scope="row">'+esc(r.l)+'</th><td>'+esc(r.fb)+'</td></tr>'}).join("")+'</tbody></table></div>';
  var full=rows.length>3?'<div class="panel">'+Duel(rows,an,bn)+'</div>'+extra:"";
  var edge=rows[0]&&rows[0].a!==rows[0].b?'<div class="notice vx-in"><b>Record edge:</b> '+esc(rows[0].a>rows[0].b?an:bn)+' has the higher win percentage. This compares records only. It does not predict the result.</div>':"";
  var canSwap=mode==="f"?P.fighters.length:opts(mode).length;
  return Head("MATCHUP LAB","Matchup Lab","Put two athletes, fighters or teams side by side. Every number comes from a named source and the snapshot date is shown.",Bdg("snap")+Bdg("plus"))+
  '<div class="mtabs vx-in" role="tablist">'+tabs+'</div><div class="pick vx-in">'+sel("a",mode,M.a)+'<button type="button" class="swap" data-vx="mswap" aria-label="Swap sides">⇄</button>'+sel("b",mode,M.b)+'</div>'+head+plainT+edge+
  (isPlus()?full:(rows.length>3?'<div class="gate"><div class="gate-b" aria-hidden="true"><div class="panel">'+Duel(rows,an,bn)+'</div></div>'+Lock("Visual comparison","Bar-by-bar duel, strike and defense charts, and the league scatter.")+'</div>':""))+(note?'<div class="notice vx-in">'+esc(note)+'</div>':"")+
  '<p class="foot-n">Team data: standings snapshot, '+esc(P.asOfLong)+'. Fighter data: '+P.fighters.slice(0,2)[0].src.map(function(s){return esc(s.n)}).join(", ")+', ESPN. College hoops: AP poll via Bleacher Report and NBC Sports.</p>'}
/* ---------- My VAULT ---------- */
var SP=[["mma","MMA"],["nfl","NFL"],["cfb","College Football"],["cbb","College Basketball"],["nba","NBA"]];
function favs(){var f=jg("vault.fav",null);if(!f||typeof f!=="object")f={};return{sports:f.sports||[],teams:f.teams||[],athletes:f.athletes||[]}}
function favCount(f){return f.sports.length+f.teams.length+f.athletes.length}
function teamLabel(k){var p=k.split(":");if(p[0]==="cbb")return p[1];var t=team(p[0],p[1]);return t?t.name:k}
function teamKeys(k){var p=k.split(":"),n=teamLabel(k);return p[0]==="cbb"?[n]:[n,n.split(" ").slice(-1)[0]]}
function vMy(){
  var f=favs(),lim=isPlus()?999:3,full=favCount(f)>=lim,hits=[];
  stories().forEach(function(s){var t=(s.title+" "+s.dek+" "+(s.tags||[]).join(" ")+" "+s.body.join(" ")).toLowerCase(),why=[];
    if(f.sports.indexOf(s.sport)>-1)why.push(A().SPORTS[s.sport]);
    f.teams.forEach(function(k){if(teamKeys(k).some(function(x){return x&&t.indexOf(x.toLowerCase())>-1}))why.push(teamLabel(k))});
    f.athletes.forEach(function(a){var ln=a.split(" ").slice(-1)[0];if(t.indexOf(a.toLowerCase())>-1||(ln.length>3&&t.indexOf(ln.toLowerCase())>-1))why.push(a)});
    if(why.length)hits.push({s:s,why:why})});
  var chips=SP.map(function(x){var on=f.sports.indexOf(x[0])>-1;return '<button type="button" class="fav'+(on?" on":"")+'" data-vx="fsport:'+x[0]+'" aria-pressed="'+on+'"'+(!on&&full?" disabled":"")+'>'+(on?"✓ ":"+ ")+x[1]+'</button>'}).join("");
  var tops=[].concat(lg("nfl").map(function(t){return["nfl:"+t.ab,t.name]}),lg("nba").map(function(t){return["nba:"+t.ab,t.name+" (NBA)"]}),P.cbb.map(function(t){return["cbb:"+t.t,t.t+" (college hoops)"]}));
  var tsel='<select class="sel" id="favTeam" aria-label="Pick a team"><option value="">Add a team…</option>'+tops.map(function(o){return '<option value="'+esc(o[0])+'">'+esc(o[1])+'</option>'}).join("")+'</select><button type="button" class="btn-g" data-vx="fteam"'+(full?" disabled":"")+'>Add team</button>';
  var mine=f.teams.concat(f.athletes.map(function(a){return"a:"+a})).map(function(k){var a=k.indexOf("a:")===0;return '<span class="tagx">'+esc(a?k.slice(2):teamLabel(k))+'<button type="button" data-vx="frm:'+esc(k)+'" aria-label="Remove">×</button></span>'}).join("");
  var cards=f.teams.map(function(k){var p=k.split(":");if(p[0]==="cbb"){var c=P.cbb.filter(function(x){return x.t===p[1]})[0];return c?'<a class="mini" href="#intel-cbb-'+encodeURIComponent(c.t.replace(/ /g,"_"))+'"><small>AP No. '+c.r+'</small><b>'+esc(c.t)+'</b><span>'+esc(c.rec)+'</span></a>':""}var t=team(p[0],p[1]);return t?'<a class="mini" href="#intel-'+p[0]+'-'+t.ab+'"><small>'+esc(t.div)+' · seed '+t.cr+'</small><b>'+esc(t.name)+'</b><span>'+t.w+'-'+t.l+'</span></a>':""}).join("");
  var feed=hits.length?'<div class="cards">'+hits.map(function(h,i){return '<div class="whyw"><div class="why">Because you follow: '+h.why.slice(0,3).map(esc).join(", ")+'</div>'+A().Card(h.s,i)+'</div>'}).join("")+'</div>':A().Empty("Nothing yet","Pick a sport, team or athlete above and your feed fills in.");
  return Head("MY VAULT","My VAULT","A feed built around what you follow. Stories come from the live VAULT feed.",Bdg("live")+(isPlus()?Bdg("plus"):'<span class="bd bd-free">FREE · '+favCount(f)+' of 3</span>'))+
  '<section class="panel vx-in"><h3 class="hd2">Sports</h3><div class="favs">'+chips+'</div><h3 class="hd2">Teams</h3><div class="addr">'+tsel+'</div><h3 class="hd2">Athletes</h3><form class="addr" data-vx-form="fath"><input id="favAth" class="inp" maxlength="40" placeholder="e.g. Aaron Rodgers or Navajo Stirling" aria-label="Athlete name"><button class="btn-g" type="submit"'+(full?" disabled":"")+'>Add athlete</button></form>'+(mine?'<div class="tags2">'+mine+'</div>':"")+
   (full&&!isPlus()?Lock("Favorites limit reached","Free includes 3 favorites. Plus has no limit."):"")+'</section>'+
  (cards?'<h2 class="vx-h2">Your teams '+Bdg("snap")+'</h2><div class="minis vx-in">'+cards+'</div>':"")+
  '<h2 class="vx-h2">Your feed ('+hits.length+')</h2>'+feed+'<p class="foot-n">Matches are found by name in story text, so a team name can match more than one sport. Your picks are saved on this device only.</p>'}
/* ---------- Priority Alerts ---------- */
var CATS=[["trades","Trades","trade|traded|trading|trade deadline"],["injuries","Injuries","injur|ruled out|surgery|\\bacl\\b|torn|out for the season|day-to-day"],["signings","Signings","sign(s|ed|ing)?\\b|contract|extension|free agen|re-sign|waive|claim"],["fights","Fight announcements","fight|bout|booked|main event|title shot|card\\b"],["control","Major controversies","controvers|fired|waive|accus|bench|feud|brawl|suspen|backlash|outrage|lawsuit|arrest"]];
function alerts(){var a=jg("vault.alerts",null);if(!a)a={cats:{control:true},kw:[]};a.cats=a.cats||{};a.kw=a.kw||[];return a}
function alertHits(s,a){var t=(s.title+" "+s.dek+" "+(s.tags||[]).join(" ")).toLowerCase(),out=[],plus=isPlus();
  CATS.forEach(function(c){if(a.cats[c[0]]&&new RegExp(c[2],"i").test(t)&&(c[0]!=="fights"||s.sport==="mma"||/fight|bout/.test(t)))out.push(c[1])});
  if(plus)a.kw.forEach(function(k){if(k&&t.indexOf(k.toLowerCase())>-1)out.push("“"+k+"”")});return out}
function vAlerts(){
  var a=alerts(),plus=isPlus(),on=Object.keys(a.cats).filter(function(k){return a.cats[k]}).length,full=!plus&&on>=1;
  var cats=CATS.map(function(c){var o=!!a.cats[c[0]],dis=!o&&full;return '<button type="button" class="al'+(o?" on":"")+(dis?" lock":"")+'" data-vx="atog:'+c[0]+'" aria-pressed="'+o+'"'+(dis?" disabled":"")+'><span class="al-s"></span><b>'+c[1]+'</b>'+(dis?'<em>Plus</em>':"")+'</button>'}).join("");
  var hits=stories().map(function(s){return{s:s,h:alertHits(s,a)}}).filter(function(x){return x.h.length}).slice(0,8);
  var kw='<form class="addr" data-vx-form="akw"><input class="inp" id="alKw" maxlength="30" placeholder="Keyword, e.g. Lakers or Rodgers" aria-label="Keyword"><button class="btn-g" type="submit">Add keyword</button></form>'+(a.kw.length?'<div class="tags2">'+a.kw.map(function(k){return'<span class="tagx">'+esc(k)+'<button type="button" data-vx="akwrm:'+esc(k)+'" aria-label="Remove">×</button></span>'}).join("")+'</div>':"");
  return Head("PRIORITY ALERTS","Priority Alerts","Choose what counts as breaking for you. VAULT alerts you when a new matching story arrives.",Bdg("live")+(plus?Bdg("plus"):'<span class="bd bd-free">FREE · 1 category</span>'))+
  '<div class="notice vx-in"><b>How alerts work.</b> Alerts appear as a banner while VAULT is open in your browser. VAULT cannot send phone or email alerts yet. Matching is by keyword, so a match is not a confirmed report. Rumors keep their Unconfirmed label.</div>'+
  '<section class="panel vx-in"><h3 class="hd2">Alert me about</h3><div class="alg">'+cats+'</div>'+(full?Lock("More categories","Free includes 1 category. Plus turns on all five and adds keywords."):"")+'<h3 class="hd2">Custom keywords '+(plus?"":Bdg("plus"))+'</h3>'+Gate(kw,"Keyword alerts","Follow a player, team or topic by name.")+'</section>'+
  '<h2 class="vx-h2">What would alert you now '+Bdg("live")+'</h2>'+(hits.length?'<ul class="ahits vx-in">'+hits.map(function(x){return '<li><a href="#story-'+esc(x.s.id)+'"><span class="ah-t">'+x.h.map(function(y){return '<em>'+esc(y)+'</em>'}).join("")+'</span><b>'+esc(x.s.title)+'</b>'+(x.s.unconfirmed?'<i class="unc">UNCONFIRMED</i>':"")+'</a></li>'}).join("")+'</ul>':A().Empty("Nothing matches right now","Turn on a category, or add a keyword."))+
  '<h2 class="vx-h2">What an alert looks like '+Bdg("demo","SAMPLE")+'</h2><div class="al-demo vx-in"><b>NEW</b> Example: a story matching your “Trades” alert would appear here. <small>This is a sample, not news.</small></div>'}
/* ---------- Exclusive ---------- */
function Table(k){var L=lg(k).slice().sort(function(a,b){return wp(b)-wp(a)||a.name.localeCompare(b.name)}),lim=isPlus()?L.length:5;
  return '<div class="tblw"><table class="cmp rank"><thead><tr><th>#</th><th>Team</th><th>Record</th><th>Win %</th></tr></thead><tbody>'+L.slice(0,lim).map(function(t,i){return '<tr><td>'+(i+1)+'</td><td><a href="#intel-'+k+'-'+t.ab+'">'+esc(t.name)+'</a></td><td>'+t.w+'-'+t.l+'</td><td><div class="mb"><span style="width:'+wp(t)*100+'%"></span></div>'+pct(wp(t))+'</td></tr>'}).join("")+'</tbody></table></div>'+(isPlus()?"":Lock("Full rankings","Plus shows all "+L.length+" teams."))}
function vExIndex(){
  var top=stories().map(function(s){return{s:s,r:rate(s)}}).sort(function(a,b){return b.r.all-a.r.all}).slice(0,5);
  return Head("VAULT EXCLUSIVE","VAULT Exclusive","Weekly reports, rankings, explainers and original editorial from the VAULT desk. Opinion is always labeled.",Bdg("orig")+Bdg("plus"))+
  '<div class="exs vx-in">'+P.exclusive.map(function(e,i){var free=e.id==="cbb-explain";return '<a class="exc" href="#exclusive-'+e.id+'" style="animation-delay:'+i*70+'ms"><div class="exc-t"><span>'+esc(e.type)+'</span>'+(free?'<span class="bd bd-free">FREE READ</span>':Bdg("plus"))+'</div><h3>'+esc(e.title)+'</h3><p>'+esc(e.preview)+'</p><small>'+esc(e.read)+' read</small></a>'}).join("")+'</div>'+
  '<h2 class="vx-h2">VAULT Rating leaders '+Bdg("live")+Bdg("edit")+'</h2><ol class="lead vx-in">'+top.map(function(x,i){return '<li><a href="#story-'+esc(x.s.id)+'"><b class="ld-n">'+x.r.all+'</b><span>'+esc(x.s.title)+'</span></a></li>'}).join("")+'</ol><p class="foot-n">Rating = 40% impact + 35% credibility + 25% controversy heat, computed from each story\'s own sources and labels. It is an editorial score, not a statistic.</p>'}
function vEx(id){
  var e=P.exclusive.filter(function(x){return x.id===id})[0];if(!e)return vExIndex();
  var free=e.id==="cbb-explain"||isPlus(),paras=e.body.map(function(b){var op=/^VAULT take \(opinion\)/.test(b);return '<p class="'+(op?"opn":"")+'">'+(op?'<span class="bd bd-op">OPINION</span> ':"")+esc(op?b.replace("VAULT take (opinion): ",""):b)+'</p>'}),first=paras.slice(0,1).join(""),rest=paras.slice(1).join("");
  var tbl=e.table?'<h2 class="vx-h2">The table '+Bdg("snap")+'</h2>'+Table(e.table):"";
  return '<a class="back" href="#exclusive">← VAULT Exclusive</a>'+Head(e.type,e.title,e.read+" read · by the VAULT desk",Bdg("orig")+(e.table?Bdg("snap"):"")+(free?"":Bdg("plus")))+
  '<article class="prose vx-in">'+first+(free?rest:'<div class="gate"><div class="gate-b" aria-hidden="true">'+rest+'</div>'+Lock("Keep reading","The rest of this "+e.type.toLowerCase()+" is for Plus members.")+'</div>')+'</article>'+tbl+
  '<h2 class="vx-h2">Basis</h2><div class="srcs vx-in">'+e.basis.map(function(b){return b.u&&b.u.charAt(0)==="#"?'<a class="srcl" href="'+esc(b.u)+'">'+esc(b.n)+' →</a>':Src(b.n,b.u)}).join("")+'</div>'}
/* ---------- Player Stats + Player Talk ---------- */
var PL=null,plLoading=false,plSort="pts",plTeam="",plQ="";
function loadPL(){if(PL||plLoading)return;plLoading=true;fetch("players.json",{cache:"no-cache"}).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(j){PL=j;plLoading=false;if(A().rerender)A().rerender()}).catch(function(){plLoading=false;PL={asOf:"",games:[],players:[],err:1};if(A().rerender)A().rerender()})}
function pct1(m,a){return a?Math.round(m/a*1000)/10:null}
function fp(m,a){var p=pct1(m,a);return p==null?"—":p.toFixed(1)+"%"}
function plG(p){return PL.games[p.g]}
function talkAll(){return jg("vault.talk",{})}
var plSport="nba";
var SPN=[["nba","NBA"],["nfl","NFL"],["cfb","College Football"],["cbb","College Basketball"],["mma","MMA"]];
var SPNOTE={nba:"Single-game stat lines from four NBA box scores on Nov 23.",cbb:"Single-game stat lines from the Ole Miss vs Arizona championship game on Nov 25.",nfl:"VAULT's data feed has team stats and named scoring plays for NFL games, not full player stat lines. This page shows who scored, from two games (Nov 22 and 23).",cfb:"VAULT's data feed has team stats and named scoring plays for college football, not full player stat lines. This page shows who scored in Utah vs TCU (Nov 21).",mma:"Fighter records and career striking numbers from named sources, plus fight-night numbers where VAULT has them."};
function spTabs(){return '<div class="mtabs vx-in" role="tablist" aria-label="Choose a sport">'+SPN.map(function(x){return '<button type="button" role="tab" aria-selected="'+(plSport===x[0])+'" class="'+(plSport===x[0]?"on":"")+'" data-vx="psport:'+x[0]+'">'+x[1]+'</button>'}).join("")+'</div>'}
function vPlayers(){
  if(!PL||(plSport==="mma"&&!P)){loadPL();if(plSport==="mma")load();return '<div class="vx-load"><i></i><i></i><i></i></div>'}
  var head=Head("PLAYER STATS","Player Stats","Pick a sport. Every number comes from a named source, and snapshot dates are shown.",Bdg("snap","SNAPSHOT · "+PL.asOf));
  var note='<div class="notice vx-in"><b>What this is.</b> '+esc(SPNOTE[plSport])+' These are <b>not season averages</b>. Season stats are not in VAULT\'s data yet, so none are shown.</div>';
  var mine=talkAll(),ids=Object.keys(mine).filter(function(k){return mine[k]&&mine[k].length}),my=ids.length?'<h2 class="vx-h2">Your takes (on this device)</h2><ul class="mytakes vx-in">'+ids.map(function(k){var p=PL.players.filter(function(x){return x.id===k})[0],f=k.indexOf("f-")===0&&P?P.fighters.filter(function(x){return"f-"+x.id===k})[0]:null;return p?'<li><a href="#players-'+k+'"><b>'+esc(p.n)+'</b> · '+mine[k].length+' take'+(mine[k].length>1?"s":"")+'</a></li>':f?'<li><a href="#intel-f-'+f.id+'"><b>'+esc(f.name)+'</b> · '+mine[k].length+' take'+(mine[k].length>1?"s":"")+'</a></li>':""}).join("")+'</ul>':"";
  if(plSport==="mma"){
    return head+spTabs()+note+'<div class="ics vx-in">'+P.fighters.map(function(f){var line=f.slpm!=null?f.slpm.toFixed(2)+" strikes landed per min":f.fight?f.fight.sig[0]+" of "+f.fight.sig[1]+" sig. strikes at UFC Qatar":"";return '<a class="ic" href="#intel-f-'+f.id+'"><span class="ic-k">'+esc(f.cls)+'</span><b>'+esc(f.name)+'</b><span class="ic-r">'+esc(f.rec)+(line?" · "+esc(line):"")+'</span></a>'}).join("")+'</div>'+my+'<p class="foot-n">Open a fighter to see charts and join Player Talk.</p>'}
  var L=PL.players.filter(function(p){return p.sport===plSport}),teams=[];L.forEach(function(p){if(teams.indexOf(p.tm)<0)teams.push(p.tm)});teams.sort();
  if(plTeam&&teams.indexOf(plTeam)<0)plTeam="";
  if(plTeam)L=L.filter(function(p){return p.tm===plTeam});
  if(plQ)L=L.filter(function(p){return p.n.toLowerCase().indexOf(plQ.toLowerCase())>-1});
  var tsel='<select class="sel" data-vx-sel="pteam" aria-label="Filter by team"><option value="">All teams</option>'+teams.map(function(t){return '<option'+(t===plTeam?" selected":"")+'>'+t+'</option>'}).join("")+'</select>';
  var ctl='<div class="pl-ctl vx-in"><input class="inp" id="plQ" value="'+esc(plQ)+'" placeholder="Search a player" aria-label="Search players">';
  var tbl;
  if(plSport==="nba"||plSport==="cbb"){
    L.sort(function(a,b){return(b[plSort]||0)-(a[plSort]||0)});
    var sorts=[["pts","Points"],["reb","Rebounds"],["ast","Assists"],["gs","Game Score"]].map(function(x){return '<button type="button" class="'+(plSort===x[0]?"on":"")+'" data-vx="psort:'+x[0]+'">'+x[1]+'</button>'}).join("");
    ctl+='<div class="mtabs">'+sorts+'</div>'+tsel+'</div>';
    tbl='<div class="tblw"><table class="cmp pl-t"><thead><tr><th>#</th><th>Player</th><th>PTS</th><th>REB</th><th>AST</th><th>FG</th><th>Game Score</th></tr></thead><tbody>'+L.map(function(p,i){return '<tr><td>'+(i+1)+'</td><td><a href="#players-'+p.id+'"><b>'+esc(p.n)+'</b></a><small>'+esc(p.tm)+' · '+esc(p.pos)+'</small></td><td>'+p.pts+'</td><td>'+p.reb+'</td><td>'+p.ast+'</td><td>'+p.fg[0]+'/'+p.fg[1]+'</td><td>'+p.gs.toFixed(1)+'</td></tr>'}).join("")+'</tbody></table></div><p class="foot-n">Game Score is a standard box-score rating (higher is better) that comes with the data. '+L.length+' players shown.</p>'}
  else{
    ctl+=tsel+'</div>';
    tbl='<div class="tblw"><table class="cmp pl-t"><thead><tr><th>Player</th><th>Role</th><th>Scoring</th><th>Game</th></tr></thead><tbody>'+L.map(function(p){var g=PL.games[p.g];return '<tr><td><a href="#players-'+p.id+'"><b>'+esc(p.n)+'</b></a><small>'+esc(p.tm)+'</small></td><td>'+esc(p.pos)+'</td><td>'+p.lines.map(function(l){return esc(l[0])+": <b>"+esc(l[1])+"</b>"}).join("<br>")+'</td><td><small>'+esc(g.res)+'<br>'+esc(g.d)+'</small></td></tr>'}).join("")+'</tbody></table></div><p class="foot-n">Scoring plays only. '+L.length+' players shown.</p>'}
  return head+spTabs()+note+ctl+tbl+my}
function vScorer(p){
  var g=PL.games[p.g],ctx=(g.ctx||[]).map(function(c){return '<li>'+esc(c)+'</li>'}).join("");
  return '<a class="back" href="#players">← Player Stats</a>'+Head(p.pos+" · "+p.tm,p.n,"vs "+p.opp+" · "+g.d+" · "+g.res,Bdg("snap","SNAPSHOT · "+g.d))+
  '<div class="tape2 vx-in">'+p.lines.map(function(l){return '<div><b>'+esc(l[1])+'</b><small>'+esc(l[0])+'</small></div>'}).join("")+'</div>'+
  '<h2 class="vx-h2">Scoring plays</h2><ul class="unk vx-in">'+p.plays.map(function(x){return '<li>'+esc(x)+'</li>'}).join("")+'</ul>'+
  (ctx?'<h2 class="vx-h2">Team context for this game</h2><ul class="unk vx-in">'+ctx+'</ul><p class="foot-n">These are team totals, not individual lines.</p>':"")+
  Talk(p)+'<p class="foot-n">Source: '+esc(PL.src)+'. Names are shown as initial and surname, the way the play-by-play lists them.</p>'}
function vPlayer(id){
  if(!PL){loadPL();return '<div class="vx-load"><i></i><i></i><i></i></div>'}
  var p=PL.players.filter(function(x){return x.id===id})[0];if(!p)return vPlayers();
  plSport=p.sport;
  if(p.kind==="scoring")return vScorer(p);
  var g=PL.games[p.g],two=p.fg[0]-p.tp[0],pts3=p.tp[0]*3,pts2=two*2,ftp=p.ft[0],tot=Math.max(1,pts3+pts2+ftp);
  var head=Head(p.pos+" · "+p.tm,p.n,"vs "+p.opp+" · "+g.d+" · "+g.res,Bdg("snap","SNAPSHOT · "+g.d));
  var line='<div class="tape2 vx-in"><div><b>'+p.pts+'</b><small>PTS</small></div><div><b>'+p.reb+'</b><small>REB</small></div><div><b>'+p.ast+'</b><small>AST</small></div><div><b>'+p.stl+'</b><small>STL</small></div><div><b>'+p.blk+'</b><small>BLK</small></div><div><b>'+p.to+'</b><small>TO</small></div></div>';
  var det='<div class="two vx-in"><div class="panel c">'+Ring(Math.max(0,Math.min(1,p.gs/35)),p.gs.toFixed(1),"game score")+'<small class="foot-n">Ring is out of 35. A 20 is a very strong game.</small></div><div class="panel"><h3 class="hd2">Shooting</h3>'+HBar("Field goals "+p.fg[0]+"/"+p.fg[1],pct1(p.fg[0],p.fg[1])||0,100,fp(p.fg[0],p.fg[1]),null)+HBar("Threes "+p.tp[0]+"/"+p.tp[1],pct1(p.tp[0],p.tp[1])||0,100,fp(p.tp[0],p.tp[1]),null)+HBar("Free throws "+p.ft[0]+"/"+p.ft[1],pct1(p.ft[0],p.ft[1])||0,100,fp(p.ft[0],p.ft[1]),null)+HBar("True shooting",Math.min(100,p.ts),100,p.ts.toFixed(1)+"%",null)+
   '<h3 class="hd2">Where the points came from</h3><div class="stack"><span class="s3" style="width:'+pts3/tot*100+'%"></span><span class="s2" style="width:'+pts2/tot*100+'%"></span><span class="sf" style="width:'+ftp/tot*100+'%"></span></div><div class="stk-l"><span><i class="s3"></i>Threes '+pts3+'</span><span><i class="s2"></i>Twos '+pts2+'</span><span><i class="sf"></i>Free throws '+ftp+'</span></div></div></div>';
  var same=PL.players.filter(function(x){return x.g===p.g&&x.id!==p.id}).sort(function(a,b){return b.gs-a.gs}).slice(0,4);
  var rel='<h2 class="vx-h2">Others from this game</h2><div class="chips2">'+same.map(function(x){return '<a href="#players-'+x.id+'">'+esc(x.n)+' <small>'+x.pts+' pts</small></a>'}).join("")+'</div>';
  return '<a class="back" href="#players">← Player Stats</a>'+head+line+det+rel+Talk(p)+
   '<p class="foot-n">Single game only. Source: '+esc(PL.src)+'. Game Score is supplied with the data.</p>'}
var MOOD=[["great","🔥 Great"],["solid","👍 Solid"],["rough","😬 Rough"]];
/* ---------- Shared online comments (db) ---------- */
var CDB=null,CUSR=null,MYID=null,IS_OWN=false,C_RO=false,CTH={},CNAMES={},CCUR=null;
function cpid(id){return String(id).replace(/[^A-Za-z0-9_\-.~:@+]/g,"_").slice(0,150)||"x"}
function cOnline(){return !!(CDB&&MYID)}
function cDev(){var d=sg("vault.cid");if(!d||!/^[a-z0-9]{8,40}$/.test(d)){d="";for(var i=0;i<20;i++)d+="abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random()*36)];ss("vault.cid",d)}return d}
function cNick(){return String(sg("vault.nick")||"").slice(0,24)}
(function initC(){try{if(!window.claude||typeof window.claude.use!=="function")return;window.claude.use("db").then(function(d){if(!d)return;CDB=d;MYID=cDev();redo();
  window.claude.use("user").then(function(u){if(!u)return;CUSR=u;Promise.all([u.isOwner(),u.can("data.write")]).then(function(q){IS_OWN=!!q[0];if(q[1]===false)C_RO=true;redo()}).catch(function(){})}).catch(function(){})}).catch(function(){})}catch(e){}})();
function cSub(pid){if(!cOnline())return;if(CCUR===pid&&CTH[pid])return;
  if(CCUR&&CTH[CCUR]&&CTH[CCUR].un){try{CTH[CCUR].un()}catch(e){}delete CTH[CCUR]}
  CCUR=pid;var th=CTH[pid]={ready:false,slow:false,err:false,list:[]};
  th.tm=setTimeout(function(){th.slow=true;cPaint(pid)},10000);
  try{th.un=CDB.collection("threads/"+cpid(pid)+"/takes").orderBy("ts","desc").limit(200).onSnapshot(function(snap){
    th.list=snap.docs.map(function(d){var x=d.data()||{};return {id:d.id,t:String(x.t||"").slice(0,280),ts:+x.ts||0,uid:String(x.uid||""),n:String(x.n||"").slice(0,24)}}).filter(function(x){return x.t});
    if(!snap.metadata.fromCache){th.ready=true;th.slow=false;clearTimeout(th.tm)}else if(th.list.length)th.ready=true;
    cPaint(pid);
  },function(e){th.err=true;th.ready=true;clearTimeout(th.tm);cPaint(pid)})}catch(e){th.err=true;th.ready=true}}
function cListHTML(pid){var th=CTH[pid];
  if(!th||!th.ready)return '<p class="foot-n">'+(th&&th.slow?"Comments can't be reached right now. They'll appear when the connection comes back.":"Loading comments…")+'</p>';
  if(th.err)return '<p class="foot-n">Comments can\'t be loaded right now.</p>';
  var note=th.slow?'<p class="foot-n">These may be out of date.</p>':"";
  if(!th.list.length)return note+'<p class="foot-n">No takes yet. Be the first.</p>';
  return note+'<ul class="takes">'+th.list.map(function(t){var me=t.uid===MYID,nm=me?"You"+(t.n?" ("+t.n+")":""):(t.n||"VAULT fan");
    return '<li><div class="tk-h"><b>'+esc(nm)+'</b><small>'+(t.ts?new Date(t.ts).toLocaleDateString([], {month:"short",day:"numeric"}):"")+'</small></div><p>'+esc(t.t)+'</p><div class="tk-a"><button type="button" data-vx="ccopy:'+esc(pid)+'|'+esc(t.id)+'">Copy to share</button>'+((me||IS_OWN)?'<button type="button" data-vx="cdel:'+esc(pid)+'|'+esc(t.id)+'">'+(me?"Delete":"Remove")+'</button>':"")+'</div></li>'}).join("")+'</ul>'}
function cPaint(pid){var el=document.querySelector('[data-ctk="'+cpid(pid)+'"]');if(el)el.innerHTML=cListHTML(pid);var n=document.querySelector('[data-ctn="'+cpid(pid)+'"]');if(n){var th=CTH[pid];n.textContent=th&&th.ready&&!th.err?th.list.length+(th.list.length===1?" take":" takes"):""}}
function cBody(ct,fm){var nk=fm.querySelector("input.nk"),n="";if(nk){n=cleanTake(nk.value).slice(0,24);if(!n&&nk.value.trim())nk.value="";ss("vault.nick",n)}var o={t:ct,ts:Date.now(),uid:MYID};if(n)o.n=n;return o}
function cFind(pid,id){var th=CTH[pid];if(!th)return null;for(var i=0;i<th.list.length;i++)if(th.list[i].id===id)return th.list[i];return null}
function Talk(p,ttl){
  var online=cOnline();if(online)cSub(p.id);
  var all=talkAll(),th=all[p.id]||[],vote=sg("vault.pv."+p.id),plus=isPlus();
  var prompts=p.cat?["Was this the performance of the week?","What was the key moment?","Where does it rank in your top 10?"]:["Did "+p.n.split(" ").slice(-1)[0]+" get enough shots?","What was the key moment of the game?","Was the box score the whole story?"];
  var cnt={};MOOD.forEach(function(m){cnt[m[0]]=vote===m[0]?1:0});
  var nickIn=online?'<input class="inp nk" maxlength="24" placeholder="Your name (optional)" aria-label="Name to show with your take" value="'+esc(cNick())+'">':"";
  var form=(online&&C_RO)?'<p class="foot-n">You can read the conversation, but your access to VAULT doesn\'t include posting.</p>':'<form class="addr tk" data-vx-form="take:'+p.id+'">'+nickIn+'<input class="inp tx" maxlength="280" placeholder="Your take on this performance (no links or personal info)" aria-label="Your take">'+(online?'<label class="agec"><input type="checkbox" required> I\'m 13 or older and agree to the <a href="#terms">terms</a></label>':"")+'<button class="btn-g" type="submit">Post</button></form>';
  var list=online?'<div data-ctk="'+cpid(p.id)+'">'+cListHTML(p.id)+'</div>':
   (th.length?'<ul class="takes">'+th.map(function(t,i){return '<li><div class="tk-h"><b>You</b><small>'+new Date(t.ts).toLocaleDateString([], {month:"short",day:"numeric"})+'</small></div><p>'+esc(t.t)+'</p><div class="tk-a"><button type="button" data-vx="tcopy:'+p.id+':'+i+'">Copy to share</button><button type="button" data-vx="tdel:'+p.id+':'+i+'">Delete</button></div></li>'}).join("")+'</ul>':'<p class="foot-n">No takes yet. Be the first.</p>');
  var inner='<div class="mood" role="group" aria-label="Rate this performance">'+MOOD.map(function(m){return '<button type="button" class="'+(vote===m[0]?"on":"")+'" data-vx="mood:'+p.id+':'+m[0]+'" aria-pressed="'+(vote===m[0])+'">'+m[1]+'</button>'}).join("")+'</div><small class="foot-n">'+(vote?"Your vote is saved on this device.":"Pick one. Only your own vote is counted, on this device.")+'</small>'+
   form+'<p class="foot-n tk-err" data-cerr="'+cpid(p.id)+'" aria-live="polite"></p>'+
   '<div class="prm"><small>Conversation starters from VAULT:</small>'+prompts.map(function(x){return '<button type="button" class="prb" data-vx="prompt:'+p.id+':'+encodeURIComponent(x)+'">'+esc(x)+'</button>'}).join("")+'</div>'+list;
  var notice=online?'<div class="notice"><b>Who can see this?</b> Everyone you share VAULT with. Takes are saved online and show up live for other readers, with the name you type (or “VAULT fan”). Don\'t use your full name. You can delete takes you posted from this device'+(IS_OWN?", and as the owner you can remove anyone's":"")+'. Links, emails and phone numbers are blocked.</div>':
   '<div class="notice"><b>Who can see this?</b> Only you. The shared conversation is not available here, so takes are saved in this browser and not sent to anyone. Links, emails and phone numbers are blocked in takes.</div>';
  return '<h2 class="vx-h2">'+(ttl||"Player Talk")+' '+Bdg("plus")+(online?Bdg("live","LIVE")+' <small class="foot-n" data-ctn="'+cpid(p.id)+'"></small>':Bdg("demo","THIS DEVICE ONLY"))+'</h2><section class="panel talk vx-in">'+Gate(inner,"Join the conversation","Rate the performance and post your take with Plus.")+notice+'</section>'}
function cleanTake(v){v=String(v||"").replace(/\s+/g," ").trim().slice(0,280);if(!v)return"";if(/https?:|www\.|\.com|\.net|@\w|\d{3}[\s.-]?\d{3}[\s.-]?\d{4}/i.test(v))return"";if(/\b(fuck|shit|bitch|nigg|fag|retard|slut|cunt)/i.test(v))return"";return v}

/* ---------- Top Performances ---------- */
var PF=null,pfLoading=false,pfCat="nfl";
function loadPF(force){if((PF&&!force)||pfLoading)return;pfLoading=true;fetch("performances.json",{cache:"no-cache"}).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(j){j._t=Date.now();PF=j;pfLoading=false;if(A().rerender)A().rerender()}).catch(function(){pfLoading=false;if(PF){PF._t=Date.now();return}PF={cats:[],items:[],err:1};if(A().rerender)A().rerender()})}
function pfCount(id){return(talkAll()[id]||[]).length}
function vPerf(){
  if(PF&&!PF.err&&Date.now()-(PF._t||0)>120000)loadPF(true);
  if(!PF){loadPF();return '<div class="vx-load"><i></i><i></i><i></i></div>'}
  if(PF.err)return A().Empty("Could not load Top Performances","Please refresh the page.");
  var tabs='<div class="mtabs vx-in" role="tablist" aria-label="Choose a category">'+PF.cats.map(function(c){return '<button type="button" role="tab" aria-selected="'+(pfCat===c.k)+'" class="'+(pfCat===c.k?"on":"")+'" data-vx="pfcat:'+c.k+'">'+esc(c.label)+'</button>'}).join("")+'</div>';
  var c=PF.cats.filter(function(x){return x.k===pfCat})[0]||PF.cats[0],L=PF.items.filter(function(x){return x.cat===c.k}).sort(function(a,b){return a.rank-b.rank});
  var list='<ol class="pfl vx-in">'+L.map(function(p){var n=pfCount(p.id);return '<li><a class="pf" href="#performances-'+p.id+'"><span class="pf-n">'+p.rank+'</span><span class="pf-b"><b>'+esc(p.n)+'</b><small>'+esc(p.tm)+(c.k==="ufc"?" · beat ":" vs ")+esc(p.opp)+' · '+esc(p.d)+'</small><em>'+esc(p.head)+'</em><span class="pf-s">'+p.stats.slice(0,4).map(function(s){return '<i>'+esc(s[0])+' <b>'+esc(s[1])+'</b></i>'}).join("")+'</span></span><span class="pf-c">💬 '+n+'</span></a></li>'}).join("")+'</ol>';
  return Head("VAULT","Top Performances","Ten major performances in each category this week. Open one to rate it and comment.",Bdg("snap","SNAPSHOT · "+PF.asOf))+tabs+'<p class="foot-n vx-in">'+esc(c.note)+' Order is by VAULT editors and is not an official ranking.</p>'+list+'<p class="foot-n">Source: '+esc(PF.src)+'. Comments are saved only on this device.</p>'}
function vPerfOne(id){
  if(!PF){loadPF();return '<div class="vx-load"><i></i><i></i><i></i></div>'}
  var p=PF.items.filter(function(x){return x.id===id})[0];if(!p)return vPerf();
  var c=PF.cats.filter(function(x){return x.k===p.cat})[0],ufc=p.cat==="ufc";
  var others=PF.items.filter(function(x){return x.cat===p.cat&&x.id!==p.id}).sort(function(a,b){return a.rank-b.rank}).slice(0,5);
  return '<a class="back" href="#performances">← Top Performances</a>'+Head(c.label+" · No. "+p.rank,p.n,(ufc?p.tm+" · beat "+p.opp:p.tm+" vs "+p.opp)+" · "+p.d+" · "+p.res,Bdg("snap","SNAPSHOT · "+p.d))+
   '<section class="panel pfd vx-in"><p class="pfh">'+esc(p.head)+'</p><div class="pfm">'+p.stats.map(function(s){return '<div><b>'+esc(s[1])+'</b><small>'+esc(s[0])+'</small></div>'}).join("")+'</div>'+(p.note?'<p class="foot-n">'+esc(p.note)+'</p>':"")+'</section>'+
   Talk(p,"Comments")+'<h2 class="vx-h2">More from '+esc(c.label)+'</h2><div class="chips2">'+others.map(function(x){return '<a href="#performances-'+x.id+'">'+esc(x.n)+'</a>'}).join("")+'</div>'}
/* ---------- router bits ---------- */
var RE=/^(plus|account|players|performances|intel|matchup|fullstory|myvault|alerts|exclusive)(-.*)?$/;
function match(h){return RE.test(h)}
function title(h){return "VAULT — "+h.replace(/-.*/,"")}
function load(){if(P||loading)return;loading=true;fetch("premium.json",{cache:"no-cache"}).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(j){P=j;loading=false;if(A().rerender)A().rerender()}).catch(function(){failed=true;loading=false;if(A().rerender)A().rerender()})}
function view(h){
  if(h==="plus"||h==="account")return vFree();
  if(h==="players"||h.indexOf("players-")===0)return vPerf();if(h==="performances")return vPerf();if(h.indexOf("performances-")===0)return vPerfOne(h.slice(13));
  if(!P){load();return failed?A().Empty("Could not load VAULT Plus data","Please refresh the page."):'<div class="vx-load"><i></i><i></i><i></i></div>'}
  var m=h.match(/^([a-z]+)(?:-(.*))?$/),k=m[1],r=m[2]||"";
  if(k==="intel"){if(r.indexOf("f-")===0)return vFighter(r.slice(2));var t=r.match(/^(nfl|nba)-(.+)$/);if(t)return vTeam(t[1],t[2]);if(r.indexOf("cbb-")===0)return vCbb(r.slice(4));return vIntel()}
  if(k==="matchup")return vMatchup(h);
  if(k==="fullstory")return r?vFS(r):vFSIndex();
  if(k==="myvault")return vMy();if(k==="alerts")return vAlerts();
  if(k==="exclusive")return r?vEx(r):vExIndex();
  return vPlus()}
var NV=[["performances","Top Performances"],["intel","Intel"],["matchup","Matchup Lab"],["fullstory","The Full Story"],["myvault","My VAULT"],["alerts","Priority Alerts"],["exclusive","Exclusive"]];
function nav(cur){var c=cur.replace(/-.*/,"");return NV.map(function(n){return '<a href="#'+n[0]+'" class="'+(n[0]===c?"on":"")+'"'+(n[0]===c?' aria-current="page"':"")+'>'+n[1]+'</a>'}).join("")}
function storyExtra(s){
  var fs=P&&P.fullstory.filter(function(f){return f.story===s.id})[0];
  return '<div class="sx">'+(fs?'<a class="fs-link" href="#fullstory-'+esc(fs.id)+'"><span class="pb">FULL STORY</span> Timeline, fact checks and sources →</a>':"")+RatingBox(s)+'</div>'}
function onFresh(fr){var a=alerts();if(!Object.keys(a.cats).some(function(k){return a.cats[k]})&&!a.kw.length)return;var m=fr.filter(function(s){return alertHits(s,a).length});if(m.length&&A().toast)A().toast(m[0])}
/* ---------- actions ---------- */
function redo(){if(A().rerender)A().rerender(true);if(A().renderNav)A().renderNav()}
document.addEventListener("click",function(e){
  var b=e.target.closest&&e.target.closest("[data-vx]");if(!b||b.disabled)return;
  var p=b.getAttribute("data-vx").split(":"),a=p[0],v=p.slice(1).join(":");
  if(a==="checkout"){CO={step:1,cy:v};redo();return}
  if(a==="coX"){CO=null;redo();return}
  if(a==="pay"){var cyc=CO&&CO.cy||"annual";ss("vault.plan",JSON.stringify({plan:"plus",cycle:cyc,since:Date.now(),via:v}));CO=null;redo();location.hash="#account";return}
  if(a==="cycle"){pickCycle=v;redo();return}
  if(a==="plan"){var q=v.split(":");if(q[0]==="free")ss("vault.plan",JSON.stringify({plan:"free",cycle:plan().cycle}));else ss("vault.plan",JSON.stringify({plan:"plus",cycle:q[1]||"annual",since:plan().since||Date.now()}));pickCycle=null;redo();if(location.hash!=="#account"&&q[0]!=="free")location.hash="#account";return}
  if(a==="reset"){ss("vault.fav",JSON.stringify({sports:[],teams:[],athletes:[]}));ss("vault.alerts",JSON.stringify({cats:{control:true},kw:[]}));redo();return}
  if(a==="mmode"){M.mode=v;M.a=DEF[v][0];M.b=DEF[v][1];redo();return}
  if(a==="mswap"){var t=M.a;M.a=M.b;M.b=t;redo();return}
  if(a==="psort"){plSort=v;redo();return}
  if(a==="pfcat"){pfCat=v;redo();return}
  if(a==="psport"){plSport=v;plTeam="";plQ="";redo();return}
  if(a==="mood"){var q2=v.split(":");ss("vault.pv."+q2[0],q2[1]);redo();return}
  if(a==="prompt"){var q3=v.split(":"),inp=document.querySelector(".tk .inp");if(inp){inp.value=decodeURIComponent(q3.slice(1).join(":"));inp.focus()}return}
  if(a==="ccopy"||a==="cdel"){var q5=v.split("|"),cp=q5[0],cid=q5[1],it=cFind(cp,cid);if(!it)return;
    if(a==="ccopy"){try{navigator.clipboard.writeText(it.t+" (via VAULT)");b.textContent="Copied!"}catch(e){b.textContent="Copy not available"}return}
    if(!(it.uid===MYID||IS_OWN))return;b.disabled=true;CDB.doc("threads/"+cpid(cp)+"/takes/"+cid).delete().catch(function(){b.disabled=false;b.textContent="Couldn't delete"});return}
  if(a==="tdel"||a==="tcopy"){var q4=v.split(":"),T=talkAll(),th=T[q4[0]]||[],ix=+q4[1];if(a==="tdel"){th.splice(ix,1);T[q4[0]]=th;ss("vault.talk",JSON.stringify(T));redo()}else{var tx=th[ix]&&th[ix].t;try{navigator.clipboard.writeText(tx+" (via VAULT)");b.textContent="Copied!"}catch(e){b.textContent="Copy not available"}}return}
  var f=favs();
  if(a==="fsport"){var i=f.sports.indexOf(v);if(i>-1)f.sports.splice(i,1);else if(favCount(f)<(isPlus()?999:3))f.sports.push(v);ss("vault.fav",JSON.stringify(f));redo();return}
  if(a==="fteam"){var s=$("#favTeam"),k=s&&s.value;if(k&&f.teams.indexOf(k)<0&&favCount(f)<(isPlus()?999:3)){f.teams.push(k);ss("vault.fav",JSON.stringify(f))}redo();return}
  if(a==="frm"){f.teams=f.teams.filter(function(x){return x!==v});f.athletes=f.athletes.filter(function(x){return"a:"+x!==v});ss("vault.fav",JSON.stringify(f));redo();return}
  var al=alerts();
  if(a==="atog"){if(al.cats[v])delete al.cats[v];else if(isPlus()||!Object.keys(al.cats).some(function(k){return al.cats[k]}))al.cats[v]=true;ss("vault.alerts",JSON.stringify(al));redo();return}
  if(a==="akwrm"){al.kw=al.kw.filter(function(x){return x!==v});ss("vault.alerts",JSON.stringify(al));redo();return}
});
document.addEventListener("input",function(e){if(e.target&&e.target.id==="plQ"){plQ=e.target.value;var pos=e.target.selectionStart;if(A().rerender)A().rerender(true);var n=document.getElementById("plQ");if(n){n.focus();try{n.setSelectionRange(pos,pos)}catch(x){}}}});
document.addEventListener("change",function(e){var s=e.target.closest&&e.target.closest("[data-vx-sel]");if(!s)return;var w=s.getAttribute("data-vx-sel");if(w==="pteam"){plTeam=s.value;redo();return}M[w]=s.value;if(M.a===M.b){var o=opts(M.mode).map(function(x){return x[0]}).filter(function(x){return x!==M[w]})[0];M[w==="a"?"b":"a"]=o}redo()});
document.addEventListener("submit",function(e){var fm=e.target.closest&&e.target.closest("[data-vx-form]");if(!fm)return;e.preventDefault();var w=fm.getAttribute("data-vx-form"),inp=fm.querySelector("input.tx")||fm.querySelector("input"),v=(inp.value||"").trim().slice(0,40);
  if(w.indexOf("take:")===0){if(!isPlus())return;var pid=w.slice(5),ct=cleanTake(inp.value);if(!ct){inp.value="";inp.placeholder="Not posted: remove links, contact info or rude words";return}if(cOnline()&&!C_RO){var btn=fm.querySelector("button"),er=document.querySelector('[data-cerr="'+cpid(pid)+'"]');if(fm.dataset.busy)return;fm.dataset.busy="1";if(btn)btn.disabled=true;if(er)er.textContent="";
    CDB.collection("threads/"+cpid(pid)+"/takes").add(cBody(ct,fm)).then(function(){inp.value="";inp.placeholder="Posted. Add another take?"}).catch(function(e){var c=e&&e.code;if(c==="invalid_argument"){C_RO=true;redo();return}if(er)er.textContent=c==="quota_exceeded"?"VAULT's comment space is full right now, so this take wasn't posted.":"Couldn't post right now. Try again in a moment."}).then(function(){delete fm.dataset.busy;if(btn)btn.disabled=false});return}
  var T=talkAll();T[pid]=(T[pid]||[]);T[pid].unshift({t:ct,ts:Date.now()});T[pid]=T[pid].slice(0,50);ss("vault.talk",JSON.stringify(T));redo();return}
  if(!v)return;
  if(w==="fath"){var f=favs();if(f.athletes.map(function(x){return x.toLowerCase()}).indexOf(v.toLowerCase())<0&&favCount(f)<(isPlus()?999:3)){f.athletes.push(v);ss("vault.fav",JSON.stringify(f))}}
  if(w==="akw"&&isPlus()){var a=alerts();if(a.kw.indexOf(v)<0&&a.kw.length<10){a.kw.push(v);ss("vault.alerts",JSON.stringify(a))}}
  redo()});
window.VX={match:match,view:view,title:title,nav:nav,storyExtra:storyExtra,onFresh:onFresh};
load();
})();

/* ---------- Auto-fit: shrink text that would be cut off ---------- */
(function(){
var SEL=".art .w,.banner .w,.plate b,.art .sp,#view h1,#view h2,#view h3,.card h3,.ev b,.sc-r,.pfm b,.pf-s i,.lab,.bd,.chip,.mtabs button,.box-h";
function avail(e){var p=e.offsetParent||e.parentElement;if(!p)return 0;var pr=p.getBoundingClientRect(),er=e.getBoundingClientRect(),cs=getComputedStyle(p);
  return pr.right-parseFloat(cs.paddingRight||0)-er.left}
function over(e){var a=avail(e);return (e.scrollWidth>e.clientWidth+1&&getComputedStyle(e).display!=="inline")||e.getBoundingClientRect().width>a+1}
function fitOne(e){if(!e.offsetParent&&getComputedStyle(e).position!=="fixed")return;
  if(e.dataset.fitBase){e.style.fontSize=""}var base=parseFloat(getComputedStyle(e).fontSize);if(!base)return;e.dataset.fitBase=base;
  var w=e.getBoundingClientRect().width,a=avail(e);
  if(!(over(e)))return;
  var need=Math.max(e.scrollWidth,w),size=base*Math.min(1,(a-2)/need);size=Math.max(size,base*.4);e.style.fontSize=size+"px";
  for(var i=0;i<12&&over(e)&&size>base*.4;i++){size*=.93;e.style.fontSize=size+"px"}}
var busy=false,t=null;
function fitAll(){if(busy)return;busy=true;try{document.querySelectorAll(SEL).forEach(fitOne)}catch(x){}busy=false}
function later(){clearTimeout(t);t=setTimeout(fitAll,60)}
window.VFIT=fitAll;
window.addEventListener("resize",later);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(later);
window.addEventListener("load",later);
function obs(){var v=document.getElementById("app");if(!v)return setTimeout(obs,200);new MutationObserver(function(m){if(!busy)later()}).observe(v,{childList:true,subtree:true})}
obs();later();
})();

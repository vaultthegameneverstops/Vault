/* VAULT — legal, privacy and storage-choice pages. Loaded before app.js.
   Fill in BIZ below; empty fields show "Coming soon". */
(function(){
"use strict";
var BIZ={
  name:"",          // legal name of the business or person running VAULT
  email:"",         // contact email for privacy, refunds and removal requests
  address:"",       // mailing address (required in many places for a business)
  country:"",       // where the business is based, for the governing-law line
  updated:"Nov 25, 2026"
};
var ESSENTIAL={"vault.consent":1,"vault.cid":1};
/* ---------- storage choice: block non-essential saves when the viewer says no ---------- */
var origSet=Storage.prototype.setItem,origGet=Storage.prototype.getItem;
function ADS(){return !!(window.VAds&&VAds.on())}
function choice(){try{return origGet.call(localStorage,"vault.consent")}catch(e){return null}}
function setChoice(v){try{origSet.call(localStorage,"vault.consent",v)}catch(e){}}
try{Storage.prototype.setItem=function(k,v){
  if(this===window.localStorage&&choice()==="essential"&&String(k).indexOf("vault.")===0&&!ESSENTIAL[k])return;
  return origSet.call(this,k,v)}}catch(e){}
function vaultKeys(){var o=[];try{for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(k&&k.indexOf("vault.")===0)o.push(k)}}catch(e){}return o}
function wipe(keepChoice){vaultKeys().forEach(function(k){if(keepChoice&&k==="vault.consent")return;try{localStorage.removeItem(k)}catch(e){}})}

function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function f(v,label){return v?esc(v):'Coming soon'}
function contact(){return BIZ.email?'<a href="mailto:'+esc(BIZ.email)+'">'+esc(BIZ.email)+'</a> ('+esc(BIZ.email)+')':f("","Contact email")}
var TODO="";

var LINKS=[["about","About VAULT"],["privacy","Privacy policy"],["terms","Terms of service"],["refunds","Refund policy"],["cookies","Cookies &amp; storage"],["your-data","Your data"],["accessibility","Accessibility"],["credits","Credits &amp; licenses"]];
function Nav(on){return '<nav class="lg-nav" aria-label="Legal and policies">'+LINKS.map(function(l){return '<a href="#'+l[0]+'"'+(l[0]===on?' aria-current="page" class="on"':"")+'>'+l[1]+'</a>'}).join("")+'</nav>'}
function Page(id,h,sub,body){return '<div class="lg">'+Nav(id)+'<h1 class="page-h">'+h+'</h1><p class="page-s">'+sub+' · Last updated '+esc(BIZ.updated)+'</p>'+TODO+body+'</div>'}
function S(h,b){return '<section class="lg-s"><h2>'+h+'</h2>'+b+'</section>'}

var V={
about:function(){return Page("about","About VAULT","Who runs VAULT and how to reach them",
  S("Business details",'<dl class="lg-dl"><dt>Run by</dt><dd>'+f(BIZ.name,"Business name")+'</dd><dt>Contact</dt><dd>'+contact()+'</dd><dt>Address</dt><dd>'+f(BIZ.address,"Address")+'</dd><dt>Based in</dt><dd>'+f(BIZ.country,"Country")+'</dd></dl>')+
  S("What VAULT is","<p>VAULT is a sports news and scores site. Stories are short summaries written from the sources linked on each story. Rumors and opinion are labeled. Scores and stats come from a data file VAULT publishes; they are a snapshot as of the time shown, not a live official feed.</p><p>VAULT is independent. It is not affiliated with or endorsed by any league, team, athlete or promotion. Team and league names belong to their owners.</p>"))},
privacy:function(){return Page("privacy","Privacy policy","What VAULT collects, where it goes and how to remove it",
  S("The short version","<ul><li>No accounts, no email sign-up, no card details"+(ADS()?". VAULT shows ads from Google AdSense to pay for the site, and those ads use cookies (see Advertising below). VAULT has no analytics tools of its own.":", no ads and no analytics or tracking tools.")+"</li><li>Most of what you do (saves, ratings, votes, favorites) stays in your own browser.</li><li>The only thing that leaves your device is a take you choose to post in a shared conversation.</li></ul>")+
  S("Saved in your browser only","<p>VAULT uses your browser's local storage (not cookies) to remember things you ask it to: saved stories, star ratings, poll and mood votes, quiz best score, alert settings, favorite teams and athletes, which stories you have already seen (so alerts only show new ones), the demo plan setting, the name you last posted with, and display preferences. None of this is sent to VAULT or anyone else. You can erase it any time on <a href=\"#your-data\">Your data</a>, or choose not to save it on <a href=\"#cookies\">Cookies &amp; storage</a>.</p>")+
  S("Takes you post","<p>When the shared conversation is available, a take you post is saved online and shown to everyone who opens VAULT. It stores the text, the time, the name you typed (optional) and a random device code. The code is created in your browser and only lets you delete your own takes later. It is not linked to your name, email or account. Links, emails and phone numbers are blocked from takes. Don't post personal information.</p><p>Posted takes are stored by Anthropic, which hosts VAULT on claude.ai. The VAULT owner can remove any take.</p>")+
  S("Hosting and other services","<p>VAULT is hosted on claude.ai by Anthropic. Like any website host, it receives standard technical information when the page loads (such as your IP address and browser type); see Anthropic's privacy policy for how it handles that. "+(ADS()?"The only third-party code VAULT loads is Google AdSense, which shows the ads. VAULT loads no social widgets, analytics or tracking pixels of its own, and its fonts are stored with the site.":"VAULT loads no third-party scripts, ad networks, social widgets, analytics or tracking pixels, and its fonts are stored with the site.")+" Links to sources, YouTube or social sites open those sites, which have their own privacy policies.</p>")+
  (ADS()?S("Advertising","<p>VAULT is free because it shows ads. They are served by Google AdSense. Google and its partners use cookies and similar technology to show ads, measure them and prevent fraud, including ads based on your earlier visits to VAULT or other websites.</p><p>You can turn off personalized ads on VAULT on <a href=\"#cookies\">Cookies &amp; storage</a>. You can also manage Google ads everywhere at <a href=\"https://adssettings.google.com\" target=\"_blank\" rel=\"noopener\">Google Ads Settings</a> or opt out of many ad companies at <a href=\"https://www.aboutads.info/choices\" target=\"_blank\" rel=\"noopener\">aboutads.info</a>. Learn <a href=\"https://policies.google.com/technologies/partner-sites\" target=\"_blank\" rel=\"noopener\">how Google uses information from sites that use its services</a>.</p><p>Visitors in the EU, UK and Switzerland are asked for consent before personalized ads are shown.</p>"):"")+
  S("Email","<p>VAULT does not collect email addresses and sends no email or text messages. Priority Alerts appear only inside VAULT while it is open. If VAULT adds email later, every message will include a one-click unsubscribe link, and this policy will be updated first.</p>")+
  S("Children","<p>VAULT is not directed at children under 13, and you must be 13 or older to post a take. VAULT does not knowingly collect personal information from children under 13. If you believe a child under 13 has posted, contact "+contact()+" and the take will be removed.</p>")+
  S("Your choices and rights","<p>You can erase everything VAULT saved on your device, delete takes you posted from this device, or ask VAULT to remove any take or answer questions about your data at "+contact()+". Depending on where you live (for example the EU, UK or California), you may have rights to access, correct or delete personal information; send requests to the same address. "+(ADS()?"VAULT does not sell your information. When you allow personalized ads, Google and its partners may use cookies and device identifiers for targeted advertising, which some state laws call \"sharing.\" To opt out, choose Non-personalized ads only on <a href=\"#cookies\">Cookies &amp; storage</a>.":"VAULT does not sell or share personal information for advertising.")+"</p>"))},
terms:function(){return Page("terms","Terms of service","The rules for using VAULT",
  S("Using VAULT","<p>By using VAULT you agree to these terms. You must be 13 or older to post takes. If you are under 18, a parent or guardian must agree to any purchase.</p>")+
  S("Content and accuracy","<p>Stories are summaries of reporting from the linked sources, and scores and stats are a snapshot as of the time shown. VAULT works to be accurate but can't guarantee every detail is complete or current. Check the linked source before relying on anything important. Nothing on VAULT is betting, financial or medical advice.</p>")+
  S("What you post","<p>You keep ownership of takes you add. By posting a take you let VAULT show it to other readers. Don't post anything illegal, hateful, harassing, sexual, someone else's personal information, or photos you don't have the right to use. VAULT may remove any take.</p>")+
  S("VAULT Plus","<p>VAULT Plus is currently a demo. No payment provider is connected, nothing is charged and every feature is free. Before real payments start, these terms will list the price, billing period, automatic renewal and how to cancel, and the <a href=\"#refunds\">refund policy</a> will apply.</p>")+
  S("Names and trademarks","<p>Team, league, athlete and promotion names and marks belong to their owners and are used only to identify who a story is about. VAULT is not affiliated with or endorsed by them.</p>")+
  S("Liability and changes","<p>VAULT is provided as is, to the extent the law allows. VAULT may change or stop the service or these terms; the date above shows the latest version. These terms are governed by the laws of "+f(BIZ.country,"Country")+". Questions: "+contact()+".</p>"))},
refunds:function(){return Page("refunds","Refund policy","How cancellations and refunds work",
  S("Right now","<p>VAULT Plus is a demo. Nothing is charged, so there is nothing to refund. The plan buttons only change a setting on your device.</p>")+
  S("When real payments start","<p>When paid plans launch, these terms will apply:</p><ul><li>The price shown at checkout is the full price. Any tax is shown before you pay, and there are no other fees.</li><li>Plans renew automatically at the end of each month or year until you cancel. You can cancel any time on the Account page in one step.</li><li>When you cancel, Plus stays on until the end of the period you paid for, and you are not charged again.</li><li>If you are charged by mistake, or ask within 14 days of your first payment or an annual renewal, you get a full refund.</li><li>Purchases made through Apple or PayPal are refunded through that service's own process.</li></ul><p>Refund requests: "+contact()+".</p>"))},
cookies:function(){var c=choice();return Page("cookies","Cookies &amp; storage",ADS()?"VAULT's own features use no cookies. Its ads do.":"VAULT uses no cookies",
  S("Your choice",'<p>'+(ADS()?"VAULT itself sets no cookies. The Google ads on VAULT do; see Ad choices below.":"VAULT sets no cookies and uses no tracking.")+' It saves your picks (saves, ratings, votes, favorites) in this browser so they are still here next time.</p><p class="lg-cur" aria-live="polite">Current setting: <b>'+(c==="essential"?"Don't save my picks":c==="all"?"Save my picks on this device":"Not chosen yet (saving is on)")+'</b></p><div class="lg-btns"><button type="button" class="btn-g" data-lg="consent:all"'+(c==="all"?' aria-pressed="true"':"")+'>Save my picks on this device</button><button type="button" class="btn-g" data-lg="consent:essential"'+(c==="essential"?' aria-pressed="true"':"")+'>Don\'t save my picks</button></div><p class="foot-n">"Don\'t save" also erases what is already saved. Two things are always kept because VAULT can\'t work without them: this choice, and the random device code that lets you delete takes you post.</p>')+(ADS()?S("Ad choices",VAds.choiceHTML()):"")+
  S("What is stored",'<div class="lg-tw"><table class="lg-t"><thead><tr><th scope="col">Item</th><th scope="col">Why</th><th scope="col">Kept</th></tr></thead><tbody>'+
   [["Storage choice","Remembers the choice on this page","Until you erase it"],["Device code","Lets you delete your own posted takes","Until you erase it"],["Saved stories, ratings, votes, quiz score","Features you use","Until you erase them"],["Favorites and alert settings","My VAULT and Priority Alerts","Until you erase them"],["Seen stories","So alerts only show new stories","Until you erase them"],["Name you post with","Fills in the name box next time","Until you erase it"],["Demo plan and display settings","Remembers your view","Until you erase them"]].map(function(r){return '<tr><td>'+r[0]+'</td><td>'+r[1]+'</td><td>'+r[2]+'</td></tr>'}).join("")+'</tbody></table></div>'))},
"your-data":function(){var n=vaultKeys().length;return Page("your-data","Your data","See and erase what VAULT keeps",
  S("On this device",'<p aria-live="polite" id="lgCount">VAULT has <b>'+n+'</b> item'+(n===1?"":"s")+' saved in this browser.</p><button type="button" class="btn-g danger" data-lg="wipe" id="lgWipe">Erase all VAULT data on this device</button><p class="foot-n">This removes saves, ratings, votes, favorites, alerts, photos and settings from this browser. It can\'t be undone. It does not delete takes you already posted; delete those first if you want them gone.</p>')+
  S("Takes you posted","<p>Open the conversation where you posted and press <b>Delete</b> on your take. That works from the same browser you posted from. If you erased your data or switched devices, email "+contact()+" with the take's text and where you posted it, and it will be removed.</p>")+
  S("Requests","<p>To ask what VAULT holds about you, or to have anything removed, contact "+contact()+". Requests are answered within 30 days.</p>"))},
accessibility:function(){return Page("accessibility","Accessibility","VAULT aims to meet WCAG 2.2 level AA",
  S("What VAULT does","<ul><li>Every page works with a keyboard. Press Tab to move, Enter to open, and Esc to close menus and dialogs. A \"Skip to content\" link is the first thing Tab reaches.</li><li>Images and charts have text descriptions, and decorative art is hidden from screen readers.</li><li>Text and controls meet contrast guidelines on VAULT's dark design.</li><li>The scores ticker pauses when you hover or focus it, and motion is reduced if your device asks for less motion.</li></ul>")+
  
  S("Tell us","<p>If something doesn't work for you, contact "+contact()+" and say which page and what happened.</p>"))},
credits:function(){return Page("credits","Credits &amp; licenses","Where VAULT's fonts, art and data come from",
  S("Fonts","<p>VAULT uses Inter and Inter Display by Rasmus Andersson, © The Inter Project Authors, under the SIL Open Font License 1.1. The fonts are free to use and ship with VAULT. License: <a href=\"https://openfontlicense.org\">openfontlicense.org</a>; project: <a href=\"https://rsms.me/inter/\">rsms.me/inter</a>.</p>")+
  S("Art and logos","<p>Story art, icons and the VAULT logo are drawn for VAULT in code.</p>")+
  S("Data and stories","<p>Each story links its sources. Scores and player stats come from VAULT's data file, compiled from Sportradar data, ESPN's public scoreboard (live scores) and the sources named on each page.</p>")+
  S("Third-party code",(ADS()?"<p>Google AdSense, loaded from pagead2.googlesyndication.com, to show ads. Nothing else: no other outside scripts, SDKs, analytics or social widgets.</p>":"<p>None. VAULT loads no outside scripts, SDKs, analytics, ads or social widgets. Everything it runs ships with the site.</p>")))}
};
var TITLES={about:"About",privacy:"Privacy policy",terms:"Terms of service",refunds:"Refund policy",cookies:"Cookies & storage","your-data":"Your data",accessibility:"Accessibility",credits:"Credits & licenses"};
window.VLegal={match:function(h){return Object.prototype.hasOwnProperty.call(V,h)},view:function(h){return V[h]()},title:function(h){return TITLES[h]+" — VAULT"}};

function rr(){if(window.VaultApp&&VaultApp.rerender)VaultApp.rerender(true)}
var wipeArm=null;
document.addEventListener("click",function(e){
  var b=e.target.closest&&e.target.closest("[data-lg]");if(!b)return;
  var a=b.getAttribute("data-lg");
  if(a.indexOf("consent:")===0){var v=a.slice(8);if(v==="essential")wipe(true);setChoice(v);hideBanner();rr();}
  else if(a==="wipe"){
    if(wipeArm!==b){wipeArm=b;b.textContent="Tap again to erase everything";setTimeout(function(){if(wipeArm===b){wipeArm=null;b.textContent="Erase all VAULT data on this device"}},4000);return}
    wipeArm=null;wipe(false);rr();var c=document.getElementById("lgCount");if(c)c.innerHTML="Done. VAULT has <b>0</b> items saved in this browser.";showBanner()}
  else if(a==="skip"){var m=document.getElementById("view");if(m){m.focus();m.scrollIntoView()}}
});

/* ---------- first-visit notice ---------- */
function hideBanner(){var x=document.getElementById("lgBanner");if(x)x.remove()}
function showBanner(){
  if(choice()||document.getElementById("lgBanner"))return;
  var d=document.createElement("div");d.id="lgBanner";d.className="lg-ban";d.setAttribute("role","region");d.setAttribute("aria-label","Storage choice");
  d.innerHTML='<p><b>'+(ADS()?'VAULT shows Google ads, which use cookies.':'No cookies, no tracking.')+'</b> VAULT saves your picks (saves, ratings, votes) in this browser only. <a href="#cookies">Details</a> · <a href="#privacy">Privacy</a></p><div class="lg-btns"><button type="button" class="btn-g" data-lg="consent:essential">Don\'t save</button><button type="button" class="btn-p" data-lg="consent:all">Save my picks</button></div>';
  document.body.appendChild(d)}
function start(){
  var app=document.getElementById("app");
  if(app&&!document.getElementById("lgSkip")){var s=document.createElement("button");s.type="button";s.id="lgSkip";s.className="lg-skip";s.setAttribute("data-lg","skip");s.textContent="Skip to content";app.insertBefore(s,app.firstChild)}
  showBanner()}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
})();

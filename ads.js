/* VAULT ads (Google AdSense).
   Off until you set CLIENT below. Loaded after legal.js, before app.js.

   Setup:
   1. Sign up at https://adsense.google.com with the domain VAULT is hosted on.
   2. Put your publisher ID in CLIENT (looks like "ca-pub-1234567890123456").
   3. Put the same number in ads.txt (replace pub-0000000000000000).
   4. Optional: create three Display ad units in AdSense and paste their slot IDs into SLOTS.
      With no slot IDs, VAULT loads AdSense and Google's Auto ads choose the placements.
   5. In AdSense > Privacy & messaging, turn on the GDPR message (required for EU/UK/Swiss visitors)
      and the US state regulations message.
*/
(function(){
var CLIENT="ca-pub-0000000000000000";
var SLOTS={top:"",mid:"",end:""};

var configured=/^ca-pub-\d{16}$/.test(CLIENT)&&CLIENT!=="ca-pub-0000000000000000";
/* AdSense does not serve inside the claude.ai preview, so ads only run on your own domain. */
var host=location.hostname||"";
var preview=/claude\.ai$|claudeusercontent\.com$|^localhost$|^127\./.test(host)||location.protocol==="file:";
var ON=configured&&!preview;
var manual=!!(SLOTS.top||SLOTS.mid||SLOTS.end);
var KEY="vault.ads";

function pref(){try{return localStorage.getItem(KEY)}catch(e){return null}}
function setPref(v){try{localStorage.setItem(KEY,v)}catch(e){}}
function npa(){return pref()==="npa"}

var loaded=false;
function load(){
  if(loaded||!ON)return;loaded=true;
  window.adsbygoogle=window.adsbygoogle||[];
  if(npa())window.adsbygoogle.requestNonPersonalizedAds=1;
  var s=document.createElement("script");
  s.async=true;s.crossOrigin="anonymous";
  s.src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client="+encodeURIComponent(CLIENT);
  document.head.appendChild(s);
}

function css(){
  var st=document.createElement("style");
  st.textContent=".vad{display:block;margin:22px auto;max-width:970px;min-height:110px;text-align:center;clear:both}"+
   ".vad-l{display:block;font-size:10px;letter-spacing:.14em;text-transform:uppercase;opacity:.55;margin-bottom:6px}"+
   ".vad ins{display:block;min-height:90px}"+
   "@media print{.vad{display:none}}";
  document.head.appendChild(st);
}

function slot(name){
  var a=document.createElement("aside");
  a.className="vad";a.setAttribute("aria-label","Advertisement");a.setAttribute("data-vad",name);
  a.innerHTML='<span class="vad-l">Advertisement</span><ins class="adsbygoogle" style="display:block" data-ad-client="'+CLIENT+'" data-ad-slot="'+SLOTS[name]+'" data-ad-format="auto" data-full-width-responsive="true"></ins>';
  return a;
}
function fill(el){try{(window.adsbygoogle=window.adsbygoogle||[]).push({})}catch(e){}}

/* Pages that never carry ads: policies, the data page and anything legal. */
function adFree(){
  var h=(location.hash||"#home").slice(1);
  return !!(window.VLegal&&VLegal.match(h));
}

function place(){
  if(!ON||!manual)return;
  var v=document.getElementById("view");if(!v||v.querySelector("[data-vad]")||adFree())return;
  var put=[];
  if(SLOTS.top){var t=slot("top");v.insertBefore(t,v.firstChild);put.push(t)}
  if(SLOTS.mid){
    var prose=v.querySelector(".prose"),secs=v.querySelectorAll(".sec-h"),m=slot("mid");
    if(prose&&prose.parentNode){prose.parentNode.insertBefore(m,prose.nextSibling);put.push(m)}
    else if(secs.length>=3){secs[2].parentNode.insertBefore(m,secs[2]);put.push(m)}
  }
  if(SLOTS.end){var e=slot("end");v.appendChild(e);put.push(e)}
  put.forEach(fill);
}

function watch(){
  var v=document.getElementById("view");if(!v)return;
  var pending=false;
  new MutationObserver(function(){if(pending)return;pending=true;requestAnimationFrame(function(){pending=false;place()})}).observe(v,{childList:true});
  place();
}

/* "Ad choices" buttons on the Cookies & storage page */
document.addEventListener("click",function(e){
  var b=e.target.closest&&e.target.closest("[data-vad-choice]");if(!b)return;
  setPref(b.getAttribute("data-vad-choice"));location.reload();
});

window.VAds={
  on:function(){return ON},
  npa:npa,
  choiceHTML:function(){
    if(!ON)return "";
    var n=npa();
    return '<p class="lg-cur" aria-live="polite">Current ad setting: <b>'+(n?"Non-personalized ads only":"Personalized ads allowed")+'</b></p>'+
     '<div class="lg-btns"><button type="button" class="btn-g" data-vad-choice="all"'+(n?"":' aria-pressed="true"')+'>Allow personalized ads</button>'+
     '<button type="button" class="btn-g" data-vad-choice="npa"'+(n?' aria-pressed="true"':"")+'>Non-personalized ads only</button></div>'+
     '<p class="foot-n">Non-personalized ads are based on the page you are reading, not on your browsing history. Google may still use cookies to limit how often you see an ad and to stop fraud.</p>';
  }
};

if(ON){
  css();load();
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",watch);else watch();
}
})();

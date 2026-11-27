/* VAULT Social: follow links + Overtime-style post kit (shareable cards + captions) */
(function(){
var FMT={feed:[1080,1350,"Feed 4:5"],story:[1080,1920,"Story / TikTok 9:16"],square:[1080,1080,"Square 1:1"]};
var fmt="feed";
try{fmt=localStorage.getItem("vault.socialfmt")||"feed"}catch(e){}
if(!FMT[fmt])fmt="feed";
var PLAT=[["tiktok","TikTok","https://www.tiktok.com/@"],["instagram","Instagram","https://www.instagram.com/"],["youtube","YouTube","https://www.youtube.com/@"],["x","X","https://x.com/"]];
var SPN={nfl:"NFL",nba:"NBA",mma:"MMA",cfb:"CFB",cbb:"CBB"};

function A(){return window.VaultApp}
function esc(s){return A().esc(s)}
function D(){return A().D}

function picks(){
  var d=D(),seen={},out=[];
  function add(s){if(s&&!seen[s.id]){seen[s.id]=1;out.push(s)}}
  d.stories.filter(function(s){return s.label==="BREAKING"||s.label==="CONTROVERSY"}).forEach(add);
  (d.trending||[]).map(A().byId).forEach(add);
  d.stories.forEach(add);
  return out.slice(0,12);
}

function tagify(t){return "#"+String(t).replace(/[^A-Za-z0-9]/g,"")}
function caption(s){
  var src=(s.sources||[]).map(function(x){return x.n}).filter(function(v,i,a){return a.indexOf(v)===i}).join(", ");
  var ask=s.poll?s.poll.q+" "+s.poll.a+" or "+s.poll.b+"? 👇":"What's your take? 👇";
  var tags=["#VAULT"].concat((s.tags||[]).map(tagify)).concat(SPN[s.sport]?["#"+SPN[s.sport]]:[]);
  return (s.unconfirmed||s.label==="UNCONFIRMED"?"🚨 UNCONFIRMED: ":"")+s.title+"\n\n"+s.dek+"\n\n"+ask+(src?"\n\nvia "+src:"")+"\n\n"+tags.join(" ");
}

function Follow(){
  var so=D().social||{};
  return '<div class="soc-f">'+PLAT.map(function(p){
    var h=String(so[p[0]]||"").replace(/^@/,"").trim();
    return h?'<a class="soc-p" href="'+esc(p[2]+h)+'" target="_blank" rel="noopener noreferrer"><b>'+p[1]+'</b><span>@'+esc(h)+'</span></a>'
            :'<div class="soc-p off"><b>'+p[1]+'</b><span>Coming soon</span></div>';
  }).join("")+'</div>';
}

function view(){
  var l=picks();
  return '<h1 class="page-h">VAULT Social</h1><p class="page-s">Follow VAULT everywhere, and grab ready-to-post cards for today\'s biggest stories.</p>'+
   A().Section("Follow VAULT","",Follow())+
   A().Section("Post kit","",
    '<p class="page-s soc-s">Each card comes with a caption. Download the card, copy the caption, post. Cards use VAULT\'s own graphics, so there\'s no TV footage to get flagged.</p>'+
    '<div class="chips soc-fmt" role="group" aria-label="Card size">'+Object.keys(FMT).map(function(k){return '<button class="chip'+(k===fmt?" on":"")+'" data-sfmt="'+k+'" aria-pressed="'+(k===fmt)+'">'+FMT[k][2]+'</button>'}).join("")+'</div>'+
    '<div class="soc-g">'+l.map(function(s){
      return '<div class="soc-c"><div class="soc-cv" style="aspect-ratio:'+FMT[fmt][0]+'/'+FMT[fmt][1]+'"><canvas data-scard="'+esc(s.id)+'" width="'+FMT[fmt][0]+'" height="'+FMT[fmt][1]+'" aria-label="Post card: '+esc(s.title)+'"></canvas></div>'+
        '<textarea class="soc-cap" readonly rows="5" aria-label="Caption for '+esc(s.title)+'">'+esc(caption(s))+'</textarea>'+
        '<div class="soc-b"><button class="btn r" data-sdl="'+esc(s.id)+'" type="button">Download card</button><button class="btn" data-scp="'+esc(s.id)+'" type="button">Copy caption</button><a class="btn" href="#story-'+esc(s.id)+'">Story</a></div></div>';
    }).join("")+'</div>');
}

/* ---------- canvas card ---------- */
function wrap(c,text,maxw){
  var w=String(text).split(/\s+/),lines=[],cur="";
  w.forEach(function(x){var t=cur?cur+" "+x:x;if(c.measureText(t).width<=maxw)cur=t;else{if(cur)lines.push(cur);cur=x}});
  if(cur)lines.push(cur);return lines;
}
function fit(c,text,maxw,size,min,weight,fam){
  while(size>min){c.font=weight+" "+size+"px "+fam;if(c.measureText(text).width<=maxw)break;size-=4}
  return size;
}
function draw(cv,s){
  var W=cv.width,H=cv.height,c=cv.getContext("2d"),pal=s.pal||["#0c0c0c","#60a5fa","#2563eb","#333"];
  var acc=pal[1]||"#60a5fa",HD='"VDisplay","Arial Black",Impact,sans-serif',BD='"VInter",system-ui,sans-serif';
  c.fillStyle="#080d18";c.fillRect(0,0,W,H);
  // accent slash + glow
  var g=c.createLinearGradient(0,0,W,H);g.addColorStop(0,pal[2]||acc);g.addColorStop(1,"#080d18");
  c.save();c.globalAlpha=.55;c.fillStyle=g;c.beginPath();c.moveTo(W*.45,0);c.lineTo(W,0);c.lineTo(W,H*.55);c.lineTo(W*.05,H*.55);c.closePath();c.fill();c.restore();
  c.fillStyle=acc;c.beginPath();c.moveTo(W*.62,0);c.lineTo(W*.74,0);c.lineTo(W*.28,H*.58);c.lineTo(W*.16,H*.58);c.closePath();c.fill();
  // huge name word
  var word=(s.name?s.name.join(" "):(s.art||s.kicker||"")).toUpperCase(),pad=70,tall=H>1500,top=tall?H*.2:H*.13;
  c.fillStyle="#fff";c.textBaseline="alphabetic";
  var parts=s.name?s.name.map(function(x){return x.toUpperCase()}):[word],y=top;
  parts.forEach(function(p,i){var sz=fit(c,p,W-pad*2,i===parts.length-1?230:150,60,"900",HD);c.font="900 "+sz+"px "+HD;y+=sz*.92;
    c.save();c.shadowColor="rgba(0,0,0,.55)";c.shadowBlur=30;c.fillStyle=i===parts.length-1?"#fff":acc;c.fillText(p,pad,y);c.restore()});
  // bottom panel
  var py=H*.58;c.fillStyle="rgba(10,10,11,.92)";c.fillRect(0,py,W,H-py);
  c.fillStyle=acc;c.fillRect(0,py,W,10);
  var ly=py+70,lab=(s.unconfirmed?"UNCONFIRMED":s.label||"NEWS").toUpperCase();
  c.font="800 34px "+BD;var lw=c.measureText(lab).width+44;
  c.fillStyle=lab==="UNCONFIRMED"?"#b45309":lab==="BREAKING"?"#c81e1e":acc;c.fillRect(pad,ly,lw,58);
  c.fillStyle=lab==="BREAKING"||lab==="UNCONFIRMED"?"#fff":"#080d18";c.textBaseline="middle";c.fillText(lab,pad+22,ly+30);
  c.font="700 32px "+BD;c.fillStyle="#dce6f5";c.fillText(String(s.kicker||"").toUpperCase()+" · "+(SPN[s.sport]||""),pad+lw+24,ly+30);
  // headline
  c.textBaseline="alphabetic";
  var fy=tall?H-330:H-80,avail=fy-ly-58-60-110,sz=H>1500?78:H>1200?66:58,lines;
  for(;sz>=36;sz-=4){c.font="800 "+sz+"px "+BD;lines=wrap(c,s.title,W-pad*2);if(lines.length*sz*1.15<=avail)break}
  var hy=ly+58+50+sz;c.fillStyle="#fff";
  lines.forEach(function(t,i){c.fillText(t,pad,hy+i*sz*1.15)});
  // footer: logo + slogan + source
  c.fillStyle="#2563eb";c.fillRect(pad,fy-46,64,64);
  c.save();c.translate(pad+9.6,fy-36.4);c.scale(.7,.7);c.fillStyle="#fff";c.beginPath();c.moveTo(2,6);c.lineTo(20,6);c.lineTo(31,32);c.lineTo(31,58);c.lineTo(26,58);c.closePath();c.fill();
  c.fillStyle="#93c5fd";c.beginPath();c.moveTo(62,6);c.lineTo(44,6);c.lineTo(33,32);c.lineTo(33,58);c.lineTo(38,58);c.closePath();c.fill();c.restore();
  c.fillStyle="#fff";c.font="900 44px "+HD;c.textBaseline="middle";c.fillText("VAULT",pad+84,fy-12);
  c.fillStyle="#8a8e94";c.font="700 22px "+BD;c.fillText("THE GAME NEVER STOPS.",pad+84,fy+22);
  var src=(s.sources||[]).length?"via "+s.sources[0].n:"";
  if(src){c.textAlign="right";c.fillStyle="#94a3b8";c.font="600 28px "+BD;c.fillText(src,W-pad,fy-12);c.textAlign="left"}
}
function paint(){
  var list=document.querySelectorAll("canvas[data-scard]");
  function go(){list.forEach(function(cv){var s=A().byId(cv.getAttribute("data-scard"));if(s)draw(cv,s)})}
  go();
  if(document.fonts&&document.fonts.load){Promise.all([document.fonts.load('900 40px "VDisplay"'),document.fonts.load('700 40px "VInter"')]).then(go,function(){})}
}

/* ---------- actions ---------- */
function flash(btn,t){var o=btn.textContent;btn.textContent=t;setTimeout(function(){btn.textContent=o},1600)}
function download(id,btn){
  var cv=document.querySelector('canvas[data-scard="'+id+'"]');if(!cv)return;
  var name="vault-"+id+"-"+fmt+".png";
  cv.toBlob(function(b){
    if(!b){flash(btn,"Try again");return}
    try{
      var f=new File([b],name,{type:"image/png"});
      if(navigator.canShare&&navigator.canShare({files:[f]})&&/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)){
        navigator.share({files:[f],title:"VAULT"}).catch(function(){});return}
    }catch(e){}
    var u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();
    setTimeout(function(){URL.revokeObjectURL(u)},4000);flash(btn,"Saved ✓");
  },"image/png");
}
function copy(id,btn){
  var s=A().byId(id);if(!s)return;var t=caption(s);
  function fallback(){var ta=btn.closest(".soc-c").querySelector(".soc-cap");ta.focus();ta.select();try{document.execCommand("copy");flash(btn,"Copied ✓")}catch(e){flash(btn,"Select & copy")}}
  try{navigator.clipboard.writeText(t).then(function(){flash(btn,"Copied ✓")},fallback)}catch(e){fallback()}
}
document.addEventListener("click",function(e){
  var t=e.target;
  var f=t.closest&&t.closest("[data-sfmt]");if(f){fmt=f.getAttribute("data-sfmt");try{localStorage.setItem("vault.socialfmt",fmt)}catch(x){}A().rerender(true);return}
  var d=t.closest&&t.closest("[data-sdl]");if(d){download(d.getAttribute("data-sdl"),d);return}
  var c=t.closest&&t.closest("[data-scp]");if(c){copy(c.getAttribute("data-scp"),c);return}
});
window.VSocial={view:view,after:paint};
})();

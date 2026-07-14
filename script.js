/* ===================== REMO — script.js ===================== */
(() => {
"use strict";

/* ---------- helpers ---------- */
const $  = (s,c=document)=>c.querySelector(s);
const $$ = (s,c=document)=>[...c.querySelectorAll(s)];
const rand = (a,b)=>a+Math.random()*(b-a);

/* ================= LOADER ================= */
const loader = $("#loader");
const loaderProgress = $("#loaderProgress");
let lp = 0;
const loaderTimer = setInterval(()=>{
  lp += rand(4,12);
  if(lp>=100){lp=100;clearInterval(loaderTimer);}
  loaderProgress.style.width = lp+"%";
},140);
window.addEventListener("load", ()=>{
  setTimeout(()=>{
    loaderProgress.style.width="100%";
    setTimeout(()=>{ loader.classList.add("hide"); document.body.style.overflow=""; },500);
  },600);
});

/* ================= CUSTOM CURSOR ================= */
const cursorDot = $("#cursorDot"), cursorRing = $("#cursorRing");
let mx=innerWidth/2,my=innerHeight/2, rx=mx, ry=my;
window.addEventListener("mousemove", e=>{
  mx=e.clientX; my=e.clientY;
  cursorDot.style.left=mx+"px"; cursorDot.style.top=my+"px";
  const ml = $("#mouseLight");
  if(ml){ ml.style.left=mx+"px"; ml.style.top=my+"px"; }
});
(function ringLoop(){
  rx += (mx-rx)*0.18; ry += (my-ry)*0.18;
  cursorRing.style.left=rx+"px"; cursorRing.style.top=ry+"px";
  requestAnimationFrame(ringLoop);
})();
$$("a,button,input").forEach(el=>{
  el.addEventListener("mouseenter", ()=>cursorRing.style.transform="translate(-50%,-50%) scale(1.6)");
  el.addEventListener("mouseleave", ()=>cursorRing.style.transform="translate(-50%,-50%) scale(1)");
});

/* ================= STARFIELD ================= */
const starCanvas = $("#starCanvas");
const sctx = starCanvas.getContext("2d");
let stars=[], shooting=[];
function sizeCanvas(cv){ cv.width=innerWidth*devicePixelRatio; cv.height=innerHeight*devicePixelRatio; cv.getContext("2d").scale(devicePixelRatio,devicePixelRatio); }

function initStars(){
  sizeCanvas(starCanvas);
  const count = innerWidth<700 ? 160 : 340;
  stars = Array.from({length:count},()=>({
    x:rand(0,innerWidth), y:rand(0,innerHeight*0.75),
    r:rand(.4,1.6), tw:rand(0,Math.PI*2), speed:rand(.4,1.4)
  }));
}
function drawStars(t){
  sctx.clearRect(0,0,innerWidth,innerHeight);
  stars.forEach(s=>{
    const alpha = 0.4+Math.sin(t/1000*s.speed+s.tw)*0.4+0.2;
    sctx.beginPath();
    sctx.fillStyle=`rgba(255,255,255,${Math.max(0,alpha)})`;
    sctx.arc(s.x,s.y,s.r,0,Math.PI*2);
    sctx.fill();
  });
  shooting.forEach((s,i)=>{
    sctx.strokeStyle=`rgba(255,255,255,${s.life})`;
    sctx.lineWidth=1.4;
    sctx.beginPath();
    sctx.moveTo(s.x,s.y);
    sctx.lineTo(s.x - s.vx*8, s.y - s.vy*8);
    sctx.stroke();
    s.x+=s.vx; s.y+=s.vy; s.life-=0.02;
    if(s.life<=0) shooting.splice(i,1);
  });
  requestAnimationFrame(drawStars);
}
function maybeShootingStar(){
  if(Math.random()<0.4 && shooting.length<2){
    const x=rand(innerWidth*0.1,innerWidth*0.9);
    shooting.push({x,y:rand(0,innerHeight*0.3),vx:rand(6,10),vy:rand(3,5),life:1});
  }
  setTimeout(maybeShootingStar, rand(3500,8000));
}
initStars();
requestAnimationFrame(drawStars);
setTimeout(maybeShootingStar, 3000);

/* ================= FIREFLIES ================= */
const flyCanvas = $("#fireflyCanvas");
const fctx = flyCanvas.getContext("2d");
let flies=[];
function initFlies(){
  sizeCanvas(flyCanvas);
  const count = innerWidth<700 ? 10 : 22;
  flies = Array.from({length:count},()=>({
    x:rand(0,innerWidth), y:rand(innerHeight*0.4,innerHeight),
    r:rand(1,2.4), a:rand(0,Math.PI*2), speed:rand(.2,.6), phase:rand(0,Math.PI*2)
  }));
}
function drawFlies(t){
  fctx.clearRect(0,0,innerWidth,innerHeight);
  flies.forEach(f=>{
    f.x += Math.cos(f.a)*f.speed;
    f.y += Math.sin(f.a)*f.speed*0.6;
    f.a += rand(-.05,.05);
    if(f.x<0)f.x=innerWidth; if(f.x>innerWidth)f.x=0;
    if(f.y<innerHeight*0.3)f.y=innerHeight; if(f.y>innerHeight)f.y=innerHeight*0.3;
    const glow = 0.4+Math.sin(t/500+f.phase)*0.4+0.2;
    const grad = fctx.createRadialGradient(f.x,f.y,0,f.x,f.y,8);
    grad.addColorStop(0,`rgba(255,220,140,${glow})`);
    grad.addColorStop(1,"rgba(255,220,140,0)");
    fctx.fillStyle=grad;
    fctx.beginPath(); fctx.arc(f.x,f.y,8,0,Math.PI*2); fctx.fill();
    fctx.beginPath(); fctx.fillStyle=`rgba(255,240,200,${glow})`;
    fctx.arc(f.x,f.y,f.r,0,Math.PI*2); fctx.fill();
  });
  requestAnimationFrame(drawFlies);
}
initFlies();
requestAnimationFrame(drawFlies);

/* ================= FLOATING HEARTS ================= */
const heartCanvas = $("#heartsCanvas");
const hctx = heartCanvas.getContext("2d");
let hearts=[];
function initHeartsCanvas(){ sizeCanvas(heartCanvas); }
initHeartsCanvas();
function spawnHeart(x,y){
  hearts.push({x:x??rand(0,innerWidth), y:y??innerHeight+20, size:rand(8,18), vy:rand(.6,1.4), drift:rand(-.4,.4), life:1, hue: Math.random()>0.5?"#ff5ca8":"#e8c27a"});
}
function drawHeart(ctx,x,y,size,color,alpha){
  ctx.save();
  ctx.globalAlpha=alpha;
  ctx.translate(x,y);
  ctx.scale(size/16,size/16);
  ctx.beginPath();
  ctx.moveTo(0,4);
  ctx.bezierCurveTo(0,-2,-8,-2,-8,4);
  ctx.bezierCurveTo(-8,10,0,14,0,18);
  ctx.bezierCurveTo(0,14,8,10,8,4);
  ctx.bezierCurveTo(8,-2,0,-2,0,4);
  ctx.fillStyle=color;
  ctx.shadowColor=color; ctx.shadowBlur=10;
  ctx.fill();
  ctx.restore();
}
function drawHearts(){
  hctx.clearRect(0,0,innerWidth,innerHeight);
  hearts.forEach((h,i)=>{
    h.y -= h.vy; h.x += h.drift; h.life -= 0.006;
    drawHeart(hctx,h.x,h.y,h.size,h.hue,Math.max(0,h.life*0.8));
    if(h.life<=0) hearts.splice(i,1);
  });
  if(Math.random()<0.04) spawnHeart();
  requestAnimationFrame(drawHearts);
}
requestAnimationFrame(drawHearts);

/* ================= HEART CONSTELLATION (signature element) ================= */
const constCanvas = $("#heartConstellation");
const cctx = constCanvas.getContext("2d");
let constPoints=[];
function heartXY(t,scale){
  // parametric heart curve
  const x = 16*Math.pow(Math.sin(t),3);
  const y = -(13*Math.cos(t) - 5*Math.cos(2*t) - 2*Math.cos(3*t) - Math.cos(4*t));
  return {x:x*scale, y:y*scale};
}
function initConstellation(){
  const rect = constCanvas.getBoundingClientRect();
  constCanvas.width = rect.width*devicePixelRatio;
  constCanvas.height = rect.height*devicePixelRatio;
  cctx.scale(devicePixelRatio,devicePixelRatio);
  const cx=rect.width/2, cy=rect.height/2 + rect.height*0.06;
  const scale = rect.width/45;
  constPoints=[];
  const n=26;
  for(let i=0;i<n;i++){
    const t = (i/n)*Math.PI*2;
    const p = heartXY(t,scale);
    constPoints.push({x:cx+p.x, y:cy+p.y, tw:rand(0,Math.PI*2)});
  }
}
function drawConstellation(t){
  const rect = constCanvas.getBoundingClientRect();
  cctx.clearRect(0,0,rect.width,rect.height);
  const rotation = Math.sin(t/8000)*0.05;
  cctx.save();
  cctx.translate(rect.width/2, rect.height/2);
  cctx.rotate(rotation);
  cctx.translate(-rect.width/2, -rect.height/2);

  cctx.strokeStyle="rgba(255,140,190,.25)";
  cctx.lineWidth=1;
  cctx.beginPath();
  constPoints.forEach((p,i)=>{ i===0?cctx.moveTo(p.x,p.y):cctx.lineTo(p.x,p.y); });
  cctx.closePath();
  cctx.stroke();

  constPoints.forEach(p=>{
    const glow = 0.5+Math.sin(t/900+p.tw)*0.5;
    cctx.beginPath();
    const grad = cctx.createRadialGradient(p.x,p.y,0,p.x,p.y,6);
    grad.addColorStop(0,`rgba(255,203,224,${0.6+glow*0.4})`);
    grad.addColorStop(1,"rgba(255,203,224,0)");
    cctx.fillStyle=grad;
    cctx.arc(p.x,p.y,6,0,Math.PI*2); cctx.fill();
    cctx.beginPath();
    cctx.fillStyle=`rgba(255,255,255,${0.7+glow*0.3})`;
    cctx.arc(p.x,p.y,1.6,0,Math.PI*2); cctx.fill();
  });
  cctx.restore();
  requestAnimationFrame(drawConstellation);
}
initConstellation();
requestAnimationFrame(drawConstellation);

/* ================= RESIZE ================= */
let resizeTimer;
window.addEventListener("resize", ()=>{
  clearTimeout(resizeTimer);
  resizeTimer=setTimeout(()=>{
    initStars(); initFlies(); initHeartsCanvas(); initConstellation();
  },250);
});

/* ================= TYPING SUBTITLE ================= */
const typedEl = $("#typedSubtitle");
const fullText = "إلى الفتاة التي بقيت مميزة رغم مرور الوقت...";
let ti=0;
function typeLoop(){
  if(ti<=fullText.length){
    typedEl.textContent = fullText.slice(0,ti);
    ti++;
    setTimeout(typeLoop, 65);
  }
}
setTimeout(typeLoop, 1400);

/* ================= NAVBAR ================= */
const navbar = $("#navbar");
const navToggle = $("#navToggle");
const navLinks = $("#navLinks");
navToggle.addEventListener("click", ()=> navLinks.classList.toggle("open"));
$$(".nav-link").forEach(l=>l.addEventListener("click", ()=> navLinks.classList.remove("open")));

const sections = $$("main section[id], header#home");
const linkMap = {};
$$(".nav-link").forEach(l=> linkMap[l.getAttribute("href").slice(1)] = l);

window.addEventListener("scroll", ()=>{
  navbar.classList.toggle("scrolled", scrollY>40);
  // progress bar
  const h = document.documentElement;
  const pct = (h.scrollTop)/(h.scrollHeight-h.clientHeight)*100;
  $("#scrollProgressFill").style.width = pct+"%";
  $("#backToTop").classList.toggle("show", scrollY>600);
},{passive:true});

const navObserver = new IntersectionObserver((entries)=>{
  entries.forEach(en=>{
    if(en.isIntersecting){
      $$(".nav-link").forEach(l=>l.classList.remove("active"));
      const link = linkMap[en.target.id];
      if(link) link.classList.add("active");
    }
  });
},{rootMargin:"-45% 0px -50% 0px"});
sections.forEach(s=>navObserver.observe(s));

/* ================= REVEAL ON SCROLL ================= */
const revealObserver = new IntersectionObserver((entries)=>{
  entries.forEach(en=>{
    if(en.isIntersecting){ en.target.classList.add("in"); revealObserver.unobserve(en.target); }
  });
},{threshold:0.15});
$$(".reveal").forEach(el=>revealObserver.observe(el));

/* ================= BACK TO TOP ================= */
$("#backToTop").addEventListener("click", ()=> window.scrollTo({top:0,behavior:"smooth"}));

/* ================= LIVE CLOCK ================= */
function tickClock(){
  const now = new Date();
  $("#clockTime").textContent = now.toLocaleTimeString("ar-EG",{hour:"2-digit",minute:"2-digit"});
  $("#clockDate").textContent = now.toLocaleDateString("ar-EG",{year:"numeric",month:"2-digit",day:"2-digit"});
}
tickClock(); setInterval(tickClock,1000*20);

/* ================================================================
   SOUND SYSTEM — Web Audio API generated ambience (no external files
   required). Each sound is synthesized so the panel works out of the box;
   drop real recordings into assets/sounds/ and swap the generator for
   an <audio> source later if you prefer authentic recordings.
   ================================================================ */
const musicFab = $("#musicFab");
const soundPanel = $("#soundPanel");
const soundClose = $("#soundClose");
musicFab.addEventListener("click", ()=> soundPanel.classList.add("open"));
soundClose.addEventListener("click", ()=> soundPanel.classList.remove("open"));

const SOUND_DEFS = [
  {id:"heartbeat", label:"❤️ نبض القلب", type:"heartbeat"},
  {id:"rain",      label:"🌧 مطر",        type:"noise", filter:"lowpass", freq:900},
  {id:"waterfall", label:"🌊 شلال",       type:"noise", filter:"lowpass", freq:1800},
  {id:"crickets",  label:"🦗 صراصير الليل", type:"chirp", freq:3400},
  {id:"forest",    label:"🌙 غابة ليلية", type:"noise", filter:"bandpass", freq:600},
  {id:"wind",      label:"🍃 رياح",       type:"noise", filter:"highpass", freq:500},
  {id:"fire",      label:"🔥 موقد نار",   type:"crackle"},
  {id:"magic",     label:"✨ سحر",        type:"sparkle"},
  {id:"river",     label:"💧 نهر",        type:"noise", filter:"lowpass", freq:1200},
  {id:"fantasy",   label:"🌌 أجواء خيالية", type:"pad"},
];

let actx = null;
function ensureAudioCtx(){
  if(!actx) actx = new (window.AudioContext||window.webkitAudioContext)();
  if(actx.state==="suspended") actx.resume();
  return actx;
}

function makeNoiseBuffer(ctx){
  const bufferSize = ctx.sampleRate*2;
  const buffer = ctx.createBuffer(1,bufferSize,ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for(let i=0;i<bufferSize;i++) data[i]=Math.random()*2-1;
  return buffer;
}

const engines = {}; // id -> {gain, stop()}

function buildEngine(def, ctx){
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);
  let nodes = [];

  if(def.type==="noise"){
    const src = ctx.createBufferSource();
    src.buffer = makeNoiseBuffer(ctx); src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = def.filter; filter.frequency.value = def.freq;
    src.connect(filter).connect(master);
    src.start();
    nodes.push(src);
  }
  else if(def.type==="heartbeat"){
    let timer;
    const beat = ()=>{
      const t = ctx.currentTime;
      [0,0.28].forEach(off=>{
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type="sine"; osc.frequency.value=55;
        g.gain.setValueAtTime(0, t+off);
        g.gain.linearRampToValueAtTime(0.9, t+off+0.03);
        g.gain.exponentialRampToValueAtTime(0.001, t+off+0.28);
        osc.connect(g).connect(master);
        osc.start(t+off); osc.stop(t+off+0.3);
      });
      timer = setTimeout(beat, 950);
    };
    beat();
    nodes.push({stop:()=>clearTimeout(timer)});
  }
  else if(def.type==="chirp"){
    let timer;
    const chirp = ()=>{
      if(Math.random()<0.7){
        const t=ctx.currentTime;
        const osc=ctx.createOscillator(); const g=ctx.createGain();
        osc.type="sine"; osc.frequency.value=def.freq+rand(-200,200);
        g.gain.setValueAtTime(0,t);
        g.gain.linearRampToValueAtTime(0.25,t+0.01);
        g.gain.exponentialRampToValueAtTime(0.001,t+0.09);
        osc.connect(g).connect(master);
        osc.start(t); osc.stop(t+0.1);
      }
      timer=setTimeout(chirp, rand(150,500));
    };
    chirp();
    nodes.push({stop:()=>clearTimeout(timer)});
  }
  else if(def.type==="crackle"){
    const src = ctx.createBufferSource();
    src.buffer = makeNoiseBuffer(ctx); src.loop=true;
    const filter = ctx.createBiquadFilter();
    filter.type="bandpass"; filter.frequency.value=1500; filter.Q.value=0.6;
    const lfo = ctx.createOscillator(); lfo.frequency.value=5;
    const lfoGain = ctx.createGain(); lfoGain.gain.value=0.3;
    lfo.connect(lfoGain).connect(filter.frequency);
    lfo.start();
    src.connect(filter).connect(master);
    src.start();
    nodes.push(src,{stop:()=>lfo.stop()});
  }
  else if(def.type==="sparkle"){
    let timer;
    const spark = ()=>{
      const t=ctx.currentTime;
      const osc=ctx.createOscillator(); const g=ctx.createGain();
      osc.type="triangle"; osc.frequency.value=rand(1800,3600);
      g.gain.setValueAtTime(0,t);
      g.gain.linearRampToValueAtTime(0.15,t+0.02);
      g.gain.exponentialRampToValueAtTime(0.001,t+0.6);
      osc.connect(g).connect(master);
      osc.start(t); osc.stop(t+0.6);
      timer=setTimeout(spark, rand(400,1400));
    };
    spark();
    nodes.push({stop:()=>clearTimeout(timer)});
  }
  else if(def.type==="pad"){
    const freqs=[110,146.8,164.8];
    freqs.forEach(f=>{
      const osc=ctx.createOscillator(); const g=ctx.createGain();
      osc.type="sine"; osc.frequency.value=f;
      g.gain.value=0.18;
      osc.connect(g).connect(master);
      osc.start();
      nodes.push(osc);
    });
  }

  return {
    master,
    setVolume(v){ master.gain.linearRampToValueAtTime(v, ctx.currentTime+0.4); },
    stop(){ nodes.forEach(n=>{ try{n.stop&&n.stop();}catch(e){} }); }
  };
}

function getPrefs(){
  try{ return JSON.parse(localStorage.getItem("remo_sound_prefs")||"{}"); }catch(e){ return {}; }
}

const soundListEl = $("#soundList");
const prefs = getPrefs();

SOUND_DEFS.forEach(def=>{
  const p = prefs[def.id] || {on:false, vol:50, muted:false};
  const row = document.createElement("div");
  row.className="sound-row";
  row.innerHTML = `
    <div class="sound-row-top">
      <span class="sound-row-label">${def.label}</span>
      <button class="sound-toggle ${p.on?'on':''}" data-id="${def.id}" aria-label="تشغيل/إيقاف"></button>
    </div>
    <div class="sound-row-controls">
      <button class="mute-btn" data-id="${def.id}">${p.muted?'🔇':'🔊'}</button>
      <input type="range" min="0" max="100" value="${p.vol}" data-id="${def.id}">
    </div>`;
  soundListEl.appendChild(row);

  const toggleBtn = row.querySelector(".sound-toggle");
  const rangeEl = row.querySelector("input[type=range]");
  const muteBtn = row.querySelector(".mute-btn");

  function applyVolume(){
    if(!engines[def.id]) return;
    const vol = p.muted ? 0 : (rangeEl.value/100)*0.5;
    engines[def.id].setVolume(vol);
  }

  function start(){
    const ctx = ensureAudioCtx();
    if(!engines[def.id]) engines[def.id] = buildEngine(def, ctx);
    applyVolume();
  }
  function stop(){
    if(engines[def.id]){ engines[def.id].stop(); engines[def.id]=null; }
  }

  if(p.on) setTimeout(start, 300); // will actually start on first user gesture due to autoplay policy

  toggleBtn.addEventListener("click", ()=>{
    p.on = !p.on;
    toggleBtn.classList.toggle("on", p.on);
    p.on ? start() : stop();
  });
  rangeEl.addEventListener("input", ()=>{ p.vol = rangeEl.value; applyVolume(); });
  muteBtn.addEventListener("click", ()=>{
    p.muted = !p.muted;
    muteBtn.textContent = p.muted ? "🔇" : "🔊";
    applyVolume();
  });
});

$("#soundSave").addEventListener("click", ()=>{
  const out = {};
  SOUND_DEFS.forEach(def=>{
    const row = [...soundListEl.children].find(r=>r.querySelector(`[data-id="${def.id}"]`));
    out[def.id] = {
      on: row.querySelector(".sound-toggle").classList.contains("on"),
      vol: row.querySelector("input[type=range]").value,
      muted: row.querySelector(".mute-btn").textContent==="🔇"
    };
  });
  localStorage.setItem("remo_sound_prefs", JSON.stringify(out));
  const btn = $("#soundSave");
  const original = btn.textContent;
  btn.textContent = "✔ تم الحفظ";
  setTimeout(()=> btn.textContent = original, 1600);
});

/* ---------- background song player ---------- */
/* Autoplay strategy: browsers block audio with sound before any user
   gesture, but muted autoplay is universally allowed. So the <audio>
   tag starts muted+autoplay in the HTML, and the moment the visitor
   performs their first interaction anywhere on the page (click, touch,
   scroll, key press) we unmute and ensure playback is running. This
   gives the effect of "it just starts playing" without the browser
   silently blocking it. */
const bgSong = $("#bgSong");
const playBtn = $("#songPlayPause");
const songVolume = $("#songVolume");
const songProgressFill = $("#songProgressFill");
bgSong.volume = songVolume.value/100;

function syncPlayIcon(){ playBtn.textContent = bgSong.paused ? "▶" : "⏸"; }

let unlocked = false;
function unlockAutoplay(){
  if(unlocked) return;
  unlocked = true;
  bgSong.muted = false;
  const p = bgSong.play();
  if(p && p.catch) p.catch(()=>{ unlocked=false; });
  syncPlayIcon();
}
["click","touchstart","keydown","scroll"].forEach(evt=>{
  window.addEventListener(evt, unlockAutoplay, {passive:true});
});
window.addEventListener("load", ()=>{ bgSong.play().catch(()=>{}); });

playBtn.addEventListener("click", ()=>{
  ensureAudioCtx();
  unlockAutoplay();
  if(bgSong.paused){
    bgSong.play().then(syncPlayIcon).catch(syncPlayIcon);
  } else {
    bgSong.pause(); syncPlayIcon();
  }
});
songVolume.addEventListener("input", ()=> bgSong.volume = songVolume.value/100);
bgSong.addEventListener("timeupdate", ()=>{
  if(bgSong.duration){ songProgressFill.style.width = (bgSong.currentTime/bgSong.duration*100)+"%"; }
});
bgSong.addEventListener("play", syncPlayIcon);
bgSong.addEventListener("pause", syncPlayIcon);
bgSong.addEventListener("ended", syncPlayIcon);

/* click anywhere spawns a little heart burst for delight */
document.addEventListener("click", (e)=>{
  if(e.target.closest("button, a, input")) return;
  for(let i=0;i<3;i++) spawnHeart(e.clientX+rand(-10,10), e.clientY+rand(-10,10));
});

})();

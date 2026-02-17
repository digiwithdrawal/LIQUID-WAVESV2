/* Liquid Waves V2 — From Scratch
   - Ratios: Auto/Portrait/Landscape/Square
   - 40 palettes
   - Sliders: Intensity / Speed / Size / Res
   - Bubble droplet toggle
   - Random changes EVERYTHING (palette + sliders + toggle + seed)
   - Snap photo
   - Record 20 seconds (auto stop)
*/

const $ = (id) => document.getElementById(id);

const screen = $("screen");
const ctx = screen.getContext("2d", { willReadFrequently: false });

const ui = {
  panel: $("panel"),
  hud: $("hud"),
  showHud: $("showHud"),

  format: $("format"),
  palette: $("palette"),
  t_bubbles: $("t_bubbles"),

  s_intensity: $("s_intensity"),
  s_speed: $("s_speed"),
  s_size: $("s_size"),
  s_res: $("s_res"),

  random: $("random"),
  snap: $("snap"),
  rec: $("rec"),

  tip: $("tip"),
};

function clamp(v,a,b){ return Math.max(a, Math.min(b,v)); }
function lerp(a,b,t){ return a + (b-a)*t; }

// ---------- Seeded RNG ----------
let SEED = (Date.now() >>> 0);
function sRand(){
  SEED ^= SEED << 13; SEED >>>= 0;
  SEED ^= SEED >> 17; SEED >>>= 0;
  SEED ^= SEED << 5;  SEED >>>= 0;
  return (SEED >>> 0) / 4294967296;
}
function sRandN(n=1){ return sRand()*n; }

// ---------- 40 Palettes ----------
const PALETTES = [
  // Original 20
  { name:"MAGENTA ORANGE VOID", a:"#ff2bd6", b:"#ff4d00", c:"#2b00ff", d:"#05000a" },
  { name:"CYAN LIME INK",       a:"#00f5ff", b:"#7CFF00", c:"#0033ff", d:"#04070d" },
  { name:"PURPLE TEAL GLOW",    a:"#b100ff", b:"#00ffd5", c:"#ff2b6a", d:"#07020a" },
  { name:"RED BLUE STEEL",      a:"#ff003c", b:"#00a3ff", c:"#f5ff00", d:"#05060a" },
  { name:"NEON CANDY",          a:"#ff3df2", b:"#00ffb3", c:"#ffcc00", d:"#07050a" },
  { name:"SUNSET HEAT",         a:"#ff2b2b", b:"#ffb000", c:"#6a00ff", d:"#09040a" },
  { name:"ELECTRIC LAGOON",     a:"#00d9ff", b:"#00ff6a", c:"#ff00aa", d:"#03060a" },
  { name:"ACID VIOLET",         a:"#b6ff00", b:"#ff00cc", c:"#00b3ff", d:"#06030a" },
  { name:"MOLTEN ROSE",         a:"#ff006a", b:"#ff5a00", c:"#7a00ff", d:"#0a0206" },
  { name:"PLASMA ICE",          a:"#00e5ff", b:"#7a00ff", c:"#ff2bd6", d:"#04040a" },
  { name:"AQUA ORANGE",         a:"#00ffd5", b:"#ff6a00", c:"#003bff", d:"#04040a" },
  { name:"HOT PINK SKY",        a:"#ff2bd6", b:"#00a3ff", c:"#fffb00", d:"#05060a" },
  { name:"NEON RED BLACK",      a:"#ff0033", b:"#ff3300", c:"#9900ff", d:"#000000" },
  { name:"GREEN PHOSPHOR",      a:"#00ff6a", b:"#b6ff00", c:"#00a3ff", d:"#02050a" },
  { name:"BLUEBERRY LAVA",      a:"#2b00ff", b:"#ff2b2b", c:"#ff2bd6", d:"#05020a" },
  { name:"CITRUS CYAN",         a:"#fffb00", b:"#00f5ff", c:"#ff00aa", d:"#05060a" },
  { name:"PURP ORANGE CREAM",   a:"#7a00ff", b:"#ff6a00", c:"#ffd1ff", d:"#07040a" },
  { name:"GASOLINE",            a:"#00ffd5", b:"#ff2bd6", c:"#b6ff00", d:"#02050a" },
  { name:"EMBER ICE",           a:"#ff4d00", b:"#00e5ff", c:"#7a00ff", d:"#05060a" },
  { name:"DEEP NEON",           a:"#ff00aa", b:"#00ffb3", c:"#00a3ff", d:"#02020a" },

  // New 20
  { name:"LAVA LIME",           a:"#ff3b00", b:"#b6ff00", c:"#00ffd5", d:"#070307" },
  { name:"UV TOKYO",            a:"#ff2bd6", b:"#7a00ff", c:"#00f5ff", d:"#05010a" },
  { name:"OIL SLICK",           a:"#00ffb3", b:"#ff00aa", c:"#fffb00", d:"#02040a" },
  { name:"ROYAL HEAT",          a:"#2b00ff", b:"#ff4d00", c:"#fffb00", d:"#06020a" },
  { name:"MINT ROSE",           a:"#00ffd5", b:"#ff6aa2", c:"#7a00ff", d:"#05060a" },
  { name:"HYPER SUN",           a:"#fffb00", b:"#ff4d00", c:"#ff00aa", d:"#04020a" },
  { name:"COLD LASER",          a:"#00a3ff", b:"#00ffd5", c:"#b6ff00", d:"#02050a" },
  { name:"BLOOD ICE",           a:"#ff003c", b:"#00e5ff", c:"#ffffff", d:"#02020a" },
  { name:"GHOST MAGENTA",       a:"#ffd1ff", b:"#ff2bd6", c:"#00f5ff", d:"#03010a" },
  { name:"TOXIC ORCHID",        a:"#b6ff00", b:"#ff2bd6", c:"#7a00ff", d:"#02020a" },
  { name:"SUNSET OCEAN",        a:"#ff6a00", b:"#00a3ff", c:"#00ffd5", d:"#05060a" },
  { name:"BLUE FLAME",          a:"#00e5ff", b:"#003bff", c:"#ff4d00", d:"#02040a" },
  { name:"CANDY APPLE",         a:"#ff0033", b:"#fffb00", c:"#00ff6a", d:"#05060a" },
  { name:"AURORA GLASS",        a:"#00ffd5", b:"#00a3ff", c:"#ff2bd6", d:"#02020a" },
  { name:"PURPLE INFERNO",      a:"#7a00ff", b:"#ff4d00", c:"#ff2bd6", d:"#05010a" },
  { name:"RADAR GREEN",         a:"#00ff6a", b:"#00ffd5", c:"#003bff", d:"#000000" },
  { name:"NEON SAPPHIRE",       a:"#00a3ff", b:"#2b00ff", c:"#ff00aa", d:"#05010a" },
  { name:"MELON SKY",           a:"#ff6aa2", b:"#00f5ff", c:"#fffb00", d:"#05060a" },
  { name:"EMBER VIOLET",        a:"#ff4d00", b:"#7a00ff", c:"#00ffb3", d:"#02020a" },
  { name:"DEEP VOID CANDY",     a:"#ff2bd6", b:"#00ffb3", c:"#ffffff", d:"#000000" },
];

// build palette dropdown
ui.palette.innerHTML = "";
for (let i=0;i<PALETTES.length;i++){
  const opt = document.createElement("option");
  opt.value = String(i);
  opt.textContent = PALETTES[i].name;
  ui.palette.appendChild(opt);
}
ui.palette.value = "0";

// ---------- HUD toggle ----------
let hudHidden = false;
function setHudHidden(v){
  hudHidden = !!v;
  ui.panel.classList.toggle("hidden", hudHidden);
  ui.showHud.classList.toggle("show", hudHidden);
  ui.hud.textContent = hudHidden ? "SHOW" : "HIDE";
}
setHudHidden(false);

// ---------- Ratio sizing ----------
function viewportSize(){
  const vw = Math.floor(window.visualViewport?.width || window.innerWidth);
  const vh = Math.floor(window.visualViewport?.height || window.innerHeight);
  return { vw, vh };
}
function deviceIsLandscape(){
  const { vw, vh } = viewportSize();
  return vw > vh;
}
function chosenMode(){
  const m = ui.format.value;
  if (m === "auto") return deviceIsLandscape() ? "landscape" : "portrait";
  return m;
}
function modeAspect(mode){
  if (mode === "square") return 1;
  if (mode === "landscape") return 16/9;
  const { vw, vh } = viewportSize();
  return clamp(vw / vh, 9/19.5, 9/14);
}

const frame = document.createElement("canvas");
const fctx = frame.getContext("2d", { willReadFrequently:false });

function resizeAll(){
  const { vw, vh } = viewportSize();
  const dpr = Math.min(2, window.devicePixelRatio || 1);

  screen.width = Math.floor(vw * dpr);
  screen.height = Math.floor(vh * dpr);

  const res = parseInt(ui.s_res.value,10); // short side
  const mode = chosenMode();
  const ar = modeAspect(mode);

  let fw, fh;
  if (ar >= 1){ fh = res; fw = Math.round(res * ar); }
  else { fw = res; fh = Math.round(res / ar); }

  frame.width = fw;
  frame.height = fh;

  ui.tip.textContent = `Mode: ${mode.toUpperCase()} • Output: ${fw}×${fh} • Palettes: 40`;
}

function drawFrameToScreen(){
  const SW = screen.width, SH = screen.height;
  const FW = frame.width, FH = frame.height;

  const scale = Math.min(SW/FW, SH/FH);
  const dw = Math.round(FW*scale);
  const dh = Math.round(FH*scale);
  const dx = Math.floor((SW - dw)/2);
  const dy = Math.floor((SH - dh)/2);

  ctx.save();
  ctx.setTransform(1,0,0,1,0,0);
  ctx.imageSmoothingEnabled = true;
  ctx.fillStyle = "#000";
  ctx.fillRect(0,0,SW,SH);
  ctx.drawImage(frame, 0,0,FW,FH, dx,dy,dw,dh);
  ctx.restore();
}

// ---------- Generator state ----------
let droplets = [];
function makeDroplets(){
  droplets = [];
  const size01 = parseInt(ui.s_size.value,10)/100;
  const speed01 = parseInt(ui.s_speed.value,10)/100;

  // number depends on size a bit; more size = slightly fewer but bigger
  const nBase = ui.t_bubbles.checked ? 12 : 0;
  const n = nBase + Math.floor(lerp(10, 4, size01));

  for (let i=0;i<n;i++){
    const r = lerp(0.04, 0.22, size01) * lerp(0.7, 1.3, sRand());
    const vScale = lerp(0.010, 0.085, speed01) * lerp(0.6, 1.4, sRand());
    droplets.push({
      x: sRandN(1),
      y: sRandN(1),
      r,
      vx: (sRand()*2-1) * vScale,
      vy: (sRand()*2-1) * vScale,
      w: lerp(0.7, 1.7, sRand())
    });
  }
}
makeDroplets();

function paletteColors(){
  return PALETTES[parseInt(ui.palette.value,10)];
}

function hexToRgb(h){
  const x = h.replace("#","");
  const n = parseInt(x,16);
  return { r:(n>>16)&255, g:(n>>8)&255, b:n&255 };
}
function mix(a,b,t){
  return {
    r: Math.round(lerp(a.r,b.r,t)),
    g: Math.round(lerp(a.g,b.g,t)),
    b: Math.round(lerp(a.b,b.b,t))
  };
}

const low = document.createElement("canvas");
const lctx = low.getContext("2d", { willReadFrequently:true });

// core field
function fieldValue(nx, ny, time){
  const intensity01 = parseInt(ui.s_intensity.value,10)/100;
  const size01 = parseInt(ui.s_size.value,10)/100;

  // bigger size = lower frequency, thicker blobs
  const wf = lerp(10.5, 2.4, size01) * lerp(0.9, 1.35, intensity01);
  const wa = lerp(0.02, 0.22, intensity01);

  let v = 0;
  v += Math.sin((nx*wf + time*0.9)) * wa;
  v += Math.cos((ny*(wf*0.82) - time*1.15)) * wa;
  v += Math.sin(((nx+ny)*(wf*0.55) + time*0.75)) * (wa*0.85);

  if (ui.t_bubbles.checked){
    for (const d of droplets){
      const dx = nx - d.x;
      const dy = ny - d.y;
      const dist2 = dx*dx + dy*dy + 0.0009;
      // bigger size makes droplets “fatter”
      const blobBoost = lerp(0.08, 0.16, size01);
      v += (d.r*d.r) / dist2 * blobBoost * d.w;
    }
  }
  return v;
}

function render(timeMs){
  const W = frame.width, H = frame.height;

  const intensity01 = parseInt(ui.s_intensity.value,10)/100;
  const speed01 = parseInt(ui.s_speed.value,10)/100;
  const size01 = parseInt(ui.s_size.value,10)/100;

  // speed affects time progression
  const t = (timeMs * 0.001) * lerp(0.25, 2.6, speed01);

  // low-res grid (size controls softness/detail)
  const grid = Math.round(lerp(150, 360, 1 - size01*0.75));
  const LW = grid;
  const LH = Math.max(120, Math.round(grid * (H/W)));

  low.width = LW;
  low.height = LH;

  // update droplets
  if (ui.t_bubbles.checked){
    const dt = 0.016 * lerp(0.35, 2.4, speed01);
    for (const m of droplets){
      m.x += m.vx * dt;
      m.y += m.vy * dt;

      if (m.x < -0.2 || m.x > 1.2) m.vx *= -1;
      if (m.y < -0.2 || m.y > 1.2) m.vy *= -1;
    }
  }

  const p = paletteColors();
  const A = hexToRgb(p.a), B = hexToRgb(p.b), C = hexToRgb(p.c), D = hexToRgb(p.d);

  const img = lctx.createImageData(LW, LH);
  const d = img.data;

  // glow strength
  const glowBase = lerp(18, 90, intensity01);
  const contrast = lerp(1.05, 1.35, intensity01);

  for (let y=0; y<LH; y++){
    const ny = y/(LH-1);
    for (let x=0; x<LW; x++){
      const nx = x/(LW-1);

      let v = fieldValue(nx, ny, t);
      v = 0.5 + v;
      // contrast push
      v = clamp((v - 0.5) * contrast + 0.5, 0, 1);

      let col;
      if (v < 0.33) col = mix(D, A, v/0.33);
      else if (v < 0.66) col = mix(A, B, (v-0.33)/0.33);
      else col = mix(B, C, (v-0.66)/0.34);

      // neon-ish edge glow: strongest near mid values
      const g = Math.abs(v-0.5);
      const glow = clamp((0.40 - g) * 2.0, 0, 1);

      col.r = clamp(col.r + glow*glowBase, 0, 255);
      col.g = clamp(col.g + glow*(glowBase*0.78), 0, 255);
      col.b = clamp(col.b + glow*(glowBase*1.05), 0, 255);

      const i = (y*LW + x)*4;
      d[i] = col.r; d[i+1] = col.g; d[i+2] = col.b; d[i+3] = 255;
    }
  }

  lctx.putImageData(img,0,0);

  // upscale to frame + bloom
  fctx.save();
  fctx.setTransform(1,0,0,1,0,0);
  fctx.imageSmoothingEnabled = true;
  fctx.drawImage(low, 0,0,LW,LH, 0,0,W,H);

  // bloom scales with intensity + size
  const blur = lerp(6, 26, intensity01) * lerp(0.9, 1.25, size01);
  fctx.globalCompositeOperation = "screen";
  fctx.globalAlpha = lerp(0.10, 0.36, intensity01);
  fctx.filter = `blur(${blur}px)`;
  fctx.drawImage(frame,0,0);
  fctx.filter = "none";
  fctx.restore();
}

// ---------- Capture ----------
function snapPhoto(){
  const a = document.createElement("a");
  a.download = `liquidwaves_${new Date().toISOString().replace(/[:.]/g,'-')}.png`;
  a.href = frame.toDataURL("image/png");
  a.click();
}

let recorder = null;
let recChunks = [];
let isRecording = false;
let recTimeout = null;

function pickMimeType(){
  const opts = ["video/webm;codecs=vp9","video/webm;codecs=vp8","video/webm"];
  for (const t of opts) if (MediaRecorder.isTypeSupported(t)) return t;
  return "";
}

async function tryShare(blob){
  try{
    const ext = (blob.type || "").includes("mp4") ? "mp4" : "webm";
    const file = new File([blob], `liquidwaves_${Date.now()}.${ext}`, { type: blob.type || "video/webm" });
    if (navigator.canShare?.({ files:[file] })){
      await navigator.share({ files:[file], title:"Liquid Waves V2" });
      return true;
    }
  }catch(_){}
  return false;
}

function startRecording20(){
  if (!("MediaRecorder" in window)){
    ui.tip.textContent = "Recording not supported in this browser.";
    return;
  }

  try{
    const stream = frame.captureStream(30);
    recorder = new MediaRecorder(stream, { mimeType: pickMimeType() });
    recChunks = [];

    recorder.ondataavailable = (e)=> { if (e.data && e.data.size) recChunks.push(e.data); };
    recorder.onstop = async ()=>{
      const blob = new Blob(recChunks, { type: recorder.mimeType || "video/webm" });

      const shared = await tryShare(blob);
      if (!shared){
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.download = `liquidwaves_${new Date().toISOString().replace(/[:.]/g,'-')}.webm`;
        a.href = url;
        a.click();
        setTimeout(()=>URL.revokeObjectURL(url), 2500);
      }

      ui.tip.textContent = "Saved.";
    };

    recorder.start();
    isRecording = true;
    ui.rec.textContent = "REC…";
    ui.tip.textContent = "Recording 20s…";

    recTimeout = setTimeout(()=> stopRecording(), 20000);
  }catch(err){
    ui.tip.textContent = `REC failed: ${String(err)}`;
  }
}

function stopRecording(){
  if (recTimeout){ clearTimeout(recTimeout); recTimeout = null; }
  if (recorder && isRecording) recorder.stop();
  isRecording = false;
  ui.rec.textContent = "REC 20s";
}

// ---------- Randomize EVERYTHING ----------
function randInt(a,b){ return Math.floor(lerp(a, b+1, sRand())); } // inclusive
function randomizeAll(){
  // new seed
  SEED = (Date.now() ^ (Math.random()*1e9|0)) >>> 0;

  // palette
  ui.palette.value = String(randInt(0, PALETTES.length-1));

  // sliders (biased to look good)
  ui.s_intensity.value = String(randInt(40, 95));
  ui.s_speed.value     = String(randInt(25, 95));
  ui.s_size.value      = String(randInt(15, 90));
  ui.s_res.value       = String(randInt(700, 1400));

  // toggle
  ui.t_bubbles.checked = sRand() > 0.25;

  // rebuild droplets based on new controls
  makeDroplets();

  // force resize recalc
  lastKey = "";
  resizeAll();

  ui.tip.textContent = "Randomized everything.";
}

// ---------- Loop ----------
let lastKey = "";
function loop(ts){
  const key = [
    chosenMode(),
    ui.format.value,
    ui.s_res.value,
    (window.visualViewport?.width||0),
    (window.visualViewport?.height||0),
    ui.t_bubbles.checked ? 1 : 0,
    ui.s_intensity.value,
    ui.s_speed.value,
    ui.s_size.value,
    ui.palette.value
  ].join("|");

  if (key !== lastKey){
    lastKey = key;
    resizeAll();
  }

  render(ts);
  drawFrameToScreen();
  requestAnimationFrame(loop);
}

// ---------- UI wiring ----------
ui.hud.addEventListener("click", ()=> setHudHidden(!hudHidden));
ui.showHud.addEventListener("click", ()=> setHudHidden(false));

ui.snap.addEventListener("click", snapPhoto);
ui.rec.addEventListener("click", ()=> isRecording ? stopRecording() : startRecording20());

ui.random.addEventListener("click", randomizeAll);

ui.t_bubbles.addEventListener("change", ()=> { makeDroplets(); });

ui.s_intensity.addEventListener("input", ()=> {});
ui.s_speed.addEventListener("input", ()=> { makeDroplets(); });
ui.s_size.addEventListener("input", ()=> { makeDroplets(); });

ui.palette.addEventListener("change", ()=> {});
ui.s_res.addEventListener("input", ()=> { lastKey=""; resizeAll(); });
ui.format.addEventListener("change", ()=> { lastKey=""; resizeAll(); });

if (window.visualViewport){
  window.visualViewport.addEventListener("resize", ()=> { lastKey=""; resizeAll(); });
  window.visualViewport.addEventListener("scroll", ()=> { lastKey=""; resizeAll(); });
}
window.addEventListener("orientationchange", ()=> { lastKey=""; resizeAll(); });
window.addEventListener("resize", ()=> { lastKey=""; resizeAll(); });

// init
resizeAll();
requestAnimationFrame(loop);


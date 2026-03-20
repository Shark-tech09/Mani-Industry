// ===== MANI INDUSTRIES — MAIN SCRIPT =====

// ---- PHASE 1: LOADING ANIMATION ----
const loadingCanvas = document.getElementById('loadingCanvas');
const lCtx = loadingCanvas.getContext('2d');
const ringFill = document.getElementById('ringFill');
const percentText = document.getElementById('percentText');
const CIRCUMFERENCE = 502.65;

let nodes = [], connections = [], progress = 0;
let loadingDone = false;

function resizeCanvas(canvas) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas(loadingCanvas);

// Create nodes
function createNodes() {
  nodes = [];
  const cx = loadingCanvas.width / 2;
  const cy = loadingCanvas.height / 2;
  for (let i = 0; i < 30; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 80 + Math.random() * 200;
    nodes.push({
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
      r: Math.random() * 3 + 1,
      alpha: 0,
      maxAlpha: Math.random() * 0.8 + 0.2,
      alive: 0,
      maxAlive: 60 + Math.floor(Math.random() * 100),
      delay: Math.random() * 120
    });
  }
}

function getAccentColor() {
  const root = document.documentElement;
  const theme = document.body.dataset.theme || 'blue';
  const colors = {
    blue: '#00c8ff', red: '#ff3366', orange: '#ff6b35',
    yellow: '#ffd700', green: '#00ff88', purple: '#8b5cf6',
    pink: '#ec4899', brown: '#c2855a', dark: '#aaaaaa'
  };
  return colors[theme] || '#00c8ff';
}

let frameCount = 0;
function animateLoading() {
  if (loadingDone) return;
  frameCount++;
  lCtx.clearRect(0, 0, loadingCanvas.width, loadingCanvas.height);

  const accent = getAccentColor();
  const cx = loadingCanvas.width / 2;
  const cy = loadingCanvas.height / 2;

  // Draw connections between nearby nodes
  nodes.forEach((n, i) => {
    if (n.alpha < 0.1) return;
    nodes.slice(i + 1).forEach(m => {
      if (m.alpha < 0.1) return;
      const dist = Math.hypot(n.x - m.x, n.y - m.y);
      if (dist < 120) {
        const alpha = (1 - dist / 120) * Math.min(n.alpha, m.alpha) * 0.4;
        lCtx.beginPath();
        lCtx.moveTo(n.x, n.y);
        lCtx.lineTo(m.x, m.y);
        lCtx.strokeStyle = hexToRgba(accent, alpha);
        lCtx.lineWidth = 0.5;
        lCtx.stroke();
      }
    });
  });

  // Animate nodes
  nodes.forEach(n => {
    if (frameCount < n.delay) return;
    n.alive++;
    const half = n.maxAlive / 2;
    if (n.alive < half) n.alpha = (n.alive / half) * n.maxAlpha;
    else n.alpha = ((n.maxAlive - n.alive) / half) * n.maxAlpha;
    if (n.alive >= n.maxAlive) {
      // respawn
      const angle = Math.random() * Math.PI * 2;
      const radius = 80 + Math.random() * 200;
      n.x = cx + Math.cos(angle) * radius;
      n.y = cy + Math.sin(angle) * radius;
      n.alive = 0; n.alpha = 0;
      n.maxAlive = 60 + Math.floor(Math.random() * 100);
      n.delay = 0;
    }
    lCtx.beginPath();
    lCtx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
    lCtx.fillStyle = hexToRgba(accent, n.alpha);
    lCtx.shadowBlur = 10;
    lCtx.shadowColor = accent;
    lCtx.fill();
    lCtx.shadowBlur = 0;
  });

  requestAnimationFrame(animateLoading);
}

function hexToRgba(hex, alpha) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// Progress counter
function runProgress() {
  createNodes();
  animateLoading();
  let pct = 0;
  const interval = setInterval(() => {
    pct++;
    progress = pct;
    percentText.textContent = pct + '%';
    const offset = CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE;
    ringFill.style.strokeDashoffset = offset;
    if (pct >= 100) {
      clearInterval(interval);
      setTimeout(phase2, 400);
    }
  }, 25);
}

// ---- PHASE 2: LOGO APPEARANCE ----
function phase2() {
  loadingDone = true;
  lCtx.clearRect(0, 0, loadingCanvas.width, loadingCanvas.height);
  document.getElementById('loadingCenter').style.transition = 'opacity 0.5s';
  document.getElementById('loadingCenter').style.opacity = '0';

  const logoEl = document.getElementById('loadingLogo');
  logoEl.style.display = 'flex';
  logoEl.style.opacity = '0';
  logoEl.style.transition = 'opacity 0.6s, transform 1.5s cubic-bezier(0.16,1,0.3,1)';
  logoEl.style.transform = 'scale(0.5)';

  setTimeout(() => {
    logoEl.style.opacity = '1';
    logoEl.style.transform = 'scale(1)';
  }, 100);

  // After logo shows, pulse then fade
  setTimeout(() => {
    logoEl.style.transition = 'opacity 0.8s, transform 0.8s';
    logoEl.style.opacity = '0';
    document.getElementById('loadingCenter').style.opacity = '0';
    setTimeout(phase3, 900);
  }, 1800);
}


// ---- PHASE 3: FUTURISTIC CITY ANIMATION (2-3 seconds total) ----
const genCanvas = document.getElementById('genCanvas');
const gCtx = genCanvas.getContext('2d');
let genAnimating = false;
let genFrame = 0;
let cityState = null;

function resizeGen() {
  genCanvas.width = window.innerWidth;
  genCanvas.height = window.innerHeight;
}

function phase3() {
  document.getElementById('loadingCenter').style.display = 'none';
  document.getElementById('loadingLogo').style.display = 'none';
  document.getElementById('generativeCanvas').style.display = 'block';
  resizeGen();
  genAnimating = true;
  genFrame = 0;
  buildCity();
  requestAnimationFrame(animateGen);
}

// Build all city data upfront (no per-segment drawing)
function buildCity() {
  const W = genCanvas.width, H = genCanvas.height;
  const cx = W / 2, groundY = H * 0.72;

  // Buildings — pre-defined positions for guaranteed full-width skyline
  const buildings = [
    { x: cx - 380, w: 50, h: 160, type: 0 },
    { x: cx - 320, w: 55, h: 210, type: 2 },
    { x: cx - 255, w: 60, h: 270, type: 1 },
    { x: cx - 185, w: 70, h: 230, type: 0 },
    { x: cx - 105, w: 85, h: 370, type: 2 },
    { x: cx - 10,  w: 90, h: 410, type: 1 },
    { x: cx + 90,  w: 80, h: 380, type: 3 },
    { x: cx + 180, w: 65, h: 290, type: 0 },
    { x: cx + 255, w: 58, h: 230, type: 2 },
    { x: cx + 323, w: 50, h: 170, type: 0 },
    { x: cx + 383, w: 45, h: 130, type: 0 },
    // Background layer (shorter, behind)
    { x: cx - 430, w: 42, h: 100, type: 0, bg: true },
    { x: cx + 430, w: 42, h: 110, type: 0, bg: true },
  ];

  // Elevated bridges between tall neighbors
  const bridges = [
    { x1: cx - 105 + 85, x2: cx - 10,     y: groundY - 240 },
    { x1: cx - 10  + 90, x2: cx + 90,     y: groundY - 280 },
    { x1: cx + 90  + 80, x2: cx + 180,    y: groundY - 200 },
    { x1: cx - 255 + 60, x2: cx - 185,    y: groundY - 160 },
  ];

  // Drones (moving dots with trails)
  const drones = Array.from({ length: 14 }, () => ({
    x: cx - 380 + Math.random() * 760,
    y: groundY - 80 - Math.random() * 320,
    vx: (Math.random() - 0.5) * 2.5,
    vy: (Math.random() - 0.5) * 1.0,
    trail: [],
    size: 2 + Math.random() * 2
  }));

  // Road vehicles
  const vehicles = Array.from({ length: 18 }, (_, i) => ({
    x: cx - 420 + (i / 18) * 840,
    y: groundY + 7 + (i % 3) * 14,
    vx: (i % 2 === 0 ? 1 : -1) * (1.2 + Math.random() * 1.2),
    size: 3
  }));

  // Energy node network
  const enodes = Array.from({ length: 22 }, () => ({
    x: cx - 400 + Math.random() * 800,
    y: groundY - 50 - Math.random() * 360,
    r: 2.5 + Math.random() * 3,
    pulse: Math.random() * Math.PI * 2
  }));

  // Horizontal data streams
  const dataFlows = Array.from({ length: 25 }, () => ({
    x: cx - 400 + Math.random() * 800,
    y: groundY - 30 - Math.random() * 340,
    progress: Math.random(),
    speed: 0.005 + Math.random() * 0.01,
    len: 0.06 + Math.random() * 0.12,
    alpha: 0.4 + Math.random() * 0.4,
    range: 150 + Math.random() * 150
  }));

  // Stars
  const stars = Array.from({ length: 70 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H * 0.55,
    r: Math.random() * 1.3,
    alpha: 0.1 + Math.random() * 0.45,
    twinkle: Math.random() * Math.PI * 2
  }));

  cityState = {
    buildings, bridges, drones, vehicles, enodes, dataFlows, stars,
    groundY, W, H, cx,
    reveal: 0,       // 0→1 drives the entire city appearance
    holdTimer: 0,
    dissolve: 0,
    phase: 'draw'    // draw | hold | dissolve | done
  };
}

// Draw one building based on reveal ratio (0=ground, 1=roof fully shown)
function drawBuilding(b, groundY, revealRatio, accentHex, dissolveShift) {
  if (revealRatio <= 0) return;
  const ds = dissolveShift || 0;
  const drawnH = b.h * revealRatio;
  const top = groundY - drawnH;
  const bx = b.x + ds;
  const alpha = b.bg ? 0.25 : 0.75;

  gCtx.strokeStyle = hexToRgba(accentHex, alpha);
  gCtx.lineWidth = b.bg ? 0.7 : 1.1;
  gCtx.shadowBlur = b.bg ? 0 : 5;
  gCtx.shadowColor = accentHex;

  // Walls
  gCtx.beginPath(); gCtx.moveTo(bx, groundY); gCtx.lineTo(bx, top); gCtx.stroke();
  gCtx.beginPath(); gCtx.moveTo(bx + b.w, groundY); gCtx.lineTo(bx + b.w, top); gCtx.stroke();
  // Roof
  gCtx.beginPath(); gCtx.moveTo(bx, top); gCtx.lineTo(bx + b.w, top); gCtx.stroke();

  if (b.bg) { gCtx.shadowBlur = 0; return; }

  if (b.type === 1) {
    // Twisted floors
    const floorStep = 26;
    const floors = Math.floor(drawnH / floorStep);
    for (let f = 0; f <= floors; f++) {
      const fy = groundY - f * floorStep;
      const twist = Math.sin(f * 0.4) * 7;
      gCtx.beginPath(); gCtx.moveTo(bx + twist, fy); gCtx.lineTo(bx + b.w + twist, fy); gCtx.stroke();
      // Windows
      if (f < floors && b.w > 40) {
        gCtx.globalAlpha = 0.3;
        for (let wi = 0; wi < 3; wi++) {
          const wx = bx + 6 + twist + wi * (b.w - 12) / 3;
          gCtx.strokeRect(wx, fy - 20, (b.w - 16) / 3 - 2, 12);
        }
        gCtx.globalAlpha = 1;
      }
    }
  } else if (b.type === 2) {
    // Tapered (Shanghai-style)
    const floorStep = 28;
    const totalFloors = Math.ceil(b.h / floorStep);
    const floors = Math.floor(drawnH / floorStep);
    for (let f = 0; f <= floors; f++) {
      const fy = groundY - f * floorStep;
      const taper = (f / totalFloors) * b.w * 0.28;
      gCtx.beginPath(); gCtx.moveTo(bx + taper / 2, fy); gCtx.lineTo(bx + b.w - taper / 2, fy); gCtx.stroke();
    }
    if (revealRatio > 0.92) {
      gCtx.beginPath(); gCtx.moveTo(bx + b.w / 2, top); gCtx.lineTo(bx + b.w / 2, top - 28); gCtx.stroke();
      gCtx.beginPath(); gCtx.moveTo(bx + b.w / 2 - 8, top - 14); gCtx.lineTo(bx + b.w / 2 + 8, top - 14); gCtx.stroke();
    }
  } else if (b.type === 3) {
    // Ring building (research hub)
    const floorStep = 30;
    const floors = Math.floor(drawnH / floorStep);
    for (let f = 0; f <= floors; f++) {
      const fy = groundY - f * floorStep;
      gCtx.beginPath(); gCtx.moveTo(bx, fy); gCtx.lineTo(bx + b.w, fy); gCtx.stroke();
    }
    if (revealRatio > 0.75) {
      const ringA = Math.min(1, (revealRatio - 0.75) / 0.25);
      const ringR = b.w * 0.55;
      const ringCx = bx + b.w / 2;
      const ringCy = top - ringR - 8;
      gCtx.globalAlpha = ringA;
      gCtx.beginPath(); gCtx.arc(ringCx, ringCy, ringR, 0, Math.PI * 2); gCtx.stroke();
      gCtx.globalAlpha = ringA * 0.3;
      gCtx.beginPath(); gCtx.arc(ringCx, ringCy, ringR * 0.5, 0, Math.PI * 2); gCtx.stroke();
      // Rotating inner ring effect
      const rot = genFrame * 0.015;
      gCtx.globalAlpha = ringA * 0.5;
      gCtx.beginPath();
      gCtx.arc(ringCx, ringCy, ringR * 0.75, rot, rot + Math.PI * 0.6); gCtx.stroke();
      gCtx.globalAlpha = 1;
    }
    // Vertical garden lines
    gCtx.globalAlpha = 0.12;
    for (let li = 1; li < 5; li++) {
      const lx = bx + li * b.w / 5;
      gCtx.beginPath(); gCtx.moveTo(lx, groundY); gCtx.lineTo(lx, top); gCtx.stroke();
    }
    gCtx.globalAlpha = 1;
  } else {
    // Standard grid building
    const floorStep = 26;
    const floors = Math.floor(drawnH / floorStep);
    for (let f = 0; f <= floors; f++) {
      const fy = groundY - f * floorStep;
      gCtx.beginPath(); gCtx.moveTo(bx, fy); gCtx.lineTo(bx + b.w, fy); gCtx.stroke();
      if (f < floors && b.w > 36) {
        gCtx.globalAlpha = 0.28;
        const cols = Math.max(1, Math.floor(b.w / 18));
        for (let c = 0; c < cols; c++) {
          const wx = bx + 5 + c * (b.w - 8) / cols;
          gCtx.strokeRect(wx, fy - 20, (b.w - 14) / cols - 2, 12);
        }
        gCtx.globalAlpha = 1;
      }
    }
    // Rooftop feature
    if (revealRatio > 0.9) {
      gCtx.beginPath(); gCtx.moveTo(bx + b.w / 2, top); gCtx.lineTo(bx + b.w / 2, top - 22); gCtx.stroke();
    }
  }
  gCtx.shadowBlur = 0;
}

function animateGen() {
  if (!genAnimating) return;
  const s = cityState;
  const accent = getAccentColor();
  genFrame++;

  gCtx.clearRect(0, 0, s.W, s.H);

  // Phase progression
  if (s.phase === 'draw') {
    s.reveal = Math.min(1, s.reveal + 0.014); // ~72 frames ≈ 1.2s
    if (s.reveal >= 1) s.phase = 'hold';
  } else if (s.phase === 'hold') {
    s.holdTimer++;
    if (s.holdTimer > 85) s.phase = 'dissolve'; // ~1.4s hold
  } else if (s.phase === 'dissolve') {
    s.dissolve += 0.028; // ~1.1s dissolve
    if (s.dissolve >= 1) { s.phase = 'done'; startFinalTransition(); return; }
  }

  const rev = s.reveal;
  const dAlpha = s.phase === 'dissolve' ? Math.max(0, 1 - s.dissolve) : 1;
  const dShift = s.phase === 'dissolve' ? s.dissolve * 25 : 0;

  // Sky gradient
  const sky = gCtx.createLinearGradient(0, 0, 0, s.H);
  sky.addColorStop(0, `rgba(2,6,14,${dAlpha})`);
  sky.addColorStop(0.6, `rgba(4,10,22,${dAlpha})`);
  sky.addColorStop(1, `rgba(6,14,28,${dAlpha})`);
  gCtx.fillStyle = sky;
  gCtx.fillRect(0, 0, s.W, s.H);

  // Stars
  s.stars.forEach(st => {
    st.twinkle += 0.025;
    gCtx.beginPath();
    gCtx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
    gCtx.fillStyle = hexToRgba('#e8f4ff', st.alpha * (0.5 + 0.5 * Math.sin(st.twinkle)) * dAlpha);
    gCtx.fill();
  });

  // City glow haze
  const haze = gCtx.createRadialGradient(s.cx, s.groundY, 0, s.cx, s.groundY, 450);
  haze.addColorStop(0, hexToRgba(accent, 0.07 * dAlpha));
  haze.addColorStop(1, 'transparent');
  gCtx.fillStyle = haze;
  gCtx.fillRect(0, 0, s.W, s.H);

  gCtx.globalAlpha = dAlpha;

  // --- ROADS (appear first: rev 0.0 → 0.15) ---
  if (rev > 0.02) {
    const rA = Math.min(1, (rev - 0.02) / 0.13);
    gCtx.globalAlpha = rA * dAlpha;
    gCtx.strokeStyle = hexToRgba(accent, 0.35);
    gCtx.lineWidth = 1;
    // Main road
    gCtx.beginPath(); gCtx.moveTo(s.cx - 440 + dShift, s.groundY); gCtx.lineTo(s.cx + 440 + dShift, s.groundY); gCtx.stroke();
    for (let lane = 1; lane <= 3; lane++) {
      gCtx.beginPath(); gCtx.moveTo(s.cx - 440, s.groundY + lane * 13); gCtx.lineTo(s.cx + 440, s.groundY + lane * 13); gCtx.stroke();
    }
    // Dashed lane dividers
    gCtx.setLineDash([10, 15]);
    for (let d = -4; d <= 4; d++) {
      gCtx.beginPath(); gCtx.moveTo(s.cx + d * 100, s.groundY); gCtx.lineTo(s.cx + d * 100, s.groundY + 40); gCtx.stroke();
    }
    gCtx.setLineDash([]);
    gCtx.globalAlpha = dAlpha;
  }

  // --- BUILDINGS (staggered: each starts at slightly different rev) ---
  s.buildings.forEach((b, i) => {
    const start = b.bg ? 0.06 : 0.08 + (i / s.buildings.length) * 0.28;
    const bRev = Math.max(0, Math.min(1, (rev - start) / 0.5));
    if (bRev > 0) {
      gCtx.globalAlpha = dAlpha;
      drawBuilding(b, s.groundY, bRev, accent, dShift);
    }
  });
  gCtx.globalAlpha = dAlpha;

  // --- BRIDGES (rev 0.55+) ---
  if (rev > 0.55) {
    const bA = Math.min(1, (rev - 0.55) / 0.18) * dAlpha;
    gCtx.globalAlpha = bA;
    gCtx.strokeStyle = hexToRgba(accent, 0.65);
    gCtx.lineWidth = 1;
    s.bridges.forEach(br => {
      gCtx.beginPath(); gCtx.moveTo(br.x1 + dShift, br.y); gCtx.lineTo(br.x2 + dShift, br.y); gCtx.stroke();
      // Suspension curve
      const mx = (br.x1 + br.x2) / 2 + dShift;
      gCtx.beginPath(); gCtx.moveTo(br.x1 + dShift, br.y);
      gCtx.quadraticCurveTo(mx, br.y - 20, br.x2 + dShift, br.y);
      gCtx.globalAlpha = bA * 0.4; gCtx.stroke(); gCtx.globalAlpha = bA;
      // Vertical hangers
      for (let hx = br.x1 + 12; hx < br.x2; hx += 18) {
        gCtx.beginPath(); gCtx.moveTo(hx + dShift, br.y); gCtx.lineTo(hx + dShift, br.y + 8); gCtx.stroke();
      }
    });
    gCtx.globalAlpha = dAlpha;
  }

  // --- ENERGY NODES (rev 0.45+) ---
  if (rev > 0.45) {
    const nA = Math.min(1, (rev - 0.45) / 0.25);
    s.enodes.forEach(n => {
      n.pulse += 0.05;
      const pa = (0.45 + 0.55 * Math.sin(n.pulse)) * nA * dAlpha;
      gCtx.beginPath(); gCtx.arc(n.x + dShift * 0.5, n.y, n.r, 0, Math.PI * 2);
      gCtx.strokeStyle = hexToRgba(accent, pa);
      gCtx.lineWidth = 1;
      gCtx.shadowBlur = 8; gCtx.shadowColor = accent; gCtx.stroke(); gCtx.shadowBlur = 0;
      // Connect to nearest 2 nodes
      let nearest = s.enodes.filter(m => m !== n).map(m => ({ m, d: Math.hypot(n.x - m.x, n.y - m.y) })).sort((a, b) => a.d - b.d).slice(0, 2);
      nearest.forEach(({ m, d }) => {
        if (d < 140) {
          gCtx.beginPath(); gCtx.moveTo(n.x + dShift * 0.5, n.y); gCtx.lineTo(m.x + dShift * 0.5, m.y);
          gCtx.strokeStyle = hexToRgba(accent, (1 - d / 140) * 0.18 * nA * dAlpha);
          gCtx.lineWidth = 0.5; gCtx.stroke();
        }
      });
    });
  }

  // --- DATA FLOWS (rev 0.35+) ---
  if (rev > 0.35) {
    const dfA = Math.min(1, (rev - 0.35) / 0.2);
    gCtx.lineWidth = 1.5;
    s.dataFlows.forEach(df => {
      df.progress += df.speed;
      if (df.progress > 1 + df.len) df.progress = 0;
      const x1 = df.x - df.range / 2;
      const head = x1 + df.range * df.progress;
      const tail = head - df.range * df.len;
      const grad = gCtx.createLinearGradient(tail + dShift, df.y, head + dShift, df.y);
      grad.addColorStop(0, hexToRgba(accent, 0));
      grad.addColorStop(1, hexToRgba(accent, df.alpha * dfA * dAlpha));
      gCtx.beginPath();
      gCtx.moveTo(Math.max(df.x - df.range / 2, tail) + dShift, df.y);
      gCtx.lineTo(Math.min(df.x + df.range / 2, head) + dShift, df.y);
      gCtx.strokeStyle = grad; gCtx.stroke();
    });
  }

  // --- DRONES (rev 0.65+) ---
  if (rev > 0.65) {
    const drA = Math.min(1, (rev - 0.65) / 0.2) * dAlpha;
    s.drones.forEach(drone => {
      drone.x += drone.vx; drone.y += drone.vy;
      if (drone.x < s.cx - 450 || drone.x > s.cx + 450) drone.vx *= -1;
      if (drone.y < s.groundY - 400 || drone.y > s.groundY - 30) drone.vy *= -1;
      drone.trail.push({ x: drone.x + dShift * 0.7, y: drone.y });
      if (drone.trail.length > 14) drone.trail.shift();
      drone.trail.forEach((pt, i) => {
        gCtx.beginPath(); gCtx.arc(pt.x, pt.y, drone.size * 0.35, 0, Math.PI * 2);
        gCtx.fillStyle = hexToRgba(accent, (i / drone.trail.length) * 0.28 * drA);
        gCtx.fill();
      });
      gCtx.beginPath(); gCtx.arc(drone.x + dShift * 0.7, drone.y, drone.size, 0, Math.PI * 2);
      gCtx.fillStyle = hexToRgba(accent, 0.92 * drA);
      gCtx.shadowBlur = 10; gCtx.shadowColor = accent; gCtx.fill(); gCtx.shadowBlur = 0;
    });
  }

  // --- VEHICLES (rev 0.2+) ---
  if (rev > 0.2) {
    const vA = Math.min(1, (rev - 0.2) / 0.15) * dAlpha;
    s.vehicles.forEach(v => {
      v.x += v.vx;
      if (v.x < s.cx - 450) v.x = s.cx + 450;
      if (v.x > s.cx + 450) v.x = s.cx - 450;
      gCtx.beginPath(); gCtx.arc(v.x + dShift, v.y, v.size, 0, Math.PI * 2);
      gCtx.fillStyle = hexToRgba(accent, 0.75 * vA);
      gCtx.shadowBlur = 6; gCtx.shadowColor = accent; gCtx.fill(); gCtx.shadowBlur = 0;
      gCtx.beginPath(); gCtx.moveTo(v.x + dShift, v.y);
      gCtx.lineTo(v.x + dShift - v.vx * 12, v.y);
      gCtx.strokeStyle = hexToRgba(accent, 0.22 * vA); gCtx.lineWidth = 1; gCtx.stroke();
    });
  }

  // --- LABEL ---
  if (rev > 0.88 && s.phase !== 'dissolve') {
    const lA = Math.min(1, (rev - 0.88) / 0.12) * dAlpha;
    gCtx.globalAlpha = lA;
    gCtx.font = '600 11px "Orbitron", monospace';
    gCtx.fillStyle = hexToRgba(accent, 0.55);
    gCtx.textAlign = 'center';
    gCtx.fillText('MANI INDUSTRIES — INTELLIGENT CITY NETWORK', s.cx, s.groundY + 58);
  }

  gCtx.globalAlpha = 1;
  requestAnimationFrame(animateGen);
}
function startFinalTransition() {
  genAnimating = false;
  // Fade out loading screen and show main site
  const ls = document.getElementById('loadingScreen');
  ls.style.transition = 'opacity 1s ease';
  ls.style.opacity = '0';
  setTimeout(() => {
    ls.style.display = 'none';
    document.getElementById('mainSite').style.opacity = '1';
    document.getElementById('mainSite').style.pointerEvents = 'auto';
    document.getElementById('mainSite').style.transition = 'opacity 0.8s ease';
    initHeroCanvas();
    // Animate nav logo in
    const nl = document.getElementById('navLogo');
    nl.style.animation = 'logoEntrance 0.8s ease both';
  }, 1000);
}

// ---- HERO CANVAS (subtle background particles) ----
let heroCanvas, hCtx, heroParticles = [];

function initHeroCanvas() {
  heroCanvas = document.getElementById('heroCanvas');
  if (!heroCanvas) return;
  heroCanvas.width = heroCanvas.offsetWidth;
  heroCanvas.height = heroCanvas.offsetHeight;
  hCtx = heroCanvas.getContext('2d');
  for (let i = 0; i < 60; i++) {
    heroParticles.push({
      x: Math.random() * heroCanvas.width,
      y: Math.random() * heroCanvas.height,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.4 + 0.1
    });
  }
  animateHero();
}

function animateHero() {
  if (!hCtx) return;
  hCtx.clearRect(0, 0, heroCanvas.width, heroCanvas.height);
  const accent = getAccentColor();
  heroParticles.forEach(p => {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0) p.x = heroCanvas.width;
    if (p.x > heroCanvas.width) p.x = 0;
    if (p.y < 0) p.y = heroCanvas.height;
    if (p.y > heroCanvas.height) p.y = 0;
    hCtx.beginPath();
    hCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    hCtx.fillStyle = hexToRgba(accent, p.alpha);
    hCtx.fill();
  });
  heroParticles.forEach((p, i) => {
    heroParticles.slice(i+1).forEach(q => {
      const d = Math.hypot(p.x - q.x, p.y - q.y);
      if (d < 100) {
        hCtx.beginPath();
        hCtx.moveTo(p.x, p.y);
        hCtx.lineTo(q.x, q.y);
        hCtx.strokeStyle = hexToRgba(accent, (1 - d/100) * 0.08);
        hCtx.lineWidth = 0.5;
        hCtx.stroke();
      }
    });
  });
  requestAnimationFrame(animateHero);
}

// ---- THEME SWITCHER ----
const themeBtn = document.getElementById('themeBtn');
const themeDropdown = document.getElementById('themeDropdown');

themeBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  themeDropdown.classList.toggle('open');
});

document.querySelectorAll('.theme-option').forEach(btn => {
  btn.addEventListener('click', () => {
    const theme = btn.dataset.theme;
    document.body.dataset.theme = theme;
    document.querySelectorAll('.theme-option').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    themeDropdown.classList.remove('open');
  });
});

document.addEventListener('click', () => themeDropdown.classList.remove('open'));

// ---- AUTH MODAL ----
function openModal(tab = 'signin') {
  const modal = document.getElementById('authModal');
  modal.classList.add('open');
  switchTab(tab);
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  document.getElementById('authModal').classList.remove('open');
  document.body.style.overflow = '';
}
function switchTab(tab) {
  document.getElementById('signinForm').style.display = tab === 'signin' ? 'block' : 'none';
  document.getElementById('signupForm').style.display = tab === 'signup' ? 'block' : 'none';
  document.getElementById('forgotForm').style.display = 'none';
  document.getElementById('signinTab').classList.toggle('active', tab === 'signin');
  document.getElementById('signupTab').classList.toggle('active', tab === 'signup');
}
function showForgot() {
  document.getElementById('signinForm').style.display = 'none';
  document.getElementById('forgotForm').style.display = 'block';
}

// Close modal on overlay click
document.getElementById('authModal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

function togglePwd(id) {
  const input = document.getElementById(id);
  input.type = input.type === 'password' ? 'text' : 'password';
}

function previewProfile(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = e => {
      const img = document.getElementById('profilePreview');
      img.src = e.target.result;
      img.style.display = 'block';
    };
    reader.readAsDataURL(input.files[0]);
  }
}

// ======================================================
// FIREBASE — config & init moved to firebase-config.js
// auth, db, storage, rtdb are already available globally
// ======================================================

// Hook auth state to nav updates (firebase-config.js handles init)
if (typeof auth !== 'undefined' && auth) {
  auth.onAuthStateChanged(user => {
    if (user) updateNavForLoggedInUser(user);
    else updateNavForLoggedOutUser();
  });
}

function updateNavForLoggedInUser(user) {
  const name = user.displayName || user.email.split('@')[0] || 'User';
  const initials = name.charAt(0).toUpperCase();
  // Hide icon, show chip
  const profileBtn = document.getElementById('profileBtn');
  const chip = document.getElementById('userNavChip');
  if (profileBtn) profileBtn.style.display = 'none';
  if (chip) {
    chip.style.display = 'flex';
    const avatar = document.getElementById('userNavAvatar');
    const nameEl = document.getElementById('userNavName');
    if (avatar) avatar.innerHTML = user.photoURL ? '<img src="' + user.photoURL + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%">' : initials;
    if (nameEl) nameEl.textContent = name;
  }
  // Populate dropdown
  const ddAvatar = document.getElementById('profileDdAvatar');
  const ddName   = document.getElementById('profileDdName');
  const ddEmail  = document.getElementById('profileDdEmail');
  if (ddAvatar) ddAvatar.innerHTML = user.photoURL ? '<img src="' + user.photoURL + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%">' : initials;
  if (ddName)  ddName.textContent  = name;
  if (ddEmail) ddEmail.textContent = user.email || '';
}
function updateNavForLoggedOutUser() {
  const profileBtn = document.getElementById('profileBtn');
  const chip = document.getElementById('userNavChip');
  if (profileBtn) { profileBtn.style.display = 'flex'; profileBtn.onclick = () => openModal('signin'); }
  if (chip) chip.style.display = 'none';
  const dd = document.getElementById('profileDropdown');
  if (dd) dd.style.display = 'none';
}

// ---- SIGN IN ----
function handleSignIn() {
  if (!auth) { showToast('Add your Firebase config in script.js first!', 'warn'); return; }
  const inputs = document.querySelectorAll('#signinForm .form-input');
  const email = inputs[0].value.trim();
  const password = inputs[1].value.trim();
  if (!email || !password) { showToast('Please fill all fields', 'warn'); return; }
  const btn = document.querySelector('#signinForm .btn-primary');
  btn.textContent = 'Signing in...'; btn.disabled = true;
  auth.signInWithEmailAndPassword(email, password)
    .then(cred => {
      showToast('Welcome back, ' + (cred.user.displayName || cred.user.email) + '!', 'success');
      closeModal();
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 800);
    })
    .catch(err => {
      const msgs = { 'auth/user-not-found':'No account with this email.','auth/wrong-password':'Incorrect password.','auth/invalid-email':'Invalid email address.','auth/too-many-requests':'Too many attempts. Try later.' };
      showToast((msgs[err.code] || err.message), 'error');
    })
    .finally(() => { btn.textContent = 'Sign In'; btn.disabled = false; });
}

// ---- SIGN UP ----
function handleSignUp() {
  if (!auth) { showToast('Add your Firebase config in script.js first!', 'warn'); return; }
  const inputs = document.querySelectorAll('#signupForm .form-input');
  const username = inputs[0].value.trim();
  const email = inputs[1].value.trim();
  const password = inputs[2].value.trim();
  const phone = inputs[3].value.trim();
  const country = inputs[4].value;
  const state = inputs[5].value.trim();
  const pin = inputs[6].value.trim();
  if (!username || !email || !password) { showToast('Please fill required fields', 'warn'); return; }
  if (password.length < 6) { showToast('Password must be at least 6 characters', 'warn'); return; }
  const btn = document.querySelector('#signupForm .btn-primary');
  btn.textContent = 'Creating account...'; btn.disabled = true;
  auth.createUserWithEmailAndPassword(email, password)
    .then(cred => {
      cred.user.updateProfile({ displayName: username });
      if (db) db.collection('users').doc(cred.user.uid).set({ username, email, phone, country, state, pin, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
      showToast('Account created! Welcome to Mani Industries!', 'success');
      closeModal();
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 800);
    })
    .catch(err => {
      const msgs = { 'auth/email-already-in-use':'Email already registered.','auth/invalid-email':'Invalid email.','auth/weak-password':'Password too weak.' };
      showToast((msgs[err.code] || err.message), 'error');
    })
    .finally(() => { btn.textContent = 'Create Account'; btn.disabled = false; });
}

// ---- FORGOT PASSWORD ----
function handleForgot() {
  if (!auth) { showToast('Add your Firebase config in script.js first!', 'warn'); return; }
  const email = document.getElementById('resetEmail').value.trim();
  if (!email) { showToast('Enter your email address', 'warn'); return; }
  auth.sendPasswordResetEmail(email)
    .then(() => showToast('Reset link sent! Check your email.', 'success'))
    .catch(err => showToast(err.message, 'error'));
}


// ---- TOAST NOTIFICATION ----
function showToast(msg, type = 'info') {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  toast.style.cssText = `
    position:fixed; bottom:2rem; right:2rem; z-index:9999;
    background:var(--bg3); border:1px solid var(--accent);
    color:var(--text); padding:1rem 1.5rem; border-radius:10px;
    font-family:'Rajdhani',sans-serif; font-size:0.95rem;
    box-shadow:0 10px 40px rgba(0,0,0,0.4);
    animation:slideUp 0.3s ease;
  `;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.4s'; setTimeout(() => toast.remove(), 400); }, 3000);
}

// ---- NAV PROFILE BTN ----
document.getElementById('profileBtn').addEventListener('click', () => openModal('signin'));

// ---- HAMBURGER MENU ----
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});
function closeMobileMenu() { mobileMenu.classList.remove('open'); }

// ---- NAV SCROLL EFFECT ----
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (window.scrollY > 50) {
    navbar.style.boxShadow = '0 4px 30px rgba(0,0,0,0.4)';
  } else {
    navbar.style.boxShadow = 'none';
  }
  // Update active nav link
  const sections = ['home', 'about', 'programs', 'footer'];
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.top <= 100 && rect.bottom > 100) {
      document.querySelectorAll('.nav-link').forEach(a => a.classList.remove('active'));
      const link = document.querySelector(`.nav-link[href="#${id}"]`);
      if (link) link.classList.add('active');
    }
  });
});

// ---- RESIZE ----
window.addEventListener('resize', () => {
  resizeCanvas(loadingCanvas);
  resizeGen();
  if (heroCanvas) {
    heroCanvas.width = heroCanvas.offsetWidth;
    heroCanvas.height = heroCanvas.offsetHeight;
  }
});

// ---- START ----
window.addEventListener('load', () => {
  setTimeout(runProgress, 300);
});

// Nav logo style
const style = document.createElement('style');
style.textContent = `@keyframes logoEntrance { from{opacity:0;transform:scale(0.5)} to{opacity:1;transform:scale(1)} }`;
document.head.appendChild(style);

// Expose for HTML
window.openModal = openModal;
window.closeModal = closeModal;
window.switchTab = switchTab;
window.showForgot = showForgot;
window.togglePwd = togglePwd;
window.previewProfile = previewProfile;
window.handleSignIn = handleSignIn;
window.handleSignUp = handleSignUp;
window.handleForgot = handleForgot;
window.closeMobileMenu = closeMobileMenu;

// =====================================================
// PHASE 2 ADDITIONS — all new features
// =====================================================

// ---- GOOGLE SIGN IN ----
function handleGoogleSignIn() {
  if (!auth) { showToast('Add your Firebase config first!', 'warn'); return; }
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then(result => {
      const user = result.user;
      // Create/update Firestore user doc
      if (db) {
        db.collection('users').doc(user.uid).set({
          username: user.displayName,
          email: user.email,
          photoURL: user.photoURL || '',
          country: '',
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          roles: { owner: false, admin: false, instructor: false },
          preferences: { theme: document.body.dataset.theme || 'blue' }
        }, { merge: true });
      }
      showToast('Welcome, ' + user.displayName + '!', 'success');
      closeModal();
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 700);
    })
    .catch(err => showToast(err.message, 'error'));
}

// ---- SIGN OUT (homepage) ----
function handleSignOut() {
  if (auth) auth.signOut().then(() => {
    updateNavForLoggedOutUser();
    showToast('Signed out successfully', 'info');
    document.getElementById('profileDropdown').style.display = 'none';
  });
}

// ---- PROFILE DROPDOWN TOGGLE ----
function toggleProfileMenu() {
  const dd = document.getElementById('profileDropdown');
  dd.style.display = dd.style.display === 'none' ? 'block' : 'none';
}
document.addEventListener('click', e => {
  const wrap = document.getElementById('profileNavWrap');
  if (wrap && !wrap.contains(e.target)) {
    const dd = document.getElementById('profileDropdown');
    if (dd) dd.style.display = 'none';
  }
});

// ---- COURSE FILTER ----
function filterCourses(cat, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  document.querySelectorAll('#coursesGrid .program-card').forEach(card => {
    const cats = card.dataset.cat || '';
    card.style.display = (cat === 'all' || cats.includes(cat)) ? 'block' : 'none';
  });
}

// ---- HANDLE COURSE CLICK ----
function handleCourseClick(courseId) {
  if (!auth || !auth.currentUser) {
    openModal('signup');
    showToast('Sign in to purchase this course', 'info');
    return;
  }
  // buyCourseDirect is defined in payments.js
  if (typeof buyCourseDirect === 'function') {
    buyCourseDirect(courseId);
  } else {
    window.location.href = 'courses.html';
  }
}

// ---- HANDLE PLAN CLICK ----
// Routes to payments.js openPayModal — full UPI + Razorpay flow
function handlePlanClick(planName, amount) {
  if (!auth || !auth.currentUser) {
    openModal('signup');
    showToast('Sign in first to purchase a plan', 'info');
    return;
  }
  // checkoutPlan is defined in payments.js
  if (typeof checkoutPlan === 'function') {
    checkoutPlan(planName);
  } else {
    showToast('Payment system loading, please try again', 'warn');
  }
}

// ---- SMOOTH SCROLL ----
function smoothScroll(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

// ---- NOTIFICATION PANEL ----
document.getElementById('notifBtn').addEventListener('click', e => {
  e.stopPropagation();
  const panel = document.getElementById('notifPanel');
  panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
});
document.addEventListener('click', e => {
  const panel = document.getElementById('notifPanel');
  const btn = document.getElementById('notifBtn');
  if (panel && !panel.contains(e.target) && !btn.contains(e.target)) {
    panel.style.display = 'none';
  }
});

// ---- SAVE THEME PREFERENCE ----
document.querySelectorAll('.theme-option').forEach(btn => {
  btn.addEventListener('click', () => {
    const theme = btn.dataset.theme;
    document.body.dataset.theme = theme;
    localStorage.setItem('mi_theme', theme);
    document.querySelectorAll('.theme-option').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('themeDropdown').classList.remove('open');
    if (auth && auth.currentUser && db) {
      db.collection('users').doc(auth.currentUser.uid).update({ 'preferences.theme': theme }).catch(()=>{});
    }
  });
});

// Restore saved theme on load
(function() {
  const saved = localStorage.getItem('mi_theme');
  if (saved) {
    document.body.dataset.theme = saved;
    document.querySelectorAll('.theme-option').forEach(b => {
      b.classList.toggle('active', b.dataset.theme === saved);
    });
  }
})();

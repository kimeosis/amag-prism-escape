const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Screens
const screenStart = document.getElementById('screen-start');
const screenGame = document.getElementById('screen-game');
const screenDead = document.getElementById('screen-dead');
const scoreEl = document.getElementById('score');
const finalScoreEl = document.getElementById('final-score');

document.getElementById('btn-start').addEventListener('click', startGame);
document.getElementById('btn-restart').addEventListener('click', startGame);

// --- Theme ---
let currentTheme = localStorage.getItem('prism-theme') || 'classic';

const themeAccents = {
  classic: { color: '#0ff', rgb: '0, 255, 255' },
  prism:   { color: '#bf5fff', rgb: '191, 95, 255' },
  cosmic:  { color: '#ff6ec7', rgb: '255, 110, 199' }
};

const themeBtns = document.querySelectorAll('.theme-btn');
function selectTheme(theme) {
  currentTheme = theme;
  localStorage.setItem('prism-theme', theme);
  themeBtns.forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.theme === theme);
  });
  const accent = themeAccents[theme] || themeAccents.classic;
  document.documentElement.style.setProperty('--accent', accent.color);
  document.documentElement.style.setProperty('--accent-rgb', accent.rgb);
}
themeBtns.forEach(btn => {
  btn.addEventListener('click', () => selectTheme(btn.dataset.theme));
});
// Apply saved theme on load
selectTheme(currentTheme);

// --- Menu background ---
const menuCanvas = document.getElementById('menu-canvas');
const deathCanvas = document.getElementById('death-canvas');
const mctx = menuCanvas.getContext('2d');
const dctx = deathCanvas.getContext('2d');
let menuStars = [];
for (let i = 0; i < 150; i++) {
  menuStars.push({
    x: Math.random(), y: Math.random(),
    size: 0.5 + Math.random() * 2,
    speed: 0.005 + Math.random() * 0.02,
    twinkle: 1 + Math.random() * 3,
    offset: Math.random() * Math.PI * 2
  });
}
let menuTime = 0;
let menuAnimId;

function resizeMenu() {
  menuCanvas.width = window.innerWidth;
  menuCanvas.height = window.innerHeight;
  deathCanvas.width = window.innerWidth;
  deathCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeMenu);
resizeMenu();

function menuLoop(now) {
  menuAnimId = requestAnimationFrame(menuLoop);
  menuTime += 0.016;
  drawMenuBg();
}

function drawMenuBg() {
  const w = menuCanvas.width;
  const h = menuCanvas.height;
  const cx = w / 2;
  const cy = h / 2;
  const t = menuTime;

  if (currentTheme === 'classic') {
    // Dark with subtle neon grid
    mctx.fillStyle = '#0a0a0a';
    mctx.fillRect(0, 0, w, h);

    const gridSize = 60;
    const scrollY = (t * 20) % gridSize;
    mctx.strokeStyle = 'rgba(0, 255, 255, 0.04)';
    mctx.lineWidth = 1;
    for (let x = 0; x < w; x += gridSize) {
      mctx.beginPath(); mctx.moveTo(x, 0); mctx.lineTo(x, h); mctx.stroke();
    }
    for (let y = -gridSize + scrollY; y < h + gridSize; y += gridSize) {
      mctx.beginPath(); mctx.moveTo(0, y); mctx.lineTo(w, y); mctx.stroke();
    }

    // Horizon glow
    const glow = mctx.createRadialGradient(cx, h, 0, cx, h, h * 0.7);
    glow.addColorStop(0, 'rgba(0, 255, 255, 0.06)');
    glow.addColorStop(1, 'transparent');
    mctx.fillStyle = glow;
    mctx.fillRect(0, 0, w, h);

  } else if (currentTheme === 'prism') {
    // Aurora
    mctx.fillStyle = '#06060e';
    mctx.fillRect(0, 0, w, h);

    mctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 4; i++) {
      const phase = t * 0.25 + i * 1.5;
      const waveY = cy + Math.sin(phase) * h * 0.2;
      const hue = (t * 12 + i * 70) % 360;
      const grad = mctx.createRadialGradient(
        cx + Math.cos(phase * 0.6) * 180, waveY, 0,
        cx + Math.cos(phase * 0.6) * 180, waveY, 350
      );
      grad.addColorStop(0, `hsla(${hue}, 100%, 50%, 0.06)`);
      grad.addColorStop(0.5, `hsla(${(hue + 40) % 360}, 80%, 40%, 0.03)`);
      grad.addColorStop(1, 'transparent');
      mctx.fillStyle = grad;
      mctx.fillRect(0, 0, w, h);
    }

    // Diamond grid
    mctx.globalCompositeOperation = 'source-over';
    const gridSize = 80;
    const scrollY = (t * 30) % gridSize;
    mctx.lineWidth = 0.5;
    for (let y = -gridSize + scrollY; y < h + gridSize; y += gridSize) {
      for (let x = 0; x < w + gridSize; x += gridSize) {
        const ox = ((y / gridSize) % 2) * (gridSize / 2);
        const px = x + ox;
        const hue = (px * 0.5 + y * 0.3 + t * 20) % 360;
        mctx.strokeStyle = `hsla(${hue}, 80%, 60%, 0.04)`;
        mctx.beginPath();
        mctx.moveTo(px, y - gridSize / 2);
        mctx.lineTo(px + gridSize / 2, y);
        mctx.lineTo(px, y + gridSize / 2);
        mctx.lineTo(px - gridSize / 2, y);
        mctx.closePath();
        mctx.stroke();
      }
    }

  } else if (currentTheme === 'cosmic') {
    // Deep space
    const bgGrad = mctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#03000a');
    bgGrad.addColorStop(0.4, '#0a0015');
    bgGrad.addColorStop(0.7, '#0d0020');
    bgGrad.addColorStop(1, '#050010');
    mctx.fillStyle = bgGrad;
    mctx.fillRect(0, 0, w, h);

    // Nebula
    mctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 3; i++) {
      const nx = cx + Math.sin(t * 0.12 + i * 2.5) * w * 0.25;
      const ny = cy + Math.cos(t * 0.08 + i * 1.8) * h * 0.15;
      const hue = (t * 6 + i * 120) % 360;
      const nebula = mctx.createRadialGradient(nx, ny, 0, nx, ny, 280);
      nebula.addColorStop(0, `hsla(${hue}, 80%, 40%, 0.05)`);
      nebula.addColorStop(0.4, `hsla(${(hue + 30) % 360}, 70%, 30%, 0.03)`);
      nebula.addColorStop(1, 'transparent');
      mctx.fillStyle = nebula;
      mctx.fillRect(0, 0, w, h);
    }
    mctx.globalCompositeOperation = 'source-over';

    // Stars
    for (const s of menuStars) {
      s.y += s.speed * 0.001;
      if (s.y > 1.02) { s.y = -0.02; s.x = Math.random(); }
      const sx = s.x * w;
      const sy = s.y * h;
      const twinkle = 0.3 + 0.7 * ((Math.sin(t * s.twinkle + s.offset) + 1) / 2);
      mctx.globalAlpha = twinkle;
      mctx.fillStyle = '#fff';
      if (s.size > 2) {
        mctx.fillRect(sx - s.size, sy - 0.5, s.size * 2, 1);
        mctx.fillRect(sx - 0.5, sy - s.size, 1, s.size * 2);
      } else {
        mctx.fillRect(sx, sy, s.size, s.size);
      }
    }
    mctx.globalAlpha = 1;
  }

  mctx.globalCompositeOperation = 'source-over';

  // Mirror to death screen canvas
  dctx.drawImage(menuCanvas, 0, 0);
}

function startMenuLoop() {
  cancelAnimationFrame(menuAnimId);
  menuLoop(0);
}

function stopMenuLoop() {
  cancelAnimationFrame(menuAnimId);
}

startMenuLoop();

// --- Input ---
const keys = {};
window.addEventListener('keydown', e => { keys[e.key] = true; });
window.addEventListener('keyup', e => { keys[e.key] = false; });

// --- Audio ---
const bgMusic = new Audio('assets/bgmusic2.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.5;

const deathSound = new Audio('assets/deathsound.mp3');
deathSound.volume = 0.7;

// --- Stars (for cosmic theme) ---
let stars = [];
function initStars() {
  stars = [];
  for (let i = 0; i < 200; i++) {
    stars.push({
      x: Math.random(),
      y: Math.random(),
      size: 0.5 + Math.random() * 2.5,
      speed: 0.01 + Math.random() * 0.04,
      twinkleSpeed: 1 + Math.random() * 3,
      twinkleOffset: Math.random() * Math.PI * 2,
      hue: Math.random() < 0.3 ? 200 + Math.random() * 60 : 0, // some blue-ish, most white
    });
  }
}
initStars();

// --- Game state ---
let player, hazards, particles, score, gameOver, spawnTimer, difficulty;
let shakeAmount, slowMo, lastTime, animId, elapsed;

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);

function startGame() {
  stopMenuLoop();
  resize();
  screenStart.classList.add('hidden');
  screenDead.classList.add('hidden');
  screenGame.classList.remove('hidden');

  player = {
    x: canvas.width / 2,
    y: canvas.height - 80,
    w: 24,
    h: 24,
    speed: 420,
    trail: []
  };
  hazards = [];
  particles = [];
  score = 0;
  gameOver = false;
  spawnTimer = 0;
  difficulty = 0;
  shakeAmount = 0;
  slowMo = 0;
  elapsed = 0;
  lastTime = performance.now();
  cancelAnimationFrame(animId);
  bgMusic.currentTime = 0;
  bgMusic.play().catch(err => console.warn('Audio play failed:', err));
  loop(lastTime);
}

// --- Difficulty curve ---
function getDifficulty() {
  return Math.min(difficulty, 50);
}

function getSpawnInterval() {
  return Math.max(0.15, 0.7 - getDifficulty() * 0.011);
}

function getHazardSpeed() {
  return 200 + getDifficulty() * 18;
}

// --- Color shifting with difficulty ---
function getHazardColor() {
  const d = getDifficulty();
  if (currentTheme === 'cosmic') {
    // Full rainbow cycle that keeps shifting over time
    const hue = (elapsed * 25 + d * 8) % 360;
    return `hsl(${hue}, 100%, 60%)`;
  }
  if (d < 15) return `hsl(${180 - d * 6}, 100%, 55%)`;  // cyan -> green
  if (d < 30) return `hsl(${90 - (d - 15) * 6}, 100%, 55%)`;  // green -> yellow -> red
  return `hsl(${(360 - (d - 30) * 4) % 360}, 100%, 55%)`;  // red -> magenta
}

function getGlowColor() {
  const d = getDifficulty();
  if (currentTheme === 'cosmic') {
    const hue = (elapsed * 25 + d * 8) % 360;
    return `hsl(${hue}, 100%, 65%)`;
  }
  if (d < 15) return '#0ff';
  if (d < 30) return '#ff0';
  return '#f04';
}

function getPlayerColor() {
  if (currentTheme === 'cosmic') {
    const hue = (elapsed * 40 + 180) % 360;
    return `hsl(${hue}, 100%, 70%)`;
  }
  return '#0ff';
}

// --- Spawning ---
function spawnHazard() {
  const d = getDifficulty();
  const w = 20 + Math.random() * (30 + d * 1.5);
  const h = 16 + Math.random() * 20;
  const x = Math.random() * (canvas.width - w);
  const speed = getHazardSpeed() * (0.7 + Math.random() * 0.6);

  // After difficulty 10, some hazards move sideways
  let vx = 0;
  if (d > 10 && Math.random() < 0.3) {
    vx = (Math.random() - 0.5) * speed * 0.6;
  }

  hazards.push({ x, y: -h, w, h, vy: speed, vx });
}

// --- Particles ---
function spawnDeathParticles(x, y) {
  for (let i = 0; i < 60; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 100 + Math.random() * 500;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: 0.8 + Math.random() * 1.5,
      size: 2 + Math.random() * 5,
      color: Math.random() < 0.5 ? '#0ff' : '#f04'
    });
  }
}

function spawnNearMissParticles(x, y) {
  for (let i = 0; i < 8; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 50 + Math.random() * 150;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: 2 + Math.random(),
      size: 1 + Math.random() * 3,
      color: '#fff'
    });
  }
}

// --- Collision ---
function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x &&
         a.y < b.y + b.h && a.y + a.h > b.y;
}

function nearMiss(a, b, margin) {
  const expanded = { x: b.x - margin, y: b.y - margin, w: b.w + margin * 2, h: b.h + margin * 2 };
  return rectsOverlap(a, expanded) && !rectsOverlap(a, b);
}

// --- Main loop ---
function loop(now) {
  if (gameOver) return;
  animId = requestAnimationFrame(loop);

  let rawDt = (now - lastTime) / 1000;
  lastTime = now;
  rawDt = Math.min(rawDt, 0.05);

  // Slow-motion effect
  const dt = rawDt * (slowMo > 0 ? 0.3 : 1);
  if (slowMo > 0) slowMo -= rawDt;

  // --- Update time & difficulty ---
  elapsed += rawDt;
  difficulty += rawDt * 0.5;

  // --- Update score ---
  score += rawDt * 10 * (1 + getDifficulty() * 0.1);
  scoreEl.textContent = Math.floor(score);

  // --- Player movement ---
  let dx = 0, dy = 0;
  if (keys['ArrowLeft'] || keys['a'] || keys['A']) dx -= 1;
  if (keys['ArrowRight'] || keys['d'] || keys['D']) dx += 1;
  if (keys['ArrowUp'] || keys['w'] || keys['W']) dy -= 1;
  if (keys['ArrowDown'] || keys['s'] || keys['S']) dy += 1;

  // Normalize diagonal
  if (dx && dy) { dx *= 0.707; dy *= 0.707; }

  player.x += dx * player.speed * dt;
  player.y += dy * player.speed * dt;

  // Clamp to bounds
  player.x = Math.max(0, Math.min(canvas.width - player.w, player.x));
  player.y = Math.max(0, Math.min(canvas.height - player.h, player.y));

  // Trail
  player.trail.unshift({ x: player.x + player.w / 2, y: player.y + player.h / 2, age: 0 });
  if (player.trail.length > 12) player.trail.pop();
  player.trail.forEach(t => t.age += dt);

  // --- Spawn hazards ---
  spawnTimer -= dt;
  if (spawnTimer <= 0) {
    spawnTimer = getSpawnInterval();
    spawnHazard();
    // Extra hazard at higher difficulty
    if (getDifficulty() > 20 && Math.random() < 0.4) spawnHazard();
  }

  // --- Update hazards ---
  for (let i = hazards.length - 1; i >= 0; i--) {
    const h = hazards[i];
    h.y += h.vy * dt;
    h.x += (h.vx || 0) * dt;

    // Remove off-screen
    if (h.y > canvas.height + 50 || h.x < -100 || h.x > canvas.width + 100) {
      hazards.splice(i, 1);
      continue;
    }

    // Collision
    if (rectsOverlap(player, h)) {
      die();
      return;
    }

    // Near miss
    if (nearMiss(player, h, 18)) {
      slowMo = 0.15;
      score += 5;
      spawnNearMissParticles(player.x + player.w / 2, player.y + player.h / 2);
    }
  }

  // --- Update particles ---
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= p.decay * dt;
    if (p.life <= 0) particles.splice(i, 1);
  }

  // --- Shake decay ---
  if (shakeAmount > 0) shakeAmount *= 0.9;

  // --- Draw ---
  draw();
}

function die() {
  gameOver = true;
  bgMusic.pause();
  deathSound.currentTime = 0;
  deathSound.play().catch(() => {});
  shakeAmount = 20;
  spawnDeathParticles(player.x + player.w / 2, player.y + player.h / 2);

  // Run death animation
  const deathStart = performance.now();
  function deathLoop(now) {
    const dt = Math.min((now - deathStart) / 1000, 0.05);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * 0.016;
      p.y += p.vy * 0.016;
      p.vy += 300 * 0.016; // gravity
      p.life -= p.decay * 0.016;
      if (p.life <= 0) particles.splice(i, 1);
    }

    if (shakeAmount > 0) shakeAmount *= 0.92;

    draw(true);

    if (now - deathStart < 1500) {
      requestAnimationFrame(deathLoop);
    } else {
      showDeath();
    }
  }
  requestAnimationFrame(deathLoop);
}

function showDeath() {
  screenGame.classList.add('hidden');
  screenDead.classList.remove('hidden');
  finalScoreEl.textContent = Math.floor(score);
  startMenuLoop();
}

// --- Backgrounds ---
function drawBgClassic() {
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(-20, -20, canvas.width + 40, canvas.height + 40);

  const glowCol = getGlowColor();
  ctx.strokeStyle = glowCol + '08';
  ctx.lineWidth = 1;
  const gridSize = 60;
  for (let x = 0; x < canvas.width; x += gridSize) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += gridSize) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
  }
}

function drawBgPrism() {
  ctx.fillStyle = '#06060e';
  ctx.fillRect(-20, -20, canvas.width + 40, canvas.height + 40);

  const t = elapsed;
  const d = getDifficulty();
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  // Aurora waves
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 5; i++) {
    const phase = t * 0.3 + i * 1.3;
    const waveY = cy + Math.sin(phase) * canvas.height * 0.25;
    const hue = (t * 15 + i * 55 + d * 4) % 360;
    const grad = ctx.createRadialGradient(
      cx + Math.cos(phase * 0.7) * 200, waveY, 0,
      cx + Math.cos(phase * 0.7) * 200, waveY, 350 + d * 5
    );
    grad.addColorStop(0, `hsla(${hue}, 100%, 50%, ${0.06 + d * 0.001})`);
    grad.addColorStop(0.5, `hsla(${(hue + 40) % 360}, 80%, 40%, 0.03)`);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(-20, -20, canvas.width + 40, canvas.height + 40);
  }

  // Diamond grid
  ctx.globalCompositeOperation = 'source-over';
  const gridSize = 80;
  const scrollY = (t * 40) % gridSize;
  const gridAlpha = 0.04 + d * 0.002;
  ctx.lineWidth = 0.5;

  for (let y = -gridSize + scrollY; y < canvas.height + gridSize; y += gridSize) {
    for (let x = 0; x < canvas.width + gridSize; x += gridSize) {
      const offsetX = ((y / gridSize) % 2) * (gridSize / 2);
      const px = x + offsetX;
      const hue = (px * 0.5 + y * 0.3 + t * 30) % 360;
      ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${gridAlpha})`;
      ctx.beginPath();
      ctx.moveTo(px, y - gridSize / 2);
      ctx.lineTo(px + gridSize / 2, y);
      ctx.lineTo(px, y + gridSize / 2);
      ctx.lineTo(px - gridSize / 2, y);
      ctx.closePath();
      ctx.stroke();
    }
  }

  // Light pillars
  for (let i = 0; i < 3; i++) {
    const px = cx + Math.sin(t * 0.4 + i * 2.1) * canvas.width * 0.4;
    const hue = (t * 20 + i * 120) % 360;
    const pillarGrad = ctx.createLinearGradient(px - 60, 0, px + 60, 0);
    pillarGrad.addColorStop(0, 'transparent');
    pillarGrad.addColorStop(0.5, `hsla(${hue}, 100%, 60%, ${0.035 + d * 0.001})`);
    pillarGrad.addColorStop(1, 'transparent');
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = pillarGrad;
    ctx.fillRect(px - 60, 0, 120, canvas.height);
  }

  // Vignette
  ctx.globalCompositeOperation = 'source-over';
  const vignette = ctx.createRadialGradient(cx, cy, canvas.height * 0.3, cx, cy, canvas.height * 0.9);
  vignette.addColorStop(0, 'transparent');
  vignette.addColorStop(1, 'rgba(6, 6, 14, 0.7)');
  ctx.fillStyle = vignette;
  ctx.fillRect(-20, -20, canvas.width + 40, canvas.height + 40);

  ctx.globalCompositeOperation = 'source-over';
}

function drawBgCosmic() {
  // Deep space gradient
  const t = elapsed;
  const d = getDifficulty();
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bgGrad.addColorStop(0, '#03000a');
  bgGrad.addColorStop(0.4, '#0a0015');
  bgGrad.addColorStop(0.7, '#0d0020');
  bgGrad.addColorStop(1, '#050010');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(-20, -20, canvas.width + 40, canvas.height + 40);

  // Nebula clouds
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 3; i++) {
    const nx = cx + Math.sin(t * 0.15 + i * 2.5) * canvas.width * 0.3;
    const ny = cy + Math.cos(t * 0.1 + i * 1.8) * canvas.height * 0.2;
    const hue = (t * 8 + i * 120 + d * 3) % 360;
    const nebula = ctx.createRadialGradient(nx, ny, 0, nx, ny, 300 + d * 4);
    nebula.addColorStop(0, `hsla(${hue}, 80%, 40%, 0.05)`);
    nebula.addColorStop(0.4, `hsla(${(hue + 30) % 360}, 70%, 30%, 0.03)`);
    nebula.addColorStop(1, 'transparent');
    ctx.fillStyle = nebula;
    ctx.fillRect(-20, -20, canvas.width + 40, canvas.height + 40);
  }
  ctx.globalCompositeOperation = 'source-over';

  // Stars — drift downward slowly and twinkle
  for (const s of stars) {
    s.y += s.speed * 0.002;
    if (s.y > 1.05) { s.y = -0.05; s.x = Math.random(); }

    const sx = s.x * canvas.width;
    const sy = s.y * canvas.height;
    const twinkle = 0.3 + 0.7 * ((Math.sin(t * s.twinkleSpeed + s.twinkleOffset) + 1) / 2);

    ctx.globalAlpha = twinkle;
    if (s.hue > 0) {
      ctx.fillStyle = `hsl(${s.hue}, 60%, 80%)`;
    } else {
      ctx.fillStyle = '#fff';
    }

    // Draw as a small cross for brighter stars
    if (s.size > 2) {
      ctx.fillRect(sx - s.size, sy - 0.5, s.size * 2, 1);
      ctx.fillRect(sx - 0.5, sy - s.size, 1, s.size * 2);
      ctx.shadowColor = '#fff';
      ctx.shadowBlur = s.size * 3;
      ctx.fillRect(sx - 1, sy - 1, 2, 2);
      ctx.shadowBlur = 0;
    } else {
      ctx.fillRect(sx, sy, s.size, s.size);
    }
  }
  ctx.globalAlpha = 1;

  // Shooting stars (occasional)
  const shootPhase = (t * 0.7) % 4;
  if (shootPhase < 0.3) {
    const sx = canvas.width * (0.2 + ((t * 13.7) % 1) * 0.6);
    const sy = canvas.height * 0.1 + ((t * 7.3) % 1) * canvas.height * 0.3;
    const len = 80 + shootPhase * 200;
    const alpha = 1 - shootPhase / 0.3;
    const grad = ctx.createLinearGradient(sx, sy, sx + len, sy + len * 0.4);
    grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
    grad.addColorStop(1, 'transparent');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + len, sy + len * 0.4);
    ctx.stroke();
  }

  // Vignette
  const vignette = ctx.createRadialGradient(cx, cy, canvas.height * 0.35, cx, cy, canvas.height * 0.85);
  vignette.addColorStop(0, 'transparent');
  vignette.addColorStop(1, 'rgba(3, 0, 10, 0.6)');
  ctx.fillStyle = vignette;
  ctx.fillRect(-20, -20, canvas.width + 40, canvas.height + 40);
}

function draw(isDeath) {
  ctx.save();

  // Screen shake
  if (shakeAmount > 0.5) {
    ctx.translate(
      (Math.random() - 0.5) * shakeAmount,
      (Math.random() - 0.5) * shakeAmount
    );
  }

  // Background
  if (currentTheme === 'prism') drawBgPrism();
  else if (currentTheme === 'cosmic') drawBgCosmic();
  else drawBgClassic();

  // Hazards
  const hazCol = getHazardColor();
  for (const h of hazards) {
    ctx.shadowColor = hazCol;
    ctx.shadowBlur = 15;
    ctx.fillStyle = hazCol;
    ctx.fillRect(h.x, h.y, h.w, h.h);
    ctx.shadowBlur = 0;
  }

  // Player trail
  const pCol = getPlayerColor();
  for (let i = 0; i < player.trail.length; i++) {
    const tr = player.trail[i];
    const alpha = (1 - i / player.trail.length) * 0.3;
    const size = player.w * (1 - i / player.trail.length) * 0.6;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = pCol;
    ctx.fillRect(tr.x - size / 2, tr.y - size / 2, size, size);
  }
  ctx.globalAlpha = 1;

  // Player (skip if death animation)
  if (!isDeath) {
    ctx.shadowColor = pCol;
    ctx.shadowBlur = 20;
    ctx.fillStyle = pCol;
    ctx.fillRect(player.x, player.y, player.w, player.h);

    // Inner highlight
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff';
    ctx.fillRect(player.x + 4, player.y + 4, player.w - 8, player.h - 8);
  }

  // Particles
  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 8;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
  }
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;

  // Slow-mo indicator
  if (slowMo > 0 && !isDeath) {
    ctx.fillStyle = `rgba(255, 255, 255, ${slowMo * 2})`;
    ctx.font = '14px Courier New';
    ctx.fillText('NEAR MISS', player.x - 20, player.y - 15);
  }

  ctx.restore();
}

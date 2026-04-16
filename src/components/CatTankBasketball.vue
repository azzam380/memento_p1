<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import gsap from 'gsap';

// Assets
import catDefault from '@/assets/cat-tank.png';
import catSunglasses from '@/assets/cat-tank-sunglasses.png';
import catBusiness from '@/assets/cat-tank-business.png';
import catCrying from '@/assets/cat-tank-crying.png';
import rimImgSrc from '@/assets/basketball-rim.png';
import bgClassroomImg from '@/assets/bg-classroom.png';

const emit = defineEmits(['back']);

// Game Constants
const GRAVITY = 0.25;
const RIM_POINTS = [
  { x: 0.7, y: 0.3 }, { x: 0.8, y: 0.5 }, { x: 0.15, y: 0.4 },
  { x: 0.85, y: 0.2 }, { x: 0.65, y: 0.6 }, { x: 0.9, y: 0.3 }
];

// Game State
const score = ref(50);
const showShop = ref(false);
const absurdityLevel = ref(0); 
const gameMessage = ref("");
const showCTA = ref(true);

// Inventory & Equipment
const purchased = ref(new Set(['cat_default', 'bg_white', 'aud_none', 'music_jazz']));
const equipped = ref(new Set(['cat_default', 'bg_white', 'aud_none', 'music_jazz']));

const buffValues = ref({
  doubleScore: 1, // Will be multiplied by 10 (base initial easy mode)
  aimAssist: 0,
  biggerBall: 20,
  multiBall: 1,
  doubleScoreVal: 10 // Start with 10 pts per goal
});

// Resources
const tankImages = {
    default: new Image(),
    sunglasses: new Image(),
    business: new Image(),
    crying: new Image()
};
tankImages.default.src = catDefault;
tankImages.sunglasses.src = catSunglasses;
tankImages.business.src = catBusiness;
tankImages.crying.src = catCrying;

const rimImg = new Image(); rimImg.src = rimImgSrc;
const bgClassroom = new Image(); bgClassroom.src = bgClassroomImg;

// Audio System
const currentAudio = ref(null);
const musicVolume = 0.4;

const playMusic = (id) => {
    if (currentAudio.value) {
        currentAudio.value.pause();
        currentAudio.value = null;
    }
    
    let url = "";
    if (id === 'music_jazz') url = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
    else if (id === 'music_lofi') url = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3";
    else if (id === 'music_chaotic') url = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3";

    if (url) {
        currentAudio.value = new Audio(url);
        currentAudio.value.loop = true;
        currentAudio.value.volume = musicVolume;
        currentAudio.value.play().catch(e => console.log("Audio play blocked", e));
    }
};

// Canvas & Engine
const canvasRef = ref(null);
let ctx = null;
let animationFrame = null;
let gameWidth = 0;
let gameHeight = 0;

// Physics Objects
let tank = { x: 100, y: 0, width: 120, height: 100, angle: -Math.PI/4, power: 12 };
let rim = { x: 0, y: 0, width: 100, height: 120 };
let portal = { active: false, x1: 0, y1: 0, x2: 0, y2: 0 };
let balls = [];
let particles = [];
let audienceCats = [];

// Interaction
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;

const initGame = () => {
  if (!canvasRef.value) return;
  ctx = canvasRef.value.getContext('2d');
  resize();
  resetRim();
  render();
};

const resize = () => {
  if (!canvasRef.value) return;
  const parent = canvasRef.value.parentElement;
  gameWidth = parent.clientWidth;
  gameHeight = parent.clientHeight;
  canvasRef.value.width = gameWidth;
  canvasRef.value.height = gameHeight;
  tank.y = gameHeight - 140;
  createAudience();
};

const createAudience = () => {
    audienceCats = [];
    if (equipped.value.has('aud_none')) return;
    
    let count = 20;
    if (equipped.value.has('aud_chaotic')) count = 100;
    else if (equipped.value.has('aud_dancing')) count = 40;

    for (let i = 0; i < count; i++) {
        audienceCats.push({
            x: Math.random() * gameWidth,
            y: gameHeight - 50 - Math.random() * 30,
            size: 25 + Math.random() * 20,
            jump: 0,
            offset: Math.random() * Math.PI * 2,
            type: equipped.value.has('aud_dancing') ? 'dancing' : 'cheering',
            color: `hsl(${40 + Math.random() * 20}, 100%, 60%)`
        });
    }
};

const resetRim = () => {
  const p = RIM_POINTS[Math.floor(Math.random() * RIM_POINTS.length)];
  rim.x = p.x * gameWidth;
  rim.y = p.y * gameHeight;
  
  if (purchased.value.has('portalShot')) {
      portal.active = true;
      portal.x1 = rim.x - 200 + Math.random() * 100;
      portal.y1 = rim.y + 100 + Math.random() * 100;
      portal.x2 = rim.x + 50;
      portal.y2 = rim.y - 50;
  } else {
      portal.active = false;
  }
  
  gsap.from(rim, { opacity: 0, y: "-=50", duration: 0.5, ease: "back.out" });
};

const fireBall = (customAngle = null, customPower = null) => {
  const angle = customAngle !== null ? customAngle : tank.angle;
  const power = customPower !== null ? customPower : tank.power;
  
  const ballCount = buffValues.value.multiBall;
  const ballRadius = buffValues.value.biggerBall;

  for (let i = 0; i < ballCount; i++) {
    const spread = (i - (ballCount - 1) / 2) * 0.15;
    balls.push({
      x: tank.x + 90,
      y: tank.y + 30,
      vx: Math.cos(angle + spread) * (power + Math.random() * 2),
      vy: Math.sin(angle + spread) * (power + Math.random() * 2),
      radius: ballRadius,
      color: `hsl(${Math.random() * 360}, 80%, 60%)`
    });
  }
};

const handlePointerDown = (e) => {
  if (showShop.value) return;
  const pos = getPointerPos(e);
  
  if (purchased.value.has('railgunMode')) {
      tank.angle = Math.atan2(pos.y - (tank.y + 30), pos.x - (tank.x + 90));
      fireBall(tank.angle, 25);
      return;
  }
  isDragging = true;
  dragStartX = pos.x;
  dragStartY = pos.y;
};

const handlePointerMove = (e) => {
  if (!isDragging || purchased.value.has('railgunMode')) return;
  const pos = getPointerPos(e);
  tank.angle = Math.atan2(pos.y - dragStartY, pos.x - dragStartX);
  tank.power = Math.min(Math.sqrt(Math.pow(pos.x - dragStartX, 2) + Math.pow(pos.y - dragStartY, 2)) / 10, 25);
};

const handlePointerUp = (e) => {
  if (!isDragging) return;
  isDragging = false;
  fireBall();
};

const getPointerPos = (e) => {
  const rect = canvasRef.value.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  return { x: clientX - rect.left, y: clientY - rect.top };
};

const update = () => {
  // Balls
  for (let i = balls.length - 1; i >= 0; i--) {
    const b = balls[i];
    b.x += b.vx; b.y += b.vy; b.vy += GRAVITY;

    const rimCenterX = rim.x + rim.width / 2;
    const rimCenterY = rim.y + 20;
    const dx = rimCenterX - b.x;
    const dy = rimCenterY - b.y;
    const dist = Math.sqrt(dx*dx + dy*dy);

    const isMagnet = purchased.value.has('magnetRim');
    const isCatching = purchased.value.has('catchingSystem');

    if (isMagnet || isCatching) {
        const range = isCatching ? 300 : 150;
        const pullStrength = isCatching ? 0.15 : 0.04;
        
        // Only pull if falling and within range
        if (dist < range && b.vy > 0) {
            // Primarily pull horizontally to align with the hole
            b.vx += (rimCenterX - b.x) * pullStrength;
            
            // ADDED: Dampen horizontal movement to prevent zig-zag/oscillation
            b.vx *= 0.94;
            
            // Very slight vertical pull to help it go "down" into the rim
            if (b.y < rimCenterY) {
                b.vy += (rimCenterY - b.y) * (pullStrength * 0.5);
            }
        }
    }

    // Goal Detection
    if (dist < 60 && b.vy > 0) {
      score.value += buffValues.value.doubleScoreVal;
      createBurst(b.x, b.y, b.color);
      balls.splice(i, 1);
      resetRim();
      continue;
    }

    // Portal Shot logic
    if (portal.active) {
        const pdx = portal.x1 - b.x;
        const pdy = portal.y1 - b.y;
        const pdist = Math.sqrt(pdx*pdx + pdy*pdy);
        if (pdist < 40) {
            b.x = portal.x2;
            b.y = portal.y2;
            b.vx = 0; b.vy = 5; // Drop it straight in
            createBurst(portal.x1, portal.y1, "#6366f1");
            createBurst(portal.x2, portal.y2, "#6366f1");
        }
    }

    if (b.y > gameHeight + 100 || b.x > gameWidth + 100 || b.x < -100) balls.splice(i, 1);
  }

  // Particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx; p.y += p.vy; p.life -= 0.02;
    if (p.life <= 0) particles.splice(i, 1);
  }

  // Auto Shoot
  if (purchased.value.has('autoShooter') && Math.random() < 0.04) {
    const dx = (rim.x + rim.width/2) - (tank.x + 90);
    const dy = (rim.y + 20) - (tank.y + 30);
    fireBall(Math.atan2(dy - 120, dx), 18);
  }

  // Absurdity
  if (score.value > 10000) absurdityLevel.value = 3;
  else if (score.value > 1000) absurdityLevel.value = 2;
  else if (score.value > 100) absurdityLevel.value = 1;

  if (score.value > 1e16) {
      gameMessage.value = "PHYSICS COLLAPSED. TOO MANY BALLS.";
      score.value = Infinity;
  }
};

const createBurst = (x, y, color) => {
  for (let i = 0; i < 25; i++) {
    particles.push({ x, y, vx: (Math.random() - 0.5) * 16, vy: (Math.random() - 0.5) * 16, life: 1, color });
  }
};

const render = () => {
  if (!ctx) return;
  
  // BG
  ctx.fillStyle = getBgColor();
  ctx.fillRect(0, 0, gameWidth, gameHeight);

  if (absurdityLevel.value >= 2) drawChaos();

  // Audience
  audienceCats.forEach(cat => {
      const time = Date.now() * 0.01;
      if (cat.type === 'dancing') {
          cat.jump = Math.abs(Math.sin(time + cat.offset)) * 20;
          cat.x += Math.sin(time * 0.5 + cat.offset) * 2;
      } else {
          cat.jump = Math.sin(time + cat.offset) * 8;
      }
      
      ctx.beginPath();
      ctx.arc(cat.x, cat.y - cat.jump, cat.size / 2, 0, Math.PI * 2);
      ctx.fillStyle = cat.color;
      ctx.fill();
      // Simple Ears
      ctx.fillRect(cat.x - cat.size/3, cat.y - cat.jump - cat.size/2, cat.size/4, cat.size/4);
      ctx.fillRect(cat.x + cat.size/3 - cat.size/4, cat.y - cat.jump - cat.size/2, cat.size/4, cat.size/4);
  });

  // Tank
  ctx.save();
  ctx.translate(tank.x + 60, tank.y + 50);
  ctx.rotate(tank.angle);
  
  let skinId = 'default';
  if (equipped.value.has('cat_sunglasses')) skinId = 'sunglasses';
  else if (equipped.value.has('cat_business')) skinId = 'business';
  else if (equipped.value.has('cat_crying')) skinId = 'crying';
  
  const img = tankImages[skinId] || tankImages.default;
  ctx.drawImage(img, -60, -50, tank.width, tank.height);
  ctx.restore();

  // Aim Line (LENGTH BASED ON UPGRADE)
  if (isDragging) {
      const isWhiteBg = equipped.value.has('bg_white');
      ctx.beginPath();
      // Contrast color: Dark purple for white bg, Gold/Yellow for others
      ctx.strokeStyle = isWhiteBg ? "rgba(26, 11, 46, 0.6)" : "rgba(212, 175, 55, 0.8)";
      ctx.setLineDash([8, 8]);
      ctx.lineWidth = 4;
      ctx.moveTo(tank.x + 90, tank.y + 30);
      
      const steps = 30 + (buffValues.value.aimAssist * 25);
      for (let i = 0; i < steps; i++) {
          const t = i * 1.5;
          const px = tank.x + 90 + Math.cos(tank.angle) * tank.power * t;
          const py = tank.y + 30 + Math.sin(tank.angle) * tank.power * t + 0.5 * GRAVITY * t * t;
          ctx.lineTo(px, py);
      }
      ctx.stroke();
      
      // Outer glow for extra visibility on chaotic backgrounds
      ctx.strokeStyle = isWhiteBg ? "rgba(212, 175, 55, 0.2)" : "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 2;
      ctx.stroke();
      
      ctx.setLineDash([]);
  }

  // Rim & Balls
  if (portal.active) {
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#6366f1";
      ctx.beginPath(); ctx.ellipse(portal.x1, portal.y1, 30, 15, Math.PI/4, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = "#a855f7";
      ctx.beginPath(); ctx.ellipse(portal.x2, portal.y2, 30, 15, -Math.PI/4, 0, Math.PI * 2); ctx.stroke();
  }

  ctx.drawImage(rimImg, rim.x, rim.y, rim.width, rim.height);
  balls.forEach(b => {
    ctx.beginPath(); ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fillStyle = b.color; ctx.fill();
    ctx.strokeStyle = "white"; ctx.lineWidth = 2; ctx.stroke();
  });

  particles.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, 6, 6);
      ctx.globalAlpha = 1;
  });

  update();
  animationFrame = requestAnimationFrame(render);
};

const getBgColor = () => {
    if (equipped.value.has('bg_meme')) return `hsl(${Date.now() / 8 % 360}, 60%, 12%)`;
    if (equipped.value.has('bg_space')) return '#020617';
    if (equipped.value.has('bg_grass')) return '#14532d';
    if (equipped.value.has('bg_white')) return '#ffffff';
    if (equipped.value.has('bg_classroom')) {
        ctx.drawImage(bgClassroom, 0, 0, gameWidth, gameHeight);
        return 'transparent';
    }
    return '#0d0216';
};

const drawChaos = () => {
    const t = Date.now() * 0.001;
    ctx.save();
    ctx.globalAlpha = absurdityLevel.value === 3 ? 0.4 : 0.15;
    ctx.fillStyle = "#d4af37";
    ctx.font = "bold 90px Inter";
    ctx.textAlign = "center";
    ctx.fillText("CAT TANK CHAOS", gameWidth/2 + Math.sin(t)*50, gameHeight/2 + Math.cos(t)*50);
    if (absurdityLevel.value === 3) {
        ctx.strokeStyle = `hsl(${t*100}, 100%, 50%)`;
        ctx.lineWidth = 15;
        ctx.strokeRect(Math.random()*gameWidth, Math.random()*gameHeight, 300, 300);
    }
    ctx.restore();
};

const getBuffCost = (item) => {
    const level = item.id === 'doubleScore' ? Math.log2(buffValues.value.doubleScoreVal / 10) :
                  item.id === 'aimAssist' ? buffValues.value.aimAssist :
                  item.id === 'biggerBall' ? (buffValues.value.biggerBall - 20) / 10 :
                  item.id === 'multiBall' ? (buffValues.value.multiBall - 1) / 2 : 0;
    return Math.floor(item.cost * Math.pow(1.6, level));
};

const handleItemClick = (item, type) => {
    if (type === 'buff') {
        const cost = getBuffCost(item);
        if (score.value >= cost) {
            score.value -= cost;
            purchased.value.add(item.id);
            switch(item.id) {
                case 'doubleScore': 
                    const currentMult = buffValues.value.doubleScoreVal / 10;
                    if (currentMult === 1) buffValues.value.doubleScoreVal = 20;
                    else if (currentMult === 2) buffValues.value.doubleScoreVal = 30;
                    else buffValues.value.doubleScoreVal = 50;
                    break;
                case 'aimAssist': buffValues.value.aimAssist++; break;
                case 'biggerBall': buffValues.value.biggerBall += 10; break;
                case 'multiBall': buffValues.value.multiBall += 1; break;
            }
            gsap.to(".score-val", { scale: 1.8, duration: 0.1, yoyo: true, repeat: 1 });
        }
    } else {
        if (purchased.value.has(item.id)) {
            toggleEquip(item.id, type);
        } else if (score.value >= item.cost) {
            score.value -= item.cost;
            purchased.value.add(item.id);
            toggleEquip(item.id, type);
        }
    }
};

const toggleEquip = (id, type) => {
    if (type === 'skin') {
        ['cat_default', 'cat_sunglasses', 'cat_business', 'cat_crying'].forEach(s => equipped.value.delete(s));
    } else if (type === 'bg') {
        ['bg_white', 'bg_grass', 'bg_space', 'bg_classroom', 'bg_meme'].forEach(b => equipped.value.delete(b));
    } else if (type === 'aud') {
        ['aud_none', 'aud_cheering', 'aud_dancing', 'aud_chaotic'].forEach(a => equipped.value.delete(a));
    } else if (type === 'music') {
        ['music_jazz', 'music_lofi', 'music_chaotic'].forEach(m => equipped.value.delete(m));
        playMusic(id);
    }
    equipped.value.add(id);
    if (type === 'aud') createAudience();
};

onMounted(() => {
  initGame();
  playMusic('music_jazz');
  window.addEventListener('resize', resize);
});

onUnmounted(() => {
  if (animationFrame) cancelAnimationFrame(animationFrame);
  window.removeEventListener('resize', resize);
});

const buffItems = [
    { id: 'doubleScore', name: 'Double Score', cost: 5, desc: '2x → 3x → 5x Base Points' },
    { id: 'aimAssist', name: 'Aim Assist', cost: 10, desc: 'Nudging ball to rim' },
    { id: 'biggerBall', name: 'Bigger Ball', cost: 25, desc: 'Easier to fit in rim' },
    { id: 'magnetRim', name: 'Magnet Rim', cost: 50, desc: 'Pulls ball when close' },
    { id: 'portalShot', name: 'Portal Shot', cost: 150, desc: 'Teleport to rim' },
    { id: 'railgunMode', name: 'Railgun Mode', cost: 300, desc: 'Straight shot on click' },
    { id: 'multiBall', name: 'Multi Ball', cost: 600, desc: '2-5 balls per shot' },
    { id: 'catchingSystem', name: 'Catching System', cost: 1200, desc: 'Forces ball in (Absurd)' },
];

const skins = [
    { id: 'cat_default', name: 'Default Cat', cost: 0 },
    { id: 'cat_sunglasses', name: 'Sunglasses Cat', cost: 50 },
    { id: 'cat_business', name: 'CEO Cat', cost: 200 },
    { id: 'cat_crying', name: 'Sob Cat', cost: 500 }
];

const worlds = [
    { id: 'bg_white', name: 'White (Default)', type: 'bg', cost: 0 },
    { id: 'bg_grass', name: 'Grass Field', type: 'bg', cost: 40 },
    { id: 'bg_space', name: 'Space', type: 'bg', cost: 100 },
    { id: 'bg_classroom', name: 'Classroom', type: 'bg', cost: 250 },
    { id: 'bg_meme', name: 'Meme Chaos', type: 'bg', cost: 1000 },
];

const audiences = [
    { id: 'aud_none', name: 'No Audience', type: 'aud', cost: 0 },
    { id: 'aud_cheering', name: 'Cheering Cats', type: 'aud', cost: 80 },
    { id: 'aud_dancing', name: 'Dancing Cats', type: 'aud', cost: 200 },
    { id: 'aud_chaotic', name: 'Completely Chaotic Crowd', type: 'aud', cost: 600 }
];

const musics = [
    { id: 'music_jazz', name: 'Jazz (Default)', type: 'music', cost: 0 },
    { id: 'music_lofi', name: 'Lo-Fi', type: 'music', cost: 50 },
    { id: 'music_chaotic', name: 'Chaotic Meme Beat', type: 'music', cost: 300 }
];
</script>

<template>
  <div class="cat-game-root">
    <div class="game-hud">
      <div class="hud-left">
        <button class="game-btn exit" @click="emit('back')">EXIT</button>
        <div class="score-card">
          <span class="label">SCORE:</span>
          <span class="score-val">{{ score === Infinity ? 'ERROR' : score }}</span>
        </div>
      </div>
      <button class="game-btn shop" @click="showShop = !showShop">
          {{ showShop ? 'CLOSE' : 'SHOP' }}
      </button>
    </div>

    <!-- ROTATE DEVICE OVERLAY FOR MOBILE PORTRAIT -->
    <div class="portrait-overlay">
        <div class="rotate-content">
            <div class="phone-icon">📱</div>
            <h2>WADUH!</h2>
            <p>Puter HP kamu dulu biar bisa main seru!</p>
            <div class="sub">Gunakan Mode Landscape</div>
        </div>
    </div>

    <!-- CTA MODAL -->
    <div class="cta-modal" v-if="score > 200 && score < 700 && showCTA">
        <div class="modal-content">
            <button class="close-x" @click="showCTA = false">×</button>
            <div class="icon">🚀</div>
            <h3>Building something bigger?</h3>
            <p>Our studio specializes in premium experiences like this one.</p>
            <div class="modal-actions">
                <router-link to="/work" class="btn-primary">Our Portfolio</router-link>
                <button class="btn-link" @click="score += 1000; showCTA = false">Skip (Get 1000 pts)</button>
            </div>
        </div>
    </div>

    <canvas ref="canvasRef" 
        @mousedown="handlePointerDown" @mousemove="handlePointerMove" @mouseup="handlePointerUp"
        @touchstart.passive="handlePointerDown" @touchmove.passive="handlePointerMove" @touchend.passive="handlePointerUp">
    </canvas>

    <div v-if="gameMessage" class="crash-screen">
        <div class="glitch-text" :data-text="gameMessage">{{ gameMessage }}</div>
        <button @click="emit('back')" class="restart-btn">RESET UNIVERSE</button>
    </div>

    <Transition name="slide-shop">
        <div class="shop-overlay" v-if="showShop">
            <div class="shop-header">
                <div class="header-left">
                    <h2>THE ABSURDITY EMPORIUM</h2>
                    <div class="user-pts">{{ score === Infinity ? 'MAX' : score }} PTS</div>
                </div>
                <button class="game-btn close-shop" @click="showShop = false">BACK TO GAME</button>
            </div>
            
            <div class="shop-scroll">
                <h1 class="cosmetic-title">B. Buff System (Core Progression)</h1>
                <section class="shop-section">
                    <header>TOTAL: 8 BUFF UTAMA</header>
                    <div class="item-grid">
                        <div v-for="b in buffItems" :key="b.id" class="shop-item buff" 
                             :class="{ 'owned': purchased.has(b.id), 'poor': score < getBuffCost(b) }" 
                             @click="handleItemClick(b, 'buff')">
                            <span class="name">{{ b.name }}</span>
                            <span class="desc" style="font-size: 0.7rem; opacity: 0.7; margin: 4px 0;">{{ b.desc }}</span>
                            <span class="status">{{ getBuffCost(b) }} pts</span>
                            <small v-if="purchased.has(b.id)" class="lv">UPGRADE</small>
                            <small v-else class="lv">BUY</small>
                        </div>
                    </div>
                </section>

                <h1 class="cosmetic-title">A. Cosmetic (Low Impact, High Personality)</h1>

                <section class="shop-section">
                    <header>BACKGROUNDS</header>
                    <div class="item-grid">
                        <div v-for="w in worlds" :key="w.id" class="shop-item world" 
                             :class="{ 'owned': purchased.has(w.id), 'active': equipped.has(w.id), 'poor': !purchased.has(w.id) && score < w.cost }" 
                             @click="handleItemClick(w, 'bg')">
                            <span class="name">{{ w.name }}</span>
                            <span class="status" v-if="!purchased.has(w.id)">{{ w.cost }} pts</span>
                            <span class="status" v-else>{{ equipped.has(w.id) ? 'AKTIF' : 'AKTIFKAN' }}</span>
                        </div>
                    </div>
                </section>

                <section class="shop-section">
                    <header>CAT SKINS</header>
                    <div class="item-grid">
                        <div v-for="s in skins" :key="s.id" class="shop-item skin" 
                             :class="{ 'owned': purchased.has(s.id), 'active': equipped.has(s.id), 'poor': !purchased.has(s.id) && score < s.cost }" 
                             @click="handleItemClick(s, 'skin')">
                            <span class="name">{{ s.name }}</span>
                            <span class="status" v-if="!purchased.has(s.id)">{{ s.cost }} pts</span>
                            <span class="status active" v-else>{{ equipped.has(s.id) ? 'DIPAKAI' : 'PILIH' }}</span>
                        </div>
                    </div>
                </section>

                <section class="shop-section">
                    <header>AUDIENCE</header>
                    <div class="item-grid">
                        <div v-for="a in audiences" :key="a.id" class="shop-item world" 
                             :class="{ 'owned': purchased.has(a.id), 'active': equipped.has(a.id), 'poor': !purchased.has(a.id) && score < a.cost }" 
                             @click="handleItemClick(a, 'aud')">
                            <span class="name">{{ a.name }}</span>
                            <span class="status" v-if="!purchased.has(a.id)">{{ a.cost }} pts</span>
                            <span class="status" v-else>{{ equipped.has(a.id) ? 'DILIHAT' : 'LIHAT' }}</span>
                        </div>
                    </div>
                </section>

                <section class="shop-section">
                    <header>MUSIC</header>
                    <div class="item-grid">
                        <div v-for="m in musics" :key="m.id" class="shop-item world" 
                             :class="{ 'owned': purchased.has(m.id), 'active': equipped.has(m.id), 'poor': !purchased.has(m.id) && score < m.cost }" 
                             @click="handleItemClick(m, 'music')">
                            <span class="name">{{ m.name }}</span>
                            <span class="status" v-if="!purchased.has(m.id)">{{ m.cost }} pts</span>
                            <span class="status" v-else>{{ equipped.has(m.id) ? 'DIPUTAR' : 'PUTAR' }}</span>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    </Transition>
  </div>
</template>

<style scoped>
.cat-game-root {
  width: 100%; height: 100%; position: relative; overflow: hidden;
  background: #000; font-family: 'Inter', sans-serif;
}
canvas { width: 100%; height: 100%; touch-action: none; display: block; }

.game-hud {
  position: absolute; top: 0; left: 0; width: 100%; padding: 20px;
  display: flex; justify-content: space-between; align-items: start; z-index: 100;
  pointer-events: none;
}
.hud-left { display: flex; gap: 20px; align-items: center; pointer-events: auto; }

.game-btn {
    background: rgba(26, 11, 46, 0.9); border: 2px solid #d4af37; color: #d4af37;
    padding: 12px 30px; border-radius: 40px; cursor: pointer; font-weight: 800;
    pointer-events: auto; transition: 0.2s; letter-spacing: 1px;
}
.game-btn:hover { background: #d4af37; color: #1a0b2e; transform: translateY(-2px); }
.game-btn.close-shop { background: #d4af37; color: #1a0b2e; }
.game-btn.close-shop:hover { background: #fff; }

.score-card {
    background: rgba(26, 11, 46, 0.8); padding: 8px 25px; border-radius: 40px;
    border: 1px solid rgba(212, 175, 55, 0.4); display: flex; align-items: center; gap: 10px;
}
.score-card .label { font-size: 0.8rem; color: #d4af37; font-weight: 800; }
.score-card .score-val { font-size: 1.8rem; font-weight: 900; color: #fff; }

.cta-modal {
    position: absolute; inset: 0; background: rgba(0,0,0,0.8);
    display: flex; justify-content: center; align-items: center; z-index: 1000;
    backdrop-filter: blur(5px);
}
.modal-content {
    background: #1a0b2e; border: 3px solid #d4af37; padding: 40px;
    border-radius: 30px; text-align: center; max-width: 450px; position: relative;
    box-shadow: 0 0 100px rgba(212, 175, 55, 0.3);
}
.close-x { position: absolute; top: 15px; right: 20px; background: none; border: none; font-size: 2rem; color: #d4af37; cursor: pointer; }
.modal-content .icon { font-size: 4rem; margin-bottom: 20px; }
.modal-content h3 { font-family: 'Playfair Display', serif; font-size: 2rem; color: #fff; margin-bottom: 15px; }
.modal-content p { color: rgba(255,255,255,0.7); line-height: 1.6; margin-bottom: 30px; }
.modal-actions { display: flex; flex-direction: column; gap: 15px; }
.btn-primary { background: #d4af37; color: #1a0b2e; padding: 15px; border-radius: 40px; text-decoration: none; font-weight: 800; font-size: 1.1rem; }
.btn-link { background: none; border: none; color: #d4af37; text-decoration: underline; cursor: pointer; }

.shop-overlay {
  position: absolute; inset: 0; background: rgba(13, 2, 22, 0.98);
  backdrop-filter: blur(20px); z-index: 200; overflow: hidden;
  display: flex; flex-direction: column;
}
.shop-header { padding: 40px; border-bottom: 1px solid rgba(212, 175, 55, 0.2); display: flex; justify-content: space-between; align-items: center; }
.header-left { display: flex; flex-direction: column; gap: 5px; }
.shop-header h2 { font-family: 'Playfair Display', serif; color: #d4af37; font-size: 2.2rem; letter-spacing: 5px; margin: 0; }
.cosmetic-title { color: #fff; font-size: 1.5rem; margin-bottom: 30px; border-left: 4px solid #d4af37; padding-left: 15px; opacity: 0.9; }
.user-pts { font-weight: 900; font-size: 1.4rem; color: #fff; opacity: 0.8; }

.shop-scroll { flex: 1; overflow-y: auto; padding: 40px; }
.shop-section { margin-bottom: 60px; }
.shop-section header { font-size: 0.9rem; color: #d4af37; opacity: 0.6; letter-spacing: 4px; margin-bottom: 25px; font-weight: 800; text-transform: uppercase; }
.item-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; }

.shop-item {
    background: rgba(255, 255, 255, 0.03); border: 2px solid rgba(212, 175, 55, 0.15);
    padding: 25px; border-radius: 20px; cursor: pointer; transition: 0.3s cubic-bezier(0.23, 1, 0.32, 1);
    display: flex; flex-direction: column; align-items: center; text-align: center;
}
.shop-item:hover:not(.poor) { transform: translateY(-8px); border-color: #d4af37; background: rgba(212, 175, 55, 0.05); }

.shop-item.active { background: #d4af37; border-color: #fff; box-shadow: 0 0 20px rgba(212, 175, 55, 0.4); }
.shop-item.active .name { color: #000 !important; font-weight: 900; }
.shop-item.active .status { color: #000 !important; opacity: 0.8; font-weight: 800; }

.shop-item.poor { opacity: 0.3; cursor: default; }
.shop-item .name { font-weight: 700; font-size: 1.1rem; color: #fff; margin-bottom: 8px; }
.shop-item .status { font-weight: 600; color: #d4af37; font-size: 0.85rem; text-transform: uppercase; }
.lv { font-size: 0.75rem; color: #d4af37; margin-top: 5px; font-weight: 800; }

.crash-screen {
    position: absolute; inset: 0; background: #900; z-index: 3000;
    display: flex; flex-direction: column; justify-content: center; align-items: center;
    background: radial-gradient(circle, #f00 0%, #000 100%);
}
.glitch-text { font-size: 4rem; color: #fff; font-weight: 900; position: relative; text-align: center; }
.restart-btn { margin-top: 50px; background: #fff; color: #000; padding: 25px 60px; font-size: 2rem; font-weight: 900; border: none; cursor: pointer; }

/* Animation */
.slide-shop-enter-active, .slide-shop-leave-active { transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1); }
.slide-shop-enter-from, .slide-shop-leave-to { transform: translateY(100%); }

/* Responsive & Orientation */
.portrait-overlay {
    position: absolute; inset: 0; background: #0d0216; z-index: 5000;
    display: none; flex-direction: column; justify-content: center; align-items: center;
    text-align: center; color: #fff; padding: 20px;
}

@media (orientation: portrait) and (max-width: 900px) {
    .portrait-overlay { display: flex; }
    .game-hud, canvas, .shop-overlay { display: none !important; }
}

.rotate-content .phone-icon {
    font-size: 5rem; margin-bottom: 20px;
    animation: rotatePhone 2s infinite ease-in-out;
}
@keyframes rotatePhone {
    0% { transform: rotate(0deg); }
    50% { transform: rotate(-90deg); }
    100% { transform: rotate(0deg); }
}
.rotate-content h2 { font-family: 'Playfair Display', serif; color: #d4af37; font-size: 2.5rem; margin: 0; }
.rotate-content p { font-size: 1.2rem; opacity: 0.8; margin: 10px 0; }
.rotate-content .sub { font-size: 0.8rem; letter-spacing: 2px; text-transform: uppercase; color: #d4af37; opacity: 0.6; }

@media (max-width: 768px) {
    .game-hud { padding: 10px; }
    .score-card { padding: 4px 15px; }
    .score-card .score-val { font-size: 1.2rem; }
    .game-btn { padding: 8px 20px; font-size: 0.8rem; }
    
    .item-grid { grid-template-columns: 1fr 1fr; }
    .shop-header h2 { font-size: 1.4rem; letter-spacing: 2px; }
    .shop-header { padding: 20px; }
    .shop-scroll { padding: 20px; }
    .cosmetic-title { font-size: 1.1rem; }
}
</style>

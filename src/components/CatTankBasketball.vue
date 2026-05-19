<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import gsap from 'gsap';

// Assets
import catDefault from '@/assets/cat-tank.png';
import catSunglasses from '@/assets/cat-tank-sunglasses.png';
import catBusiness from '@/assets/cat-tank-business.png';
import catCrying from '@/assets/cat-tank-crying.png';
import bgGrassImgSrc from '@/assets/bg-grass.png';
import bgClassroomImgSrc from '@/assets/bg-classroom.png';
import bgBumiImgSrc from '@/assets/bg-bumi.png';
import bgCometImgSrc from '@/assets/bg-comet.png';
import bgUfoImgSrc from '@/assets/bg-ufo.png';
import bgBulanImgSrc from '@/assets/bg-bulan.png';
import bgAsteroidImgSrc from '@/assets/bg-asteroid.png';
import bgChaosImgSrc from '@/assets/bg-chaos.png';

// Audience
import cheeringCatImgSrc from '@/assets/cheering-cat.png';
import dancingCatImgSrc from '@/assets/dancing-cat.png';
import chaoticAudienceImgSrc from '@/assets/chaotic-audience.png';

// New Tank Assets
import partUnion from '@/assets/union-1.png';
import partR2 from '@/assets/rectangle-2.png';
import partR4 from '@/assets/rectangle-4.png';
import partR5 from '@/assets/rectangle-5.png';
import partR6 from '@/assets/rectangle-6.png';
import partR7 from '@/assets/rectangle-7.png';
import partR8 from '@/assets/rectangle-8.png';
import partR9 from '@/assets/rectangle-9.png';

const emit = defineEmits(['back']);

// Game Constants
const GRAVITY = 0.25;

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

const buffLevels = ref({
  doubleScore: 0,
  aimAssist: 0,
  biggerBall: 0,
  multiBall: 0
});

const getBuffLevel = (item) => {
    const isOneTime = ['magnetRim', 'portalShot', 'railgunMode', 'catchingSystem'].includes(item.id);
    return isOneTime ? (purchased.value.has(item.id) ? 1 : 0) : (buffLevels.value[item.id] || 0);
};

const getBuffMaxLevel = (item) => {
    const isOneTime = ['magnetRim', 'portalShot', 'railgunMode', 'catchingSystem'].includes(item.id);
    return isOneTime ? 1 : 3;
};

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

const tankParts = {
    union: new Image(), r2: new Image(), r4: new Image(), r5: new Image(),
    r6: new Image(), r7: new Image(), r8: new Image(), r9: new Image()
};
tankParts.union.src = partUnion;
tankParts.r2.src = partR2;
tankParts.r4.src = partR4;
tankParts.r5.src = partR5;
tankParts.r6.src = partR6;
tankParts.r7.src = partR7;
tankParts.r8.src = partR8;
tankParts.r9.src = partR9;

const bgGrassImg = new Image(); 
bgGrassImg.src = bgGrassImgSrc;

const bgClassroomImg = new Image();
bgClassroomImg.src = bgClassroomImgSrc;

const bgBumiImg = new Image();
bgBumiImg.src = bgBumiImgSrc;

const bgCometImg = new Image();
bgCometImg.src = bgCometImgSrc;

const bgUfoImg = new Image();
bgUfoImg.src = bgUfoImgSrc;

const bgBulanImg = new Image();
bgBulanImg.src = bgBulanImgSrc;

const bgAsteroidImg = new Image();
bgAsteroidImg.src = bgAsteroidImgSrc;

const bgChaosImg = new Image();
bgChaosImg.src = bgChaosImgSrc;

const audienceImages = {
    cheering: new Image(),
    dancing: new Image(),
    chaotic: new Image()
};
audienceImages.cheering.src = cheeringCatImgSrc;
audienceImages.dancing.src = dancingCatImgSrc;
audienceImages.chaotic.src = chaoticAudienceImgSrc;

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
const gameWidth = ref(0);
const gameHeight = ref(0);

const dynamicScale = computed(() => {
  if (gameWidth.value === 0) return 1.0;
  if (gameWidth.value < 768) {
    return 0.55;
  } else if (gameWidth.value < 1024) {
    return 0.75;
  }
  return 1.0;
});

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

// Initialize state for space bg objects
const spaceBgState = ref({
    initialized: false,
    asteroids: [],
    ufo: { x: 0, y: 0, targetX: 0, targetY: 0, angle: 0, scale: 1, timer: 0 },
    comet: { x: 0, y: 0, vx: 0, vy: 0, active: false, timer: 0, particles: [] },
    stars: []
});

const initSpaceBgObjects = () => {
    const width = gameWidth.value || 1200;
    const height = gameHeight.value || 800;

    const stars = [];
    const starCount = 50;
    for (let i = 0; i < starCount; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * (height * 0.7),
            size: Math.random() * 1.5 + 0.5,
            alpha: Math.random(),
            speed: 0.01 + Math.random() * 0.02
        });
    }
    spaceBgState.value.stars = stars;
    
    spaceBgState.value.asteroids = [
        {
            x: width * 0.15,
            y: height * 0.2,
            size: 60,
            angle: Math.random() * Math.PI * 2,
            rotSpeed: 0.005,
            driftX: 0.2,
            driftY: 0.05,
            floatOffset: 0
        },
        {
            x: width * 0.8,
            y: height * 0.15,
            size: 45,
            angle: Math.random() * Math.PI * 2,
            rotSpeed: -0.008,
            driftX: -0.15,
            driftY: 0.08,
            floatOffset: Math.PI / 2
        },
        {
            x: width * 0.5,
            y: height * 0.08,
            size: 30,
            angle: Math.random() * Math.PI * 2,
            rotSpeed: 0.01,
            driftX: 0.1,
            driftY: -0.05,
            floatOffset: Math.PI
        }
    ];

    spaceBgState.value.ufo = {
        x: width * 0.85,
        y: height * 0.35,
        targetX: width * 0.85,
        targetY: height * 0.35,
        angle: 0,
        scale: 1,
        timer: 0
    };

    spaceBgState.value.comet = {
        x: -200,
        y: -200,
        vx: 0,
        vy: 0,
        active: false,
        timer: Math.random() * 300 + 200,
        particles: []
    };

    spaceBgState.value.initialized = true;
};

const updateSpaceBg = () => {
    if (!spaceBgState.value.initialized) {
        initSpaceBgObjects();
        return;
    }

    const width = gameWidth.value || 1200;
    const height = gameHeight.value || 800;
    const time = Date.now();

    // 1. Update Asteroids
    spaceBgState.value.asteroids.forEach(ast => {
        ast.angle += ast.rotSpeed;
        ast.x += ast.driftX * dynamicScale.value;
        ast.y += ast.driftY * dynamicScale.value;

        const floatY = Math.sin(time * 0.001 + ast.floatOffset) * 0.2;
        ast.y += floatY;

        if (ast.x < -100) ast.x = width + 100;
        if (ast.x > width + 100) ast.x = -100;
        if (ast.y < -100) ast.y = height + 100;
        if (ast.y > height + 100) ast.y = -100;
    });

    // 2. Update UFO
    const ufo = spaceBgState.value.ufo;
    ufo.timer++;
    
    if (ufo.timer % 150 === 0 || Math.random() < 0.005) {
        ufo.targetX = width * (0.6 + Math.random() * 0.3);
        ufo.targetY = height * (0.1 + Math.random() * 0.3);
    }

    ufo.x += (ufo.targetX - ufo.x) * 0.02;
    ufo.y += (ufo.targetY - ufo.y) * 0.02;

    const dx = ufo.targetX - ufo.x;
    ufo.angle = (dx * 0.001) + Math.sin(time * 0.002) * 0.05;

    // 3. Update Comet
    const comet = spaceBgState.value.comet;
    if (comet.active) {
        comet.x += comet.vx * dynamicScale.value;
        comet.y += comet.vy * dynamicScale.value;

        if (Math.random() < 0.6) {
            comet.particles.push({
                x: comet.x - comet.vx * 1.5,
                y: comet.y - comet.vy * 1.5,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                life: 1.0,
                color: `rgba(${180 + Math.random() * 75}, ${180 + Math.random() * 75}, 255, 0.7)`
            });
        }

        if (comet.x < -200 || comet.y > height + 200) {
            comet.active = false;
            comet.timer = Math.random() * 400 + 300;
        }
    } else {
        comet.timer--;
        if (comet.timer <= 0) {
            comet.active = true;
            comet.x = width * (0.8 + Math.random() * 0.3);
            comet.y = -100;
            const angle = Math.PI * 0.75 + (Math.random() - 0.5) * 0.15;
            const speed = 15 + Math.random() * 10;
            comet.vx = Math.cos(angle) * speed;
            comet.vy = Math.sin(angle) * speed;
        }
    }

    for (let i = comet.particles.length - 1; i >= 0; i--) {
        const p = comet.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.04;
        if (p.life <= 0) comet.particles.splice(i, 1);
    }

    // 4. Update Twinkling Stars
    spaceBgState.value.stars.forEach(star => {
        star.alpha += star.speed;
        if (star.alpha > 1 || star.alpha < 0.2) {
            star.speed = -star.speed;
        }
    });
};

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
  gameWidth.value = parent.clientWidth;
  gameHeight.value = parent.clientHeight;
  canvasRef.value.width = gameWidth.value;
  canvasRef.value.height = gameHeight.value;
  tank.x = 100 * dynamicScale.value;
  tank.y = gameHeight.value - 140 * dynamicScale.value;
  createAudience();
  initSpaceBgObjects();
};

const createAudience = () => {
    audienceCats = [];
    if (equipped.value.has('aud_none')) return;
    
    // If chaotic is equipped, just spawn ONE giant chaotic crowd asset
    if (equipped.value.has('aud_chaotic')) {
        audienceCats.push({
            x: gameWidth.value * 0.5,
            y: gameHeight.value + 10 * dynamicScale.value,
            size: gameHeight.value * 0.6, // scale to 60% of game height
            jump: 0,
            offset: 0,
            type: 'chaotic',
            scaleX: 1
        });
        return;
    }
    
    let count = 3;
    if (equipped.value.has('aud_dancing')) count = 3;

    const positions = [
        { x: gameWidth.value * 0.25, yOffset: 10 * dynamicScale.value },   // Kiri
        { x: gameWidth.value * 0.75, yOffset: 10 * dynamicScale.value },   // Kanan
        { x: gameWidth.value * 0.5, yOffset: 60 * dynamicScale.value }     // Tengah agak atas
    ];

    for (let i = 0; i < count; i++) {
        let catType = 'cheering';
        if (equipped.value.has('aud_dancing')) catType = 'dancing';

        let posX = positions[i].x;
        let posY = gameHeight.value - positions[i].yOffset;

        audienceCats.push({
            x: posX,
            y: posY,
            size: (280 + Math.random() * 50) * dynamicScale.value,
            jump: 0,
            offset: Math.random() * Math.PI * 2,
            type: catType,
            scaleX: 1
        });
    }
};

const resetRim = () => {
  rim.width = 100 * dynamicScale.value;
  rim.height = 120 * dynamicScale.value;

  // Ensure the ring spawns in front of the tank (tank is at x: 100 * dynamicScale.value)
  // Safely place it in the right half of the screen
  const minX = Math.max(300 * dynamicScale.value, gameWidth.value * 0.4);
  const maxX = gameWidth.value * 0.85;
  rim.x = minX + Math.random() * (maxX - minX);
  rim.y = (0.2 + Math.random() * 0.4) * gameHeight.value;
  
  if (purchased.value.has('portalShot')) {
      portal.active = true;
      portal.x1 = rim.x - 200 * dynamicScale.value + Math.random() * 100 * dynamicScale.value;
      portal.y1 = rim.y + 100 * dynamicScale.value + Math.random() * 100 * dynamicScale.value;
      portal.x2 = rim.x + 50 * dynamicScale.value;
      portal.y2 = rim.y - 50 * dynamicScale.value;
  } else {
      portal.active = false;
  }
  
  gsap.from(rim, { opacity: 0, y: "-=50", duration: 0.5, ease: "back.out" });
};

const fireBall = (customAngle = null, customPower = null) => {
  const angle = customAngle !== null ? customAngle : tank.angle;
  const power = customPower !== null ? customPower : tank.power;
  
  const ballCount = buffValues.value.multiBall;
  const ballRadius = buffValues.value.biggerBall * dynamicScale.value;
  
  const pivotX = tank.x + 75 * dynamicScale.value;
  const pivotY = tank.y + 45.4 * dynamicScale.value;
  const barrelLength = 104 * dynamicScale.value;

  for (let i = 0; i < ballCount; i++) {
    const spread = (i - (ballCount - 1) / 2) * 0.15;
    balls.push({
      x: pivotX + Math.cos(angle) * barrelLength,
      y: pivotY + Math.sin(angle) * barrelLength,
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
      const pivotX = tank.x + 75 * dynamicScale.value;
      const pivotY = tank.y + 45.4 * dynamicScale.value;
      
      let angle = Math.atan2(pos.y - pivotY, pos.x - pivotX);
      if (angle > Math.PI / 2) angle = Math.PI / 2;
      if (angle < -Math.PI / 2) angle = -Math.PI / 2;
      tank.angle = angle;
      
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
  
  let angle = Math.atan2(pos.y - dragStartY, pos.x - dragStartX);
  if (angle > Math.PI / 2) angle = Math.PI / 2;
  if (angle < -Math.PI / 2) angle = -Math.PI / 2;
  tank.angle = angle;

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
    const rimCenterY = rim.y + 20 * dynamicScale.value;
    const dx = rimCenterX - b.x;
    const dy = rimCenterY - b.y;
    const dist = Math.sqrt(dx*dx + dy*dy);

    const isMagnet = purchased.value.has('magnetRim');
    const isCatching = purchased.value.has('catchingSystem');

    if (isMagnet || isCatching) {
        const range = (isCatching ? 300 : 150) * dynamicScale.value;
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
    if (dist < 60 * dynamicScale.value && b.vy > 0) {
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
        if (pdist < 40 * dynamicScale.value) {
            b.x = portal.x2;
            b.y = portal.y2;
            b.vx = 0; b.vy = 5; // Drop it straight in
            createBurst(portal.x1, portal.y1, "#6366f1");
            createBurst(portal.x2, portal.y2, "#6366f1");
        }
    }

    if (b.y > gameHeight.value + 100 || b.x > gameWidth.value + 100 || b.x < -100) balls.splice(i, 1);
  }

  // Particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx; p.y += p.vy; p.life -= 0.02;
    if (p.life <= 0) particles.splice(i, 1);
  }

  // Auto Shoot
  if (purchased.value.has('autoShooter') && Math.random() < 0.04) {
    const pivotX = tank.x + 75 * dynamicScale.value;
    const pivotY = tank.y + 45.4 * dynamicScale.value;
    const dx = (rim.x + rim.width/2) - pivotX;
    const dy = (rim.y + 20 * dynamicScale.value) - pivotY;
    fireBall(Math.atan2(dy - 120 * dynamicScale.value, dx), 18);
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
  
  // 1. Background
  if (equipped.value.has('bg_grass') && bgGrassImg.complete) {
      ctx.drawImage(bgGrassImg, 0, 0, gameWidth.value, gameHeight.value);
  } else if (equipped.value.has('bg_space')) {
      // 1. Draw Space background (bgBumiImg is the full screen backdrop)
      if (bgBumiImg.complete) {
          ctx.drawImage(bgBumiImg, 0, 0, gameWidth.value, gameHeight.value);
      } else {
          ctx.fillStyle = '#05070c';
          ctx.fillRect(0, 0, gameWidth.value, gameHeight.value);
      }

      // Update space background animations
      updateSpaceBg();

      // Draw Twinkling Stars on top of the sky area
      spaceBgState.value.stars.forEach(star => {
          ctx.save();
          ctx.globalAlpha = Math.max(0.2, Math.min(1, star.alpha));
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * dynamicScale.value, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
      });

      // 3. Draw Comet (bgCometImg) & its particles trail
      const comet = spaceBgState.value.comet;
      comet.particles.forEach(p => {
          ctx.save();
          ctx.globalAlpha = p.life;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, (3 + Math.random() * 3) * dynamicScale.value, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
      });

      if (comet.active && bgCometImg.complete) {
          ctx.save();
          ctx.translate(comet.x, comet.y);
          const angle = Math.atan2(comet.vy, comet.vx);
          ctx.rotate(angle);
          const cometW = 120 * dynamicScale.value;
          const cometH = 40 * dynamicScale.value;
          ctx.drawImage(bgCometImg, -cometW / 2, -cometH / 2, cometW, cometH);
          ctx.restore();
      }

      // 4. Draw UFO (bgUfoImg)
      const ufo = spaceBgState.value.ufo;
      if (bgUfoImg.complete) {
          ctx.save();
          const bob = Math.sin(Date.now() * 0.003) * 6 * dynamicScale.value;
          ctx.translate(ufo.x, ufo.y + bob);
          ctx.rotate(ufo.angle);
          const ufoW = 85 * dynamicScale.value;
          const ufoH = 65 * dynamicScale.value;
          ctx.drawImage(bgUfoImg, -ufoW / 2, -ufoH / 2, ufoW, ufoH);
          ctx.restore();
      }

      // 5. Draw Asteroids (bgAsteroidImg)
      if (bgAsteroidImg.complete) {
          spaceBgState.value.asteroids.forEach(ast => {
              ctx.save();
              ctx.translate(ast.x, ast.y);
              ctx.rotate(ast.angle);
              const size = ast.size * dynamicScale.value;
              ctx.drawImage(bgAsteroidImg, -size / 2, -size / 2, size, size);
              ctx.restore();
          });
      }

      // 6. Draw Moon Floor (bgBulanImg)
      if (bgBulanImg.complete) {
          const moonHeight = Math.max(160, gameHeight.value * 0.28);
          ctx.drawImage(bgBulanImg, 0, gameHeight.value - moonHeight, gameWidth.value, moonHeight);
      }
  } else if (equipped.value.has('bg_classroom') && bgClassroomImg.complete) {
      ctx.drawImage(bgClassroomImg, 0, 0, gameWidth.value, gameHeight.value);
  } else if (equipped.value.has('bg_meme') && bgChaosImg.complete) {
      ctx.save();
      const shakeAmount = 25 * dynamicScale.value;
      const rx = (Math.random() - 0.5) * shakeAmount;
      const ry = (Math.random() - 0.5) * shakeAmount;
      ctx.translate(rx - shakeAmount, ry - shakeAmount);
      ctx.drawImage(bgChaosImg, 0, 0, gameWidth.value + shakeAmount * 2, gameHeight.value + shakeAmount * 2);
      ctx.restore();
  } else {
      ctx.fillStyle = getBgColor();
      ctx.fillRect(0, 0, gameWidth.value, gameHeight.value);
  }

  if (absurdityLevel.value >= 2) drawChaos();

  // 2. Audience
  audienceCats.forEach(cat => {
      const time = Date.now() * 0.01;
      if (cat.type === 'dancing') {
          cat.jump = Math.abs(Math.sin(time + cat.offset)) * 20 * dynamicScale.value;
          cat.x += Math.sin(time * 0.5 + cat.offset) * 2;
      } else if (cat.type === 'chaotic') {
          // Intense vibrating and small bobbing for the large crowd asset
          cat.jump = Math.abs(Math.sin(time * 5 + cat.offset)) * 10 * dynamicScale.value; 
          // Small horizontal shake without drifting
          const shake = Math.sin(time * 15) * 5 * dynamicScale.value;
          
          const img = audienceImages[cat.type];
          if (img && img.complete) {
              const aspectRatio = img.width / img.height;
              const drawHeight = cat.size;
              const drawWidth = cat.size * aspectRatio;
              
              ctx.save();
              ctx.translate(cat.x + shake, cat.y - cat.jump);
              ctx.scale(cat.scaleX, 1);
              ctx.drawImage(img, -drawWidth/2, -drawHeight, drawWidth, drawHeight);
              ctx.restore();
          }
          return; // Skip the generic drawing below to prevent double draw
      } else {
          cat.jump = Math.sin(time + cat.offset) * 8 * dynamicScale.value;
      }
      
      const img = audienceImages[cat.type];
      if (img && img.complete) {
          const aspectRatio = img.width / img.height;
          const drawHeight = cat.size;
          const drawWidth = cat.size * aspectRatio;

          ctx.save();
          ctx.translate(cat.x, cat.y - cat.jump);
          ctx.scale(cat.scaleX, 1);
          ctx.drawImage(img, -drawWidth/2, -drawHeight, drawWidth, drawHeight);
          ctx.restore();
      }
  });

  // Tank
  ctx.save();
  ctx.translate(tank.x + 60 * dynamicScale.value, tank.y + 50 * dynamicScale.value);
  
  const scale = 0.45 * dynamicScale.value;
  const trackY = 32 * dynamicScale.value;
  const bodyOverlapY = 26 * dynamicScale.value; // Sink the body even deeper
  const unionY = trackY - tankParts.union.height * scale + bodyOverlapY;
  
  // 1) Draw Rotating Barrel (moncong tank) FIRST so its base is inside/behind the tank body
  ctx.save();
  const domeCenterX = 20 * dynamicScale.value; // Geser pivot maju sedikit
  const domeCenterY = unionY + (tankParts.union.height * scale)/2 - 16 * dynamicScale.value; // local pivot, shifted UP by 16px
  ctx.translate(domeCenterX, domeCenterY); 
  ctx.rotate(tank.angle);
  
  // r4 (barrel)
  if (tankParts.r4.complete) ctx.drawImage(tankParts.r4, 0, -tankParts.r4.height/2 * scale, tankParts.r4.width * scale, tankParts.r4.height * scale);
  // r5 (barrel tip) - shift slightly upward visually
  if (tankParts.r5.complete) ctx.drawImage(tankParts.r5, tankParts.r4.width * scale - 2 * dynamicScale.value, -tankParts.r5.height/2 * scale - 4 * dynamicScale.value, tankParts.r5.width * scale, tankParts.r5.height * scale);
  ctx.restore();

  // 2) Draw Body (Dome) SECOND so it covers the base of the barrel
  if (tankParts.union.complete) ctx.drawImage(tankParts.union, -tankParts.union.width/2 * scale, unionY, tankParts.union.width * scale, tankParts.union.height * scale);

  // 3) Draw Tracks (Wheels) LAST so they cover the bottom of the body, giving the 'masuk ke dalam' effect
  if (tankParts.r2.complete) ctx.drawImage(tankParts.r2, -tankParts.r2.width/2 * scale, trackY, tankParts.r2.width * scale, tankParts.r2.height * scale);

  // 4) Draw Cat (Skin) on top of the Dome
  let skinId = 'default';
  if (equipped.value.has('cat_sunglasses')) skinId = 'sunglasses';
  else if (equipped.value.has('cat_business')) skinId = 'business';
  else if (equipped.value.has('cat_crying')) skinId = 'crying';
  
  const catImg = tankImages[skinId] || tankImages.default;
  if (catImg.complete) {
      const catSize = 140 * dynamicScale.value; // Diperbesar dari 80
      const catX = -(catSize/2);
      const catY = unionY - catSize + 45 * dynamicScale.value; // Sitting slightly inside the dome
      ctx.drawImage(catImg, catX, catY, catSize, catSize);
  }

  ctx.restore();

  // Aim Line (LENGTH BASED ON UPGRADE)
  if (isDragging) {
      const isCustomBg = equipped.value.has('bg_meme') || equipped.value.has('bg_space') || equipped.value.has('bg_classroom');
      ctx.beginPath();
      // Contrast color: Dark purple for light bgs (grass), Gold/Yellow for dark bgs
      ctx.strokeStyle = !isCustomBg ? "rgba(26, 11, 46, 0.6)" : "rgba(212, 175, 55, 0.8)";
      ctx.setLineDash([8, 8]);
      ctx.lineWidth = 4 * dynamicScale.value;
      
      const pivotX = tank.x + 75 * dynamicScale.value;
      const pivotY = tank.y + 45.4 * dynamicScale.value;
      const barrelLength = 104 * dynamicScale.value;
      const startX = pivotX + Math.cos(tank.angle) * barrelLength;
      const startY = pivotY + Math.sin(tank.angle) * barrelLength;
      
      ctx.moveTo(startX, startY);
      
      const steps = 30 + (buffValues.value.aimAssist * 25);
      for (let i = 0; i < steps; i++) {
          const t = i * 1.5;
          const px = startX + Math.cos(tank.angle) * tank.power * t;
          const py = startY + Math.sin(tank.angle) * tank.power * t + 0.5 * GRAVITY * t * t;
          ctx.lineTo(px, py);
      }
      ctx.stroke();
      
      // Outer glow for extra visibility on chaotic backgrounds
      ctx.strokeStyle = !isCustomBg ? "rgba(212, 175, 55, 0.2)" : "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 2 * dynamicScale.value;
      ctx.stroke();
      
      ctx.setLineDash([]);
  }

  // Rim & Balls
  if (portal.active) {
      ctx.lineWidth = 4 * dynamicScale.value;
      ctx.strokeStyle = "#6366f1";
      ctx.beginPath(); ctx.ellipse(portal.x1, portal.y1, 30 * dynamicScale.value, 15 * dynamicScale.value, Math.PI/4, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = "#a855f7";
      ctx.beginPath(); ctx.ellipse(portal.x2, portal.y2, 30 * dynamicScale.value, 15 * dynamicScale.value, -Math.PI/4, 0, Math.PI * 2); ctx.stroke();
  }

  // Custom Rim rendering from Parts
  ctx.save();
  ctx.translate(rim.x, rim.y + 10 * dynamicScale.value);
  const rScale = 0.45 * dynamicScale.value;
  const rimCenterX = rim.width / 2;
  
  if (tankParts.r8.complete) ctx.drawImage(tankParts.r8, rimCenterX - tankParts.r8.width/2 * rScale, 0, tankParts.r8.width * rScale, tankParts.r8.height * rScale);
  if (tankParts.r7.complete) ctx.drawImage(tankParts.r7, rimCenterX - tankParts.r7.width/2 * rScale, tankParts.r8.height * rScale, tankParts.r7.width * rScale, tankParts.r7.height * rScale);
  
  if (tankParts.r6.complete) {
      const poleX = rimCenterX + tankParts.r8.width/2 * rScale;
      const poleY = -tankParts.r6.height * rScale * 0.05; // Extend pole slightly upwards
      ctx.drawImage(tankParts.r6, poleX, poleY, tankParts.r6.width * rScale, tankParts.r6.height * rScale);
      
      if (tankParts.r9.complete) {
          const baseY = poleY + tankParts.r6.height * rScale;
          const baseX = poleX + (tankParts.r6.width * rScale)/2 - (tankParts.r9.width * rScale)/2;
          ctx.drawImage(tankParts.r9, baseX, baseY, tankParts.r9.width * rScale, tankParts.r9.height * rScale);
      }
  }
  ctx.restore();

  balls.forEach(b => {
    ctx.beginPath(); ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fillStyle = b.color; ctx.fill();
    ctx.strokeStyle = "white"; ctx.lineWidth = 2 * dynamicScale.value; ctx.stroke();
  });

  particles.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, 6 * dynamicScale.value, 6 * dynamicScale.value);
      ctx.globalAlpha = 1;
  });

  update();
  animationFrame = requestAnimationFrame(render);
};

const getBgColor = () => {
    if (equipped.value.has('bg_meme')) return `hsl(${Date.now() / 8 % 360}, 60%, 12%)`;
    if (equipped.value.has('bg_space')) return '#020617';
    if (equipped.value.has('bg_classroom')) return '#e2e8f0';
    if (equipped.value.has('bg_grass')) return '#14532d';
    if (equipped.value.has('bg_white')) return '#ffffff';
    return '#ffffff';
};

const drawChaos = () => {
    const t = Date.now() * 0.001;
    ctx.save();
    ctx.globalAlpha = absurdityLevel.value === 3 ? 0.4 : 0.15;
    ctx.fillStyle = "#d4af37";
    ctx.font = "bold 90px Inter";
    ctx.textAlign = "center";
    ctx.fillText("CAT TANK CHAOS", gameWidth.value/2 + Math.sin(t)*50, gameHeight.value/2 + Math.cos(t)*50);
    if (absurdityLevel.value === 3) {
        ctx.strokeStyle = `hsl(${t*100}, 100%, 50%)`;
        ctx.lineWidth = 15;
        ctx.strokeRect(Math.random()*gameWidth.value, Math.random()*gameHeight.value, 300, 300);
    }
    ctx.restore();
};

const getBuffCost = (item) => {
    const currentLevel = getBuffLevel(item);
    return Math.floor(item.cost * Math.pow(1.6, currentLevel));
};

const handleItemClick = (item, type) => {
    if (type === 'buff') {
        if (getBuffLevel(item) >= getBuffMaxLevel(item)) return;

        const cost = getBuffCost(item);
        if (score.value >= cost) {
            score.value -= cost;
            purchased.value.add(item.id);
            
            const isOneTime = ['magnetRim', 'portalShot', 'railgunMode', 'catchingSystem'].includes(item.id);
            if (!isOneTime) {
                buffLevels.value[item.id] = (buffLevels.value[item.id] || 0) + 1;
            }

            switch(item.id) {
                case 'doubleScore': 
                    if (buffLevels.value.doubleScore === 1) buffValues.value.doubleScoreVal = 20;
                    else if (buffLevels.value.doubleScore === 2) buffValues.value.doubleScoreVal = 30;
                    else if (buffLevels.value.doubleScore === 3) buffValues.value.doubleScoreVal = 50;
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
  if (currentAudio.value) {
      currentAudio.value.pause();
      currentAudio.value = null;
  }
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
    { id: 'bg_grass', name: 'Grass Field', type: 'bg', cost: 50 },
    { id: 'bg_space', name: 'Space', type: 'bg', cost: 100 },
    { id: 'bg_classroom', name: 'Classroom', type: 'bg', cost: 300 },
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
            <p>Puter Perangkat kamu dulu biar bisa main seru!</p>
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
                             :class="{ 
                                 'owned': purchased.has(b.id), 
                                 'poor': score < getBuffCost(b) && getBuffLevel(b) < getBuffMaxLevel(b),
                                 'maxed': getBuffLevel(b) >= getBuffMaxLevel(b)
                             }" 
                             @click="handleItemClick(b, 'buff')">
                            <span class="name">{{ b.name }}</span>
                            <span class="desc" style="font-size: 0.7rem; opacity: 0.7; margin: 4px 0;">{{ b.desc }}</span>
                            
                            <span class="status" v-if="getBuffLevel(b) < getBuffMaxLevel(b)">{{ getBuffCost(b) }} pts</span>
                            <span class="status" v-else>MAX</span>
                            
                            <small v-if="getBuffLevel(b) >= getBuffMaxLevel(b)" class="lv">MAX LEVEL</small>
                            <small v-else-if="purchased.has(b.id)" class="lv">UPGRADE ({{ getBuffLevel(b) }}/{{ getBuffMaxLevel(b) }})</small>
                            <small v-else class="lv">BUY</small>
                        </div>
                    </div>
                </section>

                <h1 class="cosmetic-title">A. Cosmetic (Low Impact, High Personality)</h1>

                <section class="shop-section">
                    <header>BACKGROUNDS</header>
                    <div class="item-grid">
                        <div v-for="w in worlds" :key="w.id" class="shop-item world" 
                             :class="{ 'owned': purchased.has(w.id), 'active': equipped.has(w.id), 'poor': (!purchased.has(w.id) && score < w.cost) || w.comingSoon }" 
                             @click="!w.comingSoon && handleItemClick(w, 'bg')">
                            <span class="name">{{ w.name }}</span>
                            <span class="status" v-if="w.comingSoon">COMING SOON</span>
                            <template v-else>
                                <span class="status" v-if="!purchased.has(w.id)">{{ w.cost }} pts</span>
                                <span class="status" v-else>{{ equipped.has(w.id) ? 'AKTIF' : 'AKTIFKAN' }}</span>
                            </template>
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

.shop-scroll {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  -webkit-overflow-scrolling: touch;
  padding: 40px;
}
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

.shop-item.maxed { border-color: #d4af37; background: rgba(212, 175, 55, 0.1); cursor: default; }
.shop-item.maxed .status { color: #d4af37; }

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

@media (max-width: 1024px) {
    .game-hud { padding: 10px; }
    .score-card { padding: 4px 15px; }
    .score-card .score-val { font-size: 1.2rem; }
    .game-btn { padding: 8px 20px; font-size: 0.8rem; }
    
    /* Shop Mobile & Tablet Landscape Optimizations */
    .shop-header {
        padding: 8px 16px;
        background: rgba(13, 2, 22, 0.96);
    }
    .header-left {
        flex-direction: row;
        align-items: center;
        gap: 12px;
    }
    .shop-header h2 {
        font-size: 0.95rem;
        letter-spacing: 2px;
        white-space: nowrap;
    }
    .user-pts {
        font-size: 0.9rem;
        margin: 0;
        white-space: nowrap;
        background: rgba(212, 175, 55, 0.15);
        padding: 4px 10px;
        border-radius: 12px;
        border: 1px solid rgba(212, 175, 55, 0.3);
    }
    .shop-header .close-shop {
        padding: 6px 12px;
        font-size: 0.75rem;
    }
    
    .shop-scroll { padding: 12px 16px; }
    .cosmetic-title { font-size: 0.95rem; margin-bottom: 12px; padding-left: 8px; border-left-width: 3px; }
    .shop-section { margin-bottom: 24px; }
    .shop-section header { font-size: 0.75rem; margin-bottom: 10px; letter-spacing: 2px; }
    
    .item-grid { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 10px; }
    
    .shop-item { padding: 12px; border-radius: 12px; }
    .shop-item .name { font-size: 0.85rem; margin-bottom: 4px; }
    .shop-item .desc { font-size: 0.65rem !important; }
    .shop-item .status { font-size: 0.75rem; }
    .lv { font-size: 0.65rem; margin-top: 3px; }

    /* CTA Modal Mobile & Tablet Landscape Optimizations */
    .modal-content {
        padding: 20px 25px;
        max-width: 85%;
        border-radius: 20px;
        border-width: 2px;
        box-shadow: 0 0 40px rgba(212, 175, 55, 0.2);
    }
    .close-x {
        top: 8px;
        right: 15px;
        font-size: 1.5rem;
    }
    .modal-content .icon {
        font-size: 2.2rem;
        margin-bottom: 8px;
    }
    .modal-content h3 {
        font-size: 1.3rem;
        margin-bottom: 8px;
    }
    .modal-content p {
        font-size: 0.85rem;
        line-height: 1.4;
        margin-bottom: 15px;
    }
    .modal-actions {
        flex-direction: row;
        justify-content: center;
        align-items: center;
        gap: 15px;
    }
    .btn-primary {
        padding: 10px 25px;
        font-size: 0.9rem;
    }
    .btn-link {
        font-size: 0.85rem;
    }
}
</style>

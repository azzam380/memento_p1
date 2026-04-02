<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import gsap from 'gsap';
import { useRouter } from 'vue-router';

const router = useRouter();
const handBackRef = ref(null);
const sparkleLeftRef = ref(null);
const sparkleRightRef = ref(null);

let handAnimation;
let idleAnimation;

function startIdleAnimation() {
  if (handBackRef.value) {
    const asset = handBackRef.value.querySelector('.hand-asset');
    gsap.set(asset, { 
      rotation: 0,
      x: 0,
      y: 0,
      scale: 1
    });
    
    idleAnimation = gsap.to(asset, {
      y: 8,
      rotation: 2,
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
  }
}

function pointHandAt(element) {
  if (idleAnimation) idleAnimation.pause();
  if (!handBackRef.value) return;

  const cardRect = element.getBoundingClientRect();
  const cardCenterX = cardRect.left + cardRect.width / 2;
  const cardCenterY = cardRect.top + cardRect.height / 2;

  // Stable pivot: Top center of the game container
  const container = document.querySelector('.game-container');
  const containerRect = container.getBoundingClientRect();
  const handPivotX = containerRect.left + containerRect.width / 2;
  const handPivotY = containerRect.top + 20; // Slight offset from top border

  // 3. Hitung selisih jarak
  const dx = cardCenterX - handPivotX;
  const dy = cardCenterY - handPivotY;

  // 4. Hitung sudut dalam derajat
  // Atan2 mengembalikan radian, kita ubah ke derajat.
  // Kita gunakan -Math.atan2(dx, dy) karena arah koordinat layar Y ke bawah.
  let angleDeg = -(Math.atan2(dx, dy) * (180 / Math.PI));

  if (handAnimation) handAnimation.kill();

  handAnimation = gsap.to(handBackRef.value.querySelector('.hand-asset'), {
    rotation: angleDeg,
    x: dx * 0.1, 
    duration: 0.5,
    ease: "power2.out",
    overwrite: true
  });
}

function resetHand() {
  if (handAnimation) handAnimation.kill();
  if (!handBackRef.value) return;
  
  handAnimation = gsap.to(handBackRef.value.querySelector('.hand-asset'), {
    rotation: 0,
    x: 0,
    y: 0,
    duration: 0.6,
    ease: "power2.inOut",
    onComplete: () => {
      if (idleAnimation) idleAnimation.play();
    }
  });
}

function createSparkleBurst(card) {
  const container = document.createElement('div');
  container.className = 'card-sparkle-container';
  card.appendChild(container);

  const directions = [
    { x: 0, y: -180 }, { x: 0, y: 180 }, { x: 180, y: 0 }, { x: -180, y: 0 },
    { x: 140, y: -140 }, { x: -140, y: -140 }, { x: 140, y: 140 }, { x: -140, y: 140 }
  ];

  directions.forEach(dir => {
    const particle = document.createElement('div');
    particle.className = 'sparkle-particle animate';
    particle.style.setProperty('--tx', `${dir.x}px`);
    particle.style.setProperty('--ty', `${dir.y}px`);
    container.appendChild(particle);
  });

  setTimeout(() => { container.remove(); }, 1000);
}

const handleMouseEnter = (element, index) => {
  // Add grasping class to the card for dynamic layering
  element.classList.add('is-grasped');
  
  pointHandAt(element);
  if (index < 2) {
    if (sparkleLeftRef.value) sparkleLeftRef.value.classList.add('active');
  } else {
    if (sparkleRightRef.value) sparkleRightRef.value.classList.add('active');
  }
};

const handleMouseLeave = (event) => {
  // Remove grasping class from the card
  if (event.currentTarget) {
    event.currentTarget.classList.remove('is-grasped');
  }
  
  resetHand();
  if (sparkleLeftRef.value) sparkleLeftRef.value.classList.remove('active');
  if (sparkleRightRef.value) sparkleRightRef.value.classList.remove('active');
};

const handleCardClick = (event, id) => {
  const card = event.currentTarget;
  if (!card) return;

  // 1. Bersihkan sisa-sisa animasi sebelumnya
  if (handAnimation) handAnimation.kill();
  if (idleAnimation) idleAnimation.pause();
  gsap.killTweensOf([handBackRef.value, card]);
  
  // 2. Matikan interaksi dan paksa hentikan transition CSS agar tidak beradu dengan GSAP
  card.style.pointerEvents = 'none';
  card.style.transition = 'none'; // Matikan transition paksa agar sinkron dengan GSAP
  
  const title = card.querySelector('.card-title')?.textContent || "";
  
  // 3. Kalkulasi jarak absolut untuk perpindahan
  const cardRect = card.getBoundingClientRect();
  const cardCenterX = cardRect.left + cardRect.width / 2;
  const cardCenterY = cardRect.top + cardRect.height / 2;

  const handRect = handBackRef.value.getBoundingClientRect();
  const targetX = handRect.left + handRect.width / 2;
  const targetY = handRect.top + handRect.height * 0.45; // Titik genggam tangan
  
  const diffX = cardCenterX - targetX;
  const diffY = cardCenterY - targetY;

  const tl = gsap.timeline();

  // 4. ANIMASI: Tarik kartu ke arah tangan dalam bentuk penuh
  tl.to(card, {
    x: `-=${diffX}`,
    y: `-=${diffY}`,
    rotation: 0,
    scale: 1.05, // Sedikit membesar agar terlihat "diangkat" mendekat
    duration: 0.5,
    ease: "power3.out", // Pergerakan yang mantap ke arah tangan
    onStart: () => {
      // Atur z-index agar kartu terlihat terbang di depan sebelum masuk ke sela tangan
      gsap.set(card, { zIndex: 1000 });
    },
    onComplete: () => {
      createSparkleBurst(card);
      // Masukkan kartu ke sela-sela tangan (di bawah layer tangan depan)
      card.classList.add('is-grasped'); // z-index 150
    }
  });

  // Reaksi Tangan saat menangkap kartu (seperti gerakan menyambar)
  tl.to(handBackRef.value.querySelector('.hand-asset'), {
    scale: 1.1,
    y: -10,
    duration: 0.2,
    yoyo: true,
    repeat: 1,
    ease: "back.out(2)"
  }, "-=0.3");

  // 5. Navigasi setelah jeda singkat saat kartu tertahan di tangan
  setTimeout(() => {
    const routes = { play: '/play', work: '/work', info: '/info', solution: '/service' };
    if (id === 'solution') {
      router.push({ path: '/service', query: { title: title } });
    } else {
      router.push(routes[id] || '/');
    }
  }, 1000); // Jeda sedikit lebih lama agar user bisa melihat kartu dipegang
};

onMounted(() => {
  startIdleAnimation();
});

onUnmounted(() => {
    if (idleAnimation) idleAnimation.kill();
    if (handAnimation) handAnimation.kill();
});
</script>

<template>
  <div class="home-page">
    <div class="game-container">
      <div class="sparkles-container">
        <div class="sparkle left" ref="sparkleLeftRef"></div>
        <div class="sparkle right" ref="sparkleRightRef"></div>
      </div>
      
      <header class="logo-header">
        <div class="logo-badge">
          <img src="/img-logo.png" alt="Memento Logo" class="main-logo-img">
        </div>
      </header>

      <!-- Hand Layer Container -->
      <div class="hand-layer back" ref="handBackRef">
        <img src="/img-hand-center.png" alt="Hand Asset" class="hand-asset">
      </div>

      <div class="cards-container">
        <div class="card" @mouseenter="(e) => handleMouseEnter(e.currentTarget, 0)" @mouseleave="handleMouseLeave" @click="(e) => handleCardClick(e, 'info')">
          <div class="card-inner">
            <div class="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
            <span class="card-title">Info</span>
          </div>
        </div>
        <div class="card" @mouseenter="(e) => handleMouseEnter(e.currentTarget, 1)" @mouseleave="handleMouseLeave" @click="(e) => handleCardClick(e, 'work')">
          <div class="card-inner">
            <div class="card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
            </div>
            <span class="card-title">Work</span>
          </div>
        </div>
        <div class="card" @mouseenter="(e) => handleMouseEnter(e.currentTarget, 2)" @mouseleave="handleMouseLeave" @click="(e) => handleCardClick(e, 'play')">
          <div class="card-inner">
            <div class="card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"></rect><path d="M6 12h4m-2-2v4m7-2h.01m2.99-2h.01"></path></svg>
            </div>
            <span class="card-title">Play</span>
          </div>
        </div>
        <div class="card" @mouseenter="(e) => handleMouseEnter(e.currentTarget, 3)" @mouseleave="handleMouseLeave" @click="(e) => handleCardClick(e, 'solution')">
          <div class="card-inner">
            <div class="card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6m-4 4h2m-5-16a5 5 0 1 1 10 0c0 2.5-2.5 4.5-2.5 6h-5c0-1.5-2.5-3.5-2.5-6z"></path></svg>
            </div>
            <span class="card-title">Solution</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
 
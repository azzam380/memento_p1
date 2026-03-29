<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import gsap from 'gsap';
import { useRouter } from 'vue-router';

const router = useRouter();
const handBackRef = ref(null);
const handFrontRef = ref(null);
const sparkleLeftRef = ref(null);
const sparkleRightRef = ref(null);

let handAnimation;
let idleAnimation;

function startIdleAnimation() {
  if (handBackRef.value && handFrontRef.value) {
    gsap.set([handBackRef.value, handFrontRef.value], { 
      rotation: 0,
      x: 0,
      y: 0
    });
    
    idleAnimation = gsap.to([handBackRef.value, handFrontRef.value], {
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
  if (!handBackRef.value || !handFrontRef.value) return;

  // 1. Ambil posisi kartu yang sedang di-hover
  const cardRect = element.getBoundingClientRect();
  const cardCenterX = cardRect.left + cardRect.width / 2;
  const cardCenterY = cardRect.top + cardRect.height / 2;

  // 2. Ambil posisi tangan (sebagai pivot)
  // Kita gunakan handBackRef sebagai referensi posisi asal
  const handRect = handBackRef.value.getBoundingClientRect();
  const handPivotX = handRect.left + handRect.width / 2;
  const handPivotY = handRect.top; // Karena transform-origin kita di 50% 0%

  // 3. Hitung selisih jarak
  const dx = cardCenterX - handPivotX;
  const dy = cardCenterY - handPivotY;

  // 4. Hitung sudut dalam derajat
  // Atan2 mengembalikan radian, kita ubah ke derajat.
  // Kita gunakan -Math.atan2(dx, dy) karena arah koordinat layar Y ke bawah.
  let angleDeg = -(Math.atan2(dx, dy) * (180 / Math.PI));

  // Matikan animasi yang sedang berjalan agar tidak tabrakan
  if (handAnimation) handAnimation.kill();

  handAnimation = gsap.to([handBackRef.value, handFrontRef.value], {
    rotation: angleDeg,
    x: dx * 0.15, // Memberikan sedikit efek translasi agar lebih dinamis
    y: 0,
    duration: 0.6,
    ease: "power2.out",
    overwrite: true
  });
}

function resetHand() {
  if (handAnimation) handAnimation.kill();
  
  if (!handBackRef.value || !handFrontRef.value) return;
  
  handAnimation = gsap.to([handBackRef.value, handFrontRef.value], {
    rotation: 0,
    x: 0,
    y: 0,
    duration: 0.8,
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

  // 1. Matikan semua animasi yang berjalan
  if (handAnimation) handAnimation.kill();
  if (idleAnimation) idleAnimation.pause();
  gsap.killTweensOf([handBackRef.value, handFrontRef.value, card]);
  
  card.style.pointerEvents = 'none';
  const title = card.querySelector('.card-title')?.textContent || "";
  
  // 2. Kalkulasi posisi
  const handRect = handBackRef.value.getBoundingClientRect();
  const cardRect = card.getBoundingClientRect();
  const cardCenterX = cardRect.left + cardRect.width / 2;
  const cardCenterY = cardRect.top + cardRect.height / 2;

  const tl = gsap.timeline();

  // 3. ANIMASI: Kartu ke tengah Logo (Targeting Top Center Logo)
  const logoHeader = document.querySelector('.logo-header');
  const logoRect = logoHeader ? logoHeader.getBoundingClientRect() : handRect;
  const targetX = logoRect.left + logoRect.width / 2;
  const targetY = logoRect.top + logoRect.height / 2;
  
  const diffX = cardCenterX - targetX;
  const diffY = cardCenterY - targetY;

  tl.to(card, {
    x: `-=${diffX}`,
    y: `-=${diffY}`, // Terbang ke tengah logo
    rotation: 0, // Melurus saat ditangkap logo/tangan
    scale: 1.1,
    duration: 0.5,
    ease: "power2.inOut",
    onStart: () => {
      card.classList.add('is-grasped');
    },
    onComplete: () => {
      createSparkleBurst(card);
    }
  });

  // 4. ANIMASI: Kartu masuk lebih jauh ke belakang logo
  tl.to(card, {
    y: "-=200", 
    scale: 0.3, 
    opacity: 0,
    duration: 0.3,
    ease: "power2.in"
  }, "+=0.05");

  // Tangan tetap sinkron, beri getaran kecil saat "menelan" kartu
  tl.to([handBackRef.value, handFrontRef.value], {
    scale: 1.05,
    duration: 0.1,
    repeat: 1,
    yoyo: true,
    ease: "power2.inOut"
  }, "-=0.4");

  // 5. Pindah Halaman
  setTimeout(() => {
    const routes = { play: '/play', work: '/work', info: '/info', solution: '/service' };
    if (id === 'solution') {
      router.push({ path: '/service', query: { title: title } });
    } else {
      router.push(routes[id] || '/');
    }
  }, 800);
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
          <img src="/Logo5.png" alt="Memento Logo" class="main-logo-img">
        </div>
      </header>

      <!-- Back Layer Hand -->
      <div class="hand-layer back">
        <img src="/tangan belakang.png" alt="Hand Back" class="hand-asset" ref="handBackRef">
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

      <!-- Front Layer Hand -->
      <div class="hand-layer front">
        <img src="/tangan depan.png" alt="Hand Front" class="hand-asset" ref="handFrontRef">
      </div>
    </div>
  </div>
</template>

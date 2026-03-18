<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import gsap from 'gsap';
import { useRouter } from 'vue-router';

const router = useRouter();
const centralHandRef = ref(null);
const sparkleLeftRef = ref(null);
const sparkleRightRef = ref(null);

let handAnimation;
let idleAnimation;

function startIdleAnimation() {
  if (centralHandRef.value) {
    idleAnimation = gsap.to(centralHandRef.value, {
      y: 10,
      rotation: 1,
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
  }
}

function pointHandAt(element) {
  if (idleAnimation) idleAnimation.pause();
  
  if (!centralHandRef.value) return;
  
  const handRect = centralHandRef.value.getBoundingClientRect();
  const cardRect = element.getBoundingClientRect();
  
  const pivotX = handRect.left + handRect.width / 2;
  const pivotY = handRect.top + 20; 

  const cardCenterX = cardRect.left + cardRect.width / 2;
  const cardCenterY = cardRect.top + cardRect.height / 2;
  
  const angleRad = Math.atan2(cardCenterY - pivotY, cardCenterX - pivotX);
  const angleDeg = (angleRad * 180 / Math.PI) - 90; 
  const clampedAngle = Math.max(Math.min(angleDeg, 45), -45);

  if (handAnimation) handAnimation.kill();
  
  handAnimation = gsap.to(centralHandRef.value, {
    rotation: clampedAngle,
    scale: 1.05,
    y: 0,
    duration: 0.6,
    ease: "back.out(1.7)",
    overwrite: true
  });
}

function resetHand() {
  if (handAnimation) handAnimation.kill();
  
  if (!centralHandRef.value) return;
  
  handAnimation = gsap.to(centralHandRef.value, {
    rotation: 0,
    scale: 1,
    y: 0,
    duration: 1.2,
    ease: "power2.out",
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
  pointHandAt(element);
  if (index < 2) {
    if (sparkleLeftRef.value) sparkleLeftRef.value.classList.add('active');
  } else {
    if (sparkleRightRef.value) sparkleRightRef.value.classList.add('active');
  }
};

const handleMouseLeave = () => {
  resetHand();
  if (sparkleLeftRef.value) sparkleLeftRef.value.classList.remove('active');
  if (sparkleRightRef.value) sparkleRightRef.value.classList.remove('active');
};

const handleCardClick = (event, id) => {
  const card = event.currentTarget;
  const title = card.querySelector('.card-title').textContent;
  createSparkleBurst(card);
  
  setTimeout(() => {
    if (id === 'play') {
      router.push('/play');
    } else if (id === 'work') {
      router.push('/work');
    } else if (id === 'info') {
      router.push('/info');
    } else {
      // For solution or any other custom service cards
      router.push({ path: '/service', query: { title: title } });
    }
  }, 500);
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

      <div class="hand-presentation">
        <img src="/Tangan_tengah.png" alt="Presenting Hand" class="central-hand" ref="centralHandRef">
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

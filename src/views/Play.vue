<script setup>
import { onMounted, ref } from 'vue';
import gsap from 'gsap';

const cardsRef = ref([]);

const createSparkleBurst = (card) => {
  const container = document.createElement('div');
  container.className = 'card-sparkle-container';
  card.appendChild(container);

  const directions = [
    { x: 0, y: -180 },   // Top
    { x: 0, y: 180 },    // Bottom
    { x: 180, y: 0 },    // Right
    { x: -180, y: 0 },   // Left
    { x: 140, y: -140 }, // Top-Right
    { x: -140, y: -140 },// Top-Left
    { x: 140, y: 140 },  // Bottom-Right
    { x: -140, y: 140 }  // Bottom-Left
  ];

  directions.forEach(dir => {
    const particle = document.createElement('div');
    particle.className = 'sparkle-particle animate';
    particle.style.setProperty('--tx', `${dir.x}px`);
    particle.style.setProperty('--ty', `${dir.y}px`);
    container.appendChild(particle);
  });

  setTimeout(() => {
    container.remove();
  }, 1000);
};

const handleCardClick = (event, index) => {
  const card = event.currentTarget;
  createSparkleBurst(card);
  
  // Pressed effect
  gsap.to(card, {
    scale: 0.95,
    duration: 0.1,
    yoyo: true,
    repeat: 1,
    ease: "power2.inOut"
  });
  
  console.log(`Card ${index} clicked`);
};

onMounted(() => {
  console.log("Play page mounted!");
});
</script>

<template>
  <div class="game-container">
    <router-link to="/" class="back-button">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    </router-link>

    <header class="logo-header">
      <div class="logo-badge">
        <img src="/Logo5.png" alt="Memento Logo" class="main-logo-img">
      </div>
    </header>

    <div class="play-content-wrapper">
      <h1 class="play-title">Play</h1>

      <div class="play-carousel">
        <div 
          class="play-card side-outer left" 
          @click="(e) => handleCardClick(e, 0)"
        ></div>
        <div 
          class="play-card side-inner left" 
          @click="(e) => handleCardClick(e, 1)"
        ></div>
        <div 
          class="play-card central-focus" 
          @click="(e) => handleCardClick(e, 2)"
        ></div>
        <div 
          class="play-card side-inner right" 
          @click="(e) => handleCardClick(e, 3)"
        ></div>
        <div 
          class="play-card side-outer right" 
          @click="(e) => handleCardClick(e, 4)"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Scoped style if needed, but the main CSS covers most of it.
   Note: scoped CSS will add attributes, but the user wants to keep the same classes.
   So I'll just import style.css globally in main.js.
*/
</style>

<template>
  <div class="service-page">
    <div class="game-container">
      <router-link to="/" class="back-button" v-if="!activeCard">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </router-link>

      <div class="service-content-wrapper" :class="{ 'has-active-card': activeCard }">
        <h1 class="service-page-title" v-if="!activeCard">{{ pageTitle }}</h1>

        <div class="service-composition">
          <!-- Hand Asset -->
          <img src="/Tanngan_service.png" alt="Hand Support" class="service-hand" ref="handRef">
          
          <div class="service-fanned-cards">
            <div 
              v-for="(card, index) in cards" 
              :key="index"
              class="service-sub-card"
              :class="['card-' + (index + 1), { 'is-expanded': activeCard?.title === card.title, 'is-hidden': activeCard && activeCard.title !== card.title }]"
              @click="expandCard(card)"
            >
              <!-- Back arrow inside expanded card -->
              <div v-if="activeCard?.title === card.title" class="card-back-arrow" @click.stop="activeCard = null">
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </div>

              <div class="service-card-inner">
                <span v-if="!activeCard">{{ card.title }}</span>
                
                <div v-if="activeCard?.title === card.title" class="service-expanded-content">
                  <h2 class="expanded-service-title">{{ card.title }}</h2>
                  <div class="expanded-service-desc">
                    <p>{{ card.description }}</p>
                    <p>Experience the future of interactive solutions with Memento Game Studio. We combine cutting-edge technology with world-class design to deliver experiences that leave a lasting impression.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import gsap from 'gsap';

const route = useRoute();
const pageTitle = computed(() => route.query.title || 'Service');
const handRef = ref(null);
const activeCard = ref(null);

const cards = ref([
  { title: 'Games For Marketing', description: 'Gamification is the most effective way to engage your audience. We create bespoke marketing games that increase brand loyalty and conversion rates.' },
  { title: 'Games For Education', description: 'Transform learning into an adventure. Our educational games are designed to make complex topics easy to understand and fun to explore.' },
  { title: 'Games For Training', description: 'Enhance professional skills with realistic simulations. Our training games provide a safe and immersive environment for employees to practice and excel.' },
  { title: 'Interactive Brand Experience', description: 'Create a memorable connection with your audience through immersive digital installations and interactive storytelling.' }
]);

const expandCard = (card) => {
  if (!activeCard.value) activeCard.value = card;
};

const handleMouseMove = (e) => {
  if (!handRef.value || activeCard.value) return;

  const { innerWidth, innerHeight } = window;
  const x = (e.clientX / innerWidth - 0.5) * 30; 
  const y = (e.clientY / innerHeight - 0.5) * 30;

  gsap.to(handRef.value, {
    x: x,
    y: y,
    duration: 1.2,
    ease: "power2.out"
  });
};

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove);
});

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove);
});
</script>

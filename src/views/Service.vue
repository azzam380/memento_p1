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
          <img :src="handServiceImg" alt="Hand Support" class="service-hand" ref="handRef">
          
          <div class="service-fanned-cards">
            <div 
              v-for="(card, index) in cards" 
              :key="index"
              class="service-sub-card"
              :class="['card-' + (index + 1), { 'is-hidden': activeCard }]"
              @click="expandCard(card)"
            >
              <div class="service-card-inner">
                <span>{{ card.title }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Dedicated Expanded Modal Overlay - Teleported to Body -->
  <teleport to="body">
    <transition name="fade-modal">
      <div v-if="activeCard" class="service-modal-overlay">
        <div class="modal-card-container">
          <!-- Back arrow inside expanded card -->
          <div class="card-back-arrow" @click="activeCard = null">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </div>

          <div class="modal-scroll-content">
            <div class="expanded-logo-header">
              <img :src="mementoImg" alt="Memento Logo" class="expanded-card-logo">
            </div>
            <h2 class="expanded-service-title" v-if="activeCard">{{ activeCard.title }}</h2>
            <div class="expanded-service-desc" v-if="activeCard">
              <p>{{ activeCard.description }}</p>
              <p>Experience the future of interactive solutions with Memento Game Studio. We combine cutting-edge technology with world-class design to deliver experiences that leave a lasting impression.</p>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import gsap from 'gsap';
import handServiceImg from '@/assets/img-hand-service.png';
import mementoImg from '@/assets/img-memento.png';

const route = useRoute();
const pageTitle = computed(() => {
  try {
    return route?.query?.title || 'Service';
  } catch (e) {
    return 'Service';
  }
});
const handRef = ref(null);
const activeCard = ref(null);

const cards = ref([
  { 
    title: 'Games For Marketing', 
    description: 'Gamification is the most powerful tool in modern marketing, transforming passive observers into active participants. We specialize in creating bespoke marketing games that leverage core psychological triggers to drive high-impact engagement. Our solutions are meticulously crafted to increase brand awareness, foster long-term loyalty, and significantly boost conversion rates by turning every brand interaction into a rewarding and memorable experience.' 
  },
  { 
    title: 'Games For Education', 
    description: 'We believe that the future of learning is interactive. Our educational games are engineered to transform traditional curricula into captivating digital adventures that motivate students to explore and master new domains. By simplifying complex concepts through intuitive gameplay and immersive storytelling, we ensure that knowledge is not just delivered, but internalized and retained, making education an accessible and joy-filled journey for learners of age-less potentials.' 
  },
  { 
    title: 'Games For Training', 
    description: 'Empower your workforce with high-fidelity simulations that bridge the gap between theory and practice. Our professional training games provide a risk-free, immersive environment where employees can safely hone their skills and navigate complex corporate scenarios. These data-driven experiences are designed to improve decision-making, enhance operational efficiency, and provide clear performance metrics, ensuring your team is fully prepared to excel in the real world.' 
  },
  { 
    title: 'Interactive Brand Experience', 
    description: 'Go beyond the screen and create an emotional bridge between your brand and your audience. We design immersive digital installations and hybrid experiences that combine cutting-edge technology with the timeless art of storytelling. Whether through augmented reality, motion sensing, or large-scale physical-digital integrations, our interactive experiences are designed to leave a lasting impression and build a deep, meaningful connection with your customers.' 
  }
]);

const expandCard = (card) => {
  if (!activeCard.value) activeCard.value = card;
};

// Body scroll lock logic
watch(activeCard, (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

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
  console.log("Service Page Mounted with Title:", pageTitle.value);
});

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove);
  // Ensure we cleanup everything
  document.body.style.overflow = '';
});
</script>

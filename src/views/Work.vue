<template>
  <div class="work-page">
    <div class="game-container" ref="containerRef">
      <router-link to="/" class="back-button" v-if="!activeWork">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </router-link>

      <div class="hands-container" ref="handsRef">
         <img src="/tangan_work.png" alt="Working Hands" class="work-hands-combined">
      </div>

      <div class="work-content-wrapper" :class="{ 'has-active-work': activeWork }">
        <h1 class="work-title" v-if="!activeWork">WORK</h1>

        <div class="work-gallery">
          <!-- 3 Portfolio Cards -->
          <div 
            v-for="item in items" 
            :key="item.id"
            class="work-card-wrapper"
            :class="[item.pos, { 'is-expanded': activeWork?.id === item.id, 'is-hidden': activeWork && activeWork.id !== item.id }]"
            @click="selectWork(item)"
          >
            <div class="memento-card-work">
              <!-- Back arrow inside expanded card -->
              <div v-if="activeWork?.id === item.id" class="card-back-arrow" @click.stop="activeWork = null">
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </div>

              <div class="card-content-layout">
                <div class="card-image-section">
                  <img :src="item.image" :alt="item.title" class="work-item-img">
                  <div class="card-placeholder-text" v-if="!item.image">{{ item.title }}</div>
                </div>

                <div v-if="activeWork?.id === item.id" class="card-info-section">
                  <h2 class="work-item-title">{{ item.title }}</h2>
                  <p class="work-item-desc">{{ item.description }}</p>
                  <button class="play-now-btn">PLAY NOW</button>
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
import { ref, onMounted, onUnmounted } from 'vue';
import gsap from 'gsap';

const containerRef = ref(null);
const handsRef = ref(null);
const activeWork = ref(null);

const items = ref([
  { id: 1, title: 'Project One', description: 'A mystical journey through forgotten realms, blending puzzles and deep narrative. Experience the premium gameplay and stunning visuals that redefine interactive storytelling.', image: '/Memento.png', pos: 'left' },
  { id: 2, title: 'Project Two', description: 'Our flagship title featuring innovative card-based mechanics and a rich, atmospheric world. Every move matters in this high-stakes game of strategy and luck.', image: '/Memento.png', pos: 'center' },
  { id: 3, title: 'Project Three', description: 'An experimental adventure focusing on abstract visuals and emotive soundscapes. A unique portfolio piece that showcases our creative diversity.', image: '/Memento.png', pos: 'right' },
]);

const selectWork = (item) => {
  if (!activeWork.value) activeWork.value = item;
};

const handleMouseMove = (e) => {
  if (!handsRef.value || activeWork.value) return;

  const { innerWidth, innerHeight } = window;
  const x = (e.clientX / innerWidth - 0.5) * 40; // Subtle move
  const y = (e.clientY / innerHeight - 0.5) * 20;
  const r = (e.clientX / innerWidth - 0.5) * 4; // Subtle rotation

  gsap.to(handsRef.value, {
    x: x,
    y: y,
    rotation: r,
    duration: 1,
    ease: "power2.out"
  });
};

onMounted(() => {
  if (handsRef.value) {
    gsap.set(handsRef.value, { xPercent: -50 });
  }
  window.addEventListener('mousemove', handleMouseMove);
});

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove);
});
</script>

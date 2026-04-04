<template>
  <div class="work-page">
    <div class="game-container" ref="containerRef">
      <router-link to="/" class="back-button" v-if="!activeWork">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </router-link>

      <div class="hands-container" ref="handsRef">
         <img :src="handWorkImg" alt="Working Hands" class="work-hands-combined">
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
                  <img v-if="activeWork?.id === item.id" :src="item.image" :alt="item.title" class="work-item-img">
                  <img v-else :src="item.logo" :alt="item.title" class="card-front-logo">
                </div>

                <div v-if="activeWork?.id === item.id" class="card-info-section">
                  <h2 class="work-item-title">{{ item.title }}</h2>
                  <p class="work-item-desc">{{ item.description }}</p>
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
import handWorkImg from '@/assets/img-hand-work.png';
import imgBatik from '@/assets/img-batik-gameplay.png';
import imgRtManager from '@/assets/img-rt-manager.png';
import imgTehRasa from '@/assets/img-teh-rasa.png';
import logoBatik from '@/assets/img-logobatik.jpg';
import logoHam from '@/assets/img-logoham.png';
import logoTehRasa from '@/assets/img-logotehrasa.png';

const containerRef = ref(null);
const handsRef = ref(null);
const activeWork = ref(null);

const items = ref([
  { 
    id: 1, 
    title: 'Batik Simulator', 
    description: "Genre: Simulation / Casual\nSetting: Traditional Batik Workshop\n\nPlayers take on the role of a batik artisan who must carefully apply malam (hot wax) using a canting, a traditional small-spouted tool, onto a white cloth stretched across a gawangan (wooden frame). In the top-right corner, a reference motif featuring a classic brown kawung batik pattern is displayed for the player to replicate. A progress bar at the top tracks how much of the work has been completed.\n\nThe main challenge is tracing the pattern with precision, avoiding excessive wax drips, and finishing the motif before time runs out. This game introduces players to Indonesia's cultural heritage through a hands-on digital batik-making experience.", 
    image: imgBatik,
    logo: logoBatik,
    pos: 'left' 
  },
  { 
    id: 2, 
    title: 'Human Rights Interactive Experience', 
    description: "Genre: Role-playing\nDescription: An interactive experience for understanding differences of opinion and tolerance.\n\nThe Human Rights Interactive Experience is a social experiment in the form of a game. Players write an opinion on one of 10 human rights issues, then read real opinions from other players. Using a swipe mechanic, players mark opinions they agree with or disagree with. At the end, the game displays all rejected opinions and gives them a choice: drag them to the trash to delete them forever, or throw them away to respect diversity.\n\nThis isn't a game about winning or losing. It's a mirror that forces introspection: do we truly believe in freedom of speech when faced with voices that contradict our values? With a countdown timer and a darkening screen, the game creates psychological pressure that simulates the temptation to \"silence\" in real digital life.", 
    image: imgRtManager,
    logo: logoHam,
    pos: 'center' 
  },
  { 
    id: 3, 
    title: 'Teh Rasa', 
    description: "Genre: Simulation\nSetting: Outdoor Tea Stall in a City Park\n\nPlayers manage a tea beverage kiosk called \"Teh Rasa\", run by a girl wearing a brown apron. The counter is stocked with various supplies: flavored syrup bottles, stacked cups, Hot Water, green tea leaf, black tea leaf, chamomile, jasmine, mint and else.\n\nThe gameplay revolves around serving customers quickly and accurately, selecting the right tea flavor per order, brewing it, and serving it before customers lose patience. The busier the park gets, the higher the difficulty. This game brings the cultural charm of Indonesian tea culture to life through vibrant and cheerful visuals.", 
    image: imgTehRasa,
    logo: logoTehRasa,
    pos: 'right' 
  },
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

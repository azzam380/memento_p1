<template>
  <div class="work-page">
    <div class="game-container">
      <router-link to="/" class="back-button">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </router-link>

      <header class="logo-header">
        <div class="logo-badge">
          <img src="/Logo5.png" alt="Memento Logo" class="main-logo-img">
        </div>
      </header>

      <div class="work-content-wrapper">
        <h1 class="work-title">WORK</h1>

        <div class="work-gallery">
          <div class="hands-structure">
            <img src="/tangan_work.png" alt="Working Hands" class="work-hands-combined">
            <div @click="goToDetail(1)" class="work-card central"></div>
          </div>

          <div @click="goToDetail(2)" class="work-card extra card-pos-1"></div>
          <div @click="goToDetail(3)" class="work-card extra card-pos-2"></div>
          <div @click="goToDetail(4)" class="work-card extra card-pos-3"></div>
          <div @click="goToDetail(5)" class="work-card extra card-pos-4"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const goToDetail = (id) => {
  router.push(`/work/${id}`);
};

onMounted(() => {
  console.log("Work page mounted!");
});
</script>

<template>
  <div class="work-detail-page">
    <div class="game-container detail-view">
      <!-- Back Button -->
      <router-link to="/work" class="back-button">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </router-link>

      <div class="detail-content">
        <h1 class="detail-title">Judul</h1>
        
        <div class="detail-main">
          <div class="content-placeholder">
            <!-- This is the gray box from the image -->
          </div>
        </div>

        <div class="detail-description">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, 
            sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';

onMounted(() => {
  console.log("Work Detail page mounted!");
});
</script>

<style scoped>
/* Scoped styles for detail specific layout if needed, 
   but we'll mostly use style.css for consistency */
</style>

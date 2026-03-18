<template>
  <div class="info-page">
    <div class="game-container">
      <router-link to="/" class="back-button">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </router-link>

      <div class="info-content">
        <div class="info-card-side">
          <div class="memento-card-large">
            <img src="/Memento.png" alt="Memento Logo" class="card-logo-large">
          </div>
        </div>

        <div class="info-actions-side">
          <h1 class="info-title">Information</h1>
          <div class="info-buttons">
            <button class="info-btn">Mission</button>
            <button class="info-btn">Location</button>
            <button class="info-btn">Get in touch</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';

onMounted(() => {
  console.log("Info page mounted!");
});
</script>

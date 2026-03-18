<template>
  <div class="service-page">
    <div class="game-container">
      <router-link to="/" class="back-button">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </router-link>

      <div class="service-content-wrapper">
        <h1 class="service-page-title">{{ pageTitle }}</h1>

        <div class="service-composition">
          <img src="/Tanngan_service.png" alt="Hand Support" class="service-hand">
          
          <div class="service-fanned-cards">
            <div class="service-sub-card card-1">
              <span>Games For Marketing</span>
            </div>
            <div class="service-sub-card card-2">
              <span>Games For Education</span>
            </div>
            <div class="service-sub-card card-3">
              <span>Games For Training</span>
            </div>
            <div class="service-sub-card card-4">
              <span>Interactive Brand Experience</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const pageTitle = computed(() => route.query.title || 'Service');
</script>

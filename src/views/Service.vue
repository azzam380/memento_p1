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
            <div @click="openServicePanel('Games For Marketing')" class="service-sub-card card-1">
              <span>Games For Marketing</span>
            </div>
            <div @click="openServicePanel('Games For Education')" class="service-sub-card card-2">
              <span>Games For Education</span>
            </div>
            <div @click="openServicePanel('Games For Training')" class="service-sub-card card-3">
              <span>Games For Training</span>
            </div>
            <div @click="openServicePanel('Interactive Brand Experience')" class="service-sub-card card-4">
              <span>Interactive Brand Experience</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Sliding Panel Viewport -->
      <div class="service-panel-viewport">
        <transition name="slide-up">
          <div v-if="isPanelOpen" class="service-sliding-panel">
            <div class="panel-close-handle" @click="closePanel">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </div>

            <div class="service-panel-content">
              <h2 class="service-detail-title">{{ activeService }}</h2>
              <div class="service-description-scrollable">
                <p v-for="i in 5" :key="i">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
                  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
                  Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </p>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const pageTitle = computed(() => route.query.title || 'Service');

const isPanelOpen = ref(false);
const activeService = ref('');

const openServicePanel = (title) => {
  activeService.value = title;
  isPanelOpen.value = true;
};

const closePanel = () => {
  isPanelOpen.value = false;
};
</script>

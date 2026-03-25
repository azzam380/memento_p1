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
            <button @click="showPanel('mission')" class="info-btn">Mission</button>
            <button @click="showPanel('location')" class="info-btn">Location</button>
            <button @click="showPanel('contact')" class="info-btn">Get in touch</button>
          </div>
        </div>
      </div>

      <!-- Sliding Panel Viewport for clipping -->
      <div class="info-panel-viewport">
        <transition name="slide-up">
          <div v-if="activePanel" class="info-sliding-panel">
            <div class="panel-close-handle" @click="activePanel = null">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </div>

            <div class="panel-content">
              <!-- MISSION: Empty as requested -->
              <div v-if="activePanel === 'mission'" class="panel-mission-view">
                <!-- Empty state -->
              </div>

              <!-- LOCATION -->
              <div v-if="activePanel === 'location'" class="panel-location-view">
                <h2 class="panel-title">Our location</h2>
                <div class="map-placeholder">
                  <!-- Map image usually goes here -->
                  <img src="/Map_placeholder.png" alt="Map" class="info-map-img">
                </div>
                <p class="address-text">
                  Jalan Anggrek Cakra RW 09, Desa Kelurahan Kebon Jeruk, 
                  Kec. Kebon Jeruk, West Jakarta City, DKI Jakarta, Indonesia
                </p>
              </div>

              <!-- GET IN TOUCH -->
              <div v-if="activePanel === 'contact'" class="panel-contact-view">
                <h2 class="panel-title">Get in touch</h2>
                <form class="contact-form" @submit.prevent>
                  <div class="form-group">
                    <label>Your Name / Company Name</label>
                    <input type="text" placeholder="Enter Your Name Or Company Name">
                  </div>
                  <div class="form-group">
                    <label>Your Email Address</label>
                    <input type="email" placeholder="Enter Your Email Address">
                  </div>
                  <div class="form-group">
                    <label>Your Message</label>
                    <textarea placeholder="Type your message here"></textarea>
                  </div>
                  <button type="submit" class="submit-contact-btn">Submit Your Message</button>
                </form>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const activePanel = ref(null);

const showPanel = (panel) => {
  activePanel.value = panel;
};

onMounted(() => {
  console.log("Info page mounted!");
});
</script>

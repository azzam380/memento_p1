<template>
  <div class="info-page">
    <div class="game-container">
      <router-link to="/" class="back-button" v-if="!activePanel">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </router-link>

      <div class="info-content" :class="{ 'has-active-panel': activePanel }">
        <div class="info-card-side">
          <div class="memento-card-large" :class="{ 'is-expanded': activePanel }">
            <!-- Back arrow inside expanded card -->
            <div v-if="activePanel" class="card-back-arrow" @click="activePanel = null">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </div>

            <div class="card-inner-layout">
              <div class="card-logo-section" :class="{ 'minimized': activePanel }">
                <img :src="mementoImg" alt="Memento Logo" class="card-logo-large">
              </div>

              <transition name="fade-delayed">
                <div v-if="activePanel" class="expanded-detail-content">
                  <!-- MISSION -->
                  <div v-if="activePanel === 'mission'" class="detail-view-inner">
                    <h2 class="panel-title">Our Mission</h2>
                    <div class="mission-content">
                      <p class="mission-text">
                        "Envisioning a world where every digital touchpoint feels like a cherished memory."
                      </p>
                      <p class="mission-subtext">
                        At Memento Game Studio, our mission is to redefine interactive storytelling by blending premium aesthetics with deeply immersive gameplay. We believe in the power of 'Mementos' - significant moments that stay with you long after the screen goes dark.
                      </p>
                    </div>
                  </div>

                  <!-- LOCATION -->
                  <div v-if="activePanel === 'location'" class="detail-view-inner">
                    <h2 class="panel-title">Our location</h2>
                    <div class="map-placeholder">
                      <img :src="mapImg" alt="Map" class="info-map-img">
                    </div>
                    <p class="address-text">
                      Jalan Anggrek Cakra RW 09, Desa Kelurahan Kebon Jeruk, 
                      Kec. Kebon Jeruk, West Jakarta City, DKI Jakarta, Indonesia
                    </p>
                  </div>

                  <!-- GET IN TOUCH -->
                  <div v-if="activePanel === 'contact'" class="detail-view-inner">
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
              </transition>
            </div>
          </div>
        </div>

        <div class="info-actions-side" :class="{ 'is-hidden': activePanel }">
          <h1 class="info-title">Information</h1>
          <div class="info-buttons">
            <button @click="showPanel('mission')" class="info-btn">Mission</button>
            <button @click="showPanel('location')" class="info-btn">Location</button>
            <button @click="showPanel('contact')" class="info-btn">Get in touch</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import mementoImg from '@/assets/img-memento.png';
import mapImg from '@/assets/img-map-placeholder.png';

const activePanel = ref(null);

const showPanel = (panel) => {
  activePanel.value = panel;
};

onMounted(() => {
  console.log("Info page mounted!");
});
</script>

<style scoped>
.fade-delayed-enter-active {
  transition: opacity 0.5s ease 0.4s;
}
.fade-delayed-enter-from {
  opacity: 0;
}

.fade-out-leave-active {
  transition: opacity 0.3s ease;
}
.fade-out-leave-to {
  opacity: 0;
}
</style>

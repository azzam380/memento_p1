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
                    <form class="contact-form" @submit.prevent="submitForm">
                      <div class="form-group">
                        <label>Your Name / Company Name</label>
                        <input type="text" v-model="formData.name" placeholder="Enter Your Name Or Company Name" :class="{ 'error-border': formStatus === 'error' && !formData.name }">
                      </div>
                      <div class="form-group">
                        <label>Your Email Address</label>
                        <input type="email" v-model="formData.email" placeholder="Enter Your Email Address" :class="{ 'error-border': formStatus === 'error' && !formData.email }">
                      </div>
                      <div class="form-group">
                        <label>Your Message</label>
                        <textarea v-model="formData.message" placeholder="Type your message here" :class="{ 'error-border': formStatus === 'error' && !formData.message }"></textarea>
                      </div>
                      
                      <transition name="fade">
                        <div v-if="formStatus" :class="['form-status-message', formStatus]">
                          {{ formMessage }}
                        </div>
                      </transition>

                      <button type="submit" class="submit-contact-btn" :disabled="formStatus === 'loading'">
                        {{ formStatus === 'loading' ? 'Sending...' : 'Submit Your Message' }}
                      </button>
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

const formData = ref({
  name: '',
  email: '',
  message: ''
});
const formStatus = ref(null);
const formMessage = ref('');

const showPanel = (panel) => {
  activePanel.value = panel;
  if (panel !== 'contact') {
    formStatus.value = null;
    formMessage.value = '';
    formData.value = { name: '', email: '', message: '' };
  }
};

const submitForm = async () => {
  if (!formData.value.name || !formData.value.email || !formData.value.message) {
    formStatus.value = 'error';
    formMessage.value = 'Please fill out all fields before submitting.';
    return;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.value.email)) {
    formStatus.value = 'error';
    formMessage.value = 'Please enter a valid email address.';
    return;
  }

  formStatus.value = 'loading';
  formMessage.value = 'Sending message...';

  try {
    const response = await fetch("https://formsubmit.co/ajax/azzamidn24@gmail.com", {
      method: "POST",
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name: formData.value.name,
        email: formData.value.email,
        message: formData.value.message,
        _subject: "New Message from Memento Game Studio Website",
        _template: "table"
      })
    });

    if (response.ok) {
      formStatus.value = 'success';
      formMessage.value = 'Your message has been sent successfully!';
      formData.value = { name: '', email: '', message: '' };
      
      setTimeout(() => {
        if (formStatus.value === 'success') {
          formStatus.value = null;
          formMessage.value = '';
        }
      }, 5000);
    } else {
      formStatus.value = 'error';
      formMessage.value = 'Failed to send message. Please try again later.';
    }
  } catch (error) {
    formStatus.value = 'error';
    formMessage.value = 'Network error. Please check your connection and try again.';
  }
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

.form-status-message {
  padding: 12px 20px;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 0.95rem;
  margin-top: 5px;
  text-align: center;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.form-status-message.error {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.5);
  color: #fca5a5;
  box-shadow: 0 0 15px rgba(239, 68, 68, 0.2);
}

.form-status-message.success {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.5);
  color: #6ee7b7;
  box-shadow: 0 0 15px rgba(16, 185, 129, 0.2);
}

.form-status-message.loading {
  background: rgba(212, 175, 55, 0.15);
  border: 1px solid rgba(212, 175, 55, 0.5);
  color: #fcf6ba;
  box-shadow: 0 0 15px rgba(212, 175, 55, 0.2);
}

.submit-contact-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
  filter: grayscale(0.5);
}

.error-border {
  border-color: rgba(239, 68, 68, 0.8) !important;
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.2) !important;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>

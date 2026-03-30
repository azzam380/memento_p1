<template>
  <div class="app-root">
    <SocialIcons />
    <router-view />
    <footer class="site-footer">
      © 2024. All rights reserved.
    </footer>
  </div>
</template>

<script setup>
import { watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import SocialIcons from './components/SocialIcons.vue';

const route = useRoute();

// Update body class to match current page for CSS compatibility
watch(() => route.name, (newName) => {
  if (newName) {
    document.body.className = `${newName.toLowerCase()}-page`;
  } else {
    document.body.className = '';
  }
}, { immediate: true });
</script>

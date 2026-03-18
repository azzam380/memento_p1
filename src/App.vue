<template>
  <router-view />
</template>

<script setup>
import { watch } from 'vue';
import { useRoute } from 'vue-router';

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

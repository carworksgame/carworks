<template>
  <router-view />
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { audioService } from './logic/audio'

function handleGlobalClick(event) {
  // Detect interactive elements (buttons, items, tabs, etc)
  const isInteractive = event.target.closest('button, .q-btn, .q-item, .q-tab, .q-checkbox, .q-radio, .q-toggle, a')
  if (isInteractive) {
    audioService.playClick()
  }
}

onMounted(() => {
  window.addEventListener('click', handleGlobalClick, true)
})

onUnmounted(() => {
  window.removeEventListener('click', handleGlobalClick, true)
})
</script>

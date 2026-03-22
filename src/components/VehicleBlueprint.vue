<template>
  <div class="blueprint-container shadow-2 rounded-borders overflow-hidden bg-blue-grey-1 relative-position">
    <!-- SVG Blueprint -->
    <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" class="full-width full-height car-svg">
      <!-- Grid Background -->
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0,0,0,0.05)" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />

      <!-- Shadow -->
      <ellipse cx="200" cy="165" rx="140" ry="10" fill="rgba(0,0,0,0.1)" />

      <!-- CAR BODY GROUP -->
      <g :fill="bodyColor" stroke="#2c3e50" stroke-width="3" stroke-linejoin="round">
        
        <!-- Chassis / Base -->
        <path v-if="chassisId === 'basic-chassis'" 
          d="M 60 140 L 340 140 L 340 155 L 60 155 Z" />
        <path v-else
          d="M 40 135 L 360 135 L 360 155 L 40 155 Z" />

        <!-- Engine Compartment (Front) -->
        <path v-if="tech.includes('aerodynamic-body')" 
          :d="`M 260 140 L 350 140 L 350 ${frontHeight + 10} Q 320 ${frontHeight - 10} 260 ${frontHeight} Z`" />
        <rect v-else x="260" :y="frontHeight" width="80" :height="140 - frontHeight" rx="5" />
        
        <!-- Cabin / Middle -->
        <path :d="cabinPath" />

        <!-- Rear / Trunk -->
        <path :d="rearPath" />
      </g>

      <!-- DETAILS (Always there but change position) -->
      <!-- Wheels -->
      <g fill="#333" stroke="#000" stroke-width="2">
        <circle :cx="wheelFrontX" cy="150" r="25" fill="#222" /> <!-- Front -->
        <circle :cx="wheelRearX" cy="150" r="25" fill="#222" /> <!-- Rear -->
        <!-- Rims -->
        <circle :cx="wheelFrontX" cy="150" r="12" fill="#999" />
        <circle :cx="wheelRearX" cy="150" r="12" fill="#999" />
      </g>

      <!-- Headlight -->
      <circle :cx="tech.includes('aerodynamic-body') ? 345 : 335" :cy="frontHeight + 15" r="6" :fill="tech.includes('electric-lights') ? '#fffbe0' : '#555'" />
      <path v-if="tech.includes('electric-lights')" :d="`M 340 ${frontHeight + 15} L 380 ${frontHeight - 10} L 380 ${frontHeight + 40} Z`" fill="rgba(255,255,200,0.2)" stroke="none" />

      <!-- Steering (Tiller vs Wheel) -->
      <g stroke="#333" stroke-width="2">
        <line v-if="steeringId === 'tiller-steering'" x1="220" y1="100" x2="240" y2="80" />
        <g v-else>
           <line x1="220" y1="110" x2="240" y2="85" />
           <ellipse cx="240" cy="85" rx="12" ry="4" transform="rotate(-30, 240, 85)" fill="none" />
        </g>
      </g>

    </svg>

    <!-- Labels Overlay -->
    <div class="absolute-top-left q-pa-sm">
      <q-badge outline color="blue-grey-8" label="CARWORKS BLUEPRINT v1.1" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  chassisId: String,
  engineId: String,
  steeringId: String,
  brakesId: String,
  tech: {
    type: Array,
    default: () => []
  }
})

const bodyColor = '#ecf0f1'

const frontHeight = computed(() => {
  if (props.tech.includes('fuel-injection')) return 90
  if (props.tech.includes('v8-engine')) return 100
  if (props.tech.includes('inline-4')) return 110
  return 120
})

const wheelFrontX = 290
const wheelRearX = 110

const cabinPath = computed(() => {
  // Aerodynamic era
  if (props.tech.includes('aerodynamic-body')) {
    return "M 120 140 L 260 140 L 260 75 Q 230 50 130 65 Q 120 70 120 100 Z"
  }
  // Mid era
  if (props.tech.includes('inline-4')) {
    return "M 120 140 L 260 140 L 260 70 L 140 70 Q 120 70 120 100 Z"
  }
  // Boxy early era
  return "M 100 140 L 260 140 L 260 60 L 100 60 Z"
})

const rearPath = computed(() => {
  if (props.tech.includes('aerodynamic-body')) {
     return "M 45 140 L 120 140 L 120 100 Q 100 100 45 115 Z"
  }
  if (props.tech.includes('inline-4')) {
    return "M 60 140 L 120 140 L 120 100 L 60 115 Z"
  }
  return "M 60 140 L 100 140 L 100 100 L 60 100 Z"
})
</script>

<style scoped>
.blueprint-container {
  width: 100%;
  height: 300px;
  border: 2px solid #bdc3c7;
}
.car-svg {
  filter: drop-shadow(0 5px 5px rgba(0,0,0,0.1));
}
</style>

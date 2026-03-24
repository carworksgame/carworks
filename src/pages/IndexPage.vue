<template>
  <q-page class="bg-black flex flex-center no-scroll overflow-hidden">
    <div class="factory-container shadow-10 overflow-hidden relative-position">
      <!-- The visual backdrop -->
      <img src="~assets/images/factory.png" class="factory-image" />

      <!-- SVG Grid Overlay (6x6) -->
      <svg 
        viewBox="0 0 1200 720" 
        preserveAspectRatio="xMidYMid slice" 
        class="absolute-full grid-svg"
      >
        <!-- The Grid Cells -->
        <g v-for="row in 6" :key="'row-'+row">
          <g v-for="col in 6" :key="'cell-'+row+'-'+col"
             class="grid-cell-group cursor-pointer"
             @mouseenter="handleMouseEnter(row, col)"
             @mouseleave="hoveredBuilding = null"
             @click="handleCellClick(row, col)"
          >
            <!-- The actual interactive rect (200x120 for a 1200x720 viewBox) -->
            <rect 
              :x="(col-1) * 200" :y="(row-1) * 120" width="200" height="120"
              fill="transparent"
              class="grid-rect"
              :class="{ 'debug-visible': debugStore.debugMode }"
            />
            
            <!-- Hover Highlight (only if mapped) -->
            <rect 
              v-if="isMapped(row, col)"
              :x="(col-1) * 200" :y="(row-1) * 120" width="200" height="120"
              fill="rgba(255,255,255,0.15)"
              class="grid-highlight"
            />

            <!-- Debug Coordinates (Visible only in Dev Mode) -->
            <text 
              v-if="debugStore.debugMode"
              :x="(col-1) * 200 + 100" :y="(row-1) * 120 + 65"
              fill="red"
              font-size="24"
              text-anchor="middle"
              class="debug-text"
            >
              {{ row }},{{ col }}
            </text>
          </g>
        </g>
      </svg>

      <!-- Detroit-style Info Bar -->
      <div class="absolute-bottom full-width info-bar flex items-center q-px-lg">
        <div class="text-h5 text-weight-bolder text-brown-10 text-uppercase">
          {{ hoveredBuilding || 'The Industrial Complex' }}
        </div>
        <q-space />
        <div class="text-subtitle1 text-brown-9 italic">
          {{ getBuildingDescription(hoveredBuilding) }}
        </div>
      </div>
      
      <!-- Developer Coordinate Helper -->
      <div v-if="debugStore.debugMode" class="absolute-top-right q-pa-sm bg-black text-white text-caption">
        DEV MODE: 6x6 Grid Active
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDebugStore } from '../stores/debug'
import { audioService } from '../logic/audio'

const router = useRouter()
const debugStore = useDebugStore()

const hoveredBuilding = ref(null)

/**
 * UPDATED 6x6 GRID MAPPING
 */
const gridMap = {
  // Marketing
  "2,2": { label: 'Marketing Department', route: '/marketing' },
  "2,3": { label: 'Marketing Department', route: '/marketing' },
  "3,2": { label: 'Marketing Department', route: '/marketing' },
  "3,3": { label: 'Marketing Department', route: '/marketing' },

  // Manufacturing
  "1,4": { label: 'Manufacturing Plant', route: '/manufacturing' },
  "1,5": { label: 'Manufacturing Plant', route: '/manufacturing' },
  "1,6": { label: 'Manufacturing Plant', route: '/manufacturing' },
  "2,4": { label: 'Manufacturing Plant', route: '/manufacturing' },
  "2,5": { label: 'Manufacturing Plant', route: '/manufacturing' },
  "2,6": { label: 'Manufacturing Plant', route: '/manufacturing' },

  // Manager's Office
  "4,2": { label: 'Manager\'s Office', route: '/office' },
  "5,2": { label: 'Manager\'s Office', route: '/office' },

  // Design Workshop
  "4,4": { label: 'Design Workshop', route: '/design' },
  "5,4": { label: 'Design Workshop', route: '/design' },

  // R&D Lab
  "4,5": { label: 'R&D Laboratory', route: '/research' },
  "4,6": { label: 'R&D Laboratory', route: '/research' },
}

function isMapped(row, col) {
  return !!gridMap[`${row},${col}`]
}

function handleMouseEnter(row, col) {
  const mapping = gridMap[`${row},${col}`]
  if (mapping) {
    hoveredBuilding.value = mapping.label
  } else {
    hoveredBuilding.value = null
  }
}

function handleCellClick(row, col) {
  const mapping = gridMap[`${row},${col}`]
  if (mapping) {
    audioService.playClick()
    router.push(mapping.route)
  }
}

function getBuildingDescription(label) {
  if (!label) return 'Welcome to your empire.'
  const descriptions = {
    'Marketing Department': 'Advertising, PR, and Brand Growth',
    'Design Workshop': 'Drafting, Prototyping, and Field Testing',
    'R&D Laboratory': 'Technician Management & Innovation',
    'Manager\'s Office': 'Ledgers, Reports, and Global Strategy',
    'Manufacturing Plant': 'Regional Production & Logistics'
  }
  return descriptions[label] || ''
}
</script>

<style lang="scss" scoped>
.factory-container {
  width: 95vw;
  height: calc(95vw * 0.6); // Maintain 1200:720 aspect ratio
  max-width: 1200px;
  max-height: 720px;
  border: 8px solid #3e2723;
  background: #000;
}

.factory-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.grid-svg {
  z-index: 5;
}

.grid-rect {
  pointer-events: all;
  &.debug-visible {
    stroke: rgba(255, 0, 0, 0.5);
    stroke-width: 1;
    fill: rgba(255, 0, 0, 0.05);
  }
}

.debug-text {
  pointer-events: none;
  font-weight: bold;
  text-shadow: 1px 1px 2px black;
}

.grid-highlight {
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;
}

.grid-cell-group:hover .grid-highlight {
  opacity: 1;
}

.info-bar {
  height: 60px;
  background: rgba(215, 204, 200, 0.9);
  border-top: 4px solid #3e2723;
  z-index: 10;
  color: #3e2723;
}
</style>

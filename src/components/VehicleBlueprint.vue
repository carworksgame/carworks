<template>
  <div class="blueprint-container shadow-3 rounded-borders overflow-hidden relative-position">
    <svg viewBox="0 0 420 220" xmlns="http://www.w3.org/2000/svg" class="full-width full-height car-svg">
      <defs>
        <pattern id="minorGrid" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(120, 210, 255, 0.08)" stroke-width="0.6" />
        </pattern>
        <pattern id="majorGrid" width="50" height="50" patternUnits="userSpaceOnUse">
          <rect width="50" height="50" fill="url(#minorGrid)" />
          <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(120, 210, 255, 0.18)" stroke-width="1" />
        </pattern>
        <pattern id="hatch" width="6" height="6" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(120, 210, 255, 0.25)" stroke-width="1" />
        </pattern>
        <linearGradient id="glassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="rgba(160, 235, 255, 0.35)" />
          <stop offset="100%" stop-color="rgba(80, 170, 230, 0.1)" />
        </linearGradient>
        <linearGradient id="bodyFillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="rgba(90, 190, 250, 0.22)" />
          <stop offset="100%" stop-color="rgba(30, 100, 170, 0.32)" />
        </linearGradient>
        <linearGradient id="beamGrad" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stop-color="rgba(255, 250, 180, 0.45)" />
          <stop offset="100%" stop-color="rgba(255, 250, 180, 0)" />
        </linearGradient>
      </defs>

      <!-- Blueprint Background & Frame -->
      <rect width="420" height="220" fill="#0d253f" />
      <rect width="420" height="220" fill="url(#majorGrid)" />
      <rect x="6" y="6" width="408" height="208" fill="none" stroke="rgba(140, 220, 255, 0.4)" stroke-width="1.2" />
      <rect x="9" y="9" width="402" height="202" fill="none" stroke="rgba(140, 220, 255, 0.18)" stroke-width="0.6" />

      <!-- Corner Crosshairs -->
      <g stroke="rgba(140, 220, 255, 0.5)" stroke-width="0.8">
        <path d="M 14 20 L 26 20 M 20 14 L 20 26" />
        <path d="M 394 20 L 406 20 M 400 14 L 400 26" />
      </g>

      <!-- Ground Plane & Dimension Lines -->
      <g stroke="rgba(140, 220, 255, 0.4)" stroke-width="0.8">
        <!-- Ground Line -->
        <line x1="25" y1="176" x2="395" y2="176" stroke-dasharray="6,3" />
        <!-- Wheelbase Dimension -->
        <line :x1="wheelRearX" y1="180" :x2="wheelRearX" y2="196" />
        <line :x1="wheelFrontX" y1="180" :x2="wheelFrontX" y2="196" />
        <line :x1="wheelRearX" y1="191" :x2="wheelFrontX" y2="191" />
        <polygon :points="`${wheelRearX},191 ${wheelRearX+5},189 ${wheelRearX+5},193`" fill="rgba(140, 220, 255, 0.5)" />
        <polygon :points="`${wheelFrontX},191 ${wheelFrontX-5},189 ${wheelFrontX-5},193`" fill="rgba(140, 220, 255, 0.5)" />
      </g>
      <text :x="(wheelRearX + wheelFrontX) / 2" y="188" fill="rgba(160, 230, 255, 0.7)" font-size="7" font-family="monospace" text-anchor="middle">
        WB: {{ wheelbaseLabel }}
      </text>

      <!-- Airflow Streamlines (Aerodynamic and later) -->
      <g v-if="aestheticTier >= 3" fill="none" stroke="rgba(140, 230, 255, 0.2)" stroke-width="0.9" stroke-dasharray="5,4">
        <path :d="airflowPathTop" />
        <path :d="airflowPathMid" />
      </g>

      <!-- Headlight Beam -->
      <path
        v-if="hasElectricLights"
        :d="`M ${headlightPos.x} ${headlightPos.y} L 412 ${headlightPos.y - 22} L 412 ${headlightPos.y + 24} Z`"
        fill="url(#beamGrad)"
      />

      <!-- Under-chassis & Suspension Ghost Detail -->
      <g stroke="rgba(130, 215, 255, 0.45)" stroke-width="1.2" fill="none">
        <!-- Chassis Frame Rail -->
        <rect :x="wheelRearX - 18" :y="chassisY" :width="wheelFrontX - wheelRearX + 36" height="5" fill="url(#hatch)" />
        <!-- Suspension Springs -->
        <path v-if="hasSuspension" :d="`M ${wheelRearX} ${chassisY - 8} L ${wheelRearX - 4} ${chassisY - 5} L ${wheelRearX + 4} ${chassisY - 2} L ${wheelRearX} ${chassisY + 4}`" />
        <path v-if="hasSuspension" :d="`M ${wheelFrontX} ${chassisY - 8} L ${wheelFrontX - 4} ${chassisY - 5} L ${wheelFrontX + 4} ${chassisY - 2} L ${wheelFrontX} ${chassisY + 4}`" />
        <!-- Exhaust Pipe (Unless full electric) -->
        <path v-if="engineId !== 'modern-electric'" :d="`M ${wheelRearX - 28} ${chassisY + 5} L ${wheelRearX - 42} ${chassisY + 6}`" stroke-width="2" />
      </g>

      <!-- Internal Ghosted Engine Block & Drivetrain -->
      <g stroke="rgba(120, 220, 255, 0.35)" stroke-width="1" fill="rgba(120, 220, 255, 0.07)" stroke-dasharray="2,1">
        <!-- Engine Block / Motor -->
        <g v-if="engineId === 'modern-electric' || engineId === 'early-hybrid'">
          <!-- Battery Pack along floor -->
          <rect :x="wheelRearX + 22" :y="chassisY - 4" :width="wheelFrontX - wheelRearX - 44" height="6" />
          <line v-for="n in 6" :key="n" :x1="wheelRearX + 22 + n * 18" :y1="chassisY - 4" :x2="wheelRearX + 22 + n * 18" :y2="chassisY + 2" />
        </g>
        <g v-if="engineId !== 'modern-electric'">
          <rect :x="engineBox.x" :y="engineBox.y" :width="engineBox.w" :height="engineBox.h" rx="2" />
          <!-- Cylinders / Valve detail -->
          <line
            v-for="c in engineCylinders"
            :key="c"
            :x1="engineBox.x + (c * (engineBox.w / (engineCylinders + 1)))"
            :y1="engineBox.y - 3"
            :x2="engineBox.x + (c * (engineBox.w / (engineCylinders + 1)))"
            :y2="engineBox.y + engineBox.h - 2"
          />
        </g>
      </g>

      <!-- ERA CAR BODY & CABIN -->
      <g stroke="#8be0ff" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">
        <!-- Main Body Silhouette -->
        <path :d="bodyPath" fill="url(#bodyFillGrad)" />

        <!-- Enclosed Cabin Windows -->
        <g v-if="aestheticTier >= 2">
          <path v-for="(win, idx) in windowPaths" :key="idx" :d="win" fill="url(#glassGrad)" stroke="#8be0ff" stroke-width="1.4" />
        </g>

        <!-- Open-Top Horseless Carriage / Brass Era Details (Tier 0 & 1) -->
        <g v-if="aestheticTier < 2" fill="none" stroke="#8be0ff" stroke-width="1.5">
          <!-- Seats -->
          <path d="M 145 125 L 145 103 Q 145 96 153 96 L 165 96 L 165 112 L 182 112 L 182 125" fill="rgba(90, 190, 250, 0.2)" />
          <path v-if="vehicleClass !== 'Sport'" d="M 195 125 L 195 103 Q 195 96 203 96 L 215 96 L 215 112 L 232 112 L 232 125" fill="rgba(90, 190, 250, 0.2)" />
          <!-- Folding Canopy (Tier 1) -->
          <path v-if="aestheticTier === 1" d="M 135 98 L 122 65 L 225 65 L 238 92" stroke-width="1.6" />
          <line v-if="aestheticTier === 1" x1="122" y1="65" x2="150" y2="112" stroke-width="1" stroke-dasharray="3,2" />
          <line v-if="aestheticTier === 1" x1="175" y1="65" x2="150" y2="112" stroke-width="1" stroke-dasharray="3,2" />
          <!-- Early Brass Windshield (Tier 1) -->
          <line v-if="aestheticTier === 1" x1="250" y1="108" x2="244" y2="68" stroke-width="2" />
        </g>

        <!-- Era Character Lines, Fenders & Trim -->
        <path
          v-for="(line, i) in trimPaths"
          :key="'trim-' + i"
          :d="line.d"
          :fill="line.fill || 'none'"
          :stroke-width="line.w || 1.2"
          :stroke-dasharray="line.dash || 'none'"
        />
      </g>

      <!-- INTERIOR & FEATURE DETAILS (Steering, Radio, AC, GPS, Airbags) -->
      <g stroke="#8be0ff" stroke-width="1.3" fill="none">
        <!-- Steering Column & Wheel/Tiller -->
        <g v-if="steeringId === 'tiller-steering'">
          <line :x1="steerPos.x" :y1="steerPos.y" :x2="steerPos.x - 22" :y2="steerPos.y - 16" stroke-width="1.8" />
          <circle :cx="steerPos.x - 22" :cy="steerPos.y - 16" r="2.5" fill="#8be0ff" />
        </g>
        <g v-else>
          <line :x1="steerPos.x + 12" :y1="steerPos.y + 14" :x2="steerPos.x" :y2="steerPos.y" stroke-width="1.5" />
          <ellipse :cx="steerPos.x" :cy="steerPos.y" rx="7" ry="2.5" :transform="`rotate(-55, ${steerPos.x}, ${steerPos.y})`" />
          <!-- Airbag indicator -->
          <circle v-if="hasAirbag" :cx="steerPos.x - 3" :cy="steerPos.y + 1" r="4" stroke="rgba(255, 210, 100, 0.75)" stroke-dasharray="2,1" />
        </g>

        <!-- Radio / GPS Antenna -->
        <g v-if="hasRadio && aestheticTier >= 2">
          <!-- Classic Whip Antenna (Tier 2-6) -->
          <path v-if="aestheticTier <= 6" :d="`M ${antennaPos.x} ${antennaPos.y} L ${antennaPos.x - 10} ${antennaPos.y - 26}`" stroke-width="1" />
          <circle v-if="aestheticTier <= 6" :cx="antennaPos.x - 10" :cy="antennaPos.y - 26" r="1.5" fill="#8be0ff" />
          <!-- Shark-fin GPS / Modern Antenna (Tier 7+) -->
          <path v-else :d="`M ${antennaPos.x - 8} ${antennaPos.y} Q ${antennaPos.x - 2} ${antennaPos.y - 8} ${antennaPos.x - 10} ${antennaPos.y - 9} L ${antennaPos.x + 4} ${antennaPos.y} Z`" fill="rgba(139, 224, 255, 0.4)" />
          <!-- Signal Waves -->
          <path v-if="hasGps || hasInfotainment" :d="`M ${antennaPos.x - 12} ${antennaPos.y - 14} Q ${antennaPos.x - 6} ${antennaPos.y - 20} ${antennaPos.x} ${antennaPos.y - 14}`" stroke="rgba(120, 255, 200, 0.6)" stroke-width="0.9" />
          <path v-if="hasGps || hasInfotainment" :d="`M ${antennaPos.x - 15} ${antennaPos.y - 18} Q ${antennaPos.x - 6} ${antennaPos.y - 26} ${antennaPos.x + 3} ${antennaPos.y - 18}`" stroke="rgba(120, 255, 200, 0.4)" stroke-width="0.9" />
        </g>

        <!-- Dashboard Infotainment / GPS Screen Glow (Tier 7-8) -->
        <rect
          v-if="hasInfotainment || hasGps"
          :x="steerPos.x + 5"
          :y="steerPos.y - 4"
          width="7"
          height="5"
          rx="1"
          fill="rgba(100, 255, 210, 0.5)"
          stroke="#64ffd2"
          stroke-width="0.8"
        />

        <!-- Headlights & Taillights -->
        <g>
          <!-- Gas Lantern vs Electric vs Modern LED -->
          <g v-if="!hasElectricLights">
            <rect :x="headlightPos.x - 4" :y="headlightPos.y - 6" width="7" height="10" rx="1" fill="rgba(255, 200, 90, 0.35)" />
            <circle :cx="headlightPos.x" :cy="headlightPos.y - 1" r="2" fill="#ffcc66" stroke="none" />
          </g>
          <g v-else-if="aestheticTier <= 4">
            <ellipse :cx="headlightPos.x" :cy="headlightPos.y" rx="4" ry="6" fill="rgba(255, 250, 190, 0.7)" />
          </g>
          <g v-else-if="aestheticTier <= 6">
            <rect :x="headlightPos.x - 6" :y="headlightPos.y - 4" width="9" height="6" rx="1" fill="rgba(255, 250, 200, 0.8)" />
          </g>
          <g v-else>
            <!-- Sleek Projector / LED Strip -->
            <path :d="`M ${headlightPos.x - 14} ${headlightPos.y - 3} L ${headlightPos.x + 2} ${headlightPos.y + 1} L ${headlightPos.x - 8} ${headlightPos.y + 4} Z`" fill="#e0ffff" stroke="#a0f0ff" />
          </g>

          <!-- Taillight (Tier 2+) -->
          <rect
            v-if="aestheticTier >= 2"
            :x="taillightPos.x"
            :y="taillightPos.y"
            width="5"
            :height="aestheticTier === 4 ? 11 : 7"
            rx="1.5"
            fill="rgba(255, 90, 90, 0.75)"
            stroke="#ff8a8a"
            stroke-width="1"
          />
        </g>
      </g>

      <!-- WHEELS & BRAKES -->
      <g v-for="(wx, idx) in [wheelRearX, wheelFrontX]" :key="'wheel-' + idx">
        <!-- Tire Outer -->
        <circle :cx="wx" :cy="wheelY" :r="wheelRadius" fill="#09192b" stroke="#8be0ff" :stroke-width="aestheticTier <= 1 ? 2.2 : 3.5" />
        <!-- Tire Sidewall / Whitewall (Tier 2-4) -->
        <circle
          v-if="aestheticTier >= 2 && aestheticTier <= 4"
          :cx="wx"
          :cy="wheelY"
          :r="wheelRadius - 4"
          fill="none"
          stroke="rgba(235, 248, 255, 0.75)"
          stroke-width="2.5"
        />
        <!-- Rim Outer -->
        <circle :cx="wx" :cy="wheelY" :r="rimRadius" fill="#0d253f" stroke="#8be0ff" stroke-width="1.4" />

        <!-- Brake Disc & Caliper (if disc/abs brakes) -->
        <g v-if="hasDiscBrakes">
          <circle :cx="wx" :cy="wheelY" :r="rimRadius - 3" fill="rgba(139, 224, 255, 0.12)" stroke="rgba(139, 224, 255, 0.55)" stroke-width="1" stroke-dasharray="3,2" />
          <path :d="`M ${wx - rimRadius + 2} ${wheelY - 6} A ${rimRadius - 2} ${rimRadius - 2} 0 0 1 ${wx - rimRadius + 5} ${wheelY - 11}`" stroke="#ff9f68" stroke-width="3.5" fill="none" />
        </g>

        <!-- Era-appropriate Spokes -->
        <!-- Tier 0-1: Wooden / Wire Carriage Spokes -->
        <g v-if="aestheticTier <= 1" stroke="#8be0ff" stroke-width="1">
          <line v-for="s in 8" :key="s" :x1="wx" :y1="wheelY" :x2="wx + Math.cos((s * Math.PI) / 4) * rimRadius" :y2="wheelY + Math.sin((s * Math.PI) / 4) * rimRadius" />
        </g>
        <!-- Tier 2-4: Classic Artillery / Chrome Hubcap -->
        <g v-else-if="aestheticTier <= 4">
          <circle :cx="wx" :cy="wheelY" :r="rimRadius * 0.58" fill="rgba(139, 224, 255, 0.35)" stroke="#8be0ff" stroke-width="1.2" />
          <circle :cx="wx" :cy="wheelY" :r="3" fill="#8be0ff" />
        </g>
        <!-- Tier 5-6: 5-Spoke Mag / Alloy -->
        <g v-else-if="aestheticTier <= 6" stroke="#8be0ff" stroke-width="2">
          <line v-for="s in 5" :key="s" :x1="wx" :y1="wheelY" :x2="wx + Math.cos((s * 2 * Math.PI) / 5 - 0.3) * rimRadius" :y2="wheelY + Math.sin((s * 2 * Math.PI) / 5 - 0.3) * rimRadius" />
          <circle :cx="wx" :cy="wheelY" r="3.5" fill="#0d253f" stroke="#8be0ff" stroke-width="1.2" />
        </g>
        <!-- Tier 7-8: Modern Split-Spoke Performance Alloy -->
        <g v-else stroke="#8be0ff" stroke-width="1.3">
          <g v-for="s in 5" :key="s">
            <line :x1="wx" :y1="wheelY" :x2="wx + Math.cos((s * 2 * Math.PI) / 5 - 0.18) * rimRadius" :y2="wheelY + Math.sin((s * 2 * Math.PI) / 5 - 0.18) * rimRadius" />
            <line :x1="wx" :y1="wheelY" :x2="wx + Math.cos((s * 2 * Math.PI) / 5 + 0.18) * rimRadius" :y2="wheelY + Math.sin((s * 2 * Math.PI) / 5 + 0.18) * rimRadius" />
          </g>
          <circle :cx="wx" :cy="wheelY" r="3.5" fill="#8be0ff" />
        </g>
      </g>

      <!-- Technical Callout Leader Lines -->
      <g stroke="rgba(140, 220, 255, 0.55)" stroke-width="0.8" fill="none">
        <!-- Engine Callout -->
        <polyline :points="`${engineBox.x + engineBox.w / 2},${engineBox.y + 4} ${engineBox.x + engineBox.w / 2 + 16},34 395,34`" />
        <circle :cx="engineBox.x + engineBox.w / 2" :cy="engineBox.y + 4" r="2" fill="#8be0ff" />
        <!-- Aesthetic / Body Callout -->
        <polyline :points="`195,${roofCalloutY} 175,34 25,34`" />
        <circle cx="195" :cy="roofCalloutY" r="2" fill="#8be0ff" />
      </g>
      <text x="27" y="30" fill="#a8e6ff" font-size="7.5" font-family="monospace" font-weight="bold">
        STYLE: {{ eraInfo.label.toUpperCase() }}
      </text>
      <text x="393" y="30" fill="#a8e6ff" font-size="7.5" font-family="monospace" font-weight="bold" text-anchor="end">
        PWR: {{ engineLabel }}
      </text>

      <!-- Blueprint Title Block (Bottom Right) -->
      <g transform="translate(270, 184)">
        <rect x="0" y="0" width="138" height="24" fill="rgba(8, 25, 45, 0.85)" stroke="rgba(140, 220, 255, 0.45)" stroke-width="0.8" />
        <line x1="88" y1="0" x2="88" y2="24" stroke="rgba(140, 220, 255, 0.35)" stroke-width="0.6" />
        <text x="5" y="10" fill="#8be0ff" font-size="6.5" font-family="monospace" font-weight="bold">CARWORKS CAD</text>
        <text x="5" y="19" fill="rgba(160, 230, 255, 0.8)" font-size="6" font-family="monospace">{{ eraInfo.decade }} // {{ vehicleClass.toUpperCase() }}</text>
        <text x="93" y="10" fill="rgba(160, 230, 255, 0.7)" font-size="5.5" font-family="monospace">AESTHETIC</text>
        <text x="93" y="19" fill="#64ffd2" font-size="7" font-family="monospace" font-weight="bold">TIER {{ aestheticTier + 1 }}/9</text>
      </g>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  chassisId: { type: String, default: 'basic-chassis' },
  engineId: { type: String, default: 'single-cylinder' },
  steeringId: { type: String, default: 'tiller-steering' },
  brakesId: { type: String, default: 'wood-brakes' },
  vehicleClass: { type: String, default: 'Utility' },
  features: {
    type: Array,
    default: () => []
  },
  tech: {
    type: Array,
    default: () => []
  }
})

// Helper to check if a technology or feature is present
const hasTechOrFeature = (id) => {
  const inTech = props.tech?.includes(id)
  const inFeatures = props.features?.some(f => (typeof f === 'string' ? f === id : f?.id === id))
  const isChassis = props.chassisId === id
  return Boolean(inTech || inFeatures || isChassis)
}

/**
 * Aesthetic Progression Tier (0 to 8)
 * Evolves as the company researches nodes along the Aesthetic research track:
 * 0: 1900 Horseless Carriage (gas-lanterns / base)
 * 1: 1912 Brass Era Tourer (electric-lights)
 * 2: 1920 Vintage Box Sedan (enclosed-cabin)
 * 3: 1935 Art Deco Streamliner (aerodynamic-body / car-radio)
 * 4: 1945 Post-War Ponton Cruiser (car-heater)
 * 5: 1960 Mid-Century Hardtop / Muscle (air-conditioning)
 * 6: 1975 Wedge / Geometric Coupe-Sedan (power-windows)
 * 7: 1985-1995 Aero Pill / Cab-Forward (cd-player / navigation-gps)
 * 8: 2005+ Modern Sculpted Concept (infotainment)
 */
const aestheticTier = computed(() => {
  if (hasTechOrFeature('infotainment')) return 8
  if (hasTechOrFeature('navigation-gps') || hasTechOrFeature('cd-player')) return 7
  if (hasTechOrFeature('power-windows')) return 6
  if (hasTechOrFeature('air-conditioning')) return 5
  if (hasTechOrFeature('car-heater')) return 4
  if (hasTechOrFeature('aerodynamic-body') || hasTechOrFeature('car-radio')) return 3
  if (hasTechOrFeature('enclosed-cabin')) return 2
  if (hasTechOrFeature('electric-lights')) return 1
  return 0
})

const eraInfo = computed(() => {
  const eras = [
    { label: 'Horseless Carriage', decade: '1900s ERA' },
    { label: 'Brass Era Tourer', decade: '1910s ERA' },
    { label: 'Vintage Box Sedan', decade: '1920s ERA' },
    { label: 'Art Deco Streamliner', decade: '1930s ERA' },
    { label: 'Ponton Cruiser', decade: '1940s-50s' },
    { label: 'Mid-Century Fastback', decade: '1960s ERA' },
    { label: 'Geometric Wedge', decade: '1970s-80s' },
    { label: 'Aero Cab-Forward', decade: '1990s ERA' },
    { label: 'Modern Sculpted', decade: '2000s+ ERA' }
  ]
  return eras[aestheticTier.value] || eras[0]
})

// Wheel and Chassis Geometry
const wheelRearX = computed(() => {
  if (aestheticTier.value <= 1) return 118
  if (props.vehicleClass === 'Luxury') return 100
  if (props.vehicleClass === 'Sport') return 112
  return 106
})

const wheelFrontX = computed(() => {
  if (aestheticTier.value <= 1) return 288
  if (props.vehicleClass === 'Luxury') return 310
  if (props.vehicleClass === 'Sport') return 296
  return 302
})

const wheelRadius = computed(() => {
  if (aestheticTier.value <= 1) return 26 // Tall carriage wheels
  if (aestheticTier.value === 2) return 24
  if (props.vehicleClass === 'Utility' && aestheticTier.value >= 5) return 24
  return 22
})

const rimRadius = computed(() => {
  if (aestheticTier.value <= 1) return 20
  if (aestheticTier.value <= 4) return 13
  if (aestheticTier.value <= 6) return 14
  return 15.5
})

const wheelY = computed(() => 175 - wheelRadius.value)

const chassisY = computed(() => {
  if (aestheticTier.value <= 1) return 136
  if (props.vehicleClass === 'Sport' && aestheticTier.value >= 5) return 146
  if (props.vehicleClass === 'Utility') return 138
  return 142
})

const wheelbaseLabel = computed(() => {
  const inches = Math.round((wheelFrontX.value - wheelRearX.value) * 0.58)
  return `${inches} IN`
})

// Roof height modifier based on vehicle class
const roofOffset = computed(() => {
  if (props.vehicleClass === 'Sport') return 8
  if (props.vehicleClass === 'Utility') return -5
  return 0
})

const roofCalloutY = computed(() => {
  const t = aestheticTier.value
  if (t === 0) return 96
  if (t === 1) return 65
  if (t === 2) return 66 + roofOffset.value
  return 72 + roofOffset.value
})

// Era-specific Main Body Silhouette Path
const bodyPath = computed(() => {
  const t = aestheticTier.value
  const rOff = roofOffset.value
  const isUtility = props.vehicleClass === 'Utility'
  const isSport = props.vehicleClass === 'Sport'

  // Tier 0: 1900 Horseless Carriage (Open runabout, high frame, short front box)
  if (t === 0) {
    return `
      M 95 136
      L 125 136 L 125 112 L 135 112 L 135 125
      L 242 125 L 242 108 L 265 108 L 285 118 L 295 136
      Z
    `
  }

  // Tier 1: 1912 Brass Era Tourer (Distinct radiator hood, open tub body, running boards)
  if (t === 1) {
    return `
      M 88 136
      L 95 104 L 132 104 L 138 122 L 244 122 L 250 104
      L 304 104 L 304 136
      Z
    `
  }

  // Tier 2: 1920s Vintage Box Sedan (Upright greenhouse, tall radiator grille)
  if (t === 2) {
    const roofY = 66 + rOff
    const rearTopX = isUtility ? 90 : 102
    return `
      M 82 140
      L 88 102 L ${rearTopX} ${roofY}
      L 234 ${roofY} L 240 103
      L 318 105 L 320 140
      Z
    `
  }

  // Tier 3: 1935 Art Deco Streamliner (Sloped teardrop tail, raked windshield, rounded nose)
  if (t === 3) {
    const roofY = 68 + rOff
    return `
      M 58 142
      Q 62 115 98 ${roofY + 8}
      Q 140 ${roofY - 4} 218 ${roofY + 2}
      L 252 102
      Q 305 102 332 112
      Q 344 122 342 142
      Z
    `
  }

  // Tier 4: 1945-50s Ponton Cruiser (Slab-sided full-width body, rounded hood & trunk)
  if (t === 4) {
    const roofY = 70 + rOff
    const rearCabinX = isUtility ? 82 : 122
    return `
      M 52 144
      L 54 110
      Q 62 102 90 102
      L ${rearCabinX} ${roofY + 4}
      Q 175 ${roofY - 4} 225 ${roofY + 2}
      L 256 102
      Q 320 100 344 110
      Q 354 122 350 144
      Z
    `
  }

  // Tier 5: 1960s Mid-Century Hardtop / Muscle (Long low hood, crisp deck, fastback/Coke-bottle beltline)
  if (t === 5) {
    const roofY = 74 + rOff
    const cPillarX = isUtility ? 75 : (isSport ? 105 : 118)
    return `
      M 48 144
      L 56 104
      L ${cPillarX} 102
      L ${isUtility ? 82 : 142} ${roofY}
      L 222 ${roofY}
      L 260 102
      L 354 105
      L 360 120
      L 352 144
      Z
    `
  }

  // Tier 6: 1975-80s Geometric Wedge (Sharp angular folded-paper profile, sloped wedge nose)
  if (t === 6) {
    const roofY = 74 + rOff
    const rearGlassX = isUtility ? 68 : (isSport ? 95 : 112)
    return `
      M 48 144
      L 52 104
      L ${rearGlassX} 102
      L ${isUtility ? 74 : 136} ${roofY}
      L 224 ${roofY}
      L 268 104
      L 358 114
      L 364 132
      L 356 144
      Z
    `
  }

  // Tier 7: 1990s Aero Cab-Forward (Smooth organic curves, sweeping windshield, integrated bumpers)
  if (t === 7) {
    const roofY = 72 + rOff
    const rearDeckX = isUtility ? 66 : 92
    return `
      M 46 144
      Q 44 114 60 102
      L ${rearDeckX} 98
      Q 135 ${roofY - 4} 218 ${roofY}
      Q 255 ${roofY + 8} 282 104
      Q 338 108 362 122
      Q 368 134 358 144
      Z
    `
  }

  // Tier 8: 2005+ Modern Sculpted Concept (Aggressive aero stance, sleek coupe-like roofline, sharp fascia)
  const roofY = 70 + rOff
  const tailX = isUtility ? 62 : 82
  return `
    M 44 145
    L 48 102
    Q 64 96 ${tailX} 94
    Q 145 ${roofY - 6} 225 ${roofY}
    Q 262 ${roofY + 8} 290 102
    Q 345 106 368 120
    L 364 145
    Z
  `
})

// Window Cutouts for Enclosed Cabins (Tier 2+)
const windowPaths = computed(() => {
  const t = aestheticTier.value
  const rOff = roofOffset.value
  const isUtility = props.vehicleClass === 'Utility'
  const isSport = props.vehicleClass === 'Sport'

  if (t < 2) return []

  if (t === 2) {
    const top = 71 + rOff
    if (isSport) {
      return [`M 155 ${top} L 228 ${top} L 233 100 L 155 100 Z`]
    }
    if (isUtility) {
      return [
        `M 96 ${top} L 165 ${top} L 165 100 L 94 100 Z`,
        `M 173 ${top} L 228 ${top} L 233 100 L 173 100 Z`
      ]
    }
    return [
      `M 108 ${top} L 165 ${top} L 165 100 L 104 100 Z`,
      `M 173 ${top} L 228 ${top} L 233 100 L 173 100 Z`
    ]
  }

  if (t === 3) {
    const top = 73 + rOff
    return [
      `M 112 98 Q 124 ${top} 170 ${top} L 170 98 Z`,
      `M 178 ${top} L 215 ${top + 1} L 244 98 L 178 98 Z`
    ]
  }

  if (t === 4) {
    const top = 74 + rOff
    return [
      `M 126 99 L 140 ${top + 2} L 178 ${top} L 178 99 Z`,
      `M 185 ${top} L 222 ${top + 2} L 248 99 L 185 99 Z`
    ]
  }

  if (t === 5) {
    const top = 78 + rOff
    if (isSport) {
      return [`M 122 99 L 152 ${top} L 220 ${top} L 252 99 Z`]
    }
    return [
      `M 124 99 L 146 ${top} L 182 ${top} L 182 99 Z`,
      `M 189 ${top} L 220 ${top} L 252 99 L 189 99 Z`
    ]
  }

  if (t === 6) {
    const top = 78 + rOff
    if (isSport) {
      return [`M 116 99 L 144 ${top} L 222 ${top} L 260 100 Z`]
    }
    return [
      `M 118 99 L 140 ${top} L 182 ${top} L 182 99 Z`,
      `M 188 ${top} L 222 ${top} L 260 100 L 188 99 Z`
    ]
  }

  // Tier 7 & 8: Sleek wraparound greenhouse with B-pillar
  const top = (t === 7 ? 76 : 74) + rOff
  return [
    `M 110 96 Q 142 ${top} 188 ${top} L 186 98 Z`,
    `M 193 ${top} Q 238 ${top + 2} 276 100 L 191 98 Z`
  ]
})

// Era-specific Trim, Fenders, Tailfins & Character Lines
const trimPaths = computed(() => {
  const t = aestheticTier.value
  const rw = wheelRearX.value
  const fw = wheelFrontX.value

  // Tier 0: Carriage step & delicate fender curves
  if (t === 0) {
    return [
      { d: `M ${rw - 28} 134 Q ${rw} 116 ${rw + 26} 136`, w: 1.8 },
      { d: `M ${fw - 26} 136 Q ${fw} 116 ${fw + 28} 134`, w: 1.8 },
      { d: `M ${rw + 24} 136 L ${fw - 24} 136`, w: 2 }
    ]
  }

  // Tier 1: Brass Era sweeping fenders + vertical hood louvers
  if (t === 1) {
    return [
      { d: `M ${rw - 32} 142 Q ${rw} 112 ${rw + 30} 140 L ${fw - 30} 140 Q ${fw} 112 ${fw + 34} 136`, w: 2.2 },
      { d: 'M 265 110 L 265 128 M 272 110 L 272 128 M 279 110 L 279 128 M 286 110 L 286 128', w: 1 }
    ]
  }

  // Tier 2: 1920s full fenders + vertical radiator louvers + spare wheel at rear
  if (t === 2) {
    return [
      { d: `M ${rw - 30} 146 Q ${rw} 112 ${rw + 30} 142 L ${fw - 30} 142 Q ${fw} 112 ${fw + 34} 142`, w: 2.2 },
      { d: 'M 262 112 L 262 130 M 270 112 L 270 130 M 278 112 L 278 130 M 286 112 L 286 130 M 294 112 L 294 130', w: 1 },
      { d: 'M 75 108 L 81 108 L 81 136 L 75 136 Z', w: 1.5, fill: 'rgba(90, 190, 250, 0.25)' }
    ]
  }

  // Tier 3: 1930s Art Deco teardrop pontoon fenders & speed lines
  if (t === 3) {
    return [
      { d: `M ${rw - 36} 144 Q ${rw} 110 ${rw + 34} 144`, w: 2, fill: 'rgba(40, 120, 190, 0.35)' },
      { d: `M ${fw - 34} 144 Q ${fw + 4} 108 ${fw + 38} 144`, w: 2, fill: 'rgba(40, 120, 190, 0.35)' },
      { d: 'M 268 112 L 315 114 M 272 117 L 318 119', w: 1 }
    ]
  }

  // Tier 4: 1950s Chrome side spear, rear fender skirt & tailfin accent
  if (t === 4) {
    return [
      { d: 'M 54 110 L 46 96 L 92 102', w: 1.6, fill: 'rgba(90, 190, 250, 0.25)' },
      { d: 'M 56 118 L 344 118', w: 1.5 },
      { d: `M ${rw - 26} 144 L ${rw + 26} 144`, w: 2.5 },
      { d: 'M 46 138 L 60 138 M 344 138 L 356 138', w: 3 }
    ]
  }

  // Tier 5: 1960s Muscle / Hardtop crease & chrome bumpers
  if (t === 5) {
    return [
      { d: 'M 56 114 L 140 112 Q 200 116 354 114', w: 1.3 },
      { d: 'M 178 103 L 178 138', w: 0.9, dash: '2,2' },
      { d: 'M 44 138 L 56 138 M 350 138 L 362 138', w: 3 }
    ]
  }

  // Tier 6: 1970s-80s Wedge rubbing strip, angular wheel arches & impact bumpers
  if (t === 6) {
    return [
      { d: 'M 50 124 L 360 126', w: 2 },
      { d: 'M 185 102 L 185 138', w: 1 },
      { d: 'M 42 136 L 56 136 M 352 136 L 366 136', w: 3.5 }
    ]
  }

  // Tier 7: 1990s Aero sculpted door crease & flush handles
  if (t === 7) {
    return [
      { d: 'M 62 114 Q 200 118 345 122', w: 1.2 },
      { d: 'M 188 100 L 186 138', w: 0.9 },
      { d: 'M 135 110 L 145 110 M 198 111 L 208 111', w: 1.6 }
    ]
  }

  // Tier 8: 2005+ Dynamic character blade, lower splitter & diffuser
  return [
    { d: 'M 65 108 Q 190 114 342 122', w: 1.4 },
    { d: 'M 140 136 L 265 134 L 255 124', w: 1.1 },
    { d: 'M 348 143 L 372 143 L 366 135', w: 1.8 },
    { d: 'M 190 100 L 188 138', w: 0.9 }
  ]
})

// Airflow Streamlines (Tier 3+)
const airflowPathTop = computed(() => {
  const rY = roofCalloutY.value - 8
  return `M 30 ${rY + 25} Q 110 ${rY - 12} 210 ${rY - 6} Q 290 ${rY + 4} 385 ${rY + 28}`
})

const airflowPathMid = computed(() => {
  const rY = roofCalloutY.value
  return `M 25 ${rY + 38} Q 115 ${rY} 225 ${rY + 4} Q 310 ${rY + 14} 390 ${rY + 36}`
})

// Engine Block Placement & Cylinder Count
const engineBox = computed(() => {
  const t = aestheticTier.value
  if (t === 0) return { x: 155, y: 118, w: 32, h: 16 } // Under-seat single/twin cylinder
  if (t <= 2) return { x: 256, y: 108, w: 42, h: 24 }
  return { x: 272, y: 110, w: 50, h: 24 }
})

const engineCylinders = computed(() => {
  const id = props.engineId || ''
  if (id.includes('single')) return 1
  if (id.includes('twin')) return 2
  if (id.includes('v8')) return 4 // 4 per bank in side profile
  if (id.includes('inline-6') || id.includes('diesel')) return 6
  return 4
})

const engineLabel = computed(() => {
  return (props.engineId || 'single-cylinder').toUpperCase().replace(/-/g, ' ')
})

// Steering, Headlight, Taillight & Antenna Positions
const steerPos = computed(() => {
  const t = aestheticTier.value
  if (t === 0) return { x: 226, y: 102 }
  if (t === 1) return { x: 232, y: 96 }
  if (t === 2) return { x: 218, y: 94 }
  return { x: 232, y: 94 }
})

const headlightPos = computed(() => {
  const t = aestheticTier.value
  if (t === 0) return { x: 294, y: 116 }
  if (t === 1) return { x: 306, y: 112 }
  if (t === 2) return { x: 320, y: 114 }
  if (t === 3) return { x: 336, y: 118 }
  if (t === 4) return { x: 346, y: 116 }
  if (t === 5) return { x: 355, y: 114 }
  if (t === 6) return { x: 358, y: 120 }
  if (t === 7) return { x: 356, y: 120 }
  return { x: 360, y: 118 }
})

const taillightPos = computed(() => {
  const t = aestheticTier.value
  if (t === 2) return { x: 82, y: 122 }
  if (t === 3) return { x: 60, y: 126 }
  if (t === 4) return { x: 50, y: 106 }
  if (t === 5) return { x: 50, y: 108 }
  if (t === 6) return { x: 49, y: 108 }
  if (t === 7) return { x: 47, y: 106 }
  return { x: 46, y: 104 }
})

const antennaPos = computed(() => {
  const t = aestheticTier.value
  const rOff = roofOffset.value
  if (t <= 6) return { x: 255, y: 102 }
  return { x: 125, y: 72 + rOff }
})

// Feature / Tech Flags
const hasElectricLights = computed(() => hasTechOrFeature('electric-lights') || aestheticTier.value >= 1)
const hasSuspension = computed(() =>
  ['leaf-springs', 'shock-absorbers', 'ifs-handling', 'power-steering', 'rack-and-pinion', 'esc-handling'].includes(props.steeringId) ||
  hasTechOrFeature('leaf-springs')
)
const hasDiscBrakes = computed(() =>
  ['disc-brakes', 'abs-brakes'].includes(props.brakesId) || hasTechOrFeature('disc-brakes')
)
const hasRadio = computed(() => hasTechOrFeature('car-radio') || hasTechOrFeature('cd-player') || aestheticTier.value >= 3)
const hasGps = computed(() => hasTechOrFeature('navigation-gps'))
const hasInfotainment = computed(() => hasTechOrFeature('infotainment'))
const hasAirbag = computed(() => hasTechOrFeature('driver-airbag') || hasTechOrFeature('full-airbags'))
</script>

<style scoped>
.blueprint-container {
  width: 100%;
  height: 300px;
  border: 2px solid #2b5c8f;
  background-color: #0d253f;
}
.car-svg {
  display: block;
}
</style>

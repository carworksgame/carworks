<template>
  <q-page padding class="bg-grey-2">
    <div class="text-h4 q-mb-md">Design Workshop</div>

    <!-- STAGE 1: SPECIFICATION (If no active prototype) -->
    <div v-if="!designStore.activePrototype" class="row q-gutter-md">
      <!-- Design Selection -->
      <q-card flat bordered class="col-12 col-md-4">
        <q-card-section class="bg-teal-9 text-white">
          <div class="text-h6">Vehicle Specification</div>
        </q-card-section>

        <q-card-section class="q-gutter-y-md">
          <q-input v-model="currentDesign.name" label="Model Name" dense outlined />

          <div class="q-mb-sm">
            <div class="text-caption q-mb-xs">Vehicle Class</div>
            <q-btn-toggle
              v-model="currentDesign.vehicleClass"
              spread
              no-caps
              rounded
              unelevated
              toggle-color="teal-9"
              color="white"
              text-color="teal-9"
              :options="classOptions"
            />
            <div class="bg-teal-1 q-pa-sm q-mt-sm rounded-borders text-caption text-teal-10">
              <q-icon name="info" size="xs" /> {{ classPriorities[currentDesign.vehicleClass] }}
            </div>
          </div>

          <q-select
            v-model="currentDesign.chassis"
            :options="unlockedComponents.chassis"
            option-label="name"
            label="Chassis"
            dense outlined
          />

          <q-select
            v-model="currentDesign.engine"
            :options="unlockedComponents.engine"
            option-label="name"
            label="Engine"
            dense outlined
          />

          <q-select
            v-model="currentDesign.steering"
            :options="unlockedComponents.steering"
            option-label="name"
            label="Steering"
            dense outlined
          />

          <q-select
            v-model="currentDesign.brakes"
            :options="unlockedComponents.brakes"
            option-label="name"
            label="Braking System"
            dense outlined
          />

          <q-select
            v-model="currentDesign.features"
            :options="unlockedComponents.features"
            option-label="name"
            label="Additional Features"
            multiple
            use-chips
            dense outlined
          />
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn color="teal" label="Begin Prototyping" icon="science" @click="startPrototype" />
        </q-card-actions>
      </q-card>

      <!-- Stats & Visualization -->
      <q-card flat bordered class="col-12 col-md-7">
        <q-card-section class="bg-grey-9 text-white">
          <div class="text-h6">Theoretical Analysis</div>
        </q-card-section>

        <q-card-section>
          <div class="row q-gutter-md">
            <div class="col-12 col-sm-6">
              <div class="text-subtitle2 q-mb-sm">Cost & Weight</div>
              <div class="bg-grey-3 q-pa-md rounded-borders">
                <div class="row justify-between">
                  <span>Est. Unit Cost:</span>
                  <span class="text-weight-bold text-red-9">${{ totalCost.toLocaleString() }}</span>
                </div>
                <div class="row justify-between q-mt-xs">
                  <span>Weight:</span>
                  <span class="text-weight-bold">{{ totalWeight.toLocaleString() }} lbs</span>
                </div>
              </div>
            </div>

            <div class="col-12 col-sm-5">
              <div class="text-subtitle2 q-mb-sm">Target Ratings</div>
              <div class="q-mb-xs">
                <div class="row justify-between text-caption"><span>Power-to-Weight</span><span>{{ pwrRatio.toFixed(1) }}</span></div>
                <q-linear-progress :value="pwrRatio / 150" color="teal" />
              </div>
              <div class="q-mb-xs">
                <div class="row justify-between text-caption"><span>Fuel Economy</span><span>{{ stats.economy }} MPG</span></div>
                <q-linear-progress :value="stats.economy / 50" color="green" />
              </div>
              <div class="q-mb-xs">
                <div class="row justify-between text-caption"><span>Safety Rating</span><span>{{ stats.safety }}%</span></div>
                <q-linear-progress :value="stats.safety / 100" color="orange" />
              </div>
            </div>
          </div>

          <div class="q-mt-lg">
             <VehicleBlueprint 
               :chassis-id="currentDesign.chassis?.id"
               :engine-id="currentDesign.engine?.id"
               :steering-id="currentDesign.steering?.id"
               :tech="researchStore.unlockedTech"
             />
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- STAGE 2: ENGINEERING LAB (If active prototype) -->
    <div v-else class="row q-gutter-md">
      <q-card flat bordered class="col-12">
        <q-card-section class="bg-blue-10 text-white row items-center">
          <div class="text-h6">Engineering Lab: {{ designStore.activePrototype.name }} ({{ designStore.activePrototype.vehicleClass }})</div>
          <q-space />
          <q-btn flat dense color="white" label="Scrap Draft" icon="delete" @click="designStore.scrapPrototype()" />
        </q-card-section>

        <q-card-section class="row q-col-gutter-lg">
          <!-- Build Section -->
          <div class="col-12 col-md-4">
            <div class="text-subtitle1 q-mb-md">Phase 1: Physical Build</div>
            <div v-if="designStore.activePrototype.status === 'draft'" class="bg-blue-1 q-pa-lg rounded-borders text-center">
              <div class="text-h6 q-mb-md">Build Prototype Unit</div>
              <div class="text-caption q-mb-xl">Building a test model requires hand-crafted parts and dedicated assembly.</div>
              <div class="text-h5 text-blue-9 q-mb-lg">Cost: ${{ (designStore.activePrototype.cost * 10).toLocaleString() }}</div>
              <q-btn color="blue-10" label="Construct Prototype" icon="build" size="lg" @click="buildPrototype" />
            </div>
            <div v-else class="bg-green-1 q-pa-lg rounded-borders text-center">
              <q-icon name="check_circle" color="green" size="64px" />
              <div class="text-h6 text-green-9">Prototype Built</div>
              <div class="text-caption">Model is ready for field testing.</div>
            </div>
          </div>

          <!-- Testing Section -->
          <div class="col-12 col-md-8">
            <div class="text-subtitle1 q-mb-md">Phase 2: Performance Testing</div>
            <div v-if="designStore.activePrototype.status === 'draft'" class="text-center q-pa-xl text-grey italic">
              Prototype must be built before testing can begin.
            </div>
            <div v-else class="row q-col-gutter-md">
              <div v-for="test in availableTests" :key="test.id" class="col-12 col-sm-6">
                <q-card flat bordered class="bg-grey-1">
                  <q-card-section class="row items-center q-pb-none">
                    <div class="text-weight-bold text-uppercase text-caption text-grey-7">{{ test.label }}</div>
                    <q-space />
                    <q-badge v-if="designStore.activePrototype.results[test.id] !== null" color="green" label="RESULT READY" />
                  </q-card-section>
                  <q-card-section class="q-pt-sm">
                    <div v-if="designStore.activePrototype.results[test.id] !== null" class="text-h4 text-center text-blue-9 q-py-sm">
                      {{ formatResult(test.id, designStore.activePrototype.results[test.id]) }}
                    </div>
                    <div v-else class="text-center q-py-md">
                      <q-btn outline color="blue-grey" :label="`Run Test ($${test.fee})`" @click="runTest(test.id)" />
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="center" class="q-pa-lg">
          <q-btn 
            color="teal-9" 
            label="Release Model to Production" 
            icon="rocket_launch" 
            size="lg" 
            :disabled="designStore.activePrototype.status === 'draft'"
            @click="finalizePrototype" 
          />
        </q-card-actions>
      </q-card>
    </div>

    <!-- Existing Models -->
    <div class="text-h5 q-mt-xl q-mb-md">Current Production Models</div>
    <div v-if="designStore.activeModels.length === 0" class="text-grey italic">No active models in production.</div>
    <div class="row q-gutter-md">
       <q-card v-for="model in designStore.activeModels" :key="model.id" flat bordered class="col-12 col-sm-3">
         <q-card-section class="bg-teal-1">
           <div class="row justify-between no-wrap">
             <div class="text-h6 ellipsis">{{ model.name }}</div>
             <q-badge color="teal-9" :label="model.vehicleClass" />
           </div>
           <div class="text-caption">Launched: {{ model.introduced }}</div>
         </q-card-section>
         <q-card-section>
           <VehicleBlueprint 
             :chassis-id="model.components.chassis"
             :engine-id="model.components.engine"
             :steering-id="model.components.steering"
             :tech="researchStore.unlockedTech"
             style="height: 150px"
           />
           <div class="row justify-between q-mt-md">
             <span>Cost:</span>
             <span class="text-weight-bold">${{ model.cost.toLocaleString() }}</span>
           </div>
           <div class="row justify-between text-caption text-grey-8">
             <span>Real Economy:</span>
             <span>{{ model.stats.realEconomy?.toFixed(1) }} MPG</span>
           </div>
           <div v-if="model.stats.realAcceleration" class="row justify-between text-caption text-grey-8">
             <span>0-60 Time:</span>
             <span>{{ model.stats.realAcceleration?.toFixed(1) }}s</span>
           </div>
         </q-card-section>
         <q-separator />
         <q-card-actions align="center">
           <q-btn flat color="grey-7" icon="archive" label="Archive Design" size="sm" @click="confirmArchive(model)" />
         </q-card-actions>
       </q-card>
    </div>

    <!-- Archived Models -->
    <div v-if="designStore.models.some(m => m.archived)" class="q-mt-xl">
      <div class="text-h5 q-mb-md text-grey-7">Historical Archive</div>
      <div class="row q-gutter-md">
        <q-card v-for="model in designStore.models.filter(m => m.archived)" :key="model.id" flat bordered class="col-12 col-sm-2 bg-grey-2 opacity-70">
          <q-card-section class="bg-grey-4">
            <div class="text-subtitle1 ellipsis text-grey-9">{{ model.name }}</div>
            <div class="text-caption">Retired: {{ gameStore.year }}</div>
          </q-card-section>
          <q-card-actions align="center">
            <q-btn flat color="blue-grey" icon="unarchive" label="Restore" size="sm" @click="designStore.restoreModel(model.id)" />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { reactive, computed, watch } from 'vue'
import { useDesignStore, VEHICLE_CLASSES } from '../stores/design'
import { useResearchStore } from '../stores/research'
import { useGameStore } from '../stores/game'
import { useQuasar } from 'quasar'
import VehicleBlueprint from 'components/VehicleBlueprint.vue'

const designStore = useDesignStore()
const researchStore = useResearchStore()
const gameStore = useGameStore()
const $q = useQuasar()

const unlockedComponents = computed(() => designStore.getUnlockedComponents(researchStore.unlockedTech))

const currentDesign = reactive({
  name: 'Model A',
  vehicleClass: VEHICLE_CLASSES.UTILITY,
  chassis: null,
  engine: null,
  steering: null,
  brakes: null,
  features: []
})

const classOptions = [
  { label: 'Economy', value: VEHICLE_CLASSES.ECONOMY },
  { label: 'Luxury', value: VEHICLE_CLASSES.LUXURY },
  { label: 'Sport', value: VEHICLE_CLASSES.SPORT },
  { label: 'Utility', value: VEHICLE_CLASSES.UTILITY },
]

const classPriorities = {
  [VEHICLE_CLASSES.ECONOMY]: 'Prioritizes low purchase price and high fuel economy.',
  [VEHICLE_CLASSES.LUXURY]: 'Prioritizes high safety and advanced features. Less price sensitive.',
  [VEHICLE_CLASSES.SPORT]: 'Prioritizes power-to-weight ratio and rapid acceleration.',
  [VEHICLE_CLASSES.UTILITY]: 'Prioritizes durability, cargo capacity, and reliable power.'
}

const availableTests = [
  { id: 'acceleration', label: 'Acceleration (0-60)', fee: 500 },
  { id: 'braking', label: 'Braking Distance', fee: 500 },
  { id: 'economy', label: 'Fuel Economy', fee: 500 },
  { id: 'safety', label: 'Crash Safety', fee: 500 },
]

// Initialize with first available components
const initializeComponents = () => {
  if (unlockedComponents.value.chassis.length && !currentDesign.chassis) currentDesign.chassis = unlockedComponents.value.chassis[0]
  if (unlockedComponents.value.engine.length && !currentDesign.engine) currentDesign.engine = unlockedComponents.value.engine[0]
  if (unlockedComponents.value.steering.length && !currentDesign.steering) currentDesign.steering = unlockedComponents.value.steering[0]
  if (unlockedComponents.value.brakes.length && !currentDesign.brakes) currentDesign.brakes = unlockedComponents.value.brakes[0]
}

initializeComponents()
watch(() => unlockedComponents.value, () => initializeComponents(), { deep: true })

const totalCost = computed(() => {
  const featureCost = currentDesign.features.reduce((acc, f) => acc + (f.cost || 0), 0)
  return (currentDesign.chassis?.cost || 0) + (currentDesign.engine?.cost || 0) + (currentDesign.steering?.cost || 0) + (currentDesign.brakes?.cost || 0) + featureCost
})

const totalWeight = computed(() => {
  const featureWeight = currentDesign.features.reduce((acc, f) => acc + (f.weight || 0), 0)
  return (currentDesign.chassis?.weight || 0) + (currentDesign.engine?.weight || 0) + (currentDesign.steering?.weight || 0) + (currentDesign.brakes?.weight || 0) + featureWeight
})

const stats = computed(() => {
  const featureSafety = currentDesign.features.reduce((acc, f) => acc + (f.safety || 0), 0)
  return {
    power: currentDesign.engine?.power || 0,
    economy: currentDesign.engine?.economy || 0,
    safety: (currentDesign.steering?.safety || 0) + (currentDesign.brakes?.safety || 0) + featureSafety,
    pwrRatio: (currentDesign.engine?.power / totalWeight.value) * 1000 || 0
  }
})

const pwrRatio = computed(() => stats.value.pwrRatio)

function formatResult(id, val) {
  if (id === 'acceleration') return `${val.toFixed(1)}s`
  if (id === 'braking') return `${val.toFixed(0)} ft`
  if (id === 'economy') return `${val.toFixed(1)} MPG`
  if (id === 'safety') return `${val.toFixed(0)}%`
  return val
}

function startPrototype() {
  if (!currentDesign.name || !currentDesign.chassis || !currentDesign.engine || !currentDesign.steering || !currentDesign.brakes) {
    $q.notify({ color: 'negative', message: 'Please complete the base design (Chassis, Engine, Steering, Brakes).' })
    return
  }
  
  const prototype = {
    name: currentDesign.name,
    vehicleClass: currentDesign.vehicleClass,
    cost: totalCost.value,
    weight: totalWeight.value,
    stats: { ...stats.value },
    components: {
      chassis: currentDesign.chassis.id,
      engine: currentDesign.engine.id,
      steering: currentDesign.steering.id,
      brakes: currentDesign.brakes.id,
      features: currentDesign.features.map(f => f.id)
    }
  }
  
  designStore.startPrototype(prototype)
}

function confirmArchive(model) {
  $q.dialog({
    title: 'Archive Design',
    message: `Stop production of ${model.name} and move it to the historical archive?`,
    cancel: true,
    persistent: true
  }).onOk(() => {
    designStore.archiveModel(model.id)
    $q.notify({ color: 'info', message: `${model.name} archived.`, icon: 'archive' })
  })
}

function buildPrototype() {
  if (!designStore.buildPrototype()) {
    $q.notify({ color: 'negative', message: 'Insufficient funds to build prototype.' })
  } else {
    $q.notify({ color: 'positive', message: 'Prototype constructed!' })
  }
}

function runTest(testId) {
  if (!designStore.runTest(testId)) {
    $q.notify({ color: 'negative', message: 'Insufficient funds for testing.' })
  }
}

function finalizePrototype() {
  const allTested = Object.values(designStore.activePrototype.results).every(r => r !== null)
  if (!allTested) {
    $q.dialog({
      title: 'Untested Model',
      message: 'You haven\'t completed all tests. Real performance stats will be unknown until production. Proceed anyway?',
      cancel: true,
      persistent: true
    }).onOk(() => {
      designStore.finalizePrototype()
      $q.notify({ color: 'positive', message: 'Model released to production!' })
    })
  } else {
    designStore.finalizePrototype()
    $q.notify({ color: 'positive', message: 'Model released to production!' })
  }
}
</script>

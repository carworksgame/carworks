<template>
  <q-page padding class="bg-grey-2">
    <div class="text-h4 q-mb-md">Manufacturing & Global Sales</div>

    <!-- Active Models Selection -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section class="bg-orange-9 text-white row items-center">
        <div class="text-h6">Production Control Center</div>
        <q-space />
        <div class="text-subtitle2">Select a model to manage manufacturing and pricing</div>
      </q-card-section>
      
      <q-card-section>
        <div v-if="designStore.models.length === 0" class="text-center q-pa-lg text-grey">
          You must design a vehicle in the Design Workshop before you can start production.
        </div>
        <div v-else class="row q-gutter-md">
          <q-btn
            v-for="model in designStore.models"
            :key="model.id"
            :color="selectedModelId === model.id ? 'orange-9' : 'grey-7'"
            :label="model.name"
            @click="selectedModelId = model.id"
            unelevated
          />
        </div>
      </q-card-section>
    </q-card>

    <div v-if="selectedModel" class="row q-gutter-md">
      <!-- Territory Management -->
      <div v-for="territory in worldStore.territories" :key="territory.id" class="col-12 col-md-5">
        <q-card flat bordered :class="territory.active ? 'bg-white' : 'bg-grey-3 opacity-50'">
          <q-card-section :class="territory.active ? 'bg-blue-grey-8' : 'bg-grey-7'" class="text-white row items-center">
            <div class="text-h6">{{ territory.name }}</div>
            <q-space />
            <div v-if="territory.active" class="row items-center q-gutter-x-xs">
              <q-badge color="indigo" :label="`Supplied by: ${getSupplyingFactoryName(territory.id)}`" />
              <q-badge color="green" label="Active Market" />
            </div>
            <q-badge v-else color="grey" label="Locked" />
          </q-card-section>

          <q-card-section v-if="territory.active">
            <div class="row q-col-gutter-md">
              <!-- Production Settings -->
              <div class="col-12">
                <div class="text-subtitle2 text-orange-9 q-mb-sm row justify-between">
                  <span>Manufacturing</span>
                  <q-badge :color="getCapacityColor(territory.id)" class="text-weight-bold">
                    Capacity: {{ getUsedCapacity(territory.id) }} / {{ getCapacity(territory.id) }} Units
                  </q-badge>
                </div>
                <div class="row items-center q-gutter-sm">
                   <div class="col">
                     <q-slider
                       v-model="productionSettings[territory.id].productionVolume"
                       :min="0"
                       :max="Math.max(1000, getCapacity(territory.id))"
                       :step="10"
                       label
                       color="orange-9"
                     />
                   </div>
                   <div class="text-h6" style="width: 80px">{{ productionSettings[territory.id].productionVolume }}</div>
                </div>
                <div v-if="getUsedCapacity(territory.id) > getCapacity(territory.id)" class="text-caption text-negative text-weight-bold">
                  ⚠️ WARNING: Production exceeds manufacturing capacity! Actual production will be scaled down.
                </div>
                <div class="text-caption text-grey">Monthly units to build. Each unit costs ${{ selectedModel.cost.toLocaleString() }}.</div>
              </div>

              <!-- Pricing Settings -->
              <div class="col-12">
                <div class="text-subtitle2 text-green-9 q-mb-sm">Sales & Pricing</div>
                <div class="row items-center q-gutter-sm">
                   <q-input
                     v-model.number="productionSettings[territory.id].price"
                     type="number"
                     prefix="$"
                     label="Selling Price"
                     outlined dense
                     class="col"
                   />
                   <div class="col text-center">
                     <div class="text-caption">Profit Margin</div>
                     <q-badge :color="marginColor(territory.id)" class="text-h6">
                       {{ marginPercent(territory.id) }}%
                     </q-badge>
                   </div>
                </div>
              </div>

              <!-- Regional Inventory -->
              <div class="col-12 q-mt-md bg-grey-1 q-pa-sm rounded-borders">
                <div class="row justify-between items-center">
                  <div class="text-caption font-weight-bold">Current Regional Inventory:</div>
                  <div class="text-h6 text-blue-9">{{ playerStore.getInventory(selectedModel.id, territory.id) }} Units</div>
                </div>
              </div>
            </div>
          </q-card-section>

          <q-card-section v-else class="text-center q-pa-xl">
             <div class="text-grey">Market not yet unlocked.</div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, watch, reactive } from 'vue'
import { useWorldStore } from '../stores/world'
import { usePlayerStore } from '../stores/player'
import { useDesignStore } from '../stores/design'

const worldStore = useWorldStore()
const playerStore = usePlayerStore()
const designStore = useDesignStore()

const selectedModelId = ref(designStore.models.length > 0 ? designStore.models[0].id : null)
const selectedModel = computed(() => designStore.models.find(m => m.id === selectedModelId.value))

// Local reactive state for production sliders to avoid direct mutation issues
const productionSettings = reactive({})

// Initialize settings when a model is selected
watch(selectedModelId, (newId) => {
  if (newId) {
    worldStore.territories.forEach(t => {
      const config = playerStore.getModelConfig(newId, t.id)
      productionSettings[t.id] = {
        productionVolume: config.productionVolume || 0,
        price: config.price || Math.floor(selectedModel.value.cost * 1.5)
      }
    })
  }
}, { immediate: true })

// Sync local settings back to the store
watch(productionSettings, (newSettings) => {
  if (selectedModelId.value) {
    Object.keys(newSettings).forEach(territoryId => {
      playerStore.updateProductionConfig(
        selectedModelId.value, 
        territoryId, 
        'productionVolume', 
        newSettings[territoryId].productionVolume
      )
      playerStore.updateProductionConfig(
        selectedModelId.value, 
        territoryId, 
        'price', 
        newSettings[territoryId].price
      )
    })
  }
}, { deep: true })

function marginPercent(territoryId) {
  if (!selectedModel.value || !productionSettings[territoryId]?.price) return 0
  const profit = productionSettings[territoryId].price - selectedModel.value.cost
  return Math.floor((profit / productionSettings[territoryId].price) * 100)
}

function marginColor(territoryId) {
  const margin = marginPercent(territoryId)
  if (margin < 0) return 'negative'
  if (margin < 15) return 'warning'
  return 'positive'
}

function getCapacity(territoryId) {
  // Region capacity is the sum of output from ALL factories supplying this territory
  // Wait, actually in the new Logistics system, a territory is supplied by ONE factory.
  const factoryId = playerStore.supplyLines[territoryId]
  const factory = playerStore.factories.find(f => f.id === factoryId)
  if (!factory) return 0
  
  return Math.floor(factory.employees * playerStore.getFactoryProductivity(factory.id))
}

function getUsedCapacity(territoryId) {
  // Sum of production volume for all models in this territory
  // We use productionSettings for the current model and getModelConfig for others
  let total = 0
  designStore.models.forEach(model => {
    if (model.id === selectedModelId.value) {
      total += productionSettings[territoryId]?.productionVolume || 0
    } else {
      const config = playerStore.getModelConfig(model.id, territoryId)
      total += config.productionVolume || 0
    }
  })
  return total
}

function getCapacityColor(territoryId) {
  const used = getUsedCapacity(territoryId)
  const total = getCapacity(territoryId)
  if (used > total) return 'negative'
  if (used > total * 0.9) return 'warning'
  return 'blue-grey-8'
}

function getSupplyingFactoryName(territoryId) {
  const factoryId = playerStore.supplyLines[territoryId]
  const factory = playerStore.factories.find(f => f.id === factoryId)
  if (!factory) return 'None'
  const territoryName = worldStore.territories.find(t => t.id === factory.territory)?.name || factory.territory
  return `${factory.location} (${territoryName})`
}
</script>

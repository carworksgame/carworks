<template>
  <q-page padding class="bg-grey-2">
    <div class="row items-center q-mb-md">
      <div class="text-h4">Manufacturing & Global Logistics</div>
      <q-space />
      <q-tabs v-model="viewTab" dense class="bg-white rounded-borders shadow-1" active-color="orange-9" indicator-color="orange-9">
        <q-tab name="production" icon="factory" label="Factory Production" />
        <q-tab name="distribution" icon="local_shipping" label="Regional Distribution" />
      </q-tabs>
    </div>

    <q-tab-panels v-model="viewTab" animated class="bg-transparent">
      
      <!-- TAB 1: PRODUCTION CONTROL -->
      <q-tab-panel name="production" class="q-pa-none">
        <div v-if="playerStore.factories.length === 0" class="text-center q-pa-xl text-grey bg-white rounded-borders">
          No factories built. Open one in the Global Expansion tab!
        </div>
        <div v-else class="row q-col-gutter-md">
          <div v-for="factory in playerStore.factories" :key="factory.id" class="col-12 col-md-6">
            <q-card flat bordered>
              <q-card-section class="bg-blue-grey-9 text-white row items-center">
                <div class="text-h6">{{ factory.location }} ({{ formatTerritoryName(factory.territory) }})</div>
                <q-space />
                <q-badge :color="getLoadColor(factory)" class="text-weight-bold">
                  Factory Load: {{ getFactoryAssigned(factory.id) }} / {{ factory.totalWorkers }} Workers
                </q-badge>
              </q-card-section>

              <q-card-section v-if="designStore.models.length === 0" class="text-center q-pa-md italic text-grey">
                No designs available to build.
              </q-card-section>
              <q-list v-else separator>
                <q-item v-for="model in designStore.models" :key="model.id" class="q-py-md">
                  <q-item-section>
                    <div class="row items-center justify-between q-mb-sm">
                      <div class="text-subtitle1 text-weight-bold">{{ model.name }}</div>
                      <div class="text-caption text-indigo-9">Est. Output: {{ calculateOutput(factory, model.id) }} Units/mo</div>
                    </div>
                    <div class="row items-center q-gutter-md">
                      <q-slider
                        :model-value="getAssignment(factory.id, model.id)"
                        @update:model-value="(val) => setAssignment(factory.id, model.id, val)"
                        :min="0"
                        :max="factory.totalWorkers"
                        :step="1"
                        label
                        color="orange-9"
                        class="col"
                      />
                      <div class="text-h6 text-center" style="width: 60px">{{ getAssignment(factory.id, model.id) }}</div>
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card>
          </div>
        </div>
      </q-tab-panel>

      <!-- TAB 2: REGIONAL DISTRIBUTION -->
      <q-tab-panel name="distribution" class="q-pa-none">
        <q-card flat bordered class="q-mb-md">
          <q-card-section class="bg-orange-9 text-white row items-center">
            <div class="text-h6">Logistics Strategy</div>
            <q-space />
            <q-select
              v-model="selectedModelId"
              :options="designStore.models"
              option-label="name"
              option-value="id"
              emit-value
              map-options
              dense dark standout
              label="Select Model"
              style="min-width: 200px"
            />
          </q-card-section>
        </q-card>

        <div v-if="!selectedModelId" class="text-center q-pa-xl text-grey bg-white rounded-borders">
          Select a vehicle model to configure regional supply priorities.
        </div>
        <div v-else class="row q-col-gutter-md">
          <div v-for="territory in worldStore.territories.filter(t => t.active)" :key="territory.id" class="col-12 col-md-6">
            <q-card flat bordered>
              <q-card-section class="bg-blue-grey-2 row items-center">
                <div class="text-h6 text-blue-grey-10">{{ territory.name }} Market</div>
                <q-space />
                <q-badge color="indigo-10" :label="`Stock: ${playerStore.getInventory(selectedModelId, territory.id)} Units`" />
              </q-card-section>

              <q-card-section>
                <div class="row q-col-gutter-md items-center">
                  <!-- Pricing -->
                  <div class="col-12 col-sm-4">
                    <div class="text-overline text-grey-7">Retail Price</div>
                    <q-input
                      :model-value="getPrice(territory.id)"
                      @update:model-value="(val) => setPrice(territory.id, val)"
                      type="number"
                      prefix="$"
                      outlined dense
                    />
                  </div>

                  <!-- Source Priorities -->
                  <div class="col-12 col-sm-8">
                    <div class="text-overline text-grey-7">Supply Chain (Prioritized)</div>
                    <div class="row q-col-gutter-xs">
                      <div v-for="i in 3" :key="i" class="col-4">
                        <q-select
                          :model-value="getPriority(territory.id, i-1)"
                          @update:model-value="(val) => setPriority(territory.id, i-1, val)"
                          :options="factoryOptions"
                          option-label="label"
                          option-value="value"
                          emit-value
                          map-options
                          dense outlined
                          :label="'Pri ' + i"
                          clearable
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div class="q-mt-md bg-grey-1 q-pa-sm rounded-borders text-caption">
                  <q-icon name="info" color="grey-7" class="q-mr-xs" />
                  Demand will be fulfilled locally first (if a local factory is Pri 1), then from the priority sources in order.
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-tab-panel>

    </q-tab-panels>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useWorldStore } from '../stores/world'
import { usePlayerStore } from '../stores/player'
import { useDesignStore } from '../stores/design'

const worldStore = useWorldStore()
const playerStore = usePlayerStore()
const designStore = useDesignStore()

const viewTab = ref('production')
const selectedModelId = ref(designStore.models[0]?.id || null)

const factoryOptions = computed(() => {
  return playerStore.factories.map(f => ({
    label: f.location,
    value: f.id
  }))
})

function formatTerritoryName(id) {
  return worldStore.territories.find(t => t.id === id)?.name || id
}

// PRODUCTION HELPERS
function getAssignment(fId, mId) {
  return playerStore.factoryAssignments[fId]?.[mId] || 0
}

function setAssignment(fId, mId, val) {
  playerStore.updateFactoryAssignment(fId, mId, parseInt(val) || 0)
}

function getFactoryAssigned(fId) {
  const assignments = playerStore.factoryAssignments[fId] || {}
  return Object.values(assignments).reduce((a, b) => a + b, 0)
}

function getLoadColor(f) {
  const assigned = getFactoryAssigned(f.id)
  if (assigned > f.totalWorkers) return 'negative'
  if (assigned > f.totalWorkers * 0.9) return 'warning'
  return 'white'
}

function calculateOutput(f, mId) {
  const workers = getAssignment(f.id, mId)
  return Math.floor(workers * playerStore.getFactoryProductivity(f.id))
}

// DISTRIBUTION HELPERS
function getPrice(tId) {
  return playerStore.regionalDistribution[tId]?.[selectedModelId.value]?.price || 1000
}

function setPrice(tId, val) {
  playerStore.updateRegionalPrice(tId, selectedModelId.value, parseInt(val) || 0)
}

function getPriority(tId, idx) {
  const priorities = playerStore.regionalDistribution[tId]?.[selectedModelId.value]?.priorities || []
  return priorities[idx] || null
}

function setPriority(tId, idx, fId) {
  playerStore.updateRegionalPriority(tId, selectedModelId.value, idx, fId)
}
</script>

<template>
  <q-page padding class="bg-grey-1">
    <div class="row items-center q-mb-md">
      <div class="text-h4">Marketing Department</div>
      <q-space />
      <div class="bg-grey-3 q-pa-sm rounded-borders">
        <div class="text-caption text-grey-7 text-center">Global Monthly Budget</div>
        <div class="text-h6 text-deep-orange-9">${{ marketingStore.totalMonthlyMarketingCost.toLocaleString() }}</div>
      </div>
    </div>

    <!-- Top Section: Expos and Global Context -->
    <div class="row q-col-gutter-md q-mb-lg">
      <!-- Expo Tracker -->
      <q-card flat bordered class="col-12 col-md-6">
        <q-card-section class="bg-indigo-10 text-white row items-center">
          <div class="text-h6">Automotive Expos & Prestige</div>
          <q-space />
          <q-icon name="stars" size="sm" />
        </q-card-section>
        <q-card-section v-if="worldStore.upcomingExpos.length === 0" class="text-center q-pa-lg text-grey">
          No upcoming prestige events scheduled.
        </q-card-section>
        <q-card-section v-else>
          <div v-for="expo in worldStore.upcomingExpos" :key="expo.name" class="bg-indigo-1 q-pa-md rounded-borders">
            <div class="row items-center justify-between">
              <div>
                <div class="text-h6 text-indigo-10">{{ expo.name }}</div>
                <div class="text-caption text-indigo-9">Territory: {{ formatTerritoryName(expo.territoryId) }} • {{ formatExpoDate(expo) }}</div>
              </div>
              <q-badge color="indigo-10" label="UPCOMING" />
            </div>
            
            <q-separator class="q-my-md" />
            
            <div class="row items-center q-gutter-md">
              <div class="col">
                <q-select
                  v-model="worldStore.participatingModelId"
                  :options="designStore.activeModels"
                  option-label="name"
                  option-value="id"
                  emit-value
                  map-options
                  label="Enter Model for Competition"
                  outlined dense
                  bg-color="white"
                />
              </div>
              <div class="col-auto text-caption text-grey-8" style="max-width: 200px">
                Winners get massive brand boosts and global reputation.
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Global Brand Awareness -->
      <q-card flat bordered class="col-12 col-md-6">
        <q-card-section class="bg-blue-grey-9 text-white">
          <div class="text-h6">Global Trust & Recognition</div>
        </q-card-section>
        <q-card-section class="row items-center justify-around q-pa-lg">
          <div class="text-center">
            <div class="text-h3 text-weight-bolder text-positive">{{ Math.floor(playerStore.reputation) }}</div>
            <div class="text-caption text-grey-7 text-uppercase">Reputation</div>
          </div>
          <q-separator vertical inset />
          <div class="text-center">
            <div class="text-h3 text-weight-bolder text-deep-orange-9">{{ Math.floor(avgAwareness) }}%</div>
            <div class="text-caption text-grey-7 text-uppercase">Avg Awareness</div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Territory Selection -->
    <q-tabs
      v-model="selectedTerritoryId"
      dense
      class="text-grey q-mb-md"
      active-color="deep-orange-9"
      indicator-color="deep-orange-9"
      align="left"
      narrow-indicator
    >
      <q-tab 
        v-for="t in worldStore.territories" 
        :key="t.id" 
        :name="t.id" 
        :label="t.name" 
        :icon="t.active ? 'public' : 'lock'"
      />
    </q-tabs>

    <div class="row q-gutter-md">
      <!-- Regional Brand Status -->
      <q-card flat bordered class="col-12 col-md-3">
        <q-card-section :class="selectedTerritory?.active ? 'bg-deep-orange-9' : 'bg-grey-7'" class="text-white">
          <div class="text-h6">{{ selectedTerritory?.name }} Recognition</div>
        </q-card-section>
        
        <q-card-section v-if="selectedTerritory?.active" class="text-center q-pa-lg">
          <q-knob
            readonly
            :model-value="marketingStore.getAwareness(selectedTerritoryId)"
            show-value
            size="120px"
            :thickness="0.22"
            color="deep-orange"
            track-color="grey-3"
            class="text-deep-orange q-ma-md"
          >
            {{ Math.floor(marketingStore.getAwareness(selectedTerritoryId)) }}%
          </q-knob>
          <div class="text-subtitle1 text-grey-8">Regional Presence</div>
          <p class="text-caption text-grey-6 q-mt-sm">
            Spend dollars in this region to increase presence. Presence decays without active investment.
          </p>
        </q-card-section>
        <q-card-section v-else class="text-center q-pa-xl">
          <q-icon name="lock" size="64px" color="grey-4" />
          <div class="text-h6 text-grey-6">Market Locked</div>
        </q-card-section>
        
        <q-separator />
        
        <q-card-section v-if="selectedTerritory?.active" class="bg-grey-2">
           <div class="row justify-between items-center">
             <div class="text-subtitle2">Regional Monthly Spend:</div>
             <div class="text-h6 text-deep-orange-9">${{ marketingStore.getTerritoryMarketingCost(selectedTerritoryId).toLocaleString() }}</div>
           </div>
        </q-card-section>
      </q-card>

      <!-- Regional Model Campaigns -->
      <q-card flat bordered class="col-12 col-md-8">
        <q-card-section class="bg-blue-grey-9 text-white row items-center">
          <div class="text-h6">Multi-Channel Campaigns: {{ selectedTerritory?.name }}</div>
          <q-space />
          <q-badge color="indigo" label="Free-form Budgeting" />
        </q-card-section>
        
        <q-card-section class="q-pa-none">
          <div v-if="!selectedTerritory?.active" class="text-center q-pa-xl text-grey italic">
            Marketing actions unavailable for locked territories.
          </div>
          <div v-else-if="designStore.activeModels.length === 0" class="text-center q-pa-xl text-grey">
            No active vehicle models available to market.
          </div>
          
          <q-list v-else separator>
            <q-expansion-item
              v-for="model in designStore.activeModels"
              :key="model.id"
              group="campaigns"
              header-class="q-py-md"
            >
              <template v-slot:header>
                <q-item-section avatar>
                  <q-icon name="directions_car" color="blue-grey-4" size="40px" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-h6">{{ model.name }}</q-item-label>
                  <q-item-label caption>Active Media: {{ getActiveMediaCount(model.id) }} channels</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <div class="text-right">
                    <div class="text-subtitle2 text-deep-orange-9">${{ getModelTerritoryTotal(model.id).toLocaleString() }}/mo</div>
                    <q-badge color="green" :label="`${marketingStore.getBoostForModel(model.id, selectedTerritoryId).toFixed(2)}x Demand Boost`" />
                  </div>
                </q-item-section>
              </template>

              <q-card class="bg-grey-1">
                <q-card-section class="row q-col-gutter-md">
                  <div v-for="media in availableMedia" :key="media.id" class="col-12 col-sm-6 col-md-4">
                    <div class="bg-white q-pa-md rounded-borders border-grey shadow-1">
                      <div class="row items-center q-mb-sm">
                        <q-icon :name="mediaIcon(media.id)" color="blue-grey-8" size="xs" class="q-mr-xs" />
                        <span class="text-weight-bold">{{ media.name }}</span>
                        <q-space />
                        <span class="text-caption text-grey-7">Eff: {{ media.efficiency }}x</span>
                      </div>
                      
                      <q-input
                        :model-value="getBudget(model.id, media.id)"
                        @update:model-value="(val) => setBudget(model.id, media.id, val)"
                        type="number"
                        outlined dense
                        prefix="$"
                        placeholder="0"
                      />
                      
                      <div class="text-center q-mt-xs">
                        <q-slider
                          :model-value="getBudget(model.id, media.id)"
                          @update:model-value="(val) => setBudget(model.id, media.id, val)"
                          :min="0"
                          :max="Math.round(5000 * worldStore.inflationMultiplier)"
                          :step="50"
                          color="deep-orange-4"
                          dense
                        />
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </q-expansion-item>
          </q-list>
        </q-card-section>
      </q-card>
    </div>

    <!-- Media Reference -->
    <div class="text-h5 q-mt-xl q-mb-md">Advertising Efficiency Info</div>
    <div class="row q-gutter-md">
       <q-card v-for="media in marketingStore.mediaTypes" :key="media.id" flat bordered class="col-12 col-sm-3" :class="gameStore.year < media.minYear ? 'opacity-40 grayscale' : ''">
         <q-card-section :class="gameStore.year >= media.minYear ? 'bg-blue-1' : 'bg-grey-3'">
           <div class="row items-center no-wrap">
             <div class="text-h6">{{ media.name }}</div>
             <q-space />
             <q-icon :name="mediaIcon(media.id)" size="sm" />
           </div>
           <div v-if="gameStore.year < media.minYear" class="text-caption text-red-9 text-weight-bold">
             Invented in {{ media.minYear }}
           </div>
         </q-card-section>
         <q-card-section class="q-pa-md text-caption">
           Each dollar spent on <strong>{{ media.name }}</strong> provides a {{ media.efficiency }}x weight to your demand boost calculation. 
           In the current era, a spend of <strong>${{ Math.round(1000 * worldStore.inflationMultiplier).toLocaleString() }}</strong> is considered a standard medium-sized campaign.
         </q-card-section>
       </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useMarketingStore } from '../stores/marketing'
import { useDesignStore } from '../stores/design'
import { useGameStore } from '../stores/game'
import { useWorldStore } from '../stores/world'
import { usePlayerStore } from '../stores/player'

const marketingStore = useMarketingStore()
const designStore = useDesignStore()
const gameStore = useGameStore()
const worldStore = useWorldStore()
const playerStore = usePlayerStore()

const selectedTerritoryId = ref('north-america')

const selectedTerritory = computed(() => {
  return worldStore.territories.find(t => t.id === selectedTerritoryId.value)
})

const availableMedia = computed(() => {
  return marketingStore.mediaTypes.filter(m => gameStore.year >= m.minYear)
})

const avgAwareness = computed(() => {
  const scores = Object.values(marketingStore.regionalAwareness)
  return scores.reduce((a, b) => a + b, 0) / scores.length
})

function getBudget(modelId, mediaId) {
  return marketingStore.activeRegionalCampaigns[selectedTerritoryId.value]?.[modelId]?.[mediaId] || 0
}

function setBudget(modelId, mediaId, val) {
  marketingStore.setBudget(selectedTerritoryId.value, modelId, mediaId, parseInt(val) || 0)
}

function getModelTerritoryTotal(modelId) {
  const modelBudgets = marketingStore.activeRegionalCampaigns[selectedTerritoryId.value]?.[modelId] || {}
  return Object.values(modelBudgets).reduce((a, b) => a + b, 0)
}

function getActiveMediaCount(modelId) {
  const modelBudgets = marketingStore.activeRegionalCampaigns[selectedTerritoryId.value]?.[modelId] || {}
  return Object.keys(modelBudgets).length
}

function formatTerritoryName(id) {
  return worldStore.territories.find(t => t.id === id)?.name || id
}

function formatExpoDate(expo) {
  const date = new Date(expo.year, expo.month)
  return date.toLocaleString('default', { month: 'long', year: 'numeric' })
}

function mediaIcon(id) {
  const icons = {
    billboard: 'branding_watermark',
    newspaper: 'newspaper',
    radio: 'radio',
    magazine: 'menu_book',
    television: 'tv'
  }
  return icons[id] || 'ads_click'
}
</script>

<style scoped>
.grayscale {
  filter: grayscale(100%);
}
.opacity-40 {
  opacity: 0.4;
}
.border-grey {
  border: 1px solid #ddd;
}
</style>

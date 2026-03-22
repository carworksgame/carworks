<template>
  <q-page padding class="bg-grey-1">
    <div class="text-h4 q-mb-md">Marketing Department</div>

    <div class="row q-gutter-md">
      <!-- Brand Status -->
      <q-card flat bordered class="col-12 col-md-4">
        <q-card-section class="bg-deep-orange-9 text-white">
          <div class="text-h6">Brand Awareness</div>
        </q-card-section>
        <q-card-section class="text-center q-pa-lg">
          <q-knob
            readonly
            v-model="marketingStore.brandAwareness"
            show-value
            size="120px"
            :thickness="0.22"
            color="deep-orange"
            track-color="grey-3"
            class="text-deep-orange q-ma-md"
          >
            {{ Math.floor(marketingStore.brandAwareness) }}%
          </q-knob>
          <div class="text-subtitle1 text-grey-8">Global Market Recognition</div>
          <p class="text-caption text-grey-6 q-mt-sm">
            Higher awareness naturally increases demand for all your models. 
            Keep marketing active to prevent brand decay.
          </p>
        </q-card-section>
        
        <q-separator />
        
        <q-card-section class="bg-grey-2">
           <div class="row justify-between items-center">
             <div class="text-subtitle2">Total Monthly Budget:</div>
             <div class="text-h6 text-deep-orange-9">${{ marketingStore.totalMonthlyMarketingCost.toLocaleString() }}</div>
           </div>
        </q-card-section>
      </q-card>

      <!-- Model Campaigns -->
      <q-card flat bordered class="col-12 col-md-7">
        <q-card-section class="bg-blue-grey-9 text-white">
          <div class="text-h6">Model Specific Campaigns</div>
        </q-card-section>
        
        <q-card-section>
          <div v-if="designStore.models.length === 0" class="text-center q-pa-xl text-grey">
            No vehicle models available to market.
          </div>
          <q-list v-else separator>
            <q-item v-for="model in designStore.models" :key="model.id" class="q-py-md">
              <q-item-section avatar>
                <q-icon name="directions_car" color="blue-grey-4" size="40px" />
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-h6">{{ model.name }}</q-item-label>
                <q-item-label caption>Launched in {{ model.introduced }}</q-item-label>
              </q-item-section>

              <q-item-section side style="width: 250px">
                <q-select
                  :model-value="marketingStore.activeCampaigns[model.id]?.id"
                  @update:model-value="(val) => marketingStore.setCampaign(model.id, val)"
                  :options="availableMedia"
                  option-label="name"
                  option-value="id"
                  map-options
                  emit-value
                  label="Select Media"
                  outlined
                  dense
                  clearable
                >
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section>
                        <q-item-label>{{ scope.opt.name }}</q-item-label>
                        <q-item-label caption>Cost: ${{ scope.opt.cost }}/mo | Boost: {{ scope.opt.boost }}x</q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </q-item-section>

              <q-item-section side v-if="marketingStore.activeCampaigns[model.id]">
                 <q-badge color="deep-orange" label="BOOST ACTIVE" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </div>

    <!-- Media Reference -->
    <div class="text-h5 q-mt-xl q-mb-md">Advertising Channels</div>
    <div class="row q-gutter-md">
       <q-card v-for="media in marketingStore.mediaTypes" :key="media.id" flat bordered class="col-12 col-sm-3" :class="gameStore.year < media.minYear ? 'opacity-40 grayscale' : ''">
         <q-card-section :class="gameStore.year >= media.minYear ? 'bg-blue-1' : 'bg-grey-3'">
           <div class="row items-center no-wrap">
             <div class="text-h6">{{ media.name }}</div>
             <q-space />
             <q-icon :name="mediaIcon(media.id)" size="sm" />
           </div>
           <div v-if="gameStore.year < media.minYear" class="text-caption text-red-9 text-weight-bold">
             Available in {{ media.minYear }}
           </div>
         </q-card-section>
         <q-card-section class="q-py-sm">
           <div class="row justify-between">
             <span>Monthly Cost:</span>
             <span class="text-weight-bold">${{ media.cost.toLocaleString() }}</span>
           </div>
           <div class="row justify-between">
             <span>Demand Boost:</span>
             <span class="text-weight-bold text-green-9">{{ media.boost }}x</span>
           </div>
         </q-card-section>
       </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useMarketingStore } from '../stores/marketing'
import { useDesignStore } from '../stores/design'
import { useGameStore } from '../stores/game'

const marketingStore = useMarketingStore()
const designStore = useDesignStore()
const gameStore = useGameStore()

const availableMedia = computed(() => {
  return marketingStore.mediaTypes.filter(m => gameStore.year >= m.minYear)
})

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
</style>

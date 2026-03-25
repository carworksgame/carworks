<template>
  <q-page class="flex flex-center bg-brown-1">
    <div class="q-pa-md" style="width: 800px; max-width: 95vw">
      <div class="row items-center q-mb-xl">
        <div class="text-h3 text-weight-bolder text-brown-9">Load Game</div>
        <q-space />
        <q-btn 
          color="brown-8" 
          icon="add" 
          label="New Game" 
          size="lg"
          @click="showNewGameDialog = true" 
        />
      </div>

      <div v-if="savesStore.loading" class="text-center q-pa-xl">
        <q-spinner-dots color="brown-8" size="40px" />
      </div>

      <div v-else-if="savesStore.slots.length === 0" class="text-center q-pa-xl bg-white rounded-borders shadow-1">
        <div class="text-h5 text-grey-6 q-mb-md">No saved games found</div>
        <p class="text-grey-7">Start a new game to begin your automotive empire.</p>
      </div>

      <div v-else class="row q-col-gutter-lg">
        <div v-for="save in sortedSaves" :key="save.id" class="col-12 col-sm-6">
          <q-card bordered flat class="save-card">
            <q-card-section class="bg-brown-2 row items-center no-wrap">
              <div class="text-h6 text-brown-10">{{ save.name }}</div>
              <q-space />
              <q-btn flat round color="red-8" icon="delete" @click="confirmDelete(save.id)" />
            </q-card-section>

            <q-card-section>
              <div class="row justify-between q-mb-xs">
                <span class="text-grey-7">Current Year:</span>
                <span class="text-weight-bold">{{ save.gameState?.year || 1908 }}</span>
              </div>
              <div class="row justify-between q-mb-xs">
                <span class="text-grey-7">Funds:</span>
                <span class="text-weight-bold text-green-9">${{ save.playerState?.funds?.toLocaleString() || 0 }}</span>
              </div>
              <div class="row justify-between text-caption text-grey-6">
                <span>Last Saved:</span>
                <span>{{ new Date(save.updatedAt).toLocaleString() }}</span>
              </div>
            </q-card-section>

            <q-separator />

            <q-card-actions>
              <q-btn 
                unelevated 
                color="brown-8" 
                label="Continue Empire" 
                class="full-width" 
                @click="loadSave(save.id)" 
                :loading="loadingId === save.id"
              />
            </q-card-actions>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Confirm Delete Dialog -->
    <q-dialog v-model="showDeleteConfirm">
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="red" text-color="white" />
          <span class="q-ml-sm">Are you sure you want to delete this save? This cannot be undone.</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Delete" color="red" @click="deleteSave" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- New Game Dialog -->
    <q-dialog v-model="showNewGameDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="bg-brown-8 text-white">
          <div class="text-h6">Start New Empire</div>
        </q-card-section>

        <q-card-section class="q-pa-md">
          <div class="text-subtitle2 q-mb-sm text-grey-7">Enter your automobile company name:</div>
          <q-input 
            v-model="newCompanyName" 
            outlined 
            dense 
            autofocus 
            @keyup.enter="startNewGame"
            placeholder="e.g. Ford Motor Co, Mercedes, Tesla"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn 
            flat 
            label="Found Company" 
            color="brown-8" 
            @click="startNewGame" 
            :loading="isStartingNew"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useSavesStore } from '../stores/saves'
import { useGameStore } from '../stores/game'
import { usePlayerStore } from '../stores/player'
import { useWorldStore } from '../stores/world'
import { useResearchStore } from '../stores/research'
import { useDesignStore } from '../stores/design'
import { useMarketingStore } from '../stores/marketing'
import { useCompetitorStore } from '../stores/competitors'
import { useBankStore } from '../stores/bank'
import { useReportsStore } from '../stores/reports'
import { useDebugStore } from '../stores/debug'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const savesStore = useSavesStore()
const gameStore = useGameStore()
const playerStore = usePlayerStore()
const worldStore = useWorldStore()
const researchStore = useResearchStore()
const designStore = useDesignStore()
const marketingStore = useMarketingStore()
const competitorStore = useCompetitorStore()
const bankStore = useBankStore()
const reportsStore = useReportsStore()
const debugStore = useDebugStore()
const router = useRouter()
const $q = useQuasar()

const loadingId = ref(null)
const showDeleteConfirm = ref(false)
const showNewGameDialog = ref(false)
const isStartingNew = ref(false)
const deleteId = ref(null)
const newCompanyName = ref('')

const sortedSaves = computed(() => {
  return [...savesStore.slots].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
})

onMounted(async () => {
  await savesStore.fetchSaves()
})

async function loadSave(id) {
  loadingId.value = id
  const result = await savesStore.loadGame(id)
  loadingId.value = null
  
  if (result.success) {
    gameStore.setSlot(id)
    router.push('/')
  } else {
    $q.notify({ color: 'negative', message: result.error })
  }
}

async function startNewGame() {
  if (!newCompanyName.value) {
    $q.notify({ color: 'negative', message: 'Your company needs a name!' })
    return
  }

  isStartingNew.value = true

  // Reset all game stores
  gameStore.$reset()
  playerStore.$reset()
  worldStore.$reset()
  researchStore.$reset()
  designStore.$reset()
  marketingStore.$reset()
  competitorStore.$reset()
  bankStore.$reset()
  
  // Specifically clear reports and debug math
  reportsStore.clearReports()
  debugStore.setSnapshot(null)

  // INITIALIZE RANDOM AI RIVALS
  competitorStore.initializeRivals()

  const slotId = 'slot-' + Date.now()
  gameStore.setSlot(slotId)
  playerStore.companyName = newCompanyName.value

  const result = await savesStore.saveGame(slotId, playerStore.companyName)
  isStartingNew.value = false
  
  if (result.success) {
    showNewGameDialog.value = false
    router.push('/')
  } else {
    $q.notify({ color: 'negative', message: 'Failed to create cloud save: ' + result.error })
  }
}

function confirmDelete(id) {
  deleteId.value = id
  showDeleteConfirm.value = true
}

async function deleteSave() {
  if (deleteId.value) {
    await savesStore.deleteSave(deleteId.value)
    $q.notify({ color: 'info', message: 'Save deleted.' })
  }
}
</script>

<style scoped>
.save-card {
  transition: transform 0.2s;
}
.save-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}
</style>

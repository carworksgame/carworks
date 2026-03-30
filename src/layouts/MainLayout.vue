<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-brown-8">
      <q-toolbar>
        <q-toolbar-title class="text-weight-bolder">
          CarWorks <span v-if="playerStore.companyName" class="text-weight-light text-subtitle1 q-ml-sm">- {{ playerStore.companyName }}</span>
        </q-toolbar-title>

        <div class="q-gutter-sm row items-center no-wrap">
          <div class="text-subtitle1 text-weight-bold q-px-md bg-brown-9 rounded-borders">
            {{ gameStore.dateString }}
          </div>
          <div class="text-subtitle1 text-weight-bold q-px-md bg-green-9 rounded-borders">
            ${{ playerStore.funds.toLocaleString() }}
          </div>
          <q-btn 
            unelevated 
            color="orange-9" 
            label="End Turn" 
            icon-right="play_arrow"
            @click="confirmEndTurn = true"
          />
          
          <q-btn flat round icon="person" color="white">
            <q-menu>
              <q-list style="min-width: 180px">
                <q-item clickable v-close-popup @click="showSettingsDialog = true">
                  <q-item-section avatar>
                    <q-icon name="settings" />
                  </q-item-section>
                  <q-item-section>Settings</q-item-section>
                </q-item>
                
                <q-separator />

                <q-item clickable v-close-popup @click="onLogout">
                  <q-item-section avatar>
                    <q-icon name="logout" />
                  </q-item-section>
                  <q-item-section>Logout</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Bottom Navigation Bar -->
    <q-footer elevated class="bg-brown-10 text-white">
      <q-tabs 
        v-model="currentTab" 
        indicator-color="transparent" 
        active-color="orange-9" 
        class="bottom-nav"
        align="justify"
        dense
      >
        <q-route-tab to="/" icon="factory" label="The Hub" class="nav-tab" />
        <q-route-tab to="/office" icon="business" label="Office" class="nav-tab" />
        <q-route-tab to="/research" icon="science" label="R&D Lab" class="nav-tab" />
        <q-route-tab to="/design" icon="drive_eta" label="Design" class="nav-tab" />
        <q-route-tab to="/manufacturing" icon="precision_manufacturing" label="Produce" class="nav-tab" />
        <q-route-tab to="/marketing" icon="campaign" label="Market" class="nav-tab" />
        <q-route-tab to="/saves" icon="cloud_upload" label="Saves" class="nav-tab" />
      </q-tabs>
    </q-footer>

    <!-- Global Settings Dialog -->
    <q-dialog v-model="showSettingsDialog">
      <q-card style="min-width: 350px">
        <q-card-section class="bg-brown-9 text-white row items-center">
          <div class="text-h6">Game Settings</div>
          <q-space />
          <q-icon name="volume_up" size="sm" />
        </q-card-section>

        <q-card-section class="q-pa-md">
          <div class="text-subtitle2 q-mb-md">Audio Preferences</div>
          
          <q-item tag="label" v-ripple>
            <q-item-section>
              <q-item-label>Sound Effects</q-item-label>
              <q-item-label caption>UI clicks and mechanical noises</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle v-model="settingsStore.sfxEnabled" color="brown-9" />
            </q-item-section>
          </q-item>

          <q-item tag="label" v-ripple>
            <q-item-section>
              <q-item-label>Background Music</q-item-label>
              <q-item-label caption>Department atmospheric soundtracks</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle v-model="settingsStore.musicEnabled" color="brown-9" />
            </q-item-section>
          </q-item>

          <div class="q-px-md q-mt-lg">
            <div class="text-caption text-grey-7">Master Volume</div>
            <q-slider
              v-model="settingsStore.masterVolume"
              :min="0"
              :max="1"
              :step="0.05"
              color="brown-9"
              label
              :label-value="Math.round(settingsStore.masterVolume * 100) + '%'"
            />
          </div>

          <q-separator class="q-my-md" />

          <q-item tag="label" v-ripple>
            <q-item-section>
              <q-item-label class="text-weight-bold text-red-9">Developer Mode</q-item-label>
              <q-item-label caption>Enables advanced simulation analytics and math breakdown.</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle v-model="debugStore.debugMode" color="red-9" />
            </q-item-section>
          </q-item>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Done" color="brown-9" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- News Flash Dialog -->
    <q-dialog v-model="showNewsDialog">
      <q-card style="min-width: 450px" class="bg-grey-1">
        <q-card-section class="bg-orange-10 text-white row items-center q-py-sm">
          <div class="text-h6 text-uppercase text-weight-bolder letter-spacing-1">News Flash</div>
          <q-space />
          <q-icon :name="newsIcon" size="sm" />
        </q-card-section>

        <q-card-section class="text-center q-pa-none bg-white">
          <q-img 
            :src="getNewsImage(gameStore.newsImage)" 
            style="max-height: 250px" 
            fit="contain"
            class="q-ma-md"
          >
            <template v-slot:error>
              <div class="absolute-full flex flex-center bg-grey-3 text-grey-7">
                <q-icon :name="newsIcon" size="100px" />
              </div>
            </template>
          </q-img>
        </q-card-section>

        <q-card-section class="q-pa-lg text-center bg-white border-top-grey">
          <div class="text-h4 text-weight-bolder q-mb-xs text-brown-10">{{ gameStore.lastNewsEvent?.title }}</div>
          <div class="text-subtitle2 text-grey-6 q-mb-md">{{ gameStore.dateString }}</div>
          <q-separator class="q-my-md" />
          <div class="text-body1 text-grey-9 q-px-md">{{ gameStore.lastNewsEvent?.description }}</div>
        </q-card-section>

        <q-card-section v-if="gameStore.lastNewsEvent?.type === 'crisis' || gameStore.lastNewsEvent?.type === 'recovery'" class="bg-orange-1 q-pa-md">
           <div class="row no-wrap items-center">
             <q-icon :name="gameStore.lastNewsEvent?.type === 'crisis' ? 'trending_down' : 'trending_up'" :color="gameStore.lastNewsEvent?.type === 'crisis' ? 'negative' : 'positive'" size="md" class="q-mr-md" />
             <div class="text-caption text-weight-medium">
               <span v-if="gameStore.lastNewsEvent?.type === 'crisis'" class="text-negative">
                 MARKET CRISIS: Global demand for automobiles has significantly dropped.
               </span>
               <span v-else class="text-positive">
                 MARKET RECOVERY: Consumer confidence is returning; demand is on the rise.
               </span>
             </div>
           </div>
        </q-card-section>

        <q-card-actions align="center" class="bg-white q-pb-md">
          <q-btn unelevated label="Understood" color="orange-10" class="q-px-xl" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- End Turn Confirmation -->
    <q-dialog v-model="confirmEndTurn" persistent>
      <q-card style="min-width: 300px">
        <q-card-section class="bg-orange-9 text-white row items-center">
          <div class="text-h6">End of Month</div>
          <q-space />
          <q-icon name="hourglass_empty" size="sm" />
        </q-card-section>

        <q-card-section class="q-pa-lg text-center">
          <div class="text-subtitle1">Proceed to <span class="text-weight-bold text-orange-9">{{ nextMonthString }}</span>?</div>
          <p class="text-caption text-grey-7 q-mt-sm">Your monthly expenses will be deducted and sales calculated.</p>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Wait" color="primary" v-close-popup />
          <q-btn flat label="End Month" color="orange-9" @click="handleEndTurn" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Game Over / Bankruptcy Dialog -->
    <q-dialog v-model="showBankruptDialog" persistent>
      <q-card class="bg-black text-white" style="min-width: 400px">
        <q-card-section class="text-center q-pa-xl">
          <q-icon name="trending_down" size="100px" color="red" />
          <div class="text-h3 text-weight-bolder q-mt-md">BANKRUPTCY</div>
          <div class="text-h6 q-mt-md text-red-5">Insolvency Detected</div>
          <p class="q-mt-lg text-grey-4">
            The board of directors has called for your resignation. 
            The company can no longer service its debts or pay its workers.
          </p>
        </q-card-section>

        <q-card-actions align="center" class="q-pb-xl">
          <q-btn color="red-9" label="Exit to Lobby" size="lg" @click="returnToLobby" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Victory Dialog -->
    <q-dialog v-model="showVictoryDialog" persistent maximized transition-show="slide-up" transition-hide="slide-down">
      <q-card class="bg-brown-1">
        <q-card-section class="text-center q-pa-xl">
          <q-icon name="emoji_events" size="150px" color="orange-9" />
          <div class="text-h2 text-weight-bolder text-brown-10 q-mt-md text-uppercase">A Century of Excellence</div>
          <div class="text-h4 text-brown-8">1908 - 2008</div>
          
          <div class="row justify-center q-mt-xl q-gutter-xl">
             <q-card flat bordered class="col-12 col-md-3 bg-white shadow-2">
               <q-card-section>
                 <div class="text-overline">Final Worth</div>
                 <div class="text-h4 text-green-9">${{ playerStore.funds.toLocaleString() }}</div>
               </q-card-section>
             </q-card>
             <q-card flat bordered class="col-12 col-md-3 bg-white shadow-2">
               <q-card-section>
                 <div class="text-overline">Models Launched</div>
                 <div class="text-h4 text-blue-9">{{ designStore.models.length }}</div>
               </q-card-section>
             </q-card>
          </div>

          <p class="q-mt-xl text-h6 text-grey-8" style="max-width: 800px; margin-left: auto; margin-right: auto">
            You have successfully navigated a hundred years of history, two world wars, and the birth of the modern automobile. 
            {{ playerStore.companyName }} is a name that will live forever in the history of the world.
          </p>
        </q-card-section>

        <q-card-actions align="center" class="q-pb-xl">
          <q-btn color="brown-9" label="Retire to Lobby" size="lg" @click="returnToLobby" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Transition Overlay -->
    <div v-if="isProcessingTurn" class="fixed-full bg-black flex flex-center transition-overlay" style="z-index: 9999">
      <div class="text-center text-white">
        <q-spinner-gears color="orange-9" size="100px" />
        <div class="text-h4 q-mt-md text-weight-light">Calculating Monthly Results...</div>
      </div>
    </div>
  </q-layout>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useGameStore } from '../stores/game'
import { usePlayerStore } from '../stores/player'
import { useWorldStore } from '../stores/world'
import { useResearchStore } from '../stores/research'
import { useDesignStore } from '../stores/design'
import { useMarketingStore } from '../stores/marketing'
import { useCompetitorStore } from '../stores/competitors'
import { useAuthStore } from '../stores/auth'
import { useSavesStore } from '../stores/saves'
import { useBankStore } from '../stores/bank'
import { useSettingsStore } from '../stores/settings'
import { useDebugStore } from '../stores/debug'
import { useReportsStore } from '../stores/reports'
import { processEndTurn } from '../logic/simulation'
import { useRouter, useRoute } from 'vue-router'

const gameStore = useGameStore()
const playerStore = usePlayerStore()
const worldStore = useWorldStore()
const researchStore = useResearchStore()
const designStore = useDesignStore()
const marketingStore = useMarketingStore()
const competitorStore = useCompetitorStore()
const authStore = useAuthStore()
const savesStore = useSavesStore()
const bankStore = useBankStore()
const settingsStore = useSettingsStore()
const debugStore = useDebugStore()
const reportsStore = useReportsStore()
const router = useRouter()
const route = useRoute()

const currentTab = ref('factory')
const showNewsDialog = ref(false)
const confirmEndTurn = ref(false)
const isProcessingTurn = ref(false)
const showBankruptDialog = ref(false)
const showVictoryDialog = ref(false)
const showSettingsDialog = ref(false)

const nextMonthString = computed(() => {
  let nextMonth = gameStore.month + 1
  let nextYear = gameStore.year
  if (nextMonth > 11) {
    nextMonth = 0
    nextYear++
  }
  const date = new Date(nextYear, nextMonth)
  return date.toLocaleString('default', { month: 'long', year: 'numeric' })
})

const newsIcon = computed(() => {
  if (gameStore.year < 1920) return 'newspaper'
  if (gameStore.year < 1950) return 'radio'
  return 'tv'
})

function getNewsImage(name) {
  if (!name) return ''
  return new URL(`../assets/images/${name}`, import.meta.url).href
}

watch(() => gameStore.lastNewsEvent, (newVal) => {
  if (newVal) {
    showNewsDialog.value = true
  }
})

async function handleEndTurn () {
  isProcessingTurn.value = true
  await new Promise(resolve => setTimeout(resolve, 1500))
  const { newsEvent, gameStatus } = processEndTurn(savesStore)
  await new Promise(resolve => setTimeout(resolve, 500))
  isProcessingTurn.value = false
  
  if (gameStatus === 'bankrupt') {
    showBankruptDialog.value = true
  } else if (gameStatus === 'victory') {
    showVictoryDialog.value = true
  } else if (newsEvent) {
    showNewsDialog.value = true
  }
}

function returnToLobby() {
  showBankruptDialog.value = false
  showVictoryDialog.value = false
  gameStore.setSlot(null)
  router.push('/saves')
}

async function onLogout() {
  await authStore.logout()
  
  // Reset all game stores to clear persisted data
  gameStore.$reset()
  playerStore.$reset()
  worldStore.$reset()
  researchStore.$reset()
  designStore.$reset()
  marketingStore.$reset()
  competitorStore.$reset()
  bankStore.$reset()
  reportsStore.clearReports()
  debugStore.setSnapshot(null)
  
  router.push('/login')
}

onMounted(async () => {
  if (gameStore.currentSlotId && !gameStore.turnCount) {
    const result = await savesStore.loadGame(gameStore.currentSlotId)
    if (!result.success) {
      console.warn('Failed to auto-load slot, redirecting to saves lobby.')
      gameStore.setSlot(null)
      router.push('/saves')
    }
  } else if (!gameStore.currentSlotId && route.path !== '/saves' && route.path !== '/login') {
    router.push('/saves')
  }
})
</script>

<style scoped>
.transition-overlay {
  transition: all 0.5s ease;
}
.bottom-nav {
  height: 70px;
}
.nav-tab {
  min-width: 100px;
}
:deep(.q-tab__icon) {
  font-size: 32px;
}
:deep(.q-tab__label) {
  font-size: 11px;
  font-weight: bold;
}
</style>

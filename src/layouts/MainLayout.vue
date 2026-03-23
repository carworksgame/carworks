<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-brown-8">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

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

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      class="bg-grey-2"
    >
      <q-list>
        <q-item-label header>Management</q-item-label>
        
        <q-item clickable v-ripple to="/saves">
          <q-item-section avatar>
            <q-icon name="cloud_upload" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Cloud Saves</q-item-label>
          </q-item-section>
        </q-item>

        <q-item-label header>Departments</q-item-label>
        
        <q-item clickable v-ripple to="/" exact>
          <q-item-section avatar>
            <q-icon name="home" />
          </q-item-section>
          <q-item-section>
            <q-item-label>The Factory</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/office">
          <q-item-section avatar>
            <q-icon name="business" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Manager's Office</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/research">
          <q-item-section avatar>
            <q-icon name="science" />
          </q-item-section>
          <q-item-section>
            <q-item-label>R&D Lab</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/design">
          <q-item-section avatar>
            <q-icon name="drive_eta" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Design Workshop</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/manufacturing">
          <q-item-section avatar>
            <q-icon name="factory" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Manufacturing & Sales</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/marketing">
          <q-item-section avatar>
            <q-icon name="campaign" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Marketing Dept</q-item-label>
          </q-item-section>
        </q-item>

      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

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
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Done" color="brown-9" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- News Flash Dialog -->
    <q-dialog v-model="showNewsDialog">
      <q-card style="min-width: 350px">
        <q-card-section class="bg-orange-10 text-white row items-center">
          <div class="text-h6">NEWS FLASH!</div>
          <q-space />
          <q-icon name="newspaper" size="md" />
        </q-card-section>

        <q-card-section class="q-pa-xl text-center">
          <div class="text-h4 text-weight-bold q-mb-md">{{ gameStore.lastNewsEvent?.title }}</div>
          <div class="text-subtitle1 text-grey-8">{{ gameStore.dateString }}</div>
        </q-card-section>

        <q-card-section class="bg-grey-2">
           <p v-if="gameStore.lastNewsEvent?.type === 'crisis'" class="text-negative text-weight-bold">
             Market analysis: This event is expected to significantly reduce global car demand.
           </p>
           <p v-else class="text-positive text-weight-bold">
             Market analysis: This event marks a period of recovery and economic growth.
           </p>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" v-close-popup />
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
import { ref, onMounted, computed } from 'vue'
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
const router = useRouter()
const route = useRoute()

const leftDrawerOpen = ref(false)
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

function toggleLeftDrawer () {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

async function handleEndTurn () {
  isProcessingTurn.value = true
  await new Promise(resolve => setTimeout(resolve, 1500))
  const { newsEvent, gameStatus } = processEndTurn()
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
  gameStore.setSlot(null)
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
</style>

<template>
  <q-page padding class="bg-grey-2">
    <div class="row items-center q-mb-md">
      <div class="text-h4">Manager's Office</div>
      <q-space />
      <div class="text-subtitle1">
        Date: <span class="text-weight-bold">{{ gameStore.dateString }}</span>
      </div>
    </div>
    
    <!-- Navigation Tabs -->
    <q-tabs v-model="tab" dense class="text-grey" active-color="brown-10" indicator-color="brown-10" align="left" narrow-indicator>
      <q-tab name="ledger" label="Financial Ledger" icon="account_balance_wallet" />
      <q-tab name="personnel" label="Personnel" icon="groups" />
      <q-tab name="logistics" label="Logistics" icon="local_shipping" />
      <q-tab name="expansion" label="Global Expansion" icon="public" />
      <q-tab name="bank" label="Commercial Bank" icon="account_balance" />
      <q-tab name="competitors" label="Competition" icon="trending_up" />
    </q-tabs>

    <q-separator class="q-mb-md" />

    <q-tab-panels v-model="tab" animated class="bg-transparent">
      <!-- LEDGER PANEL -->
      <q-tab-panel name="ledger" class="q-pa-none">
        <div class="row q-gutter-md">
          <q-card flat bordered class="col-12 col-md-7">
            <q-card-section class="bg-brown-10 text-white row items-center">
              <div class="text-h6">Monthly Ledger</div>
              <q-space />
              <div v-if="playerStore.lastMonthPerformance" class="text-subtitle2">
                Turn {{ playerStore.lastMonthPerformance.turn }}: {{ playerStore.lastMonthPerformance.date }}
              </div>
            </q-card-section>

            <q-card-section>
              <div v-if="!playerStore.lastMonthPerformance" class="text-center q-pa-xl text-grey">
                Run a turn to see financial reports.
              </div>
              <div v-else>
                <q-list dense separator>
                  <q-item>
                    <q-item-section>Gross Income (Sales)</q-item-section>
                    <q-item-section side class="text-green-9 text-weight-bold">
                      +${{ playerStore.lastMonthPerformance.income.toLocaleString() }}
                    </q-item-section>
                  </q-item>

                  <q-item-label header class="q-pt-md">Monthly Expenses</q-item-label>
                  
                  <q-item v-for="(val, exp) in playerStore.lastMonthPerformance.expenses" :key="exp">
                    <q-item-section class="text-capitalize">{{ exp }}</q-item-section>
                    <q-item-section side class="text-red-9">
                      -${{ val.toLocaleString() }}
                    </q-item-section>
                  </q-item>

                  <q-separator class="q-my-sm" />

                  <q-item class="bg-grey-3 rounded-borders">
                    <q-item-section class="text-h6">Net Profit/Loss</q-item-section>
                    <q-item-section side :class="['text-h6', playerStore.lastMonthPerformance.net >= 0 ? 'text-green-9' : 'text-red-9']">
                      ${{ playerStore.lastMonthPerformance.net.toLocaleString() }}
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
            </q-card-section>
          </q-card>

          <q-card flat bordered class="col col-md-4">
            <q-card-section class="bg-grey-8 text-white">
              <div class="text-h6">World Context</div>
            </q-card-section>
            <q-card-section>
              <div class="text-subtitle1">Economic Climate: <span class="text-weight-bold">{{ worldStore.economicClimate.toFixed(2) }}x</span></div>
              <div v-if="worldStore.activeEvents.length > 0">
                <div class="text-caption q-mt-sm">Active Effects:</div>
                <div class="row q-gutter-xs">
                  <q-chip v-for="event in worldStore.activeEvents" :key="event.title" dense color="orange" text-color="white" icon="event">
                    {{ event.title }}
                  </q-chip>
                </div>
              </div>
              <div v-else class="text-caption text-grey q-mt-sm italic">
                The world is currently stable.
              </div>
            </q-card-section>
          </q-card>
        </div>
      </q-tab-panel>

      <!-- PERSONNEL PANEL -->
      <q-tab-panel name="personnel" class="q-pa-none">
        <div class="row q-gutter-md">
          <!-- Global Benefits Card -->
          <q-card flat bordered class="col-12">
            <q-card-section class="bg-blue-grey-9 text-white row items-center">
              <div class="text-h6">Company Benefits & Culture</div>
              <q-space />
              <q-icon name="volunteer_activism" size="sm" />
            </q-card-section>
            <q-card-section class="row q-col-gutter-md items-center">
              <div class="col-12 col-md-6">
                <div class="row justify-between">
                  <span class="text-subtitle2">Global Benefits Level: {{ playerStore.benefitsLevel }}%</span>
                  <span class="text-caption text-grey-7">+{{ ((playerStore.benefitsLevel / 100) * 0.2 * 100).toFixed(0) }}% Satisfaction Bonus</span>
                </div>
                <q-slider v-model="playerStore.benefitsLevel" :min="0" :max="100" :step="5" label color="blue-grey-6" />
              </div>
              <div class="col-12 col-md-6">
                <div class="bg-blue-grey-1 q-pa-md rounded-borders text-caption">
                  High benefits increase global satisfaction and productivity but add a percentage-based overhead to the entire company payroll.
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- R&D Department -->
          <q-card flat bordered class="col-12 col-md-4">
            <q-card-section class="bg-blue-10 text-white">
              <div class="text-h6">R&D Department</div>
              <div class="text-caption">Global Laboratory</div>
            </q-card-section>

            <q-card-section>
              <div class="q-mb-md">
                <div class="row justify-between items-center q-mb-sm">
                  <span class="text-subtitle2">Technicians: <span class="text-h6 text-blue-9">{{ playerStore.technicians }}</span></span>
                  <div class="row q-gutter-xs">
                    <q-btn round dense color="red" icon="remove" @click="playerStore.fireTechnicians(1)" :disabled="playerStore.technicians <= 0" />
                    <q-btn round dense color="green" icon="add" @click="playerStore.hireTechnicians(1)" />
                  </div>
                </div>
              </div>

              <q-separator class="q-my-sm" />

              <div class="q-mb-md">
                <div class="row justify-between text-caption">
                  <span>Monthly Salary</span>
                  <span class="text-weight-bold">${{ playerStore.salaryPerTechnician.toLocaleString() }}</span>
                </div>
                <q-slider v-model="playerStore.salaryPerTechnician" :min="1000" :max="10000" :step="100" label color="blue-7" />
                <div class="row justify-between text-caption text-grey-7 q-mt-xs">
                  <span>Market Avg: ${{ getMarketWage('north-america') }}</span>
                  <span :class="getSatisfactionColor(playerStore.getTechnicianSatisfaction)">
                    Satisfaction: {{ (playerStore.getTechnicianSatisfaction * 100).toFixed(0) }}%
                  </span>
                </div>
              </div>

              <div class="q-mb-xs text-caption">Research Productivity</div>
              <q-linear-progress :value="playerStore.getTechnicianProductivity / 1.5" :color="getSatisfactionColor(playerStore.getTechnicianSatisfaction)" size="10px" rounded />
            </q-card-section>
          </q-card>

          <!-- Factory Cards -->
          <q-card v-for="factory in playerStore.factories" :key="factory.id" flat bordered class="col-12 col-md-4">
            <q-card-section class="bg-blue-grey-8 text-white">
              <div class="text-h6">{{ factory.location }} Factory</div>
              <div class="text-caption">{{ formatTerritoryName(factory.territory) }}</div>
            </q-card-section>

            <q-card-section>
              <div class="q-mb-md">
                <div class="row justify-between text-caption">
                  <span>Employees</span>
                  <span>{{ factory.employees }} / {{ factory.maxEmployees }}</span>
                </div>
                <q-slider v-model="factory.employees" :min="0" :max="factory.maxEmployees" :step="10" label color="blue-grey-6" />
              </div>

              <div class="q-mb-md">
                <div class="row justify-between text-caption">
                  <span>Monthly Salary</span>
                  <span class="text-weight-bold">${{ factory.salary.toLocaleString() }}</span>
                </div>
                <q-slider v-model="factory.salary" :min="500" :max="5000" :step="50" label color="orange-8" />
                <div class="row justify-between text-caption text-grey-7 q-mt-xs">
                  <span>Market Avg: ${{ getMarketWage(factory.territory) }}</span>
                  <span :class="getSatisfactionColor(playerStore.getFactorySatisfaction(factory.id))">
                    Satisfaction: {{ (playerStore.getFactorySatisfaction(factory.id) * 100).toFixed(0) }}%
                  </span>
                </div>
              </div>

              <div class="q-mb-xs text-caption">Production Productivity</div>
              <q-linear-progress :value="playerStore.getFactoryProductivity(factory.id) / 1.5" :color="getSatisfactionColor(playerStore.getFactorySatisfaction(factory.id))" size="10px" rounded />
              
              <div class="text-caption text-grey q-mt-sm">
                Output: {{ (factory.employees * playerStore.getFactoryProductivity(factory.id)).toFixed(0) }} units / month
              </div>
            </q-card-section>
          </q-card>
        </div>
      </q-tab-panel>

      <!-- LOGISTICS PANEL -->
      <q-tab-panel name="logistics" class="q-pa-none">
        <div class="row q-gutter-md">
          <q-card v-for="territory in worldStore.territories.filter(t => t.active)" :key="territory.id" flat bordered class="col-12 col-md-5">
            <q-card-section class="bg-indigo-8 text-white row items-center">
              <div class="text-h6">{{ territory.name }} Supply</div>
              <q-space />
              <q-icon name="local_shipping" size="sm" />
            </q-card-section>

            <q-card-section>
              <div class="text-subtitle2 q-mb-sm">Source Factory:</div>
              <q-select
                v-model="playerStore.supplyLines[territory.id]"
                :options="factoryOptions"
                option-label="label"
                option-value="value"
                emit-value
                map-options
                outlined dense
                label="Select Supplier"
              />
              
              <div class="q-mt-md bg-grey-2 q-pa-sm rounded-borders">
                <div class="row justify-between">
                  <span>Unit Shipping Cost:</span>
                  <span class="text-weight-bold text-indigo-9">
                    ${{ worldStore.getShippingCost(getSelectedFactoryTerritory(territory.id), territory.id) }}
                  </span>
                </div>
                <div class="text-caption text-grey italic q-mt-xs">
                  Distance from {{ formatTerritoryName(getSelectedFactoryTerritory(territory.id)) }} to {{ territory.name }}
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </q-tab-panel>

      <!-- EXPANSION PANEL -->
      <q-tab-panel name="expansion" class="q-pa-none">
        <div class="row q-gutter-md">
          <q-card v-for="territory in worldStore.territories" :key="territory.id" flat bordered class="col-12 col-sm-6 col-md-3">
            <q-card-section :class="[territory.active ? 'bg-green-7' : 'bg-grey-7', 'text-white']">
              <div class="text-h6">{{ territory.name }}</div>
              <q-badge v-if="territory.active" color="white" text-color="green" label="ESTABLISHED" />
              <q-badge v-else color="white" text-color="grey-8" label="LOCKED" />
            </q-card-section>

            <q-card-section>
              <div class="row justify-between q-mb-sm">
                <span>Population:</span>
                <span class="text-weight-bold">{{ (territory.population / 1000000).toFixed(1) }}M</span>
              </div>
              <div class="row justify-between q-mb-sm">
                <span>Market Wealth:</span>
                <span class="text-weight-bold">{{ territory.wealth.toFixed(1) }}x</span>
              </div>
              
              <div v-if="territory.active" class="q-mt-md">
                <div class="text-subtitle2 q-mb-sm">Local Infrastructure</div>
                <div class="text-caption">
                   Factories: {{ playerStore.factories.filter(f => f.territory === territory.id).length }}<br>
                   Showrooms: {{ playerStore.showrooms.filter(s => s.territory === territory.id).length }}
                </div>
                <q-btn 
                  outline 
                  dense 
                  color="blue-grey" 
                  icon="add_business" 
                  label="Build Factory" 
                  class="full-width q-mt-sm"
                  @click="openFactoryDialog(territory)"
                />
              </div>
              <div v-else class="q-mt-md">
                <div class="text-subtitle2 text-grey-7 q-mb-sm">Expansion Cost: ${{ territory.unlockCost.toLocaleString() }}</div>
                <q-btn 
                  color="green-8" 
                  label="Expand to Region" 
                  class="full-width"
                  :disabled="playerStore.funds < territory.unlockCost"
                  @click="expandToRegion(territory)"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </q-tab-panel>

      <!-- BANK PANEL -->
      <q-tab-panel name="bank" class="q-pa-none">
        <div class="row q-gutter-md">
          <!-- Loan Section -->
          <q-card flat bordered class="col-12 col-md-5">
            <q-card-section class="bg-red-10 text-white">
              <div class="text-h6">Commercial Loans</div>
              <div class="text-caption">Current Rate: {{ (bankStore.interestRateLoan * 100).toFixed(1) }}% APR</div>
            </q-card-section>
            
            <q-card-section class="q-pa-lg">
              <div class="row justify-between items-center q-mb-lg">
                <div class="text-subtitle1 text-grey-7">Total Debt:</div>
                <div class="text-h4 text-red-9 text-weight-bolder">${{ bankStore.loanBalance.toLocaleString() }}</div>
              </div>

              <div v-if="bankStore.loanBalance > 0" class="bg-red-1 q-pa-md rounded-borders q-mb-lg">
                <div class="row justify-between">
                  <span>Next Monthly Payment:</span>
                  <span class="text-weight-bold">${{ bankStore.monthlyLoanPayment.toLocaleString() }}</span>
                </div>
                <div class="row justify-between q-mt-xs">
                  <span>Status:</span>
                  <q-badge :color="bankStore.missedPayments > 0 ? 'red' : 'green'">
                    {{ bankStore.missedPayments > 0 ? `${bankStore.missedPayments} Payments Missed` : 'Good Standing' }}
                  </q-badge>
                </div>
              </div>

              <div class="row q-gutter-sm">
                <q-btn color="red-9" label="Take $10k Loan" class="col" @click="bankStore.takeLoan(10000)" />
                <q-btn color="green-9" label="Repay $10k" class="col" :disabled="bankStore.loanBalance < 10000" @click="bankStore.repayLoan(10000)" />
              </div>
            </q-card-section>
          </q-card>

          <!-- Savings Section -->
          <q-card flat bordered class="col-12 col-md-5">
            <q-card-section class="bg-green-10 text-white">
              <div class="text-h6">Company Savings</div>
              <div class="text-caption">Current Rate: {{ (bankStore.interestRateSavings * 100).toFixed(1) }}% APR</div>
            </q-card-section>

            <q-card-section class="q-pa-lg">
              <div class="row justify-between items-center q-mb-lg">
                <div class="text-subtitle1 text-grey-7">Account Balance:</div>
                <div class="text-h4 text-green-9 text-weight-bolder">${{ bankStore.savingsBalance.toLocaleString() }}</div>
              </div>

              <div class="bg-green-1 q-pa-md rounded-borders q-mb-lg">
                <div class="row justify-between">
                  <span>Est. Monthly Interest:</span>
                  <span class="text-weight-bold">+${{ bankStore.monthlySavingsInterest.toLocaleString() }}</span>
                </div>
              </div>

              <div class="row q-gutter-sm">
                <q-btn color="green-9" label="Deposit $5k" class="col" :disabled="playerStore.funds < 5000" @click="bankStore.deposit(5000)" />
                <q-btn color="blue-9" label="Withdraw $5k" class="col" :disabled="bankStore.savingsBalance < 5000" @click="bankStore.withdraw(5000)" />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </q-tab-panel>

      <!-- COMPETITION PANEL -->
      <q-tab-panel name="competitors" class="q-pa-none">
        <div class="row q-gutter-md">
          <q-card v-for="comp in competitorStore.competitors" :key="comp.id" flat bordered class="col-12 col-sm-3">
            <q-card-section class="bg-blue-grey-2">
              <div class="text-h6">{{ comp.name }}</div>
              <div class="text-caption">Market Share: {{ comp.marketShare }}%</div>
            </q-card-section>
            <q-card-section>
              <q-linear-progress :value="comp.marketShare / 100" color="blue-grey-8" size="10px" />
              <div class="q-mt-sm">
                <div class="text-caption text-weight-bold">Latest Model:</div>
                <div class="text-subtitle2">{{ comp.models[0]?.name }}</div>
              </div>
            </q-card-section>
          </q-card>

          <q-card flat bordered class="col-12 col-sm-2 bg-blue-1">
            <q-card-section class="text-center">
              <div class="text-overline">Your Share</div>
              <div class="text-h3 text-weight-bolder text-blue-9">{{ playerShare }}%</div>
            </q-card-section>
          </q-card>
        </div>
      </q-tab-panel>
    </q-tab-panels>

    <q-card flat bordered class="q-mt-xl bg-red-1">
      <q-card-section class="row items-center">
        <div>
          <div class="text-h6 text-red-9">Liquidation Zone</div>
          <div class="text-caption text-grey-8">Close company doors and permanently delete this save slot.</div>
        </div>
        <q-space />
        <q-btn outline color="negative" icon="delete_forever" label="Liquidate Empire" @click="confirmReset = true" />
      </q-card-section>
    </q-card>

    <!-- Dialogs -->
    <q-dialog v-model="confirmReset">
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="red" text-color="white" />
          <span class="q-ml-sm">Are you sure you want to LIQUIDATE? This will permanently delete your cloud save.</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Confirm Liquidation" color="red" @click="resetGame" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showFactoryDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">New Factory in {{ selectedTerritory?.name }}</div>
          <div class="text-subtitle2 text-grey-7">Cost: $25,000</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input dense v-model="factoryLocationName" label="Location Name (e.g. London, Tokyo)" autofocus @keyup.enter="buildFactory" />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn flat label="Build" @click="buildFactory" :disabled="!factoryLocationName" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePlayerStore } from '../stores/player'
import { useWorldStore } from '../stores/world'
import { useGameStore } from '../stores/game'
import { useCompetitorStore } from '../stores/competitors'
import { useBankStore } from '../stores/bank'
import { useSavesStore } from '../stores/saves'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const playerStore = usePlayerStore()
const worldStore = useWorldStore()
const gameStore = useGameStore()
const competitorStore = useCompetitorStore()
const bankStore = useBankStore()
const savesStore = useSavesStore()
const router = useRouter()
const $q = useQuasar()

const tab = ref('ledger')
const confirmReset = ref(false)
const showFactoryDialog = ref(false)
const selectedTerritory = ref(null)
const factoryLocationName = ref('')

const playerShare = computed(() => {
  const rivalShares = competitorStore.competitors.reduce((acc, c) => acc + c.marketShare, 0)
  return Math.max(0, 100 - rivalShares)
})

const factoryOptions = computed(() => {
  return playerStore.factories.map(f => ({
    label: `${f.location} (${formatTerritoryName(f.territory)})`,
    value: f.id,
    territory: f.territory
  }))
})

function getMarketWage(territoryId) {
  const t = worldStore.territories.find(t => t.id === territoryId)
  return t?.baseWage?.toLocaleString() || '0'
}

function getSatisfactionColor(val) {
  if (val < 0.7) return 'negative'
  if (val < 0.9) return 'orange'
  if (val < 1.1) return 'blue-grey-8'
  return 'positive'
}

function getSelectedFactoryTerritory(territoryId) {
  const factoryId = playerStore.supplyLines[territoryId]
  const factory = playerStore.factories.find(f => f.id === factoryId)
  return factory ? factory.territory : null
}

function formatTerritoryName(id) {
  return worldStore.territories.find(t => t.id === id)?.name || id
}

function expandToRegion(territory) {
  if (playerStore.expandToTerritory(territory)) {
    $q.notify({ color: 'positive', message: `Expanded to ${territory.name}!` })
  } else {
    $q.notify({ color: 'negative', message: 'Insufficient funds for expansion.' })
  }
}

function openFactoryDialog(territory) {
  selectedTerritory.value = territory
  factoryLocationName.value = ''
  showFactoryDialog.value = true
}

function buildFactory() {
  if (playerStore.buildFactory(selectedTerritory.value.id, factoryLocationName.value)) {
    $q.notify({ color: 'positive', message: `Factory built in ${factoryLocationName.value}!` })
    showFactoryDialog.value = false
  } else {
    $q.notify({ color: 'negative', message: 'Insufficient funds for factory construction.' })
  }
}

async function resetGame() {
  if (gameStore.currentSlotId) {
    await savesStore.deleteSave(gameStore.currentSlotId)
    gameStore.setSlot(null)
    router.push('/saves')
  }
}
</script>

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
      <q-tab name="reports" label="Reports" icon="bar_chart" />
      <q-tab name="personnel" label="Personnel" icon="groups" />
      <q-tab name="risk" label="Risk Management" icon="gavel" />
      <q-tab name="corporate" label="Corporate Actions" icon="handshake" />
      <q-tab name="research" label="Market Research" icon="analytics" />
      <q-tab name="expansion" label="Global Expansion" icon="public" />
      <q-tab v-if="debugStore.debugMode" name="debug" label="Sim Analytics" icon="bug_report" class="text-red-9" />
      <q-tab name="bank" label="Commercial Bank" icon="account_balance" />
      <q-tab name="competitors" label="Competition" icon="trending_up" />
    </q-tabs>

    <q-separator class="q-mb-md" />

    <q-tab-panels v-model="tab" animated class="bg-transparent">

      <!-- REPORTS PANEL -->
      <q-tab-panel name="reports" class="q-pa-none">
        <div class="row q-gutter-md">
          <q-card flat bordered class="col-12 col-md-3">
            <q-card-section class="bg-brown-10 text-white">
              <div class="text-h6">Report Selection</div>
            </q-card-section>
            <q-list separator>
              <q-item clickable v-ripple :active="selectedReport === 'ledger'" @click="selectedReport = 'ledger'" active-class="bg-brown-1 text-brown-10 text-weight-bold">
                <q-item-section>Monthly Ledger</q-item-section>
              </q-item>
              <q-item clickable v-ripple :active="selectedReport === 'incomeByModel'" @click="selectedReport = 'incomeByModel'" active-class="bg-brown-1 text-brown-10 text-weight-bold">
                <q-item-section>Income by Model</q-item-section>
              </q-item>
              <q-item clickable v-ripple :active="selectedReport === 'incomeByRegion'" @click="selectedReport = 'incomeByRegion'" active-class="bg-brown-1 text-brown-10 text-weight-bold">
                <q-item-section>Income by Region</q-item-section>
              </q-item>
              <q-item clickable v-ripple :active="selectedReport === 'modelReport'" @click="selectedReport = 'modelReport'" active-class="bg-brown-1 text-brown-10 text-weight-bold">
                <q-item-section>Model Report</q-item-section>
              </q-item>
              <q-item clickable v-ripple :active="selectedReport === 'modelComparison'" @click="selectedReport = 'modelComparison'" active-class="bg-brown-1 text-brown-10 text-weight-bold">
                <q-item-section>Model Comparison</q-item-section>
              </q-item>
              <q-item clickable v-ripple :active="selectedReport === 'profitChart'" @click="selectedReport = 'profitChart'" active-class="bg-brown-1 text-brown-10 text-weight-bold">
                <q-item-section>Profit Chart</q-item-section>
              </q-item>
              <q-item clickable v-ripple :active="selectedReport === 'productionChart'" @click="selectedReport = 'productionChart'" active-class="bg-brown-1 text-brown-10 text-weight-bold">
                <q-item-section>Production Chart</q-item-section>
              </q-item>
              <q-item clickable v-ripple :active="selectedReport === 'salesChart'" @click="selectedReport = 'salesChart'" active-class="bg-brown-1 text-brown-10 text-weight-bold">
                <q-item-section>Sales Chart</q-item-section>
              </q-item>
            </q-list>
          </q-card>

          <q-card flat bordered class="col">
            <q-card-section class="bg-grey-9 text-white row items-center">
              <div class="text-h6">{{ currentReportTitle }}</div>
              <q-space />
              <div class="text-caption">Turn {{ reportsStore.lastTurn.turn || 0 }}</div>
            </q-card-section>
            <q-card-section>
              <div v-if="selectedReport === 'ledger'">
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
              </div>

              <div v-if="selectedReport === 'incomeByModel'">
                <q-list separator v-if="Object.keys(reportsStore.lastTurn.incomeByModel).length > 0">
                  <q-item v-for="(amount, model) in reportsStore.lastTurn.incomeByModel" :key="model">
                    <q-item-section>{{ model }}</q-item-section>
                    <q-item-section side class="text-green-9 text-weight-bold">${{ amount.toLocaleString() }}</q-item-section>
                  </q-item>
                </q-list>
                <div v-else class="text-center q-pa-xl text-grey">No sales data available.</div>
              </div>

              <div v-if="selectedReport === 'incomeByRegion'">
                <q-list separator v-if="Object.keys(reportsStore.lastTurn.incomeByRegion).length > 0">
                  <q-item v-for="(amount, region) in reportsStore.lastTurn.incomeByRegion" :key="region">
                    <q-item-section>{{ region }}</q-item-section>
                    <q-item-section side class="text-green-9 text-weight-bold">${{ amount.toLocaleString() }}</q-item-section>
                  </q-item>
                </q-list>
                <div v-else class="text-center q-pa-xl text-grey">No sales data available.</div>
              </div>

              <div v-if="selectedReport === 'modelReport'">
                <div v-if="Object.keys(reportsStore.lastTurn.modelReport).length > 0">
                  <div v-for="(regions, model) in reportsStore.lastTurn.modelReport" :key="model" class="q-mb-md">
                    <div class="text-subtitle1 text-weight-bold q-mb-sm">{{ model }}</div>
                    <q-markup-table flat bordered dense>
                      <thead>
                        <tr>
                          <th class="text-left">Region</th>
                          <th class="text-right">Built</th>
                          <th class="text-right">Sold</th>
                          <th class="text-right">Stock (Remaining)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(data, region) in regions" :key="region">
                          <td class="text-left">{{ region }}</td>
                          <td class="text-right text-blue-9">{{ data.built }}</td>
                          <td class="text-right text-green-9">{{ data.sold }}</td>
                          <td class="text-right text-orange-9">{{ data.stock }}</td>
                        </tr>
                      </tbody>
                    </q-markup-table>
                  </div>
                </div>
                <div v-else class="text-center q-pa-xl text-grey">No production or sales data available.</div>
              </div>

              <div v-if="selectedReport === 'modelComparison'">
                <div v-if="Object.keys(reportsStore.lastTurn.modelComparison).length > 0">
                  <div v-for="(segments, region) in reportsStore.lastTurn.modelComparison" :key="region" class="q-mb-lg">
                    <div class="text-h6 bg-grey-3 q-pa-sm">{{ region }}</div>
                    <div v-for="(models, segment) in segments" :key="segment" class="q-ma-md">
                      <div class="text-subtitle2 text-indigo-9 q-mb-xs">Segment: {{ segment }}</div>
                      <q-markup-table flat bordered dense>
                        <thead>
                          <tr>
                            <th class="text-left">Model (Owner)</th>
                            <th class="text-right">Price</th>
                            <th class="text-right">Desirability</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="m in models" :key="m.model + m.owner" :class="m.owner === playerStore.companyName ? 'bg-blue-1' : ''">
                            <td class="text-left">{{ m.model }} ({{ m.owner }})</td>
                            <td class="text-right">${{ m.price.toLocaleString() }}</td>
                            <td class="text-right">{{ m.desirability.toFixed(2) }}</td>
                          </tr>
                        </tbody>
                      </q-markup-table>
                    </div>
                  </div>
                </div>
                <div v-else class="text-center q-pa-xl text-grey">No competition data available.</div>
              </div>

              <div v-if="selectedReport === 'profitChart'">
                <div v-if="reportsStore.history.length > 0" class="relative-position q-pa-md bg-white rounded-borders shadow-1" style="height: 300px; border: 1px solid #ddd;">
                  <div class="absolute-full flex flex-center no-pointer-events">
                    <div style="width: 100%; height: 1px; border-top: 1px dashed #999; z-index: 1;"></div>
                  </div>
                  <div class="row q-gutter-sm justify-center full-height">
                    <div v-for="record in reportsStore.history" :key="record.turn" class="col text-center full-height relative-position">
                      <div class="row items-center justify-center relative-position full-height" style="width: 100%; z-index: 2;">
                        <div v-for="(cData, cId) in record.companies" :key="cId" class="q-mx-xs relative-position" style="height: 100%; width: 20px;">
                          <div :style="getChartStyle(cData.profit, 'profit', cId)">
                            <q-tooltip>{{ cData.name }}: ${{ cData.profit.toLocaleString() }}</q-tooltip>
                          </div>
                        </div>
                      </div>
                      <div class="absolute-bottom text-caption full-width" style="bottom: -20px">{{ record.date }}</div>
                    </div>
                  </div>
                </div>
                <div v-else class="text-center q-pa-xl text-grey">No historical data.</div>
              </div>

              <div v-if="selectedReport === 'productionChart'">
                <div v-if="reportsStore.history.length > 0" class="row q-gutter-md justify-center items-end bg-white q-pa-md rounded-borders shadow-1" style="height: 300px; border: 1px solid #ddd;">
                  <div v-for="record in reportsStore.history" :key="record.turn" class="col text-center">
                    <div class="row items-end justify-center" style="height: 250px">
                      <div v-for="(cData, cId) in record.companies" :key="cId" class="q-mx-xs relative-position"
                           :style="{ height: (getChartHeight(cData.production, 'production')) + '%', width: '20px', backgroundColor: getCompanyColor(cId), borderRadius: '2px 2px 0 0' }">
                        <q-tooltip>{{ cData.name }}: {{ cData.production.toLocaleString() }} units</q-tooltip>
                      </div>
                    </div>
                    <div class="text-caption q-mt-sm">{{ record.date }}</div>
                  </div>
                </div>
                <div v-else class="text-center q-pa-xl text-grey">No historical data.</div>
              </div>

              <div v-if="selectedReport === 'salesChart'">
                <div v-if="reportsStore.history.length > 0" class="row q-gutter-md justify-center items-end bg-white q-pa-md rounded-borders shadow-1" style="height: 300px; border: 1px solid #ddd;">
                  <div v-for="record in reportsStore.history" :key="record.turn" class="col text-center">
                    <div class="row items-end justify-center" style="height: 250px">
                      <div v-for="(cData, cId) in record.companies" :key="cId" class="q-mx-xs relative-position"
                           :style="{ height: (getChartHeight(cData.sales, 'sales')) + '%', width: '20px', backgroundColor: getCompanyColor(cId), borderRadius: '2px 2px 0 0' }">
                        <q-tooltip>{{ cData.name }}: {{ cData.sales.toLocaleString() }} units</q-tooltip>
                      </div>
                    </div>
                    <div class="text-caption q-mt-sm">{{ record.date }}</div>
                  </div>
                </div>
                <div v-else class="text-center q-pa-xl text-grey">No historical data.</div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </q-tab-panel>

      <!-- RISK MANAGEMENT PANEL -->
      <q-tab-panel name="risk" class="q-pa-none">
        <div class="row q-gutter-md">
          <q-card flat bordered class="col-12 col-md-4">
            <q-card-section class="bg-red-10 text-white row items-center">
              <div class="text-h6">Public Reputation</div>
              <q-space />
              <q-icon name="trending_up" size="sm" />
            </q-card-section>
            <q-card-section class="text-center q-pa-lg">
              <div class="text-h2 text-weight-bolder" :class="getReputationColor(playerStore.reputation)">
                {{ Math.floor(playerStore.reputation) }}
              </div>
              <div class="text-subtitle1 text-grey-8">Consumer Trust Rating</div>
              <p class="text-caption text-grey-6 q-mt-sm">
                Reputation influences global demand. Low trust makes your cars harder to sell, regardless of price or performance.
              </p>
            </q-card-section>
            <q-card-section class="q-pa-none bg-grey-1" style="height: 150px">
               <div class="row items-end justify-center full-height q-pa-sm">
                 <div v-for="(h, idx) in playerStore.reputationHistory" :key="idx" class="col q-mx-xs bg-red-4" :style="{ height: h.value + '%' }">
                   <q-tooltip>{{ h.date }}: {{ h.value }}</q-tooltip>
                 </div>
               </div>
            </q-card-section>
          </q-card>

          <q-card flat bordered class="col">
            <q-card-section class="bg-blue-grey-9 text-white row items-center">
              <div class="text-h6">Active Quality Alerts</div>
              <q-space />
              <q-badge color="red" :label="designStore.activeIssues.length" />
            </q-card-section>
            <q-card-section>
              <div v-if="designStore.activeIssues.length === 0" class="text-center q-pa-xl text-grey italic">
                No active safety or reliability concerns reported by the public.
              </div>
              <q-list v-else separator>
                <q-item v-for="issue in designStore.activeIssues" :key="issue.id" class="q-py-md">
                  <q-item-section avatar>
                    <q-icon name="warning" color="red" size="md" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-h6 text-red-9">{{ issue.type }}</q-item-label>
                    <q-item-label>Model: <strong>{{ issue.modelName }}</strong> in {{ issue.territoryName }}</q-item-label>
                    <q-item-label caption class="q-mt-sm">The public is demanding a resolution. Ignoring this will devastate consumer trust.</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <div class="row q-gutter-sm">
                      <q-btn color="red-9" label="Ignore demands" outline @click="ignoreIssue(issue)" />
                      <q-btn color="green-9" :label="`Issue Recall ($${issue.costToFix.toLocaleString()})`" @click="resolveIssue(issue)" />
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </div>
      </q-tab-panel>

      <!-- CORPORATE ACTIONS PANEL -->
      <q-tab-panel name="corporate" class="q-pa-none">
        <div class="row q-gutter-md">
          <q-card v-for="comp in competitorStore.competitors" :key="comp.id" flat bordered class="col-12 col-md-4">
            <q-card-section :class="comp.status === 'distressed' ? 'bg-red-9' : 'bg-indigo-10'" class="text-white row items-center">
              <div class="text-h6">{{ comp.name }}</div>
              <q-space />
              <q-badge v-if="comp.status === 'distressed'" color="white" text-color="red-9" label="DISTRESSED" class="text-bold" />
              <q-icon v-else name="business" size="sm" />
            </q-card-section>

            <q-card-section class="q-pa-md">
              <div class="row justify-between q-mb-sm">
                <span>Headquarters:</span>
                <span class="text-weight-bold text-uppercase">{{ comp.homeTerritory }}</span>
              </div>
              <div class="row justify-between q-mb-sm">
                <span>Strategic Focus:</span>
                <q-badge color="grey-3" text-color="grey-9">{{ comp.personality.segment }}</q-badge>
              </div>
              <q-separator class="q-my-sm" />
              <div class="row justify-between q-mb-xs">
                <span class="text-grey-7">Cash Reserves:</span>
                <span :class="comp.funds < 0 ? 'text-red-9' : 'text-green-9'" class="text-weight-bold">
                  ${{ comp.funds.toLocaleString() }}
                </span>
              </div>
              <div class="row justify-between q-mb-xs">
                <span class="text-grey-7">Public Reputation:</span>
                <span class="text-weight-bold">{{ Math.floor(comp.reputation) }} / 100</span>
              </div>
            </q-card-section>

            <q-card-actions v-if="comp.status === 'distressed'" class="bg-red-1">
              <q-btn color="red-9" class="full-width" label="Acquire Assets" icon="shopping_cart" @click="handleAcquisition(comp)" />
            </q-card-actions>
            <q-card-section v-else class="text-center text-caption text-grey-6 italic">
              Company is stable. Hostile takeover unavailable.
            </q-card-section>
          </q-card>
        </div>
      </q-tab-panel>

      <!-- PERSONNEL PANEL -->
      <q-tab-panel name="personnel" class="q-pa-none">
        <div class="row q-gutter-md">
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

          <q-card flat bordered class="col-12 col-md-4">
            <q-card-section class="bg-blue-10 text-white row items-center">
              <div class="text-h6">R&D Department</div>
              <q-space />
              <q-badge color="white" text-color="blue-10" label="Global" />
            </q-card-section>
            <q-card-section>
              <div class="row items-center justify-around q-mb-md bg-blue-1 q-pa-sm rounded-borders">
                <div class="text-center"><div class="text-h6 text-blue-9">{{ playerStore.totalTechnicians }}</div><div class="text-overline text-grey-7">Total</div></div>
                <q-separator vertical inset />
                <div class="text-center"><div class="text-h6 text-orange-9">{{ playerStore.idleTechnicians }}</div><div class="text-overline text-grey-7">Idle</div></div>
              </div>
              <div class="row q-col-gutter-sm items-center q-mb-md">
                <q-input v-model.number="techHiringInput" type="number" outlined dense label="Technicians" class="col" />
                <q-btn color="green-9" label="Hire" class="col-auto" @click="handleHireTech" />
                <q-btn color="red-9" label="Layoff" outline class="col-auto" @click="handleLayoffTech" />
              </div>
              <div class="text-caption text-grey-7 q-mb-lg text-center">Local Talent Pool: {{ getSelectedTerritory('north-america')?.talentPool }} people</div>
              <q-separator class="q-my-sm" />
              <div class="q-mb-md">
                <div class="row justify-between text-caption"><span>Monthly Salary</span><span class="text-weight-bold">${{ playerStore.salaryPerTechnician.toLocaleString() }}</span></div>
                <q-slider v-model="playerStore.salaryPerTechnician" :min="10" :max="1000" :step="5" label color="blue-7" />
                <div class="row justify-between text-caption text-grey-7 q-mt-xs">
                  <span>Market Avg: ${{ getMarketWage('north-america') }}</span>
                  <span :class="getSatisfactionColor(playerStore.getTechnicianSatisfaction)">Satisfaction: {{ (playerStore.getTechnicianSatisfaction * 100).toFixed(0) }}%</span>
                </div>
              </div>
              <div class="q-mb-xs text-caption">Research Productivity</div>
              <q-linear-progress :value="playerStore.getTechnicianProductivity / 1.5" :color="getSatisfactionColor(playerStore.getTechnicianSatisfaction)" size="10px" rounded />
            </q-card-section>
          </q-card>

          <q-card v-for="factory in playerStore.factories" :key="factory.id" flat bordered class="col-12 col-md-4">
            <q-card-section class="bg-blue-grey-8 text-white">
              <div class="text-h6">{{ factory.location }} Factory</div>
              <div class="text-caption">{{ formatTerritoryName(factory.territory) }} • Level {{ factory.level }}</div>
            </q-card-section>
            <q-card-section>
              <div class="row items-center justify-around q-mb-md bg-blue-grey-1 q-pa-sm rounded-borders">
                <div class="text-center"><div class="text-h6 text-blue-grey-9">{{ factory.totalWorkers }}</div><div class="text-overline text-grey-7">Total</div></div>
                <q-separator vertical inset />
                <div class="text-center"><div class="text-h6 text-orange-9">{{ factory.idleWorkers }}</div><div class="text-overline text-grey-7">Idle</div></div>
              </div>
              <div class="row q-col-gutter-sm items-center q-mb-md">
                <q-input v-model.number="factoryHiringInputs[factory.id]" type="number" outlined dense label="Workers" class="col" />
                <q-btn color="green-9" label="Hire" class="col-auto" @click="handleHireWorkers(factory)" />
                <q-btn color="red-9" label="Layoff" outline class="col-auto" @click="handleLayoffWorkers(factory)" />
              </div>
              <div class="text-caption text-grey-7 q-mb-lg text-center">Regional Talent Pool: {{ getSelectedTerritory(factory.territory)?.talentPool }} people</div>
              <q-separator class="q-my-sm" />
              <div class="q-mb-md">
                <div class="row justify-between text-caption"><span>Monthly Salary</span><span class="text-weight-bold">${{ factory.salary.toLocaleString() }}</span></div>
                <q-slider v-model="factory.salary" :min="5" :max="500" :step="1" label color="orange-8" />
                <div class="row justify-between text-caption text-grey-7 q-mt-xs">
                  <span>Market Avg: ${{ getMarketWage(factory.territory) }}</span>
                  <span :class="getSatisfactionColor(playerStore.getFactorySatisfaction(factory.id))">Satisfaction: {{ (playerStore.getFactorySatisfaction(factory.id) * 100).toFixed(0) }}%</span>
                </div>
              </div>
              <div class="q-mb-sm">
                <div class="text-caption">Output Efficiency</div>
                <q-linear-progress :value="playerStore.getFactoryProductivity(factory.id) / 2.0" :color="getSatisfactionColor(playerStore.getFactorySatisfaction(factory.id))" size="10px" rounded />
                <div class="row justify-between text-caption text-grey-7 q-mt-xs">
                   <span>Unit Cost Mod: -{{ (factory.level - 1) * 5 }}%</span>
                   <span class="text-weight-bold">Max Output: {{ (factory.totalWorkers * playerStore.getFactoryProductivity(factory.id)).toFixed(0) }} units</span>
                </div>
              </div>
              <q-separator class="q-my-sm" />
              <div v-if="factory.level < 5">
                <q-btn color="indigo-10" class="full-width q-mt-sm" label="Modernize Factory" icon="precision_manufacturing" :disabled="playerStore.funds < playerStore.getUpgradeCost(factory.level)" @click="modernizeFactory(factory)" />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </q-tab-panel>

      <!-- MARKET RESEARCH PANEL -->
      <q-tab-panel name="research" class="q-pa-none">
        <div class="row q-gutter-md">
          <div class="col-12 col-md-4">
            <q-card flat bordered>
              <q-card-section class="bg-indigo-10 text-white"><div class="text-h6">Regional Intelligence</div></q-card-section>
              <q-list separator>
                <q-item v-for="t in worldStore.territories.filter(t => t.active)" :key="t.id" clickable @click="selectedResearchId = t.id" :active="selectedResearchId === t.id" active-class="bg-indigo-1">
                  <q-item-section avatar><q-icon name="public" color="indigo" /></q-item-section>
                  <q-item-section><q-item-label>{{ t.name }}</q-item-label><q-item-label caption v-if="playerStore.purchasedReports[t.id]">Report Available</q-item-label><q-item-label caption v-else class="text-orange-9">No Data - $2,500 to commission</q-item-label></q-item-section>
                  <q-item-section side><q-icon v-if="playerStore.purchasedReports[t.id]" name="check_circle" color="positive" /></q-item-section>
                </q-item>
              </q-list>
            </q-card>
          </div>
          <div class="col-12 col-md-7">
            <q-card v-if="!selectedResearchId" flat bordered class="bg-grey-1 flex flex-center" style="height: 400px"><div class="text-center text-grey"><q-icon name="query_stats" size="64px" /><div class="text-h6">Select a region to view analysis</div></div></q-card>
            <q-card v-else-if="!playerStore.purchasedReports[selectedResearchId]" flat bordered class="bg-indigo-1 flex flex-center" style="height: 400px"><div class="text-center"><q-icon name="lock" size="64px" color="indigo-3" /><div class="text-h6 text-indigo-9 q-mt-md">Commission {{ formatTerritoryName(selectedResearchId) }} Report</div><p class="text-grey-8 q-mb-xl">Our analysts will profile regional wealth, population, and consumer segments.</p><q-btn color="indigo-10" icon="payments" label="Pay $2,500 for Monthly Intel" size="lg" @click="buyReport(selectedResearchId)" /></div></q-card>
            <q-card v-else flat bordered><q-card-section class="bg-indigo-9 text-white row items-center"><div class="text-h6">Intelligence Report: {{ formatTerritoryName(selectedResearchId) }}</div><q-space /><q-badge color="white" text-color="indigo-9" :label="gameStore.dateString" /></q-card-section><q-card-section class="row q-col-gutter-md"><div class="col-12 col-sm-6"><div class="text-overline">Regional Profile</div><div class="bg-grey-2 q-pa-md rounded-borders"><div class="row justify-between"><span>Population:</span><span class="text-weight-bold">{{ (getSelectedTerritory(selectedResearchId).population / 1000000).toFixed(1) }}M</span></div><div class="row justify-between q-mt-sm"><span>Avg Wealth:</span><span class="text-weight-bold">{{ getSelectedTerritory(selectedResearchId).wealth }}x</span></div><div class="row justify-between q-mt-sm text-indigo-9"><span>Total Potential:</span><span class="text-weight-bold">{{ playerStore.purchasedReports[selectedResearchId].totalPotential.toLocaleString() }} units/mo</span></div></div></div><div class="col-12 col-sm-6"><div class="text-overline">Segment Demand Shares</div><div class="bg-grey-1 q-pa-sm rounded-borders"><div v-for="(share, cls) in playerStore.purchasedReports[selectedResearchId].segments" :key="cls" class="q-mb-sm"><div class="row justify-between text-caption"><span>{{ cls }}</span><span>{{ Math.round(share * 100) }}%</span></div><q-linear-progress :value="share" color="indigo-6" size="10px" rounded /></div></div></div><div class="col-12"><q-separator class="q-my-md" /><div class="text-subtitle2 q-mb-sm"><q-icon name="tips_and_updates" color="orange-9" /> Analyst Consumer Insight</div><div class="bg-amber-1 q-pa-md rounded-borders border-amber"><div v-for="(share, cls) in playerStore.purchasedReports[selectedResearchId].segments" :key="'ins-'+cls" class="q-mb-sm"><div v-if="share > 0.1"><span class="text-weight-bold">{{ cls }}:</span> {{ getMarketInsight(cls) }}</div></div></div></div></q-card-section></q-card>
          </div>
        </div>
      </q-tab-panel>

      <!-- EXPANSION PANEL -->
      <q-tab-panel name="expansion" class="q-pa-none">
        <div class="row q-gutter-md">
          <q-card v-for="territory in worldStore.territories" :key="territory.id" flat bordered class="col-12 col-sm-6 col-md-4">
            <q-card-section :class="[territory.active ? 'bg-green-7' : 'bg-grey-7', 'text-white']">
              <div class="text-h6">{{ territory.name }}</div>
              <q-badge v-if="territory.active" color="white" text-color="green" label="ESTABLISHED" />
              <q-badge v-else color="white" text-color="grey-8" label="LOCKED" />
            </q-card-section>
            <q-card-section>
              <div class="row justify-between q-mb-sm"><span>Population:</span><span class="text-weight-bold">{{ (territory.population / 1000000).toFixed(1) }}M</span></div>
              <div class="row justify-between q-mb-sm"><span>Market Wealth:</span><span class="text-weight-bold">{{ territory.wealth.toFixed(1) }}x</span></div>
              <q-separator class="q-my-md" />
              <div v-if="territory.active">
                <div class="text-subtitle2 q-mb-xs">Retail Presence</div>
                <div class="row items-center justify-between q-mb-sm"><span>Showrooms: <strong>{{ playerStore.regionalShowrooms[territory.id] || 0 }} / 10</strong></span><q-badge color="positive" :label="`+${((playerStore.regionalShowrooms[territory.id] || 0) * 5)}% Sales Boost`" /></div>
                <q-linear-progress :value="(playerStore.regionalShowrooms[territory.id] || 0) / 10" color="green" size="10px" rounded />
                <q-btn color="green-9" icon="add_business" label="Open New Showroom" class="full-width q-mt-md" :disabled="(playerStore.regionalShowrooms[territory.id] || 0) >= 10 || playerStore.funds < 10000" @click="handleBuyShowroom(territory.id)" />
                <q-separator class="q-my-md" />
                <div class="text-subtitle2 q-mb-xs text-indigo-9">Global Logistics</div>
                <div class="bg-indigo-1 q-pa-sm rounded-borders text-caption"><div>Supplied by: <strong>{{ getSupplyingFactoryName(territory.id) }}</strong></div><div>Unit Ship Cost: <strong>${{ worldStore.getShippingCost(getSelectedFactoryTerritory(territory.id), territory.id) }}</strong></div></div>
                <q-btn outline dense color="blue-grey" icon="factory" label="Build Local Factory" class="full-width q-mt-sm" @click="openFactoryDialog(territory)" />
              </div>
              <div v-else class="q-mt-md"><div class="text-subtitle2 text-grey-7 q-mb-sm">Expansion Cost: ${{ territory.unlockCost.toLocaleString() }}</div><q-btn color="green-8" label="Expand to Region" class="full-width" :disabled="playerStore.funds < territory.unlockCost" @click="expandToRegion(territory)" /></div>
            </q-card-section>
          </q-card>
        </div>
      </q-tab-panel>

      <!-- SIM ANALYTICS PANEL -->
      <q-tab-panel v-if="debugStore.debugMode" name="debug" class="q-pa-none">
        <div v-if="!debugStore.lastTurnSnapshot" class="text-center q-pa-xl text-grey">Run a turn with Developer Mode active to capture simulation math.</div>
        <div v-else class="row q-gutter-md">
          <q-card flat bordered class="col-12"><q-card-section class="bg-grey-8 text-white"><div class="text-h6">World Context</div></q-card-section><q-card-section><div class="text-subtitle1 q-mb-md">Economic Climate: <span class="text-weight-bold">{{ worldStore.economicClimate.toFixed(2) }}x</span></div><div class="text-subtitle2 q-mb-sm text-grey-8">Current Global Demand Segments:</div><q-list dense class="bg-grey-1 rounded-borders q-pa-sm" style="max-width: 400px"><q-item v-for="(share, cls) in currentMarketSegments" :key="cls" class="q-py-xs"><q-item-section><div class="row items-center"><span class="text-weight-bold" style="width: 80px">{{ cls }}</span><q-linear-progress :value="share" color="brown-5" class="col q-mx-sm" size="8px" /><span class="text-caption" style="width: 40px">{{ Math.round(share * 100) }}%</span></div></q-item-section></q-item></q-list></q-card-section></q-card>
          <q-card flat bordered class="col-12">
            <q-card-section class="bg-indigo-10 text-white"><div class="text-h6">Rival Company Financials (Last Turn)</div></q-card-section>
            <q-card-section><div class="row q-col-gutter-md"><div v-for="comp in competitorStore.competitors" :key="comp.id" class="col-12 col-md-4"><q-card flat bordered class="bg-indigo-1"><q-card-section class="q-pb-none"><div class="text-subtitle1 text-weight-bold">{{ comp.name }}</div><div class="text-caption">Total Cash: ${{ comp.funds.toLocaleString() }}</div></q-card-section><q-card-section><q-list dense><q-item><q-item-section>Income:</q-item-section><q-item-section side class="text-green-9 text-weight-bold">+${{ comp.lastTurnLedger.income.toLocaleString() }}</q-item-section></q-item><q-item-label header class="q-pt-sm text-indigo-9 text-overline">Expenses</q-item-label><q-item><q-item-section>Production:</q-item-section><q-item-section side class="text-red-9">-${{ comp.lastTurnLedger.productionCosts.toLocaleString() }}</q-item-section></q-item><q-item><q-item-section>Salaries:</q-item-section><q-item-section side class="text-red-9">-${{ comp.lastTurnLedger.salaries.toLocaleString() }}</q-item-section></q-item><q-item><q-item-section>Shipping:</q-item-section><q-item-section side class="text-red-9">-${{ comp.lastTurnLedger.shipping.toLocaleString() }}</q-item-section></q-item><q-item><q-item-section>Maint/Lease:</q-item-section><q-item-section side class="text-red-9">-${{ (comp.lastTurnLedger.maintenance + comp.lastTurnLedger.lease).toLocaleString() }}</q-item-section></q-item><q-item><q-item-section>Research:</q-item-section><q-item-section side class="text-red-9">-${{ comp.lastTurnLedger.research.toLocaleString() }}</q-item-section></q-item><q-separator class="q-my-xs" /><q-item class="text-weight-bold"><q-item-section>Net:</q-item-section><q-item-section side :class="comp.lastTurnLedger.net >= 0 ? 'text-green-9' : 'text-red-9'">${{ comp.lastTurnLedger.net.toLocaleString() }}</q-item-section></q-item></q-list></q-card-section></q-card></div></div></q-card-section>
          </q-card>
          <q-card flat bordered class="col-12">
            <q-card-section class="bg-blue-grey-9 text-white row items-center"><div class="text-h6">Sales & Pricing Math Breakdown</div></q-card-section>
            <q-card-section class="q-pa-none"><q-expansion-item v-for="(tData, tId) in debugStore.lastTurnSnapshot.sales" :key="tId" :label="tData.name" header-class="bg-grey-2"><div class="q-pa-md"><div v-for="(sData, sName) in tData.segments" :key="sName" class="q-mb-lg"><div class="text-subtitle2 text-indigo-9 border-bottom q-mb-sm">Segment: {{ sName }} (Base Demand: {{ sData.demand }})</div><q-markup-table flat dense bordered><thead><tr><th class="text-left">Model (Owner)</th><th class="text-right">Price</th><th class="text-right">Presence</th><th class="text-right">Sticker Shock</th><th class="text-right">Desirability</th><th class="text-right">Pool Share</th><th class="text-right">Final Sales</th></tr></thead><tbody><tr v-for="m in sData.models" :key="m.name" :class="m.owner === playerStore.companyName ? 'bg-blue-1' : ''"><td class="text-left">{{ m.name }} ({{ m.owner }})</td><td class="text-right">${{ m.price.toLocaleString() }}</td><td class="text-right"><q-badge color="indigo-10" v-if="m.pricing?.presenceFactor > 1.0">+{{ Math.round((m.pricing.presenceFactor - 1) * 100) }}%</q-badge><span v-else>1.0x</span></td><td class="text-right"><q-badge :color="m.pricing?.stickerShock < 1 ? 'negative' : 'positive'">{{ (m.pricing?.stickerShock * 100).toFixed(0) }}%</q-badge></td><td class="text-right">{{ m.desirability.toFixed(4) }}</td><td class="text-right">{{ Math.round(m.share * 100) }}%</td><td class="text-right text-weight-bold">{{ m.actual }}</td></tr></tbody></q-markup-table></div></div></q-expansion-item></q-card-section>
          </q-card>
        </div>
      </q-tab-panel>

      <!-- BANK PANEL -->
      <q-tab-panel name="bank" class="q-pa-none">
        <div class="row q-gutter-md">
          <q-card flat bordered class="col-12 col-md-5">
            <q-card-section class="bg-red-10 text-white"><div class="text-h6">Commercial Loans</div><div class="text-caption">Current Rate: {{ (bankStore.interestRateLoan * 100).toFixed(1) }}% APR</div></q-card-section>
            <q-card-section class="q-pa-lg"><div class="row justify-between items-center q-mb-lg"><div class="text-subtitle1 text-grey-7">Total Debt:</div><div class="text-h4 text-red-9 text-weight-bolder">${{ bankStore.loanBalance.toLocaleString() }}</div></div><div v-if="bankStore.loanBalance > 0" class="bg-red-1 q-pa-md rounded-borders q-mb-lg"><div class="row justify-between"><span>Next Monthly Payment:</span><span class="text-weight-bold">${{ bankStore.monthlyLoanPayment.toLocaleString() }}</span></div><div class="row justify-between q-mt-xs"><span>Status:</span><q-badge :color="bankStore.missedPayments > 0 ? 'red' : 'green'">{{ bankStore.missedPayments > 0 ? `${bankStore.missedPayments} Payments Missed` : 'Good Standing' }}</q-badge></div></div><div class="row q-gutter-sm"><q-btn color="red-9" label="Take $10k Loan" class="col" @click="bankStore.takeLoan(10000)" /><q-btn color="green-9" label="Repay $10k" class="col" :disabled="bankStore.loanBalance < 10000" @click="bankStore.repayLoan(10000)" /></div></q-card-section>
          </q-card>
          <q-card flat bordered class="col-12 col-md-5">
            <q-card-section class="bg-green-10 text-white"><div class="text-h6">Company Savings</div><div class="text-caption">Current Rate: {{ (bankStore.interestRateSavings * 100).toFixed(1) }}% APR</div></q-card-section>
            <q-card-section class="q-pa-lg"><div class="row justify-between items-center q-mb-lg"><div class="text-subtitle1 text-grey-7">Account Balance:</div><div class="text-h4 text-green-9 text-weight-bolder">${{ bankStore.savingsBalance.toLocaleString() }}</div></div><div class="bg-green-1 q-pa-md rounded-borders q-mb-lg"><div class="row justify-between"><span>Est. Monthly Interest:</span><span class="text-weight-bold">+${{ bankStore.monthlySavingsInterest.toLocaleString() }}</span></div></div><div class="row q-gutter-sm items-center"><q-input v-model.number="savingsAmount" type="number" dense outlined label="Amount" class="col" /><q-btn color="green-9" label="Deposit" class="col-auto" :disabled="!savingsAmount || savingsAmount <= 0" @click="handleDeposit" /><q-btn color="blue-9" label="Withdraw" class="col-auto" :disabled="!savingsAmount || savingsAmount <= 0" @click="handleWithdraw" /></div></q-card-section>
          </q-card>
        </div>
      </q-tab-panel>

      <!-- COMPETITION PANEL -->
      <q-tab-panel name="competitors" class="q-pa-none">
        <div class="row q-gutter-md">
          <q-card v-for="comp in competitorStore.competitors" :key="comp.id" flat bordered class="col-12 col-sm-3"><q-card-section class="bg-blue-grey-2"><div class="text-h6">{{ comp.name }}</div><div class="text-caption">Market Share: {{ comp.marketShare }}%</div></q-card-section><q-card-section><q-linear-progress :value="comp.marketShare / 100" color="blue-grey-8" size="10px" /><div class="q-mt-sm"><div class="text-caption text-weight-bold">Latest Model:</div><div class="text-subtitle2">{{ comp.models[0]?.name }}</div></div></q-card-section></q-card>
          <q-card flat bordered class="col-12 col-sm-2 bg-blue-1"><q-card-section class="text-center"><div class="text-overline">Your Share</div><div class="text-h3 text-weight-bolder text-blue-9">{{ playerShare }}%</div></q-card-section></q-card>
        </div>
      </q-tab-panel>
    </q-tab-panels>

    <q-card flat bordered class="q-mt-xl bg-red-1">
      <q-card-section class="row items-center"><div><div class="text-h6 text-red-9">Liquidation Zone</div><div class="text-caption text-grey-8">Close company doors and permanently delete this save slot.</div></div><q-space /><q-btn outline color="negative" icon="delete_forever" label="Liquidate Empire" @click="confirmReset = true" /></q-card-section>
    </q-card>

    <!-- Dialogs -->
    <q-dialog v-model="confirmReset"><q-card><q-card-section class="row items-center"><q-avatar icon="warning" color="red" text-color="white" /><span class="q-ml-sm">Are you sure you want to LIQUIDATE? This will permanently delete your cloud save.</span></q-card-section><q-card-actions align="right"><q-btn flat label="Cancel" color="primary" v-close-popup /><q-btn flat label="Confirm Liquidation" color="red" @click="resetGame" v-close-popup /></q-card-actions></q-card></q-dialog>
    <q-dialog v-model="showFactoryDialog"><q-card style="min-width: 350px"><q-card-section><div class="text-h6">New Factory in {{ selectedTerritory?.name }}</div><div class="text-subtitle2 text-grey-7">Cost: $25,000</div></q-card-section><q-card-section class="q-pt-none"><q-input dense v-model="factoryLocationName" label="Location Name" autofocus @keyup.enter="buildFactory" /></q-card-section><q-card-actions align="right" class="text-primary"><q-btn flat label="Cancel" v-close-popup /><q-btn flat label="Build" @click="buildFactory" :disabled="!factoryLocationName" /></q-card-actions></q-card></q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePlayerStore } from '../stores/player'
import { useWorldStore } from '../stores/world'
import { useGameStore } from '../stores/game'
import { useCompetitorStore } from '../stores/competitors'
import { useBankStore } from '../stores/bank'
import { useDesignStore } from '../stores/design'
import { useSavesStore } from '../stores/saves'
import { useDebugStore } from '../stores/debug'
import { useReportsStore } from '../stores/reports'
import { useResearchStore } from '../stores/research'
import { getMarketSegments, getBaseMarketPrice } from '../logic/simulation'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { VEHICLE_CLASSES } from '../stores/design'

const playerStore = usePlayerStore()
const worldStore = useWorldStore()
const gameStore = useGameStore()
const competitorStore = useCompetitorStore()
const bankStore = useBankStore()
const designStore = useDesignStore()
const savesStore = useSavesStore()
const debugStore = useDebugStore()
const reportsStore = useReportsStore()
const researchStore = useResearchStore()
const router = useRouter()
const $q = useQuasar()

const tab = ref('reports')
const selectedReport = ref('ledger')
const confirmReset = ref(false)
const showFactoryDialog = ref(false)
const selectedTerritory = ref(null)
const factoryLocationName = ref('')
const selectedResearchId = ref(null)

const techHiringInput = ref(0)
const factoryHiringInputs = ref({})

const playerShare = computed(() => {
  const rivalShares = competitorStore.competitors.reduce((acc, c) => acc + c.marketShare, 0)
  return Math.max(0, 100 - rivalShares)
})

const currentMarketSegments = computed(() => getMarketSegments(gameStore.year))

const factoryOptions = computed(() => playerStore.factories.map(f => ({
  label: `${f.location} (${formatTerritoryName(f.territory)})`,
  value: f.id,
  territory: f.territory
})))

const currentReportTitle = computed(() => {
  const titles = {
    ledger: 'Monthly Ledger',
    incomeByModel: 'Income by Model',
    incomeByRegion: 'Income by Region',
    modelReport: 'Production & Sales by Model',
    modelComparison: 'Competitor Model Comparison',
    profitChart: 'Trailing 6-Month Profit',
    productionChart: 'Trailing 6-Month Production',
    salesChart: 'Trailing 6-Month Sales'
  }
  return titles[selectedReport.value] || 'Report'
})

function getChartHeight(value, type) {
  if (reportsStore.history.length === 0) return 0
  let max = 0
  reportsStore.history.forEach(r => {
    Object.values(r.companies).forEach(c => {
      if (Math.abs(c[type]) > max) max = Math.abs(c[type])
    })
  })
  if (max === 0) return 0
  const absValue = Math.abs(value)
  return Math.max(2, (absValue / max) * 100)
}

function getChartStyle(value, type, companyId) {
  const heightPercent = getChartHeight(value, type)
  const color = getCompanyColor(companyId)
  const style = {
    height: (heightPercent / 2) + '%',
    width: '20px',
    backgroundColor: color,
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)'
  }
  if (value >= 0) { style.bottom = '50%'; style.borderRadius = '2px 2px 0 0' }
  else { style.top = '50%'; style.borderRadius = '0 0 2px 2px' }
  return style
}

function getCompanyColor(companyId) {
  const colors = {
    player: '#4caf50',
    'blue-oval': '#1976d2',
    'general-auto': '#f44336',
    'continental': '#ff9800',
    'bavarian': '#673ab7',
    'nippon': '#009688',
    'britannia': '#795548',
    'detroit-deluxe': '#607d8b',
    'volks-wagon': '#3f51b5'
  }
  return colors[companyId] || '#9e9e9e'
}

function getReputationColor(val) {
  if (val < 30) return 'text-negative'
  if (val < 60) return 'text-orange-9'
  return 'text-positive'
}

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

function formatTerritoryName(id) { return worldStore.territories.find(t => t.id === id)?.name || id }
function getSelectedTerritory(id) { return worldStore.territories.find(t => t.id === id) }

function expandToRegion(territory) {
  if (playerStore.expandToTerritory(territory)) { $q.notify({ color: 'positive', message: `Expanded to ${territory.name}!` }) }
  else { $q.notify({ color: 'negative', message: 'Insufficient funds.' }) }
}

function handleBuyShowroom(territoryId) {
  const result = playerStore.buildShowroom(territoryId)
  if (result.success) { $q.notify({ color: 'positive', message: 'New showroom opened!', icon: 'add_business' }) }
  else { $q.notify({ color: 'negative', message: result.error }) }
}

function openFactoryDialog(territory) {
  selectedTerritory.value = territory
  factoryLocationName.value = ''
  showFactoryDialog.value = true
}

function buildFactory() {
  if (playerStore.buildFactory(selectedTerritory.value.id, factoryLocationName.value)) { $q.notify({ color: 'positive', message: `Factory built in ${factoryLocationName.value}!` }); showFactoryDialog.value = false }
  else { $q.notify({ color: 'negative', message: 'Insufficient funds.' }) }
}

function modernizeFactory(factory) {
  const cost = playerStore.getUpgradeCost(factory.level)
  $q.dialog({
    title: 'Modernize Factory',
    message: `Upgrade to Level ${factory.level + 1}? Cost: $${cost.toLocaleString()}`,
    cancel: true,
    persistent: true
  }).onOk(() => {
    if (playerStore.upgradeFactory(factory.id)) { $q.notify({ color: 'positive', message: 'Modernization complete!', icon: 'precision_manufacturing' }) }
  })
}

function resolveIssue(issue) {
  const result = designStore.resolveIssue(issue.id)
  if (result.success) { $q.notify({ color: 'positive', message: `Recall issued. Cost: $${result.cost.toLocaleString()}`, icon: 'check_circle' }) }
  else { $q.notify({ color: 'negative', message: 'Insufficient funds.' }) }
}

function ignoreIssue(issue) {
  $q.dialog({ title: 'Ignore Demands?', message: 'Reputation hit incoming. Are you sure?', cancel: true, persistent: true }).onOk(() => {
    designStore.ignoreIssue(issue.id)
    $q.notify({ color: 'negative', message: 'Reputation damaged.', icon: 'mood_bad' })
  })
}

function buyReport(territoryId) {
  const t = getSelectedTerritory(territoryId)
  const segments = getMarketSegments(gameStore.year)
  const totalPotential = Math.floor((t.population / 100000) * t.wealth * worldStore.globalDemandMultiplier)
  if (playerStore.buyReport(territoryId, segments, totalPotential)) { $q.notify({ color: 'positive', message: 'Report commissioned!', icon: 'analytics' }) }
  else { $q.notify({ color: 'negative', message: 'Insufficient funds.' }) }
}

function getMarketInsight(cls) {
  const insights = {
    [VEHICLE_CLASSES.ECONOMY]: 'Buyers are extremely sensitive to unit price.',
    [VEHICLE_CLASSES.LUXURY]: 'Consumers value prestige and safety.',
    [VEHICLE_CLASSES.SPORT]: 'Performance is king.',
    [VEHICLE_CLASSES.UTILITY]: 'Industrial buyers focus on durability.'
  }
  return insights[cls]
}

const savingsAmount = ref(0)
function handleDeposit() {
  if (savingsAmount.value > playerStore.funds) { $q.notify({ color: 'negative', message: 'Insufficient funds.' }); return }
  bankStore.deposit(savingsAmount.value)
  $q.notify({ color: 'positive', message: 'Deposited.' }); savingsAmount.value = 0
}
function handleWithdraw() {
  if (savingsAmount.value > bankStore.savingsBalance) { $q.notify({ color: 'negative', message: 'Insufficient savings.' }); return }
  bankStore.withdraw(savingsAmount.value); $q.notify({ color: 'positive', message: 'Withdrew.' }); savingsAmount.value = 0
}

function handleHireTech() {
  const hired = playerStore.hireTechnicians(techHiringInput.value)
  if (hired > 0) { $q.notify({ color: 'positive', message: `Hired ${hired} technicians.` }); techHiringInput.value = 0 }
  else $q.notify({ color: 'negative', message: 'No talent available.' })
}
function handleLayoffTech() {
  const fired = playerStore.layoffTechnicians(techHiringInput.value)
  if (fired > 0) { $q.notify({ color: 'warning', message: `Laid off ${fired} technicians.` }); techHiringInput.value = 0 }
  else $q.notify({ color: 'negative', message: 'Only idle technicians can be laid off!' })
}
function handleHireWorkers(factory) {
  const input = factoryHiringInputs.value[factory.id] || 0
  const hired = playerStore.hireWorkers(factory.id, input)
  if (hired > 0) { $q.notify({ color: 'positive', message: `Hired ${hired} workers.` }); factoryHiringInputs.value[factory.id] = 0 }
  else $q.notify({ color: 'negative', message: 'No talent available.' })
}
function handleLayoffWorkers(factory) {
  const input = factoryHiringInputs.value[factory.id] || 0
  const fired = playerStore.layoffWorkers(factory.id, input)
  if (fired > 0) { $q.notify({ color: 'warning', message: `Laid off ${fired} workers.` }); factoryHiringInputs.value[factory.id] = 0 }
  else $q.notify({ color: 'negative', message: 'Only idle workers can be laid off!' })
}

function handleAcquisition(comp) {
  const assetValue = comp.factories.length * 15000 + (comp.unlockedTech.length * 2000)
  const price = Math.round(assetValue * 0.6) 
  $q.dialog({ title: 'Acquire Rival', message: `Acquire ${comp.name} for $${price.toLocaleString()}?`, cancel: true, persistent: true }).onOk(() => {
    if (playerStore.funds >= price) {
      playerStore.funds -= price
      comp.factories.forEach(f => { playerStore.factories.push({ ...f, id: Date.now() + Math.random(), totalWorkers: f.employees, idleWorkers: f.employees, location: `${comp.name} - ${f.location}` }) })
      comp.unlockedTech.forEach(tId => { if (!researchStore.unlockedTech.includes(tId)) researchStore.unlockedTech.push(tId) })
      competitorStore.removeCompetitor(comp.id); $q.notify({ color: 'positive', message: 'Assets absorbed!', icon: 'handshake' })
    } else { $q.notify({ color: 'negative', message: 'Insufficient funds.' }) }
  })
}

function getSupplyingFactoryName(territoryId) {
  const factoryId = playerStore.supplyLines[territoryId]
  const factory = playerStore.factories.find(f => f.id === factoryId)
  if (!factory) return 'None'
  return `${factory.location} (${formatTerritoryName(factory.territory)})`
}

async function resetGame() { if (gameStore.currentSlotId) { await savesStore.deleteSave(gameStore.currentSlotId); gameStore.setSlot(null); router.push('/saves') } }
</script>

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
      <q-tab name="research" label="Market Research" icon="analytics" />
      <q-tab name="logistics" label="Logistics" icon="local_shipping" />
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
              <!-- 1. Monthly Ledger -->
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

              <!-- 2. Income By Model -->
              <div v-if="selectedReport === 'incomeByModel'">
                <q-list separator v-if="Object.keys(reportsStore.lastTurn.incomeByModel).length > 0">
                  <q-item v-for="(amount, model) in reportsStore.lastTurn.incomeByModel" :key="model">
                    <q-item-section>{{ model }}</q-item-section>
                    <q-item-section side class="text-green-9 text-weight-bold">${{ amount.toLocaleString() }}</q-item-section>
                  </q-item>
                </q-list>
                <div v-else class="text-center q-pa-xl text-grey">No sales data available.</div>
              </div>

              <!-- 3. Income By Region -->
              <div v-if="selectedReport === 'incomeByRegion'">
                <q-list separator v-if="Object.keys(reportsStore.lastTurn.incomeByRegion).length > 0">
                  <q-item v-for="(amount, region) in reportsStore.lastTurn.incomeByRegion" :key="region">
                    <q-item-section>{{ region }}</q-item-section>
                    <q-item-section side class="text-green-9 text-weight-bold">${{ amount.toLocaleString() }}</q-item-section>
                  </q-item>
                </q-list>
                <div v-else class="text-center q-pa-xl text-grey">No sales data available.</div>
              </div>

              <!-- 4. Model Report -->
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

              <!-- 5. Model Comparison -->
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
                          <tr v-for="m in models" :key="m.model + m.owner" :class="m.owner === 'Player' ? 'bg-blue-1' : ''">
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

              <!-- 6. Profit Chart -->
              <div v-if="selectedReport === 'profitChart'">
                <div v-if="reportsStore.history.length > 0" class="row q-gutter-md justify-center items-end" style="height: 300px; padding-bottom: 20px; border-bottom: 1px solid #ccc;">
                  <div v-for="record in reportsStore.history" :key="record.turn" class="col text-center">
                    <div class="row items-end justify-center" style="height: 250px">
                      <div v-for="(cData, cId) in record.companies" :key="cId" class="q-mx-xs relative-position"
                           :style="{ height: getChartHeight(cData.profit, 'profit') + 'px', width: '20px', backgroundColor: getCompanyColor(cId) }">
                        <q-tooltip>{{ cData.name }}: ${{ cData.profit.toLocaleString() }}</q-tooltip>
                      </div>
                    </div>
                    <div class="text-caption q-mt-sm">{{ record.date }}</div>
                  </div>
                </div>
                <div v-else class="text-center q-pa-xl text-grey">No historical data.</div>
              </div>

              <!-- 7. Production Chart -->
              <div v-if="selectedReport === 'productionChart'">
                <div v-if="reportsStore.history.length > 0" class="row q-gutter-md justify-center items-end" style="height: 300px; padding-bottom: 20px; border-bottom: 1px solid #ccc;">
                  <div v-for="record in reportsStore.history" :key="record.turn" class="col text-center">
                    <div class="row items-end justify-center" style="height: 250px">
                      <div v-for="(cData, cId) in record.companies" :key="cId" class="q-mx-xs relative-position"
                           :style="{ height: getChartHeight(cData.production, 'production') + 'px', width: '20px', backgroundColor: getCompanyColor(cId) }">
                        <q-tooltip>{{ cData.name }}: {{ cData.production.toLocaleString() }} units</q-tooltip>
                      </div>
                    </div>
                    <div class="text-caption q-mt-sm">{{ record.date }}</div>
                  </div>
                </div>
                <div v-else class="text-center q-pa-xl text-grey">No historical data.</div>
              </div>

              <!-- 8. Sales Chart -->
              <div v-if="selectedReport === 'salesChart'">
                <div v-if="reportsStore.history.length > 0" class="row q-gutter-md justify-center items-end" style="height: 300px; padding-bottom: 20px; border-bottom: 1px solid #ccc;">
                  <div v-for="record in reportsStore.history" :key="record.turn" class="col text-center">
                    <div class="row items-end justify-center" style="height: 250px">
                      <div v-for="(cData, cId) in record.companies" :key="cId" class="q-mx-xs relative-position"
                           :style="{ height: getChartHeight(cData.sales, 'sales') + 'px', width: '20px', backgroundColor: getCompanyColor(cId) }">
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

      <!-- DEBUG PANEL (Sim Analytics) -->
      <q-tab-panel v-if="debugStore.debugMode" name="debug" class="q-pa-none">
        <div v-if="!debugStore.lastTurnSnapshot" class="text-center q-pa-xl text-grey">
          Run a turn with Developer Mode active to capture simulation math.
        </div>
        <div v-else class="row q-gutter-md">

          <q-card flat bordered class="col-12">
            <q-card-section class="bg-grey-8 text-white">
              <div class="text-h6">World Context</div>
            </q-card-section>
            <q-card-section>
              <div class="text-subtitle1 q-mb-md">Economic Climate: <span class="text-weight-bold">{{ worldStore.economicClimate.toFixed(2) }}x</span></div>
              
              <div class="text-subtitle2 q-mb-sm text-grey-8">Current Global Demand Segments:</div>
              <q-list dense class="bg-grey-1 rounded-borders q-pa-sm" style="max-width: 400px">
                <q-item v-for="(share, cls) in currentMarketSegments" :key="cls" class="q-py-xs">
                  <q-item-section>
                    <div class="row items-center">
                      <span class="text-weight-bold" style="width: 80px">{{ cls }}</span>
                      <q-linear-progress :value="share" color="brown-5" class="col q-mx-sm" size="8px" />
                      <span class="text-caption" style="width: 40px">{{ Math.round(share * 100) }}%</span>
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>

              <div v-if="worldStore.activeEvents.length > 0" class="q-mt-lg">
                <div class="text-caption q-mt-sm">Active Effects:</div>
                <div class="row q-gutter-xs">
                  <q-chip v-for="event in worldStore.activeEvents" :key="event.title" dense color="orange" text-color="white" icon="event">
                    {{ event.title }}
                  </q-chip>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- AI Rival Finances -->
          <q-card flat bordered class="col-12">
            <q-card-section class="bg-indigo-10 text-white">
              <div class="text-h6">Rival Company Financials (Last Turn)</div>
            </q-card-section>
            <q-card-section>
              <div class="row q-col-gutter-md">
                <div v-for="comp in competitorStore.competitors" :key="comp.id" class="col-12 col-md-4">
                  <q-card flat bordered class="bg-indigo-1">
                    <q-card-section class="q-pb-none">
                      <div class="text-subtitle1 text-weight-bold">{{ comp.name }}</div>
                      <div class="text-caption">Total Cash: ${{ comp.funds.toLocaleString() }}</div>
                    </q-card-section>
                    <q-card-section>
                      <q-list dense>
                        <q-item>
                          <q-item-section>Income:</q-item-section>
                          <q-item-section side class="text-green-9 text-weight-bold">+${{ comp.lastTurnLedger.income.toLocaleString() }}</q-item-section>
                        </q-item>
                        <q-item-label header class="q-pt-sm text-indigo-9 text-overline">Expenses</q-item-label>
                        <q-item>
                          <q-item-section>Production:</q-item-section>
                          <q-item-section side class="text-red-9">-${{ comp.lastTurnLedger.productionCosts.toLocaleString() }}</q-item-section>
                        </q-item>
                        <q-item>
                          <q-item-section>Salaries:</q-item-section>
                          <q-item-section side class="text-red-9">-${{ comp.lastTurnLedger.salaries.toLocaleString() }}</q-item-section>
                        </q-item>
                        <q-item>
                          <q-item-section>Shipping:</q-item-section>
                          <q-item-section side class="text-red-9">-${{ comp.lastTurnLedger.shipping.toLocaleString() }}</q-item-section>
                        </q-item>
                        <q-item>
                          <q-item-section>Maint/Lease:</q-item-section>
                          <q-item-section side class="text-red-9">-${{ (comp.lastTurnLedger.maintenance + comp.lastTurnLedger.lease).toLocaleString() }}</q-item-section>
                        </q-item>
                        <q-item>
                          <q-item-section>Research:</q-item-section>
                          <q-item-section side class="text-red-9">-${{ comp.lastTurnLedger.research.toLocaleString() }}</q-item-section>
                        </q-item>
                        <q-separator class="q-my-xs" />
                        <q-item class="text-weight-bold">
                          <q-item-section>Net:</q-item-section>
                          <q-item-section side :class="comp.lastTurnLedger.net >= 0 ? 'text-green-9' : 'text-red-9'">
                            ${{ comp.lastTurnLedger.net.toLocaleString() }}
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Production Breakdown -->
          <q-card flat bordered class="col-12">
            <q-card-section class="bg-red-10 text-white">
              <div class="text-h6">Production Math Breakdown</div>
            </q-card-section>
            <q-card-section>
              <q-markup-table flat dense bordered>
                <thead>
                  <tr>
                    <th class="text-left">Factory Owner</th>
                    <th class="text-left">Location</th>
                    <th class="text-right">Max Capacity</th>
                    <th class="text-right">Total Requested</th>
                    <th class="text-right">Actual Output</th>
                    <th class="text-right">Utilization</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(data, fId) in debugStore.lastTurnSnapshot.production" :key="fId">
                    <td class="text-left">{{ data.owner }}</td>
                    <td class="text-left">{{ data.location }}</td>
                    <td class="text-right">{{ Math.round(data.capacity) }}</td>
                    <td class="text-right">{{ data.totalRequested }}</td>
                    <td class="text-right">{{ data.actualOutput }}</td>
                    <td class="text-right">{{ Math.round((data.actualOutput / (data.capacity || 1)) * 100) }}%</td>
                  </tr>
                </tbody>
              </q-markup-table>
            </q-card-section>
          </q-card>

          <!-- Sales Breakdown -->
          <q-card flat bordered class="col-12">
            <q-card-section class="bg-blue-grey-9 text-white row items-center">
              <div class="text-h6">Sales & Pricing Math Breakdown</div>
              <q-space />
              <div class="text-caption text-italic">Target Price for {{ debugStore.lastTurnSnapshot.year }}: ${{ getBaseMarketPrice(debugStore.lastTurnSnapshot.year).toLocaleString() }}</div>
            </q-card-section>
            <q-card-section class="q-pa-none">
              <q-expansion-item
                v-for="(tData, tId) in debugStore.lastTurnSnapshot.sales"
                :key="tId"
                :label="tData.name"
                header-class="bg-grey-2"
              >
                <div class="q-pa-md">
                  <div v-for="(sData, sName) in tData.segments" :key="sName" class="q-mb-lg">
                    <div class="text-subtitle2 text-indigo-9 border-bottom q-mb-sm">
                      Segment: {{ sName }} (Base Demand: {{ sData.demand }})
                    </div>
                    <q-markup-table flat dense bordered>
                      <thead>
                        <tr>
                          <th class="text-left">Model (Owner)</th>
                          <th class="text-right">Price</th>
                          <th class="text-right">Sticker Shock</th>
                          <th class="text-right">Desirability</th>
                          <th class="text-right">Pool Share</th>
                          <th class="text-right">Final Sales</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="m in sData.models" :key="m.name" :class="m.owner === 'Player' ? 'bg-blue-1' : ''">
                          <td class="text-left">
                            {{ m.name }} ({{ m.owner }})
                            <q-tooltip v-if="m.pricing">
                              Affordability Cap: ${{ m.pricing.affordabilityCap.toLocaleString() }}<br>
                              Price Factor: {{ m.pricing.priceFactor.toFixed(2) }}
                            </q-tooltip>
                          </td>
                          <td class="text-right">${{ m.price.toLocaleString() }}</td>
                          <td class="text-right">
                            <q-badge :color="m.pricing?.stickerShock < 1 ? 'negative' : 'positive'">
                              {{ (m.pricing?.stickerShock * 100).toFixed(0) }}%
                            </q-badge>
                          </td>
                          <td class="text-right">{{ m.desirability.toFixed(4) }}</td>
                          <td class="text-right">{{ Math.round(m.share * 100) }}%</td>
                          <td class="text-right text-weight-bold">{{ m.actual }}</td>
                        </tr>
                      </tbody>
                    </q-markup-table>
                  </div>
                </div>
              </q-expansion-item>
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
                <q-slider v-model="playerStore.salaryPerTechnician" :min="10" :max="1000" :step="5" label color="blue-7" />
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
              <div class="text-caption">{{ formatTerritoryName(factory.territory) }} • Level {{ factory.level }}</div>
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
                <q-slider v-model="factory.salary" :min="5" :max="500" :step="1" label color="orange-8" />
                <div class="row justify-between text-caption text-grey-7 q-mt-xs">
                  <span>Market Avg: ${{ getMarketWage(factory.territory) }}</span>
                  <span :class="getSatisfactionColor(playerStore.getFactorySatisfaction(factory.id))">
                    Satisfaction: {{ (playerStore.getFactorySatisfaction(factory.id) * 100).toFixed(0) }}%
                  </span>
                </div>
              </div>

              <div class="q-mb-sm">
                <div class="text-caption">Automation & Output</div>
                <q-linear-progress :value="playerStore.getFactoryProductivity(factory.id) / 2.0" :color="getSatisfactionColor(playerStore.getFactorySatisfaction(factory.id))" size="10px" rounded />
                <div class="row justify-between text-caption text-grey-7 q-mt-xs">
                   <span>Unit Cost: -{{ (factory.level - 1) * 5 }}%</span>
                   <span class="text-weight-bold">Output: {{ (factory.employees * playerStore.getFactoryProductivity(factory.id)).toFixed(0) }} units</span>
                </div>
              </div>

              <q-separator class="q-my-sm" />

              <div v-if="factory.level < 5">
                <q-btn 
                  color="indigo-10" 
                  class="full-width" 
                  label="Modernize Factory" 
                  icon="precision_manufacturing"
                  :disabled="playerStore.funds < playerStore.getUpgradeCost(factory.level)"
                  @click="modernizeFactory(factory)"
                >
                  <q-tooltip>
                    Upgrade to Level {{ factory.level + 1 }}. Cost: ${{ playerStore.getUpgradeCost(factory.level).toLocaleString() }}
                  </q-tooltip>
                </q-btn>
                <div class="text-center text-caption text-indigo-9 q-mt-xs">
                  Next Level: ${{ playerStore.getUpgradeCost(factory.level).toLocaleString() }}
                </div>
              </div>
              <div v-else class="text-center text-positive text-weight-bold text-overline">
                FULLY MODERNIZED (MAX LEVEL)
              </div>
            </q-card-section>
          </q-card>
        </div>
      </q-tab-panel>

      <!-- MARKET RESEARCH PANEL -->
      <q-tab-panel name="research" class="q-pa-none">
        <div class="row q-gutter-md">
          <!-- Territory List -->
          <div class="col-12 col-md-4">
            <q-card flat bordered>
              <q-card-section class="bg-indigo-10 text-white">
                <div class="text-h6">Regional Intelligence</div>
              </q-card-section>
              <q-list separator>
                <q-item v-for="t in worldStore.territories.filter(t => t.active)" :key="t.id" clickable @click="selectedResearchId = t.id" :active="selectedResearchId === t.id" active-class="bg-indigo-1">
                  <q-item-section avatar>
                    <q-icon name="public" color="indigo" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ t.name }}</q-item-label>
                    <q-item-label caption v-if="playerStore.purchasedReports[t.id]">Report Available</q-item-label>
                    <q-item-label caption v-else class="text-orange-9">No Data - $2,500 to commission</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-icon v-if="playerStore.purchasedReports[t.id]" name="check_circle" color="positive" />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card>
          </div>

          <!-- Report Display -->
          <div class="col-12 col-md-7">
            <q-card v-if="!selectedResearchId" flat bordered class="bg-grey-1 flex flex-center" style="height: 400px">
              <div class="text-center text-grey">
                <q-icon name="query_stats" size="64px" />
                <div class="text-h6">Select a region to view analysis</div>
              </div>
            </q-card>
            
            <q-card v-else-if="!playerStore.purchasedReports[selectedResearchId]" flat bordered class="bg-indigo-1 flex flex-center" style="height: 400px">
              <div class="text-center">
                <q-icon name="lock" size="64px" color="indigo-3" />
                <div class="text-h6 text-indigo-9 q-mt-md">Commission {{ formatTerritoryName(selectedResearchId) }} Report</div>
                <p class="text-grey-8 q-mb-xl">Our analysts will profile regional wealth, population, and consumer segments.</p>
                <q-btn color="indigo-10" icon="payments" label="Pay $2,500 for Monthly Intel" size="lg" @click="buyReport(selectedResearchId)" />
              </div>
            </q-card>

            <q-card v-else flat bordered>
              <q-card-section class="bg-indigo-9 text-white row items-center">
                <div class="text-h6">Intelligence Report: {{ formatTerritoryName(selectedResearchId) }}</div>
                <q-space />
                <q-badge color="white" text-color="indigo-9" :label="gameStore.dateString" />
              </q-card-section>

              <q-card-section class="row q-col-gutter-md">
                <div class="col-12 col-sm-6">
                  <div class="text-overline">Regional Profile</div>
                  <div class="bg-grey-2 q-pa-md rounded-borders">
                    <div class="row justify-between"><span>Population:</span><span class="text-weight-bold">{{ (getSelectedTerritory(selectedResearchId).population / 1000000).toFixed(1) }}M</span></div>
                    <div class="row justify-between q-mt-sm"><span>Avg Wealth:</span><span class="text-weight-bold">{{ getSelectedTerritory(selectedResearchId).wealth }}x</span></div>
                    <div class="row justify-between q-mt-sm text-indigo-9"><span>Total Potential:</span><span class="text-weight-bold">{{ playerStore.purchasedReports[selectedResearchId].totalPotential.toLocaleString() }} units/mo</span></div>
                  </div>
                </div>

                <div class="col-12 col-sm-6">
                  <div class="text-overline">Segment Demand Shares</div>
                  <div class="bg-grey-1 q-pa-sm rounded-borders">
                    <div v-for="(share, cls) in playerStore.purchasedReports[selectedResearchId].segments" :key="cls" class="q-mb-sm">
                      <div class="row justify-between text-caption">
                        <span>{{ cls }}</span>
                        <span>{{ Math.round(share * 100) }}%</span>
                      </div>
                      <q-linear-progress :value="share" color="indigo-6" size="10px" rounded />
                    </div>
                  </div>
                </div>

                <div class="col-12">
                  <q-separator class="q-my-md" />
                  <div class="text-subtitle2 q-mb-sm"><q-icon name="tips_and_updates" color="orange-9" /> Analyst Consumer Insight</div>
                  <div class="bg-amber-1 q-pa-md rounded-borders border-amber">
                    <div v-for="(share, cls) in playerStore.purchasedReports[selectedResearchId].segments" :key="'ins-'+cls" class="q-mb-sm">
                      <div v-if="share > 0.1">
                        <span class="text-weight-bold">{{ cls }}:</span> {{ getMarketInsight(cls) }}
                      </div>
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
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
import { useDebugStore } from '../stores/debug'
import { useReportsStore } from '../stores/reports'
import { getMarketSegments, getBaseMarketPrice } from '../logic/simulation'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { VEHICLE_CLASSES } from '../stores/design'

const playerStore = usePlayerStore()
const worldStore = useWorldStore()
const gameStore = useGameStore()
const competitorStore = useCompetitorStore()
const bankStore = useBankStore()
const savesStore = useSavesStore()
const debugStore = useDebugStore()
const reportsStore = useReportsStore()
const router = useRouter()
const $q = useQuasar()

const tab = ref('reports')
const selectedReport = ref('ledger')
const confirmReset = ref(false)
const showFactoryDialog = ref(false)
const selectedTerritory = ref(null)
const factoryLocationName = ref('')
const selectedResearchId = ref(null)

const playerShare = computed(() => {
  const rivalShares = competitorStore.competitors.reduce((acc, c) => acc + c.marketShare, 0)
  return Math.max(0, 100 - rivalShares)
})

const currentMarketSegments = computed(() => {
  return getMarketSegments(gameStore.year)
})

const factoryOptions = computed(() => {
  return playerStore.factories.map(f => ({
    label: `${f.location} (${formatTerritoryName(f.territory)})`,
    value: f.id,
    territory: f.territory
  }))
})

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
  return Math.max(5, (value / max) * 200) // 200px max height, minimum 5px bar
}

function getCompanyColor(companyId) {
  const colors = {
    player: '#4caf50', // green
    'ford-rival': '#1976d2', // blue
    'gm-rival': '#f44336', // red
    'euro-rival': '#ff9800' // orange
  }
  return colors[companyId] || '#9e9e9e'
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

function formatTerritoryName(id) {
  return worldStore.territories.find(t => t.id === id)?.name || id
}

function getSelectedTerritory(id) {
  return worldStore.territories.find(t => t.id === id)
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

function modernizeFactory(factory) {
  const cost = playerStore.getUpgradeCost(factory.level)
  $q.dialog({
    title: 'Modernize Factory',
    message: `Are you sure you want to upgrade the ${factory.location} factory to Level ${factory.level + 1}? Cost: $${cost.toLocaleString()}`,
    cancel: true,
    persistent: true
  }).onOk(() => {
    if (playerStore.upgradeFactory(factory.id)) {
      $q.notify({ color: 'positive', message: 'Modernization complete!', icon: 'precision_manufacturing' })
    }
  })
}

function buyReport(territoryId) {
  const t = getSelectedTerritory(territoryId)
  const segments = getMarketSegments(gameStore.year)
  const totalPotential = Math.floor((t.population / 100000) * t.wealth * worldStore.globalDemandMultiplier)
  
  if (playerStore.buyReport(territoryId, segments, totalPotential)) {
    $q.notify({ color: 'positive', message: 'Report commissioned!', icon: 'analytics' })
  } else {
    $q.notify({ color: 'negative', message: 'Insufficient funds for research.' })
  }
}

function getMarketInsight(cls) {
  const insights = {
    [VEHICLE_CLASSES.ECONOMY]: 'Buyers are extremely sensitive to unit price and monthly fuel costs.',
    [VEHICLE_CLASSES.LUXURY]: 'Consumers value prestige, high-end features, and safety over affordability.',
    [VEHICLE_CLASSES.SPORT]: 'Performance is king. Buyers demand high power-to-weight ratios and speed.',
    [VEHICLE_CLASSES.UTILITY]: 'Industrial and rural buyers focus on durability, torque, and cargo space.'
  }
  return insights[cls]
}

async function resetGame() {
  if (gameStore.currentSlotId) {
    await savesStore.deleteSave(gameStore.currentSlotId)
    gameStore.setSlot(null)
    router.push('/saves')
  }
}
</script>

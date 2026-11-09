import { defineStore, acceptHMRUpdate } from 'pinia'
import { useWorldStore } from './world'

export const RIVAL_POOL = [
  {
    id: 'blue-oval',
    name: 'Blue Oval Motors',
    homeTerritory: 'north-america',
    personality: { segment: 'Economy', expansion: 'Aggressive', research: 'Balanced' },
    startingModels: [{
      id: 'blue-oval-t', name: 'Model T-Rival', vehicleClass: 'Economy',
      price: 750, cost: 340, introduced: 1900,
      stats: { pwrRatio: 11, safety: 10, power: 16, economy: 14, appeal: 8, durability: 25 }
    }]
  },
  {
    id: 'general-auto',
    name: 'General Auto',
    homeTerritory: 'north-america',
    personality: { segment: 'Utility', expansion: 'Moderate', research: 'High' },
    startingModels: [{
      id: 'ga-premier', name: 'Standard Six', vehicleClass: 'Utility',
      price: 900, cost: 410, introduced: 1900,
      stats: { pwrRatio: 14, safety: 14, power: 24, economy: 12, appeal: 12, durability: 45 }
    }]
  },
  {
    id: 'continental',
    name: 'Continental Cars',
    homeTerritory: 'europe',
    personality: { segment: 'Sport', expansion: 'Moderate', research: 'Balanced' },
    startingModels: [{
      id: 'cc-lemans', name: 'Le Mans', vehicleClass: 'Sport',
      price: 1350, cost: 540, introduced: 1900,
      stats: { pwrRatio: 26, safety: 12, power: 40, economy: 10, appeal: 22, durability: 30 }
    }]
  },
  {
    id: 'bavarian',
    name: 'Bavarian Engineering',
    homeTerritory: 'europe',
    personality: { segment: 'Luxury', expansion: 'Conservative', research: 'High' },
    startingModels: [{
      id: 'be-prestige', name: 'Prinz', vehicleClass: 'Luxury',
      price: 1850, cost: 720, introduced: 1900,
      stats: { pwrRatio: 20, safety: 25, power: 48, economy: 10, appeal: 35, durability: 50 }
    }]
  },
  {
    id: 'britannia',
    name: 'Britannia Motor Co',
    homeTerritory: 'europe',
    personality: { segment: 'Utility', expansion: 'Aggressive', research: 'Conservative' },
    startingModels: [{
      id: 'bmc-rover', name: 'Rover', vehicleClass: 'Utility',
      price: 850, cost: 390, introduced: 1900,
      stats: { pwrRatio: 12, safety: 16, power: 22, economy: 13, appeal: 10, durability: 55 }
    }]
  },
  {
    id: 'nippon',
    name: 'Nippon Steel & Motor',
    homeTerritory: 'east-asia',
    personality: { segment: 'Economy', expansion: 'Aggressive', research: 'High' },
    startingModels: [{
      id: 'nsm-compact', name: 'Sunrise', vehicleClass: 'Economy',
      price: 720, cost: 320, introduced: 1900,
      stats: { pwrRatio: 12, safety: 12, power: 18, economy: 18, appeal: 10, durability: 35 }
    }]
  },
  {
    id: 'detroit-deluxe',
    name: 'Detroit Deluxe',
    homeTerritory: 'north-america',
    personality: { segment: 'Luxury', expansion: 'Conservative', research: 'Balanced' },
    startingModels: [{
      id: 'dd-brougham', name: 'Brougham', vehicleClass: 'Luxury',
      price: 2100, cost: 800, introduced: 1900,
      stats: { pwrRatio: 18, safety: 28, power: 55, economy: 9, appeal: 40, durability: 50 }
    }]
  },
  {
    id: 'volks-wagon',
    name: 'Volks-Wagon',
    homeTerritory: 'europe',
    personality: { segment: 'Economy', expansion: 'Aggressive', research: 'Balanced' },
    startingModels: [{
      id: 'vw-citizen', name: 'Citizen', vehicleClass: 'Economy',
      price: 680, cost: 300, introduced: 1900,
      stats: { pwrRatio: 11, safety: 10, power: 15, economy: 20, appeal: 9, durability: 35 }
    }]
  }
]

function buildEraScaledModel(baseModel, year, targetSegment) {
  const yearsElapsed = Math.max(0, year - 1900)
  const decadeProgress = yearsElapsed / 10
  const vehicleClass = targetSegment || baseModel.vehicleClass || 'Utility'

  const baseCostByClass = {
    Economy: 300 + Math.round(decadeProgress * 45),
    Utility: 360 + Math.round(decadeProgress * 55),
    Sport: 470 + Math.round(decadeProgress * 75),
    Luxury: 610 + Math.round(decadeProgress * 95)
  }
  const cost = baseCostByClass[vehicleClass] || 380
  // Competitive pricing: AI prices slightly more aggressively to fight for market share
  const marginByClass = { Economy: 1.55, Utility: 1.65, Sport: 1.9, Luxury: 2.15 }
  const price = Math.round(cost * (marginByClass[vehicleClass] || 1.65))

  return {
    ...baseModel,
    id: `${baseModel.id}-${year}`,
    name: yearsElapsed > 3 ? `${baseModel.name} '${String(year).slice(-2)}` : baseModel.name,
    vehicleClass,
    introduced: year,
    cost,
    price,
    stats: {
      pwrRatio: Math.round((baseModel.stats.pwrRatio || 14) + decadeProgress * (vehicleClass === 'Sport' ? 9.5 : 5.5)),
      safety: Math.min(98, Math.round((baseModel.stats.safety || 12) + decadeProgress * 8)),
      power: Math.round((baseModel.stats.power || 22) + decadeProgress * (vehicleClass === 'Sport' ? 32 : 20)),
      economy: Math.round((baseModel.stats.economy || 14) + decadeProgress * (vehicleClass === 'Economy' ? 4.2 : 2.5)),
      appeal: Math.round((baseModel.stats.appeal || 12) + decadeProgress * (vehicleClass === 'Luxury' ? 14 : 8.5)),
      durability: Math.min(95, Math.round((baseModel.stats.durability || 35) + decadeProgress * 6.5))
    }
  }
}

export const useCompetitorStore = defineStore('competitors', {
  state: () => ({
    competitors: [],
    insolventMonths: {}
  }),

  persist: true,

  actions: {
    initializeRivals() {
      // Pick a balanced set of early rivals so both 1900 segments (Utility & Economy) are contested
      const economyRivals = RIVAL_POOL.filter(r => r.personality.segment === 'Economy')
      const utilityRivals = RIVAL_POOL.filter(r => r.personality.segment === 'Utility')
      const otherRivals = RIVAL_POOL.filter(r => !['Economy', 'Utility'].includes(r.personality.segment))

      const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)]
      const selected = [
        pickRandom(utilityRivals),
        pickRandom(economyRivals),
        pickRandom([...utilityRivals, ...economyRivals, ...otherRivals].filter(Boolean))
      ]
      // Deduplicate if needed
      const uniqueSelected = [...new Map(selected.map(r => [r.id, r])).values()]
      while (uniqueSelected.length < 3) {
        const next = pickRandom(RIVAL_POOL.filter(r => !uniqueSelected.some(u => u.id === r.id)))
        if (next) uniqueSelected.push(next)
      }

      this.competitors = uniqueSelected.map(rival => {
        // Ensure every rival can sell in North America (the starting active market) as well as their home territory
        const initialTerritories = Array.from(new Set(['north-america', rival.homeTerritory]))
        const showrooms = {}
        initialTerritories.forEach(tId => { showrooms[tId] = 1 })

        const initialSegment = ['Utility', 'Economy'].includes(rival.personality.segment)
          ? rival.personality.segment
          : 'Utility'

        return {
          id: rival.id,
          name: rival.name,
          homeTerritory: rival.homeTerritory,
          personality: rival.personality,
          funds: 120000,
          reputation: 52,
          status: 'normal',
          unlockedTech: ['basic-chassis', 'single-cylinder', 'wood-brakes', 'tiller-steering', 'gas-lanterns'],
          unlockedTerritories: initialTerritories,
          regionalShowrooms: showrooms,
          models: [buildEraScaledModel(rival.startingModels[0], 1900, initialSegment)],
          marketShare: 0,
          factories: [{
            id: `ai-f-${rival.id}`,
            location: `${rival.name} HQ`,
            level: 1,
            employees: 110,
            productivity: 1.0,
            territory: 'north-america',
            salary: 50
          }],
          researchInvestment: 400,
          regionalInventory: {},
          lastTurnLedger: { income: 0, productionCosts: 0, shipping: 0, salaries: 0, maintenance: 0, lease: 0, research: 0, net: 0 }
        }
      })
      this.insolventMonths = {}
    },

    spawnNewRival(year = 1925, targetSegment = null) {
      const worldStore = useWorldStore()
      const activeIds = this.competitors.map(c => c.id)
      let available = RIVAL_POOL.filter(r => !activeIds.includes(r.id))
      if (available.length === 0) return null

      // Prefer a rival matching the underserved targetSegment if one was specified
      const matchingSegment = targetSegment ? available.filter(r => r.personality.segment === targetSegment) : []
      const poolToPick = matchingSegment.length > 0 ? matchingSegment : available
      const rival = poolToPick[Math.floor(Math.random() * poolToPick.length)]

      const activeTerritoryIds = worldStore.territories.filter(t => t.active).map(t => t.id)
      const unlockedTerritories = Array.from(new Set(['north-america', rival.homeTerritory, ...activeTerritoryIds]))
      const showrooms = {}
      unlockedTerritories.forEach(tId => { showrooms[tId] = 2 })

      const chosenSegment = targetSegment || (rival.personality.segment === 'Balanced' ? 'Economy' : rival.personality.segment)
      const scaledFunds = Math.round(150000 * worldStore.inflationMultiplier)
      const baseWage = worldStore.territories.find(t => t.id === 'north-america')?.baseWage || 50

      const newRival = {
        id: rival.id,
        name: rival.name,
        homeTerritory: rival.homeTerritory,
        personality: rival.personality,
        funds: scaledFunds,
        reputation: 50,
        status: 'normal',
        unlockedTech: ['all-steel-ladder', 'inline-4', 'hydraulic-brakes', 'shock-absorbers', 'enclosed-cabin'],
        unlockedTerritories,
        regionalShowrooms: showrooms,
        models: [buildEraScaledModel(rival.startingModels[0], year, chosenSegment)],
        marketShare: 0,
        factories: [{
          id: `ai-f-${rival.id}`,
          location: `${rival.name} Works`,
          level: Math.min(4, 1 + Math.floor((year - 1900) / 25)),
          employees: 140 + Math.min(260, Math.floor((year - 1900) * 2.5)),
          productivity: 1.15,
          territory: activeTerritoryIds.includes(rival.homeTerritory) ? rival.homeTerritory : 'north-america',
          salary: baseWage
        }],
        researchInvestment: Math.round(600 * worldStore.inflationMultiplier),
        regionalInventory: {},
        lastTurnLedger: { income: 0, productionCosts: 0, shipping: 0, salaries: 0, maintenance: 0, lease: 0, research: 0, net: 0 }
      }
      this.competitors.push(newRival)
      this.insolventMonths[newRival.id] = 0
      return newRival
    },

    processAITurns(year, techPool, activeSegments = {}) {
      const worldStore = useWorldStore()
      const validSegments = Object.keys(activeSegments)

      this.competitors.forEach(comp => {
        if (comp.status === 'distressed') return

        // Ensure AI models have a valid vehicleClass for the current era
        comp.models.forEach(m => {
          const preferred = comp.personality.segment === 'Balanced' ? 'Economy' : comp.personality.segment
          if (!m.vehicleClass || !validSegments.includes(m.vehicleClass)) {
            m.vehicleClass = validSegments.includes(preferred) ? preferred : (validSegments[0] || 'Utility')
          }
        })

        // Keep AI factory wages aligned with current era base wages
        comp.factories.forEach(f => {
          const terr = worldStore.territories.find(t => t.id === f.territory)
          if (terr) f.salary = terr.baseWage
        })

        // 1. Strategic Research
        const researchChance = comp.personality.research === 'High' ? 0.35 : 0.18
        if (Math.random() < researchChance) {
          const available = techPool.filter(t => !comp.unlockedTech.includes(t.id))
          if (available.length > 0) comp.unlockedTech.push(available[Math.floor(Math.random() * available.length)].id)
        }

        // 2. Model Evolution: Ensure AI covers multiple active segments & updates models every ~3 years
        const latestModel = comp.models[0]
        const modelAge = year - (latestModel?.introduced || 1900)
        if ((modelAge >= 3 && Math.random() < 0.35) || comp.models.length < Math.min(2, validSegments.length) || Math.random() < 0.04) {
          // Pick a segment the rival isn't already covering, or their preferred segment
          const coveredByComp = comp.models.map(m => m.vehicleClass)
          const uncoveredSegment = validSegments.find(s => !coveredByComp.includes(s))
          const preferred = comp.personality.segment === 'Balanced'
            ? validSegments[Math.floor(Math.random() * validSegments.length)]
            : comp.personality.segment
          const targetClass = uncoveredSegment || (validSegments.includes(preferred) ? preferred : (validSegments[0] || 'Utility'))
          const template = RIVAL_POOL.find(r => r.id === comp.id)?.startingModels[0] || latestModel
          const newModel = buildEraScaledModel(template, year, targetClass)
          // Replace existing model of same class or add up to 2 active models per rival
          const existingIdx = comp.models.findIndex(m => m.vehicleClass === targetClass)
          if (existingIdx !== -1) {
            comp.models.splice(existingIdx, 1, newModel)
          } else {
            comp.models.unshift(newModel)
            if (comp.models.length > 2) comp.models.pop()
          }
        }

        // 3. Adaptive Worker & Capacity Management
        const reserveThreshold = 30000 * worldStore.inflationMultiplier
        if (comp.funds > reserveThreshold && comp.lastTurnLedger.net > 0 && Math.random() < 0.3) {
          comp.factories.forEach(f => {
            f.employees = Math.min(1200, Math.floor(f.employees * 1.08))
            if (f.level < 5 && comp.funds > 90000 * worldStore.inflationMultiplier && Math.random() < 0.15) {
              f.level++
              f.productivity = 1.0 + (f.level - 1) * 0.2
            }
          })
        } else if (comp.lastTurnLedger.net < 0 && comp.factories[0].employees > 60) {
          // Trim workforce when losing money so rivals don't spiral into immediate bankruptcy
          comp.factories.forEach(f => { f.employees = Math.max(60, Math.floor(f.employees * 0.9)) })
        }

        // 4. Reputation Recovery / Growth
        if (comp.reputation < 65 && Math.random() < 0.3) {
          comp.reputation = Math.min(85, comp.reputation + 0.5)
        }

        // 5. Global Expansion & Showrooms
        this.processAIEconomics(comp)
      })
    },

    processAIEconomics(comp) {
      const worldStore = useWorldStore()

      // Automatically enter any newly unlocked active territories if the rival has funds
      const activeTerritories = worldStore.territories.filter(t => t.active && !comp.unlockedTerritories.includes(t.id))
      if (activeTerritories.length > 0 && comp.funds > 40000 * worldStore.inflationMultiplier && Math.random() < 0.25) {
        const target = activeTerritories[Math.floor(Math.random() * activeTerritories.length)]
        comp.unlockedTerritories.push(target.id)
        comp.regionalShowrooms[target.id] = 1
      }

      // Showroom Chance (Build presence in active territories)
      if (comp.funds > 35000 * worldStore.inflationMultiplier && Math.random() < 0.12) {
        const activeUnlocked = comp.unlockedTerritories.filter(tId =>
          worldStore.territories.find(t => t.id === tId)?.active
        )
        if (activeUnlocked.length > 0) {
          const tId = activeUnlocked[Math.floor(Math.random() * activeUnlocked.length)]
          const current = comp.regionalShowrooms[tId] || 0
          if (current < 6) {
            const cost = Math.round(10000 * worldStore.inflationMultiplier)
            if (comp.funds >= cost) {
              comp.funds -= cost
              comp.regionalShowrooms[tId] = current + 1
            }
          }
        }
      }
    },

    addToInventory(compId, modelId, territoryId, count) {
      const comp = this.competitors.find(c => c.id === compId)
      if (!comp) return
      if (!comp.regionalInventory) comp.regionalInventory = {}
      if (!comp.regionalInventory[modelId]) comp.regionalInventory[modelId] = {}
      if (!comp.regionalInventory[modelId][territoryId]) comp.regionalInventory[modelId][territoryId] = 0
      comp.regionalInventory[modelId][territoryId] += count
    },

    removeFromInventory(compId, modelId, territoryId, count) {
      const comp = this.competitors.find(c => c.id === compId)
      if (comp && comp.regionalInventory?.[modelId]) {
        const current = comp.regionalInventory[modelId][territoryId] || 0
        comp.regionalInventory[modelId][territoryId] = Math.max(0, current - count)
      }
    },

    processMonthlyFinances(compDataMap) {
      const worldStore = useWorldStore()
      this.competitors.forEach(comp => {
        const data = compDataMap[comp.id] || { income: 0, productionCosts: 0, shipping: 0, salaries: 0, maintenance: 0, lease: 0, research: 0 }

        const totalShowrooms = Object.values(comp.regionalShowrooms).reduce((a, b) => a + b, 0)
        const leaseCost = (data.lease || 0) + (totalShowrooms * 500)

        const totalExpenses = data.productionCosts + (data.shipping || 0) + (data.salaries || 0) + (data.maintenance || 0) + leaseCost + (data.research || 0)
        const net = data.income - totalExpenses
        comp.funds += net

        comp.lastTurnLedger = {
          income: data.income, productionCosts: data.productionCosts, shipping: data.shipping || 0,
          salaries: data.salaries || 0, maintenance: data.maintenance || 0, lease: leaseCost,
          research: data.research || 0, net
        }

        // Restructure / emergency credit line once before becoming distressed, requiring 6 consecutive months of deep insolvency
        const insolvencyFloor = -25000 * worldStore.inflationMultiplier
        if (comp.funds < insolvencyFloor) {
          this.insolventMonths[comp.id] = (this.insolventMonths[comp.id] || 0) + 1
          if (this.insolventMonths[comp.id] === 4 && !comp.restructured) {
            // Emergency bond issuance / restructuring
            comp.funds += Math.round(75000 * worldStore.inflationMultiplier)
            comp.restructured = true
            this.insolventMonths[comp.id] = 0
            comp.status = 'normal'
          } else if (this.insolventMonths[comp.id] >= 6) {
            comp.status = 'distressed'
          }
        } else {
          this.insolventMonths[comp.id] = 0
          comp.status = 'normal'
        }
      })
    },

    updateMarketShare(shares) { this.competitors.forEach(comp => { comp.marketShare = shares[comp.id] || 0 }) },

    removeCompetitor(id) {
      this.competitors = this.competitors.filter(c => c.id !== id)
      delete this.insolventMonths[id]
    }
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCompetitorStore, import.meta.hot))
}

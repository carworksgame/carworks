import { defineStore, acceptHMRUpdate } from 'pinia'
import { useWorldStore } from './world'

export const RIVAL_POOL = [
  {
    id: 'blue-oval',
    name: 'Blue Oval Motors',
    homeTerritory: 'north-america',
    personality: { segment: 'Economy', expansion: 'Aggressive', research: 'Balanced' },
    startingModels: [{ id: 'blue-oval-t', name: 'Model T-Rival', price: 850, cost: 400, stats: { pwrRatio: 13, safety: 5, power: 20, economy: 15 } }]
  },
  {
    id: 'general-auto',
    name: 'General Auto',
    homeTerritory: 'north-america',
    personality: { segment: 'Balanced', expansion: 'Moderate', research: 'High' },
    startingModels: [{ id: 'ga-premier', name: 'Standard Six', price: 1200, cost: 600, stats: { pwrRatio: 18, safety: 10, power: 35, economy: 12 } }]
  },
  {
    id: 'continental',
    name: 'Continental Cars',
    homeTerritory: 'europe',
    personality: { segment: 'Sport', expansion: 'Moderate', research: 'Balanced' },
    startingModels: [{ id: 'cc-lemans', name: 'Le Mans', price: 1500, cost: 700, stats: { pwrRatio: 30, safety: 8, power: 45, economy: 10 } }]
  },
  {
    id: 'bavarian',
    name: 'Bavarian Engineering',
    homeTerritory: 'europe',
    personality: { segment: 'Luxury', expansion: 'Conservative', research: 'High' },
    startingModels: [{ id: 'be-prestige', name: 'Prinz', price: 3000, cost: 1200, stats: { pwrRatio: 22, safety: 20, power: 55, economy: 8 } }]
  },
  {
    id: 'britannia',
    name: 'Britannia Motor Co',
    homeTerritory: 'europe',
    personality: { segment: 'Utility', expansion: 'Aggressive', research: 'Conservative' },
    startingModels: [{ id: 'bmc-rover', name: 'Rover', price: 1100, cost: 500, stats: { pwrRatio: 10, safety: 15, power: 25, economy: 12, durability: 60 } }]
  },
  {
    id: 'nippon',
    name: 'Nippon Steel & Motor',
    homeTerritory: 'east-asia',
    personality: { segment: 'Economy', expansion: 'Aggressive', research: 'High' },
    startingModels: [{ id: 'nsm-compact', name: 'Sunrise', price: 900, cost: 450, stats: { pwrRatio: 14, safety: 10, power: 20, economy: 20 } }]
  },
  {
    id: 'detroit-deluxe',
    name: 'Detroit Deluxe',
    homeTerritory: 'north-america',
    personality: { segment: 'Luxury', expansion: 'Conservative', research: 'Balanced' },
    startingModels: [{ id: 'dd-brougham', name: 'Brougham', price: 4500, cost: 1800, stats: { pwrRatio: 20, safety: 25, power: 65, economy: 6 } }]
  },
  {
    id: 'volks-wagon',
    name: 'Volks-Wagon',
    homeTerritory: 'europe',
    personality: { segment: 'Economy', expansion: 'Aggressive', research: 'Balanced' },
    startingModels: [{ id: 'vw-citizen', name: 'Citizen', price: 750, cost: 350, stats: { pwrRatio: 12, safety: 5, power: 15, economy: 25 } }]
  }
]

export const useCompetitorStore = defineStore('competitors', {
  state: () => ({
    competitors: [],
    insolventMonths: {} 
  }),

  persist: true,

  actions: {
    initializeRivals() {
      const shuffled = [...RIVAL_POOL].sort(() => 0.5 - Math.random())
      const selected = shuffled.slice(0, 3)

      this.competitors = selected.map(rival => ({
        id: rival.id,
        name: rival.name,
        homeTerritory: rival.homeTerritory,
        personality: rival.personality,
        funds: 100000,
        reputation: 50,
        status: 'normal',
        unlockedTech: ['basic-chassis', 'single-cylinder', 'wood-brakes', 'tiller-steering', 'gas-lanterns'],
        unlockedTerritories: [rival.homeTerritory],
        regionalShowrooms: { [rival.homeTerritory]: 1 },
        models: JSON.parse(JSON.stringify(rival.startingModels)),
        marketShare: 0,
        factories: [{ 
          id: `ai-f-${rival.id}`, location: `${rival.name} HQ`, 
          level: 1, employees: 150, productivity: 1.0, 
          territory: rival.homeTerritory, salary: 50 
        }],
        researchInvestment: 500,
        regionalInventory: {},
        lastTurnLedger: { income: 0, productionCosts: 0, shipping: 0, salaries: 0, maintenance: 0, lease: 0, research: 0, net: 0 }
      }))
      this.insolventMonths = {}
    },

    spawnNewRival() {
      const activeIds = this.competitors.map(c => c.id)
      const available = RIVAL_POOL.filter(r => !activeIds.includes(r.id))
      if (available.length > 0) {
        const rival = available[Math.floor(Math.random() * available.length)]
        const newRival = {
          id: rival.id,
          name: rival.name,
          homeTerritory: rival.homeTerritory,
          personality: rival.personality,
          funds: 150000,
          reputation: 40,
          status: 'normal',
          unlockedTech: ['improved-v8', 'all-steel-ladder', 'hydraulic-brakes', 'shock-absorbers', 'enclosed-cabin'],
          unlockedTerritories: [rival.homeTerritory],
          regionalShowrooms: { [rival.homeTerritory]: 2 },
          models: JSON.parse(JSON.stringify(rival.startingModels)),
          marketShare: 0,
          factories: [{ id: `ai-f-${rival.id}`, location: `${rival.name} Base`, level: 2, employees: 200, productivity: 1.2, territory: rival.homeTerritory, salary: 150 }],
          researchInvestment: 1000,
          regionalInventory: {},
          lastTurnLedger: { income: 0, productionCosts: 0, shipping: 0, salaries: 0, maintenance: 0, lease: 0, research: 0, net: 0 }
        }
        this.competitors.push(newRival)
        return newRival
      }
      return null
    },

    processAITurns(year, techPool) {
      this.competitors.forEach(comp => {
        if (comp.status === 'distressed') return

        // 1. Strategic Research
        const researchChance = comp.personality.research === 'High' ? 0.3 : 0.1
        if (Math.random() < researchChance) {
          const available = techPool.filter(t => !comp.unlockedTech.includes(t.id))
          if (available.length > 0) comp.unlockedTech.push(available[Math.floor(Math.random() * available.length)].id)
        }

        // 2. Model Evolution
        if (Math.random() > 0.96) {
           const baseModel = comp.models[0]
           const newModel = {
             ...baseModel, id: `${baseModel.id}-${Date.now()}`, name: `${baseModel.name} ${year}`,
             price: Math.floor(baseModel.price * 1.08), cost: Math.floor(baseModel.cost * 1.04),
             stats: { ...baseModel.stats, power: baseModel.stats.power + 5, economy: baseModel.stats.economy + 1 }
           }
           comp.models.unshift(newModel)
           if (comp.models.length > 3) comp.models.pop()
        }

        // 3. Worker Management
        if (comp.funds > 20000 && Math.random() > 0.8) {
          comp.factories.forEach(f => { f.employees = Math.min(1000, Math.floor(f.employees * 1.05)) })
        }

        // 4. Global Expansion & Showrooms
        this.processAIEconomics(comp)
      })
    },

    processAIEconomics(comp) {
      const worldStore = useWorldStore()
      
      // Expansion Chance
      if (comp.funds > 100000 && Math.random() > 0.95) {
        const available = worldStore.territories.filter(t => !comp.unlockedTerritories.includes(t.id))
        if (available.length > 0) {
          const target = available[Math.floor(Math.random() * available.length)]
          if (comp.funds >= target.unlockCost) {
            comp.funds -= target.unlockCost
            comp.unlockedTerritories.push(target.id)
            comp.regionalShowrooms[target.id] = 1
          }
        }
      }

      // Showroom Chance (Build presence in existing territories)
      if (comp.funds > 30000 && Math.random() > 0.9) {
        const tId = comp.unlockedTerritories[Math.floor(Math.random() * comp.unlockedTerritories.length)]
        const current = comp.regionalShowrooms[tId] || 0
        if (current < 5) {
          const cost = Math.round(10000 * worldStore.inflationMultiplier)
          if (comp.funds >= cost) {
            comp.funds -= cost
            comp.regionalShowrooms[tId] = current + 1
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
      this.competitors.forEach(comp => {
        const data = compDataMap[comp.id] || { income: 0, productionCosts: 0, shipping: 0, salaries: 0, maintenance: 0, lease: 0, research: 0 }
        
        // Showroom lease costs for AI
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

        if (comp.funds < 0) {
          this.insolventMonths[comp.id] = (this.insolventMonths[comp.id] || 0) + 1
          if (this.insolventMonths[comp.id] >= 3) comp.status = 'distressed'
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

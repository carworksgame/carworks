import { defineStore, acceptHMRUpdate } from 'pinia'

export const useCompetitorStore = defineStore('competitors', {
  state: () => ({
    competitors: [
      {
        id: 'ford-rival',
        name: 'Blue Oval Motors',
        homeTerritory: 'north-america',
        funds: 100000,
        reputation: 50,
        unlockedTech: ['basic-chassis', 'crank-start', 'tiller-steering'],
        models: [
          { id: 'rival-model-t', name: 'Model T-Rival', cost: 650, price: 1200, stats: { pwrRatio: 2, safety: 10, power: 10, economy: 15 } }
        ],
        marketShare: 0,
        factories: [
          { id: 'ai-f1', location: 'Detroit-Rival', level: 1, employees: 200, productivity: 1.0, territory: 'north-america', salary: 50 }
        ],
        researchInvestment: 500,
        regionalInventory: {},
        lastTurnLedger: { income: 0, productionCosts: 0, shipping: 0, salaries: 0, maintenance: 0, lease: 0, research: 0, net: 0 }
      },
      {
        id: 'gm-rival',
        name: 'General Auto',
        homeTerritory: 'north-america',
        funds: 150000,
        reputation: 40,
        unlockedTech: ['basic-chassis', 'crank-start', 'tiller-steering'],
        models: [
          { id: 'rival-luxury', name: 'Premier', cost: 900, price: 2500, stats: { pwrRatio: 3, safety: 15, power: 25, economy: 10 } }
        ],
        marketShare: 0,
        factories: [
          { id: 'ai-f2', location: 'Lansing-Rival', level: 1, employees: 150, productivity: 1.0, territory: 'north-america', salary: 50 }
        ],
        researchInvestment: 800,
        regionalInventory: {},
        lastTurnLedger: { income: 0, productionCosts: 0, shipping: 0, salaries: 0, maintenance: 0, lease: 0, research: 0, net: 0 }
      },
      {
        id: 'euro-rival',
        name: 'Continental Cars',
        homeTerritory: 'europe',
        funds: 80000,
        reputation: 30,
        unlockedTech: ['basic-chassis', 'crank-start', 'tiller-steering'],
        models: [
          { id: 'rival-euro', name: 'Le Mans', cost: 500, price: 1100, stats: { pwrRatio: 4, safety: 5, power: 15, economy: 18 } }
        ],
        marketShare: 0,
        factories: [
          { id: 'ai-f3', location: 'Paris-Rival', level: 1, employees: 120, productivity: 1.0, territory: 'europe', salary: 45 }
        ],
        researchInvestment: 400,
        regionalInventory: {},
        lastTurnLedger: { income: 0, productionCosts: 0, shipping: 0, salaries: 0, maintenance: 0, lease: 0, research: 0, net: 0 }
      }
    ]
  }),

  persist: true,

  actions: {
    processAITurns(year, techPool) {
      this.competitors.forEach(comp => {
        // 1. Simple AI Research
        if (Math.random() > 0.9) {
          const available = techPool.filter(t => !comp.unlockedTech.includes(t.id))
          if (available.length > 0) {
            const newTech = available[Math.floor(Math.random() * available.length)]
            comp.unlockedTech.push(newTech.id)
          }
        }

        // 2. Simple AI Design
        if (Math.random() > 0.95) {
           const baseModel = comp.models[0]
           const newModel = {
             ...baseModel,
             id: `${baseModel.id}-${Date.now()}`,
             name: `${baseModel.name} MkII`,
             price: Math.floor(baseModel.price * 1.1),
             cost: Math.floor(baseModel.cost * 1.05),
             stats: { 
               pwrRatio: baseModel.stats.pwrRatio + 0.5,
               safety: baseModel.stats.safety + 2,
               power: baseModel.stats.power + 5,
               economy: baseModel.stats.economy + 1
             }
           }
           comp.models.unshift(newModel)
           if (comp.models.length > 3) comp.models.pop()
           
           // Gradually hire more workers
           if (comp.factories) {
             comp.factories.forEach(f => {
               f.employees = Math.floor(f.employees * 1.1)
             })
           }
        }
      })
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
      if (comp && comp.regionalInventory && comp.regionalInventory[modelId]) {
        const current = comp.regionalInventory[modelId][territoryId] || 0
        comp.regionalInventory[modelId][territoryId] = Math.max(0, current - count)
      }
    },

    processMonthlyFinances(compDataMap) {
      this.competitors.forEach(comp => {
        const data = compDataMap[comp.id] || { income: 0, productionCosts: 0, shipping: 0, salaries: 0, maintenance: 0, lease: 0, research: 0 }
        
        const totalExpenses = 
          data.productionCosts + 
          (data.shipping || 0) + 
          (data.salaries || 0) + 
          (data.maintenance || 0) + 
          (data.lease || 0) + 
          (data.research || 0)

        const net = data.income - totalExpenses
        comp.funds += net
        
        comp.lastTurnLedger = {
          income: data.income,
          productionCosts: data.productionCosts,
          shipping: data.shipping || 0,
          salaries: data.salaries || 0,
          maintenance: data.maintenance || 0,
          lease: data.lease || 0,
          research: data.research || 0,
          net
        }
      })
    },

    updateMarketShare(shares) {
      this.competitors.forEach(comp => {
        comp.marketShare = shares[comp.id] || 0
      })
    }
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCompetitorStore, import.meta.hot))
}

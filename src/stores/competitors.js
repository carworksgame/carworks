import { defineStore, acceptHMRUpdate } from 'pinia'

export const useCompetitorStore = defineStore('competitors', {
  state: () => ({
    competitors: [
      {
        id: 'ford-rival',
        name: 'Blue Oval Motors',
        funds: 100000,
        reputation: 50,
        unlockedTech: ['basic-chassis', 'crank-start', 'tiller-steering'],
        models: [
          { id: 'rival-model-t', name: 'Model T-Rival', cost: 400, price: 850, stats: { pwrRatio: 2, safety: 10, power: 10, economy: 15 } }
        ],
        marketShare: 0,
        productionLimit: 500 // units per month
      },
      {
        id: 'gm-rival',
        name: 'General Auto',
        funds: 150000,
        reputation: 40,
        unlockedTech: ['basic-chassis', 'crank-start', 'tiller-steering'],
        models: [
          { id: 'rival-luxury', name: 'Premier', cost: 800, price: 2000, stats: { pwrRatio: 3, safety: 15, power: 25, economy: 10 } }
        ],
        marketShare: 0,
        productionLimit: 300
      },
      {
        id: 'euro-rival',
        name: 'Continental Cars',
        funds: 80000,
        reputation: 30,
        unlockedTech: ['basic-chassis', 'crank-start', 'tiller-steering'],
        models: [
          { id: 'rival-euro', name: 'Le Mans', cost: 300, price: 700, stats: { pwrRatio: 4, safety: 5, power: 15, economy: 18 } }
        ],
        marketShare: 0,
        productionLimit: 200
      }
    ]
  }),

  persist: true,

  actions: {
    processAITurns(year, techPool) {
      this.competitors.forEach(comp => {
        // 1. Simple AI Research: 10% chance to unlock a random available tech
        if (Math.random() > 0.9) {
          const available = techPool.filter(t => !comp.unlockedTech.includes(t.id))
          if (available.length > 0) {
            const newTech = available[Math.floor(Math.random() * available.length)]
            comp.unlockedTech.push(newTech.id)
            console.log(`${comp.name} researched ${newTech.name}`)
          }
        }

        // 2. Simple AI Design: Every ~24 turns (2 years), release a "New" version
        if (Math.random() > 0.95) {
           const baseModel = comp.models[0]
           const newModel = {
             ...baseModel,
             id: `${baseModel.id}-${Date.now()}`,
             name: `${baseModel.name} MkII`,
             price: Math.floor(baseModel.price * 1.1),
             stats: { 
               pwrRatio: baseModel.stats.pwrRatio + 0.5,
               safety: baseModel.stats.safety + 2,
               power: baseModel.stats.power + 5,
               economy: baseModel.stats.economy + 1
             }
           }
           comp.models.unshift(newModel)
           if (comp.models.length > 3) comp.models.pop() // Keep fresh
           
           // Gradually increase production capacity
           comp.productionLimit = Math.floor(comp.productionLimit * 1.2)
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

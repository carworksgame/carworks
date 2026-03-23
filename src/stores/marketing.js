import { defineStore, acceptHMRUpdate } from 'pinia'
import { useWorldStore } from './world'

export const useMarketingStore = defineStore('marketing', {
  state: () => ({
    // Regional Brand Awareness: territoryId -> score (0-100)
    regionalAwareness: {
      'north-america': 10,
      'europe': 0,
      'south-america': 0,
      'asia': 0
    },
    // Regional Campaigns: territoryId -> { modelId -> { mediaTypeId -> amount } }
    activeRegionalCampaigns: {}, 
    
    mediaTypes: [
      { id: 'billboard', name: 'Billboards', efficiency: 1.2, minYear: 1908 },
      { id: 'newspaper', name: 'Newspaper Ads', efficiency: 1.5, minYear: 1908 },
      { id: 'radio', name: 'Radio Spots', efficiency: 2.0, minYear: 1920 },
      { id: 'magazine', name: 'Glossy Magazines', efficiency: 2.5, minYear: 1945 },
      { id: 'television', name: 'TV Commercials', efficiency: 4.5, minYear: 1950 },
    ]
  }),

  persist: true,

  getters: {
    totalMonthlyMarketingCost: (state) => {
      let total = 0
      Object.values(state.activeRegionalCampaigns).forEach(territoryModels => {
        Object.values(territoryModels).forEach(modelBudgets => {
          Object.values(modelBudgets).forEach(amount => {
            total += (amount || 0)
          })
        })
      })
      return total
    },

    getTerritoryMarketingCost: (state) => (territoryId) => {
      const territoryModels = state.activeRegionalCampaigns[territoryId] || {}
      let total = 0
      Object.values(territoryModels).forEach(modelBudgets => {
        Object.values(modelBudgets).forEach(amount => {
          total += (amount || 0)
        })
      })
      return total
    },

    getAwareness: (state) => (territoryId) => {
      return state.regionalAwareness[territoryId] || 0
    },

    getBoostForModel: (state) => (modelId, territoryId) => {
      const modelBudgets = state.activeRegionalCampaigns[territoryId]?.[modelId] || {}
      const worldStore = useWorldStore()
      
      // Scaling factor: Advertising is more expensive/needs more spend as time passes
      // In 1908, $500 is a lot. In 2008, it's nothing.
      const eraScale = 1000 * worldStore.inflationMultiplier
      
      let aggregateBoost = 0
      Object.keys(modelBudgets).forEach(mediaId => {
        const amount = modelBudgets[mediaId] || 0
        if (amount > 0) {
          const media = state.mediaTypes.find(m => m.id === mediaId)
          if (media) {
            // Formula: (Amount / EraScale) * Efficiency
            // Cap individual channel boost to prevent infinite scaling
            const channelBoost = Math.min(2.0, (amount / eraScale) * media.efficiency)
            aggregateBoost += channelBoost
          }
        }
      })

      return 1.0 + aggregateBoost
    }
  },

  actions: {
    setBudget(territoryId, modelId, mediaTypeId, amount) {
      if (!this.activeRegionalCampaigns[territoryId]) {
        this.activeRegionalCampaigns[territoryId] = {}
      }
      if (!this.activeRegionalCampaigns[territoryId][modelId]) {
        this.activeRegionalCampaigns[territoryId][modelId] = {}
      }

      if (amount <= 0) {
        delete this.activeRegionalCampaigns[territoryId][modelId][mediaTypeId]
      } else {
        this.activeRegionalCampaigns[territoryId][modelId][mediaTypeId] = amount
      }
    },

    processMonthlyBrandGrowth() {
      const worldStore = useWorldStore()
      
      worldStore.territories.forEach(territory => {
        const cost = this.getTerritoryMarketingCost(territory.id)
        const currentAwareness = this.regionalAwareness[territory.id] || 0
        const eraScale = 5000 * worldStore.inflationMultiplier

        if (cost > 0) {
          // Awareness grows based on spend relative to the era
          const growth = (cost / eraScale)
          this.regionalAwareness[territory.id] = Math.min(100, currentAwareness + growth)
        } else {
          this.regionalAwareness[territory.id] = Math.max(0, currentAwareness - 0.1)
        }
      })
    }
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMarketingStore, import.meta.hot))
}

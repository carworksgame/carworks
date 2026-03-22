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
    // Regional Campaigns: territoryId -> { modelId -> mediaObject }
    activeRegionalCampaigns: {}, 
    
    mediaTypes: [
      { id: 'billboard', name: 'Billboards', cost: 200, boost: 1.05, minYear: 1908 },
      { id: 'newspaper', name: 'Newspaper Ads', cost: 500, boost: 1.15, minYear: 1908 },
      { id: 'radio', name: 'Radio Spots', cost: 1500, boost: 1.4, minYear: 1920 },
      { id: 'magazine', name: 'Glossy Magazines', cost: 3000, boost: 1.8, minYear: 1945 },
      { id: 'television', name: 'TV Commercials', cost: 10000, boost: 3.5, minYear: 1950 },
    ]
  }),

  persist: true,

  getters: {
    totalMonthlyMarketingCost: (state) => {
      let total = 0
      Object.values(state.activeRegionalCampaigns).forEach(territoryCampaigns => {
        Object.values(territoryCampaigns).forEach(campaign => {
          total += (campaign.cost || 0)
        })
      })
      return total
    },

    getTerritoryMarketingCost: (state) => (territoryId) => {
      const territoryCampaigns = state.activeRegionalCampaigns[territoryId] || {}
      return Object.values(territoryCampaigns).reduce((acc, c) => acc + (c.cost || 0), 0)
    },

    getAwareness: (state) => (territoryId) => {
      return state.regionalAwareness[territoryId] || 0
    },

    getBoostForModel: (state) => (modelId, territoryId) => {
      return state.activeRegionalCampaigns[territoryId]?.[modelId]?.boost || 1.0
    }
  },

  actions: {
    setCampaign(territoryId, modelId, mediaTypeId) {
      if (!this.activeRegionalCampaigns[territoryId]) {
        this.activeRegionalCampaigns[territoryId] = {}
      }

      if (!mediaTypeId) {
        delete this.activeRegionalCampaigns[territoryId][modelId]
        return
      }

      const media = this.mediaTypes.find(m => m.id === mediaTypeId)
      if (media) {
        this.activeRegionalCampaigns[territoryId][modelId] = { ...media }
      }
    },

    processMonthlyBrandGrowth() {
      const worldStore = useWorldStore()
      
      worldStore.territories.forEach(territory => {
        const cost = this.getTerritoryMarketingCost(territory.id)
        const currentAwareness = this.regionalAwareness[territory.id] || 0

        if (cost > 0) {
          // Growth: Awareness rises based on regional spend
          // $5000 spend gives ~1% growth
          const growth = cost / 5000
          this.regionalAwareness[territory.id] = Math.min(100, currentAwareness + growth)
        } else {
          // Decay: Awareness drops by 0.1% if no marketing is active in the region
          this.regionalAwareness[territory.id] = Math.max(0, currentAwareness - 0.1)
        }
      })
    }
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMarketingStore, import.meta.hot))
}

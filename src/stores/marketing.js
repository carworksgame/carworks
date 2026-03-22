import { defineStore, acceptHMRUpdate } from 'pinia'

export const useMarketingStore = defineStore('marketing', {
  state: () => ({
    brandAwareness: 5, // 0-100 scale
    activeCampaigns: {}, // { modelId: { type: 'billboard', monthlyCost: 500, boost: 1.2 } }
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
      return Object.values(state.activeCampaigns).reduce((acc, c) => acc + c.cost, 0)
    },
    getBoostForModel: (state) => (modelId) => {
      return state.activeCampaigns[modelId]?.boost || 1.0
    }
  },

  actions: {
    setCampaign(modelId, mediaTypeId) {
      if (!mediaTypeId) {
        delete this.activeCampaigns[modelId]
        return
      }
      const media = this.mediaTypes.find(m => m.id === mediaTypeId)
      if (media) {
        this.activeCampaigns[modelId] = { ...media }
      }
    },
    processMonthlyBrandGrowth() {
      // Brand awareness grows slightly if marketing is active, or decays if not
      const cost = this.totalMonthlyMarketingCost
      if (cost > 0) {
        this.brandAwareness = Math.min(100, this.brandAwareness + (cost / 5000))
      } else {
        this.brandAwareness = Math.max(5, this.brandAwareness - 0.1)
      }
    }
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMarketingStore, import.meta.hot))
}

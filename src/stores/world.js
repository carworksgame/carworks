import { defineStore, acceptHMRUpdate } from 'pinia'

export const useWorldStore = defineStore('world', {
  state: () => ({
    economicClimate: 1.0,
    globalDemandMultiplier: 1.0,
    activeEvents: [],
    inflationMultiplier: 1.0, 
    territories: [
      { id: 'north-america', name: 'North America', population: 92000000, wealth: 1.2, active: true, baseWage: 50, talentPool: 500 },
      { id: 'europe', name: 'Europe', population: 400000000, wealth: 1.0, active: false, unlockCost: 50000, baseWage: 45, talentPool: 500 },
      { id: 'south-america', name: 'South America', population: 40000000, wealth: 0.5, active: false, unlockCost: 30000, baseWage: 20, talentPool: 500 },
      { id: 'east-asia', name: 'East Asia', population: 450000000, wealth: 0.4, active: false, unlockCost: 60000, baseWage: 15, talentPool: 500 },
      { id: 'south-asia', name: 'South & SE Asia', population: 300000000, wealth: 0.3, active: false, unlockCost: 45000, baseWage: 12, talentPool: 500 },
      { id: 'middle-east', name: 'Middle East', population: 30000000, wealth: 0.6, active: false, unlockCost: 40000, baseWage: 25, talentPool: 500 },
      { id: 'oceania', name: 'Oceania', population: 6000000, wealth: 1.1, active: false, unlockCost: 35000, baseWage: 48, talentPool: 500 },
      { id: 'russia-bloc', name: 'Russia / Soviet Bloc', population: 150000000, wealth: 0.7, active: false, unlockCost: 55000, baseWage: 35, talentPool: 500 },
      { id: 'africa', name: 'Africa', population: 120000000, wealth: 0.3, active: false, unlockCost: 40000, baseWage: 10, talentPool: 500 },
      { id: 'central-america', name: 'Central America', population: 15000000, wealth: 0.4, active: false, unlockCost: 25000, baseWage: 18, talentPool: 500 },
    ],
    // Shipping matrix: cost per unit between regions
    shippingRates: {
      'north-america': { 'north-america': 0, 'europe': 150, 'south-america': 100, 'east-asia': 250, 'south-asia': 280, 'middle-east': 220, 'oceania': 300, 'russia-bloc': 200, 'africa': 240, 'central-america': 50 },
      'europe': { 'north-america': 150, 'europe': 0, 'south-america': 180, 'east-asia': 220, 'south-asia': 200, 'middle-east': 120, 'oceania': 320, 'russia-bloc': 80, 'africa': 100, 'central-america': 160 },
      'south-america': { 'north-america': 100, 'europe': 180, 'south-america': 0, 'east-asia': 300, 'south-asia': 320, 'middle-east': 250, 'oceania': 280, 'russia-bloc': 240, 'africa': 150, 'central-america': 80 },
      'east-asia': { 'north-america': 250, 'europe': 220, 'south-america': 300, 'east-asia': 0, 'south-asia': 100, 'middle-east': 180, 'oceania': 150, 'russia-bloc': 120, 'africa': 260, 'central-america': 280 },
      'south-asia': { 'north-america': 280, 'europe': 200, 'south-america': 320, 'east-asia': 100, 'south-asia': 0, 'middle-east': 140, 'oceania': 180, 'russia-bloc': 180, 'africa': 180, 'central-america': 300 },
      'middle-east': { 'north-america': 220, 'europe': 120, 'south-america': 250, 'east-asia': 180, 'south-asia': 140, 'middle-east': 0, 'oceania': 260, 'russia-bloc': 100, 'africa': 80, 'central-america': 240 },
      'oceania': { 'north-america': 300, 'europe': 320, 'south-america': 280, 'east-asia': 150, 'south-asia': 180, 'middle-east': 260, 'oceania': 0, 'russia-bloc': 280, 'africa': 280, 'central-america': 280 },
      'russia-bloc': { 'north-america': 200, 'europe': 80, 'south-america': 240, 'east-asia': 120, 'south-asia': 180, 'middle-east': 100, 'oceania': 280, 'russia-bloc': 0, 'africa': 180, 'central-america': 220 },
      'africa': { 'north-america': 240, 'europe': 100, 'south-america': 150, 'east-asia': 260, 'south-asia': 180, 'middle-east': 80, 'oceania': 280, 'russia-bloc': 180, 'africa': 0, 'central-america': 200 },
      'central-america': { 'north-america': 50, 'europe': 160, 'south-america': 80, 'east-asia': 280, 'south-asia': 300, 'middle-east': 240, 'oceania': 280, 'russia-bloc': 220, 'africa': 200, 'central-america': 0 },
    },
    upcomingExpos: [], 
    participatingModelId: null,

    historicalEvents: [
      { year: 1914, month: 6, title: 'WWI Begins', type: 'crisis', climate: 0.7 },
      { year: 1918, month: 10, title: 'WWI Ends', type: 'recovery', climate: 1.1 },
      { year: 1929, month: 9, title: 'Great Depression', type: 'crisis', climate: 0.3 },
      { year: 1939, month: 8, title: 'WWII Begins', type: 'crisis', climate: 0.5 },
      { year: 1945, month: 8, title: 'WWII Ends', type: 'recovery', climate: 1.3 },
      { year: 1950, month: 1, title: 'Post-War Boom', type: 'boom', climate: 1.4 },
      { year: 1955, month: 5, title: 'Interstate Act', type: 'growth', climate: 1.2 },
      { year: 1965, month: 10, title: 'The Muscle Car Era', type: 'boom', climate: 1.1 },
      { year: 1973, month: 9, title: 'Oil Crisis', type: 'crisis', climate: 0.6 },
      { year: 1979, month: 1, title: 'Second Oil Crisis', type: 'crisis', climate: 0.7 },
      { year: 1982, month: 6, title: 'Japanese Expansion', type: 'competition', climate: 0.9 },
      { year: 1990, month: 3, title: 'Gulf War', type: 'crisis', climate: 0.8 },
      { year: 1995, month: 8, title: 'Dot-Com Boom', type: 'boom', climate: 1.3 },
      { year: 2001, month: 8, title: 'Dot-Com Crash', type: 'crisis', climate: 0.8 },
      { year: 2008, month: 0, title: 'Global Financial Crisis', type: 'crisis', climate: 0.4 },
    ]
  }),

  persist: true,

  actions: {
    updateWorldState(currentYear, currentMonth) {
      const event = this.historicalEvents.find(e => e.year === currentYear && e.month === currentMonth)
      if (event) {
        this.economicClimate = event.climate
        this.activeEvents.push(event)
        if (this.activeEvents.length > 5) this.activeEvents.shift()
      }
      
      if (currentMonth === 0) {
        this.territories.forEach(t => {
          t.baseWage = Math.round(t.baseWage * 1.04)
        })
        this.inflationMultiplier *= 1.035
      }

      this.globalDemandMultiplier = this.economicClimate * (0.95 + Math.random() * 0.1)
      return event
    },
    
    unlockTerritory(id) {
      const territory = this.territories.find(t => t.id === id)
      if (territory) {
        territory.active = true
      }
    },

    getShippingCost(fromId, toId) {
      if (fromId === toId) return 0
      return this.shippingRates[fromId]?.[toId] ?? 500
    },

    scheduleExpo(name, territoryId, year, month) {
      this.upcomingExpos.push({ name, territoryId, year, month })
    },

    participateInExpo(modelId) {
      this.participatingModelId = modelId
    },

    clearExpos() {
      this.upcomingExpos = []
      this.participatingModelId = null
    }
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useWorldStore, import.meta.hot))
}

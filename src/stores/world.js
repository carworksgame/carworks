import { defineStore, acceptHMRUpdate } from 'pinia'

export const useWorldStore = defineStore('world', {
  state: () => ({
    economicClimate: 1.0,
    globalDemandMultiplier: 1.0,
    activeEvents: [],
    territories: [
      { id: 'north-america', name: 'North America', population: 92000000, wealth: 1.2, active: true, baseWage: 1500 },
      { id: 'europe', name: 'Europe', population: 400000000, wealth: 1.0, active: false, unlockCost: 50000, baseWage: 1400 },
      { id: 'south-america', name: 'South America', population: 40000000, wealth: 0.5, active: false, unlockCost: 30000, baseWage: 700 },
      { id: 'asia', name: 'Asia', population: 900000000, wealth: 0.3, active: false, unlockCost: 75000, baseWage: 600 },
    ],
    // Shipping cost per unit between regions
    shippingRates: {
      'north-america': { 'north-america': 0, 'europe': 150, 'south-america': 100, 'asia': 250 },
      'europe': { 'north-america': 150, 'europe': 0, 'south-america': 180, 'asia': 120 },
      'south-america': { 'north-america': 100, 'europe': 180, 'south-america': 0, 'asia': 300 },
      'asia': { 'north-america': 250, 'europe': 120, 'south-america': 300, 'asia': 0 }
    },
    historicalEvents: [
      { year: 1914, month: 6, title: 'WWI Begins', type: 'crisis', climate: 0.7 },
      { year: 1918, month: 10, title: 'WWI Ends', type: 'recovery', climate: 1.1 },
      { year: 1929, month: 9, title: 'Great Depression', type: 'crisis', climate: 0.3 },
      { year: 1939, month: 8, title: 'WWII Begins', type: 'crisis', climate: 0.5 },
      { year: 1945, month: 8, title: 'WWII Ends', type: 'recovery', climate: 1.3 },
      
      // POST-WAR ERA
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
      
      // Annual inflation: roughly 3-5% increase in base wages every year
      if (currentMonth === 0) { // Every January
        this.territories.forEach(t => {
          t.baseWage = Math.round(t.baseWage * 1.04)
        })
      }

      // Random slight fluctuations in demand
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
      return this.shippingRates[fromId]?.[toId] ?? 500
    }
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useWorldStore, import.meta.hot))
}

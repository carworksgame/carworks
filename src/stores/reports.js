import { defineStore, acceptHMRUpdate } from 'pinia'

export const useReportsStore = defineStore('reports', {
  state: () => ({
    history: [], // Stores last 6 months of global data: { turn, date, companies: { [id]: { profit, production, sales, name } } }
    
    // Last turn detailed data for the player
    lastTurn: {
      turn: 0,
      date: '',
      incomeByModel: {}, // { modelName: amount }
      incomeByRegion: {}, // { regionName: amount }
      modelReport: {}, // { modelName: { [regionName]: { built: 0, sold: 0, stock: 0 } } }
      modelComparison: {} // { regionName: { segmentName: [ { owner, model, price, desirability } ] } }
    }
  }),

  persist: true,

  actions: {
    addHistoryRecord(record) {
      this.history.push(record)
      if (this.history.length > 6) {
        this.history.shift() // Keep only last 6 turns
      }
    },
    setLastTurnData(data) {
      this.lastTurn = data
    },
    clearReports() {
        this.history = []
        this.lastTurn = {
            turn: 0,
            date: '',
            incomeByModel: {},
            incomeByRegion: {},
            modelReport: {},
            modelComparison: {}
        }
    }
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useReportsStore, import.meta.hot))
}

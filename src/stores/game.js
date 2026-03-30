import { defineStore, acceptHMRUpdate } from 'pinia'

export const useGameStore = defineStore('game', {
  state: () => ({
    year: 1908,
    month: 0, // 0 = January
    turnCount: 1,
    isPaused: true,
    lastNewsEvent: null,
    newsLog: [],
    currentSlotId: null
  }),

  persist: true,

  getters: {
    dateString: (state) => {
      const date = new Date(state.year, state.month)
      return date.toLocaleString('default', { month: 'long', year: 'numeric' })
    },
    newsImage: (state) => {
      if (state.year < 1920) return 'newspaper.png'
      if (state.year < 1950) return 'radio.png'
      if (state.year < 1980) return 'TV1950.png'
      if (state.year < 1990) return 'TV1980.png'
      return 'TV1990.png'
    }
  },

  actions: {
    setSlot(id) {
      this.currentSlotId = id
    },
    nextTurn() {
      this.month++
      if (this.month > 11) {
        this.month = 0
        this.year++
      }
      this.turnCount++
    },
    setNews(event) {
      this.lastNewsEvent = event
      this.newsLog.unshift({ ...event, date: this.dateString })
    },
    triggerNews(title = 'TEST HEADLINE', description = 'This is a test of the emergency broadcast system.', type = 'info') {
      this.setNews({ title, description, type })
    },
    resetGame() {
      this.year = 1908
      this.month = 0
      this.turnCount = 1
    }
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useGameStore, import.meta.hot))
}

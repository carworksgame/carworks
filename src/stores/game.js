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

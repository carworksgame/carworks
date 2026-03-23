import { defineStore, acceptHMRUpdate } from 'pinia'

export const useDebugStore = defineStore('debug', {
  state: () => ({
    debugMode: false,
    lastTurnSnapshot: null
  }),

  persist: true,

  actions: {
    setDebugMode(val) {
      this.debugMode = val
    },
    setSnapshot(data) {
      this.lastTurnSnapshot = data
    }
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDebugStore, import.meta.hot))
}

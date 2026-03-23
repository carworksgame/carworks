import { defineStore, acceptHMRUpdate } from 'pinia'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    sfxEnabled: true,
    musicEnabled: true,
    masterVolume: 0.7
  }),

  persist: true,

  actions: {
    setSFX(enabled) {
      this.sfxEnabled = enabled
    },
    setMusic(enabled) {
      this.musicEnabled = enabled
    },
    setVolume(vol) {
      this.masterVolume = Math.min(1, Math.max(0, vol))
    }
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSettingsStore, import.meta.hot))
}

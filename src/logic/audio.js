import { useSettingsStore } from '../stores/settings'
import buttonClickUrl from '../assets/sounds/sony-vintage-casette-player-button-snap.wav'

class AudioService {
  constructor() {
    this.sounds = {}
    this.loadSound('buttonClick', buttonClickUrl)
  }

  loadSound(id, url) {
    const audio = new Audio(url)
    this.sounds[id] = audio
  }

  playSFX(id) {
    const settingsStore = useSettingsStore()
    if (!settingsStore.sfxEnabled) return

    const sound = this.sounds[id]
    if (sound) {
      // Create a clone to allow rapid multiple plays
      const clone = sound.cloneNode()
      clone.volume = settingsStore.masterVolume
      clone.play().catch(e => console.warn('[Audio] Playback blocked:', e))
    }
  }

  playClick() {
    this.playSFX('buttonClick')
  }
}

export const audioService = new AudioService()

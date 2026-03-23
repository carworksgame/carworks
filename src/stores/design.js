import { defineStore, acceptHMRUpdate } from 'pinia'
import { usePlayerStore } from './player'
import { useGameStore } from './game'
import { useWorldStore } from './world'

export const VEHICLE_CLASSES = {
  ECONOMY: 'Economy',
  LUXURY: 'Luxury',
  SPORT: 'Sport',
  UTILITY: 'Utility'
}

export const useDesignStore = defineStore('design', {
  state: () => ({
    models: [],
    activePrototype: null, // { name, vehicleClass, components, baseStats, status, results: {} }
    activeIssues: [], // { id, modelId, modelName, territoryId, territoryName, type, costToFix }
    // Component libraries (Base costs in 1908 dollars)
    components: {
      chassis: [
        { id: 'basic-chassis', name: 'Wooden Frame', cost: 200, weight: 500, durability: 20 },
        { id: 'steel-frame', name: 'Steel Ladder Frame', cost: 800, weight: 800, durability: 60, requires: 'drum-brakes' },
        { id: 'aerodynamic-body', name: 'Aerodynamic Body', cost: 1500, weight: 600, durability: 50, requires: 'aerodynamic-body' },
      ],
      engine: [
        { id: 'crank-start', name: '1-Cyl Crank Start', cost: 300, power: 10, weight: 200, economy: 5 },
        { id: 'inline-4', name: 'Inline 4', cost: 1200, power: 40, weight: 450, economy: 15, requires: 'inline-4' },
        { id: 'inline-6', name: 'Inline 6', cost: 2500, power: 85, weight: 650, economy: 12, requires: 'inline-6' },
        { id: 'v8-engine', name: 'V8 Engine', cost: 5000, power: 160, weight: 850, economy: 8, requires: 'v8-engine' },
        { id: 'diesel-engine', name: 'Diesel Engine', cost: 4500, power: 110, weight: 900, economy: 25, requires: 'diesel-engine' },
        { id: 'fuel-injection', name: 'Fuel Injected V8', cost: 8000, power: 220, weight: 800, economy: 14, requires: 'fuel-injection' },
        { id: 'turbocharger', name: 'Turbo Inline-4', cost: 7000, power: 190, weight: 500, economy: 20, requires: 'turbocharger' },
        { id: 'hybrid-drive', name: 'Hybrid Drive', cost: 15000, power: 250, weight: 1100, economy: 45, requires: 'hybrid-drive' },
        { id: 'electric-drive', name: 'Electric Drive', cost: 25000, power: 300, weight: 1500, economy: 100, requires: 'electric-drive' },
      ],
      steering: [
        { id: 'tiller-steering', name: 'Tiller', cost: 50, safety: 5, weight: 10 },
        { id: 'steering-wheel', name: 'Steering Wheel', cost: 150, safety: 25, weight: 30, requires: 'steering-wheel' },
        { id: 'power-steering', name: 'Power Steering', cost: 800, safety: 40, weight: 60, requires: 'power-steering' },
        { id: 'rack-and-pinion', name: 'Rack & Pinion', cost: 1200, safety: 55, weight: 40, requires: 'rack-and-pinion' },
        { id: 'electronic-stability', name: 'ESC System', cost: 4500, safety: 85, weight: 50, requires: 'electronic-stability' },
      ],
      brakes: [
        { id: 'block-brakes', name: 'Wood Block Brakes', cost: 20, safety: 5, weight: 5 },
        { id: 'drum-brakes', name: 'Drum Brakes', cost: 100, safety: 30, weight: 40, requires: 'drum-brakes' },
        { id: 'hydraulic-brakes', name: 'Hydraulic Brakes', cost: 600, safety: 50, weight: 60, requires: 'hydraulic-brakes' },
        { id: 'abs-brakes', name: 'ABS System', cost: 2500, safety: 80, weight: 40, requires: 'abs-brakes' },
      ],
      features: [
        { id: 'basic-interior', name: 'Basic Bench Seats', cost: 100, safety: 0, weight: 50 },
        { id: 'electric-lights', name: 'Electric Lights', cost: 300, safety: 10, weight: 10, requires: 'electric-lights' },
        { id: 'seat-belts', name: 'Seat Belts', cost: 500, safety: 25, weight: 10, requires: 'seat-belts' },
        { id: 'airbags', name: 'Full Airbags', cost: 3500, safety: 50, weight: 30, requires: 'airbags' },
        { id: 'car-radio', name: 'AM/FM Radio', cost: 400, safety: 0, weight: 15, requires: 'car-radio' },
        { id: 'air-conditioning', name: 'Air Conditioning', cost: 2500, safety: 0, weight: 80, requires: 'air-conditioning' },
        { id: 'navigation-system', name: 'Navigation', cost: 5000, safety: 0, weight: 20, requires: 'navigation-system' },
      ]
    },
    durabilityMatrix: {
      'basic-chassis': 20,
      'steel-frame': 60,
      'aerodynamic-body': 50
    }
  }),

  persist: true,

  getters: {
    getUnlockedComponents: (state) => (unlockedTech) => {
      const worldStore = useWorldStore()
      const inflation = worldStore.inflationMultiplier
      const filtered = {}
      for (const cat in state.components) {
        filtered[cat] = state.components[cat]
          .filter(comp => !comp.requires || unlockedTech.includes(comp.requires))
          .map(comp => ({ ...comp, cost: Math.round(comp.cost * inflation) }))
      }
      return filtered
    }
  },

  actions: {
    startPrototype(design) {
      this.activePrototype = {
        ...design,
        status: 'draft',
        results: { acceleration: null, braking: null, economy: null, safety: null }
      }
    },

    buildPrototype() {
      const playerStore = usePlayerStore()
      const cost = this.activePrototype.cost * 10
      if (playerStore.funds >= cost) {
        playerStore.funds -= cost
        this.activePrototype.status = 'built'
        return true
      }
      return false
    },

    runTest(testId) {
      const playerStore = usePlayerStore()
      const testFee = Math.round(500 * useWorldStore().inflationMultiplier)
      if (playerStore.funds < testFee) return false
      playerStore.funds -= testFee
      const variance = 0.85 + (Math.random() * 0.3)
      const base = this.activePrototype.stats
      if (testId === 'acceleration') this.activePrototype.results.acceleration = (20 / (base.pwrRatio / 10 || 1)) * variance
      else if (testId === 'braking') this.activePrototype.results.braking = (200 / (base.safety / 20 || 1)) * variance
      else if (testId === 'economy') this.activePrototype.results.economy = base.economy * variance
      else if (testId === 'safety') this.activePrototype.results.safety = Math.min(100, base.safety * variance)
      return true
    },

    finalizePrototype() {
      if (!this.activePrototype) return
      const gameStore = useGameStore()
      const finalStats = {
        ...this.activePrototype.stats,
        realEconomy: this.activePrototype.results.economy || this.activePrototype.stats.economy,
        realSafety: this.activePrototype.results.safety || this.activePrototype.stats.safety,
        realAcceleration: this.activePrototype.results.acceleration || 0,
        realBraking: this.activePrototype.results.braking || 0,
        durability: this.durabilityMatrix[this.activePrototype.components.chassis] || 30
      }
      this.models.push({
        name: this.activePrototype.name,
        vehicleClass: this.activePrototype.vehicleClass,
        cost: this.activePrototype.cost,
        weight: this.activePrototype.weight,
        stats: finalStats,
        components: this.activePrototype.components,
        id: Date.now(),
        introduced: gameStore.year
      })
      this.activePrototype = null
    },

    scrapPrototype() { this.activePrototype = null },

    resolveIssue(issueId) {
      const playerStore = usePlayerStore()
      const issue = this.activeIssues.find(i => i.id === issueId)
      if (issue && playerStore.funds >= issue.costToFix) {
        playerStore.funds -= issue.costToFix
        this.activeIssues = this.activeIssues.filter(i => i.id !== issueId)
        return { success: true, cost: issue.costToFix }
      }
      return { success: false }
    },

    ignoreIssue(issueId) {
      const playerStore = usePlayerStore()
      const issue = this.activeIssues.find(i => i.id === issueId)
      if (issue) {
        playerStore.changeReputation(-15) // Massive trust hit
        this.activeIssues = this.activeIssues.filter(i => i.id !== issueId)
        return true
      }
      return false
    },

    addIssue(issue) {
      this.activeIssues.push({
        id: Date.now() + Math.random(),
        ...issue
      })
    }
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDesignStore, import.meta.hot))
}

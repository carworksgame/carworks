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
    activePrototype: null, 
    activeIssues: [], 
    // Component libraries (Base costs in 1900 dollars)
    components: {
      chassis: [
        { id: 'basic-chassis', name: 'Wooden Frame', cost: 150, weight: 500, durability: 15 },
        { id: 'steel-reinforced', name: 'Reinforced Wood', cost: 300, weight: 600, durability: 30, requires: 'steel-reinforced' },
        { id: 'all-steel-ladder', name: 'Steel Ladder Frame', cost: 600, weight: 800, durability: 55, requires: 'all-steel-ladder' },
        { id: 'pressed-steel', name: 'Pressed Steel', cost: 900, weight: 700, durability: 65, requires: 'pressed-steel' },
        { id: 'aerodynamic-body', name: 'Aerodynamic Body', cost: 1500, weight: 650, durability: 60, requires: 'aerodynamic-body' },
        { id: 'monocoque', name: 'Unibody Construction', cost: 3000, weight: 550, durability: 80, requires: 'monocoque' },
        { id: 'lightweight-alloys', name: 'Alloy Construction', cost: 8000, weight: 400, durability: 85, requires: 'lightweight-alloys' },
        { id: 'carbon-fiber', name: 'Carbon Composite', cost: 25000, weight: 250, durability: 95, requires: 'carbon-fiber' },
      ],
      engine: [
        { id: 'single-cylinder', name: 'Single-Cyl Engine', cost: 200, power: 8, weight: 150, economy: 8 },
        { id: 'twin-cylinder', name: 'Twin-Cyl Engine', cost: 450, power: 15, weight: 250, economy: 10, requires: 'twin-cylinder' },
        { id: 'inline-4', name: 'Early Inline 4', cost: 1000, power: 30, weight: 450, economy: 12, requires: 'inline-4' },
        { id: 'ohv-engine', name: 'OHV Inline 4', cost: 1800, power: 45, weight: 400, economy: 15, requires: 'ohv-engine' },
        { id: 'inline-6', name: 'Inline 6 Engine', cost: 2800, power: 85, weight: 650, economy: 14, requires: 'inline-6' },
        { id: 'high-comp-i4', name: 'High-Comp I4', cost: 2500, power: 65, weight: 420, economy: 22, requires: 'high-comp-i4' },
        { id: 'v8-engine', name: 'Flathead V8', cost: 4500, power: 110, weight: 800, economy: 10, requires: 'v8-engine' },
        { id: 'improved-v8', name: 'OHV V8 Engine', cost: 7000, power: 180, weight: 750, economy: 12, requires: 'improved-v8' },
        { id: 'early-diesel', name: 'Diesel Engine', cost: 6500, power: 100, weight: 950, economy: 28, requires: 'early-diesel' },
        { id: 'high-output-v8', name: 'High-Output V8', cost: 12000, power: 350, weight: 850, economy: 8, requires: 'high-output-v8' },
        { id: 'fuel-injection', name: 'Injected V8', cost: 15000, power: 420, weight: 800, economy: 14, requires: 'fuel-injection' },
        { id: 'electronic-injection', name: 'Modern EFI Engine', cost: 10000, power: 220, weight: 500, economy: 32, requires: 'electronic-injection' },
        { id: 'early-turbo', name: 'Turbo Inline-4', cost: 14000, power: 280, weight: 520, economy: 25, requires: 'early-turbo' },
        { id: 'multi-valve', name: 'Multi-Valve I4', cost: 12000, power: 190, weight: 450, economy: 35, requires: 'multi-valve' },
        { id: 'vvt-engine', name: 'VVT Engine', cost: 18000, power: 260, weight: 480, economy: 42, requires: 'vvt-engine' },
        { id: 'early-hybrid', name: 'Hybrid Drive', cost: 35000, power: 200, weight: 1100, economy: 65, requires: 'early-hybrid' },
        { id: 'modern-electric', name: 'Electric Drive', cost: 60000, power: 450, weight: 1500, economy: 120, requires: 'modern-electric' },
      ],
      steering: [
        { id: 'tiller-steering', name: 'Tiller', cost: 30, safety: 2, weight: 10 },
        { id: 'steering-wheel', name: 'Steering Wheel', cost: 120, safety: 15, weight: 30, requires: 'steering-wheel' },
        { id: 'leaf-springs', name: 'Leaf Springs', cost: 250, safety: 20, weight: 80, requires: 'leaf-springs' },
        { id: 'shock-absorbers', name: 'Shock Absorbers', cost: 600, safety: 35, weight: 60, requires: 'shock-absorbers' },
        { id: 'ifs-handling', name: 'Indep. Suspension', cost: 1500, safety: 50, weight: 50, requires: 'ifs-handling' },
        { id: 'power-steering', name: 'Power Steering', cost: 3500, safety: 65, weight: 80, requires: 'power-steering' },
        { id: 'rack-and-pinion', name: 'Rack & Pinion', cost: 5000, safety: 80, weight: 40, requires: 'rack-and-pinion' },
        { id: 'esc-handling', name: 'ESC System', cost: 15000, safety: 95, weight: 20, requires: 'esc-handling' },
      ],
      brakes: [
        { id: 'wood-brakes', name: 'Wood Block Brakes', cost: 15, safety: 2, weight: 5 },
        { id: 'drum-brakes', name: 'Drum Brakes', cost: 150, safety: 20, weight: 40, requires: 'drum-brakes' },
        { id: 'mechanical-4-wheel', name: '4-Wheel Drums', cost: 400, safety: 35, weight: 80, requires: 'mechanical-4-wheel' },
        { id: 'hydraulic-brakes', name: 'Hydraulic Brakes', cost: 1200, safety: 55, weight: 60, requires: 'hydraulic-brakes' },
        { id: 'disc-brakes', name: 'Front Disc Brakes', cost: 3500, safety: 75, weight: 40, requires: 'disc-brakes' },
        { id: 'abs-brakes', name: 'ABS System', cost: 12000, safety: 90, weight: 30, requires: 'abs-brakes' },
      ],
      features: [
        { id: 'gas-lanterns', name: 'Gas Lanterns', cost: 100, safety: 5, weight: 20 },
        { id: 'electric-lights', name: 'Electric Lights', cost: 400, safety: 15, weight: 15, requires: 'electric-lights' },
        { id: 'enclosed-cabin', name: 'Enclosed Cabin', cost: 1500, safety: 20, weight: 300, requires: 'enclosed-cabin' },
        { id: 'car-radio', name: 'AM Radio', cost: 800, safety: 0, weight: 25, requires: 'car-radio' },
        { id: 'car-heater', name: 'Interior Heater', cost: 500, safety: 0, weight: 40, requires: 'car-heater' },
        { id: 'seat-belts', name: 'Lap Belts', cost: 300, safety: 30, weight: 10, requires: 'seat-belts' },
        { id: 'air-conditioning', name: 'Air Conditioning', cost: 4500, safety: 0, weight: 120, requires: 'air-conditioning' },
        { id: 'disc-brakes', name: 'Safety Glass', cost: 1000, safety: 10, weight: 50, requires: 'disc-brakes' }, // Shared tech
        { id: 'power-windows', name: 'Power Windows', cost: 2500, safety: 0, weight: 60, requires: 'power-windows' },
        { id: 'collapsible-column', name: 'Safety Column', cost: 2000, safety: 15, weight: 20, requires: 'collapsible-column' },
        { id: 'cd-player', name: 'CD Player', cost: 1200, safety: 0, weight: 10, requires: 'cd-player' },
        { id: 'driver-airbag', name: 'Driver Airbag', cost: 8000, safety: 40, weight: 30, requires: 'driver-airbag' },
        { id: 'navigation-gps', name: 'GPS Navigation', cost: 15000, safety: 0, weight: 15, requires: 'navigation-gps' },
        { id: 'full-airbags', name: 'Full Airbag Suite', cost: 20000, safety: 60, weight: 50, requires: 'full-airbags' },
        { id: 'infotainment', name: 'Infotainment', cost: 35000, safety: 0, weight: 20, requires: 'infotainment' },
      ]
    },
    durabilityMatrix: {
      'basic-chassis': 15,
      'steel-reinforced': 30,
      'all-steel-ladder': 55,
      'pressed-steel': 65,
      'aerodynamic-body': 60,
      'monocoque': 80,
      'lightweight-alloys': 85,
      'carbon-fiber': 95
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
        playerStore.changeReputation(-15) 
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

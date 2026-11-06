import { defineStore, acceptHMRUpdate } from 'pinia'
import { usePlayerStore } from './player'
import { useGameStore } from './game'
import { useWorldStore } from './world'
import { useMarketingStore } from './marketing'

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
    // Component libraries (Base costs in 1900 dollars; scaled by worldStore.inflationMultiplier)
    components: {
      chassis: [
        { id: 'basic-chassis', name: 'Wooden Frame', cost: 110, weight: 1000, durability: 15, appeal: 2 },
        { id: 'steel-reinforced', name: 'Reinforced Wood', cost: 145, weight: 1150, durability: 30, appeal: 6, requires: 'steel-reinforced' },
        { id: 'all-steel-ladder', name: 'Steel Ladder Frame', cost: 190, weight: 1350, durability: 55, appeal: 12, requires: 'all-steel-ladder' },
        { id: 'pressed-steel', name: 'Pressed Steel', cost: 230, weight: 1250, durability: 65, appeal: 18, requires: 'pressed-steel' },
        { id: 'aerodynamic-body', name: 'Aerodynamic Body', cost: 280, weight: 1150, durability: 65, appeal: 32, requires: 'aerodynamic-body' },
        { id: 'monocoque', name: 'Unibody Construction', cost: 340, weight: 1050, durability: 80, appeal: 40, requires: 'monocoque' },
        { id: 'lightweight-alloys', name: 'Alloy Construction', cost: 440, weight: 800, durability: 85, appeal: 50, requires: 'lightweight-alloys' },
        { id: 'carbon-fiber', name: 'Carbon Composite', cost: 620, weight: 550, durability: 95, appeal: 65, requires: 'carbon-fiber' },
      ],
      engine: [
        { id: 'single-cylinder', name: 'Single-Cyl Engine', cost: 130, power: 12, weight: 300, economy: 10 },
        { id: 'twin-cylinder', name: 'Twin-Cyl Engine', cost: 175, power: 24, weight: 400, economy: 12, requires: 'twin-cylinder' },
        { id: 'inline-4', name: 'Early Inline 4', cost: 230, power: 40, weight: 500, economy: 15, requires: 'inline-4' },
        { id: 'ohv-engine', name: 'OHV Inline 4', cost: 280, power: 62, weight: 480, economy: 18, requires: 'ohv-engine' },
        { id: 'inline-6', name: 'Inline 6 Engine', cost: 340, power: 98, weight: 680, economy: 16, requires: 'inline-6' },
        { id: 'high-comp-i4', name: 'High-Comp I4', cost: 310, power: 82, weight: 450, economy: 24, requires: 'high-comp-i4' },
        { id: 'v8-engine', name: 'Flathead V8', cost: 410, power: 125, weight: 780, economy: 13, requires: 'v8-engine' },
        { id: 'improved-v8', name: 'OHV V8 Engine', cost: 490, power: 195, weight: 740, economy: 14, requires: 'improved-v8' },
        { id: 'early-diesel', name: 'Diesel Engine', cost: 440, power: 115, weight: 900, economy: 30, requires: 'early-diesel' },
        { id: 'high-output-v8', name: 'High-Output V8', cost: 620, power: 340, weight: 820, economy: 10, requires: 'high-output-v8' },
        { id: 'fuel-injection', name: 'Injected V8', cost: 680, power: 400, weight: 780, economy: 16, requires: 'fuel-injection' },
        { id: 'electronic-injection', name: 'Modern EFI Engine', cost: 460, power: 210, weight: 520, economy: 32, requires: 'electronic-injection' },
        { id: 'early-turbo', name: 'Turbo Inline-4', cost: 540, power: 275, weight: 560, economy: 26, requires: 'early-turbo' },
        { id: 'multi-valve', name: 'Multi-Valve I4', cost: 490, power: 195, weight: 480, economy: 36, requires: 'multi-valve' },
        { id: 'vvt-engine', name: 'VVT Engine', cost: 580, power: 265, weight: 500, economy: 42, requires: 'vvt-engine' },
        { id: 'early-hybrid', name: 'Hybrid Drive', cost: 680, power: 215, weight: 1100, economy: 65, requires: 'early-hybrid' },
        { id: 'modern-electric', name: 'Li-Ion Electric Drive', cost: 820, power: 440, weight: 1350, economy: 120, requires: 'modern-electric' },
      ],
      steering: [
        { id: 'tiller-steering', name: 'Tiller', cost: 25, safety: 4, appeal: 0, weight: 40 },
        { id: 'steering-wheel', name: 'Steering Wheel', cost: 45, safety: 15, appeal: 5, weight: 70, requires: 'steering-wheel' },
        { id: 'leaf-springs', name: 'Leaf Springs', cost: 70, safety: 22, appeal: 8, weight: 120, requires: 'leaf-springs' },
        { id: 'shock-absorbers', name: 'Shock Absorbers', cost: 100, safety: 35, appeal: 14, weight: 90, requires: 'shock-absorbers' },
        { id: 'ifs-handling', name: 'Indep. Suspension', cost: 145, safety: 50, appeal: 22, weight: 80, requires: 'ifs-handling' },
        { id: 'power-steering', name: 'Power Steering', cost: 195, safety: 65, appeal: 30, weight: 95, requires: 'power-steering' },
        { id: 'rack-and-pinion', name: 'Rack & Pinion', cost: 240, safety: 80, appeal: 35, weight: 60, requires: 'rack-and-pinion' },
        { id: 'esc-handling', name: 'ESC System', cost: 340, safety: 95, appeal: 45, weight: 30, requires: 'esc-handling' },
      ],
      brakes: [
        { id: 'wood-brakes', name: 'Wood Block Brakes', cost: 15, safety: 4, weight: 20 },
        { id: 'drum-brakes', name: 'Drum Brakes', cost: 45, safety: 20, weight: 75, requires: 'drum-brakes' },
        { id: 'mechanical-4-wheel', name: '4-Wheel Drums', cost: 80, safety: 35, weight: 130, requires: 'mechanical-4-wheel' },
        { id: 'hydraulic-brakes', name: 'Hydraulic Brakes', cost: 130, safety: 55, weight: 95, requires: 'hydraulic-brakes' },
        { id: 'disc-brakes', name: 'Front Disc Brakes', cost: 190, safety: 75, weight: 75, requires: 'disc-brakes' },
        { id: 'abs-brakes', name: 'ABS System', cost: 290, safety: 92, weight: 50, requires: 'abs-brakes' },
      ],
      features: [
        { id: 'gas-lanterns', name: 'Gas Lanterns', cost: 20, safety: 5, appeal: 4, weight: 40 },
        { id: 'electric-lights', name: 'Electric Lights', cost: 45, safety: 15, appeal: 12, weight: 35, requires: 'electric-lights' },
        { id: 'enclosed-cabin', name: 'Enclosed Cabin', cost: 110, safety: 20, appeal: 28, weight: 350, requires: 'enclosed-cabin' },
        { id: 'car-radio', name: 'AM Radio', cost: 55, safety: 0, appeal: 18, weight: 25, requires: 'car-radio' },
        { id: 'car-heater', name: 'Interior Heater', cost: 45, safety: 5, appeal: 16, weight: 40, requires: 'car-heater' },
        { id: 'seat-belts', name: 'Lap Belts', cost: 40, safety: 30, appeal: 8, weight: 20, requires: 'seat-belts' },
        { id: 'air-conditioning', name: 'Air Conditioning', cost: 125, safety: 0, appeal: 32, weight: 110, requires: 'air-conditioning' },
        { id: 'disc-brakes', name: 'Safety Glass', cost: 65, safety: 18, appeal: 10, weight: 60, requires: 'disc-brakes' },
        { id: 'power-windows', name: 'Power Windows', cost: 85, safety: 0, appeal: 22, weight: 55, requires: 'power-windows' },
        { id: 'collapsible-column', name: 'Safety Column', cost: 75, safety: 20, appeal: 6, weight: 25, requires: 'collapsible-column' },
        { id: 'cd-player', name: 'CD Player', cost: 70, safety: 0, appeal: 20, weight: 15, requires: 'cd-player' },
        { id: 'driver-airbag', name: 'Driver Airbag', cost: 140, safety: 35, appeal: 15, weight: 30, requires: 'driver-airbag' },
        { id: 'navigation-gps', name: 'GPS Navigation', cost: 165, safety: 5, appeal: 30, weight: 15, requires: 'navigation-gps' },
        { id: 'full-airbags', name: 'Full Airbag Suite', cost: 220, safety: 55, appeal: 22, weight: 65, requires: 'full-airbags' },
        { id: 'infotainment', name: 'Infotainment', cost: 240, safety: 5, appeal: 40, weight: 25, requires: 'infotainment' },
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
    activeModels: (state) => state.models.filter(m => !m.archived),
    getUnlockedComponents: (state) => (unlockedTech) => {
      const worldStore = useWorldStore()
      const filtered = {}
      for (const cat in state.components) {
        filtered[cat] = state.components[cat]
          .filter(comp => !comp.requires || unlockedTech.includes(comp.requires))
          .map(comp => ({ ...comp, cost: Math.round(comp.cost * worldStore.inflationMultiplier) }))
      }
      return filtered
    }
  },

  actions: {
    getBaseComponentCost(componentsObj) {
      if (!componentsObj) return 300
      const findCost = (cat, id) => this.components[cat]?.find(c => c.id === id)?.cost || 0
      const featureCost = (componentsObj.features || []).reduce((acc, fId) => acc + findCost('features', fId), 0)
      return (
        findCost('chassis', componentsObj.chassis) +
        findCost('engine', componentsObj.engine) +
        findCost('steering', componentsObj.steering) +
        findCost('brakes', componentsObj.brakes) +
        featureCost
      ) || 300
    },

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
      if (testId === 'acceleration') this.activePrototype.results.acceleration = (480 / (base.pwrRatio || 1)) * variance
      else if (testId === 'braking') this.activePrototype.results.braking = (200 / (base.safety / 20 || 1)) * variance
      else if (testId === 'economy') this.activePrototype.results.economy = base.economy * variance
      else if (testId === 'safety') this.activePrototype.results.safety = Math.min(100, base.safety * variance)
      return true
    },

    finalizePrototype() {
      if (!this.activePrototype) return
      const gameStore = useGameStore()
      const playerStore = usePlayerStore()
      const worldStore = useWorldStore()

      const finalStats = {
        ...this.activePrototype.stats,
        realEconomy: this.activePrototype.results.economy || this.activePrototype.stats.economy,
        realSafety: this.activePrototype.results.safety || this.activePrototype.stats.safety,
        realAcceleration: this.activePrototype.results.acceleration || 0,
        realBraking: this.activePrototype.results.braking || 0,
        durability: this.durabilityMatrix[this.activePrototype.components.chassis] || 30
      }
      
      const baseCost1900 = this.getBaseComponentCost(this.activePrototype.components)
      const currentCost = Math.round(baseCost1900 * worldStore.inflationMultiplier)

      const newModel = {
        name: this.activePrototype.name,
        vehicleClass: this.activePrototype.vehicleClass,
        cost: currentCost,
        baseCost1900,
        weight: this.activePrototype.weight,
        stats: finalStats,
        components: this.activePrototype.components,
        unlockedTechSnapshot: this.activePrototype.unlockedTechSnapshot || [],
        id: Date.now(),
        introduced: gameStore.year,
        archived: false
      }

      this.models.push(newModel)

      // INITIALIZE LOGISTICS for the new model across all active territories
      const suggestedRetail = Math.round(currentCost * 1.85)
      worldStore.territories.forEach(t => {
        if (t.active) {
          playerStore.initializeDistribution(newModel.id, t.id, suggestedRetail)
        }
      })

      this.activePrototype = null
    },

    scrapPrototype() { this.activePrototype = null },

    archiveModel(modelId) {
      const model = this.models.find(m => m.id === modelId)
      if (model) {
        model.archived = true
        const playerStore = usePlayerStore()
        const marketingStore = useMarketingStore()
        const worldStore = useWorldStore()

        playerStore.clearModelAssignments(modelId)
        marketingStore.clearCampaignsForModel(modelId)

        if (worldStore.participatingModelId === modelId) {
          worldStore.participatingModelId = null
        }
      }
    },

    restoreModel(modelId) {
      const model = this.models.find(m => m.id === modelId)
      if (model) {
        model.archived = false
      }
    },

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

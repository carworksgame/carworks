import { defineStore, acceptHMRUpdate } from 'pinia'
import { useWorldStore } from './world'

export const usePlayerStore = defineStore('player', {
  state: () => ({
    companyName: 'My Car Company',
    funds: 50000,
    reputation: 10,
    
    // Detailed model management
    productionConfig: {}, // { modelId: { territoryId: { price: 2000, productionVolume: 50 } } }
    inventory: {}, // { modelId: { territoryId: 100 } }
    
    // Logistics: Maps territoryId to factoryId
    supplyLines: {
      'north-america': 1
    },

    factories: [
      { id: 1, territory: 'north-america', size: 1, employees: 100, salary: 1550, maxEmployees: 500, location: 'Detroit' }
    ],
    showrooms: [
      { id: 1, territory: 'north-america', salesForce: 10, monthlyLease: 500 }
    ],

    // R&D Personnel
    technicians: 0,
    salaryPerTechnician: 2100,

    // Benefits (Global for company)
    benefitsLevel: 10, // 0-100 scale

    ledger: []
  }),

  persist: true,

  getters: {
    totalEmployees: (state) => state.factories.reduce((acc, f) => acc + f.employees, 0),
    
    monthlySalaryBill: (state) => {
      const factorySalaries = state.factories.reduce((acc, f) => acc + (f.employees * f.salary), 0)
      const technicianSalaries = state.technicians * state.salaryPerTechnician
      const basePayroll = factorySalaries + technicianSalaries
      
      // Benefits cost: at 100% benefits, cost is +20% of payroll
      const benefitsCost = basePayroll * (state.benefitsLevel / 100) * 0.2
      return basePayroll + benefitsCost
    },

    monthlyLeaseBill: (state) => state.showrooms.reduce((acc, s) => acc + s.monthlyLease, 0),
    lastMonthPerformance: (state) => state.ledger.length > 0 ? state.ledger[state.ledger.length - 1] : null,
    
    // Calculate satisfaction based on salary vs regional base wage + benefits
    getFactorySatisfaction: (state) => (factoryId) => {
      const worldStore = useWorldStore()
      const factory = state.factories.find(f => f.id === factoryId)
      if (!factory) return 0
      
      const territory = worldStore.territories.find(t => t.id === factory.territory)
      const baseWage = territory?.baseWage || 1500
      
      // Satisfaction = (Salary / BaseWage) + (Benefits bonus)
      // benefitsLevel 100 gives a +0.2 boost
      const ratio = factory.salary / baseWage
      const benefitBonus = (state.benefitsLevel / 100) * 0.2
      return ratio + benefitBonus
    },

    getFactoryProductivity: (state) => (factoryId) => {
      const satisfaction = state.getFactorySatisfaction(factoryId)
      // Productivity curve: 1.0 at 1.0 satisfaction, 0.5 at 0.5 satisfaction, capped at 1.5
      return Math.min(1.5, Math.max(0.1, satisfaction))
    },

    getTechnicianSatisfaction: (state) => {
      const worldStore = useWorldStore()
      // Technicians are global but compared against North American (HQ) base wage
      const baseWage = worldStore.territories.find(t => t.id === 'north-america')?.baseWage || 1500
      const ratio = state.salaryPerTechnician / baseWage
      const benefitBonus = (state.benefitsLevel / 100) * 0.2
      return ratio + benefitBonus
    },

    getTechnicianProductivity: (state) => {
      const satisfaction = state.getTechnicianSatisfaction
      return Math.min(1.5, Math.max(0.1, satisfaction))
    },

    // Getters for specific model/territory
    getModelConfig: (state) => (modelId, territoryId) => {
      return state.productionConfig[modelId]?.[territoryId] || { price: 0, productionVolume: 0 }
    },
    getInventory: (state) => (modelId, territoryId) => {
      return state.inventory[modelId]?.[territoryId] || 0
    }
  },

  actions: {
    updateProductionConfig(modelId, territoryId, key, value) {
      if (!this.productionConfig[modelId]) this.productionConfig[modelId] = {}
      if (!this.productionConfig[modelId][territoryId]) {
        this.productionConfig[modelId][territoryId] = { price: 1000, productionVolume: 0 }
      }
      this.productionConfig[modelId][territoryId][key] = value
    },

    updateSupplyLine(territoryId, factoryId) {
      this.supplyLines[territoryId] = factoryId
    },

    processMonthlyFinances(turnInfo) {
      const expenses = {
        salaries: this.monthlySalaryBill,
        maintenance: this.factories.length * 1000,
        lease: this.monthlyLeaseBill,
        marketing: turnInfo.marketingCost || 0,
        research: turnInfo.researchCost || 0,
        productionCosts: turnInfo.productionCosts || 0,
        shipping: turnInfo.shippingCosts || 0
      }

      const totalExpenses = Object.values(expenses).reduce((a, b) => a + b, 0)
      const income = turnInfo.salesIncome || 0

      const net = income - totalExpenses
      this.funds += net

      this.ledger.push({
        turn: turnInfo.turn,
        date: turnInfo.date,
        income,
        expenses,
        net
      })
    },

    addToInventory(modelId, territoryId, count) {
      if (!this.inventory[modelId]) this.inventory[modelId] = {}
      if (!this.inventory[modelId][territoryId]) this.inventory[modelId][territoryId] = 0
      this.inventory[modelId][territoryId] += count
    },

    removeFromInventory(modelId, territoryId, count) {
      if (this.inventory[modelId] && this.inventory[modelId][territoryId]) {
        this.inventory[modelId][territoryId] = Math.max(0, this.inventory[modelId][territoryId] - count)
      }
    },

    expandToTerritory(territory) {
      const worldStore = useWorldStore()
      if (this.funds >= territory.unlockCost) {
        this.funds -= territory.unlockCost
        worldStore.unlockTerritory(territory.id)
        
        // Automatically add a showroom in the new territory
        this.showrooms.push({
          id: Date.now(),
          territory: territory.id,
          salesForce: 5,
          monthlyLease: 1000
        })

        // Set default supply line to the first factory
        if (this.factories.length > 0) {
          this.supplyLines[territory.id] = this.factories[0].id
        }

        return true
      }
      return false
    },

    buildFactory(territoryId, locationName) {
      const cost = 25000
      if (this.funds >= cost) {
        this.funds -= cost
        this.factories.push({
          id: Date.now(),
          territory: territoryId,
          size: 1,
          employees: 50,
          salary: 1550, // Match start salary
          maxEmployees: 500,
          location: locationName
        })
        return true
      }
      return false
    },

    hireTechnicians(count) {
      this.technicians += count
    },

    fireTechnicians(count) {
      this.technicians = Math.max(0, this.technicians - count)
    },

    updateBenefits(level) {
      this.benefitsLevel = Math.min(100, Math.max(0, level))
    }
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePlayerStore, import.meta.hot))
}

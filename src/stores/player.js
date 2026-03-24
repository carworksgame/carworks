import { defineStore, acceptHMRUpdate } from 'pinia'
import { useWorldStore } from './world'

export const usePlayerStore = defineStore('player', {
  state: () => ({
    companyName: 'My Car Company',
    funds: 50000,
    reputation: 50, 
    reputationHistory: [], 
    
    // Detailed model management
    // productionConfig: { modelId: { territoryId: { price: 2000, assignedWorkers: 50 } } }
    productionConfig: {}, 
    inventory: {}, // { modelId: { territoryId: 100 } }
    
    supplyLines: {
      'north-america': 1
    },

    factories: [
      { 
        id: 1, territory: 'north-america', size: 1, level: 1, 
        totalWorkers: 100, idleWorkers: 0, 
        salary: 50, maxEmployees: 500, location: 'Detroit' 
      }
    ],
    showrooms: [
      { id: 1, territory: 'north-america', salesForce: 10, monthlyLease: 500 }
    ],

    // R&D Personnel
    totalTechnicians: 0,
    idleTechnicians: 0,
    salaryPerTechnician: 60,

    // Benefits (Global for company)
    benefitsLevel: 10, 

    // Market Research
    purchasedReports: {}, 

    ledger: []
  }),

  persist: true,

  getters: {
    totalEmployees: (state) => {
      const factoryWorkers = state.factories.reduce((acc, f) => acc + f.totalWorkers, 0)
      return factoryWorkers + state.totalTechnicians
    },
    
    monthlySalaryBill: (state) => {
      const factorySalaries = state.factories.reduce((acc, f) => acc + (f.totalWorkers * f.salary), 0)
      const technicianSalaries = state.totalTechnicians * state.salaryPerTechnician
      const basePayroll = factorySalaries + technicianSalaries
      const benefitsCost = basePayroll * (state.benefitsLevel / 100) * 0.2
      return basePayroll + benefitsCost
    },

    monthlyLeaseBill: (state) => state.showrooms.reduce((acc, s) => acc + s.monthlyLease, 0),
    lastMonthPerformance: (state) => state.ledger.length > 0 ? state.ledger[state.ledger.length - 1] : null,
    
    getFactorySatisfaction: (state) => (factoryId) => {
      const worldStore = useWorldStore()
      const factory = state.factories.find(f => f.id === factoryId)
      if (!factory) return 0
      const territory = worldStore.territories.find(t => t.id === factory.territory)
      const baseWage = territory?.baseWage || 50
      const ratio = factory.salary / (baseWage || 1)
      const benefitBonus = (state.benefitsLevel / 100) * 0.2
      return ratio + benefitBonus
    },

    getFactoryProductivity: (state) => (factoryId) => {
      const factory = state.factories.find(f => f.id === factoryId)
      if (!factory) return 0
      const satisfaction = state.getFactorySatisfaction(factoryId)
      const baseProd = Math.min(1.5, Math.max(0.1, satisfaction))
      const levelBonus = 1 + (factory.level - 1) * 0.25
      return baseProd * levelBonus
    },

    getTechnicianSatisfaction: (state) => {
      const worldStore = useWorldStore()
      const baseWage = worldStore.territories.find(t => t.id === 'north-america')?.baseWage || 50
      const ratio = state.salaryPerTechnician / (baseWage || 1)
      const benefitBonus = (state.benefitsLevel / 100) * 0.2
      return ratio + benefitBonus
    },

    getTechnicianProductivity: (state) => {
      const satisfaction = state.getTechnicianSatisfaction
      return Math.min(1.5, Math.max(0.1, satisfaction))
    },

    getModelConfig: (state) => (modelId, territoryId) => {
      return state.productionConfig[modelId]?.[territoryId] || { price: 0, assignedWorkers: 0 }
    },
    getInventory: (state) => (modelId, territoryId) => {
      return state.inventory[modelId]?.[territoryId] || 0
    },

    getUpgradeCost: () => (currentLevel) => {
      const costs = { 1: 50000, 2: 125000, 3: 300000, 4: 750000 }
      return costs[currentLevel] || 0
    }
  },

  actions: {
    changeReputation(delta) {
      this.reputation = Math.min(100, Math.max(0, this.reputation + delta))
    },

    addReputationHistory(date) {
      this.reputationHistory.push({ date, value: this.reputation })
      if (this.reputationHistory.length > 6) this.reputationHistory.shift()
    },

    updateProductionConfig(modelId, territoryId, key, value) {
      if (!this.productionConfig[modelId]) this.productionConfig[modelId] = {}
      if (!this.productionConfig[modelId][territoryId]) {
        this.productionConfig[modelId][territoryId] = { price: 1000, assignedWorkers: 0 }
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
        shipping: turnInfo.shippingCosts || 0,
        recalls: turnInfo.recallCosts || 0
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
        this.showrooms.push({ id: Date.now(), territory: territory.id, salesForce: 5, monthlyLease: 1000 })
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
          level: 1,
          totalWorkers: 50,
          idleWorkers: 50,
          salary: 50, 
          maxEmployees: 500,
          location: locationName
        })
        return true
      }
      return false
    },

    hireWorkers(factoryId, count) {
      const worldStore = useWorldStore()
      const factory = this.factories.find(f => f.id === factoryId)
      if (!factory) return false
      
      const territory = worldStore.territories.find(t => t.id === factory.territory)
      const actualHires = Math.min(count, territory.talentPool)
      
      factory.totalWorkers += actualHires
      factory.idleWorkers += actualHires
      territory.talentPool -= actualHires
      return actualHires
    },

    layoffWorkers(factoryId, count) {
      const factory = this.factories.find(f => f.id === factoryId)
      if (!factory) return false
      
      const actualLayoffs = Math.min(count, factory.idleWorkers)
      factory.totalWorkers -= actualLayoffs
      factory.idleWorkers -= actualLayoffs
      // Laid off workers don't necessarily return to talent pool immediately in Detroit
      return actualLayoffs
    },

    hireTechnicians(count) {
      const worldStore = useWorldStore()
      const hqTerritory = worldStore.territories.find(t => t.id === 'north-america')
      const actualHires = Math.min(count, hqTerritory.talentPool)
      
      this.totalTechnicians += actualHires
      this.idleTechnicians += actualHires
      hqTerritory.talentPool -= actualHires
      return actualHires
    },

    layoffTechnicians(count) {
      const actualLayoffs = Math.min(count, this.idleTechnicians)
      this.totalTechnicians -= actualLayoffs
      this.idleTechnicians -= actualLayoffs
      return actualLayoffs
    },

    updateBenefits(level) { this.benefitsLevel = Math.min(100, Math.max(0, level)) },

    upgradeFactory(factoryId) {
      const factory = this.factories.find(f => f.id === factoryId)
      if (!factory || factory.level >= 5) return false
      const cost = this.getUpgradeCost(factory.level)
      if (this.funds >= cost) {
        this.funds -= cost
        factory.level++
        return true
      }
      return false
    },

    buyReport(territoryId, segments, totalPotential) {
      const cost = 2500
      if (this.funds >= cost) {
        this.funds -= cost
        this.purchasedReports[territoryId] = {
          date: new Date().toISOString(), 
          segments,
          totalPotential
        }
        return true
      }
      return false
    },

    clearReports() {
      this.purchasedReports = {}
    },

    recalculateIdleWorkers() {
      this.factories.forEach(f => {
        // Calculate assigned workers for this factory's supplied territories
        let assigned = 0
        const factorySuppliedTerritories = Object.keys(this.supplyLines).filter(tId => this.supplyLines[tId] === f.id)
        
        Object.keys(this.productionConfig).forEach(modelId => {
          factorySuppliedTerritories.forEach(tId => {
            assigned += (this.productionConfig[modelId]?.[tId]?.assignedWorkers || 0)
          })
        })
        
        f.idleWorkers = Math.max(0, f.totalWorkers - assigned)
      })

      // Technicians
      const researchStore = import('./research').then(m => {
          const store = m.useResearchStore()
          this.idleTechnicians = Math.max(0, this.totalTechnicians - store.totalAssignedTechnicians)
      })
    }
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePlayerStore, import.meta.hot))
}

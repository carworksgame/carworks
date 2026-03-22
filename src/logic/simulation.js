import { useGameStore } from '../stores/game'
import { usePlayerStore } from '../stores/player'
import { useWorldStore } from '../stores/world'
import { useResearchStore } from '../stores/research'
import { useDesignStore } from '../stores/design'
import { useMarketingStore } from '../stores/marketing'
import { useCompetitorStore } from '../stores/competitors'
import { useSavesStore } from '../stores/saves'
import { useBankStore } from '../stores/bank'

export function processEndTurn() {
  const gameStore = useGameStore()
  const playerStore = usePlayerStore()
  const worldStore = useWorldStore()
  const researchStore = useResearchStore()
  const designStore = useDesignStore()
  const marketingStore = useMarketingStore()
  const competitorStore = useCompetitorStore()
  const savesStore = useSavesStore()
  const bankStore = useBankStore()

  console.log('--- Processing End of Turn ---')
  
  // 0. Update available technology based on current year and unlocks
  researchStore.updateAvailableTech(gameStore.year)

  // 1. AI Actions
  competitorStore.processAITurns(gameStore.year, researchStore.availableTech)

  // 2. Progress research and marketing brand growth
  // Apply Technician Productivity to research
  const techProd = playerStore.getTechnicianProductivity
  const originalProgressPerTech = researchStore.progressPerTech
  researchStore.progressPerTech = originalProgressPerTech * techProd
  researchStore.progressResearch()
  researchStore.progressPerTech = originalProgressPerTech // Reset for next calculations

  marketingStore.processMonthlyBrandGrowth()

  // 3. Production Simulation (Player)
  let totalProductionCosts = 0
  let totalShippingCosts = 0
  const activeModels = designStore.models

  // Initialize factory aggregator with Satisfaction-based Productivity
  const factoryAggregator = {}
  playerStore.factories.forEach(f => {
    // Check for Labor Unrest
    const satisfaction = playerStore.getFactorySatisfaction(f.id)
    let strikeBonus = 1.0
    if (satisfaction < 0.7 && Math.random() < 0.1) {
      strikeBonus = 0 // Strike!
      gameStore.setNews({ title: `STRIKE in ${f.location}!`, description: 'Workers are striking for better pay.', type: 'crisis' })
    }

    factoryAggregator[f.id] = {
      capacity: f.employees * playerStore.getFactoryProductivity(f.id) * strikeBonus,
      territory: f.territory,
      requests: [] // { model, salesTerritoryId, volume }
    }
  })

  // 3.1 Gather all requests and map to factories via supply lines
  activeModels.forEach(model => {
    worldStore.territories.forEach(salesTerritory => {
      const config = playerStore.productionConfig[model.id]?.[salesTerritory.id] || { productionVolume: 0 }
      if (config.productionVolume > 0) {
        const factoryId = playerStore.supplyLines[salesTerritory.id]
        if (factoryId && factoryAggregator[factoryId]) {
          factoryAggregator[factoryId].requests.push({
            model,
            salesTerritoryId: salesTerritory.id,
            volume: config.productionVolume
          })
        }
      }
    })
  })

  // 3.2 Process production per factory with capacity constraints
  Object.keys(factoryAggregator).forEach(fId => {
    const factory = factoryAggregator[fId]
    const totalRequestedVolume = factory.requests.reduce((acc, r) => acc + r.volume, 0)
    
    const ratio = totalRequestedVolume > factory.capacity 
      ? (factory.capacity / (totalRequestedVolume || 1))
      : 1.0

    factory.requests.forEach(req => {
      const actualProduction = Math.floor(req.volume * ratio)
      if (actualProduction > 0) {
        // Production Cost
        totalProductionCosts += req.model.cost * actualProduction
        
        // Shipping Cost
        const shipRate = worldStore.getShippingCost(factory.territory, req.salesTerritoryId)
        totalShippingCosts += actualProduction * shipRate

        // Add to regional inventory
        playerStore.addToInventory(req.model.id, req.salesTerritoryId, actualProduction)
      }
    })
  })

  // 4. Sales Simulation (Competitive)
  let totalSalesIncome = 0
  const shares = { player: 0 }

  worldStore.territories.forEach(territory => {
    if (!territory.active) return
    const totalPotentialDemand = (territory.population / 100000) * territory.wealth * worldStore.globalDemandMultiplier
    const availableModels = []
    
    activeModels.forEach(m => {
      const inventory = playerStore.inventory[m.id]?.[territory.id] || 0
      const config = playerStore.productionConfig[m.id]?.[territory.id] || { price: 0 }
      if (inventory > 0 && config.price > 0) {
        availableModels.push({
          ownerId: 'player',
          modelId: m.id,
          name: m.name,
          price: config.price,
          stats: m.stats,
          inventory,
          marketingBoost: marketingStore.getBoostForModel(m.id) * (1 + (marketingStore.brandAwareness / 100))
        })
      }
    })

    competitorStore.competitors.forEach(comp => {
      comp.models.forEach(m => {
        availableModels.push({
          ownerId: comp.id,
          modelId: m.id,
          name: m.name,
          price: m.price,
          stats: m.stats,
          inventory: comp.productionLimit,
          marketingBoost: 1.2
        })
      })
    })

    if (availableModels.length === 0) return

    function calculateDesirability(m) {
       const year = gameStore.year
       let perfWeight = 2.0
       let econWeight = 0.5
       let safetyWeight = 0.5
       if (year > 1950) {
         perfWeight = 1.5
         econWeight = 1.0
         safetyWeight = 1.0
       }
       if (year > 1975) {
         perfWeight = 1.0
         econWeight = 2.5 
         safetyWeight = 2.0 
       }
       const perfScore = (m.stats.pwrRatio * perfWeight)
       const econScore = (m.stats.economy * econWeight)
       const safetyScore = (m.stats.safety / 5 * safetyWeight)
       const baseScore = perfScore + econScore + safetyScore
       const value = (baseScore / (m.price / 500)) || 1
       return value * m.marketingBoost
    }

    availableModels.forEach(m => {
      m.desirability = calculateDesirability(m)
    })

    const totalDesirability = availableModels.reduce((acc, m) => acc + m.desirability, 0)

    availableModels.forEach(m => {
      const shareOfPool = m.desirability / (totalDesirability || 1)
      const salesPotential = totalPotentialDemand * shareOfPool
      const actualSales = Math.min(m.inventory, Math.floor(salesPotential * (0.8 + Math.random() * 0.4)))
      
      if (m.ownerId === 'player') {
        totalSalesIncome += actualSales * m.price
        playerStore.removeFromInventory(m.modelId, territory.id, actualSales)
        shares.player += actualSales
      } else {
        if (!shares[m.ownerId]) shares[m.ownerId] = 0
        shares[m.ownerId] += actualSales
      }
    })
  })

  const totalSalesThisTurn = Object.values(shares).reduce((a, b) => a + b, 0)
  const normalizedShares = {}
  Object.keys(shares).forEach(id => {
    normalizedShares[id] = Math.round((shares[id] / (totalSalesThisTurn || 1)) * 100)
  })
  competitorStore.updateMarketShare(normalizedShares)

  // 5. Process finances
  playerStore.processMonthlyFinances({
    turn: gameStore.turnCount,
    date: gameStore.dateString,
    researchCost: playerStore.technicians * playerStore.salaryPerTechnician,
    marketingCost: marketingStore.totalMonthlyMarketingCost,
    productionCosts: totalProductionCosts,
    shippingCosts: totalShippingCosts,
    salesIncome: totalSalesIncome
  })

  // 6. Bank Interest & Payments
  bankStore.processMonthlyBank()

  // 7. World state updates
  const newsEvent = worldStore.updateWorldState(gameStore.year, gameStore.month)
  if (newsEvent) {
    gameStore.setNews(newsEvent)
  }

  // 8. Progress Game Date
  gameStore.nextTurn()

  // 9. Auto-save if slot exists
  if (gameStore.currentSlotId) {
    savesStore.saveGame(gameStore.currentSlotId, playerStore.companyName)
  }

  // 10. End Game Checks
  let gameStatus = 'normal'
  if (bankStore.missedPayments >= 3 || bankStore.insolventMonths >= 3) {
    gameStatus = 'bankrupt'
  } else if (gameStore.year >= 2008) {
    gameStatus = 'victory'
  }

  return { newsEvent, gameStatus }
}

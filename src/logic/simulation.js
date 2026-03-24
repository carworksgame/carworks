import { useGameStore } from '../stores/game'
import { usePlayerStore } from '../stores/player'
import { useWorldStore } from '../stores/world'
import { useResearchStore } from '../stores/research'
import { useDesignStore, VEHICLE_CLASSES } from '../stores/design'
import { useMarketingStore } from '../stores/marketing'
import { useCompetitorStore } from '../stores/competitors'
import { useSavesStore } from '../stores/saves'
import { useBankStore } from '../stores/bank'
import { useDebugStore } from '../stores/debug'
import { useReportsStore } from '../stores/reports'

export function getMarketSegments(year) {
  if (year < 1925) {
    return { [VEHICLE_CLASSES.UTILITY]: 0.7, [VEHICLE_CLASSES.ECONOMY]: 0.3 }
  } else if (year < 1945) {
    return { [VEHICLE_CLASSES.ECONOMY]: 0.4, [VEHICLE_CLASSES.UTILITY]: 0.3, [VEHICLE_CLASSES.LUXURY]: 0.3 }
  } else if (year < 1970) {
    return { [VEHICLE_CLASSES.LUXURY]: 0.4, [VEHICLE_CLASSES.SPORT]: 0.2, [VEHICLE_CLASSES.ECONOMY]: 0.2, [VEHICLE_CLASSES.UTILITY]: 0.2 }
  } else if (year < 1985) {
    return { [VEHICLE_CLASSES.ECONOMY]: 0.6, [VEHICLE_CLASSES.LUXURY]: 0.15, [VEHICLE_CLASSES.SPORT]: 0.15, [VEHICLE_CLASSES.UTILITY]: 0.1 }
  } else {
    return { [VEHICLE_CLASSES.ECONOMY]: 0.3, [VEHICLE_CLASSES.UTILITY]: 0.3, [VEHICLE_CLASSES.LUXURY]: 0.2, [VEHICLE_CLASSES.SPORT]: 0.2 }
  }
}

export function getBaseMarketPrice(year) {
  if (year < 1920) return 800
  if (year < 1940) return 1500
  if (year < 1960) return 3500
  if (year < 1980) return 8500
  if (year < 2000) return 18000
  return 25000
}

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
  const debugStore = useDebugStore()
  const reportsStore = useReportsStore()

  const turnSnapshot = { production: {}, sales: {}, year: gameStore.year }
  const lastTurnData = {
    turn: gameStore.turnCount,
    date: gameStore.dateString,
    incomeByModel: {},
    incomeByRegion: {},
    modelReport: {},
    modelComparison: {}
  }
  const companyStats = {
    player: { name: playerStore.companyName, production: 0, sales: 0, profit: 0 }
  }

  const aiFinanceMap = {}
  competitorStore.competitors.forEach(c => {
    aiFinanceMap[c.id] = { income: 0, productionCosts: 0, shipping: 0, salaries: 0, maintenance: 0, lease: 0, research: c.researchInvestment || 0 }
    companyStats[c.id] = { name: c.name, production: 0, sales: 0, profit: 0 }
  })

  console.log('--- Processing End of Turn ---')
  
  // 0. Update Talent Pools (Based on satisfaction)
  worldStore.territories.forEach(territory => {
    // Basic growth: population based
    let growth = Math.floor(territory.population / 1000000) * 5
    
    // Satisfaction impact (Player is the main driver of satisfaction news in a region)
    // Find if player has a factory here
    const factory = playerStore.factories.find(f => f.territory === territory.id)
    if (factory) {
      const satisfaction = playerStore.getFactorySatisfaction(factory.id)
      growth = Math.floor(growth * (satisfaction / 1.0))
    }
    
    territory.talentPool = Math.min(5000, territory.talentPool + growth)
  })

  researchStore.updateAvailableTech(gameStore.year)
  competitorStore.processAITurns(gameStore.year, researchStore.availableTech)

  const techProd = playerStore.getTechnicianProductivity
  const originalProgressPerTech = researchStore.progressPerTech
  researchStore.progressPerTech = Math.round(originalProgressPerTech * techProd)
  const completedTechs = researchStore.progressResearch()
  if (completedTechs && completedTechs.length > 0) {
    if (!gameStore.lastNewsEvent) {
       gameStore.setNews({ title: 'R&D BREAKTHROUGH!', description: `Our technicians have successfully developed ${completedTechs[0]}!`, type: 'growth' })
    }
  }
  researchStore.progressPerTech = originalProgressPerTech 

  marketingStore.processMonthlyBrandGrowth()

  // 3. Unified Production Simulation
  let totalProductionCosts = 0
  let totalShippingCosts = 0
  const activeModels = designStore.models
  const factoryAggregator = {}
  
  playerStore.factories.forEach(f => {
    const satisfaction = playerStore.getFactorySatisfaction(f.id)
    let strikeBonus = 1.0
    if (satisfaction < 0.7 && Math.random() < 0.1) {
      strikeBonus = 0 
      gameStore.setNews({ title: `STRIKE in ${f.location}!`, description: 'Workers are striking for better pay.', type: 'crisis' })
    }
    const productivity = playerStore.getFactoryProductivity(f.id) * strikeBonus
    factoryAggregator[f.id] = { owner: 'player', productivity, territory: f.territory, level: f.level, requests: [] }
    turnSnapshot.production[f.id] = { owner: 'Player', location: f.location, capacity: f.totalWorkers * productivity, totalRequested: 0, actualOutput: 0 }
  })

  competitorStore.competitors.forEach(comp => {
    comp.factories.forEach(f => {
      const productivity = f.productivity
      factoryAggregator[f.id] = { owner: comp.id, productivity, territory: f.territory, level: f.level, requests: [] }
      turnSnapshot.production[f.id] = { owner: comp.name, location: f.location, capacity: f.employees * productivity, totalRequested: 0, actualOutput: 0 }
      aiFinanceMap[comp.id].salaries += f.employees * (f.salary || 50)
      aiFinanceMap[comp.id].maintenance += 500
    })
    const activeTerritories = worldStore.territories.filter(t => t.active)
    aiFinanceMap[comp.id].lease += activeTerritories.length * 200
  })

  // Player Production Requests (Assigned Workers)
  activeModels.forEach(model => {
    worldStore.territories.forEach(salesTerritory => {
      const config = playerStore.productionConfig[model.id]?.[salesTerritory.id] || { assignedWorkers: 0 }
      if (config.assignedWorkers > 0) {
        const factoryId = playerStore.supplyLines[salesTerritory.id]
        if (factoryId && factoryAggregator[factoryId]) {
          factoryAggregator[factoryId].requests.push({ model, salesTerritoryId: salesTerritory.id, workers: config.assignedWorkers })
          turnSnapshot.production[factoryId].totalRequested += Math.floor(config.assignedWorkers * factoryAggregator[factoryId].productivity)
        }
      }
    })
  })

  // AI Requests
  const activeTerritoryIds = worldStore.territories.filter(t => t.active).map(t => t.id)
  competitorStore.competitors.forEach(comp => {
    const compModel = comp.models[0]
    comp.factories.forEach(f => {
      const workersPerTerritory = Math.floor(f.employees / (activeTerritoryIds.length || 1))
      activeTerritoryIds.forEach(tId => {
        factoryAggregator[f.id].requests.push({ owner: comp.id, model: compModel, salesTerritoryId: tId, workers: workersPerTerritory })
        turnSnapshot.production[f.id].totalRequested += Math.floor(workersPerTerritory * factoryAggregator[f.id].productivity)
      })
    })
  })

  // Process Production
  Object.keys(factoryAggregator).forEach(fId => {
    const factory = factoryAggregator[fId]
    factory.requests.forEach(req => {
      const actualProduction = Math.floor(req.workers * factory.productivity)
      if (actualProduction > 0) {
        const unitCostDiscount = 1 - ((factory.level - 1) * 0.05)
        const finalUnitCost = Math.round(req.model.cost * worldStore.inflationMultiplier * unitCostDiscount)
        const shipRate = worldStore.getShippingCost(factory.territory, req.salesTerritoryId)
        const shipCost = actualProduction * shipRate

        companyStats[factory.owner].production += actualProduction

        if (factory.owner === 'player') {
          totalProductionCosts += finalUnitCost * actualProduction
          totalShippingCosts += shipCost
          playerStore.addToInventory(req.model.id, req.salesTerritoryId, actualProduction)
          if (!lastTurnData.modelReport[req.model.name]) lastTurnData.modelReport[req.model.name] = {}
          const territoryName = worldStore.territories.find(t => t.id === req.salesTerritoryId)?.name || req.salesTerritoryId
          if (!lastTurnData.modelReport[req.model.name][territoryName]) lastTurnData.modelReport[req.model.name][territoryName] = { built: 0, sold: 0, stock: 0 }
          lastTurnData.modelReport[req.model.name][territoryName].built += actualProduction
        } else {
          aiFinanceMap[factory.owner].productionCosts += finalUnitCost * actualProduction
          aiFinanceMap[factory.owner].shipping += shipCost
          competitorStore.addToInventory(factory.owner, req.model.id, req.salesTerritoryId, actualProduction)
        }
        turnSnapshot.production[fId].actualOutput += actualProduction
      }
    })
  })

  // 4. Sales Simulation
  let totalSalesIncome = 0
  const shares = { player: 0 }
  const segments = getMarketSegments(gameStore.year)
  const baseMarketPrice = getBaseMarketPrice(gameStore.year)
  const reputationFactor = playerStore.reputation / 50 

  worldStore.territories.forEach(territory => {
    if (!territory.active) return
    const territoryDemandBase = (territory.population / 100000) * territory.wealth * worldStore.globalDemandMultiplier
    const regAwareness = marketingStore.getAwareness(territory.id)
    turnSnapshot.sales[territory.id] = { name: territory.name, segments: {} }

    Object.keys(segments).forEach(segmentClass => {
      const segmentShare = segments[segmentClass]
      const segmentDemand = territoryDemandBase * segmentShare
      const availableModels = []
      turnSnapshot.sales[territory.id].segments[segmentClass] = { demand: Math.floor(segmentDemand), models: [] }
      if (!lastTurnData.modelComparison[territory.name]) lastTurnData.modelComparison[territory.name] = {}
      lastTurnData.modelComparison[territory.name][segmentClass] = []

      activeModels.forEach(m => {
        const inventory = playerStore.inventory[m.id]?.[territory.id] || 0
        const config = playerStore.productionConfig[m.id]?.[territory.id] || { price: 0 }
        if (inventory > 0 && config.price > 0) {
          const modelBoost = marketingStore.getBoostForModel(m.id, territory.id)
          availableModels.push({
            ownerId: 'player', modelId: m.id, name: m.name, vehicleClass: m.vehicleClass || VEHICLE_CLASSES.UTILITY,
            price: config.price, stats: m.stats, inventory, marketingBoost: modelBoost * (1 + (regAwareness / 100)) * reputationFactor
          })
        }
      })

      competitorStore.competitors.forEach(comp => {
        comp.models.forEach(m => {
          const inventory = comp.regionalInventory[m.id]?.[territory.id] || 0
          if (inventory > 0) {
            availableModels.push({
              ownerId: comp.id, modelId: m.id, name: m.name, vehicleClass: m.vehicleClass || VEHICLE_CLASSES.UTILITY,
              price: Math.round(m.price * worldStore.inflationMultiplier), stats: m.stats, inventory, marketingBoost: 1.2
            })
          }
        })
      })

      if (availableModels.length === 0) return

      function calculateDesirability(m, targetSegment) {
        const isCorrectClass = m.vehicleClass === targetSegment
        let classMultiplier = isCorrectClass ? 2.0 : 0.2
        let maxPriceFactor = 2.0
        if (targetSegment === VEHICLE_CLASSES.ECONOMY) maxPriceFactor = 1.2
        if (targetSegment === VEHICLE_CLASSES.LUXURY) maxPriceFactor = 5.0
        if (targetSegment === VEHICLE_CLASSES.SPORT) maxPriceFactor = 3.5
        if (targetSegment === VEHICLE_CLASSES.UTILITY) maxPriceFactor = 1.8
        const affordabilityCap = baseMarketPrice * maxPriceFactor
        let stickerShock = 1.0
        if (m.price > affordabilityCap) {
          const overageRatio = m.price / (affordabilityCap || 1)
          stickerShock = Math.pow(0.1, overageRatio * 2)
          if (isNaN(stickerShock)) stickerShock = 0.0001
          classMultiplier *= stickerShock
        }
        const economy = m.stats.realEconomy !== undefined ? m.stats.realEconomy : m.stats.economy
        const safety = m.stats.realSafety !== undefined ? m.stats.realSafety : m.stats.safety
        let perfWeight = 1.0, econWeight = 1.0, safetyWeight = 1.0, priceWeight = 1.0
        if (targetSegment === VEHICLE_CLASSES.ECONOMY) { priceWeight = 4.0; econWeight = 2.5; perfWeight = 0.5 }
        else if (targetSegment === VEHICLE_CLASSES.LUXURY) { priceWeight = 0.3; safetyWeight = 3.5; perfWeight = 1.5 }
        else if (targetSegment === VEHICLE_CLASSES.SPORT) { perfWeight = 4.0; priceWeight = 1.2; econWeight = 0.2 }
        else if (targetSegment === VEHICLE_CLASSES.UTILITY) { perfWeight = 1.0; econWeight = 1.0; safetyWeight = 2.0 }
        const perfScore = (m.stats.pwrRatio * perfWeight)
        const econScore = (economy * econWeight)
        const safetyScore = (safety / 5 * safetyWeight)
        const baseScore = (perfScore + econScore + safetyScore) * classMultiplier
        const priceFactor = (m.price / (baseMarketPrice / 2)) * priceWeight
        const value = (baseScore / (priceFactor || 1)) || 0.00001 
        m.debugData = { affordabilityCap, stickerShock, priceFactor }
        return isNaN(value) ? 0.00001 : value
      }

      availableModels.forEach(m => { 
        m.desirability = calculateDesirability(m, segmentClass) 
        lastTurnData.modelComparison[territory.name][segmentClass].push({
          owner: companyStats[m.ownerId]?.name || m.ownerId, model: m.name, price: m.price, desirability: m.desirability
        })
      })

      const totalDesirability = availableModels.reduce((acc, m) => acc + m.desirability, 0)
      availableModels.forEach(m => {
        const shareOfPool = m.desirability / (totalDesirability || 1)
        const salesPotential = segmentDemand * shareOfPool
        let actualSales = Math.min(m.inventory, Math.floor(salesPotential * (0.8 + Math.random() * 0.4)))
        if (isNaN(actualSales)) actualSales = 0
        companyStats[m.ownerId].sales += actualSales
        if (m.ownerId === 'player') {
          totalSalesIncome += actualSales * m.price
          playerStore.removeFromInventory(m.modelId, territory.id, actualSales)
          shares.player += actualSales
          if (!lastTurnData.incomeByModel[m.name]) lastTurnData.incomeByModel[m.name] = 0
          lastTurnData.incomeByModel[m.name] += actualSales * m.price
          if (!lastTurnData.incomeByRegion[territory.name]) lastTurnData.incomeByRegion[territory.name] = 0
          lastTurnData.incomeByRegion[territory.name] += actualSales * m.price
          if (!lastTurnData.modelReport[m.name]) lastTurnData.modelReport[m.name] = {}
          if (!lastTurnData.modelReport[m.name][territory.name]) lastTurnData.modelReport[m.name][territory.name] = { built: 0, sold: 0, stock: 0 }
          lastTurnData.modelReport[m.name][territory.name].sold += actualSales

          const safety = m.stats.realSafety || m.stats.safety
          const durability = m.stats.durability || 30
          const riskProbability = ((100 - safety) + (100 - durability)) * (actualSales / 10000)
          if (Math.random() < (riskProbability / 100)) {
             designStore.addIssue({
               modelId: m.modelId, modelName: m.name, territoryId: territory.id, territoryName: territory.name,
               type: Math.random() > 0.5 ? 'Safety Defect' : 'Reliability Failure',
               costToFix: Math.round(actualSales * (m.price * 0.15))
             })
             gameStore.setNews({ title: `SCANDAL: ${m.name}!`, description: `Reports of ${m.name} failures in ${territory.name} are trending. Reputation at risk!`, type: 'crisis' })
          }
        } else {
          if (!shares[m.ownerId]) shares[m.ownerId] = 0
          shares[m.ownerId] += actualSales
          aiFinanceMap[m.ownerId].income += actualSales * m.price
          competitorStore.removeFromInventory(m.ownerId, m.modelId, territory.id, actualSales)
        }
        turnSnapshot.sales[territory.id].segments[segmentClass].models.push({
          name: m.name, owner: companyStats[m.ownerId]?.name || m.ownerId, desirability: m.desirability, share: shareOfPool,
          potential: Math.floor(salesPotential), actual: actualSales, price: m.price, inventory: m.inventory, pricing: m.debugData
        })
      })
    })
  })

  Object.keys(lastTurnData.modelReport).forEach(mName => {
    const model = activeModels.find(m => m.name === mName)
    if (model) {
      Object.keys(lastTurnData.modelReport[mName]).forEach(tName => {
        const territory = worldStore.territories.find(t => t.name === tName)
        if (territory) lastTurnData.modelReport[mName][tName].stock = playerStore.inventory[model.id]?.[territory.id] || 0
      })
    }
  })

  const totalSalesThisTurn = Object.values(shares).reduce((a, b) => a + b, 0)
  const normalizedShares = {}
  Object.keys(shares).forEach(id => { normalizedShares[id] = Math.round((shares[id] / (totalSalesThisTurn || 1)) * 100) })
  competitorStore.updateMarketShare(normalizedShares)

  if (shares.player > 0) playerStore.changeReputation(0.1)
  playerStore.addReputationHistory(gameStore.dateString)

  const currentExpo = worldStore.upcomingExpos.find(e => e.year === gameStore.year && e.month === gameStore.month)
  if (currentExpo) {
    let resultTitle = 'Expo results are in!', resultDesc = `The ${currentExpo.name} has concluded.`, win = false
    if (worldStore.participatingModelId) {
      const model = activeModels.find(m => m.id === worldStore.participatingModelId)
      if (model) {
        const expoScore = (model.stats.realSafety || 50) + (model.stats.pwrRatio * 5) + playerStore.reputation
        const winThreshold = 150 + (Math.random() * 100)
        if (expoScore > winThreshold) {
          win = true; playerStore.changeReputation(10)
          marketingStore.regionalAwareness[currentExpo.territoryId] = Math.min(100, (marketingStore.regionalAwareness[currentExpo.territoryId] || 0) + 25)
          resultTitle = `VICTORY AT ${currentExpo.name.toUpperCase()}!`; resultDesc = `Your ${model.name} was the star of the show! Global reputation and regional brand awareness have surged.`
        } else resultDesc = `Your ${model.name} received modest praise, but did not win Best in Show.`
      }
    } else resultDesc = 'You did not participate in the expo. Missed opportunity for prestige!'
    gameStore.setNews({ title: resultTitle, description: resultDesc, type: win ? 'growth' : 'recovery' })
    worldStore.clearExpos()
  }

  if (worldStore.upcomingExpos.length === 0 && gameStore.turnCount % 24 === 0) {
    const randomTerritory = worldStore.territories[Math.floor(Math.random() * worldStore.territories.length)]
    const expoYear = gameStore.year + 1, expoMonth = Math.floor(Math.random() * 12), expoName = `${randomTerritory.name} Auto Show ${expoYear}`
    worldStore.scheduleExpo(expoName, randomTerritory.id, expoYear, expoMonth)
  }

  competitorStore.processMonthlyFinances(aiFinanceMap)
  playerStore.processMonthlyFinances({
    turn: gameStore.turnCount, date: gameStore.dateString, marketingCost: marketingStore.totalMonthlyMarketingCost,
    productionCosts: totalProductionCosts, shippingCosts: totalShippingCosts, salesIncome: totalSalesIncome, recallCosts: 0 
  })

  companyStats.player.profit = playerStore.lastMonthPerformance.net
  competitorStore.competitors.forEach(c => { companyStats[c.id].profit = c.lastTurnLedger.net })
  reportsStore.addHistoryRecord({ turn: gameStore.turnCount, date: gameStore.dateString, companies: companyStats })
  reportsStore.setLastTurnData(lastTurnData)

  bankStore.processMonthlyBank()
  const newsEvent = worldStore.updateWorldState(gameStore.year, gameStore.month)
  if (newsEvent) gameStore.setNews(newsEvent)

  gameStore.nextTurn()
  playerStore.clearReports()
  
  // FINAL STEP: Recalculate idle workers after turn adjustments
  playerStore.recalculateIdleWorkers()
  
  debugStore.setSnapshot(turnSnapshot)
  if (gameStore.currentSlotId) savesStore.saveGame(gameStore.currentSlotId, playerStore.companyName)

  let gameStatus = 'normal'
  if (bankStore.missedPayments >= 3 || bankStore.insolventMonths >= 3) gameStatus = 'bankrupt'
  else if (gameStore.year >= 2008) gameStatus = 'victory'

  return { newsEvent, gameStatus }
}

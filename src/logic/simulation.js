import { useGameStore } from '../stores/game'
import { usePlayerStore } from '../stores/player'
import { useWorldStore } from '../stores/world'
import { useResearchStore } from '../stores/research'
import { useDesignStore, VEHICLE_CLASSES } from '../stores/design'
import { useMarketingStore } from '../stores/marketing'
import { useCompetitorStore } from '../stores/competitors'
import { useBankStore } from '../stores/bank'
import { useDebugStore } from '../stores/debug'
import { useReportsStore } from '../stores/reports'

export function getMarketSegments(year) {
  if (year < 1925) return { [VEHICLE_CLASSES.UTILITY]: 0.7, [VEHICLE_CLASSES.ECONOMY]: 0.3 }
  else if (year < 1945) return { [VEHICLE_CLASSES.ECONOMY]: 0.4, [VEHICLE_CLASSES.UTILITY]: 0.3, [VEHICLE_CLASSES.LUXURY]: 0.3 }
  else if (year < 1970) return { [VEHICLE_CLASSES.LUXURY]: 0.4, [VEHICLE_CLASSES.SPORT]: 0.2, [VEHICLE_CLASSES.ECONOMY]: 0.2, [VEHICLE_CLASSES.UTILITY]: 0.2 }
  else if (year < 1985) return { [VEHICLE_CLASSES.ECONOMY]: 0.6, [VEHICLE_CLASSES.LUXURY]: 0.15, [VEHICLE_CLASSES.SPORT]: 0.15, [VEHICLE_CLASSES.UTILITY]: 0.1 }
  else return { [VEHICLE_CLASSES.ECONOMY]: 0.3, [VEHICLE_CLASSES.UTILITY]: 0.3, [VEHICLE_CLASSES.LUXURY]: 0.2, [VEHICLE_CLASSES.SPORT]: 0.2 }
}

export function getBaseMarketPrice(year) {
  if (year < 1920) return 800
  if (year < 1940) return 1500
  if (year < 1960) return 3500
  if (year < 1980) return 8500
  if (year < 2000) return 18000
  return 25000
}

export function processEndTurn(savesStore) {
  const gameStore = useGameStore()
  const playerStore = usePlayerStore()
  const worldStore = useWorldStore()
  const researchStore = useResearchStore()
  const designStore = useDesignStore()
  const marketingStore = useMarketingStore()
  const competitorStore = useCompetitorStore()
  const bankStore = useBankStore()
  const debugStore = useDebugStore()
  const reportsStore = useReportsStore()

  const turnSnapshot = { production: {}, sales: {}, year: gameStore.year }
  const lastTurnData = {
    turn: gameStore.turnCount, date: gameStore.dateString,
    incomeByModel: {}, incomeByRegion: {}, modelReport: {}, modelComparison: {}
  }
  const companyStats = {
    player: { name: playerStore.companyName, production: 0, sales: 0, profit: 0 }
  }

  const aiFinanceMap = {}
  competitorStore.competitors.forEach(c => {
    aiFinanceMap[c.id] = { income: 0, productionCosts: 0, shipping: 0, salaries: 0, maintenance: 0, lease: 0, research: c.researchInvestment || 0 }
    companyStats[c.id] = { name: c.name, production: 0, sales: 0, profit: 0 }
  })

  // 0. Update Talent Pools
  worldStore.territories.forEach(territory => {
    let growth = Math.floor(territory.population / 1000000) * 5
    const factory = playerStore.factories.find(f => f.territory === territory.id)
    if (factory) {
      const satisfaction = playerStore.getFactorySatisfaction(factory.id)
      growth = Math.floor(growth * (satisfaction / 1.0))
    }
    territory.talentPool = Math.min(5000, territory.talentPool + growth)
  })

  // Emergent Rivals
  let emergentEvent = null
  if (gameStore.turnCount > 0 && gameStore.turnCount % 300 === 0 && competitorStore.competitors.length < 4) {
    const newRival = competitorStore.spawnNewRival()
    if (newRival) emergentEvent = { title: 'NEW COMPETITOR!', description: `${newRival.name} has been founded!`, type: 'competition' }
  }

  researchStore.updateAvailableTech(gameStore.year)
  competitorStore.processAITurns(gameStore.year, researchStore.availableTech)

  const techProd = playerStore.getTechnicianProductivity
  researchStore.progressPerTech = Math.round(200 * techProd) 
  researchStore.progressResearch()

  marketingStore.processMonthlyBrandGrowth()

  // 3. PRODUCTION
  let totalProductionCosts = 0
  const factoryModelPools = {} 
  
  playerStore.factories.forEach(f => {
    const productivity = playerStore.getFactoryProductivity(f.id)
    const assignments = playerStore.factoryAssignments[f.id] || {}
    factoryModelPools[f.id] = {}
    
    let factoryTotalOutput = 0
    Object.keys(assignments).forEach(mId => {
      const workers = assignments[mId]
      const model = designStore.models.find(m => m.id == mId)
      if (workers > 0 && model && !model.archived) {
        const output = Math.floor(workers * productivity)
        factoryModelPools[f.id][mId] = output
        const unitCostDiscount = 1 - ((f.level - 1) * 0.05)
        const finalUnitCost = Math.round(model.cost * worldStore.inflationMultiplier * unitCostDiscount)
        totalProductionCosts += output * finalUnitCost
        companyStats.player.production += output
        factoryTotalOutput += output

        // Initialize Model Report with "Built" in the territory where the factory is located
        const mName = model.name
        const tName = worldStore.territories.find(t => t.id === f.territory).name
        if (!lastTurnData.modelReport[mName]) lastTurnData.modelReport[mName] = {}
        if (!lastTurnData.modelReport[mName][tName]) lastTurnData.modelReport[mName][tName] = { built: 0, sold: 0, stock: 0 }
        lastTurnData.modelReport[mName][tName].built += output
      }
    })
    turnSnapshot.production[f.id] = { owner: 'Player', location: f.location, capacity: f.totalWorkers * productivity, actualOutput: factoryTotalOutput }
  })

  // AI Production & Logistics
  competitorStore.competitors.forEach(comp => {
    const compModel = comp.models[0]
    aiFinanceMap[comp.id].salaries += comp.factories[0].employees * (comp.factories[0].salary || 50)
    aiFinanceMap[comp.id].maintenance += 500
    
    const totalProd = Math.floor(comp.factories[0].employees * comp.factories[0].productivity)
    aiFinanceMap[comp.id].productionCosts += totalProd * Math.round(compModel.cost * worldStore.inflationMultiplier)
    companyStats[comp.id].production = totalProd

    // AI Dynamic Shipping
    const unlocked = comp.unlockedTerritories || [comp.homeTerritory]
    const amountPerTerritory = Math.floor(totalProd / unlocked.length)
    unlocked.forEach(tId => {
      competitorStore.addToInventory(comp.id, compModel.id, tId, amountPerTerritory)
      if (tId !== comp.homeTerritory) {
        const shipRate = worldStore.getShippingCost(comp.homeTerritory, tId)
        aiFinanceMap[comp.id].shipping += amountPerTerritory * shipRate
      }
    })
  })

  // 4. DISTRIBUTION & SALES
  let totalSalesIncome = 0, totalShippingCosts = 0
  const shares = { player: 0 }
  const segments = getMarketSegments(gameStore.year)
  const baseMarketPrice = getBaseMarketPrice(gameStore.year)
  const playerReputationFactor = playerStore.reputation / 50 

  // PRE-PASS: Calculate Demand
  const regionalModelDemand = {}
  worldStore.territories.forEach(territory => {
    if (!territory.active) return
    regionalModelDemand[territory.id] = {}
    const territoryDemandBase = (territory.population / 100000) * territory.wealth * worldStore.globalDemandMultiplier
    const regAwareness = marketingStore.getAwareness(territory.id)
    const showroomCount = playerStore.regionalShowrooms[territory.id] || 0
    const presenceFactor = 1.0 + (showroomCount * 0.05)

    Object.keys(segments).forEach(segmentClass => {
      const segmentShare = segments[segmentClass]
      const segmentDemandBase = territoryDemandBase * segmentShare
      designStore.activeModels.forEach(m => {
        if (m.vehicleClass !== segmentClass) return
        const dist = playerStore.regionalDistribution[territory.id]?.[m.id]
        if (!dist || dist.price <= 0) return
        let classMultiplier = 2.0
        let maxPriceFactor = m.vehicleClass === VEHICLE_CLASSES.LUXURY ? 5.0 : 2.0
        const affordabilityCap = baseMarketPrice * maxPriceFactor
        if (dist.price > affordabilityCap) {
          const stickerShock = Math.max(0.0001, Math.pow(0.1, (dist.price / (affordabilityCap || 1)) * 2))
          classMultiplier *= stickerShock
        }
        const modelBoost = marketingStore.getBoostForModel(m.id, territory.id)
        const economy = m.stats.realEconomy !== undefined ? m.stats.realEconomy : (m.stats.economy || 10)
        const safety = m.stats.realSafety !== undefined ? m.stats.realSafety : (m.stats.safety || 10)
        const perfWeight = m.vehicleClass === VEHICLE_CLASSES.SPORT ? 4.0 : 1.0
        const econWeight = m.vehicleClass === VEHICLE_CLASSES.ECONOMY ? 2.5 : 1.0
        const baseScore = ((m.stats.pwrRatio * perfWeight) + (economy * econWeight) + (safety / 5)) * classMultiplier
        const priceFactor = (dist.price / (baseMarketPrice / 2))
        const desirability = (baseScore / (priceFactor || 1)) * modelBoost * (1 + (regAwareness / 100)) * playerReputationFactor * presenceFactor
        const demand = Math.floor(segmentDemandBase * Math.min(1.0, desirability / 10))
        regionalModelDemand[territory.id][m.id] = (regionalModelDemand[territory.id][m.id] || 0) + demand
      })
    })
  })

  // DISTRIBUTION EXECUTION
  const distributeModel = (mId, passFunc) => {
    const candidates = []
    let totalDemandInPass = 0
    worldStore.territories.forEach(t => {
      if (!t.active) return
      const fId = passFunc(t.id, mId); if (fId && factoryModelPools[fId]?.[mId] > 0) {
        const demand = Math.max(0, (regionalModelDemand[t.id][mId] || 0) - playerStore.getInventory(mId, t.id))
        if (demand > 0) { candidates.push({ tId: t.id, fId, demand }); totalDemandInPass += demand }
      }
    })
    candidates.forEach(c => {
      const pool = factoryModelPools[c.fId][mId]
      const shareOfPool = totalDemandInPass > 0 ? (c.demand / totalDemandInPass) : 0
      const amountToMove = Math.floor(Math.min(pool * shareOfPool, c.demand))
      if (amountToMove > 0) {
        factoryModelPools[c.fId][mId] -= amountToMove
        playerStore.addToInventory(mId, c.tId, amountToMove)
        regionalModelDemand[c.tId][mId] -= amountToMove
        const factory = playerStore.factories.find(f => f.id == c.fId)
        totalShippingCosts += amountToMove * worldStore.getShippingCost(factory.territory, c.tId)
        const mName = designStore.models.find(m => m.id == mId).name
        const tName = worldStore.territories.find(t => t.id === c.tId).name
        if (!lastTurnData.modelReport[mName]) lastTurnData.modelReport[mName] = {}
        if (!lastTurnData.modelReport[mName][tName]) lastTurnData.modelReport[mName][tName] = { built: 0, sold: 0, stock: 0 }
      }
    })
  }

  designStore.activeModels.forEach(model => {
    distributeModel(model.id, (tId, mId) => {
      const pri1 = playerStore.regionalDistribution[tId]?.[mId]?.priorities[0]
      const factory = playerStore.factories.find(f => f.id == pri1)
      return (factory && factory.territory === tId) ? pri1 : null
    })
    distributeModel(model.id, (tId, mId) => playerStore.regionalDistribution[tId]?.[mId]?.priorities[0])
    distributeModel(model.id, (tId, mId) => playerStore.regionalDistribution[tId]?.[mId]?.priorities[1])
    distributeModel(model.id, (tId, mId) => playerStore.regionalDistribution[tId]?.[mId]?.priorities[2])

    // SURPLUS HANDLING: Add remaining production to the factory's local territory inventory
    playerStore.factories.forEach(f => {
      const surplus = factoryModelPools[f.id]?.[model.id] || 0
      if (surplus > 0) {
        playerStore.addToInventory(model.id, f.territory, surplus)
        factoryModelPools[f.id][model.id] = 0
      }
    })
  })

  // 5. SALES EXECUTION
  worldStore.territories.forEach(territory => {
    if (!territory.active) return
    const territoryDemandBase = (territory.population / 100000) * territory.wealth * worldStore.globalDemandMultiplier
    const playerRegAwareness = marketingStore.getAwareness(territory.id)
    const playerPresenceFactor = 1.0 + ((playerStore.regionalShowrooms[territory.id] || 0) * 0.05)
    turnSnapshot.sales[territory.id] = { name: territory.name, segments: {} }

    Object.keys(segments).forEach(segmentClass => {
      const segmentShare = segments[segmentClass], segmentDemand = territoryDemandBase * segmentShare
      const availableModels = []
      turnSnapshot.sales[territory.id].segments[segmentClass] = { demand: Math.floor(segmentDemand), models: [] }
      if (!lastTurnData.modelComparison[territory.name]) lastTurnData.modelComparison[territory.name] = {}
      lastTurnData.modelComparison[territory.name][segmentClass] = []

      designStore.activeModels.forEach(m => {
        const inventory = playerStore.inventory[m.id]?.[territory.id] || 0
        const config = playerStore.regionalDistribution[territory.id]?.[m.id]
        if (inventory > 0 && config && config.price > 0) {
          const modelBoost = marketingStore.getBoostForModel(m.id, territory.id)
          availableModels.push({
            ownerId: 'player', modelId: m.id, name: m.name, vehicleClass: m.vehicleClass || VEHICLE_CLASSES.UTILITY,
            price: config.price, stats: m.stats, inventory, marketingBoost: modelBoost * (1 + (playerRegAwareness / 100)) * playerReputationFactor * playerPresenceFactor,
            presenceFactor: playerPresenceFactor
          })
        }
      })

      competitorStore.competitors.forEach(comp => {
        comp.models.forEach(m => {
          const inventory = comp.regionalInventory[m.id]?.[territory.id] || 0
          if (inventory > 0) {
            const compPresence = 1.0 + ((comp.regionalShowrooms[territory.id] || 0) * 0.05)
            availableModels.push({
              ownerId: comp.id, modelId: m.id, name: m.name, vehicleClass: m.vehicleClass || VEHICLE_CLASSES.UTILITY,
              price: Math.round(m.price * worldStore.inflationMultiplier), stats: m.stats, inventory, marketingBoost: 1.2 * (comp.reputation / 50) * compPresence,
              presenceFactor: compPresence
            })
          }
        })
      })

      if (availableModels.length === 0) return

      function calculateDesirability(m, targetSegment) {
        const isCorrectClass = m.vehicleClass === targetSegment
        let classMultiplier = isCorrectClass ? 2.0 : 0.2
        let maxPriceFactor = targetSegment === VEHICLE_CLASSES.LUXURY ? 5.0 : 2.0
        const affordabilityCap = baseMarketPrice * maxPriceFactor
        let stickerShock = 1.0
        if (m.price > affordabilityCap) {
          stickerShock = Math.pow(0.1, (m.price / (affordabilityCap || 1)) * 2)
          if (isNaN(stickerShock)) stickerShock = 0.0001
          classMultiplier *= stickerShock
        }
        const economy = m.stats.realEconomy !== undefined ? m.stats.realEconomy : (m.stats.economy || 10)
        const safety = m.stats.realSafety !== undefined ? m.stats.realSafety : (m.stats.safety || 10)
        const perfWeight = targetSegment === VEHICLE_CLASSES.SPORT ? 4.0 : 1.0
        const econWeight = targetSegment === VEHICLE_CLASSES.ECONOMY ? 2.5 : 1.0
        const baseScore = ((m.stats.pwrRatio * perfWeight) + (economy * econWeight) + (safety / 5)) * classMultiplier
        const priceFactor = (m.price / (baseMarketPrice / 2))
        const value = (baseScore / (priceFactor || 1)) || 0.00001 
        m.debugData = { affordabilityCap, stickerShock, presenceFactor: m.presenceFactor }
        return isNaN(value) ? 0.00001 : value
      }

      availableModels.forEach(m => { 
        m.desirability = calculateDesirability(m, segmentClass) 
        if (m.vehicleClass === segmentClass) {
          lastTurnData.modelComparison[territory.name][segmentClass].push({
            owner: companyStats[m.ownerId]?.name || m.ownerId, model: m.name, price: m.price, desirability: m.desirability
          })
        }
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
          playerStore.removeFromInventory(m.modelId, territory.id, actualSales); shares.player += actualSales
          if (!lastTurnData.incomeByModel[m.name]) lastTurnData.incomeByModel[m.name] = 0
          lastTurnData.incomeByModel[m.name] += actualSales * m.price
          if (!lastTurnData.incomeByRegion[territory.name]) lastTurnData.incomeByRegion[territory.name] = 0
          lastTurnData.incomeByRegion[territory.name] += actualSales * m.price
          if (!lastTurnData.modelReport[m.name]) lastTurnData.modelReport[m.name] = {}
          if (!lastTurnData.modelReport[m.name][territory.name]) lastTurnData.modelReport[m.name][territory.name] = { built: 0, sold: 0, stock: 0 }
          lastTurnData.modelReport[m.name][territory.name].sold += actualSales
        } else {
          shares[m.ownerId] = (shares[m.ownerId] || 0) + actualSales
          aiFinanceMap[m.ownerId].income += actualSales * m.price
          competitorStore.removeFromInventory(m.ownerId, m.modelId, territory.id, actualSales)
        }
        turnSnapshot.sales[territory.id].segments[segmentClass].models.push({
          name: m.name, owner: companyStats[m.ownerId]?.name || m.ownerId, desirability: m.desirability, share: shareOfPool,
          actual: actualSales, price: m.price, pricing: m.debugData
        })
      })
    })
  })

  // Final Reports & Finances
  Object.keys(lastTurnData.modelReport).forEach(mName => {
    const model = designStore.models.find(m => m.name === mName)
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
  let worldEvent = worldStore.updateWorldState(gameStore.year, gameStore.month)
  if (emergentEvent || worldEvent) gameStore.setNews(emergentEvent || worldEvent)

  gameStore.nextTurn()
  playerStore.clearReports(); playerStore.recalculateIdleWorkers()
  debugStore.setSnapshot(turnSnapshot)
  
  if (gameStore.currentSlotId) savesStore.saveGame(gameStore.currentSlotId, playerStore.companyName)

  let gameStatus = 'normal'
  if (bankStore.missedPayments >= 3 || bankStore.insolventMonths >= 3) gameStatus = 'bankrupt'
  else if (gameStore.year >= 2008) gameStatus = 'victory'

  return { newsEvent: emergentEvent || worldEvent, gameStatus }
}

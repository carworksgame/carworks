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
  if (year < 1920) return { [VEHICLE_CLASSES.UTILITY]: 0.65, [VEHICLE_CLASSES.ECONOMY]: 0.35 }
  else if (year < 1935) return { [VEHICLE_CLASSES.ECONOMY]: 0.4, [VEHICLE_CLASSES.UTILITY]: 0.35, [VEHICLE_CLASSES.LUXURY]: 0.25 }
  else if (year < 1970) return { [VEHICLE_CLASSES.LUXURY]: 0.35, [VEHICLE_CLASSES.SPORT]: 0.2, [VEHICLE_CLASSES.ECONOMY]: 0.25, [VEHICLE_CLASSES.UTILITY]: 0.2 }
  else if (year < 1985) return { [VEHICLE_CLASSES.ECONOMY]: 0.5, [VEHICLE_CLASSES.LUXURY]: 0.18, [VEHICLE_CLASSES.SPORT]: 0.17, [VEHICLE_CLASSES.UTILITY]: 0.15 }
  else return { [VEHICLE_CLASSES.ECONOMY]: 0.3, [VEHICLE_CLASSES.UTILITY]: 0.3, [VEHICLE_CLASSES.LUXURY]: 0.2, [VEHICLE_CLASSES.SPORT]: 0.2 }
}

/**
 * Era-adjusted baseline market price for a standard vehicle.
 * Scales smoothly with both technological complexity over the century and world inflation.
 */
export function getBaseMarketPrice(year, inflationMultiplier = 1.0) {
  const yearsElapsed = Math.max(0, year - 1900)
  // In 1900 dollars, average vehicle baseline grows from $750 (1900) to ~$1,550 (2008) as cars add tech,
  // then scales by the world inflationMultiplier.
  const base1900Price = 750 + (yearsElapsed * 7.5)
  return Math.round(base1900Price * inflationMultiplier)
}

/**
 * Shared desirability calculation used by both pre-distribution demand estimation and actual regional sales.
 */
function computeModelDesirability(m, targetSegment, year, baseMarketPrice) {
  const isCorrectClass = m.vehicleClass === targetSegment
  let classMultiplier = isCorrectClass ? 2.2 : 0.35

  const maxPriceFactors = {
    [VEHICLE_CLASSES.ECONOMY]: 1.65,
    [VEHICLE_CLASSES.UTILITY]: 2.2,
    [VEHICLE_CLASSES.SPORT]: 3.1,
    [VEHICLE_CLASSES.LUXURY]: 4.5
  }
  const maxPriceFactor = maxPriceFactors[targetSegment] || 2.0
  const affordabilityCap = Math.round(baseMarketPrice * maxPriceFactor)

  let stickerShock = 1.0
  if (m.price > affordabilityCap) {
    // Gradual penalty when exceeding the segment's affordability ceiling
    const overRatio = (m.price - affordabilityCap) / (affordabilityCap || 1)
    stickerShock = Math.max(0.001, Math.pow(0.15, overRatio * 2.5))
    classMultiplier *= stickerShock
  }

  const economy = m.stats.realEconomy !== undefined ? m.stats.realEconomy : (m.stats.economy || 10)
  const safety = m.stats.realSafety !== undefined ? m.stats.realSafety : (m.stats.safety || 10)
  const appeal = m.stats.appeal !== undefined ? m.stats.appeal : 10
  const durability = m.stats.durability !== undefined ? m.stats.durability : 30
  const pwrRatio = m.stats.pwrRatio || 10

  // Segment-specific stat weights so advanced engines, chassis, safety, and aesthetic features shine
  const weightsBySegment = {
    [VEHICLE_CLASSES.ECONOMY]: { perf: 1.0, econ: 2.8, safety: 0.5, appeal: 0.7, dur: 0.6, priceSensitivity: 1.25 },
    [VEHICLE_CLASSES.UTILITY]: { perf: 1.3, econ: 1.2, safety: 0.6, appeal: 0.5, dur: 1.5, priceSensitivity: 0.95 },
    [VEHICLE_CLASSES.SPORT]: { perf: 3.4, econ: 0.5, safety: 0.6, appeal: 1.4, dur: 0.5, priceSensitivity: 0.65 },
    [VEHICLE_CLASSES.LUXURY]: { perf: 1.6, econ: 0.5, safety: 1.4, appeal: 2.4, dur: 0.8, priceSensitivity: 0.45 }
  }
  const w = weightsBySegment[targetSegment] || weightsBySegment[VEHICLE_CLASSES.UTILITY]

  const rawQuality =
    (pwrRatio * w.perf) +
    (economy * w.econ) +
    (safety * w.safety) +
    (appeal * w.appeal) +
    (durability * w.dur)

  // Era Expectations & Model Age Obsolescence:
  // Consumers expect higher quality as decades advance, and designs older than 6 years gradually lose appeal
  const yearsSince1900 = Math.max(0, year - 1900)
  const expectedMinQuality = 30 + (yearsSince1900 * 1.6)
  const eraStandardFactor = rawQuality < expectedMinQuality
    ? Math.max(0.2, Math.pow(rawQuality / expectedMinQuality, 1.5))
    : 1.0 + Math.min(0.6, (rawQuality - expectedMinQuality) / (expectedMinQuality * 2))

  const modelAge = Math.max(0, year - (m.introduced || year))
  const ageFactor = modelAge <= 5 ? 1.0 : Math.max(0.35, Math.pow(0.92, modelAge - 5))

  // Price sensitivity depends on segment (Luxury & Sport buyers tolerate higher prices for higher quality)
  const normalizedPrice = Math.max(0.35, m.price / (baseMarketPrice * 0.75))
  const priceFactor = Math.pow(normalizedPrice, w.priceSensitivity)

  const marketingMultiplier = m.marketingBoost || 1.0
  const value = ((rawQuality * classMultiplier * eraStandardFactor * ageFactor * marketingMultiplier) / (priceFactor || 1)) || 0.0001

  return {
    desirability: isNaN(value) ? 0.0001 : value,
    debugData: { affordabilityCap, stickerShock, presenceFactor: m.presenceFactor || 1.0 }
  }
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

  const segments = getMarketSegments(gameStore.year)

  // Dynamic Rival & Market-Gap Spawning:
  // Check every 12 months (or if competition drops below 2 rivals) whether there is room/gap in the market
  let emergentEvent = null
  if (gameStore.turnCount > 0 && competitorStore.competitors.length < 4) {
    const activeSegmentKeys = Object.keys(segments)
    // Find any active segment that has no active model from either the player or existing non-distressed rivals
    const underservedSegment = activeSegmentKeys.find(seg => {
      const playerHas = designStore.activeModels.some(m => m.vehicleClass === seg)
      const rivalHas = competitorStore.competitors.some(c =>
        c.status !== 'distressed' && c.models.some(m => m.vehicleClass === seg)
      )
      return !playerHas && !rivalHas
    })

    const tooFewRivals = competitorStore.competitors.length < 2 && gameStore.turnCount % 12 === 0
    const gapSpawn = underservedSegment && gameStore.turnCount % 18 === 0 && Math.random() < 0.65
    const periodicSpawn = gameStore.turnCount % 72 === 0 && Math.random() < 0.5

    if (tooFewRivals || gapSpawn || periodicSpawn) {
      const targetSeg = underservedSegment || activeSegmentKeys[Math.floor(Math.random() * activeSegmentKeys.length)]
      const newRival = competitorStore.spawnNewRival(gameStore.year, targetSeg)
      if (newRival) {
        emergentEvent = {
          title: 'NEW COMPETITOR ENTERS MARKET!',
          description: `${newRival.name} has been founded to compete in the growing ${targetSeg} segment!`,
          type: 'competition'
        }
      }
    }
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

  researchStore.updateAvailableTech(gameStore.year)
  competitorStore.processAITurns(gameStore.year, researchStore.availableTech, segments)

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
        // Compute 1900 base cost from components so inflation is applied only once!
        const base1900Cost = model.baseCost1900 || designStore.getBaseComponentCost(model.components)
        const finalUnitCost = Math.round(base1900Cost * worldStore.inflationMultiplier * unitCostDiscount)
        model.cost = Math.round(base1900Cost * worldStore.inflationMultiplier)
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

  // AI Production & Logistics (Only ship to active territories and throttle when inventory is full)
  const activeTerritoryIds = worldStore.territories.filter(t => t.active).map(t => t.id)
  competitorStore.competitors.forEach(comp => {
    const compModel = comp.models[0]
    const factory = comp.factories[0]
    aiFinanceMap[comp.id].salaries += factory.employees * (factory.salary || 50)
    aiFinanceMap[comp.id].maintenance += 500

    // Determine active territories this competitor operates in (always including North America so they have an active market)
    const targetTerritories = activeTerritoryIds.filter(tId =>
      comp.unlockedTerritories?.includes(tId) || tId === 'north-america'
    )
    const destinationIds = targetTerritories.length > 0 ? targetTerritories : ['north-america']

    // Check existing unsold stock across active territories to avoid bankrupting overproduction
    const existingStock = destinationIds.reduce((sum, tId) => {
      return sum + (comp.regionalInventory?.[compModel.id]?.[tId] || 0)
    }, 0)
    const maxCapacity = Math.floor(factory.employees * factory.productivity)
    const desiredStockBuffer = maxCapacity * 2
    const utilization = existingStock >= desiredStockBuffer
      ? 0.15
      : Math.max(0.25, 1 - (existingStock / (desiredStockBuffer * 1.5)))

    const totalProd = Math.floor(maxCapacity * utilization)
    const unitCostDiscount = 1 - (((factory.level || 1) - 1) * 0.05)
    aiFinanceMap[comp.id].productionCosts += totalProd * Math.round(compModel.cost * worldStore.inflationMultiplier * unitCostDiscount)
    companyStats[comp.id].production = totalProd

    const amountPerTerritory = Math.floor(totalProd / destinationIds.length)
    const remainder = totalProd - (amountPerTerritory * destinationIds.length)
    destinationIds.forEach((tId, idx) => {
      const unitsToShip = amountPerTerritory + (idx === 0 ? remainder : 0)
      if (unitsToShip > 0) {
        competitorStore.addToInventory(comp.id, compModel.id, tId, unitsToShip)
        const originTerritory = factory.territory || comp.homeTerritory
        if (tId !== originTerritory) {
          const shipRate = worldStore.getShippingCost(originTerritory, tId)
          aiFinanceMap[comp.id].shipping += unitsToShip * shipRate
        }
      }
    })
  })

  // 4. DISTRIBUTION & SALES
  let totalSalesIncome = 0, totalShippingCosts = 0
  const shares = { player: 0 }
  const baseMarketPrice = getBaseMarketPrice(gameStore.year, worldStore.inflationMultiplier)
  const playerReputationFactor = Math.max(0.3, playerStore.reputation / 50)

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
        const modelBoost = marketingStore.getBoostForModel(m.id, territory.id)
        const marketingBoost = modelBoost * (1 + (regAwareness / 100)) * playerReputationFactor * presenceFactor
        const { desirability } = computeModelDesirability(
          { ...m, price: dist.price, marketingBoost, presenceFactor },
          segmentClass,
          gameStore.year,
          baseMarketPrice
        )
        const demand = Math.floor(segmentDemandBase * Math.min(1.0, desirability / 120))
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
            ownerId: 'player', modelId: m.id, name: m.name,
            vehicleClass: m.vehicleClass || VEHICLE_CLASSES.UTILITY,
            introduced: m.introduced || gameStore.year,
            price: config.price, stats: m.stats, inventory,
            marketingBoost: modelBoost * (1 + (playerRegAwareness / 100)) * playerReputationFactor * playerPresenceFactor,
            presenceFactor: playerPresenceFactor
          })
        }
      })

      competitorStore.competitors.forEach(comp => {
        comp.models.forEach(m => {
          const inventory = comp.regionalInventory[m.id]?.[territory.id] || 0
          if (inventory > 0) {
            const compPresence = 1.0 + ((comp.regionalShowrooms[territory.id] || 1) * 0.05)
            availableModels.push({
              ownerId: comp.id, modelId: m.id, name: m.name,
              vehicleClass: m.vehicleClass || (comp.personality.segment === 'Balanced' ? VEHICLE_CLASSES.ECONOMY : comp.personality.segment) || VEHICLE_CLASSES.UTILITY,
              introduced: m.introduced || gameStore.year,
              price: Math.round(m.price * worldStore.inflationMultiplier), stats: m.stats, inventory,
              marketingBoost: 1.25 * (Math.max(25, comp.reputation) / 50) * compPresence,
              presenceFactor: compPresence
            })
          }
        })
      })

      if (availableModels.length === 0) return

      availableModels.forEach(m => {
        const { desirability, debugData } = computeModelDesirability(m, segmentClass, gameStore.year, baseMarketPrice)
        m.desirability = desirability
        m.debugData = debugData
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
        let actualSales = Math.min(m.inventory, Math.floor(salesPotential * (0.85 + Math.random() * 0.3)))
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

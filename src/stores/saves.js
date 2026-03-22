import { defineStore, acceptHMRUpdate } from 'pinia'
import { db } from 'boot/firebase'
import { collection, doc, getDocs, setDoc, deleteDoc, getDoc } from 'firebase/firestore'
import { useAuthStore } from './auth'
import { useGameStore } from './game'
import { usePlayerStore } from './player'
import { useWorldStore } from './world'
import { useResearchStore } from './research'
import { useDesignStore } from './design'
import { useMarketingStore } from './marketing'
import { useCompetitorStore } from './competitors'
import { useBankStore } from './bank'

export const useSavesStore = defineStore('saves', {
  state: () => ({
    slots: [],
    loading: false
  }),

  actions: {
    async fetchSaves() {
      const authStore = useAuthStore()
      if (!authStore.userId) return

      this.loading = true
      try {
        const querySnapshot = await getDocs(collection(db, `users/${authStore.userId}/saves`))
        this.slots = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      } catch (error) {
        console.error('Error fetching saves:', error)
      } finally {
        this.loading = false
      }
    },

    async saveGame(slotId, slotName) {
      const authStore = useAuthStore()
      if (!authStore.userId) {
        console.error('Cannot save game: No user ID found in auth store.')
        return { success: false, error: 'User not logged in' }
      }

      console.log(`[SAVE] Starting save for slot: ${slotId} (User: ${authStore.userId})...`)

      // Serialize all stores
      const saveData = {
        name: slotName,
        updatedAt: new Date().toISOString(),
        gameState: { ...useGameStore().$state },
        playerState: { ...usePlayerStore().$state },
        worldState: { ...useWorldStore().$state },
        researchState: { ...useResearchStore().$state },
        designState: { ...useDesignStore().$state },
        marketingState: { ...useMarketingStore().$state },
        competitorState: { ...useCompetitorStore().$state },
        bankState: { ...useBankStore().$state }
      }

      console.log('[SAVE] Data prepared, sending to Firestore...', saveData)

      try {
        const docRef = doc(db, 'users', authStore.userId, 'saves', slotId)
        console.log('[SAVE] Target document path:', docRef.path)
        await setDoc(docRef, saveData)
        console.log('[SAVE] Firestore setDoc complete.')
        await this.fetchSaves()
        return { success: true }
      } catch (error) {
        console.error('[SAVE] Firestore Error:', error)
        return { success: false, error: error.message }
      }
    },

    async loadGame(slotId) {
      const authStore = useAuthStore()
      if (!authStore.userId) return

      try {
        const docRef = doc(db, `users/${authStore.userId}/saves`, slotId)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const data = docSnap.data()
          
          // Hydrate all stores
          useGameStore().$patch(data.gameState)
          usePlayerStore().$patch(data.playerState)
          useWorldStore().$patch(data.worldState)
          useResearchStore().$patch(data.researchState)
          useDesignStore().$patch(data.designState)
          useMarketingStore().$patch(data.marketingState)
          useCompetitorStore().$patch(data.competitorState)
          if (data.bankState) useBankStore().$patch(data.bankState)
          
          return { success: true }
        }
        return { success: false, error: 'Save not found' }
      } catch (error) {
        return { success: false, error: error.message }
      }
    },

    async deleteSave(slotId) {
      const authStore = useAuthStore()
      if (!authStore.userId) return

      try {
        await deleteDoc(doc(db, `users/${authStore.userId}/saves`, slotId))
        await this.fetchSaves()
        return { success: true }
      } catch (error) {
        return { success: false, error: error.message }
      }
    }
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSavesStore, import.meta.hot))
}

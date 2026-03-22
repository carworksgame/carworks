import { defineStore, acceptHMRUpdate } from 'pinia'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { auth } from 'boot/firebase'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loading: true,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    userId: (state) => state.user?.uid
  },

  actions: {
    async register(email, password) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        this.user = userCredential.user
        return { success: true }
      } catch (error) {
        return { success: false, error: error.message }
      }
    },

    async login(email, password) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        this.user = userCredential.user
        return { success: true }
      } catch (error) {
        return { success: false, error: error.message }
      }
    },

    async loginWithGoogle() {
      const provider = new GoogleAuthProvider()
      try {
        const userCredential = await signInWithPopup(auth, provider)
        this.user = userCredential.user
        return { success: true }
      } catch (error) {
        return { success: false, error: error.message }
      }
    },

    async logout() {
      try {
        await signOut(auth)
        this.user = null
        return { success: true }
      } catch (error) {
        return { success: false, error: error.message }
      }
    },

    initAuth() {
      return new Promise((resolve) => {
        onAuthStateChanged(auth, (user) => {
          this.user = user
          this.loading = false
          resolve(user)
        })
      })
    }
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
}

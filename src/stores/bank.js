import { defineStore, acceptHMRUpdate } from 'pinia'
import { usePlayerStore } from './player'

export const useBankStore = defineStore('bank', {
  state: () => ({
    loanBalance: 0,
    savingsBalance: 0,
    interestRateLoan: 0.08, // 8% annual
    interestRateSavings: 0.02, // 2% annual
    missedPayments: 0,
    insolventMonths: 0
  }),

  persist: true,

  getters: {
    monthlyLoanPayment: (state) => {
      if (state.loanBalance <= 0) return 0
      // Monthly interest + 1% of principal as minimum payment
      const interest = (state.loanBalance * state.interestRateLoan) / 12
      const principal = state.loanBalance * 0.01 
      return Math.round(interest + principal)
    },
    monthlySavingsInterest: (state) => {
      return Math.round((state.savingsBalance * state.interestRateSavings) / 12)
    }
  },

  actions: {
    takeLoan(amount) {
      const playerStore = usePlayerStore()
      this.loanBalance += amount
      playerStore.funds += amount
    },
    repayLoan(amount) {
      const playerStore = usePlayerStore()
      const actualRepay = Math.min(amount, this.loanBalance, playerStore.funds)
      this.loanBalance -= actualRepay
      playerStore.funds -= actualRepay
    },
    deposit(amount) {
      const playerStore = usePlayerStore()
      const actualDeposit = Math.min(amount, playerStore.funds)
      this.savingsBalance += actualDeposit
      playerStore.funds -= actualDeposit
    },
    withdraw(amount) {
      const playerStore = usePlayerStore()
      const actualWithdraw = Math.min(amount, this.savingsBalance)
      this.savingsBalance -= actualWithdraw
      playerStore.funds += actualWithdraw
    },
    processMonthlyBank() {
      const playerStore = usePlayerStore()
      
      // 1. Process Savings Interest
      const interestEarned = this.monthlySavingsInterest
      this.savingsBalance += interestEarned

      // 2. Process Loan Payment
      if (this.loanBalance > 0) {
        const payment = this.monthlyLoanPayment
        if (playerStore.funds >= payment) {
          playerStore.funds -= payment
          this.missedPayments = 0
          // Principal reduction (simplified: the getter includes 1% principal)
          // We'll just reduce the balance by the principal portion
          const interestPortion = (this.loanBalance * this.interestRateLoan) / 12
          this.loanBalance -= (payment - interestPortion)
        } else {
          this.missedPayments++
          // Interest still accrues and is added to balance
          this.loanBalance += (this.loanBalance * this.interestRateLoan) / 12
        }
      }

      // 3. General Insolvency Check
      if (playerStore.funds < -5000) {
        this.insolventMonths++
      } else {
        this.insolventMonths = 0
      }

      return {
        paymentFailed: this.missedPayments > 0,
        isInsolvent: this.insolventMonths > 0
      }
    }
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useBankStore, import.meta.hot))
}

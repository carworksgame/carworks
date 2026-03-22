import { defineStore, acceptHMRUpdate } from 'pinia'

export const useResearchStore = defineStore('research', {
  state: () => ({
    currentProject: null, // { id: 'inline-4', name: 'Inline 4 Engine', progress: 0, cost: 10000 }
    unlockedTech: ['basic-chassis', 'crank-start', 'tiller-steering'],
    availableTech: [
      { id: 'inline-4', name: 'Inline 4 Engine', category: 'Engine', cost: 12000, description: 'A more powerful and reliable engine.' },
      { id: 'steering-wheel', name: 'Steering Wheel', category: 'Handling', cost: 5000, description: 'Replaces the tiller for better control.' },
      { id: 'drum-brakes', name: 'Drum Brakes', category: 'Safety', cost: 8000, description: 'Improved stopping power over basic blocks.' },
      { id: 'electric-lights', name: 'Electric Lights', category: 'Aesthetic', cost: 6000, description: 'See and be seen at night.' },
    ],
    
    // Personnel assignments
    trackAssignments: {
      Engine: 0,
      Handling: 0,
      Safety: 0,
      Aesthetic: 0
    },

    progressPerTech: 500, // Monthly progress points per assigned technician

    // Global tech pool that populates availableTech as time/reqs allow
    globalTechPool: [
      // ENGINES
      { id: 'inline-6', name: 'Inline 6 Engine', category: 'Engine', cost: 25000, year: 1920, requires: 'inline-4', description: 'Smooth power delivery for larger vehicles.' },
      { id: 'v8-engine', name: 'V8 Engine', category: 'Engine', cost: 45000, year: 1930, requires: 'inline-6', description: 'The American standard for performance.' },
      { id: 'diesel-engine', name: 'Diesel Engine', category: 'Engine', cost: 35000, year: 1950, requires: 'inline-6', description: 'Superior torque and fuel efficiency.' },
      { id: 'fuel-injection', name: 'Fuel Injection', category: 'Engine', cost: 60000, year: 1965, requires: 'v8-engine', description: 'Replaces carburetors for precise fuel delivery.' },
      { id: 'turbocharger', name: 'Turbocharger', category: 'Engine', cost: 50000, year: 1975, requires: 'fuel-injection', description: 'Increased power from smaller engines.' },
      { id: 'hybrid-drive', name: 'Hybrid Drive', category: 'Engine', cost: 150000, year: 1998, requires: 'fuel-injection', description: 'Gas-electric power for extreme efficiency.' },
      { id: 'electric-drive', name: 'Electric Drive', category: 'Engine', cost: 250000, year: 2005, requires: 'hybrid-drive', description: 'The future of transportation.' },
      
      // SAFETY
      { id: 'hydraulic-brakes', name: 'Hydraulic Brakes', category: 'Safety', cost: 20000, year: 1935, requires: 'drum-brakes', description: 'Equal pressure for more reliable stopping.' },
      { id: 'seat-belts', name: 'Seat Belts', category: 'Safety', cost: 15000, year: 1955, requires: 'hydraulic-brakes', description: 'Keeping passengers inside the vehicle.' },
      { id: 'abs-brakes', name: 'ABS Brakes', category: 'Safety', cost: 55000, year: 1978, requires: 'hydraulic-brakes', description: 'Prevent wheel lockup during hard braking.' },
      { id: 'airbags', name: 'Airbags', category: 'Safety', cost: 85000, year: 1990, requires: 'abs-brakes', description: 'Rapid inflation protection during collisions.' },
      
      // HANDLING
      { id: 'power-steering', name: 'Power Steering', category: 'Handling', cost: 25000, year: 1950, requires: 'steering-wheel', description: 'Effortless turning at low speeds.' },
      { id: 'rack-and-pinion', name: 'Rack & Pinion', category: 'Handling', cost: 35000, year: 1970, requires: 'power-steering', description: 'Direct and precise steering response.' },
      { id: 'electronic-stability', name: 'ESC', category: 'Handling', cost: 75000, year: 2000, requires: 'rack-and-pinion', description: 'Computerized help to maintain control.' },

      // AESTHETIC / FEATURES
      { id: 'aerodynamic-body', name: 'Aerodynamic Body', category: 'Aesthetic', cost: 20000, year: 1935, description: 'Sleek lines to reduce drag and wind noise.' },
      { id: 'car-radio', name: 'In-Car Radio', category: 'Aesthetic', cost: 12000, year: 1955, description: 'Entertainment for the open road.' },
      { id: 'air-conditioning', name: 'Air Conditioning', category: 'Aesthetic', cost: 40000, year: 1965, description: 'Maintain comfort in any weather.' },
      { id: 'navigation-system', name: 'Navigation System', category: 'Aesthetic', cost: 95000, year: 1995, description: 'GPS-guided directions on a digital screen.' },
    ]
  }),

  persist: true,

  getters: {
    isResearching: (state) => !!state.currentProject,
    researchProgress: (state) => state.currentProject ? (state.currentProject.progress / state.currentProject.cost) * 100 : 0,
    totalAssignedTechnicians: (state) => Object.values(state.trackAssignments).reduce((a, b) => a + b, 0)
  },

  actions: {
    updateAvailableTech(currentYear) {
      const newAvailable = this.globalTechPool.filter(tech => {
        const isUnlocked = this.unlockedTech.includes(tech.id)
        const isAlreadyAvailable = this.availableTech.some(at => at.id === tech.id)
        const isCurrentProject = this.currentProject?.id === tech.id
        const yearMet = currentYear >= tech.year
        const reqsMet = !tech.requires || this.unlockedTech.includes(tech.requires)

        return !isUnlocked && !isAlreadyAvailable && !isCurrentProject && yearMet && reqsMet
      })

      if (newAvailable.length > 0) {
        this.availableTech = [...this.availableTech, ...newAvailable]
      }
    },

    startProject(techId) {
      const tech = this.availableTech.find(t => t.id === techId)
      if (tech) {
        this.currentProject = { ...tech, progress: 0 }
      }
    },

    progressResearch() {
      if (this.currentProject) {
        const category = this.currentProject.category
        const assignedTechs = this.trackAssignments[category] || 0
        
        if (assignedTechs > 0) {
          const monthlyProgress = assignedTechs * this.progressPerTech
          this.currentProject.progress += monthlyProgress
          
          if (this.currentProject.progress >= this.currentProject.cost) {
            this.unlockedTech.push(this.currentProject.id)
            this.availableTech = this.availableTech.filter(t => t.id !== this.currentProject.id)
            const completedName = this.currentProject.name
            this.currentProject = null
            return completedName
          }
        }
      }
      return null
    },

    updateAssignment(track, count) {
      this.trackAssignments[track] = Math.max(0, count)
    }
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useResearchStore, import.meta.hot))
}

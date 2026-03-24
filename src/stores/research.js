import { defineStore, acceptHMRUpdate } from 'pinia'

export const useResearchStore = defineStore('research', {
  state: () => ({
    activeProjects: [], 
    unlockedTech: ['basic-chassis', 'single-cylinder', 'wood-brakes', 'tiller-steering', 'gas-lanterns'],
    availableTech: [
      { id: 'twin-cylinder', name: 'Twin Cylinder Engine', category: 'Engine', cost: 1500, description: 'Double the cylinders for smoother power.' },
      { id: 'drum-brakes', name: 'Drum Brakes', category: 'Safety', cost: 2000, description: 'Improved stopping power over basic blocks.' },
      { id: 'steering-wheel', name: 'Steering Wheel', category: 'Handling', cost: 1200, description: 'Replaces the tiller for better control.' },
    ],
    
    trackAssignments: { Engine: 0, Handling: 0, Safety: 0, Aesthetic: 0 },
    progressPerTech: 200, // Reduced from 500 for longer cycles

    globalTechPool: [
      // ENGINES
      { id: 'inline-4', name: 'Early Inline 4', category: 'Engine', cost: 4000, year: 1908, requires: 'twin-cylinder', description: 'The new standard for reliability and power.' },
      { id: 'ohv-engine', name: 'OHV Inline 4', category: 'Engine', cost: 8000, year: 1915, requires: 'inline-4', description: 'Overhead valves for better breathing.' },
      { id: 'inline-6', name: 'Inline 6 Engine', category: 'Engine', cost: 12000, year: 1920, requires: 'ohv-engine', description: 'Superior balance and smooth power delivery.' },
      { id: 'high-comp-i4', name: 'High-Compression I4', category: 'Engine', cost: 15000, year: 1925, requires: 'ohv-engine', description: 'Increased efficiency through higher compression.' },
      { id: 'v8-engine', name: 'Flathead V8', category: 'Engine', cost: 25000, year: 1932, requires: 'inline-6', description: 'Compact power for performance vehicles.' },
      { id: 'improved-v8', name: 'OHV V8 Engine', category: 'Engine', cost: 40000, year: 1949, requires: 'v8-engine', description: 'Modern V8 architecture for massive power.' },
      { id: 'early-diesel', name: 'Industrial Diesel', category: 'Engine', cost: 35000, year: 1950, requires: 'inline-6', description: 'High torque and durability for utility.' },
      { id: 'high-output-v8', name: 'High-Output V8', category: 'Engine', cost: 60000, year: 1960, requires: 'improved-v8', description: 'The pinnacle of the muscle car era.' },
      { id: 'fuel-injection', name: 'Mechanical Fuel Injection', category: 'Engine', cost: 80000, year: 1965, requires: 'high-comp-i4', description: 'Replaces carburetors for precise fuel delivery.' },
      { id: 'electronic-injection', name: 'EFI System', category: 'Engine', cost: 120000, year: 1975, requires: 'fuel-injection', description: 'Computer-controlled fuel for extreme efficiency.' },
      { id: 'early-turbo', name: 'Early Turbocharger', category: 'Engine', cost: 100000, year: 1978, requires: 'electronic-injection', description: 'Small displacement with big power.' },
      { id: 'multi-valve', name: 'Multi-Valve Heads', category: 'Engine', cost: 150000, year: 1985, requires: 'electronic-injection', description: '4 valves per cylinder for better airflow.' },
      { id: 'vvt-engine', name: 'Variable Valve Timing', category: 'Engine', cost: 250000, year: 1995, requires: 'multi-valve', description: 'Optimized performance across all RPMs.' },
      { id: 'early-hybrid', name: 'Hybrid Drive', category: 'Engine', cost: 400000, year: 1998, requires: 'electronic-injection', description: 'Gas-electric synergy for the city.' },
      { id: 'modern-electric', name: 'Li-Ion Electric Drive', category: 'Engine', cost: 750000, year: 2005, requires: 'early-hybrid', description: 'Full electric performance.' },

      // CHASSIS & BODY
      { id: 'steel-reinforced', name: 'Reinforced Frame', category: 'Handling', cost: 3000, year: 1905, requires: 'basic-chassis', description: 'Steel plating on wood for durability.' },
      { id: 'all-steel-ladder', name: 'All-Steel Ladder', category: 'Handling', cost: 7000, year: 1915, requires: 'steel-reinforced', description: 'Massive jump in safety and durability.' },
      { id: 'pressed-steel', name: 'Pressed Steel Frame', category: 'Handling', cost: 15000, year: 1925, requires: 'all-steel-ladder', description: 'Lighter and stronger than ladder frames.' },
      { id: 'aerodynamic-body', name: 'Aerodynamic Body', category: 'Aesthetic', cost: 25000, year: 1935, requires: 'pressed-steel', description: 'Streamlined shapes to reduce wind drag.' },
      { id: 'monocoque', name: 'Unibody Construction', category: 'Handling', cost: 60000, year: 1950, requires: 'pressed-steel', description: 'Body and frame integrated into one unit.' },
      { id: 'lightweight-alloys', name: 'Aluminum Alloy Body', category: 'Handling', cost: 120000, year: 1975, requires: 'monocoque', description: 'Drastic weight reduction for better MPG.' },
      { id: 'carbon-fiber', name: 'Carbon Fiber Reinforcement', category: 'Handling', cost: 300000, year: 1995, requires: 'lightweight-alloys', description: 'Space-age materials for elite models.' },

      // SAFETY & BRAKES
      { id: 'mechanical-4-wheel', name: '4-Wheel Brakes', category: 'Safety', cost: 5000, year: 1915, requires: 'drum-brakes', description: 'Braking on all wheels, not just the rear.' },
      { id: 'hydraulic-brakes', name: 'Hydraulic System', category: 'Safety', cost: 15000, year: 1930, requires: 'mechanical-4-wheel', description: 'Fluid pressure for reliable stopping.' },
      { id: 'seat-belts', name: 'Lap Seat Belts', category: 'Safety', cost: 10000, year: 1955, requires: 'hydraulic-brakes', description: 'Keep passengers inside during impact.' },
      { id: 'disc-brakes', name: 'Front Disc Brakes', category: 'Safety', cost: 30000, year: 1965, requires: 'hydraulic-brakes', description: 'Superior heat dissipation and power.' },
      { id: 'collapsible-column', name: 'Safety Steering Column', category: 'Safety', cost: 25000, year: 1970, requires: 'seat-belts', description: 'Prevents impalement in a crash.' },
      { id: 'abs-brakes', name: 'ABS System', category: 'Safety', cost: 80000, year: 1980, requires: 'disc-brakes', description: 'Prevent wheel lockup during hard braking.' },
      { id: 'driver-airbag', name: 'Driver Airbag', category: 'Safety', cost: 100000, year: 1990, requires: 'collapsible-column', description: 'Supplemental inflatable restraint.' },
      { id: 'full-airbags', name: 'Dual Stage Airbags', category: 'Safety', cost: 200000, year: 2000, requires: 'driver-airbag', description: 'Front and side protection for everyone.' },

      // HANDLING & STEERING
      { id: 'steering-wheel', name: 'Steering Wheel', category: 'Handling', cost: 1200, year: 1905, requires: 'tiller-steering', description: 'Modern steering control.' },
      { id: 'leaf-springs', name: 'Leaf Spring Pack', category: 'Handling', cost: 2500, year: 1910, requires: 'basic-chassis', description: 'Smoother ride over rutted roads.' },
      { id: 'shock-absorbers', name: 'Oil Shock Absorbers', category: 'Handling', cost: 8000, year: 1920, requires: 'leaf-springs', description: 'Dampen oscillations for better control.' },
      { id: 'ifs-handling', name: 'Indep. Front Suspension', category: 'Handling', cost: 20000, year: 1935, requires: 'shock-absorbers', description: 'Each front wheel moves independently.' },
      { id: 'power-steering', name: 'Hydraulic Power Steering', category: 'Handling', cost: 40000, year: 1951, requires: 'ifs-handling', description: 'Effortless turning at low speeds.' },
      { id: 'rack-and-pinion', name: 'Rack & Pinion', category: 'Handling', cost: 60000, year: 1970, requires: 'power-steering', description: 'Direct and precise steering link.' },
      { id: 'esc-handling', name: 'ESC System', category: 'Handling', cost: 150000, year: 2000, requires: 'abs-brakes', description: 'Computerized stability assistance.' },

      // AESTHETIC & EXTRAS
      { id: 'electric-lights', name: 'Electric Lighting', category: 'Aesthetic', cost: 5000, year: 1912, requires: 'gas-lanterns', description: 'Turn on the lights with a switch.' },
      { id: 'enclosed-cabin', name: 'Enclosed Sedan Body', category: 'Aesthetic', cost: 10000, year: 1920, requires: 'electric-lights', description: 'Protection from wind, rain, and snow.' },
      { id: 'car-radio', name: 'AM Radio', category: 'Aesthetic', cost: 15000, year: 1935, requires: 'enclosed-cabin', description: 'Live entertainment on the go.' },
      { id: 'car-heater', name: 'Interior Heater', category: 'Aesthetic', cost: 8000, year: 1945, requires: 'enclosed-cabin', description: 'Year-round comfort in cold climates.' },
      { id: 'air-conditioning', name: 'Air Conditioning', category: 'Aesthetic', cost: 50000, year: 1960, requires: 'car-heater', description: 'Full climate control.' },
      { id: 'power-windows', name: 'Power Windows', category: 'Aesthetic', cost: 30000, year: 1975, requires: 'air-conditioning', description: 'Luxury convenience at a button press.' },
      { id: 'cd-player', name: 'CD Player', category: 'Aesthetic', cost: 40000, year: 1985, requires: 'car-radio', description: 'Digital audio quality.' },
      { id: 'navigation-gps', name: 'GPS Navigation', category: 'Aesthetic', cost: 120000, year: 1995, requires: 'cd-player', description: 'Satellite-guided directions.' },
      { id: 'infotainment', name: 'Touch Infotainment', category: 'Aesthetic', cost: 300000, year: 2005, requires: 'navigation-gps', description: 'The modern digital cockpit.' },
    ]
  }),

  persist: true,

  getters: {
    totalAssignedTechnicians: (state) => Object.values(state.trackAssignments).reduce((a, b) => a + b, 0),
    getProjectByCategory: (state) => (cat) => state.activeProjects.find(p => p.category === cat)
  },

  actions: {
    updateAvailableTech(currentYear) {
      const newAvailable = this.globalTechPool.filter(tech => {
        const isUnlocked = this.unlockedTech.includes(tech.id)
        const isAlreadyAvailable = this.availableTech.some(at => at.id === tech.id)
        const isActivelyResearching = this.activeProjects.some(p => p.id === tech.id)
        const yearMet = currentYear >= tech.year
        const reqsMet = !tech.requires || this.unlockedTech.includes(tech.requires)

        return !isUnlocked && !isAlreadyAvailable && !isActivelyResearching && yearMet && reqsMet
      })

      if (newAvailable.length > 0) {
        this.availableTech = [...this.availableTech, ...newAvailable]
      }
    },

    startProject(techId) {
      const tech = this.availableTech.find(t => t.id === techId)
      if (tech) {
        const existing = this.activeProjects.find(p => p.category === tech.category)
        if (!existing) {
          this.activeProjects.push({ ...tech, progress: 0 })
          this.availableTech = this.availableTech.filter(t => t.id !== techId)
        }
      }
    },

    progressResearch() {
      const completedTechNames = []
      const remainingProjects = []

      this.activeProjects.forEach(project => {
        const category = project.category
        const assignedTechs = this.trackAssignments[category] || 0
        
        if (assignedTechs > 0) {
          const monthlyProgress = assignedTechs * this.progressPerTech
          project.progress += monthlyProgress
          
          if (project.progress >= project.cost) {
            this.unlockedTech.push(project.id)
            completedTechNames.push(project.name)
          } else {
            remainingProjects.push(project)
          }
        } else {
          remainingProjects.push(project)
        }
      })

      this.activeProjects = remainingProjects
      return completedTechNames
    },

    updateAssignment(track, count) {
      this.trackAssignments[track] = Math.max(0, count)
    }
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useResearchStore, import.meta.hot))
}

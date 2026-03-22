<template>
  <q-page padding class="bg-grey-1">
    <div class="row items-center q-mb-md">
      <div class="text-h4">R&D Laboratory</div>
      <q-space />
      <div class="text-subtitle1">
        Technicians: <span class="text-weight-bold text-blue-9">{{ playerStore.technicians }}</span>
      </div>
    </div>

    <div class="row q-gutter-md">
      <!-- Current Project -->
      <q-card flat bordered class="col-12 col-md-7">
        <q-card-section class="bg-blue-10 text-white">
          <div class="text-h6">Current Research Project</div>
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <div v-if="!researchStore.currentProject" class="text-center">
            <q-icon name="biotech" size="64px" color="grey-4" />
            <div class="text-h6 text-grey-6">No Active Project</div>
            <p class="text-grey">Select a technology from the list to begin research.</p>
          </div>
          
          <div v-else>
            <div class="row items-center justify-between q-mb-md">
              <div>
                <div class="text-h5 text-blue-9">{{ researchStore.currentProject.name }}</div>
                <div class="text-caption text-grey-7">{{ researchStore.currentProject.category }} Technology</div>
              </div>
              <q-badge color="blue" label="Active" />
            </div>

            <div class="q-mb-md">
              <div class="row justify-between q-mb-xs">
                <span class="text-weight-medium">Progress</span>
                <span>{{ Math.round(researchStore.researchProgress) }}%</span>
              </div>
              <q-linear-progress 
                :value="researchStore.researchProgress / 100" 
                color="blue" 
                size="20px" 
                stripe 
                rounded
              />
            </div>

            <div class="row q-gutter-sm text-caption text-grey-8">
              <div class="bg-blue-1 q-pa-sm rounded-borders">
                Total Cost: ${{ researchStore.currentProject.cost.toLocaleString() }}
              </div>
              <div class="bg-blue-1 q-pa-sm rounded-borders">
                Remaining: ${{ (researchStore.currentProject.cost - researchStore.currentProject.progress).toLocaleString() }}
              </div>
              <div class="bg-blue-1 q-pa-sm rounded-borders">
                Power: {{ researchPower }} pts/mo
              </div>
              <div class="bg-blue-1 q-pa-sm rounded-borders">
                Est. Completion: {{ estCompletion }}
              </div>
            </div>
            
            <div v-if="researchPower === 0" class="q-mt-md text-negative text-weight-bold row items-center">
              <q-icon name="warning" class="q-mr-xs" />
              Assign technicians to the {{ researchStore.currentProject.category }} track to progress!
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="row justify-between items-center q-mb-sm">
            <div class="text-subtitle2">Specialized Track Assignments</div>
            <q-badge :color="idleTechnicians > 0 ? 'orange' : 'grey-7'">
              {{ idleTechnicians }} Technicians Idle
            </q-badge>
          </div>
          
          <div class="row q-col-gutter-md">
            <div v-for="track in tracks" :key="track" class="col-12 col-sm-6">
              <div class="bg-grey-2 q-pa-sm rounded-borders">
                <div class="row justify-between items-center q-mb-xs">
                  <span class="text-weight-bold">{{ track }}</span>
                  <span class="text-blue-9">{{ researchStore.trackAssignments[track] }} Assigned</span>
                </div>
                <div class="row items-center q-gutter-x-sm">
                  <q-btn flat dense icon="remove" color="red" @click="updateTrack(track, -1)" :disabled="researchStore.trackAssignments[track] <= 0" />
                  <q-linear-progress :value="researchStore.trackAssignments[track] / (playerStore.technicians || 1)" color="blue-7" class="col" />
                  <q-btn flat dense icon="add" color="green" @click="updateTrack(track, 1)" :disabled="idleTechnicians <= 0" />
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Unlocked Tech -->
      <q-card flat bordered class="col-12 col-md-4">
        <q-card-section class="bg-green-8 text-white">
          <div class="text-h6">Unlocked Technologies</div>
        </q-card-section>
        <q-card-section class="q-pa-none">
          <q-list separator>
            <q-item v-for="techId in researchStore.unlockedTech" :key="techId">
              <q-item-section avatar>
                <q-icon name="check_circle" color="green" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ formatTechName(techId) }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </div>

    <!-- Available Projects -->
    <div class="text-h5 q-mt-xl q-mb-md">Available Research Projects</div>
    <div class="row q-gutter-md">
      <q-card v-for="tech in researchStore.availableTech" :key="tech.id" flat bordered class="col-12 col-sm-6 col-md-3">
        <q-card-section>
          <div class="text-overline text-blue-7">{{ tech.category }}</div>
          <div class="text-h6">{{ tech.name }}</div>
          <div class="text-caption q-mt-sm">{{ tech.description }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="text-subtitle2 text-grey-8">Cost: ${{ tech.cost.toLocaleString() }}</div>
        </q-card-section>

        <q-separator />

        <q-card-actions vertical>
          <q-btn 
            flat 
            color="blue" 
            label="Start Research" 
            :disabled="researchStore.isResearching"
            @click="researchStore.startProject(tech.id)"
          />
        </q-card-actions>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useResearchStore } from '../stores/research'
import { usePlayerStore } from '../stores/player'

const researchStore = useResearchStore()
const playerStore = usePlayerStore()

const tracks = ['Engine', 'Handling', 'Safety', 'Aesthetic']

const idleTechnicians = computed(() => {
  return playerStore.technicians - researchStore.totalAssignedTechnicians
})

const researchPower = computed(() => {
  if (!researchStore.currentProject) return 0
  const assigned = researchStore.trackAssignments[researchStore.currentProject.category] || 0
  return assigned * researchStore.progressPerTech
})

const estCompletion = computed(() => {
  if (!researchStore.currentProject) return '-'
  if (researchPower.value === 0) return 'Infinite'
  const remaining = researchStore.currentProject.cost - researchStore.currentProject.progress
  return `${Math.ceil(remaining / researchPower.value)} months`
})

function updateTrack(track, delta) {
  const current = researchStore.trackAssignments[track] || 0
  researchStore.updateAssignment(track, current + delta)
}

function formatTechName(id) {
  return id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}
</script>

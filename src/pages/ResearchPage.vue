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
      <!-- Active Projects -->
      <q-card flat bordered class="col-12 col-md-7">
        <q-card-section class="bg-blue-10 text-white row items-center">
          <div class="text-h6">Active Research Projects</div>
          <q-space />
          <q-badge color="blue-7" :label="`${researchStore.activeProjects.length} / 4 Tracks Active`" />
        </q-card-section>

        <q-card-section class="q-pa-md">
          <div v-if="researchStore.activeProjects.length === 0" class="text-center q-pa-xl">
            <q-icon name="biotech" size="64px" color="grey-4" />
            <div class="text-h6 text-grey-6">No Active Projects</div>
            <p class="text-grey">Assign technicians and select technology from the list below to begin.</p>
          </div>
          
          <q-list v-else separator>
            <q-item v-for="project in researchStore.activeProjects" :key="project.id" class="q-py-md">
              <q-item-section>
                <div class="row items-center justify-between q-mb-sm">
                  <div>
                    <div class="text-h6 text-blue-9">{{ project.name }}</div>
                    <div class="text-caption text-grey-7">{{ project.category }} Track</div>
                  </div>
                  <div class="text-right">
                    <div class="text-subtitle2 text-blue-10">{{ getProjectPower(project) }} pts/mo</div>
                    <div class="text-caption text-grey-6">Est: {{ getEstCompletion(project) }}</div>
                  </div>
                </div>

                <q-linear-progress 
                  :value="project.progress / project.cost" 
                  color="blue" 
                  size="15px" 
                  stripe 
                  rounded
                />
                
                <div v-if="getProjectPower(project) === 0" class="q-mt-xs text-negative text-caption text-weight-bold row items-center">
                  <q-icon name="warning" size="xs" class="q-mr-xs" />
                  No technicians assigned to the {{ project.category }} track!
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="row justify-between items-center q-mb-sm">
            <div class="text-subtitle2 text-uppercase text-grey-7">Personnel Distribution</div>
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
        <q-card-section class="q-pa-none" style="max-height: 500px; overflow-y: auto">
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
            :disabled="isCategoryBusy(tech.category)"
            @click="researchStore.startProject(tech.id)"
          >
            <q-tooltip v-if="isCategoryBusy(tech.category)">
              Already researching a project in the {{ tech.category }} track.
            </q-tooltip>
          </q-btn>
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

function getProjectPower(project) {
  const assigned = researchStore.trackAssignments[project.category] || 0
  return assigned * researchStore.progressPerTech
}

function getEstCompletion(project) {
  const power = getProjectPower(project)
  if (power === 0) return 'Infinite'
  const remaining = project.cost - project.progress
  return `${Math.ceil(remaining / power)} months`
}

function isCategoryBusy(cat) {
  return researchStore.activeProjects.some(p => p.category === cat)
}

function updateTrack(track, delta) {
  const current = researchStore.trackAssignments[track] || 0
  researchStore.updateAssignment(track, current + delta)
}

function formatTechName(id) {
  return id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}
</script>

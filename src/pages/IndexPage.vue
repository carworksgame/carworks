<template>
  <q-page class="flex flex-center bg-grey-3">
    <div class="q-pa-md row items-start q-gutter-md justify-center" style="max-width: 1000px">
      
      <q-card class="building-card cursor-pointer q-hoverable" @click="$router.push('/office')">
        <q-card-section class="bg-brown-6 text-white text-center">
          <div class="text-h6">Manager's Office</div>
          <q-icon name="business" size="100px" />
        </q-card-section>
        <q-card-section class="text-center">
          Finance & Personnel
        </q-card-section>
      </q-card>

      <q-card class="building-card cursor-pointer q-hoverable" @click="$router.push('/research')">
        <q-card-section class="bg-blue-6 text-white text-center">
          <div class="text-h6">R&D Lab</div>
          <q-icon name="science" size="100px" />
        </q-card-section>
        <q-card-section class="text-center">
          Technology & Innovation
        </q-card-section>
      </q-card>

      <q-card class="building-card cursor-pointer q-hoverable" @click="$router.push('/design')">
        <q-card-section class="bg-teal-6 text-white text-center">
          <div class="text-h6">Design Workshop</div>
          <q-icon name="drive_eta" size="100px" />
        </q-card-section>
        <q-card-section class="text-center">
          Vehicle Engineering
        </q-card-section>
      </q-card>

      <q-card class="building-card cursor-pointer q-hoverable" @click="$router.push('/manufacturing')">
        <q-card-section class="bg-orange-6 text-white text-center">
          <div class="text-h6">Manufacturing</div>
          <q-icon name="factory" size="100px" />
        </q-card-section>
        <q-card-section class="text-center">
          Global Production & Sales
        </q-card-section>
      </q-card>

      <q-card class="building-card cursor-pointer q-hoverable" @click="$router.push('/marketing')">
        <q-card-section class="bg-deep-orange-6 text-white text-center">
          <div class="text-h6">Marketing</div>
          <q-icon name="campaign" size="100px" />
        </q-card-section>
        <q-card-section class="text-center">
          Advertising & Media
        </q-card-section>
      </q-card>

    </div>
  </q-page>
</template>

<script setup>
// Index page acts as the central hub
</script>

<style lang="scss" scoped>
.building-card {
  width: 250px;
  height: 250px;
  transition: transform 0.2s ease-in-out;
  &:hover {
    transform: scale(1.05);
    z-index: 10;
  }
}
</style>

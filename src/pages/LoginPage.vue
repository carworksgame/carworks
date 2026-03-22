<template>
  <q-layout>
    <q-page-container>
      <q-page class="flex flex-center bg-brown-2">
        <q-card square bordered class="q-pa-lg shadow-2 login-card">
          <q-card-section class="text-center">
            <div class="text-h4 text-weight-bolder text-brown-9 q-mb-md">CarWorks</div>
            <q-icon name="directions_car" size="100px" color="brown-6" />
            <div class="text-subtitle1 text-grey-8 q-mt-md">Sign in to manage your automotive empire</div>
          </q-card-section>

          <q-card-section>
            <q-form @submit="onSubmit" class="q-gutter-md">
              <q-input
                v-model="email"
                type="email"
                name="email"
                id="email"
                autocomplete="email"
                label="Email"
                outlined
                dense
                lazy-rules
                :rules="[ val => val && val.length > 0 || 'Please enter your email']"
              />

              <q-input
                v-model="password"
                type="password"
                name="password"
                id="password"
                autocomplete="current-password"
                label="Password"
                outlined
                dense
                lazy-rules
                :rules="[ val => val && val.length > 0 || 'Please enter your password']"
              />

              <div>
                <q-btn 
                  :label="isRegistering ? 'Register' : 'Login'" 
                  type="submit" 
                  color="brown-8" 
                  class="full-width"
                  :loading="loading"
                />
              </div>
            </q-form>
          </q-card-section>

          <q-card-section class="q-pt-none text-center">
            <div class="text-caption text-grey-7 q-mb-md">OR</div>
            <q-btn 
              outline 
              color="brown-8" 
              icon="login" 
              label="Sign in with Google" 
              class="full-width q-mb-md"
              @click="onGoogleLogin"
              :loading="loading"
            />
            
            <q-btn 
              flat 
              color="brown-6" 
              :label="isRegistering ? 'Already have an account? Login' : 'Need an account? Register'" 
              @click="isRegistering = !isRegistering"
              class="full-width"
            />
          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const $q = useQuasar()

const email = ref('')
const password = ref('')
const isRegistering = ref(false)
const loading = ref(false)

async function onSubmit() {
  loading.value = true
  let result
  if (isRegistering.value) {
    result = await authStore.register(email.value, password.value)
  } else {
    result = await authStore.login(email.value, password.value)
  }
  
  loading.value = false
  handleAuthResult(result)
}

async function onGoogleLogin() {
  loading.value = true
  const result = await authStore.loginWithGoogle()
  loading.value = false
  handleAuthResult(result)
}

function handleAuthResult(result) {
  if (result.success) {
    $q.notify({ color: 'positive', message: 'Welcome to CarWorks!' })
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } else {
    $q.notify({ color: 'negative', message: result.error })
  }
}
</script>

<style scoped>
.login-card {
  width: 400px;
  max-width: 90vw;
}
</style>

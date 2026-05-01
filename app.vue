<template>
  <div class="app-shell">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <UNotifications /> 
  </div>
</template>

<script setup lang="ts">
import { useThemeStore } from '~/stores/theme'
import { useAuthStore }  from '~/stores/auth'

const themeStore = useThemeStore()
const authStore  = useAuthStore()
const toast      = useToast()

onMounted(() => {
  // 1. Restore theme (dark/light)
  themeStore.restore()
  // 2. Restore auth session
  authStore.restore()
})
</script>

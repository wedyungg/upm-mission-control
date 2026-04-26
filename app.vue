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
import { useDrive }      from '~/composables/useDrive'
import { useAuthStore }  from '~/stores/auth'

const themeStore = useThemeStore()
const authStore  = useAuthStore()
const drive      = useDrive()
const toast      = useToast()

onMounted(() => {
  // 1. Restore theme (dark/light)
  themeStore.restore()
  // 2. Restore auth session
  authStore.restore()
  // 3. Restore Drive token from localStorage (auto-connect)
  drive.restoreTokenFromStorage()
  // 4. Capture new OAuth token from URL hash if redirected from Google
  if (drive.captureTokenFromHash()) {
    toast.add({ title: 'Google Drive terhubung ✓', color: 'green' })
  }
})
</script>

<template>
  <AppHeader v-if="auth.isLoggedIn" />
  <DriveStatusBar v-if="auth.isLoggedIn" />

  <div
    class="view-scroll"
    :class="{ 'no-nav': !auth.isLoggedIn }"
  >
    <slot />
  </div>

  <AppBottomNav v-if="auth.isLoggedIn && !hideNav" />
</template>

<script setup lang="ts">
import AppHeader     from '~/components/layout/AppHeader.vue'
import AppBottomNav  from '~/components/layout/AppBottomNav.vue'
import DriveStatusBar from '~/components/layout/DriveStatusBar.vue'
import { useAuthStore } from '~/stores/auth'

const auth  = useAuthStore()
const route = useRoute()
const hideNav = computed(() => route.name === 'misi-id')
</script>

<template>
  <div class="flex h-full w-full overflow-hidden">
    <AppSidebar v-if="auth.isLoggedIn" />

    <div class="app-main">
      <AppHeader v-if="auth.isLoggedIn" />
      <DriveStatusBar v-if="auth.isLoggedIn" class="md:hidden" />

      <div
        class="view-scroll"
        :class="{ 'no-nav': !auth.isLoggedIn }"
      >
        <div class="page-container">
          <slot />
        </div>
      </div>

      <AppBottomNav v-if="auth.isLoggedIn && !hideNav" class="md:hidden" />
    </div>
  </div>
</template>

<script setup lang="ts">
import AppSidebar     from '~/components/layout/AppSidebar.vue'
import AppHeader      from '~/components/layout/AppHeader.vue'
import AppBottomNav   from '~/components/layout/AppBottomNav.vue'
import DriveStatusBar from '~/components/layout/DriveStatusBar.vue'
import { useAuthStore } from '~/stores/auth'

const auth    = useAuthStore()
const route   = useRoute()
const hideNav = computed(() => route.name === 'misi-id')
</script>

<template>
  <header class="flex items-center h-14 px-3.5 flex-shrink-0 z-50 relative
                 bg-[var(--bg-surface)]/90 backdrop-blur-md border-b border-[var(--border)]">

    <div class="flex items-center gap-2 cursor-pointer flex-shrink-0" @click="navigateTo('/')">
      <img
        v-if="logoOk"
        src="/appLogo.png"
        alt="UPM"
        class="h-8 w-auto max-w-[130px] object-contain"
        @error="logoOk = false"
      />
      <template v-else>
        <div class="flex items-end gap-0.5">
          <span class="w-1 rounded-sm" style="height:10px;background:#ef4444;display:inline-block" />
          <span class="w-1 rounded-sm" style="height:13px;background:#f97316;display:inline-block" />
          <span class="w-1 rounded-sm" style="height:17px;background:#3b82f6;display:inline-block" />
          <span class="w-1 rounded-sm" style="height:14px;background:#22c55e;display:inline-block" />
        </div>
        <div class="flex flex-col leading-tight">
          <span class="text-[11px] font-bold text-[var(--text-primary)]">Dashboard</span>
          <span class="text-[11px] font-bold text-[var(--blue)]">Kinerja UPM</span>
        </div>
      </template>
    </div>

    <div class="ml-auto flex items-center gap-1.5 flex-shrink-0">

      <span class="text-[10px] font-mono text-[var(--text-muted)] pr-1">{{ hijriLabel }}</span>

      <button
        class="w-8 h-8 rounded-lg flex items-center justify-center
               bg-[var(--bg-elevated)] border border-[var(--border)]
               text-[var(--text-secondary)] transition-colors hover:bg-[var(--border-md)] outline-none"
        :title="isDark ? 'Mode Terang' : 'Mode Gelap'"
        @click="themeStore.toggle()"
      >
        <svg v-if="isDark" width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
          <circle cx="12" cy="12" r="4"/>
          <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      </button>

      <div ref="notifWrapper">
        
        <button
          class="w-8 h-8 rounded-lg flex items-center justify-center relative
                 bg-[var(--bg-elevated)] border border-[var(--border)]
                 text-[var(--text-secondary)] transition-colors hover:bg-[var(--border-md)] outline-none"
          @click.stop="notifOpen = !notifOpen"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          
          <span v-if="unreadCount > 0" 
            class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-[1.5px] border-[var(--bg-surface)] animate-pulse" />
        </button>

        <NotifPanel 
          :is-open="notifOpen" 
          @close="notifOpen = false" 
          @update:unread="val => unreadCount = val"
        />
      </div>

      <div
        class="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold
               cursor-pointer border-2 border-[var(--border-md)] flex-shrink-0 ml-0.5"
        :style="{ background: user?.bg, color: user?.color }"
        @click="navigateTo('/profil')"
      >{{ user?.initials }}</div>

    </div>
  </header>
</template>

<script setup lang="ts">
import { useAuthStore }  from '~/stores/auth'
import { useThemeStore } from '~/stores/theme'
import { useHijri }      from '~/composables/useHijri'
import { ref, onMounted, onUnmounted, computed } from 'vue'

const auth       = useAuthStore()
const themeStore = useThemeStore()
const { approxCurrentHijriYear } = useHijri()

const user       = computed(() => auth.currentUser)
const isDark     = computed(() => themeStore.isDark)
const hijriLabel = computed(() => `${approxCurrentHijriYear()}H`)
const logoOk     = ref(true)

// State Notifikasi
const notifOpen = ref(false)
const unreadCount = ref(0)
const notifWrapper = ref<HTMLElement | null>(null)

// ✅ Solusi: Fungsi mendeteksi klik di luar komponen untuk menutup NotifPanel
const handleClickOutside = (event: MouseEvent) => {
  if (notifOpen.value && notifWrapper.value && !notifWrapper.value.contains(event.target as Node)) {
    notifOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
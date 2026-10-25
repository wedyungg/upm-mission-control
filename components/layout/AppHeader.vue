<template>
  <header
    class="flex items-center h-14 md:h-[64px] px-4 md:px-8 flex-shrink-0 z-30 relative
           bg-[var(--bg-surface)]/85 backdrop-blur-md border-b border-[var(--border)]"
  >
    <!-- Mobile Brand (hidden on desktop since Sidebar shows brand) -->
    <div class="flex md:hidden items-center gap-2 cursor-pointer flex-shrink-0" @click="navigateTo('/')">
      <img
        v-if="logoOk"
        src="/appLogo.png"
        alt="UPM"
        class="h-7 w-auto max-w-[110px] object-contain"
        @error="logoOk = false"
      />
      <template v-else>
        <div class="w-7 h-7 rounded-lg bg-[var(--accent-soft)] border border-[var(--border-md)] flex items-center justify-center">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div class="flex flex-col leading-tight">
          <span class="text-xs font-bold text-[var(--text-primary)]">Dashboard</span>
          <span class="text-xs font-semibold text-[var(--accent)]">Kinerja UPM</span>
        </div>
      </template>
    </div>

    <!-- Desktop Breadcrumb / Section Title -->
    <div class="hidden md:flex items-center gap-2.5">
      <span class="text-xs font-medium text-[var(--text-muted)]">Dashboard Kinerja</span>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round"><path d="M9 18l6-6-6-6"/></svg>
      <span class="text-sm font-semibold text-[var(--text-primary)]">{{ currentSectionLabel }}</span>
    </div>

    <div class="ml-auto flex items-center gap-1.5 md:gap-2 flex-shrink-0">
      <!-- Quick Action "+ Buat" on Mobile (Apple-style navigation bar action) -->
      <button
        class="md:hidden h-8 px-2.5 rounded-xl flex items-center gap-1 cursor-pointer
               bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold
               shadow-sm active:scale-95 transition-all outline-none"
        @click="navigateTo('/buat')"
        title="Buat Tugas Baru"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        <span>Buat</span>
      </button>

      <!-- Periode Badge (hidden on small mobile to save space, visible on tablet & desktop) -->
      <span class="hidden sm:inline-flex text-xs font-medium px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-secondary)]">
        Periode {{ hijriLabel }}
      </span>

      <!-- Theme Toggle -->
      <button
        class="w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center cursor-pointer
               bg-[var(--bg-elevated)] border border-[var(--border)]
               text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] hover:border-[var(--border-md)] outline-none"
        :title="isDark ? 'Mode Terang' : 'Mode Gelap'"
        aria-label="Ganti Mode Tampilan"
        @click="themeStore.toggle()"
      >
        <svg v-if="isDark" width="15" height="15" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
          <circle cx="12" cy="12" r="4"/>
          <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
        <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      </button>

      <!-- Notification Bell -->
      <div ref="notifWrapper" class="relative">
        <button
          class="w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center relative cursor-pointer
                 bg-[var(--bg-elevated)] border border-[var(--border)]
                 text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] hover:border-[var(--border-md)] outline-none"
          aria-label="Notifikasi"
          @click.stop="notifOpen = !notifOpen"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span
            v-if="unreadCount > 0"
            class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-[1.5px] border-[var(--bg-surface)]"
          />
        </button>

        <NotifPanel
          :is-open="notifOpen"
          @close="notifOpen = false"
          @update:unread="val => unreadCount = val"
        />
      </div>

      <!-- Desktop Profile Pill (hidden on mobile since Profil has its own tab in bottom nav) -->
      <div
        class="hidden md:flex items-center gap-2 pl-1 cursor-pointer group"
        @click="navigateTo('/profil')"
      >
        <div
          class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold
                 border border-[var(--border-md)] flex-shrink-0 group-hover:ring-2 group-hover:ring-[var(--accent)]/30 transition-all"
          :style="{ background: user?.bg, color: user?.color }"
          :title="user?.name"
        >
          {{ user?.initials }}
        </div>
      </div>
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
const route      = useRoute()
const { approxCurrentHijriYear } = useHijri()

const user       = computed(() => auth.currentUser)
const isDark     = computed(() => themeStore.isDark)
const hijriLabel = computed(() => `${approxCurrentHijriYear()}H`)
const logoOk     = ref(true)

const currentSectionLabel = computed(() => {
  const p = route.path
  if (p === '/') return 'Beranda Kinerja'
  if (p.startsWith('/kalender')) return 'Kalender Tayang'
  if (p.startsWith('/manajemen')) return 'Manajemen Tim & Progja'
  if (p.startsWith('/tugas')) return 'Daftar Tugas'
  if (p.startsWith('/buat')) return 'Buat Tugas Baru'
  if (p.startsWith('/progja')) return 'Program Kerja Tahunan'
  if (p.startsWith('/profil')) return 'Profil & Pengaturan'
  if (p.startsWith('/misi')) return 'Detail Tugas'
  return 'Ruang Kerja'
})

// State Notifikasi
const notifOpen = ref(false)
const unreadCount = ref(0)
const notifWrapper = ref<HTMLElement | null>(null)

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

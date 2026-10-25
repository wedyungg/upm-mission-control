<template>
  <aside
    class="hidden md:flex flex-col w-[264px] flex-shrink-0 h-full
           bg-[var(--bg-surface)] border-r border-[var(--border)]
           select-none z-40"
  >
    <!-- Brand Header -->
    <div class="flex items-center gap-3 px-5 h-[64px] border-b border-[var(--border)]">
      <div
        class="flex items-center gap-2.5 cursor-pointer group"
        @click="navigateTo('/')"
      >
        <img
          v-if="logoOk"
          src="/appLogo.png"
          alt="Logo UPM"
          class="h-8 w-auto max-w-[130px] object-contain"
          @error="logoOk = false"
        />
        <template v-else>
          <div class="w-8 h-8 rounded-xl bg-[var(--accent-soft)] border border-[var(--border-md)] flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div class="flex flex-col leading-tight">
            <span class="text-sm font-bold text-[var(--text-primary)] tracking-tight">Dashboard UPM</span>
            <span class="text-xs font-medium text-[var(--accent)]">Unit Pelayanan Media</span>
          </div>
        </template>
      </div>
      <span class="ml-auto text-xs font-semibold px-2 py-0.5 rounded-md bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border)]">
        {{ hijriLabel }}
      </span>
    </div>

    <!-- Primary Action Button -->
    <div class="px-4 pt-4 pb-2">
      <button
        class="w-full py-2.5 px-3.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)]
               text-white text-xs font-semibold tracking-wide flex items-center justify-center gap-2
               shadow-sm transition-colors cursor-pointer active:scale-[0.99]"
        @click="go('/buat')"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        <span>Buat Tugas</span>
      </button>
    </div>

    <!-- Navigation Links -->
    <nav class="flex-1 px-3 py-3 space-y-1 overflow-y-auto" aria-label="Navigasi Utama">
      <p class="px-2.5 pb-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
        Menu Utama
      </p>

      <button
        v-for="item in navItems"
        :key="item.path"
        class="sidebar-link"
        :class="{ active: isActive(item.path) }"
        @click="go(item.path)"
      >
        <span class="sidebar-icon" v-html="item.icon" />
        <span class="flex-1 text-left truncate">{{ item.label }}</span>
        <span
          v-if="item.badge"
          class="text-xs font-bold px-2 py-0.5 rounded-md"
          :class="isActive(item.path) ? 'bg-white/20 text-white' : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]'"
        >
          {{ item.badge }}
        </span>
      </button>
    </nav>

    <!-- Google Drive Status Card -->
    <div class="px-3.5 pb-3">
      <div class="p-3 rounded-xl bg-[var(--bg-elevated)]/70 border border-[var(--border)] flex items-center gap-2.5">
        <span
          class="w-2 h-2 rounded-full flex-shrink-0"
          :class="drive.driveConnected.value ? 'bg-[var(--green)]' : 'bg-[var(--text-muted)]'"
        />
        <div class="flex-1 min-w-0">
          <p class="text-xs font-semibold text-[var(--text-primary)] truncate">Google Drive</p>
          <p class="text-xs text-[var(--text-muted)] truncate">
            {{ drive.driveConnected.value ? 'Terhubung ke folder pusat' : 'Belum terhubung' }}
          </p>
        </div>
        <button
          v-if="!drive.driveConnected.value"
          class="text-xs font-semibold text-[var(--accent)] hover:underline cursor-pointer flex-shrink-0"
          @click="drive.connectDrive()"
        >
          Hubungkan
        </button>
      </div>
    </div>

    <!-- User Profile & Appearance Footer -->
    <div class="p-3.5 border-t border-[var(--border)] bg-[var(--bg-base)]/40 flex items-center gap-2.5">
      <div
        class="flex items-center gap-2.5 flex-1 min-w-0 p-1.5 rounded-xl hover:bg-[var(--bg-elevated)] cursor-pointer transition-colors"
        @click="go('/profil')"
      >
        <div
          class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 border border-[var(--border-md)]"
          :style="{ background: user?.bg, color: user?.color }"
        >
          {{ user?.initials }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs font-bold text-[var(--text-primary)] truncate">{{ user?.name }}</p>
          <p class="text-xs text-[var(--text-muted)] truncate">{{ user?.roleLabel }}</p>
        </div>
      </div>

      <button
        class="w-8 h-8 rounded-lg flex items-center justify-center
               bg-[var(--bg-elevated)] border border-[var(--border)]
               text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-md)]
               transition-colors cursor-pointer flex-shrink-0"
        :title="isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'"
        aria-label="Ganti Tema"
        @click="themeStore.toggle()"
      >
        <svg v-if="isDark" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round">
          <circle cx="12" cy="12" r="4"/>
          <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
        <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useAuthStore }  from '~/stores/auth'
import { useThemeStore } from '~/stores/theme'
import { useTasksStore } from '~/stores/tasks'
import { useDrive }      from '~/composables/useDrive'
import { useHijri }      from '~/composables/useHijri'

const auth       = useAuthStore()
const themeStore = useThemeStore()
const tasksStore = useTasksStore()
const drive      = useDrive()
const route      = useRoute()
const toast      = useToast()
const { approxCurrentHijriYear } = useHijri()

const logoOk     = ref(true)
const user       = computed(() => auth.currentUser)
const isDark     = computed(() => themeStore.isDark)
const hijriLabel = computed(() => `${approxCurrentHijriYear()}H`)

const inProgressCount = computed(() =>
  tasksStore.tasks.filter(t => ['produksi', 'qc'].includes(t.status)).length
)

const navItems = computed(() => [
  {
    label: 'Beranda',
    path: '/',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
    badge: null,
  },
  {
    label: 'Kalender Tayang',
    path: '/kalender',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    badge: null,
  },
  {
    label: 'Manajemen Tim',
    path: '/manajemen',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    badge: inProgressCount.value ? `${inProgressCount.value}` : null,
  },
  {
    label: 'Semua Tugas',
    path: '/tugas',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
    badge: null,
  },
  {
    label: 'Program Kerja',
    path: '/progja',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    badge: null,
  },
  {
    label: 'Profil & Pengaturan',
    path: '/profil',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
    badge: null,
  },
])

const isActive = (path: string) =>
  path === '/' ? route.path === '/' : route.path.startsWith(path)

const go = (path: string) => {
  if (path === '/manajemen' && auth.isReadOnly) {
    toast.add({ title: 'Akses terbatas (Read Only)', color: 'orange' })
    return
  }
  navigateTo(path)
}
</script>

<style scoped>
.sidebar-link {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 9px 12px;
  border-radius: 10px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

.sidebar-link:hover {
  background: var(--bg-elevated);
  color: var(--text-primary);
}

.sidebar-link.active {
  background: var(--accent-soft);
  color: var(--accent);
  border-color: var(--border-md);
  font-weight: 600;
}

.sidebar-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
</style>

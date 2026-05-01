<template>
  <nav class="absolute bottom-0 left-0 right-0 flex justify-center
              pb-[calc(10px+env(safe-area-inset-bottom,0px))] px-3.5 z-50 pointer-events-none">
    <div class="w-full flex items-end justify-around
                px-1 py-2.5
                bg-[var(--bg-surface)]/80 backdrop-blur-2xl
                border border-[var(--border-md)] rounded-[28px]
                shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]
                pointer-events-auto">

      <!-- Beranda -->
      <button class="nav-item" :class="{ active: isActive('/') }" @click="go('/')">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round">
          <path d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z"/>
        </svg>
        <span class="nav-lbl">Beranda</span>
      </button>

      <!-- Manajemen -->
      <button class="nav-item" :class="{ active: isActive('/manajemen') }" @click="go('/manajemen')">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <rect x="3" y="3" width="7" height="7" rx="1.5"/>
          <rect x="14" y="3" width="7" height="7" rx="1.5"/>
          <rect x="3" y="14" width="7" height="7" rx="1.5"/>
          <rect x="14" y="14" width="7" height="7" rx="1.5"/>
        </svg>
        <span class="nav-lbl">Manajemen</span>
      </button>

      <!-- FAB -->
      <button class="flex flex-col items-center gap-1 pointer-events-auto outline-none" @click="go('/buat')">
        <span class="flex items-center justify-center w-11 h-11 rounded-full bg-[var(--blue)]
                     shadow-[0_4px_16px_rgba(59,130,246,0.45)]
                     border-[3px] border-[var(--bg-base)]
                     -mt-5 transition-transform active:scale-90 flex-shrink-0">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 5V19M5 12H19" stroke="white" stroke-width="2.2" stroke-linecap="round"/>
          </svg>
        </span>
        <span class="text-[9px] font-semibold text-[var(--text-muted)] tracking-wide">Buat</span>
      </button>

      <!-- Progja (hanya super admin) atau Tugas (semua) -->
      <button v-if="showProgja" key="btn-progja" class="nav-item" :class="{ active: isActive('/progja') }" @click="go('/progja')">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M9 11l3 3L22 4" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke-linecap="round"/>
        </svg>
        <span class="nav-lbl">Progja</span>
      </button>
      
      <button v-else key="btn-tugas" class="nav-item" :class="{ active: isActive('/tugas') }" @click="go('/tugas')">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <rect x="4" y="3" width="16" height="18" rx="2"/>
          <path d="M8 8H16M8 12H16M8 16H12" stroke-linecap="round"/>
        </svg>
        <span class="nav-lbl">Tugas</span>
      </button>

      <!-- Profil -->
      <button class="nav-item" :class="{ active: isActive('/profil') }" @click="go('/profil')">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <circle cx="12" cy="8" r="4"/>
          <path d="M4 20C4 17 7.58 15 12 15C16.42 15 20 17 20 20" stroke-linecap="round"/>
        </svg>
        <span class="nav-lbl">Profil</span>
      </button>

    </div>
  </nav>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const route = useRoute()
const toast = useToast()
const auth  = useAuthStore()

// Show Progja tab for Ziyan and Ketua
const showProgja = computed(() =>
  auth.currentUser?.id === 'ziyan' ||
  ['ketua', 'planner', 'tester'].includes(auth.currentUser?.role ?? '')
)

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
.nav-item {
  flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px;
  background: none; border: none; cursor: pointer; padding: 4px 6px; border-radius: 12px;
  color: var(--text-muted); transition: color .15s, background .15s;
  outline: none; -webkit-tap-highlight-color: transparent;
}
.nav-item:active { background: var(--bg-elevated); }
.nav-item.active { color: var(--blue); }
.nav-icon { width: 22px; height: 22px; flex-shrink: 0; }
.nav-lbl  { font-size: 9px; font-weight: 600; letter-spacing: 0.3px; white-space: nowrap; }
</style>

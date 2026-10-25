<template>
  <nav class="fixed md:hidden bottom-0 left-0 right-0 flex justify-center
              pb-[calc(10px+env(safe-area-inset-bottom,0px))] px-3 z-50 pointer-events-none">
    <div class="w-full max-w-[440px] flex items-center justify-between
                px-1.5 py-1.5
                bg-[var(--bg-surface)]/90 backdrop-blur-2xl
                border border-[var(--border-md)] rounded-[22px]
                shadow-[var(--shadow-float)]
                pointer-events-auto">

      <!-- 1. Beranda -->
      <button class="nav-item" :class="{ active: isActive('/') }" @click="go('/')" aria-label="Beranda">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round">
          <path d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z"/>
        </svg>
        <span class="nav-lbl">Beranda</span>
      </button>

      <!-- 2. Kalender -->
      <button class="nav-item" :class="{ active: isActive('/kalender') }" @click="go('/kalender')" aria-label="Kalender">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <span class="nav-lbl">Kalender</span>
      </button>

      <!-- 3. Tugas -->
      <button class="nav-item" :class="{ active: isActive('/tugas') || isActive('/misi') }" @click="go('/tugas')" aria-label="Tugas">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9">
          <rect x="4" y="3" width="16" height="18" rx="2"/>
          <path d="M8 8H16M8 12H16M8 16H12" stroke-linecap="round"/>
        </svg>
        <span class="nav-lbl">Tugas</span>
      </button>

      <!-- 4. Manajemen -->
      <button class="nav-item" :class="{ active: isActive('/manajemen') || isActive('/progja') }" @click="go('/manajemen')" aria-label="Manajemen">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9">
          <rect x="3" y="3" width="7" height="7" rx="1.5"/>
          <rect x="14" y="3" width="7" height="7" rx="1.5"/>
          <rect x="3" y="14" width="7" height="7" rx="1.5"/>
          <rect x="14" y="14" width="7" height="7" rx="1.5"/>
        </svg>
        <span class="nav-lbl">Manajemen</span>
      </button>

      <!-- 5. Profil -->
      <button class="nav-item" :class="{ active: isActive('/profil') }" @click="go('/profil')" aria-label="Profil">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9">
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
  flex: 1;
  min-height: 46px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 2px;
  border-radius: 12px;
  color: var(--text-muted);
  transition: color .15s ease, background .15s ease, transform .12s ease;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}
.nav-item:active {
  transform: scale(0.94);
  background: var(--bg-elevated);
}
.nav-item.active {
  color: var(--accent);
}
.nav-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  transition: transform .15s ease;
}
.nav-item.active .nav-icon {
  transform: translateY(-1px);
}
.nav-lbl {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1px;
  white-space: nowrap;
}
</style>

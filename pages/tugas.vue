<template>
  <div class="pb-2">
    
    <div class="sticky top-0 z-10 bg-[var(--bg-base)] px-4 pt-4 pb-2 mb-2 border-b border-[var(--border)]">
      <h1 class="text-xl font-bold text-[var(--text-primary)] mb-3">Semua Tugas</h1>
      
      <div class="flex gap-2 mb-3 bg-[var(--bg-elevated)] p-1 rounded-xl border border-[var(--border-md)]">
        <button v-for="t in TYPE_TABS" :key="t.v"
          class="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all duration-200"
          :class="typeF === t.v 
            ? 'bg-[var(--blue)] text-white shadow-sm' 
            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]'"
          @click="typeF = t.v">
          {{ t.l }}
        </button>
      </div>

      <div class="flex gap-2 overflow-x-auto scrollbar-none pb-1">
        <button v-for="s in STATUS_TABS" :key="s.v"
          class="flex-shrink-0 px-4 py-1.5 rounded-full text-[11px] font-semibold transition-all border"
          :class="statusF === s.v 
            ? 'bg-blue-500/10 border-[var(--blue)] text-[var(--blue)]' 
            : 'bg-[var(--bg-elevated)] border-[var(--border-md)] text-[var(--text-secondary)]'"
          @click="statusF = s.v">
          {{ s.l }}
        </button>
      </div>
    </div>

    <div class="px-4 mt-3">
      <TransitionGroup name="list" tag="div" class="relative">
        <TaskCard 
          v-for="t in filtered" 
          :key="t.id" 
          :task="t" 
          @click="x => navigateTo('/misi/' + x.id)" 
        />
      </TransitionGroup>

      <div v-if="!filtered.length" class="flex flex-col items-center justify-center py-16 text-[var(--text-muted)] opacity-80">
        <svg class="w-12 h-12 mb-3 text-[var(--border-md)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
        </svg>
        <p class="text-sm font-medium">Tidak ada tugas di kategori ini</p>
      </div>
    </div>
    
  </div>
</template>

<script setup lang="ts">
import { useTasksStore } from '~/stores/tasks'

definePageMeta({ middleware: 'auth' })
const tasks = useTasksStore()
const route = useRoute()

onMounted(() => { if (!tasks.tasks.length) tasks.fetchTasks() })

// Opsi Tipe Tugas
const TYPE_TABS = [
  { v: 'semua', l: 'Semua' },
  { v: 'tim',   l: 'Tim' },
  { v: 'admin', l: 'Admin' }
]

// ✅ Solusi: Kategori filter disamakan persis dengan logika Dashboard
const STATUS_TABS = [
  { v: 'semua',   l: 'Semua' },
  { v: 'belum',   l: 'Belum Mulai' },
  { v: 'proses',  l: 'Dalam Proses' },
  { v: 'approval',l: 'Approval' },
  { v: 'selesai', l: 'Selesai' },
]

const typeF   = ref('semua')
const statusF = ref('semua')

// ✅ Menangkap status dari Dashboard saat halaman dimuat
onMounted(() => {
  if (route.query.status) {
    statusF.value = String(route.query.status)
  }
})

// ✅ Menjaga filter tetap sinkron jika URL berubah (misal dari tombol back)
watch(() => route.query.status, (newStatus) => {
  if (newStatus) statusF.value = String(newStatus)
})

// Logika Filter & Sorting
const filtered = computed(() => {
  let l = [...tasks.tasks]
  
  // 1. Filter Tipe
  if (typeF.value !== 'semua') {
    l = l.filter(t => t.type === typeF.value)
  }

  // 2. Filter Status (Grouping cerdas yg sudah diperbaiki)
  if (statusF.value !== 'semua') {
    l = l.filter(t => {
      // Selesai & Belum Mulai tetap sama
      if (statusF.value === 'selesai') return t.status === 'selesai'
      if (statusF.value === 'belum') return t.status === 'planning'
      
      // Approval: Hanya untuk tugas TIM (QC)
      if (statusF.value === 'approval') {
        return t.type === 'tim' && t.status === 'qc'
      }
      
      // ✅ Solusi: Dalam Proses 
      // Tim = produksi
      if (statusF.value === 'proses') {
        return t.status === 'produksi'
      }
      
      return true
    })
  }

  // 3. UX: Urutkan otomatis
  return l.sort((a, b) => {
    if (a.status === 'selesai' && b.status !== 'selesai') return 1
    if (a.status !== 'selesai' && b.status === 'selesai') return -1
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
  })
})
</script>

<style scoped>
.scrollbar-none { scrollbar-width: none; }
.scrollbar-none::-webkit-scrollbar { display: none; }

/* ✅ UX: Transisi animasi untuk Vue TransitionGroup */
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-15px);
}
.list-leave-active {
  position: absolute;
  width: 100%;
}
</style>
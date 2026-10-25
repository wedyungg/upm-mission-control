<template>
  <div class="px-4 md:px-8 py-4 md:py-6 max-w-7xl mx-auto">
    
    <!-- Header + Filter Controls -->
    <div class="sticky top-0 z-10 bg-[var(--bg-base)]/90 backdrop-blur-md pt-1 pb-4 mb-5 border-b border-[var(--border)]">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-xl md:text-2xl font-bold text-[var(--text-primary)] tracking-tight">Semua Tugas</h1>
            <p class="text-xs text-[var(--text-secondary)] mt-0.5">Menampilkan {{ filtered.length }} tugas sesuai filter aktif</p>
          </div>
        </div>
        
        <div class="flex flex-col sm:flex-row sm:items-center gap-3">
          <!-- Type Segmented Control -->
          <div class="flex gap-1 bg-[var(--bg-elevated)] p-1 rounded-xl border border-[var(--border-md)] sm:w-64 flex-shrink-0">
            <button v-for="t in TYPE_TABS" :key="t.v"
              class="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all duration-150"
              :class="typeF === t.v 
                ? 'bg-[var(--accent)] text-white shadow-sm' 
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'"
              @click="typeF = t.v">
              {{ t.l }}
            </button>
          </div>

          <!-- Status Filter Pills -->
          <div class="flex gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
            <button v-for="s in STATUS_TABS" :key="s.v"
              class="flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border"
              :class="statusF === s.v 
                ? 'bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--accent)]' 
                : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-md)]'"
              @click="statusF = s.v">
              {{ s.l }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Multi-Column Task Grid on Desktop -->
    <div>
      <TransitionGroup
        name="list"
        tag="div"
        class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 relative"
      >
        <TaskCard 
          v-for="t in filtered" 
          :key="t.id" 
          :task="t" 
          @click="x => navigateTo('/misi/' + x.id)" 
        />
      </TransitionGroup>

      <div v-if="!filtered.length" class="flex flex-col items-center justify-center py-16 px-4 rounded-2xl bg-[var(--bg-card)] border border-dashed border-[var(--border-md)] text-[var(--text-muted)]">
        <svg class="w-11 h-11 mb-3 text-[var(--text-muted)] opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
        </svg>
        <p class="text-sm font-medium text-[var(--text-secondary)]">Tidak ada tugas di kategori ini</p>
        <p class="text-xs text-[var(--text-muted)] mt-1">Coba pilih filter status atau tipe tugas lainnya</p>
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

const TYPE_TABS = [
  { v: 'semua', l: 'Semua' },
  { v: 'tim',   l: 'Tim' },
  { v: 'admin', l: 'Admin' }
]

const STATUS_TABS = [
  { v: 'semua',   l: 'Semua' },
  { v: 'belum',   l: 'Belum Mulai' },
  { v: 'proses',  l: 'Dalam Proses' },
  { v: 'approval',l: 'Approval QC' },
  { v: 'selesai', l: 'Selesai' },
]

const typeF   = ref('semua')
const statusF = ref('semua')

onMounted(() => {
  if (route.query.status) {
    statusF.value = String(route.query.status)
  }
})

watch(() => route.query.status, (newStatus) => {
  if (newStatus) statusF.value = String(newStatus)
})

const filtered = computed(() => {
  let l = [...tasks.tasks]
  
  if (typeF.value !== 'semua') {
    l = l.filter(t => t.type === typeF.value)
  }

  if (statusF.value !== 'semua') {
    l = l.filter(t => {
      if (statusF.value === 'selesai') return t.status === 'selesai'
      if (statusF.value === 'belum') return t.status === 'planning'
      if (statusF.value === 'approval') {
        return t.type === 'tim' && t.status === 'qc'
      }
      if (statusF.value === 'proses') {
        return t.status === 'produksi'
      }
      return true
    })
  }

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

.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>

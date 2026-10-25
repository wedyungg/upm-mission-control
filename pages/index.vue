<template>
  <div class="px-4 md:px-8 py-5 md:py-7 max-w-7xl mx-auto">

    <!-- Top row -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Kinerja UPM</h1>
        <p class="text-xs text-[var(--text-secondary)] mt-1">{{ periodLabel }}</p>
      </div>
      
      <button class="month-sel flex items-center gap-2.5" @click="isMonthPickerOpen = true">
        <svg class="w-4 h-4 text-[var(--accent)] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        <span class="text-sm font-semibold text-[var(--text-primary)]">{{ HIJRI_MONTHS_ID[activeMonth] }}</span>
        <svg class="w-3.5 h-3.5 text-[var(--text-muted)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"></path></svg>
      </button>
    </div>

    <!-- Month Picker Modal / Sheet -->
    <Transition name="slide-bottom">
      <div v-if="isMonthPickerOpen" class="ios-backdrop" @click="isMonthPickerOpen = false">
        <div class="ios-sheet" @click.stop>
          <div class="sheet-header">
            <span class="sheet-title">Pilih Bulan Hijriah</span>
            <button class="sheet-close" @click="isMonthPickerOpen = false">Selesai</button>
          </div>
          <div class="sheet-body">
            <button 
              v-for="(m, i) in HIJRI_MONTHS_ID" 
              :key="i"
              class="sheet-item"
              :class="{ 'active': activeMonth === i }"
              @click="pilihBulan(i)"
            >
              <span class="text-sm font-medium">{{ m }}</span>
              <svg v-if="activeMonth === i" class="w-4 h-4 text-[var(--accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Desktop 12-Col Grid / Mobile Stack -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

      <!-- Left Column (7 cols on Desktop): Performance Summary + Workflow Stepper -->
      <div class="lg:col-span-7 space-y-6">

        <!-- Performance card -->
        <div class="card">
          <div class="flex flex-col sm:flex-row sm:items-center gap-6 pb-5 border-b border-[var(--border)]">
            <!-- Circle -->
            <div class="flex items-center gap-5">
              <div class="relative w-[96px] h-[96px] flex-shrink-0">
                <svg width="96" height="96" viewBox="0 0 88 88">
                  <circle cx="44" cy="44" r="36" fill="none" stroke="var(--border-md)" stroke-width="9"/>
                  <circle cx="44" cy="44" r="36" fill="none" stroke="var(--accent)"
                    stroke-width="9" stroke-linecap="round"
                    :stroke-dasharray="CIRC" :stroke-dashoffset="circleOffset"
                    transform="rotate(-90 44 44)"/>
                </svg>
                <div class="absolute inset-0 flex items-center justify-center font-bold font-mono text-xl text-[var(--text-primary)]">
                  {{ pct }}%
                </div>
              </div>
              
              <div class="min-w-0">
                <p class="text-xs font-medium text-[var(--text-muted)]">Telah menyelesaikan</p>
                <div class="flex items-baseline gap-2 mt-0.5">
                  <p class="text-3xl font-bold font-mono text-[var(--accent)] leading-tight">
                    {{ tasks.annualSelesaiCount }}
                  </p>
                  <span class="text-xs text-[var(--text-secondary)] font-medium">
                    dari {{ progja.getTotalTarget() }} target program kerja
                  </span>
                </div>
                <p class="text-xs font-mono text-[var(--text-muted)] mt-1.5">Tahun Akademik {{ hijriLabel }}</p>
              </div>
            </div>
          </div>

          <div class="mt-4 mb-3 flex items-center justify-between">
            <p class="text-xs font-semibold tracking-wider text-[var(--text-muted)] uppercase">Ringkasan Tugas ({{ HIJRI_MONTHS_ID[activeMonth] }})</p>
            <span class="text-xs text-[var(--text-muted)]">Pilih untuk memfilter</span>
          </div>

          <!-- Stat grid: 2x2 on mobile, 4 cols on tablet/desktop -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button class="stat-box border-amber-500/30 bg-amber-500/8 hover:border-amber-500/60" @click="filterKeTugas('belum')">
              <p class="font-mono font-bold text-2xl text-[var(--orange)]">{{ stats.belum }}</p>
              <p class="text-xs font-medium text-[var(--text-secondary)] mt-1">Belum dikerjakan</p>
            </button>
            
            <button class="stat-box border-emerald-500/30 bg-emerald-500/8 hover:border-emerald-500/60" @click="filterKeTugas('proses')">
              <p class="font-mono font-bold text-2xl text-[var(--accent)]">{{ stats.proses }}</p>
              <p class="text-xs font-medium text-[var(--text-secondary)] mt-1">Dalam proses</p>
            </button>
            
            <button class="stat-box border-yellow-500/30 bg-yellow-500/8 hover:border-yellow-500/60" @click="filterKeTugas('approval')">
              <p class="font-mono font-bold text-2xl text-[var(--yellow)]">{{ stats.approval }}</p>
              <p class="text-xs font-medium text-[var(--text-secondary)] mt-1">Menunggu QC</p>
            </button>
            
            <button class="stat-box border-teal-500/30 bg-teal-500/8 hover:border-teal-500/60" @click="filterKeTugas('selesai')">
              <p class="font-mono font-bold text-2xl text-[var(--green)]">{{ stats.selesai }}</p>
              <p class="text-xs font-medium text-[var(--text-secondary)] mt-1">Selesai</p>
            </button>
          </div>
        </div>

        <!-- Workflow Stepper -->
        <div class="card">
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border)]">
            <div>
              <h2 class="text-base font-semibold text-[var(--text-primary)] tracking-tight">Alur Kerja Produksi</h2>
              <p class="text-xs text-[var(--text-secondary)] mt-0.5">Posisi tahapan konten bulan {{ HIJRI_MONTHS_ID[activeMonth] }}</p>
            </div>
            <span class="text-xs font-medium px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border)]">
              {{ HIJRI_MONTHS_ID[activeMonth] }}
            </span>
          </div>

          <div v-for="(step, i) in STEPS" :key="step.key" class="flex gap-3.5">
            <!-- Left spine -->
            <div class="flex flex-col items-center w-7 flex-shrink-0">
              <div class="step-dot" :class="dotClass(step.key, i)">{{ i + 1 }}</div>
              <div v-if="i < STEPS.length - 1" class="w-px flex-1 min-h-6 bg-[var(--border-md)] my-1" />
            </div>
            <!-- Content -->
            <div class="flex-1 pb-4 min-w-0 overflow-hidden">
              <div class="flex items-center justify-between mb-2">
                <p class="text-xs font-bold" :class="hasTask(step.key) ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'">
                  {{ step.label }}
                </p>
                <span class="text-xs font-medium text-[var(--text-muted)]">{{ stepItems(step.key).length }} tugas</span>
              </div>
              <div v-if="stepItems(step.key).length" class="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                <div
                  v-for="t in stepItems(step.key)"
                  :key="t.id"
                  class="mini-card"
                  @click="navigateTo('/misi/' + t.id)"
                >
                  <div class="flex items-center gap-1.5 mb-1">
                    <span class="text-xs font-semibold text-[var(--text-primary)] truncate flex-1 min-w-0">{{ t.name }}</span>
                  </div>
                  <p class="text-xs text-[var(--text-secondary)] mb-1.5 truncate">{{ t.kat }}</p>
                  <UiCountdownBadge :deadline="t.deadline" />
                </div>
              </div>
              <p v-else class="text-xs text-[var(--text-muted)] italic">Tidak ada tugas pada tahap ini</p>
            </div>
          </div>
        </div>

      </div>

      <!-- Right Column (5 cols on Desktop): Weekly Tracker + Sedang Berlangsung -->
      <div class="lg:col-span-5 space-y-6">

        <!-- Weekly Target Tracker -->
        <DashboardWeeklyTracker />

        <!-- Sedang Berlangsung -->
        <div class="card">
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border)]">
            <div>
              <h2 class="text-base font-semibold text-[var(--text-primary)] tracking-tight">Sedang Berlangsung</h2>
              <p class="text-xs text-[var(--text-secondary)] mt-0.5">Tugas aktif dalam tahap Produksi & QC</p>
            </div>
            <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
              {{ inProgress.length }}
            </span>
          </div>

          <div class="space-y-3">
            <TaskCard
              v-for="t in inProgress"
              :key="t.id"
              :task="t"
              @click="x => navigateTo('/misi/' + x.id)"
            />
            <div v-if="!inProgress.length" class="text-center py-8 px-4 rounded-xl bg-[var(--bg-elevated)]/50 border border-dashed border-[var(--border)]">
              <p class="text-xs text-[var(--text-muted)]">Tidak ada tugas yang sedang berlangsung pada bulan ini</p>
            </div>
          </div>
        </div>

      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
import { useTasksStore } from '~/stores/tasks'
import { useHijri }      from '~/composables/useHijri'
import { useProgjaStore } from '~/stores/progja'
import UiGradeBadge      from '~/components/ui/GradeBadge.vue'
import DashboardWeeklyTracker from '~/components/dashboard/WeeklyTracker.vue'

const tasks = useTasksStore()
const progja = useProgjaStore()
const { HIJRI_MONTHS_ID, getCurrentHijriMonth, approxCurrentHijriYear } = useHijri()

const hy = approxCurrentHijriYear()
const currentHm = getCurrentHijriMonth()

const initialIndexValue = (currentHm - 10 + 12) % 12

const isMonthPickerOpen = ref(false)
const activeMonth = ref(initialIndexValue)

const hijriLabel = `${hy}H — ${hy + 1}H`
const periodLabel = `Periode ${hijriLabel}`

onMounted(async () => {
  tasks.fetchTasks(activeMonth.value)
  progja.fetchProgja(hy)
  tasks.fetchAnnualSelesai(hy)
})

const pilihBulan = (index: number) => {
  activeMonth.value = index
  isMonthPickerOpen.value = false
  tasks.fetchByMonth(index)
}

const onMonthChange = () => tasks.fetchByMonth(activeMonth.value)

const filterKeTugas = (status: string) => {
  navigateTo({
    path: '/tugas',
    query: { status: status }
  })
}

const stats = computed(() => {
  const tasksBulanIni = tasks.tasks.filter(t => t.bulan === activeMonth.value)
  
  let countProses = 0
  let countApproval = 0
  let countSelesai = 0
  
  tasksBulanIni.forEach(t => {
    if (t.status === 'selesai') {
      countSelesai++
    } else if (t.status === 'qc') {
      countApproval++
    } else if (t.status === 'produksi') {
      countProses++
    }
  })
  
  const sTahunan = tasks.getStats() 
  const totalTarget = progja.getTotalTarget()
  const realBelum = Math.max(0, totalTarget - sTahunan.selesai - sTahunan.proses - sTahunan.approval)

  return {
    belum: realBelum,             
    proses: countProses,     
    approval: countApproval, 
    selesai: countSelesai    
  }
})

const CIRC = 226.2
const pct = computed(() => {
  const totalTarget = progja.getTotalTarget()
  const selesaiTahun = tasks.annualSelesaiCount
  
  if (totalTarget <= 0) return 0
  return Math.min(100, Math.round((selesaiTahun / totalTarget) * 100))
})

const circleOffset = computed(() => CIRC - (pct.value / 100) * CIRC)

const STEPS = [
  { key: 'planning',   label: 'Planning'   },
  { key: 'produksi',   label: 'Produksi'   },
  { key: 'qc',         label: 'QC'         },
] as const

const stepItems = (key: string) =>
  tasks.tasks.filter(t => t.status === key && t.type === 'tim' && t.bulan === activeMonth.value)

const hasTask = (key: string) => stepItems(key).length > 0

const dotClass = (key: string, i: number) => {
  if (hasTask(key)) return 'dot-active'
  const first = STEPS.findIndex(s => hasTask(s.key))
  return first > i ? 'dot-done' : 'dot-pending'
}

const inProgress = computed(() =>
  tasks.tasks.filter(t => {
    if (t.bulan !== activeMonth.value) return false
    if (t.type === 'admin') {
      return false
    } else {
      return ['produksi', 'qc'].includes(t.status)
    }
  })
)
</script>

<style scoped>
.month-sel {
  background: var(--bg-card);
  border: 1px solid var(--border-md);
  border-radius: 12px;
  padding: 8px 14px;
  cursor: pointer;
  outline: none;
  flex-shrink: 0;
  transition: transform 0.15s, border-color 0.2s, background 0.2s;
  box-shadow: var(--card-shadow);
}
.month-sel:hover { border-color: var(--accent); }
.month-sel:active { transform: scale(0.97); }

.ios-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(5px);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
@media (min-width: 768px) {
  .ios-backdrop {
    justify-content: center;
    align-items: center;
    padding: 24px;
  }
}

.ios-sheet {
  background: var(--bg-surface);
  border: 1px solid var(--border-md);
  border-radius: 24px 24px 0 0;
  padding: 20px 20px 30px;
  max-height: 75vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -4px 24px rgba(0,0,0,0.35);
}
@media (min-width: 768px) {
  .ios-sheet {
    max-width: 420px;
    border-radius: 20px;
    padding: 20px;
    box-shadow: 0 20px 50px rgba(0,0,0,0.4);
  }
}

.sheet-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 12px; padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}
.sheet-title { font-size: 15px; font-weight: 700; color: var(--text-primary); }
.sheet-close { font-size: 14px; font-weight: 600; color: var(--accent); background: none; border: none; cursor: pointer; }

.sheet-body {
  overflow-y: auto;
  display: flex; flex-direction: column; gap: 4px;
  scrollbar-width: none;
}
.sheet-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 14px; border-radius: 12px;
  background: transparent; border: none;
  font-size: 14px; font-weight: 500; color: var(--text-secondary);
  text-align: left; cursor: pointer; transition: background 0.15s;
}
.sheet-item:hover { background: var(--bg-elevated); }
.sheet-item.active { 
  color: var(--accent); 
  font-weight: 700; 
  background: var(--accent-soft); 
}

.slide-bottom-enter-active, .slide-bottom-leave-active { transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
.slide-bottom-enter-from, .slide-bottom-leave-to { opacity: 0; }
.slide-bottom-enter-from .ios-sheet, .slide-bottom-leave-to .ios-sheet { transform: translateY(24px); }

.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 20px;
  overflow: hidden;
  box-shadow: var(--card-shadow);
}

.stat-box {
  border-radius: 12px;
  padding: 14px 12px;
  text-align: center;
  border-width: 1px;
  border-style: solid;
  cursor: pointer;
  transition: transform 0.15s ease, border-color 0.15s ease;
}
.stat-box:hover { transform: translateY(-1px); }
.stat-box:active { transform: scale(0.98); }

.step-dot {
  width: 28px; height: 28px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700;
  font-family: var(--font-mono); flex-shrink: 0;
}
.dot-done    { background: var(--green); color: #fff; }
.dot-active  { background: var(--accent); color: #fff; box-shadow: 0 0 0 4px var(--accent-soft); }
.dot-pending { background: var(--bg-elevated); color: var(--text-muted); border: 1.5px solid var(--border-md); }

.mini-card {
  min-width: 160px; max-width: 220px; flex-shrink: 0;
  background: var(--bg-elevated);
  border: 1px solid var(--border-md);
  border-radius: 12px; padding: 12px;
  cursor: pointer; transition: transform .12s, border-color .15s;
}
.mini-card:hover { border-color: var(--accent); }
.mini-card:active { transform: scale(0.97); }

.scrollbar-none { scrollbar-width: none; }
.scrollbar-none::-webkit-scrollbar { display: none; }
</style>

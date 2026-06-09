<template>
  <div class="pb-2">

    <!-- Top row -->
    <div class="flex items-center justify-between px-4 pt-4 pb-0 mb-3.5">
      <div>
        <h1 class="text-xl font-bold text-[var(--text-primary)]">Kinerja UPM</h1>
        <p class="text-xs text-[var(--text-secondary)] mt-0.5">{{ periodLabel }}</p>
      </div>
      
      <button class="month-sel flex items-center gap-1.5" @click="isMonthPickerOpen = true">
        {{ HIJRI_MONTHS_ID[activeMonth] }}
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path></svg>
      </button>
    </div>

    <Transition name="slide-bottom">
      <div v-if="isMonthPickerOpen" class="ios-backdrop" @click="isMonthPickerOpen = false">
        <div class="ios-sheet" @click.stop>
          <div class="sheet-header">
            <span class="sheet-title">Pilih Bulan</span>
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
              {{ m }}
              <span v-if="activeMonth === i" class="check-icon">✓</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Performance card -->
    <div class="card">
      <div class="flex items-center gap-5 pb-3">
        <!-- Circle -->
        <div class="relative w-[88px] h-[88px] flex-shrink-0">
          <svg width="88" height="88" viewBox="0 0 88 88">
            <circle cx="44" cy="44" r="36" fill="none" stroke="var(--border)" stroke-width="10"/>
            <circle cx="44" cy="44" r="36" fill="none" stroke="var(--green)"
              stroke-width="10" stroke-linecap="round"
              :stroke-dasharray="CIRC" :stroke-dashoffset="circleOffset"
              transform="rotate(-90 44 44)"/>
          </svg>
          <div class="absolute inset-0 flex items-center justify-center font-bold text-lg text-[var(--text-primary)]">
  {{ pct }}%
</div>
        </div>
        
        <div class="min-w-0">
  <p class="text-xs text-[var(--text-muted)]">Telah menyelesaikan</p>
  <p class="text-3xl font-bold font-mono text-[var(--green)] leading-tight">
    {{ tasks.annualSelesaiCount }}
  </p>
  <p class="text-xs text-[var(--text-secondary)]">
    dari {{ progja.getTotalTarget() }} target program kerja
  </p>
  <p class="text-xs font-mono text-[var(--text-muted)] mt-1">{{ hijriLabel }}</p>
</div>
      </div>
      <div class="mt-5 mb-2.5">
  <p class="text-[10px] font-bold tracking-wider text-[var(--text-secondary)] uppercase">Ringkasan Projek</p>
</div>
<div class="grid grid-cols-2 gap-2">
  </div>
      <!-- Stat grid -->
      <div class="grid grid-cols-2 gap-2 mt-3">
  <div class="stat-box border-[var(--orange)] bg-orange-500/10" @click="filterKeTugas('belum')">
    <p class="font-mono font-bold text-2xl text-[var(--orange)]">{{ stats.belum }}</p>
    <p class="text-xs text-[var(--text-secondary)] mt-0.5">Belum dikerjakan</p>
  </div>
  
  <div class="stat-box border-[var(--blue)] bg-blue-500/10" @click="filterKeTugas('proses')">
    <p class="font-mono font-bold text-2xl text-[var(--blue)]">{{ stats.proses }}</p>
    <p class="text-xs text-[var(--text-secondary)] mt-0.5">Dalam proses</p>
  </div>
  
  <div class="stat-box border-[var(--yellow)] bg-yellow-500/10" @click="filterKeTugas('approval')">
    <p class="font-mono font-bold text-2xl text-[var(--yellow)]">{{ stats.approval }}</p>
    <p class="text-xs text-[var(--text-secondary)] mt-0.5">Menunggu approval</p>
  </div>
  
  <div class="stat-box border-[var(--green)] bg-green-500/10" @click="filterKeTugas('selesai')">
    <p class="font-mono font-bold text-2xl text-[var(--green)]">{{ stats.selesai }}</p>
    <p class="text-xs text-[var(--text-secondary)] mt-0.5">Selesai</p>
  </div>
</div>
    </div>

    <!-- Weekly Target Tracker -->
    <div class="px-4 mb-2">
      <DashboardWeeklyTracker />
    </div>

    <!-- Workflow Stepper -->
    <div class="flex items-center justify-between px-4 mt-1 mb-2.5">
      <h2 class="text-base font-bold text-[var(--text-primary)]">Alur Kerja</h2>
      <span class="text-xs text-[var(--text-muted)]">{{ HIJRI_MONTHS_ID[activeMonth] }}</span>
    </div>
    <div class="card !py-4 !pb-2">
      <div v-for="(step, i) in STEPS" :key="step.key" class="flex gap-2.5">
        <!-- Left spine -->
        <div class="flex flex-col items-center w-7 flex-shrink-0">
          <div class="step-dot" :class="dotClass(step.key, i)">{{ i + 1 }}</div>
          <div v-if="i < STEPS.length - 1" class="w-px flex-1 min-h-4 bg-[var(--border)] my-0.5" />
        </div>
        <!-- Content -->
        <div class="flex-1 pb-3.5 min-w-0 overflow-hidden">
          <p class="text-xs font-bold mb-2" :class="hasTask(step.key) ? 'text-[var(--blue)]' : 'text-[var(--text-muted)]'">
            {{ step.label }}
          </p>
          <div v-if="stepItems(step.key).length" class="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            <div
              v-for="t in stepItems(step.key)"
              :key="t.id"
              class="mini-card"
              @click="navigateTo('/misi/' + t.id)"
            >
              <div class="flex items-center gap-1.5 mb-1">
                <span class="text-xs font-semibold text-[var(--text-primary)] truncate flex-1 min-w-0">{{ t.name }}</span>
              </div>
              <p class="text-[10px] text-[var(--text-secondary)] mb-1">{{ t.kat }}</p>
              <UiCountdownBadge :deadline="t.deadline" />
            </div>
          </div>
          <p v-else class="text-xs text-[var(--text-muted)] italic">Tidak ada tugas</p>
        </div>
      </div>
    </div>

    <!-- Sedang Berlangsung -->
    <div class="flex items-center justify-between px-4 mt-1 mb-2.5">
      <h2 class="text-base font-bold text-[var(--text-primary)]">Sedang Berlangsung</h2>
    </div>
    <div class="px-4 mb-2">
      <TaskCard
        v-for="t in inProgress"
        :key="t.id"
        :task="t"
        @click="x => navigateTo('/misi/' + x.id)"
      />
      <p v-if="!inProgress.length" class="text-center py-5 text-xs italic text-[var(--text-muted)]">
        Tidak ada tugas berlangsung
      </p>
    </div>

  </div>
</template>

<script setup lang="ts">
import { useTasksStore } from '~/stores/tasks'
import { useHijri }      from '~/composables/useHijri'
import { useProgjaStore } from '~/stores/progja'
import UiGradeBadge      from '~/components/ui/GradeBadge.vue'
import DashboardWeeklyTracker from '~/components/dashboard/WeeklyTracker.vue'

// 1. Inisialisasi Store dan Composable
const tasks = useTasksStore()
const progja = useProgjaStore()
const { HIJRI_MONTHS_ID, getCurrentHijriMonth, approxCurrentHijriYear } = useHijri()

// 2. Variabel Pendukung (Didefinisikan sebelum digunakan di ref)
const hy = approxCurrentHijriYear()
const currentHm = getCurrentHijriMonth()

// Hitung index bulan Hijriah saat ini (Syawwal = index 0)
// Rumus: (Bulan Hijriah sekarang - 10 + 12) % 12
const initialIndexValue = (currentHm - 10 + 12) % 12

// 3. State Refs
const isMonthPickerOpen = ref(false)
const activeMonth = ref(initialIndexValue)

// Label Periode
const hijriLabel = `${hy}H — ${hy + 1}H`
const periodLabel = `Periode ${hijriLabel}`

// 4. Lifecycle Hooks
onMounted(async () => {
  // Ambil tugas sesuai bulan aktif (Dzulqa'dah saat ini)
  tasks.fetchTasks(activeMonth.value)
  progja.fetchProgja(hy)
  // Ambil data tahunan agar angka "Telah Menyelesaikan" konsisten
  tasks.fetchAnnualSelesai(hy)
})

// 5. Methods
const pilihBulan = (index: number) => {
  activeMonth.value = index
  isMonthPickerOpen.value = false
  tasks.fetchByMonth(index)
}

const onMonthChange = () => tasks.fetchByMonth(activeMonth.value)

const filterKeTugas = (status: string) => {
  // Navigasi ke tab tugas dengan filter status
  navigateTo({
    path: '/tugas',
    query: { status: status }
  })
}

// 6. Computed Properties
const stats = computed(() => {
  // 1. Hitung manual untuk bulan ini agar lebih akurat (memisahkan admin & tim)
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
  
  // 2. Ambil data kinerja TAHUNAN untuk menghitung sisa kuota murni
  const sTahunan = tasks.getStats() 
  const totalTarget = progja.getTotalTarget()
  
  // Pakai Math.max agar angkanya mentok di 0 (tidak jadi minus)
  const realBelum = Math.max(0, totalTarget - sTahunan.selesai - sTahunan.proses - sTahunan.approval)

  return {
    belum: realBelum,             
    proses: countProses,     
    approval: countApproval, 
    selesai: countSelesai    
  }
})
// Perhitungan Persentase Tahunan (Annual Progress)
const CIRC = 226.2
const pct = computed(() => {
  const totalTarget = progja.getTotalTarget()
  const selesaiTahun = tasks.annualSelesaiCount // Menggunakan data 1 tahun penuh
  
  if (totalTarget <= 0) return 0
  return Math.min(100, Math.round((selesaiTahun / totalTarget) * 100))
})

const circleOffset = computed(() => CIRC - (pct.value / 100) * CIRC)

// Alur Kerja
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

// index.vue (sekitar baris 152)

const inProgress = computed(() =>
  tasks.tasks.filter(t => {
    // Pastikan hanya menampilkan tugas pada bulan yang dipilih
    if (t.bulan !== activeMonth.value) return false
    
    if (t.type === 'admin') {
      return false // Admin tasks go straight to selesai so no progress state
    } else {
      // Untuk tugas tim, tampilkan yang sedang diproses
      return ['produksi', 'qc'].includes(t.status)
    }
  })
)
</script>

<style scoped>
/* Gaya Tombol Asli Anda (Ditambah efek hover/active) */
.month-sel {
  background: var(--bg-elevated);
  border: 1px solid var(--border-md);
  border-radius: 12px; /* Dibuat sedikit membulat agar senada dengan UI iOS */
  padding: 6px 12px;
  font-size: 13px;
  color: var(--blue);
  font-weight: 600;
  cursor: pointer;
  outline: none;
  flex-shrink: 0;
  max-width: 140px;
  transition: transform 0.15s, background 0.2s;
}
.month-sel:active { transform: scale(0.95); background: var(--bg-surface); }

/* --- CSS BOTTOM SHEET iOS --- */

/* Layar Gelap (Backdrop) */
.ios-backdrop {
  position: absolute; /* KUNCINE NENG KENE: Ganti 'fixed' dadi 'absolute' */
  inset: 0; 
  z-index: 100;;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex; flex-direction: column; justify-content: flex-end;
}

/* Kothak Menu yang Muncul dari Bawah */
.ios-sheet {
  background: var(--bg-surface, #1e293b);
  border-radius: 24px 24px 0 0;
  padding: 20px 20px 34px; /* Padding bawah lebih tebal untuk area swipe iPhone */
  max-height: 70vh;
  display: flex; flex-direction: column;
  box-shadow: 0 -4px 24px rgba(0,0,0,0.4);
}

/* Header Menu */
.sheet-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 12px; padding-bottom: 12px;
  border-bottom: 1px solid var(--border, rgba(255,255,255,0.08));
}
.sheet-title { font-size: 16px; font-weight: 700; color: var(--text-primary); }
.sheet-close { font-size: 15px; font-weight: 600; color: var(--blue); background: none; border: none; cursor: pointer; }

/* Daftar Item Bulan */
.sheet-body {
  overflow-y: auto;
  display: flex; flex-direction: column; gap: 4px;
  scrollbar-width: none;
}
.sheet-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 16px; border-radius: 12px;
  background: transparent; border: none;
  font-size: 15px; font-weight: 500; color: var(--text-muted);
  text-align: left; cursor: pointer; transition: background 0.2s;
}
.sheet-item:active { background: var(--bg-elevated); }
.sheet-item.active { 
  color: var(--blue); 
  font-weight: 700; 
  background: rgba(59, 130, 246, 0.1); 
}
.check-icon { font-size: 16px; font-weight: 900; }

/* Animasi Muncul dari Bawah */
.slide-bottom-enter-active, .slide-bottom-leave-active { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.slide-bottom-enter-from, .slide-bottom-leave-to { opacity: 0; }
.slide-bottom-enter-from .ios-sheet, .slide-bottom-leave-to .ios-sheet { transform: translateY(100%); }
.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 16px;
  margin: 0 16px 12px;
  width: calc(100% - 32px);
  overflow: hidden;
}

.stat-box {
  border-radius: 10px;
  padding: 11px 10px;
  text-align: center;
  border-width: 1.5px;
  border-style: solid;
}

/* Stepper dots */
.step-dot {
  width: 26px; height: 26px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 700;
  font-family: var(--font-mono); flex-shrink: 0;
}
.dot-done    { background: var(--green); color: #fff; }
.dot-active  { background: var(--blue);  color: #fff; box-shadow: 0 0 0 4px color-mix(in srgb, var(--blue) 20%, transparent); }
.dot-pending { background: var(--bg-elevated); color: var(--text-muted); border: 1.5px solid var(--border-md); }

/* Mini cards */
.mini-card {
  min-width: 150px; max-width: 200px; flex-shrink: 0;
  background: var(--bg-elevated);
  border: 1px solid var(--border-md);
  border-radius: 10px; padding: 10px;
  cursor: pointer; transition: transform .12s;
}
.mini-card:active { transform: scale(0.97); }

.scrollbar-none { scrollbar-width: none; }
.scrollbar-none::-webkit-scrollbar { display: none; }
</style>

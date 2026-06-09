<template>
  <div class="pb-2">
    <div class="flex items-center justify-between px-4 pt-4 mb-3.5">
      <h1 class="text-xl font-bold text-[var(--text-primary)]">Manajemen</h1>
      
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

    <div class="card">
      <p class="slabel">Kinerja Individu</p>
      <div v-for="m in displayMembers" :key="m.id"
        class="flex items-center gap-2.5 py-2.5 border-b border-[var(--border)] last:border-0">
        <div class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
          :style="{ background: m.bg, color: m.color }">{{ m.initials }}</div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-[var(--text-primary)] truncate">{{ m.name }}</p>
          <p class="text-xs text-[var(--text-muted)]">{{ m.roleLabel }}</p>
          <div class="flex items-center gap-1.5 mt-1">
            <div class="flex-1 h-1.5 bg-[var(--bg-elevated)] rounded-full overflow-hidden min-w-0">
              <div class="h-full rounded-full transition-[width] duration-700"
                :style="{ width: m.load + '%', background: barColor(m.load) }"/>
            </div>
            <span class="text-xs flex-shrink-0 font-medium" :style="{ color: barColor(m.load) }">{{ m.load }}%</span>
            <span class="text-xs font-bold px-1.5 py-0.5 rounded flex-shrink-0" :class="loadCls(m.load)">
              {{ loadLbl(m.load) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="flex items-center justify-between mb-3">
        <p class="slabel !mb-0">Kerja Tim Tersisa</p>
        <button class="text-xs text-[var(--blue)] font-semibold" @click="navigateTo('/progja')">
          Kelola Progja →
        </button>
      </div>
      <div v-if="progja.loading" class="flex justify-center py-6">
        <div class="w-5 h-5 border-2 border-[var(--blue)] border-t-transparent rounded-full animate-spin"/>
      </div>
      <div v-else-if="sisaTim.length === 0" class="text-center py-4 text-xs italic text-[var(--text-muted)]">
        Belum ada data progja. Tap "Kelola Progja" untuk menambahkan.
      </div>
      <div v-else class="grid grid-cols-2 gap-2 mb-3">
        <ProgjaCard
          v-for="item in sisaTim"
          :key="item.grade"
          :grade="item.grade"
          :sisa="item.sisa"
          :target="item.target"
          :done="item.done"
          :rincian="item.rincian"
        />
      </div>
      <button v-if="canCreateTim && sisaTim.length > 0" class="btn-primary" @click="navigateTo('/buat')">
        BUAT TUGAS SEKARANG
      </button>
    </div>

    <div class="card">
      <div class="flex items-center justify-between mb-3">
        <p class="slabel !mb-0">Kerja Administrasi Tersisa</p>
        <button class="text-xs text-[var(--blue)] font-semibold" @click="navigateTo('/progja')">
          Kelola Progja →
        </button>
      </div>
      <div v-if="progja.loading" class="flex justify-center py-6">
        <div class="w-5 h-5 border-2 border-[var(--blue)] border-t-transparent rounded-full animate-spin"/>
      </div>
      <div v-else-if="sisaAdmin.length === 0" class="text-center py-4 text-xs italic text-[var(--text-muted)]">
        Belum ada data progja administrasi.
      </div>
      <div v-else class="grid grid-cols-2 gap-2 mb-3">
        <ProgjaCard
          v-for="item in sisaAdmin"
          :key="item.grade"
          :grade="item.grade"
          :sisa="item.sisa"
          :target="item.target"
          :done="item.done"
          :rincian="item.rincian"
        />
      </div>
      <button v-if="canCreateAdmin && sisaAdmin.length > 0" class="btn-outline" @click="navigateTo('/buat?type=admin')">
        BUAT TUGAS SEKARANG
      </button>
    </div>

    <div class="flex items-center justify-between px-4 mt-1 mb-2.5">
      <h2 class="text-base font-bold text-[var(--text-primary)]">Butuh Tindakan</h2>
    </div>
    <div class="flex gap-1.5 px-4 mb-2.5 overflow-x-auto scrollbar-none">
      <button v-for="tab in ALL_TABS" :key="tab.key"
        class="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border-[1.5px] outline-none flex items-center gap-1 transition-all"
        :class="activeTab === tab.key
          ? 'bg-[var(--blue)] border-[var(--blue)] text-white'
          : 'bg-transparent border-[var(--border-md)] text-[var(--text-secondary)]'"
        @click="activeTab = tab.key">
        {{ tab.label }}
        <span v-if="tabCount(tab) > 0" class="bg-white/20 rounded-full px-1.5 text-xs">{{ tabCount(tab) }}</span>
      </button>
    </div>
    <div class="px-4 mb-2">
      <TaskCard v-for="t in tabTasks" :key="t.id" :task="t" @click="x => navigateTo('/misi/' + x.id)" />
      <p v-if="!tabTasks.length" class="text-center py-5 text-sm italic text-[var(--text-muted)]">
        Tidak ada tugas pada tahap ini
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTasksStore }       from '~/stores/tasks'
import { useProgjaStore }      from '~/stores/progja'
import { useAuthStore, USERS } from '~/stores/auth'
import { useHijri }            from '~/composables/useHijri'
import type { TaskStatus, TabAccess } from '~/types'
import ProgjaCard from '~/components/task/ProgjaCard.vue'

definePageMeta({ middleware: 'auth' })

const tasks  = useTasksStore()
const progja = useProgjaStore()
const auth   = useAuthStore()
const { HIJRI_MONTHS_ID, approxCurrentHijriYear, getCurrentHijriMonth } = useHijri()

// ── SINKRONISASI INDEX BULAN (Matholek Academic Index) ──
const currentHm = getCurrentHijriMonth()
const initialIndex = (currentHm - 10 + 12) % 12

const isMonthPickerOpen = ref(false)
const activeMonth       = ref(initialIndex)

const onMonthChange = () => tasks.fetchByMonth(activeMonth.value)

// Fungsi untuk bottom sheet iOS
const pilihBulan = (index: number) => {
  activeMonth.value = index
  isMonthPickerOpen.value = false
  onMonthChange()
}

onMounted(() => {
  tasks.fetchTasks() 
  progja.fetchProgja(approxCurrentHijriYear())
})

// ── Kinerja Individu ──────────────────────────────────────────

const GRADE_POINTS: Record<string, number> = {
  'S': 5,
  'A': 3,
  'B': 2,
  'C': 1
};

const ROLE_MULTIPLIER: Record<string, number> = {
  planner: 1.0,           
  admin_partnership: 1.1, 
  production: 1.5,        
  editor_crew: 1.4        
};

const MAX_POINT_CAPACITY = 20;

const ROLE_TASK_MAP: Record<string, TaskStatus[]> = {
  planner: ['planning', 'qc'],
  production: ['produksi'],
  admin_partnership: ['selesai'],
  editor_crew: ['produksi']
};

const displayMembers = computed(() => {
  return USERS.filter(u => Object.keys(ROLE_TASK_MAP).includes(u.role)).map(user => {
    const relevantStatuses = ROLE_TASK_MAP[user.role] || [];
    const multiplier = ROLE_MULTIPLIER[user.role] || 1.0;
    
    const totalPoints = tasks.tasks
      .filter(t => relevantStatuses.includes(t.status) && t.bulan === activeMonth.value)
      .reduce((sum, task) => {
        const basePoint = GRADE_POINTS[task.grade] || 1;
        return sum + (basePoint * multiplier);
      }, 0);

    const load = Math.min(100, Math.round((totalPoints / MAX_POINT_CAPACITY) * 100));

    return { ...user, load };
  });
});

const barColor = (l: number) => l >= 80 ? 'var(--red)' : l >= 60 ? 'var(--yellow)' : 'var(--green)';
const loadCls  = (l: number) => l >= 80 ? 'load-danger' : l >= 60 ? 'load-warning' : 'load-normal';
const loadLbl  = (l: number) => l >= 80 ? 'Overload'   : l >= 60 ? 'Sibuk'         : 'Normal';

const doneTasks = computed(() =>
  tasks.tasks.filter(t => t.status === 'selesai')
)

const sisaTim = computed(() =>
  progja.getSisaByGrade('tim', doneTasks.value)
)
const sisaAdmin = computed(() =>
  progja.getSisaByGrade('admin', doneTasks.value)
)

const canCreateTim   = computed(() => ['ketua', 'planner'].includes(auth.currentUser?.role ?? ''))
const canCreateAdmin = computed(() => ['ketua', 'admin_partnership'].includes(auth.currentUser?.role ?? ''))

interface ATab { key: TabAccess; label: string; statuses: TaskStatus[] }
const ALL_TABS: ATab[] = [
  { key: 'planner',    label: 'Planner',  statuses: ['planning']    },
  { key: 'production', label: 'Produksi', statuses: ['produksi']    },
  { key: 'qc',         label: 'QC',       statuses: ['qc']          },
  { key: 'publisher',  label: 'Selesai',  statuses: ['selesai']     },
]
const activeTab = ref<TabAccess>('planner')
const tabCount  = (tab: ATab) =>
  tasks.tasks.filter(t => tab.statuses.includes(t.status) && t.bulan === activeMonth.value).length
const tabTasks  = computed(() => {
  const tab = ALL_TABS.find(t => t.key === activeTab.value)
  return tab ? tasks.tasks.filter(t => tab.statuses.includes(t.status) && t.bulan === activeMonth.value) : []
})
</script>

<style scoped>
.month-sel {
  background: var(--bg-elevated); border: 1px solid var(--border-md);
  border-radius: 12px; padding: 6px 12px; font-size: 13px;
  color: var(--blue); font-weight: 600; cursor: pointer; outline: none;
  flex-shrink: 0; max-width: 140px; transition: transform 0.15s, background 0.2s;
}
.month-sel:active { transform: scale(0.95); background: var(--bg-surface); }

/* --- CSS BOTTOM SHEET iOS --- */
.ios-backdrop { position: absolute; inset: 0; z-index: 100; background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(4px); display: flex; flex-direction: column; justify-content: flex-end; }
.ios-sheet { background: var(--bg-surface, #1e293b); border-radius: 24px 24px 0 0; padding: 20px 20px 34px; max-height: 70vh; display: flex; flex-direction: column; box-shadow: 0 -4px 24px rgba(0,0,0,0.4); }
.sheet-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid var(--border, rgba(255,255,255,0.08)); }
.sheet-title { font-size: 16px; font-weight: 700; color: var(--text-primary); }
.sheet-close { font-size: 15px; font-weight: 600; color: var(--blue); background: none; border: none; cursor: pointer; }
.sheet-body { overflow-y: auto; display: flex; flex-direction: column; gap: 4px; scrollbar-width: none; }
.sheet-item { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; border-radius: 12px; background: transparent; border: none; font-size: 15px; font-weight: 500; color: var(--text-muted); text-align: left; cursor: pointer; transition: background 0.2s; }
.sheet-item:active { background: var(--bg-elevated); }
.sheet-item.active { color: var(--blue); font-weight: 700; background: rgba(59, 130, 246, 0.1); }
.check-icon { font-size: 16px; font-weight: 900; }
.slide-bottom-enter-active, .slide-bottom-leave-active { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.slide-bottom-enter-from, .slide-bottom-leave-to { opacity: 0; }
.slide-bottom-enter-from .ios-sheet, .slide-bottom-leave-to .ios-sheet { transform: translateY(100%); }

.card {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: 16px; padding: 16px;
  margin: 0 16px 12px; width: calc(100% - 32px); overflow: hidden;
}
.slabel {
  font-size: 0.75rem; font-weight: 700; letter-spacing: 1px;
  text-transform: uppercase; color: var(--text-muted); margin-bottom: 12px; display: block;
}
.load-normal  { background: rgba(35, 201, 96, 0.1);  color: var(--green); }
.load-warning { background: rgba(234, 179, 8, 0.1); color: var(--yellow); }
.load-danger  { background: rgba(239, 68, 68, 0.1); color: var(--red); }
.btn-primary {
  display: flex; align-items: center; justify-content: center;
  width: 100%; padding: 13px; border-radius: 12px; border: none;
  font-size: 0.875rem; font-weight: 700; background: var(--blue); color: #fff;
  cursor: pointer; font-family: inherit; transition: opacity .15s;
}
.btn-outline {
  display: flex; align-items: center; justify-content: center;
  width: 100%; padding: 13px; border-radius: 12px;
  font-size: 0.875rem; font-weight: 700;
  background: transparent; border: 1.5px solid var(--border-md); color: var(--text-secondary);
  cursor: pointer; font-family: inherit; transition: opacity .15s;
}
.btn-primary:active, .btn-outline:active { opacity: .82; }
.scrollbar-none { scrollbar-width: none; }
.scrollbar-none::-webkit-scrollbar { display: none; }
</style>
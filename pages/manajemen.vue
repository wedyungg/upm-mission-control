<template>
  <div class="px-4 md:px-8 py-5 md:py-7 max-w-7xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Manajemen Tim</h1>
        <p class="text-xs text-[var(--text-secondary)] mt-1">Pantauan beban kerja kru dan target program kerja</p>
      </div>
      
      <button class="month-sel flex items-center gap-2.5" @click="isMonthPickerOpen = true">
        <svg class="w-4 h-4 text-[var(--accent)] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        <span class="text-sm font-semibold text-[var(--text-primary)]">{{ HIJRI_MONTHS_ID[activeMonth] }}</span>
        <svg class="w-3.5 h-3.5 text-[var(--text-muted)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"></path></svg>
      </button>
    </div>

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

    <!-- Desktop 12-Col Grid: Left = Kinerja Individu, Right = Kuota Progja -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-6">

      <!-- Kinerja Individu (5 cols on desktop) -->
      <div class="card lg:col-span-5">
        <div class="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border)]">
          <p class="slabel !mb-0">Kinerja & Beban Individu</p>
          <span class="text-xs font-mono text-[var(--text-muted)]">{{ HIJRI_MONTHS_ID[activeMonth] }}</span>
        </div>
        <div v-for="m in displayMembers" :key="m.id"
          class="flex items-center gap-3.5 py-3.5 border-b border-[var(--border)] last:border-0">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
            :style="{ background: m.bg, color: m.color }">{{ m.initials }}</div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between mb-0.5">
              <p class="text-sm font-semibold text-[var(--text-primary)] truncate">{{ m.name }}</p>
              <span class="text-xs font-bold px-2.5 py-0.5 rounded-full flex-shrink-0" :class="loadCls(m.load)">
                {{ loadLbl(m.load) }}
              </span>
            </div>
            <p class="text-xs text-[var(--text-secondary)]">{{ m.roleLabel }}</p>
            <div class="flex items-center gap-2.5 mt-2">
              <div class="flex-1 h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden min-w-0">
                <div class="h-full rounded-full transition-[width] duration-700"
                  :style="{ width: m.load + '%', background: barColor(m.load) }"/>
              </div>
              <span class="text-xs font-mono flex-shrink-0 font-semibold" :style="{ color: barColor(m.load) }">{{ m.load }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Progja Tim & Admin (7 cols on desktop) -->
      <div class="lg:col-span-7 space-y-6">
        <div class="card">
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border)]">
            <p class="slabel !mb-0">Sisa Target Tim</p>
            <button class="text-xs text-[var(--accent)] hover:underline font-semibold" @click="navigateTo('/progja')">
              Kelola Progja
            </button>
          </div>
          <div v-if="progja.loading" class="flex justify-center py-6">
            <div class="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"/>
          </div>
          <div v-else-if="sisaTim.length === 0" class="text-center py-4 text-xs italic text-[var(--text-muted)]">
            Belum ada data progja. Klik "Kelola Progja" untuk menambahkan.
          </div>
          <div v-else class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
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
            Buat Tugas Tim
          </button>
        </div>

        <div class="card">
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border)]">
            <p class="slabel !mb-0">Sisa Target Administrasi</p>
            <button class="text-xs text-[var(--accent)] hover:underline font-semibold" @click="navigateTo('/progja')">
              Kelola Progja
            </button>
          </div>
          <div v-if="progja.loading" class="flex justify-center py-6">
            <div class="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"/>
          </div>
          <div v-else-if="sisaAdmin.length === 0" class="text-center py-4 text-xs italic text-[var(--text-muted)]">
            Belum ada data progja administrasi.
          </div>
          <div v-else class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
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
            Buat Tugas Administrasi
          </button>
        </div>
      </div>

    </div>

    <!-- Butuh Tindakan Section -->
    <div class="card">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[var(--border)]">
        <div>
          <h2 class="text-base font-semibold text-[var(--text-primary)] tracking-tight">Butuh Tindakan</h2>
          <p class="text-xs text-[var(--text-secondary)] mt-0.5">Filter berdasarkan tahapan tugas bulan {{ HIJRI_MONTHS_ID[activeMonth] }}</p>
        </div>
        <div class="flex gap-2 overflow-x-auto scrollbar-none">
          <button v-for="tab in ALL_TABS" :key="tab.key"
            class="flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold border outline-none flex items-center gap-1.5 transition-all"
            :class="activeTab === tab.key
              ? 'bg-[var(--accent)] border-[var(--accent)] text-white shadow-sm'
              : 'bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'"
            @click="activeTab = tab.key">
            <span>{{ tab.label }}</span>
            <span v-if="tabCount(tab) > 0" class="rounded-full px-2 py-0.5 text-xs font-mono"
              :class="activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-[var(--bg-card)] text-[var(--text-secondary)]'">
              {{ tabCount(tab) }}
            </span>
          </button>
        </div>
      </div>

      <div v-if="tabTasks.length" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
        <TaskCard v-for="t in tabTasks" :key="t.id" :task="t" @click="x => navigateTo('/misi/' + x.id)" />
      </div>
      <div v-else class="text-center py-8 rounded-xl bg-[var(--bg-elevated)]/40 border border-dashed border-[var(--border)]">
        <p class="text-xs text-[var(--text-muted)]">Tidak ada tugas pada tahap ini</p>
      </div>
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

const currentHm = getCurrentHijriMonth()
const initialIndex = (currentHm - 10 + 12) % 12

const isMonthPickerOpen = ref(false)
const activeMonth       = ref(initialIndex)

const onMonthChange = () => tasks.fetchByMonth(activeMonth.value)

const pilihBulan = (index: number) => {
  activeMonth.value = index
  isMonthPickerOpen.value = false
  onMonthChange()
}

onMounted(() => {
  tasks.fetchTasks() 
  progja.fetchProgja(approxCurrentHijriYear())
})

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
  background: var(--bg-card); border: 1px solid var(--border-md);
  border-radius: 12px; padding: 8px 14px; font-size: 14px;
  color: var(--text-primary); font-weight: 600; cursor: pointer; outline: none;
  flex-shrink: 0; transition: transform 0.15s, border-color 0.2s;
  box-shadow: var(--card-shadow);
}
.month-sel:hover { border-color: var(--accent); }
.month-sel:active { transform: scale(0.97); }

.ios-backdrop {
  position: fixed; inset: 0; z-index: 100;
  background: rgba(0, 0, 0, 0.55); backdrop-filter: blur(5px);
  display: flex; flex-direction: column; justify-content: flex-end;
}
@media (min-width: 768px) {
  .ios-backdrop { justify-content: center; align-items: center; padding: 24px; }
}
.ios-sheet {
  background: var(--bg-surface); border: 1px solid var(--border-md);
  border-radius: 24px 24px 0 0; padding: 20px 20px 30px; max-height: 75vh;
  width: 100%; display: flex; flex-direction: column; box-shadow: 0 -4px 24px rgba(0,0,0,0.35);
}
@media (min-width: 768px) {
  .ios-sheet { max-width: 420px; border-radius: 20px; padding: 20px; box-shadow: 0 20px 50px rgba(0,0,0,0.4); }
}
.sheet-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
.sheet-title { font-size: 15px; font-weight: 700; color: var(--text-primary); }
.sheet-close { font-size: 14px; font-weight: 600; color: var(--accent); background: none; border: none; cursor: pointer; }
.sheet-body { overflow-y: auto; display: flex; flex-direction: column; gap: 4px; scrollbar-width: none; }
.sheet-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; border-radius: 12px; background: transparent; border: none; font-size: 14px; font-weight: 500; color: var(--text-secondary); text-align: left; cursor: pointer; transition: background 0.15s; }
.sheet-item:hover { background: var(--bg-elevated); }
.sheet-item.active { color: var(--accent); font-weight: 700; background: var(--accent-soft); }
.slide-bottom-enter-active, .slide-bottom-leave-active { transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
.slide-bottom-enter-from, .slide-bottom-leave-to { opacity: 0; }
.slide-bottom-enter-from .ios-sheet, .slide-bottom-leave-to .ios-sheet { transform: translateY(24px); }

.card {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: 16px; padding: 20px;
  overflow: hidden;
  box-shadow: var(--card-shadow);
}
.slabel {
  font-size: 0.75rem; font-weight: 700; letter-spacing: 0.05em;
  text-transform: uppercase; color: var(--text-muted); margin-bottom: 12px; display: block;
}
.load-normal  { background: rgba(16, 185, 129, 0.12); color: var(--green); }
.load-warning { background: rgba(245, 158, 11, 0.12); color: var(--yellow); }
.load-danger  { background: rgba(239, 68, 68, 0.12);  color: var(--red); }
.btn-primary {
  display: flex; align-items: center; justify-content: center;
  width: 100%; padding: 12px 16px; border-radius: 12px; border: none;
  font-size: 0.875rem; font-weight: 600; background: var(--accent); color: #fff;
  cursor: pointer; font-family: inherit; transition: background .15s, transform .12s;
}
.btn-primary:hover { background: var(--accent-hover); }
.btn-outline {
  display: flex; align-items: center; justify-content: center;
  width: 100%; padding: 12px 16px; border-radius: 12px;
  font-size: 0.875rem; font-weight: 600;
  background: var(--bg-elevated); border: 1px solid var(--border-md); color: var(--text-primary);
  cursor: pointer; font-family: inherit; transition: border-color .15s, transform .12s;
}
.btn-outline:hover { border-color: var(--accent); color: var(--accent); }
.btn-primary:active, .btn-outline:active { transform: scale(0.98); }
.scrollbar-none { scrollbar-width: none; }
.scrollbar-none::-webkit-scrollbar { display: none; }
</style>

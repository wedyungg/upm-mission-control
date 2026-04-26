<template>
  <div class="p-buat">
    <div class="page-top">
      <div class="page-title">Buat Tugas</div>
    </div>

    <!-- Access denied -->
    <div v-if="!canCreateAny" class="card">
      <div class="no-access">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/>
          <path d="M4.93 4.93l14.14 14.14M15 9h.01M9 15h.01"/>
        </svg>
        <div class="no-access-title">Akses Terbatas</div>
        <div class="no-access-sub">Role Anda tidak memiliki izin membuat tugas.</div>
      </div>
    </div>

    <template v-else>

      <!-- Type selector -->
      <div class="type-sel">
        <div
          v-if="canCreateTim"
          class="type-opt"
          :class="{ active: taskType === 'tim' }"
          @click="taskType = 'tim'"
        >Tim / Konten</div>
        <div
          v-if="canCreateAdmin"
          class="type-opt"
          :class="{ active: taskType === 'admin' }"
          @click="taskType = 'admin'"
        >Administrasi</div>
      </div>

      <!-- Success state -->
      <Transition name="fade">
        <div v-if="showSuccess" class="card success-card">
          <div class="success-ico">✅</div>
          <div class="success-title">Tugas Berhasil Dibuat!</div>
          <div class="success-sub">
            {{ lastType === 'admin'
              ? 'Tugas administrasi langsung ditandai selesai.'
              : 'Tugas tim ditambahkan ke alur Planning.' }}
          </div>
          <button class="btn btn-primary" @click="resetForm">BUAT TUGAS LAGI</button>
          <button class="btn btn-outline" style="margin-top:8px" @click="navigateTo('/')">KE BERANDA</button>
        </div>
      </Transition>

      <!-- ── FORM TIM ── -->
      <div v-if="!showSuccess && taskType === 'tim' && canCreateTim" class="card">
        <div class="card-title">Detail Tugas Tim / Konten</div>

        <!-- Progja selector -->
        <div class="ff">
          <label class="fl">Program Kerja (Progja)</label>
          
          <IosSelect 
  v-model="fTim.progja_id" 
  :options="progjaTimOptions.map(p => ({ value: p.id, label: `(${p.grade}) - ${p.nama || p.name}` }))" 
  placeholder="-- Pilih Program Kerja --" 
  label="Daftar Progja" 
  @change="onProgjaChange"
/>
          
          <div v-if="err.progja" class="ferr">{{ err.progja }}</div>
        </div>

        <div class="ff">
          <label class="fl">Judul Konten *</label>
          <input v-model="fTim.name" type="text" class="fi" placeholder="Masukkan judul konten...">
          <div v-if="err.name" class="ferr">{{ err.name }}</div>
        </div>

        <div class="ff">
          <label class="fl">Platform</label>
          <IosSelect 
            v-model="fTim.platform" 
            :options="PLATFORMS" 
            label="Pilih Platform" 
          />
        </div>

        <div class="ff">
          <label class="fl">Durasi / Slide</label>
          <IosSelect 
            v-model="fTim.durasi" 
            :options="DURASI" 
            label="Pilih Durasi" 
          />
        </div>

        <div class="ff">
          <label class="fl">Deadline Skrip</label>
          <IosSelect 
            v-model="fTim.deadlineH" 
            :options="[
              { value: 24, label: '1 Hari' },
              { value: 48, label: '2 Hari' },
              { value: 72, label: '3 Hari' },
              { value: 168, label: '1 Minggu' }
            ]" 
            label="Pilih Deadline Skrip" 
          />
        </div>

        <div class="ff">
          <label class="fl">Link Skrip (opsional)</label>
          <input v-model="fTim.skrip" type="url" class="fi" placeholder="https://docs.google.com/...">
        </div>

        <button class="btn btn-primary" :disabled="submitting" @click="submit">
          {{ submitting ? 'Membuat...' : 'BUAT JADWAL SEKARANG' }}
        </button>
      </div>

      <!-- ── FORM ADMIN ── -->
      <div v-if="!showSuccess && taskType === 'admin' && canCreateAdmin" class="card">
        <div class="card-title">Detail Tugas Administrasi</div>

        <div class="info-note">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 8v4M12 16h.01"/>
          </svg>
          Tugas administrasi akan langsung ditandai <strong>Selesai</strong> setelah dibuat.
        </div>

        <!-- Progja selector admin -->
        <div class="ff">
          <label class="fl">Program Kerja (Progja)</label>
          <select v-model="fAdmin.progja_id" class="fi">
            <option value="">-- Pilih Program Kerja --</option>
            <option
              v-for="p in progjaAdminOptions"
              :key="p.id"
              :value="p.id"
            >
              [{{ p.grade }}] {{ p.nama }}
            </option>
          </select>
        </div>

        <div class="ff">
          <label class="fl">Grade Tugas</label>
          <select v-model="fAdmin.grade" class="fi">
            <option value="S">S — Super Priority</option>
            <option value="A">A — High</option>
            <option value="B">B — Medium</option>
            <option value="C">C — Normal</option>
          </select>
        </div>

        <div class="ff">
          <label class="fl">Kategori</label>
          <select v-model="fAdmin.kat" class="fi">
            <option v-for="k in KAT_ADMIN" :key="k">{{ k }}</option>
          </select>
        </div>

        <div class="ff">
          <label class="fl">Detail Tugas *</label>
          <input v-model="fAdmin.name" type="text" class="fi" placeholder="Contoh: Membuat LPJ Budget Q4...">
          <div v-if="err.name" class="ferr">{{ err.name }}</div>
        </div>

        <div class="ff">
          <label class="fl">Link Lampiran (opsional)</label>
          <input v-model="fAdmin.link" type="url" class="fi" placeholder="https://drive.google.com/...">
        </div>

        <div class="ff">
          <label class="fl">Deadline</label>
          <select v-model="fAdmin.deadlineH" class="fi">
            <option :value="24">1 Hari</option>
            <option :value="48">2 Hari</option>
            <option :value="72">3 Hari</option>
            <option :value="168">1 Minggu</option>
          </select>
        </div>

        <button class="btn btn-primary" :disabled="submitting" @click="submit">
          {{ submitting ? 'Membuat...' : 'BUAT & SELESAIKAN' }}
        </button>
      </div>

    </template>
  </div>
</template>

<script setup lang="ts">
import { useTasksStore }  from '~/stores/tasks'
import { useProgjaStore } from '~/stores/progja'
import { useAuthStore }   from '~/stores/auth'
import { useHijri }       from '~/composables/useHijri'
import { useWhatsApp }    from '~/composables/useWhatsApp'
import type { TaskGrade, TaskType } from '~/types'

definePageMeta({ middleware: 'auth' })

const tasks       = useTasksStore()
const progjaStore = useProgjaStore()
const auth        = useAuthStore()
const toast       = useToast()
const route       = useRoute()
const { approxCurrentHijriYear, getCurrentHijriMonth } = useHijri()
const wa = useWhatsApp()

// Fetch progja saat mount — items sudah berisi default, ini sync ke Supabase
onMounted(() => {
  progjaStore.fetchProgja(approxCurrentHijriYear())
})

// ── Peta Kasta Grade ─────────────────────────────────────────
// Mengubah abjad menjadi bobot angka agar 'S' berada di urutan teratas
const gradeWeights: Record<string, number> = {
  'S': 1,
  'A': 2,
  'B': 3,
  'C': 4
}

// ── Computed options difilter per tipe & diurutkan berdasarkan Grade
const progjaTimOptions = computed(() => {
  const filtered = progjaStore.items.filter(p => p.type === 'tim')
  return filtered.sort((a, b) => {
    const weightA = gradeWeights[a.grade] || 99
    const weightB = gradeWeights[b.grade] || 99
    return weightA - weightB
  })
})

const progjaAdminOptions = computed(() => {
  const filtered = progjaStore.items.filter(p => p.type === 'admin')
  return filtered.sort((a, b) => {
    const weightA = gradeWeights[a.grade] || 99
    const weightB = gradeWeights[b.grade] || 99
    return weightA - weightB
  })
})
// ── Role access ──────────────────────────────────────────────
const canCreateTim   = computed(() => ['ketua', 'planner'].includes(auth.currentUser?.role ?? ''))
const canCreateAdmin = computed(() => ['ketua', 'admin_partnership'].includes(auth.currentUser?.role ?? ''))
const canCreateAny   = computed(() => canCreateTim.value || canCreateAdmin.value)

const taskType = ref<TaskType>(
  (route.query.type as TaskType) === 'admin' && canCreateAdmin.value
    ? 'admin'
    : canCreateTim.value ? 'tim' : 'admin'
)

// ── Static options ───────────────────────────────────────────
const KAT_TIM = [
  'Podcast/Reels/Carousel', 'Film Dokumenter', 'Video Profil',
  'Edukasi Fiqih', 'Edukasi Tauhid', 'Edukasi Kitab Kuning',
  'Desain Flyer/Poster', 'Desain Story', 'Aset Digital PIM',
  'Dawuh Guru', 'Reels/Short',
]
const KAT_ADMIN = [
  'Pengelolaan Anggaran', 'Laporan Keuangan', 'Surat Menyurat Penting',
  'Perawatan Inventaris', 'Penyimpanan Alat Produksi', 'Koordinasi Bulanan',
  'Office Care', 'Lobi Narasumber', 'Jangkauan Konten', 'Membalas DM/Komentar',
]
const PLATFORMS = ['Instagram', 'YouTube', 'TikTok', 'Facebook', 'Multi-Platform']
const DURASI    = ['1 Menit', '3 Menit', '5 Menit', '10 Menit', '30 Menit', '4 Slide', '8 Slide', '12 Slide']

// ── Form states ──────────────────────────────────────────────
const fTim = reactive({
  grade: 'A' as TaskGrade,
  kat: KAT_TIM[0],
  name: '',
  platform: PLATFORMS[0],
  durasi: DURASI[0],
  deadlineH: 72,
  skrip: '',
  progja_id: '',   // id dari ProgjaItem yang dipilih
})

const fAdmin = reactive({
  grade: 'A' as TaskGrade,
  kat: KAT_ADMIN[0],
  name: '',
  deadlineH: 48,
  link: '',
  progja_id: '',   // id dari ProgjaItem yang dipilih
})

const err         = reactive({ name: '', progja: '' })
const submitting  = ref(false)
const showSuccess = ref(false)
const lastType    = ref<TaskType>('tim')

// Saat progja dipilih, auto-isi grade dan kat sesuai data progja
const onProgjaChange = () => {
  if (!fTim.progja_id) return
  const selected = progjaStore.items.find(p => p.id === fTim.progja_id)
  if (selected) {
    fTim.grade = selected.grade
    fTim.kat   = selected.kategori
  }
}

// ── Validation ───────────────────────────────────────────────
const validate = (): boolean => {
  err.name  = ''
  err.progja = ''
  const name = taskType.value === 'tim' ? fTim.name : fAdmin.name
  if (!name.trim()) {
    err.name = 'Judul / detail tugas wajib diisi'
    return false
  }
  return true
}

// ── Submit (Versi dengan Notif WA) ───────────────────────────
const submit = async () => {
  if (!validate()) return
  submitting.value = true

  const now = Date.now()
  const { getCurrentHijriMonth, approxCurrentHijriYear } = useHijri()
  const hy = approxCurrentHijriYear()
  const currentHm = getCurrentHijriMonth()
  const bulan = (currentHm - 10 + 12) % 12

  lastType.value = taskType.value
  
  // Njupuk jeneng user sing lagi login
  const actorName = auth.currentUser?.name || 'Tim UPM'

  if (taskType.value === 'tim') {
    // 1. Simpan tugas anyar menyang variabel 'newTask'
    const newTask = await tasks.createTask({
      id:         't' + now,
      name:       fTim.name.trim(),
      kat:        fTim.kat,
      grade:      fTim.grade,
      status:     'planning',
      type:       'tim',
      deadline:   new Date(now + fTim.deadlineH * 3600000).toISOString(),
      file:       null,
      platform:   fTim.platform,
      durasi:     fTim.durasi,
      skrip:      fTim.skrip,
      progja_id:  fTim.progja_id  || undefined,
      bulan,
      hijri_year: hy,
    })
    
    // 2. KIRIM NOTIF WA
    await wa.notifyTaskCreated(newTask, actorName)

  } else {
    // Kanggo tugas Admin (langsung dianggep selesai)
    const newTask = await tasks.createTask({
      id:         'a' + now,
      name:       fAdmin.name.trim(),
      kat:        fAdmin.kat,
      grade:      fAdmin.grade,
      status:     'selesai',
      type:       'admin',
      deadline:   new Date(now + fAdmin.deadlineH * 3600000).toISOString(),
      file:       fAdmin.link  || null,
      progja_id:  fAdmin.progja_id || undefined,
      bulan,
      hijri_year: hy,
    })

    // KIRIM NOTIF WA SELESAI
    await wa.notifySelesai(newTask, actorName)
  }

  submitting.value = false
  showSuccess.value = true
  toast.add({ title: 'Tugas berhasil dibuat ✓', color: 'green' })
}
// ── Reset ─────────────────────────────────────────────────────
const resetForm = () => {
  showSuccess.value = false
  fTim.name      = ''
  fTim.progja_id = ''
  fAdmin.name      = ''
  fAdmin.link      = ''
  fAdmin.progja_id = ''
}
</script>

<style scoped>
.p-buat    { padding-bottom: 24px; }
.page-top  { padding: 16px 16px 0; margin-bottom: 14px; }
.page-title { font-size: 1.25rem; font-weight: 700; color: var(--text-primary); }

.type-sel { display: flex; gap: 8px; padding: 0 16px; margin-bottom: 14px; }
.type-opt {
  flex: 1; padding: 11px; border-radius: 10px;
  border: 1.5px solid var(--border-md); cursor: pointer; text-align: center;
  font-size: 0.875rem; font-weight: 600; color: var(--text-muted);
  transition: all .15s; background: transparent;
  -webkit-tap-highlight-color: transparent;
}
.type-opt.active { border-color: var(--blue); background: color-mix(in srgb, var(--blue) 12%, transparent); color: var(--blue); }

.card {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: 16px; padding: 16px;
  margin: 0 16px 12px; width: calc(100% - 32px); overflow: hidden;
}
.card-title {
  font-size: 0.75rem; font-weight: 700; letter-spacing: 1px;
  text-transform: uppercase; color: var(--text-muted); margin-bottom: 14px;
}

.info-note {
  display: flex; align-items: center; gap: 6px;
  font-size: 0.75rem; color: var(--blue);
  background: color-mix(in srgb, var(--blue) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--blue) 25%, transparent);
  border-radius: 8px; padding: 8px 10px; margin-bottom: 14px;
}

.ff    { margin-bottom: 14px; }
.fl    { font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; display: block; }
.fi    {
  width: 100%; background: var(--bg-elevated); border: 1.5px solid var(--border-md);
  border-radius: 8px; padding: 11px 14px; color: var(--text-primary);
  font-size: 0.875rem; font-family: inherit; outline: none; transition: border-color .2s;
}
.fi:focus { border-color: var(--blue); }
.ferr  { font-size: 0.75rem; color: var(--red); margin-top: 4px; }

.btn {
  display: flex; align-items: center; justify-content: center;
  width: 100%; padding: 13px; border-radius: 10px; border: none;
  font-size: 0.875rem; font-weight: 700; letter-spacing: .4px;
  cursor: pointer; font-family: inherit; transition: opacity .15s;
}
.btn:disabled                  { opacity: .6; cursor: not-allowed; }
.btn:active:not(:disabled)     { opacity: .85; }
.btn-primary                   { background: var(--blue); color: #fff; }
.btn-outline                   { background: transparent; border: 1.5px solid var(--border-md); color: var(--text-secondary); }

.success-card  { text-align: center; padding: 24px; }
.success-ico   { font-size: 48px; margin-bottom: 10px; }
.success-title { font-size: 1.125rem; font-weight: 700; color: var(--text-primary); margin-bottom: 6px; }
.success-sub   { font-size: 0.875rem; color: var(--text-muted); margin-bottom: 20px; }

.no-access       { text-align: center; padding: 32px 16px; }
.no-access-title { font-size: 1rem; font-weight: 700; color: var(--text-primary); margin: 12px 0 6px; }
.no-access-sub   { font-size: 0.875rem; color: var(--text-muted); }

.fade-enter-active, .fade-leave-active { transition: all .25s ease; }
.fade-enter-from { opacity: 0; transform: translateY(8px); }
.fade-leave-to   { opacity: 0; }
</style>

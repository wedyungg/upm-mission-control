<template>
  <div class="px-4 md:px-8 py-4 md:py-6 max-w-3xl mx-auto">
    <div class="mb-5">
      <h1 class="text-xl md:text-2xl font-bold text-[var(--text-primary)] tracking-tight">Buat Tugas</h1>
      <p class="text-xs text-[var(--text-secondary)] mt-0.5">Pencatatan tugas tim konten dan kegiatan administrasi</p>
    </div>

    <!-- Access denied -->
    <div v-if="!canCreateAny" class="card">
      <div class="no-access">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" class="mx-auto">
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
        <button
          v-if="canCreateTim"
          type="button"
          class="type-opt"
          :class="{ active: taskType === 'tim' }"
          @click="taskType = 'tim'"
        >Tim / Konten</button>
        <button
          v-if="canCreateAdmin"
          type="button"
          class="type-opt"
          :class="{ active: taskType === 'admin' }"
          @click="taskType = 'admin'"
        >Administrasi</button>
      </div>

      <!-- Success state -->
      <Transition name="fade">
        <div v-if="showSuccess" class="card success-card">
          <div class="w-14 h-14 rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div class="success-title">Tugas Berhasil Dibuat</div>
          <div class="success-sub">
            {{ lastType === 'admin'
              ? 'Tugas administrasi telah ditambahkan dan ditandai Selesai.'
              : 'Tugas tim telah ditambahkan ke alur kerja Planning.' }}
          </div>
          <div class="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto">
            <button class="btn btn-primary" @click="resetForm">Buat Tugas Lagi</button>
            <button class="btn btn-outline" @click="navigateTo('/')">Kembali ke Beranda</button>
          </div>
        </div>
      </Transition>

      <!-- ── FORM TIM ── -->
      <div v-if="!showSuccess && taskType === 'tim' && canCreateTim" class="card">
        <div class="card-title">Detail Konten</div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="ff">
            <label class="fl">Penanggung Jawab</label>
            <IosSelect 
              v-model="fTim.assignee" 
              :options="crewOptions" 
              placeholder="Pilih penanggung jawab" 
              label="Pilih Penanggung Jawab"
              @update:model-value="onAssigneeChange"
            />
          </div>

          <div class="ff">
            <label class="fl">Rubrik Konten</label>
            <IosSelect 
              v-model="fTim.kat" 
              :options="KAT_TIM" 
              label="Pilih Rubrik Konten" 
            />
          </div>
        </div>

        <div class="ff">
          <label class="fl">Judul Konten *</label>
          <input v-model="fTim.name" type="text" class="fi" placeholder="Contoh: Dawuh KH. Ahmad tentang Adab Menuntut Ilmu...">
          <div v-if="err.name" class="ferr">{{ err.name }}</div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="ff">
            <label class="fl">Target Tayang</label>
            <input v-model="fTim.publish_date" type="date" class="fi">
          </div>

          <div class="ff">
            <label class="fl">Grade Konten</label>
            <IosSelect 
              v-model="fTim.grade" 
              :options="[
                { value: 'S', label: 'Grade S · Produksi Spesial (5 poin)' },
                { value: 'A', label: 'Grade A · Produksi Utama (3 poin)' },
                { value: 'B', label: 'Grade B · Konten Menengah (2 poin)' },
                { value: 'C', label: 'Grade C · Konten Ringan (1 poin)' }
              ]" 
              label="Pilih Grade Konten" 
            />
          </div>
        </div>

        <!-- Progja selector (opsional) -->
        <div class="ff">
          <label class="fl">Program Kerja Tahunan (Opsional)</label>
          <IosSelect 
            v-model="fTim.progja_id" 
            :options="[{ value: '', label: 'Tanpa Program Kerja Khusus' }, ...progjaTimOptions.map(p => ({ value: p.id, label: `(${p.grade}) - ${p.nama || (p as any).name}` }))]" 
            placeholder="Pilih program kerja" 
            label="Daftar Program Kerja" 
            @change="onProgjaChange"
          />
          <div v-if="err.progja" class="ferr">{{ err.progja }}</div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="ff">
            <label class="fl">Platform</label>
            <IosSelect 
              v-model="fTim.platform" 
              :options="PLATFORMS" 
              label="Pilih Platform" 
            />
          </div>

          <div class="ff">
            <label class="fl">Durasi / Format</label>
            <IosSelect 
              v-model="fTim.durasi" 
              :options="DURASI" 
              label="Pilih Durasi" 
            />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="ff">
            <label class="fl">Target Selesai Produksi</label>
            <IosSelect 
              v-model="fTim.deadlineH" 
              :options="[
                { value: 24, label: '1 Hari' },
                { value: 48, label: '2 Hari' },
                { value: 72, label: '3 Hari' },
                { value: 168, label: '1 Minggu' }
              ]" 
              label="Pilih Target Deadline" 
            />
          </div>

          <div class="ff">
            <label class="fl">Link Konsep / Skrip (opsional)</label>
            <input v-model="fTim.skrip" type="url" class="fi" placeholder="https://docs.google.com/...">
          </div>
        </div>

        <button class="btn btn-primary mt-2" :disabled="submitting" @click="submit">
          {{ submitting ? 'Menyimpan...' : 'Simpan Konten' }}
        </button>
      </div>

      <!-- ── FORM ADMIN ── -->
      <div v-if="!showSuccess && taskType === 'admin' && canCreateAdmin" class="card">
        <div class="card-title">Detail Tugas Administrasi</div>

        <div class="info-note">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="flex-shrink-0">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 8v4M12 16h.01"/>
          </svg>
          <span>Tugas administrasi akan langsung ditandai <strong>Selesai</strong> setelah dibuat.</span>
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

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="ff">
            <label class="fl">Grade (Beban Kerja)</label>
            <select v-model="fAdmin.grade" class="fi">
              <option value="S">S — Kompleks</option>
              <option value="A">A — Berat</option>
              <option value="B">B — Sedang</option>
              <option value="C">C — Ringan</option>
            </select>
          </div>

          <div class="ff">
            <label class="fl">Kategori</label>
            <select v-model="fAdmin.kat" class="fi">
              <option v-for="k in KAT_ADMIN" :key="k">{{ k }}</option>
            </select>
          </div>
        </div>

        <div class="ff">
          <label class="fl">Detail Tugas *</label>
          <input v-model="fAdmin.name" type="text" class="fi" placeholder="Contoh: Membuat LPJ Budget Q4...">
          <div v-if="err.name" class="ferr">{{ err.name }}</div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </div>

        <button class="btn btn-primary mt-2" :disabled="submitting" @click="submit">
          {{ submitting ? 'Membuat...' : 'Simpan Tugas Administrasi' }}
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

onMounted(() => {
  progjaStore.fetchProgja(approxCurrentHijriYear())
})

const gradeWeights: Record<string, number> = {
  'S': 1,
  'A': 2,
  'B': 3,
  'C': 4
}

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

const canCreateTim   = computed(() => auth.currentUser?.access !== 'read-only')
const canCreateAdmin = computed(() => ['ketua', 'admin_partnership', 'tester'].includes(auth.currentUser?.role ?? '') || auth.currentUser?.id === 'ziyan')
const canCreateAny   = computed(() => canCreateTim.value || canCreateAdmin.value)

const taskType = ref<TaskType>(
  (route.query.type as TaskType) === 'admin' && canCreateAdmin.value
    ? 'admin'
    : canCreateTim.value ? 'tim' : 'admin'
)

const KAT_TIM = [
  'Dawuh & Keagamaan',
  'Informasi Kemadrasahan',
  'Tren Sosmed',
  'Podcast/Reels/Carousel',
  'Film Dokumenter',
  'Video Profil',
  'Edukasi Fiqih',
  'Edukasi Tauhid',
  'Edukasi Kitab Kuning',
  'Desain Flyer/Poster',
  'Desain Story',
  'Aset Digital PIM',
]
const KAT_ADMIN = [
  'Pengelolaan Anggaran', 'Laporan Keuangan', 'Surat Menyurat Penting',
  'Perawatan Inventaris', 'Penyimpanan Alat Produksi', 'Koordinasi Bulanan',
  'Office Care', 'Lobi Narasumber', 'Jangkauan Konten', 'Membalas DM/Komentar',
]
const PLATFORMS = ['Instagram', 'YouTube', 'TikTok', 'Facebook', 'Multi-Platform']
const DURASI    = ['1 Menit', '3 Menit', '5 Menit', '10 Menit', '30 Menit', '4 Slide', '8 Slide', '12 Slide']

const crewOptions = computed(() => {
  return auth.USERS
    .filter(u => u.access !== 'read-only')
    .map(u => ({
      value: u.name,
      label: u.rubrik ? `${u.name} · ${u.rubrik}` : `${u.name} (${u.roleLabel})`
    }))
})

const defaultAssignee = auth.currentUser?.access !== 'read-only' ? (auth.currentUser?.name ?? '') : ''
const defaultRubrik   = auth.currentUser?.rubrik || KAT_TIM[0]

const fTim = reactive({
  grade: 'A' as TaskGrade,
  kat: defaultRubrik,
  name: '',
  platform: PLATFORMS[0],
  durasi: DURASI[0],
  deadlineH: 72,
  skrip: '',
  progja_id: '',
  assignee: defaultAssignee,
  publish_date: '',
})

const fAdmin = reactive({
  grade: 'A' as TaskGrade,
  kat: KAT_ADMIN[0],
  name: '',
  deadlineH: 48,
  link: '',
  progja_id: '',
})

const err         = reactive({ name: '', progja: '' })
const submitting  = ref(false)
const showSuccess = ref(false)
const lastType    = ref<TaskType>('tim')

const onAssigneeChange = (val: string) => {
  const matched = auth.USERS.find(u => u.name === val)
  if (matched?.rubrik && !fTim.progja_id) {
    fTim.kat = matched.rubrik
  }
}

const onProgjaChange = () => {
  if (!fTim.progja_id) return
  const selected = progjaStore.items.find(p => p.id === fTim.progja_id)
  if (selected) {
    fTim.grade = selected.grade
    fTim.kat   = selected.kategori
  }
}

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

const submit = async () => {
  if (!validate()) return
  submitting.value = true

  const now = Date.now()
  const { getCurrentHijriMonth, approxCurrentHijriYear } = useHijri()
  const hy = approxCurrentHijriYear()
  const currentHm = getCurrentHijriMonth()
  const bulan = (currentHm - 10 + 12) % 12

  lastType.value = taskType.value
  const actorName = auth.currentUser?.name || 'Tim UPM'

  if (taskType.value === 'tim') {
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
      assignee:   fTim.assignee || undefined,
      publish_date: fTim.publish_date ? new Date(fTim.publish_date).toISOString() : undefined,
      bulan,
      hijri_year: hy,
    })
    
    await wa.notifyTaskCreated(newTask, actorName)

  } else {
    const newTask = await tasks.createTask({
      id:         'a' + now,
      name:       fAdmin.name.trim(),
      kat:        fAdmin.kat,
      grade:      fAdmin.grade,
      status:     'selesai',
      type:       'admin',
      deadline:   new Date(now + fAdmin.deadlineH * 3600000).toISOString(),
      publish_date: new Date(now + fAdmin.deadlineH * 3600000).toISOString(),
      file:       fAdmin.link  || null,
      progja_id:  fAdmin.progja_id || undefined,
      bulan,
      hijri_year: hy,
    })

    await wa.notifyTaskCreated(newTask, actorName)
  }

  submitting.value = false
  showSuccess.value = true
  toast.add({ title: 'Tugas berhasil dibuat ✓', color: 'green' })
}

const resetForm = () => {
  showSuccess.value = false
  fTim.name      = ''
  fTim.progja_id = ''
  fTim.assignee  = defaultAssignee
  fTim.kat       = defaultRubrik
  fTim.publish_date = ''
  fAdmin.name      = ''
  fAdmin.link      = ''
  fAdmin.progja_id = ''
}
</script>

<style scoped>
.type-sel {
  display: flex;
  gap: 8px;
  margin-bottom: 18px;
  background: var(--bg-elevated);
  padding: 5px;
  border-radius: 14px;
  border: 1px solid var(--border);
}
.type-opt {
  flex: 1;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid transparent;
  cursor: pointer;
  text-align: center;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
  transition: all .15s;
  background: transparent;
  -webkit-tap-highlight-color: transparent;
}
.type-opt:hover { color: var(--text-primary); }
.type-opt.active {
  background: var(--accent);
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 20px;
  overflow: hidden;
  box-shadow: var(--card-shadow);
}
@media (min-width: 640px) {
  .card { padding: 24px; }
}
.card-title {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.info-note {
  display: flex; align-items: center; gap: 8px;
  font-size: 0.78rem; color: var(--accent);
  background: var(--accent-soft);
  border: 1px solid color-mix(in srgb, var(--accent) 25%, transparent);
  border-radius: 10px; padding: 10px 12px; margin-bottom: 16px;
}

.ff    { margin-bottom: 14px; }
.fl    { font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; display: block; }
.fi    {
  width: 100%; background: var(--bg-elevated); border: 1px solid var(--border-md);
  border-radius: 10px; padding: 11px 14px; color: var(--text-primary);
  font-size: 0.875rem; font-family: inherit; outline: none; transition: border-color .2s, box-shadow .2s;
}
.fi:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
.ferr  { font-size: 0.75rem; color: var(--red); margin-top: 4px; }

.btn {
  display: flex; align-items: center; justify-content: center;
  width: 100%; padding: 13px 16px; border-radius: 12px; border: none;
  font-size: 0.875rem; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: background .15s, transform .12s, opacity .15s;
}
.btn:disabled                  { opacity: .6; cursor: not-allowed; }
.btn:active:not(:disabled)     { transform: scale(0.985); }
.btn-primary                   { background: var(--accent); color: #fff; }
.btn-primary:hover:not(:disabled) { background: var(--accent-hover); }
.btn-outline                   { background: var(--bg-elevated); border: 1px solid var(--border-md); color: var(--text-primary); }
.btn-outline:hover             { border-color: var(--accent); color: var(--accent); }

.success-card  { text-align: center; padding: 32px 24px; }
.success-title { font-size: 1.15rem; font-weight: 700; color: var(--text-primary); margin-bottom: 6px; }
.success-sub   { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 24px; }

.no-access       { text-align: center; padding: 32px 16px; }
.no-access-title { font-size: 1rem; font-weight: 700; color: var(--text-primary); margin: 12px 0 6px; }
.no-access-sub   { font-size: 0.875rem; color: var(--text-muted); }

.fade-enter-active, .fade-leave-active { transition: all .22s ease; }
.fade-enter-from { opacity: 0; transform: translateY(8px); }
.fade-leave-to   { opacity: 0; }
</style>

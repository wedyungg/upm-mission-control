<template>
  <div class="px-4 md:px-8 py-6 md:py-8 max-w-2xl mx-auto">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Buat Tugas</h1>
      <p class="text-sm text-[var(--text-secondary)] mt-1">Susun rencana konten baru secara bertahap atau catat kegiatan administrasi.</p>
    </div>

    <div v-if="!canCreateAny" class="card">
      <div class="no-access">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" class="mx-auto" aria-hidden="true">
          <circle cx="12" cy="12" r="10"/>
          <path d="M4.93 4.93l14.14 14.14M15 9h.01M9 15h.01"/>
        </svg>
        <div class="no-access-title">Akses Terbatas</div>
        <div class="no-access-sub">Akun ini hanya untuk memantau, belum bisa menambahkan tugas baru.</div>
      </div>
    </div>

    <template v-else>

      <div class="segmented-control mb-6" role="tablist" aria-label="Tipe Tugas">
        <button
          v-if="canCreateTim"
          type="button"
          role="tab"
          :aria-selected="taskType === 'tim'"
          class="segmented-btn"
          :class="{ active: taskType === 'tim' }"
          @click="taskType = 'tim'"
        >
          Konten Tim
        </button>
        <button
          v-if="canCreateAdmin"
          type="button"
          role="tab"
          :aria-selected="taskType === 'admin'"
          class="segmented-btn"
          :class="{ active: taskType === 'admin' }"
          @click="taskType = 'admin'"
        >
          Administrasi
        </button>
      </div>

      <Transition name="fade">
        <div v-if="showSuccess" class="card success-card">
          <div class="w-14 h-14 rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center mx-auto mb-4 border border-[var(--accent)]/30">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div class="success-title">
            {{ lastType === 'admin' ? 'Catatan berhasil disimpan' : 'Konten berhasil dijadwalkan' }}
          </div>
          <div class="success-sub">
            {{ lastType === 'admin'
              ? 'Kegiatan administrasi sudah tercatat dan langsung ditandai selesai.'
              : 'Konten sudah masuk ke daftar rencana dan siap mulai digarap.' }}
          </div>
          <div class="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <button class="btn btn-primary" @click="resetForm">Buat Lagi</button>
            <button class="btn btn-outline" @click="navigateTo('/')">Kembali ke Beranda</button>
          </div>
        </div>
      </Transition>

      <div v-if="!showSuccess && taskType === 'tim' && canCreateTim" class="card">
        
        <nav class="stepper-nav mb-8" aria-label="Tahapan Pembuatan Konten">
          <button
            v-for="(label, idx) in stepLabels"
            :key="idx"
            type="button"
            class="stepper-item"
            :class="{
              'active': currentStep === idx + 1,
              'completed': currentStep > idx + 1
            }"
            :aria-current="currentStep === idx + 1 ? 'step' : undefined"
            @click="goToStep(idx + 1)"
          >
            <span class="stepper-badge" aria-hidden="true">
              <svg v-if="currentStep > idx + 1" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span v-else>{{ idx + 1 }}</span>
            </span>
            <span class="stepper-label">{{ label }}</span>
          </button>
        </nav>

        <Transition name="fade" mode="out-in">
          <div v-if="currentStep === 1" key="step1" class="space-y-6">
            <div>
              <h2 class="text-xl font-bold text-[var(--text-primary)] tracking-tight">Mau bikin konten apa?</h2>
              <p class="text-sm text-[var(--text-secondary)] mt-1">Tulis ide atau judul utamanya dulu, lalu pilih siapa yang memegang proyek ini.</p>
            </div>

            <div class="ff">
              <label for="input-judul-konten" class="fl">Judul atau topik konten</label>
              <input
                id="input-judul-konten"
                v-model="fTim.name"
                type="text"
                class="fi fi-lg"
                placeholder="Misal: Dawuh KH. Ahmad tentang adab menuntut ilmu..."
                autocomplete="off"
                @keydown.enter.prevent="nextStep"
              >
              <div v-if="err.name" class="ferr" role="alert">{{ err.name }}</div>
            </div>

            <div class="ff">
              <label class="fl">Siapa yang bertanggung jawab?</label>
              <IosSelect 
                v-model="fTim.assignee" 
                :options="crewOptions" 
                placeholder="Pilih nama kru" 
                label="Pilih Penanggung Jawab"
              />
            </div>

            <div class="ff">
              <label class="fl">Masuk kategori apa?</label>
              <IosSelect 
                v-model="fTim.kat" 
                :options="KAT_TIM_OPTIONS" 
                label="Pilih Kategori Konten" 
              />
            </div>

            <div class="pt-3">
              <button type="button" class="btn btn-primary" @click="nextStep">
                <span>Lanjut ke Jadwal</span>
                <svg class="w-4 h-4 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>

          <div v-else-if="currentStep === 2" key="step2" class="space-y-6">
            <div>
              <h2 class="text-xl font-bold text-[var(--text-primary)] tracking-tight">Kapan dan tayang di mana?</h2>
              <p class="text-sm text-[var(--text-secondary)] mt-1">Tentukan rencana tanggal rilis serta platform yang dituju.</p>
            </div>

            <div class="ff">
              <label for="input-custom-date" class="fl">Rencana tayang kapan?</label>
              <div class="grid grid-cols-3 gap-2.5 mb-3">
                <button
                  v-for="slot in quickDateSlots"
                  :key="slot.dateStr"
                  type="button"
                  class="choice-pill"
                  :class="{ active: fTim.publish_date === slot.dateStr }"
                  @click="fTim.publish_date = slot.dateStr"
                >
                  {{ slot.title }}
                </button>
              </div>
              <input id="input-custom-date" v-model="fTim.publish_date" type="date" class="fi">
            </div>

            <div class="ff">
              <label class="fl">Mau ditayangkan di mana?</label>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <button
                  v-for="p in PLATFORMS"
                  :key="p"
                  type="button"
                  class="choice-pill"
                  :class="{ active: fTim.platform === p }"
                  :aria-pressed="fTim.platform === p"
                  @click="fTim.platform = p"
                >
                  {{ p }}
                </button>
              </div>
            </div>

            <div class="ff">
              <label class="fl">Berapa lama durasi atau formatnya?</label>
              <IosSelect 
                v-model="fTim.durasi" 
                :options="DURASI" 
                label="Pilih Format atau Durasi" 
              />
            </div>

            <div class="flex gap-3 pt-3">
              <button type="button" class="btn btn-outline !w-auto px-6" @click="currentStep = 1">
                Kembali
              </button>
              <button type="button" class="btn btn-primary flex-1" @click="nextStep">
                <span>Lanjut ke Detail</span>
                <svg class="w-4 h-4 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>

          <div v-else key="step3" class="space-y-6">
            <div>
              <h2 class="text-xl font-bold text-[var(--text-primary)] tracking-tight">Terakhir, detail produksinya</h2>
              <p class="text-sm text-[var(--text-secondary)] mt-1">Perkirakan bobot pengerjaan dan waktu yang dibutuhkan sampai siap tayang.</p>
            </div>

            <div class="ff">
              <label class="fl">Seberapa besar bobot konten ini?</label>
              <div class="grid grid-cols-2 gap-3">
                <button
                  v-for="g in GRADE_OPTIONS"
                  :key="g.value"
                  type="button"
                  class="choice-pill justify-between !px-4"
                  :class="{ active: fTim.grade === g.value }"
                  :aria-pressed="fTim.grade === g.value"
                  @click="fTim.grade = g.value"
                >
                  <span>Grade {{ g.value }}</span>
                  <span class="opacity-80 font-normal text-xs">{{ g.points }}</span>
                </button>
              </div>
            </div>

            <div class="ff">
              <label class="fl">Berapa lama waktu pengerjaannya?</label>
              <IosSelect 
                v-model="fTim.deadlineH" 
                :options="[
                  { value: 24, label: '1 Hari' },
                  { value: 48, label: '2 Hari' },
                  { value: 72, label: '3 Hari' },
                  { value: 168, label: '1 Minggu' }
                ]" 
                label="Pilih Waktu Pengerjaan" 
              />
            </div>

            <div class="ff">
              <label class="fl">Bagian dari program kerja tahunan? (Opsional)</label>
              <IosSelect 
                v-model="fTim.progja_id" 
                :options="[{ value: '', label: 'Bukan program kerja khusus' }, ...progjaTimOptions.map(p => ({ value: p.id, label: `Grade ${p.grade} · ${p.nama || (p as any).name}` }))]" 
                placeholder="Pilih program kerja" 
                label="Daftar Program Kerja" 
                @change="onProgjaChange"
              />
            </div>

            <div class="ff">
              <label for="input-skrip" class="fl">Ada link catatan, skrip, atau referensi? (Opsional)</label>
              <input id="input-skrip" v-model="fTim.skrip" type="url" class="fi" placeholder="Tempel link Google Docs, Reels, atau TikTok referensi...">
            </div>

            <div class="flex gap-3 pt-3">
              <button type="button" class="btn btn-outline !w-auto px-6" @click="currentStep = 2">
                Kembali
              </button>
              <button type="button" class="btn btn-primary flex-1" :disabled="submitting" @click="submit">
                {{ submitting ? 'Menyimpan...' : 'Simpan & Jadwalkan' }}
              </button>
            </div>
          </div>
        </Transition>

      </div>

      <div v-if="!showSuccess && taskType === 'admin' && canCreateAdmin" class="card space-y-6">
        <div>
          <h2 class="text-xl font-bold text-[var(--text-primary)] tracking-tight">Catat Kegiatan Administrasi</h2>
          <p class="text-sm text-[var(--text-secondary)] mt-1">Rekap pekerjaan operasional, surat-menyurat, atau perawatan inventaris.</p>
        </div>

        <div class="ff">
          <label for="input-admin-name" class="fl">Kegiatan apa yang dikerjakan?</label>
          <input id="input-admin-name" v-model="fAdmin.name" type="text" class="fi fi-lg" placeholder="Misal: Menyusun laporan anggaran bulanan...">
          <div v-if="err.name" class="ferr" role="alert">{{ err.name }}</div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="ff">
            <label class="fl">Masuk kategori apa?</label>
            <IosSelect 
              v-model="fAdmin.kat" 
              :options="KAT_ADMIN" 
              label="Pilih Kategori" 
            />
          </div>

          <div class="ff">
            <label class="fl">Bobot pengerjaan</label>
            <IosSelect 
              v-model="fAdmin.grade" 
              :options="[
                { value: 'S', label: 'Grade S (5 Poin)' },
                { value: 'A', label: 'Grade A (3 Poin)' },
                { value: 'B', label: 'Grade B (2 Poin)' },
                { value: 'C', label: 'Grade C (1 Poin)' }
              ]" 
              label="Pilih Grade" 
            />
          </div>
        </div>

        <div class="ff">
          <label class="fl">Bagian dari program kerja tahunan? (Opsional)</label>
          <IosSelect 
            v-model="fAdmin.progja_id" 
            :options="[{ value: '', label: 'Bukan program kerja khusus' }, ...progjaAdminOptions.map(p => ({ value: p.id, label: `Grade ${p.grade} · ${p.nama || (p as any).name}` }))]" 
            placeholder="Pilih program kerja" 
            label="Daftar Program Kerja" 
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="ff">
            <label for="input-admin-link" class="fl">Link bukti atau lampiran (Opsional)</label>
            <input id="input-admin-link" v-model="fAdmin.link" type="url" class="fi" placeholder="https://drive.google.com/...">
          </div>

          <div class="ff">
            <label class="fl">Lama pengerjaan</label>
            <IosSelect 
              v-model="fAdmin.deadlineH" 
              :options="[
                { value: 24, label: '1 Hari' },
                { value: 48, label: '2 Hari' },
                { value: 72, label: '3 Hari' },
                { value: 168, label: '1 Minggu' }
              ]" 
              label="Pilih Lama Pengerjaan" 
            />
          </div>
        </div>

        <div class="pt-2">
          <button class="btn btn-primary" :disabled="submitting" @click="submit">
            {{ submitting ? 'Menyimpan...' : 'Simpan Catatan' }}
          </button>
        </div>
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

const currentStep = ref(1)
const stepLabels  = [
  'Topik',
  'Jadwal',
  'Detail',
]

onMounted(() => {
  progjaStore.fetchProgja(approxCurrentHijriYear())
})

const gradeWeights: Record<string, number> = {
  'S': 1,
  'A': 2,
  'B': 3,
  'C': 4
}

const GRADE_OPTIONS: { value: TaskGrade; points: string }[] = [
  { value: 'S', points: '5 Poin' },
  { value: 'A', points: '3 Poin' },
  { value: 'B', points: '2 Poin' },
  { value: 'C', points: '1 Poin' },
]

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

const KAT_TIM_OPTIONS = [
  { isGroup: true, label: 'Rubrik Dawuh & Keagamaan' },
  { value: 'Dawuh Masyayikh', label: 'Dawuh Masyayikh' },
  { value: 'Edukasi Fiqih', label: 'Edukasi Fiqih' },
  { value: 'Edukasi Tauhid', label: 'Edukasi Tauhid' },
  { value: 'Kajian Kitab Kuning', label: 'Kajian Kitab Kuning' },
  { value: 'Doa & Amalan', label: 'Doa & Amalan' },

  { isGroup: true, label: 'Rubrik Informasi Kemadrasahan' },
  { value: 'Liputan Kegiatan', label: 'Liputan Kegiatan' },
  { value: 'Pengumuman & Akademik', label: 'Pengumuman & Akademik' },
  { value: 'Profil & Prestasi', label: 'Profil & Prestasi' },
  { value: 'Peringatan Hari Besar', label: 'Peringatan Hari Besar' },
  { value: 'Poster & Informasi Grafis', label: 'Poster & Informasi Grafis' },

  { isGroup: true, label: 'Rubrik Tren Sosmed' },
  { value: 'Konten Relate & Tren', label: 'Konten Relate & Tren' },
  { value: 'Film Pendek & Sketsa', label: 'Film Pendek & Sketsa' },
  { value: 'Tanya Santri (Vox Pop)', label: 'Tanya Santri (Vox Pop)' },
  { value: 'Kutipan & Feed', label: 'Kutipan & Feed' },
  { value: 'Behind The Scene', label: 'Behind The Scene' },

  { isGroup: true, label: 'Produksi Khusus' },
  { value: 'Podcast', label: 'Podcast' },
  { value: 'Film Dokumenter', label: 'Film Dokumenter' },
  { value: 'Video Profil', label: 'Video Profil' },
]

const KAT_ADMIN = [
  'Pengelolaan Anggaran',
  'Laporan Keuangan',
  'Surat-Menyurat & Arsip',
  'Perawatan Alat & Inventaris',
  'Koordinasi Bulanan',
  'Koordinasi Narasumber',
  'Layanan Pesan & Komentar',
  'Evaluasi & Analitik Sosmed',
  'Kebersihan Ruang (Office Care)',
]

const PLATFORMS = ['Instagram', 'TikTok', 'YouTube', 'Facebook', 'Multi-Platform']
const DURASI    = ['1 Menit', '3 Menit', '5 Menit', '10 Menit', '30 Menit', '4 Slide', '8 Slide', '12 Slide']

const crewOptions = computed(() => {
  return auth.USERS
    .filter(u => u.access !== 'read-only')
    .map(u => ({
      value: u.name,
      label: u.name
    }))
})

const toLocalDateStr = (d: Date): string => {
  const yyyy = d.getFullYear()
  const mm   = String(d.getMonth() + 1).padStart(2, '0')
  const dd   = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

const defaultAssignee = auth.currentUser?.access !== 'read-only' ? (auth.currentUser?.name ?? '') : ''
const defaultCategory = auth.currentUser?.id === 'vega'
  ? 'Liputan Kegiatan'
  : auth.currentUser?.id === 'syihab'
    ? 'Konten Relate & Tren'
    : 'Dawuh Masyayikh'
const tomorrowDateStr = toLocalDateStr(new Date(Date.now() + 86400000))

const fTim = reactive({
  grade: 'A' as TaskGrade,
  kat: defaultCategory,
  name: '',
  platform: PLATFORMS[0],
  durasi: DURASI[0],
  deadlineH: 72,
  skrip: '',
  progja_id: '',
  assignee: defaultAssignee,
  publish_date: tomorrowDateStr,
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

const quickDateSlots = computed(() => {
  const labels = ['Hari Ini', 'Besok', 'Lusa']
  return [0, 1, 2].map((offset, idx) => {
    const d = new Date(Date.now() + offset * 86400000)
    return {
      title: labels[idx],
      dateStr: toLocalDateStr(d),
    }
  })
})

const onProgjaChange = () => {
  if (!fTim.progja_id) return
  const selected = progjaStore.items.find(p => p.id === fTim.progja_id)
  if (selected) {
    fTim.grade = selected.grade
    fTim.kat   = selected.kategori
  }
}

const validateStep1 = (): boolean => {
  err.name = ''
  if (!fTim.name.trim()) {
    err.name = 'Tulis dulu judul atau topik kontennya ya'
    return false
  }
  return true
}

const nextStep = () => {
  if (currentStep.value === 1) {
    if (!validateStep1()) return
    currentStep.value = 2
  } else if (currentStep.value === 2) {
    currentStep.value = 3
  }
}

const goToStep = (step: number) => {
  if (step === 1) {
    currentStep.value = 1
  } else if (step > 1 && validateStep1()) {
    currentStep.value = step
  }
}

const validate = (): boolean => {
  err.name  = ''
  err.progja = ''
  const name = taskType.value === 'tim' ? fTim.name : fAdmin.name
  if (!name.trim()) {
    err.name = 'Bagian ini wajib diisi dulu ya'
    if (taskType.value === 'tim') currentStep.value = 1
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
  toast.add({ title: 'Berhasil disimpan', color: 'green' })
}

const resetForm = () => {
  showSuccess.value = false
  currentStep.value = 1
  fTim.name      = ''
  fTim.skrip     = ''
  fTim.progja_id = ''
  fTim.assignee  = defaultAssignee
  fTim.kat       = defaultCategory
  fTim.publish_date = tomorrowDateStr
  fAdmin.name      = ''
  fAdmin.link      = ''
  fAdmin.progja_id = ''
}
</script>

<style scoped>
.segmented-control {
  display: flex;
  background: var(--bg-elevated);
  padding: 4px;
  border-radius: 12px;
  border: 1px solid var(--border);
  gap: 4px;
}
.segmented-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 8px 16px;
  border-radius: 9px;
  border: 1px solid transparent;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  background: transparent;
  transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
  -webkit-tap-highlight-color: transparent;
}
.segmented-btn:hover {
  color: var(--text-primary);
}
.segmented-btn:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
.segmented-btn.active {
  background: var(--bg-card);
  color: var(--text-primary);
  border-color: var(--border-md);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 24px;
  box-shadow: var(--card-shadow);
}
@media (min-width: 640px) {
  .card { padding: 32px; }
}

.stepper-nav {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  background: var(--bg-elevated);
  padding: 4px;
  border-radius: 12px;
  border: 1px solid var(--border);
  gap: 4px;
}
.stepper-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  padding: 8px 12px;
  border-radius: 9px;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
  -webkit-tap-highlight-color: transparent;
}
.stepper-item:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
.stepper-item.active {
  background: var(--bg-card);
  border-color: var(--border-md);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}
.stepper-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  background: var(--border-md);
  color: var(--text-secondary);
  transition: all 0.18s;
  flex-shrink: 0;
}
.stepper-item.active .stepper-badge {
  background: var(--accent);
  color: #fff;
}
.stepper-item.completed .stepper-badge {
  background: var(--green);
  color: #fff;
}
.stepper-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-muted);
  white-space: nowrap;
}
.stepper-item.active .stepper-label {
  color: var(--text-primary);
}
.stepper-item.completed .stepper-label {
  color: var(--text-secondary);
}

.choice-pill {
  background: var(--bg-elevated);
  border: 1px solid var(--border-md);
  border-radius: 12px;
  min-height: 48px;
  padding: 12px 16px;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.16s cubic-bezier(0.16, 1, 0.3, 1);
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-tap-highlight-color: transparent;
}
.choice-pill:hover {
  color: var(--text-primary);
  border-color: var(--accent);
}
.choice-pill:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
.choice-pill.active {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.ff { margin-bottom: 4px; }
.fl {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 8px;
  display: block;
}
.fi {
  width: 100%;
  min-height: 48px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-md);
  border-radius: 12px;
  padding: 12px 16px;
  color: var(--text-primary);
  font-size: 0.9375rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.fi-lg {
  min-height: 52px;
  padding: 14px 16px;
  font-size: 1rem;
}
.fi:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}
.ferr {
  font-size: 0.8125rem;
  color: var(--red);
  margin-top: 6px;
  font-weight: 500;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 48px;
  padding: 12px 20px;
  border-radius: 12px;
  border: none;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s, transform 0.12s, opacity 0.15s, box-shadow 0.15s;
  -webkit-tap-highlight-color: transparent;
}
.btn:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.btn:active:not(:disabled) {
  transform: scale(0.985);
}
.btn-primary {
  background: var(--accent);
  color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
.btn-primary:hover:not(:disabled) {
  background: var(--accent-hover);
}
.btn-outline {
  background: var(--bg-elevated);
  border: 1px solid var(--border-md);
  color: var(--text-primary);
}
.btn-outline:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.success-card {
  text-align: center;
  padding: 36px 24px;
}
.success-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 6px;
}
.success-sub {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  margin-bottom: 24px;
  max-width: 380px;
  margin-left: auto;
  margin-right: auto;
}

.no-access {
  text-align: center;
  padding: 36px 16px;
}
.no-access-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 14px 0 6px;
}
.no-access-sub {
  font-size: 0.9375rem;
  color: var(--text-muted);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.18s cubic-bezier(0.16, 1, 0.3, 1), transform 0.18s cubic-bezier(0.16, 1, 0.3, 1);
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>

<template>
  <div v-if="task" class="pb-8">

    <div class="flex items-center gap-2.5 px-4 pt-4 mb-3.5">
      <button
        class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)] outline-none"
        @click="$router.back()">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
      </button>
      <div class="min-w-0 flex-1">
        <p class="text-base font-bold text-[var(--text-primary)] truncate">{{ task.name }}</p>
        <p class="text-xs text-[var(--text-muted)]">{{ task.type === 'tim' ? 'Tugas Tim' : 'Tugas Administrasi' }}</p>
      </div>
    </div>

    <div class="mx-4 mb-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] p-4">
      <div class="flex flex-wrap gap-1.5 mb-2.5">
        <UiGradeBadge :grade="task.grade" />
        <UiStatusBadge :status="task.status" />
        <span v-if="task.assignee" class="text-xs font-semibold px-2 py-0.5 rounded-md bg-purple-400/10 text-purple-500">🧑‍💻 {{ task.assignee }}</span>
        <span v-if="task.durasi" class="text-xs font-semibold px-2 py-0.5 rounded-md bg-teal-400/10 text-teal-500">{{ task.durasi }}</span>
        <span v-if="task.platform" class="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-400/10 text-blue-500">{{ task.platform }}</span>
      </div>
      <p class="text-lg font-bold text-[var(--text-primary)] mb-1">{{ task.name }}</p>
      <p class="text-xs text-[var(--text-muted)] mb-3">{{ task.kat }}</p>
      
      <div class="flex items-center justify-between mb-2" v-if="task.publish_date">
        <span class="text-xs text-[var(--text-muted)]">Target Tayang</span>
        <span class="text-xs font-semibold text-blue-400">{{ new Date(task.publish_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) }}</span>
      </div>

      <div v-if="task.status !== 'selesai'" class="flex items-center justify-between">
        <span class="text-xs text-[var(--text-muted)]">Deadline</span>
        <UiCountdownBadge :deadline="task.deadline" />
      </div>
    </div>

    <div class="mx-4 mb-4 p-2.5 rounded-xl bg-[var(--bg-elevated)] text-xs text-[var(--text-muted)] leading-relaxed break-all">
      <span class="text-blue-400 font-semibold">📁 Drive: </span>{{ drivePath }}
    </div>

    <!-- TAHAP 1: PLANNING -->
    <template v-if="task.status === 'planning'">
      <div class="step-bar mx-4 mb-2">
        <div class="step-dot dot-active">1</div>
        <p class="text-sm font-bold text-blue-400">Planning</p>
      </div>
      <div class="card">
        <p class="slabel">Form Planning</p>
        <p v-if="!auth.hasTabAccess('planner')" class="hint">Akses khusus peran Planner.</p>
        <template v-else>
          <div v-if="task.qc_comment" class="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
             <p class="text-xs font-bold text-red-400 mb-1">Catatan Revisi:</p>
             <p class="text-xs text-[var(--text-primary)]">{{ task.qc_comment }}</p>
          </div>

          <div class="ff">
            <label class="fl">Konsep / Brief *</label>
            <textarea v-model="fP.konsep" class="fi" rows="4" placeholder="Tuliskan konsep, angle cerita..."/>
          </div>
          <div class="ff">
            <label class="fl">Link Skrip (Google Docs)</label>
            <input v-model="fP.skrip" type="url" class="fi" placeholder="https://docs.google.com/..."/>
          </div>
          <div class="ff">
            <label class="fl">Target Deadline Produksi</label>
            <select v-model="fP.deadlineH" class="fi">
              <option :value="24">1 Hari</option><option :value="48">2 Hari</option><option :value="72">3 Hari</option><option :value="168">1 Minggu</option>
            </select>
          </div>
          <p v-if="formErr" class="text-xs text-red-400 mb-3">{{ formErr }}</p>
          <button class="btn-primary" :disabled="saving" @click="submitPlanning">
            {{ saving ? 'Menyimpan...' : 'PLANNING SELESAI → PRODUKSI' }}
          </button>
        </template>
      </div>
    </template>

    <!-- TAHAP 2: PRODUKSI -->
    <template v-else-if="task.status === 'produksi'">
      <TaskStepsDone :steps="STEPS" :done="1" />
      <div class="step-bar mx-4 mb-2">
        <div class="step-dot dot-active">2</div>
        <p class="text-sm font-bold text-blue-400">Produksi & Editing</p>
      </div>
      <div class="card">
        <p class="slabel">Proses Pembuatan Konten</p>
        
        <div class="prev-box mb-4">
          <p class="text-xs font-semibold text-[var(--text-secondary)] mb-1">Konsep / Brief:</p>
          <p class="text-xs text-[var(--text-secondary)] leading-relaxed">{{ task.konsep || '(belum ada konsep)' }}</p>
          <a v-if="task.skrip" :href="task.skrip" target="_blank" class="text-xs text-blue-400 mt-2 inline-block">Buka Skrip di Drive →</a>
        </div>

        <p v-if="!auth.hasTabAccess('production')" class="hint">Akses khusus tim Produksi.</p>
        <template v-else>
          <div v-if="task.qc_comment" class="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
             <p class="text-xs font-bold text-red-400 mb-1">Catatan Revisi QC:</p>
             <p class="text-xs text-[var(--text-primary)]">{{ task.qc_comment }}</p>
          </div>

          <TaskFileChip v-if="task.file" :name="task.file" :drive-id="task.file_drive_id" />
          
          <div class="ff mt-3">
            <label class="fl">Catatan / Link Final (opsional)</label>
            <textarea v-model="fProd.note" class="fi" rows="2" placeholder="Tulis keterangan atau link tambahan..."/>
          </div>

          <TaskUploadZone :for-id="`fe-${task.id}`" label="Upload Hasil Akhir" sub="Video / Gambar yang siap review" />
          <input :id="`fe-${task.id}`" type="file" class="hidden" accept="video/*,image/*,.pdf,.zip" @change="handleUpload($event)"/>
          <TaskUploadProgress v-if="uploading" :pct="uploadPct" :path="drivePath" />
          
          <div v-if="!uploading" class="mt-4">
            <button class="btn-primary w-full" :disabled="saving || (!task.file && !fProd.note)" @click="submitProduksi">
              KONTEN SELESAI → KIRIM KE QC
            </button>
          </div>
        </template>
      </div>
    </template>

    <!-- TAHAP 3: QC (Quality Control) -->
    <template v-else-if="task.status === 'qc'">
      <TaskStepsDone :steps="STEPS" :done="2" />
      <div class="step-bar mx-4 mb-2">
        <div class="step-dot dot-active">3</div>
        <p class="text-sm font-bold text-blue-400">Quality Control</p>
      </div>
      <div class="card">
        <p class="slabel">Review Konten Final</p>
        
        <div class="prev-box mb-3">
          <p class="text-xs text-[var(--text-muted)] mb-1">File yang di-submit:</p>
          <TaskFileChip v-if="task.file" :name="task.file" :drive-id="task.file_drive_id" :inline="true" />
          <p v-if="task.produksi_note" class="text-xs text-blue-400 mt-2">{{ task.produksi_note }}</p>
        </div>

        <p v-if="!auth.hasTabAccess('qc')" class="hint">Akses khusus tim Quality Control.</p>
        <div v-else>
          <div class="ff">
            <label class="fl">Komentar QC</label>
            <textarea v-model="fQc.comment" class="fi" rows="3" placeholder="Catatan jika ada revisi..."/>
          </div>
          <div class="flex gap-2.5">
            <button class="btn-danger flex-1" :disabled="saving" @click="submitQc('revisi')">REVISI</button>
            <button class="btn-success flex-1" :disabled="saving" @click="submitQc('setuju')">SETUJU → SELESAI</button>
          </div>
        </div>
      </div>
    </template>

    <!-- TAHAP 4: SELESAI -->
    <template v-else-if="task.status === 'selesai'">
      <div class="card text-center py-8 mx-4">
        <svg class="mx-auto mb-3 w-14 h-14 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3"/></svg>
        <p class="text-lg font-bold text-green-400 mb-1">Tugas Selesai!</p>
        <p class="text-xs text-[var(--text-muted)]">File / Bukti: {{ task.file ?? '—' }}</p>
        <p v-if="task.publish_date" class="text-xs text-blue-400 mt-2 font-bold">Akan tayang: {{ new Date(task.publish_date).toLocaleDateString('id-ID') }}</p>
      </div>
    </template>

  </div>

  <div v-else class="flex flex-col items-center justify-center h-64 text-[var(--text-muted)] text-sm">
    <p class="text-4xl mb-3">😕</p>
    <p>Tugas tidak ditemukan</p>
    <NuxtLink to="/" class="mt-4 px-5 py-2.5 rounded-xl border border-[var(--border-md)] text-[var(--text-secondary)]">Kembali ke Beranda</NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { useTasksStore }   from '~/stores/tasks'
import { useAuthStore }    from '~/stores/auth'
import { useDrive }        from '~/composables/useDrive'
import { useWhatsApp }     from '~/composables/useWhatsApp'
import type { TaskGrade, TaskStatus } from '~/types'

import UiGradeBadge      from '~/components/ui/GradeBadge.vue'
import UiStatusBadge     from '~/components/ui/StatusBadge.vue'
import UiCountdownBadge  from '~/components/ui/CountdownBadge.vue'
import TaskStepsDone     from '~/components/task/StepsDone.vue'
import TaskFileChip      from '~/components/task/FileChip.vue'
import TaskUploadZone    from '~/components/task/UploadZone.vue'
import TaskUploadProgress from '~/components/task/UploadProgress.vue'

definePageMeta({ middleware: 'auth' })

const route  = useRoute()
const tasks  = useTasksStore()
const auth   = useAuthStore()
const drive  = useDrive()
const wa     = useWhatsApp()
const toast  = useToast()

const id   = computed(() => route.params.id as string)
const task = computed(() => tasks.tasks.find(t => t.id === id.value) ?? null)
onMounted(() => { if (!tasks.tasks.length) tasks.fetchTasks() })

const drivePath  = computed(() => task.value ? drive.getDrivePathString(task.value) : '')
const actorName  = computed(() => auth.currentUser?.name ?? 'Tim UPM')

const STEPS = [
  { key: 'planning',   label: 'Planning'   },
  { key: 'produksi',   label: 'Produksi'   },
  { key: 'qc',         label: 'QC'         },
  { key: 'selesai',    label: 'Selesai'    },
]

const fP    = reactive({ konsep: '', grade: 'A' as TaskGrade, skrip: '', deadlineH: 72 })
const fQc   = reactive({ comment: '' })
const fProd = reactive({ note: '' })

watch(task, t => {
  if (!t) return
  fP.konsep = t.konsep ?? ''
  fP.grade  = t.grade
  fP.skrip  = t.skrip  ?? ''
}, { immediate: true })

const saving    = ref(false)
const formErr   = ref('')
const uploading = ref(false)
const uploadPct = ref(0)

const submitPlanning = async () => {
  formErr.value = ''
  if (!fP.konsep.trim()) { formErr.value = 'Konsep wajib diisi'; return }
  if (!task.value) return
  saving.value = true
  await tasks.updateStatus(task.value.id, 'produksi', {
    grade:    fP.grade,
    konsep:   fP.konsep.trim(),
    skrip:    fP.skrip,
    deadline: new Date(Date.now() + fP.deadlineH * 3_600_000).toISOString(),
    qc_comment: null // Hapus history revisi jika ada
  })
  saving.value = false
  toast.add({ title: 'Planning selesai → Produksi ✓', color: 'green' })
}

const submitProduksi = async () => {
  if (!task.value) return
  saving.value = true
  await tasks.updateStatus(task.value.id, 'qc', { produksi_note: fProd.note })
  saving.value = false
  toast.add({ title: 'Terkirim ke QC ✓', color: 'green' })
}

const submitQc = async (d: 'setuju' | 'revisi') => {
  if (!task.value) return
  saving.value = true
  if (d === 'setuju') {
    await tasks.updateStatus(task.value.id, 'selesai', { qc_comment: fQc.comment })
    toast.add({ title: `Disetujui → Selesai ✓`, color: 'green' })
  } else {
    await tasks.updateStatus(task.value.id, 'produksi', { qc_comment: fQc.comment })
    toast.add({ title: 'Revisi dikirim ke Produksi', color: 'orange' })
  }
  fQc.comment = ''
  saving.value = false
}

const handleUpload = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const file  = input.files?.[0]
  if (!file || !task.value) return
  uploading.value = true
  uploadPct.value = 0
  try {
    let result
    if (drive.driveConnected.value) {
      result = await drive.uploadFile(file, task.value, p => { uploadPct.value = p })
    } else {
      await new Promise<void>(res => {
        let p = 0
        const iv = setInterval(() => {
          p += Math.random() * 18
          uploadPct.value = Math.min(Math.round(p), 99)
          if (p >= 100) { clearInterval(iv); uploadPct.value = 100; setTimeout(res, 300) }
        }, 120)
      })
      result = { fileId: '', fileName: file.name, webViewLink: '', drivePath: '' }
    }
    await tasks.updateStatus(task.value.id, task.value.status, {
      file:          result.fileName,
      file_drive_id: result.fileId || undefined,
    })
    toast.add({ title: `✅ "${file.name}" berhasil diupload`, color: 'green' })
  } catch (err: any) {
    toast.add({ title: 'Upload gagal: ' + err.message, color: 'red' })
  } finally {
    uploading.value = false
    uploadPct.value = 0
    input.value     = ''
  }
}
</script>

<style scoped>
.card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 16px; }
.slabel { font-size: 0.75rem; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 14px; display: block; }
.ff { margin-bottom: 14px; }
.fl { font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; display: block; }
.fi { width: 100%; background: var(--bg-elevated); border: 1.5px solid var(--border-md); border-radius: 10px; padding: 12px 14px; color: var(--text-primary); font-size: 0.875rem; font-family: inherit; outline: none; transition: border-color .2s; resize: vertical; }
.fi:focus { border-color: var(--blue); }
.btn-primary, .btn-success, .btn-danger { display: flex; align-items: center; justify-content: center; width: 100%; padding: 13px; border-radius: 12px; border: none; font-size: 0.875rem; font-weight: 700; cursor: pointer; font-family: inherit; transition: opacity .15s; }
.btn-outline { display: flex; align-items: center; justify-content: center; width: 100%; padding: 12px; border-radius: 12px; border: 1.5px solid var(--border-md); font-size: 0.875rem; font-weight: 700; color: var(--text-secondary); background: transparent; cursor: pointer; font-family: inherit; text-decoration: none; transition: background .15s, opacity .15s; }
.btn-outline:active { opacity: 0.7; background: var(--bg-elevated); }
.btn-primary { background: var(--blue); color: #fff; }
.btn-success { background: var(--green); color: #fff; }
.btn-danger { background: var(--red); color: #fff; }
.btn-primary:disabled, .btn-success:disabled, .btn-danger:disabled { opacity: .5; cursor: not-allowed; }
.step-bar { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
.step-dot { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; flex-shrink: 0; }
.dot-active { background: var(--blue); color: #fff; box-shadow: 0 0 0 3px rgba(59,130,246,.2); }
.dot-done { background: var(--green); color: #fff; }
.dot-pending { background: var(--bg-elevated); color: var(--text-muted); border: 1.5px solid var(--border-md); }
.prev-box { background: var(--bg-elevated); border-radius: 10px; padding: 12px; }
.hint { text-align: center; padding: 16px; font-size: 0.875rem; color: var(--text-muted); font-style: italic; }
</style>
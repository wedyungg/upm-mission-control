<template>
  <div v-if="task" class="px-4 md:px-8 py-4 md:py-6 max-w-5xl mx-auto">

    <!-- Back Header -->
    <div class="flex items-center gap-3 mb-5">
      <button
        class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--accent)] text-[var(--text-primary)] outline-none transition-colors shadow-sm"
        @click="$router.back()">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
      </button>
      <div class="min-w-0 flex-1">
        <p class="text-base md:text-lg font-bold text-[var(--text-primary)] truncate tracking-tight">{{ task.name }}</p>
        <p class="text-xs text-[var(--text-muted)]">{{ task.type === 'tim' ? 'Tugas Tim / Konten' : 'Tugas Administrasi' }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

      <!-- Left Column (5 cols on desktop): Info Misi + Drive Path + Steps Done -->
      <div class="lg:col-span-5 space-y-4">
        <div class="rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] p-5 shadow-sm">
          <div class="flex flex-wrap gap-1.5 mb-3">
            <UiGradeBadge :grade="task.grade" />
            <UiStatusBadge :status="task.status" />
            <span v-if="task.assignee" class="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)]">
              <svg class="w-3 h-3 text-[var(--accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              {{ task.assignee }}
            </span>
            <span v-if="task.durasi" class="text-xs font-semibold px-2 py-0.5 rounded-md bg-teal-500/12 text-[var(--green)]">{{ task.durasi }}</span>
            <span v-if="task.platform" class="text-xs font-semibold px-2 py-0.5 rounded-md bg-[var(--accent-soft)] text-[var(--accent)]">{{ task.platform }}</span>
          </div>
          <p class="text-lg font-bold text-[var(--text-primary)] mb-1 leading-snug">{{ task.name }}</p>
          <p class="text-xs text-[var(--text-muted)] mb-4">{{ task.kat }}</p>
          
          <div class="space-y-2.5 pt-3 border-t border-[var(--border)]">
            <div v-if="task.publish_date" class="flex items-center justify-between">
              <span class="text-xs text-[var(--text-muted)]">Target Tayang</span>
              <span class="text-xs font-mono font-semibold text-[var(--accent)]">{{ new Date(task.publish_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) }}</span>
            </div>

            <div v-if="task.status !== 'selesai'" class="flex items-center justify-between">
              <span class="text-xs text-[var(--text-muted)]">Deadline Tahap Ini</span>
              <UiCountdownBadge :deadline="task.deadline" />
            </div>
          </div>
        </div>

        <div class="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] text-xs text-[var(--text-muted)] leading-relaxed break-all shadow-sm flex items-start gap-2.5">
          <svg class="w-4 h-4 text-[var(--accent)] flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          <div>
            <span class="text-[var(--accent)] font-semibold block mb-0.5">Lokasi Folder Drive</span>
            <span class="font-mono text-xs">{{ drivePath }}</span>
          </div>
        </div>

        <TaskStepsDone v-if="task.status === 'produksi'" :steps="STEPS" :done="1" />
        <TaskStepsDone v-else-if="task.status === 'qc'" :steps="STEPS" :done="2" />
      </div>

      <!-- Right Column (7 cols on desktop): Active Workflow Stage Form -->
      <div class="lg:col-span-7">

        <!-- TAHAP 1: PLANNING -->
        <template v-if="task.status === 'planning'">
          <div class="step-bar mb-3">
            <div class="step-dot dot-active">1</div>
            <p class="text-sm font-bold text-[var(--accent)]">Tahap 1 · Rencana</p>
          </div>
          <div class="card">
            <p class="slabel">Detail Rencana</p>
            <p v-if="!auth.hasTabAccess('planner')" class="hint">Mode pantau (Read-Only).</p>
            <template v-else>
              <div v-if="task.qc_comment" class="mb-4 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p class="text-xs font-bold text-[var(--red)] mb-1">Catatan Revisi:</p>
                <p class="text-xs text-[var(--text-primary)]">{{ task.qc_comment }}</p>
              </div>

              <div class="ff">
                <label class="fl">Konsep / Poin Pembahasan *</label>
                <textarea v-model="fP.konsep" class="fi" rows="4" placeholder="Tuliskan poin konsep konten, kutipan, atau ide pembahasan..."/>
              </div>
              <div class="ff">
                <label class="fl">Tautan Catatan / Skrip (Opsional)</label>
                <input v-model="fP.skrip" type="url" class="fi" placeholder="https://docs.google.com/..."/>
              </div>
              <div class="ff">
                <label class="fl">Target Selesai Produksi</label>
                <select v-model="fP.deadlineH" class="fi">
                  <option :value="24">1 Hari</option><option :value="48">2 Hari</option><option :value="72">3 Hari</option><option :value="168">1 Minggu</option>
                </select>
              </div>
              <p v-if="formErr" class="text-xs text-[var(--red)] mb-3">{{ formErr }}</p>
              <button class="btn-primary" :disabled="saving" @click="submitPlanning">
                {{ saving ? 'Menyimpan...' : 'Simpan & Lanjut Produksi' }}
              </button>
            </template>
          </div>
        </template>

        <!-- TAHAP 2: PRODUKSI -->
        <template v-else-if="task.status === 'produksi'">
          <div class="step-bar mb-3">
            <div class="step-dot dot-active">2</div>
            <p class="text-sm font-bold text-[var(--accent)]">Tahap 2 · Produksi & Edit</p>
          </div>
          <div class="card">
            <p class="slabel">Produksi & Penyuntingan</p>
            
            <div class="prev-box mb-4">
              <p class="text-xs font-semibold text-[var(--text-secondary)] mb-1">Konsep / Poin Pembahasan:</p>
              <p class="text-xs text-[var(--text-secondary)] leading-relaxed">{{ task.konsep || '(belum ada konsep)' }}</p>
              <a v-if="task.skrip" :href="task.skrip" target="_blank" class="text-xs font-semibold text-[var(--accent)] hover:underline mt-2 inline-block">Buka Dokumen Skrip</a>
            </div>

            <p v-if="!auth.hasTabAccess('production')" class="hint">Mode pantau (Read-Only).</p>
            <template v-else>
              <div v-if="task.qc_comment" class="mb-4 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p class="text-xs font-bold text-[var(--red)] mb-1">Catatan Revisi QC:</p>
                <p class="text-xs text-[var(--text-primary)]">{{ task.qc_comment }}</p>
              </div>

              <TaskFileChip v-if="task.file" :name="task.file" :drive-id="task.file_drive_id" />
              
              <div class="ff mt-3">
                <label class="fl">Catatan Hasil / Tautan Konten (opsional)</label>
                <textarea v-model="fProd.note" class="fi" rows="2" placeholder="Tuliskan keterangan file atau link tambahan..."/>
              </div>

              <TaskUploadZone :for-id="`fe-${task.id}`" label="Unggah File Final" sub="Video atau gambar siap tayang (tersimpan di Google Drive)" />
              <input :id="`fe-${task.id}`" type="file" class="hidden" accept="video/*,image/*,.pdf,.zip" @change="handleUpload($event)"/>
              <TaskUploadProgress v-if="uploading" :pct="uploadPct" :path="drivePath" />
              
              <div v-if="!uploading" class="mt-4">
                <button class="btn-primary w-full" :disabled="saving || (!task.file && !fProd.note)" @click="submitProduksi">
                  Selesaikan Produksi & Kirim ke Review
                </button>
              </div>
            </template>
          </div>
        </template>

        <!-- TAHAP 3: QC (Quality Control & Posting) -->
        <template v-else-if="task.status === 'qc'">
          <div class="step-bar mb-3">
            <div class="step-dot dot-active">3</div>
            <p class="text-sm font-bold text-[var(--accent)]">Tahap 3 · Review & Publikasi</p>
          </div>
          <div class="card">
            <p class="slabel">Pemeriksaan Kualitas & Konfirmasi Tayang</p>
            
            <div class="prev-box mb-4">
              <p class="text-xs text-[var(--text-muted)] mb-1.5">File hasil produksi & edit:</p>
              <TaskFileChip v-if="task.file" :name="task.file" :drive-id="task.file_drive_id" :inline="true" />
              <p v-if="task.produksi_note" class="text-xs text-[var(--accent)] mt-2">{{ task.produksi_note }}</p>
            </div>

            <p v-if="!auth.hasTabAccess('qc')" class="hint">Akses khusus Review / PIC.</p>
            <div v-else>
              <div class="ff">
                <label class="fl">Catatan Review / Tautan Postingan (Opsional)</label>
                <textarea v-model="fQc.comment" class="fi" rows="3" placeholder="Catatan revisi atau link postingan di akun Matholek..."/>
              </div>
              <div class="flex gap-3">
                <button class="btn-danger flex-1" :disabled="saving" @click="submitQc('revisi')">Minta Revisi</button>
                <button class="btn-success flex-1" :disabled="saving" @click="submitQc('setuju')">Setujui & Tandai Tayang</button>
              </div>
            </div>
          </div>
        </template>

        <!-- TAHAP 4: SELESAI -->
        <template v-else-if="task.status === 'selesai'">
          <div class="card text-center py-10">
            <div class="w-16 h-16 rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3"/></svg>
            </div>
            <p class="text-lg font-bold text-[var(--text-primary)] mb-1">Konten Telah Tayang</p>
            <p class="text-xs text-[var(--text-muted)]">File / Bukti: {{ task.file ?? '—' }}</p>
            <p v-if="task.publish_date" class="text-xs text-[var(--accent)] mt-2.5 font-semibold">Jadwal tayang: {{ new Date(task.publish_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) }}</p>
          </div>
        </template>

      </div>

    </div>

  </div>

  <div v-else class="flex flex-col items-center justify-center h-72 text-[var(--text-muted)] text-sm px-4">
    <div class="w-12 h-12 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center mb-3">
      <svg class="w-6 h-6 text-[var(--text-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    </div>
    <p class="font-medium text-[var(--text-secondary)]">Tugas tidak ditemukan</p>
    <NuxtLink to="/" class="mt-4 px-5 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-md)] hover:border-[var(--accent)] text-xs font-semibold text-[var(--text-primary)] transition-colors">Kembali ke Beranda</NuxtLink>
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
    qc_comment: null
  })
  saving.value = false
  toast.add({ title: 'Planning selesai, dilanjutkan ke Produksi', color: 'green' })
}

const submitProduksi = async () => {
  if (!task.value) return
  saving.value = true
  await tasks.updateStatus(task.value.id, 'qc', { produksi_note: fProd.note })
  saving.value = false
  toast.add({ title: 'Konten berhasil dikirim ke QC', color: 'green' })
}

const submitQc = async (d: 'setuju' | 'revisi') => {
  if (!task.value) return
  saving.value = true
  if (d === 'setuju') {
    await tasks.updateStatus(task.value.id, 'selesai', { qc_comment: fQc.comment })
    toast.add({ title: `Tugas disetujui dan selesai`, color: 'green' })
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
    toast.add({ title: `"${file.name}" berhasil diupload ✓`, color: 'green' })
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
.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 20px;
  box-shadow: var(--card-shadow);
}
.slabel { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 14px; display: block; }
.ff { margin-bottom: 14px; }
.fl { font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; display: block; }
.fi { width: 100%; background: var(--bg-elevated); border: 1px solid var(--border-md); border-radius: 10px; padding: 11px 14px; color: var(--text-primary); font-size: 0.875rem; font-family: inherit; outline: none; transition: border-color .2s; resize: vertical; }
.fi:focus { border-color: var(--accent); }
.btn-primary, .btn-success, .btn-danger { display: flex; align-items: center; justify-content: center; width: 100%; padding: 13px 16px; border-radius: 12px; border: none; font-size: 0.85rem; font-weight: 600; cursor: pointer; font-family: inherit; transition: background .15s, opacity .15s, transform .12s; }
.btn-primary { background: var(--accent); color: #fff; }
.btn-primary:hover:not(:disabled) { background: var(--accent-hover); }
.btn-success { background: var(--green); color: #fff; }
.btn-danger { background: var(--red); color: #fff; }
.btn-primary:disabled, .btn-success:disabled, .btn-danger:disabled { opacity: .5; cursor: not-allowed; }
.step-bar { display: flex; align-items: center; gap: 10px; }
.step-dot { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; font-family: var(--font-mono); flex-shrink: 0; }
.dot-active { background: var(--accent); color: #fff; box-shadow: 0 0 0 4px var(--accent-soft); }
.dot-done { background: var(--green); color: #fff; }
.dot-pending { background: var(--bg-elevated); color: var(--text-muted); border: 1.5px solid var(--border-md); }
.prev-box { background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 12px; padding: 14px; }
.hint { text-align: center; padding: 16px; font-size: 0.85rem; color: var(--text-muted); font-style: italic; }
</style>

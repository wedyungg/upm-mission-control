// composables/useWhatsApp.ts
import type { Task, TaskStatus } from '~/types'
import { USERS } from '~/stores/auth' 

export type WaEvent =
  | 'task_created'
  | 'planning_done'
  | 'upload_produksi'
  | 'upload_editing'
  | 'qc_approved'
  | 'qc_revision'
  | 'distribusi_ready'
  | 'task_selesai'

interface WaPayload {
  task: Task
  event: WaEvent
  actor?: string
  extra?: string
}

// ── 1. Logika Aksi Spesifik (Sesuai Tipe Tugas) ─────────────────
const getActionLabel = (event: WaEvent, task: Task): string => {
  if (event === 'task_created') {
    // Bedakan pesan antara tugas Admin dan Tim
    return task.type === 'admin' 
      ? 'telah menugaskan pekerjaan administrasi' 
      : 'telah membuat jadwal baru'
  }
  if (event === 'planning_done') return 'telah menyelesaikan naskah'
  if (event === 'qc_approved') {
    return task.status === 'produksi' ? 'telah menyetujui konsep' : 'telah menyetujui konten final'
  }
  if (event === 'upload_produksi') return 'telah menyelesaikan tahap produksi'
  if (event === 'upload_editing') return 'telah menyelesaikan tahap editing'
  if (event === 'distribusi_ready') return 'telah mengunggah konten'
  if (event === 'qc_revision') return 'telah meminta perbaikan (Revisi)'
  if (event === 'task_selesai') return 'telah menandai tugas selesai'
  
  return 'telah *memperbarui status*'
}

// ── 2. Logika Progres Selanjutnya ──────────
const getDetailedNextStep = (event: WaEvent, task: Task): string => {
  switch (event) {
    case 'task_created':    
      // Tugas Admin tidak butuh skrip, langsung ke penyelesaian
      return task.type === 'admin' ? 'Penyelesaian & Bukti Lampiran' : 'Pembuatan Skrip & Konsep'
    case 'planning_done':   return 'Review Konsep (QC 1)'
    case 'qc_approved':     
      return task.status === 'produksi' ? 'Proses Produksi' : 'Persiapan Publikasi'
    case 'upload_produksi': return 'Proses Editing Video/Konten'
    case 'upload_editing':  return 'Review Hasil Final (QC 2)'
    case 'qc_revision':     
      return task.status === 'planning' ? 'Perbaikan Skrip' : 'Perbaikan Editing'
    case 'distribusi_ready':return 'Arsip Dokumentasi'
    case 'task_selesai':    return 'Selesai 🏁'
    default: return 'Cek di Aplikasi'
  }
}

// ── 3. Logika Tagging (Siapa yang harus lanjut) ────────────────
const getTargetRole = (event: WaEvent, task: Task): string => {
  if (event === 'qc_revision') return task.status === 'planning' ? 'planner' : 'editor_crew'
  
  switch (event) {
    case 'task_created':    
      return task.type === 'admin' ? 'admin_partnership' : 'planner'
    case 'planning_done':   return 'ketua'
    case 'qc_approved':     
      return task.status === 'produksi' ? 'production' : 'admin_partnership'
    case 'upload_produksi': return 'editor'
    case 'upload_editing':  return 'ketua' // Balik ke QC 2
    case 'distribusi_ready':return 'admin_partnership'
    default: return ''
  }
}

const formatDeadline = (dateString?: string) => {
  if (!dateString) return 'Belum diatur'
  return new Date(dateString).toLocaleString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta'
  }) + ' WIB'
}

export const useWhatsApp = () => {
  const supabase = useSupabaseClient()

  const buildMessage = ({ task, event, actor, extra }: WaPayload): string => {
    // Panggil fungsi dengan parameter task
    const actionLabel = getActionLabel(event, task)
    const nextStep = getDetailedNextStep(event, task)
    const targetRole = getTargetRole(event, task)
    
    const targetUsers = USERS.filter(u => u.role === targetRole)
    const targetMention = targetUsers.length > 0 
      ? targetUsers.map(u => `*${u.name}*`).join(' & ') 
      : '*(Petugas)*'

    let msg = `*[UPM MISSION CONTROL]*\n\n`
    msg += `*${actor || 'Anggota'}* ${actionLabel} untuk proyek *"${task.name}"*.\n`
    msg += `\n➡ Progres selanjutnya: *${nextStep}*\n\n`
    
    msg += `*── Detail Proyek ──*\n`
    msg += `📌 *Tugas:* ${task.name}\n`
    msg += `📊 *Status:* ${task.status.toUpperCase()}\n`
    msg += `⏰ *Deadline ${nextStep}:* ${formatDeadline(task.deadline)}\n`
    
    if (extra) msg += `💬 *Catatan:* ${extra}\n`

    if (event !== 'task_selesai') {
      msg += `\nSilakan dilanjutkan ya, ${targetMention} 🙏`
    } else {
      msg += `\nAlhamdulillah, kerja bagus semuanya! 💪`
    }

    return msg
  }

  const sendViaFonnte = async (message: string): Promise<boolean> => {
    try {
      const data = await $fetch('/api/wa', { method: 'POST', body: { message } })
      // @ts-ignore
      return !!data?.status
    } catch (e) {
      return false
    }
  }

  const logNotif = async (task: Task, event: WaEvent, success: boolean) => {
    try {
      await supabase.from('notif_log').insert({
        id: `n${Date.now()}`, task_id: task.id, task_name: task.name,
        event, sent_at: new Date().toISOString(), success,
      })
    } catch {}
  }

  const sendNotif = async (payload: WaPayload) => {
    const message = buildMessage(payload)
    const ok = await sendViaFonnte(message)
    await logNotif(payload.task, payload.event, ok)
    return ok
  }

  return {
    sendNotif,
    notifyTaskCreated:    (t: Task, a: string) => sendNotif({ task: t, event: 'task_created', actor: a }),
    notifyPlanningDone:   (t: Task, a: string) => sendNotif({ task: t, event: 'planning_done', actor: a }),
    notifyUploadProduksi: (t: Task, a: string) => sendNotif({ task: t, event: 'upload_produksi', actor: a }),
    notifyUploadEditing:  (t: Task, a: string) => sendNotif({ task: t, event: 'upload_editing', actor: a }),
    notifyQcApproved:     (t: Task, a: string, e?: string) => sendNotif({ task: t, event: 'qc_approved', actor: a, extra: e }),
    notifyQcRevision:     (t: Task, a: string, e?: string) => sendNotif({ task: t, event: 'qc_revision', actor: a, extra: e }),
    notifyDistribusi:     (t: Task, a: string) => sendNotif({ task: t, event: 'distribusi_ready', actor: a }),
    notifySelesai:        (t: Task, a: string) => sendNotif({ task: t, event: 'task_selesai', actor: a }),
  }
}
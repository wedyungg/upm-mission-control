// stores/tasks.ts
import { defineStore } from 'pinia'
import type { Task, TaskGrade, TaskStatus, TaskType, StatSummary } from '~/types'
import { useHijri } from '~/composables/useHijri'

const { approxCurrentHijriYear } = useHijri()

const DEFAULT_TASKS: Task[] = [
  { id: 't1', name: 'Fiqih - Mensucikan Najis', kat: 'Edukasi Fiqih', grade: 'A', status: 'planning', type: 'tim', deadline: new Date(Date.now() + 2 * 3600000).toISOString(), file: null, platform: 'Instagram', durasi: '1 Menit', bulan: new Date().getMonth(), hijri_year: approxCurrentHijriYear() },
  { id: 't2', name: 'Podcast - Guru Bana Pert.', kat: 'Podcast/Reels/Carousel', grade: 'S', status: 'produksi', type: 'tim', deadline: new Date(Date.now() - 1 * 3600000).toISOString(), file: null, platform: 'YouTube', durasi: '30 Menit', bulan: new Date().getMonth(), hijri_year: approxCurrentHijriYear() },
  { id: 't3', name: 'Dawuh Belajar - KH. Mu\'a', kat: 'Edukasi Tauhid', grade: 'B', status: 'planning', type: 'tim', deadline: new Date(Date.now() + 48 * 3600000).toISOString(), file: null, platform: 'Instagram', durasi: '1 Menit', bulan: new Date().getMonth(), hijri_year: approxCurrentHijriYear() },
  { id: 't4', name: 'Tips Merawat Kitab Kuning', kat: 'Edukasi Kitab Kuning', grade: 'C', status: 'editing', type: 'tim', deadline: new Date(Date.now() + 72 * 3600000).toISOString(), file: 'draft_v2.mp4', platform: 'TikTok', durasi: '3 Menit', bulan: new Date().getMonth(), hijri_year: approxCurrentHijriYear() },
  { id: 't5', name: 'Desain Flyer Event Besar', kat: 'Desain Flyer/Poster', grade: 'B', status: 'qc1', type: 'tim', deadline: new Date(Date.now() + 24 * 3600000).toISOString(), file: 'flyer_v1.png', platform: 'Instagram', durasi: '4 Slide', bulan: new Date().getMonth(), hijri_year: approxCurrentHijriYear() },
  { id: 't6', name: 'Desain Story Ramadhan', kat: 'Desain Story', grade: 'A', status: 'qc2', type: 'tim', deadline: new Date(Date.now() + 36 * 3600000).toISOString(), file: 'story_final.png', platform: 'Instagram', durasi: '8 Slide', bulan: new Date().getMonth(), hijri_year: approxCurrentHijriYear() },
  { id: 't7', name: 'Aset Digital PIM', kat: 'Aset Digital PIM', grade: 'A', status: 'distribusi', type: 'tim', deadline: new Date(Date.now() + 12 * 3600000).toISOString(), file: 'aset.zip', platform: 'Multi-Platform', durasi: '4 Slide', bulan: new Date().getMonth(), hijri_year: approxCurrentHijriYear() },
  { id: 'a1', name: 'Pengelolaan Anggaran Q4', kat: 'Pengelolaan Anggaran', grade: 'S', status: 'planning', type: 'admin', deadline: new Date(Date.now() + 12 * 3600000).toISOString(), file: null, bulan: new Date().getMonth(), hijri_year: approxCurrentHijriYear() },
  { id: 'a2', name: 'Laporan Keuangan November', kat: 'Laporan Keuangan', grade: 'A', status: 'qc2', type: 'admin', deadline: new Date(Date.now() + 36 * 3600000).toISOString(), file: 'laporan.pdf', bulan: new Date().getMonth(), hijri_year: approxCurrentHijriYear() },
  { id: 'a3', name: 'Surat Menyurat Penting', kat: 'Surat Menyurat Penting', grade: 'B', status: 'planning', type: 'admin', deadline: new Date(Date.now() + 8 * 3600000).toISOString(), file: null, bulan: new Date().getMonth(), hijri_year: approxCurrentHijriYear() },
]

// Kolom yang ada di tabel Supabase — strip kolom lain sebelum upsert
const SUPABASE_COLUMNS: (keyof Task)[] = [
  'id', 'name', 'kat', 'grade', 'status', 'type', 'deadline',
  'file', 'file_drive_id', 'platform', 'durasi', 'skrip', 'konsep',
  'qc_comment', 'bulan', 'hijri_year', 'progja_id',
  'created_at', 'updated_at', 'created_by',
]

export const useTasksStore = defineStore('tasks', () => {
  const supabase    = useSupabaseClient()
  const tasks       = ref<Task[]>([])
  const loading     = ref(false)
  const error       = ref<string | null>(null)
  const activeMonth = ref<number>(new Date().getMonth())

  // ─── Fetch ────────────────────────────────────────────
// ─── Fetch ────────────────────────────────────────────
  const fetchTasks = async (hijriYear?: number) => {
    loading.value = true
    error.value   = null
    try {
      let query = supabase.from('tasks').select('*').order('deadline', { ascending: true })
      
      // 🚨 KUNCI ANTI-HANTU: Abaikan angka sasi (0-11) sing nyasar mlebu mrene!
      // Mung trima angka taun sing logis (conto: > 1400)
      const year = (hijriYear !== undefined && hijriYear > 1400) 
        ? hijriYear 
        : approxCurrentHijriYear()
        
      query = query.eq('hijri_year', year)

      const { data: d, error: err } = await query
      if (err) throw err
      tasks.value = (d as Task[]) ?? []
    } catch (e: any) {
      console.warn('Tasks fetch fallback:', e.message)
      tasks.value = DEFAULT_TASKS
    } finally {
      loading.value = false
    }
  }

  // Fungsi iki cukup ngubah state wae, OJO NIMPA DATA!
  const fetchByMonth = (month: number) => {
    activeMonth.value = month
    // Ojo ana baris "return fetchTasks(month)" neng kene!
  }
  // ─── Upsert — local-first, strip unknown columns ──────
  const upsertTask = async (patch: Partial<Task> & { id: string }) => {
    // 1. Update lokal dulu (optimistic) — UI responsif tanpa tunggu server
    const idx = tasks.value.findIndex(t => t.id === patch.id)
    
    // Variabel untuk menampung data task secara utuh
    let fullTaskData: Record<string, any> = { ...patch }

    if (idx >= 0) {
      Object.assign(tasks.value[idx], patch)
      // Ambil data utuh yang sudah digabungkan dari local state
      fullTaskData = tasks.value[idx]
    } else {
      tasks.value.push(patch as Task)
    }

    // 2. Kirim ke Supabase — saring berdasarkan data utuh (fullTaskData), bukan patch
    const safe: Record<string, unknown> = {}
    for (const col of SUPABASE_COLUMNS) {
      if (col in fullTaskData) safe[col] = fullTaskData[col]
    }
    
    try {
      const { error: err } = await supabase.from('tasks').upsert(safe)
      if (err) throw err
    } catch (e: any) {
      // Local update sudah terjadi — log saja, jangan throw ke UI
      console.warn('Tasks upsert error (local update tetap ada):', e.message)
    }
  }

  // ─── Update status ────────────────────────────────────
const updateStatus = async (id: string, status: TaskStatus, extra?: Partial<Task>) => {
  let updatedExtra = { ...extra };
  const now = Date.now();

  // Menambah durasi deadline secara otomatis berdasarkan tahap
  if (status === 'produksi') {
    updatedExtra.deadline = new Date(now + 48 * 3600000).toISOString(); // +2 Hari
  } else if (status === 'editing') {
    updatedExtra.deadline = new Date(now + 24 * 3600000).toISOString(); // +1 Hari
  } else if (status === 'qc2') {
    updatedExtra.deadline = new Date(now + 12 * 3600000).toISOString(); // +12 Jam
  }

  return upsertTask({ id, status, updated_at: new Date().toISOString(), ...updatedExtra });
};

  // ─── Create ───────────────────────────────────────────
  const createTask = async (task: Omit<Task, 'created_at' | 'updated_at'>) => {
    const newTask: Task = {
      ...task,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    await upsertTask(newTask)
    return newTask
  }

  // ─── Filters ──────────────────────────────────────────
  const byMonth  = (month: number)  => tasks.value.filter(t => t.bulan === month)
  const byStatus = (status: TaskStatus | TaskStatus[], month?: number) => {
    const list     = month !== undefined ? byMonth(month) : tasks.value
    const statuses = Array.isArray(status) ? status : [status]
    return list.filter(t => statuses.includes(t.status))
  }
  const byType = (type: TaskType, month?: number) => {
    const list = month !== undefined ? byMonth(month) : tasks.value
    return list.filter(t => t.type === type)
  }

 // ─── Stats ────────────────────────────────────────────
  const getStats = (month?: number): StatSummary => {
    const list     = month !== undefined ? byMonth(month) : tasks.value
    const selesai  = list.filter(t => ['distribusi', 'selesai'].includes(t.status)).length
    const proses   = list.filter(t => ['produksi', 'editing'].includes(t.status)).length
    const approval = list.filter(t => ['qc1', 'qc2'].includes(t.status)).length
    const belum    = list.filter(t => t.status === 'planning').length
    const total    = list.length
    return { belum, proses, approval, selesai, total, pct: total ? Math.round((selesai / total) * 100) : 0 }
  }

  // State dan Fetch untuk Total Tahunan
  const annualSelesaiCount = ref(0)

  const fetchAnnualSelesai = async (hijriYear: number) => {
    const { count } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('hijri_year', hijriYear)
      .in('status', ['distribusi', 'selesai'])
    
    annualSelesaiCount.value = count || 0
  }

  // ─── Progja helper (legacy, masih dipakai) ────────────
  const getSisaProgja = (type: TaskType, targets: { grade: TaskGrade; target: number }[]) => {
    const done = tasks.value.filter(t => t.type === type && ['distribusi', 'selesai'].includes(t.status))
    return targets.map(p => ({
      grade: p.grade, target: p.target,
      done:  done.filter(t => t.grade === p.grade).length,
      sisa:  Math.max(0, p.target - done.filter(t => t.grade === p.grade).length),
    }))
  }

  // DIPASTIKAN SEMUA VARIABEL & FUNGSI DI-RETURN DI SINI
  return {
    tasks, loading, error, activeMonth,
    fetchTasks, fetchByMonth, upsertTask, updateStatus, createTask,
    byMonth, byStatus, byType, getStats, getSisaProgja,
    annualSelesaiCount,     // PASTIKAN ADA
    fetchAnnualSelesai      // PASTIKAN ADA
  }
})
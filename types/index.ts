// types/index.ts

export type UserRole =
  | 'penanggung_jawab'
  | 'ketua'
  | 'planner'
  | 'production'
  | 'admin_partnership'
  | 'editor_crew'

export type UserAccess = 'read-only' | 'full' | 'limited'

export type TabAccess = 'planner' | 'qc' | 'production' | 'editor' | 'publisher'

export interface AppUser {
  id: string
  name: string
  role: UserRole
  roleLabel: string
  initials: string
  color: string
  bg: string
  access: UserAccess
  tabAccess: TabAccess[]
  supabaseId?: string
}

export type TaskStatus =
  | 'planning'
  | 'qc1'
  | 'produksi'
  | 'editing'
  | 'qc2'
  | 'distribusi'
  | 'selesai'

export type TaskType = 'tim' | 'admin'
export type TaskGrade = 'S' | 'A' | 'B' | 'C'

// ─── Progja (Program Kerja Tahunan) ─────────────────────────
export interface ProgjaItem {
  id: string
  nama: string           // "Podcast", "Desain Carousel", dsb.
  kategori: string       // mapping ke task.kat
  type: TaskType
  grade: TaskGrade
  target_tahunan: number // jumlah wajib dalam 1 periode hijriyah
  hijri_year: number
  created_at?: string
  updated_at?: string
}

// ─── Task ────────────────────────────────────────────────────
export interface Task {
  id: string
  name: string
  kat: string
  grade: TaskGrade
  status: TaskStatus
  type: TaskType
  deadline: string
  file: string | null
  file_drive_id?: string
  platform?: string
  durasi?: string
  skrip?: string
  konsep?: string
  qc_comment?: string
  produksi_note?: string
  editing_note?: string
  bulan: number
  hijri_year: number
  progja_id?: string
  created_at?: string
  updated_at?: string
  created_by?: string
}

// ─── WhatsApp notification log ───────────────────────────────
export interface NotifLog {
  id: string
  task_id: string
  task_name: string
  event: string
  sent_at: string
  success: boolean
}

export interface HijriPeriod {
  hijriYear: number
  startGregorian: Date
  endGregorian: Date
  label: string
}

export interface DriveUploadResult {
  fileId: string
  fileName: string
  webViewLink: string
  drivePath: string
}

export interface StatSummary {
  belum: number
  proses: number
  approval: number
  selesai: number
  total: number
  pct: number
}

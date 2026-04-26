// stores/progja.ts
// Menyimpan target Program Kerja tahunan yang diinput saat sidang penetapan.
// Data ini menjadi sumber kebenaran untuk kartu "Sisa Kerja Tim / Admin".

import { defineStore } from 'pinia'
import type { ProgjaItem, TaskGrade, TaskType } from '~/types'
import { useHijri } from '~/composables/useHijri'

const { approxCurrentHijriYear } = useHijri()

// Default progja — diisi admin/ketua melalui halaman Progja, bukan dari "Buat Jadwal"
const DEFAULT_PROGJA: ProgjaItem[] = [
  // TIM
  { id: 'p1',  nama: 'Podcast',              kategori: 'Podcast/Reels/Carousel', type: 'tim',   grade: 'S', target_tahunan: 10, hijri_year: approxCurrentHijriYear() },
  { id: 'p2',  nama: 'Film Dokumenter',      kategori: 'Film Dokumenter',        type: 'tim',   grade: 'S', target_tahunan:  4, hijri_year: approxCurrentHijriYear() },
  { id: 'p3',  nama: 'Video Profil',         kategori: 'Video Profil',           type: 'tim',   grade: 'S', target_tahunan:  2, hijri_year: approxCurrentHijriYear() },
  { id: 'p4',  nama: 'Aset Digital PIM',     kategori: 'Aset Digital PIM',       type: 'tim',   grade: 'S', target_tahunan:  5, hijri_year: approxCurrentHijriYear() },
  { id: 'p5',  nama: 'Edukasi Fiqih',        kategori: 'Edukasi Fiqih',          type: 'tim',   grade: 'A', target_tahunan: 12, hijri_year: approxCurrentHijriYear() },
  { id: 'p6',  nama: 'Edukasi Tauhid',       kategori: 'Edukasi Tauhid',         type: 'tim',   grade: 'A', target_tahunan:  8, hijri_year: approxCurrentHijriYear() },
  { id: 'p7',  nama: 'Edukasi Kitab Kuning', kategori: 'Edukasi Kitab Kuning',   type: 'tim',   grade: 'A', target_tahunan:  6, hijri_year: approxCurrentHijriYear() },
  { id: 'p8',  nama: 'Desain Flyer/Poster',  kategori: 'Desain Flyer/Poster',    type: 'tim',   grade: 'B', target_tahunan: 18, hijri_year: approxCurrentHijriYear() },
  { id: 'p9',  nama: 'Desain Story',         kategori: 'Desain Story',           type: 'tim',   grade: 'B', target_tahunan: 24, hijri_year: approxCurrentHijriYear() },
  { id: 'p10', nama: 'Dawuh Guru',           kategori: 'Dawuh Guru',             type: 'tim',   grade: 'B', target_tahunan: 12, hijri_year: approxCurrentHijriYear() },
  { id: 'p11', nama: 'Reels/Short',          kategori: 'Reels/Short',            type: 'tim',   grade: 'C', target_tahunan: 30, hijri_year: approxCurrentHijriYear() },
  // ADMIN
  { id: 'pa1', nama: 'Pengelolaan Anggaran', kategori: 'Pengelolaan Anggaran',   type: 'admin', grade: 'S', target_tahunan:  4, hijri_year: approxCurrentHijriYear() },
  { id: 'pa2', nama: 'Laporan Keuangan',     kategori: 'Laporan Keuangan',       type: 'admin', grade: 'A', target_tahunan: 12, hijri_year: approxCurrentHijriYear() },
  { id: 'pa3', nama: 'Surat Menyurat',       kategori: 'Surat Menyurat Penting', type: 'admin', grade: 'B', target_tahunan:  8, hijri_year: approxCurrentHijriYear() },
  { id: 'pa4', nama: 'Koordinasi Bulanan',   kategori: 'Koordinasi Bulanan',     type: 'admin', grade: 'A', target_tahunan:  6, hijri_year: approxCurrentHijriYear() },
  { id: 'pa5', nama: 'Office Care',          kategori: 'Office Care',            type: 'admin', grade: 'C', target_tahunan: 12, hijri_year: approxCurrentHijriYear() },
]

export const useProgjaStore = defineStore('progja', () => {
  const supabase = useSupabaseClient()
  const items    = ref<ProgjaItem[]>([])
  const loading  = ref(false)

// ─── Fetch ──────────────────────────────────────────
  const fetchProgja = async (hijriYear?: number) => {
    loading.value = true
    try {
      // HAPUS .order('grade') agar database tidak mengurutkan berdasarkan abjad A-Z
      let q = supabase.from('progja').select('*').order('type')
      if (hijriYear) q = q.eq('hijri_year', hijriYear)
      
      const { data, error } = await q
      if (error) throw error
      
      let fetched = (data as ProgjaItem[]) ?? []
      
      // LOGIKA SORTING MANUAL: Mengurutkan S, A, B, C dengan benar
      const gradeWeight: Record<string, number> = { 'S': 1, 'A': 2, 'B': 3, 'C': 4 }
      fetched.sort((a, b) => {
        if (a.type !== b.type) return a.type.localeCompare(b.type)
        return (gradeWeight[a.grade] || 99) - (gradeWeight[b.grade] || 99)
      })

      items.value = fetched
    } catch (e: any) {
      console.warn('Progja fetch failed — using defaults:', e.message)
      items.value = DEFAULT_PROGJA
    } finally {
      loading.value = false
    }
  }
  
  // ─── Upsert ─────────────────────────────────────────
  const upsertProgja = async (item: ProgjaItem) => {
    try {
      const { error } = await supabase.from('progja').upsert(item)
      if (error) throw error
    } catch (e: any) {
      console.warn('Progja upsert failed:', e.message)
    }
    const idx = items.value.findIndex(p => p.id === item.id)
    if (idx >= 0) items.value[idx] = item
    else items.value.push(item)
  }

  const deleteProgja = async (id: string) => {
    try {
      await supabase.from('progja').delete().eq('id', id)
    } catch {}
    items.value = items.value.filter(p => p.id !== id)
  }

  // ─── Computed: sisa per grade+type ──────────────────
  /**
   * Hitung sisa dari target progja dikurangi task yang sudah selesai.
   * tasks: semua task yang sudah selesai (distribusi|selesai)
   */
  const getSisaByGrade = (
    type: TaskType,
    doneTasks: { kat: string; grade: TaskGrade }[],
  ) => {
    const progjaOfType = items.value.filter(p => p.type === type)
    const grades: TaskGrade[] = ['S', 'A', 'B', 'C']
    return grades.map(g => {
      const progjaGrade   = progjaOfType.filter(p => p.grade === g)
      const targetTotal   = progjaGrade.reduce((s, p) => s + p.target_tahunan, 0)
      const doneTotal     = doneTasks.filter(t => t.grade === g).length
      const sisa          = Math.max(0, targetTotal - doneTotal)
      const rincian       = progjaGrade.map(p => {
        const d = doneTasks.filter(t => t.kat === p.kategori).length
        return { nama: p.nama, target: p.target_tahunan, done: d, sisa: Math.max(0, p.target_tahunan - d) }
      })
      return { grade: g, target: targetTotal, done: doneTotal, sisa, rincian }
    })
  }

  const getTotalTarget = () =>
  items.value.reduce((sum, p) => sum + p.target_tahunan, 0)

return { items, loading, fetchProgja, upsertProgja, deleteProgja, getSisaByGrade, getTotalTarget }
})

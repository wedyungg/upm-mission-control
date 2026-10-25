// stores/auth.ts
import { defineStore } from 'pinia'
import type { AppUser, UserAccess, TabAccess } from '~/types'

export const USERS: AppUser[] = [
  {
    id: 'zaim',
    name: 'Ust. M. Zaim',
    role: 'penanggung_jawab',
    roleLabel: 'Penanggung Jawab',
    initials: 'ZM',
    color: '#a855f7',
    bg: 'rgba(168,85,247,0.15)',
    access: 'read-only',
    tabAccess: ['qc'],
    phone: '6282113753179',
  },
  {
    id: 'ismail',
    name: 'Ust. Ahmad Ismail',
    role: 'penanggung_jawab',
    roleLabel: 'Penanggung Jawab',
    initials: 'AI',
    color: '#a855f7',
    bg: 'rgba(168,85,247,0.15)',
    access: 'read-only',
    tabAccess: ['qc'],
    phone: '6285228907602',
  },
  {
    id: 'rofiq',
    name: 'Ainur Rofiq',
    role: 'ketua',
    roleLabel: 'Ketua UPM',
    initials: 'AR',
    color: '#f97316',
    bg: 'rgba(249,115,22,0.15)',
    access: 'full',
    tabAccess: ['planner', 'qc', 'production', 'editor', 'publisher'],
    phone: '6285290313029',
  },
  {
    id: 'faridu',
    name: 'Faridu Asrih',
    role: 'ketua',
    roleLabel: 'Ketua UPM',
    initials: 'FA',
    color: '#f97316',
    bg: 'rgba(249,115,22,0.15)',
    access: 'full',
    tabAccess: ['planner', 'qc', 'production', 'editor', 'publisher'],
    phone: '6281281144772',
  },
  {
    id: 'ziyan',
    name: 'Ziyan Firdaus',
    role: 'production',
    roleLabel: 'PIC Dawuh & Keagamaan',
    rubrik: 'Dawuh & Keagamaan',
    weeklyTarget: 2,
    initials: 'ZF',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.15)',
    access: 'full',
    tabAccess: ['planner', 'qc', 'production', 'editor', 'publisher'],
    phone: '6285162855285',
  },
  {
    id: 'vega',
    name: 'Vega Faisal Amri',
    role: 'admin_partnership',
    roleLabel: 'PIC Info Kemadrasahan',
    rubrik: 'Informasi Kemadrasahan',
    weeklyTarget: 2,
    initials: 'VF',
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.15)',
    access: 'full',
    tabAccess: ['planner', 'qc', 'production', 'editor', 'publisher'],
    phone: '6281903975548',
  },
  {
    id: 'syihab',
    name: 'Moh. Syihabuddin',
    role: 'planner',
    roleLabel: 'PIC Tren Sosmed',
    rubrik: 'Tren Sosmed',
    weeklyTarget: 2,
    initials: 'MS',
    color: '#eab308',
    bg: 'rgba(234,179,8,0.15)',
    access: 'full',
    tabAccess: ['planner', 'qc', 'production', 'editor', 'publisher'],
    phone: '6285700052112',
  },
  {
    id: 'editor1',
    name: 'Editor / Crew',
    role: 'editor_crew',
    roleLabel: 'Kru & Kolaborasi',
    initials: 'EC',
    color: '#14b8a6',
    bg: 'rgba(20,184,166,0.15)',
    access: 'full',
    tabAccess: ['planner', 'qc', 'production', 'editor', 'publisher'],
  },
  {
    id: 'tester',
    name: 'Tester',
    role: 'tester',
    roleLabel: 'Quality Assurance',
    initials: 'TC',
    color: '#64748b',
    bg: 'rgba(100,116,139,0.15)',
    access: 'full', // Beri akses full supaya kamu bisa ngetes semua tombol
    tabAccess: ['planner', 'qc', 'production', 'editor', 'publisher'],
    phone: '6285162855285', // Isi nomor WA-mu kalau mau ngetes notifikasi
  },
]

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<AppUser | null>(null)
  const isLoggedIn  = computed(() => !!currentUser.value)
  const canEdit     = computed(() => currentUser.value?.access !== 'read-only')
  const isReadOnly  = computed(() => currentUser.value?.access === 'read-only')

  // Menggunakan fungsi bawaan module Nuxt Supabase
  const supabase = useSupabaseClient()
  const supabaseUser = useSupabaseUser()

  // Restore otomatis dari session Supabase
  const restore = () => {
    if (supabaseUser.value && supabaseUser.value.email) {
      // Mengambil ID dari format email (contoh: ziyan dari ziyan@upm.com)
      const userId = supabaseUser.value.email.split('@')[0]
      const user = USERS.find(u => u.id === userId)
      if (user) {
        currentUser.value = user
      }
    } else {
      currentUser.value = null
    }
  }

  // Fungsi Login Asli ke Supabase
  const login = async (userId: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Kita gabungkan userId jadi format email yang ada di Supabase
    const emailFormat = `${userId}@upm.com`

    const { error } = await supabase.auth.signInWithPassword({
      email: emailFormat,
      password: password,
    })

    if (error) {
      console.error('Login error:', error.message)
      if (error.message.includes('Invalid login credentials') || error.message.includes('invalid_credentials')) {
        return { success: false, error: 'Kata sandi salah.' }
      }
      if (error.message.includes('Failed to fetch') || error.message.includes('fetch')) {
        return { success: false, error: 'Gagal terhubung ke database. Mohon periksa koneksi internet.' }
      }
      return { success: false, error: error.message || 'Terjadi kesalahan sistem.' }
    }

    // Jika sukses, sinkronkan dengan state lokal
    const user = USERS.find(u => u.id === userId)
    if (user) {
      currentUser.value = user
    }

    return { success: true }
  }

  // Fungsi Logout Asli
  const logout = async () => {
    await supabase.auth.signOut()
    currentUser.value = null
    navigateTo('/login')
  }

  const hasTabAccess = (tab: TabAccess): boolean => {
    return currentUser.value?.tabAccess.includes(tab) ?? false
  }

  return { currentUser, isLoggedIn, canEdit, isReadOnly, login, logout, restore, hasTabAccess, USERS }
})
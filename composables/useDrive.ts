// composables/useDrive.ts
import type { Task, DriveUploadResult } from '~/types'
import { useHijri } from './useHijri'

export const useDrive = () => {
  const config = useRuntimeConfig()
  const supabase = useSupabaseClient()
  const auth = useAuthStore()
  const { MONTHS_ID, approxCurrentHijriYear } = useHijri()

  const driveToken     = useState<string | null>('drive_token', () => null)
  const driveConnected = ref(false)

  // ── KONFIGURASI AKUN PUSAT ──────────────────────────────────
  const MASTER_EMAIL = 'upm@pim.sch.id'

  const OAUTH_SCOPES = [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.metadata.readonly',
  ].join(' ')

  /**
   * Mengarahkan ke Google Login untuk mendapatkan token pusat.
   * Hanya perlu dilakukan satu kali oleh pemegang akun upm@pim.sch.id.
   */
  const connectDrive = () => {
    const clientId = String(config.public.googleClientId ?? '')
    const redirect = `${window.location.origin}/confirm-drive`
    
    const url = [
      'https://accounts.google.com/o/oauth2/v2/auth',
      `?client_id=${encodeURIComponent(clientId)}`,
      `&redirect_uri=${encodeURIComponent(redirect)}`,
      `&response_type=code`,
      `&scope=${encodeURIComponent(OAUTH_SCOPES)}`,
      `&access_type=offline`,
      `&prompt=consent`
    ].join('')
    
    window.location.href = url
  }

  /**
   * Mengecek apakah akun MASTER (upm@pim.sch.id) sudah terhubung.
   * Dipanggil agar semua anggota tim tahu status koneksi pusat.
   */
  const checkDriveStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('drive_refresh_token')
        .eq('email', MASTER_EMAIL) // Mencari berdasarkan email pusat
        .maybeSingle()

      driveConnected.value = !!(data && data.drive_refresh_token)
    } catch (err) {
      driveConnected.value = false
    }
  }

  onMounted(() => {
    checkDriveStatus()
  })

  /**
   * Fungsi Internal untuk memanggil API Google Drive
   */
  const apiFetch = async (url: string, options: RequestInit = {}) => {
    const res = await fetch(url, {
      ...options,
      headers: {
        Authorization:  `Bearer ${driveToken.value}`,
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
      },
    })
    
    if (res.status === 401) {
      throw new Error('UNAUTHORIZED') // Token kedaluwarsa
    }

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Drive API ${res.status}: ${body}`)
    }
    return res.json()
  }

  // ── FOLDER HELPERS ───────────────────────────────────────────────────
  const findFolder = async (name: string, parentId: string): Promise<string | null> => {
    const q = [`name='${name.replace(/'/g, "\\'")}'`, `mimeType='application/vnd.google-apps.folder'`, `'${parentId}' in parents`, `trashed=false`].join(' and ')
    const d = await apiFetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name)&spaces=drive`)
    return d.files?.[0]?.id ?? null
  }

  const createFolder = async (name: string, parentId: string): Promise<string> => {
    const d = await apiFetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      body: JSON.stringify({ name, mimeType: 'application/vnd.google-apps.folder', parents: [parentId] }),
    })
    return d.id
  }

  const getOrCreateFolder = async (name: string, parentId: string): Promise<string> =>
    (await findFolder(name, parentId)) ?? (await createFolder(name, parentId))

  const buildDrivePath = (task: Task): string[] => {
    const hy     = task.hijri_year ?? approxCurrentHijriYear()
    const period = `${hy}H — ${hy + 1}H`
    const bulan  = MONTHS_ID[task.bulan ?? 0] ?? 'Unknown'
    return [period, bulan, `Grade ${task.grade}`, task.name]
  }

  const getDrivePathString = (task: Task): string => {
    const rootName = String(config.public.googleDriveFolderName ?? 'UPM Mission Control')
    return [rootName, ...buildDrivePath(task)].join(' / ')
  }

  /**
   * PROSES UPLOAD FILE (MODE MASTER)
   */
  const uploadFile = async (file: File, task: Task, onProgress?: (pct: number) => void): Promise<DriveUploadResult> => {
    
    // Validasi awal: Memastikan sistem sudah punya akses Master
    if (!driveConnected.value) throw new Error('Akses Google Drive Pusat belum dikonfigurasi oleh Admin.')

    // Jika driveToken kosong, kita akan memicu proses "Silent Refresh" di backend/confirm-drive 
    // Untuk saat ini, kita asumsikan middleware atau halaman confirm-drive sudah mengisi driveToken.value
    if (!driveToken.value) throw new Error('Sesi Google Drive berakhir. Silakan refresh halaman atau hubungi Admin.')

    const rootFolderId = String(config.public.googleDriveFolderId ?? '')
    const pathSegments = buildDrivePath(task) 
    let parentId = rootFolderId 

    for (const segment of pathSegments) {
      parentId = await getOrCreateFolder(segment, parentId)
    }
 
    const meta = { name: file.name, parents: [parentId] }
    const form = new FormData()
    form.append('metadata', new Blob([JSON.stringify(meta)], { type: 'application/json' }))
    form.append('file', file)
 
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100))
      }

      xhr.onload = () => {
        if (xhr.status === 200) {
          const r = JSON.parse(xhr.responseText)
          resolve({
            fileId:      r.id,
            fileName:    file.name,
            webViewLink: `https://drive.google.com/file/d/${r.id}/view`,
            drivePath:   getDrivePathString(task),
          })
        } else {
          reject(new Error(`Upload gagal: Akun pusat mungkin perlu disambungkan ulang.`))
        }
      }

      xhr.onerror = () => reject(new Error('Koneksi terputus saat upload'))
      xhr.open('POST', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink')
      xhr.setRequestHeader('Authorization', `Bearer ${driveToken.value}`)
      xhr.send(form)
    })
  }

  return {
    driveToken,
    driveConnected,
    connectDrive,
    checkDriveStatus,
    uploadFile,
    getDrivePathString,
    buildDrivePath,
  }
}
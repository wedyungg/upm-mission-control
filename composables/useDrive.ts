// composables/useDrive.ts
import type { Task, DriveUploadResult } from '~/types'
import { useHijri } from './useHijri'

export const useDrive = () => {
  const config = useRuntimeConfig()
  const { MONTHS_ID, approxCurrentHijriYear } = useHijri()

  const driveToken     = useState<string | null>('drive_token', () => null)
  const driveConnected = computed(() => !!driveToken.value)

  // ── OAuth — scope diperluas agar bisa files.list pada folder manapun ──
  //
  // drive.file  → hanya file yang dibuat app (TIDAK bisa cari folder manual)
  // drive       → full access (terlalu luas, butuh verifikasi Google)
  // drive.metadata.readonly + drive → tidak diperlukan jika pakai drive
  //
  // SOLUSI: gunakan dua scope sekaligus:
  //   1. drive.file          → izin buat & upload file baru
  //   2. drive.metadata.readonly → izin baca/cari folder yang sudah ada
  //
  // Ini cukup untuk findFolder (files.list) + createFolder + upload
  // tanpa harus minta full "drive" scope.
  const OAUTH_SCOPES = [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.metadata.readonly',
  ].join(' ')

  const connectDrive = () => {
    const clientId = String(config.public.googleClientId ?? '')
    if (!clientId) throw new Error('GOOGLE_CLIENT_ID tidak ditemukan di .env')

    const redirect = `${window.location.origin}${window.location.pathname}`
    const url = [
      'https://accounts.google.com/o/oauth2/v2/auth',
      `?client_id=${encodeURIComponent(clientId)}`,
      `&redirect_uri=${encodeURIComponent(redirect)}`,
      `&response_type=token`,
      `&scope=${encodeURIComponent(OAUTH_SCOPES)}`,
    ].join('')
    window.location.href = url
  }

  // ── Capture OAuth token dari URL hash setelah redirect ──────────────
  const captureTokenFromHash = (): boolean => {
    if (typeof window === 'undefined') return false
    const hash = window.location.hash
    if (!hash.includes('access_token')) return false
    const params    = new URLSearchParams(hash.slice(1))
    const token     = params.get('access_token')
    const expiresIn = parseInt(params.get('expires_in') ?? '3600')
    if (token) {
      driveToken.value = token
      const expiry     = Date.now() + expiresIn * 1000
      localStorage.setItem('upm_drive_token',  token)
      localStorage.setItem('upm_drive_expiry', String(expiry))
      history.replaceState(null, '', window.location.pathname + window.location.search)
      return true
    }
    return false
  }

  // ── Restore token dari localStorage jika belum expired ──────────────
  const restoreTokenFromStorage = () => {
    if (typeof localStorage === 'undefined') return
    const token  = localStorage.getItem('upm_drive_token')
    const expiry = parseInt(localStorage.getItem('upm_drive_expiry') ?? '0')
    if (token && Date.now() < expiry) {
      driveToken.value = token
    } else {
      localStorage.removeItem('upm_drive_token')
      localStorage.removeItem('upm_drive_expiry')
      driveToken.value = null
    }
  }

  // ── Drive API wrapper ────────────────────────────────────────────────
  const apiFetch = async (url: string, options: RequestInit = {}) => {
    const res = await fetch(url, {
      ...options,
      headers: {
        Authorization:  `Bearer ${driveToken.value}`,
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
      },
    })
    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Drive API ${res.status}: ${body}`)
    }
    return res.json()
  }

  // ── Folder helpers ───────────────────────────────────────────────────
  const findFolder = async (name: string, parentId: string): Promise<string | null> => {
    // Gunakan query yang tepat — name exact match, folder, parent, not trashed
    const q = [
      `name='${name.replace(/'/g, "\\'")}'`,
      `mimeType='application/vnd.google-apps.folder'`,
      `'${parentId}' in parents`,
      `trashed=false`,
    ].join(' and ')
    const d = await apiFetch(
      `https://www.googleapis.com/drive/v3/files` +
      `?q=${encodeURIComponent(q)}&fields=files(id,name)&spaces=drive`
    )
    return d.files?.[0]?.id ?? null
  }

  const createFolder = async (name: string, parentId: string): Promise<string> => {
    const d = await apiFetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      body: JSON.stringify({
        name,
        mimeType: 'application/vnd.google-apps.folder',
        parents:  [parentId],
      }),
    })
    return d.id
  }

  const getOrCreateFolder = async (name: string, parentId: string): Promise<string> =>
    (await findFolder(name, parentId)) ?? (await createFolder(name, parentId))

  // ── Build path segments untuk sebuah task ───────────────────────────
  // Struktur: [Periode Hijriyah] / [Bulan] / [Grade X] / [Nama Tugas]
  // Root folder TIDAK dimasukkan ke path — sudah ditangani lewat rootFolderId
  const buildDrivePath = (task: Task): string[] => {
    const hy     = task.hijri_year ?? approxCurrentHijriYear()
    const period = `${hy}H — ${hy + 1}H`
    const bulan  = MONTHS_ID[task.bulan ?? new Date().getMonth()] ?? 'Unknown'
    return [period, bulan, `Grade ${task.grade}`, task.name]
  }

  // Path lengkap untuk ditampilkan di UI (sertakan nama root folder)
  const getDrivePathString = (task: Task): string => {
    const rootName = String(config.public.googleDriveFolderName ?? 'SISTEM DASHBOARD UPM')
    return [rootName, ...buildDrivePath(task)].join(' / ')
  }

  // ── Upload file ke Drive ─────────────────────────────────────────────
  const uploadFile = async (
    file: File,
    task: Task,
    onProgress?: (pct: number) => void,
  ): Promise<DriveUploadResult> => {
    if (!driveToken.value) throw new Error('Belum terhubung ke Google Drive')
 
    // FIX: Mulai dari Folder ID yang ada di .env, bukan dari 'root'
    // Ini menghindari 403 karena drive.file scope tidak bisa akses root My Drive
    const rootFolderId = String(config.public.googleDriveFolderId ?? '')
    if (!rootFolderId) {
      throw new Error(
        'GOOGLE_DRIVE_FOLDER_ID belum diset di .env. ' +
        'Buka Google Drive → klik kanan folder root → "Get link" → copy ID dari URL.'
      )
    }
 
// ── Traversal sub-folder: periode → bulan → grade → nama tugas
const pathSegments = buildDrivePath(task) 
let parentId = rootFolderId // Mulai dari ID folder 'SISTEM DASHBOARD UPM' 

/**
 * LOGIKA BARU:
 * Kita looping SEMUA segment di pathSegments.
 * JANGAN pakai .slice(0, -1) supaya "Nama Tugas" tidak terbuang.
 * Gunakan .slice(1) jika buildDrivePath menyertakan nama root di index [0] 
 * agar tidak membuat folder root di dalam root.
 */
const foldersToCreate = pathSegments[0] === config.public.googleDriveFolderName || pathSegments[0] === 'UPM Mission Control' 
  ? pathSegments.slice(1) 
  : pathSegments

for (const segment of foldersToCreate) {
  parentId = await getOrCreateFolder(segment, parentId)
}
 
    // Upload file ke folder terakhir
    const meta = {
      name:    file.name,
      parents: [parentId],
    }
    const form = new FormData()
    form.append('metadata', new Blob([JSON.stringify(meta)], { type: 'application/json' }))
    form.append('file', file)
 
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100))
        }
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
          reject(new Error(`Upload gagal (${xhr.status}): ${xhr.responseText}`))
        }
      }

      xhr.onerror = () => reject(new Error('Koneksi terputus saat upload'))

      xhr.open(
        'POST',
        'https://www.googleapis.com/upload/drive/v3/files' +
        '?uploadType=multipart&fields=id,name,webViewLink'
      )
      xhr.setRequestHeader('Authorization', `Bearer ${driveToken.value}`)
      xhr.send(form)
    })
  }

  return {
    driveToken,
    driveConnected,
    connectDrive,
    captureTokenFromHash,
    restoreTokenFromStorage,
    uploadFile,
    getDrivePathString,
    buildDrivePath,
  }
}

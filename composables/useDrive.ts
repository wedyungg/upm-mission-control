// composables/useDrive.ts
import type { Task, DriveUploadResult } from '~/types'
import { useHijri } from './useHijri'

export const useDrive = () => {
  const config = useRuntimeConfig()
  const { HIJRI_MONTHS_ID, approxCurrentHijriYear } = useHijri()

  const driveToken       = useState<string | null>('drive_token', () => null)
  const tokenExpiresAt   = useState<number>('drive_token_expires_at', () => 0)
  const driveConnected   = useState<boolean>('drive_connected', () => false)
  const isRefreshing     = ref(false)

  const OAUTH_SCOPES = [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.metadata.readonly',
  ].join(' ')

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
   * Mendapatkan access token yang valid dan selalu segar dari server
   * Semua anggota tim dapat menggunakan token pusat ini tanpa perlu login Google sendiri.
   */
  const getValidToken = async (forceRefresh = false): Promise<string> => {
    const now = Date.now()
    if (!forceRefresh && driveToken.value && tokenExpiresAt.value > now + 60_000) {
      return driveToken.value
    }

    if (isRefreshing.value) {
      // Tunggu proses refresh yang sedang berjalan
      await new Promise(r => setTimeout(r, 800))
      if (driveToken.value && tokenExpiresAt.value > now + 60_000) {
        return driveToken.value
      }
    }

    isRefreshing.value = true
    try {
      const res: any = await $fetch('/api/drive-token')
      if (res?.ok && res?.access_token) {
        driveToken.value = res.access_token
        tokenExpiresAt.value = now + ((res.expires_in || 3600) * 1000)
        driveConnected.value = true
        return res.access_token
      }
      driveConnected.value = false
      throw new Error(res?.error || 'Google Drive pusat belum terhubung atau token kadaluarsa.')
    } finally {
      isRefreshing.value = false
    }
  }

  /**
   * Memeriksa status koneksi Google Drive secara riil ke server
   */
  const checkDriveStatus = async (): Promise<boolean> => {
    try {
      const token = await getValidToken()
      driveConnected.value = !!token
      return !!token
    } catch {
      driveConnected.value = false
      return false
    }
  }

  onMounted(() => {
    checkDriveStatus()
  })

  const apiFetch = async (url: string, options: RequestInit = {}) => {
    let token = await getValidToken()
    let res = await fetch(url, {
      ...options,
      headers: {
        Authorization:  `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
      },
    })

    // Jika token kadaluarsa di tengah jalan (401), force refresh sekali dan coba lagi
    if (res.status === 401) {
      token = await getValidToken(true)
      res = await fetch(url, {
        ...options,
        headers: {
          Authorization:  `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...(options.headers ?? {}),
        },
      })
    }

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Drive API ${res.status}: ${body}`)
    }
    return res.json()
  }

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

  /**
   * Membangun struktur folder di Google Drive berbasis kalender Hijriah
   * Contoh: "1448H — 1449H / Jumadil Ula / Grade C / Judul Tugas"
   */
  const buildDrivePath = (task: Task): string[] => {
    const hy     = task.hijri_year ?? approxCurrentHijriYear()
    const period = `${hy}H — ${hy + 1}H`
    const bulan  = HIJRI_MONTHS_ID[task.bulan ?? 0] ?? 'Lainnya'
    return [period, bulan, `Grade ${task.grade || 'C'}`, task.name]
  }

  const getDrivePathString = (task: Task): string => {
    const rootName = String(config.public.googleDriveFolderName ?? 'SISTEM DASHBOARD UPM')
    return [rootName, ...buildDrivePath(task)].join(' / ')
  }

  const uploadFile = async (file: File, task: Task, onProgress?: (pct: number) => void): Promise<DriveUploadResult> => {
    const token = await getValidToken()
    const rootFolderId = String(config.public.googleDriveFolderId ?? '')
    if (!rootFolderId) {
      throw new Error('ID Folder utama Google Drive (GOOGLE_DRIVE_FOLDER_ID) belum disetel di konfigurasi.')
    }

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
            fileId: r.id,
            fileName: file.name,
            webViewLink: `https://drive.google.com/file/d/${r.id}/view`,
            drivePath: getDrivePathString(task),
          })
        } else {
          reject(new Error(`Upload gagal (${xhr.status}): ${xhr.statusText || 'Gagal menyimpan file ke Drive'}`))
        }
      }
      xhr.onerror = () => reject(new Error('Koneksi terputus saat mengunggah ke Google Drive'))
      xhr.open('POST', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink')
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      xhr.send(form)
    })
  }

  return {
    driveToken,
    driveConnected,
    connectDrive,
    checkDriveStatus,
    getValidToken,
    uploadFile,
    getDrivePathString,
    buildDrivePath,
  }
}

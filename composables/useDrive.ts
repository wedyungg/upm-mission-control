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
  // Menggunakan ID 'ziyan' sebagai pemegang token utama
  const MASTER_USER_ID = 'ziyan' 

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
   * Memeriksa apakah akun MASTER (ziyan) sudah terhubung di tabel user_settings
   */
  const checkDriveStatus = async () => {
    try {
      const { data } = await supabase
        .from('user_settings')
        .select('drive_refresh_token')
        .eq('user_id', MASTER_USER_ID)
        .maybeSingle()

      driveConnected.value = !!(data && data.drive_refresh_token)
    } catch (err) {
      driveConnected.value = false
    }
  }

  onMounted(() => {
    checkDriveStatus()
  })

  const apiFetch = async (url: string, options: RequestInit = {}) => {
    if (!driveToken.value) throw new Error('Token akses tidak tersedia.')
    const res = await fetch(url, {
      ...options,
      headers: {
        Authorization:  `Bearer ${driveToken.value}`,
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
      },
    })
    if (res.status === 401) throw new Error('UNAUTHORIZED')
    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Drive API ${res.status}: ${body}`)
    }
    return res.json()
  }

  const findFolder = async (name: string, parentId: string): Promise<string | null> => {
    const q = [`name='${name.replace(/'/g, "\\")}'`, `mimeType='application/vnd.google-apps.folder'`, `'${parentId}' in parents`, `trashed=false`].join(' and ')
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

  const uploadFile = async (file: File, task: Task, onProgress?: (pct: number) => void): Promise<DriveUploadResult> => {
    if (!driveToken.value) throw new Error('Sesi Google Drive pusat belum aktif.')
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
            fileId: r.id,
            fileName: file.name,
            webViewLink: `https://drive.google.com/file/d/${r.id}/view`,
            drivePath: getDrivePathString(task),
          })
        } else {
          reject(new Error(`Upload gagal.`))
        }
      }
      xhr.onerror = () => reject(new Error('Koneksi terputus'))
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
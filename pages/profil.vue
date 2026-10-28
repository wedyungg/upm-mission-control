<template>
  <div class="px-4 md:px-8 py-4 md:py-6 max-w-6xl mx-auto">
    <div class="mb-5">
      <h1 class="text-xl md:text-2xl font-bold text-[var(--text-primary)] tracking-tight">Profil & Pengaturan</h1>
      <p class="text-xs text-[var(--text-secondary)] mt-0.5">Kelola akun, integrasi Google Drive, notifikasi WhatsApp, dan preferensi aplikasi</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

      <!-- Left Column: User Card + App Settings -->
      <div class="space-y-5">
        <!-- User card -->
        <div class="card">
          <div class="flex items-center gap-4 mb-4">
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-base font-bold flex-shrink-0 border border-[var(--border-md)]"
              :style="{ background: user?.bg, color: user?.color }">{{ user?.initials }}</div>
            <div class="flex-1 min-w-0">
              <p class="text-base font-bold text-[var(--text-primary)] truncate">{{ user?.name }}</p>
            </div>
          </div>
          <div class="p-3 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border)] flex items-center justify-between">
            <span class="text-xs text-[var(--text-muted)] font-medium">Akses Level</span>
            <span class="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-primary)]">
              <svg v-if="user?.access === 'read-only'" class="w-3.5 h-3.5 text-[var(--yellow)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <svg v-else-if="user?.access === 'limited'" class="w-3.5 h-3.5 text-[var(--accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <svg v-else class="w-3.5 h-3.5 text-[var(--green)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              {{ user?.access === 'read-only' ? 'Read Only — Asesor'
               : user?.access === 'limited'   ? 'Limited — Editor'
               :                                'Full Access' }}
            </span>
          </div>
        </div>

        <!-- App settings -->
        <div class="card">
          <p class="slabel">Pengaturan Aplikasi</p>
          <div v-for="s in SETTINGS" :key="s.key"
            class="flex items-center justify-between py-3.5 border-b border-[var(--border)] last:border-0">
            <div>
              <p class="text-sm font-medium text-[var(--text-primary)]">{{ s.label }}</p>
              <p class="text-xs text-[var(--text-muted)] mt-0.5">{{ s.sub }}</p>
            </div>
            <div class="toggle ml-3 flex-shrink-0" :class="{ on: settings[s.key] }"
              @click="settings[s.key] = !settings[s.key]"/>
          </div>
        </div>

        <!-- Logout -->
        <button class="w-full py-3.5 rounded-xl text-sm font-semibold border border-red-500/40 bg-red-500/10 hover:bg-red-500/15 text-[var(--red)] transition-all active:scale-[0.99]"
          @click="logout">
          Keluar dari Akun
        </button>
      </div>

      <!-- Right Column: Google Drive + Admin Controls -->
      <div class="space-y-5">
        <div class="card">
          <div class="flex items-center justify-between mb-3">
            <p class="slabel !mb-0">Integrasi Google Drive API</p>
            <div class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full flex-shrink-0" :class="driveConnected ? 'bg-[var(--green)]' : 'bg-[var(--text-muted)]'"/>
              <span class="text-xs font-semibold" :class="driveConnected ? 'text-[var(--green)]' : 'text-[var(--text-muted)]'">
                {{ driveConnected ? 'Terhubung' : 'Belum terhubung' }}
              </span>
            </div>
          </div>
          <div class="p-3.5 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border)] mb-3.5 space-y-2">
            <div class="flex items-center justify-between">
              <p class="text-xs text-[var(--text-muted)]">Client ID (.env)</p>
              <p class="text-xs font-mono font-medium text-[var(--text-secondary)] truncate max-w-[200px]">{{ clientIdMasked }}</p>
            </div>
            <div class="flex items-center justify-between">
              <p class="text-xs text-[var(--text-muted)]">Root Folder</p>
              <p class="text-xs font-mono font-medium text-[var(--text-secondary)]">{{ folderName }}</p>
            </div>
          </div>
          <button class="btn-primary" @click="connectDrive">
            {{ driveConnected ? 'Hubungkan Ulang Google Drive' : 'Hubungkan Google Drive' }}
          </button>
          <p class="text-xs text-[var(--text-muted)] text-center mt-2.5">
            Data token OAuth diamankan di database server.
          </p>
        </div>

        <template v-if="isZiyan">
          <div class="card">
            <p class="slabel">Periode Hijriyah</p>
            <div class="mb-3.5">
              <label class="fl">Tahun Hijriyah Aktif</label>
              <input v-model.number="hijriYear" type="number" class="fi font-mono" min="1440" max="1500"/>
            </div>
            <div class="p-3.5 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border)]">
              <p class="text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Rentang Periode Aktif</p>
              <p class="text-xs font-mono text-[var(--text-muted)] leading-relaxed">
                12 Syawal {{ hijriYear }}H (mulai {{ formatDate(period.startGregorian) }})<br>
                25 Sya'ban {{ hijriYear + 1 }}H (sampai {{ formatDate(period.endGregorian) }})
              </p>
            </div>
          </div>

          <div class="card">
            <p class="slabel">Notifikasi WhatsApp</p>
            <div class="p-3.5 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border)] mb-3.5 space-y-2">
              <div class="flex items-center justify-between">
                <p class="text-xs text-[var(--text-muted)]">Provider</p>
                <p class="text-xs font-semibold text-[var(--text-secondary)]">Bot WA UPM / Fonnte</p>
              </div>
              <div class="flex items-center justify-between">
                <p class="text-xs text-[var(--text-muted)]">Status Kredensial</p>
                <span class="inline-flex items-center gap-1 text-xs font-semibold text-[var(--green)]">
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  Aman di Server
                </span>
              </div>
            </div>
            <button class="btn-outline" @click="testWa">Kirim Pesan Uji WhatsApp</button>
          </div>
        </template>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore }  from '~/stores/auth'
import { useDrive }      from '~/composables/useDrive'
import { useWhatsApp }   from '~/composables/useWhatsApp'
import { useHijri }      from '~/composables/useHijri'

definePageMeta({ middleware: 'auth' })

const auth   = useAuthStore()
const drive  = useDrive()
const wa     = useWhatsApp()
const toast  = useToast()
const router = useRouter()
const config = useRuntimeConfig()
const { approxCurrentHijriYear, getHijriPeriod, formatDate } = useHijri()

const user = computed(() => auth.currentUser)

const isZiyan = computed(() => auth.currentUser?.id === 'ziyan' || auth.currentUser?.id === 'tester')

const driveConnected = computed(() => drive.driveConnected.value)
const clientIdMasked = computed(() => {
  const id = String(config.public.googleClientId ?? '')
  if (!id) return 'Belum diset'
  return id.substring(0, 12) + '...' + id.slice(-8)
})
const folderName = computed(() => config.public.googleDriveFolderName || 'SISTEM DASHBOARD UPM')

const hijriYear = ref(approxCurrentHijriYear())
onMounted(() => {
  hijriYear.value = parseInt(localStorage.getItem('upm_hijri_year') ?? '') || approxCurrentHijriYear()
})
watch(hijriYear, v => localStorage.setItem('upm_hijri_year', String(v)))
const period = computed(() => getHijriPeriod(hijriYear.value))

const SETTINGS = [
  { key: 'countdown'  as const, label: 'Countdown Real-time', sub: 'Timer hitung mundur di kartu tugas' },
  { key: 'autofolder' as const, label: 'Auto-folder Drive',   sub: 'Buat folder otomatis saat upload' },
  { key: 'wa_notif'   as const, label: 'Notifikasi WhatsApp', sub: 'Kirim update progress ke grup WA' },
]
const settings = reactive({ countdown: true, autofolder: true, wa_notif: true })
onMounted(() => {
  settings.countdown  = JSON.parse(localStorage.getItem('upm_countdown')  ?? 'true')
  settings.autofolder = JSON.parse(localStorage.getItem('upm_autofolder') ?? 'true')
  settings.wa_notif   = JSON.parse(localStorage.getItem('upm_wa_notif')   ?? 'true')
})
watch(() => settings.countdown,  v => localStorage.setItem('upm_countdown',  JSON.stringify(v)))
watch(() => settings.autofolder, v => localStorage.setItem('upm_autofolder', JSON.stringify(v)))
watch(() => settings.wa_notif,   v => localStorage.setItem('upm_wa_notif',   JSON.stringify(v)))

const connectDrive = () => { drive.connectDrive() }

const testWa = async () => {
  const fakeTask = {
    id: 'test', name: 'Test Notifikasi', kat: '-', grade: 'A' as const,
    status: 'planning' as const, type: 'tim' as const,
    deadline: new Date().toISOString(), file: null,
    bulan: new Date().getMonth(), hijri_year: approxCurrentHijriYear(),
  }
  const ok = await wa.notifyTaskCreated(fakeTask as any, user.value?.name ?? 'Ziyan')
  toast.add({
    title: ok ? 'Pesan WA terkirim ✓' : 'Gagal kirim WA — cek .env',
    color: ok ? 'green' : 'red',
  })
}

const logout = () => { auth.logout(); router.replace('/login') }
</script>

<style scoped>
.card {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: 16px; padding: 18px;
  overflow: hidden;
  box-shadow: var(--card-shadow);
}
.slabel { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 12px; display: block; }
.fl { font-size: 11px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; display: block; }
.fi { width: 100%; background: var(--bg-elevated); border: 1px solid var(--border-md); border-radius: 10px; padding: 11px 14px; color: var(--text-primary); font-size: 14px; font-family: inherit; outline: none; transition: border-color .2s; }
.fi:focus { border-color: var(--accent); }
.btn-primary { display: flex; align-items: center; justify-content: center; width: 100%; padding: 12px 16px; border-radius: 12px; border: none; font-size: 13px; font-weight: 600; background: var(--accent); color: #fff; cursor: pointer; font-family: inherit; transition: background .15s, transform .12s; }
.btn-primary:hover { background: var(--accent-hover); }
.btn-outline { display: flex; align-items: center; justify-content: center; width: 100%; padding: 12px 16px; border-radius: 12px; font-size: 13px; font-weight: 600; background: var(--bg-elevated); border: 1px solid var(--border-md); color: var(--text-primary); cursor: pointer; font-family: inherit; transition: border-color .15s, transform .12s; }
.btn-outline:hover { border-color: var(--accent); color: var(--accent); }
.btn-primary:active, .btn-outline:active { transform: scale(0.985); }
.toggle { width: 42px; height: 24px; border-radius: 12px; background: var(--bg-elevated); border: 1px solid var(--border-md); position: relative; cursor: pointer; transition: background .2s; }
.toggle.on { background: var(--accent); border-color: var(--accent); }
.toggle::after { content: ''; position: absolute; top: 3px; left: 3px; width: 16px; height: 16px; border-radius: 50%; background: white; transition: left .2s; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
.toggle.on::after { left: 21px; }
</style>

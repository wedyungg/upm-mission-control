<template>
  <div class="pb-8">
    <div class="px-4 pt-4 mb-3.5">
      <h1 class="text-xl font-bold text-[var(--text-primary)]">Profil & Pengaturan</h1>
    </div>

    <!-- User card -->
    <div class="card">
      <div class="flex items-center gap-3.5 mb-3.5">
        <div class="w-14 h-14 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0 border-2 border-[var(--border-md)]"
          :style="{ background: user?.bg, color: user?.color }">{{ user?.initials }}</div>
        <div>
          <p class="text-base font-bold text-[var(--text-primary)]">{{ user?.name }}</p>
          <p class="text-xs text-[var(--text-muted)] mt-0.5">{{ user?.roleLabel }}</p>
        </div>
      </div>
      <div class="p-2.5 bg-[var(--bg-elevated)] rounded-xl">
        <p class="text-[10px] text-[var(--text-muted)] mb-1">Akses Level</p>
        <p class="text-xs text-[var(--text-primary)]">
          {{ user?.access === 'read-only' ? '🔒 Read Only — Asesor'
           : user?.access === 'limited'   ? '🔸 Limited — Editor'
           :                                '✅ Full Access' }}
        </p>
      </div>
    </div>

    <!-- ══ GOOGLE DRIVE — hanya Ziyan ══ -->
    <template v-if="isZiyan">
      <div class="card">
        <p class="slabel">Google Drive API</p>
        <div class="flex items-center gap-2 mb-3">
          <span class="w-2 h-2 rounded-full flex-shrink-0" :class="driveConnected ? 'bg-[var(--green)]' : 'bg-[var(--text-muted)]'"/>
          <span class="text-xs font-semibold" :class="driveConnected ? 'text-[var(--green)]' : 'text-[var(--text-muted)]'">
            {{ driveConnected ? 'Terhubung ✓' : 'Belum terhubung' }}
          </span>
          <span v-if="driveConnected" class="ml-auto text-[10px] text-[var(--text-muted)]">Token aktif</span>
        </div>
        <!-- Drive info dari env — tidak bisa diedit UI (sudah di .env) -->
        <div class="p-3 bg-[var(--bg-elevated)] rounded-xl mb-3 space-y-1.5">
          <div class="flex items-center justify-between">
            <p class="text-[10px] text-[var(--text-muted)]">Client ID (dari .env)</p>
            <p class="text-[10px] font-semibold text-[var(--text-secondary)] truncate max-w-[160px]">{{ clientIdMasked }}</p>
          </div>
          <div class="flex items-center justify-between">
            <p class="text-[10px] text-[var(--text-muted)]">Root Folder</p>
            <p class="text-[10px] font-semibold text-[var(--text-secondary)]">{{ folderName }}</p>
          </div>
        </div>
        <button class="btn-primary" @click="connectDrive">
          {{ driveConnected ? 'HUBUNGKAN ULANG' : 'HUBUNGKAN GOOGLE DRIVE' }}
        </button>
        <p class="text-[10px] text-[var(--text-muted)] text-center mt-2">
          Google Client ID dikonfigurasi via <code class="text-[var(--blue)]">.env</code> di server
        </p>
      </div>

      <!-- Hijri config — hanya Ziyan -->
      <div class="card">
        <p class="slabel">Periode Hijriyah</p>
        <div class="mb-3">
          <label class="fl">Tahun Hijriyah Aktif</label>
          <input v-model.number="hijriYear" type="number" class="fi" min="1440" max="1500"/>
        </div>
        <div class="p-3 bg-[var(--bg-elevated)] rounded-xl">
          <p class="text-[10px] font-semibold text-[var(--text-secondary)] mb-2">Rentang Periode Aktif</p>
          <p class="text-xs text-[var(--text-muted)] leading-relaxed">
            12 Syawal {{ hijriYear }}H → {{ formatDate(period.startGregorian) }}<br>
            25 Sya'ban {{ hijriYear + 1 }}H → {{ formatDate(period.endGregorian) }}
          </p>
        </div>
      </div>

      <!-- WhatsApp Notif config -->
      <div class="card">
        <p class="slabel">Notifikasi WhatsApp</p>
        <div class="p-3 bg-[var(--bg-elevated)] rounded-xl mb-3">
          <div class="flex items-center justify-between mb-1">
            <p class="text-[10px] text-[var(--text-muted)]">Provider</p>
            <p class="text-[10px] font-semibold text-[var(--text-secondary)]">Fonnte API</p>
          </div>
          <div class="flex items-center justify-between">
            <p class="text-[10px] text-[var(--text-muted)]">Status Kredensial</p>
            <p class="text-[10px] font-semibold text-[var(--green)]">
              🔒 Aman di Server
            </p>
          </div>
        </div>
        <button class="btn-outline text-sm" @click="testWa">Kirim Pesan Test WA</button>
        <p class="text-[10px] text-[var(--text-muted)] text-center mt-2">
          Dikonfigurasi via <code class="text-[var(--blue)]">.env</code> (WA_TOKEN & WA_TARGET)
        </p>
      </div>
    </template>

    <!-- ══ Drive status saja untuk non-Ziyan ══ -->
    <div v-else class="card">
      <p class="slabel">Google Drive</p>
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full" :class="driveConnected ? 'bg-[var(--green)]' : 'bg-[var(--text-muted)]'"/>
        <span class="text-xs" :class="driveConnected ? 'text-[var(--green)] font-semibold' : 'text-[var(--text-muted)]'">
          {{ driveConnected ? 'Terhubung ✓' : 'Belum terhubung — hubungi Ziyan' }}
        </span>
      </div>
    </div>

    <!-- App settings (semua bisa akses) -->
    <div class="card">
      <p class="slabel">Pengaturan Aplikasi</p>
      <div v-for="s in SETTINGS" :key="s.key"
        class="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0">
        <div>
          <p class="text-sm text-[var(--text-primary)]">{{ s.label }}</p>
          <p class="text-[10px] text-[var(--text-muted)] mt-0.5">{{ s.sub }}</p>
        </div>
        <div class="toggle ml-3 flex-shrink-0" :class="{ on: settings[s.key] }"
          @click="settings[s.key] = !settings[s.key]"/>
      </div>
    </div>

    <!-- Logout -->
    <div class="px-4">
      <button class="w-full py-3.5 rounded-xl text-sm font-bold border-[1.5px] border-red-500 bg-red-500/10 text-red-400 transition-opacity active:opacity-70"
        @click="logout">KELUAR</button>
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

// Hanya Ziyan (id='ziyan') yang bisa kelola Drive + Hijri
const isZiyan = computed(() => auth.currentUser?.id === 'ziyan')

const driveConnected = computed(() => drive.driveConnected.value)
const clientIdMasked = computed(() => {
  const id = String(config.public.googleClientId ?? '')
  if (!id) return 'Belum diset'
  return id.substring(0, 12) + '...' + id.slice(-8)
})
const folderName = computed(() => config.public.googleDriveFolderName || 'SISTEM DASHBOARD UPM')

// Hijri
const hijriYear = ref(approxCurrentHijriYear())
onMounted(() => {
  hijriYear.value = parseInt(localStorage.getItem('upm_hijri_year') ?? '') || approxCurrentHijriYear()
})
watch(hijriYear, v => localStorage.setItem('upm_hijri_year', String(v)))
const period = computed(() => getHijriPeriod(hijriYear.value))

// App settings
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
  console.log('--- Tombol Test WA diklik ---')
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
  border-radius: 16px; padding: 16px;
  margin: 0 16px 12px; width: calc(100% - 32px); overflow: hidden;
}
.slabel { font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 12px; display: block; }
.fl { font-size: 11px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; display: block; }
.fi { width: 100%; background: var(--bg-elevated); border: 1.5px solid var(--border-md); border-radius: 10px; padding: 11px 14px; color: var(--text-primary); font-size: 14px; font-family: inherit; outline: none; transition: border-color .2s; }
.fi:focus { border-color: var(--blue); }
.btn-primary { display: flex; align-items: center; justify-content: center; width: 100%; padding: 13px; border-radius: 12px; border: none; font-size: 13px; font-weight: 700; background: var(--blue); color: #fff; cursor: pointer; font-family: inherit; transition: opacity .15s; }
.btn-outline { display: flex; align-items: center; justify-content: center; width: 100%; padding: 12px; border-radius: 12px; font-size: 13px; font-weight: 700; background: transparent; border: 1.5px solid var(--border-md); color: var(--text-secondary); cursor: pointer; font-family: inherit; transition: opacity .15s; }
.btn-primary:active, .btn-outline:active { opacity: .82; }
.toggle { width: 40px; height: 22px; border-radius: 11px; background: var(--bg-elevated); border: 1px solid var(--border-md); position: relative; cursor: pointer; transition: background .2s; }
.toggle.on { background: var(--green); }
.toggle::after { content: ''; position: absolute; top: 3px; left: 3px; width: 16px; height: 16px; border-radius: 50%; background: white; transition: left .2s; }
.toggle.on::after { left: 21px; }
</style>

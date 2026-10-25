<template>
  <!-- Full-screen shell — responsive Apple HIG login -->
  <div class="w-full min-h-dvh flex-1 bg-[var(--bg-base)] flex flex-col items-center justify-center relative overflow-y-auto px-5 py-10">

    <!-- Top-right Theme Toggle -->
    <div class="fixed top-4 right-4 sm:top-6 sm:right-6 z-20">
      <button
        class="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-md)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition-all shadow-sm"
        @click="theme.toggle()"
      >
        <svg v-if="theme.isDark" class="w-4 h-4 text-[var(--yellow)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
        <svg v-else class="w-4 h-4 text-[var(--accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
        <span>{{ theme.isDark ? 'Mode Terang' : 'Mode Gelap' }}</span>
      </button>
    </div>

    <!-- Brand -->
    <div class="text-center mb-8">
      <div class="w-14 h-14 rounded-2xl bg-[var(--accent-soft)] border border-[var(--border-md)] flex items-center justify-center mx-auto mb-3.5 shadow-sm">
        <img
          v-if="logoOk"
          src="/appLogo.png"
          alt="UPM Logo"
          class="h-8 w-auto object-contain"
          @error="logoOk = false"
        />
        <div v-else class="flex items-end justify-center gap-1">
          <span class="w-1.5 rounded-sm inline-block" style="height:12px;background:#ef4444" />
          <span class="w-1.5 rounded-sm inline-block" style="height:16px;background:#f59e0b" />
          <span class="w-1.5 rounded-sm inline-block" style="height:22px;background:#10b981" />
          <span class="w-1.5 rounded-sm inline-block" style="height:18px;background:#059669" />
        </div>
      </div>
      <h1 class="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">Dashboard Kinerja UPM</h1>
      <p class="text-xs text-[var(--text-muted)] mt-1">Sistem Manajemen Konten & Jadwal Publikasi</p>
    </div>

    <!-- ── STEP 1: Account grid ── -->
    <Transition name="fade" mode="out-in">
      <div v-if="!selectedId" class="w-full max-w-md md:max-w-2xl">
        <div class="flex items-center justify-between mb-3 px-1">
          <p class="text-xs font-semibold tracking-wider uppercase text-[var(--text-muted)]">
            Pilih Akun
          </p>
          <span class="text-xs text-[var(--text-muted)]">{{ USERS.length }} akun</span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-3.5">
          <button
            v-for="user in USERS"
            :key="user.id"
            class="account-card group"
            @click="selectAccount(user.id)"
          >
            <!-- Avatar circle -->
            <div
              class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-sm font-bold mb-2.5 mx-auto ring-2 ring-transparent group-hover:ring-[var(--accent)] transition-all duration-200"
              :style="{ background: user.bg, color: user.color }"
            >
              {{ user.initials }}
            </div>
            <!-- Name -->
            <p class="text-sm font-semibold text-[var(--text-primary)] leading-tight text-center line-clamp-1">
              {{ user.name }}
            </p>
            <!-- Role -->
            <p class="text-xs text-[var(--text-secondary)] text-center mt-1 leading-tight">
              {{ user.roleLabel }}
            </p>
            <!-- Read-only badge -->
            <span
              v-if="user.access === 'read-only'"
              class="mt-2 inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/12 text-[var(--yellow)] border border-amber-500/20"
            >Read Only</span>
          </button>
        </div>
      </div>

      <!-- ── STEP 2: Password form ── -->
      <div v-else class="w-full max-w-sm bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 sm:p-6 shadow-sm">

        <!-- Selected user recap -->
        <div class="flex items-center gap-3 mb-5 p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]">
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
            :style="{ background: selectedUser?.bg, color: selectedUser?.color }"
          >
            {{ selectedUser?.initials }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-[var(--text-primary)] truncate">{{ selectedUser?.name }}</p>
            <p class="text-xs text-[var(--text-muted)]">{{ selectedUser?.roleLabel }}</p>
          </div>
          <button
            class="text-xs text-[var(--accent)] hover:underline font-semibold flex-shrink-0 px-2 py-1"
            @click="reset"
          >Ganti</button>
        </div>

        <!-- Password input -->
        <label class="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Kata Sandi</label>
        <input
          ref="pwRef"
          v-model="password"
          type="password"
          class="pw-input"
          placeholder="Masukkan kata sandi..."
          autocomplete="current-password"
          @keydown.enter="submit"
        />

        <p v-if="errorMsg" class="text-xs text-[var(--red)] font-medium mb-3 px-0.5">{{ errorMsg }}</p>

        <button
          class="w-full py-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold rounded-xl tracking-wide transition-all shadow-sm active:scale-[0.99]"
          :class="{ 'opacity-60 cursor-not-allowed': loading }"
          :disabled="loading"
          @click="submit"
        >
          {{ loading ? 'Memverifikasi...' : 'Masuk' }}
        </button>

        <p class="text-center text-xs text-[var(--text-muted)] mt-4">
          Atau <span class="text-[var(--accent)] font-semibold cursor-pointer hover:underline" @click="reset">pilih akun lain</span>
        </p>
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
import { useAuthStore, USERS } from '~/stores/auth'
import { useThemeStore }       from '~/stores/theme'

definePageMeta({ layout: false })

const auth   = useAuthStore()
const theme  = useThemeStore()
const router = useRouter()

const logoOk     = ref(true)
const selectedId = ref<string | null>(null)
const password   = ref('')
const errorMsg   = ref('')
const loading    = ref(false)
const pwRef      = ref<HTMLInputElement | null>(null)

const selectedUser = computed(() => USERS.find(u => u.id === selectedId.value))

onMounted(() => {
  theme.restore()
  auth.restore()
  if (auth.isLoggedIn) router.replace('/')
})

const selectAccount = (id: string) => {
  selectedId.value = id
  password.value   = ''
  errorMsg.value   = ''
  nextTick(() => pwRef.value?.focus())
}

const reset = () => {
  selectedId.value = null
  password.value   = ''
  errorMsg.value   = ''
}

const submit = async () => {
  if (!selectedId.value) return
  loading.value  = true
  errorMsg.value = ''
  await new Promise(r => setTimeout(r, 280))
  const result = await auth.login(selectedId.value, password.value)
  loading.value = false
  if (result.success) {
    router.replace('/')
  } else {
    errorMsg.value = result.error ?? 'Kata sandi salah'
    password.value = ''
    pwRef.value?.focus()
  }
}
</script>

<style scoped>
.account-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 18px 12px 16px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  cursor: pointer;
  transition: border-color .18s ease, transform .15s ease, background .18s ease, box-shadow .18s ease;
  -webkit-tap-highlight-color: transparent;
  outline: none;
  box-shadow: var(--card-shadow);
}
.account-card:hover {
  border-color: var(--accent);
  background: var(--bg-surface);
  transform: translateY(-1px);
}
.account-card:active { transform: scale(0.97); }

.pw-input {
  width: 100%;
  padding: 12px 14px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-md);
  border-radius: 12px;
  color: var(--text-primary);
  font-size: 15px;
  font-family: inherit;
  margin-bottom: 14px;
  outline: none;
  transition: border-color .2s, box-shadow .2s;
  display: block;
}
.pw-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.fade-enter-active, .fade-leave-active { transition: opacity .18s ease, transform .18s ease; }
.fade-enter-from, .fade-leave-to       { opacity: 0; transform: translateY(6px); }
</style>

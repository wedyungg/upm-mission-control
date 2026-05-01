<template>
  <!-- Full-screen shell — same bg as app -->
  <div class="min-h-dvh bg-[var(--bg-base)] flex flex-col items-center justify-start overflow-y-auto px-6 pt-12 pb-10">

    <!-- Brand -->
    <div class="text-center mb-8">
      <img
        v-if="logoOk"
        src="/appLogo.png"
        alt="UPM Logo"
        class="h-10 w-auto mx-auto mb-3 object-contain"
        @error="logoOk = false"
      />
      <div v-else class="flex items-end justify-center gap-1 mb-3">
        <span class="w-1.5 rounded-sm inline-block" style="height:14px;background:#ef4444" />
        <span class="w-1.5 rounded-sm inline-block" style="height:18px;background:#f97316" />
        <span class="w-1.5 rounded-sm inline-block" style="height:24px;background:#3b82f6" />
        <span class="w-1.5 rounded-sm inline-block" style="height:20px;background:#22c55e" />
      </div>
      <p class="text-lg font-bold text-[var(--text-primary)] tracking-tight">Dashboard Kinerja UPM</p>
      <p class="text-xs text-[var(--text-muted)] mt-0.5 font-mono">UPM Mission Control v1.0</p>
    </div>

    <!-- ── STEP 1: Account grid (Netflix-style) ── -->
    <Transition name="fade">
      <div v-if="!selectedId" class="w-full max-w-sm">
        <p class="text-[10px] font-bold tracking-widest uppercase text-[var(--text-muted)] mb-3">
          Pilih Akun Anda
        </p>

        <!-- 2-column grid of square cards -->
        <div class="grid grid-cols-2 gap-3">
          <button
            v-for="user in USERS"
            :key="user.id"
            class="account-card group"
            @click="selectAccount(user.id)"
          >
            <!-- Avatar circle -->
            <div
              class="w-14 h-14 rounded-full flex items-center justify-center text-sm font-bold mb-2 mx-auto ring-2 ring-transparent group-hover:ring-[var(--blue)] transition-all duration-200"
              :style="{ background: user.bg, color: user.color }"
            >
              {{ user.initials }}
            </div>
            <!-- Name -->
            <p class="text-xs font-semibold text-[var(--text-primary)] leading-tight text-center line-clamp-2">
              {{ user.name }}
            </p>
            <!-- Role -->
            <p class="text-[10px] text-[var(--text-muted)] text-center mt-0.5 leading-tight">
              {{ user.roleLabel }}
            </p>
            <!-- Read-only badge -->
            <span
              v-if="user.access === 'read-only'"
              class="mt-1.5 inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500/15 text-red-400"
            >Read Only</span>
          </button>
        </div>
      </div>
    </Transition>

    <!-- ── STEP 2: Password form ── -->
    <Transition name="slide-up">
      <div v-if="selectedId" class="w-full max-w-sm">

        <!-- Selected user recap -->
        <div class="flex items-center gap-3 mb-6 p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-md)]">
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            :style="{ background: selectedUser?.bg, color: selectedUser?.color }"
          >
            {{ selectedUser?.initials }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-[var(--text-primary)] truncate">{{ selectedUser?.name }}</p>
            <p class="text-xs text-[var(--text-muted)]">{{ selectedUser?.roleLabel }}</p>
          </div>
          <button
            class="text-xs text-[var(--blue)] font-semibold flex-shrink-0"
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

        <p v-if="errorMsg" class="text-xs text-red-400 mb-3 px-0.5">{{ errorMsg }}</p>

        <button
          class="w-full py-3.5 bg-[var(--blue)] text-white text-sm font-bold rounded-xl tracking-wide transition-opacity"
          :class="{ 'opacity-60 cursor-not-allowed': loading }"
          :disabled="loading"
          @click="submit"
        >
          {{ loading ? 'Memverifikasi...' : 'MASUK' }}
        </button>

        <p class="text-center text-xs text-[var(--text-muted)] mt-4">
          Atau <span class="text-[var(--blue)] font-semibold cursor-pointer" @click="reset">pilih akun lain</span>
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
/* Square Netflix-style account card */
.account-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 10px 14px;
  background: var(--bg-surface);
  border: 1.5px solid var(--border);
  border-radius: 14px;
  cursor: pointer;
  transition: border-color .2s, transform .15s, background .2s;
  -webkit-tap-highlight-color: transparent;
  outline: none;
}
.account-card:hover  { border-color: var(--border-md); background: var(--bg-elevated); }
.account-card:active { transform: scale(0.96); }

/* Password input */
.pw-input {
  width: 100%;
  padding: 13px 16px;
  background: var(--bg-surface);
  border: 1.5px solid var(--border-md);
  border-radius: 10px;
  color: var(--text-primary);
  font-size: 15px;
  font-family: inherit;
  margin-bottom: 12px;
  outline: none;
  transition: border-color .2s;
  display: block;
}
.pw-input:focus { border-color: var(--blue); }

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }

.slide-up-enter-active, .slide-up-leave-active { transition: all .25s ease; }
.slide-up-enter-from { opacity: 0; transform: translateY(12px); }
.slide-up-leave-to   { opacity: 0; transform: translateY(-8px); }
</style>

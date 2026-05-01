<template>
  <div class="flex items-center justify-center min-h-screen bg-[var(--bg-base)]">
    <div class="card p-6 max-w-sm w-full text-center">
      <h2 class="text-lg font-bold text-[var(--text-primary)] mb-2">Menghubungkan Drive</h2>
      <p v-if="loading" class="text-sm text-[var(--text-muted)] animate-pulse">
        Mohon tunggu, sedang memverifikasi otorisasi...
      </p>
      <p v-else-if="error" class="text-sm text-red-500 font-medium">
        {{ error }}
      </p>
      <p v-else class="text-sm text-[var(--green)] font-medium">
        Berhasil! Mengalihkan kembali ke Profil...
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const auth = useAuthStore() // Menyesuaikan dengan store login milikmu

const loading = ref(true)
const error = ref('')

onMounted(async () => {
  const code = route.query.code

  if (!code) {
    error.value = 'Kode otorisasi dari Google tidak ditemukan.'
    loading.value = false
    return
  }

  try {
    // Kirim kode ke API server yang baru saja kita buat
    await $fetch('/api/drive-auth', {
      method: 'POST',
      body: {
        code: code,
        userId: auth.currentUser?.id,
        redirectUri: `${window.location.origin}/confirm-drive`
      }
    })
    
    loading.value = false
    
    // Alihkan pengguna kembali ke halaman profil setelah 1.5 detik
    setTimeout(() => {
      router.push('/profil')
    }, 1500)

  } catch (err: any) {
    error.value = err.statusMessage || 'Terjadi kesalahan sistem.'
    loading.value = false
  }
})
</script>
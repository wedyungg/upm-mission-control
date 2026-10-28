<template>
  <div class="flex flex-col items-center justify-center min-h-screen text-center px-6">
    <h1 class="text-2xl font-bold text-[var(--text-primary)] mb-2">Menghubungkan Drive Pusat</h1>
    
    <div v-if="loading" class="flex flex-col items-center">
      <div class="w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin mb-4"></div>
      <p class="text-sm text-[var(--text-muted)]">Sedang memproses otorisasi Google Drive pusat...</p>
    </div>

    <div v-else-if="error" class="text-red-500 max-w-md">
      <p class="font-bold mb-1">Terjadi kesalahan sistem.</p>
      <p class="text-xs mb-4">{{ error }}</p>
      <button @click="navigateTo('/profil')" class="px-5 py-2 bg-[var(--accent)] text-white rounded-xl font-bold text-sm">Kembali ke Profil</button>
    </div>

    <div v-else class="text-emerald-500 flex flex-col items-center">
      <div class="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-3">
        <svg class="w-6 h-6 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <p class="font-bold mb-1 text-[var(--text-primary)]">Google Drive Berhasil Terhubung!</p>
      <p class="text-xs text-[var(--text-muted)]">Token pusat tersimpan. Mengalihkan ke profil...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const drive = useDrive()
const toast = useToast()
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  const code = route.query.code as string
  if (!code) {
    error.value = 'Kode otorisasi tidak ditemukan.'
    loading.value = false
    return
  }

  try {
    // 1. Tukar 'code' dengan Token melalui API Server
    // Server otomatis menyimpan refresh_token ke database Supabase untuk user_id 'ziyan'
    const data: any = await $fetch('/api/drive-token', {
      method: 'POST',
      body: { 
        code, 
        redirect_uri: `${window.location.origin}/confirm-drive` 
      }
    })

    if (!data?.access_token) {
      throw new Error(data?.error_description || 'Gagal memperoleh access token dari Google')
    }

    // 2. Simpan access token ke state useDrive
    drive.driveToken.value = data.access_token
    drive.driveConnected.value = true

    // Beri jeda sejenak untuk feedback visual sukses
    setTimeout(() => {
      toast.add({ title: 'Google Drive pusat berhasil terhubung ✓', color: 'green' })
      navigateTo('/profil')
    }, 1200)

  } catch (err: any) {
    console.error('Error confirm-drive:', err)
    error.value = err.data?.statusMessage || err.message || 'Gagal menghubungkan Google Drive pusat.'
  } finally {
    loading.value = false
  }
})
</script>

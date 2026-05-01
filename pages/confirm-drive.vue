<template>
  <div class="flex flex-col items-center justify-center min-h-screen text-center px-6">
    <h1 class="text-2xl font-bold text-[var(--text-primary)] mb-2">Menghubungkan Drive Pusat</h1>
    
    <div v-if="loading" class="flex flex-col items-center">
      <div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p class="text-sm text-[var(--text-muted)]">Sedang memproses autentikasi pusat...</p>
    </div>

    <div v-else-if="error" class="text-red-500">
      <p class="font-bold mb-1">Terjadi kesalahan sistem.</p>
      <p class="text-xs">{{ error }}</p>
      <button @click="navigateTo('/profil')" class="mt-6 px-5 py-2 bg-blue-500 text-white rounded-xl font-bold text-sm">Kembali ke Profil</button>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const supabase = useSupabaseClient()
const drive = useDrive()
const loading = ref(true)
const error = ref('')

// Email pusat yang akan dipasangkan tokennya
const MASTER_EMAIL = 'upm@pim.sch.id'

onMounted(async () => {
  const code = route.query.code as string
  if (!code) {
    error.value = 'Kode otorisasi tidak ditemukan.'
    loading.value = false
    return
  }

  try {
    // 1. Tukar 'code' dengan Token melalui API Serverless (Vercel)
    const data = await $fetch('/api/drive-token', {
      method: 'POST',
      body: { 
        code, 
        redirect_uri: `${window.location.origin}/confirm-drive` 
      }
    })

    // 2. Simpan token ke baris data MASTER_EMAIL di tabel user_settings
const { error: dbError } = await supabase
      .from('user_settings')
      .upsert({
        user_id: MASTER_USER_ID, // Isine 'ziyan'
        drive_refresh_token: data.refresh_token,
        updated_at: new Date().toISOString()
      })
    // 3. Simpan access token ke state sementara
    drive.driveToken.value = data.access_token
    
    // Sukses, arahkan kembali ke profil
    setTimeout(() => {
      navigateTo('/profil')
    }, 1500)

  } catch (err: any) {
    console.error(err)
    error.value = err.message || 'Gagal menyimpan konfigurasi pusat.'
  } finally {
    loading.value = false
  }
})
</script>
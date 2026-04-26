<script setup lang="ts">
const user = useSupabaseUser()

// Watch kalau user sudah login, langsung lempar ke halaman utama
watch(user, () => {
  if (user.value) {
    return navigateTo('/')
  }
}, { immediate: true })
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-950">
    <div class="text-center">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-brand-blue mb-4" />
      <p class="text-slate-400 font-sans">Menyiapkan dashboard...</p>
    </div>
  </div>
</template>
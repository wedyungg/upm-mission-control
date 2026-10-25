<template>
  <div
    v-if="!drive.driveConnected.value || checking"
    class="flex items-center gap-2 px-4 py-2 text-xs text-[var(--text-secondary)]
           bg-[var(--bg-elevated)] border-b border-[var(--border)] flex-shrink-0"
  >
    <span
      class="w-2 h-2 rounded-full flex-shrink-0 transition-colors"
      :class="checking ? 'bg-amber-400 animate-pulse' : 'bg-red-400'"
    />
    <span class="flex-1">
      Google Drive:
      <span class="text-[var(--text-secondary)] font-medium">
        {{ statusText }}
      </span>
    </span>
    <!-- Connect button — only when not connected and not checking -->
    <button
      v-if="!drive.driveConnected.value && !checking"
      class="text-[var(--accent)] font-semibold text-xs flex-shrink-0 hover:underline cursor-pointer"
      @click="handleConnect"
    >Hubungkan</button>
  </div>
</template>

<script setup lang="ts">
import { useDrive } from '~/composables/useDrive'

const drive   = useDrive()
const checking = ref(false)

const statusText = computed(() => {
  if (checking.value)              return 'Menghubungkan...'
  if (drive.driveConnected.value)  return 'Terhubung'
  return 'Belum terhubung'
})

onMounted(() => {
  const saved = localStorage.getItem('upm_drive_token')
  if (saved && !drive.driveConnected.value) {
    drive.driveToken.value = saved
  }
})

const handleConnect = () => {
  checking.value = true
  setTimeout(() => { checking.value = false }, 5000)
  drive.connectDrive()
}
</script>

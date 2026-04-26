<template>
  <div class="flex items-center gap-2 px-4 py-1.5 text-[10px] text-[var(--text-muted)]
              bg-[var(--bg-elevated)] border-b border-[var(--border)] flex-shrink-0">
    <span
      class="w-2 h-2 rounded-full flex-shrink-0 transition-colors"
      :class="drive.driveConnected.value ? 'bg-[var(--green)]' : checking ? 'bg-yellow-400 animate-pulse' : 'bg-[var(--text-muted)]'"
    />
    <span class="flex-1">
      Google Drive:
      <span :class="drive.driveConnected.value ? 'text-[var(--green)] font-semibold' : ''">
        {{ statusText }}
      </span>
    </span>
    <!-- Connect button — only when not connected and not checking -->
    <button
      v-if="!drive.driveConnected.value && !checking"
      class="text-[var(--blue)] font-semibold text-[10px] flex-shrink-0"
      @click="handleConnect"
    >Hubungkan →</button>
  </div>
</template>

<script setup lang="ts">
import { useDrive } from '~/composables/useDrive'

const drive   = useDrive()
const checking = ref(false)

const statusText = computed(() => {
  if (checking.value)              return 'Menghubungkan...'
  if (drive.driveConnected.value)  return 'Terhubung ✓'
  return 'Belum terhubung'
})

// Auto-try to connect silently using token from localStorage if available
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

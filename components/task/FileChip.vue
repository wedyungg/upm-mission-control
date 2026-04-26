<template>
  <div class="flex items-center gap-2 p-2.5 rounded-xl mb-3"
    :class="inline ? 'bg-transparent' : 'bg-green-500/10 border border-green-500/20'">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e"
      stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="flex-shrink-0">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
    </svg>
    <span class="text-xs font-semibold text-green-400 truncate flex-1 min-w-0">{{ name }}</span>
    <a v-if="driveId" :href="`https://drive.google.com/file/d/${driveId}/view`"
      target="_blank" class="text-xs text-blue-400 flex-shrink-0">Buka →</a>
  </div>
</template>

<script setup lang="ts">
defineProps<{ name: string; driveId?: string; inline?: boolean }>()
</script>

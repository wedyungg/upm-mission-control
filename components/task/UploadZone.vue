<template>
  <label :for="forId" class="flex flex-col items-center py-7 px-4 border-2 border-dashed border-[var(--border-md)] rounded-2xl cursor-pointer transition-colors active:border-[var(--blue)] active:bg-blue-500/5">
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.5" stroke-linecap="round" class="text-[var(--text-muted)] mb-2">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
    </svg>
    <span class="text-sm text-[var(--text-secondary)] font-medium">{{ label }}</span>
    <span class="text-xs text-[var(--text-muted)] mt-0.5">{{ sub }}</span>
    <span class="text-xs text-[var(--text-muted)] mt-1.5 font-medium">
      Auto-folder Drive aktif
    </span>
  </label>
</template>

<script setup lang="ts">
defineProps<{ forId: string; label: string; sub: string }>()
</script>

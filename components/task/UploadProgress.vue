<template>
  <div class="mt-3 p-3 bg-[var(--bg-elevated)] rounded-xl">
    <div class="flex items-center justify-between mb-2">
      <span class="text-xs font-semibold text-[var(--text-primary)]">Mengunggah ke Drive...</span>
      <span class="text-xs font-bold text-[var(--blue)]">{{ pct }}%</span>
    </div>
    <div class="h-1.5 bg-[var(--border)] rounded-full overflow-hidden mb-2">
      <div class="h-full bg-[var(--blue)] rounded-full transition-[width] duration-200"
        :style="{ width: pct + '%' }" />
    </div>
    <p class="text-xs text-[var(--text-muted)] break-all leading-relaxed">{{ path }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{ pct: number; path: string }>()
</script>

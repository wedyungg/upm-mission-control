<template>
  <!-- Shows all completed steps with green done dots -->
  <div class="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] space-y-2.5 shadow-sm">
    <p class="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">Tahap Selesai</p>
    <div v-for="(step, i) in steps.slice(0, done)" :key="step.key" class="flex items-center gap-2.5">
      <div class="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-[var(--green)]">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"><path d="M20 6L9 17l-5-5"/></svg>
      </div>
      <p class="text-xs text-[var(--green)] font-semibold">{{ step.label }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  steps: { key: string; label: string }[]
  done: number
}>()
</script>

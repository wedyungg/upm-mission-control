<template>
  <!-- Shows all completed steps with green done dots -->
  <div class="mx-4 mb-2 space-y-1.5">
    <div v-for="(step, i) in steps.slice(0, done)" :key="step.key" class="flex items-center gap-2.5">
      <div class="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 bg-green-500">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"><path d="M20 6L9 17l-5-5"/></svg>
      </div>
      <p class="text-xs text-green-500 font-semibold">{{ step.label }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  steps: { key: string; label: string }[]
  done: number
}>()
</script>

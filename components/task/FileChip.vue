<template>
  <div
    class="flex items-center gap-2 p-2.5 rounded-xl mb-3"
    :class="inline ? 'bg-transparent' : 'bg-emerald-500/10 border border-emerald-500/20'"
  >
    <!-- File or Link Icon -->
    <svg
      v-if="isUrl"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#10b981"
      stroke-width="2.2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="flex-shrink-0"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
    <svg
      v-else
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#10b981"
      stroke-width="2.2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="flex-shrink-0"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>

    <!-- File name or Link title -->
    <span class="text-xs font-semibold text-[var(--accent)] truncate flex-1 min-w-0" :title="name">
      {{ displayLabel }}
    </span>

    <!-- Action Link Button -->
    <a
      v-if="targetUrl"
      :href="targetUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="text-xs font-semibold text-[var(--accent)] hover:underline flex-shrink-0 flex items-center gap-1 bg-[var(--bg-elevated)] px-2.5 py-1 rounded-lg border border-[var(--border-md)]"
    >
      <span>{{ isUrl ? 'Buka Link' : 'Buka File' }}</span>
      <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M7 7h10v10"/></svg>
    </a>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  name: string
  driveId?: string
  inline?: boolean
}>()

const isUrl = computed(() => {
  return typeof props.name === 'string' && /^https?:\/\//i.test(props.name.trim())
})

const displayLabel = computed(() => {
  if (!props.name) return 'Lampiran'
  if (isUrl.value) {
    try {
      const u = new URL(props.name.trim())
      return `Tautan: ${u.hostname}${u.pathname.length > 25 ? u.pathname.slice(0, 25) + '...' : u.pathname}`
    } catch {
      return props.name
    }
  }
  return props.name
})

const targetUrl = computed(() => {
  if (props.driveId) {
    return `https://drive.google.com/file/d/${props.driveId}/view`
  }
  if (isUrl.value) {
    return props.name.trim()
  }
  return null
})
</script>

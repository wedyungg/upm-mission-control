<template>
  <div class="task-card" @click="$emit('click', task)">
    <div class="flex items-start justify-between gap-2 mb-1.5">
      <div class="flex items-center gap-2 flex-1 min-w-0">
        <UiGradeBadge :grade="task.grade" />
        <p class="text-sm font-semibold text-[var(--text-primary)] leading-snug truncate flex-1 min-w-0">
          {{ task.name }}
        </p>
      </div>
      <div v-if="task.status !== 'selesai'" class="flex flex-col items-end flex-shrink-0 gap-0.5">
        <span class="text-xs text-[var(--text-muted)] leading-none">Deadline</span>
        <UiCountdownBadge :deadline="task.deadline" />
      </div>
    </div>

    <div class="flex flex-wrap gap-2 text-xs text-[var(--text-secondary)] mb-1.5 pl-8">
      <span>{{ task.durasi ?? task.kat }}</span>
      <span v-if="task.assignee" class="px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border)]">🧑‍💻 {{ task.assignee }}</span>
      <span v-if="task.publish_date" class="px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border)] text-blue-500">Tayang: {{ new Date(task.publish_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) }}</span>
    </div>

    <div class="flex items-center justify-between pl-8">
      <p class="text-xs text-[var(--text-muted)]">{{ STATUS_LABEL[task.status] }}</p>
      <span
        class="flex items-center gap-1 text-xs"
        :class="task.file ? 'text-[var(--text-muted)]' : 'text-[var(--text-muted)] opacity-40'"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
        </svg>
        {{ task.file ? 'File terlampir' : 'File belum tersedia' }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Task, TaskStatus } from '~/types'
// Import eksplisit untuk menghindari ambiguity Nuxt auto-import
import UiGradeBadge from '~/components/ui/GradeBadge.vue'

defineProps<{ task: Task }>()
defineEmits<{ click: [task: Task] }>()

const STATUS_LABEL: Record<TaskStatus, string> = {
  planning:   'Planning',
  produksi:   'Produksi & Edit',
  qc:         'Quality Control',
  selesai:    'Selesai',
}
</script>

<style scoped>
.task-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 14px 16px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: transform .12s;
  -webkit-tap-highlight-color: transparent;
}
.task-card:active { transform: scale(0.985); }
</style>

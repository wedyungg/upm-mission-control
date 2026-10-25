<template>
  <div class="task-card group" @click="$emit('click', task)">
    <div class="flex items-start justify-between gap-3 mb-2.5">
      <div class="flex items-center gap-2.5 flex-1 min-w-0">
        <UiGradeBadge :grade="task.grade" />
        <p class="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors leading-snug truncate flex-1 min-w-0">
          {{ task.name }}
        </p>
      </div>
      <div v-if="task.status !== 'selesai'" class="flex flex-col items-end flex-shrink-0 gap-1">
        <span class="text-xs text-[var(--text-muted)] leading-none">Deadline</span>
        <UiCountdownBadge :deadline="task.deadline" />
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)] mb-3 pl-8">
      <span class="truncate max-w-[200px] font-medium">{{ task.durasi ?? task.kat }}</span>
      <span v-if="task.assignee" class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] text-xs font-medium text-[var(--text-primary)]">
        <svg class="w-3.5 h-3.5 text-[var(--accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        {{ task.assignee }}
      </span>
      <span v-if="task.publish_date" class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] text-xs font-medium">
        Tayang: {{ new Date(task.publish_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) }}
      </span>
    </div>

    <div class="flex items-center justify-between pl-8 pt-2.5 border-t border-[var(--border)]/60">
      <span class="text-xs font-medium text-[var(--text-secondary)]">{{ STATUS_LABEL[task.status] }}</span>
      <span
        class="flex items-center gap-1.5 text-xs"
        :class="task.file ? 'text-[var(--accent)] font-medium' : 'text-[var(--text-muted)] opacity-60'"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
        </svg>
        {{ task.file ? 'File terlampir' : 'Belum ada file' }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Task, TaskStatus } from '~/types'
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
  padding: 15px 16px;
  cursor: pointer;
  transition: transform .14s ease, border-color .18s ease, box-shadow .18s ease;
  -webkit-tap-highlight-color: transparent;
  box-shadow: var(--card-shadow);
}
.task-card:hover {
  border-color: var(--border-md);
  transform: translateY(-1px);
}
.task-card:active { transform: scale(0.985); }
</style>

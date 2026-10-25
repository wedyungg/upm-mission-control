<template>
  <div class="px-4 md:px-8 py-5 md:py-7 max-w-7xl mx-auto">
    <!-- Header & Inline Legend on Desktop -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Kalender Tayang</h1>
          <p class="text-xs text-[var(--text-secondary)] mt-1">Jadwal tayang & target publikasi konten bulanan</p>
        </div>
        
        <button class="md:hidden bg-[var(--accent)] text-white w-9 h-9 rounded-xl flex items-center justify-center shadow-sm active:scale-95 transition-transform" @click="navigateTo('/buat')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
        </button>
      </div>

      <!-- Status Legend Pills -->
      <div class="flex flex-wrap items-center gap-3.5 px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] shadow-sm">
        <span class="text-xs font-semibold tracking-wider text-[var(--text-muted)] uppercase mr-1">Status:</span>
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-slate-500/30 border border-slate-500"></span>
          <span class="text-xs font-medium text-[var(--text-secondary)]">Planning</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500/30 border border-emerald-500"></span>
          <span class="text-xs font-medium text-[var(--text-secondary)]">Produksi</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-amber-500/30 border border-amber-500"></span>
          <span class="text-xs font-medium text-[var(--text-secondary)]">QC</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-teal-500/30 border border-teal-500"></span>
          <span class="text-xs font-medium text-[var(--text-secondary)]">Selesai</span>
        </div>
      </div>
    </div>

    <!-- Calendar View -->
    <MonthlyCalendar 
      :tasks="tasks.tasks" 
      @task-click="handleTaskClick" 
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useTasksStore } from '~/stores/tasks'
import type { Task } from '~/types'
import MonthlyCalendar from '~/components/calendar/MonthlyCalendar.vue'

definePageMeta({ middleware: 'auth' })

const tasks = useTasksStore()

onMounted(() => {
  if (!tasks.tasks.length) tasks.fetchTasks()
})

const handleTaskClick = (task: Task) => {
  navigateTo('/misi/' + task.id)
}
</script>

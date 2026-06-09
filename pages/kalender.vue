<template>
  <div class="pb-20">
    <!-- Header -->
    <div class="sticky top-0 z-10 bg-[var(--bg-base)]/90 backdrop-blur-md px-4 pt-4 pb-3 border-b border-[var(--border)] mb-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold text-[var(--text-primary)]">Monthly Planner</h1>
          <p class="text-xs text-[var(--text-muted)] mt-0.5">Jadwal Tayang Konten</p>
        </div>
        
        <button class="bg-[var(--blue)] text-white w-9 h-9 rounded-xl flex items-center justify-center shadow-sm active:scale-95 transition-transform" @click="navigateTo('/buat')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
        </button>
      </div>
    </div>

    <!-- Calendar View -->
    <div class="px-4">
      <MonthlyCalendar 
        :tasks="tasks.tasks" 
        @task-click="handleTaskClick" 
      />
      
      <!-- Keterangan Status -->
      <div class="mt-6 p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]">
        <p class="text-[10px] font-bold tracking-wider text-[var(--text-secondary)] uppercase mb-3">Legenda Status</p>
        <div class="grid grid-cols-2 gap-2">
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-gray-500/20 border border-gray-500"></span>
            <span class="text-xs font-semibold text-[var(--text-primary)]">Planning</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-blue-500/20 border border-blue-500"></span>
            <span class="text-xs font-semibold text-[var(--text-primary)]">Produksi</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500"></span>
            <span class="text-xs font-semibold text-[var(--text-primary)]">QC</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-green-500/20 border border-green-500"></span>
            <span class="text-xs font-semibold text-[var(--text-primary)]">Selesai</span>
          </div>
        </div>
      </div>
    </div>
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

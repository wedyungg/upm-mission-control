<template>
  <div class="card !p-0 overflow-hidden">
    <div class="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
      <div>
        <h2 class="text-base font-semibold text-[var(--text-primary)] tracking-tight">Target Mingguan</h2>
        <p class="text-xs text-[var(--text-secondary)] mt-0.5">{{ weekLabel }}</p>
      </div>
      <div class="bg-[var(--accent-soft)] text-[var(--accent)] px-3 py-1 rounded-lg flex items-center gap-1.5 border border-[var(--accent)]/20">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
        <span class="text-xs font-medium">2 tugas / pekan</span>
      </div>
    </div>
    
    <div class="p-5 space-y-4">
      <div v-for="c in crewStats" :key="c.name" class="flex items-center gap-3.5">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
             :style="{ background: c.bg, color: c.color }">
          {{ c.initials }}
        </div>
        
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between mb-1.5">
            <p class="text-sm font-medium text-[var(--text-primary)] truncate">{{ c.name }}</p>
            <span class="text-xs font-semibold" :class="c.count >= 2 ? 'text-[var(--green)]' : 'text-[var(--text-secondary)]'">
              {{ c.count }} / 2
            </span>
          </div>
          
          <!-- Progress bar -->
          <div class="flex gap-2 h-2">
            <div class="flex-1 rounded-full transition-colors duration-500"
                 :class="c.count >= 1 ? 'bg-[var(--accent)]' : 'bg-[var(--bg-elevated)] border border-[var(--border)]'"></div>
            <div class="flex-1 rounded-full transition-colors duration-500"
                 :class="c.count >= 2 ? 'bg-[var(--accent)]' : 'bg-[var(--bg-elevated)] border border-[var(--border)]'"></div>
          </div>
        </div>
        
        <div class="w-6 flex justify-end flex-shrink-0">
          <svg v-if="c.count >= 2" class="w-4 h-4 text-[var(--green)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M20 6L9 17l-5-5"/></svg>
        </div>
      </div>
      
      <p v-if="!crewStats.length" class="text-center text-xs text-[var(--text-muted)] py-3 italic">Belum ada target minggu ini</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTasksStore } from '~/stores/tasks'
import { USERS } from '~/stores/auth'

const tasksStore = useTasksStore()

const now = new Date()
const dayOfWeek = now.getDay() || 7
const startOfWeek = new Date(now)
startOfWeek.setDate(now.getDate() - dayOfWeek + 1)
startOfWeek.setHours(0, 0, 0, 0)

const endOfWeek = new Date(startOfWeek)
endOfWeek.setDate(startOfWeek.getDate() + 6)
endOfWeek.setHours(23, 59, 59, 999)

const weekLabel = computed(() => {
  const f = (d: Date) => d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
  return `${f(startOfWeek)} – ${f(endOfWeek)}`
})

const crewStats = computed(() => {
  const targetRoles = ['planner', 'production', 'editor_crew']
  const validUsers = USERS.filter(u => targetRoles.includes(u.role))
  
  return validUsers.map(u => {
    const tasksThisWeek = tasksStore.tasks.filter(t => {
      if (!t.assignee || t.assignee !== u.name) return false
      const dateTarget = t.publish_date ? new Date(t.publish_date) : new Date(t.deadline)
      return dateTarget >= startOfWeek && dateTarget <= endOfWeek
    })
    
    return {
      ...u,
      count: tasksThisWeek.length
    }
  }).sort((a, b) => b.count - a.count)
})
</script>

<style scoped>
.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  box-shadow: var(--card-shadow);
}
</style>

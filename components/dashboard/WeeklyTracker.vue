<template>
  <div class="card !p-0 overflow-hidden mb-3">
    <div class="px-4 pt-4 pb-2 border-b border-[var(--border)] flex items-center justify-between">
      <div>
        <h2 class="text-base font-bold text-[var(--text-primary)]">Target Mingguan</h2>
        <p class="text-[10px] text-[var(--text-muted)] mt-0.5">{{ weekLabel }}</p>
      </div>
      <div class="bg-[var(--blue)]/10 text-[var(--blue)] px-2.5 py-1 rounded-lg flex items-center gap-1.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        <span class="text-xs font-bold">2/pekan</span>
      </div>
    </div>
    
    <div class="p-4 space-y-3">
      <div v-for="c in crewStats" :key="c.name" class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
             :style="{ background: c.bg, color: c.color }">
          {{ c.initials }}
        </div>
        
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between mb-1.5">
            <p class="text-sm font-semibold text-[var(--text-primary)] truncate">{{ c.name }}</p>
            <span class="text-xs font-bold" :class="c.count >= 2 ? 'text-green-500' : 'text-[var(--text-secondary)]'">
              {{ c.count }} / 2
            </span>
          </div>
          
          <!-- Progress bar -->
          <div class="flex gap-1 h-2">
            <div class="flex-1 rounded-full transition-colors duration-500"
                 :class="c.count >= 1 ? 'bg-green-500' : 'bg-[var(--bg-elevated)] border border-[var(--border)]'"></div>
            <div class="flex-1 rounded-full transition-colors duration-500"
                 :class="c.count >= 2 ? 'bg-green-500' : 'bg-[var(--bg-elevated)] border border-[var(--border)]'"></div>
          </div>
        </div>
        
        <div class="w-6 flex justify-end">
          <svg v-if="c.count >= 2" class="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M20 6L9 17l-5-5"/></svg>
        </div>
      </div>
      
      <p v-if="!crewStats.length" class="text-center text-xs text-[var(--text-muted)] py-2 italic">Belum ada target minggu ini</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTasksStore } from '~/stores/tasks'
import { USERS } from '~/stores/auth'

const tasksStore = useTasksStore()

// Dapatkan tanggal awal (Senin) dan akhir (Minggu) minggu ini
const now = new Date()
const dayOfWeek = now.getDay() || 7 // 1 = Senin, ..., 7 = Minggu
const startOfWeek = new Date(now)
startOfWeek.setDate(now.getDate() - dayOfWeek + 1)
startOfWeek.setHours(0, 0, 0, 0)

const endOfWeek = new Date(startOfWeek)
endOfWeek.setDate(startOfWeek.getDate() + 6)
endOfWeek.setHours(23, 59, 59, 999)

const weekLabel = computed(() => {
  const f = (d: Date) => d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
  return `${f(startOfWeek)} - ${f(endOfWeek)}`
})

const crewStats = computed(() => {
  // Hanya ambil user yang merupakan crew konten (punya role tertentu)
  const targetRoles = ['planner', 'production', 'editor_crew']
  const validUsers = USERS.filter(u => targetRoles.includes(u.role))
  
  return validUsers.map(u => {
    // Cari tugas yang rilis minggu ini dan di-assign ke user ini
    const tasksThisWeek = tasksStore.tasks.filter(t => {
      if (!t.assignee || t.assignee !== u.name) return false
      
      // Prioritaskan publish_date, fallback ke deadline
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
}
</style>

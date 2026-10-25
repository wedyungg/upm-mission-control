<template>
  <div class="calendar-container bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-sm">
    <!-- Header: Month / Year Navigation -->
    <div class="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
      <div class="flex items-baseline gap-3">
        <span class="text-lg md:text-xl font-bold text-[var(--text-primary)] tracking-tight">
          {{ monthNames[currentDate.getMonth()] }} {{ currentDate.getFullYear() }}
        </span>
        <button class="text-xs font-semibold text-[var(--accent)] hover:underline cursor-pointer" @click="goToToday">
          Hari Ini
        </button>
      </div>
      <div class="flex gap-2">
        <button class="nav-btn" aria-label="Bulan sebelumnya" @click="prevMonth">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <button class="nav-btn" aria-label="Bulan berikutnya" @click="nextMonth">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>
    </div>

    <!-- Days Header -->
    <div class="grid grid-cols-7 border-b border-[var(--border)] bg-[var(--bg-elevated)]">
      <div v-for="(day, i) in dayNames" :key="day" class="py-2.5 text-center text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
        <span :class="{ 'text-[var(--red)]': i === 0 }">{{ day }}</span>
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="grid grid-cols-7 bg-[var(--border)] gap-px">
      <div 
        v-for="(dateObj, i) in calendarGrid" 
        :key="i"
        class="day-cell relative bg-[var(--bg-card)] min-h-[92px] md:min-h-[125px] p-2 transition-colors"
        :class="{
          'opacity-45 bg-[var(--bg-surface)]': !dateObj.isCurrentMonth,
          'active-day': dateObj.isToday
        }"
        @click="$emit('date-click', dateObj.date)"
      >
        <div class="flex justify-between items-start mb-1.5">
          <span 
            class="text-xs font-mono font-semibold w-6 h-6 flex items-center justify-center rounded-full"
            :class="[
              dateObj.isToday ? 'bg-[var(--accent)] text-white shadow-sm' : 'text-[var(--text-primary)]',
              dateObj.date.getDay() === 0 && !dateObj.isToday ? 'text-[var(--red)]' : ''
            ]"
          >
            {{ dateObj.date.getDate() }}
          </span>
          <span v-if="dateObj.tasks.length" class="hidden md:inline-block text-xs font-mono text-[var(--text-muted)]">
            {{ dateObj.tasks.length }} item
          </span>
        </div>
        
        <!-- Tasks for this day -->
        <div class="space-y-1">
          <div 
            v-for="task in dateObj.tasks" 
            :key="task.id"
            class="task-chip truncate cursor-pointer"
            :class="getTaskColorClass(task.status)"
            @click.stop="$emit('task-click', task)"
          >
            <span class="mr-1.5 px-1 py-0.2 rounded text-xs font-mono font-bold bg-black/10 dark:bg-white/10">{{ task.grade }}</span>
            <span class="truncate">{{ task.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Task, TaskStatus } from '~/types'

const props = defineProps<{
  tasks: Task[]
}>()

defineEmits(['date-click', 'task-click'])

const currentDate = ref(new Date())

const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]
const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

const goToToday = () => {
  currentDate.value = new Date()
}

const prevMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

const calendarGrid = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()
  
  const grid = []
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthLastDay - i)
    grid.push(createDayObj(d, false, today))
  }
  
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i)
    grid.push(createDayObj(d, true, today))
  }
  
  const remainingCells = 42 - grid.length
  for (let i = 1; i <= remainingCells; i++) {
    const d = new Date(year, month + 1, i)
    grid.push(createDayObj(d, false, today))
  }
  
  return grid
})

const createDayObj = (date: Date, isCurrentMonth: boolean, today: Date) => {
  const isToday = date.getTime() === today.getTime()
  
  const dayTasks = props.tasks.filter(t => {
    if (!t.publish_date) return false
    const d = new Date(t.publish_date)
    return d.getFullYear() === date.getFullYear() && 
           d.getMonth() === date.getMonth() && 
           d.getDate() === date.getDate()
  })
  
  return {
    date,
    isCurrentMonth,
    isToday,
    tasks: dayTasks
  }
}

const getTaskColorClass = (status: TaskStatus) => {
  switch (status) {
    case 'selesai': return 'bg-teal-500/15 text-[var(--green)] border border-teal-500/25'
    case 'qc': return 'bg-amber-500/15 text-[var(--yellow)] border border-amber-500/25'
    case 'produksi': return 'bg-emerald-500/15 text-[var(--accent)] border border-emerald-500/25'
    case 'planning': return 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-md)]'
    default: return 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
  }
}
</script>

<style scoped>
.nav-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: var(--bg-elevated);
  color: var(--text-primary);
  border: 1px solid var(--border);
  transition: all 0.15s;
  cursor: pointer;
}
.nav-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}
.nav-btn:active {
  transform: scale(0.94);
}

.day-cell {
  cursor: pointer;
}
.day-cell:hover {
  background: var(--bg-surface);
}
.active-day {
  background: color-mix(in srgb, var(--accent) 6%, var(--bg-card));
}

.task-chip {
  font-size: 11px;
  padding: 3px 6px;
  border-radius: 6px;
  font-weight: 500;
  display: flex;
  align-items: center;
  transition: transform 0.12s;
}
.task-chip:hover {
  transform: translateX(1px);
}
.task-chip:active {
  opacity: 0.75;
}
</style>

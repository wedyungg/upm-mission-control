<template>
  <div class="calendar-container bg-[var(--bg-card)] rounded-3xl border border-[var(--border)] overflow-hidden">
    <!-- Header: Month / Year Navigation -->
    <div class="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
      <div class="flex flex-col">
        <span class="text-xl font-bold text-[var(--text-primary)]">
          {{ monthNames[currentDate.getMonth()] }} {{ currentDate.getFullYear() }}
        </span>
        <span class="text-xs font-semibold text-blue-500 mt-0.5 cursor-pointer" @click="goToToday">
          Bulan Ini
        </span>
      </div>
      <div class="flex gap-2">
        <button class="nav-btn" @click="prevMonth">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <button class="nav-btn" @click="nextMonth">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>
    </div>

    <!-- Days Header -->
    <div class="grid grid-cols-7 border-b border-[var(--border)] bg-[var(--bg-elevated)]">
      <div v-for="(day, i) in dayNames" :key="day" class="py-2 text-center text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
        <span :class="{ 'text-red-400': i === 0 }">{{ day }}</span>
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="grid grid-cols-7 bg-[var(--border)] gap-px">
      <div 
        v-for="(dateObj, i) in calendarGrid" 
        :key="i"
        class="day-cell relative bg-[var(--bg-card)] min-h-[90px] p-1.5 transition-colors"
        :class="{
          'opacity-50 bg-[var(--bg-surface)]': !dateObj.isCurrentMonth,
          'active-day': dateObj.isToday
        }"
        @click="$emit('date-click', dateObj.date)"
      >
        <div class="flex justify-between items-start mb-1">
          <span 
            class="text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full"
            :class="[
              dateObj.isToday ? 'bg-blue-500 text-white' : 'text-[var(--text-primary)]',
              dateObj.date.getDay() === 0 && !dateObj.isToday ? 'text-red-400' : ''
            ]"
          >
            {{ dateObj.date.getDate() }}
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
            <span class="mr-1 opacity-70">{{ getGradeEmoji(task.grade) }}</span>
            {{ task.name }}
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
  const startingDayOfWeek = firstDay.getDay() // 0 = Minggu
  
  const grid = []
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Previous month padding
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthLastDay - i)
    grid.push(createDayObj(d, false, today))
  }
  
  // Current month
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i)
    grid.push(createDayObj(d, true, today))
  }
  
  // Next month padding
  const remainingCells = 42 - grid.length // Always 6 rows
  for (let i = 1; i <= remainingCells; i++) {
    const d = new Date(year, month + 1, i)
    grid.push(createDayObj(d, false, today))
  }
  
  return grid
})

const createDayObj = (date: Date, isCurrentMonth: boolean, today: Date) => {
  const isToday = date.getTime() === today.getTime()
  
  // Cari task yang publish_date-nya jatuh pada hari ini
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
    case 'selesai': return 'bg-green-500/15 text-green-600 border border-green-500/20'
    case 'qc': return 'bg-yellow-500/15 text-yellow-600 border border-yellow-500/20'
    case 'produksi': return 'bg-blue-500/15 text-blue-600 border border-blue-500/20'
    case 'planning': return 'bg-gray-500/15 text-gray-500 border border-gray-500/20'
    default: return 'bg-gray-500/10 text-gray-500'
  }
}

const getGradeEmoji = (grade: string) => {
  switch (grade) {
    case 'S': return '🔥'
    case 'A': return '⭐'
    case 'B': return '👍'
    case 'C': return '✅'
    default: return '📄'
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
  border-radius: 12px;
  background: var(--bg-elevated);
  color: var(--text-primary);
  border: 1px solid var(--border);
  transition: all 0.2s;
  cursor: pointer;
}
.nav-btn:active {
  transform: scale(0.92);
  background: var(--bg-surface);
}

.day-cell {
  cursor: pointer;
}
.day-cell:active {
  background: var(--bg-elevated) !important;
}
.active-day {
  background: color-mix(in srgb, var(--blue) 5%, var(--bg-card));
}

.task-chip {
  font-size: 10px;
  padding: 3px 5px;
  border-radius: 6px;
  font-weight: 600;
  display: flex;
  align-items: center;
}
.task-chip:active {
  opacity: 0.7;
}
</style>

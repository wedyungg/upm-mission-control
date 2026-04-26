<template>
  <div class="pb-2">
    <div class="px-4 pt-4 mb-3.5">
      <h1 class="text-xl font-bold text-[var(--text-primary)] mb-2.5">Semua Tugas</h1>
      <!-- Type filter -->
      <div class="flex gap-1.5 mb-2 overflow-x-auto scrollbar-none">
        <button v-for="t in TYPE_TABS" :key="t.v"
          class="flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold border-[1.5px] outline-none transition-all"
          :class="typeF === t.v ? 'bg-[var(--blue)] border-[var(--blue)] text-white' : 'bg-transparent border-[var(--border-md)] text-[var(--text-secondary)]'"
          @click="typeF = t.v">{{ t.l }}</button>
      </div>
      <!-- Status filter -->
      <div class="flex gap-1.5 overflow-x-auto scrollbar-none">
        <button v-for="s in STATUS_TABS" :key="s.v"
          class="flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold border-[1.5px] outline-none transition-all"
          :class="statusF === s.v ? 'bg-[var(--blue)] border-[var(--blue)] text-white' : 'bg-transparent border-[var(--border-md)] text-[var(--text-secondary)]'"
          @click="statusF = s.v">{{ s.l }}</button>
      </div>
    </div>
    <div class="px-4">
      <TaskCard v-for="t in filtered" :key="t.id" :task="t" @click="x => navigateTo('/misi/' + x.id)" />
      <p v-if="!filtered.length" class="text-center py-8 text-sm italic text-[var(--text-muted)]">
        Tidak ada tugas yang cocok
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTasksStore } from '~/stores/tasks'
definePageMeta({ middleware: 'auth' })
const tasks = useTasksStore()
onMounted(() => { if (!tasks.tasks.length) tasks.fetchTasks() })

const TYPE_TABS   = [{ v:'semua',l:'Semua' },{ v:'tim',l:'Tim' },{ v:'admin',l:'Admin' }]
const STATUS_TABS = [
  { v:'semua',l:'Semua' },{ v:'planning',l:'Planning' },
  { v:'produksi',l:'Produksi' },{ v:'editing',l:'Editing' },{ v:'selesai',l:'Selesai' },
]
const typeF   = ref('semua')
const statusF = ref('semua')
const filtered = computed(() => {
  let l = [...tasks.tasks]
  if (typeF.value   !== 'semua') l = l.filter(t => t.type === typeF.value)
  if (statusF.value !== 'semua') l = l.filter(t => t.status === statusF.value)
  return l
})
const route = useRoute()
const activeFilter = ref('semua')
onMounted(() => {
  // Jika ada kiriman status dari Dashboard (index.vue), pasang ke filter
  if (route.query.status) {
    activeFilter.value = String(route.query.status)
  }
})
</script>
<style scoped>
.scrollbar-none { scrollbar-width:none; }
.scrollbar-none::-webkit-scrollbar { display:none; }
</style>

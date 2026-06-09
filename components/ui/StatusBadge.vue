<template>
  <span class="status-badge" :class="status">{{ LABELS[status] ?? status }}</span>
</template>
<script setup lang="ts">
import type { TaskStatus } from '~/types'
defineProps<{ status: TaskStatus }>()
const LABELS: Record<TaskStatus, string> = {
  planning:'Planning', produksi:'Produksi', qc:'QC', selesai:'Selesai',
}
</script>
<style scoped>
.status-badge {
  font-size: 12px; padding: 2px 7px; border-radius: 5px; font-weight: 600; letter-spacing: .3px; white-space: nowrap;
}
.planning   { background: rgba(168,85,247,.15);  color: var(--purple); }
.produksi   { background: rgba(249,115,22,.15);  color: var(--orange); }
.qc         { background: rgba(59,130,246,.15);  color: var(--blue); }
.selesai    { background: rgba(34,197,94,.15);   color: var(--green); }
</style>

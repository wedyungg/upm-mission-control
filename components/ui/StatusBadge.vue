<template>
  <span class="status-badge" :class="status">{{ LABELS[status] ?? status }}</span>
</template>
<script setup lang="ts">
import type { TaskStatus } from '~/types'
defineProps<{ status: TaskStatus }>()
const LABELS: Record<TaskStatus, string> = {
  planning:'Planning', qc1:'QC 1', produksi:'Produksi',
  editing:'Editing', qc2:'QC 2', distribusi:'Distribusi', selesai:'Selesai',
}
</script>
<style scoped>
.status-badge {
  font-size: 12px; padding: 2px 7px; border-radius: 5px; font-weight: 600; letter-spacing: .3px; white-space: nowrap;
}
.planning   { background: rgba(168,85,247,.15);  color: var(--purple); }
.qc1        { background: rgba(59,130,246,.15);  color: var(--blue); }
.produksi   { background: rgba(249,115,22,.15);  color: var(--orange); }
.editing    { background: rgba(234,179,8,.15);   color: var(--yellow); }
.qc2        { background: rgba(20,184,166,.15);  color: var(--teal); }
.distribusi { background: rgba(34,197,94,.15);   color: var(--green); }
.selesai    { background: rgba(34,197,94,.15);   color: var(--green); }
</style>

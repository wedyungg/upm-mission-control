<template>
  <div class="progja-card" :class="`progja-${grade}`">
    <!-- Grade badge gradient -->
    <UiGradeBadge :grade="grade" />

    <!-- Jumlah sisa — angka besar -->
    <p class="text-2xl text-[var(--text-primary)] mt-2 mb-1 leading-tight">
  <span class="font-bold">{{ sisa }}</span>
  <span class="font-normal ml-1.5">Task</span>
</p>
    <!-- Rincian nama program -->
    <p class="text-xs text-[var(--text-muted)] leading-relaxed line-clamp-4">
      {{ rincianText }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { TaskGrade } from '~/types'
import UiGradeBadge from '~/components/ui/GradeBadge.vue'

const props = defineProps<{
  grade:    TaskGrade
  sisa:     number
  target:   number
  done:     number
  rincian:  { nama: string; sisa: number }[]
}>()

const rincianText = computed(() =>
  props.rincian
    .filter(r => r.sisa > 0)
    .map(r => r.nama)
    .join(' – ') || 'Semua target tercapai'
)
</script>

<style scoped>
.progja-card {
  border-radius: 14px;
  padding: 14px;
  border: 1.5px solid;
  background: var(--bg-elevated);
}
/* Warna border per grade — sesuai desain, bukan traffic-light */
.progja-S { border-color: #f97316; }
.progja-A { border-color: #22c55e; }
.progja-B { border-color: #a855f7; }
.progja-C { border-color: #06b6d4; }
</style>

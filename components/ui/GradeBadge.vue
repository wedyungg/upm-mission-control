<template>
  <span class="gb" :class="`gb-${grade}`">{{ grade }}</span>
</template>

<script setup lang="ts">
import type { TaskGrade } from '~/types'
defineProps<{ grade: TaskGrade }>()
</script>

<style scoped>
/* Menggunakan class prefix 'gb-' yang unik untuk menghindari konflik auto-import */
.gb {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 35px;
  height: 20px;
  border-radius: 99px;
  font-size: 0.75rem; /* text-xs Tailwind */
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
  letter-spacing: 0;
}
/* Gradient sesuai desain */
.gb-S { background: linear-gradient(135deg, #ef4444 0%, #f97316 100%); }
.gb-A { background: linear-gradient(135deg, #22c55e 0%, #14b8a6 100%); }
.gb-B { background: linear-gradient(135deg, #3b82f6 0%, #a855f7 100%); }
.gb-C { background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); }
</style>

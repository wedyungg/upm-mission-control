<template>
  <span class="countdown" :class="cd.cls">{{ cd.text }}</span>
</template>
<script setup lang="ts">
import { useCountdown } from '~/composables/useCountdown'
const props = defineProps<{ deadline: string }>()
const { useReactiveCountdown } = useCountdown()
const deadlineRef = toRef(props, 'deadline')
const { countdown: cd } = useReactiveCountdown(deadlineRef)
</script>
<style scoped>
.countdown {
  font-size: 10px; font-family: var(--font-mono); font-weight: 500;
  padding: 2px 7px; border-radius: 5px; white-space: nowrap;
}
.ok     { background: rgba(35, 201, 96, 0.15);  color: var(--green); }
.soon   { background: rgba(234,179,8,.15);  color: var(--yellow); }
.danger { background: rgba(249,115,22,.15); color: var(--orange); }
.late   { background: rgba(239,68,68,.15);  color: var(--red); font-weight: 700; }
</style>

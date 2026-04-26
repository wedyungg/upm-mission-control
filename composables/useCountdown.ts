// composables/useCountdown.ts
export interface CountdownResult {
  text: string
  cls: 'ok' | 'soon' | 'danger' | 'late'
  isLate: boolean
}

export const useCountdown = () => {
  const getCountdown = (deadline: string | null | undefined): CountdownResult => {
  // Jika deadline tidak ada, tampilkan status menunggu
  if (!deadline) {
    return { text: '-- : -- : --', cls: 'ok', isLate: false };
  }

  const diff = new Date(deadline).getTime() - Date.now();
  
  if (diff < 0) {
    return { text: 'MELEWATI JADWAL', cls: 'late', isLate: true };
  }
  
  // Kalkulasi jam, menit, detik
  const hh = Math.floor(diff / 3_600_000);
  const mm = Math.floor((diff % 3_600_000) / 60_000);
  const ss = Math.floor((diff % 60_000) / 1_000);
  
  const text = [hh, mm, ss].map(n => String(n).padStart(2, '0')).join(':');
  const cls = hh < 1 ? 'danger' : hh < 6 ? 'soon' : 'ok';
  
  return { text, cls, isLate: false };
};

  /** Reactive countdown that updates every second */
  const useReactiveCountdown = (deadlineRef: Ref<string>) => {
    const result = ref<CountdownResult>(getCountdown(deadlineRef.value))
    let timer: ReturnType<typeof setInterval> | null = null

    const start = () => {
      result.value = getCountdown(deadlineRef.value)
      timer = setInterval(() => {
        result.value = getCountdown(deadlineRef.value)
      }, 1000)
    }

    const stop = () => {
      if (timer) { clearInterval(timer); timer = null }
    }

    onMounted(start)
    onUnmounted(stop)
    watch(deadlineRef, () => {
      stop()
      start()
    })

    return { countdown: result, stop }
  }

  return { getCountdown, useReactiveCountdown }
}

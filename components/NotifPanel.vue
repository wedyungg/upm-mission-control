<template>
  <Transition name="fade-slide">
    <div v-if="isOpen" 
      class="absolute right-0 top-full mt-2 w-[340px] max-w-[calc(100vw-32px)] bg-[var(--bg-surface)] border border-[var(--border-md)] rounded-2xl shadow-2xl overflow-hidden flex flex-col z-[100]">
      
      <div class="flex items-center justify-between px-4 py-3.5 border-b border-[var(--border)] bg-[var(--bg-elevated)]">
        <h3 class="text-sm font-semibold text-[var(--text-primary)]">Notifikasi</h3>
        <button v-if="unreadCount > 0" @click="markAllRead" class="text-xs font-semibold text-[var(--accent)] hover:underline transition-colors bg-[var(--accent-soft)] px-2.5 py-1 rounded-md">
          Tandai sudah dibaca
        </button>
      </div>

      <div class="overflow-y-auto max-h-[360px] p-2 space-y-1.5 scrollbar-hide">
        
        <div v-if="loading" class="flex justify-center py-8">
          <div class="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
        </div>

        <template v-else>
          <div v-for="n in notifs" :key="n.id" 
            class="p-3 rounded-xl flex gap-3.5 transition-colors cursor-pointer"
            :class="isRead(n) ? 'hover:bg-[var(--bg-elevated)]' : 'bg-[var(--accent-soft)]/50 border border-[var(--border-md)]'"
            @click="navigateTo('/misi/' + n.task_id); $emit('close')">
            
            <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" :class="getIconStyle(n.event).bg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" v-html="getIconStyle(n.event).svg"></svg>
            </div>

            <div class="min-w-0 flex-1">
              <p class="text-xs text-[var(--text-primary)] leading-relaxed">
                <span class="font-semibold">{{ n.task_name }}</span> {{ getEventText(n.event) }}
              </p>
              <p class="text-xs mt-1 font-mono" :class="isRead(n) ? 'text-[var(--text-muted)]' : 'text-[var(--accent)] font-semibold'">
                {{ formatTime(n.sent_at) }}
              </p>
            </div>

            <div v-if="!isRead(n)" class="w-2 h-2 rounded-full bg-[var(--accent)] mt-2 flex-shrink-0"></div>
          </div>

          <div v-if="!notifs.length" class="text-center py-10 flex flex-col items-center">
            <svg class="w-10 h-10 text-[var(--text-muted)] opacity-50 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            <p class="text-xs text-[var(--text-muted)]">Belum ada notifikasi baru.</p>
          </div>
        </template>
      </div>

    </div>
  </Transition>
</template>

<script setup lang="ts">
const props = defineProps<{ isOpen: boolean }>()
const emit = defineEmits(['close', 'update:unread'])

const supabase = useSupabaseClient()
const notifs = ref<any[]>([])
const loading = ref(true)

const formatTime = (dateStr: string) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }) + ' WIB'
}

const lastReadAt = ref<number>(0)
const unreadCount = computed(() => notifs.value.filter(n => !isRead(n)).length)

const fetchNotifs = async () => {
  try {
    const { data } = await supabase
      .from('notif_log')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(15)
    if (data) notifs.value = data
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const isRead = (n: any) => {
  const notifTime = new Date(n.sent_at).getTime()
  return notifTime <= lastReadAt.value
}

const markAllRead = () => {
  lastReadAt.value = Date.now()
  localStorage.setItem('upm_last_read_notif', lastReadAt.value.toString())
  emit('update:unread', 0)
}

onMounted(() => {
  lastReadAt.value = Number(localStorage.getItem('upm_last_read_notif') || '0')
  fetchNotifs()
})

watch(unreadCount, (val) => {
  emit('update:unread', val)
})

watch(() => props.isOpen, (newVal) => {
  if (newVal) fetchNotifs()
})

const getEventText = (event: string) => {
  const map: Record<string, string> = {
    task_created: 'dijadwalkan dan siap dikerjakan.',
    planning_done: 'telah selesai naskah & konsepnya.',
    upload_produksi: 'telah selesai tahap produksi.',
    upload_editing: 'telah selesai tahap editing.',
    qc_approved: 'telah lulus Quality Control.',
    qc_revision: 'membutuhkan revisi segera.',
    distribusi_ready: 'telah siap untuk distribusi.',
    task_selesai: 'telah ditandai selesai sepenuhnya.'
  }
  return map[event] || 'diperbarui.'
}

const getIconStyle = (event: string) => {
  switch (event) {
    case 'task_created': return { bg: 'bg-emerald-500/15 text-[var(--accent)]', svg: '<line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>' }
    case 'planning_done': return { bg: 'bg-purple-500/15 text-purple-500', svg: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>' }
    case 'upload_produksi': return { bg: 'bg-amber-500/15 text-amber-500', svg: '<polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>' }
    case 'upload_editing': return { bg: 'bg-teal-500/15 text-teal-500', svg: '<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>' }
    case 'qc_approved': return { bg: 'bg-green-500/15 text-green-500', svg: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>' }
    case 'qc_revision': return { bg: 'bg-red-500/15 text-red-500', svg: '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>' }
    case 'distribusi_ready': return { bg: 'bg-indigo-500/15 text-indigo-500', svg: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line>' }
    case 'task_selesai': return { bg: 'bg-emerald-500/15 text-emerald-500', svg: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line>' }
    default: return { bg: 'bg-gray-500/15 text-gray-500', svg: '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>' }
  }
}
</script>

<style scoped>
.scrollbar-hide { scrollbar-width: none; }
.scrollbar-hide::-webkit-scrollbar { display: none; }
.fade-slide-enter-active, .fade-slide-leave-active { transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1); }
.fade-slide-enter-from, .fade-slide-leave-to { opacity: 0; transform: translateY(-8px) scale(0.98); }
</style>

<template>
  <div v-if="isOpen" class="notif-wrapper">
    <div class="fixed inset-0 z-40" @click="$emit('close')" />

    <div class="absolute right-0 top-12 w-80 min-w-[280px] max-w-[calc(100vw-32px)] 
                bg-[var(--bg-card)] border border-[var(--border-md)] 
                rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in duration-150">
      
      <div class="flex items-center justify-between mb-4">
        <p class="text-sm font-bold text-[var(--text-primary)]">Notifikasi Terbaru</p>
        <button @click="$emit('close')" class="p-1 hover:bg-[var(--bg-elevated)] rounded-lg">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div class="space-y-3 max-h-[320px] overflow-y-auto pr-1">
        <template v-if="notifications.length > 0">
          <div v-for="n in notifications" :key="n.id" class="p-3 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border)]">
            <div class="flex gap-3">
              <span class="text-lg">{{ n.emoji }}</span>
              <div class="min-w-0 flex-1">
                <p class="text-[11px] font-bold text-[var(--text-primary)] truncate">{{ n.title }}</p>
                <p class="text-[10px] text-[var(--text-muted)] line-clamp-2 mt-0.5">{{ n.message }}</p>
                <p class="text-[9px] text-[var(--text-secondary)] mt-1.5 opacity-60">{{ n.time }}</p>
              </div>
            </div>
          </div>
        </template>
        <div v-else class="text-center py-10">
          <p class="text-2xl mb-2">🔔</p>
          <p class="text-[10px] text-[var(--text-muted)]">Belum ada aktivitas baru.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  isOpen: boolean
}>()

defineEmits(['close'])

const supabase = useSupabaseClient()
const notifications = ref<any[]>([])
let channel: any = null // Simpan channel di variabel luar agar bisa diakses onUnmounted

const fetchNotifs = async () => {
  const { data } = await supabase
    .from('notif_log')
    .select('*')
    .order('sent_at', { ascending: false })
    .limit(10)
  
  if (data) {
    notifications.value = data.map(n => ({
      id: n.id,
      title: n.event.replace('_', ' ').toUpperCase(),
      message: n.task_name,
      time: new Date(n.sent_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      emoji: n.success ? '✅' : '❌'
    }))
  }
}

onMounted(() => {
  fetchNotifs()
  
  // Real-time listener: .on() wajib dipanggil SEBELUM .subscribe()
  channel = supabase.channel('notif_changes')
    .on('postgres_changes', { event: 'INSERT', table: 'notif_log' }, () => {
      fetchNotifs()
    })
    .subscribe()
})

// PENTING: Putus koneksi saat komponen dihancurkan (unmounted) atau logout
onUnmounted(() => {
  if (channel) {
    supabase.removeChannel(channel)
  }
})
</script>
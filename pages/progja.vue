<template>
  <div class="pb-8">
    <div class="flex items-center gap-2.5 px-4 pt-4 mb-3.5">
      <div class="flex-1">
        <h1 class="text-xl font-bold text-[var(--text-primary)]">Program Kerja</h1>
        <p class="text-xs text-[var(--text-muted)] mt-0.5">Target tahunan Periode {{ currentHY }}H</p>
      </div>
      <button v-if="isSuperAdmin" class="flex items-center gap-1.5 px-3 py-2 bg-[var(--blue)] text-white rounded-xl text-xs font-bold transition-transform active:scale-95"
        @click="openAdd()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
        Tambah
      </button>
    </div>

    <div v-if="!isSuperAdmin" class="mx-4 p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] text-center">
      <svg class="w-12 h-12 mx-auto mb-3 text-[var(--text-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
      <p class="text-sm font-semibold text-[var(--text-primary)] mb-1">Akses Terbatas</p>
      <p class="text-xs text-[var(--text-muted)]">Hanya Super Admin dan Ketua yang dapat mengelola Progja.</p>
    </div>

    <template v-else>
      <div v-if="progjaStore.loading" class="flex justify-center py-10">
        <div class="w-6 h-6 border-2 border-[var(--blue)] border-t-transparent rounded-full animate-spin"/>
      </div>

      <div v-else>
        <div class="flex gap-2 px-4 mb-4">
          <button class="flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-200 border"
            :class="activeTab === 'tim' ? 'bg-[var(--blue)] border-[var(--blue)] text-white shadow-sm' : 'bg-[var(--bg-elevated)] border-[var(--border-md)] text-[var(--text-secondary)]'"
            @click="activeTab = 'tim'">
            Tim / Konten
          </button>
          <button class="flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-200 border"
            :class="activeTab === 'admin' ? 'bg-orange-500 border-orange-500 text-white shadow-sm' : 'bg-[var(--bg-elevated)] border-[var(--border-md)] text-[var(--text-secondary)]'"
            @click="activeTab = 'admin'">
            Administrasi
          </button>
        </div>

        <div class="px-4 space-y-5 mb-4">
          <TransitionGroup name="list">
            <template v-for="grade in ['S', 'A', 'B', 'C']" :key="grade">
              <div v-if="groupedProgja[grade]?.length > 0" class="mb-2">
                
                <div class="flex items-center gap-2 mb-3">
                  <UiGradeBadge :grade="grade" />
                  <p class="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">{{ GRADE_LABELS[grade] }}</p>
                  <div class="h-px bg-[var(--border-md)] flex-1 ml-1"></div>
                  <span class="text-[10px] text-[var(--text-muted)]">{{ groupedProgja[grade].length }} Progja</span>
                </div>

                <div class="space-y-2">
                  <div v-for="item in groupedProgja[grade]" :key="item.id" class="progja-row group">
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-bold text-[var(--text-primary)] truncate">{{ item.nama }}</p>
                      <p class="text-[10px] text-[var(--text-muted)] mt-0.5">{{ item.kategori }}</p>
                    </div>
                    
                    <div class="flex items-center gap-3 flex-shrink-0">
                      <div class="text-center px-3 py-1 bg-[var(--bg-base)] rounded-lg border border-[var(--border)]">
                        <p class="text-sm font-bold text-[var(--blue)] leading-none">{{ item.target_tahunan }}</p>
                        <p class="text-[8px] font-semibold text-[var(--text-muted)] uppercase tracking-wide mt-0.5">Target</p>
                      </div>
                      
                      <div class="flex flex-col gap-1.5">
                        <button class="w-6 h-6 flex items-center justify-center rounded bg-[var(--bg-elevated)] text-[var(--text-secondary)] transition-colors hover:text-[var(--blue)]"
                          @click="openEdit(item)">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button class="w-6 h-6 flex items-center justify-center rounded bg-red-500/10 text-red-400 transition-colors hover:bg-red-500/20"
                          @click="deleteItem(item.id)">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </template>
          </TransitionGroup>

          <div v-if="!hasActiveItems" class="text-center py-10 px-4">
            <div class="w-12 h-12 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center mx-auto mb-3">
              <svg class="w-6 h-6 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
            </div>
            <p class="text-sm font-semibold text-[var(--text-primary)] mb-1">Belum ada progja</p>
            <p class="text-xs text-[var(--text-muted)]">Tap tombol "+ Tambah" di pojok kanan atas untuk membuat progja baru.</p>
          </div>
        </div>
      </div>
    </template>

    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal"
          class="fixed inset-0 z-[200] flex items-end justify-center"
          style="background:rgba(0,0,0,0.6); backdrop-filter: blur(2px);"
          @click.self="closeModal">
          <div class="w-full max-w-[480px] bg-[var(--bg-surface)] rounded-t-3xl px-5 pt-5 pb-10 border-t border-[var(--border-md)] shadow-2xl">
            <div class="w-12 h-1.5 bg-[var(--border-md)] rounded-full mx-auto mb-5"/>
            <h3 class="text-lg font-bold text-[var(--text-primary)] mb-5">
              {{ editingId ? 'Edit Program Kerja' : 'Tambah Program Kerja' }}
            </h3>
            <div class="space-y-4">
              <div>
                <label class="fl">Jenis Program</label>
                <div class="flex gap-2">
                  <button class="flex-1 py-2.5 rounded-xl text-xs font-bold border transition-colors"
                    :class="form.type === 'tim' ? 'bg-[var(--blue)] border-[var(--blue)] text-white' : 'bg-[var(--bg-elevated)] border-[var(--border-md)] text-[var(--text-secondary)]'"
                    @click="form.type = 'tim'">Tim / Konten</button>
                  <button class="flex-1 py-2.5 rounded-xl text-xs font-bold border transition-colors"
                    :class="form.type === 'admin' ? 'bg-orange-500 border-orange-500 text-white' : 'bg-[var(--bg-elevated)] border-[var(--border-md)] text-[var(--text-secondary)]'"
                    @click="form.type = 'admin'">Administrasi</button>
                </div>
              </div>
              
              <div class="relative z-10">
                <label class="fl">Grade (Beban Kerja)</label>
                <IosSelect 
                  v-model="form.grade" 
                  label="Pilih Beban Kerja"
                  :options="[
                    { value: 'S', label: 'S — Kompleks' },
                    { value: 'A', label: 'A — Berat' },
                    { value: 'B', label: 'B — Sedang' },
                    { value: 'C', label: 'C — Ringan' }
                  ]" 
                />
              </div>

              <div>
                <label class="fl">Nama Program *</label>
                <input v-model="form.nama" type="text" class="fi" placeholder="Misal: Podcast Guru, Laporan Q1..."/>
              </div>
              <div>
                <label class="fl">Kategori Tugas (Harus sama persis) *</label>
                <input v-model="form.kategori" type="text" class="fi" placeholder="Misal: Podcast/Reels/Carousel"/>
                <p class="text-[10px] text-[var(--text-muted)] mt-1.5">Digunakan sistem untuk mendeteksi otomatis saat penambahan tugas.</p>
              </div>
              <div>
                <label class="fl">Target Tahunan *</label>
                <input v-model.number="form.target_tahunan" type="number" min="1" class="fi" placeholder="Contoh: 12"/>
              </div>
              <p v-if="formErr" class="text-xs font-semibold text-red-400 bg-red-500/10 p-2 rounded-lg text-center">{{ formErr }}</p>
              
              <button class="w-full mt-2 py-3.5 bg-[var(--blue)] text-white font-bold rounded-xl text-sm transition-opacity active:opacity-80" :disabled="saving" @click="saveProgja">
                {{ saving ? 'Menyimpan...' : editingId ? 'SIMPAN PERUBAHAN' : 'TAMBAH PROGJA' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { useProgjaStore }  from '~/stores/progja'
import { useAuthStore }    from '~/stores/auth'
import { useHijri }        from '~/composables/useHijri'
import UiGradeBadge from '~/components/ui/GradeBadge.vue'
import type { ProgjaItem, TaskType, TaskGrade } from '~/types'

definePageMeta({ middleware: 'auth' })

const progjaStore = useProgjaStore()
const auth        = useAuthStore()
const toast       = useToast()
const { approxCurrentHijriYear } = useHijri()

const currentHY  = approxCurrentHijriYear()

const isSuperAdmin = computed(() =>
  ['ketua', 'planner', 'tester'].includes(auth.currentUser?.role ?? '') ||
  auth.currentUser?.id === 'ziyan'
)

onMounted(() => { if (isSuperAdmin.value) progjaStore.fetchProgja(currentHY) })

// ── UX: Tab & Grouping Logic ──────────────────────────────────
const activeTab = ref<'tim' | 'admin'>('tim')

const GRADE_LABELS: Record<string, string> = {
  S: 'Kompleks',
  A: 'Berat',
  B: 'Sedang',
  C: 'Ringan'
}

// Mengelompokkan item berdasarkan grade secara dinamis
const groupedProgja = computed(() => {
  const filtered = progjaStore.items.filter(p => p.type === activeTab.value)
  const groups: Record<string, ProgjaItem[]> = { S: [], A: [], B: [], C: [] }
  
  filtered.forEach(p => {
    if (groups[p.grade]) {
      groups[p.grade].push(p)
    }
  })
  
  return groups
})

// Mengecek apakah tab aktif memiliki item sama sekali
const hasActiveItems = computed(() => {
  return progjaStore.items.filter(p => p.type === activeTab.value).length > 0
})

// ── Modal ─────────────────────────────────────────────────────
const showModal = ref(false)
const editingId = ref<string | null>(null)
const saving    = ref(false)
const formErr   = ref('')

const form = reactive<{
  type: TaskType; grade: TaskGrade; nama: string; kategori: string; target_tahunan: number
}>({ type: 'tim', grade: 'A', nama: '', kategori: '', target_tahunan: 1 })

const openAdd = () => {
  editingId.value = null
  // Tipe default menyesuaikan tab yang sedang dibuka
  Object.assign(form, { type: activeTab.value, grade: 'A', nama: '', kategori: '', target_tahunan: 1 })
  formErr.value   = ''
  showModal.value = true
}

const openEdit = (item: ProgjaItem) => {
  editingId.value = item.id
  Object.assign(form, {
    type: item.type, grade: item.grade, nama: item.nama,
    kategori: item.kategori, target_tahunan: item.target_tahunan,
  })
  formErr.value   = ''
  showModal.value = true
}

const closeModal = () => { showModal.value = false }

const saveProgja = async () => {
  formErr.value = ''
  if (!form.nama.trim())      { formErr.value = 'Nama program wajib diisi'; return }
  if (!form.kategori.trim())  { formErr.value = 'Kategori wajib diisi'; return }
  if (form.target_tahunan < 1){ formErr.value = 'Target minimal 1'; return }
  saving.value = true
  const item: ProgjaItem = {
    id: editingId.value ?? `p${Date.now()}`,
    nama: form.nama.trim(),
    kategori: form.kategori.trim(),
    type: form.type,
    grade: form.grade,
    target_tahunan: form.target_tahunan,
    hijri_year: currentHY,
  }
  await progjaStore.upsertProgja(item)
  
  // UX: Otomatis pindah tab ke tipe yang baru saja ditambahkan
  activeTab.value = form.type

  saving.value    = false
  showModal.value = false
  toast.add({ title: editingId.value ? 'Progja diperbarui ✓' : 'Progja ditambahkan ✓', color: 'green' })
}

const deleteItem = async (id: string) => {
  if (!confirm('Hapus program kerja ini?')) return
  await progjaStore.deleteProgja(id)
  toast.add({ title: 'Progja dihapus', color: 'orange' })
}
</script>

<style scoped>
.progja-row {
  display: flex; align-items: center; gap: 14px; padding: 14px 16px;
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: 16px;
  transition: transform 0.15s, box-shadow 0.15s;
}

.fl { font-size: 11px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; display: block; }
.fi {
  width: 100%; background: var(--bg-base); border: 1.5px solid var(--border-md);
  border-radius: 12px; padding: 12px 16px; color: var(--text-primary);
  font-size: 14px; font-family: inherit; outline: none;
  transition: border-color .2s;
}
.fi:focus { border-color: var(--blue); }

/* List Animation */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Modal animation */
.modal-enter-active, .modal-leave-active { transition: all .3s cubic-bezier(0.4, 0, 0.2, 1); }
.modal-enter-from { opacity: 0; }
.modal-enter-from > div { transform: translateY(100%); }
.modal-leave-to   { opacity: 0; }
.modal-leave-to > div   { transform: translateY(100%); }
</style>
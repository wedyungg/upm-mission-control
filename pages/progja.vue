<template>
  <div class="pb-8">
    <!-- Header -->
    <div class="flex items-center gap-2.5 px-4 pt-4 mb-3.5">
      <div class="flex-1">
        <h1 class="text-xl font-bold text-[var(--text-primary)]">Program Kerja</h1>
        <p class="text-xs text-[var(--text-muted)] mt-0.5">Target tahunan Periode {{ currentHY }}H</p>
      </div>
      <!-- Add button — hanya super admin -->
      <button v-if="isSuperAdmin" class="flex items-center gap-1.5 px-3 py-2 bg-[var(--blue)] text-white rounded-xl text-xs font-bold"
        @click="openAdd()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
        Tambah
      </button>
    </div>

    <!-- Access denied -->
    <div v-if="!isSuperAdmin" class="mx-4 p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] text-center">
      <svg class="w-12 h-12 mx-auto mb-3 text-[var(--text-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
      <p class="text-sm font-semibold text-[var(--text-primary)] mb-1">Akses Terbatas</p>
      <p class="text-xs text-[var(--text-muted)]">Hanya Super Admin dan Ketua yang dapat mengelola Progja.</p>
    </div>

    <template v-else>
      <!-- Loading -->
      <div v-if="progjaStore.loading" class="flex justify-center py-10">
        <div class="w-6 h-6 border-2 border-[var(--blue)] border-t-transparent rounded-full animate-spin"/>
      </div>

      <template v-else>
        <!-- TIM -->
        <div class="px-4 mb-2">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-1.5 h-4 rounded-full bg-[var(--blue)]"/>
            <p class="text-sm font-bold text-[var(--text-primary)]">Tim / Konten</p>
            <span class="ml-auto text-xs text-[var(--text-muted)]">{{ timItems.length }} program</span>
          </div>
        </div>
        <div class="px-4 space-y-2 mb-4">
          <div v-for="item in timItems" :key="item.id" class="progja-row">
            <UiGradeBadge :grade="item.grade"/>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-[var(--text-primary)] truncate">{{ item.nama }}</p>
              <p class="text-[10px] text-[var(--text-muted)]">{{ item.kategori }}</p>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
              <div class="text-center">
                <p class="text-base font-bold text-[var(--text-primary)] leading-none">{{ item.target_tahunan }}</p>
                <p class="text-[9px] text-[var(--text-muted)]">target</p>
              </div>
              <button class="w-7 h-7 flex items-center justify-center rounded-lg bg-[var(--bg-elevated)] text-[var(--text-muted)]"
                @click="openEdit(item)">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="w-7 h-7 flex items-center justify-center rounded-lg bg-red-500/10 text-red-400"
                @click="deleteItem(item.id)">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
              </button>
            </div>
          </div>
          <div v-if="!timItems.length" class="text-center py-4 text-xs italic text-[var(--text-muted)]">Belum ada progja tim. Tap "+ Tambah".</div>
        </div>

        <!-- ADMIN -->
        <div class="px-4 mb-2">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-1.5 h-4 rounded-full bg-orange-400"/>
            <p class="text-sm font-bold text-[var(--text-primary)]">Administrasi</p>
            <span class="ml-auto text-xs text-[var(--text-muted)]">{{ adminItems.length }} program</span>
          </div>
        </div>
        <div class="px-4 space-y-2 mb-4">
          <div v-for="item in adminItems" :key="item.id" class="progja-row">
            <UiGradeBadge :grade="item.grade"/>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-[var(--text-primary)] truncate">{{ item.nama }}</p>
              <p class="text-[10px] text-[var(--text-muted)]">{{ item.kategori }}</p>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
              <div class="text-center">
                <p class="text-base font-bold text-[var(--text-primary)] leading-none">{{ item.target_tahunan }}</p>
                <p class="text-[9px] text-[var(--text-muted)]">target</p>
              </div>
              <button class="w-7 h-7 flex items-center justify-center rounded-lg bg-[var(--bg-elevated)] text-[var(--text-muted)]"
                @click="openEdit(item)">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="w-7 h-7 flex items-center justify-center rounded-lg bg-red-500/10 text-red-400"
                @click="deleteItem(item.id)">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
              </button>
            </div>
          </div>
          <div v-if="!adminItems.length" class="text-center py-4 text-xs italic text-[var(--text-muted)]">Belum ada progja administrasi.</div>
        </div>
      </template>
    </template>

    <!-- ── Modal Form ── -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal"
          class="fixed inset-0 z-[200] flex items-end justify-center"
          style="background:rgba(0,0,0,0.6)"
          @click.self="closeModal">
          <div class="w-full max-w-[480px] bg-[var(--bg-surface)] rounded-t-3xl px-5 pt-5 pb-10 border-t border-[var(--border-md)]">
            <!-- Handle bar -->
            <div class="w-10 h-1 bg-[var(--border-md)] rounded-full mx-auto mb-4"/>
            <h3 class="text-base font-bold text-[var(--text-primary)] mb-4">
              {{ editingId ? 'Edit Progja' : 'Tambah Progja' }}
            </h3>
            <div class="space-y-3">
              <div>
                <label class="fl">Jenis</label>
                <select v-model="form.type" class="fi">
                  <option value="tim">Tim / Konten</option>
                  <option value="admin">Administrasi</option>
                </select>
              </div>
              <div>
                <label class="fl">Grade</label>
                <select v-model="form.grade" class="fi">
                  <option value="S">S — Super Priority</option>
                  <option value="A">A — High</option>
                  <option value="B">B — Medium</option>
                  <option value="C">C — Normal</option>
                </select>
              </div>
              <div>
                <label class="fl">Nama Program *</label>
                <input v-model="form.nama" type="text" class="fi" placeholder="Misal: Podcast Guru, Desain Carousel..."/>
              </div>
              <div>
                <label class="fl">Kategori Tugas (sesuai task.kat) *</label>
                <input v-model="form.kategori" type="text" class="fi" placeholder="Misal: Podcast/Reels/Carousel"/>
                <p class="text-[10px] text-[var(--text-muted)] mt-1">Harus sama persis dengan kategori saat buat tugas agar terdeteksi otomatis.</p>
              </div>
              <div>
                <label class="fl">Target Tahunan *</label>
                <input v-model.number="form.target_tahunan" type="number" min="1" class="fi" placeholder="Contoh: 10"/>
              </div>
              <p v-if="formErr" class="text-xs text-red-400">{{ formErr }}</p>
              <button class="w-full py-3.5 bg-[var(--blue)] text-white font-bold rounded-xl text-sm" :disabled="saving" @click="saveProgja">
                {{ saving ? 'Menyimpan...' : editingId ? 'SIMPAN PERUBAHAN' : 'TAMBAH KE PROGJA' }}
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
// Hanya Ziyan (production=ziyan) dan Ketua yang bisa akses
const isSuperAdmin = computed(() =>
  ['ketua', 'planner'].includes(auth.currentUser?.role ?? '') ||
  auth.currentUser?.id === 'ziyan'
)

onMounted(() => { if (isSuperAdmin.value) progjaStore.fetchProgja(currentHY) })

const timItems   = computed(() => progjaStore.items.filter(p => p.type === 'tim'))
const adminItems = computed(() => progjaStore.items.filter(p => p.type === 'admin'))

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
  Object.assign(form, { type: 'tim', grade: 'A', nama: '', kategori: '', target_tahunan: 1 })
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
  display: flex; align-items: center; gap: 10px; padding: 12px 14px;
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: 14px;
}
.fl { font-size: 11px; font-weight: 600; color: var(--text-secondary); margin-bottom: 5px; display: block; }
.fi {
  width: 100%; background: var(--bg-elevated); border: 1.5px solid var(--border-md);
  border-radius: 10px; padding: 11px 14px; color: var(--text-primary);
  font-size: 14px; font-family: inherit; outline: none;
  transition: border-color .2s;
}
.fi:focus { border-color: var(--blue); }

/* Modal animation */
.modal-enter-active, .modal-leave-active { transition: all .25s ease; }
.modal-enter-from { opacity: 0; transform: translateY(100%); }
.modal-leave-to   { opacity: 0; transform: translateY(100%); }
</style>

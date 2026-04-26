<template>
  <div>
    <div 
      class="w-full bg-[var(--bg-elevated)] border-[1.5px] border-[var(--border-md)] rounded-[10px] p-[11px_14px] text-left text-[14px] text-[var(--text-primary)] flex justify-between items-center cursor-pointer transition-colors"
      :class="error ? 'border-red-500' : 'focus-within:border-[var(--blue)]'"
      @click="isOpen = true"
    >
      <span :class="modelValue ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'">
        {{ selectedLabel }}
      </span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
    </div>

    <Teleport to="body">
      <transition name="slide-bottom">
        <div v-if="isOpen" class="ios-backdrop" @click.self="isOpen = false">
          
          <div class="ios-sheet-wrapper">
            <div class="ios-sheet">
              <div class="sheet-header">
                <span class="sheet-title">{{ label || 'Pilih Opsi' }}</span>
                <button class="sheet-close" @click="isOpen = false">Tutup</button>
              </div>
              
              <div class="sheet-body">
                <button 
                  v-for="(opt, idx) in normalizedOptions" 
                  :key="idx"
                  class="sheet-item"
                  :class="{ active: modelValue === opt.value }"
                  @click="selectOption(opt.value)"
                >
                  {{ opt.label }}
                  <span v-if="modelValue === opt.value" class="check-icon text-[var(--blue)]">✓</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number, Boolean], default: '' },
  options: { type: Array, required: true },
  label: { type: String, default: 'Pilih' },
  placeholder: { type: String, default: 'Pilih opsi...' },
  error: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'change'])

const isOpen = ref(false)

const normalizedOptions = computed(() => {
  return props.options.map(opt => {
    if (typeof opt === 'object' && opt !== null) return opt
    return { value: opt, label: opt }
  })
})

const selectedLabel = computed(() => {
  if (!props.modelValue && props.modelValue !== 0) return props.placeholder
  const selected = normalizedOptions.value.find(o => o.value === props.modelValue)
  return selected ? selected.label : props.placeholder
})

const selectOption = (val) => {
  emit('update:modelValue', val)
  emit('change', val)
  isOpen.value = false
}
</script>

<style scoped>
/* Backdrop menutupi seluruh layar browser secara absolut */
.ios-backdrop {
  position: fixed; 
  inset: 0; 
  z-index: 99999;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex; 
  flex-direction: column; 
  justify-content: flex-end;
  align-items: center; /* Menengahkan sheet di layar besar */
}

/* Pembatas ukuran biar kalau dibuka di PC nggak raksasa "selayar" */
.ios-sheet-wrapper {
  width: 100%;
  max-width: 480px; /* Lebar maksimal layaknya HP */
  display: flex;
  justify-content: center;
}

.ios-sheet {
  width: 100%;
  background: var(--bg-surface, #1e293b);
  border-radius: 24px 24px 0 0;
  padding: 20px 20px 34px; 
  max-height: 70vh;
  display: flex; flex-direction: column;
  box-shadow: 0 -4px 24px rgba(0,0,0,0.4);
}

.sheet-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 12px; padding-bottom: 12px;
  border-bottom: 1px solid var(--border, rgba(255,255,255,0.08));
}
.sheet-title { font-size: 16px; font-weight: 700; color: var(--text-primary); }
.sheet-close { font-size: 15px; font-weight: 600; color: var(--blue); background: none; border: none; cursor: pointer; }

.sheet-body {
  overflow-y: auto; display: flex; flex-direction: column; gap: 4px; scrollbar-width: none;
}
.sheet-body::-webkit-scrollbar { display: none; }

.sheet-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 16px; border-radius: 12px;
  background: transparent; border: none;
  font-size: 15px; font-weight: 500; color: var(--text-muted);
  text-align: left; cursor: pointer; transition: background 0.2s;
}
.sheet-item:active { background: var(--bg-elevated); }
.sheet-item.active { 
  color: var(--blue); font-weight: 700; background: rgba(59, 130, 246, 0.1); 
}

/* Animasi Slide dari bawah */
.slide-bottom-enter-active, .slide-bottom-leave-active { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.slide-bottom-enter-from, .slide-bottom-leave-to { opacity: 0; }
.slide-bottom-enter-from .ios-sheet-wrapper, .slide-bottom-leave-to .ios-sheet-wrapper { transform: translateY(100%); }
</style>
<template>
  <div>
    <div 
      class="w-full bg-[var(--bg-elevated)] border border-[var(--border-md)] hover:border-[var(--accent)] rounded-[10px] p-[11px_14px] text-left text-[14px] text-[var(--text-primary)] flex justify-between items-center cursor-pointer transition-colors"
      :class="error ? 'border-[var(--red)]' : ''"
      @click="isOpen = true"
    >
      <span class="truncate pr-2" :class="modelValue ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'">
        {{ selectedLabel }}
      </span>
      <svg class="flex-shrink-0 text-[var(--text-muted)]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
    </div>

    <Teleport to="body">
      <transition name="slide-bottom">
        <div v-if="isOpen" class="ios-backdrop" @click.self="isOpen = false">
          
          <div class="ios-sheet-wrapper">
            <div class="ios-sheet">
              <div class="sheet-header">
                <span class="sheet-title">{{ label || 'Pilih Opsi' }}</span>
                <button class="sheet-close" @click="isOpen = false">Selesai</button>
              </div>
              
              <div class="sheet-body">
                <template v-for="(opt, idx) in normalizedOptions" :key="idx">
                  <div v-if="opt.isGroup" class="sheet-group-header">
                    {{ opt.label }}
                  </div>
                  <button 
                    v-else
                    type="button"
                    class="sheet-item"
                    :class="{ active: modelValue === opt.value }"
                    @click="selectOption(opt.value)"
                  >
                    <span>{{ opt.label }}</span>
                    <svg v-if="modelValue === opt.value" class="w-4 h-4 text-[var(--accent)] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </button>
                </template>
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
  const selected = normalizedOptions.value.find(o => !o.isGroup && o.value === props.modelValue)
  return selected ? selected.label : String(props.modelValue)
})

const selectOption = (val) => {
  emit('update:modelValue', val)
  emit('change', val)
  isOpen.value = false
}
</script>

<style scoped>
.ios-backdrop {
  position: fixed; 
  inset: 0; 
  z-index: 99999;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(5px);
  display: flex; 
  flex-direction: column; 
  justify-content: flex-end;
  align-items: center;
}
@media (min-width: 768px) {
  .ios-backdrop {
    justify-content: center;
    padding: 24px;
  }
}

.ios-sheet-wrapper {
  width: 100%;
  max-width: 440px;
  display: flex;
  justify-content: center;
}

.ios-sheet {
  width: 100%;
  background: var(--bg-surface);
  border: 1px solid var(--border-md);
  border-radius: 24px 24px 0 0;
  padding: 20px 20px 30px; 
  max-height: 70vh;
  display: flex; flex-direction: column;
  box-shadow: 0 -4px 24px rgba(0,0,0,0.4);
}
@media (min-width: 768px) {
  .ios-sheet {
    border-radius: 20px;
    padding: 20px;
    box-shadow: 0 20px 50px rgba(0,0,0,0.45);
  }
}

.sheet-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 12px; padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}
.sheet-title { font-size: 15px; font-weight: 700; color: var(--text-primary); }
.sheet-close { font-size: 14px; font-weight: 600; color: var(--accent); background: none; border: none; cursor: pointer; }

.sheet-body {
  overflow-y: auto; display: flex; flex-direction: column; gap: 4px; scrollbar-width: none;
}
.sheet-body::-webkit-scrollbar { display: none; }

.sheet-group-header {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  padding: 12px 14px 4px;
}
.sheet-group-header:first-child {
  padding-top: 4px;
}

.sheet-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 14px; border-radius: 12px;
  background: transparent; border: none;
  font-size: 14px; font-weight: 500; color: var(--text-secondary);
  text-align: left; cursor: pointer; transition: background 0.15s;
}
.sheet-item:hover { background: var(--bg-elevated); }
.sheet-item.active { 
  color: var(--accent); font-weight: 700; background: var(--accent-soft); 
}

.slide-bottom-enter-active, .slide-bottom-leave-active { transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
.slide-bottom-enter-from, .slide-bottom-leave-to { opacity: 0; }
.slide-bottom-enter-from .ios-sheet-wrapper, .slide-bottom-leave-to .ios-sheet-wrapper { transform: translateY(24px); }
</style>

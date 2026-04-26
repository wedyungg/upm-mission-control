// stores/theme.ts
import { defineStore } from 'pinia'

export type Theme = 'dark' | 'light'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<Theme>('dark')

  const applyTheme = (t: Theme) => {
    theme.value = t
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', t)
    }
  }

  const toggle = () => {
    const next: Theme = theme.value === 'dark' ? 'light' : 'dark'
    applyTheme(next)
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('upm_theme', next)
    }
  }

  // Called on client mount — restores saved preference
  const restore = () => {
    if (typeof localStorage === 'undefined') return
    const saved = localStorage.getItem('upm_theme') as Theme | null
    applyTheme(saved ?? 'dark')
  }

  const isDark = computed(() => theme.value === 'dark')

  return { theme, isDark, toggle, restore, applyTheme }
})

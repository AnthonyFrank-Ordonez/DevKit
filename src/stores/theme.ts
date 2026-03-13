import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      return savedTheme === 'dark'
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  const isDark = ref(getInitialTheme())

  watch(
    isDark,
    (val) => {
      if (val) {
        document.documentElement.classList.add('dark')
        localStorage.setItem('theme', 'dark')
      } else {
        document.documentElement.classList.remove('dark')
        localStorage.setItem('theme', 'light')
      }
    },
    { immediate: true },
  )

  const toggleTheme = () => {
    isDark.value = !isDark.value
  }

  // Listen for system theme changes
  const initSystemListener = () => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        isDark.value = e.matches
      }
    })
  }

  return {
    isDark,
    toggleTheme,
    initSystemListener,
  }
})

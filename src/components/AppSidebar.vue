<script setup lang="ts">
import { onMounted } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { RouterLink } from 'vue-router'

const themeStore = useThemeStore()

onMounted(() => {
  themeStore.initSystemListener()
})
</script>

<template>
  <div class="flex flex-col">
    <!-- Header Title -->
    <div class="flex justify-between">
      <div class="text-2xl font-bold tracking-tight">
        <h1 class="text-accent">DevKit</h1>
      </div>

      <button
        @click="themeStore.toggleTheme"
        class="cursor-pointer rounded-full p-2 hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <svg
          v-if="themeStore.isDark"
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="4" />
          <path
            d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
          />
        </svg>

        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </button>
    </div>

    <!-- Navigation -->
    <nav class="mt-10 text-lg font-bold tracking-tight">
      <ul>
        <li class="flex flex-col space-y-1">
          <router-link to="/">JSON Formatter</router-link>
          <router-link to="/regex-builder">Regex Builder</router-link>
          <router-link to="/color-picker">Color Picker</router-link>
        </li>
      </ul>
    </nav>
  </div>
</template>

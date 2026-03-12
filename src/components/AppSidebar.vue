<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="flex flex-col">
    <!-- Header Title -->
    <div class="text-2xl font-bold tracking-tight">
      <h1 class="text-accent">DevKit</h1>
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

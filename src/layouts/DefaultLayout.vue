<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppSidebar from '@/components/AppSidebar.vue'
</script>

<template>
  <div
    class="bg-primary text-foreground mx-auto grid min-h-screen w-full grid-cols-1 lg:max-w-7xl lg:grid-cols-12"
  >
    <!-- Sidebar -->
    <aside class="border-border/20 bg-surface/20 col-span-3 border-0 border-r p-6">
      <app-sidebar />
    </aside>

    <!-- Main Content -->
    <main class="col-span-9 p-6">
      <router-view />
    </main>
  </div>
</template>

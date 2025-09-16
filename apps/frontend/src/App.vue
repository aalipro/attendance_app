<template>
  <div class="min-h-screen flex bg-gray-50 text-gray-900">
    <!-- Sidebar -->
    <aside class="hidden md:flex md:flex-col w-72 bg-white border-r">
      <div class="px-6 py-5 border-b">
        <h1 class="text-2xl font-bold tracking-tight">Présences EPS</h1>
        <p class="text-sm text-gray-500">Gestion des classes & séances</p>
      </div>
      <nav class="flex-1 p-3 space-y-1">
        <RouterLink class="nav-link" active-class="nav-active" to="/classes">Classes</RouterLink>
        <RouterLink class="nav-link" active-class="nav-active" to="/sessions">Séances</RouterLink>
        <RouterLink class="nav-link" active-class="nav-active" to="/stats">Statistiques</RouterLink>
        <RouterLink class="nav-link" active-class="nav-active" to="/settings">Paramètres</RouterLink>
      </nav>
      <div class="p-4 text-xs text-gray-500 border-t">SQLite: data/app.sqlite</div>
    </aside>

    <!-- Main -->
    <div class="flex-1 flex flex-col">
      <header class="md:hidden bg-white border-b">
        <div class="px-4 py-3 flex items-center justify-between">
          <div class="font-semibold">Présences EPS</div>
          <button class="btn-outline" @click="menuOpen = !menuOpen" aria-label="Ouvrir le menu">☰</button>
        </div>
        <div v-if="menuOpen" class="px-2 pb-3 flex flex-wrap gap-2">
          <RouterLink class="btn-outline" to="/classes" @click="menuOpen=false">Classes</RouterLink>
          <RouterLink class="btn-outline" to="/sessions" @click="menuOpen=false">Séances</RouterLink>
          <RouterLink class="btn-outline" to="/stats" @click="menuOpen=false">Stats</RouterLink>
          <RouterLink class="btn-outline" to="/settings" @click="menuOpen=false">Paramètres</RouterLink>
        </div>
      </header>
      <main class="p-4">
        <div class="container-page space-y-4">
          <RouterView />
        </div>
      </main>
    </div>

    <Toast />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { RouterLink, RouterView } from 'vue-router';
import Toast from './components/ui/Toast.vue';
const menuOpen = ref(false);
</script>

<style scoped>
.nav-link { @apply block px-4 py-2 rounded-md hover:bg-gray-100 text-gray-700; }
.nav-active { @apply bg-gray-100 font-medium; }
.btn-outline { @apply border rounded px-3 py-1.5 text-sm hover:bg-gray-50; }
</style>

<template>
  <div class="max-w-sm mx-auto mt-16 card space-y-4">
    <h1 class="text-xl font-semibold">Connexion</h1>
    <div class="space-y-2">
      <label class="label">Email</label>
      <input v-model="email" type="email" class="input" placeholder="vous@exemple.fr" />
    </div>
    <div class="space-y-2">
      <label class="label">Mot de passe</label>
      <input v-model="password" type="password" class="input" placeholder="••••••••" />
    </div>
    <button class="btn-primary w-full" :disabled="loading" @click="login">Se connecter</button>
    <p class="text-sm text-gray-600">Pas de compte ? <router-link class="text-primary" to="/signup">Créer un compte</router-link></p>
  </div>
</template>
<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { api, setAuthToken, handleError } from '../api';
import { useToastStore } from '../stores/toast';

const email = ref('demo@eps.fr');
const password = ref('demo123');
const loading = ref(false);
const router = useRouter();
const route = useRoute();
const toast = useToastStore();

async function login() {
  loading.value = true;
  try {
    const { data } = await api.post('/auth/login', { email: email.value, password: password.value });
    setAuthToken(data.token);
    toast.push('Connexion réussie ✔️');
    const redirect = route.query.redirect || '/classes';
    router.replace(String(redirect));
  } catch (e) {
    toast.push(`Erreur: ${handleError(e)}`, 'danger');
  } finally {
    loading.value = false;
  }
}
</script>
<style scoped>
.card { @apply bg-white rounded shadow p-4; }
.input { @apply w-full border rounded px-3 py-2; }
.label { @apply text-sm font-medium; }
.btn-primary { @apply rounded px-3 py-2 bg-primary text-white hover:bg-primary-700; }
</style>

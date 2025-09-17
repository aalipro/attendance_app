<template>
  <div class="max-w-sm mx-auto mt-16 card space-y-4">
    <h1 class="text-xl font-semibold">Créer un compte</h1>
    <div class="space-y-2">
      <label class="label">Nom complet</label>
      <input v-model="fullName" type="text" class="input" placeholder="Prénom Nom" />
    </div>
    <div class="space-y-2">
      <label class="label">Email</label>
      <input v-model="email" type="email" class="input" placeholder="vous@exemple.fr" />
    </div>
    <div class="space-y-2">
      <label class="label">Mot de passe</label>
      <input v-model="password" type="password" class="input" placeholder="••••••••" />
    </div>
    <button class="btn-primary w-full" :disabled="loading" @click="signup">S'inscrire</button>
    <p class="text-sm text-gray-600">Déjà un compte ? <router-link class="text-primary" to="/login">Se connecter</router-link></p>
  </div>
</template>
<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { api, setAuthToken, handleError } from '../api';
import { useToastStore } from '../stores/toast';

const fullName = ref('');
const email = ref('');
const password = ref('');
const loading = ref(false);
const router = useRouter();
const route = useRoute();
const toast = useToastStore();

async function signup() {
  if (!fullName.value || !email.value || !password.value) {
    return toast.push('Veuillez remplir tous les champs', 'danger');
  }
  loading.value = true;
  try {
    const { data } = await api.post('/auth/register', {
      fullName: fullName.value,
      email: email.value,
      password: password.value,
    });
    setAuthToken(data.token);
    toast.push('Compte créé ✔️');
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

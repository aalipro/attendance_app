<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold">Séances</h2>
      <button class="btn" @click="openCreate = true">+ Nouvelle séance</button>
    </div>

    <div class="card">
      <div class="grid md:grid-cols-4 gap-3">
        <div>
          <label class="label">Classe</label>
          <select v-model.number="filters.classId" class="input">
            <option :value="undefined">Toutes</option>
            <option v-for="c in classes.items" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
        <div>
          <label class="label">De</label>
          <input type="datetime-local" v-model="filters.from" class="input" />
        </div>
        <div>
          <label class="label">À</label>
          <input type="datetime-local" v-model="filters.to" class="input" />
        </div>
        <div class="flex items-end">
          <button class="btn-primary w-full" @click="load">Filtrer</button>
        </div>
      </div>
    </div>

    <div class="grid gap-3">
      <div v-for="s in sessions.items" :key="s.id" class="card flex items-center justify-between">
        <div>
          <div class="font-medium">{{ s.subject }}<span v-if="s.room" class="text-gray-500 text-sm"> • {{ s.room }}</span></div>
          <div class="text-sm text-gray-500">{{ s.startAt }} → {{ s.endAt }} • Classe #{{ s.classId }}</div>
        </div>
        <div class="flex gap-2">
          <RouterLink class="btn" :to="`/sessions/${s.id}`">Ouvrir</RouterLink>
          <button class="btn" @click="duplicate(s.id)">Dupliquer</button>
          <button class="btn-danger" @click="remove(s.id)">Supprimer</button>
        </div>
      </div>
    </div>

    <!-- Create Modal -->
    <div v-if="openCreate" class="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
      <div class="card w-full max-w-xl space-y-3">
        <h3 class="text-lg font-semibold">Nouvelle séance</h3>
        <div class="grid md:grid-cols-2 gap-3">
          <div>
            <label class="label">Classe</label>
            <select v-model.number="form.classId" class="input">
              <option v-for="c in classes.items" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>
          <div>
            <label class="label">Matière</label>
            <input v-model="form.subject" class="input" />
          </div>
          <div>
            <label class="label">Salle (optionnel)</label>
            <input v-model="form.room" class="input" />
          </div>
          <div>
            <label class="label">Début</label>
            <input type="datetime-local" v-model="form.startAt" class="input" />
          </div>
          <div>
            <label class="label">Fin</label>
            <input type="datetime-local" v-model="form.endAt" class="input" />
          </div>
          <div>
            <label class="label">Barème (min)</label>
            <input v-model.number="form.gradingScaleMin" type="number" class="input" />
          </div>
          <div>
            <label class="label">Barème (max)</label>
            <input v-model.number="form.gradingScaleMax" type="number" class="input" />
          </div>
        </div>
        <div class="flex justify-end gap-2">
          <button class="btn" @click="openCreate=false">Annuler</button>
          <button class="btn-primary" @click="create">Créer</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted, reactive, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useSessionsStore } from '../stores/sessions';
import { useClassesStore } from '../stores/classes';
import { useToastStore } from '../stores/toast';
import { handleError } from '../api';

const sessions = useSessionsStore();
const classes = useClassesStore();
const toast = useToastStore();

const filters = reactive({ classId: undefined, from: '', to: '' });
const openCreate = ref(false);
const form = reactive({
  classId: undefined,
  subject: 'EPS',
  room: '',
  startAt: new Date().toISOString().slice(0,16),
  endAt: new Date(Date.now()+60*60*1000).toISOString().slice(0,16),
  gradingScaleMin: 0,
  gradingScaleMax: 20
});

onMounted(async () => {
  await classes.fetch();
  if (classes.items[0]) form.classId = classes.items[0].id;
  await load();
});

async function load() {
  await sessions.fetch({ ...filters });
}

async function create() {
  try {
    if (!form.classId || !form.subject || !form.startAt || !form.endAt) return;
    await sessions.create({ ...form });
    toast.push('Séance créée ✔️');
    openCreate.value = false;
  } catch (e) {
    toast.push(`Erreur: ${handleError(e)}`, 'danger');
  }
}

async function duplicate(id) {
  try {
    await sessions.duplicate(id);
    toast.push('Séance dupliquée ✔️');
  } catch (e) {
    toast.push(`Erreur: ${handleError(e)}`, 'danger');
  }
}

async function remove(id) {
  if (!confirm('Supprimer cette séance ?')) return;
  try {
    await sessions.remove(id);
    toast.push('Séance supprimée ✔️');
  } catch (e) {
    toast.push(`Erreur: ${handleError(e)}`, 'danger');
  }
}
</script>
<style scoped>
.btn { @apply border rounded px-3 py-1.5 bg-white hover:bg-gray-50; }
.btn-primary { @apply rounded px-3 py-1.5 bg-primary text-white hover:bg-primary-700; }
.btn-danger { @apply border rounded px-3 py-1.5 bg-red-600 text-white hover:bg-red-700; }
</style>

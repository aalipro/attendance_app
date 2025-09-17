<template>
  <div class="space-y-4">
    <h2 class="text-xl font-semibold">Paramètres</h2>

    <div class="card space-y-3">
      <div class="grid md:grid-cols-2 gap-3">
        <div>
          <label class="label">Barème par défaut (min)</label>
          <input v-model.number="min" type="number" class="input" />
        </div>
        <div>
          <label class="label">Barème par défaut (max)</label>
          <input v-model.number="max" type="number" class="input" />
        </div>
      </div>
      <div class="text-sm text-gray-600">Ces valeurs sont utilisées par défaut lors de la création d'une séance.</div>
    </div>

    <div class="card space-y-3">
      <h3 class="font-semibold">Statuts activés</h3>
      <div class="flex flex-wrap gap-3 text-sm">
        <label class="inline-flex items-center gap-2"><input type="checkbox" v-model="statuses.PRESENT" />Présent</label>
        <label class="inline-flex items-center gap-2"><input type="checkbox" v-model="statuses.ABSENT" />Absent</label>
        <label class="inline-flex items-center gap-2"><input type="checkbox" v-model="statuses.RETARD" />Retard</label>
        <label class="inline-flex items-center gap-2"><input type="checkbox" v-model="statuses.DISPENSE" />Dispensé</label>
      </div>
      <div class="text-sm text-gray-600">Vous pouvez masquer des statuts non utilisés (effet sur l'UI ; la base accepte toujours tous les statuts).</div>
    </div>

    <div class="card space-y-3">
      <h3 class="font-semibold">Sauvegarde / Restauration</h3>
      <div class="flex gap-2">
        <button class="btn" @click="backup">Exporter JSON</button>
        <input type="file" accept="application/json" @change="restore" />
      </div>
      <div class="text-sm text-gray-600">Permet d'exporter/importer un dump JSON de la base (simplifié côté UI).</div>
    </div>

    <div class="card space-y-3">
      <h3 class="font-semibold">Séances</h3>
      <p class="text-sm text-gray-600">Supprimer toutes vos séances (présences, remarques et notes associées incluses).</p>
      <button class="btn-danger" :disabled="loading" @click="purgeSessions">Supprimer toutes les séances</button>
    </div>

    <div class="card space-y-3">
      <h3 class="font-semibold">Purge totale</h3>
      <p class="text-sm text-gray-600">Supprimer toutes vos classes, élèves et séances. Action irréversible.</p>
      <button class="btn-danger" :disabled="loading" @click="purgeAll">Supprimer toutes les classes, élèves et séances</button>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, watch } from 'vue';
import { api, handleError } from '../api';
import { useToastStore } from '../stores/toast';

const min = ref(0);
const max = ref(20);
const statuses = ref({ PRESENT: true, ABSENT: true, RETARD: true, DISPENSE: true });
const loading = ref(false);
const toast = useToastStore();

onMounted(() => {
  const s = JSON.parse(localStorage.getItem('settings') || '{}');
  if (s.min !== undefined) min.value = s.min;
  if (s.max !== undefined) max.value = s.max;
  if (s.statuses) statuses.value = s.statuses;
});

function save() {
  localStorage.setItem('settings', JSON.stringify({ min: min.value, max: max.value, statuses: statuses.value }));
}

function backup() {
  const data = localStorage.getItem('settings') || '{}';
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'parametres.json'; a.click(); URL.revokeObjectURL(url);
}

function restore(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const json = JSON.parse(reader.result);
      min.value = json.min ?? 0;
      max.value = json.max ?? 20;
      statuses.value = json.statuses ?? statuses.value;
      save();
    } catch {}
  };
  reader.readAsText(file);
}

// Auto-save
watch([min, max, statuses], save, { deep: true });

async function purgeSessions() {
  if (!confirm('Confirmer la suppression de toutes les séances ?')) return;
  loading.value = true;
  try {
    await api.delete('/settings/purge-sessions');
    toast.push('Toutes les séances ont été supprimées ✔️');
    setTimeout(() => window.location.reload(), 400);
  } catch (e) {
    toast.push('Erreur: ' + handleError(e), 'danger');
  } finally {
    loading.value = false;
  }
}

async function purgeAll() {
  if (!confirm('Cette action va supprimer toutes vos classes, élèves et séances. Continuer ?')) return;
  loading.value = true;
  try {
    await api.delete('/settings/purge-all');
    toast.push('Toutes vos données (classes, élèves, séances) ont été supprimées ✔️');
    setTimeout(() => window.location.reload(), 600);
  } catch (e) {
    toast.push('Erreur: ' + handleError(e), 'danger');
  } finally {
    loading.value = false;
  }
}
</script>
<style scoped>
.btn { @apply border rounded px-3 py-1.5 bg-white hover:bg-gray-50; }
.btn-danger { @apply border rounded px-3 py-1.5 bg-red-600 text-white hover:bg-red-700; }
.card { @apply bg-white rounded shadow p-4; }
</style>

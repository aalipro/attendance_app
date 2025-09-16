<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold">Élèves de la classe #{{ id }}</h2>
      <div class="flex gap-2">
        <button class="btn" @click="showAdd=true">+ Ajouter un élève</button>
        <button class="btn" @click="openImport=true">Importer CSV</button>
        <button class="btn-primary" @click="exportCsv">Exporter CSV</button>
      </div>
    </div>

    <div class="card">
      <div class="flex items-center gap-2 mb-3">
        <input v-model="q" class="input" placeholder="Rechercher..." aria-label="Recherche élève" />
      </div>
      <div class="overflow-auto">
        <table class="min-w-full text-sm">
          <thead class="bg-gray-50 text-left">
            <tr>
              <th class="px-3 py-2">Nom</th>
              <th class="px-3 py-2">Prénom</th>
              <th class="px-3 py-2">Email</th>
              <th class="px-3 py-2">Numéro</th>
              <th class="px-3 py-2 w-60"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in filtered" :key="s.id" class="border-b">
              <td class="px-3 py-2">{{ s.lastName }}</td>
              <td class="px-3 py-2">{{ s.firstName }}</td>
              <td class="px-3 py-2">{{ s.email || '—' }}</td>
              <td class="px-3 py-2">{{ s.studentNumber || '—' }}</td>
              <td class="px-3 py-2 text-right space-x-2">
                <button class="btn" @click="openView(s)">Consulter</button>
                <button class="btn" @click="startEdit(s)">Éditer</button>
                <button class="btn-danger" @click="remove(s.id)">Supprimer</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add Modal -->
    <div v-if="showAdd" class="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
      <div class="card w-full max-w-md space-y-3">
        <h3 class="text-lg font-semibold">Ajouter un élève</h3>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="label">Nom</label>
            <input v-model="form.lastName" class="input" />
          </div>
          <div>
            <label class="label">Prénom</label>
            <input v-model="form.firstName" class="input" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="label">Email</label>
            <input v-model="form.email" class="input" />
          </div>
          <div>
            <label class="label">Numéro</label>
            <input v-model="form.studentNumber" class="input" />
          </div>
        </div>
        <div class="flex justify-end gap-2">
          <button class="btn" @click="showAdd=false">Annuler</button>
          <button class="btn-primary" @click="create">Créer</button>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="showEdit" class="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
      <div class="card w-full max-w-md space-y-3">
        <h3 class="text-lg font-semibold">Modifier l'élève</h3>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="label">Nom</label>
            <input v-model="form.lastName" class="input" />
          </div>
          <div>
            <label class="label">Prénom</label>
            <input v-model="form.firstName" class="input" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="label">Email</label>
            <input v-model="form.email" class="input" />
          </div>
          <div>
            <label class="label">Numéro</label>
            <input v-model="form.studentNumber" class="input" />
          </div>
        </div>
        <div class="flex justify-end gap-2">
          <button class="btn" @click="showEdit=false">Annuler</button>
          <button class="btn-primary" @click="update">Enregistrer</button>
        </div>
      </div>
    </div>

    <!-- Import Modal -->
    <div v-if="openImport" class="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
      <div class="card w-full max-w-lg space-y-3">
        <h3 class="text-lg font-semibold">Importer CSV</h3>
        <p class="text-sm text-gray-600">Entêtes attendues: <code>prenom;nom;email;numero</code> (UTF-8 avec BOM)</p>
        <textarea v-model="csv" rows="8" class="w-full input h-48"></textarea>
        <div class="flex justify-end gap-2">
          <button class="btn" @click="openImport=false">Annuler</button>
          <button class="btn-primary" @click="importCsv">Importer</button>
        </div>
      </div>
    </div>

    <!-- View (Student Details) Modal -->
    <div v-if="showView" class="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
      <div class="card w-full max-w-2xl space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">Détails élève</h3>
          <button class="btn" @click="showView=false">Fermer</button>
        </div>
        <div v-if="selectedStudent" class="space-y-2">
          <div class="text-sm text-gray-600">{{ selectedStudent.lastName.toUpperCase() }} {{ selectedStudent.firstName }}</div>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div class="card">
              <div class="text-xs text-gray-500">Présences</div>
              <div class="text-xl font-semibold">{{ studentStats?.counts?.PRESENT ?? 0 }}</div>
            </div>
            <div class="card">
              <div class="text-xs text-gray-500">Absences</div>
              <div class="text-xl font-semibold">{{ studentStats?.counts?.ABSENT ?? 0 }}</div>
            </div>
            <div class="card">
              <div class="text-xs text-gray-500">Retards</div>
              <div class="text-xl font-semibold">{{ studentStats?.counts?.RETARD ?? 0 }}</div>
            </div>
            <div class="card">
              <div class="text-xs text-gray-500">Dispensés</div>
              <div class="text-xl font-semibold">{{ studentStats?.counts?.DISPENSE ?? 0 }}</div>
            </div>
          </div>
          <div class="card">
            <div class="text-xs text-gray-500">Moyenne des notes (toutes séances)</div>
            <div class="text-xl font-semibold">{{ studentStats?.avgGrade == null ? '—' : Number(studentStats.avgGrade).toFixed(1) }}</div>
          </div>
          <div class="space-y-2">
            <label class="label">Appréciation générale</label>
            <textarea v-model="generalRemark" rows="4" class="input"></textarea>
            <div class="flex justify-end">
              <button class="btn-primary" @click="saveGeneralRemark">Enregistrer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useStudentsStore } from '../stores/students';
import { useToastStore } from '../stores/toast';
import { api } from '../api';

const route = useRoute();
const id = Number(route.params.id);
const students = useStudentsStore();
const toast = useToastStore();
const q = ref('');

const showAdd = ref(false);
const showEdit = ref(false);
const showView = ref(false);
const openImport = ref(false);
const editingId = ref(null);
const form = reactive({ firstName: '', lastName: '', email: '', studentNumber: '' });
const csv = ref('');
const importing = ref(false);
const selectedStudent = ref(null);
const studentStats = ref(null);
const generalRemark = ref('');

onMounted(() => {
  if (Number.isFinite(id)) {
    students.fetchByClass(id);
  }
});

const filtered = computed(() => {
  const list = students.forClass(id);
  return list.filter((s) => `${s.firstName} ${s.lastName}`.toLowerCase().includes(q.value.toLowerCase()));
});

async function create() {
  try {
    if (!form.firstName || !form.lastName) return;
    await students.create({ ...form, classId: id });
    toast.push('Élève ajouté ✔️');
    showAdd.value = false;
    Object.assign(form, { firstName: '', lastName: '', email: '', studentNumber: '' });
  } catch (e) {
    toast.push('Erreur: impossible d\'ajouter l\'élève', 'danger');
  }
}

function startEdit(s) {
  editingId.value = s.id;
  Object.assign(form, s);
  showEdit.value = true;
}

async function update() {
  try {
    await students.update(editingId.value, { ...form });
    toast.push('Élève mis à jour ✔️');
    showEdit.value = false;
  } catch (e) {
    toast.push('Erreur: mise à jour impossible', 'danger');
  }
}

async function remove(studentId) {
  if (!confirm('Supprimer cet élève ?')) return;
  try {
    await students.remove(studentId, id);
    toast.push('Élève supprimé ✔️');
  } catch (e) {
    toast.push('Erreur: suppression impossible', 'danger');
  }
}

async function importCsv() {
  if (!csv.value.trim()) return;
  importing.value = true;
  try {
    await students.importCsv(id, csv.value);
    await students.fetchByClass(id);
    openImport.value = false;
    csv.value = '';
    toast.push('Les élèves ont été importés avec succès ✔️');
  } catch (e) {
    toast.push('Erreur: import CSV impossible', 'danger');
  } finally {
    importing.value = false;
  }
}

async function exportCsv() {
  const blob = await students.exportCsv(id);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `eleves_classe_${id}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function openView(s) {
  selectedStudent.value = s;
  generalRemark.value = s.generalRemark || '';
  showView.value = true;
  loadStudentStats(s.id);
}

async function loadStudentStats(studentId) {
  try {
    const { data } = await api.get(`/stats/student/${studentId}`);
    studentStats.value = data;
  } catch (e) {
    studentStats.value = null;
  }
}

async function saveGeneralRemark() {
  if (!selectedStudent.value) return;
  try {
    const updated = await students.update(selectedStudent.value.id, { generalRemark: generalRemark.value });
    // Mettre à jour la sélection courante avec la valeur sauvegardée
    selectedStudent.value = { ...selectedStudent.value, generalRemark: updated.generalRemark };
    toast.push('Appréciation enregistrée ✔️');
  } catch (e) {
    toast.push('Erreur: enregistrement de l\'appréciation impossible', 'danger');
  }
}
</script>
<style scoped>
.btn { @apply border rounded px-3 py-1.5 bg-white hover:bg-gray-50; }
.btn-primary { @apply rounded px-3 py-1.5 bg-primary text-white hover:bg-primary-700; }
.btn-danger { @apply border rounded px-3 py-1.5 bg-red-600 text-white hover:bg-red-700; }
</style>

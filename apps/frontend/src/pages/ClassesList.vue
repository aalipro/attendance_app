<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold">Classes</h2>
      <button class="border rounded px-3 py-1.5 bg-white hover:bg-gray-50" @click="showCreate=true">+ Nouvelle classe</button>
    </div>

    <div class="grid gap-3 md:grid-cols-2">
      <div v-for="c in classes.items" :key="c.id" class="card flex items-center justify-between">
        <div>
          <div class="font-medium">{{ c.name }}</div>
          <div class="text-sm text-gray-500">{{ c.level }} • {{ c.year }}</div>
        </div>
        <div class="flex gap-2">
          <RouterLink class="btn" :to="`/classes/${c.id}`">Ouvrir</RouterLink>
          <button class="btn" @click="edit(c)">Éditer</button>
          <button class="btn-danger" @click="remove(c.id)">Supprimer</button>
        </div>
      </div>
    </div>

    <!-- Create Modal -->
    <div v-if="showCreate" class="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
      <div class="card w-full max-w-md space-y-3">
        <h3 class="text-lg font-semibold">Nouvelle classe</h3>
        <div>
          <label class="label">Nom</label>
          <input v-model="form.name" class="input" />
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="label">Niveau</label>
            <input v-model="form.level" class="input" />
          </div>
          <div>
            <label class="label">Année</label>
            <input v-model.number="form.year" type="number" class="input" />
          </div>
        </div>
        <div class="flex justify-end gap-2">
          <button class="btn" @click="showCreate=false">Annuler</button>
          <button class="btn-primary" @click="create">Créer</button>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="showEdit" class="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
      <div class="card w-full max-w-md space-y-3">
        <h3 class="text-lg font-semibold">Modifier la classe</h3>
        <div>
          <label class="label">Nom</label>
          <input v-model="form.name" class="input" />
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="label">Niveau</label>
            <input v-model="form.level" class="input" />
          </div>
          <div>
            <label class="label">Année</label>
            <input v-model.number="form.year" type="number" class="input" />
          </div>
        </div>
        <div class="flex justify-end gap-2">
          <button class="btn" @click="showEdit=false">Annuler</button>
          <button class="btn-primary" @click="update">Enregistrer</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted, reactive, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useClassesStore } from '../stores/classes';
import { useToastStore } from '../stores/toast';

const classes = useClassesStore();
const toast = useToastStore();
const showCreate = ref(false);
const showEdit = ref(false);
const editingId = ref(null);
const form = reactive({ name: '', level: 'Terminale', year: new Date().getFullYear() });

onMounted(() => classes.fetch());

async function create() {
  if (!form.name) return;
  await classes.create({ name: form.name, level: form.level, year: form.year });
  toast.push('Classe créée ✔️');
  showCreate.value = false;
  Object.assign(form, { name: '', level: 'Terminale', year: new Date().getFullYear() });
}

function edit(c) {
  editingId.value = c.id;
  Object.assign(form, { name: c.name, level: c.level, year: c.year });
  showEdit.value = true;
}

async function update() {
  await classes.update(editingId.value, { name: form.name, level: form.level, year: form.year });
  toast.push('Classe mise à jour ✔️');
  showEdit.value = false;
}

async function remove(id) {
  if (!confirm('Supprimer cette classe ?')) return;
  await classes.remove(id);
  toast.push('Classe supprimée ✔️');
}
</script>
<style scoped>
.btn { @apply border rounded px-3 py-1.5 bg-white hover:bg-gray-50; }
.btn-primary { @apply rounded px-3 py-1.5 bg-primary text-white hover:bg-primary-700; }
.btn-danger { @apply border rounded px-3 py-1.5 bg-red-600 text-white hover:bg-red-700; }
</style>

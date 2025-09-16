<template>
  <div class="space-y-4">
    <h2 class="text-xl font-semibold">Statistiques</h2>

    <div class="card grid md:grid-cols-4 gap-3">
      <div>
        <label class="label">Classe</label>
        <select v-model.number="selClass" class="input">
          <option :value="undefined">—</option>
          <option v-for="c in classes.items" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </div>
      <div>
        <label class="label">Élève</label>
        <select v-model.number="selStudent" class="input">
          <option :value="undefined">—</option>
          <option v-for="s in students.forClass(selClass)" :key="s.id" :value="s.id">{{ s.lastName }} {{ s.firstName }}</option>
        </select>
      </div>
      <div>
        <label class="label">De</label>
        <input type="datetime-local" v-model="from" class="input" />
      </div>
      <div>
        <label class="label">À</label>
        <input type="datetime-local" v-model="to" class="input" />
      </div>
      <div class="md:col-span-4 flex justify-end">
        <button class="btn-primary" @click="load">Actualiser</button>
      </div>
    </div>

    <div class="grid md:grid-cols-2 gap-4">
      <div class="space-y-2">
        <h3 class="font-semibold">Par classe</h3>
        <StatsCards :stats="classStats" />
      </div>
      <div class="space-y-2">
        <h3 class="font-semibold">Par élève</h3>
        <StatsCards :stats="studentStats || {}" />
      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted, ref, watch } from 'vue';
import { useClassesStore } from '../stores/classes';
import { useStudentsStore } from '../stores/students';
import { api } from '../api';
import StatsCards from '../components/StatsCards.vue';

const classes = useClassesStore();
const students = useStudentsStore();

const selClass = ref();
const selStudent = ref();
const from = ref('');
const to = ref('');

const classStats = ref({ sessionsCount: 0, presenceRate: 0, avgGrade: null, absences: 0, late: 0 });
const studentStats = ref(null);

onMounted(async () => {
  await classes.fetch();
  if (classes.items[0]) {
    selClass.value = classes.items[0].id;
    await students.fetchByClass(selClass.value);
    await load();
  }
});

watch(selClass, async (v) => {
  if (v) await students.fetchByClass(v);
});

async function load() {
  const params = { from: from.value || undefined, to: to.value || undefined };
  if (selClass.value) {
    classStats.value = (await api.get(`/stats/class/${selClass.value}`, { params })).data;
  }
  if (selStudent.value) {
    studentStats.value = (await api.get(`/stats/student/${selStudent.value}`, { params })).data;
  } else {
    studentStats.value = null;
  }
}
</script>
<style scoped>
.btn-primary { @apply rounded px-3 py-1.5 bg-primary text-white hover:bg-primary-700; }
</style>

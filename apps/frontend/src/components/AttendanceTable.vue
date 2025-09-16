<template>
  <div class="card">
    <div class="flex flex-col md:flex-row md:items-center gap-2 mb-3">
      <input class="input md:w-64" placeholder="Rechercher un élève..." v-model="q" aria-label="Recherche élève" />
      <div class="flex gap-2 text-sm">
        <button class="btn-filter" :class="{active: filter==='ALL'}" @click="filter='ALL'">Tous</button>
        <button class="btn-filter" :class="{active: filter==='PRESENT'}" @click="filter='PRESENT'">Présents</button>
        <button class="btn-filter" :class="{active: filter==='ABSENT'}" @click="filter='ABSENT'">Absents</button>
        <button class="btn-filter" :class="{active: filter==='RETARD'}" @click="filter='RETARD'">Retards</button>
        <button class="btn-filter" :class="{active: filter==='DISPENSE'}" @click="filter='DISPENSE'">Dispensés</button>
      </div>
      <div class="ml-auto text-sm text-gray-600" v-if="stats">
        Présence: <span class="font-semibold">{{ stats.presenceRate }}%</span>
      </div>
    </div>

    <div class="overflow-auto max-h-[70vh] border rounded">
      <table class="min-w-full text-sm">
        <thead class="sticky top-0 bg-gray-50 border-b text-left">
          <tr>
            <th class="px-3 py-2">Nom</th>
            <th class="px-3 py-2 w-40">Statut</th>
            <th class="px-3 py-2 w-28">Note</th>
            <th class="px-3 py-2">Remarque</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in filtered" :key="row.studentId" class="border-b hover:bg-gray-50">
            <td class="px-3 py-2 whitespace-nowrap">{{ row.lastName.toUpperCase() }} {{ row.firstName }}</td>
            <td class="px-3 py-2">
              <StatusToggle :model-value="row.status" @update:modelValue="$emit('update-status', row.studentId, $event)" />
            </td>
            <td class="px-3 py-2">
              <div class="space-y-2">
                <GradeInput :model-value="row.grade" :min="min" :max="max" @update:modelValue="onGradeChange(row.studentId, $event)" />
                <button v-if="dirtyGrades.has(row.studentId)" class="text-xs rounded px-2 py-1 bg-primary text-white hover:bg-primary-700" @click="onValidateGrade(row.studentId)">Valider</button>
              </div>
            </td>
            <td class="px-3 py-2">
              <div class="space-y-2">
                <RemarkEditor :model-value="row.remark" :aria-label="`Remarque pour ${row.firstName} ${row.lastName}`" @update:modelValue="onRemarkChange(row.studentId, $event)" />
                <button v-if="dirtyRemarks.has(row.studentId)" class="text-xs rounded px-2 py-1 bg-primary text-white hover:bg-primary-700" @click="onValidateRemark(row.studentId)">Valider</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script setup>
import { computed, ref } from 'vue';
import StatusToggle from './StatusToggle.vue';
import GradeInput from './GradeInput.vue';
import RemarkEditor from './RemarkEditor.vue';

const props = defineProps({
  rows: { type: Array, default: () => [] },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 20 },
  stats: { type: Object, default: null }
});

const emit = defineEmits(['update-status', 'update-grade', 'update-remark', 'validate-grade', 'validate-remark']);

const q = ref('');
const filter = ref('ALL');

const filtered = computed(() => {
  return props.rows.filter((r) => {
    const matches = `${r.firstName} ${r.lastName}`.toLowerCase().includes(q.value.toLowerCase());
    const byStatus = filter.value === 'ALL' ? true : r.status === filter.value;
    return matches && byStatus;
  });
});

// Dirty tracking for grade/remark per student
const dirtyGrades = ref(new Set());
const dirtyRemarks = ref(new Set());

function onGradeChange(studentId, value) {
  dirtyGrades.value.add(studentId);
  emit('update-grade', studentId, value);
}
function onRemarkChange(studentId, text) {
  dirtyRemarks.value.add(studentId);
  emit('update-remark', studentId, text);
}
function onValidateGrade(studentId) {
  emit('validate-grade', studentId);
  dirtyGrades.value.delete(studentId);
}
function onValidateRemark(studentId) {
  emit('validate-remark', studentId);
  dirtyRemarks.value.delete(studentId);
}
</script>
<style scoped>
.btn-filter { @apply border rounded px-3 py-1 bg-white hover:bg-gray-50; }
.btn-filter.active { @apply bg-gray-100; }
</style>

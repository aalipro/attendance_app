<template>
  <div class="space-y-4" v-if="sessionId">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold">Séance #{{ sessionId }}</h2>
      <div class="flex gap-2">
        <button class="btn" @click="exportCsv">Exporter CSV</button>
        <button class="btn" @click="exportPdf">Exporter PDF</button>
      </div>
    </div>

    <div class="card grid md:grid-cols-4 gap-3 items-end">
      <div>
        <div class="label">Matière</div>
        <div class="font-medium">{{ session?.subject || '—' }}</div>
      </div>
      <div>
        <div class="label">Salle</div>
        <div class="font-medium">{{ session?.room || '—' }}</div>
      </div>
      <div>
        <div class="label">Début → Fin</div>
        <div class="font-medium">{{ session?.startAt }} → {{ session?.endAt }}</div>
      </div>
      <div>
        <div class="label">Barème</div>
        <div class="font-medium">{{ session?.gradingScaleMin ?? 0 }} – {{ session?.gradingScaleMax ?? 20 }}</div>
      </div>
    </div>

    <div class="card">
      <div class="flex gap-3 border-b">
        <button :class="tabBtn('appel')" @click="tab='appel'">Appel</button>
        <button :class="tabBtn('remarques')" @click="tab='remarques'">Remarques</button>
        <button :class="tabBtn('notes')" @click="tab='notes'">Notes</button>
      </div>
      <div class="pt-4">
        <template v-if="tab==='appel'">
          <div class="flex justify-end mb-3 gap-2">
            <button class="rounded px-3 py-1.5 border bg-white hover:bg-gray-50" @click="markAll()" :disabled="attendance.saving">
              Tout le monde présent
            </button>
            <button class="rounded px-3 py-1.5 bg-primary text-white hover:bg-primary-700" @click="validateAll" :disabled="attendance.saving">
              Valider les présences
            </button>
          </div>
          <AttendanceTable
            :rows="rows"
            :min="session?.gradingScaleMin ?? 0"
            :max="session?.gradingScaleMax ?? 20"
            :stats="stats"
            @update-status="onUpdateStatus"
            @update-grade="onUpdateGrade"
            @update-remark="onUpdateRemark"
            @validate-grade="onValidateGrade"
            @validate-remark="onValidateRemark"
          />
        </template>
        <template v-else-if="tab==='remarques'">
          <div class="space-y-2">
            <div class="text-sm text-gray-600">Remarque de séance</div>
            <RemarkEditor :model-value="sessionRemark" aria-label="Remarque de séance" @update:modelValue="setSessionRemark" />
          </div>
        </template>
        <template v-else>
          <div class="space-y-2">
            <div class="text-sm text-gray-600">Notes (barème {{ session?.gradingScaleMin ?? 0 }}–{{ session?.gradingScaleMax ?? 20 }})</div>
            <div class="overflow-auto">
              <table class="min-w-full text-sm">
                <thead class="bg-gray-50 text-left">
                  <tr>
                    <th class="px-3 py-2">Élève</th>
                    <th class="px-3 py-2 w-28">Note</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in rows" :key="row.studentId" class="border-b">
                    <td class="px-3 py-2">{{ row.lastName.toUpperCase() }} {{ row.firstName }}</td>
                    <td class="px-3 py-2">
                      <GradeInput :model-value="row.grade" :min="session?.gradingScaleMin ?? 0" :max="session?.gradingScaleMax ?? 20" @update:modelValue="(v)=>onUpdateGrade(row.studentId,v)" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="mt-3">
              <StatsCards :stats="gradeStats" />
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import AttendanceTable from '../components/AttendanceTable.vue';
import RemarkEditor from '../components/RemarkEditor.vue';
import GradeInput from '../components/GradeInput.vue';
import StatsCards from '../components/StatsCards.vue';
import { useAttendanceStore } from '../stores/attendance';
import { useSessionsStore } from '../stores/sessions';
import { api } from '../api';

const route = useRoute();
const sessionId = Number(route.params.id);
const tab = ref('appel');
const attendance = useAttendanceStore();
const sessions = useSessionsStore();

const rows = computed(() => attendance.forSession(sessionId));
const session = computed(() => sessions.items.find((s) => s.id === sessionId));

const sessionRemark = computed({
  get: () => attendance.sessionRemark[sessionId] ?? (session.value?.sessionRemark || ''),
  set: (v) => attendance.setLocalSessionRemark(sessionId, v),
});

const stats = computed(() => {
  const list = rows.value;
  if (!list.length) return { presenceRate: 0 };
  const total = list.length;
  const present = list.filter((r) => r.status === 'PRESENT').length;
  return { presenceRate: Math.round((present / total) * 100) };
});

const gradeStats = computed(() => {
  const vals = rows.value.map((r) => r.grade).filter((v) => typeof v === 'number');
  if (!vals.length) return { avgGrade: null, sessionsCount: 1, presenceRate: stats.value.presenceRate };
  const avg = vals.reduce((a,b)=>a+b,0)/vals.length;
  // Simple stddev (population)
  const variance = vals.reduce((a,v)=>a+Math.pow(v-avg,2),0)/vals.length;
  const std = Math.sqrt(variance);
  return { avgGrade: avg, std, sessionsCount: 1, presenceRate: stats.value.presenceRate };
});

onMounted(async () => {
  if (!sessions.items.length) await sessions.fetch();
  await attendance.fetch(sessionId);
});

function onUpdateStatus(studentId, status) {
  attendance.setLocalStatus(sessionId, studentId, status);
}
function onUpdateGrade(studentId, value) {
  attendance.setLocalGrade(sessionId, studentId, value);
}
function onUpdateRemark(studentId, text) {
  attendance.setLocalRemark(sessionId, studentId, text);
}
function setSessionRemark(text) {
  attendance.setLocalSessionRemark(sessionId, text);
}

async function validateAll() {
  await attendance.bulkSave(sessionId);
}

function markAll() {
  attendance.markAllPresent(sessionId);
}

function onValidateGrade(studentId) {
  const row = rows.value.find((r) => r.studentId === studentId);
  if (!row) return;
  attendance.saveGradeNow(sessionId, studentId, row.grade);
}
function onValidateRemark(studentId) {
  const row = rows.value.find((r) => r.studentId === studentId);
  if (!row) return;
  attendance.saveStudentRemarkNow(sessionId, studentId, row.remark || '');
}

async function exportCsv() {
  const res = await api.get(`/sessions/${sessionId}/export/csv`, { responseType: 'blob' });
  const url = URL.createObjectURL(res.data);
  const a = document.createElement('a');
  a.href = url; a.download = `seance_${sessionId}.csv`; a.click(); URL.revokeObjectURL(url);
}
async function exportPdf() {
  const res = await api.get(`/sessions/${sessionId}/export/pdf`, { responseType: 'blob' });
  const url = URL.createObjectURL(res.data);
  const a = document.createElement('a');
  a.href = url; a.download = `appel_seance_${sessionId}.pdf`; a.click(); URL.revokeObjectURL(url);
}

function tabBtn(name){
  return name===tab.value ? 'px-3 py-2 border-b-2 border-primary font-medium' : 'px-3 py-2 text-gray-600 hover:text-gray-800';
}
</script>
<style scoped>
.btn { @apply border rounded px-3 py-1.5 bg-white hover:bg-gray-50; }
</style>

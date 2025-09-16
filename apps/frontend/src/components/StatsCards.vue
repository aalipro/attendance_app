<template>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
    <div class="card">
      <div class="text-xs text-gray-500">Séances</div>
      <div class="text-2xl font-semibold">{{ stats.sessionsCount ?? stats.totalSessionsMarked ?? 0 }}</div>
    </div>
    <div class="card">
      <div class="text-xs text-gray-500">Taux de présence</div>
      <div class="text-2xl font-semibold">{{ (stats.presenceRate ?? 0).toFixed(0) }}%</div>
    </div>
    <div class="card">
      <div class="text-xs text-gray-500">Moyenne des notes</div>
      <div class="text-2xl font-semibold">{{ stats.avgGrade === null || stats.avgGrade === undefined ? '—' : Number(stats.avgGrade).toFixed(1) }}</div>
    </div>
    <div class="card">
      <div class="text-xs text-gray-500">Retards / Absences</div>
      <div class="text-2xl font-semibold">{{ stats.late ?? stats.counts?.RETARD ?? 0 }} / {{ stats.absences ?? stats.counts?.ABSENT ?? 0 }}</div>
    </div>
  </div>
</template>
<script setup>
defineProps({ stats: { type: Object, default: () => ({}) } });
</script>

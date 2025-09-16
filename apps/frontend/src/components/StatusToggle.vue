<template>
  <button
    class="px-2 py-1 rounded border w-full text-left focus:outline-none focus:ring-2 focus:ring-primary"
    :class="{
      'bg-green-50 border-green-600 text-green-700': modelValue === 'PRESENT',
      'bg-red-50 border-red-600 text-red-700': modelValue === 'ABSENT',
      'bg-yellow-50 border-yellow-600 text-yellow-700': modelValue === 'RETARD',
      'bg-blue-50 border-blue-600 text-blue-700': modelValue === 'DISPENSE'
    }"
    @click="cycle"
    @keydown.space.prevent="cycle"
    :aria-label="`Statut: ${label}`"
  >
    <span class="font-medium">{{ label }}</span>
  </button>
</template>
<script setup>
import { computed } from 'vue';
const props = defineProps({ modelValue: { type: String, default: 'ABSENT' } });
const emit = defineEmits(['update:modelValue']);
// Ordre de cycle demandé: ABSENT -> PRESENT -> RETARD -> DISPENSE
const statuses = ['ABSENT', 'PRESENT', 'RETARD', 'DISPENSE'];
function cycle() {
  const idx = statuses.indexOf(props.modelValue);
  const next = statuses[(idx + 1) % statuses.length];
  emit('update:modelValue', next);
}
const label = computed(() => {
  switch (props.modelValue) {
    case 'PRESENT': return 'Présent';
    case 'ABSENT': return 'Absent';
    case 'RETARD': return 'Retard';
    case 'DISPENSE': return 'Dispensé';
    default: return '—';
  }
});
</script>

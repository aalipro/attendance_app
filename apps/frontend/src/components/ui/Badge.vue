<template>
  <span class="px-2 py-0.5 text-xs rounded" :class="cls"><slot /></span>
</template>
<script setup>
import { computed } from 'vue';
const props = defineProps({ kind: { type: String, default: 'neutral' } });
const cls = computed(() => {
  switch (props.kind) {
    case 'success':
      return 'bg-green-100 text-green-800';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800';
    case 'danger':
      return 'bg-red-100 text-red-800';
    case 'info':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
});
</script>

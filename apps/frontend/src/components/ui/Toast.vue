<template>
  <div class="fixed bottom-4 right-4 space-y-2 z-50">
    <div
      v-for="t in items"
      :key="t.id"
      class="rounded px-3 py-2 shadow text-sm"
      :style="{ background: 'var(--toast-bg)', color: 'var(--toast-fg)' }"
      role="status"
      aria-live="polite"
    >
      {{ t.message }}
    </div>
  </div>
</template>
<script setup>
import { storeToRefs } from 'pinia';
import { useToastStore } from '../../stores/toast';
const store = useToastStore();
const { items } = storeToRefs(store);
</script>

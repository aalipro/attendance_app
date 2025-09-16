<template>
  <button
    class="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-primary text-white hover:bg-primary-700 disabled:opacity-50"
    :disabled="disabled"
    :aria-disabled="disabled ? 'true' : 'false'"
  >
    <slot />
  </button>
</template>
<script setup>
defineProps({ disabled: { type: Boolean, default: false } });
</script>

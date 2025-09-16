<template>
  <div>
    <textarea
      class="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary"
      rows="3"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :maxlength="maxLength"
      :aria-label="ariaLabel"
    />
    <div class="text-xs text-gray-500 text-right">{{ (modelValue || '').length }}/{{ maxLength }}</div>
  </div>
</template>
<script setup>
defineProps({
  modelValue: { type: String, default: '' },
  maxLength: { type: Number, default: 500 },
  ariaLabel: { type: String, default: 'Remarque' }
});
</script>

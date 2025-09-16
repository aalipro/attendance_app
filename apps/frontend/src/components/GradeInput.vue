<template>
  <input
    class="w-20 border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
    type="number"
    :min="min"
    :max="max"
    step="1"
    :value="modelValue ?? ''"
    @input="onInput"
    :aria-label="`Note (min ${min} max ${max})`"
  />
</template>
<script setup>
const props = defineProps({
  modelValue: { type: [Number, null], default: null },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 20 }
});
const emit = defineEmits(['update:modelValue']);
function onInput(e) {
  const v = e.target.value;
  if (v === '') return emit('update:modelValue', null);
  let n = Number(v);
  if (!Number.isFinite(n)) n = props.min;
  if (n < props.min) n = props.min;
  if (n > props.max) n = props.max;
  emit('update:modelValue', n);
}
</script>

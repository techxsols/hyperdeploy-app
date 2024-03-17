<template>
  <textarea
    :value="modelValue"
    @input="handleInput"
  />
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void;
}>();

function handleInput(event: Event): void {
  emit('update:modelValue', (event.target as HTMLInputElement).value);
}
</script>

<style scoped>
textarea {
  padding: 4px 8px;
  border: 1px solid var(--color-border);
  border-radius: 2px;
  background: #0b0c0f;
  color: #bbc1c8;
  cursor: pointer;
}

textarea:focus {
  border-color: var(--color-border-light);
  outline: none;
}
</style>

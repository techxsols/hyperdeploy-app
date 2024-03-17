<template>
  <button :class="{ primary }">
    <slot />
  </button>
</template>

<script setup lang="ts">
defineProps<{
  primary?: boolean;
}>();
</script>

<style scoped>
button {
  padding: 4px 8px;
  border: none;
  border-radius: 2px;
  background: #171b27;
  color: #bbc1c8;
  cursor: pointer;
}

button.primary {
  background: #9fb0e2;
  color: #0c0c0d;
}

button:hover {
  background: #1c2130;
}

button.primary:hover {
  background: #acbcec;
}

button:disabled {
  opacity: 0.5;
}
</style>

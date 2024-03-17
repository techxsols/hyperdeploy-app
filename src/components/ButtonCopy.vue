<template>
  <div
    class="button"
    @click="copy"
  >
    <Icon
      v-if="ready"
      icon="radix-icons:copy"
    />
    <Icon
      v-else
      icon="radix-icons:check"
    />
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { useTimeout } from '@vueuse/core';
import { onMounted } from 'vue';

const props = defineProps<{
  value: string;
}>();

onMounted(() => {
  stop();
});

const { ready, start, stop } = useTimeout(2000, { controls: true });

function copy(): void {
  navigator.clipboard.writeText(props.value);
  start();
}
</script>

<style scoped>
.button {
  padding: 8px;
  border: 1px solid var(--color-border);
  border-radius: 2px;
  cursor: pointer;
}

.button:hover {
  background: var(--color-background-light);
}

.button.compact {
  padding: 2px;
  border: none;
}

.icon {
  width: 16px;
  height: 16px;
}

.icon.compact {
  width: 12px;
  height: 12px;
}
</style>

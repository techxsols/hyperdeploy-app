<template>
  <Dialog.Root
    :open="open"
    @update:open="handleUpdateOpen"
  >
    <Dialog.Portal>
      <Dialog.Overlay class="overlay" />
      <Dialog.Content class="content">
        <Dialog.Title class="title">Log In</Dialog.Title>
        <Dialog.Description>
          <input
            v-model="passphrase"
            placeholder="Passphrase"
          />
          <button @click="generatePassphrase">Generate</button>
          <button
            :disabled="!passphrase"
            @click="handleLogin"
          >
            Log In
          </button>
        </Dialog.Description>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
</template>

<script setup lang="ts">
import { Dialog } from 'radix-vue/namespaced';
import { ref } from 'vue';

import useAccount from '@/composables/useAccount';
import { getNoun } from '@/utils/words';

const { login } = useAccount();

defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

function handleUpdateOpen(value: boolean): void {
  if (!value) {
    emit('close');
  }
}

function handleLogin(): void {
  login(passphrase.value);
  passphrase.value = '';
  emit('close');
}

function getRandomPassphrase(): string {
  // 4 random nouns, split by dash
  const indices = [];
  for (let i = 0; i < 4; i++) {
    const index = Math.floor(Math.random() * 1_000_000);
    indices.push(index);
  }
  return (
    getNoun(indices[0]) +
    '-' +
    getNoun(indices[1]) +
    '-' +
    getNoun(indices[2]) +
    '-' +
    getNoun(indices[3])
  );
}

function generatePassphrase(): void {
  passphrase.value = getRandomPassphrase();
}

const passphrase = ref('');
</script>

<style scoped>
.overlay {
  position: fixed;
  animation: overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1);
  background: #0008;
  inset: 0;
}

.content {
  position: fixed;
  top: 50%;
  left: 50%;
  width: 90vw;
  max-width: 450px;
  max-height: 85vh;
  padding: 25px;
  transform: translate(-50%, -50%);
  animation: contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1);
  border-radius: 6px;
  background-color: white;
  box-shadow:
    hsl(206deg 22% 7% / 35%) 0 10px 38px -10px,
    hsl(206deg 22% 7% / 20%) 0 10px 20px -15px;
}

.content:focus {
  outline: none;
}

.title {
  margin: 0;
  color: hsl(206deg 22% 7% / 100%);
  font-size: 17px;
  font-weight: 500;
}
</style>

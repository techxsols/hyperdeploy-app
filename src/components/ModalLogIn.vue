<template>
  <Dialog.Root
    :open="open"
    @update:open="handleUpdateOpen"
  >
    <Dialog.Portal>
      <Dialog.Overlay class="overlay" />
      <Dialog.Content class="content">
        <Dialog.Title class="title">Log In</Dialog.Title>
        <Dialog.Description class="description">
          <div class="passphrase">
            <HyperInput
              v-model="passphrase"
              placeholder="Passphrase"
              class="passphrase-input"
            />
            <HyperButton @click="generatePassphrase">Generate</HyperButton>
          </div>
          <div>
            <HyperButton
              :disabled="!passphrase"
              primary
              @click="handleLogin"
            >
              Log In
            </HyperButton>
          </div>
        </Dialog.Description>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
</template>

<script setup lang="ts">
import { Dialog } from 'radix-vue/namespaced';
import { ref } from 'vue';

import HyperButton from '@/components/HyperButton.vue';
import HyperInput from '@/components/HyperInput.vue';
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
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-background);
  box-shadow:
    hsl(206deg 22% 7% / 35%) 0 10px 38px -10px,
    hsl(206deg 22% 7% / 20%) 0 10px 20px -15px;
  color: var(--color-text-primary);
}

.content:focus {
  outline: none;
}

.title {
  margin: 0;
  font-size: 17px;
  font-weight: 500;
}

.description {
  display: flex;
  gap: 16px;
  flex-direction: column;
  margin: 32px 0 0;
}

.passphrase {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.passphrase-input {
  flex: 1;
}
</style>

<template>
  <Dialog.Root
    :open="open"
    @update:open="handleUpdateOpen"
  >
    <Dialog.Portal>
      <Dialog.Overlay class="overlay" />
      <Dialog.Content class="content">
        <Dialog.Title class="title">Account</Dialog.Title>
        <Dialog.Description>
          <div>Address</div>
          <div class="address">{{ address }}</div>
          <button @click="handleLogout">Log Out</button>
        </Dialog.Description>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
</template>

<script setup lang="ts">
import { Dialog } from 'radix-vue/namespaced';

import useAccount from '@/composables/useAccount';

const { address, logout } = useAccount();

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

function handleLogout(): void {
  logout();
  emit('close');
}
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

.address {
  font-size: 14px;
}
</style>

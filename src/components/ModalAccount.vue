<template>
  <Dialog.Root
    :open="open"
    @update:open="handleUpdateOpen"
  >
    <Dialog.Portal>
      <Dialog.Overlay class="overlay" />
      <Dialog.Content class="content">
        <Dialog.Title class="title">Account</Dialog.Title>
        <Dialog.Description class="description">
          <div class="fields">
            <div class="field">
              <div class="label">Address</div>
              <div class="value">
                {{ formatAddress(address) }}
                <ButtonCopy :value="address" />
              </div>
            </div>
            <div class="field">
              <div class="label">Safe Address</div>
              <div class="value">
                {{ formatAddress(safeAddress) }}
                <ButtonCopy :value="address" />
              </div>
            </div>
          </div>
          <div><HyperButton @click="handleLogout"> Log Out </HyperButton></div>
        </Dialog.Description>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
</template>

<script setup lang="ts">
import { Dialog } from 'radix-vue/namespaced';

import ButtonCopy from '@/components/ButtonCopy.vue';
import HyperButton from '@/components/HyperButton.vue';
import useAccount from '@/composables/useAccount';

const { address, safeAddress, logout } = useAccount();

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

function formatAddress(address: string): string {
  return `${address.slice(0, 12)}...${address.slice(-10)}`;
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
  flex-direction: column;
  gap: 16px;
  margin: 32px 0 0;
}

.fields {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.label {
  font-size: 14px;
}

.value {
  display: flex;
  align-items: center;
  font-size: 16px;
  gap: 8px;
}
</style>

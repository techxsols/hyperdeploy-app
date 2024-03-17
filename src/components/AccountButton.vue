<template>
  <div @click="showModal">
    <span v-if="isAuthorized">{{ nickname }}</span>
    <span v-else>Log in</span>
  </div>
  <ModalAccount
    :open="isModalAccountOpen"
    @close="handleModalAccountClose"
  />
  <ModalLogIn
    :open="isModalLogInOpen"
    @close="handleModalLoginClose"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';

import useAccount from '@/composables/useAccount';

import ModalAccount from './ModalAccount.vue';
import ModalLogIn from './ModalLogIn.vue';

const { isAuthorized, nickname } = useAccount();

const isModalAccountOpen = ref(false);
const isModalLogInOpen = ref(false);

function showModal(): void {
  if (isAuthorized.value) {
    showModalAccount();
  } else {
    showModalLogIn();
  }
}
function showModalAccount(): void {
  isModalAccountOpen.value = true;
}
function showModalLogIn(): void {
  isModalLogInOpen.value = true;
}
function handleModalAccountClose(): void {
  isModalAccountOpen.value = false;
}
function handleModalLoginClose(): void {
  isModalLogInOpen.value = false;
}
</script>

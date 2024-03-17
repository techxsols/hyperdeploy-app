import { defineStore } from 'pinia';
import { ref } from 'vue';

import { CHAIN_SEPOLIA, type Chain } from '@/utils/core';

const store = defineStore('chain', () => {
  const id = ref<Chain>(CHAIN_SEPOLIA);

  function setId(newId: Chain): void {
    id.value = newId;
  }

  return {
    id,
    setId,
  };
});

export default store;

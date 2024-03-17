import { defineStore } from 'pinia';
import type { Address } from 'viem';
import { ref } from 'vue';

import { type Chain } from '@/utils/core';

const store = defineStore('safe', () => {
  const safes = ref<Record<Chain, Address[]>>({} as Record<Chain, Address[]>);

  function addSafe(chain: Chain, address: Address): void {
    if (!safes.value[chain]) {
      safes.value[chain] = [];
    }
    safes.value[chain].push(address);
  }

  return {
    safes,
    addSafe,
  };
});

export default store;

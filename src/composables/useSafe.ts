import type { Address } from 'viem';
import { type Ref, computed, ref } from 'vue';

import useSafeStore from '@/stores/safe';
import { type Chain } from '@/utils/core';

import useChain from './useChain';

interface UseSafe {
  chainSafes: Ref<Address[]>;
  hasSafes: Ref<boolean>;
  selectedSafe: Ref<Address | null>;
  addSafe(chain: Chain, address: Address): void;
  selectSafe(address: Address): void;
  clearSafes(chain: Chain): void;
}

function useSafe(): UseSafe {
  const safeStore = useSafeStore();
  const chain = useChain();
  const chainId = computed(() => chain.id.value);

  const selectedSafe = ref<Address | null>(null);

  const chainSafes = computed(() => {
    return safeStore.safes[chainId.value] || [];
  });

  function clearSafes(chain: Chain): void {
    safeStore.safes[chain] = [];
    selectedSafe.value = null;
  }

  function selectSafe(address: Address): void {
    selectedSafe.value = address;
  }

  function addSafe(chain: Chain, address: Address): void {
    // Make sure the address is not already in the list
    if (chainSafes.value.includes(address)) {
      return;
    }
    // Select the safe if it's the first one
    if (chainSafes.value.length === 0) {
      selectedSafe.value = address;
    }
    safeStore.addSafe(chain, address);
  }

  const hasSafes = computed(() => chainSafes.value.length > 0);

  return {
    chainSafes,
    hasSafes,
    selectedSafe,
    addSafe,
    selectSafe,
    clearSafes,
  };
}

export default useSafe;

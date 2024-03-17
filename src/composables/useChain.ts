import { type Ref, computed } from 'vue';

import useChainStore from '@/stores/chain';
import { type Chain } from '@/utils/core';

interface UseChain {
  id: Ref<Chain>;
  setId(newId: Chain): void;
}

function useChain(): UseChain {
  const chainStore = useChainStore();

  const id = computed(() => chainStore.id);

  function setId(newId: Chain): void {
    chainStore.setId(newId);
  }

  return {
    id,
    setId,
  };
}

export default useChain;

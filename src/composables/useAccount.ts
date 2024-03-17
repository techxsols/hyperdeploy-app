import {
  type Hex,
  hashMessage,
  type PrivateKeyAccount,
  type Address,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { type Ref, computed, watch } from 'vue';

import useAccountStore from '@/stores/account';
import type { Chain } from '@/utils/core';
import { getSafeAccount } from '@/utils/deployWithSafe';
import { getNickname } from '@/utils/words';

import useChain from './useChain';
import useSafe from './useSafe';

interface UseAccount {
  login(phrase: string): void;
  logout(): void;
  isAuthorized: Ref<boolean>;
  account: Ref<PrivateKeyAccount>;
  address: Ref<Address>;
  nickname: Ref<string>;
}

function useAccount(): UseAccount {
  const store = useAccountStore();

  const chain = useChain();
  const { clearSafes, addSafe } = useSafe();
  const chainId = computed(() => chain.id.value);

  const passphrase = computed(() => store.passphrase);

  function login(newPassphrase: string): void {
    store.setPasshrase(newPassphrase);
  }

  function logout(): void {
    store.setPasshrase('');
  }
  const isAuthorized = computed(() => !!passphrase.value);

  const privateKey = computed<Hex>(() => {
    // Not secure, don't use this in production
    return hashMessage(passphrase.value);
  });

  const account = computed(() => {
    return privateKeyToAccount(privateKey.value);
  });

  const address = computed(() => {
    return account.value.address;
  });

  watch(account, async (value) => {
    updateSafeAddress(value, chainId.value);
  });

  watch(chainId, (value) => {
    updateSafeAddress(account.value, value);
  });

  async function updateSafeAddress(
    account: PrivateKeyAccount,
    chainId: Chain,
  ): Promise<void> {
    if (!chainId) {
      return;
    }
    clearSafes(chainId);
    if (!account) {
      return;
    }
    const safeAccount = await getSafeAccount(chainId, account);
    addSafe(chainId, safeAccount.address);
  }

  const nickname = computed(() => getNickname(address.value));

  return {
    login,
    logout,
    isAuthorized,
    account,
    address,
    nickname,
  };
}

export default useAccount;

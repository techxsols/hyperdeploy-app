import {
  type Hex,
  hashMessage,
  type PrivateKeyAccount,
  type Address,
  zeroAddress,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { type Ref, computed, watch, ref } from 'vue';

import useAccountStore from '@/stores/account';
import type { Chain } from '@/utils/core';
import { getSafeAccount } from '@/utils/deployWithSafe';
import { getNickname } from '@/utils/words';

import useChain from './useChain';

interface UseAccount {
  login(phrase: string): void;
  logout(): void;
  isAuthorized: Ref<boolean>;
  account: Ref<PrivateKeyAccount>;
  address: Ref<Address>;
  safeAddress: Ref<Address>;
  nickname: Ref<string>;
}

function useAccount(): UseAccount {
  const store = useAccountStore();

  const chain = useChain();
  const chainId = computed(() => chain.id.value);

  const passphrase = computed(() => store.passphrase);
  const safeAddress = ref<Address>(zeroAddress);

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
    if (!account) {
      safeAddress.value = zeroAddress;
      return;
    }
    if (!chainId) {
      safeAddress.value = zeroAddress;
      return;
    }
    const safeAccount = await getSafeAccount(chainId, account);
    safeAddress.value = safeAccount.address;
  }

  const nickname = computed(() => getNickname(address.value));

  return {
    login,
    logout,
    isAuthorized,
    account,
    address,
    nickname,
    safeAddress,
  };
}

export default useAccount;

import { type Hex, hashMessage, type PrivateKeyAccount } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { type Ref, computed } from 'vue';

import useAccountStore from '@/stores/account';
import getNickname from '@/utils/nicknames';

interface UseAccount {
  setPassphrase(phrase: string): void;
  isAuthorized: Ref<boolean>;
  account: Ref<PrivateKeyAccount>;
  address: Ref<Hex>;
  nickname: Ref<string>;
}

function useAccount(): UseAccount {
  const store = useAccountStore();

  const passphrase = computed(() => store.passphrase);

  function setPassphrase(newPassphrase: string): void {
    store.setPasshrase(newPassphrase);
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

  const nickname = computed(() => getNickname(address.value));

  return {
    setPassphrase,
    isAuthorized,
    account,
    address,
    nickname,
  };
}

export default useAccount;

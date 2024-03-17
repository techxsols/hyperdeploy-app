import { defineStore } from 'pinia';
import { ref } from 'vue';

const store = defineStore('account', () => {
  const passphrase = ref('');

  function setPasshrase(newPassphrase: string): void {
    passphrase.value = newPassphrase;
  }

  return {
    passphrase,
    setPasshrase,
  };
});

export default store;

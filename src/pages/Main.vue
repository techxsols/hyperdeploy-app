<template>
  <div>
    <h1>Hyperdeploy</h1>
    <div class="form">
      <div class="block">
        <textarea
          v-model="initcode"
          placeholder="initcode"
        />
        <button @click="setCounterInitcode">Counter</button>
      </div>
      <div class="block">
        <input
          v-model="salt"
          placeholder="salt"
        />
        <button @click="generateSalt">Generate salt</button>
      </div>
      <div class="block">
        <select v-model="source">
          <option
            v-for="chain in CHAINS"
            :key="chain"
            :value="chain"
            :disabled="!isSourceSupported(chain)"
          >
            {{ getChainName(chain) }}
          </option>
        </select>
      </div>
      <div class="block">
        <select
          v-model="target"
          multiple
        >
          <option
            v-for="chain in CHAINS"
            :key="chain"
            :value="chain"
            :disabled="chain === source || !isTargetSupported(chain)"
          >
            {{ getChainName(chain) }}
          </option>
        </select>
      </div>
      <div class="block">
        <button @click="deploy">Deploy</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type Hex } from 'viem';
import { ref, watch } from 'vue';

import useEnv from '@/composables/useEnv';
import type { Chain } from '@/utils/core';
import {
  CHAINS,
  CHAIN_SEPOLIA,
  CHAIN_POLYGON_MUMBAI,
  CHAIN_SCROLL_SEPOLIA,
  CHAIN_ALFAJORES,
  CHAIN_BSC_TESTNET,
  CHAIN_FUJI,
  CHAIN_MOONBASE_ALPHA,
  isTargetSupported,
  isSourceSupported,
} from '@/utils/core';
import deployAsEoa from '@/utils/deployEoa';
// import deployWithSafe from '@/utils/deployWithSafe';

// const { privateKey, pimlicoApiKey } = useEnv();
const { privateKey } = useEnv();

const initcode = ref('');
const salt = ref('');
const source = ref<Chain>(CHAIN_SEPOLIA);
const target = ref<Chain[]>([CHAIN_POLYGON_MUMBAI]);

watch(source, () => {
  target.value = [];
});

function setCounterInitcode(): void {
  initcode.value =
    '0x608060405234801561000f575f80fd5b506101438061001d5f395ff3fe608060405234801561000f575f80fd5b5060043610610034575f3560e01c806360fe47b1146100385780636d4ce63c14610054575b5f80fd5b610052600480360381019061004d91906100ba565b610072565b005b61005c61007b565b60405161006991906100f4565b60405180910390f35b805f8190555050565b5f8054905090565b5f80fd5b5f819050919050565b61009981610087565b81146100a3575f80fd5b50565b5f813590506100b481610090565b92915050565b5f602082840312156100cf576100ce610083565b5b5f6100dc848285016100a6565b91505092915050565b6100ee81610087565b82525050565b5f6020820190506101075f8301846100e5565b9291505056fea264697066735822122098fd7ec7a21cc81e7c38d0c7cb2660ad7b42d745d59e4fd14d90d7e952fbcafe64736f6c63430008180033';
}

function generateSalt(): void {
  salt.value = generatePseudoRandomString();
}

function generatePseudoRandomString(length: number = 32): Hex {
  let randomString: Hex = '0x';
  for (let i = 0; i < length; i++) {
    const randomValue = Math.floor(Math.random() * 256); // Generates a number between 0-255
    randomString += randomValue.toString(16).padStart(2, '0'); // Converts to hex and pads with 0 if necessary
  }
  return randomString;
}

function getChainName(chain: Chain): string {
  switch (chain) {
    case CHAIN_SEPOLIA:
      return 'Sepolia';
    case CHAIN_POLYGON_MUMBAI:
      return 'Polygon Mumbai';
    case CHAIN_SCROLL_SEPOLIA:
      return 'Scroll Sepolia';
    case CHAIN_ALFAJORES:
      return 'Celo Alfajores';
    case CHAIN_FUJI:
      return 'Avalanche Fuji';
    case CHAIN_BSC_TESTNET:
      return 'BSC Testnet';
    case CHAIN_MOONBASE_ALPHA:
      return 'Moonbase Alpha';
  }
}

async function deploy(): Promise<void> {
  await deployAsEoa(
    source.value,
    target.value,
    initcode.value,
    salt.value,
    privateKey,
  );
  // const accountSalt = '0x54ebe0a0fbd0caf8782fddfccc1bc24ef004e69f';
  // await deployWithSafe(
  //   source.value,
  //   target.value,
  //   initcode.value,
  //   salt.value,
  //   pimlicoApiKey,
  //   privateKey,
  //   accountSalt,
  // );
}
</script>

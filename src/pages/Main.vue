<template>
  <div>
    <h1>Hyperdeploy</h1>
    <div class="form">
      <div class="block">
        <textarea
          v-model="initcode"
          placeholder="initcode"
        />
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
import { ref } from 'vue';

import useEnv from '@/composables/useEnv';
import type { Chain } from '@/utils/core';
import {
  CHAINS,
  CHAIN_SEPOLIA,
  CHAIN_POLYGON_MUMBAI,
  CHAIN_SCROLL_SEPOLIA,
  isTargetSupported,
  isSourceSupported,
} from '@/utils/core';
// import deployAsEoa from '@/utils/deployEoa';
import deployWithSafe from '@/utils/deployWithSafe';

const { privateKey, pimlicoApiKey } = useEnv();

const initcode = ref('');
const salt = ref('');
const source = ref<Chain>(CHAIN_SEPOLIA);
const target = ref<Chain[]>([CHAIN_POLYGON_MUMBAI]);

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
  }
}

async function deploy(): Promise<void> {
  // await deployAsEoa(
  //   source.value,
  //   target.value,
  //   initcode.value,
  //   salt.value,
  //   privateKey,
  // );
  const accountSalt = '0x54ebe0a0fbd0caf8782fddfccc1bc24ef004e69f';
  await deployWithSafe(
    source.value,
    target.value,
    initcode.value,
    salt.value,
    pimlicoApiKey,
    privateKey,
    accountSalt,
  );
}
</script>

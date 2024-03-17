<template>
  <div class="page">
    <div class="content">
      <h1>Hyperdeploy</h1>
      <div class="form">
        <div class="block block-initcode">
          <HyperTextArea
            v-model="initcode"
            placeholder="initcode"
          />
          <div>
            <HyperButton @click="setCounterInitcode">Counter</HyperButton>
          </div>
        </div>
        <div class="block block-salt">
          <HyperInput
            v-model="salt"
            placeholder="salt"
          />
          <div>
            <HyperButton @click="generateSalt">Generate salt</HyperButton>
          </div>
        </div>
        <div class="block">
          <select
            :value="source"
            @change="handleSourceChainChange"
          >
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
          <HyperButton
            :disabled="!isAuthorized || !isDeployable"
            primary
            @click="deploy"
          >
            Deploy
          </HyperButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isHex, type Hex } from 'viem';
import { computed, ref, watch } from 'vue';

import HyperButton from '@/components/HyperButton.vue';
import HyperInput from '@/components/HyperInput.vue';
import HyperTextArea from '@/components/HyperTextArea.vue';
import useAccount from '@/composables/useAccount';
import useChain from '@/composables/useChain';
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
import deployWithSafe from '@/utils/deployWithSafe';

const { pimlicoApiKey } = useEnv();
const { isAuthorized, account } = useAccount();
const { id: chainId, setId: setChainId } = useChain();

const initcode = ref('');
const salt = ref('');
const source = computed(() => chainId.value);
const target = ref<Chain[]>([CHAIN_POLYGON_MUMBAI]);

watch(source, () => {
  target.value = [];
});

const isDeployable = computed(() => {
  // Init code should be a hex string
  const isInitcodeHex = isHex(initcode.value);
  if (!isInitcodeHex) return false;

  // Salt should be a 32 bytehex string
  const isSaltHex = isHex(salt.value);
  if (!isSaltHex) return false;
  if (salt.value.length !== 66) return false;

  return true;
});

function handleSourceChainChange(event: Event): void {
  const targetChain = (event.target as HTMLSelectElement).value;
  setChainId(parseInt(targetChain) as Chain);
}

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
  await deployWithSafe(
    source.value,
    target.value,
    initcode.value,
    salt.value,
    pimlicoApiKey,
    account.value,
  );
}
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 60px;
}

h1 {
  font-size: 20px;
  font-weight: normal;
}

.content {
  display: flex;
  flex-direction: column;
  min-width: 600px;
  max-width: 100%;
  gap: 32px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.block {
  width: 100%;
}

.block-initcode {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.block-salt {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

select {
  padding: 2px 4px;
  border: 1px solid var(--color-border);
  border-radius: 2px;
  background: var(--color-background);
  color: var(--color-text-primary);
}
</style>

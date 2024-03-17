<template>
  <div class="page">
    <div class="content">
      <div class="header">
        <h1>Hyperdeploy</h1>
        <h2>Manage Safe</h2>
      </div>
      <div><HyperButton @click="refresh">Refresh</HyperButton></div>
      <div
        v-for="safe in chainSafes"
        :key="safe"
      >
        <div class="safe">
          <div class="safe-header">
            <div class="label">Address</div>
            <div class="value">
              {{ safe }}
            </div>
          </div>
          <div class="signers">
            <div class="label">Owners</div>
            <div class="values">
              <div
                v-for="owner in owners[safe]"
                :key="owner"
                class="value"
              >
                {{ owner }}
                <HyperButton
                  v-if="owner !== address"
                  @click="handleRemoveOwner(owner)"
                >
                  Remove
                </HyperButton>
              </div>
            </div>
          </div>
          <div>
            <HyperInput
              v-model="ownerAddress"
              placeholder="Address"
            />
            <HyperButton @click="handleAddOwner">Add</HyperButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { createPublicClient, type Address, http, isAddress } from 'viem';
import { readContract } from 'viem/actions';
import { ref } from 'vue';

import gnosisSafeAbi from '@/abi/gnosisSafe';
import HyperButton from '@/components/HyperButton.vue';
import HyperInput from '@/components/HyperInput.vue';
import useAccount from '@/composables/useAccount';
import useChain from '@/composables/useChain';
import useEnv from '@/composables/useEnv';
import useSafe from '@/composables/useSafe';
import { getRpcUrl } from '@/utils/core';
import { addOwner, removeOwner } from '@/utils/deployWithSafe';

const { address, account } = useAccount();
const { id: chainId } = useChain();
const { chainSafes } = useSafe();
const { pimlicoApiKey } = useEnv();

const owners = ref<Record<Address, Address[]>>({});

async function refresh(): Promise<void> {
  console.log('Fetching owners 1');
  const publicClient = createPublicClient({
    transport: http(getRpcUrl(chainId.value)),
  });
  console.log('Fetching owners 2', chainSafes.value);
  for (const safe of chainSafes.value) {
    console.log('Fetching owners 3', safe);
    const safeAddress = safe as Address;
    const safeOwners = await readContract(publicClient, {
      abi: gnosisSafeAbi,
      address: safeAddress,
      functionName: 'getOwners',
    });
    console.log('Fetching owners 4', safeOwners);
    owners.value[safeAddress] = safeOwners as Address[];
  }
}

const ownerAddress = ref<string>('');

async function handleAddOwner(): Promise<void> {
  if (!ownerAddress.value) {
    return;
  }
  if (!isAddress(ownerAddress.value)) {
    return;
  }
  await addOwner(
    chainId.value,
    pimlicoApiKey,
    chainSafes.value[0] as Address as Address,
    account.value,
    ownerAddress.value,
  );
}

async function handleRemoveOwner(owner: Address): Promise<void> {
  if (!ownerAddress.value) {
    return;
  }
  await removeOwner(
    chainId.value,
    pimlicoApiKey,
    chainSafes.value[0] as Address as Address,
    account.value,
    owner,
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
  margin: 0;
  font-size: 20px;
  font-weight: normal;
}

h2 {
  margin: 0;
  color: #a0aec0;
  font-size: 16px;
  font-weight: normal;
}

.content {
  display: flex;
  flex-direction: column;
  min-width: 600px;
  max-width: 100%;
  gap: 32px;
}

.header {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.safe {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.safe-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.signers {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.values {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.label {
  font-size: 14px;
}
</style>

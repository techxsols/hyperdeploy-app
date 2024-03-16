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
import {
  createPublicClient,
  encodeAbiParameters,
  http,
  createWalletClient,
  type Hex,
  type Address,
  parseGwei,
  isHex,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import {
  estimateContractGas,
  readContract,
  waitForTransactionReceipt,
  writeContract,
} from 'viem/actions';
import { ref } from 'vue';

import bytecodeRouterAbi from '@/abi/bytecodeRouter';
import hyperlaneMailboxAbi from '@/abi/hyperlaneMailbox';
import useEnv from '@/composables/useEnv';
import type { Chain } from '@/utils/core';
import {
  CHAINS,
  CHAIN_SEPOLIA,
  CHAIN_POLYGON_MUMBAI,
  CHAIN_SCROLL_SEPOLIA,
  isTargetSupported,
  isSourceSupported,
  getChainData,
  getMailboxAddress,
  getBytecodeRouterAddress,
  getRpcUrl,
  getRecipients,
  getHookMetadatas,
  getHooks,
  addressToBytes32,
} from '@/utils/core';

const { privateKey } = useEnv();

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
  const chain = getChainData(source.value);
  const mailboxAddress = getMailboxAddress(source.value);
  const bytecodeRouterAddress = getBytecodeRouterAddress(source.value);
  const account = privateKeyToAccount(privateKey as Hex);
  if (!account) {
    console.error('Invalid private key');
    return;
  }
  console.log('Account: ', account.address);
  if (!isHex(initcode.value)) {
    console.error('Invalid initcode');
    return;
  }
  if (!isHex(salt.value)) {
    console.error('Invalid salt');
    return;
  }
  const rpcUrl = getRpcUrl(source.value);
  const messageBody = encodeAbiParameters(
    [
      { type: 'bytes', name: 'initcode' },
      { type: 'bytes32', name: 'salt' },
    ],
    [initcode.value, salt.value],
  );
  const publicClient = createPublicClient({
    chain,
    transport: http(rpcUrl),
  });
  const walletClient = createWalletClient({
    account: privateKeyToAccount(privateKey as Hex),
    chain,
    transport: http(rpcUrl),
  });
  const destinations: Chain[] = target.value;
  const recipients: Address[] = getRecipients(target.value);
  const hookMetadatas: Hex[] = getHookMetadatas(target.value);
  const hooks: Address[] = getHooks(target.value);
  const formattedRecipients = recipients.map((r) => addressToBytes32(r));
  const values: bigint[] = [];
  for (let i = 0; i < destinations.length; i++) {
    const destinationDomain = destinations[i];
    const formattedRecipient = formattedRecipients[i];
    const hookMetadata = hookMetadatas[i];
    const hook = hooks[i];
    const value = await readContract(publicClient, {
      abi: hyperlaneMailboxAbi,
      address: mailboxAddress,
      functionName: 'quoteDispatch',
      args: [
        destinationDomain,
        formattedRecipient,
        messageBody,
        hookMetadata,
        hook,
      ],
    });
    values.push(value as bigint);
  }
  console.log('Values: ', values);
  const value = values.reduce((a, b) => a + b, 0n);
  const gasLimit = await estimateContractGas(walletClient, {
    abi: bytecodeRouterAbi,
    address: bytecodeRouterAddress,
    functionName: 'deploy',
    args: [
      initcode.value,
      salt.value,
      formattedRecipients,
      destinations,
      hookMetadatas,
      hooks,
    ],
    value: value as bigint,
  });
  const destinationBigInts = destinations.map((d) => BigInt(d));
  const txHash = await writeContract(walletClient, {
    abi: bytecodeRouterAbi,
    address: bytecodeRouterAddress,
    functionName: 'deploy',
    args: [
      initcode.value,
      salt.value,
      formattedRecipients,
      destinationBigInts,
      hookMetadatas,
      hooks,
    ],
    value: value as bigint,
    gas: (gasLimit * 15n) / 10n,
    gasPrice: parseGwei('100'),
  });
  console.log('Deploying: ', txHash);
  await waitForTransactionReceipt(publicClient, {
    hash: txHash,
  });
  console.log('Deployed');
}
</script>

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
  padHex,
  type Hex,
  type Address,
  type Chain as ChainData,
  zeroAddress,
  parseGwei,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import {
  estimateContractGas,
  readContract,
  waitForTransactionReceipt,
  writeContract,
} from 'viem/actions';
import { polygonMumbai, scrollSepolia, sepolia } from 'viem/chains';
import { ref } from 'vue';

import bytecodeRouterAbi from '@/abi/bytecodeRouter';
import hyperlaneMailboxAbi from '@/abi/hyperlaneMailbox';
import useEnv from '@/composables/useEnv';

const { privateKey } = useEnv();

const CHAIN_SEPOLIA = 11155111;
const CHAIN_POLYGON_MUMBAI = 80001;
const CHAIN_SCROLL_SEPOLIA = 534351;
type Chain =
  | typeof CHAIN_SEPOLIA
  | typeof CHAIN_POLYGON_MUMBAI
  | typeof CHAIN_SCROLL_SEPOLIA;

const CHAINS: Chain[] = [
  CHAIN_SEPOLIA,
  CHAIN_POLYGON_MUMBAI,
  CHAIN_SCROLL_SEPOLIA,
];

function isSourceSupported(chain: Chain): boolean {
  return getBytecodeRouterAddress(chain) !== zeroAddress;
}

function isTargetSupported(chain: Chain): boolean {
  return getRecipient(chain) !== zeroAddress;
}

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

function isHex(str: string): str is Hex {
  return /^0x[0-9a-fA-F]+$/.test(str);
}

function addressToBytes32(address: Address): Hex {
  padHex(address);
  return `0x${address.slice(2).padStart(64, '0')}`;
}

function getChainData(chain: Chain): ChainData {
  switch (chain) {
    case CHAIN_SEPOLIA:
      return sepolia;
    case CHAIN_POLYGON_MUMBAI:
      return polygonMumbai;
    case CHAIN_SCROLL_SEPOLIA:
      return scrollSepolia;
  }
}

function getRecipient(chain: Chain): Address {
  switch (chain) {
    case CHAIN_SEPOLIA:
      return zeroAddress;
    case CHAIN_POLYGON_MUMBAI:
      return '0xD0B7BFE8bc7a635Ce2E514c1b4Eb5C9238Ef9998';
    case CHAIN_SCROLL_SEPOLIA:
      return '0xF0FB374975dFbDAF18f9E85Ddc4939A4b37A56bE';
  }
}

function getRecipients(chains: Chain[]): Address[] {
  return chains.map(getRecipient);
}

function getHookMetadatas(chains: Chain[]): Hex[] {
  function getHookMetadata(chain: Chain): Hex {
    switch (chain) {
      case CHAIN_SEPOLIA:
        return '0x';
      case CHAIN_POLYGON_MUMBAI:
        return '0x';
      case CHAIN_SCROLL_SEPOLIA:
        return '0x';
    }
  }
  return chains.map(getHookMetadata);
}

function getHooks(chains: Chain[]): Address[] {
  const DEFAULT_HOOK = '0x17Dc724B7a2F09141C13b8AC33B396073785c2BC';
  function getHook(chain: Chain): Address {
    switch (chain) {
      case CHAIN_SEPOLIA:
        return DEFAULT_HOOK;
      case CHAIN_POLYGON_MUMBAI:
        return DEFAULT_HOOK;
      case CHAIN_SCROLL_SEPOLIA:
        return DEFAULT_HOOK;
    }
  }
  return chains.map(getHook);
}

function getRpcUrl(chain: Chain): string {
  const chainData = getChainData(chain);
  return chainData.rpcUrls.default.http[0];
}

function getMailboxAddress(chain: Chain): Address {
  switch (chain) {
    case CHAIN_SEPOLIA:
      return '0xfFAEF09B3cd11D9b20d1a19bECca54EEC2884766';
    case CHAIN_POLYGON_MUMBAI:
      return '0x2d1889fe5B092CD988972261434F7E5f26041115';
    case CHAIN_SCROLL_SEPOLIA:
      return '0x3C5154a193D6e2955650f9305c8d80c18C814A68';
  }
}

function getBytecodeRouterAddress(chain: Chain): Address {
  switch (chain) {
    case CHAIN_SEPOLIA:
      return '0x6D00Ad8878ec1f75c56e3953839e990850635317';
    case CHAIN_POLYGON_MUMBAI:
      return zeroAddress;
    case CHAIN_SCROLL_SEPOLIA:
      return zeroAddress;
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

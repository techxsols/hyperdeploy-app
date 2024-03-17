import {
  ENTRYPOINT_ADDRESS_V06,
  createSmartAccountClient,
} from 'permissionless';
import {
  signerToSafeSmartAccount,
  type SafeSmartAccount,
} from 'permissionless/accounts';
import {
  createPimlicoBundlerClient,
  createPimlicoPaymasterClient,
} from 'permissionless/clients/pimlico';
import {
  createPublicClient,
  http,
  type Hex,
  type Address,
  encodeFunctionData,
  isHex,
  encodeAbiParameters,
  type PrivateKeyAccount,
} from 'viem';
import { readContract } from 'viem/actions';

import bytecodeRouterAbi from '@/abi/bytecodeRouter';
import gnosisSafeAbi from '@/abi/gnosisSafe';
import hyperlaneMailboxAbi from '@/abi/hyperlaneMailbox';

import {
  type Chain,
  getRpcUrl,
  CHAIN_SEPOLIA,
  CHAIN_POLYGON_MUMBAI,
  CHAIN_SCROLL_SEPOLIA,
  CHAIN_ALFAJORES,
  CHAIN_FUJI,
  CHAIN_BSC_TESTNET,
  CHAIN_MOONBASE_ALPHA,
  getChainData,
  getBytecodeRouterAddress,
  getRecipients,
  getHookMetadatas,
  getHook,
  addressToBytes32,
  getMailboxAddress,
} from './core';

function getPimlicoChainName(chain: Chain): string {
  const NOT_SUPPORTED = '';
  switch (chain) {
    case CHAIN_SEPOLIA:
      return 'sepolia';
    case CHAIN_POLYGON_MUMBAI:
      return NOT_SUPPORTED;
    case CHAIN_SCROLL_SEPOLIA:
      return 'scroll-sepolia-testnet';
    case CHAIN_ALFAJORES:
      return 'celo-alfajores-testnet';
    case CHAIN_FUJI:
      return 'avalanche-fuji';
    case CHAIN_BSC_TESTNET:
      return NOT_SUPPORTED;
    case CHAIN_MOONBASE_ALPHA:
      return NOT_SUPPORTED;
  }
}

function getPimlicoPaymasterRpcUrl(chain: Chain, apiKey: string): string {
  const chainName = getPimlicoChainName(chain);
  if (chainName === '') return '';
  return `https://api.pimlico.io/v2/${chainName}/rpc?apikey=${apiKey}`;
}

function getPimlicoBundlerRpcUrl(chain: Chain, apiKey: string): string {
  const chainName = getPimlicoChainName(chain);
  if (chainName === '') return '';
  return `https://api.pimlico.io/v1/${chainName}/rpc?apikey=${apiKey}`;
}

async function getSafeAccount(
  source: Chain,
  signer: PrivateKeyAccount,
): Promise<SafeSmartAccount> {
  const rpcUrl = getRpcUrl(source);
  const publicClient = createPublicClient({
    transport: http(rpcUrl),
  });

  const safeAccount = await signerToSafeSmartAccount(publicClient, {
    entryPoint: ENTRYPOINT_ADDRESS_V06,
    signer,
    safeVersion: '1.4.1',
  });

  return safeAccount;
}

async function deploy(
  source: Chain,
  targets: Chain[],
  initcode: string,
  salt: string,
  pimlicoApiKey: string,
  signer: PrivateKeyAccount,
): Promise<Hex> {
  const chain = getChainData(source);
  const rpcUrl = getRpcUrl(source);
  const mailboxAddress = getMailboxAddress(source);
  const bytecodeRouterAddress = getBytecodeRouterAddress(source);
  const pimlicoPaymasterRpcUrl = getPimlicoPaymasterRpcUrl(
    source,
    pimlicoApiKey,
  );
  const pimlicoBundlerRpcUrl = getPimlicoBundlerRpcUrl(source, pimlicoApiKey);

  if (!isHex(initcode)) {
    throw new Error('Invalid initcode');
  }
  if (!isHex(salt)) {
    throw new Error('Invalid salt');
  }

  const publicClient = createPublicClient({
    transport: http(rpcUrl),
  });

  const paymasterClient = createPimlicoPaymasterClient({
    transport: http(pimlicoPaymasterRpcUrl),
    entryPoint: ENTRYPOINT_ADDRESS_V06,
  });
  const bundlerClient = createPimlicoBundlerClient({
    transport: http(pimlicoBundlerRpcUrl),
    entryPoint: ENTRYPOINT_ADDRESS_V06,
  });

  const safeAccount = await getSafeAccount(source, signer);

  const smartAccountClient = createSmartAccountClient({
    account: safeAccount,
    entryPoint: ENTRYPOINT_ADDRESS_V06,
    chain,
    bundlerTransport: http(pimlicoBundlerRpcUrl),
    middleware: {
      gasPrice: async () =>
        (await bundlerClient.getUserOperationGasPrice()).fast, // use pimlico bundler to get gas prices
      sponsorUserOperation: paymasterClient.sponsorUserOperation, // optional
    },
  });

  const destinations: Chain[] = targets;
  const recipients: Address[] = getRecipients(targets);
  const hookMetadatas: Hex[] = getHookMetadatas(targets);
  const hooks: Address[] = targets.map(() => getHook(source));
  const formattedRecipients = recipients.map((r) => addressToBytes32(r));
  const destinationBigInts = destinations.map((d) => BigInt(d));
  const messageBody = encodeAbiParameters(
    [
      { type: 'bytes', name: 'initcode' },
      { type: 'bytes32', name: 'salt' },
    ],
    [initcode, salt],
  );

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
  const value = values.reduce((a, b) => a + b, 0n);

  const gasPrices = await bundlerClient.getUserOperationGasPrice();

  console.log('Deploying…');

  const callData = await safeAccount.encodeCallData({
    to: bytecodeRouterAddress,
    data: encodeFunctionData({
      abi: bytecodeRouterAbi,
      functionName: 'deploy',
      args: [
        initcode,
        salt,
        formattedRecipients,
        destinationBigInts,
        hookMetadatas,
        hooks,
      ],
    }),
    value: value as bigint,
  });

  const userOperation = await smartAccountClient.prepareUserOperationRequest({
    userOperation: {
      callData,
      maxFeePerGas: gasPrices.fast.maxFeePerGas,
      maxPriorityFeePerGas: gasPrices.fast.maxPriorityFeePerGas,
    },
  });

  console.log('Sending the UserOp');

  const userOpHash = await smartAccountClient.sendUserOperation({
    userOperation,
  });

  console.log('Sent the UserOp');

  const userOpResult = await bundlerClient.waitForUserOperationReceipt({
    hash: userOpHash,
  });

  console.log('Deployed', userOpResult.receipt.transactionHash);

  return userOpResult.receipt.transactionHash;
}

async function addOwner(
  source: Chain,
  pimlicoApiKey: string,
  safeAddress: Address,
  signer: PrivateKeyAccount,
  newOwner: Address,
): Promise<Hex> {
  console.log('Adding a new owner', {
    source,
    safeAddress,
    signer: signer.address,
    newOwner,
  });
  const chain = getChainData(source);
  const pimlicoPaymasterRpcUrl = getPimlicoPaymasterRpcUrl(
    source,
    pimlicoApiKey,
  );
  const pimlicoBundlerRpcUrl = getPimlicoBundlerRpcUrl(source, pimlicoApiKey);

  const paymasterClient = createPimlicoPaymasterClient({
    transport: http(pimlicoPaymasterRpcUrl),
    entryPoint: ENTRYPOINT_ADDRESS_V06,
  });
  const bundlerClient = createPimlicoBundlerClient({
    transport: http(pimlicoBundlerRpcUrl),
    entryPoint: ENTRYPOINT_ADDRESS_V06,
  });

  const safeAccount = await getSafeAccount(source, signer);

  const smartAccountClient = createSmartAccountClient({
    account: safeAccount,
    entryPoint: ENTRYPOINT_ADDRESS_V06,
    chain,
    bundlerTransport: http(pimlicoBundlerRpcUrl),
    middleware: {
      gasPrice: async () =>
        (await bundlerClient.getUserOperationGasPrice()).fast, // use pimlico bundler to get gas prices
      sponsorUserOperation: paymasterClient.sponsorUserOperation, // optional
    },
  });

  const gasPrices = await bundlerClient.getUserOperationGasPrice();

  console.log('Deploying…');

  const callData = await safeAccount.encodeCallData({
    to: safeAddress,
    data: encodeFunctionData({
      abi: gnosisSafeAbi,
      functionName: 'addOwnerWithThreshold',
      args: [newOwner, 1],
    }),
    value: 0n,
  });

  const userOperation = await smartAccountClient.prepareUserOperationRequest({
    userOperation: {
      callData,
      maxFeePerGas: gasPrices.fast.maxFeePerGas,
      maxPriorityFeePerGas: gasPrices.fast.maxPriorityFeePerGas,
    },
  });

  console.log('Sending the UserOp');

  const userOpHash = await smartAccountClient.sendUserOperation({
    userOperation,
  });

  console.log('Sent the UserOp');

  const userOpResult = await bundlerClient.waitForUserOperationReceipt({
    hash: userOpHash,
  });

  console.log('Added owner', userOpResult.receipt.transactionHash);

  return userOpResult.receipt.transactionHash;
}

async function removeOwner(
  source: Chain,
  pimlicoApiKey: string,
  safeAddress: Address,
  signer: PrivateKeyAccount,
  owner: Address,
): Promise<Hex> {
  const chain = getChainData(source);
  const pimlicoPaymasterRpcUrl = getPimlicoPaymasterRpcUrl(
    source,
    pimlicoApiKey,
  );
  const pimlicoBundlerRpcUrl = getPimlicoBundlerRpcUrl(source, pimlicoApiKey);

  const paymasterClient = createPimlicoPaymasterClient({
    transport: http(pimlicoPaymasterRpcUrl),
    entryPoint: ENTRYPOINT_ADDRESS_V06,
  });
  const bundlerClient = createPimlicoBundlerClient({
    transport: http(pimlicoBundlerRpcUrl),
    entryPoint: ENTRYPOINT_ADDRESS_V06,
  });

  const safeAccount = await getSafeAccount(source, signer);

  const smartAccountClient = createSmartAccountClient({
    account: safeAccount,
    entryPoint: ENTRYPOINT_ADDRESS_V06,
    chain,
    bundlerTransport: http(pimlicoBundlerRpcUrl),
    middleware: {
      gasPrice: async () =>
        (await bundlerClient.getUserOperationGasPrice()).fast, // use pimlico bundler to get gas prices
      sponsorUserOperation: paymasterClient.sponsorUserOperation, // optional
    },
  });

  const gasPrices = await bundlerClient.getUserOperationGasPrice();

  console.log('Deploying…');

  const callData = await safeAccount.encodeCallData({
    to: safeAddress,
    data: encodeFunctionData({
      abi: gnosisSafeAbi,
      functionName: 'removeOwner',
      args: [smartAccountClient.account.address, owner, 1],
    }),
    value: 0n,
  });

  const userOperation = await smartAccountClient.prepareUserOperationRequest({
    userOperation: {
      callData,
      maxFeePerGas: gasPrices.fast.maxFeePerGas,
      maxPriorityFeePerGas: gasPrices.fast.maxPriorityFeePerGas,
    },
  });

  console.log('Sending the UserOp');

  const userOpHash = await smartAccountClient.sendUserOperation({
    userOperation,
  });

  console.log('Sent the UserOp');

  const userOpResult = await bundlerClient.waitForUserOperationReceipt({
    hash: userOpHash,
  });

  console.log('Added owner', userOpResult.receipt.transactionHash);

  return userOpResult.receipt.transactionHash;
}

export default deploy;
export { getSafeAccount, addOwner, removeOwner };

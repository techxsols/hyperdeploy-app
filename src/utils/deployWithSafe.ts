import {
  ENTRYPOINT_ADDRESS_V06,
  createSmartAccountClient,
} from 'permissionless';
import { signerToSafeSmartAccount } from 'permissionless/accounts';
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
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { readContract } from 'viem/actions';

import bytecodeRouterAbi from '@/abi/bytecodeRouter';
import hyperlaneMailboxAbi from '@/abi/hyperlaneMailbox';

import {
  getRpcUrl,
  type Chain,
  CHAIN_SEPOLIA,
  CHAIN_POLYGON_MUMBAI,
  CHAIN_SCROLL_SEPOLIA,
  getChainData,
  getBytecodeRouterAddress,
  getRecipients,
  getHookMetadatas,
  getHooks,
  addressToBytes32,
  getMailboxAddress,
} from './core';

function getPimlicoChainName(chain: Chain): string {
  switch (chain) {
    case CHAIN_SEPOLIA:
      return 'sepolia';
    case CHAIN_POLYGON_MUMBAI:
      // Not supported yet
      return '';
    case CHAIN_SCROLL_SEPOLIA:
      return 'scroll-sepolia-testnet';
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

async function deploy(
  source: Chain,
  targets: Chain[],
  initcode: string,
  salt: string,
  pimlicoApiKey: string,
  privateKey: string,
  accountSalt: Address,
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

  const signer = privateKeyToAccount(privateKey as Hex);
  if (!signer) {
    throw new Error('Invalid private key');
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

  const safeAccount = await signerToSafeSmartAccount(publicClient, {
    entryPoint: ENTRYPOINT_ADDRESS_V06,
    signer,
    saltNonce: BigInt(accountSalt),
    safeVersion: '1.4.1',
  });

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
  const hooks: Address[] = getHooks(targets);
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

export default deploy;

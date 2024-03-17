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

import bytecodeRouterAbi from '@/abi/bytecodeRouter';
import hyperlaneMailboxAbi from '@/abi/hyperlaneMailbox';
import type { Chain } from '@/utils/core';
import {
  getChainData,
  getMailboxAddress,
  getBytecodeRouterAddress,
  getRpcUrl,
  getRecipients,
  getHookMetadatas,
  getHook,
  addressToBytes32,
} from '@/utils/core';

async function deploy(
  source: Chain,
  targets: Chain[],
  initcode: string,
  salt: string,
  privateKey: string,
): Promise<Hex> {
  const chain = getChainData(source);
  const mailboxAddress = getMailboxAddress(source);
  const bytecodeRouterAddress = getBytecodeRouterAddress(source);
  const account = privateKeyToAccount(privateKey as Hex);
  if (!account) {
    throw new Error('Invalid private key');
  }
  console.log('Account: ', account.address);
  if (!isHex(initcode)) {
    throw new Error('Invalid initcode');
  }
  if (!isHex(salt)) {
    throw new Error('Invalid salt');
  }
  const rpcUrl = getRpcUrl(source);
  const messageBody = encodeAbiParameters(
    [
      { type: 'bytes', name: 'initcode' },
      { type: 'bytes32', name: 'salt' },
    ],
    [initcode, salt],
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
  const destinations: Chain[] = targets;
  const recipients: Address[] = getRecipients(targets);
  const hookMetadatas: Hex[] = getHookMetadatas(targets);
  const hooks: Address[] = targets.map(() => getHook(source));
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
  const value = values.reduce((a, b) => a + b, 0n);
  const gasLimit = await estimateContractGas(walletClient, {
    abi: bytecodeRouterAbi,
    address: bytecodeRouterAddress,
    functionName: 'deploy',
    args: [
      initcode,
      salt,
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
      initcode,
      salt,
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
  return txHash;
}

export default deploy;

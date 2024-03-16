const abi = [
  {
    type: 'constructor',
    inputs: [
      {
        name: 'mailbox',
        type: 'address',
        internalType: 'contract IMalibox',
      },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'receive', stateMutability: 'payable' },
  {
    type: 'function',
    name: 'MALIBOX',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'contract IMalibox' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'deploy',
    inputs: [
      { name: 'bytecode', type: 'bytes', internalType: 'bytes' },
      { name: 'salt', type: 'bytes32', internalType: 'bytes32' },
      {
        name: 'recipientAddresses',
        type: 'bytes32[]',
        internalType: 'bytes32[]',
      },
      { name: 'chains', type: 'uint256[]', internalType: 'uint256[]' },
      {
        name: 'customHookMetadatas',
        type: 'bytes[]',
        internalType: 'bytes[]',
      },
      {
        name: 'customHooks',
        type: 'address[]',
        internalType: 'contract IPostDispatchHook[]',
      },
    ],
    outputs: [
      { name: 'messageIds', type: 'bytes32[]', internalType: 'bytes32[]' },
    ],
    stateMutability: 'payable',
  },
] as const;

export default abi;

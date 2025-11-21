export const fundingManagerAbi = [
  {
    inputs: [],
    name: 'projectCollateralFeeCollected',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    type: 'function',
    name: 'withdrawProjectCollateralFee',
    inputs: [
      {
        name: '_receiver',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_amount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
];

export const roleModuleAbi = [
  {
    inputs: [
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'value', type: 'uint256' },
      { internalType: 'bytes', name: 'data', type: 'bytes' },
      { internalType: 'enum Enum.Operation', name: 'operation', type: 'uint8' },
    ],
    name: 'execTransactionFromModule',
    outputs: [{ internalType: 'bool', name: 'success', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

export const claimAllAbi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'client',
        type: 'address',
      },
    ],
    name: 'claimAll',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

export const claimTokensABI = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'client',
        type: 'address',
      },
    ],
    name: 'claimAll',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    type: 'function',
    name: 'claimForSpecificStream',
    inputs: [
      {
        name: 'client',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'streamId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'client',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'paymentReceiver',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'streamId',
        type: 'uint256',
      },
    ],
    name: 'releasableForSpecificStream',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'client',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'paymentReceiver',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'streamId',
        type: 'uint256',
      },
    ],
    name: 'releasedForSpecificStream',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    type: 'function',
    name: 'isActivePaymentReceiver',
    inputs: [
      {
        name: 'client',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'paymentReceiver',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
];

export const ORCHESTRATOR_LIST_MODULES_ABI = [
  {
    inputs: [],
    name: 'listModules',
    outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
];

export const ORCHESTRATOR_ABI = [
  {
    inputs: [],
    name: 'fundingManager',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
];

export const MODULE_ABI = [
  {
    inputs: [],
    name: 'title',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
];

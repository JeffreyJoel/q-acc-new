import { useMutation, useQuery } from '@tanstack/react-query';
import { Address, getContract } from 'viem';
import { usePublicClient } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';

import { useZeroDev } from '@/contexts/ZeroDevContext';
import { claimTokensABI } from '@/lib/abi/inverter';

const erc20ABI = [
  {
    inputs: [
      { name: 'dst', type: 'address' },
      { name: 'wad', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];

export const useClaimRewards = ({
  paymentProcessorAddress,
  paymentRouterAddress,
  tokenContractAddress,
  onSuccess = () => {},
  onError = () => {},
}: {
  paymentProcessorAddress: string;
  paymentRouterAddress: string;
  tokenContractAddress?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const { kernelClient, isInitializing } = useZeroDev();
  const publicClient = usePublicClient();
  const { user: privyUser } = usePrivy();

  const claim = useMutation({
    mutationFn: async () => {
      if (!kernelClient) {
        throw new Error('Smart account not initialized');
      }

      if (isInitializing) {
        throw new Error('Smart account is still initializing');
      }

      const userWalletAddress = privyUser?.wallet?.address;
      if (!userWalletAddress) {
        throw new Error('User wallet address not available for auto-transfer');
      }

      if (!tokenContractAddress) {
        throw new Error('Token contract address required for auto-transfer');
      }

      if (!kernelClient.account) {
        throw new Error(
          'Smart account not properly initialized for auto-transfer'
        );
      }

      const smartAccountAddress = kernelClient.account!.address;

      // Use the kernel client directly for gasless transactions
      const paymentProcessorContract = getContract({
        address: paymentProcessorAddress as Address,
        abi: claimTokensABI,
        client: kernelClient,
      });

      // Execute claim
      const claimTx = await paymentProcessorContract.write.claimAll([
        paymentRouterAddress,
      ]);

      // Wait for claim transaction confirmation
      await publicClient!.waitForTransactionReceipt({
        hash: claimTx,
      });

      // Transfer tokens to user's regular wallet
      if (tokenContractAddress && userWalletAddress) {
        // Get the token balance of the smart account after claiming
        const tokenContract = getContract({
          address: tokenContractAddress as Address,
          abi: erc20ABI,
          client: publicClient!,
        });

        // Get balance of smart account
        const balance = (await tokenContract.read.balanceOf([
          smartAccountAddress,
        ])) as bigint;

        if (balance > BigInt(0)) {
          // Transfer all tokens to user's regular wallet
          const transferContract = getContract({
            address: tokenContractAddress as Address,
            abi: erc20ABI,
            client: kernelClient,
          });

          const transferTx = await transferContract.write.transfer([
            userWalletAddress as Address,
            balance,
          ]);

          // Wait for transfer transaction confirmation
          await publicClient!.waitForTransactionReceipt({
            hash: transferTx,
          });

          return { claimTx, transferTx, tokensTransferred: balance };
        }
      }

      return { claimTx, transferTx: null, tokensTransferred: BigInt(0) };
    },
    onSuccess,
    onError,
  });

  return {
    claim,
    isSmartAccountReady: !!kernelClient && !isInitializing,
  };
};

export const useReleasableForStream = ({
  paymentProcessorAddress,
  client,
  receiver,
  streamIds,
}: {
  paymentProcessorAddress: string;
  client: string;
  receiver: `0x${string}` | undefined;
  streamIds: bigint[];
}) => {
  const publicClient = usePublicClient();

  return useQuery<bigint>({
    queryKey: [
      'releasableForStream',
      client,
      receiver,
      streamIds.map(id => id.toString()),
    ],
    queryFn: async (): Promise<bigint> => {
      const contract = getContract({
        address: paymentProcessorAddress as Address,
        abi: claimTokensABI,
        client: publicClient!,
      });

      // Get releasable amounts for all stream IDs
      const releasablePromises = streamIds.map(async streamId => {
        const res = await contract.read.releasableForSpecificStream([
          client,
          receiver,
          streamId,
        ]);
        return res as bigint;
      });

      const releasableAmounts = await Promise.all(releasablePromises);

      // Sum all releasable amounts
      const totalReleasable = releasableAmounts.reduce(
        (sum, amount) => sum + amount,
        BigInt(0)
      );

      return totalReleasable;
    },
    staleTime: Infinity,
    gcTime: 1000 * 60,
    enabled: !!receiver && !!client && streamIds.length > 0,
  });
};

export const useReleasedForStream = ({
  paymentProcessorAddress,
  client,
  receiver,
  streamIds,
}: {
  paymentProcessorAddress: string;
  client: string;
  receiver: `0x${string}` | undefined;
  streamIds: bigint[];
}) => {
  const publicClient = usePublicClient();

  return useQuery<bigint>({
    queryKey: [
      'releasedForStream',
      client,
      receiver,
      streamIds.map(id => id.toString()),
    ],
    queryFn: async (): Promise<bigint> => {
      const contract = getContract({
        address: paymentProcessorAddress as Address,
        abi: claimTokensABI,
        client: publicClient!,
      });

      // Get released amounts for all stream IDs
      const releasedPromises = streamIds.map(async streamId => {
        const res = await contract.read.releasedForSpecificStream([
          client,
          receiver,
          streamId,
        ]);
        return res as bigint;
      });

      const releasedAmounts = await Promise.all(releasedPromises);

      // Sum all released amounts
      const totalReleased = releasedAmounts.reduce(
        (sum, amount) => sum + amount,
        BigInt(0)
      );

      return totalReleased;
    },
    staleTime: Infinity,
    gcTime: 1000 * 60,
    enabled: !!receiver && !!client && streamIds.length > 0,
  });
};

export const useIsActivePaymentReceiver = ({
  paymentProcessorAddress,
  client,
  receiver,
}: {
  paymentProcessorAddress: string;
  client: string;
  receiver: `0x${string}` | undefined;
}) => {
  const publicClient = usePublicClient();
  return useQuery({
    queryKey: ['isActivePaymentReceiver', paymentProcessorAddress],
    queryFn: async (): Promise<boolean> => {
      const contract = getContract({
        address: paymentProcessorAddress as Address,
        abi: claimTokensABI,
        client: publicClient!,
      });

      const res = await contract.read.isActivePaymentReceiver([
        client,
        receiver,
      ]);

      return res as boolean;
    },
    staleTime: Infinity,
    gcTime: 1000 * 60,
    enabled: !!receiver && !!client,
  });
};

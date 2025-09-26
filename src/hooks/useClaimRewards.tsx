import { useMutation, useQuery } from '@tanstack/react-query';
import { Address, getContract } from 'viem';
import { usePublicClient, useWalletClient } from 'wagmi';

import { useZeroDev } from '@/contexts/ZeroDevContext';
import { claimTokensABI } from '@/lib/abi/inverter';

// export const useClaimRewards = ({
//   paymentProcessorAddress,
//   paymentRouterAddress,
//   onSuccess = () => {},
//   onError = () => {},
// }: {
//   paymentProcessorAddress: string;
//   paymentRouterAddress: string;
//   onSuccess?: () => void;
//   onError?: (error: Error) => void;
// }) => {
//   const { data: walletClient } = useWalletClient();
//   const publicClient = usePublicClient();

//   const claim = useMutation({
//     mutationFn: async () => {
//       if (!walletClient) throw new Error("Wallet not connected");

//       const contract = getContract({
//         address: paymentProcessorAddress as Address,
//         abi: claimTokensABI,
//         client: walletClient,
//       });

//       const tx = await contract.write.claimAll([paymentRouterAddress]);

//       await publicClient!.waitForTransactionReceipt({
//         hash: tx,
//       });
//     },
//     onSuccess,
//     onError,
//   });

//   return { claim };
// };

export const useClaimRewards = ({
  paymentProcessorAddress,
  paymentRouterAddress,
  onSuccess = () => {},
  onError = () => {},
}: {
  paymentProcessorAddress: string;
  paymentRouterAddress: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const { kernelClient, isInitializing } = useZeroDev();
  const publicClient = usePublicClient();

  const claim = useMutation({
    mutationFn: async () => {
      if (!kernelClient) {
        throw new Error('Smart account not initialized');
      }

      if (isInitializing) {
        throw new Error('Smart account is still initializing');
      }

      // Use the kernel client directly for gasless transactions
      const contract = getContract({
        address: paymentProcessorAddress as Address,
        abi: claimTokensABI,
        client: kernelClient,
      });

      const tx = await contract.write.claimAll([paymentRouterAddress]);

      // Wait for transaction confirmation
      await publicClient!.waitForTransactionReceipt({
        hash: tx,
      });

      return tx;
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

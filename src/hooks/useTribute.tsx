import { useMemo } from 'react';

import { useMutation, useQuery } from '@tanstack/react-query';
import { ethers, BigNumberish, Contract } from 'ethers';
import { Address, encodeFunctionData, getContract } from 'viem';
import { usePublicClient } from 'wagmi';

import config from '@/config/configuration';
import { useZeroDev } from '@/contexts/ZeroDevContext';
import { fundingManagerAbi, roleModuleAbi } from '@/lib/abi/inverter';
import { getClaimedTributesAndMintedTokenAmounts } from '@/services/tributeCollected.service';

const provider = new ethers.JsonRpcProvider(config.NETWORK_RPC_ADDRESS);

export const useClaimedTributesAndMintedTokenAmounts = (
  orchestratorAddress?: string,
  projectAddress?: string
) => {
  const query = useQuery<
    {
      claimedTributes: number;
      mintedTokenAmounts: number;
    },
    Error
  >({
    queryKey: [
      'claimedTributesAndMintedTokens',
      orchestratorAddress,
      projectAddress,
    ],
    queryFn: () =>
      getClaimedTributesAndMintedTokenAmounts(
        orchestratorAddress,
        projectAddress
      ),
    gcTime: 1000 * 60, // 1 minute
    enabled: !!orchestratorAddress && !!projectAddress, // Run only if orchestratorAddress and projectAddress is provided
  });

  return query;
};

export const useProjectCollateralFeeCollected = ({
  contractAddress,
}: {
  contractAddress: string;
}) => {
  const contract = useMemo(() => {
    if (!contractAddress) return null;
    return new Contract(contractAddress, fundingManagerAbi, provider);
  }, [contractAddress]);
  const projectCollateralFeeCollected = useQuery<BigNumberish, Error>({
    queryKey: ['projectCollateralFeeCollected', contractAddress],
    queryFn: async () => {
      if (!contract) throw new Error('Contract not loaded');
      const result: BigNumberish =
        await contract.projectCollateralFeeCollected();
      return result;
    },
    enabled: !!contract,
    // select: data => Number(formatUnits(data, 18)), // Assuming the result has 18 decimals
  });

  return projectCollateralFeeCollected;
};

export const useClaimCollectedFee = ({
  fundingManagerAddress,
  tributeModule,
  feeRecipient,
  amount,
  onSuccess = () => {},
}: {
  fundingManagerAddress: string;
  tributeModule: string;
  feeRecipient: string;
  amount: BigNumberish;
  onSuccess?: () => void;
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

      if (!publicClient) {
        throw new Error('Public client not available');
      }

      const rolesModuleInstance = getContract({
        address: tributeModule as Address,
        abi: roleModuleAbi,
        client: kernelClient,
      });

      const encoded = encodeFunctionData({
        abi: fundingManagerAbi,
        functionName: 'withdrawProjectCollateralFee',
        args: [feeRecipient, amount],
      });

      const tx = await rolesModuleInstance.write.execTransactionFromModule(
        [fundingManagerAddress, 0, encoded, 0],
        { gas: 1000000 }
      );

      await publicClient.waitForTransactionReceipt({
        hash: tx,
      });

      return tx;
    },
    onSuccess,
  });

  return {
    claim,
    isSmartAccountReady: !!kernelClient && !isInitializing,
  };
};

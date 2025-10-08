import { useQuery } from '@tanstack/react-query';
import { createPublicClient, http } from 'viem';
import { polygon } from 'viem/chains';
import { usePublicClient } from 'wagmi';

import {
  checkBondingCurvePermissions,
  RoleCheckResult,
} from '@/services/roleCheck.service';

const publicClient = createPublicClient({
  chain: polygon,
  transport: http(polygon.rpcUrls.default.http[0]),
});

export const useRoleCheck = (bondingCurveAddress: string, address: string) => {

  return useQuery<RoleCheckResult>({
    queryKey: ['roleCheck', bondingCurveAddress, address],
    queryFn: async () => {
      if (!publicClient || !bondingCurveAddress || !address) {
        throw new Error('Missing required parameters for role check');
      }

      return await checkBondingCurvePermissions(
        publicClient,
        bondingCurveAddress,
        address
      );
    },
    enabled: !!publicClient && !!bondingCurveAddress && !!address,
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
  });
};

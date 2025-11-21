import { usePrivy } from '@privy-io/react-auth';
import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';
import { useAccount } from 'wagmi';

import { checkWhitelist } from '@/app/actions/check-whitelist';

export const useAddressWhitelist = () => {
  const { address } = useAccount();
  const { user } = usePrivy();

  const userAddress = user?.wallet?.address || address;

  return useQuery({
    queryKey: ['whitelist', userAddress],
    queryFn: async () => {
      return checkWhitelist(userAddress as Address);
    },
    enabled: !!userAddress,
    staleTime: Infinity, // Never goes stale
    gcTime: 1000 * 60 * 60 * 24, // Keep in memory for 24 hours
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
};

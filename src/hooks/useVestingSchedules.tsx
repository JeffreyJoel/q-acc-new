import { useQuery } from '@tanstack/react-query';

import { fetchVestingSchedules } from '@/services/round.services';
import { IVestingSchedule } from '@/types/round.type';

/**
 * Fetch vesting schedules using React Query.
 */
export const useVestingSchedules = (options?: {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}) => {
  return useQuery<IVestingSchedule[] | undefined, Error>({
    queryKey: ['vestingSchedules'],
    queryFn: async () => await fetchVestingSchedules(),
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime ?? Infinity,
    gcTime: options?.gcTime ?? Infinity,
  });
};

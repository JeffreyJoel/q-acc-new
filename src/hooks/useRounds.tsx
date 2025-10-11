import { useEffect, useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { getMostRecentEndRound } from '@/helpers/round';
import {
  fetchActiveRoundDetails,
  fetchAllRoundDetails,
  fetchProjectRoundRecords,
  fetchQaccRoundStats,
} from '@/services/round.services';
import { IQfRound } from '@/types/round.type';
import { IEarlyAccessRound } from '@/types/round.type';

/**
 * Hook to fetch active round details
 */
export const useFetchActiveRoundDetails = () => {
  return useQuery({
    queryKey: ['activeRoundDetails'],
    queryFn: async () => {
      return await fetchActiveRoundDetails();
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });
};

/**
 * Hook to fetch all rounds details
 */
export const useFetchAllRoundDetails = () => {
  return useQuery({
    queryKey: ['allRoundDetails'],
    queryFn: async () => {
      return await fetchAllRoundDetails();
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });
};

/**
 * Hook to fetch project round records
 * @param projectId - The ID of the project
 * @param qfRoundNumber - Optional QF round number
 * @param earlyAccessRoundNumber - Optional early access round number
 */
export const useFetchProjectRoundRecords = (
  projectId: number,
  qfRoundNumber?: number,
  earlyAccessRoundNumber?: number
) => {
  return useQuery({
    queryKey: [
      'projectRoundRecords',
      projectId,
      qfRoundNumber,
      earlyAccessRoundNumber,
    ],
    queryFn: async () => {
      return await fetchProjectRoundRecords(
        projectId,
        qfRoundNumber,
        earlyAccessRoundNumber
      );
    },
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: !!projectId,
  });
};

export const useFetchQaccRoundStats = () => {
  return useQuery({
    queryKey: ['qaccRoundStats'],
    queryFn: async () => {
      return await fetchQaccRoundStats();
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });
};

export const useFetchMostRecentEndRound = (
  activeRoundDetails: IEarlyAccessRound | IQfRound | undefined
) => {
  const [isRoundEnded, setIsRoundEnded] = useState(false);
  useEffect(() => {
    const fetchMostRecentEndRound = async () => {
      const res = await getMostRecentEndRound();

      return res?.__typename === 'QfRound';
    };

    const getData = async () => {
      const data = await fetchMostRecentEndRound();
      setIsRoundEnded(data);
    };

    getData();
  }, [activeRoundDetails, isRoundEnded]);

  return isRoundEnded;
};

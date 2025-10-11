import { useQuery, QueryKey } from '@tanstack/react-query';

import {
  fetchLeaderBoard,
  IOrderBy,
  ILeaderBoardInfo,
} from '@/services/points.service';

const LEADERBOARD_STORAGE_KEY = 'leaderboardData';
const STALE_TIME_MS = 1000 * 60 * 5; // 5 minutes
const GC_TIME_MS = 1000 * 60 * 10; // 10 minutes, should be >= staleTime

// Type for the data returned by fetchLeaderBoard and used by the query
type LeaderboardQueryData =
  | ILeaderBoardInfo['getUsersByQaccPoints']
  | undefined;

interface StoredLeaderboardData {
  timestamp: number;
  data: LeaderboardQueryData;
}

export const useFetchLeaderBoard = (
  take: number,
  skip: number,
  orderBy: IOrderBy,
  initialDataProp?: LeaderboardQueryData
) => {
  return useQuery<LeaderboardQueryData, Error, LeaderboardQueryData, QueryKey>({
    queryKey: ['leaderboard', take, skip, orderBy.direction, orderBy.field],
    queryFn: async () => {
      const fetchedData = await fetchLeaderBoard(take, skip, orderBy);
      // Save to session storage on successful fetch
      if (typeof window !== 'undefined' && fetchedData) {
        try {
          const storedData: StoredLeaderboardData = {
            timestamp: Date.now(),
            data: fetchedData,
          };
          sessionStorage.setItem(
            LEADERBOARD_STORAGE_KEY,
            JSON.stringify(storedData)
          );
        } catch (error) {
          console.error('Error saving leaderboard to session storage:', error);
        }
      }
      return fetchedData;
    },
    staleTime: STALE_TIME_MS,
    gcTime: GC_TIME_MS,
    refetchInterval: STALE_TIME_MS,
    initialData: initialDataProp,
    // onSuccess is available directly on useQuery options in v4/v5
    // but if issues persist with overloads, alternative is useEffect in calling component
  });
};

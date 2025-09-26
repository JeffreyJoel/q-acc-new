'use client';

import { useState, useMemo, useEffect } from 'react';

import { useFetchLeaderBoard } from '@/hooks/useFetchLeaderBoard';
import {
  SortDirection,
  SortField,
  ILeaderBoardInfo,
} from '@/services/points.service';
import { LeaderboardUser } from '@/types/leaderboard';

import { Spinner } from '../loaders/Spinner';

import { LeaderboardItem } from './LeaderboardItem';
import { Pagination } from './Pagination';
import { UserInfo } from './UserInfo';

const LEADERBOARD_STORAGE_KEY = 'leaderboardData';
const MAX_CACHE_AGE_MS = 1000 * 60 * 7;

type LeaderboardQueryData =
  | ILeaderBoardInfo['getUsersByQaccPoints']
  | undefined;

interface StoredLeaderboardData {
  timestamp: number;
  data: LeaderboardQueryData;
  sortField: SortField;
  sortDirection: SortDirection;
}

const getInitialLeaderboardData = (): LeaderboardQueryData => {
  if (typeof window === 'undefined') {
    return undefined;
  }
  try {
    const storedItem = sessionStorage.getItem(LEADERBOARD_STORAGE_KEY);
    if (!storedItem) return undefined;

    const parsedItem: StoredLeaderboardData = JSON.parse(storedItem);

    if (Date.now() - parsedItem.timestamp < MAX_CACHE_AGE_MS) {
      return parsedItem.data;
    }
  } catch (error) {
    console.error('Error reading leaderboard from session storage:', error);
    sessionStorage.removeItem(LEADERBOARD_STORAGE_KEY);
  }
  return undefined;
};

export function PointsTable() {
  const [sortField, setSortField] = useState<SortField>('Rank');
  const [sortDirection, setSortDirection] = useState<SortDirection>('ASC');
  const [page, setPage] = useState(0);
  const LIMIT = 15;
  const FETCH_ALL_LIMIT = 5000;

  const [initialData] = useState<LeaderboardQueryData>(() =>
    getInitialLeaderboardData()
  );

  const { data: leaderboardInfo, isLoading } = useFetchLeaderBoard(
    FETCH_ALL_LIMIT,
    0,
    {
      field: sortField,
      direction: sortDirection,
    },
    initialData
  );

  useEffect(() => {
    setPage(0);
  }, [sortField, sortDirection]);

  const filteredAndSortedUsers = useMemo(() => {
    return leaderboardInfo?.users ?? [];
  }, [leaderboardInfo?.users]);

  const total = filteredAndSortedUsers.length;
  const totalPages = Math.ceil(total / LIMIT);
  const paginatedUsers = useMemo(() => {
    const start = page * LIMIT;
    const end = start + LIMIT;
    return filteredAndSortedUsers.slice(start, end);
  }, [filteredAndSortedUsers, page, LIMIT]);

  return (
    <div className='flex flex-col'>
      <UserInfo />

      <div className='space-y-3 my-4'>
        {isLoading && (
          <div className='flex justify-center items-center h-full'>
            <Spinner size={32} />
          </div>
        )}

        {paginatedUsers.map(item => (
          <LeaderboardItem key={item.id} user={item as LeaderboardUser} />
        ))}

        {totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}

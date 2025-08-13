import { useQuery } from '@tanstack/react-query';
import { ITokenHoldersResponse, ITokenHolding } from '@/types/token-holders.type';
import { GET_TOKEN_HOLDERS_BY_PROJECT } from '@/queries/project.query';
import { requestGraphQL } from '@/helpers/request';

/**
 * Fetches token holders (top 20) & total count from the internal API.
 * The query result is cached by React-Query, so multiple components using
 * the same tokenAddress will share the data without triggering extra requests.
 */
export const useTokenHolders = (
  tokenAddress: string,
  options?: {
    enabled?: boolean;
    staleTime?: number;
  }
) => {
  return useQuery<ITokenHoldersResponse, Error>({
    queryKey: ['tokenHolders', tokenAddress],
    queryFn: async () => {
      const res = await fetch(`/api/token-holders?tokenAddress=${tokenAddress}`);
      if (!res.ok) throw new Error('Failed to fetch token holders');
      return res.json();
    },
    enabled: (options?.enabled ?? true) && Boolean(tokenAddress),
    staleTime: options?.staleTime ?? 1000 * 60 * 5, // 5 minutes
  });
};


export const useTokenHolderTags = (projectName: string) => {
  return useQuery<ITokenHolding[], Error>({
    queryKey: ['tokenHolderTags', projectName],
    queryFn: async () => {
      const res = await requestGraphQL<{ tokenHoldersByProject: ITokenHolding[] }>(
        GET_TOKEN_HOLDERS_BY_PROJECT,
        { projectName },
        {url: "https://staging.qacc-be.generalmagic.io/graphql"}
      );
      return res.tokenHoldersByProject;
    },
    enabled: !!projectName,
  });
};

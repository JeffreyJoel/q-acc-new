import { useQuery } from '@tanstack/react-query';
import { IProject } from '@/types/project.type';
import {
  fetchAllProjectsData,
  EnrichedProjectData,
} from '@/services/projectData.service';

/**
 * Hook that takes the light-weight IProject[] (GraphQL response)
 * and returns the fully "enriched" project list with market data.
 * The result is cached with React-Query to prevent duplicate network calls
 * across carousel, table, etc.
 */
export const useEnrichedProjects = (initialProjects: IProject[] | undefined) => {
  return useQuery<EnrichedProjectData[], Error>({
    queryKey: ['enrichedProjects', initialProjects?.length ?? 0],
    queryFn: () => fetchAllProjectsData(initialProjects ?? []),
    enabled: !!initialProjects && initialProjects.length > 0,
    staleTime: 1000 * 60 * 10, // 10 minutes
    // Provide placeholder skeletons so the UI can render instantly
    placeholderData: () => {
      if (!initialProjects) return [];
      return initialProjects.map<EnrichedProjectData>((p) => ({
        id: p.id!,
        title: p.title || '',
        slug: p.slug || '',
        image: p.image,
        icon: p.icon,
        seasonNumber: p.seasonNumber || 1,
        descriptionSummary: p.descriptionSummary,
        categories: p.categories,
        totalDonatedPOL: 0,
        totalDonatedUSD: 0,
        supporterCount: 0,
        marketCapUSD: 0,
        priceUSD: 0,
        pricePOL: 0,
        isTokenListed: false,
        tokenTicker: p.abc?.tokenTicker,
        tokenAddress: p.abc?.issuanceTokenAddress,
        priceChange24h: 0,
        priceChange7d: 0,
      }));
    },
  });
};

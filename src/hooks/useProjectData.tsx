import { useState, useEffect } from 'react';
import { IProject } from '@/types/project.type';
import { fetchAndAggregateProjectData, EnrichedProjectData } from '@/services/projectData.service';
import { useFetchActiveRoundDetails, useFetchAllRoundDetails } from './useRounds';
import { calculateCapAmount } from '@/helpers/round';
import { getUpcomingRound } from '@/helpers/date';

interface UseProjectDataReturn extends EnrichedProjectData {
  // Round-specific data
  maxPOLCap: number;
  amountDonatedInRound: number;
  roundStatus: 'starts' | 'ended';
  activeRoundDetails: any;
  // Loading states
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook that aggregates all project data needed for display
 * This replaces the multiple useEffect hooks in ProjectCard
 */
export const useProjectData = (project: IProject): UseProjectDataReturn => {
  const [enrichedData, setEnrichedData] = useState<EnrichedProjectData | null>(null);
  const [maxPOLCap, setMaxPOLCap] = useState(0);
  const [amountDonatedInRound, setAmountDonatedInRound] = useState(0);
  const [roundStatus, setRoundStatus] = useState<'starts' | 'ended'>('ended');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch round data using existing hooks
  const { data: activeRoundDetails } = useFetchActiveRoundDetails();
  const { data: allRounds } = useFetchAllRoundDetails();

  // Fetch and aggregate core project data
  useEffect(() => {
    if (!project?.id) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const data = await fetchAndAggregateProjectData(project);
        setEnrichedData(data);
      } catch (err) {
        console.error('Error fetching project data:', err);
        setError('Failed to load project data');
        
        // Set fallback data
        setEnrichedData({
          id: project.id || '',
          title: project.title || '',
          slug: project.slug || '',
          image: project.image,
          icon: project.icon,
          seasonNumber: project.seasonNumber || 1,
          descriptionSummary: project.descriptionSummary,
          categories: project.categories,
          totalDonatedPOL: 0,
          totalDonatedUSD: 0,
          supporterCount: 0,
          marketCapUSD: 0,
          priceUSD: 0,
          pricePOL: 0,
          isTokenListed: false,
          tokenTicker: project.abc?.tokenTicker,
          tokenAddress: project.abc?.issuanceTokenAddress,
          priceChange24h: 0,
          priceChange7d: 0,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [project?.id, project?.abc?.issuanceTokenAddress]);

  // Calculate POL cap and donation amounts for active round
  useEffect(() => {
    if (!activeRoundDetails || !project?.id) return;

    const updatePOLCap = async () => {
      try {
        const { capAmount, totalDonationAmountInRound } = await calculateCapAmount(
          activeRoundDetails,
          Number(project.id),
          true
        );

        setMaxPOLCap(capAmount);
        setAmountDonatedInRound(totalDonationAmountInRound);
      } catch (error) {
        console.error('Error calculating POL cap:', error);
      }
    };

    updatePOLCap();
  }, [activeRoundDetails, project?.id]);

  // Calculate round status
  useEffect(() => {
    if (!allRounds) return;

    const calcRoundStatus = async () => {
      try {
        const upcomingRound = await getUpcomingRound(allRounds);
        setRoundStatus(upcomingRound?.startDate ? 'starts' : 'ended');
      } catch (error) {
        console.error('Error calculating round status:', error);
      }
    };

    calcRoundStatus();
  }, [allRounds]);

  // Return the aggregated data
  return {
    // Core enriched data
    ...(enrichedData || {
      id: '',
      title: '',
      slug: '',
      seasonNumber: 1,
      totalDonatedPOL: 0,
      totalDonatedUSD: 0,
      supporterCount: 0,
      marketCapUSD: 0,
      priceUSD: 0,
      pricePOL: 0,
      isTokenListed: false,
      priceChange24h: 0,
      priceChange7d: 0,
    }),
    // Round-specific data
    maxPOLCap,
    amountDonatedInRound,
    roundStatus,
    activeRoundDetails,
    // Loading states
    isLoading,
    error,
  };
}; 
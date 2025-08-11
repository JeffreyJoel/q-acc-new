import { fetchProjectDonationsById } from './donation.service';
import { getMarketCap, calculateMarketCapChange, fetchGeckoMarketCap } from './tokenPrice.service';
import { getPoolAddressByPair } from '@/helpers/getTokensListedData';
import { calculateTotalDonations, calculateUniqueDonors } from '@/helpers/donations';
import { fetchSquidPOLUSDPrice } from '@/helpers/token';
import config from '@/config/configuration';
import { IProject } from '@/types/project.type';

const PRISMO_TOKEN_ADDRESS = '0x0b7a46e1af45e1eaadeed34b55b6fc00a85c7c68';

export interface EnrichedProjectData {
  id: string;
  title: string;
  slug: string;
  image?: string;
  icon?: string;
  seasonNumber: number;
  descriptionSummary?: string;
  categories?: Array<{ name: string }>;
  // Financial data
  totalDonatedPOL: number;
  totalDonatedUSD: number;
  supporterCount: number;
  marketCapUSD: number;
  // Token data
  priceUSD: number;
  pricePOL: number;
  isTokenListed: boolean;
  tokenTicker?: string;
  tokenAddress?: string;
  // Price changes
  priceChange24h?: number;
  priceChange7d?: number;
}

/**
 * Fetches and aggregates comprehensive data for a single project
 */
export async function fetchProjectStats(project: IProject): Promise<{
  totalDonatedPOL: number;
  totalDonatedUSD: number;
  supporterCount: number;
}> {
  try {
    if (!project.id) {
      return { totalDonatedPOL: 0, totalDonatedUSD: 0, supporterCount: 0 };
    }

    const donationsData = await fetchProjectDonationsById(
      parseInt(project.id),
      1000,
      0
    );

    if (!donationsData?.donations) {
      return { totalDonatedPOL: 0, totalDonatedUSD: 0, supporterCount: 0 };
    }

    const donations = donationsData.donations;
    const totalDonatedPOL = calculateTotalDonations(donations);
    const supporterCount = calculateUniqueDonors(donations);
    
    // Get POL price for USD conversion
    const polPriceUSD = await fetchSquidPOLUSDPrice();
    const totalDonatedUSD = totalDonatedPOL * (polPriceUSD || 0);

    return {
      totalDonatedPOL,
      totalDonatedUSD,
      supporterCount,
    };
  } catch (error) {
    console.error(`Error fetching project stats for project ${project.id}:`, error);
    return { totalDonatedPOL: 0, totalDonatedUSD: 0, supporterCount: 0 };
  }
}

/**
 * Fetches token price and market cap data for a project
 */
export async function fetchTokenData(project: IProject): Promise<{
  priceUSD: number;
  pricePOL: number;
  marketCapUSD: number;
  isTokenListed: boolean;
  change24h: number;
  change7d: number;
}> {
  try {
    if (!project.abc?.issuanceTokenAddress) {
      return { priceUSD: 0, pricePOL: 0, marketCapUSD: 0, isTokenListed: false, change24h: 0, change7d: 0 };
    }

    const tokenAddress = project.abc.issuanceTokenAddress;
    
    // Get token price and listing status
    const { price, isListed } = await getPoolAddressByPair(
      tokenAddress,
      config.WPOL_TOKEN_ADDRESS
    );

    let pricePOL = 0;
    if (isListed) {
      // Handle special case for PRISMO token
      if (tokenAddress.toLowerCase() === PRISMO_TOKEN_ADDRESS.toLowerCase()) {
        pricePOL = Number(price);
      } else {
        pricePOL = Number(price) === 0 ? 0 : 1 / Number(price);
      }
    }

    // Get POL price in USD for conversion
    const polPriceUSD = await fetchSquidPOLUSDPrice();
    const priceUSD = pricePOL * (polPriceUSD || 0);

    // Get market cap
    let marketCapUSD = 0;
    let change24h = 0;
    let change7d = 0;
    if (project.abc.fundingManagerAddress) {
      try {
        // For market cap calculation, we might need donations data
        const donationsData = await fetchProjectDonationsById(
          parseInt(project.id!),
          1000,
          0
        );
        const donations = donationsData?.donations || [];

        const marketCap = await getMarketCap(
          isListed,
          tokenAddress,
          project.abc.fundingManagerAddress,
          donations
        );

        if (isListed) {
          marketCapUSD = marketCap;

          // Pull percentage deltas from GeckoTerminal result (price proxy)
          const gecko = await fetchGeckoMarketCap(tokenAddress);
          change24h = gecko?.pctChange24h ?? 0;
          change7d = gecko?.pctChange7d ?? 0;
        } else {
          marketCapUSD = marketCap * (polPriceUSD || 0);
          // compute deltas only for curve-based tokens
          const res24 = await calculateMarketCapChange(
            donations,
            project.abc.fundingManagerAddress,
            24
          );
          change24h = res24.pctChange;

          const res7d = await calculateMarketCapChange(
            donations,
            project.abc.fundingManagerAddress,
            24 * 7
          );
          change7d = res7d.pctChange;
        }
      } catch (error) {
        console.error(`Error calculating market cap for project ${project.id}:`, error);
      }
    }

    return {
      priceUSD,
      pricePOL,
      marketCapUSD,
      isTokenListed: isListed,
      change24h,
      change7d,
    };
  } catch (error) {
    console.error(`Error fetching token data for project ${project.id}:`, error);
    return { priceUSD: 0, pricePOL: 0, marketCapUSD: 0, isTokenListed: false, change24h: 0, change7d: 0 };
  }
}

/**
 * Combines project stats and token data into a single enriched object
 */
export async function fetchAndAggregateProjectData(project: IProject): Promise<EnrichedProjectData> {
  try {
    // Fetch both stats and token data in parallel
    const [stats, tokenData] = await Promise.all([
      fetchProjectStats(project),
      fetchTokenData(project)
    ]);

    return {
      id: project.id!,
      title: project.title || '',
      slug: project.slug || '',
      image: project.image,
      icon: project.icon,
      seasonNumber: project.seasonNumber || 1,
      descriptionSummary: project.descriptionSummary,
      categories: project.categories,
      totalDonatedPOL: stats.totalDonatedPOL,
      totalDonatedUSD: stats.totalDonatedUSD,
      supporterCount: stats.supporterCount,
      marketCapUSD: tokenData.marketCapUSD,
      priceUSD: tokenData.priceUSD,
      pricePOL: tokenData.pricePOL,
      isTokenListed: tokenData.isTokenListed,
      tokenTicker: project.abc?.tokenTicker,
      tokenAddress: project.abc?.issuanceTokenAddress,
      // Placeholder for future price change implementation
      priceChange24h: tokenData.change24h,
      priceChange7d: tokenData.change7d,
    };
  } catch (error) {
    console.error(`Error aggregating data for project ${project.id}:`, error);
    // Return minimal data on error
    return {
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
    };
  }
}

/**
 * Batch fetches enriched data for multiple projects
 */
export async function fetchAllProjectsData(projects: IProject[]): Promise<EnrichedProjectData[]> {
  try {
    const CONCURRENCY = 5; // simultaneous RPC calls

    const enriched: EnrichedProjectData[] = [];

    // Batch process to respect RPC provider rate-limits
    for (let i = 0; i < projects.length; i += CONCURRENCY) {
      const slice = projects.slice(i, i + CONCURRENCY);

      // run the current batch in parallel
      const batchResults = await Promise.all(
        slice.map((p) => fetchAndAggregateProjectData(p))
      );

      enriched.push(...batchResults);
    }

    return enriched;
  } catch (error) {
    console.error('Error fetching all projects data:', error);
    throw error;
  }
} 
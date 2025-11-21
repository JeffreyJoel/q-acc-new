import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ethers, BigNumberish, Contract, formatUnits } from 'ethers';
import { createPublicClient, http, formatUnits as viemFormatUnits } from 'viem';
import { polygon } from 'viem/chains';

import config from '@/config/configuration';
import { IProject } from '@/types/project.type';
import { IEarlyAccessRound, IQfRound } from '@/types/round.type';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

/**
 * Fetches market-cap series for the last `days` and returns latest cap plus percentage changes.
 * Uses the "contract market_chart" endpoint which supports Polygon (asset platform "polygon-pos").
 */
export async function fetchCoinGeckoMarketChart(
  tokenAddress: string,
  days: number = 7
) {
  try {
    const baseUrl = `${COINGECKO_API}/coins/polygon-pos/contract/${tokenAddress}`;

    const { data } = await axios.get(baseUrl);

    const latestCap = data?.market_cap_usd ?? 0;

    const pctChange24h = data?.price_change_percentage_24h ?? 0;
    const pctChange7d = data?.price_change_percentage_7d ?? 0;

    return { marketCap: latestCap, pctChange24h, pctChange7d };
  } catch (err) {
    console.error('Error fetching market chart from CoinGecko', err);
    return null;
  }
}

const provider = new ethers.JsonRpcProvider(config.NETWORK_RPC_ADDRESS);

// Create viem public client for multicall
const viemClient = createPublicClient({
  chain: polygon,
  transport: http(config.NETWORK_RPC_ADDRESS),
});

const abi = [
  {
    inputs: [],
    name: 'getReserveRatioForBuying',
    outputs: [{ internalType: 'uint32', name: '', type: 'uint32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_depositAmount', type: 'uint256' },
    ],
    name: 'calculatePurchaseReturn',
    outputs: [{ internalType: 'uint256', name: 'mintAmount', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getStaticPriceForBuying',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getVirtualCollateralSupply',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getVirtualIssuanceSupply',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];

interface UseTokenPriceRangeProps {
  contributionLimit: number;
  contractAddress?: string;
}

interface TokenPriceRangeResult {
  min: number;
  max: number;
}

export const useTokenPriceRange = ({
  contributionLimit, // Contribution limit up to the current batch
  contractAddress, // fundingManagerAddress
}: UseTokenPriceRangeProps): TokenPriceRangeResult => {
  const contract = useMemo(() => {
    if (!contractAddress) return null;
    return new Contract(contractAddress, abi, provider);
  }, [contractAddress]);
  const staticPriceForBuying = useQuery<BigNumberish, Error>({
    queryKey: ['getStaticPriceForBuying', contractAddress],
    queryFn: async () => {
      if (!contract) throw new Error('Contract not loaded');
      const result: BigNumberish = await contract.getStaticPriceForBuying();
      return result;
    },
    enabled: !!contract,
    select: data => Number(data), // Convert BigNumber to number
  });

  const minPrice =
    parseFloat((staticPriceForBuying.data || '0').toString()) / 1_000_000; // convert PPM to price in POL

  const maxPrice = minPrice + 0.806; // hardcode max price with a delta of 0.786

  return { min: minPrice, max: maxPrice };
};

interface UseTokenPriceRangeStatusProps {
  allRounds?: (IQfRound | IEarlyAccessRound)[];
  project?: IProject;
}

interface TokenPriceRangeStatusResult {
  isPriceUpToDate: boolean;
}

const GECKO_TERMINAL_BASE_URL =
  'https://api.geckoterminal.com/api/v2/networks/polygon_pos/tokens';

const getBondingCurveSwapsQuery = `
    query getBondingCurveSwapsQuery($orchestratorAddress: String!) {
      BondingCurve(where: {workflow_id: {_ilike: $orchestratorAddress}}){
        id  
        swaps {
          swapType
          initiator
          recipient
        }
      }
    }
`;

async function getTokenPriceRangeStatus({
  allRounds,
  project,
}: UseTokenPriceRangeStatusProps): Promise<TokenPriceRangeStatusResult> {
  if (allRounds && project) {
    const tenMinutesLater =
      new Date().getTime() +
      Number(process.env.NEXT_PUBLIC_ADJUSTED_MINUTES || '10') * 60 * 1000;
    const latestEndedRound = allRounds
      .filter(round => new Date(round.endDate).getTime() < tenMinutesLater) // Select rounds with endDate in past or less than 10 minutes later
      .sort(
        (a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
      )[0]; // Sort descending and take the first one
    if (latestEndedRound) {
      // if batch minting was not executed yet for the past round, it means the token price range is not valid
      if (!latestEndedRound.isBatchMintingExecuted) {
        return {
          isPriceUpToDate: false,
        };
      }
      // otherwise, we need to check number of executed transactions to be same with expected value
      const expectedTransactionsNumber =
        project.batchNumbersWithSafeTransactions?.length;
      if (expectedTransactionsNumber) {
        try {
          const result = await axios.post(config.INDEXER_GRAPHQL_URL, {
            query: getBondingCurveSwapsQuery,
            variables: {
              orchestratorAddress: `${config.SUPPORTED_CHAINS[0]?.id}-${project.abc?.orchestratorAddress}`,
            },
          });
          const swaps = result.data.data.BondingCurve[0]?.swaps;
          const numberOfExecutedTransactions: number = swaps.filter(
            (swap: {
              swapType: string;
              initiator: string;
              recipient: string;
            }) =>
              swap.swapType === 'BUY' &&
              swap.initiator.toLowerCase() === swap.recipient.toLowerCase() &&
              (project.abc?.projectAddress
                ? swap.recipient.toLowerCase() ===
                  project.abc?.projectAddress.toLowerCase()
                : true)
          ).length;
          if (numberOfExecutedTransactions < expectedTransactionsNumber) {
            return {
              isPriceUpToDate: false,
            };
          }
        } catch (error) {
          console.error('Error fetching data from the endpoint:', error);
          return {
            isPriceUpToDate: true,
          };
        }
      }
    }
  }
  return {
    isPriceUpToDate: true,
  };
}

export const useTokenPriceRangeStatus = ({
  allRounds,
  project,
}: UseTokenPriceRangeStatusProps): {
  data?: TokenPriceRangeStatusResult;
  isSuccess: boolean;
} => {
  return useQuery<TokenPriceRangeStatusResult, Error>({
    queryKey: ['tokenPriceRangeStatus', allRounds, project],
    queryFn: () =>
      getTokenPriceRangeStatus({
        allRounds,
        project,
      }),
    enabled: !!allRounds && !!project, // Run only if allRounds and project is provided
  });
};

export async function getTokenSupplyDetails(address: string) {
  try {
    // Use viem multicall to batch all 3 contract calls
    const results = await viemClient.multicall({
      contracts: [
        {
          address: address as `0x${string}`,
          abi,
          functionName: 'getReserveRatioForBuying',
        },
        {
          address: address as `0x${string}`,
          abi,
          functionName: 'getVirtualCollateralSupply',
        },
        {
          address: address as `0x${string}`,
          abi,
          functionName: 'getVirtualIssuanceSupply',
        },
      ],
    });

    // Extract results and handle any failures
    const [reserveRatioResult, virtualCollateralResult, virtualIssuanceResult] =
      results;

    if (reserveRatioResult.status === 'failure') {
      throw new Error(
        `Failed to get reserve ratio: ${reserveRatioResult.error}`
      );
    }
    if (virtualCollateralResult.status === 'failure') {
      throw new Error(
        `Failed to get virtual collateral supply: ${virtualCollateralResult.error}`
      );
    }
    if (virtualIssuanceResult.status === 'failure') {
      throw new Error(
        `Failed to get virtual issuance supply: ${virtualIssuanceResult.error}`
      );
    }
    const collateral_supply = viemFormatUnits(
      virtualCollateralResult.result as bigint,
      18
    );
    const issuance_supply = viemFormatUnits(
      virtualIssuanceResult.result as bigint,
      18
    );
    const reserve_ration = viemFormatUnits(
      reserveRatioResult.result as bigint,
      6
    );

    return {
      reserve_ration,
      collateral_supply,
      issuance_supply,
    };
  } catch (error) {
    console.error('Error in getTokenSupplyDetails multicall:', error);
    throw error;
  }
}

export async function calculateMarketCapChange(
  donations: any[],
  contractAddress: string,
  hoursAgo: number = 24,
  startDateISO?: string
) {
  // 1.  Fetch on-chain curve parameters once
  const { reserve_ration, collateral_supply, issuance_supply } =
    await getTokenSupplyDetails(contractAddress);

  const reserveRatio = Number(reserve_ration);
  let reserve = Number(collateral_supply);
  let supply = Number(issuance_supply);

  const history: { ts: number; marketCap: number }[] = [];

  // helper to push a datapoint using current reserve/supply values
  const pushPoint = (ts: number) => {
    const price = (reserve / (supply * reserveRatio)) * 1.1;
    history.push({ ts, marketCap: supply * price });
  };

  // genesis point (either provided startDate or Unix epoch)
  const genesisTs = startDateISO ? new Date(startDateISO).getTime() : 0;
  pushPoint(genesisTs);

  // 2.  Replay donations chronologically
  donations
    .filter(d => new Date(d.createdAt).getTime() > genesisTs)
    .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt))
    .forEach(({ amount, createdAt }) => {
      supply = supply * Math.pow(1 + amount / reserve, reserveRatio);
      reserve += amount;
      pushPoint(new Date(createdAt).getTime());
    });

  if (history.length === 0) {
    return { marketCap: 0, pctChange: 0 };
  }

  const nowTs = Date.now();
  const cutoffTs = nowTs - hoursAgo * 60 * 60 * 1000;

  const latestCap = history[history.length - 1].marketCap;
  const pastCap =
    [...history].reverse().find(h => h.ts <= cutoffTs)?.marketCap ??
    history[0].marketCap;

  const pctChange = pastCap === 0 ? 0 : ((latestCap - pastCap) / pastCap) * 100;

  return { marketCap: Math.round(latestCap), pctChange };
}

export async function fetchGeckoMarketCap(tokenAddress: string) {
  try {
    const poolsUrl = `${GECKO_TERMINAL_BASE_URL}/${tokenAddress.toLowerCase()}/pools?page=1`;
    const { data: poolsData } = await axios.get(poolsUrl);

    if (!poolsData?.data || poolsData.data.length === 0) {
      throw new Error('No pools returned from GeckoTerminal');
    }

    // Pick the first pool in the list
    const poolAttributes = poolsData.data[0].attributes;

    // USD price for the token
    const priceUSD = parseFloat(
      poolAttributes.token_price_usd ??
        poolAttributes.base_token_price_usd ??
        '0'
    );
    if (isNaN(priceUSD) || priceUSD === 0) {
      return null;
    }

    // Fully-diluted valuation (if available)
    const marketCap = poolAttributes.fdv_usd
      ? parseFloat(poolAttributes.fdv_usd)
      : null;

    // 24-hour price change percentage – directly available from GeckoTerminal pools response
    const pct24 = parseFloat(
      poolAttributes.price_change_percentage?.h24 ?? '0'
    );

    let pricePOL = 0;
    try {
      const wpolUrl = `${GECKO_TERMINAL_BASE_URL}/${config.WPOL_TOKEN_ADDRESS.toLowerCase()}`;
      const { data: wpolData } = await axios.get(wpolUrl);
      const polPriceUSD = parseFloat(wpolData.data.attributes.price_usd);
      if (!isNaN(polPriceUSD) && polPriceUSD !== 0) {
        pricePOL = priceUSD / polPriceUSD;
      }
    } catch (e) {
      // Fallback: keep pricePOL as 0 on failure – not critical for current use-cases
      console.warn('Failed to fetch WPOL price from GeckoTerminal', e);
    }

    return {
      price: pricePOL,
      priceUSD,
      marketCap,
      pctChange24h: isNaN(pct24) ? 0 : pct24,
    };
  } catch (error: any) {
    console.error('Error fetching token data from GeckoTerminal', {
      tokenAddress,
      error: error.message,
    });
    return null;
  }
}

export async function getMarketCap(
  isTokenListed: boolean,
  tokenAddress: string,
  contract_address: string,
  donations?: any[]
): Promise<number> {
  if (isTokenListed) {
    const result = await fetchGeckoMarketCap(tokenAddress);
    return result?.marketCap ?? 0;
  } else {
    if (donations && donations.length > 0) {
      const { marketCap } = await calculateMarketCapChange(
        donations,
        contract_address
      );
      return marketCap;
    }

    const { reserve_ration, collateral_supply, issuance_supply } =
      await getTokenSupplyDetails(contract_address);

    const reserveRatio = Number(reserve_ration);
    const reserve = Number(collateral_supply);
    const supply = Number(issuance_supply);

    const initialPrice = (reserve / (supply * reserveRatio)) * 1.1;
    const marketCap = supply * initialPrice;
    return marketCap;
  }
}

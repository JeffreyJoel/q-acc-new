import { useQuery, UseQueryResult } from '@tanstack/react-query';
import config from '@/config/configuration';
import { useState, useEffect } from 'react';

const headers = {
  'x-integrator-id': config.SQUID_INTEGRATOR_ID,
};

export interface ISquidChain {
  id: string;
  chainId: string;
  networkIdentifier: string;
  chainName: string;
  axelarChainName: string;
  type: string;
  networkName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
    icon: string;
  };
  chainIconURI: string;
  blockExplorerUrls: string[];
  swapAmountForGas: string;
  sameChainSwapsSupported: boolean;
  squidContracts: {
    squidRouter: string;
    defaultCrosschainToken: string;
    squidMulticall: string;
    squidFeeCollector: string;
  };
  compliance: {
    trmIdentifier: string;
  };
  boostSupported: boolean;
  enableBoostByDefault: boolean;
  bridges: {
    axelar: {
      gateway: string;
      itsService: string;
      gasService: string;
    };
    cctp: {
      cctpDomain: string;
      tokenMessenger: string;
      messageTransmitter: string;
    };
    chainflip: {
      vault: string;
    };
    immutable: {
      bridgeProxy: string;
      adaptorProxy: string;
    };
  };
  rpcList: string[];
  axelarFeeMultiplier: number;
  visible: boolean;
  chainNativeContracts: {
    wrappedNativeToken: string;
    ensRegistry: string;
    multicall: string;
    usdcToken: string;
  };
  feeCurrencies: any[];
  currencies: any[];
  features: any[];
  enabled: boolean;
  rpc: string;
  chainType: string;
}
interface ISquidChainResponse {
  chains: ISquidChain[];
}

export const useFetchChainsFromSquid = (): UseQueryResult<{ chains: ISquidChain[] }, Error> => {
  return useQuery<{ chains: ISquidChain[] }, Error>({
    queryKey: ['squid-data'],
    queryFn: async () => {
      // Fetch list of chains
      const chainsResponse = await fetch('https://apiplus.squidrouter.com/v2/chains', { headers });
      const chainsJson: ISquidChainResponse = await chainsResponse.json();

      // For now, we'll fetch a limited set of popular tokens to avoid the 70k+ token issue
      // In production, you'd want to implement a more sophisticated token fetching strategy
      const tokensResponse = await fetch('https://apiplus.squidrouter.com/v2/tokens', { headers });
      // const tokensJson: { tokens: any[] } = await tokensResponse.json();

      return { chains: chainsJson.chains};
    },
    staleTime: Infinity,
    // cacheTime is not supported by react-query config here
  });
};

// Efficient hook for fetching tokens by chain with search
export const useFetchTokensByChain = (
  chainId: string | null,
  searchTerm: string = '',
  enabled: boolean = true
): UseQueryResult<any[], Error> => {
  return useQuery({
    queryKey: ['squid-tokens', chainId, searchTerm],
    queryFn: async () => {
      if (!chainId) return [];

      // Since the API doesn't support server-side filtering, we'll fetch all tokens
      // but implement client-side filtering with optimizations
      const tokensResponse = await fetch('https://apiplus.squidrouter.com/v2/tokens', { headers });
      const tokensJson: { tokens: any[] } = await tokensResponse.json();

      // Filter by chain ID
      let filteredTokens = tokensJson.tokens.filter(
        (token: any) => token.chainId === chainId
      );

      // Apply search term if provided
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        filteredTokens = filteredTokens.filter(
          (token: any) =>
            token.symbol?.toLowerCase().includes(term) ||
            token.name?.toLowerCase().includes(term) ||
            token.address?.toLowerCase().includes(term)
        );
      }

      // Sort by relevance (tokens with balance first, then alphabetically)
      return filteredTokens.sort((a, b) => {
        // Prioritize tokens that match search term exactly in symbol
        if (searchTerm) {
          const aExactSymbol = a.symbol?.toLowerCase() === searchTerm.toLowerCase();
          const bExactSymbol = b.symbol?.toLowerCase() === searchTerm.toLowerCase();
          if (aExactSymbol && !bExactSymbol) return -1;
          if (!aExactSymbol && bExactSymbol) return 1;
        }

        // Sort alphabetically by symbol
        return (a.symbol || '').localeCompare(b.symbol || '');
      });
    },
    enabled: enabled && !!chainId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for debounced search
export const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

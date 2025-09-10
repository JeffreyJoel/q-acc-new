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
      const chainsResponse = await fetch('https://apiplus.squidrouter.com/v2/chains', { headers });
      const chainsJson: ISquidChainResponse = await chainsResponse.json();

      return { chains: chainsJson.chains};
    },
    staleTime: Infinity,
  });
};

export const useFetchTokensByChain = (
  chainId: string | null,
  searchTerm: string = '',
  enabled: boolean = true
): UseQueryResult<any[], Error> => {
  return useQuery({
    queryKey: ['squid-tokens', chainId, searchTerm],
    queryFn: async () => {
      if (!chainId) return [];

      const tokensResponse = await fetch('https://apiplus.squidrouter.com/v2/tokens', { headers });
      const tokensJson: { tokens: any[] } = await tokensResponse.json();

      let filteredTokens = tokensJson.tokens.filter(
        (token: any) => token.chainId === chainId
      );

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        filteredTokens = filteredTokens.filter(
          (token: any) =>
            token.symbol?.toLowerCase().includes(term) ||
            token.name?.toLowerCase().includes(term) ||
            token.address?.toLowerCase().includes(term)
        );
      }

      return filteredTokens.sort((a, b) => {
        if (searchTerm) {
          const aExactSymbol = a.symbol?.toLowerCase() === searchTerm.toLowerCase();
          const bExactSymbol = b.symbol?.toLowerCase() === searchTerm.toLowerCase();
          if (aExactSymbol && !bExactSymbol) return -1;
          if (!aExactSymbol && bExactSymbol) return 1;
        }

        return (a.symbol || '').localeCompare(b.symbol || '');
      });
    },
    enabled: enabled && !!chainId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

//TODO: Create a custom debounce hook
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

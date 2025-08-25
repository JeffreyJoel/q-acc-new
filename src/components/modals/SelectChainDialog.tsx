"use client"

import React, { useEffect, useState } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { Spinner } from '@/components/loaders/Spinner';
import { useFetchChainsFromSquid, useFetchTokensByChain, useDebounce } from '@/hooks/useFetchChainsFromSquid';
import { UseQueryResult } from '@tanstack/react-query';
import type { ISquidChain } from '@/hooks/useFetchChainsFromSquid';
import { VirtualList } from '@/components/ui/virtual-list';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Image from 'next/image';

export const POLYGON_POS_CHAIN_ID = '137';
export const POLYGON_POS_CHAIN_IMAGE =
  'https://raw.githubusercontent.com/0xsquid/assets/main/images/chains/polygon.svg';

const SelectChainDialog = ({
  isOpen,
  onClose,
  closeable = true,
  onSelection = (chainId: any, tokenAddress: string) => {},
}: any) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chainData, setChainData] = useState<any[]>([]);
  const [selectedChain, setSelectedChain] = useState<{
    id: string | null;
    imageUrl: string;
  }>({
    id: POLYGON_POS_CHAIN_ID,
    imageUrl: POLYGON_POS_CHAIN_IMAGE,
  });
  // Search terms for chains and tokens
  const [chainSearchTerm, setChainSearchTerm] = useState('');
  const [tokenSearchTerm, setTokenSearchTerm] = useState('');
  const [hideZeroBalance, setHideZeroBalance] = useState(false);

  // Debounce token search to avoid excessive API calls
  const debouncedTokenSearch = useDebounce(tokenSearchTerm, 300);

  const [showAllNetworks, setShowAllNetworks] = useState(false);
  const { address } = useAccount();
  const { switchChain } = useSwitchChain();

  // Fetch chains data
  const { data: chainsData } = useFetchChainsFromSquid() as UseQueryResult<{ chains: ISquidChain[] }, Error>;

  // Fetch tokens for selected chain with debounced search
  const {
    data: tokensData = [],
    isLoading: tokenLoading,
    error: tokenError
  } = useFetchTokensByChain(selectedChain.id, debouncedTokenSearch, !!selectedChain.id);

  useEffect(() => {
    if (!chainsData?.chains) return;
    try {
      // Filter only EVM-compatible chains
      const evmChains = chainsData.chains.filter((chain: any) => chain.type === 'evm');
      evmChains.sort((a: any, b: any) => {
        if (a.chainId === POLYGON_POS_CHAIN_ID) return -1;
        if (b.chainId === POLYGON_POS_CHAIN_ID) return 1;
        return 0;
      });
      setChainData(evmChains);

      // Set Polygon PoS as the default selected chain
      const polygonChain = evmChains.find(
        (chain: any) => chain.chainId === POLYGON_POS_CHAIN_ID,
      );
      if (polygonChain) {
        setSelectedChain({
          id: polygonChain.chainId,
          imageUrl: polygonChain.chainIconURI,
        });
      }

      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }, [chainsData?.chains]);

  // Process tokens with balances when tokensData is available
  const processedTokens = React.useMemo(() => {
    if (!tokensData.length || !address) return tokensData;

    // For now, we'll return tokens as-is. In production, you might want to
    // fetch balances for the filtered tokens to show which ones the user holds
    return tokensData.filter(token => {
      if (!hideZeroBalance) return true;
      // If hideZeroBalance is enabled, you could check token.balance > 0
      // For now, we'll just return all tokens since balance fetching is expensive
      return true;
    });
  }, [tokensData, address, hideZeroBalance]);

  const displayedNetworks = chainData.slice(0, 11);
  const remainingNetworksCount = Math.max(0, chainData.length - 11);

  // Tokens are already filtered by the hook, just use processedTokens
  const filteredTokens = processedTokens;

  const filteredChains = chainData.filter((chain: any) =>
    chain.networkName?.toLowerCase().includes(chainSearchTerm.toLowerCase()),
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (error) {
    return <div className='p-4 text-red-500'>Error: {error}</div>;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className=" bg-qacc-black max-h-[90vh] overflow-y-auto md:max-w-[650px] rounded-3xl border">
        <DialogHeader>
          <div className='flex gap-4 items-center justify-between pb-4'>
            <div className='flex gap-4 items-center'>
              <DialogTitle className='text-base font-semibold text-foreground leading-6'>
                Select token to swap
              </DialogTitle>
            </div>
           
          </div>
        </DialogHeader>

        {/* Dual Search Inputs */}
        <div className="flex gap-4 mb-4">
          <Input
            placeholder="Chain"
            value={chainSearchTerm}
            onChange={e => setChainSearchTerm(e.target.value)}
            className="border-qacc-gray-light/15 focus:border-peach-400 rounded-xl"
          />
          <Input
            className="border-qacc-gray-light/15 focus:border-peach-400 rounded-xl"
            placeholder="Token"
            value={tokenSearchTerm}
            onChange={e => setTokenSearchTerm(e.target.value)}
          />
        </div>

        {/* Chains & Tokens Side-by-Side */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Chains List */}
          <div className="w-full md:w-1/2 overflow-y-auto max-h-[400px]">
            <h3 className="text-sm font-semibold mb-2">Popular chains</h3>
            <div className="grid grid-cols-1 gap-2">
              {displayedNetworks
                .filter((chain: any) =>
                  chain.networkName.toLowerCase().includes(chainSearchTerm.toLowerCase())
                )
                .map((chain: any) => (
                  <div
                    key={chain.chainId}
                    className={`flex items-center gap-2 p-2 cursor-pointer rounded-xl ${chain.chainId === selectedChain.id ? 'bg-peach-400/10 border-peach-400' : 'hover:bg-muted'}`}
                    onClick={() => {
                      switchChain({ chainId: Number(chain.chainId) });
                      setSelectedChain({ id: chain.chainId, imageUrl: chain.chainIconURI });
                    }}
                  >
                    <img src={chain.chainIconURI} alt={chain.networkName} width={24} height={24} className="rounded-full" />
                    <span>{chain.networkName}</span>
                  </div>
                ))}
            </div>
            <h3 className="text-sm font-semibold mt-4 mb-2">Chains A-Z</h3>
            <div className="grid grid-cols-1 gap-2">
              {filteredChains.map((chain: any) => (
                <div
                  key={chain.chainId}
                  className={`flex items-center gap-2 p-2 cursor-pointer rounded-xl ${chain.chainId === selectedChain.id ? 'bg-peach-400/10 border-peach-400' : 'hover:bg-muted'}`}
                  onClick={() => {
                    switchChain({ chainId: Number(chain.chainId) });
                    setSelectedChain({ id: chain.chainId, imageUrl: chain.chainIconURI });
                  }}
                >
                  <img src={chain.chainIconURI} alt={chain.networkName} width={24} height={24} className="rounded-full" />
                  <span>{chain.networkName}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tokens List */}
          <div className="w-full md:w-1/2">
            <h3 className="text-sm font-semibold mb-2">
              Tokens {filteredTokens.length > 0 && `(${filteredTokens.length})`}
            </h3>
            {tokenLoading ? (
              <div className="flex items-center justify-center h-[200px]">
                <Spinner />
              </div>
            ) : tokenError ? (
              <div className="text-red-500 text-sm p-2">
                Error loading tokens. Please try again.
              </div>
            ) : filteredTokens.length === 0 ? (
              <div className="text-gray-500 text-sm p-2">
                {debouncedTokenSearch ? 'No tokens found matching your search.' : 'No tokens available for this chain.'}
              </div>
            ) : (
              <VirtualList
                items={filteredTokens}
                itemHeight={48} // Height of each token item
                containerHeight={400} // Height of the container
                className="border rounded-lg"
                renderItem={(token: any, index: number) => (
                  <div
                    key={token.address || index}
                    className="flex items-center gap-2 p-2 cursor-pointer hover:bg-peach-400/10 rounded-lg border-b border-gray-100 last:border-b-0"
                    onClick={() => {
                      onSelection(selectedChain, token);
                      onClose();
                    }}
                  >
                    <Image
                      src={token.logoURI || '/images/logos/round_logo.png'}
                      alt={token.symbol}
                      width={24}
                      height={24}
                      className="rounded-full flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/logos/round_logo.png';
                      }}
                    />
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-medium truncate">{token.symbol}</span>
                      <span className="text-xs text-gray-500 truncate">{token.name}</span>
                    </div>
                    {token.balance && (
                      <span className="text-xs text-gray-500">
                        {parseFloat(token.balance).toFixed(4)}
                      </span>
                    )}
                  </div>
                )}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SelectChainDialog;

//TODO: Update this to allow tokens in any chain to be selected and used in the swap

import React, { useEffect, useState } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { IconX } from '@tabler/icons-react';
import { IconArrowRight } from '@tabler/icons-react';
import { IconSearch } from '@tabler/icons-react';
import { fetchEVMTokenBalances } from '@/helpers/token';
import { Spinner } from '@/components/loaders/Spinner';
import { IconArrowLeft } from '@tabler/icons-react';
import config from '@/config/configuration';
import { SquidTokenType } from '@/helpers/squidTransactions';
import { useFetchChainsFromSquid } from '@/hooks/useFetchChainsFromSquid';
import { UseQueryResult } from '@tanstack/react-query';
import type { ISquidChain } from '@/hooks/useFetchChainsFromSquid';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export const POLYGON_POS_CHAIN_ID = '137';
export const POLYGON_POS_CHAIN_IMAGE =
  'https://raw.githubusercontent.com/0xsquid/assets/main/images/chains/polygon.svg';

const headers = {
  'x-integrator-id': config.SQUID_INTEGRATOR_ID,
};

const SelectChainDialog = ({
  isOpen,
  onClose,
  closeable = true,
  onSelection = (chainId: any, tokenAddress: string) => {},
}: any) => {
  const [loading, setLoading] = useState(true);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chainData, setChainData] = useState<any[]>([]);
  const [tokenData, setTokenData] = useState<any[]>([]);
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
  const [showAllNetworks, setShowAllNetworks] = useState(false);
  const { address } = useAccount();
  const { switchChain } = useSwitchChain();
  // Cast data to known shape: chains and tokens
  const { data: chainsData } = useFetchChainsFromSquid() as UseQueryResult<{ chains: ISquidChain[]; tokens: any[] }, Error>;

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

  useEffect(() => {
    if (!selectedChain || !address || !chainsData?.tokens) {
      console.log('No address, chain, or tokens found');
      return;
    }

    setTokenLoading(true);
    const fetchToken = async () => {
      try {
        setTokenLoading(true);

        // Filter tokens from global fetch
        const chainTokens = chainsData.tokens.filter(
          (token: any) => token.chainId === selectedChain.id
        );

        const tokenWithBalances = await fetchEVMTokenBalances(chainTokens,
          address,
        );

        const sortedTokens = tokenWithBalances.sort(
          (a, b) => b.balance - a.balance,
        );

        // Update state with the token data for selected chain
        setTokenData(sortedTokens);
      } catch (error) {
        console.error('Error processing tokens:', error);
      } finally {
        setTokenLoading(false);
      }
    };

    fetchToken();
  }, [selectedChain, address, chainsData?.tokens]);

  const displayedNetworks = chainData.slice(0, 11);
  const remainingNetworksCount = Math.max(0, chainData.length - 11);

  const filteredTokens =
    selectedChain && tokenData
      ? tokenData.filter(
          (token: SquidTokenType) =>
            token.symbol.toLowerCase().includes(tokenSearchTerm.toLowerCase()) &&
            (!hideZeroBalance || (token.balance ?? 0) > 0),
        )
      : [];

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
      <DialogContent className="bg-neutral-800 max-h-[90vh] overflow-y-auto md:max-w-[650px] font-redHatText border">
        <DialogHeader>
          <div className='flex gap-4 items-center justify-between pb-4'>
            <div className='flex gap-4 items-center'>
              <DialogTitle className='text-base font-semibold text-foreground leading-6'>
                Select token to swap
              </DialogTitle>
            </div>
            <button onClick={onClose}>
              <IconX size={14} />
            </button>
          </div>
        </DialogHeader>

        {/* Dual Search Inputs */}
        <div className="flex gap-4 mb-4">
          <Input
            placeholder="Chain"
            value={chainSearchTerm}
            onChange={e => setChainSearchTerm(e.target.value)}
          />
          <Input
            className="border-purple-500 focus:border-purple-500"
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
                    className={`flex items-center gap-2 p-2 cursor-pointer rounded-lg ${chain.chainId === selectedChain.id ? 'bg-peach-400/10 border-peach-400' : 'hover:bg-muted'}`}
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
                  className={`flex items-center gap-2 p-2 cursor-pointer rounded-lg ${chain.chainId === selectedChain.id ? 'bg-peach-400/10 border-peach-400' : 'hover:bg-muted'}`}
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
          <div className="w-full md:w-1/2 overflow-y-auto max-h-[400px]">
            <h3 className="text-sm font-semibold mb-2">Tokens</h3>
            {tokenLoading ? (
              <Spinner />
            ) : (
              filteredTokens
                .filter((token: SquidTokenType) =>
                  token.symbol.toLowerCase().includes(tokenSearchTerm.toLowerCase())
                )
                .map((token: any) => (
                  <div
                    key={token.address}
                    className="flex items-center gap-2 p-2 cursor-pointer hover:bg-peach-400/10 rounded-lg"
                    onClick={() => {
                      onSelection(selectedChain, token);
                      onClose();
                    }}
                  >
                    <img src={token.logoURI} alt={token.symbol} width={24} height={24} className="rounded-full" />
                    <span>{token.symbol}</span>
                  </div>
                ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SelectChainDialog;

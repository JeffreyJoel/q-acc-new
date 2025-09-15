import { createContext, useContext, useMemo } from "react";
import { useWallets } from "@privy-io/react-auth";
import { useAccount, useChainId } from "wagmi";
import type { Chain } from "viem";
import { polygon } from "viem/chains";
import config from "@/config/configuration";

interface ChainContextValue {
  chainId?: number;
  chain?: Chain;
  switchChain: (id: number) => Promise<void>;
  ready: boolean;
}

const ChainContext = createContext<ChainContextValue | null>(null);

export const useChainManager = (): ChainContextValue => {
  const ctx = useContext(ChainContext);
  if (!ctx) {
    throw new Error("useChainManager must be used inside ChainProvider");
  }
  return ctx;
};

export const ChainProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { wallets, ready } = useWallets();
  const activeWallet = wallets?.[0];
  const { isConnected } = useAccount();
  const wagmiChainId = useChainId();

  const allChains: Chain[] = config.SUPPORTED_CHAINS;

  const value = useMemo<ChainContextValue>(() => {
    // Priority: 1. Active wallet chain, 2. Wagmi chain (from cookies/state), 3. Default to Polygon
    let chainId: number;
    
    if (activeWallet && isConnected) {
      chainId = Number(activeWallet.chainId);
    } else if (wagmiChainId) {
      chainId = wagmiChainId;
    } else {
      chainId = polygon.id;
    }

    const chain = allChains.find((c) => c.id === chainId) || polygon;

    const switchChain = async (id: number) => {
      if (!activeWallet) throw new Error("No active wallet to switch chain");
      await activeWallet.switchChain(id);
    };

    return {
      chainId,
      chain,
      switchChain,
      ready,
    };
  }, [activeWallet, ready, allChains, isConnected, wagmiChainId]);

  return <ChainContext.Provider value={value}>{children}</ChainContext.Provider>;
};

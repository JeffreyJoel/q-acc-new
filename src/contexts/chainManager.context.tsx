import { createContext, useContext, useMemo } from "react";
import { useWallets } from "@privy-io/react-auth";
import type { Chain } from "viem";
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

  const allChains: Chain[] = config.SUPPORTED_CHAINS;

  const value = useMemo<ChainContextValue>(() => {
    const chainId = activeWallet ? Number(activeWallet.chainId) : undefined;
    const chain = allChains.find((c) => c.id === chainId);

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
  }, [activeWallet, ready, allChains]);

  return <ChainContext.Provider value={value}>{children}</ChainContext.Provider>;
};

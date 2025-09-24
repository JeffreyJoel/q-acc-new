"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { createPublicClient, createWalletClient, custom, http } from "viem";
import { polygonAmoy } from "viem/chains";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import {
  createKernelAccount,
  createKernelAccountClient,
  createZeroDevPaymasterClient,
  KernelAccountClient,
} from "@zerodev/sdk";
import { KERNEL_V3_1 } from "@zerodev/sdk/constants";
import { entryPoint07Address } from "viem/account-abstraction";

interface ZeroDevContextType {
  kernelClient: KernelAccountClient | null;
  smartAccountAddress: string | null;
  isInitializing: boolean;
  initializeSmartAccount: () => Promise<void>;
}

const ZeroDevContext = createContext<ZeroDevContextType | null>(null);

export const useZeroDev = (): ZeroDevContextType => {
  const ctx = useContext(ZeroDevContext);
  if (!ctx) {
    throw new Error("useZeroDev must be used within a ZeroDevProvider");
  }
  return ctx;
};

interface ZeroDevProviderProps {
  children: ReactNode;
}

export const ZeroDevProvider: React.FC<ZeroDevProviderProps> = ({
  children,
}) => {
  const { user } = usePrivy();
  const { wallets, ready } = useWallets();
  const [kernelClient, setKernelClient] = useState<KernelAccountClient | null>(
    null
  );
  const [smartAccountAddress, setSmartAccountAddress] = useState<string | null>(
    null
  );
  const [isInitializing, setIsInitializing] = useState(false);

  const ZERODEV_RPC = process.env.NEXT_PUBLIC_ZERODEV_RPC;
  const chain = polygonAmoy;

  const initializeSmartAccount = async () => {
    if (!ready || wallets.length === 0) {
      throw new Error("Wallets not ready");
    }
    setIsInitializing(true);
    try {
      const userAddress = user?.wallet?.address;
      const userWallet = wallets.find(
        (wallet) => wallet.address === userAddress
      );
      if (!userWallet) {
        throw new Error("User wallet not found");
      }

      const provider = await userWallet.getEthereumProvider();
      // Build a viem WalletClient from Privy's provider
      const walletClient = createWalletClient({
        account: userWallet.address as `0x${string}`,
        chain,
        transport: custom(provider),
      });

      // Initialize a viem public client on your app's desired network
      const publicClient = createPublicClient({
        chain: chain,
        transport: http(chain.rpcUrls.default.http[0]),
      });

      // Create a ZeroDev ECDSA validator (EP 0.7, Kernel v3.1)
      const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
        signer: walletClient,
        entryPoint: {
          address: entryPoint07Address,
          version: "0.7",
        },
        kernelVersion: KERNEL_V3_1,
      });

      // Create a Kernel account from the ECDSA validator
      const account = await createKernelAccount(publicClient, {
        plugins: { sudo: ecdsaValidator },
        entryPoint: {
          address: entryPoint07Address,
          version: "0.7",
        },
        kernelVersion: KERNEL_V3_1,
      });

      const zerodevPaymaster = createZeroDevPaymasterClient({
        chain,
        transport: http(ZERODEV_RPC),
      });

      const kernelClient = createKernelAccountClient({
        account,
        chain,
        bundlerTransport: http(ZERODEV_RPC),
        client: publicClient,
        paymaster: {
          getPaymasterData(userOperation) {
            return zerodevPaymaster.sponsorUserOperation({ userOperation });
          },
        },
      });

      setKernelClient(kernelClient);
      setSmartAccountAddress(account.address);
    } catch (err) {
      console.error("Failed to initialize smart account:", err);
      throw err;
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    if (ready && wallets.length > 0 && !kernelClient && !isInitializing) {
      initializeSmartAccount();
    }
  }, [ready, wallets, kernelClient, isInitializing]);

  const value: ZeroDevContextType = {
    kernelClient,
    smartAccountAddress,
    isInitializing,
    initializeSmartAccount,
  };

  return (
    <ZeroDevContext.Provider value={value}>{children}</ZeroDevContext.Provider>
  );
};

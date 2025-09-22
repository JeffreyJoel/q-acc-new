"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useWallets } from "@privy-io/react-auth";
import {
  createPublicClient,
  http,
} from "viem";
import type { WalletClient } from "viem";
// Correct ZeroDev imports as per latest documentation
import { providerToSmartAccountSigner } from "permissionless";
import { createZeroDevPaymasterClient, createKernelAccount, createKernelAccountClient } from "@zerodev/sdk";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { ENTRYPOINT_ADDRESS_V07 } from "permissionless";
import type { KernelAccountClient } from "@zerodev/sdk";
import config from "@/config/configuration";

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
  const { wallets, ready } = useWallets();
  const [kernelClient, setKernelClient] = useState<KernelAccountClient | null>(null);
  const [smartAccountAddress, setSmartAccountAddress] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const bundlerUrl = config.ZERODEV_BUNDLER_URL;
  const paymasterUrl = config.ZERODEV_PAYMASTER_URL;
  const chain = config.SUPPORTED_CHAINS[0]; // e.g. polygonAmoy or whatever chain config

  const initializeSmartAccount = async () => {
    if (!ready || wallets.length === 0) {
      throw new Error("Wallets not ready");
    }
    setIsInitializing(true);
    try {
      // Find the embedded wallet and get its EIP1193 provider
      const embeddedWallet = wallets.find((wallet) => wallet.walletClientType === 'privy');
      if (!embeddedWallet) {
        throw new Error("Privy embedded wallet not found");
      }

      const provider = await embeddedWallet.getEthereumProvider();

      // Use the EIP1193 provider from Privy to create a SmartAccountSigner
      const smartAccountSigner = await providerToSmartAccountSigner(provider);

      // Initialize a viem public client on your app's desired network
      const publicClient = createPublicClient({
        chain: chain,
        transport: http(chain.rpcUrls.default.http[0]),
      });

      // Create a ZeroDev ECDSA validator from the smartAccountSigner from above and your publicClient
      const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
        signer: smartAccountSigner,
        entryPoint: ENTRYPOINT_ADDRESS_V07,
      });

      // Create a Kernel account from the ECDSA validator
      const account = await createKernelAccount(publicClient, {
        plugins: {
          sudo: ecdsaValidator,
        },
        entryPoint: ENTRYPOINT_ADDRESS_V07,
      });

      // Create a Kernel client to send user operations from the smart account
      const kernelClient = createKernelAccountClient({
        account,
        chain: chain,
        entryPoint: ENTRYPOINT_ADDRESS_V07,
        bundlerTransport: http(bundlerUrl),
        middleware: {
          sponsorUserOperation: async ({ userOperation }) => {
            const zerodevPaymaster = createZeroDevPaymasterClient({
              chain: chain,
              entryPoint: ENTRYPOINT_ADDRESS_V07,
              transport: http(paymasterUrl),
            });
            return zerodevPaymaster.sponsorUserOperation({
              userOperation,
              entryPoint: ENTRYPOINT_ADDRESS_V07,
            });
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
    <ZeroDevContext.Provider value={value}>
      {children}
    </ZeroDevContext.Provider>
  );
};
"use client";

import { useState, useEffect } from "react";
import { useWallets } from "@privy-io/react-auth";
import { createPublicClient, http, type WalletClient } from "viem";
import { providerToSmartAccountSigner, ENTRYPOINT_ADDRESS_V07 } from "permissionless";
import { createZeroDevPaymasterClient, createKernelAccount, createKernelAccountClient } from "@zerodev/sdk";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import type { KernelAccountClient } from "@zerodev/sdk";
import config from "@/config/configuration";

interface UseZeroDevAccountReturn {
  kernelClient: KernelAccountClient | null;
  smartAccountAddress: string | null;
  isInitializing: boolean;
  error: string | null;
  initializeSmartAccount: () => Promise<void>;
  refreshBalance?: () => Promise<void>;
}

export const useZeroDevAccount = (): UseZeroDevAccountReturn => {
  const { wallets, ready } = useWallets();
  const [kernelClient, setKernelClient] = useState<KernelAccountClient | null>(null);
  const [smartAccountAddress, setSmartAccountAddress] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Configuration for ZeroDev
  const bundlerUrl = config.ZERODEV_BUNDLER_URL;
  const paymasterUrl = config.ZERODEV_PAYMASTER_URL;
  const chain = config.SUPPORTED_CHAINS[0]; // e.g. polygonAmoy or whatever chain config

  const initializeSmartAccount = async () => {
    if (!ready || !wallets.length) {
      setError("Wallets not ready");
      return;
    }

    setIsInitializing(true);
    setError(null);

    try {
      // Find the Privy embedded wallet
      const embeddedWallet = wallets.find((wallet) => wallet.walletClientType === 'privy');
      if (!embeddedWallet) {
        throw new Error("Privy embedded wallet not found");
      }

      // Get the EIP1193 provider from the embedded wallet
      const provider = await embeddedWallet.getEthereumProvider();

      // Create a SmartAccountSigner from the provider
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
      const errorMessage = err instanceof Error ? err.message : "Failed to initialize smart account";
      setError(errorMessage);
      console.error("Failed to initialize smart account:", err);
    } finally {
      setIsInitializing(false);
    }
  };

  // Auto-initialize when wallets are ready
  useEffect(() => {
    if (ready && wallets.length > 0 && !kernelClient && !isInitializing) {
      initializeSmartAccount();
    }
  }, [ready, wallets, kernelClient, isInitializing]);

  return {
    kernelClient,
    smartAccountAddress,
    isInitializing,
    error,
    initializeSmartAccount,
  };
};

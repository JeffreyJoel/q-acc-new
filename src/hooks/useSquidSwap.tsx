'use client';

import { useState, useCallback, useEffect } from 'react';

import { Squid } from '@0xsquid/sdk';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { toast } from 'sonner';
import { Address, parseUnits, formatUnits } from 'viem';

import config from '@/config/configuration';

interface SwapParams {
  fromChain: string;
  fromToken: Address;
  toToken: Address;
  amount: string;
  fromDecimals: number;
  toDecimals: number;
  slippageTolerance?: number;
}

interface SwapQuote {
  fromAmount: string;
  toAmount: string;
  toAmountMin: string;
  priceImpact: string;
  estimatedGas: string;
  route: any;
}

interface SwapStatus {
  isInitializing: boolean;
  isQuoting: boolean;
  isSwapping: boolean;
  isApproving: boolean;
  error: string | null;
  txHash: string | null;
  quote: SwapQuote | null;
}

export const useSquidSwap = () => {
  const [squid, setSquid] = useState<Squid | null>(null);
  const [status, setStatus] = useState<SwapStatus>({
    isInitializing: true,
    isQuoting: false,
    isSwapping: false,
    isApproving: false,
    error: null,
    txHash: null,
    quote: null,
  });

  const { user: privyUser, authenticated } = usePrivy();
  const { wallets } = useWallets();

  const userAddress = privyUser?.wallet?.address;

  // Initialize Squid SDK
  useEffect(() => {
    const initializeSquid = async () => {
      try {
        const squidInstance = new Squid({
          baseUrl: 'https://apiplus.squidrouter.com',
          integratorId: config.SQUID_INTEGRATOR_ID,
        });

        await squidInstance.init();
        setSquid(squidInstance);

        setStatus(prev => ({
          ...prev,
          isInitializing: false,
          error: null,
        }));
      } catch (error) {
        console.error('Failed to initialize Squid SDK:', error);
        setStatus(prev => ({
          ...prev,
          isInitializing: false,
          error: 'Failed to initialize swap service',
        }));
      }
    };

    initializeSquid();
  }, []);

  const getSigner = useCallback(async () => {
    if (!authenticated || !userAddress) {
      throw new Error('User not authenticated');
    }

    try {
      const wallet = wallets.find(w => w.address === userAddress);
      if (!wallet) {
        throw new Error('No active wallet found');
      }

      const provider = await wallet.getEthereumProvider();
      const ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();

      return signer;
    } catch (error) {
      console.error('Error getting signer:', error);
      throw new Error('Failed to connect to wallet');
    }
  }, [authenticated, userAddress, wallets]);

  // Get swap quote
  const getQuote = useCallback(
    async (params: SwapParams): Promise<SwapQuote | null> => {
      if (!squid || !userAddress) {
        setStatus(prev => ({
          ...prev,
          error: 'Squid SDK not initialized or user not connected',
        }));
        return null;
      }

      setStatus(prev => ({
        ...prev,
        isQuoting: true,
        error: null,
        quote: null,
      }));

      try {
        const fromAmountWei = parseUnits(params.amount, params.fromDecimals);

        const routeParams = {
          fromAddress: userAddress,
          fromChain: params.fromChain,
          fromToken: params.fromToken,
          fromAmount: fromAmountWei.toString(),
          toChain: '137',
          toToken: params.toToken,
          toAddress: userAddress,
          slippage: params.slippageTolerance || 0.5,
        };

        const { route } = await squid.getRoute(routeParams);

        if (!route) {
          throw new Error('No route found for this swap');
        }

        const quote: SwapQuote = {
          fromAmount: formatUnits(
            BigInt(route.estimate.fromAmount),
            params.fromDecimals
          ),
          toAmount: formatUnits(
            BigInt(route.estimate.toAmount),
            params.toDecimals
          ),
          toAmountMin: formatUnits(
            BigInt(route.estimate.toAmountMin || route.estimate.toAmount),
            params.toDecimals
          ),
          priceImpact: route.estimate.aggregatePriceImpact || '0',
          estimatedGas: route.estimate.gasCosts?.[0]?.amount || '0',
          route,
        };

        setStatus(prev => ({
          ...prev,
          isQuoting: false,
          quote,
        }));

        return quote;
      } catch (error) {
        let errorMessage = 'Failed to get quote';

        if (error instanceof Error) {
          if (error.message.includes('Token is not supported')) {
            errorMessage =
              'This token is not supported for swapping. Please try a different token.';
          } else if (error.message.includes('BAD_REQUEST')) {
            errorMessage = 'Token not available for swapping on this chain.';
          } else {
            errorMessage = error.message;
          }
        }

        console.error('Quote error:', error);
        setStatus(prev => ({
          ...prev,
          isQuoting: false,
          error: errorMessage,
        }));
        return null;
      }
    },
    [squid, userAddress]
  );

  // Approve token spending if needed
  const approveTokenIfNeeded = useCallback(
    async (tokenAddress: Address, spenderAddress: string, amount: string) => {
      if (!squid || !userAddress) {
        throw new Error('Squid SDK not initialized or user not connected');
      }

      // Skip approval for native tokens
      const lowercaseToken = tokenAddress.toLowerCase();
      if (
        lowercaseToken === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' ||
        lowercaseToken === '0x0000000000000000000000000000000000000000' ||
        lowercaseToken === '0x0000000000000000000000000000000000001010'
      ) {
        return;
      }

      setStatus(prev => ({ ...prev, isApproving: true }));

      try {
        const signer = await getSigner();

        // Check current allowance
        const erc20Abi = [
          'function allowance(address owner, address spender) view returns (uint256)',
          'function approve(address spender, uint256 amount) returns (bool)',
        ];

        console.log('Checking allowance for:', {
          tokenAddress,
          userAddress,
          spenderAddress,
          amount,
        });

        const tokenContract = new ethers.Contract(
          tokenAddress,
          erc20Abi,
          signer
        );

        let currentAllowance;
        try {
          currentAllowance = await tokenContract.allowance(
            userAddress,
            spenderAddress
          );
          console.log('Current allowance:', currentAllowance.toString());
        } catch (allowanceError) {
          console.error('Allowance check failed:', allowanceError);

          // If allowance check fails, try to approve anyway
          console.log('Attempting approval despite allowance check failure');
          currentAllowance = BigInt(0);
        }

        const requiredAmount = BigInt(amount);

        if (currentAllowance >= requiredAmount) {
          console.log('Sufficient allowance already granted');
          setStatus(prev => ({ ...prev, isApproving: false }));
          return;
        }

        console.log('Approving token spending:', {
          requiredAmount: requiredAmount.toString(),
        });

        // Approve spending
        const approveTx = await tokenContract.approve(
          spenderAddress,
          requiredAmount
        );
        console.log('Approval transaction sent:', approveTx.hash);

        await approveTx.wait();
        console.log('Approval transaction confirmed');

        setStatus(prev => ({ ...prev, isApproving: false }));
        toast.success('Token spending approved');
      } catch (error) {
        console.error('Approval error:', error);
        setStatus(prev => ({ ...prev, isApproving: false }));
        const errorMessage =
          error instanceof Error ? error.message : 'Approval failed';
        toast.error(`Approval failed: ${errorMessage}`);
        throw error;
      }
    },
    [squid, userAddress, getSigner]
  );

  const executeSwap = useCallback(
    async (params: SwapParams): Promise<string | null> => {
      if (!squid || !userAddress) {
        setStatus(prev => ({
          ...prev,
          error: 'Squid SDK not initialized or user not connected',
        }));
        return null;
      }

      setStatus(prev => ({
        ...prev,
        isSwapping: true,
        error: null,
        txHash: null,
      }));

      try {
        const quote = await getQuote(params);
        if (!quote) {
          throw new Error('Failed to get swap quote');
        }

        const route = quote.route;

        if (!route.transactionRequest) {
          throw new Error('No transaction request in route');
        }

        let targetAddress: string;
        if ('target' in route.transactionRequest) {
          targetAddress = route.transactionRequest.target;
        } else {
          throw new Error(
            'Cannot determine target address from transaction request'
          );
        }

        const fromTokenLower = params.fromToken.toLowerCase();
        const isNativeToken =
          fromTokenLower === config.NATIVE_TOKEN_ADDRESS.toLowerCase() ||
          fromTokenLower === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' ||
          fromTokenLower === '0x0000000000000000000000000000000000000000';

        if (!isNativeToken) {
          console.log('Approving ERC20 token:', params.fromToken);
          const fromAmountWei = parseUnits(params.amount, params.fromDecimals);
          await approveTokenIfNeeded(
            params.fromToken,
            targetAddress,
            fromAmountWei.toString()
          );
        } else {
          console.log('Skipping approval for native token:', params.fromToken);
        }

        // Execute the swap
        const signer = await getSigner();
        const txResponse = await squid.executeRoute({
          signer: signer as any,
          route,
        });

        let txHash: string;
        if (
          txResponse &&
          typeof txResponse === 'object' &&
          'hash' in txResponse
        ) {
          txHash = txResponse.hash as string;

          if ('wait' in txResponse && typeof txResponse.wait === 'function') {
            await (txResponse as any).wait();
          }
        } else {
          throw new Error('Invalid transaction response');
        }

        setStatus(prev => ({
          ...prev,
          isSwapping: false,
          txHash,
        }));

        toast.success('Swap completed successfully!');
        return txHash;
      } catch (error) {
        let errorMessage = 'Swap failed';

        if (error instanceof Error) {
          // Handle specific error types
          if (error.message.includes('could not decode result data')) {
            errorMessage =
              'Token contract interaction failed. Please check if the token exists on this chain.';
          } else if (error.message.includes('allowance')) {
            errorMessage = 'Token approval failed. Please try again.';
          } else if (error.message.includes('insufficient funds')) {
            errorMessage = 'Insufficient funds for this transaction.';
          } else if (error.message.includes('user rejected')) {
            errorMessage = 'Transaction was cancelled by user.';
          } else {
            errorMessage = error.message;
          }
        }

        console.error('Swap error:', error);
        setStatus(prev => ({
          ...prev,
          isSwapping: false,
          error: errorMessage,
        }));
        toast.error(`Swap failed: ${errorMessage}`);
        return null;
      }
    },
    [squid, userAddress, getQuote, approveTokenIfNeeded, getSigner]
  );

  const resetStatus = useCallback(() => {
    setStatus(prev => ({
      ...prev,
      error: null,
      txHash: null,
      quote: null,
      isQuoting: false,
      isSwapping: false,
      isApproving: false,
    }));
  }, []);

  return {
    isInitialized: !status.isInitializing && !!squid,
    isInitializing: status.isInitializing,
    isQuoting: status.isQuoting,
    isSwapping: status.isSwapping,
    isApproving: status.isApproving,
    isLoading:
      status.isInitializing ||
      status.isQuoting ||
      status.isSwapping ||
      status.isApproving,
    error: status.error,
    txHash: status.txHash,
    quote: status.quote,

    // Actions
    getQuote,
    executeSwap,
    resetStatus,
  };
};

export default useSquidSwap;

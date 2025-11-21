import { useQuery, useMutation } from '@tanstack/react-query';
import { Address } from 'viem';

import { SquidTokenType } from '@/helpers/squidTransactions';
import {
  fetchBalanceWithDecimals,
  fetchTokenDetails,
  handleErc20Transfer,
  fetchTokenPrice,
  checkUserOwnsNFT,
  isContractAddress,
  fetchEVMTokenBalances,
  truncateToDecimalPlaces,
  formatBalance,
  convertDonationAmount,
  convertToPOLAmount,
  fetchSquidPOLUSDPrice,
  truncateToSignificantDigits,
  AddressZero,
} from '@/helpers/token';
import { getTokenSupplyDetails } from '@/services/tokenPrice.service';

/**
 * Hook to fetch balance and decimals for a token
 */
export const useTokenBalanceWithDecimals = (
  tokenAddress?: Address,
  userAddress?: Address,
  chainId?: number
) => {
  return useQuery({
    queryKey: ['tokenBalance', tokenAddress, userAddress],
    queryFn: () => {
      if (!tokenAddress || !userAddress) return null;
      return fetchBalanceWithDecimals(tokenAddress, userAddress, chainId);
    },
    enabled: !!tokenAddress && !!userAddress,
  });
};

/**
 * Hook to fetch token details (balance, symbol, decimals)
 */
export const useTokenDetails = (
  tokenAddress?: Address,
  userAddress?: Address,
  client?: any
) => {
  return useQuery({
    queryKey: ['tokenDetails', tokenAddress, userAddress],
    queryFn: () => {
      if (!tokenAddress || !userAddress || !client) return null;
      return fetchTokenDetails({
        tokenAddress,
        address: userAddress,
        client,
      });
    },
    enabled: !!tokenAddress && !!userAddress && !!client,
  });
};

/**
 * Hook to perform ERC20 transfers
 */
export const useErc20Transfer = () => {
  return useMutation({
    mutationFn: ({
      inputAmount,
      tokenAddress,
      projectAddress,
    }: {
      inputAmount: string;
      tokenAddress: Address;
      projectAddress: Address;
    }) => {
      return handleErc20Transfer({
        inputAmount,
        tokenAddress,
        projectAddress,
      });
    },
  });
};

/**
 * Hook to fetch token price from CoinGecko
 */
export const useTokenPrice = (coingeckoId = 'polygon-ecosystem-token') => {
  return useQuery({
    queryKey: ['tokenPrice', coingeckoId],
    queryFn: () => fetchTokenPrice(coingeckoId),
    refetchInterval: 120_000, // 2 minutes
    staleTime: 60_000, // 1 minute
  });
};

/**
 * Hook to check if a user owns an NFT
 */
export const useNFTOwnership = (
  nftContractAddress?: string,
  userAddress?: string
) => {
  return useQuery({
    queryKey: ['nftOwnership', nftContractAddress, userAddress],
    queryFn: () => {
      if (!nftContractAddress || !userAddress) return false;
      return checkUserOwnsNFT(nftContractAddress, userAddress);
    },
    enabled: !!nftContractAddress && !!userAddress,
  });
};

/**
 * Hook to check if an address is a contract
 */
export const useIsContractAddress = (address?: string) => {
  return useQuery({
    queryKey: ['isContract', address],
    queryFn: () => {
      if (!address) return false;
      return isContractAddress(address);
    },
    enabled: !!address,
  });
};

/**
 * Hook to fetch EVM token balances for multiple tokens
 */
export const useEVMTokenBalances = <T extends { [key: string]: any }>(
  tokens?: T[],
  walletAddress?: string | null
) => {
  return useQuery({
    queryKey: ['evmTokenBalances', tokens, walletAddress],
    queryFn: () => {
      if (!tokens || tokens.length === 0 || !walletAddress) return [];
      return fetchEVMTokenBalances(tokens, walletAddress);
    },
    enabled: !!tokens && tokens.length > 0 && !!walletAddress,
  });
};

/**
 * Hook to fetch POL token price from Squid
 */
export const useFetchPOLPriceSquid = () => {
  return useQuery({
    queryKey: ['polTokenPrice'],
    queryFn: () => fetchSquidPOLUSDPrice(),
    refetchInterval: 60_000, // 1 minute
    refetchOnWindowFocus: false,
    staleTime: 5 * 60_000, // 5 minutes
  });
};

/**
 * Hook to convert donation amount to POL
 */
export const useConvertDonationAmount = () => {
  return useMutation({
    mutationFn: ({
      token,
      polAmount,
    }: {
      token: SquidTokenType;
      polAmount?: number;
    }) => {
      return convertDonationAmount(token, polAmount);
    },
  });
};

/**
 * Hook to convert token amount to POL amount
 */
export const useConvertToPOLAmount = () => {
  return useMutation({
    mutationFn: ({
      token,
      amountInToken,
    }: {
      token: SquidTokenType;
      amountInToken: number;
    }) => {
      return convertToPOLAmount(token, amountInToken);
    },
  });
};

/**
 * Utility hooks that don't need to make API calls
 */
export const useTokenUtils = () => {
  return {
    truncateToDecimalPlaces: (strNum: string, decimals: number) =>
      truncateToDecimalPlaces(strNum, decimals),
    formatBalance: (balance?: number) => formatBalance(balance),
    truncateToSignificantDigits: (num: number, digits: number) =>
      truncateToSignificantDigits(num, digits),
    AddressZero,
  };
};

export const useTokenSupplyDetails = (contract_address: string) => {
  return useQuery({
    queryKey: ['token-supply-details', contract_address],
    queryFn: async () => {
      return await getTokenSupplyDetails(contract_address);
    },
  });
};

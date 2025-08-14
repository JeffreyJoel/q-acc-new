"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowDown, Loader2 } from "lucide-react";
import { usePublicClient } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import { Address, erc20Abi } from "viem";
import {
  useTokenBalanceWithDecimals,
  useFetchPOLPriceSquid,
} from "@/hooks/useTokens";
import { formatBalance } from "@/helpers/token";
import { useGetCurrentTokenPrice } from "@/hooks/useGetCurrentTokenPrice";
import config from "@/config/configuration";
import { POLYGON_POS_CHAIN_IMAGE } from "@/components/project/project-details/ProjectDonationTable";
import useSquidSwap from "@/hooks/useSquidSwap";
import ConnectWalletButton from "@/components/shared/wallet/SwapConnectWalletButton";
import { toast } from "sonner";

interface QuickSwapTabProps {
  receiveTokenAddress: string;
  receiveTokenSymbol: string;
  receiveTokenIcon: string;
}

export default function QuickSwapTab({
  receiveTokenAddress,
  receiveTokenSymbol,
  receiveTokenIcon,
}: QuickSwapTabProps) {
  const [slippageTolerance, setSlippageTolerance] = useState<string>("0.5%");
  const [swapAmount, setSwapAmount] = useState<string>("");
  const [isQuoteValid, setIsQuoteValid] = useState<boolean>(false);
  const [receiveTokenDecimals, setReceiveTokenDecimals] = useState<number>(18);

  const { user: privyUser, authenticated } = usePrivy();
  const userAddress = privyUser?.wallet?.address;
  const publicClient = usePublicClient();

  const { data: wpolBalance, isLoading: isWpolLoading } =
    useTokenBalanceWithDecimals(
      config.NATIVE_TOKEN_ADDRESS as Address,
      userAddress as Address,
    );

  const {
    data: receiveTokenBalance,
    isLoading: isReceiveTokenLoading,
  } = useTokenBalanceWithDecimals(
    receiveTokenAddress as Address,
    userAddress as Address,
  );

  const { data: polUsdPrice } = useFetchPOLPriceSquid();

  const { currentTokenPrice: receiveTokenPriceInPOL } =
    useGetCurrentTokenPrice(receiveTokenAddress);

  // Get token decimals for receive token
  useEffect(() => {
    const getTokenDecimals = async () => {
      if (!publicClient || !receiveTokenAddress) return;
      
      try {
        const decimals = await publicClient.readContract({
          address: receiveTokenAddress as Address,
          abi: erc20Abi,
          functionName: 'decimals',
        });
        setReceiveTokenDecimals(decimals);
      } catch (error) {
        console.error('Error fetching token decimals:', error);
        setReceiveTokenDecimals(18); // Default to 18
      }
    };

    getTokenDecimals();
  }, [publicClient, receiveTokenAddress]);

  // Squid swap hook
  const {
    isInitialized,
    isLoading: isSwapLoading,
    isQuoting,
    isSwapping,
    isApproving,
    error: swapError,
    quote,
    getQuote,
    executeSwap,
    resetStatus,
  } = useSquidSwap();

  // Effect to get quote when amount changes
  useEffect(() => {
    const debounceTimeout = setTimeout(async () => {
      if (swapAmount && parseFloat(swapAmount) > 0 && isInitialized && receiveTokenAddress) {
        try {
          await getQuote({
            fromToken: config.WPOL_TOKEN_ADDRESS as Address,
            toToken: receiveTokenAddress as Address,
            amount: swapAmount,
            fromDecimals: 18, // POL has 18 decimals
            toDecimals: receiveTokenDecimals,
            slippageTolerance: parseFloat(slippageTolerance.replace('%', '')),
          });
          setIsQuoteValid(true);
        } catch (error) {
          console.error("Quote error:", error);
          setIsQuoteValid(false);
        }
      } else {
        setIsQuoteValid(false);
      }
    }, 500);

    return () => clearTimeout(debounceTimeout);
  }, [swapAmount, slippageTolerance, isInitialized, receiveTokenDecimals, getQuote, receiveTokenAddress]);

  // Reset swap state when error changes
  useEffect(() => {
    if (swapError) {
      // Only show toast for non-token-support errors to avoid spam
      if (!swapError.includes("not supported")) {
        toast.error(swapError);
      }
    }
  }, [swapError]);

  const calculateUsdValue = (
    balance?: string,
    tokenPriceInPOL?: number,
  ) => {
    if (!balance || !polUsdPrice) return 0;
    const balanceNum = parseFloat(balance);
    if (isNaN(balanceNum)) return 0;

    const priceInPOL = tokenPriceInPOL ?? 1;
    return balanceNum * priceInPOL * polUsdPrice;
  };

  const handleSwap = async () => {
    if (!swapAmount || !isQuoteValid) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      const txHash = await executeSwap({
        fromToken: config.WPOL_TOKEN_ADDRESS as Address,
        toToken: receiveTokenAddress as Address,
        amount: swapAmount,
        fromDecimals: 18,
        toDecimals: receiveTokenDecimals,
        slippageTolerance: parseFloat(slippageTolerance.replace('%', '')),
      });

      if (txHash) {
        setSwapAmount("");
        setIsQuoteValid(false);
        // Optionally show transaction link
        toast.success("Swap successful!", {
          action: {
            label: "View on Explorer",
            onClick: () => window.open(`${config.SCAN_URL}tx/${txHash}`, '_blank')
          }
        });
      }
    } catch (error) {
      console.error("Swap execution error:", error);
    }
  };

  const handleAmountChange = (value: string) => {
    // Allow only numbers and decimal point
    const sanitizedValue = value.replace(/[^0-9.]/g, '');
    // Prevent multiple decimal points
    const parts = sanitizedValue.split('.');
    if (parts.length > 2) {
      return;
    }
    setSwapAmount(sanitizedValue);
  };

  const getSwapButtonText = () => {
    if (!authenticated) return "CONNECT WALLET";
    if (!isInitialized) return "INITIALIZING...";
    if (isQuoting) return "GETTING QUOTE...";
    if (isApproving) return "APPROVING...";
    if (isSwapping) return "SWAPPING...";
    if (!swapAmount || parseFloat(swapAmount) <= 0) return "ENTER AMOUNT";
    if (swapError && swapError.includes("not supported")) return "TOKEN NOT SUPPORTED";
    if (!isQuoteValid) return "INVALID AMOUNT";
    return "SWAP";
  };

  const isSwapDisabled = !authenticated || !isInitialized || isSwapLoading || 
                       !swapAmount || parseFloat(swapAmount) <= 0 || !isQuoteValid ||
                       Boolean(swapError && swapError.includes("not supported"));

  const PayReceiveRow = ({
    label,
    tokenSymbol,
    iconSrc,
    isLoading,
    balance,
    usdValue,
    amount,
    onAmountChange,
    isInput = false,
    estimatedAmount,
  }: {
    label: string;
    tokenSymbol: string;
    iconSrc: string;
    isLoading?: boolean;
    balance?: string;
    usdValue?: number;
    amount?: string;
    onAmountChange?: (value: string) => void;
    isInput?: boolean;
    estimatedAmount?: string;
  }) => (
    <div className="flex items-center justify-between bg-black px-4 py-6 h-full rounded-[18px] border border-white/10 text-white">
      <div>
        <span className="text-qacc-gray-light font-bold uppercase text-xs">
          {label}
        </span>
        <div className="flex items-center gap-3">
          <Image
            src={iconSrc}
            alt={tokenSymbol}
            width={24}
            height={24}
            className="rounded-full"
          />
          <span className="font-medium text-xl">{tokenSymbol}</span>
        </div>

        <div className="text-xs text-white/40 text-left mt-6">
          {quote && `${isInput ? "Swap" : "Receive"} Rate: ${isInput ? 
            `1 POL = ${(parseFloat(quote.toAmount) / parseFloat(quote.fromAmount)).toFixed(6)} ${receiveTokenSymbol}` : 
            `1 ${receiveTokenSymbol} = ${(parseFloat(quote.fromAmount) / parseFloat(quote.toAmount)).toFixed(6)} POL`}`}
        </div>
      </div>
      <div className="text-right">
        {isInput ? (
          <>
            <div className="text-xs text-white/40 mt-1">
              Balance: {balance || "0.00"}
            </div>
            <input
              type="number"
              placeholder="0.0"
              value={amount || ""}
              onChange={(e) => onAmountChange?.(e.target.value)}
              className="bg-transparent text-xl font-bold text-right focus:outline-none w-32 text-white"
            />
          </>
        ) : (
          <>
            <div className="text-xs text-white/40 mt-1">
              Balance: {balance || "0.00"}
            </div>
            <div className="text-xl font-bold">
              {isQuoting ? (
                <div className="flex items-center gap-2 justify-end">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">...</span>
                </div>
              ) : (
                estimatedAmount || "0"
              )}
            </div>
          </>
        )}

        <div className="text-xs text-white/40 mt-6">
          ~${(usdValue || 0).toFixed(2)}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="space-y-1">
        <PayReceiveRow
          label="PAY"
          tokenSymbol="POL"
          iconSrc={POLYGON_POS_CHAIN_IMAGE}
          isLoading={isWpolLoading}
          balance={
            wpolBalance
              ? formatBalance(parseFloat(wpolBalance.formattedBalance))
              : undefined
          }
          usdValue={
            wpolBalance
              ? calculateUsdValue(wpolBalance.formattedBalance, 1)
              : 0
          }
          amount={swapAmount}
          onAmountChange={handleAmountChange}
          isInput={true}
        />
        <div className="absolute top-[265px] left-1/2 -translate-x-1/2 -translate-y-1/2 -my-6 bg-neutral-800 border-neutral-900 backdrop-blur-[40px] w-8 h-8 rounded-lg flex items-center justify-center">
          <ArrowDown className="w-4 h-4 text-qacc-gray-light" />
        </div>
        <PayReceiveRow
          label="RECEIVE"
          tokenSymbol={receiveTokenSymbol}
          iconSrc={receiveTokenIcon}
          isLoading={isReceiveTokenLoading}
          balance={
            receiveTokenBalance
              ? formatBalance(
                  parseFloat(receiveTokenBalance.formattedBalance),
                )
              : undefined
          }
          usdValue={
            receiveTokenBalance
              ? calculateUsdValue(
                  receiveTokenBalance.formattedBalance,
                  receiveTokenPriceInPOL ?? undefined,
                )
              : 0
          }
          estimatedAmount={quote?.toAmount ? formatBalance(parseFloat(quote.toAmount)) : "0.0"}
        />
      </div>

      {/* Swap Details */}
      {quote && isQuoteValid && (
        <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
          <div className="text-xs text-white/60 space-y-1">
            <div className="flex justify-between">
              <span>Expected Output:</span>
              <span className="text-white">{formatBalance(parseFloat(quote.toAmount))} {receiveTokenSymbol}</span>
            </div>
            <div className="flex justify-between">
              <span>Minimum Output:</span>
              <span className="text-white">{formatBalance(parseFloat(quote.toAmountMin))} {receiveTokenSymbol}</span>
            </div>
            <div className="flex justify-between">
              <span>Price Impact:</span>
              <span className="text-white">{parseFloat(quote.priceImpact).toFixed(3)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Slippage Tolerance:</span>
              <span className="text-white">{slippageTolerance}</span>
            </div>
          </div>
        </div>
      )}

      {/* Swap Button */}
      {!authenticated ? (
        <ConnectWalletButton />
      ) : (
        <button
          onClick={handleSwap}
          disabled={isSwapDisabled}
          className={`mt-4 bg-peach-400 text-black font-semibold py-4 rounded-[18px] w-full transition-all flex items-center justify-center gap-2  disabled:opacity-50`}
        >
          {(isSwapping || isApproving) && (
            <Loader2 className="w-4 h-4 animate-spin" />
          )}
          {getSwapButtonText()}
        </button>
      )}

      {/* Error Display */}
      {swapError && (
        <div className="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400 text-sm font-medium mb-1">Swap Error</p>
          <p className="text-red-300 text-xs">{swapError}</p>
          {swapError.includes("not supported") && (
            <p className="text-yellow-300 text-xs mt-2">
              💡 Try using the "SWAP DIRECTLY" tab instead for bonding curve swaps.
            </p>
          )}
        </div>
      )}

      <div className="w-full text-xs text-white/40 text-center mt-2 flex items-center justify-center gap-1">
        Powered by
        <Image
          src="/images/logos/quickswap-logo-full.svg"
          alt="Squid Router"
          width={100}
          height={16}
          className="ml-1.5"
        />
      </div>
    </>
  );
}

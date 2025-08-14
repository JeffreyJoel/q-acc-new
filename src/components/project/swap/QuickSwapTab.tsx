"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowDown } from "lucide-react";
import { useAccount } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import { Address } from "viem";
import {
  useTokenBalanceWithDecimals,
  useFetchPOLPriceSquid,
} from "@/hooks/useTokens";
import { formatBalance } from "@/helpers/token";
import { useGetCurrentTokenPrice } from "@/hooks/useGetCurrentTokenPrice";
import config from "@/config/configuration";
import { POLYGON_POS_CHAIN_IMAGE } from "@/components/project/project-details/ProjectDonationTable";

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

  const { address: wagmiAddress } = useAccount();
  const { user: privyUser } = usePrivy();
  const userAddress = privyUser?.wallet?.address || wagmiAddress;

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

  const PayReceiveRow = ({
    label,
    tokenSymbol,
    iconSrc,
    isLoading,
    balance,
    usdValue,
  }: {
    label: string;
    tokenSymbol: string;
    iconSrc: string;
    isLoading?: boolean;
    balance?: string;
    usdValue?: number;
  }) => (
    <div className="flex items-center justify-between bg-black px-4 py-5 h-full rounded-[18px] border border-white/10 text-white">
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
   
      </div>
      <div className="text-right">
        <span className="text-white/40 text-xs">Balance</span>
        <div className="text-xl font-bold">
          {isLoading ? "..." : balance || "0.00"}
        </div>
        <div className="text-xs text-white/40 mt-6">
          {isLoading ? "~$..." : `~$${(usdValue || 0).toFixed(2)}`}
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
        />
        <div className=" absolute top-[265px] left-1/2 -translate-x-1/2 -translate-y-1/2 -my-6 bg-neutral-800 border-neutral-900 backdrop-blur-[40px] w-8 h-8 rounded-lg flex items-center justify-center">
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
        />
      </div>
      <button className="mt-2 bg-peach-400 text-black font-semibold py-4 rounded-[18px] w-full">
        CONNECT WALLET
      </button>
      <div className=" w-full text-xs text-white/40 text-center mt-2 flex items-center justify-center gap-1">
        Powered by
        <Image
          src="/images/logos/quickswap-logo-full.svg"
          alt="QuickSwap"
          width={100}
          height={16}
          className="ml-1.5"
        />
      </div>
    </>
  );
}

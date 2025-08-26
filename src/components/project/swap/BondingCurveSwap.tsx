//TODO: Refactor this component and separate components and logic into separate files

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowDownUp, ArrowUpRight, ChevronDown } from "lucide-react";
import { usePublicClient, useWalletClient } from "wagmi";
import { Address, erc20Abi } from "viem";
import config from "@/config/configuration";
import {
  useTokenBalanceWithDecimals,
  useFetchPOLPriceSquid,
} from "@/hooks/useTokens";
import { formatBalance } from "@/helpers/token";
import {
  executeBuyFlow,
  executeSellFlow,
} from "@/services/bondingCurveProxy.service";
import { POLYGON_POS_CHAIN_IMAGE } from "@/components/project/project-details/ProjectDonationTable";
import {
  useBondingCurve,
  useCalculatePurchaseReturn,
  useCalculateSaleReturn,
} from "@/hooks/useBondingCurve";
import { useGetCurrentTokenPrice } from "@/hooks/useGetCurrentTokenPrice";
import { useRoleCheck } from "@/hooks/useRoleCheck";
import { usePrivy } from "@privy-io/react-auth";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ConnectWalletButton from "@/components/shared/wallet/SwapConnectWalletButton";

interface BondingCurveSwapProps {
  contractAddress: string;
  receiveTokenAddress: string;
  receiveTokenSymbol: string;
  receiveTokenIcon: string;
}

type TradeSide = "buy" | "sell";

type FormData = {
  payAmount: string;
};

type PayReceiveRowProps = {
  label: string;
  tokenSymbol: string;
  iconSrc: string;
  balance?: string;
  usdValue?: number;
  isPay?: boolean;
  control?: any;
  name?: string;
  formattedReceiveAmount?: string;
  bondingCurveData?: any;
  selectableTokens?: { symbol: string; icon: string }[];
  selectedToken?: string;
  onTokenSelect?: (symbol: string) => void;
  hasError?: boolean;
  isDisabled?: boolean;
};

const PayReceiveRow = ({
  label,
  tokenSymbol,
  iconSrc,
  balance,
  usdValue,
  isPay = false,
  control,
  name,
  formattedReceiveAmount,
  bondingCurveData,
  selectableTokens,
  selectedToken,
  onTokenSelect,
  hasError,
  isDisabled,
}: PayReceiveRowProps) => {
  const currentSymbol = selectableTokens ? selectedToken! : tokenSymbol;
  const currentIcon = selectableTokens
    ? selectableTokens.find((t) => t.symbol === selectedToken)?.icon || iconSrc
    : iconSrc;

  return (
    <div className="flex items-center justify-between bg-black px-4 py-6 h-full rounded-[18px] border border-white/10 text-white">
      <div>
        <span className="text-qacc-gray-light font-bold uppercase text-xs">
          {label}
        </span>
        {selectableTokens ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3">
                <Image
                  src={currentIcon}
                  alt={currentSymbol}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                <span className="font-medium text-xl">{currentSymbol}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {selectableTokens.map((token) => (
                <DropdownMenuItem
                  key={token.symbol}
                  onSelect={() => onTokenSelect?.(token.symbol)}
                >
                  <Image
                    src={token.icon}
                    alt={token.symbol}
                    width={20}
                    height={20}
                    className="rounded-full mr-2"
                  />
                  {token.symbol}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-3">
            <Image
              src={currentIcon}
              alt={currentSymbol}
              width={24}
              height={24}
              className="rounded-full"
            />
            <span className="font-medium text-xl">{currentSymbol}</span>
          </div>
        )}

        <div className="text-xs text-white/40 text-left mt-6">
          {bondingCurveData &&
            `${isPay ? "Buy" : "Sell"} Price: ${bondingCurveData.BuyPrice} POL`}
        </div>
      </div>
      <div className="text-right">
        {isPay ? (
          <>
            <div className="text-xs text-white/40 mt-1">
              Balance: {balance || "0.00"}
            </div>
            {control ? (
              <Controller
                control={control}
                name={name || "payAmount"}
                render={({ field }) => (
                  <input
                    type="number"
                    placeholder="0.0"
                    {...field}
                    disabled={isDisabled}
                    className={`bg-transparent text-xl font-bold text-right focus:outline-none w-32 ${
                      hasError ? "text-red-500" : "text-white"
                    }`}
                  />
                )}
              />
            ) : (
              <input
                type="number"
                placeholder="0.0"
                disabled={true}
                className={`bg-transparent text-xl font-bold text-right focus:outline-none w-32 ${
                  hasError ? "text-red-500" : "text-white"
                }`}
              />
            )}
          </>
        ) : (
          <>
            <div className="text-xs text-white/40 mt-1">
              Balance: {balance || "0.00"}
            </div>
            <div className="text-xl font-bold">
              {Number(formattedReceiveAmount).toFixed(6) || "0"}
            </div>
          </>
        )}

        <div className="text-xs text-white/40 mt-6">
          ~${(usdValue || 0).toFixed(2)}
        </div>
      </div>
    </div>
  );
};

export default function BondingCurveSwap({
  contractAddress,
  receiveTokenAddress,
  receiveTokenSymbol,
  receiveTokenIcon,
}: BondingCurveSwapProps) {
  const [side, setSide] = useState<TradeSide>("buy");

  const { user: privyUser } = usePrivy();
  const userAddress = privyUser?.wallet?.address as Address | undefined;

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const { data: polUsdPrice } = useFetchPOLPriceSquid();
  const { currentTokenPrice: receiveTokenPriceInPOL } =
    useGetCurrentTokenPrice(receiveTokenAddress);

  const { data: wpolBalance } = useTokenBalanceWithDecimals(
    config.NATIVE_TOKEN_ADDRESS as Address,
    userAddress as Address
  );
  const { data: receiveTokenBalance } = useTokenBalanceWithDecimals(
    receiveTokenAddress as Address,
    userAddress as Address
  );

  const { bondingCurveData } = useBondingCurve(contractAddress);

  const { data: roleCheckData } = useRoleCheck(
    contractAddress,
    config.PROXY_CONTRACT_ADDRESS
  );

  const calculateUsdValue = (balance?: string, tokenPriceInPOL?: number) => {
    if (!balance || !polUsdPrice) return 0;
    const bal = parseFloat(balance);
    if (isNaN(bal)) return 0;
    const priceInPOL = tokenPriceInPOL ?? 1;
    return bal * priceInPOL * polUsdPrice;
  };

  const sharedProps = {
    contractAddress,
    receiveTokenAddress,
    receiveTokenSymbol,
    receiveTokenIcon,
    userAddress,
    publicClient,
    walletClient,
    polUsdPrice,
    receiveTokenPriceInPOL,
    wpolBalance,
    receiveTokenBalance,
    bondingCurveData,
    roleCheckData,
    calculateUsdValue,
  };

  return (
    <div className="">
      {side === "buy" ? (
        <BuyMode {...sharedProps} setSide={setSide} />
      ) : (
        <SellMode {...sharedProps} setSide={setSide} />
      )}

      <div className=" w-full text-xs text-white/40 text-center mt-3 flex items-center justify-center gap-1">
        Powered by
        <Image
          src="/images/logos/logo-horisontal-dim.svg"
          alt="QACC"
          width={120}
          height={16}
          className="ml-1.5"
        />
      </div>
    </div>
  );
}



function BuyMode({
  contractAddress,
  receiveTokenAddress,
  receiveTokenSymbol,
  receiveTokenIcon,
  userAddress,
  publicClient,
  walletClient,
  polUsdPrice,
  receiveTokenPriceInPOL,
  wpolBalance,
  receiveTokenBalance,
  bondingCurveData,
  roleCheckData,
  calculateUsdValue,
  setSide,
}: any) {
  const [slippage, setSlippage] = useState(0.5);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: { payAmount: "" },
  });

  const payAmount = watch("payAmount");

  const { data: receiveAmount } = useCalculatePurchaseReturn(
    contractAddress,
    payAmount
  );
  const formattedReceiveAmount = receiveAmount || "0";

  const minAmountOut = receiveAmount
    ? (parseFloat(receiveAmount) * (1 - slippage / 100)).toFixed(6)
    : "0";

  const [selectedPayToken, setSelectedPayToken] = useState<"POL" | "WPOL">(
    "POL"
  );

  const payTokenAddress =
    selectedPayToken === "POL"
      ? config.NATIVE_TOKEN_ADDRESS
      : config.BONDING_CURVE_COLLATERAL_TOKEN;

  const { data: payBalance } = useTokenBalanceWithDecimals(
    payTokenAddress as Address,
    userAddress as Address
  );

  useEffect(() => {
    const checkBalance = async () => {
      setBalanceError(null);
      if (
        !publicClient ||
        !userAddress ||
        !payAmount ||
        isNaN(parseFloat(payAmount)) ||
        parseFloat(payAmount) <= 0
      )
        return;

      try {
        const tokenAddress = payTokenAddress;
        let userBalance: number;

        if (tokenAddress === "0x0000000000000000000000000000000000001010") {
          const balance = await publicClient.getBalance({
            address: userAddress,
          });
          userBalance = Number(balance) / 1e18;
        } else {
          const balance = (await publicClient.readContract({
            address: tokenAddress as Address,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [userAddress],
          })) as bigint;
          userBalance = Number(balance) / 1e18;
        }

        if (userBalance < parseFloat(payAmount)) {
          setBalanceError(
            `Insufficient ${selectedPayToken} balance. Available: ${userBalance.toFixed(
              6
            )} ${selectedPayToken}`
          );
        }
      } catch (error) {
        setBalanceError("Failed to check balance");
      }
    };

    checkBalance();
  }, [payAmount, publicClient, userAddress, selectedPayToken, payTokenAddress]);

  const handleStatusUpdate = (status: string) => {
    setProcessingStatus(status);
  };

  const onSubmit = async (data: FormData) => {
    if (!userAddress || !publicClient || !walletClient || balanceError) return;
    if (!bondingCurveData?.buyIsOpen || !roleCheckData?.hasRole) {
      toast.error("Buy is not open or you lack required role");
      return;
    }

    setIsProcessing(true);
    setProcessingStatus("Starting buy transaction...");

    try {
      const result = await executeBuyFlow(
        publicClient,
        walletClient,
        userAddress,
        contractAddress,
        data.payAmount,
        minAmountOut,
        handleStatusUpdate,
        selectedPayToken === "WPOL"
      );
      toast.success(
        <div>
          Buy successful!{" "}
          <a
            href={`https://polygonscan.com/tx/${result.buyHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-700 underline"
          >
            View Transaction <ArrowUpRight className="inline w-4 h-4" />
          </a>
        </div>
      );
      reset({ payAmount: "" });
    } catch (err) {
      console.error(err);
      toast.error("Buy failed");
    } finally {
      setIsProcessing(false);
      setProcessingStatus(null);
    }
  };

  const payRowProps = {
    tokenSymbol: selectedPayToken,
    iconSrc: POLYGON_POS_CHAIN_IMAGE,
    balance: userAddress && payBalance
      ? formatBalance(parseFloat(payBalance.formattedBalance))
      : "0.00",
    usdValue: userAddress && payBalance
      ? calculateUsdValue(payBalance.formattedBalance, 1)
      : 0,
    selectableTokens: [
      { symbol: "POL", icon: POLYGON_POS_CHAIN_IMAGE },
      { symbol: "WPOL", icon: POLYGON_POS_CHAIN_IMAGE },
    ],
    selectedToken: selectedPayToken,
    onTokenSelect: (symbol: string) =>
      setSelectedPayToken(symbol as "POL" | "WPOL"),
    hasError: !!balanceError,
    isDisabled: !userAddress,
  };

  const receiveRowProps = {
    tokenSymbol: receiveTokenSymbol,
    iconSrc: receiveTokenIcon,
    balance: userAddress && receiveTokenBalance
      ? formatBalance(parseFloat(receiveTokenBalance.formattedBalance))
      : "0.00",
    usdValue: userAddress && receiveTokenBalance
      ? calculateUsdValue(
          receiveTokenBalance.formattedBalance,
          receiveTokenPriceInPOL ?? undefined
        )
      : 0,
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {errors.payAmount && (
        <div className="text-red-500 text-xs mb-2">
          {errors.payAmount.message}
        </div>
      )}
      <div className="space-y-1">
        <PayReceiveRow
          label="PAY"
          isPay={true}
          control={userAddress ? control : undefined}
          name="payAmount"
          {...payRowProps}
        />
        <div className="absolute top-[250px] left-1/2 -translate-x-1/2 -translate-y-1/2 -my-6 flex justify-center">
          <button
            type="button"
            onClick={() => setSide("sell")}
            className="absolute top-0 bg-neutral-800 border-neutral-900 backdrop-blur-[40px] w-8 h-8 rounded-lg flex items-center justify-center"
          >
            <ArrowDownUp className="w-4 h-4 text-qacc-gray-light" />
          </button>
        </div>
        <PayReceiveRow
          label="RECEIVE"
          isPay={false}
          formattedReceiveAmount={formattedReceiveAmount}
          bondingCurveData={bondingCurveData}
          {...receiveRowProps}
        />
      </div>
      {userAddress ? (
        <button
          type="submit"
          className="mt-4 mb-1 bg-peach-400 text-black font-semibold py-4 rounded-[18px] w-full disabled:opacity-50"
          disabled={
            isProcessing ||
            !!balanceError ||
            !!errors.payAmount ||
            !!processingStatus
          }
        >
          {processingStatus || balanceError ? (
            <span className="text-xs font-semibold">
              {processingStatus || balanceError}
            </span>
          ) : (
            "BUY"
          )}
        </button>
      ) : (
        <ConnectWalletButton />
      )}
      {(!bondingCurveData?.buyIsOpen || !roleCheckData?.hasRole) && userAddress && (
        <div className="text-center text-xs text-red-500 mt-2">
          Buy is currently not available. Please check permissions.
        </div>
      )}
    </form>
  );
}

function SellMode({
  contractAddress,
  receiveTokenAddress,
  receiveTokenSymbol,
  receiveTokenIcon,
  userAddress,
  publicClient,
  walletClient,
  polUsdPrice,
  receiveTokenPriceInPOL,
  wpolBalance,
  receiveTokenBalance,
  bondingCurveData,
  roleCheckData,
  calculateUsdValue,
  setSide,
}: any) {
  const [slippage, setSlippage] = useState(0.5);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: { payAmount: "" },
  });

  const payAmount = watch("payAmount");

  const { data: receiveAmount } = useCalculateSaleReturn(
    contractAddress,
    payAmount
  );
  const formattedReceiveAmount = receiveAmount || "0";

  const minAmountOut = receiveAmount
    ? (parseFloat(receiveAmount) * (1 - slippage / 100)).toFixed(6)
    : "0";

  const { data: receiveBalance } = useTokenBalanceWithDecimals(
    config.BONDING_CURVE_COLLATERAL_TOKEN as Address,
    userAddress as Address
  );

  useEffect(() => {
    const checkBalance = async () => {
      setBalanceError(null);
      if (
        !publicClient ||
        !userAddress ||
        !payAmount ||
        isNaN(parseFloat(payAmount)) ||
        parseFloat(payAmount) <= 0
      )
        return;

      try {
        const balance = (await publicClient.readContract({
          address: receiveTokenAddress as Address,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [userAddress],
        })) as bigint;
        const userBalance = Number(balance) / 1e18;

        if (userBalance < parseFloat(payAmount)) {
          setBalanceError(
            `Insufficient ${receiveTokenSymbol} balance. Available: ${userBalance.toFixed(
              6
            )}`
          );
        }
      } catch (error) {
        setBalanceError("Failed to check balance");
      }
    };

    checkBalance();
  }, [
    payAmount,
    publicClient,
    userAddress,
    receiveTokenAddress,
    receiveTokenSymbol,
  ]);

  const handleStatusUpdate = (status: string) => {
    setProcessingStatus(status);
  };

  const onSubmit = async (data: FormData) => {
    if (!userAddress || !publicClient || !walletClient || balanceError) return;
    if (!bondingCurveData?.sellIsOpen || !roleCheckData?.hasRole) {
      toast.error("Sell is not open or you lack required role");
      return;
    }

    setIsProcessing(true);
    setProcessingStatus("Starting sell transaction...");

    try {
      const result = await executeSellFlow(
        publicClient,
        walletClient,
        userAddress,
        contractAddress,
        receiveTokenAddress,
        data.payAmount,
        minAmountOut,
        handleStatusUpdate,
        true // skipUnwrap
      );
      toast.success(
        <div>
          Sell successful!{" "}
          <a
            href={`https://polygonscan.com/tx/${result.sellHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-700 underline"
          >
            View Transaction <ArrowUpRight className="inline w-4 h-4" />
          </a>
        </div>
      );
      reset({ payAmount: "" });
    } catch (err) {
      console.error(err);
      toast.error("Sell failed");
    } finally {
      setIsProcessing(false);
      setProcessingStatus(null);
    }
  };

  const payRowProps = {
    tokenSymbol: receiveTokenSymbol,
    iconSrc: receiveTokenIcon,
    balance: userAddress && receiveTokenBalance
      ? formatBalance(parseFloat(receiveTokenBalance.formattedBalance))
      : "0.00",
    usdValue: userAddress && receiveTokenBalance
      ? calculateUsdValue(
          receiveTokenBalance.formattedBalance,
          receiveTokenPriceInPOL ?? undefined
        )
      : 0,
    hasError: !!balanceError,
    isDisabled: !userAddress,
  };

  const receiveRowProps = {
    tokenSymbol: "WPOL",
    iconSrc: "https://raw.githubusercontent.com/axelarnetwork/axelar-configs/main/images/tokens/wmatic.svg",
    balance: userAddress && receiveBalance
      ? formatBalance(parseFloat(receiveBalance.formattedBalance))
      : "0.00",
    usdValue: userAddress && receiveBalance
      ? calculateUsdValue(receiveBalance.formattedBalance, 1)
      : 0,
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {errors.payAmount && (
        <div className="text-red-500 text-xs mb-2">
          {errors.payAmount.message}
        </div>
      )}
      <div className="space-y-1">
        <PayReceiveRow
          label="PAY"
          isPay={true}
          control={userAddress ? control : undefined}
          name="payAmount"
          {...payRowProps}
        />
        <div className="absolute top-[250px] left-1/2 -translate-x-1/2 -translate-y-1/2 -my-6 flex justify-center">
          <button
            type="button"
            onClick={() => setSide("buy")}
            className="absolute top-0 bg-neutral-800 border-neutral-900 backdrop-blur-[40px] w-8 h-8 rounded-lg flex items-center justify-center"
          >
            <ArrowDownUp className="w-4 h-4 text-qacc-gray-light" />
          </button>
        </div>
        <PayReceiveRow
          label="RECEIVE"
          isPay={false}
          formattedReceiveAmount={formattedReceiveAmount}
          bondingCurveData={bondingCurveData}
          {...receiveRowProps}
        />
      </div>
      {userAddress ? (
        <button
          type="submit"
          className="mt-4 bg-peach-400 text-black font-semibold py-4 rounded-[18px] w-full transition-all flex items-center justify-center gap-2  disabled:opacity-50"
          disabled={
            isProcessing ||
            !!balanceError ||
            !!errors.payAmount ||
            !!processingStatus
          }
        >
          {processingStatus || balanceError ? (
            <span className="text-xs font-semibold">
              {processingStatus || balanceError}
            </span>
          ) : (
            "SELL"
          )}
        </button>
      ) : (
        <ConnectWalletButton />
      )}

      {(!bondingCurveData?.sellIsOpen || !roleCheckData?.hasRole) && userAddress && (
        <div className="text-center text-xs text-red-500 mt-2">
          Sell is currently not available. Please check permissions.
        </div>
      )}
    </form>
  );
}

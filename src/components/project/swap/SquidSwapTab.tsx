'use client';

import { useState, useEffect, memo } from 'react';

import Image from 'next/image';

import { usePrivy } from '@privy-io/react-auth';
import { ArrowDown, Loader2 } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import { Address } from 'viem';

import SelectChainDialog from '@/components/modals/SelectChainDialog';
import { POLYGON_POS_CHAIN_IMAGE } from '@/components/project/project-details/ProjectDonationTable';
import ConnectWalletButton from '@/components/shared/wallet/SwapConnectWalletButton';
import config from '@/config/configuration';
import { useChainManager } from '@/contexts/chainManager.context';
import { formatBalance } from '@/helpers/token';
import { useGetCurrentTokenPrice } from '@/hooks/useGetCurrentTokenPrice';
import useSquidSwap from '@/hooks/useSquidSwap';
import {
  useTokenBalanceWithDecimals,
  useFetchPOLPriceSquid,
} from '@/hooks/useTokens';

interface PayReceiveRowProps {
  label: string;
  tokenSymbol: string;
  iconSrc: string;
  chainIconSrc?: string;
  isLoading?: boolean;
  balance?: string;
  usdValue?: number;
  control?: any;
  isInput?: boolean;
  estimatedAmount?: string;
  isQuoting?: boolean;
  onOpenModal?: () => void;
  hasError?: boolean;
}

const PayReceiveRow = memo(
  ({
    label,
    tokenSymbol,
    iconSrc,
    chainIconSrc,
    isLoading,
    balance,
    usdValue,
    control,
    isInput = false,
    estimatedAmount,
    isQuoting = false,
    onOpenModal,
    hasError = false,
  }: PayReceiveRowProps) => (
    <div className='flex items-center justify-between bg-black px-4 py-6 h-full rounded-[18px] border border-white/10 text-white'>
      <div>
        <span className='text-qacc-gray-light font-bold uppercase text-xs'>
          {label}
        </span>
        <div className='flex items-center gap-3'>
          <div className='relative'>
            <Image
              src={iconSrc}
              alt={tokenSymbol}
              width={24}
              height={24}
              className='rounded-full cursor-pointer'
              onClick={isInput ? onOpenModal : undefined}
            />
            {chainIconSrc && (
              <Image
                src={chainIconSrc}
                alt='Chain'
                width={12}
                height={12}
                className='absolute -bottom-1 -right-1 rounded-full border border-black'
              />
            )}
          </div>
          <span className='font-medium text-xl'>{tokenSymbol}</span>
        </div>
      </div>
      <div className='text-right'>
        {isInput ? (
          <>
            <div className='text-xs text-white/40 mt-1'>
              Balance: {Number(balance) || '0.00'}
            </div>
            {control && (
              <Controller
                control={control}
                name='swapAmount'
                render={({ field }) => (
                  <input
                    type='number'
                    placeholder='0.0'
                    {...field}
                    className={`bg-transparent text-xl font-bold text-right focus:outline-none w-32 ${
                      hasError ? 'text-red-500' : 'text-white'
                    }`}
                    inputMode='decimal'
                  />
                )}
              />
            )}
          </>
        ) : (
          <>
            <div className='text-xs text-white/40 mt-1'>
              Balance: {balance || '0.00'}
            </div>
            <div className='text-xl font-bold'>
              {isQuoting ? (
                <div className='flex items-center gap-2 justify-end'>
                  <Loader2 className='w-4 h-4 animate-spin' />
                </div>
              ) : (
                estimatedAmount || '0'
              )}
            </div>
          </>
        )}

        <div className='text-xs text-white/40 mt-6'>
          ~${(usdValue || 0).toFixed(2)}
        </div>
      </div>
    </div>
  )
);

interface QuickSwapTabProps {
  receiveTokenAddress?: string;
  receiveTokenSymbol?: string;
  receiveTokenIcon?: string;
}

export default function SquidSwapTab({
  receiveTokenAddress, 
  receiveTokenSymbol,
  receiveTokenIcon,
}: QuickSwapTabProps) {
  const { data: polUsdPrice } = useFetchPOLPriceSquid();

  const DEFAULT_FROM_CHAIN_DETAILS = {
    chainId: '137',
    chainIcon: POLYGON_POS_CHAIN_IMAGE,
    tokenAddress: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    tokenSymbol: 'POL',
    tokenIcon: POLYGON_POS_CHAIN_IMAGE,
    tokenDecimals: 18,
    tokenUsdPrice: polUsdPrice,
    blockExplorerUrl: config.SCAN_URL,
  };
  const [slippageTolerance, setSlippageTolerance] = useState<string>('0.5%');
  const [isQuoteValid, setIsQuoteValid] = useState<boolean>(false);
  const [receiveTokenDecimals, setReceiveTokenDecimals] = useState<number>(18);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [selectedFrom, setSelectedFrom] = useState(DEFAULT_FROM_CHAIN_DETAILS);
  const [isChainChanging, setIsChainChanging] = useState(false);

  const { control, watch, reset } = useForm({
    defaultValues: { swapAmount: '' },
  });

  const { switchChain } = useChainManager();

  const { user: privyUser, authenticated } = usePrivy();
  const userAddress = privyUser?.wallet?.address;

  const {
    data: fromBalanceData,
    isLoading: isFromBalanceLoading,
    refetch: refetchFromBalance,
  } = useTokenBalanceWithDecimals(
    selectedFrom.tokenAddress.toLowerCase() as Address,
    userAddress as Address,
    Number(selectedFrom.chainId)
  );

  const fromBalanceRaw = fromBalanceData?.formattedBalance ?? '0';
  const formattedFromBalance = isChainChanging
    ? '0'
    : formatBalance(parseFloat(fromBalanceRaw));

  // Validate balance
  useEffect(() => {
    if (
      !watch('swapAmount') ||
      isNaN(parseFloat(watch('swapAmount'))) ||
      parseFloat(watch('swapAmount')) <= 0
    ) {
      setBalanceError(null);
      return;
    }

    if (parseFloat(watch('swapAmount')) > parseFloat(fromBalanceRaw)) {
      setBalanceError(
        `Insufficient ${selectedFrom.tokenSymbol} balance. Available: ${formattedFromBalance} ${selectedFrom.tokenSymbol}`
      );
    } else {
      setBalanceError(null);
    }
  }, [
    watch('swapAmount'),
    fromBalanceRaw,
    formattedFromBalance,
    selectedFrom.tokenSymbol,
  ]);

  useEffect(() => {
    if (fromBalanceData && typeof fromBalanceData.decimals === 'number') {
      setSelectedFrom(prev => ({
        ...prev,
        tokenDecimals: fromBalanceData.decimals,
      }));
      setIsChainChanging(false);
    }
  }, [fromBalanceData]);

  // Receive token balance (on Polygon)
  const {
    data: receiveTokenBalance,
    isLoading: isReceiveTokenLoading,
    refetch: refetchReceiveBalance,
  } = useTokenBalanceWithDecimals(
    receiveTokenAddress as Address,
    userAddress as Address,
    Number(selectedFrom.chainId)
  );

  const { currentTokenPrice: receiveTokenPriceInPOL } =
    useGetCurrentTokenPrice(receiveTokenAddress);

  // Update receive token decimals whenever balance query returns
  useEffect(() => {
    if (
      receiveTokenBalance &&
      typeof receiveTokenBalance.decimals === 'number'
    ) {
      setReceiveTokenDecimals(receiveTokenBalance.decimals);
    }
  }, [receiveTokenBalance]);

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

  // Get swapAmount from form
  const swapAmount = watch('swapAmount');

  // Effect to get quote when amount changes
  useEffect(() => {
    const debounceTimeout = setTimeout(async () => {
      if (
        swapAmount &&
        parseFloat(swapAmount) > 0 &&
        isInitialized &&
        receiveTokenAddress &&
        selectedFrom
      ) {
        try {
          await getQuote({
            fromChain: selectedFrom.chainId,
            fromToken: selectedFrom.tokenAddress as Address,
            toToken: receiveTokenAddress as Address,
            amount: swapAmount,
            fromDecimals: selectedFrom.tokenDecimals,
            toDecimals: receiveTokenDecimals,
            slippageTolerance: parseFloat(slippageTolerance.replace('%', '')),
          });
          setIsQuoteValid(true);
        } catch (error) {
          console.error('Quote error:', error);
          setIsQuoteValid(false);
        }
      } else {
        setIsQuoteValid(false);
      }
    }, 500);

    return () => clearTimeout(debounceTimeout);
  }, [
    swapAmount,
    slippageTolerance,
    isInitialized,
    receiveTokenDecimals,
    getQuote,
    receiveTokenAddress,
    selectedFrom,
  ]);

  useEffect(() => {
    if (swapError) {
      if (!swapError.includes('not supported')) {
        toast.error(swapError);
      }
    }
  }, [swapError]);

  const calculateUsdValue = (balance?: string, tokenPriceInPOL?: number) => {
    if (!balance || !polUsdPrice) return 0;
    const balanceNum = parseFloat(balance);
    if (isNaN(balanceNum)) return 0;

    const priceInPOL = tokenPriceInPOL ?? 1;
    return balanceNum * priceInPOL * polUsdPrice;
  };

  const calculateUsdFromUsdPrice = (
    amount?: string | number,
    tokenUsdPrice?: number
  ) => {
    if (amount === undefined || amount === null) return 0;
    if (!tokenUsdPrice) return 0;
    const numericAmount =
      typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numericAmount)) return 0;
    return numericAmount * tokenUsdPrice;
  };

  const handleSwap = async () => {
    if (!swapAmount || !isQuoteValid || !selectedFrom) {
      setTimeout(() => toast.error('Please enter a valid amount'), 2000);
      return;
    }

    try {
      const txHash = await executeSwap({
        fromChain: selectedFrom.chainId,
        fromToken: selectedFrom.tokenAddress as Address,
        toToken: receiveTokenAddress as Address,
        amount: swapAmount,
        fromDecimals: selectedFrom.tokenDecimals,
        toDecimals: receiveTokenDecimals,
        slippageTolerance: parseFloat(slippageTolerance.replace('%', '')),
      });

      if (txHash) {
        reset({ swapAmount: '' });
        setIsQuoteValid(false);

        // Refresh balances
        refetchFromBalance();
        refetchReceiveBalance();
        toast.success('Swap successful!', {
          action: {
            label: 'View on Explorer',
            onClick: () =>
              window.open(
                `${selectedFrom.blockExplorerUrl}tx/${txHash}`,
                '_blank'
              ),
          },
        });
        handleChainSwitch();
      }
    } catch (error) {
      console.error('Swap execution error:', error);
    } finally {
      handleChainSwitch();
    }
  };

  const getSwapButtonText = () => {
    if (!authenticated) return 'CONNECT WALLET';
    if (!isInitialized) return 'INITIALIZING...';
    if (isQuoting) return 'GETTING QUOTE...';
    if (isApproving) return 'APPROVING...';
    if (isSwapping) return 'SWAPPING...';
    if (!swapAmount || parseFloat(swapAmount) <= 0) return 'ENTER AMOUNT';
    if (swapError && swapError.includes('not supported'))
      return 'TOKEN NOT SUPPORTED';
    if (!isQuoteValid) return 'INVALID AMOUNT';
    return 'SWAP';
  };

  const handleChainSwitch = () => {
    if (selectedFrom.chainId !== DEFAULT_FROM_CHAIN_DETAILS.chainId) {
      setIsChainChanging(true);
      setSelectedFrom(DEFAULT_FROM_CHAIN_DETAILS);

      switchChain(Number(DEFAULT_FROM_CHAIN_DETAILS.chainId));
      setTimeout(
        () =>
          toast.info('Switched back to Polygon network', {
            description: 'Primary swap network restored.',
          }),
        1000
      );
    }
  };

  const isSwapDisabled =
    !authenticated ||
    !isInitialized ||
    isSwapLoading ||
    !swapAmount ||
    parseFloat(swapAmount) <= 0 ||
    !isQuoteValid ||
    Boolean(swapError && swapError.includes('not supported')) ||
    !!balanceError;

  // Cleanup: when component unmounts, switch back to Polygon if needed
  useEffect(() => {
    return () => {
      if (selectedFrom.chainId !== DEFAULT_FROM_CHAIN_DETAILS.chainId) {
        switchChain(Number(DEFAULT_FROM_CHAIN_DETAILS.chainId)).catch(() => {});
      }
    };
  }, [selectedFrom.chainId, switchChain]);

  return (
    <>
      <div className='space-y-1'>
        <PayReceiveRow
          label='PAY'
          tokenSymbol={selectedFrom.tokenSymbol}
          iconSrc={selectedFrom.tokenIcon}
          chainIconSrc={selectedFrom.chainIcon}
          balance={formattedFromBalance}
          usdValue={
            swapAmount
              ? calculateUsdFromUsdPrice(swapAmount, selectedFrom.tokenUsdPrice)
              : 0
          }
          control={control}
          isInput={true}
          hasError={!!balanceError}
          onOpenModal={() => setIsModalOpen(true)}
        />
        <div className='absolute top-[265px] left-1/2 -translate-x-1/2 -translate-y-1/2 -my-6 bg-neutral-800 border-neutral-900 backdrop-blur-[40px] w-8 h-8 rounded-lg flex items-center justify-center'>
          <ArrowDown className='w-4 h-4 text-qacc-gray-light' />
        </div>
        <PayReceiveRow
          label='RECEIVE'
          tokenSymbol={receiveTokenSymbol ?? ''}
          iconSrc={receiveTokenIcon ?? ''}
          isLoading={isReceiveTokenLoading}
          balance={
            receiveTokenBalance
              ? formatBalance(parseFloat(receiveTokenBalance.formattedBalance))
              : undefined
          }
          usdValue={
            quote?.toAmount
              ? calculateUsdValue(
                  quote.toAmount,
                  receiveTokenPriceInPOL ?? undefined
                )
              : 0
          }
          estimatedAmount={
            quote?.toAmount ? formatBalance(parseFloat(quote.toAmount)) : '0.0'
          }
        />
      </div>

      {!authenticated ? (
        <ConnectWalletButton />
      ) : (
        <button
          onClick={handleSwap}
          disabled={isSwapDisabled}
          className={`mt-4 bg-peach-400 text-black font-semibold py-4 rounded-[18px] w-full transition-all flex items-center justify-center gap-2  disabled:opacity-50`}
        >
          {(isSwapping || isApproving) && (
            <Loader2 className='w-4 h-4 animate-spin' />
          )}
          {getSwapButtonText()}
        </button>
      )}

      <div className='w-full text-xs text-white/40 text-center mt-1 flex items-center justify-center gap-1'>
        Powered by
        <Image
          src='/images/logos/squidrouter-logo.svg'
          alt='Squid Router'
          width={100}
          height={80}
          className='ml-1.5 w-7 h-auto opacity-30'
        />
      </div>
      <SelectChainDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelection={(chain: any, token: any) => {
          setIsChainChanging(true);
          setSelectedFrom({
            chainId: chain.id,
            chainIcon: chain.imageUrl,
            blockExplorerUrl: chain.blockExplorerUrl,
            tokenAddress: token.address,
            tokenSymbol: token.symbol,
            tokenIcon: token.logoURI,
            tokenDecimals: token.decimals,
            tokenUsdPrice: token.usdPrice,
          });
          setIsModalOpen(false);
        }}
      />
    </>
  );
}

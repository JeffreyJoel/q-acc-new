'use client';
import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Address, createPublicClient, http } from 'viem';
import { useWalletClient } from 'wagmi';
import { ArrowDownUp, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';

import { POLYGON_POS_CHAIN_IMAGE } from '@/components/project/project-details/ProjectDonationTable';
import ConnectWalletButton from '@/components/shared/wallet/SwapConnectWalletButton';
import PayReceiveRow from '@/components/project/swap/bonding-curve/PayReceiveRow';
import config from '@/config/configuration';
import { formatBalance } from '@/helpers/token';
import {
  useCalculatePurchaseReturn,
  useCalculateSaleReturn,
} from '@/hooks/useBondingCurve';
import { useSwapForm } from '@/hooks/useSwapForm';
import { useTokenBalanceWithDecimals } from '@/hooks/useTokens';
import {
  executeBuyFlow,
  executeSellFlow,
} from '@/services/bondingCurveProxy.service';
import { polygon } from 'viem/chains';
import { useChainManager } from '@/contexts/chainManager.context';
import { useWallets } from '@privy-io/react-auth';

interface TradeModeProps {
  mode: 'buy' | 'sell';
  setMode: (m: 'buy' | 'sell') => void;
  /* shared */
  contractAddress: string;
  receiveTokenAddress: string;
  receiveTokenSymbol: string;
  receiveTokenIcon: string;
  userAddress?: Address;
  polUsdPrice?: number;
  receiveTokenPriceInPOL?: number;
  bondingCurveData?: any;
  roleCheckData?: any;
  calculateUsdValue: (bal?: string, priceInPol?: number) => number;
}

export default function TradeMode(props: TradeModeProps) {
  const {
    mode,
    setMode,
    contractAddress,
    receiveTokenAddress,
    receiveTokenSymbol,
    receiveTokenIcon,
    userAddress,
    polUsdPrice,
    receiveTokenPriceInPOL,
    bondingCurveData,
    roleCheckData,
    calculateUsdValue,
  } = props;

  const isBuy = mode === 'buy';
  const [slippage] = useState(0.5);
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);
  const { control, handleSubmit, reset, errors, payAmount } = useSwapForm();

  const { data: walletClient } = useWalletClient();
  const queryClient = useQueryClient();

  const publicClient = createPublicClient({
    chain: polygon,
    transport: http('https://polygon-rpc.com'),
  });

  const { wallets } = useWallets();

  const activeWallet = wallets?.[0];

  const walletChainId = activeWallet?.chainId
    ? Number(activeWallet.chainId.split(':')[1])
    : NaN;

  // amounts
  const { data: receiveAmount = '0', isFetching: receiveLoading } = isBuy
    ? useCalculatePurchaseReturn(contractAddress, payAmount)
    : useCalculateSaleReturn(contractAddress, payAmount);

  const formattedReceiveAmount = receiveAmount || '0';
  const minAmountOut = receiveAmount
    ? (parseFloat(receiveAmount) * (1 - slippage / 100)).toFixed(6)
    : '0';

  // balances
  const [selectedPayToken, setSelectedPayToken] = useState<'POL' | 'WPOL'>(
    'POL'
  );

  const payTokenAddress = isBuy
    ? selectedPayToken === 'POL'
      ? (config.NATIVE_TOKEN_ADDRESS as Address)
      : (config.BONDING_CURVE_COLLATERAL_TOKEN as Address)
    : (receiveTokenAddress as Address);

  const { data: payBalance } = useTokenBalanceWithDecimals(
    payTokenAddress,
    userAddress as Address,
    137
  );

  // balance for the token the user will RECEIVE after trade
  const receiveTokenForBalance: Address = isBuy
    ? (receiveTokenAddress as Address)
    : (config.BONDING_CURVE_COLLATERAL_TOKEN as Address);
  const { data: receiveBalance } = useTokenBalanceWithDecimals(
    receiveTokenForBalance,
    userAddress as Address,
    137
  );

  // simple balance check based on fetched balance
  const balanceError = (() => {
    if (
      !userAddress ||
      !payAmount ||
      isNaN(parseFloat(payAmount)) ||
      parseFloat(payAmount) <= 0 ||
      !payBalance
    )
      return null;

    const available = parseFloat(payBalance.formattedBalance);
    if (available < parseFloat(payAmount)) {
      return `Insufficient ${
        isBuy ? selectedPayToken : receiveTokenSymbol
      } balance. Available: ${formatBalance(available)} ${
        isBuy ? selectedPayToken : receiveTokenSymbol
      }`;
    }
    return null;
  })();

  // submit handler
  const onSubmit = useCallback(
    async (data: { payAmount: string }) => {
      if (!userAddress || !publicClient || !walletClient || balanceError)
        return;

      if (walletChainId !== polygon.id) {
        toast.error('Please switch your wallet to Polygon mainnet');
        return;
      }

      if (
        (isBuy && !bondingCurveData?.buyIsOpen) ||
        (!isBuy && !bondingCurveData?.sellIsOpen) ||
        !roleCheckData?.hasRole
      ) {
        toast.error(`${isBuy ? 'Buy' : 'Sell'} is not open or you lack role`);
        return;
      }

      setProcessingStatus(`Starting ${isBuy ? 'buy' : 'sell'} transaction...`);
      try {
        const res = isBuy
          ? await executeBuyFlow(
              publicClient,
              walletClient,
              userAddress,
              contractAddress,
              data.payAmount,
              minAmountOut,
              setProcessingStatus as (status: string) => void,
              selectedPayToken === 'WPOL'
            )
          : await executeSellFlow(
              publicClient,
              walletClient,
              userAddress,
              contractAddress,
              receiveTokenAddress,
              data.payAmount,
              minAmountOut,
              setProcessingStatus as (status: string) => void,
              true
            );
        const txHash = 'buyHash' in res ? res.buyHash : res.sellHash;
        toast.success(
          <div>
            {isBuy ? 'Buy' : 'Sell'} successful!{' '}
            <a
              href={`https://polygonscan.com/tx/${txHash}`}
              target='_blank'
              rel='noopener noreferrer'
              className='text-green-700 underline'
            >
              View Transaction <ArrowUpRight className='inline w-4 h-4' />
            </a>
          </div>
        );

        // Refresh balances after successful swap
        queryClient.invalidateQueries({
          queryKey: ['tokenBalance', payTokenAddress, userAddress],
        });
        queryClient.invalidateQueries({
          queryKey: ['tokenBalance', receiveTokenForBalance, userAddress],
        });

        reset({ payAmount: '' });
      } catch {
        toast.error(`${isBuy ? 'Buy' : 'Sell'} failed`);
      } finally {
        setProcessingStatus(null);
      }
    },
    [
      userAddress,
      publicClient,
      walletClient,
      balanceError,
      isBuy,
      bondingCurveData,
      roleCheckData,
      minAmountOut,
      selectedPayToken,
      contractAddress,
      receiveTokenAddress,
      reset,
    ]
  );

  // rows props
  const payRowProps = isBuy
    ? {
        tokenSymbol: selectedPayToken,
        iconSrc: POLYGON_POS_CHAIN_IMAGE,
        balance:
          userAddress && payBalance
            ? formatBalance(parseFloat(payBalance.formattedBalance))
            : '0.00',
        usdValue: payAmount ? calculateUsdValue(payAmount, 1) : 0,
        selectableTokens: [
          { symbol: 'POL', icon: POLYGON_POS_CHAIN_IMAGE },
          {
            symbol: 'WPOL',
            icon: 'https://raw.githubusercontent.com/axelarnetwork/axelar-configs/main/images/tokens/wmatic.svg',
          },
        ],
        selectedToken: selectedPayToken,
        onTokenSelect: (s: string) => setSelectedPayToken(s as 'POL' | 'WPOL'),
        hasError: !!balanceError,
        isDisabled: !userAddress,
      }
    : {
        tokenSymbol: receiveTokenSymbol,
        iconSrc: receiveTokenIcon,
        balance:
          userAddress && payBalance
            ? formatBalance(parseFloat(payBalance.formattedBalance))
            : '0.00',
        usdValue: payAmount
          ? calculateUsdValue(payAmount, receiveTokenPriceInPOL ?? undefined)
          : 0,
        hasError: !!balanceError,
        isDisabled: !userAddress,
      };

  const receiveRowProps = isBuy
    ? {
        tokenSymbol: receiveTokenSymbol,
        iconSrc: receiveTokenIcon,
        balance:
          userAddress && receiveBalance
            ? formatBalance(parseFloat(receiveBalance.formattedBalance))
            : '0.00',
        usdValue: calculateUsdValue(minAmountOut, receiveTokenPriceInPOL ?? 0),
      }
    : {
        tokenSymbol: 'WPOL',
        iconSrc:
          'https://raw.githubusercontent.com/axelarnetwork/axelar-configs/main/images/tokens/wmatic.svg',
        balance:
          userAddress && receiveBalance
            ? formatBalance(parseFloat(receiveBalance.formattedBalance))
            : '0.00',
        usdValue: calculateUsdValue(minAmountOut, 1),
      };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className='space-y-1'>
        <PayReceiveRow
          label='PAY'
          isPay
          control={userAddress ? control : undefined}
          name='payAmount'
          {...payRowProps}
        />
        <div className='absolute top-[250px] left-1/2 -translate-x-1/2 -translate-y-1/2 -my-6 flex justify-center'>
          <button
            type='button'
            onClick={() => setMode(isBuy ? 'sell' : 'buy')}
            className='absolute top-0 bg-neutral-800 border-neutral-900 backdrop-blur-[40px] w-8 h-8 rounded-lg flex items-center justify-center'
          >
            <ArrowDownUp className='w-4 h-4 text-qacc-gray-light' />
          </button>
        </div>
        <PayReceiveRow
          label='RECEIVE'
          isPay={false}
          formattedReceiveAmount={formattedReceiveAmount}
          bondingCurveData={bondingCurveData}
          {...receiveRowProps}
        />
      </div>
      {userAddress ? (
        <button
          type='submit'
          className='mt-4 bg-peach-400 text-black font-semibold py-4 rounded-[18px] w-full transition-all disabled:opacity-50'
          disabled={!!balanceError || !!processingStatus || !!errors.payAmount}
        >
          {processingStatus || balanceError || (isBuy ? 'BUY' : 'SELL')}
        </button>
      ) : (
        <ConnectWalletButton />
      )}
    </form>
  );
}

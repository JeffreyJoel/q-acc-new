'use client';

import { useState } from 'react';

import Image from 'next/image';

import { usePrivy } from '@privy-io/react-auth';
import { Address } from 'viem';

import config from '@/config/configuration';
import { useBondingCurve } from '@/hooks/useBondingCurve';
import { useGetCurrentTokenPrice } from '@/hooks/useGetCurrentTokenPrice';
import { useRoleCheck } from '@/hooks/useRoleCheck';
import { useFetchPOLPriceSquid } from '@/hooks/useTokens';
import TradeMode from '@/components/project/swap/TradeMode';

interface BondingCurveSwapProps {
  contractAddress: string;
  receiveTokenAddress: string;
  receiveTokenSymbol: string;
  receiveTokenIcon: string;
}

type TradeSide = 'buy' | 'sell';

export default function BondingCurveSwap({
  contractAddress,
  receiveTokenAddress,
  receiveTokenSymbol,
  receiveTokenIcon,
}: BondingCurveSwapProps) {
  const [side, setSide] = useState<TradeSide>('buy');

  const { user: privyUser } = usePrivy();
  const userAddress = privyUser?.wallet?.address as Address | undefined;

  const { data: polUsdPrice } = useFetchPOLPriceSquid();
  const { currentTokenPrice } = useGetCurrentTokenPrice(receiveTokenAddress);
  const receiveTokenPriceInPOL = currentTokenPrice ?? undefined;

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
    polUsdPrice,
    receiveTokenPriceInPOL,
    bondingCurveData,
    roleCheckData,
    calculateUsdValue,
  };

  return (
    <div className=''>
      <TradeMode mode={side} setMode={setSide} {...sharedProps} />

      <div className=' w-full text-xs text-white/40 text-center mt-3 flex items-center justify-center gap-1'>
        Powered by
        <Image
          src='/images/logos/logo-horisontal-dim.svg'
          alt='QACC'
          width={120}
          height={16}
          className='ml-1.5'
        />
      </div>
    </div>
  );
}

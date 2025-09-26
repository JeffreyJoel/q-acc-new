'use client';

import { useState } from 'react';

import BondingCurveSwap from './BondingCurveSwap';
import SquidSwapTab from './SquidSwapTab';

export default function SwapWidget({
  contractAddress,
  receiveTokenAddress,
  receiveTokenSymbol,
  receiveTokenIcon,
}: {
  contractAddress: string;
  receiveTokenAddress: string;
  receiveTokenSymbol: string;
  receiveTokenIcon: string;
}) {
  const [tab, setTab] = useState<'squidswap' | 'direct'>('squidswap');

  const TabButton = ({
    id,
    label,
  }: {
    id: 'squidswap' | 'direct';
    label: string;
  }) => (
    <button
      onClick={() => setTab(id)}
      className={`flex-1  text-center py-2 h-9 items-center rounded-full font-bold text-sm transition-colors
        ${
          tab === id
            ? id === 'squidswap'
              ? 'bg-blue-600'
              : 'bg-peach-400 text-black'
            : 'bg-black/30'
        }
      `}
    >
      {label}
    </button>
  );

  return (
    <div className='h-full lg:max-h-[550px] lg:min-w-[400px] bg-white/5 backdrop-blur-lg rounded-3xl  p-6 text-white flex flex-col gap-3'>
      <h2 className='font-anton text-peach-400 text-center text-2xl uppercase mb-3'>
        Shut Up And Take My $POL
      </h2>

      {/* Tabs */}
      <div className='flex bg-black/75 h-11 px-1 items-center rounded-full'>
        <TabButton id='squidswap' label='SQUIDSWAP' />
        <TabButton id='direct' label='SWAP DIRECTLY' />
      </div>

      {/* Content */}
      {tab === 'squidswap' ? (
        <SquidSwapTab
        // receiveTokenAddress={receiveTokenAddress}
        // receiveTokenSymbol={receiveTokenSymbol}
        // receiveTokenIcon={receiveTokenIcon}
        />
      ) : (
        <BondingCurveSwap
          contractAddress={contractAddress}
          receiveTokenAddress={receiveTokenAddress}
          receiveTokenSymbol={receiveTokenSymbol}
          receiveTokenIcon={receiveTokenIcon}
        />
      )}
    </div>
  );
}

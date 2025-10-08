"use client";
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Controller } from 'react-hook-form';

export type PayReceiveRowProps = {
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

export default function PayReceiveRow({
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
}: PayReceiveRowProps) {
  const currentSymbol = selectableTokens ? selectedToken! : tokenSymbol;
  const currentIcon = selectableTokens
    ? selectableTokens.find(t => t.symbol === selectedToken)?.icon || iconSrc
    : iconSrc;

  return (
    <div className='flex items-center justify-between bg-black px-4 py-6 h-full rounded-[18px] border border-white/10 text-white'>
      <div>
        <span className='text-qacc-gray-light font-bold uppercase text-xs'>
          {label}
        </span>
        {selectableTokens ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className='flex items-center gap-3'>
                <Image
                  src={currentIcon}
                  alt={currentSymbol}
                  width={24}
                  height={24}
                  className='rounded-full'
                />
                <span className='font-medium text-xl'>{currentSymbol}</span>
                <ChevronDown className='w-4 h-4' />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {selectableTokens.map(token => (
                <DropdownMenuItem
                  key={token.symbol}
                  onSelect={() => onTokenSelect?.(token.symbol)}
                >
                  <Image
                    src={token.icon}
                    alt={token.symbol}
                    width={20}
                    height={20}
                    className='rounded-full mr-2'
                  />
                  {token.symbol}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className='flex items-center gap-3'>
            <Image
              src={currentIcon}
              alt={currentSymbol}
              width={24}
              height={24}
              className='rounded-full'
            />
            <span className='font-medium text-xl'>{currentSymbol}</span>
          </div>
        )}

        <div className='text-xs text-white/40 text-left mt-6'>
          {bondingCurveData &&
            `${isPay ? 'Buy' : 'Sell'} Price: ${bondingCurveData.BuyPrice} POL`}
        </div>
      </div>
      <div className='text-right'>
        {isPay ? (
          <>
            <div className='text-xs text-white/40 mt-1'>
              Balance: {balance || '0.00'}
            </div>
            {control ? (
              <Controller
                control={control}
                name={name || 'payAmount'}
                render={({ field }) => (
                  <input
                    type='number'
                    placeholder='0.0'
                    {...field}
                    disabled={isDisabled}
                    className={`bg-transparent text-xl font-bold text-right focus:outline-none w-32 ${
                      hasError ? 'text-red-500' : 'text-white'
                    }`}
                  />
                )}
              />
            ) : (
              <input
                type='number'
                placeholder='0.0'
                disabled={true}
                className={`bg-transparent text-xl font-bold text-right focus:outline-none w-32 ${
                  hasError ? 'text-red-500' : 'text-white'
                }`}
              />
            )}
          </>
        ) : (
          <>
            <div className='text-xs text-white/40 mt-1'>
              Balance: {balance || '0.00'}
            </div>
            <div className='text-xl font-bold'>
              {Number(formattedReceiveAmount).toFixed(1) || '0'}
            </div>
          </>
        )}

        <div className='text-xs text-white/40 mt-6'>
          ~${(usdValue || 0).toFixed(2)}
        </div>
      </div>
    </div>
  );
}

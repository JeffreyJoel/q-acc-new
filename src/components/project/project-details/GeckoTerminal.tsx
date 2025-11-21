'use client';

import { useState, useEffect } from 'react';

import { Loader2, ExternalLink } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import config from '@/config/configuration';
import { getPoolAddressByPair } from '@/helpers/getTokensListedData';

interface GeckoTerminalChartProps {
  tokenSymbol: string;
  tokenAddress: string;
  projectPoolAddress: string;
  isTokenListed: boolean;
}

export function GeckoTerminalChart({
  tokenAddress,
  tokenSymbol,
  projectPoolAddress,
  isTokenListed,
}: GeckoTerminalChartProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (error) {
    return (
      <Card className='bg-black rounded-2xl mb-8'>
        <CardContent className='py-6'>
          <div className='flex flex-col justify-center items-center h-[400px]'>
            <p className='text-muted-foreground dark:text-gray-400 mb-4'>
              {error || 'Chart temporarily unavailable for this token'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isTokenListed && projectPoolAddress) {
    return (
      <div className='relative my-8'>
        {isLoading && (
          <div className='absolute inset-0 flex justify-center items-center bg-black/80 z-10'>
            <Loader2 className='h-8 w-8 animate-spin text-muted-foreground mr-2' />
            <p className='text-muted-foreground dark:text-gray-400'>
              Loading chart data...
            </p>
          </div>
        )}

        {isTokenListed && projectPoolAddress && (
          <div className='w-full h-[400px] bg-black p-4 rounded-2xl'>
            <iframe
              src={`https://www.geckoterminal.com/polygon_pos/pools/${projectPoolAddress}?embed=1&info=0&swaps=0&grayscale=1&light_chart=0&chart_type=price&resolution=1h&chartvalues=1&toolbar=0&theme=dark&background=000000`}
              title={`${tokenSymbol} Price Chart`}
              width='100%'
              height='100%'
              onLoad={() => setIsLoading(false)}
              className='rounded-2xl bg-black'
              allow='clipboard-write'
              allowFullScreen
              style={{
                filter: 'brightness(0.8) contrast(1.2) grayscale(0.1)',
                mixBlendMode: 'lighten',
              }}
            ></iframe>
          </div>
        )}
      </div>
    );
  }
}

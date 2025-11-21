'use client';

import { useEffect, useState } from 'react';

import { useLogin, usePrivy } from '@privy-io/react-auth';
import { Wallet, AlertCircle } from 'lucide-react';

import { Button } from '../../ui/button';

interface WalletNotConnectedProps {
  title?: string;
  description?: string;
  showIcon?: boolean;
  className?: string;
  buttonText?: string;
  variant?: 'default' | 'card' | 'minimal';
}

export const WalletNotConnected: React.FC<WalletNotConnectedProps> = ({
  title = 'Wallet Not Connected',
  description = 'Please connect your wallet to continue using this feature.',
  showIcon = true,
  className = '',
  buttonText = 'Connect Wallet',
  variant = 'default',
}) => {
  const [isClient, setIsClient] = useState(false);
  const { user, ready, authenticated } = usePrivy();
  const { login } = useLogin({});

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render if wallet is connected
  if (isClient && authenticated && user?.wallet?.address) {
    return null;
  }

  // Don't render on server side
  if (!isClient) {
    return null;
  }

  const handleConnect = () => {
    login();
  };

  if (variant === 'minimal') {
    return (
      <div className='flex justify-center items-center min-h-[200px]'>
        <div className={`flex items-center gap-3 ${className}`}>
          {showIcon && <AlertCircle className='h-5 w-5 text-peach-400' />}
          <span className='text-sm text-neutral-400'>{description}</span>
          <Button
            onClick={handleConnect}
            disabled={!ready}
            variant='outline'
            size='sm'
            className='border-peach-400/30 text-peach-400 hover:bg-peach-400/10'
          >
            {showIcon && <Wallet className='h-4 w-4 mr-2' />}
            {buttonText}
          </Button>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className='flex justify-center items-center min-h-[400px]'>
        <div
          className={`bg-neutral-800 border border-neutral-700 rounded-2xl p-8 text-center max-w-md mx-auto ${className}`}
        >
          {showIcon && (
            <div className='flex justify-center mb-4'>
              <div className='p-3 bg-peach-400/10 rounded-full'>
                <Wallet className='h-8 w-8 text-peach-400' />
              </div>
            </div>
          )}
          <h3 className='text-xl font-semibold text-white mb-2'>{title}</h3>
          <p className='text-neutral-400 mb-6 max-w-md mx-auto'>
            {description}
          </p>
          <Button
            onClick={handleConnect}
            disabled={!ready}
            className='bg-peach-400 hover:bg-peach-300 text-black font-medium px-6 py-2 rounded-full'
          >
            {showIcon && <Wallet className='h-4 w-4 mr-2' />}
            {ready ? buttonText : 'Loading...'}
          </Button>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className='flex justify-center items-center min-h-screen'>
      <div
        className={`flex flex-col items-center justify-center py-12 px-4 text-center max-w-md mx-auto ${className}`}
      >
        {showIcon && (
          <div className='flex justify-center mb-4'>
            <div className='p-4 bg-neutral-800 rounded-full border border-neutral-700'>
              <Wallet className='h-12 w-12 text-peach-400' />
            </div>
          </div>
        )}
        <h2 className='text-2xl font-bold text-white mb-3'>{title}</h2>
        <p className='text-neutral-400 mb-6 max-w-md'>{description}</p>
        <Button
          onClick={handleConnect}
          disabled={!ready}
          size='lg'
          className='bg-peach-400 hover:bg-peach-300 text-black font-medium px-8 py-3 rounded-full'
        >
          {showIcon && <Wallet className='h-5 w-5 mr-2' />}
          {ready ? buttonText : 'Loading...'}
        </Button>
      </div>
    </div>
  );
};

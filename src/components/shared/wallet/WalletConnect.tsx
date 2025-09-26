'use client';

import { useEffect, useState } from 'react';

import { useLogin, usePrivy } from '@privy-io/react-auth';

import { Button } from '../../ui/button';

import { WalletDisplay } from './WalletDisplay';
import Link from 'next/link';

function WalletConnect({ onSheetClose }: { onSheetClose?: () => void }) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { user, ready, authenticated } = usePrivy();

  const [isClient, setIsClient] = useState(false);
  const { login } = useLogin({
    onComplete: () => setIsLoading(false),
    onError: () => setIsLoading(false),
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await login();
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
    }
  };

  return (
    <div>
      {isClient && authenticated && user && user.wallet?.address ? (
        <div className='flex flex-col lg:flex-row items-center space-y-3 lg:space-y-0 lg:space-x-3'>
         <div className='w-full lg:w-fit px-4 py-3 flex-row items-center space-x-4 text-sm font-bold border border-peach-400/30 rounded-xl lg:hidden'>
              <span className='text-white block lg:inline'>
                Season 1 Token Claim In: 79 d
              </span>
              <span className='block lg:inline'>
              <Link
                href='/#vesting-schedule'
                className='text-peach-400 block lg:inline cursor-pointer'
                onClick={onSheetClose}
              >
                Vesting Timeline
              </Link>
              </span>
            </div>
          <WalletDisplay walletAddress={user?.wallet?.address} onSheetClose={onSheetClose} />
        </div>
      ) : (
        <>
          <div className='flex flex-col lg:flex-row items-center space-y-3 lg:space-y-0 lg:space-x-3'>
            <div className='w-full lg:w-fit px-4 py-3 flex-row items-center lg:space-x-4 text-sm font-bold border border-peach-400/30 rounded-xl'>
              <span className='text-white block lg:inline'>
                Season 1 Token Claim In: 79 d
              </span>
              <span className='block lg:inline'> 
              <Link
                href='/#vesting-schedule'
                className='text-peach-400 block lg:inline cursor-pointer'
                onClick={onSheetClose}
              >
                Vesting Timeline
              </Link>
              </span>
            </div>
            {ready ? (
              <Button
                disabled={isLoading}
                size='lg'
                onClick={handleLogin}
                variant='default'
                className={`w-full lg:w-fit rounded-xl px-4 py-3 bg-peach-400 ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                {isLoading ? 'Connecting...' : 'Sign In'}
              </Button>
            ) : (
              <Button
                disabled={true}
                size='lg'
                variant='default'
                className='w-full lg:w-fit rounded-xl px-4 py-3 bg-peach-400 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Loading...
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
export default WalletConnect;

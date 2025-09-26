'use client';

import type { FC } from 'react';
import { useState, useEffect } from 'react';

import { usePrivy } from '@privy-io/react-auth';
import { motion } from 'framer-motion';
import { Loader2, ArrowRight, X, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useSignUser } from '@/hooks/useSignUser';
import { IUser } from '@/types/user.type';

interface SignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSign?: (user: IUser) => void;
}

export const SignModal: FC<SignModalProps> = props => {
  const { ready, authenticated } = usePrivy();
  const { refetch, isFetching, error } = useSignUser(props.onSign);
  const [retryCount, setRetryCount] = useState(0);
  const [showRetry, setShowRetry] = useState(false);

  // Reset retry state when modal opens
  useEffect(() => {
    if (props.isOpen) {
      setRetryCount(0);
      setShowRetry(false);
    }
  }, [props.isOpen]);

  // Handle errors and show retry option
  useEffect(() => {
    if (error) {
      setShowRetry(true);
    }
  }, [error]);

  const handleSign = async () => {
    try {
      setShowRetry(false);
      const result = await refetch();

      // If signing failed and it's a wallet initialization error, show retry
      if (!result.data && retryCount < 3) {
        setTimeout(() => {
          setShowRetry(true);
        }, 1000);
      }
    } catch (err) {
      console.error('Sign error:', err);
      setShowRetry(true);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    handleSign();
  };

  if (!props.isOpen) return null;

  // Don't show modal if Privy is not ready
  if (!ready) {
    return null;
  }

  return (
    <div className='fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className='bg-neutral-900 rounded-3xl w-full max-w-md overflow-hidden shadow-xl relative'
      >
        <div className='relative px-6 pt-6'>
          <button
            onClick={props.onClose}
            className='absolute right-6 top-6 text-neutral-400 hover:text-white transition-colors'
            aria-label='Close'
          >
            <X size={20} />
          </button>
        </div>
        <div className='p-10'>
          <h2 className='text-xl font-semibold text-white mb-4'>
            Sign Message to Continue
          </h2>
          <p className='mt-4 mb-6 text-neutral-300'>
            Please sign the message to verify your wallet ownership and
            continue.
          </p>

          {/* Show error message if signing failed */}
          {showRetry && (
            <div className='mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg'>
              <div className='flex items-center gap-2 text-red-400 text-sm'>
                <AlertCircle size={16} />
                <span>
                  {retryCount === 0
                    ? 'Signing failed. Please try again.'
                    : `Signing failed (attempt ${retryCount + 1}/3). Please wait a moment and try again.`}
                </span>
              </div>
            </div>
          )}

          <div className='space-y-4'>
            <Button
              type='button'
              onClick={handleSign}
              disabled={isFetching || !authenticated || !ready}
              loading={isFetching}
              loadingText='Signing...'
              className='w-full rounded-full bg-[#FBBA80] hover:bg-[#FBBA80]/90 text-neutral-900 font-medium py-6'
            >
              <div className='flex items-center justify-center gap-2'>
                <span>Sign Message</span>
                <ArrowRight size={16} />
              </div>
            </Button>

            {/* Show retry button if signing failed */}
            {showRetry && retryCount < 3 && (
              <Button
                type='button'
                onClick={handleRetry}
                disabled={isFetching}
                variant='outline'
                className='w-full rounded-full border-neutral-600 text-neutral-300 hover:bg-neutral-800 py-6'
              >
                Try Again
              </Button>
            )}

            {retryCount >= 3 && (
              <div className='text-center text-sm text-neutral-400'>
                Multiple signing attempts failed. Please refresh the page and
                try again.
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

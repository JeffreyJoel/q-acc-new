'use client';

import { useState } from 'react';

import Link from 'next/link';

import { CheckCircle2 } from 'lucide-react';
import { Address } from 'viem';

import {
  GitcoinVerificationStatus,
  useGitcoinScore,
} from '@/hooks/useGitcoinScore';
import links from '@/lib/constants/links';

import { IconGitcoinPassport } from '../icons/IconGitcoin';
import { Button } from '../ui/button';

// Extracted UI states into dedicated components
const VerifiedState = ({ userGitcoinScore }: { userGitcoinScore: number }) => (
  <>
    <div className='flex items-center gap-3 my-2'>
      <IconGitcoinPassport size={32} color='#6DF6E7' />
      <span className='text-lg font-medium text-[#6DF6E7]'>
        {userGitcoinScore}
      </span>
    </div>

    <div className='flex items-center gap-2'>
      <CheckCircle2 size={16} color='#fff' />
      <p className='text-white font-bold text-xs leading-relaxed'>
        Your purchase affects the matching pool
      </p>
    </div>
  </>
);

const ScoreZeroState = ({
  userGitcoinScore,
  onCheckScore,
  isScoreFetching,
}: {
  userGitcoinScore: number;
  onCheckScore: () => void;
  isScoreFetching: boolean;
}) => {
  const [isScoreChecked, setIsScoreChecked] = useState(false);

  if (!isScoreChecked) {
    return (
      <>
        <p className='text-white/40 text-sm max-w-xs text-center leading-relaxed mb-2'>
          Check your Humanity Score so your purchase influences the matching
          pool
        </p>
        <Button
          className='w-full bg-white text-black rounded-lg uppercase font-medium text-xs mb-2'
          onClick={() => {
            onCheckScore();
            setIsScoreChecked(true);
          }}
          loading={isScoreFetching}
        >
          Check Score <span className='text-black/40'>1 min</span>
        </Button>
      </>
    );
  }

  return <LowScoreState userGitcoinScore={userGitcoinScore} />;
};

const LowScoreState = ({ userGitcoinScore }: { userGitcoinScore: number }) => (
  <>
    <div className='flex items-center gap-3 my-2'>
      <IconGitcoinPassport size={32} color='#FFDF86' />
      <span className='text-lg font-medium text-[#FFDF86]'>
        {userGitcoinScore}
      </span>
    </div>

    <Link
      href={links.PASSPORT}
      target='_blank'
      className='h-9 px-4 py-2 flex items-center justify-center  w-full bg-white text-black rounded-lg uppercase font-medium text-xs my-2'
    >
      Let's Increase to 20
    </Link>
  </>
);

export const GitcoinVerificationBadge = ({
  userAddress,
}: {
  userAddress: Address;
}) => {
  const {
    status,
    userGitcoinScore,
    onCheckScore,
    isUserLoading,
    isScoreFetching,
  } = useGitcoinScore(userAddress);

  const isVerified =
    status === GitcoinVerificationStatus.ANALYSIS_PASS ||
    status === GitcoinVerificationStatus.SCORER_PASS;

  const isScoreZero = userGitcoinScore === 0;
  const isLowScore = userGitcoinScore > 0 && userGitcoinScore < 20;

  return (
    <div className='bg-[#74BCB4]/20 rounded-3xl px-4 py-4 min-w-[280px] lg:max-w-[280px]'>
      {/* Header */}
      <div className='flex flex-col items-center justify-center gap-2'>
        <h3 className='text-white font-semibold text-lg'>Human Passport</h3>
        {isVerified ? (
          <VerifiedState userGitcoinScore={userGitcoinScore} />
        ) : isScoreZero ? (
          <ScoreZeroState
            userGitcoinScore={userGitcoinScore}
            onCheckScore={onCheckScore}
            isScoreFetching={isScoreFetching}
          />
        ) : isLowScore ? (
          <LowScoreState userGitcoinScore={userGitcoinScore} />
        ) : null}
      </div>
    </div>
  );
};

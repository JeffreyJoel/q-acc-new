'use client';

import Link from 'next/link';

import { CheckCircle2 } from 'lucide-react';
import { Address } from 'viem';

import {
  GitcoinVerificationStatus,
  useGitcoinScore,
} from '@/hooks/useGitcoinScore';
import links from '@/lib/constants/links';

import { Button } from '../ui/button';

// Define states
const VerifiedState = () => (
  <>
    <div className='flex items-center gap-3 my-2'>
      <CheckCircle2 size={32} color='#6DF6E7' />
      <span className='text-lg font-medium text-[#6DF6E7]'>Verified</span>
    </div>
    <p className='text-white font-bold text-xs leading-relaxed'>
      $250,000 Limit Unlocked
    </p>
  </>
);

const InitialState = ({ onCheckScore }: { onCheckScore: () => void }) => (
  <>
    <p className='text-white text-sm max-w-xs text-center leading-relaxed mb-2'>
      Verify your identity to unlock $25,000 limit
    </p>
    <Button
      className='w-full bg-white text-black rounded-lg uppercase font-medium text-xs mb-2'
      onClick={onCheckScore}
    >
      VERIFY IDENTITY <span className='text-black/40'>5 MIN</span>
    </Button>
  </>
);

const InProgressState = ({ onCheckScore }: { onCheckScore: () => void }) => (
  <>
    <p className='text-white text-sm max-w-xs text-center leading-relaxed mb-2'>
      Verification in progress...
    </p>
    <Button
      className='w-full bg-white text-black rounded-lg uppercase font-medium text-xs mb-2'
      onClick={onCheckScore}
    >
      CHECK STATUS
    </Button>
  </>
);

const LowScoreState = ({ userGitcoinScore }: { userGitcoinScore: number }) => {
  const isCompletelyFailed = userGitcoinScore === 0;

  if (isCompletelyFailed) {
    return (
      <>
        <p className='text-white text-sm max-w-xs text-center leading-relaxed mb-2'>
          Unfortunately, verification failed
        </p>
        <Button className='w-full bg-white text-black rounded-lg uppercase font-medium text-xs mb-2'>
          CHECK DETAILS
        </Button>
      </>
    );
  } else {
    return (
      <>
        <p className='text-white text-sm max-w-xs text-center leading-relaxed mb-2'>
          Unfortunately, verification failed
        </p>
        <p className='text-white/40 text-sm max-w-xs text-center leading-relaxed mb-2'>
          Or try again?
        </p>
        <Link
          href={links.PASSPORT}
          target='_blank'
          className='h-9 px-4 py-2 flex items-center justify-center w-full bg-white text-black rounded-lg uppercase font-medium text-xs my-2'
        >
          TRY AGAIN
        </Link>
      </>
    );
  }
};

export const SelfVerificationBadge = ({
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

  let content;
  if (isScoreFetching) {
    content = <InProgressState onCheckScore={onCheckScore} />;
  } else if (isVerified) {
    content = <VerifiedState />;
  } else if (status === GitcoinVerificationStatus.LOW_SCORE) {
    content = <LowScoreState userGitcoinScore={userGitcoinScore} />;
  } else {
    content = <InitialState onCheckScore={onCheckScore} />;
  }

  const bgClass = isVerified
    ? 'bg-[#6DF6E7]/20'
    : status === GitcoinVerificationStatus.LOW_SCORE && userGitcoinScore === 0
      ? 'bg-red-600/20'
      : 'bg-white/10';

  const headerColor = isVerified ? 'text-[#6DF6E7]' : 'text-white/60';

  return (
    <div
      className={`${bgClass} rounded-3xl px-4 py-4 min-w-[280px] lg:max-w-[280px]`}
    >
      <div className='flex flex-col items-center justify-center gap-2'>
        <h3 className={`font-semibold text-lg ${headerColor}`}>Self.xyz</h3>
        {content}
      </div>
    </div>
  );
};

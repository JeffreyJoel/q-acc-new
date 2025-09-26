'use client';

import { Loader2 } from 'lucide-react';
import { Address } from 'viem';
import { useAccount } from 'wagmi';

import {
  EligibilityBadge,
  EligibilityBadgeStatus,
} from '@/components/verification-badges/EligibilityBadge';
import config from '@/config/configuration';
import { formatAmount } from '@/helpers/donations';
import {
  GitcoinVerificationStatus,
  useGitcoinScore,
} from '@/hooks/useGitcoinScore';
import { usePrivado } from '@/hooks/usePrivado';
import { useFetchAllRoundDetails } from '@/hooks/useRounds';
import { IQfRound } from '@/types/round.type';

import { Button } from '../ui/button';

import { GitcoinLow } from './GitcoinLow';

export const GitcoinVerifySection = () => {
  const { address } = useAccount();
  const {
    status,
    userGitcoinScore,
    onCheckScore,
    isUserLoading,
    isScoreFetching,
  } = useGitcoinScore(address as Address);
  const { isVerified } = usePrivado(address as Address);
  const { data: allRounds } = useFetchAllRoundDetails();

  const qaccRound: IQfRound | undefined = allRounds?.filter(
    round => round.__typename === 'QfRound'
  )[0];

  let low_cap;

  if (qaccRound) {
    if ('roundPOLCapPerUserPerProjectWithGitcoinScoreOnly' in qaccRound) {
      low_cap =
        qaccRound?.roundPOLCapPerUserPerProjectWithGitcoinScoreOnly || 1000;
    }
  }

  return isVerified ? (
    <section className='relative overflow-hidden bg-gray-800 rounded-2xl p-6'>
      <div>
        <h1 className='text-lg font-bold'>Human Passport</h1>
        <p>
          Verify your uniqueness with Human Passport to support each project
          with up to &nbsp;
          {formatAmount(low_cap)} POL.
        </p>
      </div>
      <div className='absolute top-0 left-0 right-0 bottom-0 z-10 bg-neutral-800 opacity-60'></div>
    </section>
  ) : status === GitcoinVerificationStatus.ANALYSIS_PASS ||
    status === GitcoinVerificationStatus.SCORER_PASS ? (
    <section className='bg-neutral-800 rounded-2xl p-6 flex gap-4 justify-between'>
      <div>
        <h1 className='text-lg font-bold'>Human Passport</h1>
        <p>Your verification allows you to spend up to approximately $1,000.</p>
      </div>
      <div>
        {!isVerified && (
          <EligibilityBadge status={EligibilityBadgeStatus.ELIGIBLE} />
        )}
      </div>
    </section>
  ) : status === GitcoinVerificationStatus.NOT_CHECKED ? (
    <section className='relative overflow-hidden bg-neutral-800 rounded-2xl p-6 flex flex-col gap-4'>
      <h1 className='text-lg font-bold'>Human Passport</h1>
      <p>
        Allows you to spend up to approximately $1,000 and influence the
        matching pool allocation.
      </p>
      <Button
        className='mr-auto px-20 bg-peach-400 rounded-full'
        variant='default'
        disabled={isUserLoading || isScoreFetching}
        onClick={onCheckScore}
      >
        {isUserLoading || isScoreFetching ? (
          <div className='flex items-center gap-2'>
            <Loader2 className='w-4 h-4 animate-spin' />
            Checking...
          </div>
        ) : (
          'Check eligibility'
        )}
      </Button>
    </section>
  ) : status === GitcoinVerificationStatus.LOW_SCORE ? (
    <section className='relative overflow-hidden bg-neutral-800 rounded-2xl p-6 flex flex-col gap-4'>
      <h1 className='text-lg font-bold'>Human Passport</h1>
      <p>
        To support each project with up to $,1000, you must
        <b className='font-bold'>
          &nbsp;increase your Human Passport score to&nbsp;
          {config.GP_SCORER_SCORE_THRESHOLD}
        </b>
        . Once you increase your score, return here and click “Refresh Score”.
      </p>
      <GitcoinLow
        onCheckScore={onCheckScore}
        userGitcoinScore={userGitcoinScore}
        isScoreFetching={isScoreFetching}
      />
    </section>
  ) : null;

  // {!isVerified &&
  //   (status === GitcoinVerificationStatus.NOT_CHECKED ? (
  //     <Button
  //       styleType={ButtonStyle.Solid}
  //       color={ButtonColor.Pink}
  //       className='mr-auto px-20'
  //       loading={isUserLoading || isScoreFetching}
  //       onClick={onCheckScore}
  //     >
  //       Check eligibility
  //     </Button>
  //   ) : status === GitcoinVerificationStatus.LOW_SCORE ? (
  //     <GitcoinLow
  //       onCheckScore={onCheckScore}
  //       userGitcoinScore={userGitcoinScore}
  //       isScoreFetching={isScoreFetching}
  //     />
  //   ) : null)}
  // {isVerified && (
  //   <div className='absolute top-0 left-0 right-0 bottom-0 z-10 bg-gray-50 opacity-60'></div>
  // )}
  // </section>
  // );
};

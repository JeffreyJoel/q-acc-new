import React from 'react';

import { useRouter } from 'next/navigation';

import { Address } from 'viem';
import { useAccount } from 'wagmi';

import { useFetchUser } from '@/hooks/useFetchUser';
import {
  GitcoinVerificationStatus,
  useGitcoinScore,
} from '@/hooks/useGitcoinScore';
import { usePrivado } from '@/hooks/usePrivado';
import { useUpdateSkipVerification } from '@/hooks/useUpdateSkipVerification';

import { Button } from '../ui/button';
import {
  EligibilityBadge,
  EligibilityBadgeStatus,
} from '../verification-badges/EligibilityBadge';

const SkipVerification = () => {
  const { address } = useAccount();
  const { data: user } = useFetchUser(true, address as Address);
  const { status } = useGitcoinScore(address as Address);
  const router = useRouter();
  const { isVerified } = usePrivado(address as Address);
  const { mutate: updateSkipVerification, isPending } =
    useUpdateSkipVerification(() => {
      console.log('Skip verification updated successfully!');
      router.push('/projects');
    });
  return isVerified ||
    status === GitcoinVerificationStatus.ANALYSIS_PASS ||
    status === GitcoinVerificationStatus.SCORER_PASS ? (
    <section className='relative overflow-hidden bg-neutral-800 rounded-2xl p-6'>
      <div>
        <h1 className='text-lg font-bold'>Skip Verification</h1>
        <p>
          {user?.skipVerification
            ? '  You have skipped the verification, verify above to influence the matching distribution'
            : "Skipping Verification will allow you to spend up to approximately $1,000, but your token purchases won't influence the distribution of the matching pool."}
        </p>
      </div>
      <div className='absolute top-0 left-0 right-0 bottom-0 z-10 bg-neutral-800 opacity-60'></div>
    </section>
  ) : user?.skipVerification ? (
    <section className='bg-neutral-800 rounded-2xl p-6 flex gap-4 justify-between'>
      <div>
        <h1 className='text-lg font-bold'>Skip Verification</h1>
        <p>
          You have skipped the verification, verify above to influence the
          matching distribution.
        </p>
      </div>
      <div>
        <EligibilityBadge status={EligibilityBadgeStatus.ELIGIBLE} />
      </div>
    </section>
  ) : (
    <section className='bg-neutral-800 rounded-2xl p-6 flex flex-col gap-4'>
      <h1 className='text-lg font-bold'>Skip Verification</h1>
      <p>
        Allows you to spend up to approximately $1,000 but <b>not influence</b>{' '}
        the matching pool allocation.
      </p>

      <Button
        variant='default'
        className='mr-auto px-16 rounded-full'
        disabled={isPending || user?.skipVerification}
        onClick={() => updateSkipVerification(true)}
      >
        {user?.skipVerification ? 'Verification Skipped ' : 'Skip Verification'}
      </Button>
    </section>
  );
};

export default SkipVerification;

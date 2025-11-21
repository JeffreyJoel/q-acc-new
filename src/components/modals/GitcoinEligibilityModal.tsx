import { useState, type FC } from 'react';

import { Address } from 'viem';
import { useAccount } from 'wagmi';

import { useFetchUser } from '@/hooks/useFetchUser';
import {
  GitcoinVerificationStatus,
  useGitcoinScore,
} from '@/hooks/useGitcoinScore';
import { useUpdateSkipVerification } from '@/hooks/useUpdateSkipVerification';

import { Dialog, DialogContent } from '../ui/dialog';
import { GitcoinLow } from '../verification/GitcoinLow';
import {
  EligibilityBadge,
  EligibilityBadgeStatus,
} from '../verification-badges/EligibilityBadge';

interface GitcoinEligibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitcoinEligibilityModal: FC<GitcoinEligibilityModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { address } = useAccount();
  const {
    status,
    userGitcoinScore,
    onCheckScore,
    isScoreFetching: isScoreFetchingPending,
  } = useGitcoinScore(address as Address);

  const {
    mutate: updateSkipVerification,
    isPending: isSkipVerificationPending,
  } = useUpdateSkipVerification(() => {
    console.log('Skip verification updated successfully!');
    onClose();
  });
  const { data: user } = useFetchUser(false, address as Address);

  const [isCheckingScore, setIsCheckingScore] = useState(false);

  const handleCheckScore = async () => {
    setIsCheckingScore(true);
    await onCheckScore();
    setIsCheckingScore(false);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) onClose();
      }}
    >
      <DialogContent className='sm:max-w-md bg-neutral-900 rounded-[24px] w-full max-w-md'>
        <div className=''>
          <p className='mt-4 mb-10 text-xl'>
            {status === GitcoinVerificationStatus.LOW_SCORE
              ? 'Your Human Passport score is below the 15 threshold.'
              : "Skip verification means your buy won't infulence the matching pool allocation. Verify with Human Passport score > 15 for infulence."}
          </p>
          {status === GitcoinVerificationStatus.NOT_CHECKED && (
            <div className='flex gap-4 justify-center'>
              <div>
                <button
                  className='px-6 py-4 rounded-full text-sm font-bold items-center flex gap-2 bg-peach-400  text-black w-full justify-center'
                  // loading={isSkipVerificationPending}
                  disabled={user?.skipVerification}
                  onClick={() => updateSkipVerification(true)}
                >
                  {user?.skipVerification
                    ? 'Verification Skipped '
                    : 'Skip Verification'}
                </button>
              </div>
              <div>
                <button
                  className='px-6 py-4 rounded-full text-sm font-bold items-center flex gap-2 border-2 border-peach-400  text-peach-400 w-full justify-center'
                  // styleType={ButtonStyle.Solid}
                  // color={ButtonColor.Pink}
                  // loading={isCheckingScore}
                  onClick={handleCheckScore}
                >
                  Check Score
                </button>
              </div>
            </div>
          )}
          {(status === GitcoinVerificationStatus.ANALYSIS_PASS ||
            status === GitcoinVerificationStatus.SCORER_PASS) && (
            <EligibilityBadge
              className='ml-auto w-fit'
              status={EligibilityBadgeStatus.ELIGIBLE}
            />
          )}
          {status === GitcoinVerificationStatus.LOW_SCORE && (
            <GitcoinLow
              onCheckScore={onCheckScore}
              userGitcoinScore={userGitcoinScore}
              isScoreFetching={isScoreFetchingPending}
              onClose={onClose}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

import { FC } from 'react';

import { IconExternalLink } from '@tabler/icons-react';
import { Loader2 } from 'lucide-react';
import { Address } from 'viem';
import { useAccount } from 'wagmi';

import { IconGitcoinPassport } from '@/components/icons/IconGitcoin';
import { useFetchUser } from '@/hooks/useFetchUser';
import { useUpdateSkipVerification } from '@/hooks/useUpdateSkipVerification';
import links from '@/lib/constants/links';

import { Button } from '../ui/button';

interface IGitcoinLowProps {
  userGitcoinScore: number;
  isScoreFetching: boolean;
  onCheckScore: () => void;
  onClose?: () => void;
}

export const GitcoinLow: FC<IGitcoinLowProps> = ({
  userGitcoinScore,
  isScoreFetching,
  onCheckScore,
  onClose,
}) => {
  const { mutate: updateSkipVerification, isPending } =
    useUpdateSkipVerification(() => {
      console.log('Skip verification updated successfully!');
      if (onClose) {
        onClose();
      }
    });

  const { address } = useAccount();
  const { data: user } = useFetchUser(true, address as Address);

  return (
    <div className='bg-neutral-800 my-2 rounded-xl p-4 text-base border-[1px] border-neutral-700'>
      <div className='bg-neutral-800 mt-2 rounded-xl p-4 text-base text-white flex items-center justify-between'>
        Your Passport Score
        <div className='bg-black text-white py-2 px-6 rounded-full'>
          {userGitcoinScore}
        </div>
      </div>
      <div className='flex gap-2 items-center justify-end mt-4'>
        <Button
          className='mr-auto px-16 shadow-baseShadow'
          variant='default'
          disabled={isPending || user?.skipVerification}
          onClick={() => updateSkipVerification(true)}
        >
          {user?.skipVerification
            ? 'Verification Skipped '
            : 'Skip Verification'}
        </Button>

        <a href={links.PASSPORT} target='_blank' referrerPolicy='no-referrer'>
          <Button className=' bg-peach-300'>
            <div className='flex items-center gap-1'>
              Increase Score to 15
              <IconExternalLink size={16} />
            </div>
          </Button>
        </a>
        <Button
          className=' bg-peach-300'
          onClick={onCheckScore}
          disabled={isScoreFetching}
        >
          <div className='flex gap-2'>
            <IconGitcoinPassport size={16} />

            {isScoreFetching ? (
              <div className='flex items-center gap-2'>
                <Loader2 className='w-4 h-4 animate-spin' />
                Checking...
              </div>
            ) : (
              'Refresh Score'
            )}
          </div>
        </Button>
      </div>
    </div>
  );
};

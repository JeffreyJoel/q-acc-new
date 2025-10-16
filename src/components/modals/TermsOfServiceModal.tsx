import Link from 'next/link';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useUpdateAcceptedTerms } from '@/hooks/useUpdateAcceptedTerms';
import { useFetchUser } from '@/hooks/useFetchUser';
import { usePrivy } from '@privy-io/react-auth';
import { Address } from 'viem';
import { useState } from 'react';

interface TermsOfServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsOfServiceModal = ({
  isOpen,
  onClose,
}: TermsOfServiceModalProps) => {

    const {user: privyUser} = usePrivy();
    const address = privyUser?.wallet?.address as Address;

    const { data: user } = useFetchUser(true, address as Address);
    // const router = useRoute();
    const { mutate: updateAcceptedTerms,  } = useUpdateAcceptedTerms(
        () => {
            onClose();
        }
    );

  
    const [istermsChecked, setIstermsChecked] = useState<boolean>(
      user?.acceptedToS || false,
    );

    const handleAcceptTerms = (_event: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = _event.target.checked;
        setIstermsChecked(isChecked);

        if (!user?.acceptedToS) {
            updateAcceptedTerms(true);
          }
      };
    


  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) onClose();
      }}
    >
      <DialogContent className='sm:max-w-md bg-neutral-900 rounded-[24px] w-full max-w-md'>
        <DialogHeader>
          <DialogTitle>Terms of Service</DialogTitle>
        </DialogHeader>
        <label className='flex gap-2 items-center   rounded-2xl w-full cursor-pointer'>
            <div>
              <input
                type='checkbox'
                checked={istermsChecked}
                onChange={event => handleAcceptTerms(event)}
              />
            </div>
            <div className='flex flex-col '>
              <h2 className='text-base'>
                I have read and agree to the{' '}
                <Link
                  href='/tos'
                  className='text-peach-400 font-semibold'
                  target='_blank'
                >
                  Terms of Service.
                </Link>
              </h2>
            </div>
          </label>
        {/* <DialogFooter>
          <div className=''>
            If you think this is a mistake, please check with the project team
            or you can reach out to us at
            <Link href={`mailto:info@qacc.xyz `}>
              <span className='text-peach-400 font-semibold'>
                {' '}
                info@qacc.xyz{' '}
              </span>
            </Link>
            for support.
          </div>
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
};

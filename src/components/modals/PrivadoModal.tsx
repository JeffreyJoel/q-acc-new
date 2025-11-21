import { useState, type FC } from 'react';

import Image from 'next/image';

import { IconArrowRight } from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { usePrivadoUrl } from '@/hooks/usePrivado';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PrivadoModalProps extends BaseModalProps {}

// Placeholder component for PrivadoHoldUp since it wasn't found in the codebase
const PrivadoHoldUp: FC = () => (
  <div className='bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4'>
    <h3 className='font-semibold text-amber-800 mb-2'>Important Information</h3>
    <ul className='text-sm text-amber-700 space-y-1'>
      <li>
        • Your verification will be processed securely using zero-knowledge
        proofs
      </li>
      <li>
        • This process helps ensure the integrity of the matching fund
        allocation
      </li>
      <li>• Your personal data remains private and encrypted</li>
      <li>
        • Only verification status is shared, not your personal information
      </li>
    </ul>
  </div>
);

export const PrivadoModal: FC<PrivadoModalProps> = ({ isOpen, onClose }) => {
  const { url, isLoading: isPrivadoLoading } = usePrivadoUrl();
  const [understood, setUnderstood] = useState(false);

  const handleUnderstood = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    setUnderstood(isChecked);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='md:max-w-3xl pb-24 md:pb-6 relative'>
        {/* Decorative images */}
        <Image
          src='/images/particles/trazado1.png'
          alt='Illustration'
          width={20}
          height={100}
          className='bottom-0 right-1/2 absolute'
        />
        <Image
          src='/images/particles/cominho1.png'
          alt='Illustration'
          width={100}
          height={100}
          className='top-0 right-0 absolute z-0'
        />
        <Image
          src='/images/particles/trazado2.png'
          alt='Illustration'
          width={50}
          height={10}
          className='top-5 left-0 absolute'
        />

        <DialogHeader>
          <DialogTitle>🛂 Hold Up!</DialogTitle>
          <DialogDescription>
            Before proceeding, you should know that:
          </DialogDescription>
        </DialogHeader>

        <div className='relative z-10'>
          <PrivadoHoldUp />
        </div>

        <div className='flex gap-2 my-6 relative z-10'>
          <input
            type='checkbox'
            checked={understood}
            name='understood'
            id='understood'
            onChange={handleUnderstood}
            className='mt-1'
          />
          <label htmlFor='understood' className='text-sm'>
            I've read and understood the above.
          </label>
        </div>

        <div className='relative z-10'>
          <Button
            type='button'
            disabled={!understood || isPrivadoLoading || !url}
            className='p-4 rounded-full shadow-baseShadow text-sm font-bold min-w-[200px] justify-center gap-2'
            onClick={() => {
              // Open the Wallet URL to start the verification process
              url && window.open(url, '_blank');
            }}
          >
            {isPrivadoLoading ? (
              'Loading...'
            ) : (
              <>
                Go to Privado ID
                <IconArrowRight size={16} />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

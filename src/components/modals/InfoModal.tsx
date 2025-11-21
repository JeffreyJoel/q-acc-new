import Link from 'next/link';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
}

export const InfoModal = ({
  isOpen,
  onClose,
  title,
  description,
}: InfoModalProps) => {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) onClose();
      }}
    >
      <DialogContent className='sm:max-w-md bg-neutral-900 rounded-[24px] w-full max-w-md'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p className='text-white text-[16px]'>{description}</p>

        <DialogFooter>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

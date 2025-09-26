import { type FC } from 'react';

import { formatAmount } from '@/helpers/donations';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

interface UserCapUpdateModal {
  userDonationCap: number;
  selectedTokenSymbol: string;
  isOpen: boolean;
  onClose: () => void;
}

export const UserCapUpdateModal: FC<UserCapUpdateModal> = props => {
  return (
    <Dialog
      open={props.isOpen}
      onOpenChange={open => {
        if (!open) props.onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Individual Cap Updated</DialogTitle>
        </DialogHeader>

        <div className=' flex flex-col gap-6'>
          <p className=' text-xl'>
            Due to DAI price changes, your individual cap has been adjusted.
            Please review the updated criteria before proceeding with your
            purchase.
          </p>
          <div className='flex justify-between items-center px-4 py-2 bg-[#EBECF2] rounded-xl'>
            <span>Your updated cap for this project is</span>

            <span className='text-[#1D1E1F] font-semibold font-redHatText'>
              {formatAmount(props.userDonationCap)} {props?.selectedTokenSymbol}
            </span>
          </div>
          <button
            className='mx-auto px-6 py-4 rounded-full text-sm font-bold items-center flex gap-2 bg-peach-400  text-black w-full justify-center'
            // styleType={ButtonStyle.Solid}
            // color={ButtonColor.Base}
            onClick={() => {
              props.onClose();
            }}
          >
            Go Update the Amount
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

import { useEffect } from 'react';

import { X } from 'lucide-react';

import { useModal } from '@/contexts/ModalContext';
import { IUser } from '@/types/user.type';

interface ProfileIncompleteBannerProps {
  user: IUser | null;
  onClose: () => void;
}

function ProfileIncompleteBanner({
  user,
  onClose,
}: ProfileIncompleteBannerProps) {
  const { openUpdateProfileModal } = useModal();

  const shouldShowBanner =
    user && (!user.email || !user.username || !user.fullName);

  useEffect(() => {
    if (shouldShowBanner) {
      document.documentElement.style.setProperty('--banner-height', '3rem');
      document.body.style.paddingTop = '3rem';
    } else {
      document.documentElement.style.setProperty('--banner-height', '0rem');
      document.body.style.paddingTop = '0';
    }

    // Cleanup on unmount
    return () => {
      document.documentElement.style.setProperty('--banner-height', '0rem');
      document.body.style.paddingTop = '0';
    };
  }, [shouldShowBanner]);

  if (!shouldShowBanner) {
    return null;
  }

  return (
    <div className='fixed top-0 left-0 right-0 bg-qacc-gray-light text-black p-2 flex justify-between items-center z-[60]'>
      <div className='flex w-full justify-center items-center gap-4'>
        <p className='text-sm font-medium'>
          Your profile is incomplete. Please update it to enjoy the full
          experience.
        </p>
        <button
          onClick={() => openUpdateProfileModal(user, false)}
          className='bg-black text-white px-4 py-2 rounded-xl hover:bg-gray-800 text-sm font-medium'
        >
          Update Profile
        </button>
      </div>
      <button
        onClick={onClose}
        className='hover:bg-black/10 rounded-full p-1 transition-colors'
        aria-label='Close banner'
      >
        <X size={20} />
      </button>
    </div>
  );
}

export default ProfileIncompleteBanner;

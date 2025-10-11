'use client';

import { useMemo } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { usePrivy } from '@privy-io/react-auth';
import { ArrowUpRight } from 'lucide-react';
import { useAccount } from 'wagmi';

import { Spinner } from '@/components/loaders/Spinner';
import { useDonorContext } from '@/contexts/donor.context';
import { useModal } from '@/contexts/ModalContext';
import { handleImageUrl } from '@/helpers/image';
import { roundPoints } from '@/helpers/points';
// import { GitcoinVerificationBadge } from "../../verification-badges/GitcoinVerificationBadge";

// import { CreateProjectButton } from "../../project/create/CreateProjectButton";

// import { useFetchProjectsCountByUserId } from "@/hooks/useFetchProjectsCountByUserId";

import { CopyButton } from '../../shared/CopyButton';
// import { SelfVerificationBadge } from "@/components/verification-badges/SelfVerification";

export default function ProfileInfo() {
  const { user, loading: donorContextLoading } = useDonorContext();
  const { address: wagmiAddress } = useAccount();
  const { authenticated, user: privyUser } = usePrivy();

  const ConnectedUserAddress = privyUser?.wallet?.address || wagmiAddress;

  const { openUpdateProfileModal } = useModal();

  const isOwnProfile = useMemo(() => {
    return (
      authenticated &&
      ConnectedUserAddress &&
      ConnectedUserAddress.toLowerCase() === ConnectedUserAddress.toLowerCase()
    );
  }, [ConnectedUserAddress, ConnectedUserAddress]);

  let avatar;
  if (user?.avatar && !user.avatar.includes('https://gateway.pinata.cloud')) {
    avatar = handleImageUrl(user.avatar);
  } else {
    avatar = user?.avatar;
  }

  if (donorContextLoading || !user) {
    return (
      // TODO: move this to a separate file
      <div className='p-6'>
        <div className='flex items-center justify-between w-full'>
          <div className='flex items-center'>
            <div className='w-[140px] h-[140px] bg-neutral-700 rounded-full overflow-hidden mr-4 flex items-center justify-center'>
              <Spinner size={40} />
            </div>

            <div className='space-y-3'>
              <div className='h-8 bg-neutral-700 rounded w-48 animate-pulse'></div>
              <div className='h-5 bg-neutral-700 rounded w-36 animate-pulse'></div>
              <div className='h-5 bg-neutral-700 rounded w-40 animate-pulse'></div>
            </div>
          </div>
          <div className='flex gap-3'>
            <div className='h-10 bg-neutral-700 rounded w-24 animate-pulse'></div>
          </div>
        </div>

        <div className='mt-8 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4'>
          <div className='flex items-center border-peach-100/30 border-[1px] border-r-4 border-b-4 shadow-sm rounded-xl px-4 py-2'>
            <span className='text-neutral-300 mr-2'>
              {isOwnProfile ? 'Your' : "User's"} q/acc points
            </span>
            <div className='bg-black rounded-full w-5 h-5 flex items-center justify-center mr-1'>
              <Image
                src='/images/logos/round_logo.png'
                alt='Q'
                width={16}
                height={16}
                priority
              />
            </div>
            <div className='h-6 bg-neutral-700 rounded w-16 animate-pulse ml-3'></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className=''>
        <div className='flex items-center justify-between w-full'>
          <div className='flex '>
            {/* <div className="w-[80px] h-[80px] md:w-[120px] md:h-[120px] rounded-full border-[1px] border-peach-100/30 bg-black overflow-hidden mr-4"> */}
            <Image
              src={avatar || '/images/user.png'}
              alt='User avatar'
              width={120}
              height={120}
              className=' w-[80px] h-[80px] md:w-[120px] md:h-[120px] rounded-full border-[1px] border-peach-100/30 bg-black overflow-hidden object-cover mr-4'
            />
            {/* </div> */}

            <div>
              {isOwnProfile && (
                <div className='flex flex-col md:flex-row gap-2 md:items-end'>
                  <p className='text-[36px] md:text-[40px] font-anton leading-none'>
                    {user?.fullName}
                  </p>
                  {user?.username && (
                    <span className='text-[16px] md:text-[20px] font-anton text-qacc-gray-light'>
                      @{user?.username}
                    </span>
                  )}
                </div>
              )}
              {isOwnProfile && (
                <p className='text-white/50 text-sm md:text-lg font-medium mt-2'>
                  {user?.email}
                </p>
              )}
              <div className='flex  items-center'>
                <span className='font-ibm-mono text-white/50 text-sm md:text-lg font-medium'>
                  {' '}
                  {ConnectedUserAddress?.slice(0, 8)}...
                  {ConnectedUserAddress?.slice(
                    ConnectedUserAddress?.length - 8,
                    ConnectedUserAddress?.length
                  )}
                </span>
                <CopyButton
                  text={ConnectedUserAddress || ''}
                  iconColor='fill-white/50'
                  iconClassName='w-4 h-4 ml-2'
                />
                <Link
                  href={`https://polygonscan.com/address/${ConnectedUserAddress}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-white/50 text-sm md:text-lg font-medium'
                >
                  <ArrowUpRight className='w-4 h-4 md:w-5 md:h-5 ml-2' />
                </Link>
              </div>

              <p
                className='text-peach-400 text-xs uppercase font-medium mt-2 cursor-pointer'
                onClick={() => user && openUpdateProfileModal(user, false)}
              >
                Edit Profile
              </p>

              <div className='w-fit flex justify-between items-center bg-white/10 rounded-xl px-5 py-2 mt-5'>
                <span className='text-white text-base font-medium mr-4'>
                  <span className='hidden sm:inline-flex'>Q/ACC</span> Points
                </span>
                <div className='flex items-center'>
                  <div className='bg-black rounded-full w-5 h-5 flex items-center justify-center'>
                    <Image
                      src='/images/logos/round_logo.png'
                      alt='Q'
                      width={16}
                      height={16}
                      priority
                    />
                  </div>
                  <span className='font-bold ml-1'>
                    {roundPoints(user?.qaccPoints || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* <div className="flex gap-4">
            <GitcoinVerificationBadge userAddress={userAddress} />
            <SelfVerificationBadge userAddress={userAddress} />

          </div> */}
          {/* <div className="flex gap-3"> */}
          {/* {isOwnProfile && userProjectsCount === 0 && (
              <CreateProjectButton className="bg-peach-400 text-black px-4 py-2 rounded-md font-medium hover:bg-peach-300 transition-colors" />
            )} */}
          {/* </div> */}
        </div>

        <div className='mt-8 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4'></div>
      </div>
    </>
  );
}

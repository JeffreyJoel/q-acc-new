'use client';

import { useEffect } from 'react';

import { useRouter, usePathname } from 'next/navigation';

import { usePrivy } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { Address } from 'viem';
import { useAccount } from 'wagmi';

import { useModal } from '@/contexts/ModalContext';
import { getLocalStorageToken } from '@/helpers/generateJWT';
import { useAddressWhitelist } from '@/hooks/useAddressWhitelist';
import { useFetchUser } from '@/hooks/useFetchUser';
import { useUpdateUser } from '@/hooks/useUpdateUser';
import { fetchGivethUserInfo } from '@/services/user.service';
// import { SanctionModal } from '../Modals/SanctionModal';
import { IUser, INewUer } from '@/types/user.type';

// import { isProductReleased } from '@/config/configuration';
// import { useFetchSanctionStatus } from '@/hooks/useFetchSanctionStatus';
// import { useCheckSafeAccount } from '@/hooks/useCheckSafeAccount';
// import { TermsConditionModal } from '../Modals/TermsConditionModal';

export const UserController = () => {
  const { user: privyUser, ready, authenticated } = usePrivy();
  const { mutateAsync: updateUser } = useUpdateUser();
  const { isConnected, address } = useAccount();
  const {
    setShowSignModal,
    openUpdateProfileModal,
    openSignModal,
    setOnSign,
    setCurrentUser,
    setShowIncompleteBanner,
  } = useModal();

  const { data: useWhitelist } = useAddressWhitelist();
  const pathname = usePathname();

  // Standardize address format to checksum
  const rawAddress = privyUser?.wallet?.address || address;
  const userAddress = rawAddress ? ethers.getAddress(rawAddress) : undefined;

  const { data: user, refetch } = useFetchUser(
    ready && authenticated && !!userAddress,
    userAddress as Address
  );

  const onSign = async (signedInUser: IUser) => {
    console.log('Signed', signedInUser);
    setShowSignModal(false);
    if (!signedInUser?.isSignedIn) return;

    let currentUserState: IUser | null | undefined = (await refetch()).data;
    if (!currentUserState) {
      currentUserState = signedInUser;
    }

    if (
      userAddress &&
      (!currentUserState?.fullName || !currentUserState?.email)
    ) {
      const givethData = await fetchGivethUserInfo(userAddress);
      console.log('Giveth', givethData);

      if (givethData && (givethData.name || givethData.email)) {
        const userUpdateFromGiveth: INewUer = {
          fullName: givethData.name || currentUserState?.fullName || '',
          email: givethData.email || currentUserState?.email,
          avatar: givethData.avatar || currentUserState?.avatar,
          newUser: !currentUserState?.fullName || !currentUserState?.email,
        };

        await updateUser(userUpdateFromGiveth);
        const updatedUserData = await refetch();
        if (updatedUserData.data) {
          currentUserState = updatedUserData.data;
        } else {
          currentUserState = {
            ...currentUserState,
            fullName: userUpdateFromGiveth.fullName,
            email: userUpdateFromGiveth.email || '',
            avatar: userUpdateFromGiveth.avatar || '',
          } as IUser;
        }
        console.log('Giveth info saved');
      } else {
        console.log('No new user info in Giveth data');
      }
    }

    // Set current user in context for banner to access
    if (currentUserState) {
      setCurrentUser(currentUserState);
    }

    // Show banner if profile is incomplete (instead of showing modal immediately)
    if (
      !currentUserState?.email ||
      !currentUserState?.username ||
      !currentUserState?.fullName
    ) {
      setShowIncompleteBanner(true);
    } else {
      setShowIncompleteBanner(false);
    }

    // if (!isProductReleased) {
    //   return redirect(Routes.KycLanding);
    // }

    // Check if user is whitelisted
    if (useWhitelist) {
      const isUserCreatedProject = true;
      if (!isUserCreatedProject) {
        // router.push(Routes.Create); //TODO: should we redirect or not
      }
    }
  };

  // Set up the onSign callback when component mounts
  useEffect(() => {
    setOnSign(() => onSign);
  }, [setOnSign]);

  useEffect(() => {
    if (!ready || !authenticated || !userAddress) return;
    const handleAddressCheck = async () => {
      const localStorageToken = getLocalStorageToken(userAddress);

      if (localStorageToken) {
        const fetchedData = await refetch();
        const fetchedUser = fetchedData.data;

        // Set current user in context and check if banner should be shown
        if (fetchedUser) {
          setCurrentUser(fetchedUser);

          // Show banner if profile is incomplete
          if (
            !fetchedUser.email ||
            !fetchedUser.username ||
            !fetchedUser.fullName
          ) {
            setShowIncompleteBanner(true);
          } else {
            setShowIncompleteBanner(false);
          }
        }

        // Check if user has accepted ToS after refetching user data
        // if (user && !user.acceptedToS && pathname !== '/tos') {
        //   setShowTermsModal(true);
        // }
        return;
      }
      openSignModal();
    };

    handleAddressCheck();
  }, [userAddress, user, ready, authenticated]);

  useEffect(() => {
    const handleShowSignInModal = () => {
      openSignModal();
    };

    window.addEventListener('showSignInModal', handleShowSignInModal);

    return () => {
      window.removeEventListener('showSignInModal', handleShowSignInModal);
    };
  }, [openSignModal, openUpdateProfileModal, user]);

  return null;
};

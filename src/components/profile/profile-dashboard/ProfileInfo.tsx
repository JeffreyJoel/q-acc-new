"use client";

import { useEffect, useMemo, useState } from "react";
import { CopyButton } from "../../shared/CopyButton";
import Image from "next/image";
import { Address } from "viem";
import { roundPoints } from "@/helpers/points";
import { GitcoinVerificationBadge } from "../../verification-badges/GitcoinVerificationBadge";
import { PrivadoVerificationBadge } from "../../verification-badges/PrivadoVerificationBadge";
import { useAccount } from "wagmi";
import { useModal } from "@/contexts/ModalContext";
import { getIpfsAddress } from "@/helpers/image";
import { CreateProjectButton } from "../../project/create/CreateProjectButton";
import { usePrivy } from "@privy-io/react-auth";
import { useDonorContext } from "@/contexts/donor.context";
import { Spinner } from "@/components/loaders/Spinner";
import { useFetchProjectsCountByUserId } from "@/hooks/useFetchProjectsCountByUserId";

export default function ProfileInfo({ userAddress }: { userAddress: Address }) {
  const { user, loading: donorContextLoading } = useDonorContext();
  const { address: wagmiAddress } = useAccount();
  const { authenticated, user: privyUser } = usePrivy();

  const ConnectedUserAddress = privyUser?.wallet?.address || wagmiAddress;

  const { openUpdateProfileModal } = useModal();

  const { data: userProjectsCount, isFetched: isProjectsCountFetched } =
    useFetchProjectsCountByUserId(parseInt(user?.id ?? ""));

  const isOwnProfile = useMemo(() => {
    return (
      authenticated &&
      ConnectedUserAddress &&
      userAddress.toLowerCase() === ConnectedUserAddress.toLowerCase()
    );
  }, [ConnectedUserAddress, userAddress]);

  let avatar;
  if (user?.avatar && !user.avatar.includes("https://gateway.pinata.cloud")) {
    avatar = getIpfsAddress(user.avatar);
  } else {
    avatar = user?.avatar;
  }

  if (donorContextLoading || !user) {
    return (
      // TODO: move this to a separate file
      <div className="p-6 bg-neutral-800 rounded-2xl">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <div className="w-[140px] h-[140px] bg-neutral-700 rounded-lg overflow-hidden mr-4 flex items-center justify-center">
              <Spinner size={40} />
            </div>

            <div className="space-y-3">
              <div className="h-8 bg-neutral-700 rounded w-48 animate-pulse"></div>
              <div className="h-5 bg-neutral-700 rounded w-36 animate-pulse"></div>
              <div className="h-5 bg-neutral-700 rounded w-40 animate-pulse"></div>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="h-10 bg-neutral-700 rounded w-24 animate-pulse"></div>
          </div>
        </div>

        <div className="mt-8 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center border-peach-100/30 border-[1px] border-r-4 border-b-4 shadow-sm rounded-xl px-4 py-2">
            <span className="text-neutral-300 mr-2">
              {isOwnProfile ? "Your" : "User's"} q/acc points
            </span>
            <div className="bg-black rounded-full w-5 h-5 flex items-center justify-center mr-1">
              <Image
                src="/images/logos/round_logo.png"
                alt="Q"
                width={16}
                height={16}
                priority
              />
            </div>
            <div className="h-6 bg-neutral-700 rounded w-16 animate-pulse ml-3"></div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="h-8 bg-neutral-700 rounded w-32 animate-pulse"></div>
            <div className="h-8 bg-neutral-700 rounded w-32 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6 bg-neutral-800 rounded-2xl">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <div className="w-[140px] h-[140px] bg-black rounded-lg overflow-hidden mr-4">
              <img
                src={avatar || "/images/user.png"}
                alt="User avatar"
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              {isOwnProfile && (
                <p className="text-2xl font-bold">{user?.fullName}</p>
              )}
              {user?.username && (
                <p className="text-xl text-neutral-300">@{user?.username}</p>
              )}
              {isOwnProfile && (
                <p className="text-neutral-300">{user?.email}</p>
              )}
              <div className="flex items-center text-neutral-300">
                <span className="font-mono">
                  {" "}
                  {userAddress.slice(0, 8)}...
                  {userAddress.slice(
                    userAddress.length - 8,
                    userAddress.length
                  )}
                  <CopyButton text={userAddress} />
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            {isOwnProfile && (
              <button
                className="text-peach-400 font-medium hover:text-peach-300 transition-colors"
                onClick={() => user && openUpdateProfileModal(user, false)}
              >
                Edit Profile
              </button>
            )}
            {/* {isOwnProfile && userProjectsCount === 0 && (
              <CreateProjectButton className="bg-peach-400 text-black px-4 py-2 rounded-md font-medium hover:bg-peach-300 transition-colors" />
            )} */}
          </div>
        </div>

        <div className="mt-8 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center border-peach-100/30 border-[1px] border-r-4 border-b-4 shadow-sm rounded-xl px-4 py-2">
            <span className="text-neutral-300 mr-2">Your q/acc points</span>
            <div className="bg-black rounded-full w-5 h-5 flex items-center justify-center mr-1">
              <Image
                src="/images/logos/round_logo.png"
                alt="Q"
                width={16}
                height={16}
                priority
              />
            </div>
            <span className="font-bold ml-3">
              {roundPoints(user?.qaccPoints || 0)}
            </span>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <GitcoinVerificationBadge userAddress={userAddress} />
            {/* <PrivadoVerificationBadge userAddress={userAddress} /> */}
          </div>
        </div>
      </div>
    </>
  );
}

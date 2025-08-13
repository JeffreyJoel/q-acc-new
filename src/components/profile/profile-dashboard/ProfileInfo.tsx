"use client";

import { useMemo } from "react";
import { CopyButton } from "../../shared/CopyButton";
import Image from "next/image";
import { Address } from "viem";
import { roundPoints } from "@/helpers/points";
import { GitcoinVerificationBadge } from "../../verification-badges/GitcoinVerificationBadge";
import { useAccount } from "wagmi";
import { useModal } from "@/contexts/ModalContext";
import { getIpfsAddress } from "@/helpers/image";
import { CreateProjectButton } from "../../project/create/CreateProjectButton";
import { usePrivy } from "@privy-io/react-auth";
import { useDonorContext } from "@/contexts/donor.context";
import { Spinner } from "@/components/loaders/Spinner";
import { useFetchProjectsCountByUserId } from "@/hooks/useFetchProjectsCountByUserId";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

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
      <div className="">
        <div className="flex items-center justify-between w-full">
          <div className="flex">
            <div className="w-[120px] h-[120px] rounded-full bg-black overflow-hidden mr-4">
              <Image
                src={avatar || "/images/user.png"}
                alt="User avatar"
                width={120}
                height={120}
                className="w-full h-full rounded-full object-cover"
              />
            </div>

            <div>
              {isOwnProfile && (
                <div className="flex gap-2 items-end">
                  <p className="text-[40px] font-anton leading-none">
                    {user?.fullName}
                  </p>
                  {user?.username && (
                    <span className="text-[20px] font-anton text-qacc-gray-light">
                      @{user?.username}
                    </span>
                  )}
                </div>
              )}
              {isOwnProfile && (
                <p className="text-white/50 text-lg font-medium mt-2">
                  {user?.email}
                </p>
              )}
              <div className="flex  items-center">
                <span className="font-ibm-mono text-white/50 text-lg font-medium">
                  {" "}
                  {userAddress.slice(0, 8)}...
                  {userAddress.slice(
                    userAddress.length - 8,
                    userAddress.length
                  )}
                </span>
                <CopyButton
                  text={userAddress}
                  iconColor="fill-white/50"
                  iconClassName="w-4 h-4 ml-2"
                />
                <Link
                  href={`https://polygonscan.com/address/${userAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/50 text-lg font-medium"
                >
                  <ArrowUpRight className="w-5 h-5 ml-2" />
                </Link>
              </div>

              <p
                className="text-peach-400 text-xs uppercase font-medium mt-2"
                onClick={() => user && openUpdateProfileModal(user, false)}
              >
                Edit Profile
              </p>

              <div className="w-fit flex justify-between items-center bg-white/10 rounded-xl px-5 py-2 mt-5">
                <span className="text-white text-base font-medium mr-4">
                  Q/ACC Points
                </span>
                <div className="flex items-center">
                  <div className="bg-black rounded-full w-5 h-5 flex items-center justify-center">
                    <Image
                      src="/images/logos/round_logo.png"
                      alt="Q"
                      width={16}
                      height={16}
                      priority
                    />
                  </div>
                  <span className="font-bold ml-1">
                    {roundPoints(user?.qaccPoints || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <GitcoinVerificationBadge userAddress={userAddress} />
            <GitcoinVerificationBadge userAddress={userAddress} />

          </div>
          {/* <div className="flex gap-3"> */}
          {/* {isOwnProfile && userProjectsCount === 0 && (
              <CreateProjectButton className="bg-peach-400 text-black px-4 py-2 rounded-md font-medium hover:bg-peach-300 transition-colors" />
            )} */}
          {/* </div> */}
        </div>

        <div className="mt-8 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
    
        </div>
      </div>
    </>
  );
}

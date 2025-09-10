import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { handleImageUrl } from "@/helpers/image";
import { getPaymentAddresses } from "@/helpers/getPaymentAddresses";

import { IconViewTransaction } from "@/components/icons/IconViewTransaction";
import { IconTotalSupply } from "@/components/icons/IconTotalSupply";
import { IconTotalDonars } from "@/components/icons/IconTotalDonors";
import { IconTotalDonations } from "@/components/icons/IconTotalDonations";
import { formatAmount } from "@/helpers/donations";
import { IconTokenSchedule } from "@/components/icons/IconTokenSchedule";
import { IconMinted } from "@/components/icons/IconMinted";
import { IconAvailableTokens } from "@/components/icons/IconAvailableTokens";
// import { Button, ButtonColor } from '@/components/Button';
import { IconBreakdownArrow } from "@/components/icons/IconBreakdownArrow";
import {
  useTokenPriceRange,
  useTokenPriceRangeStatus,
} from "@/services/tokenPrice.service";
import {
  useFetchActiveRoundDetails,
  useFetchAllRoundDetails,
} from "@/hooks/useRounds";
import { calculateCapAmount } from "@/helpers/round";
import { useCheckSafeAccount } from "@/hooks/useCheckSafeAccount";
import { EProjectSocialMediaType, IProject } from "@/types/project.type";
import { Share } from "lucide-react";
import { ShareProjectModal } from "@/components/modals/ShareModal";
import { useTokenSupplyDetails } from "@/hooks/useTokens";
import { useFetchPOLPriceSquid } from "@/hooks/useTokens";
import { useGetCurrentTokenPrice } from "@/hooks/useGetCurrentTokenPrice";
import { Button } from "@/components/ui/button";
import { useAccount } from "wagmi";

import {
  useClaimRewards,
  useIsActivePaymentReceiver,
  useReleasableForStream,
} from "@/hooks/useClaimRewards";
import { ethers } from "ethers";
import { usePrivy } from "@privy-io/react-auth";
import { toast } from "sonner";

const DonarSupportedProjects = ({
  projectId,
  project,
  uniqueDonors,
  totalClaimableRewardTokens,
  totalContributions,
  projectDonations,
  totalContribution,
  totalRewardTokens,
  onClickBreakdown,
  isOwnProfile,
}: {
  projectId: string;
  project: IProject;
  uniqueDonors: number;
  totalClaimableRewardTokens: number | null;
  totalContributions: number;
  projectDonations: number;
  totalContribution: number;
  totalRewardTokens: number;
  onClickBreakdown: () => void;
  isOwnProfile: boolean;
}) => {
  const { data: POLPrice } = useFetchPOLPriceSquid();
  const { data: activeRoundDetails } = useFetchActiveRoundDetails();
  const [maxPOLCap, setMaxPOLCap] = useState(0);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [paymentAddresses, setPaymentAddresses] = useState<{
    paymentRouterAddress: string | null;
    paymentProcessorAddress: string | null;
  }>({
    paymentRouterAddress: null,
    paymentProcessorAddress: null,
  });

  const [isTokenClaimable, setIsTokenClaimable] = useState(false);

  const openShareModal = () => setIsShareModalOpen(true);
  const closeShareModal = () => setIsShareModalOpen(false);
  const { issuanceTokenAddress } = project?.abc || {};
  const { currentTokenPrice } = useGetCurrentTokenPrice(issuanceTokenAddress);
  const { user: privyUser } = usePrivy();

  const address = privyUser?.wallet?.address as `0x${string}`;

  useEffect(() => {
    const fetchPaymentAddresses = async () => {
      if (project?.abc?.orchestratorAddress) {
        try {
          const addresses = await getPaymentAddresses(
            project.abc.orchestratorAddress
          );
          if (
            addresses.paymentRouterAddress &&
            addresses.paymentProcessorAddress
          ) {
            setPaymentAddresses(addresses);
            return;
          }
        } catch (error) {
          console.error(
            "Failed to get payment addresses from orchestrator:",
            error
          );
        }
      }
    };

    if (project) {
      fetchPaymentAddresses();
    }
  }, [projectId, project]);

  useEffect(() => {
    const updatePOLCap = async () => {
      if (activeRoundDetails) {
        const { capAmount, totalDonationAmountInRound }: any =
          await calculateCapAmount(activeRoundDetails, Number(projectId));

        setMaxPOLCap(capAmount);
      }
    };

    updatePOLCap();
  }, [activeRoundDetails, projectId, maxPOLCap]);

  const { data: allRounds } = useFetchAllRoundDetails();
  const { data: isSafeAccount } = useCheckSafeAccount();

  const { data: tokenDetails } = useTokenSupplyDetails(
    project?.abc?.fundingManagerAddress!
  );

  // console.log(project);

  const tokenPriceRangeStatus = useTokenPriceRangeStatus({
    project,
    allRounds,
  });
  const tokenPriceRange = useTokenPriceRange({
    contributionLimit: maxPOLCap,
    contractAddress: project.abc?.fundingManagerAddress || "",
  });

  const handleShare = () => {
    openShareModal();
  };

  const website = project.socialMedia?.find(
    (social) => social.type === EProjectSocialMediaType.WEBSITE
  )?.link;

  const releasable = useReleasableForStream({
    paymentProcessorAddress: paymentAddresses.paymentProcessorAddress || "",
    client: paymentAddresses.paymentRouterAddress || "",
    receiver: address,
    streamIds: [
      BigInt(1),
      BigInt(2),
      BigInt(3),
      BigInt(4),
      BigInt(5),
      BigInt(6),
    ],
  });

  const isActivePaymentReceiver = useIsActivePaymentReceiver({
    paymentProcessorAddress: paymentAddresses.paymentProcessorAddress || "",
    client: paymentAddresses.paymentRouterAddress || "",
    receiver: address,
  });

  const claimableReward = releasable.data
    ? Number(ethers.formatUnits(releasable.data, 18))
    : 0;

  const { claim } = useClaimRewards({
    paymentProcessorAddress: paymentAddresses.paymentProcessorAddress || "",
    paymentRouterAddress: paymentAddresses.paymentRouterAddress || "",
    onSuccess: () => {
      setIsTokenClaimable(false);
      releasable.refetch();
      toast.success("Successfully Claimed Tokens");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    setIsTokenClaimable(isActivePaymentReceiver.data || false);
  }, [isActivePaymentReceiver.data]);

  return (
    <div className="p-6 flex lg:flex-row flex-col gap-14 bg-neutral-800 rounded-xl">
      {/* Project Details */}
      <div className="flex flex-col gap-4 w-full lg:w-1/2">
        {/* Project Banner */}
        <div
          className="w-full h-[230px] bg-cover bg-center rounded-3xl relative"
          style={{
            backgroundImage: `url('${project.image}')`,
          }}
        >
          <div className=" flex flex-col absolute  bottom-[24px] left-[24px] md:bottom-[24px] md:left-[24px] gap-2">
            <div className="border rounded-md bg-neutral-800 p-1 block w-fit">
              <img
                className="w-6 h-6 rounded-full"
                src={handleImageUrl(
                  project.abc?.icon ||
                    "Qmeb6CzCBkyEkAhjrw5G9GShpKiVjUDaU8F3Xnf5bPHtm4"
                )}
              />
            </div>
            <div className="flex flex-col text-white gap-2">
              <h1 className="text-2xl md:text-[41px] font-bold leading-10">
                {project.title}
              </h1>
            </div>
          </div>
        </div>
        <p className="text-neutral-200 text-sm font-redHatText">
          {project.descriptionSummary}
        </p>
        <div className="flex flex-wrap gap-2">
          {project?.socialMedia
            ?.filter((sm) => sm.type !== EProjectSocialMediaType.WEBSITE)
            .map((social: any) => {
              return (
                <Link
                  key={social.link}
                  href={social.link}
                  target="_blank"
                  className="p-2 rounded-lg border-gray-200 border"
                >
                  <Image
                    src={`/images/icons/social/${social.type.toLowerCase()}.svg`}
                    alt={`${social.type} icon`}
                    width={24}
                    height={24}
                    className="filter invert"
                  />
                </Link>
              );
            })}
        </div>
        <div className="flex flex-col gap-4 font-redHatText">
          <div className="flex gap-4 flex-wrap">
            {website && (
              <Link
                target="_blank"
                href={website}
                className="w-full py-2 px-4 border border-peach-300 rounded-3xl flex justify-center flex-1"
              >
                <div>
                  <span className="flex gap-4 text-peach-300 font-bold">
                    Website
                    <IconViewTransaction color="#FCD1AA" />
                  </span>
                </div>{" "}
              </Link>
            )}
            <Link
              target="_blank"
              href={`https://polygonscan.com/address/${project?.abc?.issuanceTokenAddress}`}
              className="w-full py-2 px-4 border border-peach-200 rounded-3xl flex justify-center flex-1"
            >
              <div>
                <span className="flex gap-4 text-peach-300 font-bold text-nowrap">
                  Contract Address
                  <IconViewTransaction color="#FCD1AA" />
                </span>
              </div>{" "}
            </Link>
          </div>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link
              target="_blank"
              href={`/project/${project?.slug}`}
              className=" py-2 px-4 border border-peach-300 rounded-3xl flex justify-center flex-1"
            >
              <span className="flex gap-4 text-peach-300 font-bold items-center text-nowrap">
                View Project
                <IconViewTransaction color="#FCD1AA" />
              </span>
            </Link>
            <div
              onClick={handleShare}
              className="cursor-pointer py-2 px-4 border border-peach-300 rounded-3xl flex justify-center flex-1"
            >
              <span className="flex gap-4 text-peach-300 font-bold items-center text-nowrap">
                Share Project
                <Share color="#FCD1AA" size={24} />
              </span>
            </div>{" "}
            <ShareProjectModal
              isOpen={isShareModalOpen}
              onClose={closeShareModal}
              showCloseButton={true}
              projectSlug={project?.slug || ""}
              projectTitle={project?.title}
              tokenTicker={project?.abc?.tokenTicker}
              projectData={project}
            />
          </div>

          <div className="flex justify-between p-2">
            <div className="flex gap-2">
              <IconTotalSupply size={24} />
              <span className="text-neutral-300 font-medium font-redHatText">
                Total Supply
              </span>
            </div>
            <span className="font-medium text-neutral-200">
              {formatAmount(Number(tokenDetails?.issuance_supply)) || "---"}{" "}
              {project.abc?.tokenTicker}
            </span>
          </div>

          <div className="flex justify-between p-2">
            <div className="flex gap-2">
              <IconTotalDonars size={24} />
              <span className="text-neutral-300 font-medium  font-redHatText">
                Total supporters
              </span>
            </div>
            <span className="font-medium text-neutral-200">{uniqueDonors}</span>
          </div>

          <div className="flex flex-col md:flex-row gap-3 justify-between p-[16px_8px] bg-neutral-700/50 rounded-md">
            <div className="flex gap-2">
              <IconTotalDonations size={24} />
              <span className="font-medium text-neutral-200">
                Total received
              </span>
            </div>
            <div className="flex gap-2">
              <span className="font-medium text-neutral-200">
                ~ $ {formatAmount(totalContributions * POLPrice) || 0}
              </span>
              <span className="font-medium text-neutral-400">
                {formatAmount(totalContributions) || 0} POL{" "}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Project Claim and Reward */}
      <div className="flex flex-col gap-4 w-full lg:w-1/2  font-redHatText">
        {/* {activeRoundDetails && (
          <>
            <div className='flex items-center gap-2'>
              <img
                className='w-6 h-6 rounded-full'
                src={handleImageUrl(
                  project.abc?.icon ||
                    'Qmeb6CzCBkyEkAhjrw5G9GShpKiVjUDaU8F3Xnf5bPHtm4',
                )}
              />
              <span className='text-[#4F576A] font-medium'>
                {project.abc?.tokenTicker} range
                {tokenPriceRangeStatus.isSuccess &&
                tokenPriceRangeStatus.data?.isPriceUpToDate
                  ? ' '
                  : ' (Calculating) '}
              </span>
              <div className='relative group'>
                <IconTokenSchedule />
                <div className='absolute w-[200px] z-50 mb-2 left-[-60px] hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2'>
                  The mint value of the ABC token will be within this range,
                  based on the amount of POL this project receives.
                </div>
              </div>
            </div>

            <div className='flex justify-between text-[#1D1E1F] font-medium'>
              {tokenPriceRangeStatus.isSuccess &&
              tokenPriceRangeStatus.data?.isPriceUpToDate ? (
                <>
                  <h2 className='flex gap-1 items-center'>
                    {tokenPriceRange.min.toFixed(2)} -{' '}
                    {tokenPriceRange.max.toFixed(2)}
                    <span className='text-[#4F576A] text-xs pb-1'>POL</span>
                  </h2>
                  <h2 className='text-[#4F576A]'>
                    ~${' '}
                    {Number(POLPrice) &&
                      formatNumber(Number(POLPrice) * tokenPriceRange.min)}{' '}
                    -
                    {Number(POLPrice) &&
                      formatNumber(Number(POLPrice) * tokenPriceRange.max)}
                  </h2>
                </>
              ) : (
                <>
                  <div className='p-2 w-[80%] rounded-lg bg-[#F7F7F9] text-[#1D1E1F] font-medium flex items-center gap-1'>
                    ---
                    <span className='text-gray-400 text-xs'>POL</span>
                  </div>
                  <div className='w-[20%] text-gray-400 text-right font-medium'>
                    ~$ ---
                  </div>
                </>
              )}
            </div>
          </>
        )} */}
        {/* <hr /> */}

        {!isSafeAccount && (
          <>
            <h1 className="flex p-[4px_16px] bg-neutral-700 w-fit rounded-md">
              {isOwnProfile ? "You" : "User"} supported this project{" "}
              {projectDonations > 1 && (
                <span className="font-medium">
                  &nbsp;{projectDonations}&nbsp;
                </span>
              )}
              {projectDonations === 1 ? (
                <span className="font-bold">&nbsp;once</span>
              ) : (
                "times"
              )}
              .
            </h1>
            <div className="flex justify-between p-2 bg-neutral-700/50 rounded-lg">
              <div className="flex gap-2">
                <IconTotalDonations size={24} />
                <span className="text-neutral-300 font-medium ">
                  {isOwnProfile ? "Your" : "User's"} contribution
                </span>
              </div>
              <span className="font-medium text-neutral-200">
                {formatAmount(totalContribution)} POL
              </span>
            </div>
          </>
        )}

        {totalRewardTokens > 0 ? (
          <>
            <div className="flex justify-between p-2">
              <div className="flex gap-2">
                <IconMinted size={24} />
                <span className="text-neutral-300 font-medium ">
                  {isOwnProfile ? "Your" : "User's"} project tokens{" "}
                </span>
              </div>
              <div className="flex gap-1">
                <span className="font-medium text-neutral-200">
                  {formatAmount(totalRewardTokens) || "---"}{" "}
                  {project.abc?.tokenTicker}
                </span>
                <span className="font-medium text-neutral-400">
                  ~{" "}
                  {formatAmount(totalRewardTokens * (currentTokenPrice || 0)) ||
                    "---"}{" "}
                  POL
                </span>
              </div>
            </div>

            {isOwnProfile && (
              <div className="flex flex-col md:flex-row gap-3 justify-between p-[16px_8px] bg-neutral-700/50 rounded-md">
                <div className="flex gap-2">
                  <IconAvailableTokens size={24} />
                  <span className="font-medium text-neutral-300">
                    Available to claim
                  </span>
                  <div className="relative group">
                    <IconTokenSchedule />
                    <div className="absolute w-[200px] z-50 mb-2 left-[-60px] hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
                      The tokens have been unlocked and are now available for
                      you to claim. Once claimed, they will be transferred to
                      your wallet.
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 font-medium text-neutral-300">
                  <span>
                    {totalClaimableRewardTokens !== null
                      ? `${formatAmount(totalClaimableRewardTokens)} ${
                          project.abc?.tokenTicker || ""
                        }`
                      : "---"}
                  </span>
                  <span className="text-neutral-400">
                    ~{" "}
                    {totalClaimableRewardTokens !== null
                      ? formatAmount(
                          totalClaimableRewardTokens * (currentTokenPrice || 0)
                        )
                      : "---"}{" "}
                    POL
                  </span>
                </div>
              </div>
            )}
          </>
        ) : (
          ""
        )}

        {/* Claim Rewards */}
        {isOwnProfile && (
          <>
            <button
              className="flex justify-center rounded-xl bg-peach-400 text-neutral-800 px-4 py-3 disabled:opacity-50"
              disabled={!isTokenClaimable || claim.isPending}
              onClick={() => claim.mutateAsync()}
            >
              {isActivePaymentReceiver.isPending
                ? "Checking for tokens..."
                : claim.isPending
                ? "Claiming..."
                : "Claim Tokens"}
            </button>
            <Link
              href={`/profile/${address}?tab=contributions&projectId=${projectId}`}
            >
              <button
                className="px-4 py-3 flex items-center gap-2 justify-center w-full border border-peach-300 rounded-xl text-peach-300"
                onClick={onClickBreakdown}
              >
                Tokens & Contributions Breakdown <IconBreakdownArrow />
              </button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default DonarSupportedProjects;

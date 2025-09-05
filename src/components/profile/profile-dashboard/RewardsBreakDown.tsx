"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProjectUserDonationTable from "./ProjectUserDonationTable";
import { IconABC } from "@/components/icons/IconABC";
import { IconTotalDonations } from "@/components/icons/IconTotalDonations";
import { IconTotalSupply } from "@/components/icons/IconTotalSupply";
import { IconTotalDonars } from "@/components/icons/IconTotalDonors";
// import { Button, ButtonColor } from '../Button';
import { IconAvailableTokens } from "@/components/icons/IconAvailableTokens";
import { IconLockedTokens } from "@/components/icons/IconLockedTokens";
import { IconMinted } from "@/components/icons/IconMinted";
import {
  formatAmount,
  calculateLockedRewardTokenAmount,
  calculateClaimableRewardTokenAmount,
} from "@/helpers/donations";
import { useFetchUser } from "@/hooks/useFetchUser";
import { useTokenPrice, useTokenSupplyDetails } from "@/hooks/useTokens";
import { useCheckSafeAccount } from "@/hooks/useCheckSafeAccount";
import { useDonorContext } from "@/contexts/donor.context";
import { Address } from "viem";
import { useAccount } from "wagmi";
import {
  useClaimRewards,
  useIsActivePaymentReceiver,
  useReleasableForStream,
  useReleasedForStream,
} from "@/hooks/useClaimRewards";
import { ethers } from "ethers";
import { toast } from "sonner";
import { getPaymentAddresses } from "@/helpers/getPaymentAddresses";

const RewardsBreakDown: React.FC = () => {
  const { donationsGroupedByProject, projectDonorData } = useDonorContext();
  const { address } = useAccount();
  const { data: user } = useFetchUser(false, address as Address);
  const userId = user?.id;
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const { data: POLPrice } = useTokenPrice();
  const { data: isSafeAccount } = useCheckSafeAccount();
  const [lockedTokens, setLockedTokens] = useState(0);
  const [isTokenClaimable, setIsTokenClaimable] = useState(false);
  const [paymentAddresses, setPaymentAddresses] = useState<{
    paymentRouterAddress: string | null;
    paymentProcessorAddress: string | null;
  }>({
    paymentRouterAddress: null,
    paymentProcessorAddress: null,
  });

  const projectDonations = donationsGroupedByProject[Number(projectId)] || [];
  const project = projectDonations[0]?.project;
  const projectData = projectDonorData[Number(projectId)] || {
    uniqueDonors: 0,
    donarContributions: 0,
    userProjectContributionSum: 0,
    totalContributions: 0,
  };
  const { data: tokenDetails } = useTokenSupplyDetails(
    project?.abc?.fundingManagerAddress
  );

  const totalSupporters = projectData.uniqueDonors;
  const totalContributions = projectData.totalContributions;
  const totalUserContributions = projectData.userProjectContributionSum;
  const totalTokensReceived = projectDonations.reduce(
    (sum: any, donation: any) => sum + (donation.rewardTokenAmount || 0),
    0
  );

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
            console.log(addresses.paymentProcessorAddress, addresses.paymentRouterAddress);
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

  const released = useReleasedForStream({
    paymentProcessorAddress: paymentAddresses.paymentProcessorAddress || "",
    client: paymentAddresses.paymentRouterAddress || "",
    receiver: address,
    streamIds: [BigInt(1), BigInt(2), BigInt(3)],
  });

  const availableToClaim = releasable.data
    ? Number(ethers.formatUnits(releasable.data, 18)) // Format BigInt data to decimal
    : 0;

  const tokensAlreadyClaimed = released.data
    ? Number(ethers.formatUnits(released.data, 18)) // Format BigInt data to decimal
    : 0;


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
    setLockedTokens(totalTokensReceived - tokensAlreadyClaimed);
  }, [releasable, released, totalTokensReceived]);

  useEffect(() => {
    setIsTokenClaimable(isActivePaymentReceiver.data || false);
  }, [isActivePaymentReceiver.data]);

  // projectDonations.forEach((donation: any) => {
  //   const lockedRewardTokenAmount = calculateLockedRewardTokenAmount(
  //     donation.rewardTokenAmount,
  //     donation.rewardStreamStart,
  //     donation.rewardStreamEnd,
  //     donation.cliff,
  //   );
  //   const claimableRewardTokenAmount = calculateClaimableRewardTokenAmount(
  //     donation.rewardTokenAmount,
  //     lockedRewardTokenAmount,
  //   );

  //   lockedTokens += lockedRewardTokenAmount || 0;
  //   availableToClaim += claimableRewardTokenAmount || 0;
  // });

  return (
    <div className="container mx-auto flex flex-col gap-8 my-8">
      {/* Project Information and Overview */}
      <div className="p-6 flex lg:flex-row flex-col bg-neutral-800 rounded-lg gap-14">
        {/* Project Banner */}
        <div
          className="lg:w-1/2 w-full h-[251px] bg-cover bg-center rounded-3xl relative"
          style={{
            backgroundImage: `url('${project?.image}')`,
          }}
        >
          <div className="flex flex-col absolute bottom-[5%] left-[5%] md:bottom-[10%] md:left-[10%] gap-2">
            <div className="border rounded-md bg-neutral-800 p-1 block w-fit">
              <IconABC size={40} />
            </div>
            <div className="flex flex-col text-neutral-200 gap-2">
              <h1 className="text-2xl md:text-[41px] font-bold leading-10">
                {project?.title}
              </h1>
            </div>
          </div>
        </div>

        {/* Project Info */}
        <div className="flex flex-col gap-4 font-redHatText lg:w-1/2 w-full">
          <div className="flex justify-between p-2">
            <div className="flex gap-2">
              <IconTotalSupply size={24} />
              <span className="text-neutral-300 font-medium">Total supply</span>
            </div>
            <span className="font-medium text-neutral-200">
              {formatAmount(Number(tokenDetails?.issuance_supply)) || "---"}{" "}
              {project?.abc?.tokenTicker}
            </span>
          </div>

          <div className="flex justify-between p-2">
            <div className="flex gap-2">
              <IconTotalDonars size={24} />
              <span className="text-neutral-300 font-medium">
                Total supporters
              </span>
            </div>
            <span className="font-medium text-neutral-200">
              {totalSupporters}
            </span>
          </div>

          {!isSafeAccount && (
            <div className="flex flex-col md:flex-row gap-3 justify-between p-[16px_8px] bg-neutral-700/50 rounded-md">
              <div className="flex gap-2">
                <IconTotalDonations size={24} />
                <span className="font-medium text-neutral-200">
                  Total received
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium text-neutral-200">
                  ~ ${formatAmount(totalContributions * Number(POLPrice)) || 0}
                </span>
                <span className="font-medium text-neutral-300">
                  {formatAmount(totalContributions)} POL
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Donations Breakdown */}
      <div className="bg-neutral-800 rounded-xl flex flex-col gap-8 md:p-6">
        <div className="flex flex-col gap-4 w-full p-8 border rounded-xl">
          <h2 className="text-2xl font-bold">
            Your tokens & contributions breakdown
          </h2>
          <ProjectUserDonationTable
            userId={parseInt(userId as string)}
            project={project}
            totalContributions={totalUserContributions}
          />
        </div>

        {/* Claim Rewards */}
        {totalTokensReceived >= 0 ? (
          <div className="flex flex-col gap-4 font-redHatText w-full p-8 border rounded-xl">
            <div className="flex justify-between p-2">
              <div className="flex gap-2">
                <IconMinted size={24} />
                <span className="text-neutral-200 font-medium">
                  Total tokens received
                </span>
              </div>
              <span className="font-medium text-neutral-300">
                {formatAmount(totalTokensReceived)} {project?.abc?.tokenTicker}
              </span>
            </div>

            <div className="flex justify-between p-2">
              <div className="flex gap-2">
                <IconLockedTokens size={24} />
                <span className="text-neutral-200 font-medium">
                  Locked tokens
                </span>
              </div>
              <span className="font-medium text-neutral-300">
                {formatAmount(lockedTokens)} {project?.abc?.tokenTicker}
              </span>
            </div>

            <div className="flex flex-col md:flex-row gap-3 justify-between p-[16px_8px] bg-neutral-700/50 rounded-md">
              <div className="flex gap-2 items-center">
                <IconAvailableTokens size={32} />
                <span className="font-medium text-neutral-300 text-2xl">
                  Available to claim
                </span>
              </div>
              <span className="text-2xl">
                {formatAmount(availableToClaim)} {project?.abc?.tokenTicker}
              </span>
            </div>

                         <button
               className="bg-peach-400 text-white px-4 py-2 rounded-md disabled:opacity-50"
               onClick={() => claim.mutateAsync()}
               disabled={!isTokenClaimable || claim.isPending}
             >
               {claim.isPending ? "Claiming..." : "Claim Tokens"}
             </button>
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default RewardsBreakDown;

"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CopyButton } from "@/components/shared/CopyButton";
import { ArrowUpRight } from "lucide-react";
import { handleImageUrl } from "@/helpers/image";
import { IProject } from "@/types/project.type";
import {
  useClaimRewards,
  useIsActivePaymentReceiver,
  useReleasableForStream,
} from "@/hooks/useClaimRewards";
import { toast } from "sonner";
import { getPaymentAddresses } from "@/helpers/getPaymentAddresses";
import { usePrivy } from "@privy-io/react-auth";
import { Address } from "viem";
import { shortenAddressLarger } from "@/helpers/address";
import { useVestingSchedules } from "@/hooks/useVestingSchedules";
import { useCountdown } from "@/hooks/useCountdown";
import { useDonorContext } from "@/contexts/donor.context";
import { useReleasedForStream } from "@/hooks/useClaimRewards";
import { ethers } from "ethers";
import { useGetCurrentTokenPrice } from "@/hooks/useGetCurrentTokenPrice";
import { useTokenPrice } from "@/hooks/useTokens";
import { formatDateMonthDayYear } from "@/helpers/date";

interface ProjectSupportedCardProps {
  project: IProject;
  inWallet: number;
}

export default function ProjectSupportedCard({
  project,
  inWallet
}: ProjectSupportedCardProps) {
  const [isTokenClaimable, setIsTokenClaimable] = useState(false);
  const { user: privyUser } = usePrivy();

  const address = privyUser?.wallet?.address as Address;

  const [paymentAddresses, setPaymentAddresses] = useState<{
    paymentRouterAddress: string | null;
    paymentProcessorAddress: string | null;
  }>({
    paymentRouterAddress: null,
    paymentProcessorAddress: null,
  });

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
  }, [project.id, project]);

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

  const { data: vestingSchedules } = useVestingSchedules();

  const allVestingData =
    vestingSchedules?.map((schedule, index) => {
      const nameLower = schedule.name.toLowerCase();
      const seasonMatch = nameLower.match(/season (\d+)/);
      const season = seasonMatch ? parseInt(seasonMatch[1]) : 0;

      return {
        name: nameLower.replace(/\s+/g, "-"),
        displayName: schedule.name,
        type: (nameLower.includes("projects") ? "team" : "supporters") as
          | "team"
          | "supporters",
        season,
        order: index,
        start: new Date(schedule.start),
        cliff: new Date(schedule.cliff),
        end: new Date(schedule.end),
      };
    }) || [];

  let unlockDate = allVestingData.find(
    (period) =>
      period.type === "supporters" && period.season === (project.seasonNumber || 2)
  )?.cliff;

  const [days, hours, minutes, seconds] = useCountdown(unlockDate || "");

  const inWalletStr = inWallet.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  function formatValue(value: number) {
    const valueStr = value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    const [whole, frac] = valueStr.split(".");
    return { whole, frac };
  }

  const { donationsGroupedByProject } = useDonorContext();

  const released = useReleasedForStream({
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

  const [lockedTokens, setLockedTokens] = useState(0);

  const projectDonations =
    donationsGroupedByProject[Number(project.id)] || [];

  const totalTokensReceived = projectDonations.reduce(
    (sum: number, donation: any) => sum + (donation.rewardTokenAmount || 0),
    0,
  );

  const availableToClaim = releasable.data
    ? Number(ethers.formatUnits(releasable.data, 18))
    : 0;

  const tokensAlreadyClaimed = released.data
    ? Number(ethers.formatUnits(released.data, 18))
    : 0;

  useEffect(() => {
    setLockedTokens(totalTokensReceived - tokensAlreadyClaimed);
  }, [totalTokensReceived, tokensAlreadyClaimed]);

  // token price
  const { currentTokenPrice } = useGetCurrentTokenPrice(
    project.abc?.issuanceTokenAddress,
  );
  const { data: POLPrice } = useTokenPrice();
  const tokenPriceUsd = (currentTokenPrice || 0) * Number(POLPrice || 0);

  const totalAmountPerToken = inWallet + lockedTokens + availableToClaim;
  const totalAmountPerTokenInUSD = totalAmountPerToken * tokenPriceUsd;

  // Update claimable state based on availability
  useEffect(() => {
    setIsTokenClaimable(
      !!availableToClaim && availableToClaim > 0 &&
      !!isActivePaymentReceiver.data,
    );
  }, [availableToClaim, isActivePaymentReceiver.data]);

  // Aliases for UI compatibility
  const locked = lockedTokens;
  const claimable = availableToClaim;

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-6 items-start mb-8">
      <div className="col-span-12 md:col-span-4 h-60 md:h-40 relative">
        <Image
          src={handleImageUrl(project.image || "")}
          alt={project.title || ""}
          width={200}
          height={200}
          className="rounded-2xl w-full h-full object-center object-fill"
        />

        <div className="absolute top-0 right-0 w-full h-full bg-black/80 rounded-2xl"></div>

        <div className="absolute top-0 px-8 left-0 w-full h-full flex flex-col justify-center">
          <div className="flex gap-2 items-center">
            <Image
              src={handleImageUrl(project.abc?.icon || "")}
              alt={project.abc?.tokenName || ""}
              width={24}
              height={24}
              className="rounded-full bg-white/10 h-6 w-6"
            />
            <span className="text-white font-anton text-center font-medium text-[30px] leading-normal">
              ${project.abc?.tokenTicker}
            </span>
            <span className="text-white/50 font-anton shrink-0 text-center font-medium text-[30px]">
              {project?.title?.slice(0, 8)}...
            </span>
          </div>
          <div className="bg-black/50 w-full flex gap-2 justify-center items-center border-2 border-white/10 rounded-xl px-4 py-2 mb-2">
            <span className="text-white font-ibm-mono shrink-0 text-center font-medium text-base leading-normal">
              {shortenAddressLarger(project?.abc?.issuanceTokenAddress)}
            </span>
            <CopyButton
              text={project?.abc?.issuanceTokenAddress || ""}
              className="ml-2"
              iconClassName="w-4 h-4"
            />
            <Link
              href={`https://polygonscan.com/address/${project?.abc?.issuanceTokenAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2"
            >
              <ArrowUpRight className="w-5 h-5 text-white" />
            </Link>
          </div>

          {isTokenClaimable ? (
            <button
              className="flex justify-center rounded-xl bg-peach-400 text-neutral-800 px-4 py-2"
              disabled={!isTokenClaimable || claim.isPending}
              onClick={() => claim.mutateAsync()}
            >
              {isActivePaymentReceiver.isPending
                ? "Checking for tokens..."
                : claim.isPending
                ? "Claiming..."
                : "Claim Tokens"}
            </button>
          ) : (
            <div className="rounded-xl bg-qacc-gray-light text-neutral-800 px-2 py-2 text-center font-medium text-base">
              UNLOCK IN {days}d {hours}h {minutes}m {seconds}s
            </div>
          )}
        </div>
      </div>

      <div className="col-span-12 md:col-span-8 py-5 px-6 bg-white/[5%] rounded-3xl">
        <div className="hidden overflow-x-auto overflow-y-hidden md:flex flex-nowrap flex-row justify-center items-center flex-1 gap-8 lg:gap-10">
          <h3 className="text-[22px] font-anton text-right text-white/30 flex items-end gap-2 leading-none">
            <span className="">
              YOUR <br />${project.abc?.tokenTicker}
            </span>
          </h3>
          <div className="space-y-0.1">
            <div className="text-white text-2xl text-center font-bold">
              {inWallet > 0 ? (
                <>
                  {formatValue(inWallet).whole}
                  <span className="text-base align-bottom">
                    .{formatValue(inWallet).frac}
                  </span>
                </>
              ) : (
                <span className="text-white/30">0</span>
              )}
            </div>
            <div className="text-white/30 text-center font-medium text-[13px] leading-normal">
              In Wallet
            </div>
          </div>

          {/* Total Raised */}
          <div className="space-y-0.1">
            <div className="text-white text-center text-2xl font-bold">
              {locked > 0 ? (
                <>
                  {formatValue(locked).whole}
                  <span className="text-base align-bottom">
                    .{formatValue(locked).frac}
                  </span>
                </>
              ) : (
                <span className="text-white/30">0</span>
              )}
            </div>
            <div className="text-white/30 text-center font-medium text-[13px] leading-normal">
              Locked ${project.abc?.tokenTicker}
            </div>
          </div>

          <div className="space-y-0.1">
            <div className="text-white text-center text-2xl font-bold">
              {claimable > 0 ? (
                <>
                  {formatValue(claimable).whole}
                  <span className="text-base align-bottom">
                    .{formatValue(claimable).frac}
                  </span>
                </>
              ) : (
                <span className="text-white/30">0</span>
              )}
            </div>
            <span className="text-white/30 text-center font-medium text-[13px] leading-normal flex items-center justify-center gap-0.5">
              Available to claim
            </span>
          </div>

          <div className="space-y-0.1">
            <div className="text-white text-center text-2xl font-bold">
              {totalAmountPerToken > 0 ? (
                <>
                  {formatValue(totalAmountPerToken).whole}
                  <span className="text-base align-bottom">.{formatValue(totalAmountPerToken).frac}</span>
                </>
              ) : (
                <span className="text-white/30">0</span>
              )}
            </div>
            <span className="text-white/30 text-center font-medium text-[13px] leading-normal flex items-center justify-center gap-0.5">
              Your Total Tokens
            </span>
          </div>

          <div className="space-y-0.1">
            <div className="text-white text-center text-2xl font-bold">
              {totalAmountPerTokenInUSD > 0 ? (
                <>
                  {formatValue(totalAmountPerTokenInUSD).whole}
                  <span className="text-base align-bottom">.{formatValue(totalAmountPerTokenInUSD).frac}</span>
                </>
              ) : (
                <span className="text-white/30">0</span>
              )}
            </div>
            <span className="text-white/30 text-center font-medium text-[13px] leading-normal flex items-center justify-center gap-0.5">
              Value in USD
            </span>
          </div>

          <div className="space-y-0.1">
            <div className="text-white text-center text-2xl font-bold">
              {" "}
              <span className="text-white/30">0</span>
            </div>
            <span className="text-white/30 text-center font-medium text-[13px] leading-normal flex items-center justify-center gap-0.5">
              ROI
            </span>
          </div>
        </div>

        {/* Mobile View */}
        <div className=" flex flex-col md:hidden">
          <h3 className="text-[22px] font-anton text-center text-white/30 uppercase leading-none mb-4">
            YOUR{" "}
            <span className="text-peach-400">${project.abc?.tokenTicker}</span>{" "}
            Tokens
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-0.1">
              <div className="text-white text-center text-2xl font-bold">
                {totalAmountPerToken > 0 ? (
                  <>
                    {formatValue(totalAmountPerToken).whole}
                    <span className="text-base align-bottom">.{formatValue(totalAmountPerToken).frac}</span>
                  </>
                ) : (
                  <span className="text-white/30">0</span>
                )}
              </div>
              <span className="text-white/30 text-center font-medium text-[11px] md:text-[13px] leading-normal flex items-center justify-center gap-0.5">
                Your Total Tokens
              </span>
            </div>

            <div className="space-y-0.1">
              <div className="text-white text-center text-2xl font-bold">
                {totalAmountPerTokenInUSD > 0 ? (
                  <>
                    {formatValue(totalAmountPerTokenInUSD).whole}
                    <span className="text-base align-bottom">.{formatValue(totalAmountPerTokenInUSD).frac}</span>
                  </>
                ) : (
                  <span className="text-white/30">0</span>
                )}
              </div>
              <span className="text-white/30 text-center font-medium text-[11px] md:text-[13px] leading-normal flex items-center justify-center gap-0.5">
                Value in USD
              </span>
            </div>

            <div className="space-y-0.1">
              <div className="text-white text-center text-2xl font-bold">
                {" "}
                <span className="text-white/30">0</span>
              </div>
              <span className="text-white/30 text-center font-medium text-[11px] md:text-[13px] leading-normal flex items-center justify-center gap-0.5">
                ROI
              </span>
            </div>

            <div className="space-y-0.1">
              <div className="text-white text-2xl text-center font-bold">
                {inWallet > 0 ? (
                  <>
                    {formatValue(inWallet).whole}
                    <span className="text-base align-bottom">
                      .{formatValue(inWallet).frac}
                    </span>
                  </>
                ) : (
                  <span className="text-white/30">0</span>
                )}
              </div>
              <div className="text-white/30 text-center font-medium text-[11px] md:text-[13px] leading-normal">
                In Wallet
              </div>
            </div>
            <div className="space-y-0.1">
              <div className="text-white text-center text-2xl font-bold">
                {locked > 0 ? (
                  <>
                    {formatValue(locked).whole}
                    <span className="text-base align-bottom">
                      .{formatValue(locked).frac}
                    </span>
                  </>
                ) : (
                  <span className="text-white/30">0</span>
                )}
              </div>
              <div className="text-white/30 text-center font-medium text-[11px] md:text-[13px] leading-normal">
                Locked ${project.abc?.tokenTicker}
              </div>
            </div>

            <div className="space-y-0.1">
              <div className="text-white text-center text-2xl font-bold">
                {claimable > 0 ? (
                  <>
                    {formatValue(claimable).whole}
                    <span className="text-base align-bottom">
                      .{formatValue(claimable).frac}
                    </span>
                  </>
                ) : (
                  <span className="text-white/30">0</span>
                )}
              </div>
              <span className="text-white/30 text-center font-medium text-[11px] md:text-[13px] leading-normal flex items-center justify-center gap-0.5">
                Available to claim
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto mt-8">
          <table className="min-w-full table-fixed whitespace-nowrap">
            <thead className="py-8 border-y border-white/5">
              {/* Label Row */}
              <tr className="text-[10px] uppercase text-qacc-gray-light/60">
                <th className="w-[120px] px-4 py-2 text-left">
                  Contributions Date
                </th>
                <th className="w-[120px] px-4 py-2 text-right">Price</th>
                <th className="w-[120px] px-4 py-2 text-right">Amount</th>
                <th className="w-[120px] px-4 py-2 text-right">Token</th>
                <th className="w-[250px] px-4 py-2 text-right">
                  Vesting Stream From → Until
                </th>
              </tr>
            </thead>
            <tbody className="divide-y  divide-white/5">
              {projectDonations.map((donation: any) => (
                <tr key={donation.id} className="text-sm font-bold font-ibm-mono">
                  <td className="w-[120px] px-4 py-2 text-left">
                    {formatDateMonthDayYear(donation.createdAt)}
                  </td>
                  <td className="w-[120px] px-4 py-2 text-right">
                    {donation.valueUsd ? `$${donation.valueUsd.toFixed(2)}` : "$0.00"}
                  </td>
                  <td className="w-[120px] px-4 py-2 text-right">
                    {donation.amount?.toFixed(2)} POL
                  </td>
                  <td className="w-[120px] px-4 py-2 text-right">
                    {donation.rewardTokenAmount?.toFixed(2) || 0} {project.abc?.tokenTicker}
                  </td>
                  <td className="w-[250px] px-4 py-2 text-right">
                    {donation.rewardStreamStart && donation.rewardStreamEnd ? (
                      `${formatDateMonthDayYear(donation.rewardStreamStart)} → ${formatDateMonthDayYear(donation.rewardStreamEnd)}`
                    ) : (
                      "---"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

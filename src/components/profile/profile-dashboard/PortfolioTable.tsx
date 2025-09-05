"use client";

import { useState, useEffect, useCallback } from "react";
import { Address } from "viem";
import Image from "next/image";
import { handleImageUrl } from "@/helpers/image";
import type { IProject } from "@/types/project.type";
import { usePrivy } from "@privy-io/react-auth";
import {
  useClaimRewards,
  useIsActivePaymentReceiver,
  useReleasableForStream,
  useReleasedForStream,
} from "@/hooks/useClaimRewards";
import { useDonorContext } from "@/contexts/donor.context";
import { useVestingSchedules } from "@/hooks/useVestingSchedules";
import { formatDateMonthDayYear } from "@/helpers/date";
import { Button } from "@/components/ui/button";
import { ethers } from "ethers";
import { useGetCurrentTokenPrice } from "@/hooks/useGetCurrentTokenPrice";
import { useTokenPrice } from "@/hooks/useTokens";

export interface PortfolioTableRowProps {
  project: IProject;
  inWallet: number;
  onTotalUSDChange?: (value: number) => void;
}

function PortfolioTableRow({ project, inWallet, onTotalUSDChange }: PortfolioTableRowProps) {
  const { user } = usePrivy();
  const address = user?.wallet?.address as Address;
  const { donationsGroupedByProject } = useDonorContext();

  const [lockedTokens, setLockedTokens] = useState(0);

  const proccessorAddress = project.abc?.paymentProcessorAddress || "";
  const router = project.abc?.paymentRouterAddress || "";

  const projectDonations = donationsGroupedByProject[Number(project.id)] || [];

  const totalTokensReceived = projectDonations.reduce(
    (sum: any, donation: any) => sum + (donation.rewardTokenAmount || 0),
    0,
  );
  const totalCostUsd = projectDonations.reduce(
    (sum: number, donation: any) => sum + (donation.valueUsd || 0),
    0,
  );

  const releasable = useReleasableForStream({
    paymentProcessorAddress: proccessorAddress,
    client: router,
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
    paymentProcessorAddress: project?.abc?.paymentProcessorAddress!,
    client: project?.abc?.paymentRouterAddress!,
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

  const availableToClaim = releasable.data
    ? Number(ethers.formatUnits(releasable.data, 18))
    : 0;

  const tokensAlreadyClaimed = released.data
    ? Number(ethers.formatUnits(released.data, 18))
    : 0;

  const { currentTokenPrice } = useGetCurrentTokenPrice(
    project.abc?.issuanceTokenAddress
  );
  const { data: POLPrice } = useTokenPrice();

  const tokenPriceUsd = (currentTokenPrice || 0) * Number(POLPrice || 0);

  const averagePurchasePrice = totalTokensReceived > 0 ? totalCostUsd / totalTokensReceived : 0;

  const returnUsd = (tokenPriceUsd - averagePurchasePrice) * inWallet;
  const returnPercent = averagePurchasePrice > 0 ? (returnUsd / (averagePurchasePrice * inWallet)) * 100 : 0;

  const isTokenClaimable =
    releasable.data !== undefined && availableToClaim > 0;

  const isActive = useIsActivePaymentReceiver({
    paymentProcessorAddress: proccessorAddress,
    client: router,
    receiver: address,
  });
  const { claim } = useClaimRewards({
    paymentProcessorAddress: proccessorAddress,
    paymentRouterAddress: router,
    onSuccess: () => releasable.refetch(),
  });

  const { data: schedules } = useVestingSchedules();

  const allVestingData =
    schedules?.map((schedule, index) => {
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
      period.type === "supporters" && period.season === project.seasonNumber
  )?.cliff;

  if (!unlockDate) {
    unlockDate = allVestingData.find(
      (period) => period.type === "supporters" && period.season === 2
    )?.cliff;
  }

  useEffect(() => {
    setLockedTokens(totalTokensReceived - tokensAlreadyClaimed);
    console.log(tokensAlreadyClaimed);
  }, [releasable, released, totalTokensReceived]);

  // This is the total amount of a token in the wallet, locked, and available to claim
  const totalAmountPerToken = inWallet + lockedTokens + availableToClaim;
  // This is the total amount of a token in the wallet, locked, and available to claim in USD
  const totalAmountPerTokenInUSD = totalAmountPerToken * tokenPriceUsd;

  useEffect(() => {
    if (onTotalUSDChange) {
      onTotalUSDChange(totalAmountPerTokenInUSD);
    }
  }, [totalAmountPerTokenInUSD, onTotalUSDChange]);

  // useEffect(() => {
  //   setIsTokenClaimable(isActivePaymentReceiver.data || false);
  // }, [isActivePaymentReceiver.data]);

  return (
    <tr className="hover:bg-white/5 font-bold">
      <td className="py-4 flex items-center space-x-1 md:space-x-3">
        <Image
          src={handleImageUrl(
            project.abc?.icon ||
              "Qmeb6CzCBkyEkAhjrw5G9GShpKiVjUDaU8F3Xnf5bPHtm4"
          )}
          alt={project.title || ""}
          width={36}
          height={36}
          className="rounded-full  w-6 h-6 md:w-9 md:h-9"
        />
        <div className="flex flex-col md:flex-row md:gap-1">
          <p className="text-white text-sm md:text-xl">{project.title}</p>
          <p className="text-qacc-gray-light/40 text-sm md:text-xl font-bold">
            ${project.abc?.tokenTicker}
          </p>
        </div>
      </td>
      {/* Your Return */}
      <td className="py-4 px-4 text-xs md:text-sm text-[#6DC28F] font-ibm-mono font-bold text-end">
        {returnPercent >= 0 ? "+" : ""}{returnPercent.toFixed(2)}%
      </td>
      {/* In Wallet */}
      <td className="py-4 px-4 text-xs md:text-sm text-white font-ibm-mono font-bold text-end">
        {inWallet.toFixed(2)}
      </td>
      {/* Locked */}
      <td className="py-4 px-4 text-xs md:text-sm text-[#65D1FF] font-ibm-mono font-bold text-end">
        {lockedTokens.toFixed(2)}
      </td>
      {/* Available to Claim */}
      <td className="py-4 px-4 text-xs md:text-sm text-white/30 font-ibm-mono font-bold text-end">
        {isActive.data && availableToClaim > 0 ? (
          <Button size="sm" onClick={() => claim.mutateAsync()}>
            Claim
          </Button>
        ) : unlockDate ? (
          `${formatDateMonthDayYear(unlockDate.toISOString())}`
        ) : (
          "---"
        )}
      </td>
      {/* Total Tokens */}
      <td className="py-4 px-4 text-xs md:text-sm text-end text-white/30 font-bold font-ibm-mono">
        ~$
        {totalAmountPerTokenInUSD.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
        &nbsp;
        <span className="text-white font-semibold">
          {totalAmountPerToken.toFixed(2)} {project.abc?.tokenTicker}
        </span>
      </td>
    </tr>
  );
}

interface PortfolioTableProps {
  rows: { project: IProject; inWallet: number }[];
}
export const PortfolioTable: React.FC<PortfolioTableProps> = ({ rows }) => {
  const [rowTotalsUSD, setRowTotalsUSD] = useState<Record<number, number>>({});

  const handleRowTotalChange = useCallback((projectId: number, value: number) => {
    setRowTotalsUSD((prev) => ({ ...prev, [projectId]: value }));
  }, []);

  const portfolioTotalUSD = Object.values(rowTotalsUSD).reduce(
    (sum, val) => sum + val,
    0
  );

  return (
    <div className="bg-white/[7%]  rounded-3xl p-8 mt-8">
      <div className="overflow-x-auto w-full">
        <table className="w-full table-auto min-w-lg  whitespace-nowrap">
          <thead>
            <tr className="items-center pb-8 mb-8">
              <th colSpan={4}>
                <h2 className="text-[32px] md:text-[40px] text-left font-anton tracking-wide text-white">
                  Portfolio
                </h2>
              </th>
              <th className="pb-2 px-4 text-end">
                <button className="bg-peach-400 text-[10px] uppercase font-bold text-black px-3 py-1 rounded-lg">
                  Claim All Available
                </button>
              </th>
              <th className="pb-2 px-4 text-end">
                <span className="text-qacc-gray-light/60 text-xs uppercase mr-1.5">
                  Total
                </span>
                <span className="text-white text-sm font-ibm-mono font-semibold mr-1">
                  ~${portfolioTotalUSD.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </th>
            </tr>
            {/* Label Row */}
            <tr className="text-[10px] uppercase text-qacc-gray-light/60 border-b border-white/5">
              <th className="w-[340px] pb-2 text-left">Project</th>
              <th className="w-[120px] pb-2 px-4 text-end">Your Return</th>
              <th className="w-[120px] pb-2 px-4 text-end">In Wallet</th>
              <th className="w-[120px] pb-2 px-4 text-end">Locked</th>
              <th className="w-[120px] pb-2 px-4 text-end">
                Available to Claim
              </th>
              <th className="w-[250px] pb-2 px-4 text-end">
                <div className="flex items-center justify-end space-x-1.5">
                  <span>~$$$</span>
                  <span className="text-qacc-gray-light/60 text-[10px] uppercase">
                    Your Total Tokens{" "}
                    <span className="text-peach-400 text-[10px]">↓</span>
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y  divide-white/5">
            {rows.map((row) => (
              <PortfolioTableRow
                key={row.project.id}
                project={row.project}
                inWallet={row.inWallet}
                onTotalUSDChange={(value) =>
                  handleRowTotalChange(Number(row.project.id), value)
                }
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

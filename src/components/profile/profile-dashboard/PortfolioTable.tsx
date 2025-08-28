"use client";

import { Address } from "viem";
import Image from "next/image";
import { handleImageUrl } from "@/helpers/image";
import type { IProject } from "@/types/project.type";
import { usePrivy } from "@privy-io/react-auth";
import { useClaimRewards, useIsActivePaymentReceiver, useReleasableForStream } from "@/hooks/useClaimRewards";
import { useVestingSchedules } from "@/hooks/useVestingSchedules";
import { formatDateMonthDayYear } from "@/helpers/date";
import { Button } from "@/components/ui/button";
import { ethers } from "ethers";

// Types for row props
export interface PortfolioTableRowProps {
  project: IProject;
  totalRewardTokens: number;
  inWallet: number;
  locked: number;
}

// Row component encapsulating claim/unlock logic
function PortfolioTableRow({ project, totalRewardTokens, inWallet, locked }: PortfolioTableRowProps) {
  const { user } = usePrivy();
  const address = user?.wallet?.address as Address;

  const proccessorAddress = project.abc?.paymentProcessorAddress || "";
  const router = project.abc?.paymentRouterAddress || "";

  const releasable = useReleasableForStream({ paymentProcessorAddress: proccessorAddress, client: router, receiver: address, streamId: BigInt(2) });
  const isActive = useIsActivePaymentReceiver({ paymentProcessorAddress: proccessorAddress, client: router, receiver: address });
  const { claim } = useClaimRewards({ paymentProcessorAddress: proccessorAddress, paymentRouterAddress: router, onSuccess: () => releasable.refetch() });

  const { data: schedules } = useVestingSchedules();
 
  const claimable = releasable.data ? Number(ethers.formatUnits(releasable.data, 18)) : 0;

  // Parse all vesting schedules
  //TODO: Move to a helper function
  const allVestingData = schedules?.map((schedule, index) => {
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
    period => period.type === "supporters" && period.season === project.seasonNumber
  )?.cliff;

  // If no cliff date found for the project's season, fallback to season 2
  if (!unlockDate) {
    unlockDate = allVestingData.find(
      period => period.type === "supporters" && period.season === 2
    )?.cliff;
  }
    



  return (
    <tr className="hover:bg-white/5 font-bold">
      {/* Project cell */}
      <td className="py-4 flex items-center space-x-3">
        <Image
          src={handleImageUrl(
            project.abc?.icon ||
              "Qmeb6CzCBkyEkAhjrw5G9GShpKiVjUDaU8F3Xnf5bPHtm4"
          )}
          alt={project.title || ""}
          width={36}
          height={36}
          className="rounded-full"
        />
        <div className="flex gap-1">
          <p className="text-white text-xl">{project.title}</p>
          <p className="text-qacc-gray-light/40 text-xl font-bold">
            ${project.abc?.tokenTicker}
          </p>
        </div>
      </td>
      {/* Your Return */}
      <td className="py-4 px-4 text-sm text-[#6DC28F] font-ibm-mono font-bold text-end">+17.09%</td>
      {/* In Wallet */}
      <td className="py-4 px-4 text-sm text-white font-ibm-mono font-bold text-end">{inWallet.toFixed(2)}</td>
      {/* Locked */}
      <td className="py-4 px-4 text-sm text-[#65D1FF] font-ibm-mono font-bold text-end">{locked.toFixed(2)}</td>
      {/* Available to Claim */}
      <td className="py-4 px-4 text-sm text-white/30 font-ibm-mono font-bold text-end">
        {isActive.data && claimable > 0 ? (
          <Button size="sm" onClick={() => claim.mutateAsync()}>Claim</Button>
        ) : unlockDate ? (
          `${formatDateMonthDayYear(unlockDate.toISOString())}`
        ) : (
          "---"
        )}
      </td>
      {/* Total Tokens */}
      <td className="py-4 px-4 text-sm text-end text-white/30 font-bold font-ibm-mono">
        ~$1,411.32&nbsp;<span className="text-white font-semibold">{totalRewardTokens.toFixed(2)} {project.abc?.tokenTicker}</span>
      </td>
    </tr>
  );
}

interface PortfolioTableProps {
  rows: PortfolioTableRowProps[];
}
export const PortfolioTable: React.FC<PortfolioTableProps> = ({ rows }) => {
  return (
    <div className="bg-white/[7%]  rounded-3xl p-8 mt-8">
      <div className="overflow-x-auto w-full">
        <table className="w-full table-auto min-w-lg  whitespace-nowrap">
          <thead>
            <tr className="items-center pb-8 mb-8">
              <th colSpan={4}>
                <h2 className="text-[40px] text-left font-anton tracking-wide text-white">
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
                  ~$1,706.57
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
            {/* Render each row via props */}
            {rows.map((row) => (
              <PortfolioTableRow
                key={row.project.id}
                project={row.project}
                totalRewardTokens={row.totalRewardTokens}
                inWallet={row.inWallet}
                locked={row.locked}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

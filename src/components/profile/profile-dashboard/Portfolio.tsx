"use client";

import { useState, useEffect } from "react";
import { useDonorContext } from "@/contexts/donor.context";
import { usePrivy } from "@privy-io/react-auth";
import { fetchEVMTokenBalances } from "@/helpers/token";
import { useVestingSchedules } from "@/hooks/useVestingSchedules";
import { PortfolioTable, PortfolioTableRowProps } from "./PortfolioTable";
import ProjectSupportedCard from "./ProjectSupportedCard";
import type { IProject } from "@/types/project.type";

export default function Portfolio() {
  const { donationsGroupedByProject } = useDonorContext();
  const { user } = usePrivy();
  const userAddress = user?.wallet?.address;
  const [balances, setBalances] = useState<Record<string, number>>({});
  const { data: schedules } = useVestingSchedules();

  useEffect(() => {
    if (!userAddress) return;
    const tokens = Object.values(donationsGroupedByProject).map((donations) => {
      const project = donations[0].project as IProject;
      return {
        address: project.abc?.issuanceTokenAddress as string,
        decimals: 18,
      };
    });
    fetchEVMTokenBalances(tokens, userAddress)
      .then((results: any[]) => {
        const map = results.reduce(
          (acc, r) => ({ ...acc, [r.address]: r.balance }),
          {} as Record<string, number>
        );
        setBalances(map);
      })
      .catch(console.error);
  }, [donationsGroupedByProject, userAddress]);

  const cardData = Object.entries(donationsGroupedByProject).map(
    ([projectId, donations]) => {
      const project = donations[0].project as IProject;
          const totalRewardTokens = donations.reduce(
            (sum: number, d: any) => sum + (d.rewardTokenAmount || 0),
            0
          );
          const inWallet =
            balances[project.abc!.issuanceTokenAddress as string] || 0;
          const locked = totalRewardTokens - inWallet;
          const claimable = 0;
      return {
        key: projectId,
        project: project,
        inWallet: inWallet,
        locked: locked,
        claimable: claimable,
      };
    }
  );

  const rows: PortfolioTableRowProps[] = Object.entries(
    donationsGroupedByProject
  ).map(([projectId, donations]) => {
    const project = donations[0].project as IProject;
    const totalRewardTokens = donations.reduce(
      (sum: number, d: any) => sum + (d.rewardTokenAmount || 0),
      0
    );
    const inWallet =
      balances[project.abc!.issuanceTokenAddress as string] || 0;
    const locked = totalRewardTokens - inWallet;
    return { project, totalRewardTokens, inWallet, locked };
  });

  return (
    <div className="space-y-12">
 
      <PortfolioTable rows={rows} />

      <div className="">
        {cardData.map((card) => (
          <ProjectSupportedCard
            key={card.key}
            project={card.project}
            inWallet={card.inWallet}
            locked={card.locked}
            claimable={card.claimable}
          />
        ))}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';

import { usePrivy } from '@privy-io/react-auth';

import { SmartUSDCTransfer } from '@/components/shared/SmartUSDCTransfer';
import { useDonorContext } from '@/contexts/donor.context';
import { fetchEVMTokenBalances } from '@/helpers/token';
import type { IProject } from '@/types/project.type';

import { PortfolioTable } from './PortfolioTable';
import ProjectSupportedCard from './ProjectSupportedCard';

export default function Portfolio() {
  const { donationsGroupedByProject } = useDonorContext();
  const { user } = usePrivy();
  const userAddress = user?.wallet?.address;
  const [balances, setBalances] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!userAddress) return;
    const tokens = Object.values(donationsGroupedByProject).map(donations => {
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

  const portfolioData = Object.entries(donationsGroupedByProject).map(
    ([projectId, donations]) => {
      const project = donations[0].project as IProject;
      const inWallet =
        balances[project.abc!.issuanceTokenAddress as string] || 0;
      return {
        project: project,
        inWallet: inWallet,
      };
    }
  );

  return (
    <div className='space-y-12'>
      <SmartUSDCTransfer />

      <PortfolioTable rows={portfolioData} />

      <div className=''>
        {portfolioData.map(card => (
          <ProjectSupportedCard
            key={card.project.id}
            project={card.project}
            inWallet={card.inWallet}
          />
        ))}
      </div>
    </div>
  );
}

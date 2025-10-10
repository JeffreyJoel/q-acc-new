'use client';

import { useEffect, useMemo, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { usePrivy } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import { Address } from 'viem';

import { CopyButton } from '@/components/shared/CopyButton';
import { useDonorContext } from '@/contexts/donor.context';
import { formatPercentageChange } from '@/helpers';
import { shortenAddressLarger } from '@/helpers/address';
import { formatDateMonthDayYear } from '@/helpers/date';
import { handleImageUrl } from '@/helpers/image';
import {
  useClaimRewards,
  useIsActivePaymentReceiver,
  useReleasableForStream,
} from '@/hooks/useClaimRewards';
import { useReleasedForStream } from '@/hooks/useClaimRewards';
import { useCountdown } from '@/hooks/useCountdown';
import { useGetCurrentTokenPrice } from '@/hooks/useGetCurrentTokenPrice';
import { useFetchAllRoundDetails } from '@/hooks/useRounds';
import { useTokenPrice } from '@/hooks/useTokens';
import { useVestingSchedules } from '@/hooks/useVestingSchedules';
import { IProject } from '@/types/project.type';
import { IEarlyAccessRound, IQfRound } from '@/types/round.type';

interface ProjectSupportedCardProps {
  project: IProject;
  inWallet: number;
  key: string;
}

export default function ProjectSupportedCard({
  project,
  inWallet,
  key,
}: ProjectSupportedCardProps) {
  const { user: privyUser } = usePrivy();
  const { donationsGroupedByProject } = useDonorContext();

  const address = privyUser?.wallet?.address as Address;

  const proccessorAddress = project.abc?.paymentProcessorAddress || '';
  const router = project.abc?.paymentRouterAddress || '';

  const releasable = useReleasableForStream({
    paymentProcessorAddress: proccessorAddress || '',
    client: router || '',
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
    paymentProcessorAddress: proccessorAddress || '',
    client: router || '',
    receiver: address,
  });

  const { claim, isSmartAccountReady } = useClaimRewards({
    paymentProcessorAddress: proccessorAddress || '',
    paymentRouterAddress: router || '',
    tokenContractAddress: project.abc?.issuanceTokenAddress,
    onSuccess: () => {
      // Immediately show unlock date
      setRecentlyClaimed(true);
      toast.success('Successfully Claimed Tokens');

      // Refetch actual data after 60 seconds
      setTimeout(() => {
        releasable.refetch();
        setRecentlyClaimed(false);
      }, 60000);
    },
    onError: error => {
      toast.error(error.message);
    },
  });

  const { data: vestingSchedules } = useVestingSchedules();
  const { data: allRoundData } = useFetchAllRoundDetails();

  const allVestingData =
    vestingSchedules?.map((schedule, index) => {
      const nameLower = schedule.name.toLowerCase();
      const seasonMatch = nameLower.match(/season (\d+)/);
      const season = seasonMatch ? parseInt(seasonMatch[1]) : 0;

      return {
        name: nameLower.replace(/\s+/g, '-'),
        displayName: schedule.name,
        type: (nameLower.includes('projects') ? 'team' : 'supporters') as
          | 'team'
          | 'supporters',
        season,
        order: index,
        start: new Date(schedule.start),
        cliff: new Date(schedule.cliff),
        end: new Date(schedule.end),
      };
    }) || [];

  const determineProjectRound = (
    project: IProject,
    roundData: (IEarlyAccessRound | IQfRound)[] | undefined
  ) => {
    if (!project || !roundData) return 1;

    if (project.qfRounds && project.qfRounds.length > 0) {
      const activeQfRound = project.qfRounds.find(round => round.isActive);
      if (activeQfRound) {
        const roundNumber =
          parseInt(activeQfRound.id) ||
          parseInt(activeQfRound.name.match(/\d+/)?.[0] || '1');
        return roundNumber;
      }
    }

    if (project.hasEARound) {
      return 1;
    }
  };

  const unlockDate = useMemo(() => {
    if (!allVestingData.length) return undefined;

    if (project?.seasonNumber === 1) {
      const projectRound = determineProjectRound(project, allRoundData);

      let dateFromRound = allVestingData.find(period => {
        const nameLower = period.name.toLowerCase();
        return (
          period.type === 'supporters' &&
          period.season === 1 &&
          (projectRound === 1
            ? nameLower.includes('round-1') || nameLower.includes('round 1')
            : nameLower.includes(`round-${projectRound}`) ||
              nameLower.includes(`round ${projectRound}`))
        );
      })?.cliff;

      if (!dateFromRound) {
        dateFromRound = allVestingData.find(
          period => period.type === 'supporters' && period.season === 1
        )?.cliff;
      }

      return dateFromRound;
    } else {
      return allVestingData.find(
        period =>
          period.type === 'supporters' &&
          period.season === (project?.seasonNumber || 2)
      )?.cliff;
    }
  }, [allVestingData, project, allRoundData]);

  const [days, hours, minutes, seconds] = useCountdown(unlockDate || '');

  // Check if unlock date has passed
  const hasUnlockDatePassed = useMemo(() => {
    if (!unlockDate) return false;
    return new Date() >= new Date(unlockDate);
  }, [unlockDate]);

  function formatValue(value: number) {
    const valueStr = value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    const [whole, frac] = valueStr.split('.');
    return { whole, frac };
  }

  const released = useReleasedForStream({
    paymentProcessorAddress: proccessorAddress || '',
    client: router || '',
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
  const [recentlyClaimed, setRecentlyClaimed] = useState(false);

  const projectDonations = donationsGroupedByProject[Number(project.id)] || [];

  const { data: polPrice } = useTokenPrice();

  const totalTokensReceived = projectDonations.reduce(
    (sum: number, donation: any) => sum + (donation.rewardTokenAmount || 0),
    0
  );

  // Calculate total POL donated and convert to USD using current POL price
  const totalPolDonated = projectDonations.reduce(
    (sum: number, donation: any) => sum + (donation.amount || 0),
    0
  );
  const totalCostUsd = totalPolDonated * Number(polPrice ?? 0);

  const availableToClaim = releasable.data
    ? Number(ethers.formatUnits(releasable.data, 18))
    : 0;

  const isTokenClaimable =
    releasable.data !== undefined && availableToClaim > 0;

  const tokensAlreadyClaimed = released.data
    ? Number(ethers.formatUnits(released.data, 18))
    : 0;

  useEffect(() => {
    setLockedTokens(totalTokensReceived - tokensAlreadyClaimed);
  }, [totalTokensReceived, tokensAlreadyClaimed]);

  // token price
  const { currentTokenPrice } = useGetCurrentTokenPrice(
    project.abc?.issuanceTokenAddress
  );
  const tokenPriceUsd = (currentTokenPrice ?? 0) * Number(polPrice ?? 0);

  const totalAmountPerToken = inWallet + lockedTokens + availableToClaim;
  const totalAmountPerTokenInUSD = totalAmountPerToken * tokenPriceUsd;

  // Return calculations - include locked tokens in ROI calculation
  const averagePurchasePrice =
    totalTokensReceived > 0 ? totalCostUsd / totalTokensReceived : 0;
  // Include locked tokens in ROI calculation (total position = wallet + locked tokens)
  const totalTokenPosition = inWallet + lockedTokens;
  const returnUsd =
    totalTokenPosition > 0
      ? (tokenPriceUsd - averagePurchasePrice) * totalTokenPosition
      : 0;
  const returnPercent =
    totalTokenPosition > 0 && averagePurchasePrice > 0
      ? (returnUsd / (averagePurchasePrice * totalTokenPosition)) * 100
      : 0;

  return (
    <div className='w-full grid grid-cols-1 md:grid-cols-12 gap-6 items-start mb-8'>
      <div className='col-span-12 md:col-span-4 h-60 md:h-40 relative'>
        <Image
          src={handleImageUrl(project.image || '')}
          alt={project.title || ''}
          width={200}
          height={200}
          className='rounded-2xl w-full h-full object-center object-fill'
        />

        <div className='absolute top-0 right-0 w-full h-full bg-black/80 rounded-2xl'></div>

        <div className='absolute top-0 px-8 left-0 w-full h-full flex flex-col justify-center'>
          <div className='flex gap-2 items-center'>
            <Image
              src={handleImageUrl(project.abc?.icon || '')}
              alt={project.abc?.tokenName || ''}
              width={24}
              height={24}
              className='rounded-full bg-white/10 h-6 w-6'
            />
            <span className='text-white font-anton text-center font-medium text-[30px] leading-normal'>
              ${project.abc?.tokenTicker}
            </span>
            <span className='text-white/50 font-anton shrink-0 text-center font-medium text-[30px]'>
              {project?.title?.slice(0, 8)}...
            </span>
          </div>
          <div className='bg-black/50 w-full flex gap-2 justify-center items-center border-2 border-white/10 rounded-xl px-4 py-2 mb-2'>
            <span className='text-white font-ibm-mono shrink-0 text-center font-medium text-base leading-normal'>
              {shortenAddressLarger(project?.abc?.issuanceTokenAddress)}
            </span>
            <CopyButton
              text={project?.abc?.issuanceTokenAddress || ''}
              className='ml-2'
              iconClassName='w-4 h-4'
            />
            <Link
              href={`https://polygonscan.com/address/${project?.abc?.issuanceTokenAddress}`}
              target='_blank'
              rel='noopener noreferrer'
              className='ml-2'
            >
              <ArrowUpRight className='w-5 h-5 text-white' />
            </Link>
          </div>

          {(isTokenClaimable || hasUnlockDatePassed) && !recentlyClaimed ? (
            <button
              className='flex justify-center rounded-xl bg-peach-400 font-semibold text-black px-4 py-2 disabled:opacity-80 disabled:cursor-not-allowed'
              disabled={
                !isTokenClaimable ||
                claim.isPending ||
                !isSmartAccountReady
              }
              onClick={() => claim.mutateAsync()}
            >
              {isActivePaymentReceiver.isPending
                ? 'Checking for tokens...'
                : claim.isPending
                  ? 'Claiming...'
                  : `CLAIM ${availableToClaim.toFixed(2)} ${project.abc?.tokenTicker}`}
            </button>
          ) : (
            <div className='rounded-xl bg-qacc-gray-light text-neutral-800 px-2 py-2 text-center font-medium text-base'>
              UNLOCK IN {days}d {hours}h {minutes}m {seconds}s
            </div>
          )}
        </div>
      </div>

      <div className='col-span-12 md:col-span-8 py-5 px-6 bg-white/[5%] rounded-3xl'>
        <div className='hidden overflow-x-auto overflow-y-hidden md:flex flex-nowrap flex-row justify-center items-center flex-1 gap-8 lg:gap-10'>
          <h3 className='text-[22px] font-anton text-right text-white/30 flex items-end gap-2 leading-none'>
            <span className=''>
              YOUR <br />${project.abc?.tokenTicker}
            </span>
          </h3>
          <div className='space-y-0.1'>
            <div className='text-white text-2xl text-center font-bold'>
              {inWallet > 0 ? (
                <>
                  {formatValue(inWallet).whole}
                  <span className='text-base align-bottom'>
                    .{formatValue(inWallet).frac}
                  </span>
                </>
              ) : (
                <span className='text-white/30'>0</span>
              )}
            </div>
            <div className='text-white/30 text-center font-medium text-[13px] leading-normal'>
              In Wallet
            </div>
          </div>

          {/* Total Raised */}
          <div className='space-y-0.1'>
            <div className='text-white text-center text-2xl font-bold'>
              {lockedTokens > 0 ? (
                <>
                  {formatValue(lockedTokens).whole}
                  <span className='text-base align-bottom'>
                    .{formatValue(lockedTokens).frac}
                  </span>
                </>
              ) : (
                <span className='text-white/30'>0</span>
              )}
            </div>
            <div className='text-white/30 text-center font-medium text-[13px] leading-normal'>
              Locked ${project.abc?.tokenTicker}
            </div>
          </div>

          <div className='space-y-0.1'>
            <div className='text-white text-center text-2xl font-bold'>
              {isTokenClaimable ? (
                <>
                  {formatValue(availableToClaim).whole}
                  <span className='text-base align-bottom'>
                    .{formatValue(availableToClaim).frac}
                  </span>
                </>
              ) : (
                <span className='text-white/30'>0</span>
              )}
            </div>
            <span className='text-white/30 text-center font-medium text-[13px] leading-normal flex items-center justify-center gap-0.5'>
              Available to claim
            </span>
          </div>

          <div className='space-y-0.1'>
            <div className='text-white text-center text-2xl font-bold'>
              {totalAmountPerToken > 0 ? (
                <>
                  {formatValue(totalAmountPerToken).whole}
                  <span className='text-base align-bottom'>
                    .{formatValue(totalAmountPerToken).frac}
                  </span>
                </>
              ) : (
                <span className='text-white/30'>0</span>
              )}
            </div>
            <span className='text-white/30 text-center font-medium text-[13px] leading-normal flex items-center justify-center gap-0.5'>
              Your Total Tokens
            </span>
          </div>

          <div className='space-y-0.1'>
            <div className='text-white text-center text-2xl font-bold'>
              {totalAmountPerTokenInUSD > 0 ? (
                <>
                  {formatValue(totalAmountPerTokenInUSD).whole}
                  <span className='text-base align-bottom'>
                    .{formatValue(totalAmountPerTokenInUSD).frac}
                  </span>
                </>
              ) : (
                <span className='text-white/30'>0</span>
              )}
            </div>
            <span className='text-white/30 text-center font-medium text-[13px] leading-normal flex items-center justify-center gap-0.5'>
              Value in USD
            </span>
          </div>

          <div className='space-y-0.1'>
            <div className='text-white text-center text-2xl font-bold'>
              {returnPercent !== 0 ? (
                <span className={formatPercentageChange(returnPercent).color}>
                  {formatPercentageChange(returnPercent).formatted}
                </span>
              ) : (
                <span className='text-white/30'>0</span>
              )}
            </div>
            <span className='text-white/30 text-center font-medium text-[13px] leading-normal flex items-center justify-center gap-0.5'>
              ROI
            </span>
          </div>
        </div>

        {/* Mobile View */}
        <div className=' flex flex-col md:hidden'>
          <h3 className='text-[22px] font-anton text-center text-white/30 uppercase leading-none mb-4'>
            YOUR{' '}
            <span className='text-peach-400'>${project.abc?.tokenTicker}</span>{' '}
            Tokens
          </h3>
          <div className='grid grid-cols-3 gap-4'>
            <div className='space-y-0.1'>
              <div className='text-white text-center text-2xl font-bold'>
                {totalAmountPerToken > 0 ? (
                  <>
                    {formatValue(totalAmountPerToken).whole}
                    <span className='text-base align-bottom'>
                      .{formatValue(totalAmountPerToken).frac}
                    </span>
                  </>
                ) : (
                  <span className='text-white/30'>0</span>
                )}
              </div>
              <span className='text-white/30 text-center font-medium text-[11px] md:text-[13px] leading-normal flex items-center justify-center gap-0.5'>
                Your Total Tokens
              </span>
            </div>

            <div className='space-y-0.1'>
              <div className='text-white text-center text-2xl font-bold'>
                {totalAmountPerTokenInUSD > 0 ? (
                  <>
                    {formatValue(totalAmountPerTokenInUSD).whole}
                    <span className='text-base align-bottom'>
                      .{formatValue(totalAmountPerTokenInUSD).frac}
                    </span>
                  </>
                ) : (
                  <span className='text-white/30'>0</span>
                )}
              </div>
              <span className='text-white/30 text-center font-medium text-[11px] md:text-[13px] leading-normal flex items-center justify-center gap-0.5'>
                Value in USD
              </span>
            </div>

            <div className='space-y-0.1'>
              <div className='text-white text-center text-2xl font-bold'>
                {returnPercent !== 0 ? (
                  <span className={formatPercentageChange(returnPercent).color}>
                    {formatPercentageChange(returnPercent).formatted}
                  </span>
                ) : (
                  <span className='text-white/30'>0%</span>
                )}
              </div>
              <span className='text-white/30 text-center font-medium text-[11px] md:text-[13px] leading-normal flex items-center justify-center gap-0.5'>
                ROI
              </span>
            </div>

            <div className='space-y-0.1'>
              <div className='text-white text-2xl text-center font-bold'>
                {inWallet > 0 ? (
                  <>
                    {formatValue(inWallet).whole}
                    <span className='text-base align-bottom'>
                      .{formatValue(inWallet).frac}
                    </span>
                  </>
                ) : (
                  <span className='text-white/30'>0</span>
                )}
              </div>
              <div className='text-white/30 text-center font-medium text-[11px] md:text-[13px] leading-normal'>
                In Wallet
              </div>
            </div>
            <div className='space-y-0.1'>
              <div className='text-white text-center text-2xl font-bold'>
                {lockedTokens > 0 ? (
                  <>
                    {formatValue(lockedTokens).whole}
                    <span className='text-base align-bottom'>
                      .{formatValue(lockedTokens).frac}
                    </span>
                  </>
                ) : (
                  <span className='text-white/30'>0</span>
                )}
              </div>
              <div className='text-white/30 text-center font-medium text-[11px] md:text-[13px] leading-normal'>
                Locked ${project.abc?.tokenTicker}
              </div>
            </div>

            <div className='space-y-0.1'>
              <div className='text-white text-center text-2xl font-bold'>
                {availableToClaim > 0 ? (
                  <>
                    {formatValue(availableToClaim).whole}
                    <span className='text-base align-bottom'>
                      .{formatValue(availableToClaim).frac}
                    </span>
                  </>
                ) : (
                  <span className='text-white/30'>0</span>
                )}
              </div>
              <span className='text-white/30 text-center font-medium text-[11px] md:text-[13px] leading-normal flex items-center justify-center gap-0.5'>
                Available to claim
              </span>
            </div>
          </div>
        </div>

        <div className='overflow-x-auto mt-8'>
          <table className='min-w-full table-fixed whitespace-nowrap'>
            <thead className='py-8 border-y border-white/5'>
              {/* Label Row */}
              <tr className='text-[10px] uppercase text-qacc-gray-light/60'>
                <th className='w-[120px] px-4 py-2 text-left'>
                  Contributions Date
                </th>
                <th className='w-[120px] px-4 py-2 text-right'>Price</th>
                <th className='w-[120px] px-4 py-2 text-right'>Amount</th>
                <th className='w-[120px] px-4 py-2 text-right'>Token</th>
                <th className='w-[250px] px-4 py-2 text-right'>
                  Vesting Stream From → Until
                </th>
              </tr>
            </thead>
            <tbody className='divide-y  divide-white/5'>
              {projectDonations.map((donation: any) => (
                <tr
                  key={donation.id}
                  className='text-sm font-bold font-ibm-mono'
                >
                  <td className='w-[120px] px-4 py-2 text-left'>
                    {formatDateMonthDayYear(donation.createdAt)}
                  </td>
                  <td className='w-[120px] px-4 py-2 text-right'>
                    {donation.amount
                      ? `$${((donation.amount || 0) * Number(polPrice ?? 0)).toFixed(2)}`
                      : '$0.00'}
                  </td>
                  <td className='w-[120px] px-4 py-2 text-right'>
                    {donation.amount?.toFixed(2)} POL
                  </td>
                  <td className='w-[120px] px-4 py-2 text-right'>
                    {donation.rewardTokenAmount?.toFixed(2) || 0}{' '}
                    {project.abc?.tokenTicker}
                  </td>
                  <td className='w-[250px] px-4 py-2 text-right'>
                    {donation.rewardStreamStart && donation.rewardStreamEnd
                      ? `${formatDateMonthDayYear(donation.rewardStreamStart)} → ${formatDateMonthDayYear(donation.rewardStreamEnd)}`
                      : '---'}
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

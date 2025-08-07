import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Pagination from '@/components/shared/Pagination';
import { IconTotalDonations } from '@/components/icons/IconTotalDonations';
import { IconTotalSupply } from '@/components/icons/IconTotalSupply';
import { IconTotalDonars } from '@/components/icons/IconTotalDonors';
import { useProjectContext } from '@/contexts/project.context';
import { fetchProjectDonationsById } from '@/services/donation.service';

import { checkMatchingFundAddress, formatAmount } from '@/helpers/donations';
import config from '@/config/configuration';
import { useTokenPrice } from '@/hooks/useTokens';
import { calculateCapAmount } from '@/helpers/round';
import { useFetchActiveRoundDetails } from '@/hooks/useRounds';
import { isContractAddress } from '@/helpers/token';
import { CHAIN_IMAGES, fetchUSDPrices } from '@/helpers/squidTransactions';
import { Spinner } from '@/components/loaders/Spinner';
import { useTokenSupplyDetails } from '@/hooks/useTokens';
import { ArrowDownUp, ExternalLink } from 'lucide-react';

//TODO: move to constants
export const POLYGON_POS_CHAIN_IMAGE =
  'https://raw.githubusercontent.com/0xsquid/assets/main/images/chains/polygon.svg';


const itemPerPage = 5;

export enum EOrderBy {
  CreationDate = 'CreationDate',
  Round = 'EarlyAccessRound',
  Amount = 'TokenAmount',
  RewardTokenAmount = 'RewardTokenAmount',
}

export enum EDirection {
  DESC = 'DESC',
  ASC = 'ASC',
}
export interface IOrder {
  by: EOrderBy;
  direction: EDirection;
}

const ProjectDonationTable = () => {
  const [page, setPage] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const { projectData, uniqueDonars, totalAmount } = useProjectContext();
  const { data: POLPrice } = useTokenPrice();
  const { data: activeRoundDetails } = useFetchActiveRoundDetails();

  // get project data from context
  const id = 19;
  const [order, setOrder] = useState<IOrder>({
    by: EOrderBy.CreationDate,
    direction: EDirection.DESC,
  });

  const [pageDonations, setPageDonations] = useState<any>();
  const [totalAmountDonated, setTotalAmountDonated] = useState(0);
  const [safeAddresses, setSafeAddresses] = useState<Record<string, boolean>>(
    {},
  );
  const [usdPrices, setUsdPrices] = useState<any>({});
  const [usdPricesLoading, setUsdPricesLoading] = useState(false);

  const { data: tokenDetails } = useTokenSupplyDetails(
    projectData?.abc?.fundingManagerAddress,
  );
  const { totalAmount: totalPOLDonated } = useProjectContext();
  useEffect(() => {
    const updatePOLCap = async () => {
      const { capAmount, totalDonationAmountInRound }: any =
        await calculateCapAmount(activeRoundDetails, Number(projectData.id));

      setTotalAmountDonated(totalPOLDonated);
    };

    updatePOLCap();
  }, [totalAmount, activeRoundDetails, projectData]);

  useEffect(() => {
    const fetchProjectDonations = async () => {
      const data = await fetchProjectDonationsById(
        parseInt(projectData?.id),
        itemPerPage,
        page * itemPerPage,
        { field: order.by, direction: order.direction },
      );

      if (data) {
        const { donations, totalCount } = data;
        const filteredDonations: any[] = [];
        setTotalCount(totalCount);
        setPageDonations(donations);
        const addressChecks: Record<string, boolean> = {};
        await Promise.all(
          donations.map(async (donation: any) => {
            const address = donation.user?.walletAddress;
            if (address && !safeAddresses[address]) {
              const isSafe = await isContractAddress(address);
              addressChecks[address] = isSafe;
              if (donation.amount !== 0) {
                filteredDonations.push(donation);
              }
            }
          }),
        );
        setSafeAddresses(prev => ({ ...prev, ...addressChecks }));
        // setPageDonations(filteredDonations);
      }

      // console.log(pageDonations, 'donations');
    };

    fetchProjectDonations();
  }, [page, projectData, itemPerPage, totalCount, order]);

  useEffect(() => {
    const uniqueTokens = Array.from(
      new Set(
        pageDonations
          ?.map((donation: any) => {
            const chainId = donation.swapTransaction?.fromChainId;
            const tokenAddress = donation.swapTransaction?.fromTokenAddress;
            // Ensure both values exist before adding to the set
            return chainId && tokenAddress
              ? `${chainId}-${tokenAddress}`
              : null;
          })
          .filter(Boolean), // Remove null/undefined values
      ),
    ).map((key: any) => {
      const [chainId, tokenAddress] = key.split('-');
      return { chainId: Number(chainId), tokenAddress };
    });

    const getPrices = async () => {
      setUsdPricesLoading(true);
      const prices = await fetchUSDPrices(uniqueTokens);
      setUsdPrices(prices);
      setUsdPricesLoading(false);
    };
    getPrices();
  }, [pageDonations]);

  const orderChangeHandler = (orderBy: EOrderBy) => {
    if (orderBy === order.by) {
      setOrder({
        by: orderBy,
        direction:
          order.direction === EDirection.ASC ? EDirection.DESC : EDirection.ASC,
      });
    } else {
      setOrder({
        by: orderBy,
        direction: EDirection.DESC,
      });
    }
  };

  return (
    <div className="bg-neutral-900 text-gray-300">
      <div className=' container flex  flex-col py-10 gap-10'>
        <div className='flex gap-10 lg:flex-row flex-col'>
          {totalCount === 0 ? (
            <div className='w-full h-[400px] flex items-center justify-center text-[25px] font-bold text-gray-400'>
              This project has not received any contributions.
            </div>
          ) : (
            <div className='flex flex-col w-full lg:w-3/4 font-redHatText overflow-x-auto '>
              <div className='flex justify-between  '>
                <div className='p-[8px_4px] flex gap-2 text-start w-full  font-medium text-gray-400 items-center min-w-[150px] border-b-2 border-neutral-700'>
                  Supporter
                  {/* <button
              onClick={() => orderChangeHandler(EOrderBy.CreationDate)}
            >
              <ArrowDownUp size={16} />
            </button> */}
                </div>
                <div className='p-[8px_4px] flex gap-2 text-start w-full  font-medium text-gray-400 items-center min-w-[150px] border-b-2 border-neutral-700'>
                  Date
                  <button
                    onClick={() => orderChangeHandler(EOrderBy.CreationDate)}
                  >
                    <ArrowDownUp size={16} className="text-peach-400" />
                  </button>
                </div>
                {/* <div className='p-[8px_4px] flex gap-2 text-start w-full  font-medium text-[#1D1E1F] items-center min-w-[150px] border-b-2'>
                  Round
                  <button onClick={() => orderChangeHandler(EOrderBy.Round)}>
                    <ArrowDownUp size={16} />
                  </button>
                </div> */}
                <div className='p-[8px_4px] flex gap-2 text-start w-full  font-medium text-gray-400 items-center min-w-[150px] border-b-2 border-neutral-700'>
                  Amount
                  <button onClick={() => orderChangeHandler(EOrderBy.Amount)}>
                    <ArrowDownUp size={16} className="text-peach-400" />
                  </button>
                </div>
                <div className='p-[8px_4px] flex gap-2 text-start w-full  font-medium text-gray-400 items-center min-w-[150px] border-b-2 border-neutral-700'>
                  Tokens
                  <button
                    onClick={() =>
                      orderChangeHandler(EOrderBy.RewardTokenAmount)
                    }
                  >
                    <ArrowDownUp size={16} className="text-peach-400" />
                  </button>
                </div>
              </div>

              <div className=' '>
                {pageDonations?.map((donation: any) => {
                  const tokenKey =
                    donation.swapTransaction?.fromChainId +
                    `-` +
                    donation.swapTransaction?.fromTokenAddress;
                  const tokenData = usdPrices[tokenKey] || {};
                  const tokenUsdPrice = tokenData.usdPrice || Number(POLPrice);
                  const tokenImageUrl =
                    tokenData.imageUrl || POLYGON_POS_CHAIN_IMAGE;
                  return (
                    <div key={donation.id} className=' flex justify-between '>
                      <div className='p-[18px_4px] flex gap-2 text-start  w-full border-b border-neutral-700 min-w-[150px] text-gray-300'>
                        {checkMatchingFundAddress(donation.fromWalletAddress)
                          ? 'Matching pool allocation'
                          : donation?.anonymous
                            ? 'Anoynomous'
                            : donation.user.firstName
                              ? donation.user.firstName +
                                ' ' +
                                donation.user.lastName
                              : 'Anoynomous'}
                      </div>
                      <div className='p-[18px_4px] flex gap-2 text-start  w-full border-b border-neutral-700 min-w-[150px]'>
                        <div className='flex   items-center gap-2 flex-wrap text-gray-300'>
                          {new Date(donation.createdAt).toLocaleDateString(
                            'en-US',
                            {
                              day: 'numeric',
                              year: 'numeric',
                              month: 'short',
                            },
                          )}
                          {donation?.qfRound?.seasonNumber && (
                            <span className='px-2 py-[2px] border-2 border-neutral-600 bg-neutral-700 rounded-3xl text-xs text-gray-300 font-medium leading-4'>
                              Season {donation.qfRound.seasonNumber}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* <div className='p-[18px_4px] flex gap-2 text-start  border-b w-full min-w-[150px]'>
                      {checkMatchingFundAddress(donation.fromWalletAddress)
                        ? 'q/acc round'
                        : safeAddresses[donation.user?.walletAddress]
                          ? 'Early Access'
                          : donation.earlyAccessRound
                            ? `Early access - Round ${donation.earlyAccessRound.roundNumber}`
                            : donation.qfRound
                              ? 'q/acc round'
                              : `---`}
                    </div> */}

                      <div className='p-[18px_4px] flex gap-2 text-start  border-b border-neutral-700 w-full min-w-[150px]'>
                        <div className='flex gap-1'>
                          <div>
                            <div className='flex relative px-2'>
                              <div className='flex items-center'>
                                <div className='w-6 h-6  absolute right-6 p-[4px] bg-neutral-800 rounded-full shadow-baseShadow'>
                                  <img
                                    className='rounded-full  w-full'
                                    src={
                                      CHAIN_IMAGES[
                                        donation.swapTransaction?.fromChainId
                                      ] || POLYGON_POS_CHAIN_IMAGE
                                    }
                                    alt='From Chain  Logo'
                                  />
                                </div>
                                <div className='w-6 h-6 z-10 p-[4px] bg-neutral-800 rounded-full shadow-baseShadow'>
                                  <img
                                    className='rounded-full  w-full'
                                    src={tokenImageUrl}
                                    alt='To Chain Logo'
                                    width={16}
                                    height={16}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className='flex flex-col'>
                            <div className='flex gap-1 items-center'>
                              <span className='font-medium text-gray-200'>
                                {donation.fromTokenAmount
                                  ? formatAmount(donation.fromTokenAmount)
                                  : formatAmount(donation.amount)}
                                {/* {formatAmount(donation.amount)}{' '} */}
                              </span>
                              <span className='text-gray-400 text-xs align-top font-medium'>
                                {donation.swapTransaction?.fromTokenSymbol ||
                                  'POL'}
                              </span>
                              {donation.transactionNetworkId === 1101 ? (
                                <Link
                                  target='_blank'
                                  href={`https://zkevm.polygonscan.com/tx/${donation.isSwap ? donation.swapTransaction?.secondTxHash : donation.transactionId}`}
                                >
                                  <ExternalLink
                                    size={16}
                                    color='#A5ADBF' // Using a specific gray, can be changed to Tailwind gray if preferred
                                  />
                                </Link>
                              ) : (
                                <Link
                                  target='_blank'
                                  href={`${config.SCAN_URL}/tx/${donation.isSwap ? donation.swapTransaction?.secondTxHash : donation.transactionId}`}
                                >
                                  <ExternalLink
                                    size={16}
                                    color='#A5ADBF' // Using a specific gray, can be changed to Tailwind gray if preferred
                                  />
                                </Link>
                              )}
                              {/* <Link
                                target='_blank'
                                href={`${config.SCAN_URL}/tx/${donation.isSwap ? donation.swapTransaction?.secondTxHash : donation.transactionId}`}
                              >
                                <ExternalLink
                                  size={16}
                                  color='#4F576A'
                                />
                              </Link> */}
                            </div>

                            <span className='text-xs font-medium  text-gray-500'>
                              {usdPricesLoading ? (
                                <Spinner size={10} />
                              ) : (
                                <>
                                  {donation.isSwap
                                    ? formatAmount(donation.amount) + ' POL'
                                    : ''}
                                  {/* {donation.fromTokenAmount
                                    ? formatAmount(
                                        Math.round(
                                          donation.fromTokenAmount *
                                            tokenUsdPrice *
                                            100,
                                        ) / 100,
                                      )
                                    : formatAmount(
                                        Math.round(
                                          donation.amount * tokenUsdPrice * 100,
                                        ) / 100,
                                      )} */}
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className='p-[18px_4px]  text-gray-200 font-medium flex gap-2 text-start border-b border-neutral-700 w-full min-w-[150px]'>
                        {donation.rewardTokenAmount
                          ? formatAmount(
                              Math.round(donation.rewardTokenAmount * 100) /
                                100,
                            ) +
                            ' ' +
                            projectData?.abc?.tokenTicker
                          : '-'}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className='flex justify-center'>
                <Pagination
                  currentPage={page}
                  totalCount={totalCount}
                  setPage={setPage}
                  itemPerPage={itemPerPage}
                />
              </div>
            </div>
          )}

          {/* Donation Card */}
          <div className='w-full lg:w-1/4  p-6  gap-10 flex flex-col font-redHatText bg-neutral-800 shadow-tabShadow rounded-lg h-fit'>
            <div className=' flex flex-col gap-2'>
              <div className='flex gap-2'>
                <IconTotalDonations size={20} color='white' />
                <span className='text-base font-medium text-gray-400'>
                  Total received
                </span>
              </div>
              <div className='flex flex-wrap gap-4 items-center'>
                <h1 className='text-2xl text-gray-200 font-bold '>
                  ~ ${' '}
                  {formatAmount(
                    Math.round(totalAmountDonated * Number(POLPrice) * 100) /
                      100,
                  )}
                </h1>
                <h2 className='font-medium text-gray-300'>
                  {formatAmount(totalAmountDonated)} POL
                </h2>
              </div>
            </div>

            <div className=' flex flex-col gap-4 font-redHatText'>
              {/* Total Donars */}
              <div className=' flex justify-between'>
                <div className='flex gap-2'>
                  <IconTotalDonars size={20} color='white' />
                  <span className='text-base font-medium text-gray-400'>
                    Total supporters
                  </span>
                </div>
                <span className='font-semibold text-gray-200'>{uniqueDonars}</span>
              </div>

              {/* Total Supply */}
              <div className='flex  flex-wrap  items-center gap-2 justify-between'>
                <div className='flex gap-2'>
                  <IconTotalSupply size={20} color='white' />
                  <span className='text-base font-medium text-gray-400'>
                    Total supply
                  </span>
                </div>

                <h3 className='text-sm font-medium text-gray-200 flex items-center gap-1'>
                  {formatAmount(Number(tokenDetails?.issuance_supply)) || '---'}{' '}
                  {projectData?.abc?.tokenTicker}
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDonationTable;

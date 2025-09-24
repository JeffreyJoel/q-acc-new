"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { formatUnits } from "viem";
import { formatDateMonthDayYear, isMiddleOfThePeriod } from "@/helpers/date";
import { fetchProjectDonationsById } from "@/services/donation.service";
import {
  calculateTotalDonations,
  calculateUniqueDonors,
  formatAmount
} from "@/helpers/donations";
import { useFetchAllRoundDetails } from "@/hooks/useRounds";
import { IEarlyAccessRound, IQfRound } from "@/types/round.type";
import { useFetchPOLPriceSquid } from "@/hooks/useTokens";
import { useGetCurrentTokenPrice } from "@/hooks/useGetCurrentTokenPrice";
import {
  useTokenPriceRange,
  useTokenPriceRangeStatus,
  calculateMarketCapChange,
  getMarketCap,
  fetchGeckoMarketCap,
} from "@/services/tokenPrice.service";
import {
  useClaimCollectedFee,
  useClaimedTributesAndMintedTokenAmounts,
  useProjectCollateralFeeCollected,
} from "@/hooks/useTribute";
import { useFetchActiveRoundDetails } from "@/hooks/useRounds";
import { calculateCapAmount } from "@/helpers/round";
import { useTokenSupplyDetails } from "@/hooks/useTokens";
import { useTokenHolders } from "@/hooks/useTokenHolders";
import { useVestingSchedules } from "@/hooks/useVestingSchedules";
import { useCountdown } from "@/hooks/useCountdown";
import { Eye, Loader2, Pencil } from "lucide-react";
import { IProject } from "@/types/project.type";
import { toast } from "sonner";
import { Spinner } from "@/components/loaders/Spinner";
import { handleImageUrl } from "@/helpers/image";
import { formatNumber } from "@/helpers/donations";
import { formatPercentageChange } from "@/helpers";
import Link from "next/link";

const MyProjects = ({ projectData }: { projectData: IProject }) => {
  const projectId = projectData?.id;

  const [donations, setDonations] = useState<any[]>([]);
  const [totalDonationsCount, setTotalDonationsCount] = useState(0);
  const [uniqueDonars, setUniqueDonars] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const { data: POLPriceSquid } = useFetchPOLPriceSquid();

  const { isTokenListed, currentTokenPrice } = useGetCurrentTokenPrice(
    projectData?.abc?.issuanceTokenAddress
  );

  const { data: tokenHolderData } = useTokenHolders(
    projectData?.abc?.issuanceTokenAddress || "",
    { enabled: !!projectData?.abc?.issuanceTokenAddress }
  );
  const tokenHoldersCount = tokenHolderData?.totalHolders ?? 0;

  const [marketCap, setMarketCap] = useState(0);
  const [marketCapChange24h, setMarketCapChange24h] = useState(0);
  const [marketCapLoading, setMarketCapLoading] = useState(false);
  const [tokenPricePOL, setTokenPricePOL] = useState(0);
  const [tokenPriceUSD, setTokenPriceUSD] = useState(0);

  const polPriceNumber = Number(POLPriceSquid);

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


  const [filteredRoundData, setFilteredRoundData] = useState<{
    activeRound: IEarlyAccessRound | IQfRound;
    pastRounds: (IEarlyAccessRound | IQfRound)[];
    roundType: string;
    lastRound: IEarlyAccessRound | IQfRound;
    qfRoundEnded: boolean;
    pastRoundNumber: number;
  }>({
    activeRound: {} as IEarlyAccessRound | IQfRound,
    pastRounds: [],
    roundType: "",
    lastRound: {} as IEarlyAccessRound | IQfRound,
    qfRoundEnded: false,
    pastRoundNumber: 1,
  });
  const { data: allRoundData } = useFetchAllRoundDetails();
  const { data: activeRoundDetails } = useFetchActiveRoundDetails();

  const determineProjectRound = (project: IProject, roundData: (IEarlyAccessRound | IQfRound)[] | undefined) => {
    if (!project || !roundData) return 1;
    
    if (project.qfRounds && project.qfRounds.length > 0) {
      const activeQfRound = project.qfRounds.find(round => round.isActive);
      if (activeQfRound) {
        const roundNumber = parseInt(activeQfRound.id) || parseInt(activeQfRound.name.match(/\d+/)?.[0] || "1");
        return roundNumber;
      }
    }
    
    if (project.hasEARound) {
      return 1;
    }
  };


  const unlockDate = useMemo(() => {
    if (!allVestingData.length) return undefined;
    
    if (projectData?.seasonNumber === 1) {
      const projectRound = determineProjectRound(projectData, allRoundData);
      
      let dateFromRound = allVestingData.find(
        (period) => {
          const nameLower = period.name.toLowerCase();
          return period.type === "team" && 
                 period.season === 1 && 
                 (projectRound === 1 ? 
                   nameLower.includes("round-1") || nameLower.includes("round 1") : 
                   nameLower.includes(`round-${projectRound}`) || nameLower.includes(`round ${projectRound}`));
        }
      )?.cliff;
      
      if (!dateFromRound) {
        dateFromRound = allVestingData.find(
          (period) => period.type === "team" && period.season === 1
        )?.cliff;
      }
      
      return dateFromRound;
    } else {
      return allVestingData.find(
        (period) => period.type === "team" && period.season === (projectData?.seasonNumber || 2)
      )?.cliff;
    }
  }, [allVestingData, projectData, allRoundData]);

  const [days, hours, minutes, seconds] = useCountdown(unlockDate || "");

  const [maxPOLCap, setMaxPOLCap] = useState(0);
  const [totalAmountDonated, setTotalAmountDonated] = useState(0);

  const round1 = allRoundData?.find(
    (round) =>
      round.__typename === "EarlyAccessRound" && round.roundNumber === 1
  );

  const { data: tokenDetails } = useTokenSupplyDetails(
    projectData?.abc?.fundingManagerAddress!
  );

  useEffect(() => {
    const calculatedTokenPricePOL = isTokenListed
      ? currentTokenPrice || 0
      : (() => {
        if (!tokenDetails) return 0;
        const reserveRatio = Number(tokenDetails.reserve_ration);
        const reserve = Number(tokenDetails.collateral_supply);
        const supply = Number(tokenDetails.issuance_supply);
        if (!reserveRatio || !supply) return 0;
        return (reserve / (supply * reserveRatio)) * 1.1;
      })();

    const calculatedTokenPriceUSD = calculatedTokenPricePOL * polPriceNumber;

    setTokenPricePOL(calculatedTokenPricePOL);
    setTokenPriceUSD(calculatedTokenPriceUSD);
  }, [isTokenListed, currentTokenPrice, tokenDetails, polPriceNumber]);

  useEffect(() => {
    const updatePOLCap = async () => {
      const { capAmount, totalDonationAmountInRound }: any =
        await calculateCapAmount(activeRoundDetails, Number(projectId));

      setMaxPOLCap(capAmount);
      setTotalAmountDonated(totalDonationAmountInRound);
    };

    if (projectId) {
      updatePOLCap();
    }
  }, [activeRoundDetails, projectId, maxPOLCap, totalAmount]);

  const tokenPriceRange = useTokenPriceRange({
    contributionLimit: maxPOLCap,
    contractAddress: projectData?.abc?.fundingManagerAddress || "",
  });
  const tokenPriceRangeStatus = useTokenPriceRangeStatus({
    project: projectData,
    allRounds: allRoundData,
  });

  useEffect(() => {
    if (!allRoundData) return;

    let activeRound: IEarlyAccessRound | IQfRound = {} as
      | IEarlyAccessRound
      | IQfRound;
    let pastRounds: (IEarlyAccessRound | IQfRound)[] = [];
    let roundType = "ea";
    let qfRoundEnded = false;
    let lastRound: IEarlyAccessRound | IQfRound = {} as
      | IEarlyAccessRound
      | IQfRound;
    let pastRoundNumber = 1;
    allRoundData.forEach((round) => {
      const { __typename, startDate, endDate } = round;

      // Update last round if it's an EarlyAccessRound
      if (__typename === "EarlyAccessRound") {
        lastRound = round;
      }

      // Check if the round is active
      let isActive = isMiddleOfThePeriod(startDate, endDate);
      if (
        (__typename === "EarlyAccessRound" && isActive) ||
        (__typename === "QfRound" && isActive)
      ) {
        activeRound = round;
        roundType = __typename;
      }

      // Push past EarlyAccessRounds to pastRounds
      const hasEnded = new Date(endDate) < new Date();
      if (__typename === "EarlyAccessRound" && (hasEnded || isActive)) {
        pastRounds.push(round);
        pastRoundNumber = round.roundNumber;
      }

      // Check if a QfRound has ended
      if (__typename === "QfRound" && hasEnded) {
        activeRound = round;
        qfRoundEnded = true;
      }
    });

    // Sort past rounds by endDate in descending order
    pastRounds.sort(
      (a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
    );

    setFilteredRoundData({
      activeRound,
      pastRounds,
      roundType,
      lastRound,
      qfRoundEnded,
      pastRoundNumber,
    });
  }, [allRoundData]);

  useEffect(() => {
    if (projectData?.id) {
      const fetchProjectDonations = async () => {
        const data = await fetchProjectDonationsById(
          parseInt(projectData?.id),
          1000,
          0
        );

        if (data) {
          const { donations, totalCount } = data;
          setDonations(donations);
          setTotalDonationsCount(totalCount);
          setUniqueDonars(calculateUniqueDonors(donations));
          setTotalAmount(calculateTotalDonations(donations));
        }
      };
      fetchProjectDonations();
    }
  }, [projectData]);

  // Calculate market cap data
  useEffect(() => {
    if (!donations.length || !projectData?.abc?.fundingManagerAddress) return;
    const fundingManagerAddress = projectData.abc.fundingManagerAddress;
    setMarketCapLoading(true);
    (async () => {
      try {
        if (donations.length && activeRoundDetails) {
          // 24-hour change
          const res24 = await calculateMarketCapChange(
            donations,
            fundingManagerAddress,
            24,
            activeRoundDetails.startDate
          );

          // 7-day change
          const res7d = await calculateMarketCapChange(
            donations,
            fundingManagerAddress,
            24 * 7,
            activeRoundDetails.startDate
          );

          setMarketCap(res24.marketCap * polPriceNumber);
          setMarketCapChange24h(res24.pctChange);
        } else if (isTokenListed && projectData.abc?.issuanceTokenAddress) {
          const issuanceTokenAddress = projectData.abc.issuanceTokenAddress;
          const [marketCapData, gecko] = await Promise.all([
            getMarketCap(
              isTokenListed,
              issuanceTokenAddress,
              fundingManagerAddress
            ),
            fetchGeckoMarketCap(issuanceTokenAddress),
          ]);

          setMarketCap(marketCapData);
          setMarketCapChange24h(gecko?.pctChange24h ?? 0);
        } else if (!isTokenListed && projectData.abc?.issuanceTokenAddress) {
          // For tokens not listed, derive market cap from bonding curve parameters
          const issuanceTokenAddress = projectData.abc.issuanceTokenAddress;
          const marketCapData = await getMarketCap(
            false,
            issuanceTokenAddress,
            fundingManagerAddress,
            donations
          );

          setMarketCap(marketCapData * polPriceNumber);
          setMarketCapChange24h(0);
        }
      } catch (error) {
        console.error("Error fetching market cap data:", error);
      } finally {
        setMarketCapLoading(false);
      }
    })();
  }, [
    donations,
    projectData?.abc?.fundingManagerAddress,
    activeRoundDetails,
    isTokenListed,
    polPriceNumber,
    tokenDetails,
  ]);

  const projectCollateralFeeCollected = useProjectCollateralFeeCollected({
    contractAddress: projectData?.abc?.fundingManagerAddress!,
  });

  const claimableFees = BigInt(
    (projectCollateralFeeCollected.data || "0").toString()
  );
  const claimableFeesFormated = Number(formatUnits(claimableFees, 18));
  const enableClaimButton = claimableFeesFormated > 0;
  const tributeModuleAvailable: boolean =
    // !!projectData?.tributeClaimModuleAddress &&
    // !!projectData?.tributeRecipientAddress;
    true;

  const claimedTributesAndMintedTokenAmounts =
    useClaimedTributesAndMintedTokenAmounts(
      projectData?.abc?.orchestratorAddress,
      projectData?.abc?.projectAddress
    );

  const { claimedTributes, mintedTokenAmounts } =
    claimedTributesAndMintedTokenAmounts.data || {
      claimedTributes: 0,
      mintedTokenAmounts: 0,
    };

  const { claim, isSmartAccountReady } = useClaimCollectedFee({
    fundingManagerAddress: projectData?.abc?.fundingManagerAddress!,
    tributeModule:
      projectData?.tributeClaimModuleAddress ||
      "0x74248f303f7c74df53aeff401cfacb9875c51690",
    feeRecipient:
      projectData?.tributeRecipientAddress || projectData?.abc?.creatorAddress!,
    amount: claimableFees,
    onSuccess: () => {
      // do after 5 seconds
      setTimeout(() => {
        claimedTributesAndMintedTokenAmounts.refetch();
      }, 5000);
      projectCollateralFeeCollected.refetch();
      toast.success("Successfully Claimed Tributes");
    },
  });

  if (!projectData) {
    return (
      <div className="container mx-auto  bg-neutral-800 w-full h-[500px] flex items-center justify-center text-[25px] font-bold text-neutral-300 rounded-2xl">
        You don't have any project!
      </div>
    );
  }


  return (
    <div className="">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-6 p-4 h-64 relative">
          <Image
            src={handleImageUrl(projectData.image || "")}
            alt={projectData.title || ""}
            width={200}
            height={200}
            className="rounded-2xl w-full h-full object-center object-fill"
          />

          <div className="absolute top-0 right-0 w-full h-full bg-black/80 rounded-2xl"></div>

          <div className="absolute top-0 px-8 left-0 w-full h-full flex flex-col justify-center">
            <div className="flex gap-2 items-center">
              <span className="md:text-[40px] text-[24px] text-white font-anton shrink-0 text-center font-medium">
                {projectData?.title}
              </span>
              <Image
                src={handleImageUrl(projectData.abc?.icon || "")}
                alt={projectData.abc?.tokenName || ""}
                width={24}
                height={24}
                className="rounded-full bg-white/10 h-6 w-6"
              />
              <span className="md:text-[30px] text-[24px] text-white/50 font-anton text-center font-medium leading-normal">
                ${projectData.abc?.tokenTicker}
              </span>
            </div>
            <p className="text-white text-sm">
              {projectData.descriptionSummary}
            </p>

            <div className="flex gap-2 mt-4">
              {filteredRoundData.activeRound.endDate > new Date().toISOString() && (
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-base font-medium uppercase bg-[#6DC28F4D] text-[#6DC28F]">
                  <span className="h-2 w-2 rounded-full bg-green-400" />
                  active
                </div>
              )}

              <Link
                className="bg-peach-400 text-black uppercase inline-flex items-center gap-2 px-3 py-2 rounded-xl text-base font-medium"
                href={`/project/${projectData?.slug}`}
                prefetch
              >
                <Eye className="w-5 h-5" />
                View Project
              </Link>

              <Link
                className="bg-black border border-peach-400 text-peach-400 uppercase inline-flex items-center gap-2 px-3 py-2 rounded-xl text-base font-medium"
                href={`/project/edit/${projectId}`}
                prefetch
              >
                <Pencil className="w-5 h-5" />
                Edit Project
              </Link>
            </div>
            {/* <div className="bg-black/50 w-full flex gap-2 justify-center items-center border-2 border-white/10 rounded-xl px-4 py-2 mb-2">
              <span className="text-white font-ibm-mono shrink-0 text-center font-medium text-base leading-normal">
                {shortenAddressLarger(projectData?.abc?.issuanceTokenAddress)}
              </span>
              <CopyButton
                text={projectData?.abc?.issuanceTokenAddress || ""}
                className="ml-2"
                iconClassName="w-4 h-4"
              />
              <Link
                href={`https://polygonscan.com/address/${projectData?.abc?.issuanceTokenAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2"
              >
                <ArrowUpRight className="w-5 h-5 text-white" />
              </Link>
            </div> */}
          </div>
        </div>

        <div className="col-span-12 md:col-span-6 bg-black/50 rounded-2xl p-6 md:p-10">
          <div className="flex gap-4 justify-between border-b border-white/10 pb-4">
            <p className="text-white font-medium">Tributes available</p>

            <div className="flex gap-2 items-center">
              <span className="font-medium text-white font-ibm-mono">
                {formatAmount(claimableFeesFormated)} WPOL
              </span>
              {
                enableClaimButton && (
                  <button className={`bg-peach-400 text-black uppercase inline-flex items-center gap-2 px-3 py-2 rounded-xl text-base font-medium disabled:opacity-80 disabled:cursor-not-allowed`}
                    disabled={!enableClaimButton || claim.isPending || !isSmartAccountReady}
                    onClick={() => claim.mutateAsync()}
                  >
                    {claim.isPending ? (
                      <>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        Claiming...
                      </>
                    ) : "Claim"}
                  </button>
                )
              }

            </div>
          </div>

          <div className="flex gap-4 justify-between py-4">
            <p className="text-white font-medium">Team tokens available</p>
            <span className="font-medium text-white/30 font-ibm-mono">
              {formatAmount(mintedTokenAmounts)} {projectData?.abc?.tokenTicker}{" "}
            </span>
          </div>

          <div className="flex gap-4 justify-between pb-4">
            <p className="text-white font-medium">Unlock Remaining</p>
            <span className="font-medium text-white/30 font-ibm-mono">
              {days}d {hours}h {minutes}m {seconds}s
            </span>
          </div>
        </div>
      </div>

      {filteredRoundData.activeRound && (filteredRoundData.activeRound as any).startDate && (
        <div className="mt-4 space-y-4">
          {/* TEAM TOKENS */}
          <div className="py-5 px-4 md:px-12 bg-white/[5%] rounded-3xl">
            {/* Mobile Layout */}
            <div className="block md:hidden">
              <h3 className="text-[22px] font-anton text-center text-white/30 mb-4">
                Team Tokens
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-0.1">
                  <div className="text-white text-center text-xl font-bold">
                    {formatAmount(mintedTokenAmounts)}
                  </div>
                  <div className="text-white/30 text-center font-medium text-[13px] leading-normal">
                    Team Tokens
                  </div>
                </div>
                <div className="space-y-0.1">
                  <div className="text-white text-center text-xl font-bold">
                    ${formatAmount(mintedTokenAmounts * tokenPriceUSD)}
                  </div>
                  <div className="text-white/30 text-center font-medium text-[13px] leading-normal">
                    Value
                  </div>
                </div>
                <div className="space-y-0.1">
                  <div className="text-white text-center text-xl font-bold">
                    {tokenDetails?.issuance_supply ? ((Number(mintedTokenAmounts) / Number(tokenDetails.issuance_supply)) * 100).toFixed(1) : "0"}%
                  </div>
                  <div className="text-white/30 text-center font-medium text-[13px] leading-normal">
                    % of Total
                  </div>
                </div>
                <div className="space-y-0.1">
                  <div className="text-peach-400 text-center text-xl font-bold">
                    {formatAmount(claimableFeesFormated)}
                  </div>
                  <div className="text-white/30 text-center font-medium text-[13px] leading-normal">
                    Available to claim
                  </div>
                </div>
                <div className="space-y-0.1">
                  <div className="text-white text-center text-xl font-bold">
                    {unlockDate ? (
                      <span className="text-white">
                        {unlockDate.toLocaleString('default', { month: 'short', day: 'numeric' })}
                      </span>
                    ) : (
                      <span className="text-white/30">N/A</span>
                    )}
                  </div>
                  <div className="text-white/30 text-center font-medium text-[13px] leading-normal">
                    Unlock Date
                  </div>
                </div>
                <div className="space-y-0.1">
                  <div className="text-white text-center text-xl font-bold">
                    {unlockDate ? (
                      <span className="text-white">
                        {formatDateMonthDayYear(unlockDate.toISOString())}
                      </span>
                    ) : (
                      <span className="text-white/30">N/A</span>
                    )}
                  </div>
                  <div className="text-white/30 text-center font-medium text-[13px] leading-normal">
                    Vesting Until
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:flex flex-nowrap flex-row justify-between items-center flex-1 gap-8 lg:gap-10">
              <h3 className="text-[22px] font-anton text-right text-white/30 flex items-end gap-2 leading-none w-fit">
                <span className="">
                  Team <br /> Tokens
                </span>
              </h3>
              <div className="space-y-0.1 flex-1 text-center">
                <div className="text-white text-2xl text-center font-bold">
                  {formatAmount(mintedTokenAmounts)}
                </div>
                <div className="text-white/30 text-center font-medium text-[13px] leading-normal">
                  Team Tokens
                </div>
              </div>

              <div className="space-y-0.1 flex-1 text-center">
                <div className="text-white text-center text-2xl font-bold">
                  ${formatAmount(mintedTokenAmounts * tokenPriceUSD)}
                </div>
                <div className="text-white/30 text-center font-medium text-[13px] leading-normal">
                  Value
                </div>
              </div>

              <div className="space-y-0.1 flex-1 text-center">
                <div className="text-white text-center text-2xl font-bold">
                  {tokenDetails?.issuance_supply ? ((Number(mintedTokenAmounts) / Number(tokenDetails.issuance_supply)) * 100).toFixed(1) : "0"}%
                </div>
                <span className="text-white/30 text-center font-medium text-[13px] leading-normal flex items-center justify-center gap-0.5">
                  % of Total
                </span>
              </div>

              <div className="space-y-0.1 flex-1 text-center">
                <div className="text-peach-400 text-center text-2xl font-bold">
                  {formatAmount(claimableFeesFormated)}
                </div>
                <span className="text-white/30 text-center font-medium text-[13px] leading-normal flex items-center justify-center gap-0.5">
                  Available to claim
                </span>
              </div>

              <div className="space-y-0.1 flex-1 text-center">
                <div className="text-white text-center text-xl font-bold">
                  {unlockDate ? (
                    <span className="text-white">
                      {unlockDate.toLocaleString('default', { month: 'short', day: 'numeric' })}
                    </span>
                  ) : (
                    <span className="text-white/30">N/A</span>
                  )}
                </div>
                <span className="text-white/30 text-center font-medium text-[13px] leading-normal flex items-center justify-center gap-0.5">
                  Unlock Date
                </span>
              </div>

              <div className="space-y-0.1 flex-1 text-center">
                <div className="text-white text-center text-xl font-bold">
                  {unlockDate ? (
                    <span className="text-white">
                      {formatDateMonthDayYear(unlockDate.toISOString())}
                    </span>
                  ) : (
                    <span className="text-white/30">N/A</span>
                  )}
                </div>
                <span className="text-white/30 text-center font-medium text-[13px] leading-normal flex items-center justify-center gap-0.5">
                  Vesting Until
                </span>
              </div>
            </div>
          </div>


          {/* Q/ACC ROUNDS */}
          <div className="py-5 px-4 md:px-20 bg-white/[5%] rounded-3xl">
            {/* Mobile Layout */}
            <div className="block md:hidden">
              <h3 className="text-[22px] font-anton text-center text-white/30 mb-4">
                Q/ACC ROUNDS
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-0.1">
                  <div className="text-white text-center text-xl font-bold">
                    {uniqueDonars || 0}
                  </div>
                  <div className="text-white/30 text-center font-medium text-[13px] leading-normal">
                    Supporters
                  </div>
                </div>
                <div className="space-y-0.1">
                  <div className="text-white text-center text-xl font-bold">
                    {totalDonationsCount}
                  </div>
                  <div className="text-white/30 text-center font-medium text-[13px] leading-normal">
                    Transactions
                  </div>
                </div>
                <div className="space-y-0.1">
                  <div className="text-white text-center text-xl font-bold">
                    {formatAmount(totalAmount)} POL
                  </div>
                  <div className="text-white/30 text-center font-medium text-[13px] leading-normal">
                    Total Raised
                  </div>
                </div>
                <div className="space-y-0.1">
                  <div className="text-white text-center text-xl font-bold">
                    ≈ ${formatAmount(totalAmount * polPriceNumber)}
                  </div>
                  <div className="text-white/30 text-center font-medium text-[13px] leading-normal">
                    USD Value
                  </div>
                </div>
                <div className="space-y-0.1">
                  <div className="text-white text-center text-xl font-bold">
                    {formatAmount(claimedTributes)} POL
                  </div>
                  <div className="text-white/30 text-center font-medium text-[13px] leading-normal">
                    Tributes Received
                  </div>
                </div>
                <div className="space-y-0.1">
                  <div className="text-white text-center text-xl font-bold">
                    {formatAmount(claimableFeesFormated)} POL
                  </div>
                  <div className="text-white/30 text-center font-medium text-[13px] leading-normal">
                    Available to Claim
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:flex flex-nowrap flex-row justify-between items-center flex-1 gap-8 lg:gap-10">
              <h3 className="text-[22px] font-anton text-right text-white/30 flex items-end gap-2 leading-none w-fit">
                <span className="">
                  Q/ACC
                  <br />
                  ROUNDS
                </span>
              </h3>
              <div className="space-y-0.1 flex-1 text-center">
                <div className="text-white text-2xl text-center font-bold">
                  {uniqueDonars || 0}
                </div>
                <div className="text-white/30 text-center font-medium text-[13px] leading-normal">
                  Supporters
                </div>
              </div>

              <div className="space-y-0.1 flex-1 text-center">
                <div className="text-white text-center text-2xl font-bold">
                  {totalDonationsCount}
                </div>
                <div className="text-white/30 text-center font-medium text-[13px] leading-normal">
                  Transactions
                </div>
              </div>

              <div className="space-y-0.1 flex-1 text-center">
                <div className="text-white text-center text-2xl font-bold">
                  {formatAmount(totalAmount)} POL
                </div>
                <div className="text-white/30 text-center font-medium text-[13px] leading-normal">
                  Total Raised ≈ ${formatAmount(totalAmount * polPriceNumber)}
                </div>
              </div>

              <div className="space-y-0.1 flex-1 text-center">
                <div className="text-white text-center text-2xl font-bold">
                  <div className="flex flex-col gap-0.5">
                    <span>{formatAmount(claimedTributes)} POL</span>
                  </div>
                </div>
                <span className="text-white/30 text-center font-medium text-[13px] leading-normal flex items-center justify-center gap-0.5">
                  Tributes Received
                </span>
              </div>

              <div className="space-y-0.1 flex-1 text-center">
                <div className="text-white text-center text-2xl font-bold">
                  <div className="flex flex-row justify-center gap-2">
                    <span>{formatAmount(claimableFeesFormated)} POL</span>
                    {enableClaimButton && (
                    <button className={` text-black uppercase px-2 py-0.5 rounded-xl text-xs font-medium ${claim.isPending ? 'bg-peach-400/30' : 'bg-peach-400'}`}
                      disabled={claim.isPending}
                      onClick={() => claim.mutateAsync()}
                    >
                      {claim.isPending ? (
                        <>
                          Claiming...
                        </>
                        ) : "Claim"}
                      </button>
                    )}
                  </div>
                </div>
                <span className="text-white/30 text-center font-medium text-[13px] leading-normal flex items-center justify-center gap-0.5">
                  Tributes available to claim
                </span>
              </div>
            </div>
          </div>

          {/* MARKET DATA */}
          <div className="py-5 px-4 md:px-16 bg-white/[5%] rounded-3xl">
            {/* Mobile Layout */}
            <div className="block md:hidden">
              <h3 className="text-[22px] font-anton text-center text-white/30 mb-4">
                Market Data
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-0.1">
                  <div className="text-white text-center text-xl font-bold">
                    {tokenDetails?.issuance_supply ? formatNumber(Number(tokenDetails.issuance_supply)) : "0"}
                  </div>
                  <div className="text-white/30 text-center font-medium text-[13px] leading-normal">
                    Total Supply
                  </div>
                </div>
                <div className="space-y-0.1">
                  <div className="text-white text-center text-xl font-bold">
                    {formatNumber(tokenHoldersCount)}
                  </div>
                  <div className="text-white/30 text-center font-medium text-[13px] leading-normal">
                    Holders
                  </div>
                </div>
                <div className="space-y-0.1">
                  <div className="text-white text-center text-xl font-bold">
                    ${formatNumber(tokenPriceUSD)}
                  </div>
                  <div className="text-white/30 text-center font-medium text-[13px] leading-normal">
                    Price (USD)
                  </div>
                </div>
                <div className="space-y-0.1">
                  <div className="text-white text-center text-xl font-bold">
                    {formatNumber(tokenPricePOL)} POL
                  </div>
                  <div className="text-white/30 text-center font-medium text-[13px] leading-normal">
                    Price (POL)
                  </div>
                </div>
                <div className="space-y-0.1">
                  <div className="text-white text-center text-xl font-bold">
                    {marketCapLoading ? (
                      <Spinner size={16} />
                    ) : (
                      `$${formatAmount(marketCap)}`
                    )}
                  </div>
                  <div className="text-white/30 text-center font-medium text-[13px] leading-normal">
                    Market Cap
                  </div>
                </div>

                <div className="space-y-0.1">
                  <div className="text-white/30 text-center text-xl font-bold">
                    N/A
                  </div>
                  <div className="text-white/30 text-center font-medium text-[13px] leading-normal">
                    7d Volume
                  </div>
                </div>

                <div className="space-y-0.1 col-span-2">
                  <div className="text-white text-center text-xl font-bold">
                    {marketCapLoading ? (
                      <Spinner size={16} />
                    ) : isTokenListed ? (
                      <span
                        className={
                          formatPercentageChange(marketCapChange24h).color
                        }
                      >
                        {formatPercentageChange(marketCapChange24h).formatted}
                      </span>
                    ) : (
                      <span className="text-white/30">N/A</span>
                    )}
                  </div>
                  <div className="text-white/30 text-center font-medium text-[13px] leading-normal">
                    24h Change
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:flex flex-nowrap flex-row justify-between items-center flex-1 gap-8 lg:gap-10">
              <h3 className="text-[22px] font-anton text-right text-white/30 flex items-end gap-2 leading-none w-fit">
                <span className="">
                  Market
                  <br />
                  Data
                </span>
              </h3>
              <div className="space-y-0.1 flex-1 text-center">
                <div className="text-white text-2xl text-center font-bold">
                  {tokenDetails?.issuance_supply ? formatNumber(Number(tokenDetails.issuance_supply)) : "0"}
                </div>
                <div className="text-white/30 text-center font-medium text-[13px] leading-normal">
                  Total Supply
                </div>
              </div>

              <div className="space-y-0.1 flex-1 text-center">
                <div className="text-white text-center text-2xl font-bold">
                  {formatNumber(tokenHoldersCount)}
                </div>
                <div className="text-white/30 text-center font-medium text-[13px] leading-normal">
                  Holders
                </div>
              </div>

              <div className="space-y-0.1 flex-1 text-center">
                <div className="text-white text-center text-2xl font-bold">
                  ${formatNumber(tokenPriceUSD)}
                </div>
                <span className="text-white/30 text-center font-medium text-[13px] leading-normal flex items-center justify-center gap-0.5">
                  Price: {formatNumber(tokenPricePOL)} POL
                </span>
              </div>

              <div className="space-y-0.1 flex-1 text-center">
                <div className="text-white text-center text-xl md:text-2xl font-bold">
                  {marketCapLoading ? (
                    <Spinner size={16} />
                  ) : isTokenListed ? (
                    <span
                      className={
                        formatPercentageChange(marketCapChange24h).color
                      }
                    >
                      {formatPercentageChange(marketCapChange24h).formatted}
                    </span>
                  ) : (
                    <span className="text-white/30 text-center">N/A</span>
                  )}
                </div>
                <span className="text-white/30 text-center font-medium text-[13px] leading-normal flex items-center justify-center gap-0.5">
                  24h Change
                </span>
              </div>

              <div className="space-y-0.1 flex-1 text-center">
                <div className="text-white text-center text-2xl font-bold">
                  {marketCapLoading ? (
                    <Spinner size={16} />
                  ) : (
                    `$${formatAmount(marketCap)}`
                  )}
                </div>
                <span className="text-white/30 text-center font-medium text-[13px] leading-normal flex items-center justify-center gap-0.5">
                  Market Cap
                </span>
              </div>

              <div className="space-y-0.1 flex-1 text-center">
                <div className="text-white text-center text-2xl font-bold">
                  {" "}
                  <span className="text-white/30">N/A</span>
                </div>
                <span className="text-white/30 text-center font-medium text-[13px] leading-normal flex items-center justify-center gap-0.5">
                  7d Volume
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProjects;

"use client";

import { useEffect, useState } from "react";
import { IProject } from "@/types/project.type";
import { formatAmount, calculateTotalDonations } from "@/helpers/donations";
import { fetchProjectDonationsById } from "@/services/donation.service";
import { useFetchPOLPriceSquid } from "@/hooks/useTokens";
import {
  useFetchActiveRoundDetails,
  useFetchMostRecentEndRound,
} from "@/hooks/useRounds";
import { useGetCurrentTokenPrice } from "@/hooks/useGetCurrentTokenPrice";
import {
  calculateMarketCapChange,
  getMarketCap,
  fetchGeckoMarketCap,
} from "@/services/tokenPrice.service";
import { formatNumber } from "@/helpers/donations";
import { Spinner } from "@/components/loaders/Spinner";
import { useTokenHolders } from "@/hooks/useTokenHolders";
import { useTokenSupplyDetails } from "@/hooks/useTokens";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { formatPercentageChange } from "@/helpers";

interface ProjectStatsProps {
  project: IProject;
}

export default function ProjectStats({ project }: ProjectStatsProps) {
  const [donationData, setDonationData] = useState<{ donations: any[] } | null>(
    null
  );

  const { data: POLPrice } = useFetchPOLPriceSquid();
  const { data: activeRoundDetails } = useFetchActiveRoundDetails();

  const [totalDonationsPOL, setTotalDonationsPOL] = useState<number>(0);
  const [transactionCount, setTransactionCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  const { isTokenListed, currentTokenPrice } = useGetCurrentTokenPrice(
    project.abc?.issuanceTokenAddress
  );

  const { data: supplyDetails } = useTokenSupplyDetails(
    project.abc?.fundingManagerAddress || ""
  );

  const [marketCap, setMarketCap] = useState(0);
  const [marketCapChange24h, setMarketCapChange24h] = useState(0);
  const [marketCapChange7d, setMarketCapChange7d] = useState(0);
  const [marketCapLoading, setMarketCapLoading] = useState(false);

  const isQaccRoundEnded = useFetchMostRecentEndRound(activeRoundDetails);

  const polPriceNumber = Number(POLPrice);

  const { data: tokenHolderData } = useTokenHolders(
    project.abc?.issuanceTokenAddress || "",
    { enabled: !!project.abc?.issuanceTokenAddress }
  );
  const tokenHoldersCount = tokenHolderData?.totalHolders ?? 0;

  // Calculate token price (POL & USD) – fallback to bonding-curve formula if token is not listed
  const tokenPricePOL = isTokenListed
    ? currentTokenPrice || 0
    : (() => {
        if (!supplyDetails) return 0;
        const reserveRatio = Number(supplyDetails.reserve_ration);
        const reserve = Number(supplyDetails.collateral_supply);
        const supply = Number(supplyDetails.issuance_supply);
        if (!reserveRatio || !supply) return 0;
        return (reserve / (supply * reserveRatio)) * 1.1;
      })();

  const tokenPriceUSD = tokenPricePOL * polPriceNumber;

  useEffect(() => {
    if (!project?.id) return;
    (async () => {
      try {
        const data = await fetchProjectDonationsById(
          parseInt(project.id),
          1000,
          0
        );
        setDonationData(data || null);
      } catch (error) {
        console.error("Error fetching donation data:", error);
      }
    })();
  }, [project?.id]);

  useEffect(() => {
    if (!donationData) return;
    setIsLoading(true);
    setTotalDonationsPOL(calculateTotalDonations(donationData.donations));
    setTransactionCount(donationData.donations.length);
    setIsLoading(false);
  }, [donationData]);

  useEffect(() => {
    if (!donationData || !project?.abc?.fundingManagerAddress) return;
    const fundingManagerAddress = project.abc.fundingManagerAddress;
    setMarketCapLoading(true);
    (async () => {
      try {
        if (donationData.donations.length && activeRoundDetails) {
          // 24-hour change
          const res24 = await calculateMarketCapChange(
            donationData.donations,
            fundingManagerAddress,
            24,
            activeRoundDetails.startDate
          );

          // 7-day change
          const res7d = await calculateMarketCapChange(
            donationData.donations,
            fundingManagerAddress,
            24 * 7,
            activeRoundDetails.startDate
          );

          setMarketCap(res24.marketCap * polPriceNumber);
          setMarketCapChange24h(res24.pctChange);
          setMarketCapChange7d(res7d.pctChange);
        } else if (isTokenListed && project.abc?.issuanceTokenAddress) {
          const issuanceTokenAddress = project.abc.issuanceTokenAddress;
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
          setMarketCapChange7d(gecko?.pctChange7d ?? 0);
        } else if (!isTokenListed && project.abc?.issuanceTokenAddress) {
          // For tokens not listed, derive market cap from bonding curve parameters
          const issuanceTokenAddress = project.abc.issuanceTokenAddress;
          const marketCapData = await getMarketCap(
            false,
            issuanceTokenAddress,
            fundingManagerAddress,
            donationData.donations
          );

          setMarketCap(marketCapData * polPriceNumber);
          setMarketCapChange24h(0);
          setMarketCapChange7d(0);
        }
      } catch (error) {
        console.error("Error fetching market cap data:", error);
      } finally {
        setMarketCapLoading(false);
      }
    })();
  }, [
    donationData,
    project?.abc?.fundingManagerAddress,
    activeRoundDetails,
    isTokenListed,
    polPriceNumber,
    supplyDetails,
  ]);

  const isRoundActive = !!activeRoundDetails;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Project/Round Information Card */}
      <div className="bg-white/5 rounded-3xl p-3 md:p-5 backdrop-blur-lg bg-opacity-80 relative">
        {isRoundActive && (
          <div className="absolute -top-2 left-[78px] -translate-x-1/2">
            <span className="bg-green-500 text-black text-[13px] font-bold px-2 py-1 rounded-lg">
              LIVE
            </span>
          </div>
        )}

          <div className="my-auto flex flex-col sm:flex-row justify-between items-center gap-4 lg:gap-6">
            <h3 className="text-[22px] font-anton text-center  sm:text-right text-white/30 w-fit sm:w-[78px] leading-none">
              <span className="">
                Q/ACC 
              </span>
              <br className="hidden sm:block" /> 
              <span className="ml-2 sm:ml-0">ROUNDS</span>
            </h3>
            <div className="flex justify-between items-center w-full gap-4 lg:gap-6">
              {/* Supporters Count */}
              <div className="space-y-0.1 flex-1 text-center">
                <div className="text-white text-center text-xl md:text-2xl font-bold">
                  {project.countUniqueDonors || 0}
                </div>
                <div className="text-white/30 text-center font-medium text-[13px] leading-normal">
                  Supporters
                </div>
              </div>

              {/* Total Raised */}
              <div className="space-y-0.1 flex-1 text-center">
                <div className="text-white text-center text-xl md:text-2xl font-bold">
                  {formatAmount(totalDonationsPOL)} POL
                </div>
                <div className="text-white/30 text-center font-medium text-[13px] leading-normal">
                  Total Raised ≈ $
                  {formatAmount(totalDonationsPOL * polPriceNumber)}
                </div>
              </div>

              <div className="space-y-0.1 flex-1 text-center">
                <div className="text-white text-center text-2xl font-bold">
                  {transactionCount}
                </div>
                <Link
                  href={`https://polygonscan.com/address/${project.abc?.fundingManagerAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className=""
                >
                  <span className="text-white/30 underline text-center font-medium text-[13px] leading-normal flex items-center justify-center gap-0.5">
                    Transactions
                    <ArrowUpRight className="w-4 h-4 text-white/30" />
                  </span>
                </Link>
              </div>
            </div>
          </div>
      </div>

      {/* Market Data Card */}
      <div className="bg-white/5 rounded-3xl p-3 md:p-5 backdrop-blur-lg bg-opacity-80">
        <div className="my-auto flex flex-col sm:flex-row justify-between items-center gap-4 lg:gap-6">
          <h3 className="text-[22px] font-anton text-center  sm:text-right text-white/30 w-fit sm:w-[78px] leading-none">
            <span className="">MARKET</span>
            <br className="hidden sm:block" />
            <span className="ml-2 sm:ml-0">DATA</span>
          </h3>

          <div className="flex justify-between items-center w-full gap-4 lg:gap-6">

          {/* Token Price */}
          <div className="space-y-0.1 flex-1 text-center">
            <div className="text-white text-center text-xl md:text-2xl font-bold">
              ${formatNumber(tokenPriceUSD)}
            </div>
            <div className="text-white/30 text-center font-medium text-[13px] leading-normal">
              Price: {formatNumber(tokenPricePOL)} POL
            </div>
          </div>

          {/* Holders */}
          <div className="space-y-0.1 flex-1 text-center">
            <div className="text-white text-center text-xl md:text-2xl font-bold">
              {formatNumber(tokenHoldersCount)}
            </div>
            <div className="text-white/30 text-center font-medium text-[13px] leading-normal">
              Holders
            </div>
          </div>

          {/* 24h Change */}
          {isTokenListed && (
            <div className="space-y-0.1 flex-1 text-center">
              <div className="text-white text-center flex flex-row gap-0.5 text-xl md:text-2xl font-bold">
                <span>
                  {marketCapLoading ? (
                    <Spinner size={16} />
                  ) : (
                    <span
                      className={
                        formatPercentageChange(marketCapChange24h).color
                      }
                    >
                      {formatPercentageChange(marketCapChange24h).formatted}
                    </span>
                  )}
                </span>
              </div>
              <div className="text-white/30 text-center font-medium text-[13px] leading-normal">
                24h Change
              </div>
            </div>
          )}

          {/* Market Cap */}
          <div className="space-y-0.1 flex-1 text-center">
            <div className="text-white text-center  text-xl md:text-2xl font-bold">
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

          {/* Token Listing Status */}
          {isTokenListed === false && (
            <div className="space-y-0.1 flex-1 text-center">
              <div className="text-white text-center text-xl font-bold">
                DEX Listing Soon
              </div>
              {project.socialMedia?.find((s) => s.type === "X")?.link && (
                <div className="text-white/30 text-center font-medium text-[13px] leading-normal">
                  Follow the team's{" "}
                  <a
                    href={
                      project.socialMedia?.find((s) => s.type === "X")?.link
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-white transition-colors"
                  >
                    X
                  </a>{" "}
                  for updates
                </div>
              )}
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}

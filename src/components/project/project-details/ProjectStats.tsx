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
} from "@/services/tokenPrice.service";
import { formatNumber } from "@/helpers/donations";
import { Spinner } from "@/components/loaders/Spinner";

interface ProjectStatsProps {
  project: IProject;
}

export default function ProjectStats({ project }: ProjectStatsProps) {
  const { data: POLPrice } = useFetchPOLPriceSquid();
  const { data: activeRoundDetails } = useFetchActiveRoundDetails();

  const [totalDonationsPOL, setTotalDonationsPOL] = useState<number>(0);
  const [transactionCount, setTransactionCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  // Token price and listing status
  const { isTokenListed, currentTokenPrice } = useGetCurrentTokenPrice(
    project.abc?.issuanceTokenAddress
  );

  // Market cap and change data
  const [marketCap, setMarketCap] = useState(0);
  const [marketCapChange24h, setMarketCapChange24h] = useState(0);
  const [marketCapChange7d, setMarketCapChange7d] = useState(0);
  const [marketCapLoading, setMarketCapLoading] = useState(false);

  const isQaccRoundEnded = useFetchMostRecentEndRound(activeRoundDetails);

  const polPriceNumber = Number(POLPrice);

  // Calculate token price in USD
  const tokenPriceUSD = currentTokenPrice
    ? currentTokenPrice * polPriceNumber
    : 0;

  useEffect(() => {
    if (project?.id) {
      const fetchProjectStats = async () => {
        setIsLoading(true);
        try {
          const donationData = await fetchProjectDonationsById(
            parseInt(project.id),
            1000,
            0
          );

          if (donationData) {
            setTotalDonationsPOL(
              calculateTotalDonations(donationData.donations)
            );
            setTransactionCount(donationData.donations?.length || 0);
          }
        } catch (error) {
          console.error("Error fetching project stats:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchProjectStats();
    }
  }, [project?.id, activeRoundDetails]);

  // Fetch market cap and change data
  useEffect(() => {
    const fetchMarketCapData = async () => {
      if (!project?.id || !project.abc?.fundingManagerAddress) return;

      setMarketCapLoading(true);
      try {
        const donationData = await fetchProjectDonationsById(
          parseInt(project.id),
          1000,
          0
        );

        if (donationData?.donations && activeRoundDetails) {
          // Calculate 24h change
          const { marketCap: newCap, change24h } =
            await calculateMarketCapChange(
              donationData.donations,
              project.abc.fundingManagerAddress,
              activeRoundDetails.startDate
            );

          setMarketCap(newCap * polPriceNumber);
          setMarketCapChange24h(change24h);

          // For 7-day change, we can use a similar approach but with 7-day cutoff
          // For now, using the same calculation as 24h but this can be enhanced
          setMarketCapChange7d(change24h);
        } else if (isTokenListed && project.abc?.issuanceTokenAddress) {
          // If token is listed, get market cap from DEX
          const marketCapData = await getMarketCap(
            isTokenListed,
            project.abc.issuanceTokenAddress,
            project.abc.fundingManagerAddress
          );
          setMarketCap(marketCapData);
        }
      } catch (error) {
        console.error("Error fetching market cap data:", error);
      } finally {
        setMarketCapLoading(false);
      }
    };

    fetchMarketCapData();
  }, [
    project?.id,
    project.abc?.fundingManagerAddress,
    activeRoundDetails,
    isTokenListed,
    polPriceNumber,
  ]);

  const isRoundActive = !!activeRoundDetails;

  // Helper function to format percentage change with color
  const formatPercentageChange = (change: number) => {
    const isPositive = change >= 0;
    const color = isPositive ? "text-green-400" : "text-red-400";
    const sign = isPositive ? "↑" : "↓";
    return (
      <span className={color}>
        {sign}
        {formatNumber(change)}%
      </span>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Project/Round Information Card */}
      <div className="bg-white/5 rounded-3xl p-5 backdrop-blur-lg bg-opacity-80 relative">
        {isRoundActive && (
          <div className="absolute -top-2 left-[78px] -translate-x-1/2">
            <span className="bg-green-500 text-black text-[13px] font-bold px-2 py-1 rounded-lg">
              LIVE
            </span>
          </div>
        )}

        <div className="">
          <div className="flex flex-row justify-between items-center flex-1 gap-4 lg:gap-6">
            <h3 className="text-[22px] font-anton text-right text-white/30 w-[78px] flex items-end gap-2 leading-none">
              <span className="text-white/30">
                {activeRoundDetails?.roundNumber === 1
                  ? "1st"
                  : activeRoundDetails?.roundNumber === 2
                  ? "2nd"
                  : activeRoundDetails?.roundNumber === 3
                  ? "3rd"
                  : `1st`}
              </span>
              <span className="">
                Q/ACC <br /> ROUND
              </span>
            </h3>
            {/* Supporters Count */}
            <div className="space-y-0.1">
              <div className="text-white text-center text-2xl font-bold">
                {project.countUniqueDonors || 0}
              </div>
              <div className="text-white/30 text-center font-medium text-[13px] leading-normal">
                Supporters
              </div>
            </div>

            {/* Total Raised */}
            <div className="space-y-0.1">
              <div className="text-white text-center text-2xl font-bold">
                {formatAmount(totalDonationsPOL)} POL
              </div>
              <div className="text-white/30 text-center font-medium text-[13px] leading-normal">
                Total Raised ≈ $
                {formatAmount(totalDonationsPOL * polPriceNumber)}
              </div>
            </div>

            <div className="space-y-0.1">
              <div className="text-white text-center text-2xl font-bold">
                {transactionCount}
              </div>
              <div className="text-white/30 text-center font-medium text-[13px] leading-normal">
                Transactions
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Market Data Card */}
      <div className="bg-white/5 rounded-3xl p-5 backdrop-blur-lg bg-opacity-80">
        <div className="flex flex-row justify-between items-center flex-1 gap-4 lg:gap-6">
          <h3 className="text-[22px] font-anton text-right text-white/30 w-[78px] leading-none">
            <span className="text-white/30">MARKET</span>
            <br />
            <span className="">DATA</span>
          </h3>

          {/* Token Price */}
          <div className="space-y-0.1">
            <div className="text-white text-center text-2xl font-bold">
              ${formatNumber(tokenPriceUSD)}
            </div>
            <div className="text-white/30 text-center font-medium text-[13px] leading-normal">
              Price: {formatNumber(currentTokenPrice || 0)} POL
            </div>
          </div>

          {/* Holders */}
          <div className="space-y-0.1">
            <div className="text-white text-center text-2xl font-bold">
              {formatNumber(project.countUniqueDonors || 0)}
            </div>
            <div className="text-white/30 text-center font-medium text-[13px] leading-normal">
              Holders
            </div>
          </div>

          {/* 24h Change */}
          <div className="space-y-0.1">
            <div className="text-white text-center flex flex-row gap-2 text-2xl font-bold">
              <span>
                {marketCapLoading ? (
                  <Spinner size={16} />
                ) : (
                  formatPercentageChange(marketCapChange24h)
                )}
              </span>
              
              <span>
                {marketCapLoading ? (
                  <Spinner size={16} />
                ) : (
                  formatPercentageChange(marketCapChange7d)
                )}
              </span>
            </div>
            <div className="text-white/30 text-center font-medium text-[13px] leading-normal">
              24h/7d Change
            </div>
          </div>

          {/* Market Cap */}
          <div className="space-y-0.1">
            <div className="text-white text-center text-2xl font-bold">
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
            <div className="space-y-0.1">
              <div className="text-white text-center text-2xl font-bold">
                Not listed
              </div>
              <div className="text-white/30 text-center font-medium text-[13px] leading-normal">
                Follow the team's{" "}
                <a
                  href={project.socialMedia?.find((s) => s.type === "X")?.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-white transition-colors"
                >
                  X
                </a>{" "}
                for updates
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

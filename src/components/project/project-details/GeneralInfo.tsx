"use client";

import { IconMoneybag } from "@tabler/icons-react";
import {
  Clock,
  Coins,
  ChartColumn,
  CalendarDays,
  Link as LinkIcon,
  ShieldCheck,
  Award,
  UserCircle,
  ListChecks,
  Rocket,
  Users,
  DollarSign,
} from "lucide-react";
import { IProject } from "@/types/project.type";
import { formatAmount, calculateTotalDonations } from "@/helpers/donations";
import {
  calculateMarketCapChange,
  getMarketCap,
} from "@/services/tokenPrice.service";
import { useState } from "react";
import { useEffect } from "react";
import { fetchProjectDonationsById } from "@/services/donation.service";
import { useFetchActiveRoundDetails } from "@/hooks/useRounds";
import { useFetchPOLPriceSquid } from "@/hooks/useTokens";
import ProjectDonateButton from "./ProjectDonateButton";
import { getPoolAddressByPair } from "@/helpers/getTokensListedData";
import config from "@/config/configuration";

interface GeneralInfoProps {
  projectData: IProject;
}

export default function GeneralInfo({ projectData }: GeneralInfoProps) {
  const { data: POLPrice } = useFetchPOLPriceSquid();
  const { data: activeRoundDetails } = useFetchActiveRoundDetails();
  const [marketCapLoading, setMarketCapLoading] = useState(false);

  const polPriceNumber = Number(POLPrice);

  const [totalDonationsPOL, setTotalDonationsPOL] = useState<number>(0);
  const [isTokenListed, setIsTokenListed] = useState(false);

  useEffect(() => {
    if (projectData?.id) {
      const fetchProjectRelatedData = async () => {
        setMarketCapLoading(true);
        const donationData = await fetchProjectDonationsById(
          parseInt(projectData?.id),
          1000,
          0
        );

        if (donationData) {
          setTotalDonationsPOL(calculateTotalDonations(donationData.donations));
        }
        setMarketCapLoading(false);
      };
      fetchProjectRelatedData();
    }
  }, [projectData, activeRoundDetails, polPriceNumber, isTokenListed]);

  useEffect(() => {
    const fetchPoolAddress = async () => {
      if (projectData?.abc?.issuanceTokenAddress) {
        const { price, isListed } = await getPoolAddressByPair(
          projectData.abc.issuanceTokenAddress,
          config.WPOL_TOKEN_ADDRESS
        );
        setIsTokenListed(isListed);
      }
    };

    fetchPoolAddress();
  }, [projectData?.abc?.issuanceTokenAddress]);

  const abcLaunched = !!(
    projectData.abc?.orchestratorAddress ||
    projectData.abc?.fundingManagerAddress
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-neutral-800 rounded-2xl p-6 backdrop-blur-lg bg-opacity-80">
          <div>
            <div className="text-gray-400 mb-2 flex items-center gap-2">
              <DollarSign size={18} /> Total Received
            </div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold">
                ${formatAmount(totalDonationsPOL * polPriceNumber)}
              </span>
              <span className="text-2xl text-gray-400">
                /
              </span>
              <span className="text-2xl text-gray-400">
                {formatAmount(totalDonationsPOL)} POL
              </span>
            </div>
          </div>

          {/* General Info */}
          <div className=" mt-8">
            <h2 className="text-xl font-bold mb-6">General Info</h2>
            <div className="space-y-4">
              {projectData.seasonNumber !== undefined && (
                <div className="flex items-center gap-3">
                  <Award size={20} className="text-gray-400" />
                  <span>Season Number:</span>
                  <span className="font-bold">{projectData.seasonNumber}</span>
                </div>
              )}

              <div className="flex items-center gap-3">
                <ListChecks size={20} className="text-gray-400" />
                <span>Token Listed:</span>
                <span className="font-bold">
                  {isTokenListed
                    ? "Yes"
                    : projectData.batchNumbersWithSafeTransactions?.length !== 0
                    ? "DEX listing soon"
                    : "No"}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Rocket size={20} className="text-gray-400" />
                <span>ABC Launched:</span>
                <span className="font-bold">{abcLaunched ? "Yes" : "No"}</span>
              </div>

              {projectData.countUniqueDonors !== undefined && (
                <div className="flex items-center gap-3">
                  <Users size={20} className="text-gray-400" />
                  <span>Unique Donors:</span>
                  <span className="font-bold">
                    {projectData.countUniqueDonors}
                  </span>
                </div>
              )}

              {projectData.hasEARound !== undefined && (
                <div className="flex items-center gap-3">
                  <ShieldCheck size={20} className="text-gray-400" />
                  <span>Early Access Round:</span>
                  <span className="font-bold">
                    {projectData.hasEARound ? "Yes" : "No"}
                  </span>
                </div>
              )}

              {projectData.abc?.issuanceTokenAddress && (
                <div className="flex items-center gap-3">
                  <LinkIcon size={20} className="text-gray-400" />
                  <span>Issuance Token:</span>
                  <a
                    href={`https://polygonscan.com/token/${projectData.abc.issuanceTokenAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-peach-400 hover:underline truncate max-w-[150px] sm:max-w-full"
                    title={projectData.abc.issuanceTokenAddress}
                  >
                    {projectData.abc.issuanceTokenAddress}
                  </a>
                </div>
              )}

              {projectData.adminUser?.walletAddress && (
                <div className="flex items-center gap-3">
                  <UserCircle size={20} className="text-gray-400" />
                  <span>Admin Address:</span>
                  <a
                    href={`https://polygonscan.com/address/${projectData.adminUser.walletAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-peach-400 hover:underline truncate max-w-[150px] sm:max-w-full"
                    title={projectData.adminUser.walletAddress}
                  >
                    {projectData.adminUser.walletAddress}
                  </a>
                </div>
              )}

              {activeRoundDetails && (
                <>
                  <div className="flex items-center gap-3">
                    <Clock size={20} className="text-gray-400" />
                    <span>Public sale will start in</span>
                    <span className="font-bold">TBA</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 row-2">
        <div className="bg-neutral-800 rounded-2xl p-6 backdrop-blur-lg bg-opacity-80">
          <p className="text-gray-300 font-medium">
            Backed by{" "}
            <span className="text-white font-bold">
              {projectData.countUniqueDonors}
            </span>{" "}
            supporters
          </p>
          <div className="space-y-6 mt-8">
            <div>
              <p className="text-gray-400 font-medium mb-2">Token price</p>
              <div className="flex items-center gap-2">
                <p className="text-neutral-300 text-lg font-semibold">
                  ${projectData.abc?.tokenPrice}
                </p>{" "}
              </div>
            </div>
            <ProjectDonateButton />
          </div>
        </div>
      </div>
    </div>
  );
}

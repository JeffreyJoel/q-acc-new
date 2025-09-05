import React, { useEffect, useState } from "react";
import Image from "next/image";
import { formatUnits } from "viem";
import { formatDateMonthDayYear, isMiddleOfThePeriod } from "@/helpers/date";
import { fetchProjectDonationsById } from "@/services/donation.service";
import {
  calculateTotalDonations,
  calculateUniqueDonors,
  formatAmount,
} from "@/helpers/donations";
import { useFetchAllRoundDetails } from "@/hooks/useRounds";
import { IEarlyAccessRound, IQfRound } from "@/types/round.type";
import { useTokenPrice } from "@/hooks/useTokens";
import {
  useTokenPriceRange,
  useTokenPriceRangeStatus,
} from "@/services/tokenPrice.service";
import {
  useClaimCollectedFee,
  useClaimedTributesAndMintedTokenAmounts,
  useProjectCollateralFeeCollected,
} from "@/hooks/useTribute";
import { useFetchActiveRoundDetails } from "@/hooks/useRounds";
import { calculateCapAmount } from "@/helpers/round";
import { EProjectSocialMediaType } from "@/types/project.type";
import { useTokenSupplyDetails } from "@/hooks/useTokens";
import { Eye, Pencil } from "lucide-react";
import { IProject } from "@/types/project.type";
import { toast } from "sonner";
import { handleImageUrl } from "@/helpers/image";
import { useRouter } from "next/navigation";

const MyProjects = ({ projectData }: { projectData: IProject }) => {
  const projectId = projectData?.id;
  const router = useRouter();

  const [donations, setDonations] = useState<any[]>([]);
  const [totalDonationsCount, setTotalDonationsCount] = useState(0);
  const [uniqueDonars, setUniqueDonars] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const { data: POLPrice } = useTokenPrice();
  // Dummy placeholders for wallet/token stats (replace with real data when available)
  const inWallet = 0;
  const locked = 0;
  const claimable = 0;
  const totalAmountPerToken = 0;
  const totalAmountPerTokenInUSD = 0;

  function formatValue(value: number) {
    const valueStr = value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const [whole, frac] = valueStr.split(".");
    return { whole, frac };
  }
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

  const [maxPOLCap, setMaxPOLCap] = useState(0);
  const [totalAmountDonated, setTotalAmountDonated] = useState(0);

  const round1 = allRoundData?.find(
    (round) =>
      round.__typename === "EarlyAccessRound" && round.roundNumber === 1
  );

  const { data: tokenDetails } = useTokenSupplyDetails(
    projectData?.abc?.fundingManagerAddress!
  );
  // Check if Round 1 has started
  const round1Started = round1
    ? new Date().toISOString().split("T")[0] >=
      new Date(round1.startDate).toISOString().split("T")[0]
    : false;

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

  const { claim } = useClaimCollectedFee({
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

  // Setup project image
  const backgroundImage = projectData?.image
    ? `url(${projectData?.image})`
    : "";

  const website = projectData.socialMedia?.find(
    (social) => social.type === EProjectSocialMediaType.WEBSITE
  )?.link;

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
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-base font-medium uppercase bg-[#6DC28F4D] text-[#6DC28F]">
                <span className="h-2 w-2 rounded-full bg-green-400" />
                active
              </div>

              <button
                className="bg-peach-400 text-black uppercase inline-flex items-center gap-2 px-3 py-2 rounded-xl text-base font-medium"
                onClick={() => {
                  router.push(`/project/${projectData?.slug}`);
                }}
              >
                <Eye className="w-5 h-5" />
                View Project
              </button>

              <button
                className="bg-black border border-peach-400 text-peach-400 uppercase inline-flex items-center gap-2 px-3 py-2 rounded-xl text-base font-medium"
                onClick={() => {
                  router.push(`/project/edit/${projectId}`);
                }}
              >
                <Pencil className="w-5 h-5" />
                Edit Project
              </button>
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
            <span className="font-medium text-white font-ibm-mono">
              {formatAmount(claimableFeesFormated)} WPOL
            </span>
          </div>

          <div className="flex gap-4 justify-between py-4">
            <p className="text-white font-medium">Team tokens available</p>
            <span className="font-medium text-white/30 font-ibm-mono">
              {formatAmount(mintedTokenAmounts)} {projectData?.abc?.tokenTicker}{" "}
            </span>
          </div>

          <div className="flex gap-4 justify-between pb-4">
            <p className="text-white font-medium">Unlock Remaining</p>
            <span className="font-medium text-white font-ibm-mono">
              {formatAmount(claimableFeesFormated)} WPOL
            </span>
          </div>
        </div>
      </div>

      {filteredRoundData.activeRound && (filteredRoundData.activeRound as any).startDate && (
        <div className="mt-4 space-y-4">
          <div className="py-5 px-20 bg-white/[5%] rounded-3xl">
            <div className="hidden md:flex flex-nowrap flex-row justify-between items-center flex-1 gap-8 lg:gap-10">
              <h3 className="text-[22px] font-anton text-right text-white/30 flex items-end gap-2 leading-none">
                <span className="">
                  Team <br /> Tokens
                </span>
              </h3>
              <div className="space-y-0.1">
                <div className="text-white text-2xl text-center font-bold">
                  {inWallet > 0 ? (
                    <>
                      {formatValue(inWallet).whole}
                      <span className="text-base align-bottom">
                        .{formatValue(inWallet).frac}
                      </span>
                    </>
                  ) : (
                    <span className="text-white/30">0</span>
                  )}
                </div>
                <div className="text-white/30 text-center font-medium text-[13px] leading-normal">
                  Team Tokens
                </div>
              </div>

              {/* Total Raised */}
              <div className="space-y-0.1">
                <div className="text-white text-center text-2xl font-bold">
                  {locked > 0 ? (
                    <>
                      {formatValue(locked).whole}
                      <span className="text-base align-bottom">
                        .{formatValue(locked).frac}
                      </span>
                    </>
                  ) : (
                    <span className="text-white/30">0</span>
                  )}
                </div>
                <div className="text-white/30 text-center font-medium text-[13px] leading-normal">
                  Value
                </div>
              </div>

              <div className="space-y-0.1">
                <div className="text-white text-center text-2xl font-bold">
                  {claimable > 0 ? (
                    <>
                      {formatValue(claimable).whole}
                      <span className="text-base align-bottom">
                        .{formatValue(claimable).frac}
                      </span>
                    </>
                  ) : (
                    <span className="text-white/30">0</span>
                  )}
                </div>
                <span className="text-white/30 text-center font-medium text-[13px] leading-normal flex items-center justify-center gap-0.5">
                  % of Total
                </span>
              </div>

              <div className="space-y-0.1">
                <div className="text-white text-center text-2xl font-bold">
                  {totalAmountPerToken > 0 ? (
                    <>
                      {formatValue(totalAmountPerToken).whole}
                      <span className="text-base align-bottom">
                        .{formatValue(totalAmountPerToken).frac}
                      </span>
                    </>
                  ) : (
                    <span className="text-white/30">0</span>
                  )}
                </div>
                <span className="text-white/30 text-center font-medium text-[13px] leading-normal flex items-center justify-center gap-0.5">
                  Available to claim
                </span>
              </div>

              <div className="space-y-0.1">
                <div className="text-white text-center text-2xl font-bold">
                  {totalAmountPerTokenInUSD > 0 ? (
                    <>
                      {formatValue(totalAmountPerTokenInUSD).whole}
                      <span className="text-base align-bottom">
                        .{formatValue(totalAmountPerTokenInUSD).frac}
                      </span>
                    </>
                  ) : (
                    <span className="text-white/30">0</span>
                  )}
                </div>
                <span className="text-white/30 text-center font-medium text-[13px] leading-normal flex items-center justify-center gap-0.5">
                  Unlock Date
                </span>
              </div>

              <div className="space-y-0.1">
                <div className="text-white text-center text-2xl font-bold">
                  {" "}
                  <span className="text-white/30">0</span>
                </div>
                <span className="text-white/30 text-center font-medium text-[13px] leading-normal flex items-center justify-center gap-0.5">
                  Vesting Until
                </span>
              </div>
            </div>
          </div>

          <div className="py-5 px-20 bg-white/[5%] rounded-3xl">
            <div className="hidden md:flex flex-nowrap flex-row justify-between items-center flex-1 gap-8 lg:gap-10">
              <h3 className="text-[22px] font-anton text-right text-white/30 flex items-end gap-2 leading-none">
                <span className="">
                  Q/ACC
                  <br />
                  ROUNDS
                </span>
              </h3>
              <div className="space-y-0.1">
                <div className="text-white text-2xl text-center font-bold">
                  {inWallet > 0 ? (
                    <>
                      {formatValue(inWallet).whole}
                      <span className="text-base align-bottom">
                        .{formatValue(inWallet).frac}
                      </span>
                    </>
                  ) : (
                    <span className="text-white/30">0</span>
                  )}
                </div>
                <div className="text-white/30 text-center font-medium text-[13px] leading-normal">
                  Supporters
                </div>
              </div>

              {/* Total Raised */}
              <div className="space-y-0.1">
                <div className="text-white text-center text-2xl font-bold">
                  {locked > 0 ? (
                    <>
                      {formatValue(locked).whole}
                      <span className="text-base align-bottom">
                        .{formatValue(locked).frac}
                      </span>
                    </>
                  ) : (
                    <span className="text-white/30">0</span>
                  )}
                </div>
                <div className="text-white/30 text-center font-medium text-[13px] leading-normal">
                  Transactions
                </div>
              </div>

              <div className="space-y-0.1">
                <div className="text-white text-center text-2xl font-bold">
                  {claimable > 0 ? (
                    <>
                      {formatValue(claimable).whole}
                      <span className="text-base align-bottom">
                        .{formatValue(claimable).frac}
                      </span>
                    </>
                  ) : (
                    <span className="text-white/30">0</span>
                  )}
                </div>
                <span className="text-white/30 text-center font-medium text-[13px] leading-normal flex items-center justify-center gap-0.5">
                  Raised = 0
                </span>
              </div>

              <div className="space-y-0.1">
                <div className="text-white text-center text-2xl font-bold">
                  {totalAmountPerToken > 0 ? (
                    <>
                      {formatValue(totalAmountPerToken).whole}
                      <span className="text-base align-bottom">
                        .{formatValue(totalAmountPerToken).frac}
                      </span>
                    </>
                  ) : (
                    <span className="text-white/30">0</span>
                  )}
                </div>
                <span className="text-white/30 text-center font-medium text-[13px] leading-normal flex items-center justify-center gap-0.5">
                  Tributes Received
                </span>
              </div>

              <div className="space-y-0.1">
                <div className="text-white text-center text-2xl font-bold">
                  {totalAmountPerTokenInUSD > 0 ? (
                    <>
                      {formatValue(totalAmountPerTokenInUSD).whole}
                      <span className="text-base align-bottom">
                        .{formatValue(totalAmountPerTokenInUSD).frac}
                      </span>
                    </>
                  ) : (
                    <span className="text-white/30">0</span>
                  )}
                </div>
                <span className="text-white/30 text-center font-medium text-[13px] leading-normal flex items-center justify-center gap-0.5">
                  Tributes available to claim
                </span>
              </div>
            </div>
          </div>

          <div className="py-5 px-20 bg-white/[5%] rounded-3xl">
            <div className="hidden md:flex flex-nowrap flex-row justify-between items-center flex-1 gap-8 lg:gap-10">
              <h3 className="text-[22px] font-anton text-right text-white/30 flex items-end gap-2 leading-none">
                Market
                <br />
                Data
              </h3>
              <div className="space-y-0.1">
                <div className="text-white text-2xl text-center font-bold">
                  {inWallet > 0 ? (
                    <>
                      {formatValue(inWallet).whole}
                      <span className="text-base align-bottom">
                        .{formatValue(inWallet).frac}
                      </span>
                    </>
                  ) : (
                    <span className="text-white/30">0</span>
                  )}
                </div>
                <div className="text-white/30 text-center font-medium text-[13px] leading-normal">
                  Total Supply
                </div>
              </div>

              {/* Total Raised */}
              <div className="space-y-0.1">
                <div className="text-white text-center text-2xl font-bold">
                  {locked > 0 ? (
                    <>
                      {formatValue(locked).whole}
                      <span className="text-base align-bottom">
                        .{formatValue(locked).frac}
                      </span>
                    </>
                  ) : (
                    <span className="text-white/30">0</span>
                  )}
                </div>
                <div className="text-white/30 text-center font-medium text-[13px] leading-normal">
                  Holders
                </div>
              </div>

              <div className="space-y-0.1">
                <div className="text-white text-center text-2xl font-bold">
                  {claimable > 0 ? (
                    <>
                      {formatValue(claimable).whole}
                      <span className="text-base align-bottom">
                        .{formatValue(claimable).frac}
                      </span>
                    </>
                  ) : (
                    <span className="text-white/30">0</span>
                  )}
                </div>
                <span className="text-white/30 text-center font-medium text-[13px] leading-normal flex items-center justify-center gap-0.5">
                  Price = 0
                </span>
              </div>

              <div className="space-y-0.1">
                <div className="text-white text-center text-2xl font-bold">
                  {totalAmountPerToken > 0 ? (
                    <>
                      {formatValue(totalAmountPerToken).whole}
                      <span className="text-base align-bottom">
                        .{formatValue(totalAmountPerToken).frac}
                      </span>
                    </>
                  ) : (
                    <span className="text-white/30">0</span>
                  )}
                </div>
                <span className="text-white/30 text-center font-medium text-[13px] leading-normal flex items-center justify-center gap-0.5">
                  24h change
                </span>
              </div>

              <div className="space-y-0.1">
                <div className="text-white text-center text-2xl font-bold">
                  {totalAmountPerTokenInUSD > 0 ? (
                    <>
                      {formatValue(totalAmountPerTokenInUSD).whole}
                      <span className="text-base align-bottom">
                        .{formatValue(totalAmountPerTokenInUSD).frac}
                      </span>
                    </>
                  ) : (
                    <span className="text-white/30">0</span>
                  )}
                </div>
                <span className="text-white/30 text-center font-medium text-[13px] leading-normal flex items-center justify-center gap-0.5">
                  Market Cap
                </span>
              </div>

              <div className="space-y-0.1">
                <div className="text-white text-center text-2xl font-bold">
                  {" "}
                  <span className="text-white/30">0</span>
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

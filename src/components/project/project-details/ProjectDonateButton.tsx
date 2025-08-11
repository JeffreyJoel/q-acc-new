import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
// import { Button, ButtonColor } from '../Button';
import { useProjectContext } from "@/contexts/project.context";
// import { IconTokenSchedule } from '@/components/icons/IconTokenSchedule';
import { getIpfsAddress } from "@/helpers/image";
import { checkUserOwnsNFT } from "@/helpers/token";
import { useFetchActiveRoundDetails } from "@/hooks/useRounds";
import useRemainingTime from "@/hooks/useRemainingTime";
import { useTokenPrice } from "@/hooks/useTokens";
import {
  useTokenPriceRange,
  useTokenPriceRangeStatus,
  calculateMarketCapChange,
  getMarketCap,
} from "@/services/tokenPrice.service";
import { formatAmount, formatNumber } from "@/helpers/donations";
import { calculateCapAmount } from "@/helpers/round";
import { useFetchAllRoundDetails } from "@/hooks/useRounds";
import { getAdjustedEndDate } from "@/helpers/date";
import { getPoolAddressByPair } from "@/helpers/getTokensListedData";
import config from "@/config/configuration";
import {
  EOrderBy,
  EDirection,
} from "@/components/profile/profile-dashboard/DonorSupportTable";
import { fetchProjectDonationsById } from "@/services/donation.service";
import { Spinner } from "@/components/loaders/Spinner";
import { Button } from "@/components/ui/button";

const ProjectDonateButton = () => {
  const { projectData, totalAmount: totalPOLDonated } = useProjectContext();
  const { data: POLPrice } = useTokenPrice();

  const { address } = useAccount();
  const router = useRouter();
  const [ownsNFT, setOwnsNFT] = useState(false);
  const [loadingNFTCheck, setLoadingNFTCheck] = useState(true);
  const { data: activeRoundDetails } = useFetchActiveRoundDetails();
  const [maxPOLCap, setMaxPOLCap] = useState(0);
  const [progress, setProgress] = useState(0);
  const adjustedEndDate = getAdjustedEndDate(activeRoundDetails?.endDate);

  const remainingTime = useRemainingTime(
    activeRoundDetails?.startDate,
    adjustedEndDate
  );
  const [isTokenListed, setIsTokenListed] = useState(false);
  const [currentTokenPrice, setCurrentTokenPrice] = useState(0);

  const [marketCap, setMarketCap] = useState(0);
  const [marketCapChangePercentage, setMarketCapChangePercentage] = useState(0);
  const [marketCapLoading, setMarketCapLoading] = useState(false);

  useEffect(() => {
    if (projectData?.id) {
      const fetchProjectDonations = async () => {
        const data = await fetchProjectDonationsById(
          parseInt(projectData?.id),
          1000,
          0,
          { field: EOrderBy.CreationDate, direction: EDirection.ASC }
        );

        if (
          activeRoundDetails &&
          data &&
          projectData?.abc?.fundingManagerAddress
        ) {
          const { donations, totalCount } = data;
          // setPageDonations(donations);
          setMarketCapLoading(true);
          const capResult1 = (await calculateMarketCapChange(
              donations,
              projectData?.abc?.fundingManagerAddress,
              24,
              activeRoundDetails?.startDate
            )) as { marketCap: number; pctChange: number };
          const { marketCap: newCap, pctChange } = capResult1;

          // console.log(project.title, change24h);
          setMarketCap(newCap * Number(POLPrice));
          setMarketCapChangePercentage(pctChange);
          setMarketCapLoading(false);
        } else if (
          projectData.abc?.issuanceTokenAddress &&
          projectData.abc?.fundingManagerAddress
        ) {
          if (isTokenListed) {
            const marketCapData = await getMarketCap(
              isTokenListed,
              projectData?.abc.issuanceTokenAddress,
              projectData?.abc?.fundingManagerAddress
            );
            setMarketCap(marketCapData);
          } else {
            const { donations, totalCount } = data;
            const capResult2 = (await calculateMarketCapChange(
                donations,
                projectData?.abc?.fundingManagerAddress,
                24
              )) as { marketCap: number; pctChange: number };
            const { marketCap: newCap, pctChange } = capResult2;
            setMarketCap(newCap * Number(POLPrice));
            setMarketCapChangePercentage(pctChange);
          }

          if (isTokenListed) {
            setMarketCapChangePercentage(0);
          }
        }
      };
      fetchProjectDonations();
    }
  }, [projectData, marketCap, isTokenListed, activeRoundDetails]);

  useEffect(() => {
    const fetchPoolAddress = async () => {
      if (projectData?.abc?.issuanceTokenAddress) {
        const { price, isListed } = await getPoolAddressByPair(
          projectData?.abc?.issuanceTokenAddress,
          config.WPOL_TOKEN_ADDRESS
        );
        setIsTokenListed(isListed);
        if (
          projectData?.abc?.issuanceTokenAddress ===
          "0x0b7a46e1af45e1eaadeed34b55b6fc00a85c7c68" //check for prismo token address only
        ) {
          setCurrentTokenPrice(Number(price));
        } else {
          setCurrentTokenPrice(1 / Number(price));
        }
      }
    };

    fetchPoolAddress();
  }, [
    projectData?.abc?.issuanceTokenAddress,
    currentTokenPrice,
    isTokenListed,
  ]);
  useEffect(() => {
    const updatePOLCap = async () => {
      if (activeRoundDetails) {
        const { capAmount, totalDonationAmountInRound }: any =
          await calculateCapAmount(activeRoundDetails, Number(projectData?.id));

        setMaxPOLCap(capAmount);
        let tempprogress = 0;
        if (maxPOLCap > 0) {
          tempprogress =
            Math.round((totalDonationAmountInRound / capAmount) * 100 * 100) /
            100;
          setProgress(tempprogress);
        }
      }
    };

    updatePOLCap();
  }, [totalPOLDonated, activeRoundDetails, projectData, maxPOLCap]);

  useEffect(() => {
    const checkNFT = async () => {
      if (projectData?.abc?.nftContractAddress && address) {
        const res = await checkUserOwnsNFT(
          projectData?.abc?.nftContractAddress,
          address
        );
        setOwnsNFT(res);
      }
      setLoadingNFTCheck(false);
    };
    checkNFT();
  }, [projectData?.abc?.nftContractAddress, address]);

  const handleSupport = (e: any) => {
    e.stopPropagation();
    if (activeRoundDetails?.__typename === "QfRound") {
      router.push(`/support/${projectData?.slug}`);
    } else if (ownsNFT) {
      router.push(`/support/${projectData?.slug}`);
    }
  };

  // New token price logic

  const tokenPriceRange = useTokenPriceRange({
    contributionLimit: maxPOLCap,
    contractAddress: projectData?.abc?.fundingManagerAddress || "",
  });

  const { data: allRounds } = useFetchAllRoundDetails();
  const tokenPriceRangeStatus = useTokenPriceRangeStatus({
    project: projectData,
    allRounds,
  });

  const TokenInfo = () => (
    <div className="flex flex-col gap-4 font-redHatText">
      {/* <div className='flex flex-col gap-2'>
        <div className='flex gap-2'>
          <img
            className='w-6 h-6 rounded-full'
            src={getIpfsAddress(
              projectData.abc?.icon! ||
                'Qmeb6CzCBkyEkAhjrw5G9GShpKiVjUDaU8F3Xnf5bPHtm4',
            )}
          />
          <span className='text-gray-400 font-semibold text-sm '>
            {projectData.abc.tokenTicker} price on Quickswap
          </span>
        </div>

        <div className='flex justify-between items-center'>
          {isTokenListed ? (
            <>
              <span className='text-white font-bold text-lg'>
                {' '}
                ~ ${' '}
                {POLPrice
                  ? `${' ' + formatNumber(POLPrice * currentTokenPrice)}`
                  : ''}
              </span>
              <span className='text-gray-400 font-semibold'>
                {' '}
                {currentTokenPrice.toFixed(2)} POL
              </span>
            </>
          ) : (
            <>
              <span className='text-white font-bold text-lg'>---</span>
              <span className='text-gray-400 font-semibold'>---</span>
            </>
          )}
        </div>
      </div>
      <hr /> */}

      {isTokenListed && (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <img
              className="w-6 h-6 rounded-full"
              src={getIpfsAddress(
                projectData?.abc?.icon! ||
                  "Qmeb6CzCBkyEkAhjrw5G9GShpKiVjUDaU8F3Xnf5bPHtm4"
              )}
            />
            <span className="text-gray-400 font-semibold text-sm ">
              {projectData?.abc?.tokenTicker} price on Quickswap
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-white font-bold text-lg">
              {" "}
              ~ ${" "}
              {POLPrice
                ? `${" " + formatNumber(POLPrice * currentTokenPrice)}`
                : ""}
            </span>
            <span className="text-gray-400 font-semibold">
              {" "}
              {currentTokenPrice.toFixed(2)} POL
            </span>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        {/* Market Cap */}
        <div className="flex flex-col gap-2">
          <span className="text-gray-400 font-semibold text-sm">
            {projectData?.abc?.tokenTicker} Market Cap
          </span>
          {!marketCap || marketCap === 0 || marketCapLoading ? (
            <Spinner size={16} />
          ) : (
            <span className="text-white font-bold text-lg">
              {" "}
              $ {formatAmount(marketCap)}
            </span>
          )}
        </div>

        {/* 24 h Change */}

        <div className="flex flex-col gap-2 group relative">
          {activeRoundDetails ? (
            <span className="text-gray-400 font-semibold text-sm">
              Change this round
            </span>
          ) : (
            ""
          )}

          <span className="flex  items-center gap-1  justify-end text-gray-400 font-semibold ">
            {" "}
            {activeRoundDetails && !marketCapLoading && marketCap > 0 ? (
              <>
                {" "}
                {formatNumber(marketCapChangePercentage) + "%"}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M3.33398 8.00065L8.00065 3.33398M8.00065 3.33398L12.6673 8.00065M8.00065 3.33398V12.6673"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="stroke-gray-400"
                  />
                </svg>
              </>
            ) : (
              ""
            )}
          </span>
          <div
            className="
                absolute top-full left-1/2 transform -translate-x-1/2 mt-1
                bg-gray-900 text-white text-sm font-medium px-2 py-1 rounded shadow-lg
                opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out
                pointer-events-none z-50 whitespace-nowrap
              "
          >
            {marketCapChangePercentage}%
          </div>
        </div>
      </div>
    </div>
  );

  const listedPriceInfo = () => (
    <div className="flex flex-col gap-2 font-redHatText">
      <div className="flex justify-start items-center gap-2 ">
        <img
          className="w-6 h-6 rounded-full"
          src={getIpfsAddress(
            projectData?.abc?.icon! ||
              "Qmeb6CzCBkyEkAhjrw5G9GShpKiVjUDaU8F3Xnf5bPHtm4"
          )}
        />
        <div className="flex gap-2 items-center">
          <span className="text-gray-400 font-medium">
            {projectData?.abc?.tokenTicker} Price
          </span>
        </div>

        {/* <IconInfo /> */}
      </div>
      <div className="flex items-center text-sm gap-2 text-neutral-300 flex-wrap justify-between">
        {isTokenListed &&
        tokenPriceRangeStatus.isSuccess &&
        tokenPriceRangeStatus.data?.isPriceUpToDate ? (
          <>
            <h1 className=" flex-1 p-2 bg-neutral-700 rounded-lg pr-10 ">
              <span className="text-white font-medium">
                {currentTokenPrice.toFixed(2)}
              </span>
              <span className="text-gray-400 text-xs"> POL</span>
            </h1>
            <span className="text-gray-400 font-medium">
              ${" "}
              {Number(POLPrice) &&
                formatNumber(Number(POLPrice) * currentTokenPrice)}
            </span>
          </>
        ) : (
          <>
            <h1 className="p-2 bg-neutral-700 rounded-lg pr-10">
              <span className="text-white font-medium">---</span>
              <span className="text-gray-400 text-xs"> POL</span>
            </h1>
            <span className="text-gray-400 font-medium">~$ ---</span>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {TokenInfo()}

      {/* If round is Active show Buy token */}
      {activeRoundDetails && (
        <button
          className="px-6 py-4 rounded-full text-sm font-bold items-center flex gap-2 bg-peach-400  text-black w-full justify-center "
          onClick={handleSupport}
          disabled={
            (activeRoundDetails?.__typename === "EarlyAccessRound" &&
              !ownsNFT) ||
            progress >= 100 ||
            remainingTime === "Time is up!" ||
            remainingTime === "--:--:--"
          }
          //   loading={loadingNFTCheck}
        >
          {remainingTime === "Time is up!" || remainingTime === "--:--:--"
            ? "Buy Token"
            : progress >= 100
            ? "Project Maxed Out"
            : "Buy Token"}
        </button>
      )}

      {/* If round is not active */}
      {!activeRoundDetails ? (
        isTokenListed ? (
          <button
            className="px-6 py-4 rounded-full text-sm font-bold items-center flex gap-2 bg-peach-400  text-black w-full justify-center "
            onClick={() => {
              const url = `https://dapp.quickswap.exchange/swap/best/ETH/${projectData?.abc?.issuanceTokenAddress}`;
              window.open(url, "_blank", "noopener,noreferrer");
            }}
          >
            Get ${projectData?.abc?.tokenTicker} on QuickSwap
          </button>
        ) : projectData?.batchNumbersWithSafeTransactions?.length != 0 ? (
          <button
            className="px-6 py-4 rounded-full text-sm font-bold items-center flex gap-2 bg-peach-400  text-black w-full justify-center "
            disabled={true}
          >
            DEX listing soon
          </button>
        ) : (
          ""
        )
      ) : (
        ""
      )}

      <>
        {/* {isTokenListed ? (
            <Button
              color={ButtonColor.Giv}
              className='w-full justify-center'
              onClick={() => {
                const url = `https://quickswap.exchange/#/swap?currency0=${config.ERC_TOKEN_ADDRESS}&currency1=${projectData?.abc?.issuanceTokenAddress}`;
                window.open(url, '_blank', 'noopener,noreferrer');
              }}
            >
              Get ${projectData?.abc?.tokenTicker} on QuickSwap
            </Button>
          ) : (
            <Button
              color={ButtonColor.Giv}
              className='w-full justify-center rounded-xl'
              onClick={handleSupport}
              disabled={
                (activeRoundDetails?.__typename === 'EarlyAccessRound' &&
                  !ownsNFT) ||
                progress >= 100 ||
                remainingTime === 'Time is up!' ||
                remainingTime === '--:--:--'
              }
              loading={loadingNFTCheck}
            >
              {remainingTime === 'Time is up!' || remainingTime === '--:--:--'
                ? 'Buy Token'
                : progress >= 100
                  ? 'Project Maxed Out'
                  : 'Buy Token'}
            </Button>
          )} */}

        {/* {activeRoundDetails ? (
            activeRoundDetails.__typename === 'EarlyAccessRound' ? (
              !ownsNFT ? (
                <span className='text-[#EA960D] p-1 rounded-full bg-[#FFFBEF] text-xs px-2 text-center font-medium'>
                  Missing early access NFT
                </span>
              ) : (
                <span className='text-[#2EA096] p-1 rounded-full bg-[#D2FFFB] text-xs px-2 text-center font-medium'>
                  You are on the early access list
                </span>
              )
            ) : null
          ) : null} */}
      </>
    </div>
  );
};

export default ProjectDonateButton;

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {formatUnits } from 'viem';
import { IconViewTransaction } from '@/components/icons/IconViewTransaction';
import { IconTotalDonars } from '@/components/icons/IconTotalDonors';
import { IconTotalSupply } from '@/components/icons/IconTotalSupply';
import { IconTotalDonations } from '@/components/icons/IconTotalDonations';
import ProjectSupportTable from './ProjectSupportTable';
import { IconCreatedAt } from '@/components/icons/IconCreatedAt';
import { IconMinted } from '@/components/icons/IconMinted';
import { IconViewProject } from '@/components/icons/IconViewProject';
import { IconEditProject } from '@/components/icons/IconEditProject';
import { IconTributesReceived } from '@/components/icons/IconTributesReceived';
import { IconTokenSchedule } from '@/components/icons/IconTokenSchedule';
import { formatDateMonthDayYear, isMiddleOfThePeriod } from '@/helpers/date';
import { fetchProjectDonationsById } from '@/services/donation.service';
import {
  calculateTotalDonations,
  calculateUniqueDonors,
  formatAmount,
} from '@/helpers/donations';
import { useFetchAllRoundDetails } from '@/hooks/useRounds';
import { IEarlyAccessRound, IQfRound } from '@/types/round.type';
import { useTokenPrice } from '@/hooks/useTokens';
import {
  useTokenPriceRange,
  useTokenPriceRangeStatus,
} from '@/services/tokenPrice.service';
import {
  useClaimCollectedFee,
  useClaimedTributesAndMintedTokenAmounts,
  useProjectCollateralFeeCollected,
} from '@/hooks/useTribute';
import { useFetchActiveRoundDetails } from '@/hooks/useRounds';
import { IconShare } from '@/components/icons/IconShare';
import { IconUnlock } from '@/components/icons/IconUnlock';
import { ShareProjectModal } from '@/components/modals/ShareModal';
import { useAddressWhitelist } from '@/hooks/useAddressWhitelist';
import { calculateCapAmount } from '@/helpers/round';
import { EProjectSocialMediaType } from '@/types/project.type';
import { useTokenSupplyDetails } from '@/hooks/useTokens';
import { ChevronDownIcon, Loader2, SearchIcon } from 'lucide-react';
import { IProject } from '@/types/project.type';
import { toast } from 'sonner';

const MyProjects = ({projectData}:{projectData: IProject}) => {
  const projectId = projectData?.id;
  const projectSlug = projectData?.slug;
  const { data: addrWhitelist } = useAddressWhitelist();
  const [isHovered, setIsHovered] = useState(false);
  const [donations, setDonations] = useState<any[]>([]);
  const [totalDonationsCount, setTotalDonationsCount] = useState(0);
  const [uniqueDonars, setUniqueDonars] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const { data: POLPrice } = useTokenPrice();
  const [searchTerm, setSearchTerm] = useState('');
  const [submittedSearchTerm, setSubmittedSearchTerm] = useState('');
  const [showRoundCollected, setShowRoundCollected] = useState(false);
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
    roundType: '',
    lastRound: {} as IEarlyAccessRound | IQfRound,
    qfRoundEnded: false,
    pastRoundNumber: 1,
  });
  const { data: allRoundData } = useFetchAllRoundDetails();
  const { data: activeRoundDetails } = useFetchActiveRoundDetails();

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const openShareModal = () => setIsShareModalOpen(true);
  const closeShareModal = () => setIsShareModalOpen(false);

  const [maxPOLCap, setMaxPOLCap] = useState(0);
  const [totalAmountDonated, setTotalAmountDonated] = useState(0);

  const round1 = allRoundData?.find(
    round => round.__typename === 'EarlyAccessRound' && round.roundNumber === 1,
  );

  const { data: tokenDetails } = useTokenSupplyDetails(
    projectData?.abc?.fundingManagerAddress!,
  );
  // Check if Round 1 has started
  const round1Started = round1
    ? new Date().toISOString().split('T')[0] >=
      new Date(round1.startDate).toISOString().split('T')[0]
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
    contractAddress: projectData?.abc?.fundingManagerAddress || '',
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
    let roundType = 'ea';
    let qfRoundEnded = false;
    let lastRound: IEarlyAccessRound | IQfRound = {} as
      | IEarlyAccessRound
      | IQfRound;
    let pastRoundNumber = 1;
    allRoundData.forEach(round => {
      const { __typename, startDate, endDate } = round;

      // Update last round if it's an EarlyAccessRound
      if (__typename === 'EarlyAccessRound') {
        lastRound = round;
      }

      // Check if the round is active
      let isActive = isMiddleOfThePeriod(startDate, endDate);
      if (
        (__typename === 'EarlyAccessRound' && isActive) ||
        (__typename === 'QfRound' && isActive)
      ) {
        activeRound = round;
        roundType = __typename;
      }

      // Push past EarlyAccessRounds to pastRounds
      const hasEnded = new Date(endDate) < new Date();
      if (__typename === 'EarlyAccessRound' && (hasEnded || isActive)) {
        pastRounds.push(round);
        pastRoundNumber = round.roundNumber;
      }

      // Check if a QfRound has ended
      if (__typename === 'QfRound' && hasEnded) {
        activeRound = round;
        qfRoundEnded = true;
      }
    });

    // Sort past rounds by endDate in descending order
    pastRounds.sort(
      (a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime(),
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
          0,
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

  // Handler for input change to update searchTerm
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    if (event.target.value === '') {
      setSubmittedSearchTerm(searchTerm);
    }
  };

  const handleShare = () => {
    openShareModal();
  };

  // Handler for search button click
  const handleSearchClick = () => {
    setSubmittedSearchTerm(searchTerm);
  };

  // Handler for detecting Enter key press
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearchClick();
    }
  };

  const projectCollateralFeeCollected = useProjectCollateralFeeCollected({
    contractAddress: projectData?.abc?.fundingManagerAddress!,
  });

  const claimableFees = BigInt(
    (projectCollateralFeeCollected.data || '0').toString(),
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
      projectData?.abc?.projectAddress,
    );

  const { claimedTributes, mintedTokenAmounts } =
    claimedTributesAndMintedTokenAmounts.data || {
      claimedTributes: 0,
      mintedTokenAmounts: 0,
    };

  const { claim } = useClaimCollectedFee({
    fundingManagerAddress: projectData?.abc?.fundingManagerAddress!,
    tributeModule: projectData?.tributeClaimModuleAddress || "0x74248f303f7c74df53aeff401cfacb9875c51690",
    feeRecipient: projectData?.tributeRecipientAddress || projectData?.abc?.creatorAddress!,
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
      <div className='container mx-auto  bg-neutral-800 w-full h-[500px] flex items-center justify-center text-[25px] font-bold text-neutral-300 rounded-2xl'>
        You don't have any project!
      </div>
    );
  }

  // Setup project image
  const backgroundImage = projectData?.image
    ? `url(${projectData?.image})`
    : '';

  const website = projectData.socialMedia?.find(
    social => social.type === EProjectSocialMediaType.WEBSITE,
  )?.link;

  return (
    <div className='container mx-auto'>
      {/* Project Header */}
      <div className='bg-neutral-800 p-6 flex flex-col rounded-xl'>
        <div className='flex flex-col lg:flex-row justify-between lg:items-center'>
          <div className='flex flex-col'>
            <div className='flex gap-2 items-center text-xs font-medium'>
              <IconCreatedAt />
              <span className='text-neutral-400'>Created on</span>
              <span className='text-neutral-300'>
                {formatDateMonthDayYear(projectData?.creationDate ?? '')}
              </span>
            </div>
            <h1 className='text-neutral-100 text-[25px] font-bold'>
              {projectData?.title}
            </h1>
          </div>

          {/* DropDown */}
          <div className='relative w-fit cursor-pointer'>
            <div
              onClick={() => setIsHovered(!isHovered)}
              onMouseLeave={() => setIsHovered(false)}
              className='py-[10px] px-[16px] bg-neutral-700/50 rounded-lg flex gap-2 text-neutral-200 font-medium font-redHatText'
            >
              <span>Actions</span>
              <ChevronDownIcon />
            </div>
            <div
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className={`p-2 flex flex-col absolute bg-neutral-800 md:left-[-100px] shadow-tabShadow rounded-xl  z-30 gap-2 w-[239px] ${isHovered ? 'visible' : 'hidden '} `}
            >
              <Link
                href={`/project/${projectSlug}/`}
                prefetch={true}
                className='p-2 flex gap-2 items-center hover:bg-neutral-700/50 rounded-lg'
              >
                <IconViewProject />
                View project
              </Link>
              <Link
                href={`/project/edit/${projectId}`}
                prefetch={true}
                className='p-2 flex gap-2 items-center hover:bg-neutral-700/50 rounded-lg'
              >
                <IconEditProject />
                Edit project
              </Link>
            </div>
          </div>
        </div>
        <hr className='my-5' />

        <div className='flex flex-col lg:flex-row gap-[60px]'>
          {/* Project banner */}
          <div className='flex flex-col gap-4  w-full lg:w-1/2 '>
            <div
              className='w-full h-[230px] bg-cover bg-center rounded-3xl relative'
              style={{
                backgroundImage: backgroundImage,
              }}
            >
              <div className=' flex flex-col absolute  bottom-[24px] left-[24px] md:bottom-[24px] md:left-[24px] gap-2'>
                <div className='border rounded-md bg-neutral-800 p-1 block w-fit'>
                  <Image
                    src={projectData?.icon || '/images/project-card/logo.svg'}
                    alt=''
                    width={50}
                    height={50}
                  />
                </div>
                <div className='flex flex-col text-white gap-2'></div>
              </div>
            </div>

            <p className='text-neutral-400 font-redHatText leading-6'>
              {projectData?.descriptionSummary}
            </p>

            <div className='flex flex-wrap gap-2'>
              {projectData?.socialMedia
                ?.filter(sm => sm.type !== EProjectSocialMediaType.WEBSITE)
                .map(social => {
                  return (
                    <Link
                      key={social.link}
                      href={social.link}
                      target='_blank'
                      className='p-2 rounded-lg border-neutral-100 border'
                    >
                      <Image
                        src={`/images/icons/social/${social.type.toLowerCase()}.svg`}
                        alt={`${social.type} icon`}
                        width={24}
                        height={24}
                        className='filter invert'
                      />
                    </Link>
                  );
                })}
            </div>

            <div className='flex gap-4 flex-wrap'>
              {website && (
                <Link
                  target='_blank'
                  href={website}
                  className='w-full py-2 px-4 border border-peach-400 rounded-3xl flex justify-center flex-1'
                >
                  <div>
                    <span className='flex gap-4 text-peach-400 font-bold'>
                      Website
                      <IconViewTransaction color='#FBBA80' />
                    </span>
                  </div>{' '}
                </Link>
              )}
              <Link
                target='_blank'
                href={`https://polygonscan.com/token/${projectData?.abc?.issuanceTokenAddress}`}
                className='w-full py-2 px-4 border border-peach-400 rounded-3xl flex justify-center flex-1'
              >
                <div>
                  <span className='flex gap-4 text-peach-400 font-bold text-nowrap'>
                    Contract Address
                    <IconViewTransaction color='#FBBA80' />
                  </span>
                </div>{' '}
              </Link>
            </div>
            <div className='flex justify-center gap-4 flex-wrap'>
              <Link
                target='_blank'
                href={`/project/${projectData?.slug}`}
                className=' py-2 px-4 border border-peach-400 rounded-3xl flex justify-center flex-1'
              >
                <span className='flex gap-4 text-peach-400 font-bold items-center text-nowrap'>
                  View Project
                  <IconViewTransaction color='#FBBA80' />
                </span>
              </Link>
              <div
                onClick={handleShare}
                className='cursor-pointer py-2 px-4 border border-peach-400 rounded-3xl flex justify-center flex-1'
              >
                <span className='flex gap-4 text-peach-400 font-bold items-center text-nowrap'>
                  Share your project
                  <IconShare color='#FBBA80' size={24} />
                </span>
              </div>{' '}
              <ShareProjectModal
                isOpen={isShareModalOpen}
                onClose={closeShareModal}
                showCloseButton={true}
                projectSlug={projectData?.slug || ''}
                projectTitle={projectData?.title}
                tokenTicker={projectData?.abc?.tokenTicker}
              />
            </div>
          </div>

          {/* Project Stats */}

          <div className='flex flex-col  w-full lg:w-1/2 gap-4 font-redHatText'>
            <div className='flex justify-between border-b border-neutral-700 pb-4'>
              <h2 className='text-neutral-300 font-medium leading-6 '>
                Project status
              </h2>
              <div className='flex items-center gap-1 border border-neutral-600 p-1 rounded-2xl'>
                <div className='bg-peach-400 w-[5px] h-[5px] rounded-full'></div>

                <span className='text-xs font-medium text-peach-400'>
                  Active project
                </span>
              </div>
            </div>
            {/* {activeRoundDetails && (
              <>
                <div className='flex gap-1 items-center'>
                  <img
                    className='w-6 h-6 rounded-full'
                    src={handleImageUrl(
                      projectData?.abc?.icon! ||
                        'Qmeb6CzCBkyEkAhjrw5G9GShpKiVjUDaU8F3Xnf5bPHtm4',
                    )}
                  />
                  {projectData?.abc?.tokenTicker} range{' '}
                  {tokenPriceRangeStatus.isSuccess &&
                  tokenPriceRangeStatus.data?.isPriceUpToDate
                    ? ' '
                    : ' (Calculating) '}
                  <div className='relative group'>
                    <IconTokenSchedule />
                    <div className='absolute w-[200px] z-50 mb-2 left-[-60px] hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2'>
                      The mint value of the ABC token will be within this range,
                      based on the amount of POL this project receives.
                    </div>
                  </div>
                </div>



                <div className='flex justify-between gap-8 font-redHatText items-center py-2'>
                  {tokenPriceRangeStatus.isSuccess &&
                  tokenPriceRangeStatus.data?.isPriceUpToDate ? (
                    <>
                      <div className='p-2 w-[80%] rounded-lg bg-[#F7F7F9] text-[#1D1E1F] font-medium flex items-center gap-1'>
                        {tokenPriceRange.min.toFixed(2)} -{' '}
                        {tokenPriceRange.max.toFixed(2)}
                        <span className='text-gray-400 text-xs'>POL</span>
                      </div>
                      <div className='w-[20%] text-gray-400 text-right font-medium'>
                        ~${' '}
                        {Number(POLPrice) &&
                          formatNumber(
                            Number(POLPrice) * tokenPriceRange.min,
                          )}{' '}
                        -{' '}
                        {Number(POLPrice) &&
                          formatNumber(Number(POLPrice) * tokenPriceRange.max)}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className='p-2 w-[80%] rounded-lg bg-[#F7F7F9] text-[#1D1E1F] font-medium flex items-center gap-1'>
                        ---
                        <span className='text-gray-400 text-xs'>POL</span>
                      </div>
                      <div className='w-[20%] text-gray-400 text-right font-medium'>
                        ~$ ---
                      </div>
                    </>
                  )}
                </div>
              </>
            )} */}
            <div className='flex  flex-col gap-2 md:flex-row justify-between pb-4 pt-2 border-b border-neutral-700'>
              <div className='flex gap-2'>
                <IconTotalSupply />
                <span className='text-neutral-300 font-medium'>Total supply</span>
              </div>
              <span className='text-neutral-100 font-medium'>
                {Number(tokenDetails?.issuance_supply)
                  ? formatAmount(Number(tokenDetails?.issuance_supply))
                  : '---'}{' '}
                {projectData?.abc?.tokenTicker}
              </span>
            </div>

            <div className='flex justify-between py-2'>
              <div className='flex gap-2'>
                <IconTotalDonars />
                <span className='text-neutral-300 font-medium'>
                  Total supporters
                </span>
              </div>
              <span className='text-neutral-100 font-medium'>{uniqueDonars}</span>
            </div>

            <div className='flex  flex-col md:flex-row gap-2 justify-between py-2 border-b border-neutral-700'>
              <div className='flex gap-2'>
                <IconMinted />
                <span className='text-neutral-300 font-medium'>
                  Tokens minted to supporters
                </span>
              </div>
              <span className='text-neutral-100 font-medium'>
                {formatAmount(mintedTokenAmounts)}{' '}
                {projectData?.abc?.tokenTicker}
              </span>
            </div>

            <div className='flex  flex-col gap-2 md:flex-row justify-between pb-4 pt-2 '>
              <div className='flex gap-2 items-center'>
                <IconTributesReceived />
                <span className='text-neutral-300 font-medium'>
                  Tributes received
                </span>
                <div className='relative group'>
                  <IconTokenSchedule />
                  <div className='absolute w-[200px] z-50 mb-2 left-[-60px] hidden group-hover:block bg-neutral-700 text-neutral-100 text-xs rounded py-1 px-2'>
                    These are the tributes your project receives from the mint
                    and burn transactions on the ABC.
                  </div>
                </div>
              </div>
              <div className='flex gap-2'>
                <span className='font-medium text-neutral-100'>
                  ~ ${' '}
                  {formatAmount(
                    Math.round(claimedTributes * Number(POLPrice) * 100) / 100,
                  )}
                </span>
                <span className='font-medium text-neutral-400'>
                  {formatAmount(claimedTributes)} POL
                </span>
              </div>
            </div>

            <div className='flex  flex-col gap-2 md:flex-row justify-between pb-4 pt-2 '>
              <div className='flex gap-2 items-center'>
                <IconUnlock />
                <span className='text-neutral-300 font-medium'>
                  Tributes available to claim
                </span>
                <div className='relative group'>
                  <IconTokenSchedule />
                  <div className='absolute w-[200px] z-50 mb-2 left-[-60px] hidden group-hover:block bg-neutral-700 text-neutral-100 text-xs rounded py-1 px-2'>
                    These are the tributes your project receives from the mint
                    and burn transactions on the ABC.
                  </div>
                </div>
              </div>
              <div className='flex gap-2'>
                <span className='font-medium text-neutral-100'>
                  ~ ${' '}
                  {formatAmount(
                    Math.round(claimableFeesFormated * Number(POLPrice) * 100) /
                      100,
                  )}
                </span>
                <span className='font-medium text-neutral-400'>
                  {formatAmount(claimableFeesFormated)} POL
                </span>
              </div>
            </div>

            {tributeModuleAvailable && (
              <button
                disabled={!enableClaimButton || claim.isPending}
                className={`flex justify-center items-center px-6 py-3 rounded-full font-bold transition-colors ${
                  claim.isPending
                    ? 'bg-neutral-700 text-neutral-400 cursor-wait'
                    : enableClaimButton
                    ? 'bg-peach-400 text-black hover:bg-peach-300'
                    : 'bg-neutral-700 text-neutral-400 cursor-not-allowed'
                }`}
                onClick={() => claim.mutateAsync()}
              >
                {claim.isPending ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Claiming...
                  </>
                ) : enableClaimButton ? (
                  'Claim Tributes'
                ) : (
                  'No Tributes to Claim'
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* List of Supports */}

      <div className='bg-neutral-800 flex p-6 flex-col gap-8 rounded-xl my-8'>
        <div className='border-b border-neutral-700 pb-4'>
          <h1 className='text-neutral-100 font-bold text-2xl'>
            Contributions summary
          </h1>
        </div>

        {/* <div className='flex flex-col gap-4'>
          {(filteredRoundData.roundType === 'QfRound' ||
            filteredRoundData.qfRoundEnded) && (
            <RoundCollectHeader
              type={'qacc'}
              info={filteredRoundData.activeRound}
              projectId={projectId}
            ></RoundCollectHeader>
          )}

          {projectData.hasEARound && round1Started ? (
            <div className='flex flex-col'>
              <RoundCollectHeader
                type={'ea'}
                info={filteredRoundData.lastRound}
                projectId={projectId}
                pastRoundNumber={filteredRoundData.pastRoundNumber}
              ></RoundCollectHeader>

              {showRoundCollected && filteredRoundData.pastRounds
                ? filteredRoundData.pastRounds.map((round, id) => (
                    <RoundCollectedInfo
                      key={id}
                      info={round}
                      projectId={projectId}
                      currentRound={filteredRoundData.activeRound === round}
                    />
                  ))
                : null}
              <div
                className='bg-[#D7DDEA] w-full  justify-center mx-auto py-1 px-4 rounded-b-lg flex gap-1 cursor-pointer select-none'
                onClick={() => setShowRoundCollected(!showRoundCollected)}
              >
                {showRoundCollected
                  ? 'Hide breakdown'
                  : 'Early access breakdown'}
                {showRoundCollected ? (
                  <IconChevronUp size={24} />
                ) : (
                  <IconChevronDown size={24} />
                )}
              </div>
            </div>
          ) : (
            ''
          )}
        </div> */}

        <div className='flex  flex-col md:flex-row justify-between p-4 bg-neutral-700/30 md:items-center rounded-xl'>
          <div className='flex gap-4 items-center'>
            <IconTotalDonations size={32} />
            <span className='text-neutral-200 font-bold text-[25px]'>
              Total received
            </span>
          </div>

          <div className='flex items-center gap-4'>
            <span className='text-neutral-100 font-bold text-[25px]'>
              ~ ${' '}
              {formatAmount(
                Math.round(totalAmountDonated * Number(POLPrice) * 100) / 100,
              )}
            </span>
            <span className='text-neutral-100  font-medium'>
              {formatAmount(totalAmountDonated)} POL
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className='flex  flex-col md:flex-row gap-4 md:items-center'>
          <div className='md:w-[80%] '>
            <div className='relative'>
              <span className='absolute inset-y-0 left-0 flex items-center pl-3 pr-1 border-r border-neutral-600 my-4 '>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='16'
                  height='16'
                  viewBox='0 0 16 16'
                  fill='none'
                >
                  <path
                    d='M14 14L11.1 11.1M12.6667 7.33333C12.6667 10.2789 10.2789 12.6667 7.33333 12.6667C4.38781 12.6667 2 10.2789 2 7.33333C2 4.38781 4.38781 2 7.33333 2C10.2789 2 12.6667 4.38781 12.6667 7.33333Z'
                    stroke='#A5ADBF'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              </span>
              <input
                type='text'
                className='pl-10 p-2 border h-[56px] bg-neutral-700 text-neutral-100 border-neutral-600 rounded-lg w-full shadow-tabShadow focus:border-peach-400 focus:ring-1 focus:ring-peach-400 outline-none'
                value={searchTerm}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder='Search for a supporter wallet address or a supporter name'
              />
            </div>
          </div>

          <div className='flex flex-col gap-4 font-redHatText md:w-[20%] cursor-pointer'>
            <div
              onClick={handleSearchClick}
              className='w-full px-6 py-4 bg-peach-400 hover:bg-peach-300 transition-colors shadow-baseShadow rounded-full  flex justify-center'
            >
              <span className='flex gap-4 text-black  font-bold items-center'>
                Search <SearchIcon className='w-4 h-4' />
              </span>
            </div>
          </div>
        </div>

        <ProjectSupportTable
          projectId={projectId ?? ''}
          term={submittedSearchTerm}
        />
      </div>
    </div>
  );
};

export default MyProjects;

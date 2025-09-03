import React, { useEffect, useState } from 'react';
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
import { calculateCapAmount } from '@/helpers/round';
import { EProjectSocialMediaType } from '@/types/project.type';
import { useTokenSupplyDetails } from '@/hooks/useTokens';
import { ChevronDownIcon, Loader2, SearchIcon } from 'lucide-react';
import { IProject } from '@/types/project.type';
import { toast } from 'sonner';

const MyProjects = ({projectData}:{projectData: IProject}) => {
  const projectId = projectData?.id;
  const projectSlug = projectData?.slug;

  const [isHovered, setIsHovered] = useState(false);
  const [donations, setDonations] = useState<any[]>([]);
  const [totalDonationsCount, setTotalDonationsCount] = useState(0);
  const [uniqueDonars, setUniqueDonars] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const { data: POLPrice } = useTokenPrice();
  const [searchTerm, setSearchTerm] = useState('');
  const [submittedSearchTerm, setSubmittedSearchTerm] = useState('');
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
    <div className="p-8 mt-8">

 
    </div>
  );
};

export default MyProjects;

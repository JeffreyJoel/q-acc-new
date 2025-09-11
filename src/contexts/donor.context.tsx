import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useMemo,
  } from 'react';
  import {
    fetchProjectDonors,
    fetchUserDonations,
  } from '@/services/donation.service';
  import { useFetchUser } from '@/hooks/useFetchUser';
  import {
    calculateTotalContributions,
    calculateTotalContributionsUsd,
    calculateUniqueDonors,
    groupDonationsByProject,
  } from '@/helpers/donations';
import { Address } from 'viem';
import { IUser } from '@/types/user.type';
import { usePrivy } from '@privy-io/react-auth';

  
  interface ProjectDonorData {
    uniqueDonors: number;
    totalContributions: number;
    totalContributionsUsd: number;
    donationCount: number;
    userProjectContributionSum: number;
    userProjectContributionSumUsd: number;
  }
  
  interface DonorContextType {
    donationsGroupedByProject: Record<number, any>;
    projectDonorData: Record<number, ProjectDonorData>;
    totalUserContributions: number;
    totalUserContributionsUsd: number;
    contributedProjectsCount: number;
    contributedRoundsCount: number;
    totalCount: number;
    loading: boolean;
    error: string | null;
    user: IUser | null;
    donations: any[];
  }
  
  const DonorContext = createContext<DonorContextType | undefined>(undefined);
  
  export const DonorProvider: React.FC<{ children: React.ReactNode }> = ({
    children
  }) => {
    const [donations, setDonations] = useState<any[]>([]);
    const [projectDonorData, setProjectDonorData] = useState<
      Record<number, ProjectDonorData>
    >({});
    const [totalUserContributions, setTotalUserContributions] = useState<number>(0);
    const [totalUserContributionsUsd, setTotalUserContributionsUsd] = useState<number>(0);
    const [contributedProjectsCount, setContributedProjectsCount] = useState<number>(0);
    const [contributedRoundsCount, setContributedRoundsCount] = useState<number>(0);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { user: privyUser } = usePrivy();

    const userAddress = privyUser?.wallet?.address as Address;
  
    const { data: user } = useFetchUser(!!userAddress, userAddress);

    const userId = user?.id;
  
    useEffect(() => {
      const fetchData = async () => {
        if (!userId) return;
        try {
          const res = await fetchUserDonations(parseInt(userId));
          if (res) {
            setDonations(res.donations);
            setTotalCount(res.totalCount);
          }
        } catch (err) {
          setError('Failed to fetch donations');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
  
      fetchData();
    }, [userId]);
  
    const donationsGroupedByProject = useMemo(() => {
      return groupDonationsByProject(donations);
    }, [donations]);
  
    useEffect(() => {
      const fetchProjectDonations = async () => {
        const donorData: Record<number, ProjectDonorData> = {};
  
        const projectIds = Object.keys(donationsGroupedByProject).map(Number);
  
        for (const projectId of projectIds) {
          try {
            const donationsByProjectId = await fetchProjectDonors(
              projectId,
              1000,
            );
            if (donationsByProjectId?.donations) {
              const userDonation = donationsByProjectId.donations.filter(
                (donation: any) => donation.user.id === user?.id,
              );
  
              donorData[projectId] = {
                uniqueDonors: calculateUniqueDonors(
                  donationsByProjectId.donations,
                ),
                totalContributions: calculateTotalContributions(
                  donationsByProjectId.donations,
                ),
                totalContributionsUsd: calculateTotalContributionsUsd(
                  donationsByProjectId.donations,
                ),
                donationCount: userDonation.length,
                userProjectContributionSum:
                  calculateTotalContributions(userDonation),
                userProjectContributionSumUsd: calculateTotalContributionsUsd(userDonation),
              };
            }
          } catch (err) {
            setError('Failed to fetch project donations');
            console.error(err);
          }
        }
  
        setProjectDonorData(donorData);
      };
  
      if (donations.length > 0) {
        fetchProjectDonations();
      }
    }, [donations, donationsGroupedByProject]);
  
    // Calculate total user contributions
    useEffect(() => {
      const totalSum = Object.values(projectDonorData).reduce(
        (sum, data) => sum + data.userProjectContributionSum,
        0,
      );
      setTotalUserContributions(totalSum);

      const totalSumUsd = Object.values(projectDonorData).reduce(
        (sum, data) => sum + data.userProjectContributionSumUsd,
        0,
      );
      console.log(totalSumUsd);
      setTotalUserContributionsUsd(totalSumUsd);
    }, [projectDonorData]);
  
    // Calculate contributed projects count
    useEffect(() => {
      setContributedProjectsCount(Object.keys(donationsGroupedByProject).length);
    }, [donationsGroupedByProject]);
  
    // Calculate contributed rounds count
    useEffect(() => {
      const roundIds = new Set<string>();
      donations.forEach(donation => {
        if (donation.earlyAccessRound?.id) {
          roundIds.add(donation.earlyAccessRound.id);
        }
        if (donation.qfRound?.id) {
          roundIds.add(donation.qfRound.id);
        }
      });
      setContributedRoundsCount(roundIds.size);
    }, [donations]);
  
    return (
      <DonorContext.Provider
        value={{
          user: user ?? null,
          donations,
          donationsGroupedByProject,
          projectDonorData,
          totalUserContributions,
          totalUserContributionsUsd,
          contributedProjectsCount,
          contributedRoundsCount,
          totalCount,
          loading,
          error,
        }}
      >
        {children}
      </DonorContext.Provider>
    );
  };
  
  export const useDonorContext = () => {
    const context = useContext(DonorContext);
    if (!context) {
      throw new Error('useDonorContext must be used within a DonorProvider');
    }
    return context;
  };
  
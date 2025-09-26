import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  calculateTotalDonations,
  calculateUniqueDonors,
} from '@/helpers/donations';
import { fetchProjectDonationsById } from '@/services/donation.service';
import { fetchProjectBySlug } from '@/services/project.service';
import { IProject } from '@/types/project.type';

const ProjectContext = createContext<any>({
  projectData: undefined,
  teamMembers: [],
});
ProjectContext.displayName = 'ProjectContext';

export const ProjectProvider = ({
  children,
  slug,
  initialData,
}: {
  children: ReactNode;
  slug: string;
  initialData?: IProject | null;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [projectData, setProjectData] = useState<any | null>(null);
  const [totalDonationsCount, setTotalDonationsCount] = useState(0);
  const [teamMembers, setTeamMembers] = useState<any>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [uniqueDonars, setUniqueDonars] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  useEffect(() => {
    if (initialData) {
      // Use provided initial data
      setProjectData(initialData);
      setTeamMembers(initialData?.teamMembers || []);
      setIsLoading(false);
    } else if (slug) {
      // Fallback to fetching if no initial data
      const fetchProject = async () => {
        try {
          const data = await fetchProjectBySlug(slug);

          setProjectData(data);
          setTeamMembers(data?.teamMembers || []);
          setIsLoading(data ? false : true);
        } catch (err) {}
      };
      fetchProject();
    }
  }, [slug, initialData]); // Add initialData to dependencies

  useEffect(() => {
    if (projectData?.id) {
      const fetchDonations = async () => {
        const data = await fetchProjectDonationsById(projectData.id, 1000, 0);
        setDonations(data?.donations || []);
        setTotalDonationsCount(data?.totalCount || 0);
      };
      fetchDonations();
    }
  }, [projectData?.id]);

  useEffect(() => {
    if (donations.length > 0) {
      setUniqueDonars(calculateUniqueDonors(donations));
      setTotalAmount(calculateTotalDonations(donations));
    }
  }, [donations]);

  return (
    <ProjectContext.Provider
      value={{
        isLoading,
        projectData,
        totalDonationsCount,
        teamMembers,
        donations,
        uniqueDonars,
        totalAmount,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjectContext = () => useContext(ProjectContext);

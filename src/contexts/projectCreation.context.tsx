import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

import { fetchProjectById } from '@/services/project.service';
import {
  ProjectFormData,
  TeamMember,
  IProject,
  IProjectSocialMedia,
  EProjectSocialMediaType,
} from '@/types/project.type';

interface CreateContextType {
  formData: ProjectFormData;
  setFormData: (data: Partial<ProjectFormData>) => void;
  isLoading: boolean;
  projectData: IProject | null;
  isEditMode: boolean;
}

const ProjectCreationContext = createContext<CreateContextType | undefined>(
  undefined
);

interface ProjectCreationProviderProps {
  children: ReactNode;
  projectId?: string | number;
}

const getEmptyFormData = (): ProjectFormData => ({
  projectName: '',
  projectTeaser: '',
  projectDescription: '',
  website: '',
  facebook: '',
  twitter: '',
  linkedin: '',
  discord: '',
  telegram: '',
  instagram: '',
  reddit: '',
  youtube: '',
  farcaster: '',
  lens: '',
  github: '',
  projectAddress: '',
  addressConfirmed: false,
  logo: null,
  banner: null,
  team: [],
});

const transformProjectToFormData = (
  projectData: IProject
): ProjectFormData => ({
  projectName: projectData.title || '',
  projectTeaser: projectData.teaser || '',
  projectDescription: projectData.description || '',
  website:
    projectData.socialMedia?.find(
      (s: IProjectSocialMedia) => s.type === EProjectSocialMediaType.WEBSITE
    )?.link || '',
  facebook:
    projectData.socialMedia?.find(
      (s: IProjectSocialMedia) => s.type === EProjectSocialMediaType.FACEBOOK
    )?.link || '',
  twitter:
    projectData.socialMedia?.find(
      (s: IProjectSocialMedia) => s.type === EProjectSocialMediaType.X
    )?.link || '',
  linkedin:
    projectData.socialMedia?.find(
      (s: IProjectSocialMedia) => s.type === EProjectSocialMediaType.LINKEDIN
    )?.link || '',
  discord:
    projectData.socialMedia?.find(
      (s: IProjectSocialMedia) => s.type === EProjectSocialMediaType.DISCORD
    )?.link || '',
  telegram:
    projectData.socialMedia?.find(
      (s: IProjectSocialMedia) => s.type === EProjectSocialMediaType.TELEGRAM
    )?.link || '',
  instagram:
    projectData.socialMedia?.find(
      (s: IProjectSocialMedia) => s.type === EProjectSocialMediaType.INSTAGRAM
    )?.link || '',
  reddit:
    projectData.socialMedia?.find(
      (s: IProjectSocialMedia) => s.type === EProjectSocialMediaType.REDDIT
    )?.link || '',
  youtube:
    projectData.socialMedia?.find(
      (s: IProjectSocialMedia) => s.type === EProjectSocialMediaType.YOUTUBE
    )?.link || '',
  farcaster:
    projectData.socialMedia?.find(
      (s: IProjectSocialMedia) => s.type === EProjectSocialMediaType.FARCASTER
    )?.link || '',
  lens:
    projectData.socialMedia?.find(
      (s: IProjectSocialMedia) => s.type === EProjectSocialMediaType.LENS
    )?.link || '',
  github:
    projectData.socialMedia?.find(
      (s: IProjectSocialMedia) => s.type === EProjectSocialMediaType.GITHUB
    )?.link || '',
  projectAddress: projectData.walletAddress || '',
  addressConfirmed: !!projectData.walletAddress,
  logo: projectData.icon || null,
  banner: projectData.image || null,
  team: projectData.teamMembers || [],
});

export const ProjectCreationProvider: React.FC<
  ProjectCreationProviderProps
> = ({ children, projectId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [projectData, setProjectData] = useState<IProject | null>(null);
  const [formData, setFormDataState] =
    useState<ProjectFormData>(getEmptyFormData());
  const [isEditMode, setIsEditMode] = useState(false);

  // Fetch project data if projectId is provided
  useEffect(() => {
    const loadProjectData = async () => {
      if (!projectId) {
        setIsEditMode(false);
        setFormDataState(getEmptyFormData());
        return;
      }

      // Check if we already have data for this project
      if (projectData && projectData.id?.toString() === projectId) {
        setFormDataState(transformProjectToFormData(projectData));
        setIsEditMode(true);
        return;
      }

      setIsLoading(true);
      try {
        const data = await fetchProjectById(Number(projectId));
        if (data) {
          setProjectData(data);
          setFormDataState(transformProjectToFormData(data)); // Transform project data to form format
          setIsEditMode(true);
        } else {
          // If project not found, fall back to empty form
          setIsEditMode(false);
          setFormDataState(getEmptyFormData());
        }
      } catch (error) {
        console.error('Error fetching project data:', error);
        // On error, fall back to empty form
        setIsEditMode(false);
        setFormDataState(getEmptyFormData());
      } finally {
        setIsLoading(false);
      }
    };

    loadProjectData();
  }, [projectId]);

  const setFormData = (data: Partial<ProjectFormData>) => {
    setFormDataState(prevData => ({
      ...prevData,
      ...data,
    }));
  };

  return (
    <ProjectCreationContext.Provider
      value={{
        formData,
        setFormData,
        isLoading,
        projectData,
        isEditMode,
      }}
    >
      {children}
    </ProjectCreationContext.Provider>
  );
};

export const useProjectCreationContext = () => {
  const context = useContext(ProjectCreationContext);
  if (!context) {
    throw new Error(
      'useProjectCreationContext must be used within a ProjectCreationProvider'
    );
  }
  return context;
};

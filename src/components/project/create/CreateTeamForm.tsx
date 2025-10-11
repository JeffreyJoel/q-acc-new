'use client';

import { useEffect, useState, type FC } from 'react';

import { useRouter } from 'next/navigation';

import { IconArrowRight } from '@tabler/icons-react';
import { useForm, FormProvider } from 'react-hook-form';
import { Address } from 'viem';
import { useAccount } from 'wagmi';

import ProjectPreview from '@/components/project/create/ProjectPreview';
import { TeamForm } from '@/components/project/create/TeamForm';
import { useProjectCreationContext } from '@/contexts/projectCreation.context';
import { useCreateProject } from '@/hooks/useCreateProject';
import { useFetchUser } from '@/hooks/useFetchUser';
import {
  EProjectSocialMediaType,
  IProjectCreation,
  ProjectFormData,
} from '@/types/project.type';


export interface TeamMember {
  name: string;
  image?: { file: File; ipfsHash: string } | null;
  twitter?: string;
  linkedin?: string;
  farcaster?: string;
}

export interface TeamFormData {
  team: TeamMember[];
}

const CreateTeamForm: FC = () => {
  const { address } = useAccount();
  const { data: user } = useFetchUser(true, address as Address);
  const { formData, setFormData, isEditMode } = useProjectCreationContext();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const methods = useForm<TeamFormData>({
    defaultValues: {
      team: (formData as ProjectFormData).team?.length
        ? (formData as ProjectFormData).team
        : [{ name: '', image: null }],
    }, // Initialize with existing team members or one empty member
    mode: 'onChange',
  });
  const router = useRouter();

  const [isModalOpen, setModalOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);
  const [projectSlug, setProjectSlug] = useState('');

  const { handleSubmit, setValue, watch, reset, getValues } = methods;

  const teamMembers = watch('team');

  const { mutateAsync: createProject, isPending, error } = useCreateProject();

  useEffect(() => {
    if ((formData as ProjectFormData).team?.length === 0) {
      // Ensure at least one empty team member is present
      reset({ team: [{ name: '', image: null }] });
    } else {
      reset({ team: (formData as ProjectFormData).team || [] });
    }
  }, [(formData as ProjectFormData).team, reset]);

  const addTeamMember = () => {
    setValue('team', [...teamMembers, { name: '', image: null }]);
  };

  const removeTeamMember = (index: number) => {
    setValue(
      'team',
      teamMembers.filter((_, i) => i !== index)
    );
  };

  const onSubmit = async (data: TeamFormData) => {
    const teamMembers = data.team;
    setFormData({
      ...(formData as ProjectFormData),
      team: teamMembers,
    });

  
    const projectData = {
      ...(formData as ProjectFormData),
      team: teamMembers,
    };

    const socialMediaKeys = Object.values(EProjectSocialMediaType);

    const socialMedia = Object.entries(projectData)
      .filter(
        ([key, value]) =>
          value &&
          socialMediaKeys.includes(key.toUpperCase() as EProjectSocialMediaType)
      )
      .map(([key, value]) => ({
        type: key.toUpperCase() as EProjectSocialMediaType,
        link: typeof value === 'string' ? value : '',
      }));

    if (!user?.id) return;

    const project: IProjectCreation = {
      title: projectData.projectName,
      description: projectData.projectDescription,
      teaser: projectData.projectTeaser,
      adminUserId: Number(user.id),
      organisationId: 1, // Assuming you want to set a static organization ID
      address: projectData.projectAddress,
      image: projectData.banner || undefined,
      icon: projectData.logo || undefined,
      socialMedia: socialMedia.length ? socialMedia : undefined, // Include only if there are social media entries
      teamMembers: teamMembers,
    };
    console.log('Submitting project data:', project);

    try {
      const res: any = await createProject(project);
      setProjectSlug(res?.createProject?.slug);
      openModal();
      // router.push(Routes.DashBoard);
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Failed to create project. Please try again.'
      );
      console.log(err);
    }
  };

  const handlePreview = () => {
    const currentTeam = getValues('team');
    const updatedFormData = {
      ...(formData as ProjectFormData),
      team: currentTeam,
    };
    setFormData(updatedFormData);
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
  };

  const handleEditFromPreview = () => {
    setShowPreview(false);
  };

  if (showPreview) {
    return (
      <ProjectPreview
        formData={formData as ProjectFormData}
        onClose={handleClosePreview}
        onEdit={handleEditFromPreview}
      />
    );
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className='container mt-28'>
        {/* <CreateNavbar
          title='Add your team'
          onBack={() => router.push(Routes.CreateProject)}
          submitLabel='Save'
          disabled={isPending}
        /> */}
        <div className='flex flex-row justify-between'>
          <h1 className='text-2xl font-bold text-white mb-7'>Create project</h1>
          <div className='flex flex-row items-center gap-6'>
            <button
              type='button'
              onClick={handlePreview}
              className='px-6 py-3 font-bold items-center justify-center flex gap-2 text-peach-400 bg-transparent border-peach-400 border-2 rounded-full text-xs md:text-md min-w-[150px] hover:bg-peach-400 hover:text-black transition-colors'
            >
              Preview
            </button>
            <button
              className='bg-peach-400 text-black p-3  shadow-2xl rounded-full  text-xs md:text-md min-w-[150px] flex items-center justify-center gap-2 hover:bg-peach-300'
              type='submit'
              disabled={isPending}
            >
              Create project
              <IconArrowRight width={20} height={20} />
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
            <strong>Error:</strong> {errorMessage}
          </div>
        )}

        {teamMembers?.map((_, index) => (
          <div key={index} className='mb-4'>
            <TeamForm
              teamMember={teamMembers[index]}
              index={index}
              removeMember={() => removeTeamMember(index)}
            />
          </div>
        ))}
        <div className='bg-neutral-800 p-6 rounded-xl flex justify-between items-center'>
          <b>More team members?</b>
          <button
            className='bg-peach-400 text-black p-3  shadow-2xl rounded-full  text-xs md:text-md min-w-[150px] flex items-center justify-center gap-2 hover:bg-peach-300'
            onClick={addTeamMember}
          >
            Add a new team member
          </button>
        </div>
      </form>
      {/* <CreateProjectModal
        isOpen={isModalOpen}
        onClose={closeModal}
        showCloseButton={true}
        slug={projectSlug}
      /> */}
    </FormProvider>
  );
};

export default CreateTeamForm;

'use client';

import { useEffect, useState, type FC } from 'react';

import { useRouter } from 'next/navigation';

import { usePrivy } from '@privy-io/react-auth';
import { IconArrowRight } from '@tabler/icons-react';
import { useForm, FormProvider } from 'react-hook-form';
import { toast } from 'sonner';
import { Address } from 'viem';
import { useAccount } from 'wagmi';

import { TeamForm } from '@/components/project/create/TeamForm';
import { useProjectCreationContext } from '@/contexts/projectCreation.context';
import { useFetchUser } from '@/hooks/useFetchUser';
import { useUpdateProject } from '@/hooks/useUpdateProject';
import {
  EProjectSocialMediaType,
  IProjectCreation,
  TeamMember,
  ProjectFormData,
} from '@/types/project.type';

interface TeamFormData {
  team: TeamMember[];
}

interface EditTeamFormProps {
  projectId: string;
}

const EditTeamForm: FC<EditTeamFormProps> = ({ projectId }) => {
  const { address } = useAccount();
  const { user: PrivyUser } = usePrivy();

  const userWalletAddress = PrivyUser?.wallet?.address || address;

  const { data: user } = useFetchUser(true, userWalletAddress as Address);
  const { formData, setFormData, isEditMode } = useProjectCreationContext();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const methods = useForm<TeamFormData>({
    defaultValues: {
      team: (formData as ProjectFormData).team?.length
        ? (formData as ProjectFormData).team
        : [{ name: '', image: null }],
    },
    mode: 'onChange',
  });
  const router = useRouter();

  const { handleSubmit, setValue, watch, reset } = methods;

  const teamMembers = watch('team');

  const { mutateAsync: updateProject, isPending } = useUpdateProject(projectId);

  useEffect(() => {
    if ((formData as ProjectFormData).team?.length === 0) {
      reset({ team: [{ name: '', image: null }] });
    } else if ((formData as ProjectFormData).team?.length > 0) {
      const existingTeam = (formData as ProjectFormData).team.map(member => ({
        name: member.name || '',
        image: member.image || null,
        twitter: member.twitter || '',
        linkedin: member.linkedin || '',
        farcaster: member.farcaster || '',
      }));
      reset({ team: existingTeam });
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

    const socialMedia = Object.entries(projectData)
      .filter(
        ([key, value]) =>
          value &&
          Object.values(EProjectSocialMediaType).includes(
            key.toUpperCase() as EProjectSocialMediaType
          )
      )
      .map(([key, value]) => ({
        type: key.toUpperCase() as EProjectSocialMediaType,
        link: typeof value === 'string' ? value : '',
      }));

    if (!user?.id) return;

    const project: Partial<IProjectCreation> = {
      title: projectData.projectName,
      description: projectData.projectDescription,
      teaser: projectData.projectTeaser,
      image: projectData.banner || undefined,
      icon: projectData.logo || undefined,
      socialMedia: socialMedia.length ? socialMedia : undefined,
      teamMembers: projectData.team,
    };

    try {
      await updateProject(project);
      console.log(project);

      toast.success('Project updated successfully');
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Failed to update project. Please try again.'
      );
      toast.error(err.message);
    } finally {
      router.push(`/profile/${userWalletAddress}`);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className='container mt-28'>
        <div className='flex flex-row justify-between'>
          <h1 className='text-2xl font-bold text-white mb-7'>Edit Team</h1>
          <div className='flex flex-row items-center gap-6'>
            <button
              className='bg-peach-400 text-black p-3  shadow-2xl rounded-full  text-xs md:text-md min-w-[150px] flex items-center justify-center gap-2 hover:bg-peach-300 disabled:opacity-50 disabled:cursor-not-allowed'
              type='submit'
              disabled={isPending}
            >
              {isPending ? (
                <>
                  Saving...
                  <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-black'></div>
                </>
              ) : (
                <>
                  Save Changes
                  <IconArrowRight width={20} height={20} />
                </>
              )}
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
              isEdit={true}
            />
          </div>
        ))}
        <div className='bg-neutral-800 p-6 rounded-xl flex justify-between items-center'>
          <b>More team members?</b>
          <button
            type='button'
            className='bg-peach-400 text-black p-3  shadow-2xl rounded-full  text-xs md:text-md min-w-[150px] flex items-center justify-center gap-2 hover:bg-peach-300'
            onClick={addTeamMember}
          >
            Add a new team member
          </button>
        </div>
      </form>
    </FormProvider>
  );
};

export default EditTeamForm;

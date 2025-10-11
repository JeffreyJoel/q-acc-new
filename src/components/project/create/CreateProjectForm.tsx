'use client';

import { useEffect, useState, type FC } from 'react';

import { useRouter } from 'next/navigation';

import { IconArrowRight, IconExternalLink } from '@tabler/icons-react';
import { useForm, FormProvider } from 'react-hook-form';
import { Address } from 'viem';
import { useAccount } from 'wagmi';

import ProjectPreview from '@/components/project/create/ProjectPreview';
import { SocialMediaInput } from '@/components/project/create/SocialMediaInput';
import { validators } from '@/components/project/create/validators';
import { RichTextEditor } from '@/components/shared/RichTextEditor';
import { Dropzone } from '@/components/ui/dropzone';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useProjectCreationContext } from '@/contexts/projectCreation.context';
import { useAddressWhitelist } from '@/hooks/useAddressWhitelist';
import { useCreateProject } from '@/hooks/useCreateProject';
import { useFetchProjectsCountByUserId } from '@/hooks/useFetchProjectsCountByUserId';
import { useFetchUser } from '@/hooks/useFetchUser';
import { EProjectSocialMediaType } from '@/types/project.type';
import { TeamMember } from '@/types/project.type';

// import { HoldModal } from '@/components/Modals/HoldModal';
// import { ConnectModal } from '@/components/ConnectModal';

// import ProjectDetailPreview from '@/components/ProjectPreview/ProjectDetailPreview';
// import Routes from '@/lib/constants/Routes';

export interface ProjectFormData {
  projectName: string;
  projectTeaser: string;
  projectDescription: string;
  website: string;
  facebook: string;
  twitter: string;
  linkedin: string;
  discord: string;
  telegram: string;
  instagram: string;
  reddit: string;
  youtube: string;
  farcaster: string;
  lens: string;
  github: string;
  projectAddress: string;
  addressConfirmed: boolean;
  logo: string | null;
  banner: string | null;
  team: TeamMember[];
}

const socialMediaLinks = [
  {
    name: EProjectSocialMediaType.WEBSITE,
    label: 'Website',
    iconName: 'web.svg',
    rules: validators.website,
  },
  {
    name: EProjectSocialMediaType.FACEBOOK,
    label: 'Facebook',
    iconName: 'facebook.svg',
    rules: validators.facebook,
  },
  {
    name: EProjectSocialMediaType.X,
    label: 'Twitter',
    iconName: 'twitter.svg',
    rules: validators.twitter,
  },
  {
    name: EProjectSocialMediaType.LINKEDIN,
    label: 'LinkedIn',
    iconName: 'linkedin.svg',
    rules: validators.linkedin,
  },
  {
    name: EProjectSocialMediaType.DISCORD,
    label: 'Discord',
    iconName: 'discord.svg',
    rules: validators.discord,
  },
  {
    name: EProjectSocialMediaType.TELEGRAM,
    label: 'Telegram',
    iconName: 'telegram.svg',
    rules: validators.telegram,
  },
  {
    name: EProjectSocialMediaType.INSTAGRAM,
    label: 'Instagram',
    iconName: 'instagram.svg',
    rules: validators.instagram,
  },
  {
    name: EProjectSocialMediaType.REDDIT,
    label: 'Reddit',
    iconName: 'reddit.svg',
    rules: validators.reddit,
  },
  {
    name: EProjectSocialMediaType.YOUTUBE,
    label: 'YouTube',
    iconName: 'youtube.svg',
    rules: validators.youtube,
  },
  {
    name: EProjectSocialMediaType.FARCASTER,
    label: 'Farcaster',
    iconName: 'farcaster.svg',
    rules: validators.farcaster,
  },
  {
    name: EProjectSocialMediaType.LENS,
    label: 'Lens',
    iconName: 'lens.svg',
    rules: validators.lens,
  },
  {
    name: EProjectSocialMediaType.GITHUB,
    label: 'GitHub',
    iconName: 'github.svg',
    rules: validators.github,
  },
];

const CreateProjectForm: FC = () => {
  const { address } = useAccount();
  const { data: user } = useFetchUser(true, address as Address);
  const { mutateAsync: createProject, isPending } = useCreateProject();
  const { formData, setFormData, isEditMode } = useProjectCreationContext();
  const methods = useForm<ProjectFormData>({
    defaultValues: isEditMode
      ? (formData as ProjectFormData)
      : (formData as ProjectFormData),
    mode: 'onChange',
  });
  const { data: addrWhitelist, isFetched: isWhiteListFetched } =
    useAddressWhitelist();
  const { data: userProjectsCount, isFetched: isProjectsCountFetched } =
    useFetchProjectsCountByUserId(parseInt(user?.id ?? ''));
  const router = useRouter();
  const [showPreview, setShowPreview] = useState(false);

  const {
    handleSubmit,
    getValues,
    setValue,
    resetField,
    register,
    formState: { errors },
  } = methods;

  const projectAddress = addrWhitelist?.fundingPotMultisig;
  useEffect(() => {
    if (projectAddress) {
      setValue('projectAddress', projectAddress);
    } else {
      resetField('projectAddress');
    }
  }, [projectAddress]);

  const handleDrop = (name: string, file: File, ipfsHash: string) => {};

  const onSubmit = async (data: ProjectFormData) => {
    if (!user?.id || !address) return;
    setFormData(data);
    router.push('/project/create/team');
  };

  const handlePreview = () => {
    const currentValues = getValues();
    setFormData(currentValues);
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
  };

  const handleEditFromPreview = () => {
    setShowPreview(false);
    // Focus on the first input field
    const firstInput = document.querySelector(
      'input[name="projectName"]'
    ) as HTMLInputElement;
    if (firstInput) {
      firstInput.focus();
    }
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

  return userProjectsCount && userProjectsCount > 0 ? (
    <div className='mt-48 flex-1 flex items-center justify-center text-center'>
      <p className='text-2xl font-bold'>You have already created a project.</p>
    </div>
  ) : (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className='bg-neutral-800 w-full flex flex-col gap-16 pt-10 mt-28 rounded-2xl p-8'>
          <div className='flex flex-row justify-between'>
            <h1 className='text-2xl font-bold text-white mb-7'>
              Create Your Project
            </h1>

            <div className='flex flex-row items-center gap-6'>
              <span className='font-bold '>Next: Add your team</span>

              <button
                className='bg-peach-400 text-black p-3  shadow-2xl rounded-full  text-xs md:text-md min-w-[150px] flex items-center justify-center gap-2 hover:bg-peach-300'
                type='submit'
                disabled={isPending}
              >
                Save & continue
                <IconArrowRight width={20} height={20} />
              </button>
            </div>
          </div>
          <div>
            <label className='text-sm mb-2 text-neutral-300'>
              Project Name
            </label>
            <Input
              {...register('projectName', {
                required: 'Project name is required',
                minLength: {
                  value: 3,
                  message: 'Project name must be at least 3 characters',
                },
              })}
              placeholder='My First Project'
              className='mt-2 border border-neutral-500 focus:ring-peach-400 focus:border-peach-400 outline-none'
            />
            {errors.projectName && (
              <p className='text-red-500 text-sm mt-1'>
                {errors.projectName.message}
              </p>
            )}
          </div>

          <div>
            <label className='text-sm mb-2 text-neutral-300'>
              Project Teaser
            </label>
            <Textarea
              {...register('projectTeaser', {
                required: 'Project teaser is required',
                maxLength: {
                  value: 100,
                  message: 'Teaser must be 100 characters or less',
                },
              })}
              placeholder='Enter project teaser'
              maxLength={100}
              rows={6}
              className='mt-2 border border-neutral-500 focus:ring-peach-400 focus:border-peach-400 outline-none'
            />
            {errors.projectTeaser && (
              <p className='text-red-500 text-sm mt-1'>
                {errors.projectTeaser.message}
              </p>
            )}
          </div>

          <section className='flex flex-col gap-6'>
            <div>
              <h2 className='text-2xl'>Tell us about your project...</h2>
              <p className='text-sm mt-2'>
                <span className='text-neutral-300'>Aim for 200-500 words.</span>
                {/* <span className='text-pink-500'>
                  How to write a good project description.{' '}
                </span> */}
              </p>
            </div>
            <RichTextEditor
              name='projectDescription'
              rules={{
                required: 'Project description is required',
                minLength: {
                  value: 200,
                  message:
                    'Project description must be at least 200 characters',
                },
              }}
              defaultValue={(formData as ProjectFormData).projectDescription}
              maxLength={500}
            />
            {/* <Editor /> */}
          </section>

          <section className='flex flex-col gap-6'>
            <div>
              <h2 className='text-2xl'>Social Media Links</h2>
              <p className='text-sm mt-2'>
                <span className='text-neutral-300'>
                  Add your project's social media links (optional)
                </span>
              </p>
            </div>
            <div className='flex flex-col gap-6'>
              {socialMediaLinks.map(socialMedia => (
                <SocialMediaInput key={socialMedia.name} {...socialMedia} />
              ))}
            </div>
          </section>

          <section className='flex flex-col gap-6 w-full mx-auto'>
            <label className='text-4xl font-bold text-neutral-300'>
              Upload Logo
            </label>
            <p>Displayed in the header of the project page.</p>
            <Dropzone name='logo' onDrop={handleDrop} />
          </section>

          <section className='flex flex-col gap-6 w-full mx-auto'>
            <label className='text-4xl font-bold text-neutral-300'>
              Add an image to your project
            </label>
            <p>Displayed in the header of the project page.</p>
            <Dropzone name='banner' onDrop={handleDrop} />
          </section>
        </div>
        <div className='bg-neutral-800 flex flex-row flex-wrap justify-between items-center gap-16 w-full mt-10 mb-10 rounded-2xl p-8'>
          <h3 className='text-lg line leading-7 text-neutral-300 font-bold font-redHatText'>
            Preview your project
          </h3>
          <button
            onClick={handlePreview}
            type='button'
            className='px-6 py-4 font-bold items-center justify-center flex gap-2 text-peach-400 bg-transparent border-peach-400 border-2 p-4 rounded-full text-xs md:text-md min-w-[150px]'
          >
            PREVIEW
          </button>
        </div>
      </form>
    </FormProvider>
  );
  //   : (
  //     <div>
  //       <p>This </p>
  //     <  /div>
  //   );
  //   : isConnected ? (
  //     <HoldModal isOpen onClose={() => router.push('/')} />
  //   ) : (
  //     <ConnectModal
  //       isOpen={true}
  //       onClose={function (): void {
  //         throw new Error('Function not implemented.');
  //   }}
  //     />
  //   );
};

export default CreateProjectForm;

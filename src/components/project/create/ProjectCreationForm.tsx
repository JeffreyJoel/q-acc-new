'use client';

import { useEffect, type FC } from 'react';

import { IconExternalLink } from '@tabler/icons-react';
import { useForm, FormProvider } from 'react-hook-form';
import { Address } from 'viem';
import { useAccount } from 'wagmi';

import { SocialMediaInput } from '@/components/project/create/SocialMediaInput';
import { validators } from '@/components/project/create/validators';
import { RichTextEditor } from '@/components/shared/RichTextEditor';
import { Button } from '@/components/ui/button';
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

interface ProjectCreationFormProps {
  onFormChange?: () => void;
  onSubmit: (data: ProjectFormData) => Promise<void>;
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

export const ProjectCreationForm: FC<ProjectCreationFormProps> = ({
  onFormChange,
  onSubmit,
}) => {
  const { address } = useAccount();
  const { data: user } = useFetchUser(true, address as Address);
  const { mutateAsync: createProject, isPending } = useCreateProject();
  const { formData, setFormData, isEditMode } = useProjectCreationContext();
  const methods = useForm<ProjectFormData>({
    defaultValues: formData as ProjectFormData,
    mode: 'onChange',
  });
  const { data: addrWhitelist, isFetched: isWhiteListFetched } =
    useAddressWhitelist();
  const { data: userProjectsCount, isFetched: isProjectsCountFetched } =
    useFetchProjectsCountByUserId(parseInt(user?.id ?? ''));

  const { handleSubmit, getValues, setValue, resetField, watch } = methods;

  // Watch for form changes
  const watchedValues = watch();

  useEffect(() => {
    onFormChange?.();
  }, [watchedValues, onFormChange]);

  // Update context when form data changes
  useEffect(() => {
    const subscription = watch(value => {
      setFormData(value as ProjectFormData);
    });
    return () => subscription.unsubscribe();
  }, [watch, setFormData]);

  const projectAddress = addrWhitelist?.fundingPotMultisig;
  useEffect(() => {
    if (projectAddress) {
      setValue('projectAddress', projectAddress);
    } else {
      resetField('projectAddress');
    }
  }, [projectAddress, setValue, resetField]);

  const handleDrop = (name: string, file: File, ipfsHash: string) => {
    // Handle file upload logic here
    console.log('File uploaded:', { name, file, ipfsHash });
  };

  const onSubmitHandler = async (data: ProjectFormData) => {
    if (!user?.id || !address) return;
    await onSubmit(data);
  };

  const handlePreview = () => {
    const formData = getValues();
    sessionStorage.setItem('previewData', JSON.stringify(formData));
    // Open preview in new tab or show preview modal
    window.open('/preview', '_blank');
  };

  if ((userProjectsCount || 0) > 0) {
    return (
      <div className='flex-1 flex items-center justify-center py-8'>
        <div className='text-center'>
          <h3 className='text-lg font-semibold mb-2'>Project Limit Reached</h3>
          <p className='text-gray-600'>You have already created a project.</p>
        </div>
      </div>
    );
  }

  if (!addrWhitelist) {
    return (
      <div className='flex-1 flex items-center justify-center py-8'>
        <div className='text-center'>
          <h3 className='text-lg font-semibold mb-2'>Access Required</h3>
          <p className='text-gray-600'>
            You need to be whitelisted to create a project.
          </p>
        </div>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form
        id='project-creation-form'
        onSubmit={handleSubmit(onSubmitHandler)}
        className='space-y-8'
      >
        {/* Basic Information Section */}
        <div className='space-y-6'>
          <div>
            <h2 className='text-xl font-semibold mb-4'>Basic Information</h2>
            <p className='text-neutral-300 mb-6'>
              Tell us about your project with a compelling name, teaser, and
              detailed description.
            </p>
          </div>

          <div className='space-y-4'>
            <div>
              <Label htmlFor='projectName' className='text-sm font-medium'>
                Project Name <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='projectName'
                {...methods.register('projectName', {
                  required: 'Project name is required',
                  minLength: {
                    value: 3,
                    message: 'Project name must be at least 3 characters',
                  },
                })}
                placeholder='Enter your project name'
                className='col-span-4  border border-neutral-700 focus:ring-peach-400 focus:border-peach-400 outline-none'
              />
              {methods.formState.errors.projectName && (
                <p className='text-red-500 text-sm mt-1'>
                  {methods.formState.errors.projectName.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor='projectTeaser' className='text-sm font-medium'>
                Project Teaser <span className='text-red-500'>*</span>
              </Label>
              <p className='text-xs text-neutral-300 mb-2'>
                A brief, catchy description (max 100 characters)
              </p>
              <Textarea
                id='projectTeaser'
                {...methods.register('projectTeaser', {
                  required: 'Project teaser is required',
                  maxLength: {
                    value: 100,
                    message: 'Teaser must be 100 characters or less',
                  },
                })}
                placeholder='Enter a brief, catchy description of your project'
                maxLength={100}
                className='col-span-4  border border-neutral-700 focus:ring-peach-400 focus:border-peach-400 outline-none'
              />
              {methods.formState.errors.projectTeaser && (
                <p className='text-red-500 text-sm mt-1'>
                  {methods.formState.errors.projectTeaser.message}
                </p>
              )}
            </div>

            <div>
              <Label className='text-sm font-medium'>
                Project Description <span className='text-red-500'>*</span>
              </Label>
              <p className='text-xs text-neutral-300 mb-2'>
                Provide a detailed description of your project (200-500 words)
              </p>
              <RichTextEditor
                name='projectDescription'
                rules={{
                  required: 'Project description is required',
                  minLength: {
                    value: 200,
                    message:
                      'Project description must be at least 200 characters',
                  },
                  maxLength: {
                    value: 500,
                    message:
                      'Project description must be 500 characters or less',
                  },
                }}
                defaultValue={(formData as ProjectFormData).projectDescription}
                maxLength={500}
              />
            </div>
          </div>
        </div>

        {/* Social Media Links Section */}
        <div className='space-y-6 border-t border-neutral-700 pt-8'>
          <div>
            <h2 className='text-xl font-semibold mb-4'>Social Media Links</h2>
            <p className='text-neutral-300 mb-6'>
              Connect your project's social media presence (all optional)
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {socialMediaLinks.map(socialMedia => (
              <SocialMediaInput key={socialMedia.name} {...socialMedia} />
            ))}
          </div>
        </div>

        {/* Media Assets Section */}
        <div className='space-y-6 border-t border-neutral-700 pt-8'>
          <div>
            <h2 className='text-xl font-semibold mb-4'>Media Assets</h2>
            <p className='text-neutral-300 mb-6'>
              Upload your project logo and banner image (both optional)
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <Label className='text-sm font-medium mb-3 block'>
                Project Logo
              </Label>
              <p className='text-xs text-neutral-300 mb-3'>
                Square image, recommended size: 400x400px
              </p>
              <Dropzone name='logo' onDrop={handleDrop} />
            </div>

            <div>
              <Label className='text-sm font-medium mb-3 block'>
                Project Banner
              </Label>
              <p className='text-xs text-neutral-300 mb-3'>
                Wide image, recommended size: 1200x600px
              </p>
              <Dropzone name='banner' onDrop={handleDrop} />
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className='border-t border-neutral-700 pt-8'>
          <div className='flex gap-4'>
            <Button
              type='button'
              variant='outline'
              onClick={handlePreview}
              className='flex items-center gap-2 border-neutral-700 hover:bg-neutral-800'
            >
              <IconExternalLink size={16} />
              Preview Project
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default ProjectCreationForm;

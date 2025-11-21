'use client';

import React, { FC } from 'react';

import Image from 'next/image';

import { IconX } from '@tabler/icons-react';
import { ChevronLeft, Globe } from 'lucide-react';

import { TailwindStyledContent } from '@/components/project/common/RichTextViewer';
import SocialLinks from '@/components/project/common/SocialLinks';
import TeamMember from '@/components/project/common/TeamCard';
import { CopyButton } from '@/components/shared/CopyButton';
import { Button } from '@/components/ui/button';
import { Tabs, TabsTrigger, TabsList, TabsContent } from '@/components/ui/tabs';
import {
  ProjectFormData,
  TeamMember as TeamMemberType,
  EProjectSocialMediaType,
} from '@/types/project.type';

interface ProjectPreviewProps {
  formData: ProjectFormData;
  onClose: () => void;
  onEdit: () => void;
}

const ProjectPreview: FC<ProjectPreviewProps> = ({
  formData,
  onClose,
  onEdit,
}) => {
  const socialMediaData = Object.entries(formData)
    .filter(
      ([key, value]) =>
        value &&
        [
          'website',
          'facebook',
          'twitter',
          'linkedin',
          'discord',
          'telegram',
          'instagram',
          'reddit',
          'youtube',
          'farcaster',
          'lens',
          'github',
        ].includes(key)
    )
    .map(([key, value]) => {
      const typeMapping: Record<string, EProjectSocialMediaType> = {
        website: EProjectSocialMediaType.WEBSITE,
        facebook: EProjectSocialMediaType.FACEBOOK,
        twitter: EProjectSocialMediaType.X,
        linkedin: EProjectSocialMediaType.LINKEDIN,
        discord: EProjectSocialMediaType.DISCORD,
        telegram: EProjectSocialMediaType.TELEGRAM,
        instagram: EProjectSocialMediaType.INSTAGRAM,
        reddit: EProjectSocialMediaType.REDDIT,
        youtube: EProjectSocialMediaType.YOUTUBE,
        farcaster: EProjectSocialMediaType.FARCASTER,
        lens: EProjectSocialMediaType.LENS,
        github: EProjectSocialMediaType.GITHUB,
      };

      return {
        type: typeMapping[key] || EProjectSocialMediaType.WEBSITE,
        link: value as string,
      };
    });

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-neutral-900 rounded-lg max-w-6xl max-h-[90vh] w-full overflow-y-auto'>
        {/* Header */}
        <div className='sticky top-0 bg-neutral-900 border-b border-neutral-700 p-4 flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <h2 className='text-xl font-bold text-white'>Project Preview</h2>
            <span className='text-sm text-neutral-400'>
              How your project will appear
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              onClick={onEdit}
              className='border-neutral-700 hover:bg-neutral-800'
            >
              Edit Project
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={onClose}
              className='text-neutral-400 hover:text-white'
            >
              <IconX size={20} />
            </Button>
          </div>
        </div>

        {/* Preview Content */}
        <div className='p-6'>
          {/* Banner Image */}
          <div className='w-full relative rounded-xl overflow-hidden h-[300px] md:h-[400px] mb-8 bg-neutral-800'>
            {formData.banner ? (
              <Image
                src={formData.banner}
                alt={formData.projectName || 'Project banner'}
                className='w-full h-full object-cover'
                width={1200}
                height={400}
                priority
              />
            ) : (
              <div className='w-full h-full flex items-center justify-center bg-gradient-to-r from-neutral-800 to-neutral-700'>
                <div className='text-center'>
                  <div className='text-neutral-500 mb-2'>
                    No banner uploaded
                  </div>
                  <div className='text-sm text-neutral-600'>
                    1200x600px recommended
                  </div>
                </div>
              </div>
            )}
            <div className='absolute inset-0 bg-gradient-to-t from-neutral-900 to-transparent' />
          </div>

          {/* Project Header */}
          <div className='relative z-10 -mt-32 mb-8'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <div className='bg-neutral-800 rounded-xl p-4 flex-shrink-0'>
                  {formData.logo ? (
                    <Image
                      src={formData.logo}
                      alt={`${formData.projectName} logo`}
                      width={80}
                      height={80}
                      className='w-20 h-20 rounded-lg object-cover'
                    />
                  ) : (
                    <div className='w-20 h-20 rounded-lg bg-neutral-700 flex items-center justify-center'>
                      <span className='text-neutral-500 text-xs'>No Logo</span>
                    </div>
                  )}
                </div>
                <div>
                  <div className='flex items-center gap-3'>
                    <h1 className='text-3xl font-bold text-white'>
                      {formData.projectName || 'Project Name'}
                    </h1>
                  </div>
                  <div className='mt-2'>
                    {formData.projectAddress && (
                      <p className='text-gray-400 text-sm font-medium flex items-center gap-2'>
                        {formData.projectAddress.slice(0, 8)}...
                        {formData.projectAddress.slice(-8)}
                        <CopyButton text={formData.projectAddress} />
                      </p>
                    )}
                    {socialMediaData.length > 0 && (
                      <div className='mt-2'>
                        <SocialLinks socialMedia={socialMediaData} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Project Teaser */}
            {formData.projectTeaser && (
              <div className='mt-6 bg-neutral-800 rounded-lg p-4'>
                <p className='text-lg text-neutral-200 italic'>
                  "{formData.projectTeaser}"
                </p>
              </div>
            )}
          </div>

          {/* Project Content Tabs */}
          <div className='mt-8'>
            <Tabs defaultValue='about' className='w-full'>
              <TabsList className='gap-6 mb-6 bg-transparent rounded-full py-6'>
                <TabsTrigger
                  value='about'
                  className='px-4 py-2 w-fit rounded-full hover:bg-neutral-800 hover:text-peach-400 data-[state=active]:bg-peach-400 data-[state=active]:text-black data-[state=active]:shadow-none'
                >
                  About
                </TabsTrigger>
                {formData.team && formData.team.length > 0 && (
                  <TabsTrigger
                    value='team'
                    className='px-4 py-2 w-fit rounded-full hover:bg-neutral-800 hover:text-peach-400 data-[state=active]:bg-peach-400 data-[state=active]:text-black data-[state=active]:shadow-none'
                  >
                    Team
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value='about' className='mt-0'>
                <div className='max-w-6xl mx-auto'>
                  {formData.projectDescription ? (
                    <TailwindStyledContent
                      content={formData.projectDescription}
                    />
                  ) : (
                    <div className='bg-neutral-800 rounded-lg p-8 text-center'>
                      <p className='text-neutral-400'>
                        No project description provided
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              {formData.team && formData.team.length > 0 && (
                <TabsContent value='team' className='mt-0'>
                  <div className='flex flex-wrap justify-center gap-4 py-4'>
                    {formData.team.map(
                      (member: TeamMemberType, index: number) => (
                        <TeamMember
                          key={index}
                          member={{
                            name: member.name,
                            image: member.image?.ipfsHash || '/images/user.png',
                            twitter: member.twitter || 'N/A',
                            role: 'Team Member',
                          }}
                        />
                      )
                    )}
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </div>

          {/* Preview Notice */}
          <div className='mt-8 bg-amber-500/10 border border-amber-500/30 rounded-lg p-4'>
            <div className='flex items-center gap-2'>
              <div className='w-2 h-2 bg-amber-500 rounded-full'></div>
              <p className='text-amber-200 text-sm'>
                This is a preview of how your project will appear once
                published. Some features like donations and live data will only
                be available after creation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectPreview;

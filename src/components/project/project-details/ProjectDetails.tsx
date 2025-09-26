'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { ArrowUpRight } from 'lucide-react';

import ProjectDetailsLoader from '@/components/loaders/ProjectDetailsLoader';
import { CopyButton } from '@/components/shared/CopyButton';
import VestingSchedule from '@/components/vesting-schedule/VestingSchedule';
import config from '@/config/configuration';
import { useProjectContext } from '@/contexts/project.context';
import { capitalizeFirstLetter } from '@/helpers';
import { shortenAddressLarger } from '@/helpers/address';
import { getPoolAddressByPair } from '@/helpers/getTokensListedData';
import { handleImageUrl } from '@/helpers/image';

import { TailwindStyledContent } from '../common/RichTextViewer';
import SocialLinks from '../common/SocialLinks';
import SwapWidget from '../swap/SwapWidget';

import { GeckoTerminalChart } from './GeckoTerminal';
import ProjectStats from './ProjectStats';
import TeamSection from './TeamSection';
import TokenHolders from './TokenHolders';

export default function ProjectDetails() {
  const [projectPoolAddress, setProjectPoolAddress] = useState<string | null>(
    null
  );
  const [isTokenListed, setIsTokenListed] = useState<boolean>(false);

  const { projectData: project, isLoading, error } = useProjectContext();

  console.log(project);

  useEffect(() => {
    const fetchPoolAddress = async () => {
      if (project?.abc?.issuanceTokenAddress) {
        try {
          const { poolAddress, isListed } = await getPoolAddressByPair(
            project?.abc?.issuanceTokenAddress,
            config.WPOL_TOKEN_ADDRESS
          );
          setProjectPoolAddress(poolAddress);
          setIsTokenListed(isListed);
        } catch (error) {
          console.error('Failed to fetch pool address:', error);
          setProjectPoolAddress(null);
          setIsTokenListed(false);
        }
      }
    };

    fetchPoolAddress();
  }, [project?.abc?.issuanceTokenAddress]);

  // console.log(project);

  return (
    <div className='mt-32 mb-12 max-w-7xl min-h-screen  mx-auto px-6'>
      {isLoading || !project ? (
        <ProjectDetailsLoader />
      ) : (
        <>
          <div
            className={`${
              isTokenListed ? 'flex flex-col lg:flex-row gap-4' : ''
            }`}
          >
            <div
              className={`${
                isTokenListed ? 'w-full lg:w-[65%]' : ''
              } relative w-full h-[550px]  overflow-hidden rounded-3xl`}
            >
              {/* Background Image */}
              <Image
                src={project.image || ''}
                alt={project.title || 'Project Image'}
                fill
                className='object-cover'
                priority
              />
              {/* Overlay for better text readability */}
              <div className='absolute inset-0 bg-gradient-to-r from-black/80 via-black/85 to-transparent' />
              <div className='relative z-10 h-full flex flex-col justify-between p-8 md:px-16 md:py-11'>
                <div className='flex-1 flex flex-col justify-center'>
                  <div className='max-w-lg'>
                    <h1 className='text-4xl md:text-[64px] font-anton text-white mb-6 leading-none'>
                      {project.title}
                    </h1>

                    <p className='text-white leading-relaxed mb-5'>
                      {capitalizeFirstLetter(
                        project?.descriptionSummary || ''
                      ) || 'No description available'}
                    </p>

                    <div className='bg-black/50 px-4 py-3 rounded-lg mb-5 flex items-center gap-2 w-fit'>
                      <span className='text-white text-lg font-ibm-mono font-bold'>
                        {shortenAddressLarger(
                          project.abc?.projectAddress || ''
                        )}
                      </span>
                      <CopyButton text={project.abc?.projectAddress || ''} />
                      <Link
                        href={`https://polygonscan.com/address/${project.abc?.projectAddress}`}
                        target='_blank'
                        className='hover:text-peach-400 transition-colors'
                      >
                        <ArrowUpRight className='w-6 h-6 cursor-pointer' />
                      </Link>
                    </div>
                    <div className='flex gap-4'>
                      <SocialLinks socialMedia={project.socialMedia} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {isTokenListed ? (
              <div className='w-full lg:w-[30%] h-full'>
                <SwapWidget
                  contractAddress={project.abc?.fundingManagerAddress || ''}
                  receiveTokenAddress={project.abc?.issuanceTokenAddress || ''}
                  receiveTokenSymbol={project.abc?.tokenTicker || ''}
                  receiveTokenIcon={handleImageUrl(project.abc?.icon || '')}
                />
              </div>
            ) : null}
          </div>
          {/* Project Stats Section */}
          <div className='max-w-7xl mx-auto mt-8'>
            <ProjectStats project={project} />
          </div>

          {project?.abc?.issuanceTokenAddress && (
            <GeckoTerminalChart
              tokenSymbol={project.abc.tokenTicker || ''}
              tokenAddress={project.abc.issuanceTokenAddress}
              projectPoolAddress={projectPoolAddress || ''}
              isTokenListed={isTokenListed}
            />
          )}
          <div className='max-w-7xl mx-auto mt-4 '>
            <div className='flex flex-col lg:flex-row gap-4'>
              <div className='lg:w-[70%] flex flex-col gap-4'>
                {project.seasonNumber && (
                  <VestingSchedule
                    seasonNumber={project.seasonNumber}
                    projectTicker={project.abc?.tokenTicker}
                    projectIcon={handleImageUrl(project.abc?.icon || '')}
                  />
                )}

                <div className='bg-black/50 px-6 lg:px-16 py-8 lg:py-12 rounded-3xl'>
                  <TailwindStyledContent content={project.description || ''} />
                </div>
              </div>
              <div className='lg:w-[30%] flex flex-col gap-4'>
                <TeamSection teamMembers={project.teamMembers} />
                <TokenHolders
                  tokenAddress={project.abc?.issuanceTokenAddress || ''}
                  paymentRouter={project.abc?.paymentRouterAddress || ''}
                  projectName={project.abc?.tokenTicker || ''}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

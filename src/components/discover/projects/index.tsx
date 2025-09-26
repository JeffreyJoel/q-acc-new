'use client';

import { useState } from 'react';

import VestingScheduleFull from '@/components/vesting-schedule/VestingScheduleFull';
import { extractVideoId } from '@/helpers';
import { useEnrichedProjects } from '@/hooks/useEnrichedProjects';
import { useFetchAllProjects } from '@/hooks/useProjects';

import { ProjectsCarousel } from './ProjectsCarousel';
import ProjectsTable from './ProjectsTable';
import { ProjectTile } from './ProjectTile';
import ProjectsLoader from '@/components/loaders/ProjectsLoader';

function Projects() {
  const [activeTile, setActiveTile] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const { data: allProjects, isLoading, error } = useFetchAllProjects();

  const { data: enrichedProjects, isLoading: isEnrichedLoading } =
    useEnrichedProjects(allProjects?.projects);

  const enrichedMap = new Map((enrichedProjects ?? []).map(p => [p.id, p]));

  const carouselItems = (allProjects?.projects || [])
    .filter((project: any) => project.rank === 1)
    .slice(0, 4)
    .map(project => {
      const enriched = enrichedMap.get(project.id.toString());
      return {
        text: project.title || 'Untitled Project',
        image: project.image || '/images/banners/banner-lg.jpg',
        url: `/project/${project.slug}`,
        description: project.descriptionSummary || '',
        donations: project.totalDonations || 0,
        supporters: project.countUniqueDonors || 0,
        marketCap: enriched?.marketCapUSD ?? 0,
        season: project.seasonNumber || '',
      };
    });

  const sortedProjects = (allProjects?.projects || [])
    .filter((project: any) => [1, 2, 3].includes(project.rank))
    .sort((a: any, b: any) => {
      const order: Record<number, number> = { 2: 0, 3: 1, 1: 2 };
      return order[a.rank] - order[b.rank];
    });

  const tiles = sortedProjects.map(project => {
    return {
      text: project.title || 'Untitled Project',
      image: project.image || '/images/banners/banner-lg.jpg',
      description: project.descriptionSummary || '',
      season: project.seasonNumber || '',
      slug: project.slug || '',
      reelId: project.slug === 'web3-packs'
        ? 'v9LqCr3GMJw'
        : extractVideoId(
            project.socialMedia?.find((media: any) => media.type === 'REEL_VIDEO')
              ?.link || ''
          ),
    };
  });

  return (
    <div className='mx-auto px-4 sm:px-6 py-10 md:py-20 lg:px-12 flex flex-col justify-center'>
      <h2 className='font-anton text-white text-[46px] md:text-5xl lg:text-[64px] mb-4 md:mb-6 uppercase tracking-wide'>
        Projects
      </h2>
      <div>
        {isLoading || isEnrichedLoading ? (
          <ProjectsLoader />
        ) : error ? (
          <div className='text-red-500'>Error loading projects.</div>
        ) : (
          <>
            <div className='hidden lg:block'>
              <ProjectsCarousel tips={carouselItems} />
            </div>

            <div
              className={`lg:mt-10 ${showAll ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 justify-items-center' : 'flex flex-row gap-4 overflow-x-auto scrollbar-hide'}`}
            >
              {(showAll ? tiles : tiles.slice(0, 6)).map(tile => (
                <ProjectTile
                  key={tile.text}
                  title={tile.text}
                  description={tile.description}
                  image={tile.image}
                  season={tile.season}
                  slug={tile.slug}
                  reelId={tile.reelId}
                  activeTile={activeTile}
                  setActiveTile={setActiveTile}
                />
              ))}
            </div>

            {!showAll && (
              <div className='flex flex-row justify-center mt-6 md:mt-10'>
                <button
                  onClick={() => setShowAll(true)}
                  className='w-full mx-10 sm:mx-0 sm:w-1/2 md:w-1/3 lg:w-1/4 rounded-xl px-6 py-2 uppercase border border-peach-400 text-peach-400 hover:bg-peach-400 hover:text-black transition-all duration-300 text-xs font-medium tracking-wide'
                >
                  Show All Projects
                </button>
              </div>
            )}

            <ProjectsTable projects={enrichedProjects || []} />
          </>
        )}

        <div id='vesting-schedule'>
          <VestingScheduleFull projects={allProjects?.projects || []} />
        </div>
      </div>
    </div>
  );
}

export default Projects;

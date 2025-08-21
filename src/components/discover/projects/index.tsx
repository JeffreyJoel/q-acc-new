"use client";

import { ProjectsCarousel } from "./ProjectsCarousel";
import { useFetchAllProjects } from "@/hooks/useProjects";
import { ProjectTile } from "./ProjectTile";
import ProjectsTable from "./ProjectsTable";
import VestingScheduleFull from "@/components/vesting-schedule/VestingScheduleFull";
import { useEnrichedProjects } from "@/hooks/useEnrichedProjects";
import YouTubeShortsPlayer from "@/components/project/common/YoutubeShortsPlayer";

function Projects() {
  const { data: allProjects, isLoading, error } = useFetchAllProjects();

  console.log(allProjects?.projects);

  const carouselItems = (allProjects?.projects || [])
    .filter((project: any) => project.rank === 1)
    .slice(0, 4)
    .map((project) => ({
      text: project.title || "Untitled Project",
      image: project.image || "/images/banners/banner-lg.jpg",
      url: `/project/${project.slug}`,
      description: project.descriptionSummary || "",
      donations: project.totalDonations || 0,
      supporters: project.countUniqueDonors || 0,
      marketCap:
        project.abc && project.abc.tokenPrice && project.abc.totalSupply
          ? project.abc.tokenPrice * project.abc.totalSupply
          : 0,
      season: project.seasonNumber || "",
    }));

  const tiles = (allProjects?.projects || [])
    .filter((project: any) => project.rank === 2 || project.rank === 3)
    .slice(0, 8)
    .map((project) => ({
      text: project.title || "Untitled Project",
      image: project.image || "/images/banners/banner-lg.jpg",
      url: `/project/${project.slug}`,
      description: project.descriptionSummary || "",
      donations: project.totalDonations || 0,
      supporters: project.countUniqueDonors || 0,
      marketCap:
        project.abc && project.abc.tokenPrice && project.abc.totalSupply
          ? project.abc.tokenPrice * project.abc.totalSupply
          : 0,
      season: project.seasonNumber || "",
      slug: project.slug || "",
    }));

  const { data: enrichedProjects, isLoading: isEnrichedLoading } =
    useEnrichedProjects(allProjects?.projects);

  if (isLoading || isEnrichedLoading) {
    return (
      <div className="mx-auto px-6 lg:px-12 py-20 flex flex-col justify-center items-center">
        <h2 className="font-anton text-white text-[64px] mb-6 uppercase tracking-wide">
          Projects
        </h2>
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto px-6 lg:px-12 py-20 flex flex-col justify-center items-center">
        <h2 className="font-anton text-white text-[64px] mb-6 uppercase tracking-wide">
          Projects
        </h2>
        <div className="text-red-500">Error loading projects.</div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-6 py-10 md:py-20 lg:px-12 flex flex-col justify-center">
      <h2 className="font-anton text-white text-[46px] md:text-5xl lg:text-[64px] mb-4 md:mb-6 uppercase tracking-wide">
        Projects
      </h2>
      <div>
        <div className="hidden lg:block">
          <ProjectsCarousel tips={carouselItems} />
        </div>

        <div className="flex flex-row gap-4 lg:mt-10 overflow-x-auto">
          {tiles.map((tile) => (
            <ProjectTile
              key={tile.text}
              title={tile.text}
              description={tile.description}
              image={tile.image}
              season={tile.season}
              slug={tile.slug}
            />
          ))}
          {/* <YouTubeShortsPlayer videoId="UR7RPTpEl8Q" /> */}
        </div>

        <div className="flex flex-row justify-center mt-6 md:mt-10">
          <button className="w-full mx-10 sm:mx-0 sm:w-1/2 md:w-1/3 lg:w-1/4 rounded-xl px-6 py-2 uppercase border border-peach-400 text-peach-400 hover:bg-peach-400 hover:text-black transition-all duration-300 text-xs font-medium tracking-wide">
            Show All Projects
          </button>
        </div>

        <ProjectsTable projects={enrichedProjects || []} />

        <VestingScheduleFull projects={allProjects?.projects || []} />
      </div>
    </div>
  );
}

export default Projects;

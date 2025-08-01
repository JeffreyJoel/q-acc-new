"use client";

import Link from "next/link";
import { useFetchProjectBySlug } from "@/hooks/useProjects";
import {
  useFetchActiveRoundDetails,
  useFetchMostRecentEndRound,
} from "@/hooks/useRounds";
import GeneralInfo from "@/components/project/GeneralInfo";
import { ChevronLeft, Globe, ExternalLink, Copy } from "lucide-react";
import { CopyButton } from "@/components/shared/CopyButton";
import { Tabs, TabsTrigger, TabsList, TabsContent } from "@/components/ui/tabs";
import TeamMember from "@/components/project/Team";
import { GeckoTerminalChart } from "@/components/project/GeckoTerminal";
import SocialLinks from "@/components/project/SocialLinks";
import { IProject, TeamMember as TeamMemberType } from "@/types/project.type";
import RichTextViewer from "@/components/project/RichTextViewer";
import Image from "next/image";
import ProjectDetailsLoader from "@/components/loaders/ProjectDetailsLoader";
import ProjectDonationTable from "./ProjectDonationTable";

export default function ProjectDetails({ params }: { params: { id: string } }) {
  const { data: project, isLoading, error } = useFetchProjectBySlug(params.id);
  const { data: activeRoundDetails } = useFetchActiveRoundDetails();

  const isRoundActive = !!activeRoundDetails;
  const isQaccRoundEnded = useFetchMostRecentEndRound(activeRoundDetails);

  // console.log(project);

  return (
    <div className="mt-24 max-w-7xl min-h-screen mx-auto">
      {isLoading || !project ? (
        <ProjectDetailsLoader />
      ) : (
        <>
          {/* Hero Section with Two-Column Layout */}
          <div className="w-full mt-4 relative rounded-xl overflow-hidden h-[600px] mb-8">
            <div className="absolute inset-0 flex">
              {/* Left Column - Dark Brown Background */}
              <div className="w-2/3 bg-[#8B4513] p-8 flex flex-col justify-between">
                <div>
                  {/* Main Title */}
                  <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 font-tusker-8">
                    {project.title}
                  </h1>
                  
                  {/* Description */}
                  <p className="text-white text-lg leading-relaxed max-w-2xl">
                    {project.description?.slice(0, 200)}...
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Address with Copy/External Icons */}
                  <div className="bg-gray-300 rounded-lg p-4 inline-flex items-center gap-3">
                    <span className="text-gray-800 font-mono text-sm">
                      {project.abc?.projectAddress?.slice(0, 12)}...
                      {project.abc?.projectAddress?.slice(
                        (project.abc?.projectAddress?.length || 0) - 8
                      )}
                    </span>
                    <button className="text-gray-600 hover:text-gray-800">
                      <Copy size={16} />
                    </button>
                    <button className="text-gray-600 hover:text-gray-800">
                      <ExternalLink size={16} />
                    </button>
                  </div>

                  {/* Social Media Icons */}
                  <div className="flex items-center gap-4">
                    <button className="text-white hover:text-gray-300">
                      <Globe size={20} />
                    </button>
                    <button className="text-white hover:text-gray-300">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </button>
                    <button className="text-white hover:text-gray-300">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </button>
                    <button className="text-white hover:text-gray-300">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                      </svg>
                    </button>
                    <button className="text-white hover:text-gray-300">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column - Light Background with Book-like Logo */}
              <div className="w-1/3 bg-[#F5F5DC] flex items-center justify-center relative">
                <div className="bg-white rounded-lg shadow-2xl p-8 transform rotate-3 relative">
                  <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
                    <Image
                      src={project.icon || "/placeholder.svg"}
                      alt={`${project.title} logo`}
                      width={200}
                      height={200}
                      className="w-32 h-32 rounded-lg object-cover mx-auto"
                      priority
                    />
                    <div className="mt-4 text-center">
                      <h3 className="text-xl font-bold text-gray-800 font-tusker-8">
                        {project.title}
                      </h3>
                      <div className="w-16 h-0.5 bg-orange-500 mx-auto my-2"></div>
                      <p className="text-sm text-gray-600">
                        {project.abc?.tokenTicker || "Token"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
            {/* Rest of the content remains the same */}
            {project?.abc?.issuanceTokenAddress && (
              <GeckoTerminalChart
                tokenSymbol={project.abc.tokenTicker}
                tokenAddress={project.abc.issuanceTokenAddress}
              />
            )}

            <GeneralInfo projectData={project as IProject} />

            <div className="mt-8 rounded-2xl p-6 mb-8">
              <Tabs defaultValue="about" className="w-full ">
                <TabsList className="gap-6 mb-6 bg-transparent rounded-full py-6">
                  <TabsTrigger
                    value="about"
                    className="px-4 py-2 w-fit rounded-full hover:bg-neutral-800 hover:text-peach-400 data-[state=active]:bg-peach-400 data-[state=active]:text-black data-[state=active]:shadow-none"
                  >
                    About
                  </TabsTrigger>
                  {(isRoundActive || isQaccRoundEnded) && (
                    <TabsTrigger
                      value="donations"
                      className="px-4 py-2 w-fit rounded-full hover:bg-neutral-800 hover:text-peach-400 data-[state=active]:bg-peach-400 data-[state=active]:text-black data-[state=active]:shadow-none"
                    >
                      Transactions
                    </TabsTrigger>
                  )}

                  <TabsTrigger
                    value="team"
                    className="px-4 py-2 w-fit rounded-full hover:bg-neutral-800 hover:text-peach-400 data-[state=active]:bg-peach-400 data-[state=active]:text-black text-base data-[state=active]:shadow-none"
                  >
                    Team
                  </TabsTrigger>
                  <TabsTrigger
                    value="roadmap"
                    className="px-4 py-2 w-fit rounded-full hover:bg-neutral-800 hover:text-peach-400 data-[state=active]:bg-peach-400 data-[state=active]:text-black data-[state=active]:shadow-none"
                  >
                    Roadmap
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="about" className="mt-0">
                  <div className="max-w-6xl mx-auto">
                    <RichTextViewer description={project.description} />
                  </div>
                </TabsContent>
                <TabsContent value="donations" className="mt-0">
                  <ProjectDonationTable />
                </TabsContent>
                <TabsContent value="team" className="mt-0">
                  <div className="flex flex-wrap justify-center gap-4 py-4">
                    {(project as any).teamMembers &&
                      (project as any).teamMembers.map(
                        (member: TeamMemberType, index: number) => (
                          <TeamMember
                            key={index}
                            member={{
                              name: member.name,
                              image: member.image as unknown as string,
                              // role: member.role || "N/A",
                              twitter: member.twitter || "N/A",
                            }}
                          />
                        )
                      )}
                  </div>
                </TabsContent>
                <TabsContent value="roadmap" className="mt-0">
                  <div className="space-y-4 py-4">
                    <p className="text-gray-400">
                      Roadmap data is not available for this project.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

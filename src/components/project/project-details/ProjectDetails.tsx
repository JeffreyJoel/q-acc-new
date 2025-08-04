"use client";

import { useFetchProjectBySlug } from "@/hooks/useProjects";
import {
  useFetchActiveRoundDetails,
  useFetchMostRecentEndRound,
} from "@/hooks/useRounds";
import GeneralInfo from "@/components/project/project-details/GeneralInfo";
import { Tabs, TabsTrigger, TabsList, TabsContent } from "@/components/ui/tabs";
import { GeckoTerminalChart } from "@/components/project/project-details/GeckoTerminal";

import { IProject } from "@/types/project.type";
import Image from "next/image";
import ProjectDetailsLoader from "@/components/loaders/ProjectDetailsLoader";
import { ArrowUpRight } from "lucide-react";
import ProjectHeader from "./ProjectHeader";
import ProjectAboutTab from "./ProjectAboutTab";
import ProjectTeamTab from "./ProjectTeamTab";
import ProjectRoadmapTab from "./ProjectRoadmapTab";
import ProjectTransactionsTab from "./ProjectTransactionsTab";
import { capitalizeFirstLetter } from "@/helpers";
import { shortenAddressLarger } from "@/helpers/address";
import { CopyButton } from "@/components/shared/CopyButton";
import SocialLinks from "../common/SocialLinks";
import { TailwindStyledContent } from "../common/RichTextViewer";
import TeamSection from "./TeamSection";
import TokenHolders from "./TokenHolders";

export default function ProjectDetails({ params }: { params: { id: string } }) {
  const { data: project, isLoading, error } = useFetchProjectBySlug(params.id);
  const { data: activeRoundDetails } = useFetchActiveRoundDetails();

  const isRoundActive = !!activeRoundDetails;
  const isQaccRoundEnded = useFetchMostRecentEndRound(activeRoundDetails);

  console.log(project);

  return (
    <div className="mt-32 max-w-7xl min-h-screen  mx-auto px-6">
      {isLoading || !project ? (
        <ProjectDetailsLoader />
      ) : (
        <>
          <div className="relative w-full h-[600px] overflow-hidden rounded-3xl">
            {/* Background Image */}
            <Image
              src={project.image || ""}
              alt="TO DA MOON Hero Background"
              fill
              className="object-cover"
              priority
            />
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-neutral-950/30 to-transparent" />
            <div className="relative z-10 h-full flex flex-col justify-between p-8 md:px-20 md:py-11">
              <div className="flex-1 flex flex-col justify-center">
                <div className="max-w-lg">
                  <h1 className="text-4xl md:text-[64px] font-anton text-white mb-6 leading-none">
                    {project.title}
                  </h1>

                  <p className="text-white leading-relaxed mb-5">
                    {capitalizeFirstLetter(project?.descriptionSummary || "") ||
                      "No description available"}
                  </p>

                  <div className="bg-black/50 px-4 py-3 rounded-lg mb-5 flex items-center gap-2 w-fit">
                    <span className="text-white text-lg font-ibm-mono font-bold">
                      {shortenAddressLarger(project.abc?.projectAddress || "")}
                    </span>
                    <CopyButton text={project.abc?.projectAddress || ""} />
                    <ArrowUpRight className="w-6 h-6 cursor-pointer" />
                  </div>
                  <div className="flex gap-4">
                    <SocialLinks socialMedia={project.socialMedia} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {project?.abc?.issuanceTokenAddress && (
            <GeckoTerminalChart
              tokenSymbol={project.abc.tokenTicker || ""}
              tokenAddress={project.abc.issuanceTokenAddress}
            />
          )}
          <div className="max-w-7xl mx-auto mt-4 ">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="lg:w-[70%] bg-black/50 px-6 lg:px-16 py-8 lg:py-12 rounded-3xl">
                <TailwindStyledContent content={project.description || ""} />
              </div>
              <div className="lg:w-[30%] flex flex-col gap-4">
                <TeamSection teamMembers={project.teamMembers} />
                <TokenHolders tokenAddress={project.abc?.issuanceTokenAddress || ""} paymentProcessor={project.abc?.fundingManagerAddress || ""} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

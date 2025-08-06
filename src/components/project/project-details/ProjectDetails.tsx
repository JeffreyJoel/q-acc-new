"use client";

import { useFetchProjectBySlug } from "@/hooks/useProjects";
import { GeckoTerminalChart } from "./GeckoTerminal";

import Image from "next/image";
import ProjectDetailsLoader from "@/components/loaders/ProjectDetailsLoader";
import { ArrowUpRight } from "lucide-react";
import { capitalizeFirstLetter } from "@/helpers";
import { shortenAddressLarger } from "@/helpers/address";
import { CopyButton } from "@/components/shared/CopyButton";
import SocialLinks from "../common/SocialLinks";
import { TailwindStyledContent } from "../common/RichTextViewer";
import TeamSection from "./TeamSection";
import TokenHolders from "./TokenHolders";
import ProjectStats from "./ProjectStats";
import Link from "next/link";

export default function ProjectDetails({ params }: { params: { id: string } }) {
  const { data: project, isLoading, error } = useFetchProjectBySlug(params.id);

  // console.log(project);

  return (
    <div className="mt-32 mb-12 max-w-7xl min-h-screen  mx-auto px-6">
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
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
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
                    <Link href={`https://polygonscan.com/address/${project.abc?.projectAddress}`} target="_blank" className="hover:text-peach-400 transition-colors">
                      <ArrowUpRight className="w-6 h-6 cursor-pointer" />
                    </Link>
                  </div>
                  <div className="flex gap-4">
                    <SocialLinks socialMedia={project.socialMedia} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Project Stats Section */}
          <div className="max-w-7xl mx-auto mt-8">
            <ProjectStats project={project} />
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
                <TokenHolders tokenAddress={project.abc?.issuanceTokenAddress || ""} paymentRouter={project.abc?.paymentRouterAddress || ""} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

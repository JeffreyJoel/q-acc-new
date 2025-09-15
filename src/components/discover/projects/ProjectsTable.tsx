"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { EnrichedProjectData } from "@/services/projectData.service";
import { useTokenHolders } from "@/hooks/useTokenHolders";
import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";

// Lazy cell component that fetches token-holders count on-demand
function HoldersCount({ tokenAddress, fallback }: { tokenAddress?: string; fallback: number }) {
  const { data } = useTokenHolders(tokenAddress || "", {
    enabled: Boolean(tokenAddress),
    staleTime: 1000 * 60 * 10,
  });

  const count = data?.totalHolders ?? fallback;
  return <>{count.toLocaleString()}</>;
}

const formatPercent = (value: number) =>
  `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;

const formatCurrency = (value: number) =>
  value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });


interface ProjectsTableProps {
  projects: EnrichedProjectData[];
}

export default function ProjectsTable({ projects }: ProjectsTableProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"all" | "season1" | "season2">(
    "all"
  );
  const [searchTerm, setSearchTerm] = useState("");

  const allTableProjects = useMemo(() =>
    projects.map((project) => ({
      logo: project.icon || "",
      name: project.title || "Untitled Project",
      slug: project.slug || "",
      ticker: project.tokenTicker,
      season: `S${project.seasonNumber || 1}`,
      seasonNumber: project.seasonNumber || 1,
      supporters: project.supporterCount || 0,
      totalReceived: project.totalDonatedUSD || 0,
      pricePOL: project.pricePOL || 0,
      priceUSD: project.priceUSD || 0,
      priceChange24h: project.priceChange24h ?? 0,
      priceChange7d: project.priceChange7d ?? 0,
      tokenAddress: project.tokenAddress,
      marketCap: project.marketCapUSD || 0,
    })),
    [projects]
  );

  const tableProjects = allTableProjects.filter((project) => {
    //tab filter
    let passesTabFilter = true;
    if (activeTab === "season1") passesTabFilter = project.seasonNumber === 1;
    if (activeTab === "season2") passesTabFilter = project.seasonNumber === 2;
    
    //search filter
    let passesSearchFilter = true;
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      passesSearchFilter = 
        project.name.toLowerCase().includes(searchLower) ||
        (project.ticker && project.ticker.toLowerCase().includes(searchLower)) ||
        project.season.toLowerCase().includes(searchLower);
    }
    
    return passesTabFilter && passesSearchFilter;
  });

  return (
    <div className="w-full max-w-7xl mx-auto lg:px-8 py-12 mt-20">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <h1 className="font-anton text-white text-[42px] lg:text-6xl uppercase leading-none mb-2">
          Projects 
          <br className="hidden lg:block" />
          <span className="ml-2 lg:ml-0">Data</span>
        </h1>

       <div className="flex flex-row gap-4 items-center justify-between w-full">

       <div className="flex gap-2 md:gap-1 lg:mt-4">
          <button
            onClick={() => setActiveTab("all")}
            className={`w-fit px-2 md:px-3 py-2 rounded-lg text-[10px] sm:text-xs uppercase transition-colors font-medium ${
              activeTab === "all"
                ? "bg-peach-400 text-black"
                : "bg-peach-400/10 text-peach-400/50 hover:bg-peach-400/20"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab("season2")}
            className={`w-fit px-2 md:px-3 py-2 rounded-lg text-[10px] sm:text-xs uppercase transition-colors font-medium ${
              activeTab === "season2"
                ? "bg-peach-400 text-black"
                : "bg-peach-400/10 text-peach-400/50 hover:bg-peach-400/20"
            }`}
          >
            Season 2
          </button>
          <button
            onClick={() => setActiveTab("season1")}
            className={`w-fit px-2 md:px-3 py-2 rounded-lg text-[10px] sm:text-xs uppercase transition-colors font-medium ${
              activeTab === "season1"
                ? "bg-peach-400 text-black"
                : "bg-peach-400/10 text-peach-400/50 hover:bg-peach-400/20"
            }`}
          >
            Season 1
          </button>
        </div>
        <div className="flex items-center gap-2 w-1/2 md:w-72">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-4 w-4 text-qacc-gray-light/60" />
            </div>
            <input
              type="text"
              placeholder="SEARCH PROJECTS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-[10px] bg-qacc-gray-light/10 text-white/80 pl-10 pr-4 py-2 placeholder:text-white/30 placeholder:text-xs border border-[#232323] focus:outline-none focus:ring-1 focus:ring-peach-400"
            />
          </div>
        </div>
       </div>
      </div>

      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-4 min-w-[1000px]">
          {/* PROJECT, TOKEN Section */}
          <div className="flex-1 min-w-[250px]">
            <div className="h-[80px]"></div>
            <div className="px-6 py-1">
              <div className="text-qacc-gray-light/60 font-bold text-[10px] uppercase tracking-wider py-0">
                PROJECT, TOKEN
              </div>
            </div>
            {tableProjects.map((project, idx) => (
              <Link href={`/project/${project.slug}`}
                key={idx}
                className={`${
                  idx == tableProjects.length - 1
                    ? ""
                    : "border-b border-white/5"
                } flex items-center gap-3  px-6 hover:bg-[#232323] transition-colors h-[80px] cursor-pointer`}
                prefetch
              >
                <Image
                  src={project.logo}
                  alt={project.name}
                  width={40}
                  height={40}
                  className="rounded-full object-cover border border-[#232323]"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-xs leading-tight">
                      {project.name}
                    </span>
                    <span className="text-qacc-gray-light/60 font-bold text-xs uppercase">
                      ${project.ticker}
                    </span>
                    <span className="text-peach-400/50 font-bold text-xs uppercase">
                      {project.season}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Q/ACC ROUNDS Section */}
          <div className="flex-1 min-w-[240px] max-w-[240px] border border-white/5 rounded-xl py-0">
            <div className="h-[80px] flex justify-center items-center px-6 py-0">
              <h3 className="font-anton  text-peach-400 text-xl uppercase text-center py-0 m-0">
                Q/ACC ROUNDS
              </h3>
            </div>
            <div className="grid grid-cols-2 py-1 px-6">
              <div className="text-qacc-gray-light/60 font-bold text-[10px] uppercase  text-center">
                SUPPORTERS
              </div>
              <div className="text-qacc-gray-light/60 font-bold text-[10px] uppercase text-center">
                TOTAL RECEIVED
              </div>
            </div>
            {tableProjects.map((project, idx) => (
              <div
                key={idx}
                className={`${
                  idx == tableProjects.length - 1
                    ? ""
                    : "border-b border-white/5"
                } grid grid-cols-2  px-6  hover:bg-[#232323] transition-colors h-[80px] items-center`}
              >
                <div className="text-center text-white font-bold text-xs">
                  {project.supporters.toLocaleString()}
                </div>
                <div className="text-center text-white font-bold text-xs">
                  {formatCurrency(project.totalReceived)}
                </div>
              </div>
            ))}
          </div>

          {/* MARKET DATA Section */}
          <div className="flex-1 min-w-[500px] border border-white/5 rounded-xl py-0">
            <div className="h-[80px] flex justify-center items-center px-6 py-0">
              <h3 className="font-anton  text-peach-400 text-xl uppercase text-center py-0 m-0">
                MARKET DATA
              </h3>
            </div>
            <div className="grid grid-cols-5 py-1 px-6">
              <div className="text-qacc-gray-light/60 font-bold text-[10px] uppercase text-center">
                PRICE
              </div>
              <div className="text-qacc-gray-light/60 font-bold text-[10px] uppercase text-center">
                HOLDERS
              </div>
              <div className="text-qacc-gray-light/60 font-bold text-[10px] uppercase text-center">
                24H CHG
              </div>
              <div className="text-qacc-gray-light/60 font-bold text-[10px] uppercase text-center">
                MARKET CAP
              </div>
            </div>
            {tableProjects.map((project, idx) => (
              <div
                key={idx}
                className={`${
                  idx == tableProjects.length - 1
                    ? ""
                    : "border-b border-white/5"
                } grid grid-cols-5 px-6  hover:bg-[#232323] transition-colors h-[80px] items-center`}
              >
                <div className="text-center text-white font-bold text-xs flex items-center justify-center gap-2">
                  <span className="text-qacc-gray-light/60">{project.pricePOL.toFixed(2)} POL</span>
                  <span className="text-white">
                    ${project.priceUSD.toFixed(2)}
                  </span>
                </div>
                <div className="text-center text-white font-bold text-xs">
                  {/* Fetch token holders count lazily */}
                  <HoldersCount tokenAddress={project.tokenAddress} fallback={project.supporters} />
                </div>
                <div
                  className={`text-center font-bold text-xs ${
                    project.priceChange24h < 0
                      ? "text-red-400"
                      : "text-green-400"
                  }`}
                >
                  {formatPercent(project.priceChange24h)}
                </div>
                <div className="text-center text-white font-bold text-xs">
                  {formatCurrency(project.marketCap)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

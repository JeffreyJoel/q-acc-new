"use client";

import { useState } from "react";
import Image from "next/image";
import { IProject } from "@/types/project.type";
import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";

const formatCurrency = (value: number) =>
  value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

const formatPercent = (value: number) =>
  `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;

interface ProjectsTableProps {
  projects?: IProject[];
}

export default function ProjectsTable({ projects = [] }: ProjectsTableProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"all" | "season1" | "season2">(
    "all"
  );

  const allTableProjects = projects.map((project, idx) => ({
    logo: project.icon || "",
    name: project.title || "Untitled Project",
    slug: project.slug || "",
    ticker: project.abc?.tokenTicker,
    season: `S${project.seasonNumber || "1"}`,
    seasonNumber: project.seasonNumber || 1,
    supporters: project.countUniqueDonors || 0,
    totalReceived: project.totalDonations || 0,
    price: project.abc?.tokenPrice || 0,
    priceChange24h: -2.17, // Mock data for now
    priceChange7d: 17.09, // Mock data for now
    holders: project.countUniqueDonors || 0,
    marketCap:
      project.abc && project.abc.tokenPrice && project.abc.totalSupply
        ? project.abc.tokenPrice * project.abc.totalSupply
        : 0,
  }));

  const tableProjects = allTableProjects.filter((project) => {
    if (activeTab === "all") return true;
    if (activeTab === "season1") return project.seasonNumber === 1;
    if (activeTab === "season2") return project.seasonNumber === 2;
    return true;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-12 mt-20">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <h1 className="font-anton text-white text-5xl md:text-6xl uppercase leading-none mb-2">
          Projects
          <br />
          Data
        </h1>

        <div className="flex gap-1 mt-4">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-2 rounded-lg text-xs uppercase transition-colors font-medium ${
              activeTab === "all"
                ? "bg-peach-400 text-black"
                : "bg-peach-400/10 text-peach-400/50 hover:bg-peach-400/20"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab("season2")}
            className={`px-3 py-2 rounded-lg text-xs uppercase transition-colors font-medium ${
              activeTab === "season2"
                ? "bg-peach-400 text-black"
                : "bg-peach-400/10 text-peach-400/50 hover:bg-peach-400/20"
            }`}
          >
            Season 2
          </button>
          <button
            onClick={() => setActiveTab("season1")}
            className={`px-3 py-2 rounded-lg text-xs uppercase transition-colors font-medium ${
              activeTab === "season1"
                ? "bg-peach-400 text-black"
                : "bg-peach-400/10 text-peach-400/50 hover:bg-peach-400/20"
            }`}
          >
            Season 1
          </button>
        </div>
        <div className="flex items-center gap-2 w-full md:w-72">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-4 w-4 text-qacc-gray-light/60" />
            </div>
            <input
              type="text"
              placeholder="SEARCH PROJECTS..."
              className="w-full rounded-[10px] bg-qacc-gray-light/10 text-white/80 pl-10 pr-4 py-2 placeholder:text-white/30 placeholder:text-xs border border-[#232323] focus:outline-none focus:ring-1 focus:ring-peach-400"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
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
              <div
                onClick={() => {
                  router.push(`/project/${project.slug}`);
                }}
                key={idx}
                className={`${
                  idx == tableProjects.length - 1
                    ? ""
                    : "border-b border-white/5"
                } flex items-center gap-3  px-6 hover:bg-[#232323] transition-colors h-[80px] cursor-pointer`}
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
              </div>
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
                7D CHG
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
                  <span className="text-qacc-gray-light/60">0.0 POL</span>
                  <span className="text-white">
                    $ {project.price.toFixed(2)}
                  </span>
                </div>
                <div className="text-center text-white font-bold text-xs">
                  {project.holders.toLocaleString()}
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
                <div
                  className={`text-center font-bold text-xs ${
                    project.priceChange7d < 0
                      ? "text-red-400"
                      : "text-green-400"
                  }`}
                >
                  {formatPercent(project.priceChange7d)}
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

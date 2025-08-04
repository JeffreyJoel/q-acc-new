"use client";

import React, { useState, useRef } from "react";
import { IProject } from "@/types/project.type";
import Image from "next/image";

interface VestingPeriod {
  name: string;
  displayName: string;
  type: "team" | "supporters";
  season: number;
  order: number;
  start: Date;
  cliff: Date;
  end: Date;
}

interface TooltipData {
  period: VestingPeriod;
  x: number;
  y: number;
  visible: boolean;
}

interface VestingScheduleProps {
  projects?: IProject[];
  seasonNumber: number;
}

const VestingSchedule: React.FC<VestingScheduleProps> = ({ 
  projects = [], 
  seasonNumber 
}) => {
  const [tooltip, setTooltip] = useState<TooltipData>({
    period: {} as VestingPeriod,
    x: 0,
    y: 0,
    visible: false,
  });
  const [showTimeline, setShowTimeline] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter projects by the specified season
  const seasonProjects = projects.filter(project => project.seasonNumber === seasonNumber);

  // Vesting data for the specific season
  const getVestingDataForSeason = (season: number): VestingPeriod[] => {
    const seasonData = {
      1: [
        {
          name: "team-tokens-s1",
          displayName: "Team Tokens",
          type: "team" as const,
          season: 1,
          order: 1,
          start: new Date("2024-10-29"),
          cliff: new Date("2025-10-29"),
          end: new Date("2026-10-29"),
        },
        {
          name: "supporters-round1-s1",
          displayName: "Round 1 Supporters",
          type: "supporters" as const,
          season: 1,
          order: 2,
          start: new Date("2024-12-20"),
          cliff: new Date("2025-06-20"),
          end: new Date("2025-12-20"),
        },
        {
          name: "supporters-round2-s1",
          displayName: "Round 2 Supporters",
          type: "supporters" as const,
          season: 1,
          order: 3,
          start: new Date("2025-03-13"),
          cliff: new Date("2025-10-13"),
          end: new Date("2026-03-13"),
        },
      ],
      2: [
        {
          name: "team-tokens-s2",
          displayName: "Team Tokens",
          type: "team" as const,
          season: 2,
          order: 4,
          start: new Date("2025-04-11"),
          cliff: new Date("2026-04-11"),
          end: new Date("2027-04-11"),
        },
        {
          name: "supporters-round2-s2",
          displayName: "Round 2 Supporters",
          type: "supporters" as const,
          season: 2,
          order: 5,
          start: new Date("2025-05-13"),
          cliff: new Date("2025-11-13"),
          end: new Date("2026-05-13"),
        },
      ],
    };

    return seasonData[season as keyof typeof seasonData] || [];
  };

  const vestingData = getVestingDataForSeason(seasonNumber);

  // Get date range for the specific season
  const getDateRangeForSeason = (season: number) => {
    const seasonRanges = {
      1: {
        minDate: new Date("2024-11-01"),
        maxDate: new Date("2026-03-31"),
      },
      2: {
        minDate: new Date("2025-04-01"),
        maxDate: new Date("2027-03-31"),
      },
    };

    return seasonRanges[season as keyof typeof seasonRanges] || {
      minDate: new Date("2024-11-01"),
      maxDate: new Date("2027-03-31"),
    };
  };

  const { minDate, maxDate } = getDateRangeForSeason(seasonNumber);
  const today = new Date();

  const generateTimelineMonths = () => {
    const months = [];
    const currentDate = new Date(minDate);

    while (currentDate <= maxDate) {
      months.push({
        date: new Date(currentDate),
        position: getDatePosition(currentDate),
        shortLabel: currentDate.toLocaleDateString("en-US", { month: "short" }),
        fullLabel:
          currentDate.getMonth() === 0
            ? currentDate.toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })
            : currentDate.toLocaleDateString("en-US", { month: "short" }),
      });
      currentDate.setMonth(currentDate.getMonth() + 2); // Every 2 months
    }
    return months;
  };

  // Helper functions
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatEndDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const calculateDays = (start: Date, end: Date): number => {
    return Math.round(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  const getDatePosition = (date: Date): number => {
    const totalRange = maxDate.getTime() - minDate.getTime();
    const dateOffset = date.getTime() - minDate.getTime();
    return (dateOffset / totalRange) * 100;
  };

  const getTodayPosition = (): number => {
    if (today < minDate || today > maxDate) return -1;
    return getDatePosition(today);
  };

  const handleMouseEnter = (event: React.MouseEvent, period: VestingPeriod) => {
    setShowTimeline(true);
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltip({
        period,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        visible: true,
      });
    }
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect && tooltip.visible) {
      setTooltip((prev) => ({
        ...prev,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      }));
    }
  };

  const handleMouseLeave = () => {
    setShowTimeline(false);
    setTooltip((prev) => ({ ...prev, visible: false }));
  };

  const handleContainerMouseEnter = () => {
    setShowTimeline(true);
  };

  const handleContainerMouseLeave = () => {
    setShowTimeline(false);
  };

  const todayPosition = getTodayPosition();
  const timelineMonths = generateTimelineMonths();

  // Token icons component
  const TokenIcons = ({ projects }: { projects: IProject[] }) => (
    <div className="flex -space-x-2 items-center">
      {projects.slice(0, 6).map((project, index) => (
        <div key={project.id || index} className="relative group">
          {project.abc?.icon ? (
            <Image
              src={project?.icon || ""}
              alt={project.abc.tokenTicker || project.title || 'Token'}
              className="w-6 h-6 rounded-full object-cover bg-black"
              width={24}
              height={24}
            />
          ) : null}
          <div 
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              seasonNumber === 1 
                ? "bg-gradient-to-br from-peach-400 to-peach-600 text-black"
                : "bg-gradient-to-br from-purple-400 to-purple-600 text-white"
            }`}
            style={{ display: project.abc?.icon ? 'none' : 'flex' }}
          >
            {project.abc?.tokenTicker?.charAt(0) || project.title?.charAt(0) || 'T'}
          </div>
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none z-10">
            {project.abc?.tokenTicker || project.title}
          </div>
        </div>
      ))}
    </div>
  );

  // Get season header info
  const getSeasonHeaderInfo = (season: number) => {
    const seasonInfo = {
      1: {
        title: "SEASON 1",
        dexListing: "DEX Listing",
        startDate: new Date("2024-10-29"),
      },
      2: {
        title: "SEASON 2",
        dexListing: "DEX Listing",
        startDate: new Date("2025-04-11"),
        additionalInfo: "Sep-Nov",
      },
    };

    return seasonInfo[season as keyof typeof seasonInfo] || {
      title: `SEASON ${season}`,
      dexListing: "DEX Listing",
      startDate: new Date(),
    };
  };

  const seasonInfo = getSeasonHeaderInfo(seasonNumber);

  return (
    <div className="max-w-7xl mx-auto mt-16 text-white">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-[64px] font-anton text-white tracking-tight">
          VESTING SCHEDULE
        </h1>
      </div>

      {/* Chart Container */}
      <div
        ref={containerRef}
        className="relative group pb-0 w-8/12 mx-auto"
        onMouseEnter={handleContainerMouseEnter}
        onMouseLeave={handleContainerMouseLeave}
      >
        {/* Vertical Grid Lines */}
        <div className="absolute top-0 left-0 right-0 h-[380px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
          {timelineMonths.map((month, index) => (
            <div
              key={index}
              className="absolute top-0 bottom-0 w-px bg-gray-700 opacity-30"
              style={{ left: `${month.position}%` }}
            />
          ))}
        </div>

        {/* Season Header */}
        <div className="mb-8 relative">
          <div className="flex items-center mb-6 relative">
            <div
              className="absolute flex items-center"
              style={{ left: `${getDatePosition(seasonInfo.startDate)}%` }}
            >
              <h3 className="text-xl font-anton text-peach-400 uppercase mr-8">
                {seasonInfo.title}
              </h3>
              <div className="flex items-center text-xs">
                <span className="text-qacc-gray-light font-semibold">
                  {seasonInfo.dexListing}
                </span>
                {/* {seasonInfo.additionalInfo && (
                  <span className="text-qacc-gray-light/40 ml-1">
                    {seasonInfo.additionalInfo}
                  </span>
                )} */}
              </div>
            </div>
          </div>

          <div className="space-y-4 relative">
            {vestingData.map((period) => (
              <div key={period.name} className="relative">
                <div
                  className="relative h-9 cursor-pointer transition-all duration-300"
                  onMouseEnter={(e) => handleMouseEnter(e, period)}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  {/* Period Bar */}
                  <div
                    className={`absolute top-0 bottom-0 rounded-lg flex items-center transition-all duration-300 hover:brightness-110 ${
                      period.type === "team"
                        ? "bg-qacc-gray-light/60"
                        : "bg-peach-400/60"
                    }`}
                    style={{
                      left: `${getDatePosition(period.start)}%`,
                      width: `${
                        getDatePosition(period.end) -
                        getDatePosition(period.start)
                      }%`,
                    }}
                  >
                    {/* Label and Icons */}
                    <div className="flex items-center justify-between w-full px-4">
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-xs text-[#020202]">
                          {period.displayName}
                        </span>
                        {period.type === "team" && <TokenIcons projects={seasonProjects} />}
                      </div>
                    </div>
                  </div>

                  {/* Unlock section */}
                  <div
                    className={`absolute top-0 bottom-0 rounded-r-lg flex items-center justify-center px-4 ${
                      period.type === "team"
                        ? "bg-qacc-gray-light"
                        : "bg-peach-400"
                    }`}
                    style={{
                      left: `${getDatePosition(period.cliff)}%`,
                      width: `${
                        getDatePosition(period.end) -
                        getDatePosition(period.cliff)
                      }%`,
                    }}
                  >
                    <div className="text-center flex items-center justify-center gap-1">
                      <span className="text-[#020202]/40 font-bold text-xs">
                        Unlock
                      </span>
                      <span className="text-[#020202]/30 text-xs">
                        {formatDate(period.cliff)}
                      </span>
                    </div>
                  </div>

                  {/* End date */}
                  <div
                    className="absolute top-1/2 transform -translate-y-1/2 text-xs text-qacc-gray-light/60 ml-2"
                    style={{
                      left: `${getDatePosition(period.end)}%`,
                    }}
                  >
                    {formatEndDate(period.end)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="pb-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
          <div className="relative h-full flex items-center">
            {timelineMonths.map((month, index) => (
              <div
                key={index}
                className="absolute transform -translate-x-1/2"
                style={{ left: `${month.position}%` }}
              >
                <div className="text-xs text-qacc-gray-light/40 whitespace-nowrap">
                  {month.fullLabel}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Today Line */}
        {todayPosition >= 0 && (
          <div
            className="absolute top-0 w-[1px] bg-[#D6644F] pointer-events-none h-[380px] transition-all duration-100 ease-in-out"
            style={{ left: `${todayPosition}%` }}
          >
            {/* Top circle */}
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-[#D6644F] rounded-full"></div>

            {/* Bottom circle */}
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-[#D6644F] rounded-full"></div>

            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
              <span className="text-xs text-[#D6644F] font-semibold">
                Today
              </span>
            </div>
          </div>
        )}

        {/* Tooltip */}
        {tooltip.visible && (
          <div
            className="absolute z-50 bg-neutral-900 border border-neutral-700 rounded-lg p-4 shadow-xl pointer-events-none backdrop-blur-sm"
            style={{
              left: `${tooltip.x + 10}px`,
              top: `${tooltip.y - 10}px`,
              transform: "translateY(-100%)",
            }}
          >
            <div className="text-sm">
              <div className="font-semibold text-white mb-2">
                {tooltip.period.displayName}
              </div>
              <div className="space-y-1 text-gray-300">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-400">Start:</span>
                  <span>{tooltip.period.start.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-400">Cliff:</span>
                  <span>{tooltip.period.cliff.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-400">End:</span>
                  <span>{tooltip.period.end.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-400">Cliff period:</span>
                  <span>
                    {calculateDays(tooltip.period.start, tooltip.period.cliff)}{" "}
                    days
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-400">Vesting period:</span>
                  <span>
                    {calculateDays(tooltip.period.cliff, tooltip.period.end)}{" "}
                    days
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-400">Total duration:</span>
                  <span>
                    {calculateDays(tooltip.period.start, tooltip.period.end)}{" "}
                    days
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VestingSchedule; 
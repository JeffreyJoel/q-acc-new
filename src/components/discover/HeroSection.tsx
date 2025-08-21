"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { VideoModal } from "@/components/modals/VideoModal";
import { formatNumberCompact } from "@/helpers";

const HeroSection = () => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [stats, setStats] = useState<{
    total_raised_pol: number | null;
    amount_in_protocol_pol: number | null;
    total_market_cap: number | null;
  } | null>(null);

 

  useEffect(() => {
    const CACHE_KEY = "dune_stats_hero";
    const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      const now = Date.now();
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.timestamp && now - parsed.timestamp < ONE_WEEK_MS) {
          setStats(parsed.data);
          return;
        }
      }

      // Fetch from API if no valid cache
      fetch("/api/dune")
        .then((res) => res.json())
        .then((data) => {
          const formattedData = {
            total_raised_pol: Number(data.total_raised_pol) || null,
            amount_in_protocol_pol: Number(data.amount_in_protocol_pol) || null,
            total_market_cap: Number(data.total_market_cap) || null,
          };
          setStats(formattedData);
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ timestamp: now, data: formattedData })
          );
        })
        .catch((err) => console.error("Failed to fetch Dune stats", err));
    } catch (err) {
      console.error("Error accessing localStorage for Dune stats", err);
    }
  }, []);

  const handlePlayButtonClick = () => {
    setIsVideoModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsVideoModalOpen(false);
  };

  return (
    <div className="bg-gradient-to-b from-[#000000] to-qacc-gray-dark relative w-full py-8 md:py-16 lg:py-0 lg:min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Vector */}
      <div className="pt-20 w-full absolute inset-0 flex items-center justify-center">
        <div className="relative w-full h-full max-w-7xl xl:max-w-full xl:w-11/12 mx-auto">
          <Image
            src="/images/landing/landing-vector.svg"
            alt="Hero Background"
            fill
            className="object-contain opacity-80 "
            priority
          />
        </div>
      </div>

      <div className="relative z-10 text-center px-4 sm:px-6 max-w-7xl mx-auto w-full">
        {/* Main Title */}
        <h1 className="mt-24 font-anton font-normal text-6xl md:text-[120px] lg:text-[140px] xl:text-[180px] mb-8">
          <span className="text-[#5F6868]">THE FUTURE OF</span>
          <br />
          <span className="text-white">TOKENIZATION</span>
        </h1>

        {/* Play Button */}
        <div className="absolute left-0 right-0 top-1/3 mx-auto mb-8 sm:mb-12 md:mb-16">
          <button 
            onClick={handlePlayButtonClick}
            className="mx-auto block"
          >
            <Image
              src="/images/landing/play-button.png"
              className="hover:scale-110 transition-all duration-200 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 xl:w-[138px] xl:h-[138px]"
              alt="play button"
              width={138}
              height={138}
            />
          </button>
        </div>

        {/* Stats Container */}
        <div className="bg-white/10 backdrop-blur-[12px] rounded-2xl sm:rounded-[28px] p-4 sm:p-6 md:p-7 max-w-5xl mx-auto">
          {/* Desktop/Tablet Layout (md and up) */}
          <div className="hidden md:block">
            <div className="flex flex-row justify-between items-center gap-4 lg:gap-6 xl:gap-10 text-center">
              {/* Accelerator Stats Label */}
              <div className="-space-y-1 flex-shrink-0">
                <div className="font-tusker-6 text-white/30 text-right text-sm lg:text-lg xl:text-xl font-semibold uppercase tracking-wider">
                  ACCELERATOR
                </div>
                <div className="font-tusker-6 text-white/30 text-right text-sm lg:text-lg xl:text-xl font-semibold uppercase tracking-wider">
                  STATS
                </div>
              </div>

              {/* Stats Items */}
              <div className="flex flex-row justify-between flex-1 gap-4 lg:gap-6">
                <div className="space-y-0.1">
                  <div className="text-white text-2xl xl:text-3xl font-bold">2</div>
                  <div className="text-white/30 font-medium text-[13px] leading-normal">Seasons</div>
                </div>

                <div className="space-y-0.1">
                  <div className="text-white text-2xl xl:text-3xl font-bold">12</div>
                  <div className="text-white/30 font-medium text-[13px] leading-normal">Projects</div>
                </div>

                <div className="space-y-0.1">
                  <div className="text-white text-2xl xl:text-3xl font-bold">{formatNumberCompact(stats?.total_raised_pol)}</div>
                  <div className="text-white/30 font-medium text-[13px] leading-normal">Total Raised</div>
                </div>

                <div className="space-y-0.1">
                  <div className="text-white text-2xl xl:text-3xl font-bold">{formatNumberCompact(stats?.amount_in_protocol_pol)}</div>
                  <div className="text-white/30 font-medium text-[13px] leading-normal">In Protocol</div>
                </div>

                <div className="space-y-0.1">
                  <div className="text-white text-2xl xl:text-3xl font-bold">{formatNumberCompact(stats?.total_market_cap, true)}</div>
                  <div className="text-white/30 font-medium text-[13px] leading-normal">Peak Market Cap</div>
                </div>

                <div className="space-y-0.1">
                  <div className="text-white text-2xl xl:text-3xl font-bold">$1.4M</div>
                  <div className="text-white/30 font-medium text-[13px] leading-normal">7d Total Volume</div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile/Small Tablet Layout (sm and below) */}
          <div className="block md:hidden">
            {/* Accelerator Stats Header */}
            <div className="text-center mb-6">
              <div className="font-tusker-6 text-white/30 text-lg sm:text-xl font-semibold uppercase tracking-wider">
                ACCELERATOR STATS
              </div>
            </div>

            {/* 3x2 Grid Layout for Mobile */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6">
              <div className="text-center space-y-1">
                <div className="text-white text-2xl sm:text-3xl font-bold">2</div>
                <div className="text-white/30 font-medium text-xs sm:text-sm leading-normal">Seasons</div>
              </div>

              <div className="text-center space-y-1">
                <div className="text-white text-2xl sm:text-3xl font-bold">12</div>
                <div className="text-white/30 font-medium text-xs sm:text-sm leading-normal">Projects</div>
              </div>

              <div className="text-center space-y-1">
                <div className="text-white text-lg sm:text-2xl font-bold">{formatNumberCompact(stats?.total_raised_pol)}</div>
                <div className="text-white/30 font-medium text-xs sm:text-sm leading-normal">Total Raised</div>
              </div>

              <div className="text-center space-y-1">
                <div className="text-white text-lg sm:text-2xl font-bold">{formatNumberCompact(stats?.amount_in_protocol_pol)}</div>
                <div className="text-white/30 font-medium text-xs sm:text-sm leading-normal">In Protocol</div>
              </div>

              <div className="text-center space-y-1">
                <div className="text-white text-lg sm:text-2xl font-bold">{formatNumberCompact(stats?.total_market_cap, true)}</div>
                <div className="text-white/30 font-medium text-xs sm:text-sm leading-normal">Peak Market Cap</div>
              </div>

              <div className="text-center space-y-1">
                <div className="text-white text-lg sm:text-2xl font-bold">$1.4M</div>
                <div className="text-white/30 font-medium text-xs sm:text-sm leading-normal">7d Total Volume</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <VideoModal isOpen={isVideoModalOpen} onClose={handleCloseModal} />
    </div>
  );
};

export default HeroSection; 
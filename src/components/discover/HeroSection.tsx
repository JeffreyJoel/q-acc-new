"use client";

import Image from "next/image";
import { useState } from "react";
import { VideoModal } from "@/components/modals/VideoModal";

const HeroSection = () => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const handlePlayButtonClick = () => {
    setIsVideoModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsVideoModalOpen(false);
  };

  return (
    <div className="bg-gradient-to-b from-[#000000] to-qacc-gray-dark relative w-full min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Vector */}
      <div className="mt-20 w-11/12 mx-auto opacity-80 absolute inset-0 flex items-center justify-center">
        <Image
          src="/images/landing/landing-vector.svg"
          alt="Hero Background"
          fill
          className="object-contain "
        />
      </div>

      <div className="relative z-10 text-center px-6 max-w-7xl mx-auto">
        <h1 className="mt-24 font-anton font-normal text-6xl md:text-7xl lg:text-8xl xl:text-[180px] mb-8">
          <span className="text-[#5F6868]">THE FUTURE OF</span>
          <br />
          <span className="text-white">TOKENIZATION</span>
        </h1>

        <div className="absolute left-0 right-0 top-1/3 mx-auto">
          <button onClick={handlePlayButtonClick}>
            <Image
              src="/images/landing/play-button.png"
              className="hover:scale-90 transition-all duration-200  scale-85 mx-auto"
              alt="play button"
              width={138}
              height={138}
            />
          </button>
        </div>

        <div className=" bg-white/10 backdrop-blur-[12px] rounded-[28px] p-7 max-w-7xl mx-auto">
          <div className="w-full flex flex-row justify-between gap-10 text-center">
            <div className="-space-y-1">
              <div className="font-tusker-6 text-white/30 text-right text-xl font-semibold uppercase tracking-wider">
                ACCELERATOR
              </div>
              <div className="font-tusker-6 text-white/30 text-right text-xl font-semibold uppercase tracking-wider">
                STATS
              </div>
            </div>

            <div className="space-y-0.1">
              <div className="text-white text-3xl font-bold">2</div>
              <div className="text-white/30 font-medium text-[13px] leading-normal">Seasons</div>
            </div>

            <div className="space-y-0.1">
              <div className="text-white text-3xl font-bold">12</div>
              <div className="text-white/30 font-medium text-[13px] leading-normal">Projects</div>
            </div>

                    <div className="space-y-0.1">
              <div className="text-white text-3xl font-bold">325K POL</div>
              <div className="text-white/30 font-medium text-[13px] leading-normal">Total Raised</div>
            </div>

                    <div className="space-y-0.1">
              <div className="text-white text-3xl font-bold">3.8M POL</div>
              <div className="text-white/30 font-medium text-[13px] leading-normal">In Protocol</div>
            </div>

            <div className="space-y-0.1">
              <div className="text-white text-3xl font-bold">$6.5M+</div>
              <div className="text-white/30 font-medium text-[13px] leading-normal">Peak Market Cap</div>
            </div>

            <div className="space-y-0.1">
              <div className="text-white text-3xl font-bold">$1.4M</div>
              <div className="text-white/30 font-medium text-[13px] leading-normal">7d Total Volume</div>
            </div>
          </div>
        </div>
      </div>
      <VideoModal isOpen={isVideoModalOpen} onClose={handleCloseModal} />
    </div>
  );
};

export default HeroSection;

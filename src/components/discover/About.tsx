import React from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const About = () => {
  return (
    <div className="flex flex-col lg:flex-row gap-12 p-8 max-w-7xl mx-auto">
      {/* Left Dark Card */}
      <div className="flex-1 bg-black rounded-3xl p-[60px] text-white relative overflow-hidden">
        <div className="mb-8 flex items-center justify-between">
          <Image
            src="/images/landing/about-vector.svg"
            alt=""
            width={120}
            height={120}
          />
          <div className="flex flex-col space-y-5">
            <p className="text-qacc-gray-light text-base font-medium">
              Guaranteed liquidity
            </p>
            <p className="text-qacc-gray-light text-base font-medium">Anti-rugpull</p>
            <p className="text-qacc-gray-light text-base font-medium">
              Sybil resistant
            </p>
            <p className="text-qacc-gray-light text-base font-medium">
              Programmatic decentralization
            </p>

            {/* Learn More Button */}
            <div className="mb-12">
              <Button
                variant="outline"
                className="bg-transparent border-peach-400 text-peach-400 hover:bg-peach-400 hover:text-black transition-colors rounded-lg"
              >
                LEARN MORE ABOUT Q/ACC →
              </Button>
            </div>
          </div>
        </div>

        {/* Main Heading */}
        <div className="mt-24">
          <h1 className="font-anton text-4xl lg:text-[64px] font-semibold tracking-wider leading-none">
            THE{" "}
            <span className="font-anton text-peach-400">
              SAFEST WAY
            </span>
            <br />
            TO LAUNCH <span className="font-anton text-qacc-gray-light">YOUR</span>
            <br />
            <span className="font-anton text-qacc-gray-light">TOKEN ECONOMY</span>
          </h1>
        </div>
      </div>

      {/* Right Light Card */}
      <div className="flex-1 bg-qacc-gray-light rounded-3xl p-[60px] text-black">
        {/* Title */}
        <div className="mb-8">
          <h2 className="font-anton text-4xl lg:text-[64px] font-normal text-white leading-none tracking-wide">
            ACCELERATION <br />
            FLOW
          </h2>
        </div>

        {/* Steps */}
        <div className="space-y-6 mb-6">
          {/* Step 1 */}
          <div className="flex items-center space-x-4">
            <div className="font-anton text-[40px] font-bold text-black">1</div>
            <div>
              <h3 className="text-xl font-semibold text-black">Apply</h3>
              <p className="text-gray-600 text-base font-medium">
                Send a 2-minute application
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start space-x-4">
            <div className="font-anton text-[40px] font-bold text-black">2</div>
            <div>
              <h3 className="text-xl font-semibold text-black">Fund</h3>
              <p className="text-gray-600 text-base font-medium">
                Shape tokenomics and campaign
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start space-x-4">
            <div className="font-anton text-[40px] font-bold text-black">3</div>
            <div>
              <h3 className="text-xl font-semibold text-black">Launch</h3>
              <p className="text-gray-600 text-base font-medium">
                Launch project token bonded to an ABC
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start space-x-4">
            <div className="font-anton text-[40px] font-bold text-black">4</div>
            <div>
              <h3 className="text-xl font-semibold text-black">Graduate</h3>
              <p className="text-gray-600 text-base font-medium">
                Leave with liquid token and solid community
              </p>
            </div>
          </div>
        </div>

        {/* Apply Button */}
        <div className="">
          <Button className="bg-black text-qacc-gray-light text-xs font-medium hover:bg-gray-800 transition-colors px-5 py-3 rounded-lg">
            APPLY SEASON 3 →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default About;

"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { IconX } from "../icons/IconX";
import { IconFarcaster } from "../icons/IconFarcaster";
import { IconMirror } from "../icons/IconMirror";
import { IconEmail } from "../icons/IconEmail";

export const Footer: React.FC = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  // Dummy subscribe handler
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setSubscribed(true);
      setLoading(false);
    }, 1200);
  };

  return (
    <footer className="bg-[#000]/10 w-full px-4 sm:px-6 lg:px-8 pt-8 pb-12">
      <div className="sm:px-6 lg:px-8 mx-auto w-full flex flex-col gap-8">
        <div className="flex flex-col lg:flex-row md:gap-24 gap-4 justify-between items-start w-full px-8">
          <div className="flex items-center">
            <Image
              src="/images/logos/logo-horisontal-dim.svg"
              alt="Quadratic Accelerator Logo"
              width={220}
              height={60}
              color="#91A0A166"
              className="opacity-100 min-w-[220px] h-[60px] flex-[2]"
              priority
            />
          </div>
          <div className="flex flex-col items-start gap-6  w-full">
            <Link
              href="https://qacc.giveth.io/privacy-policy"
              target="_blank"
              className="font-inter font-medium text-sm text-qacc-gray-light opacity-40 hover:underline"
            >
              Privacy Policy
            </Link>
            <Link
              href="https://qacc.giveth.io/terms-and-conditions"
              target="_blank"
              className="font-inter font-medium text-sm text-qacc-gray-light opacity-40 hover:underline"
            >
              Terms and Conditions
            </Link>
          </div>
          <div className="flex items-start gap-6 mt-2">
            <Link
              target="_blank"
              href={"https://x.com/theqacc"}
              className="text-qacc-gray-light hover:text-white"
            >
              <IconX color="#91A0A166" />
            </Link>
            <Link
              target="_blank"
              href={"https://warpcast.com/theqacc"}
              className="text-qacc-gray-light hover:text-white"
            >
              <IconFarcaster color="#91A0A166" />
            </Link>
            <Link
              target="_blank"
              href={"https://mirror.xyz/qacc.eth"}
              className="text-qacc-gray-light hover:text-white"
            >
              <IconMirror color="#91A0A166" />
            </Link>
            <Link
              target="_blank"
              href={"mailto:info@qacc.xyz"}
              className="text-qacc-gray-light hover:text-qacc-gray-light"
            >
              <IconEmail color="#91A0A166" />
            </Link>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center w-full mt-4">
          <div className="flex flex-col w-full max-w-2xl ">
            <h2 className="font-anton text-center md:text-start  tracking-wide text-[1.75rem] sm:text-[2rem] md:text-[2.25rem] lg:text-[2.5rem] font-normal text-qacc-gray-light mb-4 md:mb-6">
              JOIN OUR MAILING LIST
            </h2>
            <form
              onSubmit={handleSubscribe}
              className="flex flex-col sm:flex-row w-full items-center justify-center gap-3 sm:gap-4"
            >
              <Input
                type="email"
                required
                placeholder="YOUR EMAIL"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-black text-[#b2bdbb] placeholder:text-qacc-gray-light/30 font-ibm text-base sm:text-lg md:text-xl px-4 sm:px-6 py-3 sm:py-4 rounded-xl border-none focus:ring-0 focus:outline-none w-full shadow-none"
                disabled={subscribed}
                style={{ height: "48px", minHeight: "48px" }}
              />
              <Button
                type="submit"
                className="bg-qacc-gray-light text-black text-base sm:text-lg md:text-xl font-semibold rounded-xl px-6 sm:px-8 py-3 sm:py-4 min-w-[120px] sm:min-w-[150px] h-[48px] shadow-none hover:bg-[#c7d1cf] transition-colors duration-200 w-full sm:w-auto"
                disabled={loading || subscribed}
              >
                {subscribed
                  ? "SUBSCRIBED"
                  : loading
                  ? "SUBSCRIBING..."
                  : "SUBSCRIBE"}
              </Button>
            </form>
            <p className="text-qacc-gray-light text-center md:text-start text-sm sm:text-base mt-4 opacity-20 max-w-md">
              By joining you agree to our{" "}
              <Link
                href="https://qacc.giveth.io/privacy-policy"
                target="_blank"
                className="underline hover:text-neutral-300"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

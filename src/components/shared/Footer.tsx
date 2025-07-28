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
    <footer className="bg-[#000]/10 w-full px-0 pt-8 pb-4">
      <div className="sm:px-6 lg:px-8 mx-auto w-full flex flex-col gap-8">
        <div className="flex flex-row justify-between items-start w-full px-8">
          <div className="flex items-center">
            <Image
              src="/images/logos/logo-horisontal-dim.svg"
              alt="Quadratic Accelerator Logo"
              width={220}
              height={60}
              color="#91A0A166"
              className="opacity-100 w-[220px] h-auto"
              priority
            />
          </div>
          <div className="flex flex-col items-start gap-6 flex-[2] min-w-[350px] max-w-2xl w-full">
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

            <div className="flex flex-col w-full mt-12">
              <h2
                className="font-anton tracking-wide text-[2.5rem] font-normal text-qacc-gray-light mb-6"
              >
                JOIN OUR MAILING LIST
              </h2>
              <form
                onSubmit={handleSubscribe}
                className="flex flex-row w-full items-center justify-center gap-4"
              >
                <Input
                  type="email"
                  required
                  placeholder="YOU EMAIL"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-black text-[#b2bdbb] placeholder:text-qacc-gray-light/30 font-ibm text-xl px-6 py-4 rounded-xl border-none focus:ring-0 focus:outline-none w-full max-w-xl shadow-none"
                  disabled={subscribed}
                  style={{ height: "56px" }}
                />
                <Button
                  type="submit"
                  className="bg-qacc-gray-light text-black text-xl font-semibold rounded-xl px-8 py-4 min-w-[150px] h-[56px] shadow-none hover:bg-[#c7d1cf] transition-colors duration-200"
                  disabled={loading || subscribed}
                >
                  {subscribed
                    ? "SUBSCRIBED"
                    : loading
                    ? "SUBSCRIBING..."
                    : "SUBSCRIBE"}
                </Button>
              </form>
              <p className="text-qacc-gray-light text-base mt-4 text-center opacity-20">
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
      </div>
    </footer>
  );
};

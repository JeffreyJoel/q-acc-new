"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Play } from "lucide-react";
import Image from "next/image";
import { VideoModal } from "@/components/modals/VideoModal";
import Link from "next/link";

interface FAQItem {
  question: string;
  answer: string | React.ReactNode;
}

const FAQs = () => {
  const [openQuestion, setOpenQuestion] = useState<number | null>(0);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const faqData: FAQItem[] = [
    {
      question: "What is the q/acc protocol?",
      answer: (
        <div className="space-y-4">
          <p>
            The Quadratic Accelerator (q/acc) continues to redefine fair launch
            mechanics by combining Quadratic Funding with chain-sponsored
            Initial Coin Offerings (ICOs). In Season 2, sponsored by Polygon, we
            further refined our approach to ecosystem growth through
            protocol-sponsored tokenization (PST).
          </p>
        </div>
      ),
    },
    {
      question: "How will q/acc work in practice?",
      answer: (
        <div className="space-y-4">
          <p>
            Each season accepts a group of web3 startup founders into our 8-week
            program. During that time they will launch an Augmented Bonding
            Curve for their project and join their first q/acc round, where
            anyone can buy their tokens. The round's matching pool funds build
            secondary market liquidity for project tokens.
          </p>
          <p>
            Project may participate in future q/acc rounds to continue to build
            liquidity.
          </p>
        </div>
      ),
    },
    {
      question: "What are Augmented Bonding Curves (ABC)?",
      answer: (
        <div className="space-y-4">
          <p>
            A bonding curve is a smart contract that algorithmically determines
            a token's price, typically increasing as more tokens are minted,
            based on it's circulating supply.
          </p>
          <p>
            An Augmented Bonding Curve (ABC) provides the same automatic
            liquidity and dampened price volatility as other bonding curves and
            introduces two modifications: transaction tributes, and a vesting
            mechanism that can be applied to the initial tokens minted or any
            subsequent token mints and redemptions.
          </p>
          <p>
            Find out more on{" "}
            <Link
              href="https://www.commonsstack.org/augmented-bonding-curve"
              target="_blank"
              rel="noopener noreferrer"
              className="text-qacc-gray-light hover:text-white underline"
            >
              Commons Stack's ABC page
            </Link>
            .
          </p>
        </div>
      ),
    },
    {
      question: "What is Quadratic Funding (QF)?",
      answer: (
        <div className="space-y-4">
          <p>
            Quadratic Funding is a mechanism that amplifies smaller
            contributions more than larger ones, creating a more democratic
            funding process where the number of contributors matters as much as
            the total amount contributed.
          </p>
          <p>
            Quadratic Funding is a democratic funding mechanism where the amount
            of allocation from a matching pool that a project receives is
            proportional to the number of contributors. It optimizes for
            broad-based support by giving more weight to the number of
            individual contributions rather than the total amount of money
            contributed.
          </p>
          <p>
            The q/acc protocol used the same quadratic matching formula as QF.
          </p>
          <p>
            Find out more on the{" "}
            <Link
              href="https://www.wtfisqf.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-qacc-gray-light hover:text-white underline"
            >
              WTF is QF
            </Link>{" "}
            site or on{" "}
            <Link
              href="https://qf.gitcoin.co/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-qacc-gray-light hover:text-white underline"
            >
              Gitcoin's QF site
            </Link>
            .
          </p>
        </div>
      ),
    },
    {
      question: "Where can I find out more?",
      answer: (
        <div className="space-y-4">
          <p>
            You still have questions? That's normal, this is just getting
            started. Visit our{" "}
            <Link
              href="https://giveth.notion.site/Quadratic-Acceleration-q-acc-Knowledge-Hub-4752f35fee2a47fe9e29556dbcfe6883"
              target="_blank"
              rel="noopener noreferrer"
              className="text-qacc-gray-light hover:text-white underline"
            >
              Knowledge Hub
            </Link>{" "}
            for more information. We'll also share updates on{" "}
            <Link
              href="https://x.com/theqacc"
              target="_blank"
              rel="noopener noreferrer"
              className="text-qacc-gray-light hover:text-white underline"
            >
              X
            </Link>{" "}
            and{" "}
            <Link
              href="https://farcaster.xyz/theqacc"
              target="_blank"
              rel="noopener noreferrer"
              className="text-qacc-gray-light hover:text-white underline"
            >
              Farcaster
            </Link>
            .
          </p>
          <p>
            If you need to get in touch with us, email{" "}
            <Link
              href="mailto:qacc@giveth.io"
              className="text-qacc-gray-light hover:text-white underline"
            >
              qacc@giveth.io
            </Link>
            .
          </p>
        </div>
      ),
    },
  ];

  const toggleQuestion = (index: number) => {
    setOpenQuestion(openQuestion === index ? null : index);
  };

  return (
    <div className="bg-qacc-black text-white py-32 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-stretch">
          <div className="space-y-8">
            <h2 className="font-anton text-[42px] lg:text-[64px] tracking-wider mb-8 md:mb-12">
              FREQUENTLY ASKED
            </h2>

            <div className="mt-16">
              {faqData.map((faq, index) => (
                <div
                  key={index}
                  className={`border-b border-white/10 ${
                    index === 0 ? "border-t border-white/10" : ""
                  }`}
                >
                  <button
                    onClick={() => toggleQuestion(index)}
                    className="w-full flex justify-between items-center text-left py-[22px] hover:text-peach-400 transition-colors"
                  >
                    <span className="text-lg md:text-2xl font-bold pr-4">
                      {faq.question}
                    </span>
                    {openQuestion === index ? (
                      <ChevronUp className="w-6 h-6 text-white/20 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-white/20 flex-shrink-0" />
                    )}
                  </button>

                  {openQuestion === index && (
                    <div className="pb-4 pr-8">
                      <div className="text-white/50 leading-relaxed">
                        {typeof faq.answer === "string" ? (
                          <p>{faq.answer}</p>
                        ) : (
                          faq.answer
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Video Section */}
          <div
            className="relative w-full h-[614px]  md:h-full lg:h-[614px] xl:h-full mx-auto lg:mx-0 cursor-pointer"
            onClick={() => setIsVideoModalOpen(true)}
          >
            <Image
              src="/images/landing/how-qacc-works.svg"
              alt="How Q-ACC works"
              fill
              className="w-full h-full mx-auto object-cover sm:object-contain rounded-2xl"
            />
          </div>
        </div>
      </div>

      {/* Video Modal */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
      />
    </div>
  );
};

export default FAQs;

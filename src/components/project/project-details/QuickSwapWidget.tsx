"use client";

import { useState } from "react";
import Image from "next/image";

/**
 * A lightweight visual replica of the QuickSwap widget with two tabs:
 * 1. QUICKSWAP – generic swap with POL as input
 * 2. BUY DIRECTLY – direct buy using wPOL → AKA
 *
 * This is **NOT** a functional swap component – it is a cosmetic/UX shell that
 * matches the designs. Integrate the real widget / transaction logic later.
 */
export default function QuickSwapWidget() {
  const [tab, setTab] = useState<"quickswap" | "direct">("quickswap");

  const TabButton = ({ id, label }: { id: "quickswap" | "direct"; label: string }) => (
    <button
      onClick={() => setTab(id)}
      className={`flex-1 text-center py-2 rounded-lg font-bold text-sm transition-colors
        ${tab === id ? (id === "quickswap" ? "bg-blue-600" : "bg-peach-400") : "bg-black/30"}
      `}
    >
      {label}
    </button>
  );

  const PayReceiveRow = ({
    label,
    tokenSymbol,
    iconSrc,
  }: {
    label: string;
    tokenSymbol: string;
    iconSrc: string;
  }) => (
    <div className="flex items-center justify-between bg-black px-4 py-3 rounded-2xl border border-white/10 text-white">
      <div className="flex items-center gap-3">
        <Image src={iconSrc} alt={tokenSymbol} width={24} height={24} />
        <span className="font-anton text-lg">{tokenSymbol}</span>
      </div>
      <div className="text-right">
        <div className="text-xl font-bold">0.00</div>
        <div className="text-xs text-white/40">~$0</div>
      </div>
    </div>
  );

  return (
    <div className="w-full bg-[#1A1A1A] rounded-3xl p-6 text-white flex flex-col gap-4">
      <h2 className="font-anton text-peach-300 text-center text-2xl uppercase">
        Shut Up And Take My $POL
      </h2>

      {/* Tabs */}
      <div className="flex bg-black/40 rounded-lg overflow-hidden">
        <TabButton id="quickswap" label="QUICKSWAP" />
        <TabButton id="direct" label="BUY DIRECTLY" />
      </div>

      {/* Content */}
      {tab === "quickswap" ? (
        <>
          <PayReceiveRow label="PAY" tokenSymbol="POL" iconSrc="/images/icons/pol.svg" />
          <div className="flex justify-center -my-1">
            <div className="bg-gray-700 w-8 h-8 rounded-lg flex items-center justify-center">
              ⇵
            </div>
          </div>
          <PayReceiveRow label="RECEIVE" tokenSymbol="AKA" iconSrc="/images/icons/aka.svg" />
          <button className="mt-4 bg-peach-300 text-black font-bold py-3 rounded-xl w-full">
            CONNECT WALLET
          </button>
          <div className="text-xs text-white/40 text-center mt-2 flex items-center justify-center gap-1">
            Powered by
            <Image src="/images/icons/quickswap.svg" alt="QuickSwap" width={80} height={16} />
          </div>
        </>
      ) : (
        <>
          <PayReceiveRow label="PAY" tokenSymbol="WPOL" iconSrc="/images/icons/wpol.svg" />
          <div className="flex justify-center -my-1">
            <div className="bg-gray-700 w-8 h-8 rounded-lg flex items-center justify-center">
              ⇵
            </div>
          </div>
          <PayReceiveRow label="RECEIVE" tokenSymbol="AKA" iconSrc="/images/icons/aka.svg" />
          {/* Slippage */}
          <div className="flex items-center gap-2 text-xs mt-2 text-white/50">
            Slippage Tolerance:
            {[
              { label: "0.1%", active: false },
              { label: "0.5%", active: true },
              { label: "1%", active: false },
            ].map((s) => (
              <span
                key={s.label}
                className={`px-2 py-1 rounded-md border border-white/20 ${
                  s.active ? "bg-peach-300 text-black" : "bg-black/40"
                }`}
              >
                {s.label}
              </span>
            ))}
          </div>
          <button className="mt-4 bg-peach-300 text-black font-bold py-3 rounded-xl w-full">
            CONNECT WALLET
          </button>
          <div className="text-xs text-white/40 text-center mt-2 flex items-center justify-center gap-1">
            Powered by
            <Image src="/images/landing/how-qacc-works.svg" alt="Quadratic Accelerator" width={120} height={16} />
          </div>
        </>
      )}
    </div>
  );
}



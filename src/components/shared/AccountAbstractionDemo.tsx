"use client";

import { useState } from "react";
import { USDCTransfer } from "./USDCTransfer";
import { SmartUSDCTransfer } from "./SmartUSDCTransfer";
import { useZeroDev } from "@/contexts/ZeroDevContext";

export function AccountAbstractionDemo() {
  const [activeTab, setActiveTab] = useState<"regular" | "smart">("regular");
  const { kernelClient, smartAccountAddress } = useZeroDev();

  return (
    <div className="space-y-6">
      <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
        <h2 className="text-2xl font-bold text-white mb-4">Account Abstraction Demo</h2>
        <p className="text-neutral-400 mb-6">
          Compare regular USDC transfers with gasless smart account transfers powered by ZeroDev.
        </p>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab("regular")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "regular"
                ? "bg-peach-400 text-black"
                : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
            }`}
          >
            Regular Transfer
          </button>
          <button
            onClick={() => setActiveTab("smart")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "smart"
                ? "bg-green-400 text-black"
                : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
            }`}
          >
            Smart Account (Gasless)
          </button>
        </div>

        {/* Transfer Component */}
        <div className="min-h-[500px]">
          {activeTab === "regular" ? (
            <USDCTransfer />
          ) : (
            <SmartUSDCTransfer />
          )}
        </div>

        {/* Feature Comparison */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="bg-neutral-900 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-peach-400"></div>
              Regular Transfer
            </h3>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li>• Requires gas fees in POL</li>
              <li>• Uses your connected wallet</li>
              <li>• Standard ERC-20 transfer</li>
              <li>• Manual network switching</li>
            </ul>
          </div>

          <div className="bg-neutral-900 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              Smart Account Transfer
            </h3>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li>• Gas fees sponsored by ZeroDev</li>
              <li>• Uses Kernel smart account</li>
              <li>• Enhanced security & features</li>
              <li>• Automatic network management</li>
            </ul>
            {smartAccountAddress && (
              <div className="mt-3 p-2 bg-green-900/20 rounded border border-green-800/50">
                <p className="text-xs text-green-400">
                  Smart Account: {smartAccountAddress.slice(0, 10)}...{smartAccountAddress.slice(-8)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

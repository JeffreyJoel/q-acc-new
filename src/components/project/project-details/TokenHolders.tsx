"use client";

import { shortenAddress } from "@/helpers/address";
import { ITokenHolder, ITokenHolding } from "@/types/token-holders.type";
import { useTokenHolders } from "@/hooks/useTokenHolders";
import { useTokenHolderTags } from "@/hooks/useTokenHolders";
import { useMemo } from "react";

export default function TokenHolders({
  tokenAddress,
  paymentRouter,
  projectName,
}: {
  tokenAddress: string;
  paymentRouter: string;
  projectName: string;
}) {
  const {
    data: tokenHolders,
    isLoading,
    error,
  } = useTokenHolders(tokenAddress, { enabled: !!tokenAddress });

  const { data: taggedHolders } = useTokenHolderTags(projectName);

  console.log("taggedHolders", taggedHolders);

  const tagMap = useMemo(() => {
    const map = new Map<string, string>();
    taggedHolders?.forEach((h: ITokenHolding) => {
      if (h.address && h.tag) {
        map.set(h.address.toLowerCase(), h.tag);
      }
    });
    return map;
  }, [taggedHolders]);

  const holders: ITokenHolder[] = tokenHolders?.holders || [];
  const holdersCount: number = tokenHolders?.totalHolders ?? holders.length;

  const getHolderLabel = (address: string) => {
    if (
      address.toLowerCase() === paymentRouter.toLowerCase()
    ) {
      return "Vesting Contract";
    }
    const lowerAddr = address.toLowerCase();
    return tagMap.get(lowerAddr) || "";
  };

  if (isLoading) {
    return (
      <div className="bg-white/5 px-6 lg:px-8 py-8 rounded-3xl">
        <div className="flex flex-row items-baseline justify-between">
          <div className="flex flex-row items-baseline gap-2">
            <h2 className="text-[40px] font-anton text-white">HOLDERS</h2>
            <span className="text-gray-400 text-2xl font-anton">...</span>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-peach-400"></div>
          <p className="text-gray-400 text-center mt-4">Loading token holders...</p>
        </div>
      </div>
    );
  }


  if (error) {
    return (
      <div className="bg-white/5 px-6 lg:px-8 py-8 rounded-3xl">
        <div className="flex flex-row items-baseline justify-between">
          <div className="flex flex-row items-baseline gap-2">
            <h2 className="text-[40px] font-anton text-white">HOLDERS</h2>
            <span className="text-gray-400 text-2xl font-anton">Error</span>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-8">
          <p className="text-red-400 text-center mb-4">
            Failed to load token holders: {error.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 px-6 lg:px-8 py-8 rounded-3xl">
      <div className="flex flex-row items-baseline justify-between">
        <div className="flex flex-row items-baseline gap-2">
          <h2 className="text-[40px] font-anton text-white">HOLDERS</h2>
          <span className="text-gray-400 text-2xl font-anton">{holdersCount}</span>
        </div>
      </div>

      {holdersCount === 0 ? (
        <div className="flex flex-col items-center justify-center py-8">
          <p className="text-gray-400 text-center">
            No token holders available for this project.
          </p>
        </div>
      ) : (
        <div className="flex flex-col justify-center gap-4 mt-6">
          <ol className="flex flex-col gap-4 list-none">
            {holders.slice(0, 20).map((holder, index) => {
              const holderLabel = getHolderLabel(holder.address);
              return (
                <li
                  key={`${holder.address}-${index}`}
                  className="flex items-center"
                >
                  <span className="text-white/30 font-ibm-mono mr-2 font-bold">
                    {index + 1}.
                  </span>
                  <div className="flex flex-row items-center justify-between w-full">
                    <div className="flex flex-col">
                      <span className="font-ibm-mono text-white font-medium">
                        {shortenAddress(holder.address)}
                      </span>
                      {holderLabel && (
                        <span className="text-white/30 text-sm">{holderLabel}</span>
                      )}
                    </div>
                    <div className="text-white/30 font-medium">
                      {holder.percentage.toFixed(4)}%
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}

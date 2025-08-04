"use client";
import { shortenAddress } from "@/helpers/address";
import { ITokenHolder } from "@/types/token-holders.type";
import { useEffect, useState } from "react";

export default function TokenHolders({
  tokenAddress,
  paymentProcessor,
}: {
  tokenAddress: string;
  paymentProcessor: string;
}) {
  const [tokenHolders, setTokenHolders] = useState<ITokenHolder[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTokenHolders = async () => {
      if (!tokenAddress) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/token-holders?tokenAddress=${tokenAddress}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch token holders');
        }

        const data = await response.json();
        setTokenHolders(data as ITokenHolder[]);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokenHolders();
  }, [tokenAddress]);

  const refetch = () => {
    if (tokenAddress) {
      const fetchTokenHolders = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
          const response = await fetch(`/api/token-holders?tokenAddress=${tokenAddress}`);
          
          if (!response.ok) {
            throw new Error('Failed to fetch token holders');
          }

          const data = await response.json();
          setTokenHolders(data as ITokenHolder[]);
        } catch (err) {
          setError(err instanceof Error ? err : new Error('An error occurred'));
        } finally {
          setIsLoading(false);
        }
      };

      fetchTokenHolders();
    }
  };

  function getHolderLabel(holder: any) {
    if (holder.owner_address === paymentProcessor) {
      return "Payment Processor";
    }
    return "";
  }
  const holders = tokenHolders || [];
  const holdersCount = holders.length;

  // Loading state
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

  // Error state
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
          <span className="text-gray-400 text-2xl font-anton">
            {holdersCount}
          </span>
        </div>
        {/* <button 
          onClick={() => refetch()}
          className="text-orange-500 hover:text-orange-400 font-medium transition-colors"
        >
          REFRESH
        </button> */}
      </div>

      { holdersCount === 0 ? (
        <div className="flex flex-col items-center justify-center py-8">
          <p className="text-gray-400 text-center">
            No token holders available for this project.
          </p>
        </div>
      ) : (
        <div className="flex flex-col justify-center gap-4 mt-6">
          <ol className="flex flex-col gap-4 list-none">
            {holders
              .slice(0, 20)
              .map((holder: ITokenHolder, index: number) => {
                const holderLabel = getHolderLabel(holder);
                return (
                  <li key={`${holder.owner_address}-${index}`} className="flex items-center">
                    <span className="text-white/30 font-ibm-mono mr-2 font-bold">
                      {index + 1}.
                    </span>
                    <div className="flex flex-row items-center justify-between w-full">
                      <div className="flex flex-col">
                        <span className="font-ibm-mono text-white font-medium">
                          {shortenAddress(holder.owner_address)}
                        </span>
                        {holderLabel && (
                          <span className="text-white/30 text-sm">
                            {holderLabel}
                          </span>
                        )}
                      </div>
                      <div className="text-white/30 font-medium">
                        {holder.percentage_relative_to_total_supply?.toFixed(4) || "0.0000"}%
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
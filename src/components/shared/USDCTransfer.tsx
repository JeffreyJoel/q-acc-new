"use client";

import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { toast } from "sonner";
import { ArrowUpRight, Loader2, AlertCircle } from "lucide-react";
import { handleErc20Transfer } from "@/helpers/token";
import { fetchBalanceWithDecimals } from "@/helpers/token";
import { Address } from "viem";
import { useChainManager } from "@/contexts/chainManager.context";

interface USDCTransferProps {
  className?: string;
  usdcAddress?: Address;
}

// USDC on Polygon Amoy testnet
const DEFAULT_USDC_ADDRESS: Address = "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582";

export function USDCTransfer({
  className = "",
  usdcAddress = DEFAULT_USDC_ADDRESS
}: USDCTransferProps) {
  const { user } = usePrivy();
  const { chainId, switchChain, ready } = useChainManager();
  const currentChainId = typeof chainId === 'number' && !isNaN(chainId) ? chainId : 0;
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);

  const userAddress = user?.wallet?.address as Address;
  const POLYGON_AMOY_CHAIN_ID = 80002;


  // Fetch user USDC balance when component mounts or chain changes
  useEffect(() => {
    if (userAddress && currentChainId === POLYGON_AMOY_CHAIN_ID) {
      fetchBalanceWithDecimals(usdcAddress, userAddress, currentChainId)
        .then((result) => {
          if (result) {
            setBalance(parseFloat(result.formattedBalance));
          }
        })
        .catch(console.error);
    }
  }, [userAddress, currentChainId, usdcAddress]);

  // Switch to Polygon Amoy if not already on it
  const ensurePolygonAmoy = async () => {
    if (currentChainId === POLYGON_AMOY_CHAIN_ID) {
      return; // Already on the correct network
    }

    if (!userAddress) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsSwitchingNetwork(true);
    try {
      await switchChain(POLYGON_AMOY_CHAIN_ID);
      toast.success("Switched to Polygon Amoy");
    } catch (error) {
      console.error("Failed to switch network:", error);
      toast.error("Failed to switch to Polygon Amoy. Please switch manually in your wallet.");
      throw error;
    } finally {
      setIsSwitchingNetwork(false);
    }
  };

  const handleTransfer = async () => {
    if (!userAddress) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!ready) {
      toast.error("Wallet not ready. Please try again.");
      return;
    }

    if (!recipientAddress.trim()) {
      toast.error("Please enter a recipient address");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (balance && parseFloat(amount) > balance) {
      toast.error("Insufficient USDC balance");
      return;
    }

    // Basic address validation
    if (!recipientAddress.startsWith("0x") || recipientAddress.length !== 42) {
      toast.error("Invalid recipient address format");
      return;
    }

    setIsLoading(true);

    try {
      // Ensure we're on Polygon Amoy before transferring
      await ensurePolygonAmoy();

      const hash = await handleErc20Transfer({
        inputAmount: amount,
        tokenAddress: usdcAddress,
        projectAddress: recipientAddress as Address,
        chainId: POLYGON_AMOY_CHAIN_ID,
      });

      toast.success("Transfer successful! Transaction hash: " + hash);
      setAmount("");
      setRecipientAddress("");

      // Refresh balance
      if (userAddress) {
        const result = await fetchBalanceWithDecimals(usdcAddress, userAddress, POLYGON_AMOY_CHAIN_ID);
        if (result) {
          setBalance(parseFloat(result.formattedBalance));
        }
      }
    } catch (error) {
      console.error("Transfer error:", error);
      toast.error("Transfer failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMaxClick = () => {
    if (balance) {
      setAmount(balance.toString());
    }
  };

  return (
    <div className={`bg-neutral-800 rounded-lg p-6 border border-neutral-700 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <ArrowUpRight className="w-5 h-5 text-peach-400" />
          Transfer USDC
        </h3>

        {/* Network Status */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            currentChainId === POLYGON_AMOY_CHAIN_ID
              ? 'bg-green-400'
              : 'bg-red-400'
          }`} />
          <span className="text-sm text-neutral-400">
            {currentChainId === POLYGON_AMOY_CHAIN_ID
              ? 'Polygon Amoy'
              : currentChainId
                ? 'Wrong Network'
                : 'No Network'
            }
          </span>
          {currentChainId !== POLYGON_AMOY_CHAIN_ID && (
            <button
              onClick={ensurePolygonAmoy}
              disabled={isSwitchingNetwork}
              className="text-xs px-2 py-1 bg-peach-400 hover:bg-peach-500 disabled:bg-neutral-600 text-black rounded transition-colors"
            >
              {isSwitchingNetwork ? 'Switching...' : 'Switch'}
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {/* Recipient Address */}
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            Recipient Address
          </label>
          <input
            type="text"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            placeholder="0x..."
            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-600 rounded-md text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-peach-400 focus:border-transparent"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            Amount (USDC)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="flex-1 px-3 py-2 bg-neutral-900 border border-neutral-600 rounded-md text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-peach-400 focus:border-transparent"
            />
            <button
              onClick={handleMaxClick}
              disabled={!balance}
              className="px-3 py-2 bg-neutral-700 hover:bg-neutral-600 disabled:bg-neutral-800 disabled:cursor-not-allowed text-neutral-300 rounded-md text-sm font-medium transition-colors"
            >
              Max
            </button>
          </div>
          {balance !== null && (
            <p className="text-xs text-neutral-400 mt-1">
              Balance: {balance.toFixed(6)} USDC
            </p>
          )}
        </div>

        {/* Transfer Button */}
        <button
          onClick={handleTransfer}
          disabled={isLoading || isSwitchingNetwork || !userAddress || !amount || !recipientAddress}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-peach-400 hover:bg-peach-500 disabled:bg-neutral-600 disabled:cursor-not-allowed text-black font-medium rounded-md transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Transferring...
            </>
          ) : (
            <>
              <ArrowUpRight className="w-4 h-4" />
              Transfer USDC
            </>
          )}
        </button>

        {!userAddress && (
          <p className="text-sm text-neutral-400 text-center">
            Please connect your wallet to transfer USDC
          </p>
        )}

        {userAddress && currentChainId !== POLYGON_AMOY_CHAIN_ID && !isSwitchingNetwork && (
          <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-800/50 rounded-md">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-400">
              Switch to Polygon Amoy network to transfer USDC
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

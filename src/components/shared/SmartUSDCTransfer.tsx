"use client";

import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { toast } from "sonner";
import { ArrowUpRight, Loader2, AlertCircle, Zap } from "lucide-react";
import { handleErc20Transfer } from "@/helpers/token";
import { fetchBalanceWithDecimals } from "@/helpers/token";
import { Address, encodeFunctionData, parseEther, parseUnits } from "viem";
import { useZeroDev } from "@/contexts/ZeroDevContext";
import { erc20Abi } from "viem";

interface SmartUSDCTransferProps {
  className?: string;
  usdcAddress?: Address;
}

// USDC on Polygon Amoy testnet
const DEFAULT_USDC_ADDRESS: Address =
  "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582";

export function SmartUSDCTransfer({
  className = "",
  usdcAddress = DEFAULT_USDC_ADDRESS,
}: SmartUSDCTransferProps) {
  const { user } = usePrivy();
  const { kernelClient, smartAccountAddress, isInitializing } = useZeroDev();
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);

  const userAddress = user?.wallet?.address as Address;
  const POLYGON_AMOY_CHAIN_ID = 80002;

  // Fetch user USDC balance when smart account is ready
  useEffect(() => {
    if (kernelClient && smartAccountAddress) {
      fetchBalanceWithDecimals(
        usdcAddress,
        smartAccountAddress as Address,
        POLYGON_AMOY_CHAIN_ID
      )
        .then((result) => {
          if (result) {
            setBalance(parseFloat(result.formattedBalance));
          }
        })
        .catch(console.error);
    }
  }, [kernelClient, smartAccountAddress, usdcAddress]);

  const handleTransfer = async () => {
    if (!kernelClient) {
      toast.error("Smart account not initialized");
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
      // Create the USDC transfer call data
      const transferData = encodeFunctionData({
        abi: erc20Abi,
        functionName: "transfer",
        args: [recipientAddress as Address, parseUnits(amount, 6)],
      });

      // Send the transaction using the smart account
      const txHash = await kernelClient.sendTransaction({
        calls: [
          {
            to: usdcAddress,
            data: transferData,
            value: BigInt(0),
          },
        ],
      });

      toast.success("Transfer successful! Transaction hash: " + txHash);
      setAmount("");
      setRecipientAddress("");

      // Refresh balance
      if (smartAccountAddress) {
        const result = await fetchBalanceWithDecimals(
          usdcAddress,
          userAddress as Address,
          POLYGON_AMOY_CHAIN_ID
        );
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

  if (isInitializing) {
    return (
      <div
        className={`bg-neutral-800 rounded-lg p-6 border border-neutral-700 ${className}`}
      >
        <div className="flex items-center gap-2 mb-4">
          <Loader2 className="w-5 h-5 text-peach-400 animate-spin" />
          <h3 className="text-lg font-semibold text-white">
            Initializing Smart Account
          </h3>
        </div>
        <p className="text-neutral-400">Setting up gasless transactions...</p>
      </div>
    );
  }

  if (!kernelClient) {
    return (
      <div
        className={`bg-neutral-800 rounded-lg p-6 border border-neutral-700 ${className}`}
      >
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <h3 className="text-lg font-semibold text-white">
            Smart Account Not Available
          </h3>
        </div>
        <p className="text-neutral-400">
          Unable to initialize smart account for gasless transactions.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`bg-neutral-800 rounded-lg p-6 border border-neutral-700 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-green-400" />
          Smart USDC Transfer
          <span className="text-xs bg-green-400/20 text-green-400 px-2 py-1 rounded-full">
            Gasless
          </span>
        </h3>

        {/* Smart Account Status */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-sm text-neutral-400">Smart Account</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Smart Account Address */}
        {smartAccountAddress && (
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Smart Account
            </label>
            <div className="flex items-center gap-2 p-2 bg-neutral-900 rounded-md">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-sm text-neutral-400 font-mono">
                {smartAccountAddress.slice(0, 6)}...
                {smartAccountAddress.slice(-4)}
              </span>
            </div>
          </div>
        )}

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
            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-600 rounded-md text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
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
              className="flex-1 px-3 py-2 bg-neutral-900 border border-neutral-600 rounded-md text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
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
          disabled={isLoading || !userAddress || !amount || !recipientAddress}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-400 hover:bg-green-500 disabled:bg-neutral-600 disabled:cursor-not-allowed text-black font-medium rounded-md transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Transferring...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Gasless Transfer
            </>
          )}
        </button>

        {!userAddress && (
          <p className="text-sm text-neutral-400 text-center">
            Please connect your wallet to transfer USDC
          </p>
        )}

        <div className="flex items-center gap-2 p-3 bg-green-900/20 border border-green-800/50 rounded-md">
          <Zap className="w-4 h-4 text-green-400 flex-shrink-0" />
          <p className="text-sm text-green-400">
            Gas fees are sponsored by ZeroDev paymaster
          </p>
        </div>
      </div>
    </div>
  );
}

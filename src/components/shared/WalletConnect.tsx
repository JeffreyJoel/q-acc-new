"use client";

import { useEffect, useState } from "react";
import { useLogin, useLoginWithEmail, usePrivy } from "@privy-io/react-auth";
import { WalletDisplay } from "./WalletDisplay";
import { NavbarButton } from "../ui/resizable-navbar";
import { Button } from "../ui/button";

function WalletConnect() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { user, ready, authenticated } = usePrivy();

  const [isClient, setIsClient] = useState(false);
  const { login } = useLogin({
    onComplete: () => setIsLoading(false),
    onError: () => setIsLoading(false),
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await login();
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
    }
  };

  return (
    <div>
      {isClient && authenticated && user && user.wallet?.address ? (
        <WalletDisplay walletAddress={user?.wallet?.address} />
      ) : (
        <>
          {ready ? (
            <Button
              disabled={isLoading}
              size="lg"
              onClick={handleLogin}
              variant="default"
              className={`rounded-xl px-4 py-3 bg-peach-400 ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              {isLoading ? "Connecting..." : "Sign In"}
            </Button>
          ) : (
            <Button
              disabled={true}
              size="lg"
              variant="default"
              className="rounded-xl px-4 py-3 bg-peach-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Loading...
            </Button>
          )}
        </>
      )}

      {/* <ProfileCreationModal
        isOpen={isProfileModalOpen}
        onClose={handleCloseProfileModal}
        onSubmit={handleSubmitProfile}
      /> */}
    </div>
  );
}
export default WalletConnect;

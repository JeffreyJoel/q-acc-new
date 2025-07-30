"use client";

import { useAccount } from "wagmi";
import { useFetchUser } from "@/hooks/useFetchUser";
import { useFetchLeaderBoard } from "@/hooks/useFetchLeaderBoard";
import { Address } from "viem";
import { LeaderboardItem } from "./LeaderboardItem";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { LeaderboardUser } from "@/types/leaderboard";

export const UserInfo = () => {
  const { address: wagmiAddress } = useAccount();
  const { authenticated, user: privyUser } = usePrivy();

  const ConnectedUserAddress = privyUser?.wallet?.address || wagmiAddress;
  const { data: user } = useFetchUser(!!ConnectedUserAddress, ConnectedUserAddress as Address);
  const router = useRouter();

  const { data: leaderboardInfo, isLoading } = useFetchLeaderBoard(2000, 0, {
    field: "Rank",
    direction: "ASC",
  });


  const shouldShowUserInfo = useMemo(() => {
    return authenticated && ConnectedUserAddress && user;
  }, [authenticated, ConnectedUserAddress, user]);

  const userInfo = useMemo(() => {
    if (!shouldShowUserInfo || !user) return null;

    const leaderboardUser = leaderboardInfo?.users.find(
      (lbUser) => lbUser.id === user.id
    );

    if (leaderboardUser) {
      return leaderboardUser;
    }

    return {
      id: user.id,
      name: user.fullName || 'Anonymous User',
      email: user.email,
      avatar: user.avatar,
      qaccPoints: user.qaccPoints || 0,
      qaccPointsMultiplier: user.qaccPointsMultiplier || null,
      projectsFundedCount: user.projectsFundedCount || 0,
      walletAddress: user.walletAddress || ConnectedUserAddress,
      rank: 0,
      username: user.username,
    } as LeaderboardUser;
  }, [shouldShowUserInfo, user, leaderboardInfo?.users, ConnectedUserAddress]);

  const handleUserClick = (userAddress: string) => {
    router.push(`/profile/${userAddress}`);
  };

  if (shouldShowUserInfo && userInfo) {
    return (
      <div className="mb-6">
        <h2 className="text-[22px] mb-3 font-anton uppercase text-white/40 tracking-wide">
          Your Rank
        </h2>
        <LeaderboardItem user={userInfo as LeaderboardUser} onUserClick={handleUserClick} />
      </div>
    );
  }

  return null;
};

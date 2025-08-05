"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { shortenAddress } from "@/helpers/address";
import { handleImageUrl } from "@/helpers/image";
import { roundPoints } from "@/helpers/points";
import type { LeaderboardUser } from "@/types/leaderboard";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";

interface LeaderboardItemProps {
  user: LeaderboardUser;
  onUserClick?: (userAddress: string) => void;
}

export function LeaderboardItem({ user, onUserClick }: LeaderboardItemProps) {
  let avatar;
  if (user.avatar) {
    avatar = handleImageUrl(user.avatar);
  } else {
    avatar = "/images/user.png";
  }

  return (
    <div
      className="flex items-center justify-between bg-white/5 rounded-3xl p-6 cursor-pointer hover:bg-neutral-700 transition-colors"
      onClick={() => onUserClick?.(user.walletAddress)}
    >
      <div className="flex items-center justify-center">
        <h2
          className={`
              font-anton text-2xl sm:text-4xl
              ${
                user.rank === 1
                  ? "bg-gradient-to-b from-[#FFF6C4] to-[#DFAA00] bg-clip-text text-transparent"
                  : user.rank === 2
                  ? "bg-gradient-to-b from-[#D9DDEE] to-[#42444D] bg-clip-text text-transparent"
                  : user.rank === 3
                  ? "bg-gradient-to-b from-[#E0CFC3] to-[#753200] bg-clip-text text-transparent"
                  : "text-white/30"
              }
            `}
        >
          {user.rank > 0 ? user.rank.toLocaleString() : "N/A"}
        </h2>
      </div>

      <div className="flex items-center gap-3 flex-1 ml-4">
        <Avatar className="h-8 w-8 md:h-12 md:w-12 border-2 border-neutral-600">
          <AvatarImage src={avatar} />
          <AvatarFallback className="text-base bg-neutral-600 text-white">
            {user.username?.charAt(0) || user.name?.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col">
          <span className="font-bold text-lg text-white">{user?.username}</span>
          <div className="flex items-center gap-1">
            <span className="text-base text-white/50 font-ibm-mono font-medium">
              {shortenAddress(user.walletAddress)}
            </span>
            <ArrowUpRight className="w-3 h-3 text-white/40" />
          </div>
        </div>
      </div>

      {/* Points with star icon on the right */}
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 sm:w-8 sm:h-8 flex items-center justify-center">
          <Image
            src="/images/logos/round_logo.png"
            alt="arrow-down"
            width={32}
            height={32}
            className="w-full h-full "
          />
        </div>
        <span className="text-sm sm:text-lg md:text-xl font-semibold text-white">
          {roundPoints(user.qaccPoints)}
        </span>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import {
  ChevronDown,
  LogOut,
  UserCircle2,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLogout } from "@privy-io/react-auth";
import { useDisconnectAndLogout } from "@/hooks/useDisconnectAndLogout";
import { getLocalStorageToken } from "@/helpers/generateJWT";
import { useQueryClient } from "@tanstack/react-query";

import { UserPill } from "@privy-io/react-auth/ui";
import UserPoints from "./UserPoints";
import { Address } from "viem";
import { useFetchUser } from "@/hooks/useFetchUser";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { handleImageUrl } from "@/helpers/image";

interface WalletDisplayProps {
  walletAddress?: string;
}

export const WalletDisplay = ({ walletAddress }: WalletDisplayProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { disconnect } = useDisconnectAndLogout();
  const queryClient = useQueryClient();

  const { data: user } = useFetchUser(
    !!walletAddress,
    walletAddress as Address
  );

  const { logout } = useLogout({
    onSuccess: () => {
      console.log("User successfully logged out");

      // Clear query cache
      queryClient.clear();

      // Clean up localStorage
      if (walletAddress) {
        const localStorageToken = getLocalStorageToken(walletAddress);
        if (localStorageToken) {
          localStorage.removeItem("token");
        }
      } else {
        localStorage.removeItem("token");
      }

      // Clean up any other auth-related localStorage items
      const authRelatedKeys = ["token"];
      authRelatedKeys.forEach((key) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.warn(`Failed to remove ${key} from localStorage:`, error);
        }
      });

      router.push("/");
    },
  });

  const toggleDropdown = () => setIsMenuOpen(!isMenuOpen);
  const closeDropdown = () => setIsMenuOpen(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        const target = event.target as Element;
        const isModalClick =
          target.closest("[data-radix-popper-content-wrapper]") ||
          target.closest('[role="dialog"]') ||
          target.closest('[data-state="open"]') ||
          target.closest(".privy-modal") ||
          target.closest("[data-privy-modal]");

        if (!isModalClick) {
          closeDropdown();
        }
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDropdown();
      }
    };

    if (isMenuOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMenuOpen]);

  async function handleLogout() {
    try {
      closeDropdown();

      await disconnect();

      await logout();

      queryClient.clear();

      if (walletAddress) {
        const localStorageToken = getLocalStorageToken(walletAddress);
        if (localStorageToken) {
          localStorage.removeItem("token");
        }
      } else {
        localStorage.removeItem("token");
      }

      const authRelatedKeys = ["token"];
      authRelatedKeys.forEach((key) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.warn(`Failed to remove ${key} from localStorage:`, error);
        }
      });
    } catch (error) {
      console.error("Error during logout:", error);

      try {
        queryClient.clear();
        localStorage.removeItem("token");
        sessionStorage.removeItem("leaderboardData");
        router.push("/");
      } catch (cleanupError) {
        console.warn(
          "Failed to cleanup storage during error handling:",
          cleanupError
        );
      }
    }
  }

  const handleMyAccountClick = () => {
    closeDropdown();
  };

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  const avatar = handleImageUrl(user?.avatar ?? "");

  return (
    <>
      <style jsx global>{`
        [data-radix-popper-content-wrapper],
        [role="dialog"],
        .privy-modal,
        [data-privy-modal] {
          z-index: 100 !important;
        }
      `}</style>

      <div className="flex items-center gap-2">
        <UserPoints qaccPoints={user?.qaccPoints ?? 0} />
        <div className="relative inline-block text-left" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className="flex items-center gap-2 bg-white/10 px-4 py-3 rounded-xl  shadow-sm hover:bg-neutral-700 transition-colors duration-200 focus:outline-none"
            aria-haspopup="true"
            aria-expanded={isMenuOpen}
          >
            <Avatar className="w-6 h-6">
              <AvatarImage
                src={avatar ?? "/images/user.png"}
                height={24}
                width={24}
                className="rounded-full m-0 p-0"
              />
              <AvatarFallback>{user?.fullName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-white max-w-[6rem] truncate md:max-w-none">
              {user?.fullName}
            </span>
            <ChevronDown
              className={`h-4 w-4 hidden sm:block transition-transform duration-200 text-white/30 ${
                isMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 bottom-full mb-2 lg:bottom-auto lg:mt-2 lg:top-full w-64 bg-neutral-800 rounded-2xl shadow-xl ring-1 ring-white/10 z-40 animate-in slide-in-from-bottom-2 lg:slide-in-from-top-2 duration-200">
              {/* Header with UserPill */}
              <div className="py-2 border-b border-neutral-700 relative">
                <div className="cursor-pointer hover:bg-peach-400/10 [&_.privy-modal]:z-[100] [&_[role='dialog']]:z-[100] [&_[data-radix-popper-content-wrapper]]:z-[100]">
                  <UserPill
                    expanded={true}
                    ui={{
                      minimal: false,
                      background: "secondary",
                    }}
                    label={
                      <span className="w-full flex items-center gap-3 text-left transition-colors duration-150 text-gray-200">
                        <Wallet className="h-5 w-5" />
                        <span className="text-sm font-medium">
                          Manage Wallets
                        </span>
                      </span>
                    }
                  />
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <Link
                  href={`/profile/${walletAddress}`}
                  onClick={handleMyAccountClick}
                >
                  <div className="flex items-center gap-3 px-4 py-3 hover:bg-peach-400/10 transition-colors duration-150 text-gray-200">
                    <UserCircle2 className="h-5 w-5" />
                    <span className="text-sm font-medium">My Account</span>
                  </div>
                </Link>

                <div className="my-2 border-t border-neutral-700" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-500/10 transition-colors duration-150 text-red-400"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="text-sm font-semibold">Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

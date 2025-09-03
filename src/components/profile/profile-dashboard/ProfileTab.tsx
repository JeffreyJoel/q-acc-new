"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { useState, useMemo } from "react";
import { Address } from "viem";
import { useAccount } from "wagmi";
import { useAddressWhitelist } from "@/hooks/useAddressWhitelist";
import MyProjects from "./MyProjects";
import { usePrivy } from "@privy-io/react-auth";
import { useDonorContext } from "@/contexts/donor.context";
import { ProjectsTokensSkeleton } from "@/components/loaders/ProfilePageLoaders";
import { useFetchProjectByUserId } from "@/hooks/useProjects";
import Portfolio from "./Portfolio";

interface ProfileTabProps {
  userAddress: Address;
}

export default function ProfileTab({ userAddress }: ProfileTabProps) {
  const [activeTab, setActiveTab] = useState("tokens");

  const { data: addrWhitelist, isLoading: whitelistLoading } =
    useAddressWhitelist();
  const { loading: donorContextLoading, user } = useDonorContext();
  const { address: wagmiAddress } = useAccount();
  const { data: projectData } = useFetchProjectByUserId(
    user?.id ? parseInt(user.id) : 0
  );
  const { user: privyUser, authenticated } = usePrivy();

  const ConnectedUserAddress = privyUser?.wallet?.address || wagmiAddress;

  const isOwnProfile = useMemo(() => {
    return (
      ConnectedUserAddress &&
      authenticated &&
      userAddress.toLowerCase() === ConnectedUserAddress.toLowerCase()
    );
  }, [ConnectedUserAddress, userAddress]);

  const isLoading = donorContextLoading || whitelistLoading;

  return (
    <div className="mt-12 rounded-2xl">
      <Tabs value={activeTab} className="w-full">
        {projectData && (
          <TabsList className="flex mx-auto w-1/3 rounded-full bg-black p-1 mb-8">
            <TabsTrigger
              value="tokens"
              className="px-6 py-1 flex w-1/2 gap-2 items-center justify-center rounded-full text-sm md:text-base font-medium text-qacc-gray-light data-[state=active]:bg-peach-400 data-[state=active]:text-black focus:outline-none transition-colors"
              onClick={() => setActiveTab("tokens")}
              disabled={isLoading}
            >
              <span>MY TOKENS</span>
            </TabsTrigger>
            {isOwnProfile && (
              <TabsTrigger
                value="projects"
                className="px-6 py-1 flex w-1/2 gap-2 items-center justify-center rounded-full text-sm font-medium text-qacc-gray-light data-[state=active]:bg-peach-400 data-[state=active]:text-black focus:outline-none transition-colors"
                onClick={() => setActiveTab("projects")}
                disabled={isLoading}
              >
                <span>MY PROJECTS</span>
              </TabsTrigger>
            )}
          </TabsList>
        )}

        <TabsContent value="projects" className="">
          {isLoading ? (
            <ProjectsTokensSkeleton />
          ) : (
            <MyProjects projectData={projectData!} />
          )}
        </TabsContent>

        <TabsContent value="tokens" className="">
          <Portfolio />
          {/* {isLoading ? <ProjectsTokensSkeleton /> : <Portfolio />} */}
        </TabsContent>
      </Tabs>
    </div>
  );
}

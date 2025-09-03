"use client";

import { DonorProvider } from "@/contexts/donor.context";
import ProfileInfo from "@/components/profile/profile-dashboard/ProfileInfo";
import { Address } from "viem";
import { ProjectCreationProvider } from "@/contexts/projectCreation.context";
// import Portfolio from "./Portfolio";
import ProfileTab from "./ProfileTab";

interface ProfileViewProps {
  userAddress: Address;
}

export default function ProfileDashboardView({ userAddress }: ProfileViewProps) {
  return (
    <>
      <ProjectCreationProvider>
        <DonorProvider address={userAddress}>
          <ProfileInfo userAddress={userAddress} />
          {/* <Portfolio /> */}
          <ProfileTab userAddress={userAddress} />
        </DonorProvider>
      </ProjectCreationProvider>
    </>
  );
}

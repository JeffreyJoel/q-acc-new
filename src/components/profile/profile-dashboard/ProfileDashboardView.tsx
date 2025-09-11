"use client";

import { DonorProvider } from "@/contexts/donor.context";
import ProfileInfo from "@/components/profile/profile-dashboard/ProfileInfo";
import { ProjectCreationProvider } from "@/contexts/projectCreation.context";
import ProfileTab from "./ProfileTab";


export default function ProfileDashboardView() {
  return (
    <>
      <ProjectCreationProvider>
        <DonorProvider>
          <ProfileInfo />
          <ProfileTab />
        </DonorProvider>
      </ProjectCreationProvider>
    </>
  );
}

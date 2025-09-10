"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { Dropzone } from "@/components/ui/dropzone";
import { Input } from "@/components/ui/input";
import { SocialMediaInput } from "@/components/project/create/SocialMediaInput";
import { validators } from "@/components/project/create/validators";
import { TeamMember } from "@/types/project.type";
import { IconX } from "@tabler/icons-react";
import { PiCloudArrowUpBold } from "react-icons/pi";
import Image from "next/image";
import { uploadToIPFS } from "@/services/ipfs";
import { handleImageUrl } from "@/helpers/image";
import { useState, useRef, useCallback } from "react";

interface TeamFormProps {
  index: number;
  teamMember: TeamMember;
  removeMember: () => void;
  isEdit?: boolean;
}

const socialMediaLinks = [
  {
    name: "twitter",
    label: "Twitter",
    iconName: "twitter.svg",
    rules: validators.twitter,
  },
  {
    name: "linkedin",
    label: "LinkedIn",
    iconName: "linkedin.svg",
    rules: validators.linkedin,
  },
  {
    name: "farcaster",
    label: "Farcaster",
    iconName: "farcaster.svg",
    rules: validators.farcaster,
  },
];

export const TeamForm: React.FC<TeamFormProps> = ({
  index,
  teamMember,
  removeMember,
  isEdit = false,
}) => {
  const { setValue, register, watch } = useFormContext();

  // Avatar upload handling similar to project icon upload
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const avatarUploadAbortController = useRef<AbortController | null>(null);

  const triggerAvatarFileSelect = () => avatarFileInputRef.current?.click();

  const cancelAvatarUpload = () => {
    if (avatarUploadAbortController.current) {
      avatarUploadAbortController.current.abort();
      setIsUploadingAvatar(false);
    }
  };

  const rawAvatar = watch(`team.${index}.image`, null) as any;
  const avatarUrl: string | null = React.useMemo(() => {
    if (!rawAvatar) return null;
    if (typeof rawAvatar === "string") return rawAvatar;
    if (rawAvatar?.ipfsHash) return handleImageUrl(rawAvatar.ipfsHash);
    return null;
  }, [rawAvatar]);

  const handleAvatarFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploadingAvatar(true);

      const controller = new AbortController();
      avatarUploadAbortController.current = controller;

      const ipfsHash = await uploadToIPFS(file, undefined, controller.signal);

      setIsUploadingAvatar(false);

      if (ipfsHash) {
        setValue(`team.${index}.image`, handleImageUrl(ipfsHash));
      }
    },
    [index, setValue]
  );

  const handleDrop = (name: string, file: File, ipfsHash: string) => {
    if (file) {
      setValue(name, { file, ipfsHash });
    }
  };

  return (
    <section className={`flex flex-col gap-6 ${index > 0 ? "mt-8 border-t border-white/10 pt-8" : ""}`}>
      <div className="flex justify-between mr-2">
        <p className="text-white font-medium text-sm md:text-lg">
          Team Member {index + 1}
        </p>
        <span
          onClick={removeMember}
          className="flex items-center gap-2 text-red-500 font-medium text-sm md:text-lg cursor-pointer"
        >
          <IconX /> Remove
        </span>
      </div>
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-12">
        <label className="md:w-1/3 text-qacc-gray-light font-medium text-sm md:text-lg">
          Name
        </label>
        {/* Name */}
        <div className="w-full md:w-2/3 relative flex-1">
          <Input
            {...register(`team.${index}.name`)}
            placeholder="Name"
            className="text-white text-sm md:text-lg rounded-xl border border-qacc-gray-light/[24%] focus:ring-peach-400 focus:border-peach-300 outline-none"
          />
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <p className="text-qacc-gray-light font-medium text-sm md:text-lg">
          Social Media Links (optional)
        </p>

        <div className="flex flex-col gap-6">
          {socialMediaLinks.map((socialMedia) => (
            <SocialMediaInput
              key={socialMedia.name}
              {...socialMedia}
              name={`team.${index}.${socialMedia.name}`}
            />
          ))}
        </div>
      </div>

      {/* Avatar upload */}
      <div className="w-full flex flex-col md:flex-row items-start md:items-center md:justify-between gap-6 md:gap-12">
        <label className="text-qacc-gray-light font-medium text-sm md:text-lg">
          Profile Picture (optional)
        </label>

        <div className="flex items-center gap-6">
          {/* Upload/Delete/Cancel controls */}
          {isUploadingAvatar ? (
            <span
              onClick={cancelAvatarUpload}
              className="flex items-center gap-2 text-white font-medium text-sm md:text-lg cursor-pointer"
            >
              <IconX /> Cancel Upload
            </span>
          ) : avatarUrl ? (
            <span
              onClick={() => setValue(`team.${index}.image`, null)}
              className="flex items-center gap-2 text-white hover:text-red-500 font-medium text-sm md:text-lg cursor-pointer"
            >
              <IconX /> Delete
            </span>
          ) : null}

          <span
            className={`flex items-center gap-2 text-white font-medium text-sm md:text-lg cursor-pointer ${
              isUploadingAvatar ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={!isUploadingAvatar ? triggerAvatarFileSelect : undefined}
          >
            <PiCloudArrowUpBold /> Upload
          </span>

          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarFileChange}
            ref={avatarFileInputRef}
            className="hidden"
          />

          {/* Preview */}

          <div className="relative">
            <Image
              src={avatarUrl || "/images/user.png"}
              alt="Avatar"
              width={124}
              height={124}
              className="rounded-full object-cover md:w-[124px] md:h-[124px] w-[80px] h-[80px]"
            />
            {isUploadingAvatar && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-full">
                <span className="text-xs text-white animate-pulse">
                  Uploading...
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

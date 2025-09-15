"use client";

import { useForm, FormProvider } from "react-hook-form";
import { useEffect, type FC, useState, useRef, useCallback } from "react";
import { useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SocialMediaInput } from "@/components/project/create/SocialMediaInput";
import { validators } from "@/components/project/create/validators";
import { RichTextEditor } from "@/components/shared/RichTextEditor";
import { useProjectCreationContext } from "@/contexts/projectCreation.context";
import { EProjectSocialMediaType, ProjectFormData } from "@/types/project.type";
import EditProjectLoader from "@/components/loaders/EditProjectLoader";
import { IconX } from "@tabler/icons-react";
import { PiCloudArrowUpBold } from "react-icons/pi";
import Image from "next/image";
import { uploadToIPFS } from "@/services/ipfs";
import { handleImageUrl } from "@/helpers/image";
import { useUpdateProject } from "@/hooks/useUpdateProject";
import { toast } from "sonner";
import { IProjectCreation } from "@/types/project.type";
import { useFormContext } from "react-hook-form";
import { TeamForm } from "@/components/project/create/TeamForm";
import { TeamMember } from "@/types/project.type";

// import { SimpleEditor } from "@/components/tiptap/tiptap-templates/simple/simple-editor";

const socialMediaLinks = [
  {
    name: EProjectSocialMediaType.WEBSITE,
    label: "Website",
    iconName: "web.svg",
    rules: validators.website,
    placeholder: "https://www.yourwebsite.com",
  },
  {
    name: EProjectSocialMediaType.FACEBOOK,
    label: "Facebook",
    iconName: "facebook.svg",
    rules: validators.facebook,
    placeholder: "https://www.facebook.com/your_username",
  },
  {
    name: EProjectSocialMediaType.X,
    label: "Twitter",
    iconName: "twitter.svg",
    rules: validators.twitter,
    placeholder: "https://x.com/your_username",
  },
  {
    name: EProjectSocialMediaType.LINKEDIN,
    label: "LinkedIn",
    iconName: "linkedin.svg",
    rules: validators.linkedin,
    placeholder: "LinkedIn Page URL",
  },
  {
    name: EProjectSocialMediaType.DISCORD,
    label: "Discord",
    iconName: "discord.svg",
    rules: validators.discord,
    placeholder: "Invite URL",
  },
  {
    name: EProjectSocialMediaType.TELEGRAM,
    label: "Telegram",
    iconName: "telegram.svg",
    rules: validators.telegram,
    placeholder: "https://t.me/your_username",
  },
  {
    name: EProjectSocialMediaType.INSTAGRAM,
    label: "Instagram",
    iconName: "instagram.svg",
    rules: validators.instagram,
    placeholder: "https://www.instagram.com/your_username",
  },
  {
    name: EProjectSocialMediaType.REDDIT,
    label: "Reddit",
    iconName: "reddit.svg",
    rules: validators.reddit,
    placeholder: "https://www.reddit.com/user/your_username",
  },
  {
    name: EProjectSocialMediaType.YOUTUBE,
    label: "YouTube",
    iconName: "youtube.svg",
    rules: validators.youtube,
    placeholder: "https://www.youtube.com/channel/your_channel_id",
  },
  {
    name: EProjectSocialMediaType.FARCASTER,
    label: "Farcaster",
    iconName: "farcaster.svg",
    rules: validators.farcaster,
    placeholder: "https://farcaster.xyz/your_username",
  },
  {
    name: EProjectSocialMediaType.LENS,
    label: "Lens",
    iconName: "lens.svg",
    rules: validators.lens,
    placeholder: "https://lenster.xyz/your_username",
  },
  {
    name: EProjectSocialMediaType.GITHUB,
    label: "GitHub",
    iconName: "github.svg",
    rules: validators.github,
    placeholder: "https://github.com/your_username",
  },
];

interface EditProjectFormProps {
  projectId: string;
}

const EditProjectForm: FC<EditProjectFormProps> = ({ projectId }) => {
  const { address } = useAccount();
  const { formData, setFormData, isLoading, projectData, isEditMode } =
    useProjectCreationContext();
  const methods = useForm<ProjectFormData>({ mode: "onChange" });
  const router = useRouter();
  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors },
    reset,
  } = methods;

  // Watch input values to display character counters
  const projectNameValue =
    useWatch({ control: methods.control, name: "projectName" }) || "";
  const projectTeaserValue =
    useWatch({ control: methods.control, name: "projectTeaser" }) || "";

  useEffect(() => {
    if (
      formData &&
      Object.keys(formData).length > 0 &&
      "projectName" in formData
    ) {
      reset(formData as ProjectFormData);
    }
  }, [formData, reset]);

  useEffect(() => {
    const linksWithValues = socialMediaLinks.filter((s) => {
      const key = s.name.toLowerCase() as keyof ProjectFormData;
      // @ts-ignore
      return formData[key] && String(formData[key]).length > 0;
    });
    if (linksWithValues.length) {
      setSelectedLinks((prev) => {
        const newArr = [...prev];
        linksWithValues.forEach((l) => {
          if (!newArr.includes(l.name)) newArr.push(l.name);
        });
        return newArr;
      });
    }
  }, [formData]);

  // Logo Upload Handling
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const logoUploadAbortController = useRef<AbortController | null>(null);
  const [previousLogo, setPreviousLogo] = useState<string | null>(null);

  const triggerLogoFileSelect = () => logoFileInputRef.current?.click();

  const cancelLogoUpload = () => {
    if (logoUploadAbortController.current) {
      logoUploadAbortController.current.abort();
      setIsUploadingLogo(false);
    }
  };

  const handleLogoFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setIsUploadingLogo(true);

      const controller = new AbortController();
      logoUploadAbortController.current = controller;

      const ipfsHash = await uploadToIPFS(
        file,
        (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
          }
        },
        controller.signal
      );

      setIsUploadingLogo(false);

      if (ipfsHash) {
        setPreviousLogo(formData.logo || null);
        setFormData({ logo: handleImageUrl(ipfsHash) });
      }
    },
    [setFormData, formData.logo]
  );

  // Banner Upload Handling
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);
  const bannerUploadAbortController = useRef<AbortController | null>(null);
  const [bannerFitType, setBannerFitType] = useState<"fit" | "fill">("fill");
  const [previousBanner, setPreviousBanner] = useState<string | null>(null);

  const triggerBannerFileSelect = () => bannerFileInputRef.current?.click();

  const cancelBannerUpload = () => {
    if (bannerUploadAbortController.current) {
      bannerUploadAbortController.current.abort();
      setIsUploadingBanner(false);
    }
  };

  const handleBannerFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setIsUploadingBanner(true);

      const controller = new AbortController();
      bannerUploadAbortController.current = controller;

      const ipfsHash = await uploadToIPFS(
        file,
        (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
          }
        },
        controller.signal
      );

      setIsUploadingBanner(false);

      if (ipfsHash) {
        setPreviousBanner(formData.banner || null);
        setFormData({ banner: handleImageUrl(ipfsHash) });
      }
    },
    [setFormData, formData.banner]
  );

  // Social Media Links dynamic handling
  const defaultSelectedLinks = socialMediaLinks
    .filter((s) => {
      const key = s.name.toLowerCase();
      if (key === "website" || key === "x") return true;
      return (formData as any)[key]?.length;
    })
    .map((s) => s.name);

  const [selectedLinks, setSelectedLinks] = useState<EProjectSocialMediaType[]>(
    defaultSelectedLinks as EProjectSocialMediaType[]
  );

  const toggleLink = (type: EProjectSocialMediaType) => {
    if (selectedLinks.includes(type)) return; // already added
    setSelectedLinks((prev) => [...prev, type]);
  };

  // ================= TEAM MEMBERS HANDLING =================
  // Watch the current list of team members in the form state
  const teamMembers =
    (useWatch({ control: methods.control, name: "team" }) as TeamMember[]) ||
    [];

  // Ensure at least one empty team member exists when the form is first loaded
  useEffect(() => {
    if (!teamMembers?.length) {
      setValue("team", [{ name: "", image: null }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addTeamMember = () => {
    setValue("team", [...teamMembers, { name: "", image: null }]);
  };

  const removeTeamMember = (index: number) => {
    setValue(
      "team",
      teamMembers.filter((_, i) => i !== index)
    );
  };

  const { mutateAsync: updateProject, isPending: isSaving } =
    useUpdateProject(projectId);

  const onSubmit = async (data: ProjectFormData) => {
    if (!address) return;
    try {
      const socialMedia = Object.entries(data)
        .filter(
          ([key, value]) =>
            value &&
            Object.values(EProjectSocialMediaType).includes(
              key.toUpperCase() as EProjectSocialMediaType
            )
        )
        .map(([key, value]) => ({
          type: key.toUpperCase() as EProjectSocialMediaType,
          link: typeof value === "string" ? value : "",
        }));

      const projectPayload: Partial<IProjectCreation> = {
        title: data.projectName,
        teaser: data.projectTeaser,
        description: data.projectDescription,
        image: data.banner || undefined,
        icon: data.logo || undefined,
        socialMedia: socialMedia.length ? socialMedia : undefined,
        teamMembers: data.team?.length ? data.team : undefined,
      };

      await updateProject(projectPayload);
      setTimeout(
        () =>
          toast.success("Project saved successfully"),
        2000
      );
    
      setFormData({ ...data });
    } catch (err: any) {
      setTimeout(
        () =>
          toast.error(err.message || "Failed to save project"),
        2000
      );
    }
  };

  if (isLoading) {
    return <EditProjectLoader />;
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-0 max-w-5xl mx-auto flex flex-col gap-8 md:gap-16 md:pt-10 my-28">
          <div className="flex flex-row justify-between items-center">
            <h1 className="text-[28px] md:text-[40px] font-anton text-white">
              Edit Project
            </h1>

            <div className="flex flex-row items-center gap-2 md:gap-6">
              <button className="border border-white/30 text-[13px] md:text-lg py-2 px-3 md:py-[10px] md:px-[20px] rounded-xl text-white/30 uppercase font-medium">
                Cancel
              </button>
              <button
                className="bg-peach-400 text-black py-2 px-3 md:py-[10px] md:px-[20px] rounded-xl text-[13px] md:text-lg uppercase font-medium hover:bg-peach-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                type="submit"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    Saving...{" "}
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black" />{" "}
                  </>
                ) : (
                  <>Save Project</>
                )}
              </button>
            </div>
          </div>

          <main className="space-y-3">
            <section className="bg-white/[7%] p-4 sm:p-6 md:p-8 rounded-2xl space-y-8">
              <p className="text-peach-400 font-anton text-[22px] uppercase tracking-wide">
                General Info
              </p>

              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                <label className="w-full md:w-1/3 text-qacc-gray-light font-medium text-sm md:text-lg">
                  Project Name
                </label>
                <div className="w-full relative flex-1">
                  <Input
                    {...register("projectName", {
                      required: "Project name is required",
                      minLength: {
                        value: 3,
                        message: "Project name must be at least 3 characters",
                      },
                      maxLength: 55,
                    })}
                    placeholder="My First Project"
                    maxLength={55}
                    className="font-medium text-white text-sm md:text-lg rounded-xl border border-qacc-gray-light/[24%] focus:ring-peach-400 focus:border-peach-300 outline-none pr-16"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-neutral-500">
                    {projectNameValue.length}/55
                  </span>
                </div>
                {errors.projectName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.projectName.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6">
                <label className="w-full md:w-1/3 text-qacc-gray-light font-medium text-sm md:text-lg">
                  Project Short Description
                </label>
                <div className="w-full relative flex-1">
                  <Textarea
                    {...register("projectTeaser", {
                      required: "Project teaser is required",
                      maxLength: {
                        value: 100,
                        message: "Teaser must be 100 characters or less",
                      },
                    })}
                    placeholder="Enter project teaser"
                    maxLength={100}
                    rows={4}
                    className="font-medium text-white text-sm md:text-lg rounded-xl border border-qacc-gray-light/[24%] focus:border-peach-300 outline-none pr-16"
                  />
                  <span className="absolute right-4 bottom-3 text-sm text-neutral-500">
                    {projectTeaserValue.length}/100
                  </span>
                </div>
                {errors.projectTeaser && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.projectTeaser.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center gap-2 sm:gap-4 md:gap-6">
                <label className="w-full md:w-1/3 text-qacc-gray-light font-medium text-sm md:text-lg">
                  Project & Token icon
                </label>
                <div className="w-full flex items-center justify-start md:justify-end gap-4 md:gap-6">
                  {isUploadingLogo ? (
                    <span
                      onClick={cancelLogoUpload}
                      className="flex items-center gap-2 text-white font-medium text-sm md:text-lg cursor-pointer"
                    >
                      <IconX /> Cancel Upload
                    </span>
                  ) : formData.logo ? (
                    <span
                      onClick={() =>
                        setFormData({
                          logo: previousLogo ?? null,
                        })
                      }
                      className="flex items-center gap-2 text-white hover:text-red-500 font-medium text-sm md:text-lg cursor-pointer"
                    >
                      <IconX /> Delete
                    </span>
                  ) : null}

                  <span
                    className={`flex items-center gap-2 text-white font-medium text-sm md:text-lg cursor-pointer ${
                      isUploadingLogo ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    onClick={
                      !isUploadingLogo ? triggerLogoFileSelect : undefined
                    }
                  >
                    <PiCloudArrowUpBold /> Upload
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoFileChange}
                    ref={logoFileInputRef}
                    className="hidden"
                  />

                  <div className="relative">
                    <Image
                      src={formData.logo || ""}
                      alt="Upload"
                      width={124}
                      height={124}
                      className="rounded-full object-cover md:w-[124px] md:h-[124px] w-[80px] h-[80px] block"
                    />
                    {isUploadingLogo && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-full">
                        <span className="text-xs text-white animate-pulse">
                          Uploading...
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                <label className="w-full md:w-1/3 text-qacc-gray-light font-medium text-sm md:text-lg">
                  Cover image
                </label>
                <div className="w-full flex-col gap-6">
                  <div className="w-full">
                    <div className="relative w-full">
                      <Image
                        src={formData.banner || ""}
                        alt="Upload"
                        width={692}
                        height={388}
                        className={`w-full h-[388px] rounded-xl ${
                          bannerFitType === "fit"
                            ? "object-contain"
                            : "object-cover"
                        }`}
                      />
                      {isUploadingBanner && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-xl">
                          <span className="text-sm md:text-lg text-white animate-pulse">
                            Uploading...
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-start md:justify-between gap-4 md:gap-6 mt-4">
                    {/* Image fit type toggle */}
                    <div className="w-full md:w-fit flex justify-between md:justify-start items-center gap-3">
                      <p className="text-qacc-gray-light font-medium text-sm md:text-lg">
                        Image fit type
                      </p>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setBannerFitType("fill")}
                          className={`px-6 py-2 md:py-1 rounded-2xl text-sm md:text-lg font-medium ${
                            bannerFitType === "fill"
                              ? "bg-qacc-gray-light text-black"
                              : "bg-qacc-gray-light/[12%] text-qacc-gray-light/50"
                          }`}
                        >
                          Fill
                        </button>
                        <button
                          type="button"
                          onClick={() => setBannerFitType("fit")}
                          className={`px-6 py-2 md:py-1 rounded-2xl text-sm md:text-lg font-medium ${
                            bannerFitType === "fit"
                              ? "bg-qacc-gray-light text-black"
                              : "bg-qacc-gray-light/[12%] text-qacc-gray-light/50"
                          }`}
                        >
                          Fit
                        </button>
                      </div>
                    </div>
                    <div className="w-full md:w-fit flex justify-between md:justify-start gap-6">
                      {isUploadingBanner ? (
                        <span
                          onClick={cancelBannerUpload}
                          className="flex items-center gap-2 text-white font-medium text-sm md:text-lg cursor-pointer"
                        >
                          <IconX /> Cancel Upload
                        </span>
                      ) : formData.banner ? (
                        <span
                          onClick={() =>
                            setFormData({
                              banner: previousBanner ?? null,
                            })
                          }
                          className="flex items-center gap-2 text-white hover:text-red-500 font-medium text-sm md:text-lg cursor-pointer"
                        >
                          <IconX /> Delete
                        </span>
                      ) : null}

                      <span
                        className={`flex items-center gap-2 text-white font-medium text-sm md:text-lg cursor-pointer ${
                          isUploadingBanner
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                        onClick={
                          !isUploadingBanner
                            ? triggerBannerFileSelect
                            : undefined
                        }
                      >
                        <PiCloudArrowUpBold /> Upload
                      </span>

                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBannerFileChange}
                        ref={bannerFileInputRef}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* LINKS SECTION */}
            <section className="bg-white/[7%] p-4 sm:p-6 md:p-8 rounded-2xl space-y-8">
              <p className="text-peach-400 font-anton text-[22px] uppercase tracking-wide">
                Links
              </p>
              <div className="flex flex-col gap-6">
                {socialMediaLinks
                  .filter((s) => selectedLinks.includes(s.name))
                  .map((socialMedia) => (
                    <SocialMediaInput
                      key={socialMedia.name}
                      {...socialMedia}
                      placeholder={socialMedia.placeholder}
                    />
                  ))}
              </div>

              {/* add more links */}
              <div className="flex flex-col md:flex-row items-start md:items-center md:justify-between md:gap-6 gap-4">
                <p className="text-qacc-gray-light text-sm md:text-lg font-medium mt-4 mb-2">
                  Add more links
                </p>
                <div className="flex flex-wrap gap-3">
                  {socialMediaLinks.map((s) => {
                    const already = selectedLinks.includes(s.name);
                    return (
                      <button
                        key={s.name}
                        type="button"
                        disabled={already}
                        onClick={() => toggleLink(s.name)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center bg-qacc-gray-light/[12%] hover:bg-qacc-gray-light hover:text-black transition-colors disabled:opacity-30`}
                      >
                        <img
                          src={`/images/icons/social/${s.iconName}`}
                          alt={s.label}
                          className="w-5 h-5 filter invert"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className="space-y-3 bg-black/50 p-4 sm:p-6 md:p-8 rounded-2xl">
              <p className="text-peach-400 font-anton text-[22px] uppercase tracking-wide">
                Project Description
              </p>
              {/* <SimpleEditor /> */}
              <RichTextEditor
                name="projectDescription"
                rules={{
                  required: "Project description is required",
                  minLength: {
                    value: 200,
                    message:
                      "Project description must be at least 200 characters",
                  },
                }}
                defaultValue={projectData?.description || ""}
                maxLength={500}
              />
            </section>

            {/* Team Section */}
            <section className="bg-white/[7%] p-4 sm:p-6 md:p-8 rounded-2xl space-y-8">
              <p className="text-peach-400 font-anton text-[22px] uppercase tracking-wide">
                Team
              </p>

              {/* EXISTING TEAM MEMBERS */}
              <div className="flex flex-col gap-6">
                {teamMembers?.map((member, index) => (
                  <TeamForm
                    key={index}
                    index={index}
                    teamMember={member}
                    removeMember={() => removeTeamMember(index)}
                    isEdit
                  />
                ))}
              </div>

              <div className="pt-8  flex justify-between items-center">
                <b>More team members?</b>
                <button
                  type="button"
                  onClick={addTeamMember}
                  className="bg-peach-400 px-3 py-3 md:py-1 rounded-xl text-sm md:text-base text-black font-medium"
                >
                  Add a new team member
                </button>
              </div>
            </section>
          </main>

          <div className="flex flex-row items-center gap-6 justify-between">
            <button className="border border-white/30 py-2 px-3 md:py-[10px] md:px-[20px] rounded-xl text-white/30 text-[13px] md:text-lg uppercase font-medium">
              Cancel
            </button>
            <button
              className="bg-peach-400 text-black py-2 px-3 md:py-[10px] md:px-[20px] rounded-xl text-[13px] md:text-lg uppercase font-medium hover:bg-peach-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              type="submit"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  Saving...{" "}
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black" />{" "}
                </>
              ) : (
                <>Save Project</>
              )}
            </button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default EditProjectForm;

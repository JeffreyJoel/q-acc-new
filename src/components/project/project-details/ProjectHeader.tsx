
import Image from "next/image";
import { CopyButton } from "@/components/shared/CopyButton";
import SocialLinks from "@/components/project/common/SocialLinks";
import { IProject } from "@/types/project.type";

interface ProjectHeaderProps {
  project: IProject;
}

export default function ProjectHeader({ project }: ProjectHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <div className="bg-[#111] rounded-xl p-4 flex-shrink-0">
          <Image
            src={project.icon || "/placeholder.svg"}
            alt={`${project.title} logo`}
            width={200}
            height={200}
            className="w-20 h-20 rounded-lg object-cover"
            priority
          />
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-tusker-8">
              {project.title}
            </h1>
          </div>
          <div>
            <p className="text-gray-400 my-2 text-sm font-medium flex items-center">
              {project.abc?.projectAddress?.slice(0, 8)}...
              {project.abc?.projectAddress?.slice(
                project.abc?.projectAddress.length - 8,
                project.abc?.projectAddress.length
              )}
              <CopyButton text={project.abc?.projectAddress || ""} />
            </p>
            <SocialLinks socialMedia={project.socialMedia} />
          </div>
        </div>
      </div>
    </div>
  );
}
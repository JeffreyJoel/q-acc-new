"use client";
import { IconX } from "@/components/icons/IconX";
import { TeamMember as TeamMemberType } from "@/types/project.type";
import Image from "next/image";
import Link from "next/link";

interface TeamSectionProps {
  teamMembers?: TeamMemberType[];
}

export default function TeamSection({ teamMembers }: TeamSectionProps) {
  return (
    <div className="bg-black/50 px-6 lg:px-8 py-8 rounded-3xl">
      <div className="flex flex-row items-baseline gap-2">
        <h2 className="text-2xl md:text-[40px] font-anton">Team</h2>
        <span className="text-white/30 text-2xl font-anton">
          {teamMembers && teamMembers.length}
        </span>
      </div>

      {!teamMembers || teamMembers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8">
          <p className="text-gray-400 text-center">
            No team members available for this project.
          </p>
        </div>
      ) : (
        <div className="flex flex-col justify-center gap-4 mt-4">
          {teamMembers.map((member: TeamMemberType, index: number) => (
            <div className="flex flex-row items-center gap-4" key={index}>
              <Image
                src={(member.image as unknown as string) || "/images/user.png"}
                alt={member.name}
                width={100}
                height={100}
                className="w-[48px] h-[48px] md:w-[80px] md:h-[80px] rounded-full object-cover"
              />
              <div>
                <h3 className="text-white font-medium text-lg md:text-xl mb-2">{member.name}</h3>
                <Link
                  href={`https://twitter.com/${member.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-[24px] h-[24px] block"
                >
                  <IconX color="white" fillOpacity={0.5} size={24} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

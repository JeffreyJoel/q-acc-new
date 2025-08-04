import TeamMember from "@/components/project/common/TeamCard";
import { TeamMember as TeamMemberType } from "@/types/project.type";

interface ProjectTeamTabProps {
  teamMembers: TeamMemberType[];
}

export default function ProjectTeamTab({ teamMembers }: ProjectTeamTabProps) {
  return (
    <div className="flex flex-wrap justify-center gap-4 py-4">
      {teamMembers &&
        teamMembers.map((member: TeamMemberType, index: number) => (
          <TeamMember
            key={index}
            member={{
              name: member.name,
              image: member.image as unknown as string,
              twitter: member.twitter || "N/A",
            }}
          />
        ))}
    </div>
  );
}
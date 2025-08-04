import Image from "next/image";
import { cn } from "@/lib/utils";
import { capitalizeFirstLetter } from "@/helpers";

interface ProjectTileProps {
  title: string;
  description: string;
  image: string;
  season: string | number;
  className?: string;
}

export function ProjectTile({
  title,
  description,
  image,
  season,
  className,
}: ProjectTileProps) {
  return (
    <div
      className={cn(
        "relative rounded-[20px] overflow-hidden shadow-lg bg-muted flex flex-col justify-end min-h-[354px] w-[220px] flex-shrink-0",
        className
      )}
      style={{ aspectRatio: "3/4" }}
    >
      <Image
        src={image}
        alt={title}
        fill
        className="object-center object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black/85 z-10" />
      <div className="absolute bottom-2 left-0 right-0 z-20 p-3 flex flex-col gap-2">
        <span className="inline-block bg-peach-400 text-black text-[8px] font-bold font-inter px-1 py-0.5 rounded-md mb-1 w-fit shadow uppercase tracking-wide">
          Season {season}
        </span>
        <h3 className="text-white text-base font-bold font-inter leading-tight drop-shadow-lg mb-0">
          {title}
        </h3>
        <p className="text-white/85 text-[11px] leading-snug font-medium font-inter drop-shadow max-w-xs line-clamp-4">
          {capitalizeFirstLetter(description) || "No description available"}
        </p>
      </div>
    </div>
  );
}

export default ProjectTile;

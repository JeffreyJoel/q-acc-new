import Image from "next/image";
import { roundPoints } from "@/helpers/points";

export default function UserPoints({ qaccPoints }: { qaccPoints: number }) {
  return (
    <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3 font-medium">
      <Image
        src="/images/logos/round_logo.png"
        width={24}
        height={24}
        alt="logo"
      />

      <span className="text-sm font-medium text-gray-200">
        {roundPoints(qaccPoints ?? 0)}
      </span>
    </div>
  );
}

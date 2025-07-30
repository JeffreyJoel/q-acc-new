import { PointsTable } from "@/components/leaderboard/PointsTable";

export default function LeaderboardPage() {
  return (
    <div className="">
    <div className="pt-36 pb-12 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 ">
      <div className="flex flex-col space-y-4">
       <div className="mb-8">
       <h1 className="text-[64px] tracking-normal font-anton uppercase">Points Leaderboard</h1>
          <p className="text-base max-w-xl text-white/40 font-medium">
          Rise to the top, earn your place
          </p>
       </div>
        <PointsTable />
      </div>
    </div>
    </div>
  );
}

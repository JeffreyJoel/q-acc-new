export interface LeaderboardUser {
  id: string;
  name: string;
  email: string | null;
  avatar: string | null;
  qaccPoints: number;
  qaccPointsMultiplier: number | null;
  projectsFundedCount: number;
  walletAddress: string;
  rank: number;
  username?: string | null;
}

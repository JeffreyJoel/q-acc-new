export const FETCH_LEADERBOARD = /* GraphQL */ `
  query ($take: Int, $skip: Int, $orderBy: SortUserBy) {
    getUsersByQaccPoints(take: $take, skip: $skip, orderBy: $orderBy) {
      users {
        id
        name
        email
        avatar
        qaccPoints
        qaccPointsMultiplier
        projectsFundedCount
        walletAddress
        rank
        username
      }
      totalCount
    }
  }
`;

export const FETCH_POINTS_HISTORY_OF_USER = /* GraphQL */ `
  query getQaccPointsHistory {
    getQaccPointsHistory {
      pointsEarned
      user {
        name
        username
      }
      donation {
        id
      }
    }
  }
`;

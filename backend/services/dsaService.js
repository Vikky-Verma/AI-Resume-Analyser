const axios = require("axios");

const LEETCODE_API = "https://leetcode.com/graphql";

const LEETCODE_QUERY = `
  query userProfile($username: String!) {
    matchedUser(username: $username) {
      username
      profile {
        realName
        ranking
        reputation
        starRating
      }
      submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
        }
      }
    }
  }
`;

/**
 * Fetches a LeetCode user's public profile + solved-problem counts.
 * Throws if the username doesn't exist or LeetCode is unreachable.
 */
const getLeetCodeStats = async (username) => {
  const response = await axios.post(
    LEETCODE_API,
    {
      query: LEETCODE_QUERY,
      variables: { username },
    },
    {
      headers: {
        "Content-Type": "application/json",
        // LeetCode blocks requests with no referer/origin
        Referer: `https://leetcode.com/${username}/`,
      },
      timeout: 10000,
    }
  );

  const user = response.data?.data?.matchedUser;

  if (!user) {
    const err = new Error("LeetCode user not found");
    err.statusCode = 404;
    throw err;
  }

  const counts = { All: 0, Easy: 0, Medium: 0, Hard: 0 };
  for (const entry of user.submitStatsGlobal.acSubmissionNum) {
    counts[entry.difficulty] = entry.count;
  }

  return {
    username: user.username,
    realName: user.profile.realName || null,
    ranking: user.profile.ranking,
    reputation: user.profile.reputation,
    starRating: user.profile.starRating,
    solved: {
      total: counts.All,
      easy: counts.Easy,
      medium: counts.Medium,
      hard: counts.Hard,
    },
  };
};

module.exports = { getLeetCodeStats };
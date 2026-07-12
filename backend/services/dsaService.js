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
  let response;

  try {
    response = await axios.post(
      LEETCODE_API,
      {
        query: LEETCODE_QUERY,
        variables: { username },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Referer: `https://leetcode.com/u/${username}/`,
          Origin: "https://leetcode.com",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
            "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          Accept: "*/*",
        },
        timeout: 10000,
      }
    );
  } catch (networkErr) {
    // Distinguish "LeetCode/Cloudflare blocked or errored us" from "user not found"
    console.log(
      "LeetCode request failed:",
      networkErr.response?.status,
      networkErr.response?.data || networkErr.message
    );
    const err = new Error("LeetCode request failed");
    err.statusCode = 502;
    throw err;
  }

  const user = response.data?.data?.matchedUser;

  if (!user) {
    // Log the full raw response so we can see WHY matchedUser is null
    console.log("LeetCode returned no matchedUser. Raw response:", JSON.stringify(response.data));
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
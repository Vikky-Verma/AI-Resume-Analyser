const axios = require("axios");

const LEETCODE_PROXY = "https://alfa-leetcode-api.onrender.com";

/**
 * Fetches a LeetCode user's public profile + solved-problem counts
 * via a proxy API. Note: this endpoint's response has no `username`
 * or `name` field — just the stats — so we echo back the input
 * username ourselves.
 */
const getLeetCodeStats = async (username) => {
  let profileRes;

  try {
    profileRes = await axios.get(`${LEETCODE_PROXY}/userProfile/${username}`, {
      timeout: 20000,
    });
  } catch (err) {
    console.log(
      "LeetCode proxy request failed:",
      err.response?.status,
      err.message,
    );

    if (err.response?.status === 429) {
      const wrapped = new Error("LeetCode proxy rate limited");
      wrapped.statusCode = 429;
      throw wrapped;
    }

    const wrapped = new Error("LeetCode request failed");
    wrapped.statusCode = 502;
    throw wrapped;
  }

  const profile = profileRes.data;

  // A genuinely invalid username returns an error/empty payload from
  // the proxy — a valid one always has totalQuestions + ranking set.
  if (!profile || profile.errors || typeof profile.totalSolved !== "number") {
    console.log(
      "LeetCode proxy returned no valid profile:",
      JSON.stringify(profile),
    );
    const err = new Error("LeetCode user not found");
    err.statusCode = 404;
    throw err;
  }

  return {
    username, // proxy doesn't echo this back, so we use the input
    realName: null,
    ranking: profile.ranking ?? null,
    reputation: profile.reputation ?? null,
    starRating: null,
    solved: {
      total: profile.totalSolved ?? 0,
      easy: profile.easySolved ?? 0,
      medium: profile.mediumSolved ?? 0,
      hard: profile.hardSolved ?? 0,
    },
  };
};

module.exports = { getLeetCodeStats };

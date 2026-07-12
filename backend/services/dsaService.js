const axios = require("axios");

const LEETCODE_PROXY = "https://alfa-leetcode-api.onrender.com";

/**
 * Fetches a LeetCode user's public profile + solved-problem counts
 * via a proxy API. LeetCode's own /graphql endpoint blocks server-side
 * requests from cloud hosts (Render, Vercel, etc.) at the Cloudflare/TLS
 * fingerprint level, even with correct headers and CSRF cookies.
 */
const getLeetCodeStats = async (username) => {
  let profileRes, solvedRes;

  try {
    [profileRes, solvedRes] = await Promise.all([
      axios.get(`${LEETCODE_PROXY}/userProfile/${username}`, { timeout: 20000 }),
      axios.get(`${LEETCODE_PROXY}/${username}/solved`, { timeout: 20000 }),
    ]);
  } catch (err) {
    console.log("LeetCode proxy request failed:", err.response?.status, err.message);
    const wrapped = new Error("LeetCode request failed");
    wrapped.statusCode = 502;
    throw wrapped;
  }

  const profile = profileRes.data;
  const solved = solvedRes.data;

  if (!profile || profile.errors || !profile.username) {
    console.log("LeetCode proxy returned no profile:", JSON.stringify(profile));
    const err = new Error("LeetCode user not found");
    err.statusCode = 404;
    throw err;
  }

  return {
    username: profile.username,
    realName: profile.name || null,
    ranking: profile.ranking,
    reputation: profile.reputation,
    starRating: profile.starRating,
    solved: {
      total: solved.solvedProblem ?? 0,
      easy: solved.easySolved ?? 0,
      medium: solved.mediumSolved ?? 0,
      hard: solved.hardSolved ?? 0,
    },
  };
};

module.exports = { getLeetCodeStats };
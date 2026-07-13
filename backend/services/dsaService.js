const axios = require("axios");

const LEETCODE_PROXY = "https://alfa-leetcode-api.onrender.com";
const CODEFORCES_API = "https://codeforces.com/api";

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

/**
 * Fetches a Codeforces user's rating info + solved-problem breakdown.
 * Codeforces has a genuine public API — no key, no proxy needed.
 */
const getCodeforcesStats = async (handle) => {
  let infoRes, statusRes;

  try {
    [infoRes, statusRes] = await Promise.all([
      axios.get(`${CODEFORCES_API}/user.info?handles=${encodeURIComponent(handle)}`, {
        timeout: 15000,
      }),
      axios.get(`${CODEFORCES_API}/user.status?handle=${encodeURIComponent(handle)}`, {
        timeout: 15000,
      }),
    ]);
  } catch (err) {
    console.log("Codeforces request failed:", err.response?.status, err.message);
    const wrapped = new Error("Codeforces request failed");
    wrapped.statusCode = 502;
    throw wrapped;
  }

  if (infoRes.data.status !== "OK" || statusRes.data.status !== "OK") {
    console.log(
      "Codeforces returned an error:",
      infoRes.data.comment || statusRes.data.comment,
    );
    const err = new Error("Codeforces user not found");
    err.statusCode = 404;
    throw err;
  }

  const user = infoRes.data.result[0];
  const submissions = statusRes.data.result;

  // Dedupe accepted submissions by problem — a problem can be
  // submitted (and solved) more than once.
  const solvedSet = new Set();
  const buckets = { easy: 0, medium: 0, hard: 0, unrated: 0 };

  for (const sub of submissions) {
    if (sub.verdict !== "OK") continue;

    const problemKey = `${sub.problem.contestId}-${sub.problem.index}`;
    if (solvedSet.has(problemKey)) continue;
    solvedSet.add(problemKey);

    const rating = sub.problem.rating;
    if (!rating) buckets.unrated += 1;
    else if (rating < 1200) buckets.easy += 1;
    else if (rating < 1800) buckets.medium += 1;
    else buckets.hard += 1;
  }

  return {
    handle: user.handle,
    rank: user.rank || null,
    rating: user.rating ?? null,
    maxRating: user.maxRating ?? null,
    contribution: user.contribution ?? 0,
    solved: {
      total: solvedSet.size,
      easy: buckets.easy,
      medium: buckets.medium,
      hard: buckets.hard,
      unrated: buckets.unrated,
    },
  };
};

module.exports = { getLeetCodeStats, getCodeforcesStats };
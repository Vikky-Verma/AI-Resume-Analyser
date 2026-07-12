const axios = require("axios");

const LEETCODE_BASE = "https://leetcode.com";
const LEETCODE_API = `${LEETCODE_BASE}/graphql`;

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

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
 * LeetCode's /graphql endpoint requires a CSRF cookie on every POST.
 * We hit the homepage first to get one, then reuse it for the real request.
 */
const getCsrfToken = async () => {
  const res = await axios.get(LEETCODE_BASE, {
    headers: { "User-Agent": USER_AGENT },
    timeout: 10000,
  });

  const setCookieHeaders = res.headers["set-cookie"] || [];
  const csrfCookieHeader = setCookieHeaders.find((c) =>
    c.startsWith("csrftoken=")
  );

  if (!csrfCookieHeader) {
    const err = new Error("Could not obtain LeetCode CSRF token");
    err.statusCode = 502;
    throw err;
  }

  const cookiePair = csrfCookieHeader.split(";")[0]; // "csrftoken=xxxxx"
  const token = cookiePair.split("=")[1];

  return { token, cookie: cookiePair };
};

/**
 * Fetches a LeetCode user's public profile + solved-problem counts.
 * Throws if the username doesn't exist or LeetCode is unreachable.
 */
const getLeetCodeStats = async (username) => {
  let csrf;

  try {
    csrf = await getCsrfToken();
  } catch (err) {
    console.log("Failed to get LeetCode CSRF token:", err.message);
    const wrapped = new Error("LeetCode request failed");
    wrapped.statusCode = 502;
    throw wrapped;
  }

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
          Referer: `${LEETCODE_BASE}/u/${username}/`,
          Origin: LEETCODE_BASE,
          "User-Agent": USER_AGENT,
          Cookie: csrf.cookie,
          "X-CSRFToken": csrf.token,
        },
        timeout: 10000,
      }
    );
  } catch (networkErr) {
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
    console.log(
      "LeetCode returned no matchedUser. Raw response:",
      JSON.stringify(response.data)
    );
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
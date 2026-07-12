// ════════════════════════════════════════
// Extracts GitHub / LinkedIn / LeetCode / Codeforces / CodeChef /
// HackerRank / GeeksforGeeks handles from resume text, then pulls
// live public stats for the platforms that expose a public API.
// ════════════════════════════════════════

const safeFetchJson = async (url, options = {}) => {
  try {
    const res = await fetch(url, { ...options, signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
};

// ---------- 1. Detect handles from resume text ----------

const extractHandle = (text, urlPatterns, labelPattern) => {
  for (const pattern of urlPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) return match[1].replace(/[/.,)]+$/, "");
  }
  if (labelPattern) {
    const match = text.match(labelPattern);
    if (match && match[1]) return match[1].trim();
  }
  return null;
};

const extractProfileHandles = (text) => {
  return {
    github: extractHandle(text, [
      /github\.com\/([a-zA-Z0-9-]+)/i,
    ]),
    linkedin: extractHandle(text, [
      /linkedin\.com\/in\/([a-zA-Z0-9\-_%]+)/i,
    ]),
    leetcode: extractHandle(text, [
      /leetcode\.com\/(?:u\/)?([a-zA-Z0-9_-]+)/i,
    ], /leetcode[:\s-]+([a-zA-Z0-9_.-]{3,30})/i),
    codeforces: extractHandle(text, [
      /codeforces\.com\/profile\/([a-zA-Z0-9_-]+)/i,
    ], /codeforces[:\s-]+([a-zA-Z0-9_.-]{3,30})/i),
    codechef: extractHandle(text, [
      /codechef\.com\/users\/([a-zA-Z0-9_-]+)/i,
    ], /codechef[:\s-]+([a-zA-Z0-9_.-]{3,30})/i),
    hackerrank: extractHandle(text, [
      /hackerrank\.com\/(?:profile\/)?([a-zA-Z0-9_-]+)/i,
    ], /hackerrank[:\s-]+([a-zA-Z0-9_.-]{3,30})/i),
    geeksforgeeks: extractHandle(text, [
      /(?:auth\.)?geeksforgeeks\.org\/user\/([a-zA-Z0-9_-]+)/i,
    ], /geeksforgeeks|gfg[:\s-]+([a-zA-Z0-9_.-]{3,30})/i),
  };
};

// ---------- 2. Per-platform stat fetchers ----------

const fetchGithubStats = async (username) => {
  const headers = {
    "User-Agent": "ai-resume-analyser",
    Accept: "application/vnd.github+json",
  };

  const profile = await safeFetchJson(`https://api.github.com/users/${username}`, { headers });
  if (!profile || profile.message === "Not Found") {
    return { platform: "GitHub", detected: true, handle: username, profileUrl: `https://github.com/${username}`, statsAvailable: false, note: "GitHub profile not found or API rate-limited." };
  }

  const repos = await safeFetchJson(
    `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
    { headers }
  );

  let totalStars = 0;
  const langCount = {};
  if (Array.isArray(repos)) {
    for (const r of repos) {
      totalStars += r.stargazers_count || 0;
      if (r.language) langCount[r.language] = (langCount[r.language] || 0) + 1;
    }
  }
  const topLanguages = Object.entries(langCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([lang]) => lang);

  return {
    platform: "GitHub",
    detected: true,
    handle: username,
    profileUrl: `https://github.com/${username}`,
    statsAvailable: true,
    stats: {
      publicRepos: profile.public_repos ?? 0,
      followers: profile.followers ?? 0,
      following: profile.following ?? 0,
      totalStars,
      topLanguages,
    },
  };
};

const fetchCodeforcesStats = async (handle) => {
  const data = await safeFetchJson(
    `https://codeforces.com/api/user.info?handles=${encodeURIComponent(handle)}`
  );

  if (!data || data.status !== "OK" || !data.result?.[0]) {
    return { platform: "Codeforces", detected: true, handle, profileUrl: `https://codeforces.com/profile/${handle}`, statsAvailable: false, note: "Handle not found on Codeforces or API unreachable." };
  }

  const u = data.result[0];
  return {
    platform: "Codeforces",
    detected: true,
    handle,
    profileUrl: `https://codeforces.com/profile/${handle}`,
    statsAvailable: true,
    stats: {
      rating: u.rating ?? "Unrated",
      maxRating: u.maxRating ?? "Unrated",
      rank: u.rank ?? "unrated",
      maxRank: u.maxRank ?? "unrated",
    },
  };
};

const fetchLeetCodeStats = async (username) => {
  const query = `
    query userProfile($username: String!) {
      matchedUser(username: $username) {
        username
        profile { ranking }
        submitStatsGlobal { acSubmissionNum { difficulty count } }
      }
    }
  `;

  const data = await safeFetchJson("https://leetcode.com/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { username } }),
  });

  const user = data?.data?.matchedUser;
  if (!user) {
    return { platform: "LeetCode", detected: true, handle: username, profileUrl: `https://leetcode.com/u/${username}`, statsAvailable: false, note: "Handle not found on LeetCode or API unreachable." };
  }

  const counts = {};
  for (const s of user.submitStatsGlobal?.acSubmissionNum || []) {
    counts[s.difficulty] = s.count;
  }

  return {
    platform: "LeetCode",
    detected: true,
    handle: username,
    profileUrl: `https://leetcode.com/u/${username}`,
    statsAvailable: true,
    stats: {
      ranking: user.profile?.ranking ?? "N/A",
      totalSolved: counts.All ?? 0,
      easySolved: counts.Easy ?? 0,
      mediumSolved: counts.Medium ?? 0,
      hardSolved: counts.Hard ?? 0,
    },
  };
};

const fetchCodeChefStats = async (username) => {
  // Unofficial community API — CodeChef has no stable public API.
  // Falls back gracefully to "detected but unavailable" if this breaks.
  const data = await safeFetchJson(`https://codechef-api.vercel.app/handle/${username}`);

  if (!data || data.success === false || !data.currentRating) {
    return { platform: "CodeChef", detected: true, handle: username, profileUrl: `https://www.codechef.com/users/${username}`, statsAvailable: false, note: "Live stats unavailable (CodeChef has no official public API)." };
  }

  return {
    platform: "CodeChef",
    detected: true,
    handle: username,
    profileUrl: `https://www.codechef.com/users/${username}`,
    statsAvailable: true,
    stats: {
      currentRating: data.currentRating,
      highestRating: data.highestRating,
      stars: data.stars,
      globalRank: data.globalRank ?? "N/A",
    },
  };
};

const fetchHackerRankStats = async (username) => ({
  platform: "HackerRank",
  detected: true,
  handle: username,
  profileUrl: `https://www.hackerrank.com/profile/${username}`,
  statsAvailable: false,
  note: "HackerRank doesn't expose a public stats API — badges are only visible on the profile page itself.",
});

const fetchGfgStats = async (username) => {
  // Unofficial community API — best-effort, degrades gracefully.
  const data = await safeFetchJson(`https://geeks-for-geeks-api.vercel.app/${username}`);

  if (!data || !data.info) {
    return { platform: "GeeksforGeeks", detected: true, handle: username, profileUrl: `https://www.geeksforgeeks.org/user/${username}`, statsAvailable: false, note: "Live stats unavailable (GeeksforGeeks has no official public API)." };
  }

  return {
    platform: "GeeksforGeeks",
    detected: true,
    handle: username,
    profileUrl: `https://www.geeksforgeeks.org/user/${username}`,
    statsAvailable: true,
    stats: {
      codingScore: data.info.codingScore ?? "N/A",
      totalProblemsSolved: data.info.totalProblemsSolved ?? "N/A",
      instituteRank: data.info.instituteRank ?? "N/A",
    },
  };
};

const fetchLinkedInStats = async (username) => ({
  platform: "LinkedIn",
  detected: true,
  handle: username,
  profileUrl: `https://linkedin.com/in/${username}`,
  statsAvailable: false,
  note: "LinkedIn blocks public scraping/APIs — link is verified only, no live stats.",
});

const NOT_DETECTED = (platform) => ({
  platform,
  detected: false,
  statsAvailable: false,
});

// ---------- 3. Orchestrator ----------

const getCodingProfiles = async (resumeText) => {
  const handles = extractProfileHandles(resumeText);

  const [github, linkedin, leetcode, codeforces, codechef, hackerrank, geeksforgeeks] =
    await Promise.all([
      handles.github ? fetchGithubStats(handles.github) : Promise.resolve(NOT_DETECTED("GitHub")),
      handles.linkedin ? fetchLinkedInStats(handles.linkedin) : Promise.resolve(NOT_DETECTED("LinkedIn")),
      handles.leetcode ? fetchLeetCodeStats(handles.leetcode) : Promise.resolve(NOT_DETECTED("LeetCode")),
      handles.codeforces ? fetchCodeforcesStats(handles.codeforces) : Promise.resolve(NOT_DETECTED("Codeforces")),
      handles.codechef ? fetchCodeChefStats(handles.codechef) : Promise.resolve(NOT_DETECTED("CodeChef")),
      handles.hackerrank ? fetchHackerRankStats(handles.hackerrank) : Promise.resolve(NOT_DETECTED("HackerRank")),
      handles.geeksforgeeks ? fetchGfgStats(handles.geeksforgeeks) : Promise.resolve(NOT_DETECTED("GeeksforGeeks")),
    ]);

  return [github, linkedin, leetcode, codeforces, codechef, hackerrank, geeksforgeeks];
};

module.exports = { getCodingProfiles, extractProfileHandles };
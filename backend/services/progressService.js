const prisma = require("../utils/prisma");

const DAY_MS = 24 * 60 * 60 * 1000;

const toDateKey = (date) => new Date(date).toISOString().slice(0, 10); // "YYYY-MM-DD"

/**
 * Builds the sorted set of unique days (as date keys) the user did *something*.
 */
const buildActivityDayKeys = (events) => {
  const keys = new Set(events.filter(Boolean).map((d) => toDateKey(d)));
  return [...keys].sort(); // ascending, "YYYY-MM-DD" sorts correctly as string
};

/**
 * Current streak = consecutive days ending today (or yesterday, so a user
 * who hasn't logged anything *yet* today doesn't lose their streak).
 * Longest streak = longest consecutive run anywhere in the history.
 */
const computeStreaks = (dayKeys) => {
  if (dayKeys.length === 0) return { current: 0, longest: 0 };

  const daySet = new Set(dayKeys);
  const todayKey = toDateKey(new Date());
  const yesterdayKey = toDateKey(new Date(Date.now() - DAY_MS));

  // Current streak: walk backwards from today (or yesterday) while days exist.
  let current = 0;
  let cursor = daySet.has(todayKey)
    ? new Date()
    : daySet.has(yesterdayKey)
    ? new Date(Date.now() - DAY_MS)
    : null;

  if (cursor) {
    while (daySet.has(toDateKey(cursor))) {
      current += 1;
      cursor = new Date(cursor.getTime() - DAY_MS);
    }
  }

  // Longest streak: scan the sorted unique days for the longest consecutive run.
  let longest = 1;
  let run = 1;
  for (let i = 1; i < dayKeys.length; i++) {
    const prev = new Date(dayKeys[i - 1]);
    const curr = new Date(dayKeys[i]);
    const diffDays = Math.round((curr - prev) / DAY_MS);
    run = diffDays === 1 ? run + 1 : 1;
    if (run > longest) longest = run;
  }

  return { current, longest: Math.max(longest, current) };
};

/**
 * Activity count per day for the last 7 days (oldest -> newest).
 */
const computeWeeklyActivity = (events) => {
  const counts = {};
  events.filter(Boolean).forEach((d) => {
    const key = toDateKey(d);
    counts[key] = (counts[key] || 0) + 1;
  });

  const days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(Date.now() - i * DAY_MS);
    const key = toDateKey(date);
    days.push({
      date: key,
      label: date.toLocaleDateString("en-US", { weekday: "short" }),
      count: counts[key] || 0,
    });
  }
  return days;
};

const buildAchievements = ({
  resumesCount,
  mockInterviewsCompleted,
  dsaSolvedCount,
  applicationsCount,
  longestStreak,
}) => [
  {
    id: "first_resume",
    title: "First Resume Analyzed",
    description: "Upload and analyze your first resume.",
    unlocked: resumesCount >= 1,
  },
  {
    id: "resume_5",
    title: "Resume Pro",
    description: "Analyze 5 resumes.",
    unlocked: resumesCount >= 5,
  },
  {
    id: "first_interview",
    title: "First Mock Interview",
    description: "Complete your first mock interview.",
    unlocked: mockInterviewsCompleted >= 1,
  },
  {
    id: "interview_5",
    title: "Interview Regular",
    description: "Complete 5 mock interviews.",
    unlocked: mockInterviewsCompleted >= 5,
  },
  {
    id: "dsa_10",
    title: "DSA Grinder",
    description: "Solve 10 company-prep questions.",
    unlocked: dsaSolvedCount >= 10,
  },
  {
    id: "dsa_50",
    title: "DSA Master",
    description: "Solve 50 company-prep questions.",
    unlocked: dsaSolvedCount >= 50,
  },
  {
    id: "first_application",
    title: "First Application Tracked",
    description: "Add your first job application.",
    unlocked: applicationsCount >= 1,
  },
  {
    id: "streak_3",
    title: "3-Day Streak",
    description: "Stay active 3 days in a row.",
    unlocked: longestStreak >= 3,
  },
  {
    id: "streak_7",
    title: "Week Warrior",
    description: "Stay active 7 days in a row.",
    unlocked: longestStreak >= 7,
  },
];

const getProgressSummary = async (userId) => {
  const [resumes, mockInterviews, companyPrepProgress, applications] =
    await Promise.all([
      prisma.resume.findMany({
        where: { userId },
        select: { uploadedAt: true },
      }),
      prisma.mockInterview.findMany({
        where: { userId },
        select: { createdAt: true, completedAt: true, status: true },
      }),
      prisma.companyPrepProgress.findMany({
        where: { userId },
        select: { updatedAt: true, solvedIds: true },
      }),
      prisma.application.findMany({
        where: { userId },
        select: { createdAt: true },
      }),
    ]);

  const resumesCount = resumes.length;
  const mockInterviewsCompleted = mockInterviews.filter(
    (m) => m.status === "completed"
  ).length;
  const dsaSolvedCount = companyPrepProgress.reduce(
    (sum, c) => sum + (c.solvedIds?.length || 0),
    0
  );
  const applicationsCount = applications.length;

  const activityEvents = [
    ...resumes.map((r) => r.uploadedAt),
    ...mockInterviews.map((m) => m.completedAt || m.createdAt),
    ...companyPrepProgress.map((c) => c.updatedAt),
    ...applications.map((a) => a.createdAt),
  ];

  const dayKeys = buildActivityDayKeys(activityEvents);
  const streak = computeStreaks(dayKeys);
  const weeklyActivity = computeWeeklyActivity(activityEvents);

  const achievements = buildAchievements({
    resumesCount,
    mockInterviewsCompleted,
    dsaSolvedCount,
    applicationsCount,
    longestStreak: streak.longest,
  });

  return {
    streak,
    weeklyActivity,
    modules: {
      resumes: resumesCount,
      mockInterviews: mockInterviewsCompleted,
      dsaSolved: dsaSolvedCount,
      applications: applicationsCount,
    },
    achievements,
    totalActivityDays: dayKeys.length,
  };
};

module.exports = { getProgressSummary };
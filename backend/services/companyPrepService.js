const fs = require("fs");
const path = require("path");
const prisma = require("../utils/prisma");

const DATA_PATH = path.join(__dirname, "..", "data", "companyPrep.json");

// Data is small (~2MB) and static — load once, keep in memory.
let cache = null;
const loadData = () => {
  if (!cache) {
    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    cache = JSON.parse(raw);
  }
  return cache;
};

/**
 * Lightweight list for the company grid — no question payload.
 */
const listCompanies = () => {
  const { companies } = loadData();
  return companies
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      tier: c.tier,
      volumeRank: c.volumeRank,
      totalQuestions: c.totalQuestions,
      difficultyBreakdown: c.difficultyBreakdown,
      topTopics: c.topicBreakdown.slice(0, 3).map((t) => t.topic),
    }))
    .sort((a, b) => a.volumeRank - b.volumeRank);
};

const getCompany = (slug) => {
  const { companies } = loadData();
  return companies.find((c) => c.slug === slug) || null;
};

const getDistinctTiers = () => {
  const { companies } = loadData();
  return [...new Set(companies.map((c) => c.tier))].sort();
};

/**
 * Explains how the "top 100" ranking / ordering was derived — surfaced in
 * the UI so it's clear this is a data-volume signal, not an employer rating.
 */
const getRankingMethod = () => {
  const { rankingMethod, source } = loadData();
  return { rankingMethod, source };
};

/**
 * Returns the solved-question ids for a user on a given company.
 * Returns an empty array if the user has no progress yet.
 */
const getProgress = async (userId, company) => {
  const row = await prisma.companyPrepProgress.findUnique({
    where: { userId_company: { userId, company } },
  });
  return row?.solvedIds ?? [];
};

/**
 * Returns solved-count per company for a user, used to show
 * "Solved X/100" badges on the company grid without fetching each detail.
 */
const getProgressSummary = async (userId) => {
  const rows = await prisma.companyPrepProgress.findMany({
    where: { userId },
    select: { company: true, solvedIds: true },
  });
  return rows.reduce((acc, r) => {
    acc[r.company] = r.solvedIds.length;
    return acc;
  }, {});
};

/**
 * Toggles a single question's solved state for a user + company,
 * upserting the progress row as needed.
 */
const toggleQuestion = async (userId, company, questionId, solved) => {
  const existing = await prisma.companyPrepProgress.findUnique({
    where: { userId_company: { userId, company } },
  });

  let nextSolvedIds;
  if (!existing) {
    nextSolvedIds = solved ? [questionId] : [];
  } else if (solved) {
    nextSolvedIds = existing.solvedIds.includes(questionId)
      ? existing.solvedIds
      : [...existing.solvedIds, questionId];
  } else {
    nextSolvedIds = existing.solvedIds.filter((id) => id !== questionId);
  }

  const row = await prisma.companyPrepProgress.upsert({
    where: { userId_company: { userId, company } },
    update: { solvedIds: nextSolvedIds },
    create: { userId, company, solvedIds: nextSolvedIds },
  });

  return row.solvedIds;
};

module.exports = {
  listCompanies,
  getCompany,
  getDistinctTiers,
  getRankingMethod,
  getProgress,
  getProgressSummary,
  toggleQuestion,
};
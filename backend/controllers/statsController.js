const fs = require("fs");
const path = require("path");
const prisma = require("../utils/prisma");

// Simple JSON file on disk to track total visits — no DB schema change needed.
const STATS_FILE = path.join(__dirname, "../data/siteStats.json");

const readVisitCount = () => {
  try {
    const raw = fs.readFileSync(STATS_FILE, "utf-8");
    return JSON.parse(raw).visitCount || 0;
  } catch (err) {
    // File doesn't exist yet — start from 0.
    return 0;
  }
};

const writeVisitCount = (count) => {
  fs.writeFileSync(STATS_FILE, JSON.stringify({ visitCount: count }, null, 2));
};

// GET /api/stats/public
// Returns real registered user count (from DB) + real visit count (from file).
const getPublicStats = async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    const visitCount = readVisitCount();

    res.status(200).json({
      success: true,
      users: userCount,
      visits: visitCount,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Failed to fetch stats." });
  }
};

// POST /api/stats/visit
// Increments the visit counter by 1.
const recordVisit = async (req, res) => {
  try {
    const current = readVisitCount();
    const updated = current + 1;
    writeVisitCount(updated);

    res.status(200).json({ success: true, visits: updated });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Failed to record visit." });
  }
};

module.exports = { getPublicStats, recordVisit };
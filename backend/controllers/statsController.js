const prisma = require("../utils/prisma");

// GET /api/stats/public
// Returns real registered user count + real site visit count.
const getPublicStats = async (req, res) => {
  try {
    const [userCount, stats] = await Promise.all([
      prisma.user.count(),
      prisma.siteStats.upsert({
        where: { id: "global" },
        update: {},
        create: { id: "global", visitCount: 0 },
      }),
    ]);

    res.status(200).json({
      success: true,
      users: userCount,
      visits: stats.visitCount,
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
    const stats = await prisma.siteStats.upsert({
      where: { id: "global" },
      update: { visitCount: { increment: 1 } },
      create: { id: "global", visitCount: 1 },
    });

    res.status(200).json({ success: true, visits: stats.visitCount });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Failed to record visit." });
  }
};

module.exports = { getPublicStats, recordVisit };
const prisma = require("../utils/prisma");
const { analyzeProjects } = require("./projectAnalysisService");

const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "portfolio";

const uniqueSlug = async (base) => {
  let candidate = base;
  let suffix = 0;

  while (await prisma.portfolio.findUnique({ where: { slug: candidate } })) {
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
  return candidate;
};

const getOrCreatePortfolio = async (userId, userName) => {
  const existing = await prisma.portfolio.findUnique({ where: { userId } });
  if (existing) return existing;

  const baseSlug = slugify(userName || "user");
  const slug = await uniqueSlug(baseSlug);

  return prisma.portfolio.create({
    data: { userId, slug },
  });
};

const updatePortfolio = async (userId, payload) => {
  const { headline, bio, skills, projects, links, slug } = payload;

  const data = {
    ...(headline !== undefined && { headline }),
    ...(bio !== undefined && { bio }),
    ...(skills !== undefined && { skills }),
    ...(projects !== undefined && { projects }),
    ...(links !== undefined && { links }),
  };

  if (slug !== undefined) {
    const normalized = slugify(slug);
    const owner = await prisma.portfolio.findUnique({ where: { slug: normalized } });
    if (owner && owner.userId !== userId) {
      throw new Error("SLUG_TAKEN");
    }
    data.slug = normalized;
  }

  return prisma.portfolio.update({
    where: { userId },
    data,
  });
};

const setPublish = async (userId, isPublic) => {
  return prisma.portfolio.update({
    where: { userId },
    data: { isPublic },
  });
};

const getPublicPortfolio = async (slug) => {
  const portfolio = await prisma.portfolio.findUnique({ where: { slug } });
  if (!portfolio || !portfolio.isPublic) return null;

  const user = await prisma.user.findUnique({
    where: { id: portfolio.userId },
    select: { name: true },
  });

  return { ...portfolio, name: user?.name || "" };
};

const importFromResume = async (userId, resumeId) => {
  const resume = await prisma.resume.findUnique({
    where: { id: resumeId },
    include: { analysis: true },
  });

  if (!resume || resume.userId !== userId) {
    throw new Error("RESUME_NOT_FOUND");
  }

  const portfolio = await prisma.portfolio.findUnique({ where: { userId } });
  if (!portfolio) throw new Error("PORTFOLIO_NOT_FOUND");

  const existingSkills = new Set(portfolio.skills || []);
  (resume.analysis?.skills || []).forEach((s) => existingSkills.add(s));

  let importedProjects = [];
  if (resume.extractedText) {
    const report = await analyzeProjects(resume.extractedText);
    importedProjects = (report.projects || []).map((p) => ({
      name: p.name,
      techStack: p.techStack || [],
      description: p.whatItCovers || "",
      link: "",
      github: "",
    }));
  }

  const existingProjects = Array.isArray(portfolio.projects) ? portfolio.projects : [];
  const existingNames = new Set(existingProjects.map((p) => p.name));
  const mergedProjects = [
    ...existingProjects,
    ...importedProjects.filter((p) => !existingNames.has(p.name)),
  ];

  return prisma.portfolio.update({
    where: { userId },
    data: {
      skills: Array.from(existingSkills),
      projects: mergedProjects,
    },
  });
};

module.exports = {
  getOrCreatePortfolio,
  updatePortfolio,
  setPublish,
  getPublicPortfolio,
  importFromResume,
};
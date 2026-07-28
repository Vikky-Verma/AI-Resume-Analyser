const prisma = require("../utils/prisma");

const DEFAULT_DATA = {
  templateId: "classic",
  companyId: "general",
  personalInfo: {
    fullName: "",
    role: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    website: "",
  },
  summary: "",
  experience: [],
  education: [],
  projects: [],
  skills: [],
  achievements: [],
  certifications: [],
};

// Only these fields can ever be written by a client request.
const WRITABLE_FIELDS = [
  "title",
  "templateId",
  "companyId",
  "personalInfo",
  "summary",
  "experience",
  "education",
  "projects",
  "skills",
  "achievements",
  "certifications",
];

const pickWritable = (body = {}) => {
  const data = {};
  for (const key of WRITABLE_FIELDS) {
    if (body[key] !== undefined) data[key] = body[key];
  }
  return data;
};

const listMyResumes = async (userId) => {
  return prisma.builderResume.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
};

const getResumeById = async (userId, id) => {
  const resume = await prisma.builderResume.findUnique({ where: { id } });
  if (!resume || resume.userId !== userId) return null;
  return resume;
};

const createResume = async (userId, body) => {
  const data = pickWritable(body);
  return prisma.builderResume.create({
    data: {
      ...DEFAULT_DATA,
      ...data,
      title: data.title || "Untitled Resume",
      userId,
    },
  });
};

const updateResume = async (userId, id, body) => {
  const existing = await getResumeById(userId, id);
  if (!existing) return null;

  const data = pickWritable(body);
  return prisma.builderResume.update({
    where: { id },
    data,
  });
};

const deleteResume = async (userId, id) => {
  const existing = await getResumeById(userId, id);
  if (!existing) return false;

  await prisma.builderResume.delete({ where: { id } });
  return true;
};

// Best-effort mapping from parsed resume text -> starter data for the builder.
// Kept intentionally simple; the user always refines it in the form after import.
const importFromParsedResume = async (userId, resumeId) => {
  const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
  if (!resume || resume.userId !== userId) {
    throw new Error("RESUME_NOT_FOUND");
  }

  const analysis = await prisma.analysis.findUnique({ where: { resumeId } });

  return createResume(userId, {
    title: resume.originalName?.replace(/\.[^/.]+$/, "") || "Imported Resume",
    skills: (analysis?.skills || []).length
      ? [{ id: "skl-1", category: "Skills", items: analysis.skills }]
      : [],
  });
};

module.exports = {
  DEFAULT_DATA,
  listMyResumes,
  getResumeById,
  createResume,
  updateResume,
  deleteResume,
  importFromParsedResume,
};
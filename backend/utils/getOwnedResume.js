const prisma = require("./prisma");

/**
 * Fetch a Resume by id AND verify it belongs to the requesting user.
 * Use this in every controller that looks up a resume by :resumeId or :id,
 * instead of calling prisma.resume.findUnique directly.
 *
 * Throws a typed error the global error handler understands:
 *   - 404 if the resume doesn't exist
 *   - 403 if it exists but belongs to someone else
 *
 * @param {string} resumeId
 * @param {string} userId - req.user.id from the auth middleware
 * @returns {Promise<import("@prisma/client").Resume>}
 */
async function getOwnedResume(resumeId, userId) {
  const resume = await prisma.resume.findUnique({
    where: { id: resumeId },
  });

  if (!resume) {
    const err = new Error("Resume Not Found");
    err.statusCode = 404;
    throw err;
  }

  if (resume.userId !== userId) {
    const err = new Error("Not Authorized To Access This Resume");
    err.statusCode = 403;
    throw err;
  }

  return resume;
}

module.exports = getOwnedResume;
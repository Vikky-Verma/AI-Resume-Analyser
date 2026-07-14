const prisma = require("../utils/prisma");

const STATUSES = ["applied", "oa", "interview", "offer", "rejected"];

const listApplications = async (userId) => {
  return prisma.application.findMany({
    where: { userId },
    orderBy: [{ status: "asc" }, { position: "asc" }],
  });
};

const createApplication = async (userId, payload) => {
  const { company, role, link, notes, deadline, status } = payload;

  const initialStatus = STATUSES.includes(status) ? status : "applied";

  // New card goes to the bottom of its column
  const last = await prisma.application.findFirst({
    where: { userId, status: initialStatus },
    orderBy: { position: "desc" },
  });
  const position = last ? last.position + 1 : 0;

  return prisma.application.create({
    data: {
      userId,
      company,
      role,
      link: link || null,
      notes: notes || null,
      deadline: deadline ? new Date(deadline) : null,
      status: initialStatus,
      position,
      statusHistory: [{ status: initialStatus, at: new Date().toISOString() }],
    },
  });
};

const getOwnedApplication = async (userId, id) => {
  const app = await prisma.application.findUnique({ where: { id } });
  if (!app || app.userId !== userId) return null;
  return app;
};

const updateApplication = async (userId, id, payload) => {
  const existing = await getOwnedApplication(userId, id);
  if (!existing) return null;

  const { company, role, link, notes, deadline } = payload;

  return prisma.application.update({
    where: { id },
    data: {
      ...(company !== undefined && { company }),
      ...(role !== undefined && { role }),
      ...(link !== undefined && { link: link || null }),
      ...(notes !== undefined && { notes: notes || null }),
      ...(deadline !== undefined && {
        deadline: deadline ? new Date(deadline) : null,
      }),
    },
  });
};

// Move a card to a new status/position, shifting siblings to keep positions dense.
const moveApplication = async (userId, id, { status, position }) => {
  const existing = await getOwnedApplication(userId, id);
  if (!existing) return null;

  if (!STATUSES.includes(status)) {
    throw new Error("Invalid status");
  }

  const columnCards = await prisma.application.findMany({
    where: { userId, status, NOT: { id } },
    orderBy: { position: "asc" },
  });

  const clampedPosition = Math.max(0, Math.min(position, columnCards.length));
  columnCards.splice(clampedPosition, 0, { id });

  const statusChanged = existing.status !== status;

  await prisma.$transaction([
    ...columnCards.map((card, idx) =>
      prisma.application.update({
        where: { id: card.id },
        data:
          card.id === id
            ? {
                status,
                position: idx,
                ...(statusChanged && {
                  statusHistory: [
                    ...(Array.isArray(existing.statusHistory)
                      ? existing.statusHistory
                      : []),
                    { status, at: new Date().toISOString() },
                  ],
                }),
              }
            : { position: idx },
      })
    ),
  ]);

  return getOwnedApplication(userId, id);
};

const deleteApplication = async (userId, id) => {
  const existing = await getOwnedApplication(userId, id);
  if (!existing) return null;

  await prisma.application.delete({ where: { id } });
  return true;
};

module.exports = {
  STATUSES,
  listApplications,
  createApplication,
  updateApplication,
  moveApplication,
  deleteApplication,
  getOwnedApplication,
};
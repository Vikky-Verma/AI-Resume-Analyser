jest.mock("../utils/prisma", () => ({
  resume: {
    findUnique: jest.fn(),
  },
}));

jest.mock("../middleware/authMiddleware", () =>
  (req, res, next) => {
    // Simulate an authenticated user — tests override req.user per-case
    // via the x-test-user-id header for simplicity.
    req.user = { id: req.headers["x-test-user-id"] || "user-a" };
    next();
  }
);

const request = require("supertest");
const app = require("../app");
const prisma = require("../utils/prisma");

describe("Resume ownership (IDOR protection)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 403 when a user tries to parse someone else's resume", async () => {
    prisma.resume.findUnique.mockResolvedValue({
      id: "resume-1",
      userId: "user-a",
      originalName: "resume.pdf",
    });

    const res = await request(app)
      .post("/api/resume/parse/resume-1")
      .set("x-test-user-id", "user-b"); // different user

    expect(res.status).toBe(403);
  });

  it("returns 404 when the resume does not exist", async () => {
    prisma.resume.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post("/api/resume/parse/does-not-exist")
      .set("x-test-user-id", "user-a");

    expect(res.status).toBe(404);
  });

  it("allows the owner to access their own resume", async () => {
    prisma.resume.findUnique.mockResolvedValue({
      id: "resume-1",
      userId: "user-a",
      originalName: "resume.pdf",
      // ✅ a real-shaped filePath so parsePDF's startsWith() check
      // doesn't crash with a raw TypeError — it now fails cleanly
      // inside a try/catch (network error on the fake URL) instead.
      filePath: "https://fake-cloudinary-url.com/resume.pdf",
      extractedText: "existing text",
    });

    const res = await request(app)
      .post("/api/resume/parse/resume-1")
      .set("x-test-user-id", "user-a"); // same user

    // Not 403/404 — whatever happens next (parsing itself may fail
    // without a real file, but the ownership check must pass first)
    expect(res.status).not.toBe(403);
    expect(res.status).not.toBe(404);
  });
});
jest.mock("../utils/prisma", () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
}));

const request = require("supertest");
const bcrypt = require("bcryptjs");
const app = require("../app");
const prisma = require("../utils/prisma");

describe("Auth routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/auth/register", () => {
    it("rejects a weak password", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Test User",
        email: "test@example.com",
        password: "weak",
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("rejects an invalid email", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Test User",
        email: "not-an-email",
        password: "StrongPass123",
      });

      expect(res.status).toBe(400);
    });

    it("rejects registration when the user already exists", async () => {
      prisma.user.findUnique.mockResolvedValue({ id: "1", email: "test@example.com" });

      const res = await request(app).post("/api/auth/register").send({
        name: "Test User",
        email: "test@example.com",
        password: "StrongPass123",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/already exists/i);
    });

    it("registers a new user with valid data", async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: "1",
        name: "Test User",
        email: "test@example.com",
      });

      const res = await request(app).post("/api/auth/register").send({
        name: "Test User",
        email: "test@example.com",
        password: "StrongPass123",
      });

      expect(res.status).toBe(201);
      expect(prisma.user.create).toHaveBeenCalledTimes(1);
    });
  });

  describe("POST /api/auth/login", () => {
    it("rejects login with missing password", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
      });

      expect(res.status).toBe(400);
    });

    it("rejects login for a non-existent user", async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const res = await request(app).post("/api/auth/login").send({
        email: "nobody@example.com",
        password: "whatever123",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/invalid credentials/i);
    });

    it("rejects login with wrong password", async () => {
      const hashed = await bcrypt.hash("CorrectPass123", 10);
      prisma.user.findUnique.mockResolvedValue({
        id: "1",
        email: "test@example.com",
        password: hashed,
      });

      const res = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "WrongPass123",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/invalid credentials/i);
    });

    it("logs in successfully with correct credentials", async () => {
      const hashed = await bcrypt.hash("CorrectPass123", 10);
      prisma.user.findUnique.mockResolvedValue({
        id: "1",
        name: "Test User",
        email: "test@example.com",
        password: hashed,
      });

      const res = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "CorrectPass123",
      });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
    });
  });
});
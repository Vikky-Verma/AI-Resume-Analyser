jest.mock("../utils/prisma", () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  otpVerification: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("../utils/mailer", () => ({
  sendOtpEmail: jest.fn().mockResolvedValue(true),
}));

const request = require("supertest");
const bcrypt = require("bcryptjs");
const app = require("../app");
const prisma = require("../utils/prisma");
const { sendOtpEmail } = require("../utils/mailer");
const { hashOtp } = require("../utils/otp");

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

    it("stages the signup and emails an OTP instead of creating the user immediately", async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.otpVerification.upsert.mockResolvedValue({});

      const res = await request(app).post("/api/auth/register").send({
        name: "Test User",
        email: "test@example.com",
        password: "StrongPass123",
      });

      expect(res.status).toBe(200);
      expect(res.body.email).toBe("test@example.com");
      expect(prisma.otpVerification.upsert).toHaveBeenCalledTimes(1);
      expect(prisma.user.create).not.toHaveBeenCalled();
      expect(sendOtpEmail).toHaveBeenCalledTimes(1);
    });
  });

  describe("POST /api/auth/register/verify-otp", () => {
    it("rejects an incorrect code", async () => {
      prisma.otpVerification.findUnique.mockResolvedValue({
        email: "test@example.com",
        name: "Test User",
        password: "hashed",
        otpHash: hashOtp("111111"),
        expiresAt: new Date(Date.now() + 60_000),
        attempts: 0,
      });

      const res = await request(app).post("/api/auth/register/verify-otp").send({
        email: "test@example.com",
        otp: "000000",
      });

      expect(res.status).toBe(400);
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it("creates the user once the correct code is submitted", async () => {
      prisma.otpVerification.findUnique.mockResolvedValue({
        email: "test@example.com",
        name: "Test User",
        password: "hashed",
        otpHash: hashOtp("123456"),
        expiresAt: new Date(Date.now() + 60_000),
        attempts: 0,
      });
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: "1",
        name: "Test User",
        email: "test@example.com",
      });

      const res = await request(app).post("/api/auth/register/verify-otp").send({
        email: "test@example.com",
        otp: "123456",
      });

      expect(res.status).toBe(201);
      expect(prisma.user.create).toHaveBeenCalledTimes(1);
      expect(prisma.otpVerification.delete).toHaveBeenCalledTimes(1);
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
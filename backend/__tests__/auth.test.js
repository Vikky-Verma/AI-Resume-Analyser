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

  // ============================================================
  // REGISTER
  // ============================================================

  describe("POST /api/auth/register", () => {
    it("rejects a weak password", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Test User",
          email: "test@example.com",
          password: "weak",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("rejects an invalid email", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Test User",
          email: "not-an-email",
          password: "StrongPass123",
        });

      expect(res.status).toBe(400);
    });

    it("rejects registration when the user already exists", async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: "1",
        email: "test@example.com",
      });

      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Test User",
          email: "test@example.com",
          password: "StrongPass123",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/already exists/i);

      expect(prisma.otpVerification.upsert).not.toHaveBeenCalled();
      expect(sendOtpEmail).not.toHaveBeenCalled();
    });

    it("stages the signup and emails an OTP instead of creating the user immediately", async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      prisma.otpVerification.upsert.mockResolvedValue({
        email: "test@example.com",
        name: "Test User",
      });

      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Test User",
          email: "test@example.com",
          password: "StrongPass123",
        });

      expect(res.status).toBe(200);

      expect(res.body).toEqual({
        message: "Verification code sent to your email",
        email: "test@example.com",
      });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          email: "test@example.com",
        },
      });

      expect(prisma.otpVerification.upsert).toHaveBeenCalledTimes(1);

      expect(prisma.otpVerification.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            email: "test@example.com",
          },
          create: expect.objectContaining({
            name: "Test User",
            email: "test@example.com",
            password: expect.any(String),
            otpHash: expect.any(String),
            expiresAt: expect.any(Date),
          }),
          update: expect.objectContaining({
            name: "Test User",
            password: expect.any(String),
            otpHash: expect.any(String),
            expiresAt: expect.any(Date),
            attempts: 0,
            lastSentAt: expect.any(Date),
          }),
        })
      );

      // User must NOT be created until OTP verification.
      expect(prisma.user.create).not.toHaveBeenCalled();

      // OTP email should be sent.
      expect(sendOtpEmail).toHaveBeenCalledTimes(1);
      expect(sendOtpEmail).toHaveBeenCalledWith(
        "test@example.com",
        "Test User",
        expect.any(String)
      );
    });
  });

  // ============================================================
  // VERIFY OTP
  // ============================================================

  describe("POST /api/auth/register/verify-otp", () => {
    it("rejects when there is no pending verification", async () => {
      prisma.otpVerification.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post("/api/auth/register/verify-otp")
        .send({
          email: "test@example.com",
          otp: "123456",
        });

      expect(res.status).toBe(400);

      expect(res.body.message).toMatch(/no pending verification/i);

      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it("rejects an expired OTP", async () => {
      prisma.otpVerification.findUnique.mockResolvedValue({
        email: "test@example.com",
        name: "Test User",
        password: "hashed",
        otpHash: hashOtp("123456"),
        expiresAt: new Date(Date.now() - 60_000),
        attempts: 0,
      });

      const res = await request(app)
        .post("/api/auth/register/verify-otp")
        .send({
          email: "test@example.com",
          otp: "123456",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/expired/i);

      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it("rejects an incorrect code", async () => {
      prisma.otpVerification.findUnique.mockResolvedValue({
        email: "test@example.com",
        name: "Test User",
        password: "hashed",
        otpHash: hashOtp("111111"),
        expiresAt: new Date(Date.now() + 60_000),
        attempts: 0,
      });

      prisma.otpVerification.update.mockResolvedValue({});

      const res = await request(app)
        .post("/api/auth/register/verify-otp")
        .send({
          email: "test@example.com",
          otp: "000000",
        });

      expect(res.status).toBe(400);

      expect(res.body.message).toMatch(/incorrect code/i);

      expect(prisma.otpVerification.update).toHaveBeenCalledTimes(1);

      expect(prisma.otpVerification.update).toHaveBeenCalledWith({
        where: {
          email: "test@example.com",
        },
        data: {
          attempts: {
            increment: 1,
          },
        },
      });

      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it("rejects verification after maximum attempts", async () => {
      prisma.otpVerification.findUnique.mockResolvedValue({
        email: "test@example.com",
        name: "Test User",
        password: "hashed",
        otpHash: hashOtp("123456"),
        expiresAt: new Date(Date.now() + 60_000),
        attempts: 5,
      });

      const res = await request(app)
        .post("/api/auth/register/verify-otp")
        .send({
          email: "test@example.com",
          otp: "123456",
        });

      expect(res.status).toBe(429);

      expect(res.body.message).toMatch(/too many incorrect attempts/i);

      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it("rejects verification when the user already exists", async () => {
      prisma.otpVerification.findUnique.mockResolvedValue({
        email: "test@example.com",
        name: "Test User",
        password: "hashed",
        otpHash: hashOtp("123456"),
        expiresAt: new Date(Date.now() + 60_000),
        attempts: 0,
      });

      prisma.user.findUnique.mockResolvedValue({
        id: "1",
        email: "test@example.com",
      });

      const res = await request(app)
        .post("/api/auth/register/verify-otp")
        .send({
          email: "test@example.com",
          otp: "123456",
        });

      expect(res.status).toBe(400);

      expect(res.body.message).toMatch(/already exists/i);

      expect(prisma.user.create).not.toHaveBeenCalled();

      expect(prisma.otpVerification.delete).toHaveBeenCalledTimes(1);
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

      prisma.otpVerification.delete.mockResolvedValue({});

      const res = await request(app)
        .post("/api/auth/register/verify-otp")
        .send({
          email: "test@example.com",
          otp: "123456",
        });

      expect(res.status).toBe(201);

      expect(res.body.message).toMatch(/email verified/i);

      expect(prisma.user.create).toHaveBeenCalledTimes(1);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          name: "Test User",
          email: "test@example.com",
          password: "hashed",
        },
      });

      expect(prisma.otpVerification.delete).toHaveBeenCalledTimes(1);

      expect(prisma.otpVerification.delete).toHaveBeenCalledWith({
        where: {
          email: "test@example.com",
        },
      });
    });
  });

  // ============================================================
  // RESEND OTP
  // ============================================================

  describe("POST /api/auth/register/resend-otp", () => {
    it("rejects resend when there is no pending verification", async () => {
      prisma.otpVerification.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post("/api/auth/register/resend-otp")
        .send({
          email: "test@example.com",
        });

      expect(res.status).toBe(400);

      expect(res.body.message).toMatch(/no pending verification/i);

      expect(prisma.otpVerification.update).not.toHaveBeenCalled();
      expect(sendOtpEmail).not.toHaveBeenCalled();
    });

    it("rejects resend during the cooldown period", async () => {
      prisma.otpVerification.findUnique.mockResolvedValue({
        email: "test@example.com",
        name: "Test User",
        password: "hashed",
        otpHash: hashOtp("123456"),
        expiresAt: new Date(Date.now() + 60_000),
        attempts: 0,
        lastSentAt: new Date(),
      });

      const res = await request(app)
        .post("/api/auth/register/resend-otp")
        .send({
          email: "test@example.com",
        });

      expect(res.status).toBe(429);

      expect(res.body.message).toMatch(/please wait/i);

      expect(prisma.otpVerification.update).not.toHaveBeenCalled();
      expect(sendOtpEmail).not.toHaveBeenCalled();
    });

    it("resends a new OTP successfully", async () => {
      prisma.otpVerification.findUnique.mockResolvedValue({
        email: "test@example.com",
        name: "Test User",
        password: "hashed",
        otpHash: hashOtp("111111"),
        expiresAt: new Date(Date.now() + 60_000),
        attempts: 2,
        lastSentAt: new Date(Date.now() - 120_000),
      });

      prisma.otpVerification.update.mockResolvedValue({});

      const res = await request(app)
        .post("/api/auth/register/resend-otp")
        .send({
          email: "test@example.com",
        });

      expect(res.status).toBe(200);

      expect(res.body.message).toMatch(/resent/i);

      expect(prisma.otpVerification.update).toHaveBeenCalledTimes(1);

      expect(prisma.otpVerification.update).toHaveBeenCalledWith({
        where: {
          email: "test@example.com",
        },
        data: {
          otpHash: expect.any(String),
          expiresAt: expect.any(Date),
          attempts: 0,
          lastSentAt: expect.any(Date),
        },
      });

      expect(sendOtpEmail).toHaveBeenCalledTimes(1);

      expect(sendOtpEmail).toHaveBeenCalledWith(
        "test@example.com",
        "Test User",
        expect.any(String)
      );
    });
  });

  // ============================================================
  // LOGIN
  // ============================================================

  describe("POST /api/auth/login", () => {
    it("rejects login with missing password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "test@example.com",
        });

      expect(res.status).toBe(400);
    });

    it("rejects login for a non-existent user", async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post("/api/auth/login")
        .send({
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

      const res = await request(app)
        .post("/api/auth/login")
        .send({
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

      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "test@example.com",
          password: "CorrectPass123",
        });

      expect(res.status).toBe(200);

      expect(res.body.token).toBeDefined();

      expect(res.body.user).toEqual({
        id: "1",
        name: "Test User",
        email: "test@example.com",
      });
    });
  });
});

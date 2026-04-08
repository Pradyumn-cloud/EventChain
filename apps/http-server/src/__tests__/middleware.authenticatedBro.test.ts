import { describe, it, expect, vi, beforeEach } from "vitest";
import { authenticatedBro } from "../middleware.js";

vi.mock("@repo/db", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    verify: vi.fn(),
  },
}));

import { prisma } from "@repo/db";
import jwt from "jsonwebtoken";

describe("authenticatedBro Middleware White-Box Tests", () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockReq = {
      headers: {},
    };

    mockRes = {
      sendStatus: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };

    mockNext = vi.fn();
  });

  describe("Missing Authorization Header Branch", () => {
    it("Should return 401 when authorization header is missing", async () => {
      await authenticatedBro(mockReq, mockRes, mockNext);

      expect(mockRes.sendStatus).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });

    it("Should return 401 when authorization header is empty string", async () => {
      mockReq.headers.authorization = "";

      await authenticatedBro(mockReq, mockRes, mockNext);

      expect(mockRes.sendStatus).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("Malformed Bearer Token Branch", () => {
    it("Should return 401 when token is null after split", async () => {
      mockReq.headers.authorization = "Bearer";

      await authenticatedBro(mockReq, mockRes, mockNext);

      expect(mockRes.sendStatus).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });

    it("Should return 401 when authorization format is invalid (no Bearer)", async () => {
      mockReq.headers.authorization = "InvalidFormat token123";

      await authenticatedBro(mockReq, mockRes, mockNext);

      expect(mockRes.sendStatus).toHaveBeenCalledWith(401);
    });
  });

  describe("JWT Verification Failure Branch", () => {
    it("Should return 401 when jwt.verify throws error", async () => {
      mockReq.headers.authorization = "Bearer validformatbutbadtoken";

      (jwt.verify as any).mockImplementation(() => {
        throw new Error("Invalid token");
      });

      await authenticatedBro(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.send).toHaveBeenCalledWith({ error: "Unauthorized" });
      expect(mockNext).not.toHaveBeenCalled();
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });

    it("Should return 401 when jwt.verify throws TokenExpiredError", async () => {
      mockReq.headers.authorization = "Bearer expiredtoken";

      const expiredError = new Error("jwt expired");
      expiredError.name = "TokenExpiredError";
      (jwt.verify as any).mockImplementation(() => {
        throw expiredError;
      });

      await authenticatedBro(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.send).toHaveBeenCalledWith({ error: "Unauthorized" });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("Should return 401 when jwt.verify throws JsonWebTokenError", async () => {
      mockReq.headers.authorization = "Bearer malformedtoken";

      const jwtError = new Error("jwt malformed");
      jwtError.name = "JsonWebTokenError";
      (jwt.verify as any).mockImplementation(() => {
        throw jwtError;
      });

      await authenticatedBro(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.send).toHaveBeenCalledWith({ error: "Unauthorized" });
    });
  });

  describe("User Not Found in Database Branch", () => {
    it("Should return 401 when prisma returns null user", async () => {
      mockReq.headers.authorization = "Bearer validtoken";

      (jwt.verify as any).mockReturnValue({
        id: "user-123",
        walletAddress: "0xabc",
        role: "USER",
      });

      (prisma.user.findUnique as any).mockResolvedValue(null);

      await authenticatedBro(mockReq, mockRes, mockNext);

      expect(jwt.verify).toHaveBeenCalled();
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: "user-123" },
        select: { id: true, walletAddress: true, role: true, createdAt: true },
      });
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.send).toHaveBeenCalledWith({
        error: "Unauthorized or user not found brother",
      });
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockReq.user).toBeUndefined();
    });

    it("Should return 401 when user is deleted between token issue and verification", async () => {
      mockReq.headers.authorization = "Bearer validtoken";

      (jwt.verify as any).mockReturnValue({
        id: "deleted-user-456",
        walletAddress: "0xdef",
        role: "USER",
      });

      (prisma.user.findUnique as any).mockResolvedValue(null);

      await authenticatedBro(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("Success Path with req.user Population", () => {
    it("Should populate req.user and call next() when all checks pass", async () => {
      mockReq.headers.authorization = "Bearer validtoken123";

      const mockUser = {
        id: "user-789",
        walletAddress: "0x123456789",
        role: "USER",
        createdAt: new Date("2024-01-01"),
      };

      (jwt.verify as any).mockReturnValue({
        id: "user-789",
        walletAddress: "0x123456789",
        role: "USER",
      });

      (prisma.user.findUnique as any).mockResolvedValue(mockUser);

      await authenticatedBro(mockReq, mockRes, mockNext);

      expect(jwt.verify).toHaveBeenCalledWith(
        "validtoken123",
        expect.any(String),
      );
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: "user-789" },
        select: { id: true, walletAddress: true, role: true, createdAt: true },
      });
      expect(mockReq.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.sendStatus).not.toHaveBeenCalled();
    });

    it("Should handle ORGANIZER role correctly", async () => {
      mockReq.headers.authorization = "Bearer organizertoken";

      const organizerUser = {
        id: "org-001",
        walletAddress: "0xorganizer",
        role: "ORGANIZER",
        createdAt: new Date("2023-12-01"),
      };

      (jwt.verify as any).mockReturnValue({
        id: "org-001",
        walletAddress: "0xorganizer",
        role: "ORGANIZER",
      });

      (prisma.user.findUnique as any).mockResolvedValue(organizerUser);

      await authenticatedBro(mockReq, mockRes, mockNext);

      expect(mockReq.user).toEqual(organizerUser);
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("Should only select specified fields from database", async () => {
      mockReq.headers.authorization = "Bearer token";

      (jwt.verify as any).mockReturnValue({
        id: "user-select-test",
        walletAddress: "0xtest",
        role: "USER",
      });

      (prisma.user.findUnique as any).mockResolvedValue({
        id: "user-select-test",
        walletAddress: "0xtest",
        role: "USER",
        createdAt: new Date(),
      });

      await authenticatedBro(mockReq, mockRes, mockNext);

      const selectArg = (prisma.user.findUnique as any).mock.calls[0][0].select;
      expect(selectArg).toEqual({
        id: true,
        walletAddress: true,
        role: true,
        createdAt: true,
      });
      expect(Object.keys(selectArg)).toHaveLength(4);
    });
  });

  describe("Prisma Call Optimization Branch", () => {
    it("Should not call prisma when token is missing (optimization check)", async () => {
      mockReq.headers.authorization = "Bearer";

      await authenticatedBro(mockReq, mockRes, mockNext);

      expect(prisma.user.findUnique).not.toHaveBeenCalled();
      expect(mockRes.sendStatus).toHaveBeenCalledWith(401);
    });

    it("Should not call prisma when jwt.verify fails (optimization check)", async () => {
      mockReq.headers.authorization = "Bearer badtoken";

      (jwt.verify as any).mockImplementation(() => {
        throw new Error("Bad token");
      });

      await authenticatedBro(mockReq, mockRes, mockNext);

      expect(prisma.user.findUnique).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(401);
    });
  });

  describe("Response Shape Stability (Frontend Contract)", () => {
    it("Should always return same error shape for 401 with message", async () => {
      mockReq.headers.authorization = "Bearer validtoken";

      (jwt.verify as any).mockReturnValue({
        id: "test",
        walletAddress: "0x",
        role: "USER",
      });
      (prisma.user.findUnique as any).mockResolvedValue(null);

      await authenticatedBro(mockReq, mockRes, mockNext);

      const errorResponse = mockRes.send.mock.calls[0][0];
      expect(errorResponse).toHaveProperty("error");
      expect(typeof errorResponse.error).toBe("string");
    });

    it("Should use consistent status codes across branches", async () => {
      const testCases = [
        {
          setup: () => {
            mockReq.headers = {};
          },
          expectedStatus: 401,
          desc: "missing header",
        },
        {
          setup: () => {
            mockReq.headers.authorization = "Bearer token";
            (jwt.verify as any).mockImplementation(() => {
              throw new Error("error");
            });
          },
          expectedStatus: 401,
          desc: "jwt error",
        },
        {
          setup: async () => {
            mockReq.headers.authorization = "Bearer token";
            (jwt.verify as any).mockReturnValue({
              id: "x",
              walletAddress: "0x",
              role: "USER",
            });
            (prisma.user.findUnique as any).mockResolvedValue(null);
          },
          expectedStatus: 401,
          desc: "user not found",
        },
      ];

      for (const testCase of testCases) {
        vi.clearAllMocks();
        mockReq = { headers: {} };
        mockRes = {
          sendStatus: vi.fn().mockReturnThis(),
          status: vi.fn().mockReturnThis(),
          send: vi.fn().mockReturnThis(),
        };
        mockNext = vi.fn();

        await testCase.setup();
        await authenticatedBro(mockReq, mockRes, mockNext);

        const statusCalled =
          mockRes.status.mock.calls.length > 0
            ? mockRes.status.mock.calls[0][0]
            : mockRes.sendStatus.mock.calls[0]?.[0];

        expect(statusCalled).toBe(testCase.expectedStatus);
      }
    });
  });
});

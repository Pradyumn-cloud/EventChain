import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
import { beforeEach, describe, expect, it, vi } from "vitest";
import authRouter from "../src/auth/auth.js";
import { prisma } from "@repo/db";

const app = express();
app.use(express.json());
app.use("/auth", authRouter);

describe("White-box auth route tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /auth/me returns 401 when token is missing (covers !token branch)", async () => {
    const res = await request(app).get("/auth/me");

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Access token required");
  });

  it("GET /auth/me returns 403 for invalid JWT (covers JsonWebTokenError catch branch)", async () => {
    const res = await request(app)
      .get("/auth/me")
      .set("Authorization", "Bearer definitely-invalid-token");

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("Invalid or expired token");
  });

  it("GET /auth/me returns 404 when decoded user does not exist (covers !user branch)", async () => {
    const token = jwt.sign(
      { id: "missing-user", walletAddress: "0x0000000000000000000000000000000000000001", role: "USER" },
      "I want a gf",
      { expiresIn: "1h" },
    );

    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null as never);

    const res = await request(app)
      .get("/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: "missing-user" },
      select: { id: true, walletAddress: true, role: true, createdAt: true },
    });
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("User not found");
  });

  it("GET /auth/me returns 200 for valid token and existing user (covers success branch)", async () => {
    const token = jwt.sign(
      { id: "u1", walletAddress: "0x0000000000000000000000000000000000000001", role: "USER" },
      "I want a gf",
      { expiresIn: "1h" },
    );

    const mockedUser = {
      id: "u1",
      walletAddress: "0x0000000000000000000000000000000000000001",
      role: "USER",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    };

    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(mockedUser as never);

    const res = await request(app)
      .get("/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe("u1");
    expect(res.body.user.walletAddress).toBe(
      "0x0000000000000000000000000000000000000001",
    );
  });

  it("POST /auth/sign-up returns 409 when wallet already exists (covers existingUser branch)", async () => {
    const existing = {
      id: "u2",
      walletAddress: "0x0000000000000000000000000000000000000002",
      role: "USER",
    };

    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(existing as never);

    const res = await request(app).post("/auth/sign-up").send({
      walletAddress: "0x0000000000000000000000000000000000000002",
      role: "USER",
    });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe("Wallet address already registered");
  });

  it("POST /auth/sign-up returns 201 when wallet is new (covers create branch)", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null as never);
    vi.mocked(prisma.user.create).mockResolvedValueOnce({
      id: "u3",
      walletAddress: "0x0000000000000000000000000000000000000003",
      role: "ORGANIZER",
    } as never);

    const res = await request(app).post("/auth/sign-up").send({
      walletAddress: "0x0000000000000000000000000000000000000003",
      role: "ORGANIZER",
    });

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        walletAddress: "0x0000000000000000000000000000000000000003",
        role: "ORGANIZER",
      },
    });
    expect(res.status).toBe(201);
    expect(res.body.userId).toBe("u3");
  });
});

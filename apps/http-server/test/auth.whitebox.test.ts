import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import authRouter from "../src/auth/auth.js";

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
});

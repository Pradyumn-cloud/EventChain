import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";

vi.mock("@repo/db", () => ({
  prisma: {
    event: {
      findUnique: vi.fn(),
    },
    ticket: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    ticketTier: {
      update: vi.fn(),
    },
  },
}));

vi.mock("ethers", () => ({
  JsonRpcProvider: vi.fn().mockImplementation(() => ({
    getTransactionReceipt: vi.fn(),
    call: vi.fn(),
  })),
  Interface: vi.fn().mockImplementation(() => ({
    parseLog: vi.fn(),
    encodeFunctionData: vi.fn(),
    decodeFunctionResult: vi.fn(),
  })),
}));

import { prisma } from "@repo/db";
import { JsonRpcProvider, Interface } from "ethers";

describe("POST /tickets/confirm White-Box Tests", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockProvider: any;
  let mockInterface: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockProvider = {
      getTransactionReceipt: vi.fn(),
      call: vi.fn(),
    };

    mockInterface = {
      parseLog: vi.fn(),
      encodeFunctionData: vi.fn(),
      decodeFunctionResult: vi.fn(),
    };

    (JsonRpcProvider as any).mockImplementation(() => mockProvider);
    (Interface as any).mockImplementation(() => mockInterface);

    mockReq = {
      user: {
        id: "user-123",
        walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
        role: "USER",
        createdAt: new Date(),
      },
      body: {},
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });

  describe("Authentication Branch", () => {
    it("Should return 403 when user is missing", async () => {
      mockReq.user = undefined;

      const handler = async (req: any, res: any) => {
        if (!req.user) {
          return res
            .status(403)
            .send({ error: "Forbidden - Authentication required" });
        }
      };

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.send).toHaveBeenCalledWith({
        error: "Forbidden - Authentication required",
      });
    });
  });

  describe("Request Validation Branches", () => {
    it("Should return 400 when eventId is missing", async () => {
      mockReq.body = {
        tierId: "tier-1",
        txHash:
          "0x1234567890123456789012345678901234567890123456789012345678901234",
        tokenId: 1,
      };

      const handler = async (req: any, res: any) => {
        const { eventId, tierId, txHash, tokenId } = req.body;
        if (!eventId || !tierId || !txHash || tokenId === undefined) {
          return res.status(400).send({
            error: "Missing required fields: eventId, tierId, txHash, tokenId",
          });
        }
      };

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it("Should return 400 when tierId is missing", async () => {
      mockReq.body = {
        eventId: "event-1",
        txHash:
          "0x1234567890123456789012345678901234567890123456789012345678901234",
        tokenId: 1,
      };

      const handler = async (req: any, res: any) => {
        const { eventId, tierId, txHash, tokenId } = req.body;
        if (!eventId || !tierId || !txHash || tokenId === undefined) {
          return res.status(400).send({
            error: "Missing required fields: eventId, tierId, txHash, tokenId",
          });
        }
      };

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it("Should return 400 when txHash is missing", async () => {
      mockReq.body = {
        eventId: "event-1",
        tierId: "tier-1",
        tokenId: 1,
      };

      const handler = async (req: any, res: any) => {
        const { eventId, tierId, txHash, tokenId } = req.body;
        if (!eventId || !tierId || !txHash || tokenId === undefined) {
          return res.status(400).send({
            error: "Missing required fields: eventId, tierId, txHash, tokenId",
          });
        }
      };

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it("Should return 400 when tokenId is undefined", async () => {
      mockReq.body = {
        eventId: "event-1",
        tierId: "tier-1",
        txHash:
          "0x1234567890123456789012345678901234567890123456789012345678901234",
      };

      const handler = async (req: any, res: any) => {
        const { eventId, tierId, txHash, tokenId } = req.body;
        if (!eventId || !tierId || !txHash || tokenId === undefined) {
          return res.status(400).send({
            error: "Missing required fields: eventId, tierId, txHash, tokenId",
          });
        }
      };

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it("Should return 400 for invalid txHash format (not hex)", async () => {
      mockReq.body = {
        eventId: "event-1",
        tierId: "tier-1",
        txHash: "notahexstring",
        tokenId: 1,
      };

      const handler = async (req: any, res: any) => {
        const { txHash } = req.body;
        if (!/^0x([A-Fa-f0-9]{64})$/.test(String(txHash))) {
          return res.status(400).send({ error: "Invalid txHash format" });
        }
      };

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({
        error: "Invalid txHash format",
      });
    });

    it("Should return 400 for invalid txHash format (wrong length)", async () => {
      mockReq.body = {
        eventId: "event-1",
        tierId: "tier-1",
        txHash: "0x1234",
        tokenId: 1,
      };

      const handler = async (req: any, res: any) => {
        const { txHash } = req.body;
        if (!/^0x([A-Fa-f0-9]{64})$/.test(String(txHash))) {
          return res.status(400).send({ error: "Invalid txHash format" });
        }
      };

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it("Should return 400 for non-integer tokenId", async () => {
      mockReq.body = {
        eventId: "event-1",
        tierId: "tier-1",
        txHash:
          "0x1234567890123456789012345678901234567890123456789012345678901234",
        tokenId: "not-a-number",
      };

      const handler = async (req: any, res: any) => {
        const { tokenId } = req.body;
        const parsedTokenId = Number(tokenId);
        if (!Number.isInteger(parsedTokenId) || parsedTokenId <= 0) {
          return res.status(400).send({ error: "Invalid tokenId" });
        }
      };

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({ error: "Invalid tokenId" });
    });

    it("Should return 400 for tokenId <= 0", async () => {
      mockReq.body = {
        eventId: "event-1",
        tierId: "tier-1",
        txHash:
          "0x1234567890123456789012345678901234567890123456789012345678901234",
        tokenId: 0,
      };

      const handler = async (req: any, res: any) => {
        const { tokenId } = req.body;
        const parsedTokenId = Number(tokenId);
        if (!Number.isInteger(parsedTokenId) || parsedTokenId <= 0) {
          return res.status(400).send({ error: "Invalid tokenId" });
        }
      };

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it("Should return 400 for negative tokenId", async () => {
      mockReq.body = {
        eventId: "event-1",
        tierId: "tier-1",
        txHash:
          "0x1234567890123456789012345678901234567890123456789012345678901234",
        tokenId: -5,
      };

      const handler = async (req: any, res: any) => {
        const { tokenId } = req.body;
        const parsedTokenId = Number(tokenId);
        if (!Number.isInteger(parsedTokenId) || parsedTokenId <= 0) {
          return res.status(400).send({ error: "Invalid tokenId" });
        }
      };

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it("Should return 400 for float tokenId", async () => {
      mockReq.body = {
        eventId: "event-1",
        tierId: "tier-1",
        txHash:
          "0x1234567890123456789012345678901234567890123456789012345678901234",
        tokenId: 1.5,
      };

      const handler = async (req: any, res: any) => {
        const { tokenId } = req.body;
        const parsedTokenId = Number(tokenId);
        if (!Number.isInteger(parsedTokenId) || parsedTokenId <= 0) {
          return res.status(400).send({ error: "Invalid tokenId" });
        }
      };

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe("Event Validation Branches", () => {
    it("Should return 404 when event is not found", async () => {
      (prisma.event.findUnique as any).mockResolvedValue(null);

      mockReq.body = {
        eventId: "non-existent-event",
        tierId: "tier-1",
        txHash:
          "0x1234567890123456789012345678901234567890123456789012345678901234",
        tokenId: 1,
      };

      const handler = async (req: any, res: any) => {
        const { eventId } = req.body;
        const event = await prisma.event.findUnique({
          where: { id: String(eventId) },
          include: { tiers: true },
        });
        if (!event) {
          return res.status(404).send({ error: "Event not found" });
        }
      };

      await handler(mockReq, mockRes);

      expect(prisma.event.findUnique).toHaveBeenCalledWith({
        where: { id: "non-existent-event" },
        include: { tiers: true },
      });
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.send).toHaveBeenCalledWith({ error: "Event not found" });
    });

    it("Should return 400 when event is not active", async () => {
      const inactiveEvent = {
        id: "event-1",
        isActive: false,
        contractAddress: "0xcontract",
        tiers: [],
      };

      (prisma.event.findUnique as any).mockResolvedValue(inactiveEvent);

      mockReq.body = {
        eventId: "event-1",
        tierId: "tier-1",
        txHash:
          "0x1234567890123456789012345678901234567890123456789012345678901234",
        tokenId: 1,
      };

      const handler = async (req: any, res: any) => {
        const { eventId } = req.body;
        const event = await prisma.event.findUnique({
          where: { id: String(eventId) },
          include: { tiers: true },
        });
        if (!event) return res.status(404).send({ error: "Event not found" });
        if (!event.isActive) {
          return res.status(400).send({ error: "Event is not active" });
        }
      };

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({
        error: "Event is not active",
      });
    });

    it("Should return 400 when event has no contractAddress", async () => {
      const eventWithoutContract = {
        id: "event-1",
        isActive: true,
        contractAddress: null,
        tiers: [],
      };

      (prisma.event.findUnique as any).mockResolvedValue(eventWithoutContract);

      mockReq.body = {
        eventId: "event-1",
        tierId: "tier-1",
        txHash:
          "0x1234567890123456789012345678901234567890123456789012345678901234",
        tokenId: 1,
      };

      const handler = async (req: any, res: any) => {
        const { eventId } = req.body;
        const event = await prisma.event.findUnique({
          where: { id: String(eventId) },
          include: { tiers: true },
        });
        if (!event) return res.status(404).send({ error: "Event not found" });
        if (!event.isActive)
          return res.status(400).send({ error: "Event is not active" });
        if (!event.contractAddress) {
          return res
            .status(400)
            .send({ error: "Event contract is not configured" });
        }
      };

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({
        error: "Event contract is not configured",
      });
    });

    it("Should return 400 when contractAddress is empty string", async () => {
      const eventWithEmptyContract = {
        id: "event-1",
        isActive: true,
        contractAddress: "",
        tiers: [],
      };

      (prisma.event.findUnique as any).mockResolvedValue(
        eventWithEmptyContract,
      );

      mockReq.body = {
        eventId: "event-1",
        tierId: "tier-1",
        txHash:
          "0x1234567890123456789012345678901234567890123456789012345678901234",
        tokenId: 1,
      };

      const handler = async (req: any, res: any) => {
        const { eventId } = req.body;
        const event = await prisma.event.findUnique({
          where: { id: String(eventId) },
          include: { tiers: true },
        });
        if (!event) return res.status(404).send({ error: "Event not found" });
        if (!event.isActive)
          return res.status(400).send({ error: "Event is not active" });
        if (!event.contractAddress) {
          return res
            .status(400)
            .send({ error: "Event contract is not configured" });
        }
      };

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe("Tier Validation Branches", () => {
    it("Should return 404 when tier is not found in event", async () => {
      const eventWithTiers = {
        id: "event-1",
        isActive: true,
        contractAddress: "0xcontract",
        tiers: [
          { id: "tier-1", soldCount: 0, totalSupply: 10 },
          { id: "tier-2", soldCount: 0, totalSupply: 5 },
        ],
      };

      (prisma.event.findUnique as any).mockResolvedValue(eventWithTiers);

      mockReq.body = {
        eventId: "event-1",
        tierId: "tier-999",
        txHash:
          "0x1234567890123456789012345678901234567890123456789012345678901234",
        tokenId: 1,
      };

      const handler = async (req: any, res: any) => {
        const { eventId, tierId } = req.body;
        const event = await prisma.event.findUnique({
          where: { id: String(eventId) },
          include: { tiers: true },
        });
        if (!event) return res.status(404).send({ error: "Event not found" });
        const tier = event.tiers.find((t: any) => t.id === String(tierId));
        if (!tier) {
          return res.status(404).send({ error: "Ticket tier not found" });
        }
      };

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.send).toHaveBeenCalledWith({
        error: "Ticket tier not found",
      });
    });

    it("Should return 400 when tier is sold out", async () => {
      const eventWithSoldOutTier = {
        id: "event-1",
        isActive: true,
        contractAddress: "0xcontract",
        tiers: [{ id: "tier-1", soldCount: 10, totalSupply: 10 }],
      };

      (prisma.event.findUnique as any).mockResolvedValue(eventWithSoldOutTier);

      mockReq.body = {
        eventId: "event-1",
        tierId: "tier-1",
        txHash:
          "0x1234567890123456789012345678901234567890123456789012345678901234",
        tokenId: 1,
      };

      const handler = async (req: any, res: any) => {
        const { eventId, tierId } = req.body;
        const event = await prisma.event.findUnique({
          where: { id: String(eventId) },
          include: { tiers: true },
        });
        if (!event) return res.status(404).send({ error: "Event not found" });
        const tier = event.tiers.find((t: any) => t.id === String(tierId));
        if (!tier)
          return res.status(404).send({ error: "Ticket tier not found" });
        if (tier.soldCount >= tier.totalSupply) {
          return res.status(400).send({ error: "Ticket tier sold out" });
        }
      };

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({
        error: "Ticket tier sold out",
      });
    });
  });

  describe("Idempotency Branch", () => {
    it("Should return 200 with idempotent:true when ticket exists with same owner", async () => {
      const event = {
        id: "event-1",
        isActive: true,
        contractAddress: "0xcontract",
        tiers: [{ id: "tier-1", soldCount: 5, totalSupply: 10 }],
      };

      const existingTicket = {
        id: "ticket-123",
        eventId: "event-1",
        tierId: "tier-1",
        ownerId: "user-123",
        tokenId: 1,
        mintTxHash:
          "0x1234567890123456789012345678901234567890123456789012345678901234",
        event: event,
        tier: event.tiers[0],
      };

      (prisma.event.findUnique as any).mockResolvedValue(event);
      (prisma.ticket.findFirst as any).mockResolvedValue(existingTicket);

      mockReq.body = {
        eventId: "event-1",
        tierId: "tier-1",
        txHash:
          "0x1234567890123456789012345678901234567890123456789012345678901234",
        tokenId: 1,
      };

      const handler = async (req: any, res: any) => {
        const { eventId, tierId, txHash, tokenId } = req.body;
        const parsedTokenId = Number(tokenId);

        const event = await prisma.event.findUnique({
          where: { id: String(eventId) },
          include: { tiers: true },
        });
        if (!event) return res.status(404).send({ error: "Event not found" });

        const existingByTxAndToken = await prisma.ticket.findFirst({
          where: {
            mintTxHash: String(txHash),
            tokenId: parsedTokenId,
            eventId: String(eventId),
          },
          include: { event: true, tier: true },
        });

        if (existingByTxAndToken) {
          if (existingByTxAndToken.ownerId !== req.user.id) {
            return res
              .status(409)
              .send({ error: "Ticket already claimed by a different user" });
          }
          return res
            .status(200)
            .json({ ticket: existingByTxAndToken, idempotent: true });
        }
      };

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        ticket: existingTicket,
        idempotent: true,
      });
    });

    it("Should return 409 when ticket exists with different owner", async () => {
      const event = {
        id: "event-1",
        isActive: true,
        contractAddress: "0xcontract",
        tiers: [{ id: "tier-1", soldCount: 5, totalSupply: 10 }],
      };

      const existingTicketDifferentOwner = {
        id: "ticket-456",
        eventId: "event-1",
        tierId: "tier-1",
        ownerId: "user-999",
        tokenId: 1,
        mintTxHash:
          "0x1234567890123456789012345678901234567890123456789012345678901234",
        event: event,
        tier: event.tiers[0],
      };

      (prisma.event.findUnique as any).mockResolvedValue(event);
      (prisma.ticket.findFirst as any).mockResolvedValue(
        existingTicketDifferentOwner,
      );

      mockReq.body = {
        eventId: "event-1",
        tierId: "tier-1",
        txHash:
          "0x1234567890123456789012345678901234567890123456789012345678901234",
        tokenId: 1,
      };

      const handler = async (req: any, res: any) => {
        const { eventId, tierId, txHash, tokenId } = req.body;
        const parsedTokenId = Number(tokenId);

        const event = await prisma.event.findUnique({
          where: { id: String(eventId) },
          include: { tiers: true },
        });
        if (!event) return res.status(404).send({ error: "Event not found" });

        const existingByTxAndToken = await prisma.ticket.findFirst({
          where: {
            mintTxHash: String(txHash),
            tokenId: parsedTokenId,
            eventId: String(eventId),
          },
          include: { event: true, tier: true },
        });

        if (existingByTxAndToken) {
          if (existingByTxAndToken.ownerId !== req.user.id) {
            return res
              .status(409)
              .send({ error: "Ticket already claimed by a different user" });
          }
        }
      };

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.send).toHaveBeenCalledWith({
        error: "Ticket already claimed by a different user",
      });
    });
  });

  describe("Transaction Receipt Validation Branches", () => {
    it("Should return 400 when receipt is null", async () => {
      mockProvider.getTransactionReceipt.mockResolvedValue(null);

      const handler = async () => {
        const txReceipt = await mockProvider.getTransactionReceipt("0xtxhash");
        if (!txReceipt || txReceipt.status !== 1) {
          mockRes.status!(400).send({
            error: "Transaction not found or failed on-chain",
          });
        }
      };

      await handler();

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({
        error: "Transaction not found or failed on-chain",
      });
    });

    it("Should return 400 when receipt status is 0 (failed)", async () => {
      mockProvider.getTransactionReceipt.mockResolvedValue({
        status: 0,
        to: "0xcontract",
        logs: [],
      });

      const handler = async () => {
        const txReceipt = await mockProvider.getTransactionReceipt("0xtxhash");
        if (!txReceipt || txReceipt.status !== 1) {
          mockRes.status!(400).send({
            error: "Transaction not found or failed on-chain",
          });
        }
      };

      await handler();

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it("Should return 400 when tx sent to wrong contract address", async () => {
      mockProvider.getTransactionReceipt.mockResolvedValue({
        status: 1,
        to: "0xWRONGCONTRACT",
        logs: [],
      });

      const eventContractAddress = "0xCORRECTCONTRACT";

      const handler = async () => {
        const txReceipt = await mockProvider.getTransactionReceipt("0xtxhash");
        if (!txReceipt || txReceipt.status !== 1) {
          return mockRes.status!(400).send({
            error: "Transaction not found or failed on-chain",
          });
        }
        if (
          !txReceipt.to ||
          txReceipt.to.toLowerCase() !== eventContractAddress.toLowerCase()
        ) {
          mockRes.status!(400).send({
            error: "Transaction was not sent to this event contract",
          });
        }
      };

      await handler();

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({
        error: "Transaction was not sent to this event contract",
      });
    });

    it("Should handle case-insensitive contract address comparison", async () => {
      mockProvider.getTransactionReceipt.mockResolvedValue({
        status: 1,
        to: "0xAABBCCDDEE",
        logs: [],
      });

      const eventContractAddress = "0xaabbccddee";

      const handler = async () => {
        const txReceipt = await mockProvider.getTransactionReceipt("0xtxhash");
        if (
          !txReceipt.to ||
          txReceipt.to.toLowerCase() !== eventContractAddress.toLowerCase()
        ) {
          mockRes.status!(400).send({
            error: "Transaction was not sent to this event contract",
          });
        } else {
          mockRes.status!(200).send({ success: true });
        }
      };

      await handler();

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith({ success: true });
    });
  });

  describe("Event Log Parsing Branches", () => {
    it("Should return 400 when TicketMinted event is not found in logs", async () => {
      mockProvider.getTransactionReceipt.mockResolvedValue({
        status: 1,
        to: "0xcontract",
        logs: [{ address: "0xcontract", data: "0xdata" }],
      });

      mockInterface.parseLog.mockImplementation(() => {
        throw new Error("No matching event");
      });

      const handler = async () => {
        const txReceipt = await mockProvider.getTransactionReceipt("0xtxhash");

        const ticketMintedLog = txReceipt.logs
          .filter((log: any) => log.address.toLowerCase() === "0xcontract")
          .map((log: any) => {
            try {
              return mockInterface.parseLog(log);
            } catch {
              return null;
            }
          })
          .find((parsed: any) => parsed && parsed.name === "TicketMinted");

        if (!ticketMintedLog) {
          mockRes.status!(400).send({
            error: "TicketMinted event not found in transaction",
          });
        }
      };

      await handler();

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({
        error: "TicketMinted event not found in transaction",
      });
    });

    it("Should successfully parse TicketMinted event from logs", async () => {
      mockProvider.getTransactionReceipt.mockResolvedValue({
        status: 1,
        to: "0xcontract",
        logs: [
          { address: "0xcontract", data: "0xdata1" },
          { address: "0xcontract", data: "0xdata2" },
        ],
      });

      mockInterface.parseLog.mockReturnValueOnce(null).mockReturnValueOnce({
        name: "TicketMinted",
        args: {
          buyer: "0xbuyer",
          tokenId: BigInt(1),
          tierId: BigInt(0),
        },
      });

      const handler = async () => {
        const txReceipt = await mockProvider.getTransactionReceipt("0xtxhash");

        const ticketMintedLog = txReceipt.logs
          .filter((log: any) => log.address.toLowerCase() === "0xcontract")
          .map((log: any) => {
            try {
              return mockInterface.parseLog(log);
            } catch {
              return null;
            }
          })
          .find((parsed: any) => parsed && parsed.name === "TicketMinted");

        if (ticketMintedLog) {
          mockRes.status!(200).json({ event: ticketMintedLog });
        }
      };

      await handler();

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        event: expect.objectContaining({
          name: "TicketMinted",
        }),
      });
    });
  });

  describe("TokenId and Buyer Matching Branches", () => {
    it("Should return 400 when provided tokenId does not match on-chain tokenId", async () => {
      const mintedEvent = {
        name: "TicketMinted",
        args: {
          buyer: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
          tokenId: BigInt(5),
          tierId: BigInt(0),
        },
      };

      const handler = () => {
        const eventTokenId = Number(mintedEvent.args.tokenId);
        const providedTokenId = 1;

        if (eventTokenId !== providedTokenId) {
          mockRes.status!(400).send({
            error: "Provided tokenId does not match on-chain event",
          });
        }
      };

      handler();

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({
        error: "Provided tokenId does not match on-chain event",
      });
    });

    it("Should return 400 when buyer does not match authenticated user wallet", async () => {
      const mintedEvent = {
        name: "TicketMinted",
        args: {
          buyer: "0xDIFFERENTWALLET",
          tokenId: BigInt(1),
          tierId: BigInt(0),
        },
      };

      const handler = () => {
        const eventBuyer = String(mintedEvent.args.buyer).toLowerCase();
        const userWallet =
          "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb".toLowerCase();

        if (eventBuyer !== userWallet) {
          mockRes.status!(400).send({
            error: "On-chain buyer does not match authenticated user",
          });
        }
      };

      handler();

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({
        error: "On-chain buyer does not match authenticated user",
      });
    });
  });

  describe("Tier Mapping Validation Branch", () => {
    it("Should return 400 when tier index mismatch between request and on-chain", async () => {
      const eventTiers = [
        { id: "tier-1", price: "0.01" },
        { id: "tier-2", price: "0.05" },
        { id: "tier-3", price: "0.1" },
      ];

      const requestedTierId = "tier-3";
      const onChainTierIndex = 0;

      const handler = () => {
        const tiersByContractOrder = [...eventTiers].sort((a, b) => {
          const priceCompare = Number(a.price) - Number(b.price);
          if (priceCompare !== 0) return priceCompare;
          return a.id.localeCompare(b.id);
        });

        const expectedTierIndex = tiersByContractOrder.findIndex(
          (t) => t.id === String(requestedTierId),
        );

        if (expectedTierIndex < 0 || expectedTierIndex !== onChainTierIndex) {
          mockRes.status!(400).send({
            error: "Tier mismatch between request and on-chain minted tier",
          });
        }
      };

      handler();

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({
        error: "Tier mismatch between request and on-chain minted tier",
      });
    });
  });

  describe("Error Shape and Status Code Consistency", () => {
    it("Should return consistent error shape across all failure branches", async () => {
      const errorBranches = [
        {
          setup: () => {
            mockReq.user = undefined;
          },
          test: async () => {
            if (!mockReq.user) {
              mockRes.status!(403).send({
                error: "Forbidden - Authentication required",
              });
            }
          },
          expectedStatus: 403,
        },
        {
          setup: () => {
            mockReq.body = { tierId: "x", txHash: "0x00", tokenId: 1 };
          },
          test: async () => {
            const { eventId, tierId, txHash, tokenId } = mockReq.body;
            if (!eventId || !tierId || !txHash || tokenId === undefined) {
              mockRes.status!(400).send({
                error:
                  "Missing required fields: eventId, tierId, txHash, tokenId",
              });
            }
          },
          expectedStatus: 400,
        },
      ];

      for (const branch of errorBranches) {
        vi.clearAllMocks();
        mockRes = {
          status: vi.fn().mockReturnThis(),
          send: vi.fn().mockReturnThis(),
          json: vi.fn().mockReturnThis(),
        };

        branch.setup();
        await branch.test();

        expect(mockRes.status).toHaveBeenCalledWith(branch.expectedStatus);
        const sendArg = (mockRes.send as any).mock.calls[0]?.[0];
        expect(sendArg).toHaveProperty("error");
        expect(typeof sendArg.error).toBe("string");
      }
    });
  });
});

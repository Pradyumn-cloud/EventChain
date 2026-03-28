import { Router } from "express";
import { prisma } from "@repo/db";
import { authenticatedBro } from "../middleware.js";
import { Interface, JsonRpcProvider } from "ethers";

const router = Router();
const provider = new JsonRpcProvider(
  process.env.RPC_URL || "http://127.0.0.1:8545",
);

const TICKET_MINTED_EVENT_INTERFACE = new Interface([
  "event TicketMinted(address indexed buyer, uint256 indexed tokenId, uint256 indexed tierId)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function getTicketTier(uint256 tokenId) view returns (uint256)",
]);

router.get("/", authenticatedBro, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res
        .status(403)
        .send({ error: "Forbidden - Authentication required" });
    }
    const tickets = await prisma.ticket.findMany({
      where: { ownerId: user.id },
      include: {
        event: true,
        tier: true,
      },
      orderBy: { purchasedAt: "desc" },
    });

    res.json({ tickets });
  } catch (error: any) {
    console.error(error, "In GET /tickets/");
    res.status(500).send({ error: error.message || "Internal server error" });
  }
});

router.get("/:id/qr", authenticatedBro, async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    if (!user) {
      return res
        .status(403)
        .send({ error: "Forbidden - Authentication required" });
    }
    const ticket = await prisma.ticket.findUnique({
      where: { id: String(id) },
      include: { event: true },
    });

    if (!ticket) {
      return res.status(404).send({ error: "Ticket not found" });
    }
    if (ticket.ownerId !== user.id) {
      return res
        .status(403)
        .send({ error: "You can only view QR for your own tickets" });
    }
    if (ticket.status !== "VALID") {
      return res
        .status(400)
        .send({ error: "Ticket is not valid - already used or expired" });
    }

    const timestamp = Date.now();
    const expiresAt = timestamp + 60 * 1000 * 60 * 12; //12hrs
    const crypto = await import("crypto");
    const qrSecret = ticket.qrCodeSecret;
    const dataToSign = `${ticket.id}-${ticket.tokenId}-${timestamp}`;
    const signature = crypto
      .createHmac("sha256", qrSecret)
      .update(dataToSign)
      .digest("hex");

    const qrData = {
      ticketId: ticket.id,
      tokenId: ticket.tokenId,
      timestamp,
      signature,
    };

    res.json({
      qrData: JSON.stringify(qrData),
      expiresAt,
      ticket: {
        id: ticket.id,
        eventTitle: ticket.event.title,
        venue: ticket.event.venue,
        startTime: ticket.event.startTime,
      },
    });
  } catch (error: any) {
    console.error(error, "In GET /tickets/:id/qr");
    res.status(500).send({ error: error.message || "Internal server error" });
  }
});

router.post("/confirm", authenticatedBro, async (req, res) => {
  try {
    const user = req.user;
    const { eventId, tierId, txHash, tokenId } = req.body;

    if (!user) {
      return res
        .status(403)
        .send({ error: "Forbidden - Authentication required" });
    }

    if (!eventId || !tierId || !txHash || tokenId === undefined) {
      return res.status(400).send({
        error: "Missing required fields: eventId, tierId, txHash, tokenId",
      });
    }

    if (!/^0x([A-Fa-f0-9]{64})$/.test(String(txHash))) {
      return res.status(400).send({ error: "Invalid txHash format" });
    }

    const parsedTokenId = Number(tokenId);
    if (!Number.isInteger(parsedTokenId) || parsedTokenId <= 0) {
      return res.status(400).send({ error: "Invalid tokenId" });
    }

    const event = await prisma.event.findUnique({
      where: { id: String(eventId) },
      include: { tiers: true },
    });
    if (!event) {
      return res.status(404).send({ error: "Event not found" });
    }

    if (!event.isActive) {
      return res.status(400).send({ error: "Event is not active" });
    }

    if (!event.contractAddress) {
      return res
        .status(400)
        .send({ error: "Event contract is not configured" });
    }

    const tier = event.tiers.find((t: any) => t.id === String(tierId));
    if (!tier) {
      return res.status(404).send({ error: "Ticket tier not found" });
    }

    if (tier.soldCount >= tier.totalSupply) {
      return res.status(400).send({ error: "Ticket tier sold out" });
    }

    const existingByTxAndToken = await prisma.ticket.findFirst({
      where: {
        mintTxHash: String(txHash),
        tokenId: parsedTokenId,
        eventId: String(eventId),
      },
      include: {
        event: true,
        tier: true,
      },
    });

    if (existingByTxAndToken) {
      if (existingByTxAndToken.ownerId !== user.id) {
        return res
          .status(409)
          .send({ error: "Ticket already claimed by a different user" });
      }
      return res.status(200).json({
        ticket: existingByTxAndToken,
        idempotent: true,
      });
    }

    const txReceipt = await provider.getTransactionReceipt(String(txHash));
    if (!txReceipt || txReceipt.status !== 1) {
      return res
        .status(400)
        .send({ error: "Transaction not found or failed on-chain" });
    }

    if (
      !txReceipt.to ||
      txReceipt.to.toLowerCase() !== event.contractAddress.toLowerCase()
    ) {
      return res
        .status(400)
        .send({ error: "Transaction was not sent to this event contract" });
    }

    const ticketMintedLog = txReceipt.logs
      .filter(
        (log) =>
          log.address.toLowerCase() === event.contractAddress!.toLowerCase(),
      )
      .map((log) => {
        try {
          return TICKET_MINTED_EVENT_INTERFACE.parseLog(log);
        } catch {
          return null;
        }
      })
      .find((parsed) => parsed && parsed.name === "TicketMinted");

    if (!ticketMintedLog) {
      return res
        .status(400)
        .send({ error: "TicketMinted event not found in transaction" });
    }

    const eventBuyer = String(ticketMintedLog.args.buyer).toLowerCase();
    const eventTokenId = Number(ticketMintedLog.args.tokenId);
    const eventTierIndex = Number(ticketMintedLog.args.tierId);

    if (eventTokenId !== parsedTokenId) {
      return res
        .status(400)
        .send({ error: "Provided tokenId does not match on-chain event" });
    }

    if (eventBuyer !== user.walletAddress.toLowerCase()) {
      return res
        .status(400)
        .send({ error: "On-chain buyer does not match authenticated user" });
    }

    const tiersByContractOrder = [...event.tiers].sort((a, b) => {
      const priceCompare = Number(a.price) - Number(b.price);
      if (priceCompare !== 0) return priceCompare;
      return a.id.localeCompare(b.id);
    });
    const expectedTierIndex = tiersByContractOrder.findIndex(
      (t) => t.id === String(tierId),
    );

    if (expectedTierIndex < 0 || expectedTierIndex !== eventTierIndex) {
      return res.status(400).send({
        error: "Tier mismatch between request and on-chain minted tier",
      });
    }

    const ownerOfTokenRaw = await provider.call({
      to: event.contractAddress,
      data: TICKET_MINTED_EVENT_INTERFACE.encodeFunctionData("ownerOf", [
        parsedTokenId,
      ]),
    });
    const [ownerOfToken] = TICKET_MINTED_EVENT_INTERFACE.decodeFunctionResult(
      "ownerOf",
      ownerOfTokenRaw,
    );

    if (
      String(ownerOfToken).toLowerCase() !== user.walletAddress.toLowerCase()
    ) {
      return res
        .status(400)
        .send({ error: "Authenticated wallet is not current on-chain owner" });
    }

    const onChainTierRaw = await provider.call({
      to: event.contractAddress,
      data: TICKET_MINTED_EVENT_INTERFACE.encodeFunctionData("getTicketTier", [
        parsedTokenId,
      ]),
    });
    const [onChainTier] = TICKET_MINTED_EVENT_INTERFACE.decodeFunctionResult(
      "getTicketTier",
      onChainTierRaw,
    );

    if (Number(onChainTier) !== expectedTierIndex) {
      return res
        .status(400)
        .send({ error: "On-chain tier does not match selected tier" });
    }

    const existingTicket = await prisma.ticket.findFirst({
      where: {
        eventId: String(eventId),
        tokenId: parsedTokenId,
      },
    });

    if (existingTicket) {
      return res
        .status(400)
        .send({ error: "Ticket with this tokenId already exists" });
    }

    const ticket = await prisma.ticket.create({
      data: {
        eventId: String(eventId),
        tierId: String(tierId),
        ownerId: user.id,
        tokenId: parsedTokenId,
        status: "VALID",
        mintTxHash: String(txHash),
      },
      include: {
        event: true,
        tier: true,
      },
    });

    await prisma.ticketTier.update({
      where: { id: String(tierId) },
      data: { soldCount: { increment: 1 } },
    });

    res.status(201).json({ ticket });
  } catch (error: any) {
    console.error(error, "In POST /tickets/confirm");
    res.status(500).send({ error: error.message || "Internal server error" });
  }
});

router.post("/:id/verify", authenticatedBro, async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { qrData } = req.body;

    if (!user || user.role !== "ORGANIZER") {
      return res.status(403).send({ error: "Forbidden - Organizer only" });
    }

    if (!qrData) {
      return res.status(400).send({ error: "qrData is required" });
    }

    let parsedQrData;
    try {
      parsedQrData = JSON.parse(qrData);
    } catch (err) {
      return res.status(400).send({ error: "Invalid QR data format" });
    }

    const { ticketId, tokenId, timestamp, signature } = parsedQrData;

    if (!ticketId || !tokenId || !timestamp || !signature) {
      return res
        .status(400)
        .send({ error: "Invalid QR data - missing fields" });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: String(ticketId) },
      include: { event: true, tier: true, owner: true },
    });

    if (!ticket) {
      return res.status(404).send({ error: "Ticket not found" });
    }

    if (ticket.event.organizerId !== user.id) {
      return res
        .status(403)
        .send({ error: "You can only verify tickets for your own events" });
    }

    const crypto = await import("crypto");
    const dataToSign = `${ticketId}-${tokenId}-${timestamp}`;
    const expectedSignature = crypto
      .createHmac("sha256", ticket.qrCodeSecret)
      .update(dataToSign)
      .digest("hex");

    if (signature !== expectedSignature) {
      return res.status(400).send({ error: "Invalid QR signature" });
    }

    const now = Date.now();
    if (now - timestamp > 60000) {
      return res.status(400).send({ error: "QR code has expired" });
    }

    if (ticket.status === "USED") {
      return res.status(400).send({
        error: "Ticket already used",
        usedAt: ticket.usedAt,
      });
    }
    const updatedTicket = await prisma.ticket.update({
      where: { id: String(ticketId) },
      data: {
        status: "USED",
        usedAt: new Date(),
      },
      include: { event: true, tier: true, owner: true },
    });

    res.json({
      valid: true,
      ticket: {
        id: updatedTicket.id,
        tokenId: updatedTicket.tokenId,
        tierName: updatedTicket.tier.name,
        ownerWallet: updatedTicket.owner.walletAddress,
        eventTitle: updatedTicket.event.title,
        usedAt: updatedTicket.usedAt,
      },
      message: "Ticket verified and marked as used",
    });
  } catch (error: any) {
    console.error(error, "In POST /tickets/:id/verify");
    res.status(500).send({ error: error.message || "Internal server error" });
  }
});

export default router;

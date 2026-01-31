import { Router } from "express";
import {prisma, User} from "@repo/db"
import { authenticatedBro} from "../middleware.js";

const router = Router();

router.get("/", authenticatedBro, async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(403).send({ error: "Forbidden - Authentication required" });
        }
        const tickets = await prisma.ticket.findMany({
            where: { ownerId: user.id },
            include: {
                event: true,
                tier: true
            },
            orderBy: { purchasedAt: 'desc' }
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
            return res.status(403).send({ error: "Forbidden - Authentication required" });
        }
        const ticket = await prisma.ticket.findUnique({
            where: { id: String(id) },
            include: { event: true }
        });
        
        if (!ticket) {
            return res.status(404).send({ error: "Ticket not found" });
        }
        if (ticket.ownerId !== user.id) {
            return res.status(403).send({ error: "You can only view QR for your own tickets" });
        }
        if (ticket.status !== 'VALID') {
            return res.status(400).send({ error: "Ticket is not valid - already used or expired" });
        }

        const timestamp = Date.now();
        const expiresAt = timestamp + (60 * 1000*60*12);//12hrs
        const crypto = await import('crypto');
        const qrSecret = ticket.qrCodeSecret;
        const dataToSign = `${ticket.id}-${ticket.tokenId}-${timestamp}`;
        const signature = crypto.createHmac('sha256', qrSecret).update(dataToSign).digest('hex');
        
        const qrData = {
            ticketId: ticket.id,
            tokenId: ticket.tokenId,
            timestamp,
            signature
        };
        
        res.json({
            qrData: JSON.stringify(qrData),
            expiresAt,
            ticket: {
                id: ticket.id,
                eventTitle: ticket.event.title,
                venue: ticket.event.venue,
                startTime: ticket.event.startTime
            }
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
            return res.status(403).send({ error: "Forbidden - Authentication required" });
        }

        if (!eventId || !tierId || !txHash || tokenId === undefined) {
            return res.status(400).send({ 
                error: "Missing required fields: eventId, tierId, txHash, tokenId" 
            });
        }

        const event = await prisma.event.findUnique({
            where: { id: String(eventId) },
            include: { tiers: true }
        });
        if (!event) {
            return res.status(404).send({ error: "Event not found" });
        }
        
        if (!event.isActive) {
            return res.status(400).send({ error: "Event is not active" });
        }

        const tier = event.tiers.find(t => t.id === String(tierId));
        if (!tier) {
            return res.status(404).send({ error: "Ticket tier not found" });
        }

        const existingTicket = await prisma.ticket.findFirst({
            where: {
                eventId: String(eventId),
                tokenId: Number(tokenId)
            }
        });
        
        if (existingTicket) {
            return res.status(400).send({ error: "Ticket with this tokenId already exists" });
        }
        
        const ticket = await prisma.ticket.create({
            data: {
                eventId: String(eventId),
                tierId: String(tierId),
                ownerId: user.id,
                tokenId: Number(tokenId),
                status: 'VALID',
                mintTxHash: String(txHash)
            },
            include: {
                event: true,
                tier: true
            }
        });

        await prisma.ticketTier.update({
            where: { id: String(tierId) },
            data: { soldCount: { increment: 1 } }
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
            return res.status(400).send({ error: "Invalid QR data - missing fields" });
        }

        const ticket = await prisma.ticket.findUnique({
            where: { id: String(ticketId) },
            include: { event: true, tier: true, owner: true }
        });
        
        if (!ticket) {
            return res.status(404).send({ error: "Ticket not found" });
        }

        if (ticket.event.organizerId !== user.id) {
            return res.status(403).send({ error: "You can only verify tickets for your own events" });
        }

        const crypto = await import('crypto');
        const dataToSign = `${ticketId}-${tokenId}-${timestamp}`;
        const expectedSignature = crypto.createHmac('sha256', ticket.qrCodeSecret).update(dataToSign).digest('hex');
        
        if (signature !== expectedSignature) {
            return res.status(400).send({ error: "Invalid QR signature" });
        }

        const now = Date.now();
        if (now - timestamp > 60000) {
            return res.status(400).send({ error: "QR code has expired" });
        }

        if (ticket.status === 'USED') {
            return res.status(400).send({ 
                error: "Ticket already used",
                usedAt: ticket.usedAt
            });
        }
        const updatedTicket = await prisma.ticket.update({
            where: { id: String(ticketId) },
            data: {
                status: 'USED',
                usedAt: new Date()
            },
            include: { event: true, tier: true, owner: true }
        });
        
        res.json({
            valid: true,
            ticket: {
                id: updatedTicket.id,
                tokenId: updatedTicket.tokenId,
                tierName: updatedTicket.tier.name,
                ownerWallet: updatedTicket.owner.walletAddress,
                eventTitle: updatedTicket.event.title,
                usedAt: updatedTicket.usedAt
            },
            message: "Ticket verified and marked as used"
        });
    } catch (error: any) {
        console.error(error, "In POST /tickets/:id/verify");
        res.status(500).send({ error: error.message || "Internal server error" });
    }
});

export default router;

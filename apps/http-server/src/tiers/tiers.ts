import { Router } from "express";
import { prisma } from "@repo/db";
import { authenticatedBro } from "../middleware.js";

const router = Router();

// GET /events/:eventId/tiers - Get all tiers for an event
router.get("/:eventId/tiers", async (req, res) => {
    try {
        const { eventId } = req.params;
        
        const event = await prisma.event.findUnique({
            where: { id: String(eventId) }
        });
        
        if (!event) {
            return res.status(404).send({ error: "Event not found" });
        }
        
        const tiers = await prisma.ticketTier.findMany({
            where: { eventId: String(eventId) },
            orderBy: { price: 'asc' }
        });
        
        res.json({ tiers });
    } catch (error: any) {
        console.error(error, "In GET /events/:eventId/tiers");
        res.status(500).send({ error: error.message || "Internal server error" });
    }
});

// POST /events/:eventId/tiers - Add a tier to event (Organizer only)
router.post("/:eventId/tiers", authenticatedBro, async (req, res) => {
    try {
        const user = req.user;
        const { eventId } = req.params;
        const { name, price, totalSupply } = req.body;
        
        if (!user || user.role !== "ORGANIZER") {
            return res.status(403).send({ error: "Forbidden - Organizer only" });
        }
        
        // Validate required fields
        if (!name || price === undefined || !totalSupply) {
            return res.status(400).send({ error: "Missing required fields: name, price, totalSupply" });
        }
        
        // Check event exists and belongs to organizer
        const event = await prisma.event.findUnique({
            where: { id: String(eventId) }
        });
        
        if (!event) {
            return res.status(404).send({ error: "Event not found" });
        }
        
        if (event.organizerId !== user.id) {
            return res.status(403).send({ error: "You can only add tiers to your own events" });
        }
        
        if (event.isActive) {
            return res.status(400).send({ error: "Cannot add tiers to an active event" });
        }
        
        const tier = await prisma.ticketTier.create({
            data: {
                eventId: String(eventId),
                name: String(name),
                price: price, // in MATIC
                totalSupply: Number(totalSupply),
                soldCount: 0
            }
        });
        
        res.status(201).json({ tier });
    } catch (error: any) {
        console.error(error, "In POST /events/:eventId/tiers");
        res.status(500).send({ error: error.message || "Internal server error" });
    }
});

// POST /events/:eventId/tiers/bulk - Add multiple tiers at once (Organizer only)
router.post("/:eventId/tiers/bulk", authenticatedBro, async (req, res) => {
    try {
        const user = req.user;
        const { eventId } = req.params;
        const { tiers } = req.body; // Array of { name, price, totalSupply }
        
        if (!user || user.role !== "ORGANIZER") {
            return res.status(403).send({ error: "Forbidden - Organizer only" });
        }
        
        if (!tiers || !Array.isArray(tiers) || tiers.length === 0) {
            return res.status(400).send({ error: "tiers array is required" });
        }
        
        // Check event exists and belongs to organizer
        const event = await prisma.event.findUnique({
            where: { id: String(eventId) }
        });
        
        if (!event) {
            return res.status(404).send({ error: "Event not found" });
        }
        
        if (event.organizerId !== user.id) {
            return res.status(403).send({ error: "You can only add tiers to your own events" });
        }
        
        if (event.isActive) {
            return res.status(400).send({ error: "Cannot add tiers to an active event" });
        }
        
        // Create all tiers
        const createdTiers = await prisma.ticketTier.createMany({
            data: tiers.map((t: any) => ({
                eventId: String(eventId),
                name: String(t.name),
                price: t.price,
                totalSupply: Number(t.totalSupply),
                soldCount: 0
            }))
        });
        
        // Fetch created tiers
        const allTiers = await prisma.ticketTier.findMany({
            where: { eventId: String(eventId) },
            orderBy: { price: 'asc' }
        });
        
        res.status(201).json({ 
            message: `Created ${createdTiers.count} tiers`,
            tiers: allTiers 
        });
    } catch (error: any) {
        console.error(error, "In POST /events/:eventId/tiers/bulk");
        res.status(500).send({ error: error.message || "Internal server error" });
    }
});

// DELETE /tiers/:tierId - Delete a tier (Organizer only)
router.delete("/:tierId", authenticatedBro, async (req, res) => {
    try {
        const user = req.user;
        const { tierId } = req.params;
        
        if (!user || user.role !== "ORGANIZER") {
            return res.status(403).send({ error: "Forbidden - Organizer only" });
        }
        
        const tier = await prisma.ticketTier.findUnique({
            where: { id: String(tierId) },
            include: { event: true }
        });
        
        if (!tier) {
            return res.status(404).send({ error: "Tier not found" });
        }
        
        if (tier.event.organizerId !== user.id) {
            return res.status(403).send({ error: "You can only delete tiers from your own events" });
        }
        
        if (tier.event.isActive) {
            return res.status(400).send({ error: "Cannot delete tiers from an active event" });
        }
        
        if (tier.soldCount > 0) {
            return res.status(400).send({ error: "Cannot delete tier with sold tickets" });
        }
        
        await prisma.ticketTier.delete({
            where: { id: String(tierId) }
        });
        
        res.json({ message: "Tier deleted successfully" });
    } catch (error: any) {
        console.error(error, "In DELETE /tiers/:tierId");
        res.status(500).send({ error: error.message || "Internal server error" });
    }
});

export default router;

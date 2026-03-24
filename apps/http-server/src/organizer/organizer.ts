import {Router} from "express";
import {prisma} from "@repo/db"
import { authenticatedBro } from "../middleware.js";

const router = Router();

router.get("/events", authenticatedBro, async (req: any, res: any) => {
	try {
		const user = req.user;
		if (!user || user.role !== "ORGANIZER") {
			return res.status(403).send({ error: "Forbidden - Organizer only" });
		}

		const events = await prisma.event.findMany({
			where: { organizerId: user.id },
			orderBy: { createdAt: "desc" },
		});

		res.json({ events });
	} catch (error: any) {
		console.error(error, "In GET /organizer/events");
		res.status(500).send({ error: error.message || "Internal server error" });
	}
});

router.get("/dashboard-stats", authenticatedBro, async (req: any, res: any) => {
	try {
		const user = req.user;
		if (!user || user.role !== "ORGANIZER") {
			return res.status(403).send({ error: "Forbidden - Organizer only" });
		}

		const now = new Date();

		const events = await prisma.event.findMany({
			where: { organizerId: user.id },
			select: {
				id: true,
				isActive: true,
				endTime: true,
			},
		});

		const tickets = await prisma.ticket.findMany({
			where: {
				event: {
					organizerId: user.id,
				},
			},
			include: {
				tier: {
					select: { price: true },
				},
			},
		});

		const totalEvents = events.length;
		const activeExperiences = events.filter(
			(event) => event.isActive && event.endTime >= now
		).length;
		const ticketsIssued = tickets.length;
		const revenue = tickets.reduce((sum, ticket) => sum + Number(ticket.tier.price), 0);

		res.json({
			totalEvents,
			ticketsIssued,
			revenue,
			activeExperiences,
		});
	} catch (error: any) {
		console.error(error, "In GET /organizer/dashboard-stats");
		res.status(500).send({ error: error.message || "Internal server error" });
	}
});

router.get("/events/:id/sales", authenticatedBro, async (req: any, res: any) => {
	try {
		const user = req.user;
		if (!user || user.role !== "ORGANIZER") {
			return res.status(403).send({ error: "Forbidden - Organizer only" });
		}

		const { id } = req.params;

		const event = await prisma.event.findUnique({
			where: { id: String(id) },
		});

		if (!event) {
			return res.status(404).send({ error: "Event not found" });
		}

		if (event.organizerId !== user.id) {
			return res.status(403).send({ error: "You can only view sales for your own events" });
		}

		const tickets = await prisma.ticket.findMany({
			where: { eventId: String(id) },
			include: { tier: { select: { price: true, name: true } } },
			orderBy: { purchasedAt: "desc" },
		});

		const revenue = tickets.reduce((sum, ticket) => sum + Number(ticket.tier.price), 0);

		res.json({
			ticketsIssued: tickets.length,
			revenue,
			tickets,
		});
	} catch (error: any) {
		console.error(error, "In GET /organizer/events/:id/sales");
		res.status(500).send({ error: error.message || "Internal server error" });
	}
});

export default router;
import { Router } from "express";
import {prisma} from "@repo/db"
import { authenticatedBro} from "../middleware.js";

const route = Router();

route.get("/",authenticatedBro ,async (req, res) => {
    try
    {
      /*
         currectly sharing all events, later we can filter isActive events only
         -FIX Priyanshu
      */
      const events = await prisma.event.findMany();
      res.json(events);
    }
    catch(eror :any)
    {
      console.error(eror,"In /events GET");
      res.status(500).send({error : eror.message || "Internal server error"})
    }
});

route.get("/:id",authenticatedBro ,async(req, res) => {
    try{
        const {id} = req.params;
        const event = await prisma.event.findUnique({
          where : {id : String(id)}
        });
        if(!event){
          return  res.status(404).send({error : "Event not found"});
        }
        res.json(event);
    }catch(error : any){
      console.error(error,"In /events/:id GET");
      res.status(500).send({error : error.message || "Internal server error"})
    }
});

route.post("/",authenticatedBro, async(req, res) => {
    try{
        const user = req.user;
        if(!user || user.role!=="ORGANIZER"){
          return res.status(403).send({error : "Forbidden"});
        }
        const {title, description,venue,location,bannerImage,startTime,endTime,category} = req.body;
        const event = await prisma.event.create({
          data : {
            title,
            description,
            venue,
            location,
            bannerImage,
            startTime : new Date(startTime),
            endTime : new Date(endTime),
            category,
            isActive : false,
            organizerId : user.id
          }
        });
        if(!event){
          console.log("error in POST - /events/");
          return res.status(400).send({error : "Event creation failed"});
        }
        res.status(201).json(event);
    } catch(error : any){
      console.error(error,"In /events POST");
      res.status(500).send({error : error.message || "Internal server error"})
    }
});

// PUT /:id - Update event details (Organizer only)
route.put("/:id", authenticatedBro, async (req, res) => {
    try {
        const user = req.user;
        if (!user || user.role !== "ORGANIZER") {
            return res.status(403).send({ error: "Forbidden - Organizer only" });
        }

        const { id } = req.params;

        // Check if event exists and belongs to this organizer
        const existingEvent = await prisma.event.findUnique({
            where: { id: String(id) }
        });

        if (!existingEvent) {
            return res.status(404).send({ error: "Event not found" });
        }

        if (existingEvent.organizerId !== user.id) {
            return res.status(403).send({ error: "You can only edit your own events" });
        }

        const { title, description, venue, location, bannerImage, startTime, endTime, category } = req.body;

        const updatedEvent = await prisma.event.update({
            where: { id: String(id) },
            data: {
                ...(title && { title }),
                ...(description && { description }),
                ...(venue && { venue }),
                ...(location && { location }),
                ...(bannerImage && { bannerImage }),
                ...(startTime && { startTime: new Date(startTime) }),
                ...(endTime && { endTime: new Date(endTime) }),
                ...(category && { category }),
            }
        });

        res.json(updatedEvent);
    } catch (error: any) {
        console.error(error, "In PUT /events/:id");
        res.status(500).send({ error: error.message || "Internal server error" });
    }
});

// PUT /:id/activate - Called after organizer deploys smart contract
// Sets contractAddress and activates the event
route.put("/:id/activate", authenticatedBro, async (req, res) => {
    try {
        const user = req.user;
        if (!user || user.role !== "ORGANIZER") {
            return res.status(403).send({ error: "Forbidden - Organizer only" });
        }
        const { id } = req.params;
        const { contractAddress } = req.body;
        if (!contractAddress) {
            return res.status(400).send({ error: "contractAddress is required" });
        }
        if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress)) {
            return res.status(400).send({ error: "Invalid contract address format" });
        }
        const existingEvent = await prisma.event.findUnique({
            where: { id: String(id) }
        });
        if (!existingEvent) {
            return res.status(404).send({ error: "Event not found" });
        }
        if (existingEvent.organizerId !== user.id) {
            return res.status(403).send({ error: "You can only activate your own events" });
        }
        if (existingEvent.isActive) {
            return res.status(400).send({ error: "Event is already active" });
        }
        const activatedEvent = await prisma.event.update({
            where: { id: String(id) },
            data: {
                contractAddress,
                isActive: true
            }
        });
        res.json({
            message: "Event activated successfully",
            event: activatedEvent
        });
    } catch (error: any) {
        console.error(error, "In PUT /events/:id/activate");
        res.status(500).send({ error: error.message || "Internal server error" });
    }
});

export default route;
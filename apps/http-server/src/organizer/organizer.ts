import {Router} from "express";
import {prisma} from "@repo/db"
import { authenticatedBro } from "src/middleware.js";

const router = Router();

router.get("/events",authenticatedBro,async(req:any,res:any)=>{});

router.get("/events/:id/sales",authenticatedBro,async(req:any,res:any)=>{});

export default router;
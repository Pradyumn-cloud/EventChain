import jwt from "jsonwebtoken";
import { prisma } from "@repo/db";

const JWT_SECRET = process.env.JWT_SECRET || "I want a gf";

interface JwtPayload {
    id: string;
    walletAddress: string;
    role: string;
}


export const authenticatedBro = async (req:any, res:any, next:any) => {
  try{
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
            
    const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, walletAddress: true, role: true, createdAt: true }
    });

    if(!user){
      return res.status(401).send({error : "Unauthorized or user not found brother"});
    }
    req.user = user;
    next();

  }catch(error : any){
    console.error(error, "In authenticateToken middleware");
    res.status(401).send({error : "Unauthorized"});
  }
};
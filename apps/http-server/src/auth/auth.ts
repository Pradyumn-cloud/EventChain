import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "@repo/db";
import { signUpValidator, signInValidator } from "./validators.js";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || "I want a gf";

interface JwtPayload {
    id: string;
    walletAddress: string;
    role: string;
}

router.post('/sign-in', async (req, res) => {
    try {
        const { walletAddress } = req.body;
        const parseResult = signInValidator.safeParse({ walletAddress });
        if (!parseResult.success) {
            return res.status(400).json({ error: parseResult.error });
        }

        const user = await prisma.user.findUnique({
            where: { walletAddress }
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found. Please sign up first.' });
        }

        const token = jwt.sign(
            {
                id: user.id,
                walletAddress: user.walletAddress,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).json({ message: 'Sign-in successful', token, user: { id: user.id, walletAddress: user.walletAddress, role: user.role } });

    } catch (error) {
        console.error('Error in /auth/sign-in:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post("/sign-up", async (req, res) => {
    try {
        const { walletAddress, role } = req.body;
        const parseResult = signUpValidator.safeParse({ walletAddress, role });
        if (!parseResult.success) {
            return res.status(400).json({ error: parseResult.error });
        }
        const existingUser = await prisma.user.findUnique({
            where: { walletAddress }
        });
        if (existingUser) {
            return res.status(409).json({ error: 'Wallet address already registered' });
        }

        const newUser = await prisma.user.create({
            data: {
                walletAddress,
                role
            }
        });

        res.status(201).json({ 
            message: 'User registered successfully', 
            userId: newUser.id,
            user: { id: newUser.id, walletAddress: newUser.walletAddress, role: newUser.role }
        });

    } catch (error) {
        console.error('Error in /auth/sign-up:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get("/me", async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, walletAddress: true, role: true, createdAt: true }
        });
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.status(200).json({ user });
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        console.error('Error in /auth/me:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
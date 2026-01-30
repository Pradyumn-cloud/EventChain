import { z } from "zod";

export const signUpValidator = z.object({
    walletAddress: z.string().min(10),
    role: z.enum(['USER', 'ORGANIZER'])
});

export const signInValidator = z.object({
    walletAddress: z.string().min(10)
});
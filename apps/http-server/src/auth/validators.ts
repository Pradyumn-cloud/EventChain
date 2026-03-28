import { z } from "zod";

const walletAddressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid wallet address");

export const signUpValidator = z.object({
  walletAddress: walletAddressSchema,
  role: z.enum(["USER", "ORGANIZER"]),
});

export const signInValidator = z.object({
  walletAddress: walletAddressSchema,
});

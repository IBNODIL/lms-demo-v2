import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Invalid email"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Email required"),
  password: z.string().min(6, "Password required"),
});
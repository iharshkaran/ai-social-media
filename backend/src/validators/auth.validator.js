import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must contain at least 2 characters.").max(80),
  email: z.email("Enter a valid email address.").transform((value) => value.toLowerCase().trim()),
  password: z.string().min(8, "Password must contain at least 8 characters.").max(100),
  university: z.string().trim().max(160).optional().default(""),
  course: z.string().trim().max(100).optional().default(""),
  year: z.string().trim().max(50).optional().default(""),
  bio: z.string().trim().max(1200).optional().default(""),
  skills: z.array(z.string().trim().min(1).max(40)).max(30).optional().default([]),
}).strict();

export const loginSchema = z.object({
  email: z.email("Enter a valid email address.").transform((value) => value.toLowerCase().trim()),
  password: z.string().min(1, "Enter your password.").max(100),
  remember: z.boolean().optional().default(true),
}).strict();


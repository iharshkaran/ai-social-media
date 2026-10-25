import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  headline: z.string().trim().max(160).optional(),
  university: z.string().trim().max(160).optional(),
  course: z.string().trim().max(100).optional(),
  year: z.string().trim().max(50).optional(),
  location: z.string().trim().max(100).optional(),
  bio: z.string().trim().max(1200).optional(),
  skills: z.array(z.string().trim().min(1).max(40)).max(30).optional(),
  photo: z.string().max(2200000).optional(),
  portfolioUrl: z.union([z.url(), z.literal("")]).optional(),
}).strict().refine((value) => Object.keys(value).length > 0, "Add at least one profile field.");

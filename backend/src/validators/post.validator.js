import { z } from "zod";

export const postSchema = z.object({
  text: z.string().trim().max(3000).optional().default(""),
  image: z.string().max(2200000).optional().default(""),
  category: z.enum(["General", "Project", "Hackathon", "Learning", "Achievement"]).optional().default("General"),
}).strict().refine((value) => value.text || value.image, "Write something or add an image.");

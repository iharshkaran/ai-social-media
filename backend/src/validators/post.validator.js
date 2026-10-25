import { z } from "zod";

export const postSchema = z.object({
  text: z.string().trim().max(3000).optional().default(""),
  image: z.string().max(2200000).optional().default(""),
  mediaUrl: z.union([z.literal(""), z.string().url().max(2048)]).optional().default(""),
  mediaType: z.enum(["", "video", "pdf"]).optional().default(""),
  mediaName: z.string().trim().max(255).optional().default(""),
  category: z.enum(["General", "Project", "Hackathon", "Learning", "Achievement"]).optional().default("General"),
}).strict().refine((value) => value.text || value.image || value.mediaUrl, "Write something or attach a file.")
  .refine((value) => !value.mediaUrl || Boolean(value.mediaType), "Choose a media type.");

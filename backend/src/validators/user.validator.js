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
  banner: z.string().max(2200000).optional(),
  projects: z.array(z.object({ key: z.string().trim().min(1).max(80), title: z.string().trim().min(1).max(100), description: z.string().trim().max(600).optional().default(""), url: z.union([z.url(), z.literal("")]).optional().default(""), mediaUrl: z.string().max(2200000).optional().default(""), mediaType: z.enum(["", "image", "video"]).optional().default(""), relatedPostIds: z.array(z.string().min(1).max(80)).max(30).optional().default([]) }).strict()).max(20).optional(),
  education: z.array(z.object({ school: z.string().trim().min(1).max(160), degree: z.string().trim().max(100).optional().default(""), field: z.string().trim().max(100).optional().default(""), startYear: z.string().trim().max(20).optional().default(""), endYear: z.string().trim().max(20).optional().default(""), description: z.string().trim().max(500).optional().default("") }).strict()).max(12).optional(),
  featured: z.array(z.object({ type: z.enum(["project", "post", "link"]), projectKey: z.string().max(80).optional().default(""), postId: z.string().max(80).optional().default(""), title: z.string().trim().max(100).optional().default(""), description: z.string().trim().max(500).optional().default(""), url: z.union([z.url(), z.literal("")]).optional().default("") }).strict().refine((item) => item.type === "project" ? Boolean(item.projectKey) : item.type === "post" ? Boolean(item.postId) : Boolean(item.title && item.url), "Choose a project or post, or provide a title and URL for a featured link.")).max(12).optional(),
  portfolioUrl: z.union([z.url(), z.literal("")]).optional(),
}).strict().refine((value) => Object.keys(value).length > 0, "Add at least one profile field.");

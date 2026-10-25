import { z } from "zod";

export const messageSchema = z.object({ text: z.string().trim().min(1).max(2000) }).strict();
export const messageUserParamsSchema = z.object({ userId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid user id.") });

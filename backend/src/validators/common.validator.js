import { z } from "zod";

export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id.");
export const idParamsSchema = z.object({ id: objectIdSchema });
export const postIdParamsSchema = z.object({ postId: objectIdSchema });
export const connectionActionSchema = z.object({ action: z.enum(["accept", "reject"]) }).strict();

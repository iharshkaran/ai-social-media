import { z } from "zod";
import { objectIdSchema } from "./common.validator.js";

export const reportSchema = z.object({ postId: objectIdSchema, reason: z.string().trim().min(5).max(500) }).strict();

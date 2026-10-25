import { z } from "zod";
import { objectIdSchema } from "./common.validator.js";

export const notificationReadSchema = z.object({ id: objectIdSchema.optional() }).strict();

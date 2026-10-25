import { Router } from "express";
import { getInbox, getThread, sendMessage } from "../controllers/message.controller.js";
import { asyncHandler } from "../middleware/async.middleware.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate, validateParams } from "../middleware/validate.middleware.js";
import { messageSchema, messageUserParamsSchema } from "../validators/message.validator.js";

const router = Router();
router.use(requireAuth);
router.get("/", asyncHandler(getInbox));
router.get("/:userId", validateParams(messageUserParamsSchema), asyncHandler(getThread));
router.post("/:userId", validateParams(messageUserParamsSchema), validate(messageSchema), asyncHandler(sendMessage));
export default router;

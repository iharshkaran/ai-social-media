import { Router } from "express";
import { clearAll, dismiss, getNotifications, markRead } from "../controllers/notification.controller.js";
import { asyncHandler } from "../middleware/async.middleware.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate, validateParams } from "../middleware/validate.middleware.js";
import { idParamsSchema } from "../validators/common.validator.js";
import { notificationReadSchema } from "../validators/notification.validator.js";

const router = Router();
router.use(requireAuth);
router.get("/", asyncHandler(getNotifications));
router.patch("/read", validate(notificationReadSchema), asyncHandler(markRead));
router.delete("/:id", validateParams(idParamsSchema), asyncHandler(dismiss));
router.delete("/", asyncHandler(clearAll));
export default router;


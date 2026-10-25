import { Router } from "express";
import { getMyProfile, getUser, getUserPosts, listUsers, updateMyProfile } from "../controllers/user.controller.js";
import { asyncHandler } from "../middleware/async.middleware.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate, validateParams } from "../middleware/validate.middleware.js";
import { idParamsSchema } from "../validators/common.validator.js";
import { profileSchema } from "../validators/user.validator.js";
import { requestConnection } from "../controllers/connection.controller.js";

const router = Router();
router.get("/", requireAuth, asyncHandler(listUsers));
router.get("/me", requireAuth, getMyProfile);
router.patch("/me", requireAuth, validate(profileSchema), asyncHandler(updateMyProfile));
router.get("/:id/posts", requireAuth, validateParams(idParamsSchema), asyncHandler(getUserPosts));
router.get("/:id", requireAuth, validateParams(idParamsSchema), asyncHandler(getUser));
router.post("/:id/connections", requireAuth, validateParams(idParamsSchema), asyncHandler(requestConnection));
export default router;

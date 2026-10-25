import { Router } from "express";
import { getBookmarks, togglePostBookmark } from "../controllers/bookmark.controller.js";
import { asyncHandler } from "../middleware/async.middleware.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validateParams } from "../middleware/validate.middleware.js";
import { postIdParamsSchema } from "../validators/common.validator.js";

const router = Router();
router.use(requireAuth);
router.get("/bookmarks", asyncHandler(getBookmarks));
router.post("/posts/:postId/bookmark", validateParams(postIdParamsSchema), asyncHandler(togglePostBookmark));
export default router;

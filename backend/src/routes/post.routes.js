import { Router } from "express";
import { addPost, editPost, getPost, getPosts, removePost, toggleLike } from "../controllers/post.controller.js";
import { asyncHandler } from "../middleware/async.middleware.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate, validateParams } from "../middleware/validate.middleware.js";
import { idParamsSchema } from "../validators/common.validator.js";
import { postSchema } from "../validators/post.validator.js";

const router = Router();
router.use(requireAuth);
router.get("/", asyncHandler(getPosts));
router.get("/:id", validateParams(idParamsSchema), asyncHandler(getPost));
router.post("/", validate(postSchema), asyncHandler(addPost));
router.patch("/:id", validateParams(idParamsSchema), validate(postSchema), asyncHandler(editPost));
router.delete("/:id", validateParams(idParamsSchema), asyncHandler(removePost));
router.post("/:id/like", validateParams(idParamsSchema), asyncHandler(toggleLike));
export default router;

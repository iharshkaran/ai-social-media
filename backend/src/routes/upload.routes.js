import { Router } from "express";
import { getImageKitUploadAuth } from "../controllers/upload.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();
router.get("/imagekit/auth", requireAuth, getImageKitUploadAuth);
export default router;

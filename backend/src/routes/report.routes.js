import { Router } from "express";
import { createReport } from "../controllers/report.controller.js";
import { asyncHandler } from "../middleware/async.middleware.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { reportSchema } from "../validators/report.validator.js";

const router = Router();
router.post("/", requireAuth, validate(reportSchema), asyncHandler(createReport));
export default router;

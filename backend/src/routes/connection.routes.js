import { Router } from "express";
import { deleteConnection, getConnections, respondConnection } from "../controllers/connection.controller.js";
import { asyncHandler } from "../middleware/async.middleware.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate, validateParams } from "../middleware/validate.middleware.js";
import { connectionActionSchema, idParamsSchema } from "../validators/common.validator.js";

const router = Router();
router.use(requireAuth);
router.get("/", asyncHandler(getConnections));
router.patch("/:id", validateParams(idParamsSchema), validate(connectionActionSchema), asyncHandler(respondConnection));
router.delete("/:id", validateParams(idParamsSchema), asyncHandler(deleteConnection));
export default router;

import express from "express";
const router = express.Router();
import authMiddleware from "../middlewares/auth.middleware.js";
import multer from "multer";
import createPostController from "../controllers/post.controller.js";

const upload = multer({storage: multer.memoryStorage()});

router.post("/",
    authMiddleware,
    upload.single("image"),
    createPostController
);

export default router;
import express from "express";
import mongoose from "mongoose";

const router = express.Router();
router.get("/", (_req, res) => res.json({ success: true, message: "Connectly API is running", health: "/api/health" }));
router.get("/api/health", (_req, res) => res.json({ success: true, database: mongoose.connection.readyState === 1 ? "connected" : "disconnected" }));
export default router;

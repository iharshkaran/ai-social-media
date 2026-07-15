import express from "express"
const router = express.Router();
import User from "../models/user.model.js"
import jwt from "jsonwebtoken"

import authController from "../controllers/auth.controller.js"

// POST /register
// POST /login
// GET /user [protected]


router.post('/register', authController.registerController);
router.post('/login', authController.loginController);

export default router;
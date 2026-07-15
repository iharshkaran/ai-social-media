import express from "express";
const router = express.Router();
import User from "../models/user.model.js"
import jwt from "jsonwebtoken"
import e from "express";

function authMiddleware(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({
            msg: "no token provided"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            msg: "Invalid token"
        });
    }
}

export default authMiddleware;
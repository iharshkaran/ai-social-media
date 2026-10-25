import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const AUTH_COOKIE_NAME = "connectly_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_MS,
  };
}

export function getClearCookieOptions() {
  const { httpOnly, secure, sameSite, path } = getSessionCookieOptions();
  return { httpOnly, secure, sameSite, path };
}

export function requireAuth(req, res, next) {
  const bearerToken = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.slice(7)
    : null;
  const token = req.cookies?.[AUTH_COOKIE_NAME] || bearerToken;

  if (!token) {
    return res.status(401).json({ success: false, message: "Please sign in to continue." });
  }
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 24) {
    return next(new Error("JWT_SECRET must be at least 24 characters long."));
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ success: false, message: "Your session is invalid or expired. Please sign in again." });
  }

  User.findById(payload.sub)
    .then((user) => {
      if (!user) return res.status(401).json({ success: false, message: "Account not found. Please sign in again." });
      req.user = user;
      return next();
    })
    .catch(next);
}

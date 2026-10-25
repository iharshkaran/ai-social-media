import { AUTH_COOKIE_NAME, getClearCookieOptions, getSessionCookieOptions } from "../middleware/auth.middleware.js";
import { loginUser, registerUser, toPublicUser } from "../services/auth.service.js";

export async function register(req, res) {
  const { user, token } = await registerUser(req.validated);
  res.cookie(AUTH_COOKIE_NAME, token, getSessionCookieOptions());
  return res.status(201).json({ success: true, data: { user: toPublicUser(user) } });
}

export async function login(req, res) {
  const { remember, ...credentials } = req.validated;
  const { user, token } = await loginUser(credentials);
  const cookieOptions = getSessionCookieOptions();
  if (!remember) delete cookieOptions.maxAge;
  res.cookie(AUTH_COOKIE_NAME, token, cookieOptions);
  return res.json({ success: true, data: { user: toPublicUser(user) } });
}

export function logout(_req, res) {
  res.clearCookie(AUTH_COOKIE_NAME, getClearCookieOptions());
  return res.json({ success: true, message: "You have been signed out." });
}

export function currentUser(req, res) {
  return res.json({ success: true, data: { user: toPublicUser(req.user) } });
}



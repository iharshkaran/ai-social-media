import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const PASSWORD_ROUNDS = 12;
const SESSION_DURATION = "7d";

function assertJwtSecret() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 24) {
    const error = new Error("JWT_SECRET must be at least 24 characters long. Set it in backend/.env.");
    error.status = 500;
    throw error;
  }
}

export function createSessionToken(userId) {
  assertJwtSecret();
  return jwt.sign({ sub: String(userId) }, process.env.JWT_SECRET, { expiresIn: SESSION_DURATION });
}

export function toPublicUser(user) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    headline: user.headline,
    university: user.university,
    course: user.course,
    year: user.year,
    location: user.location,
    bio: user.bio,
    skills: user.skills,
    photo: user.photo,
    portfolioUrl: user.portfolioUrl,
    createdAt: user.createdAt,
  };
}

export async function registerUser(input) {
  assertJwtSecret();
  const existing = await User.exists({ email: input.email });
  if (existing) {
    const error = new Error("An account with this email already exists.");
    error.status = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(input.password, PASSWORD_ROUNDS);
  const headline = [input.course, input.year, "Student"].filter(Boolean).join(" · ") || "Student";
  const user = await User.create({ ...input, headline, passwordHash });
  return { user, token: createSessionToken(user._id) };
}

export async function loginUser({ email, password }) {
  assertJwtSecret();
  const user = await User.findOne({ email }).select("+passwordHash");
  const passwordMatches = user && await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    const error = new Error("Email or password is incorrect.");
    error.status = 401;
    throw error;
  }
  return { user, token: createSessionToken(user._id) };
}

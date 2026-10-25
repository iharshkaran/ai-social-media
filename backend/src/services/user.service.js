import mongoose from "mongoose";
import User from "../models/User.js";
import Follow from "../models/Follow.js";
import { httpError } from "../utils/httpError.js";

export function toPublicProfile(user) {
  return {
    id: String(user._id), name: user.name, headline: user.headline,
    university: user.university, course: user.course, year: user.year,
    location: user.location, bio: user.bio, skills: user.skills,
    photo: user.photo, portfolioUrl: user.portfolioUrl,
  };
}

export async function findStudents({ currentUserId, query = "", page = 1, limit = 30 }) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(50, Math.max(1, Number(limit) || 30));
  const filter = { _id: { $ne: currentUserId } };
  const term = String(query).trim().slice(0, 80);
  if (term) {
    const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = ["name", "university", "course", "skills"].map((field) => ({ [field]: { $regex: escapedTerm, $options: "i" } }));
  }
  const users = await User.find(filter).sort({ createdAt: -1 }).skip((safePage - 1) * safeLimit).limit(safeLimit);
  return { users: users.map(toPublicProfile), page: safePage, hasMore: users.length === safeLimit };
}

export async function getStudentById(id) {
  if (!mongoose.isValidObjectId(id)) throw httpError(400, "Invalid student id.");
  const user = await User.findById(id);
  if (!user) throw httpError(404, "Student not found.");
  return toPublicProfile(user);
}

export async function updateProfile(user, updates) {
  Object.assign(user, updates);
  await user.save();
  return user;
}

export async function ensureStudentExists(id) {
  if (!mongoose.isValidObjectId(id)) throw httpError(400, "Invalid student id.");
  if (!(await User.exists({ _id: id }))) throw httpError(404, "Student not found.");
}

export async function listConnectionRelations(userId) {
  const profileFields = "name headline course year university photo";
  const [incoming, outgoing, connected] = await Promise.all([
    Follow.find({ to: userId, status: "pending" }).populate("from", profileFields).sort({ createdAt: -1 }),
    Follow.find({ from: userId, status: "pending" }).populate("to", profileFields).sort({ createdAt: -1 }),
    Follow.find({ $or: [{ from: userId }, { to: userId }], status: "accepted" }).populate("from to", profileFields).sort({ updatedAt: -1 }),
  ]);
  const format = (relation, person) => ({
    id: String(relation._id), studentId: String(person._id), name: person.name,
    role: [person.course, person.year, person.university].filter(Boolean).join(" · ") || person.headline,
    photo: person.photo, initials: person.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2),
  });
  return {
    incoming: incoming.filter((relation) => relation.from).map((relation) => format(relation, relation.from)),
    outgoing: outgoing.filter((relation) => relation.to).map((relation) => format(relation, relation.to)),
    connected: connected.map((relation) => {
      const person = String(relation.from._id) === String(userId) ? relation.to : relation.from;
      return person ? format(relation, person) : null;
    }).filter(Boolean),
  };
}

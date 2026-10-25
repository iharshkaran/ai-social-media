import { toPublicUser } from "../services/auth.service.js";
import { findStudents, getStudentById, updateProfile } from "../services/user.service.js";
import { listPosts } from "../services/post.service.js";

export async function listUsers(req, res) {
  const result = await findStudents({ currentUserId: req.user._id, query: req.query.q, page: req.query.page, limit: req.query.limit });
  return res.json({ success: true, data: result.users, page: result.page, hasMore: result.hasMore });
}

export function getMyProfile(req, res) {
  return res.json({ success: true, data: { user: toPublicUser(req.user) } });
}

export async function updateMyProfile(req, res) {
  const user = await updateProfile(req.user, req.validated);
  return res.json({ success: true, data: { user: toPublicUser(user) } });
}

export async function getUser(req, res) {
  const user = await getStudentById(req.params.id);
  return res.json({ success: true, data: { user } });
}

export async function getUserPosts(req, res) {
  const result = await listPosts({ userId: req.user._id, authorId: req.params.id, page: req.query.page, limit: req.query.limit });
  return res.json({ success: true, data: result.posts, page: result.page, hasMore: result.hasMore });
}

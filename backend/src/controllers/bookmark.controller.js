import { listBookmarks, toggleBookmark } from "../services/bookmark.service.js";

export async function getBookmarks(req, res) {
  return res.json({ success: true, data: await listBookmarks(req.user._id) });
}

export async function togglePostBookmark(req, res) {
  const result = await toggleBookmark({ userId: req.user._id, postId: req.params.postId });
  return res.json({ success: true, data: result });
}

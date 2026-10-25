import Bookmark from "../models/Bookmark.js";
import Like from "../models/Like.js";
import Post from "../models/Post.js";
import { formatPost } from "./post.service.js";
import { httpError } from "../utils/httpError.js";

export async function listBookmarks(userId) {
  const bookmarks = await Bookmark.find({ user: userId }).populate({ path: "post", populate: { path: "author", select: "name course year university photo headline" } }).sort({ createdAt: -1 });
  const posts = bookmarks.map((bookmark) => bookmark.post).filter(Boolean);
  const postIds = posts.map((post) => post._id);
  const likes = await Like.aggregate([{ $match: { post: { $in: postIds } } }, { $group: { _id: "$post", count: { $sum: 1 } } }]);
  const likeMap = new Map(likes.map((like) => [String(like._id), like.count]));
  return posts.map((post) => formatPost(post, { likes: likeMap.get(String(post._id)) || 0 }));
}

export async function toggleBookmark({ userId, postId }) {
  if (!(await Post.exists({ _id: postId }))) throw httpError(404, "Post not found.");
  const existing = await Bookmark.findOne({ user: userId, post: postId });
  if (existing) await existing.deleteOne();
  else await Bookmark.create({ user: userId, post: postId });
  return { bookmarked: !existing };
}

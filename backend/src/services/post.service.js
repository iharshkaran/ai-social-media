import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import Like from "../models/Like.js";
import Bookmark from "../models/Bookmark.js";
import Notification from "../models/Notification.js";
import { NOTIFICATION_TYPES } from "../constants/notification.types.js";
import { createNotification } from "./notification.service.js";
import { httpError } from "../utils/httpError.js";

const AUTHOR_FIELDS = "name headline course year university photo";

export function formatPost(post, { likes = 0, liked = false, comments = [] } = {}) {
  const author = post.author || {};
  return {
    id: String(post._id), name: author.name || "Connectly member",
    role: author.headline || [author.course, author.year, author.university].filter(Boolean).join(" · ") || "Student",
    avatar: author.photo || "", authorId: String(author._id || author),
    time: post.createdAt, category: post.category, text: post.text, image: post.image,
    mediaUrl: post.mediaUrl || "", mediaType: post.mediaType || "", mediaName: post.mediaName || "",
    likes, liked, comments,
  };
}

export async function listPosts({ userId, authorId, page = 1, limit = 20 }) {
  const currentPage = Math.max(1, Number(page) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(limit) || 20));
  const filter = authorId ? { author: authorId } : {};
  const fetchedPosts = await Post.find(filter).populate("author", AUTHOR_FIELDS).sort({ createdAt: -1 }).skip((currentPage - 1) * pageSize).limit(pageSize + 1).lean();
  const hasMore = fetchedPosts.length > pageSize;
  const posts = fetchedPosts.slice(0, pageSize);
  const ids = posts.map((post) => post._id);
  const [comments, counts, userLikes] = await Promise.all([
    Comment.find({ post: { $in: ids } }).populate("author", "name photo").sort({ createdAt: 1 }).lean(),
    Like.aggregate([{ $match: { post: { $in: ids } } }, { $group: { _id: "$post", count: { $sum: 1 } } }]),
    Like.find({ post: { $in: ids }, user: userId }).select("post").lean(),
  ]);
  const commentMap = new Map();
  for (const comment of comments) {
    const key = String(comment.post);
    const values = commentMap.get(key) || [];
    values.push({ id: String(comment._id), name: comment.author?.name || "Student", photo: comment.author?.photo || "", text: comment.text, createdAt: comment.createdAt });
    commentMap.set(key, values);
  }
  const countMap = new Map(counts.map((item) => [String(item._id), item.count]));
  const likedIds = new Set(userLikes.map((like) => String(like.post)));
  return {
    posts: posts.map((post) => formatPost(post, { likes: countMap.get(String(post._id)) || 0, liked: likedIds.has(String(post._id)), comments: commentMap.get(String(post._id)) || [] })),
    page: currentPage,
    hasMore,
    ownPostCount: currentPage === 1 ? await Post.countDocuments({ author: userId }) : undefined,
    authorPostCount: currentPage === 1 && authorId ? await Post.countDocuments({ author: authorId }) : undefined,
  };
}

export async function getPostById({ postId, userId }) {
  const post = await Post.findById(postId).populate("author", AUTHOR_FIELDS).lean();
  if (!post) throw httpError(404, "Post not found.");
  const [comments, likes, liked] = await Promise.all([
    Comment.find({ post: post._id }).populate("author", "name photo").sort({ createdAt: 1 }).lean(),
    Like.countDocuments({ post: post._id }),
    Like.exists({ post: post._id, user: userId }),
  ]);
  const formattedComments = comments.map((comment) => ({ id: String(comment._id), name: comment.author?.name || "Student", photo: comment.author?.photo || "", text: comment.text, createdAt: comment.createdAt }));
  return formatPost(post, { likes, liked: Boolean(liked), comments: formattedComments });
}

export async function createPost({ authorId, data }) {
  const post = await Post.create({ ...data, author: authorId });
  await post.populate("author", AUTHOR_FIELDS);
  return formatPost(post);
}

export async function updatePost({ postId, authorId, data }) {
  const post = await Post.findOneAndUpdate(
    { _id: postId, author: authorId },
    { $set: data },
    { new: true, runValidators: true },
  );
  if (!post) throw httpError(404, "Post not found or you cannot edit it.");
  return getPostById({ postId: post._id, userId: authorId });
}

export async function deletePost({ postId, authorId }) {
  const post = await Post.findOneAndDelete({ _id: postId, author: authorId });
  if (!post) throw httpError(404, "Post not found or you cannot delete it.");
  await Promise.all([
    Comment.deleteMany({ post: post._id }), Like.deleteMany({ post: post._id }),
    Bookmark.deleteMany({ post: post._id }), Notification.deleteMany({ post: post._id }),
  ]);
}

export async function togglePostLike({ postId, user }) {
  const post = await Post.findById(postId);
  if (!post) throw httpError(404, "Post not found.");
  const existing = await Like.findOne({ post: post._id, user: user._id });
  if (existing) await existing.deleteOne();
  else {
    await Like.create({ post: post._id, user: user._id });
    await createNotification({ recipient: post.author, actor: user._id, type: NOTIFICATION_TYPES.LIKE, message: `${user.name} liked your post.`, post: post._id });
  }
  return { liked: !existing, likes: await Like.countDocuments({ post: post._id }) };
}

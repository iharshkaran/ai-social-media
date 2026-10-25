import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import { NOTIFICATION_TYPES } from "../constants/notification.types.js";
import { createNotification } from "./notification.service.js";
import { httpError } from "../utils/httpError.js";

export async function listComments(postId) {
  const postExists = await Post.exists({ _id: postId });
  if (!postExists) throw httpError(404, "Post not found.");
  const comments = await Comment.find({ post: postId }).populate("author", "name photo").sort({ createdAt: 1 });
  return comments.map((comment) => ({ id: String(comment._id), name: comment.author?.name || "Student", photo: comment.author?.photo || "", text: comment.text, createdAt: comment.createdAt }));
}

export async function createComment({ postId, user, text }) {
  const post = await Post.findById(postId);
  if (!post) throw httpError(404, "Post not found.");
  const comment = await Comment.create({ post: post._id, author: user._id, text });
  await createNotification({ recipient: post.author, actor: user._id, type: NOTIFICATION_TYPES.COMMENT, message: `${user.name} commented on your post.`, post: post._id });
  return { id: String(comment._id), name: user.name, photo: user.photo || "", text: comment.text, createdAt: comment.createdAt };
}

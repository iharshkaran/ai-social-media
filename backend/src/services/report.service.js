import Post from "../models/Post.js";
import Report from "../models/Report.js";
import { httpError } from "../utils/httpError.js";

export async function reportPost({ reporterId, postId, reason }) {
  if (!(await Post.exists({ _id: postId }))) throw httpError(404, "Post not found.");
  await Report.create({ reporter: reporterId, post: postId, reason });
}

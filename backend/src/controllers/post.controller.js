import { createPost, deletePost, getPostById, listPosts, togglePostLike, updatePost } from "../services/post.service.js";

export async function getPosts(req, res) {
  const result = await listPosts({ userId: req.user._id, page: req.query.page, limit: req.query.limit });
  return res.json({ success: true, data: result.posts, page: result.page, hasMore: result.hasMore, ownPostCount: result.ownPostCount });
}

export async function addPost(req, res) {
  const post = await createPost({ authorId: req.user._id, data: req.validated });
  return res.status(201).json({ success: true, data: post });
}

export async function editPost(req, res) {
  const post = await updatePost({ postId: req.params.id, authorId: req.user._id, data: req.validated });
  return res.json({ success: true, data: post, message: "Post updated successfully." });
}

export async function getPost(req, res) {
  const post = await getPostById({ postId: req.params.id, userId: req.user._id });
  return res.json({ success: true, data: post });
}

export async function removePost(req, res) {
  await deletePost({ postId: req.params.id, authorId: req.user._id });
  return res.json({ success: true });
}

export async function toggleLike(req, res) {
  const result = await togglePostLike({ postId: req.params.id, user: req.user });
  return res.json({ success: true, data: result });
}

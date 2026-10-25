import { createComment, listComments } from "../services/comment.service.js";

export async function getComments(req, res) {
  const comments = await listComments(req.params.postId);
  return res.json({ success: true, data: comments });
}

export async function addComment(req, res) {
  const comment = await createComment({ postId: req.params.postId, user: req.user, text: req.validated.text });
  return res.status(201).json({ success: true, data: comment });
}

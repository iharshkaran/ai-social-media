import { listConnectionRelations } from "../services/user.service.js";
import { removeConnection, respondToConnection, sendConnectionRequest } from "../services/connection.service.js";

export async function requestConnection(req, res) {
  const result = await sendConnectionRequest({ fromUser: req.user, toUserId: req.params.id });
  return res.status(result.status === "pending" ? 201 : 200).json({ success: true, data: result });
}

export async function getConnections(req, res) {
  const data = await listConnectionRelations(req.user._id);
  return res.json({ success: true, data });
}

export async function respondConnection(req, res) {
  const data = await respondToConnection({ connectionId: req.params.id, userId: req.user._id, action: req.validated.action, actorName: req.user.name });
  return res.json({ success: true, data });
}

export async function deleteConnection(req, res) {
  await removeConnection({ connectionId: req.params.id, userId: req.user._id });
  return res.json({ success: true });
}

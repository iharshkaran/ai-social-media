import Follow from "../models/Follow.js";
import { NOTIFICATION_TYPES } from "../constants/notification.types.js";
import { createNotification } from "./notification.service.js";
import { ensureStudentExists } from "./user.service.js";
import { httpError } from "../utils/httpError.js";

export async function sendConnectionRequest({ fromUser, toUserId }) {
  if (String(fromUser._id) === String(toUserId)) throw httpError(400, "You cannot connect with yourself.");
  await ensureStudentExists(toUserId);
  const existing = await Follow.findOne({ $or: [{ from: fromUser._id, to: toUserId }, { from: toUserId, to: fromUser._id }] });
  if (existing?.status === "accepted") return { status: "accepted", id: String(existing._id) };
  if (existing && String(existing.from) === String(toUserId)) {
    existing.status = "accepted";
    await existing.save();
    await createNotification({ recipient: toUserId, actor: fromUser._id, type: NOTIFICATION_TYPES.CONNECTION, message: `${fromUser.name} accepted your connection request.`, connection: existing._id });
    return { status: "accepted", id: String(existing._id) };
  }
  if (existing) return { status: "pending", id: String(existing._id) };

  const relation = await Follow.create({ from: fromUser._id, to: toUserId, status: "pending" });
  await createNotification({ recipient: toUserId, actor: fromUser._id, type: NOTIFICATION_TYPES.CONNECTION, message: `${fromUser.name} sent you a connection request.`, connection: relation._id });
  return { status: relation.status, id: String(relation._id) };
}

export async function respondToConnection({ connectionId, userId, action, actorName }) {
  const relation = await Follow.findOne({ _id: connectionId, to: userId, status: "pending" });
  if (!relation) throw httpError(404, "Connection request not found.");
  if (action === "accept") {
    relation.status = "accepted";
    await relation.save();
    await createNotification({ recipient: relation.from, actor: userId, type: NOTIFICATION_TYPES.CONNECTION, message: `${actorName} accepted your connection request.`, connection: relation._id });
  } else {
    await relation.deleteOne();
  }
  return { status: action === "accept" ? "accepted" : "rejected" };
}

export async function removeConnection({ connectionId, userId }) {
  const relation = await Follow.findOneAndDelete({ _id: connectionId, $or: [{ from: userId }, { to: userId }] });
  if (!relation) throw httpError(404, "Connection not found.");
}

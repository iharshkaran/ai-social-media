import mongoose from "mongoose";
import Follow from "../models/Follow.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { httpError } from "../utils/httpError.js";

const userFields = "name headline course year university photo";

async function ensureConnected(userId, otherUserId) {
  if (String(userId) === String(otherUserId)) throw httpError(400, "You cannot message yourself.");
  if (!mongoose.isValidObjectId(otherUserId)) throw httpError(400, "Invalid student id.");
  const [userExists, connection] = await Promise.all([
    User.exists({ _id: otherUserId }),
    Follow.exists({ status: "accepted", $or: [{ from: userId, to: otherUserId }, { from: otherUserId, to: userId }] }),
  ]);
  if (!userExists) throw httpError(404, "Student not found.");
  if (!connection) throw httpError(403, "You can message students after connecting.");
}

function formatMessage(message, viewerId) {
  const sender = message.sender || {};
  return {
    id: String(message._id),
    senderId: String(sender._id || sender),
    from: String(sender._id || sender) === String(viewerId) ? "you" : "them",
    text: message.text,
    createdAt: message.createdAt,
    readAt: message.readAt,
  };
}

export async function listMessageInbox(userId) {
  const messages = await Message.find({ $or: [{ sender: userId }, { recipient: userId }] })
    .sort({ createdAt: -1 }).limit(1000).populate("sender", userFields).populate("recipient", userFields).lean();
  const conversations = new Map();
  for (const message of messages) {
    const isSender = String(message.sender?._id) === String(userId);
    const other = isSender ? message.recipient : message.sender;
    if (!other?._id) continue;
    const otherId = String(other._id);
    const current = conversations.get(otherId) || {
      userId: otherId,
      name: other.name,
      photo: other.photo || "",
      role: [other.course, other.year, other.university].filter(Boolean).join(" · ") || other.headline || "Connectly student",
      lastMessage: message.text,
      lastMessageAt: message.createdAt,
      unreadCount: 0,
    };
    if (!isSender && !message.readAt) current.unreadCount += 1;
    conversations.set(otherId, current);
  }
  return [...conversations.values()];
}

export async function listMessageThread({ userId, otherUserId }) {
  await ensureConnected(userId, otherUserId);
  const filter = { $or: [{ sender: userId, recipient: otherUserId }, { sender: otherUserId, recipient: userId }] };
  await Message.updateMany({ sender: otherUserId, recipient: userId, readAt: null }, { $set: { readAt: new Date() } });
  const messages = await Message.find(filter).sort({ createdAt: 1 }).limit(300).populate("sender", "name photo").lean();
  return messages.map((message) => formatMessage(message, userId));
}

export async function createMessage({ user, otherUserId, text }) {
  await ensureConnected(user._id, otherUserId);
  const message = await Message.create({ sender: user._id, recipient: otherUserId, text });
  return formatMessage({ ...message.toObject(), sender: { _id: user._id } }, user._id);
}

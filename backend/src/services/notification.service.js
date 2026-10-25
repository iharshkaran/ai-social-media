import Notification from "../models/Notification.js";

export async function createNotification({ recipient, actor = null, type = "system", message, post = null, connection = null }) {
  if (!recipient || (actor && String(recipient) === String(actor))) return null;
  return Notification.create({ recipient, actor, type, message, post, connection });
}

export async function listNotifications(userId) {
  const notifications = await Notification.find({ recipient: userId })
    .populate("actor", "name photo")
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();
  return notifications.map((notification) => ({
    id: String(notification._id), type: notification.type,
    title: notification.type === "connection" ? "Connection update" : notification.type === "like" ? "New like" : notification.type === "comment" ? "New comment" : "Connectly",
    message: notification.message, name: notification.actor?.name || "Connectly",
    photo: notification.actor?.photo || "", read: notification.read, createdAt: notification.createdAt,
  }));
}

export async function markNotificationsRead(userId, notificationId) {
  const filter = { recipient: userId, read: false };
  if (notificationId) filter._id = notificationId;
  const result = await Notification.updateMany(filter, { $set: { read: true } });
  return result.modifiedCount;
}

export async function dismissNotification(userId, notificationId) {
  const deleted = await Notification.findOneAndDelete({ _id: notificationId, recipient: userId });
  return Boolean(deleted);
}

export async function clearNotifications(userId) {
  const result = await Notification.deleteMany({ recipient: userId });
  return result.deletedCount;
}

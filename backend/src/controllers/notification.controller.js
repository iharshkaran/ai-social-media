import { clearNotifications, dismissNotification, listNotifications, markNotificationsRead } from "../services/notification.service.js";

export async function getNotifications(req, res) {
  return res.json({ success: true, data: await listNotifications(req.user._id) });
}

export async function markRead(req, res) {
  const updated = await markNotificationsRead(req.user._id, req.validated.id);
  return res.json({ success: true, data: { updated } });
}

export async function dismiss(req, res) {
  const deleted = await dismissNotification(req.user._id, req.params.id);
  if (!deleted) return res.status(404).json({ success: false, message: "Notification not found." });
  return res.json({ success: true });
}

export async function clearAll(req, res) {
  const deleted = await clearNotifications(req.user._id);
  return res.json({ success: true, data: { deleted } });
}


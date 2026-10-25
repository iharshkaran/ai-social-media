import { createMessage, listMessageInbox, listMessageThread } from "../services/message.service.js";

export async function getInbox(req, res) {
  const inbox = await listMessageInbox(req.user._id);
  return res.json({ success: true, data: inbox });
}

export async function getThread(req, res) {
  const messages = await listMessageThread({ userId: req.user._id, otherUserId: req.params.userId });
  return res.json({ success: true, data: messages });
}

export async function sendMessage(req, res) {
  const message = await createMessage({ user: req.user, otherUserId: req.params.userId, text: req.validated.text });
  return res.status(201).json({ success: true, data: message });
}

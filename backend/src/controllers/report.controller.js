import { reportPost } from "../services/report.service.js";

export async function createReport(req, res) {
  await reportPost({ reporterId: req.user._id, ...req.validated });
  return res.status(201).json({ success: true, message: "Thank you. The post was reported for review." });
}

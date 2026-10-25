import { createImageKitUploadAuth } from "../services/imagekit.service.js";

export function getImageKitUploadAuth(_req, res) {
  return res.json({ success: true, data: createImageKitUploadAuth() });
}

import { createHmac, randomUUID } from "node:crypto";
import { httpError } from "../utils/httpError.js";

export function createImageKitUploadAuth() {
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!publicKey || !privateKey) {
    throw httpError(503, "Image uploads are not configured. Check ImageKit keys in backend/.env and restart the backend.");
  }

  const token = randomUUID();
  const expire = Math.floor(Date.now() / 1000) + 30 * 60;
  const signature = createHmac("sha1", privateKey).update(`${token}${expire}`).digest("hex");
  return { token, expire, signature, publicKey };
}

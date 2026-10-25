import { api } from "./api";

const IMAGEKIT_UPLOAD_URL = "https://upload.imagekit.io/api/v1/files/upload";

export async function uploadImageToImageKit(file, folder, onProgress) {
  const auth = await api.imagekitAuth();
  const formData = new FormData();
  formData.append("file", file);
  formData.append("fileName", file.name || `connectly-${Date.now()}.jpg`);
  formData.append("publicKey", auth.publicKey);
  formData.append("token", auth.token);
  formData.append("expire", String(auth.expire));
  formData.append("signature", auth.signature);
  formData.append("folder", folder);
  formData.append("useUniqueFileName", "true");

  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", IMAGEKIT_UPLOAD_URL);
    request.timeout = 60_000;
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100));
    };
    request.onerror = () => reject(new Error("ImageKit upload failed. Check your internet connection and try again."));
    request.ontimeout = () => reject(new Error("Image upload took too long. Please try again."));
    request.onload = () => {
      let response = {};
      try { response = JSON.parse(request.responseText); } catch { /* Use the generic upload error below. */ }
      if (request.status < 200 || request.status >= 300) {
        reject(new Error(response.message || response.help || "ImageKit could not upload this image."));
        return;
      }
      if (!response.url) {
        reject(new Error("ImageKit uploaded the image but did not return its URL."));
        return;
      }
      resolve({ url: response.url, fileId: response.fileId });
    };
    request.send(formData);
  });
}

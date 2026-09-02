import { v2 as cloudinary } from "cloudinary";
import type { StorageProvider } from "./types";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const CloudinaryStorageProvider: StorageProvider = {
  async save(file, filename) {
    const safeName = filename.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "-");
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "tiendatroblox",
          public_id: `${Date.now()}-${safeName}`,
          resource_type: "image",
          // Cap ảnh gốc để không lưu file điện thoại 10-20MB; crop vuông hiển thị làm ở URL giao (lib/image.ts).
          transformation: [{ width: 1600, height: 1600, crop: "limit" }],
          quality: "auto:good",
        },
        (err, res) => (err || !res ? reject(err) : resolve(res))
      );
      stream.end(file);
    });
    return result.secure_url;
  },
};

import { writeFile, mkdir } from "fs/promises";
import path from "path";
import type { StorageProvider } from "./types";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export const LocalStorageProvider: StorageProvider = {
  async save(file, filename) {
    await mkdir(UPLOAD_DIR, { recursive: true });
    const safeName = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, "")}`;
    await writeFile(path.join(UPLOAD_DIR, safeName), file);
    return `/uploads/${safeName}`;
  },
};

// ponytail: local disk storage only, swap for Vercel Blob/Cloudinary in next milestone.
export const storageProvider = LocalStorageProvider;

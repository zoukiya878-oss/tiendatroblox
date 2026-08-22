import { LocalStorageProvider } from "./local";
import { CloudinaryStorageProvider } from "./cloudinary";
import type { StorageProvider } from "./types";

// ponytail: env-driven provider swap — matches the adapter pattern used for
// payment providers, no caller change needed when switching providers.
export const storageProvider: StorageProvider =
  process.env.STORAGE_PROVIDER === "cloudinary" ? CloudinaryStorageProvider : LocalStorageProvider;

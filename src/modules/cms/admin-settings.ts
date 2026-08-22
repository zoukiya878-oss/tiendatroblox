import { prisma } from "@/lib/prisma";
import type { SiteSettings } from "./site-settings";

// Re-exported so admin code has one obvious import path for the shape too.
export type { SiteSettings } from "./site-settings";

export async function saveSiteSettings(settings: SiteSettings) {
  await prisma.siteSetting.upsert({
    where: { key: "site" },
    create: { key: "site", value: JSON.stringify(settings) },
    update: { value: JSON.stringify(settings) },
  });
}

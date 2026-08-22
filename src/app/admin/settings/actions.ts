"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { getSiteSettings } from "@/modules/cms/site-settings";
import { saveSiteSettings } from "@/modules/cms/admin-settings";
import { writeAuditLog, auditJson } from "@/modules/audit/log";

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user?.id || (role !== "ADMIN" && role !== "SUPER_ADMIN")) {
    throw new Error("Không có quyền truy cập");
  }
  return session.user.id as string;
}

export async function updateSiteSettingsAction(formData: FormData) {
  const actorUserId = await requireAdmin();
  const before = await getSiteSettings();

  const next = {
    siteName: String(formData.get("siteName") ?? before.siteName),
    heroTitle: String(formData.get("heroTitle") ?? before.heroTitle),
    heroDescription: String(formData.get("heroDescription") ?? before.heroDescription),
    facebookUrl: String(formData.get("facebookUrl") ?? ""),
    zaloUrl: String(formData.get("zaloUrl") ?? ""),
    telegramUrl: String(formData.get("telegramUrl") ?? ""),
    supportEmail: String(formData.get("supportEmail") ?? ""),
    supportHours: String(formData.get("supportHours") ?? ""),
    bankName: String(formData.get("bankName") ?? ""),
    bankAccountNumber: String(formData.get("bankAccountNumber") ?? ""),
    bankAccountName: String(formData.get("bankAccountName") ?? ""),
  };

  await saveSiteSettings(next);
  await writeAuditLog({
    actorUserId,
    action: "SETTINGS_UPDATE",
    entityType: "SiteSetting",
    entityId: "site",
    beforeData: auditJson(before),
    afterData: auditJson(next),
  });

  revalidatePath("/admin/settings");
  revalidatePath("/");
}

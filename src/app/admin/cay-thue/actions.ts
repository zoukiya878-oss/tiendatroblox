"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { saveCayThueServices, type CayThueService } from "@/modules/cms/cay-thue-settings";
import { writeAuditLog, auditJson } from "@/modules/audit/log";

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user?.id || (role !== "ADMIN" && role !== "SUPER_ADMIN")) {
    throw new Error("Không có quyền truy cập");
  }
  return session.user.id as string;
}

export async function updateCayThueServicesAction(formData: FormData) {
  const actorUserId = await requireAdmin();

  let services: CayThueService[] = [];
  try {
    const parsed = JSON.parse(String(formData.get("servicesJson") ?? "[]"));
    if (Array.isArray(parsed)) {
      services = parsed.map((s) => ({
        name: String(s?.name ?? "").trim(),
        price: Math.max(0, Math.round(Number(s?.price) || 0)),
      }));
    }
  } catch {
    services = [];
  }

  const saved = await saveCayThueServices(services);
  await writeAuditLog({
    actorUserId,
    action: "SETTINGS_UPDATE",
    entityType: "CayThueServices",
    entityId: "cay_thue_services",
    afterData: auditJson(saved),
  });

  revalidatePath("/admin/cay-thue");
  revalidatePath("/vat-pham", "layout");
}

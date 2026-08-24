"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { saveCardDiscountRates, type CardDiscountRates, type CardTelco } from "@/modules/cms/card-discount-settings";
import { writeAuditLog, auditJson } from "@/modules/audit/log";

const TELCOS: CardTelco[] = ["VIETTEL", "VINAPHONE", "MOBIFONE"];

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user?.id || (role !== "ADMIN" && role !== "SUPER_ADMIN")) {
    throw new Error("Không có quyền truy cập");
  }
  return session.user.id as string;
}

export async function updateCardDiscountRatesAction(formData: FormData) {
  const actorUserId = await requireAdmin();

  const next = {} as CardDiscountRates;
  for (const telco of TELCOS) {
    const raw = Number(formData.get(telco));
    const pct = Number.isFinite(raw) ? Math.min(100, Math.max(0, raw)) : 100;
    next[telco] = pct;
  }

  await saveCardDiscountRates(next);
  await writeAuditLog({
    actorUserId,
    action: "SETTINGS_UPDATE",
    entityType: "CardDiscountRates",
    entityId: "card_discount_rates",
    afterData: auditJson(next),
  });

  revalidatePath("/admin/card-discounts");
}

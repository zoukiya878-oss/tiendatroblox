"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toBigIntVnd } from "@/lib/money";
import { writeAuditLog, auditJson } from "@/modules/audit/log";
import type { CouponType } from "@prisma/client";

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user?.id || (role !== "ADMIN" && role !== "SUPER_ADMIN")) {
    throw new Error("Không có quyền truy cập");
  }
  return session.user.id as string;
}

export async function upsertCouponAction(id: string | null, formData: FormData) {
  const actorUserId = await requireAdmin();

  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const type = String(formData.get("type") ?? "PERCENT") as CouponType;
  const value = toBigIntVnd(String(formData.get("value") ?? "0"));
  const minimumOrderRaw = formData.get("minimumOrder");
  const maximumDiscountRaw = formData.get("maximumDiscount");
  const usageLimitRaw = formData.get("usageLimit");
  const usagePerUserRaw = formData.get("usagePerUser");
  const startAtRaw = formData.get("startAt");
  const endAtRaw = formData.get("endAt");
  const active = formData.get("active") === "on";

  if (!code) throw new Error("Cần nhập mã coupon");

  const data = {
    code,
    type,
    value,
    minimumOrder: minimumOrderRaw ? toBigIntVnd(String(minimumOrderRaw)) : null,
    maximumDiscount: maximumDiscountRaw ? toBigIntVnd(String(maximumDiscountRaw)) : null,
    usageLimit: usageLimitRaw ? Number(usageLimitRaw) : null,
    usagePerUser: usagePerUserRaw ? Number(usagePerUserRaw) : null,
    startAt: startAtRaw ? new Date(String(startAtRaw)) : null,
    endAt: endAtRaw ? new Date(String(endAtRaw)) : null,
    active,
  };

  if (id) {
    const before = await prisma.coupon.findUniqueOrThrow({ where: { id } });
    const coupon = await prisma.coupon.update({ where: { id }, data });
    await writeAuditLog({
      actorUserId,
      action: "COUPON_UPDATE",
      entityType: "Coupon",
      entityId: id,
      beforeData: auditJson(before),
      afterData: auditJson(coupon),
    });
  } else {
    const coupon = await prisma.coupon.create({ data });
    await writeAuditLog({
      actorUserId,
      action: "COUPON_CREATE",
      entityType: "Coupon",
      entityId: coupon.id,
      afterData: auditJson(coupon),
    });
  }

  revalidatePath("/admin/coupons");
}

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

// Actions used across /admin — matches the set implied by prisma/schema.prisma comments.
export type AuditAction =
  | "PRODUCT_CREATE"
  | "PRODUCT_UPDATE"
  | "PRODUCT_DELETE"
  | "CATEGORY_CREATE"
  | "CATEGORY_UPDATE"
  | "ORDER_STATUS_CHANGE"
  | "ORDER_CANCEL"
  | "ORDER_REFUND"
  | "TOPUP_APPROVE"
  | "TOPUP_REJECT"
  | "WALLET_ADJUST"
  | "USER_LOCK"
  | "USER_UNLOCK"
  | "USER_ROLE_CHANGE"
  | "COUPON_CREATE"
  | "COUPON_UPDATE"
  | "ADMIN_LOGIN"
  | "BLOG_CREATE"
  | "BLOG_UPDATE"
  | "FAQ_CREATE"
  | "FAQ_UPDATE"
  | "ANNOUNCEMENT_CREATE"
  | "ANNOUNCEMENT_UPDATE"
  | "SETTINGS_UPDATE";

// Prisma Json fields can't hold BigInt directly (money fields are BigInt) — stringify first.
export function auditJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value, (_k, v) => (typeof v === "bigint" ? v.toString() : v)));
}

export async function writeAuditLog(params: {
  actorUserId?: string | null;
  action: AuditAction;
  entityType?: string;
  entityId?: string;
  beforeData?: Prisma.InputJsonValue | null;
  afterData?: Prisma.InputJsonValue | null;
  ip?: string;
  userAgent?: string;
}) {
  await prisma.auditLog.create({
    data: {
      actorUserId: params.actorUserId ?? null,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      beforeData: params.beforeData ?? undefined,
      afterData: params.afterData ?? undefined,
      ip: params.ip,
      userAgent: params.userAgent,
    },
  });
}

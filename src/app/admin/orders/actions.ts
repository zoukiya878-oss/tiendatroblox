"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { creditWallet } from "@/modules/wallets/wallet-service";
import { writeAuditLog, auditJson } from "@/modules/audit/log";
import type { OrderStatus } from "@prisma/client";

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user?.id || (role !== "ADMIN" && role !== "SUPER_ADMIN")) {
    throw new Error("Không có quyền truy cập");
  }
  return session.user.id as string;
}

export async function changeOrderStatusAction(orderId: string, formData: FormData) {
  const actorUserId = await requireAdmin();
  const toStatus = String(formData.get("status") ?? "") as OrderStatus;
  const note = String(formData.get("note") ?? "").trim() || undefined;

  const order = await prisma.$transaction(async (tx) => {
    const before = await tx.order.findUniqueOrThrow({ where: { id: orderId } });
    const updated = await tx.order.update({
      where: { id: orderId },
      data: {
        status: toStatus,
        completedAt: toStatus === "COMPLETED" ? new Date() : before.completedAt,
      },
    });
    await tx.orderStatusHistory.create({
      data: { orderId, fromStatus: before.status, toStatus, changedBy: actorUserId, note },
    });
    return { before, updated };
  });

  await writeAuditLog({
    actorUserId,
    action: "ORDER_STATUS_CHANGE",
    entityType: "Order",
    entityId: orderId,
    beforeData: auditJson({ status: order.before.status }),
    afterData: auditJson({ status: order.updated.status }),
  });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}

export async function cancelOrderAction(orderId: string, formData: FormData) {
  const actorUserId = await requireAdmin();
  const note = String(formData.get("note") ?? "").trim() || "Huỷ bởi admin";

  const result = await prisma.$transaction(async (tx) => {
    const before = await tx.order.findUniqueOrThrow({ where: { id: orderId } });
    const updated = await tx.order.update({ where: { id: orderId }, data: { status: "CANCELLED" } });
    await tx.orderStatusHistory.create({
      data: { orderId, fromStatus: before.status, toStatus: "CANCELLED", changedBy: actorUserId, note },
    });
    return { before, updated };
  });

  await writeAuditLog({
    actorUserId,
    action: "ORDER_CANCEL",
    entityType: "Order",
    entityId: orderId,
    beforeData: auditJson({ status: result.before.status }),
    afterData: auditJson({ status: result.updated.status }),
  });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}

export async function refundOrderAction(orderId: string, formData: FormData) {
  const actorUserId = await requireAdmin();
  const reason = String(formData.get("reason") ?? "").trim();
  if (!reason) throw new Error("Cần nhập lý do hoàn tiền");

  const result = await prisma.$transaction(async (tx) => {
    const before = await tx.order.findUniqueOrThrow({ where: { id: orderId } });
    if (before.status === "REFUNDED") throw new Error("Đơn hàng đã được hoàn tiền trước đó");

    await creditWallet(tx, {
      userId: before.userId,
      amount: before.total,
      type: "REFUND",
      referenceType: "ORDER",
      referenceId: orderId,
      description: `Hoàn tiền đơn ${before.orderCode}: ${reason}`,
    });

    const updated = await tx.order.update({ where: { id: orderId }, data: { status: "REFUNDED" } });
    await tx.orderStatusHistory.create({
      data: { orderId, fromStatus: before.status, toStatus: "REFUNDED", changedBy: actorUserId, note: reason },
    });
    return { before, updated };
  });

  await writeAuditLog({
    actorUserId,
    action: "ORDER_REFUND",
    entityType: "Order",
    entityId: orderId,
    beforeData: auditJson({ status: result.before.status }),
    afterData: auditJson({ status: result.updated.status, amount: result.before.total, reason }),
  });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}

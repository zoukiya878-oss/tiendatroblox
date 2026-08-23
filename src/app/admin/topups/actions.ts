"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { processTopupWebhook } from "@/modules/topups/process-topup";
import { writeAuditLog, auditJson } from "@/modules/audit/log";

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user?.id || (role !== "ADMIN" && role !== "SUPER_ADMIN")) {
    throw new Error("Không có quyền truy cập");
  }
  return session.user.id as string;
}

// ponytail: dev-only simulate button — the UI hides it in production, but re-check here too
// (defense in depth) since server actions are directly callable regardless of what's rendered.
export async function simulateTopupAction(topupCode: string, success: boolean) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Chức năng này chỉ dùng ở môi trường development");
  }
  const actorUserId = await requireAdmin();

  const result = await processTopupWebhook({
    provider: "ADMIN_SIMULATE",
    externalEventId: crypto.randomUUID(),
    topupCode,
    success,
    payload: { simulatedByAdmin: true },
  });

  await writeAuditLog({
    actorUserId,
    action: success ? "TOPUP_APPROVE" : "TOPUP_REJECT",
    entityType: "Topup",
    entityId: topupCode,
    afterData: auditJson(result),
  });

  revalidatePath("/admin/topups");
}

// Duyệt tay production — dùng khi provider (VD gachthefast) không tự bắn
// callback được (lỗi hạ tầng phía họ). Admin tự đối chiếu bằng mắt (VD xem
// lịch sử "Thẻ đúng" bên gachthefast) rồi bấm duyệt, có ghi audit log rõ ai
// duyệt để truy vết nếu duyệt sai.
export async function manualApproveTopupAction(topupCode: string, success: boolean) {
  const actorUserId = await requireAdmin();

  const result = await processTopupWebhook({
    provider: "ADMIN_MANUAL",
    externalEventId: crypto.randomUUID(),
    topupCode,
    success,
    payload: { manuallyApprovedBy: actorUserId },
  });

  await writeAuditLog({
    actorUserId,
    action: success ? "TOPUP_APPROVE" : "TOPUP_REJECT",
    entityType: "Topup",
    entityId: topupCode,
    afterData: auditJson(result),
  });

  revalidatePath("/admin/topups");
}

"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { processTopupWebhook } from "@/modules/topups/process-topup";
import { writeAuditLog, auditJson } from "@/modules/audit/log";
import { checkCardStatus } from "@/providers/gachthefast/charging";
import { getPaymentIntegrationSettings } from "@/modules/cms/payment-integration-settings";

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

// Chủ động hỏi trạng thái thẻ (command=check) thay vì ngồi chờ callback —
// dùng khi callback gachthefast lỗi hạ tầng hoặc đơn kẹt PENDING lâu.
export async function checkCardStatusAction(topupCode: string) {
  const actorUserId = await requireAdmin();

  const topup = await prisma.topup.findUnique({ where: { topupCode } });
  if (!topup || topup.provider !== "CARD") {
    throw new Error("Chỉ áp dụng cho nạp thẻ cào");
  }
  if (topup.status !== "PENDING") return;

  const meta = topup.meta as Record<string, string> | null;
  if (!meta?.cardCode || !meta.serial || !meta.cardProvider || !meta.gachthefastRequestId) {
    throw new Error("Đơn thiếu dữ liệu thẻ, không check được");
  }

  const integration = await getPaymentIntegrationSettings();
  if (!integration.gachthefastApiKey || !integration.gachthefastPartnerId) {
    throw new Error("Chưa cấu hình gachthefast");
  }

  const result = await checkCardStatus({
    partnerId: integration.gachthefastPartnerId,
    partnerKey: integration.gachthefastApiKey,
    telco: meta.cardProvider,
    code: meta.cardCode,
    serial: meta.serial,
    amount: topup.amount,
    requestId: meta.gachthefastRequestId,
  });

  // status 99 = vẫn đang chờ, chưa có gì để cập nhật.
  if (result.status === 99) return;

  const success = result.status === 1 || result.status === 2;
  const webhookResult = await processTopupWebhook({
    provider: "gachthefast",
    externalEventId: `check-${topupCode}-${Date.now()}`,
    topupCode,
    success,
    payload: result,
    actualAmount: success && result.value ? BigInt(result.value) : undefined,
  });

  await writeAuditLog({
    actorUserId,
    action: success ? "TOPUP_APPROVE" : "TOPUP_REJECT",
    entityType: "Topup",
    entityId: topupCode,
    afterData: auditJson({ checkResult: result, webhookResult }),
  });

  revalidatePath("/admin/topups");
}

// Duyệt tay production — dùng khi provider (VD gachthefast) không tự bắn
// callback được (lỗi hạ tầng phía họ). Admin tự đối chiếu bằng mắt (VD xem
// lịch sử "Thẻ đúng" bên gachthefast) rồi bấm duyệt, có ghi audit log rõ ai
// duyệt để truy vết nếu duyệt sai.
export async function manualApproveTopupAction(topupCode: string, success: boolean) {
  const actorUserId = await requireAdmin();

  const topup = await prisma.topup.findUnique({ where: { topupCode } });
  if (topup?.provider !== "CARD") {
    throw new Error("Duyệt tay chỉ áp dụng cho nạp thẻ cào");
  }

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

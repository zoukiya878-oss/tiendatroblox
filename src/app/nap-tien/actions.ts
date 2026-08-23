"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { toBigIntVnd } from "@/lib/money";
import { createTopup, processTopupWebhook } from "@/modules/topups/process-topup";
import { prisma } from "@/lib/prisma";
import { getPaymentIntegrationSettings } from "@/modules/cms/payment-integration-settings";
import { chargeCard } from "@/providers/gachthefast/charging";

export type TopupState = { error?: string };

const MIN_AMOUNT = 10_000;

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) redirect("/dang-nhap?callbackUrl=/nap-tien");
  return session.user.id;
}

function parseAmount(formData: FormData): bigint | null {
  const raw = String(formData.get("amount") ?? "").trim();
  if (!raw) return null;
  let amount: bigint;
  try {
    amount = toBigIntVnd(raw);
  } catch {
    return null;
  }
  if (amount < BigInt(MIN_AMOUNT)) return null;
  return amount;
}

async function submitTopup(provider: "BANK", formData: FormData): Promise<TopupState> {
  const userId = await requireUserId();
  const amount = parseAmount(formData);
  if (amount === null) {
    return { error: `Số tiền nạp tối thiểu là ${MIN_AMOUNT.toLocaleString("vi-VN")}đ` };
  }

  const { topup } = await createTopup({ userId, provider, amount });
  redirect(`/nap-tien/ket-qua/${topup.topupCode}`);
}

export async function createBankTopupAction(_prev: TopupState, formData: FormData): Promise<TopupState> {
  return submitTopup("BANK", formData);
}

export async function createCardTopupAction(_prev: TopupState, formData: FormData): Promise<TopupState> {
  const userId = await requireUserId();
  const cardProvider = String(formData.get("cardProvider") ?? "").trim();
  const serial = String(formData.get("serial") ?? "").trim();
  const cardCode = String(formData.get("cardCode") ?? "").trim();
  const amount = parseAmount(formData);

  if (!cardProvider || !serial || !cardCode) {
    return { error: "Vui lòng nhập đầy đủ nhà mạng, số serial và mã thẻ" };
  }
  if (amount === null) {
    return { error: `Mệnh giá thẻ tối thiểu là ${MIN_AMOUNT.toLocaleString("vi-VN")}đ` };
  }

  const { topup } = await createTopup({ userId, provider: "CARD", amount });

  const requestId = Date.now().toString();
  await prisma.topup.update({
    where: { id: topup.id },
    data: {
      meta: {
        ...(topup.meta as Record<string, string> | null),
        cardProvider,
        serial,
        cardCode,
        gachthefastRequestId: requestId,
      },
    },
  });

  const integration = await getPaymentIntegrationSettings();
  if (integration.gachthefastApiKey && integration.gachthefastPartnerId) {
    try {
      const result = await chargeCard({
        partnerId: integration.gachthefastPartnerId,
        partnerKey: integration.gachthefastApiKey,
        telco: cardProvider,
        code: cardCode,
        serial,
        amount,
        requestId,
      });

      // status: 1 = đúng thẻ, 2 = đúng thẻ sai mệnh giá (value = mệnh giá thật
      // trên thẻ, dùng làm actualAmount để processTopupWebhook tự phát hiện
      // lệch giá trị), 3/4/100 = lỗi/thẻ sai/bảo trì, 99 = đang chờ duyệt (kết
      // quả cuối cùng sẽ tới qua callback ở /api/webhooks/gachthefast).
      if (result.status === 1 || result.status === 2) {
        await processTopupWebhook({
          provider: "gachthefast",
          externalEventId: `sync-${topup.topupCode}`,
          topupCode: topup.topupCode,
          success: true,
          payload: result,
          actualAmount: result.value ? BigInt(result.value) : undefined,
        });
      } else if (result.status === 3 || result.status === 4 || result.status === 100) {
        await processTopupWebhook({
          provider: "gachthefast",
          externalEventId: `sync-${topup.topupCode}`,
          topupCode: topup.topupCode,
          success: false,
          payload: result,
        });
      }
      // status === 99: giữ nguyên PENDING, chờ callback.
    } catch (err) {
      console.error("[gachthefast] chargeCard failed", err);
      // Lỗi gọi API (mạng, timeout...) — giữ PENDING, admin duyệt tay ở /admin/topups.
    }
  }

  redirect(`/nap-tien/ket-qua/${topup.topupCode}`);
}

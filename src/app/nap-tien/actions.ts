"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { toBigIntVnd } from "@/lib/money";
import { createTopup } from "@/modules/topups/process-topup";
import { prisma } from "@/lib/prisma";

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

  await prisma.topup.update({
    where: { id: topup.id },
    data: {
      meta: {
        ...(topup.meta as Record<string, string> | null),
        cardProvider,
        serial,
        cardCode,
      },
    },
  });

  redirect(`/nap-tien/ket-qua/${topup.topupCode}`);
}

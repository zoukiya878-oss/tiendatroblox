import { prisma } from "@/lib/prisma";
import { creditWallet } from "@/modules/wallets/wallet-service";
import { getPaymentProvider } from "@/providers/payment";
import { generateTopupCode } from "@/modules/orders/order-code";
import type { TopupProvider as TopupProviderEnum } from "@prisma/client";

export async function createTopup(params: { userId: string; provider: TopupProviderEnum; amount: bigint }) {
  const { userId, provider, amount } = params;
  if (amount <= 0n) throw new Error("Số tiền nạp không hợp lệ");

  const topupCode = generateTopupCode();
  const paymentProvider = getPaymentProvider(provider);
  const intent = await paymentProvider.createTopupIntent({ topupCode, amount });

  const topup = await prisma.topup.create({
    data: {
      topupCode,
      userId,
      provider,
      amount,
      fee: 0n,
      netAmount: amount,
      status: "PENDING",
      meta: intent.instructions,
    },
  });

  return { topup, instructions: intent.instructions };
}

/**
 * Processes a payment webhook event idempotently: (provider, externalEventId)
 * is unique, so a duplicate delivery hits the unique constraint and is a no-op.
 */
export async function processTopupWebhook(params: {
  provider: string;
  externalEventId: string;
  topupCode: string;
  success: boolean;
  payload: unknown;
}) {
  const { provider, externalEventId, topupCode, success, payload } = params;

  return prisma.$transaction(async (tx) => {
    try {
      await tx.paymentEvent.create({
        data: { provider, externalEventId, payload: payload as object, processedAt: new Date() },
      });
    } catch {
      return { alreadyProcessed: true };
    }

    const topup = await tx.topup.findUniqueOrThrow({ where: { topupCode } });
    if (topup.status !== "PENDING") {
      return { alreadyProcessed: true };
    }

    if (!success) {
      await tx.topup.update({ where: { id: topup.id }, data: { status: "FAILED" } });
      return { alreadyProcessed: false, status: "FAILED" as const };
    }

    await tx.topup.update({
      where: { id: topup.id },
      data: { status: "SUCCESS", completedAt: new Date() },
    });

    await creditWallet(tx, {
      userId: topup.userId,
      amount: topup.netAmount,
      type: "TOPUP",
      referenceType: "TOPUP",
      referenceId: topup.id,
      description: `Nạp tiền ${topup.topupCode}`,
    });

    return { alreadyProcessed: false, status: "SUCCESS" as const };
  });
}

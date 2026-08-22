import type { Prisma, PrismaClient, WalletTransactionType } from "@prisma/client";

type Tx = PrismaClient | Prisma.TransactionClient;

/**
 * Debits a wallet atomically. Uses a conditional UPDATE (balance >= amount) so
 * two concurrent debits can never both succeed against the same balance —
 * the loser's updateMany affects 0 rows and throws, no row lock/retry needed.
 */
export async function debitWallet(
  tx: Tx,
  params: {
    userId: string;
    amount: bigint;
    type: WalletTransactionType;
    referenceType?: string;
    referenceId?: string;
    description?: string;
  }
) {
  const { userId, amount, type, referenceType, referenceId, description } = params;
  if (amount <= 0n) throw new Error("Debit amount must be positive");

  const wallet = await tx.wallet.findUniqueOrThrow({ where: { userId } });

  const result = await tx.wallet.updateMany({
    where: { userId, balance: { gte: amount } },
    data: { balance: { decrement: amount } },
  });

  if (result.count === 0) {
    throw new InsufficientBalanceError(wallet.balance, amount);
  }

  const updated = await tx.wallet.findUniqueOrThrow({ where: { userId } });

  await tx.walletTransaction.create({
    data: {
      walletId: updated.id,
      userId,
      type,
      amount: -amount,
      balanceBefore: wallet.balance,
      balanceAfter: updated.balance,
      referenceType,
      referenceId,
      description,
    },
  });

  return updated;
}

export async function creditWallet(
  tx: Tx,
  params: {
    userId: string;
    amount: bigint;
    type: WalletTransactionType;
    referenceType?: string;
    referenceId?: string;
    description?: string;
  }
) {
  const { userId, amount, type, referenceType, referenceId, description } = params;
  if (amount <= 0n) throw new Error("Credit amount must be positive");

  const wallet = await tx.wallet.findUniqueOrThrow({ where: { userId } });

  const updated = await tx.wallet.update({
    where: { userId },
    data: { balance: { increment: amount } },
  });

  await tx.walletTransaction.create({
    data: {
      walletId: updated.id,
      userId,
      type,
      amount,
      balanceBefore: wallet.balance,
      balanceAfter: updated.balance,
      referenceType,
      referenceId,
      description,
    },
  });

  return updated;
}

export class InsufficientBalanceError extends Error {
  constructor(public balance: bigint, public required: bigint) {
    super("Insufficient wallet balance");
  }
}

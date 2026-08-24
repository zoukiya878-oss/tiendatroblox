"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAuditLog, auditJson } from "@/modules/audit/log";
import { creditWallet, debitWallet } from "@/modules/wallets/wallet-service";
import { toBigIntVnd } from "@/lib/money";
import type { UserRole } from "@prisma/client";

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user?.id || (role !== "ADMIN" && role !== "SUPER_ADMIN")) {
    throw new Error("Không có quyền truy cập");
  }
  return session.user.id as string;
}

export async function toggleUserLockAction(userId: string, locked: boolean) {
  const actorUserId = await requireAdmin();
  const before = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const user = await prisma.user.update({ where: { id: userId }, data: { locked } });
  await writeAuditLog({
    actorUserId,
    action: locked ? "USER_LOCK" : "USER_UNLOCK",
    entityType: "User",
    entityId: userId,
    beforeData: auditJson({ locked: before.locked }),
    afterData: auditJson({ locked: user.locked }),
  });
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/users");
}

// Đặt số dư mới trực tiếp — tính chênh lệch với số dư hiện tại rồi đi qua
// creditWallet/debitWallet như bình thường (giữ nguyên ledger/audit trail ở
// WalletTransaction), không ghi đè Wallet.balance trực tiếp.
export async function setUserWalletBalanceAction(userId: string, formData: FormData) {
  const actorUserId = await requireAdmin();
  const targetBalance = toBigIntVnd(String(formData.get("balance") ?? "0"));
  if (targetBalance < 0n) throw new Error("Số dư không hợp lệ");

  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  const currentBalance = wallet?.balance ?? 0n;
  const delta = targetBalance - currentBalance;

  if (delta === 0n) return;

  const updated = await prisma.$transaction(async (tx) => {
    if (delta > 0n) {
      return creditWallet(tx, {
        userId,
        amount: delta,
        type: "ADMIN_ADJUSTMENT",
        description: "Admin chỉnh số dư từ trang Người dùng",
      });
    }
    return debitWallet(tx, {
      userId,
      amount: -delta,
      type: "ADMIN_ADJUSTMENT",
      description: "Admin chỉnh số dư từ trang Người dùng",
    });
  });

  await writeAuditLog({
    actorUserId,
    action: "WALLET_ADJUST",
    entityType: "Wallet",
    entityId: updated.id,
    beforeData: auditJson({ balance: currentBalance }),
    afterData: auditJson({ balance: updated.balance }),
  });

  revalidatePath("/admin/users");
}

export async function changeUserRoleAction(userId: string, formData: FormData) {
  const actorUserId = await requireAdmin();
  const role = String(formData.get("role") ?? "") as UserRole;
  const before = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const user = await prisma.user.update({ where: { id: userId }, data: { role } });
  await writeAuditLog({
    actorUserId,
    action: "USER_ROLE_CHANGE",
    entityType: "User",
    entityId: userId,
    beforeData: auditJson({ role: before.role }),
    afterData: auditJson({ role: user.role }),
  });
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/users");
}

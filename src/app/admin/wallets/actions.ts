"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { creditWallet, debitWallet } from "@/modules/wallets/wallet-service";
import { toBigIntVnd } from "@/lib/money";
import { writeAuditLog, auditJson } from "@/modules/audit/log";

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user?.id || (role !== "ADMIN" && role !== "SUPER_ADMIN")) {
    throw new Error("Không có quyền truy cập");
  }
  return session.user.id as string;
}

export async function adjustWalletAction(formData: FormData) {
  const actorUserId = await requireAdmin();
  const username = String(formData.get("username") ?? "").trim();
  const direction = String(formData.get("direction") ?? "credit");
  const amount = toBigIntVnd(String(formData.get("amount") ?? "0"));
  const reason = String(formData.get("reason") ?? "").trim();

  if (!username) throw new Error("Cần nhập username");
  if (amount <= 0n) throw new Error("Số tiền không hợp lệ");
  if (!reason) throw new Error("Cần nhập lý do điều chỉnh");

  const targetUser = await prisma.user.findFirst({ where: { username } });
  if (!targetUser) throw new Error("Không tìm thấy người dùng");

  const before = await prisma.wallet.findUnique({ where: { userId: targetUser.id } });

  const updated = await prisma.$transaction(async (tx) => {
    if (direction === "credit") {
      return creditWallet(tx, {
        userId: targetUser.id,
        amount,
        type: "ADMIN_ADJUSTMENT",
        description: reason,
      });
    }
    return debitWallet(tx, {
      userId: targetUser.id,
      amount,
      type: "ADMIN_ADJUSTMENT",
      description: reason,
    });
  });

  await writeAuditLog({
    actorUserId,
    action: "WALLET_ADJUST",
    entityType: "Wallet",
    entityId: updated.id,
    beforeData: auditJson({ balance: before?.balance ?? 0n }),
    afterData: auditJson({ balance: updated.balance, direction, amount, reason }),
  });

  revalidatePath("/admin/wallets");
}

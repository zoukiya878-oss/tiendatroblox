"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAuditLog, auditJson } from "@/modules/audit/log";
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

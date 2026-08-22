"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAuditLog, auditJson } from "@/modules/audit/log";

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user?.id || (role !== "ADMIN" && role !== "SUPER_ADMIN")) {
    throw new Error("Không có quyền truy cập");
  }
  return session.user.id as string;
}

export async function upsertFaqAction(id: string | null, formData: FormData) {
  const actorUserId = await requireAdmin();
  const question = String(formData.get("question") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();
  const sortOrder = Number(formData.get("sortOrder") ?? 0);
  const active = formData.get("active") === "on";
  if (!question || !answer) throw new Error("Cần nhập câu hỏi và câu trả lời");

  if (id) {
    const before = await prisma.faq.findUniqueOrThrow({ where: { id } });
    const faq = await prisma.faq.update({ where: { id }, data: { question, answer, sortOrder, active } });
    await writeAuditLog({
      actorUserId,
      action: "FAQ_UPDATE",
      entityType: "Faq",
      entityId: id,
      beforeData: auditJson(before),
      afterData: auditJson(faq),
    });
  } else {
    const faq = await prisma.faq.create({ data: { question, answer, sortOrder, active } });
    await writeAuditLog({
      actorUserId,
      action: "FAQ_CREATE",
      entityType: "Faq",
      entityId: faq.id,
      afterData: auditJson(faq),
    });
  }

  revalidatePath("/admin/faqs");
  revalidatePath("/");
}

export async function deleteFaqAction(id: string) {
  const actorUserId = await requireAdmin();
  const before = await prisma.faq.findUniqueOrThrow({ where: { id } });
  await prisma.faq.delete({ where: { id } });
  await writeAuditLog({
    actorUserId,
    action: "FAQ_UPDATE",
    entityType: "Faq",
    entityId: id,
    beforeData: auditJson(before),
    afterData: null,
  });
  revalidatePath("/admin/faqs");
  revalidatePath("/");
}

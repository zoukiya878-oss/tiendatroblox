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

export async function upsertAnnouncementAction(id: string | null, formData: FormData) {
  const actorUserId = await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const ctaLabel = String(formData.get("ctaLabel") ?? "").trim() || null;
  const ctaUrl = String(formData.get("ctaUrl") ?? "").trim() || null;
  const startAtRaw = formData.get("startAt");
  const endAtRaw = formData.get("endAt");
  const active = formData.get("active") === "on";
  if (!title || !content) throw new Error("Cần nhập tiêu đề và nội dung");

  const data = {
    title,
    content,
    ctaLabel,
    ctaUrl,
    startAt: startAtRaw ? new Date(String(startAtRaw)) : null,
    endAt: endAtRaw ? new Date(String(endAtRaw)) : null,
    active,
  };

  if (id) {
    const before = await prisma.announcement.findUniqueOrThrow({ where: { id } });
    const ann = await prisma.announcement.update({ where: { id }, data });
    await writeAuditLog({
      actorUserId,
      action: "ANNOUNCEMENT_UPDATE",
      entityType: "Announcement",
      entityId: id,
      beforeData: auditJson(before),
      afterData: auditJson(ann),
    });
  } else {
    const ann = await prisma.announcement.create({ data });
    await writeAuditLog({
      actorUserId,
      action: "ANNOUNCEMENT_CREATE",
      entityType: "Announcement",
      entityId: ann.id,
      afterData: auditJson(ann),
    });
  }

  revalidatePath("/admin/announcements");
  revalidatePath("/");
}

export async function deleteAnnouncementAction(id: string) {
  const actorUserId = await requireAdmin();
  const before = await prisma.announcement.findUniqueOrThrow({ where: { id } });
  await prisma.announcement.delete({ where: { id } });
  await writeAuditLog({
    actorUserId,
    action: "ANNOUNCEMENT_UPDATE",
    entityType: "Announcement",
    entityId: id,
    beforeData: auditJson(before),
    afterData: null,
  });
  revalidatePath("/admin/announcements");
  revalidatePath("/");
}

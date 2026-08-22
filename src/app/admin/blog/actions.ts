"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { storageProvider } from "@/providers/storage/local";
import { writeAuditLog, auditJson } from "@/modules/audit/log";
import type { BlogStatus } from "@prisma/client";

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user?.id || (role !== "ADMIN" && role !== "SUPER_ADMIN")) {
    throw new Error("Không có quyền truy cập");
  }
  return session.user.id as string;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function upsertBlogPostAction(id: string | null, formData: FormData) {
  const actorUserId = await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Cần nhập tiêu đề");
  const slugInput = String(formData.get("slug") ?? "").trim();
  const slug = slugInput || slugify(title);
  const excerpt = String(formData.get("excerpt") ?? "").trim() || null;
  const content = String(formData.get("content") ?? "").trim();
  const status = String(formData.get("status") ?? "DRAFT") as BlogStatus;
  const seoTitle = String(formData.get("seoTitle") ?? "").trim() || null;
  const seoDescription = String(formData.get("seoDescription") ?? "").trim() || null;

  const thumbnailFile = formData.get("thumbnailFile");
  let thumbnail = String(formData.get("existingThumbnail") ?? "") || null;
  if (thumbnailFile instanceof File && thumbnailFile.size > 0) {
    const buffer = Buffer.from(await thumbnailFile.arrayBuffer());
    thumbnail = await storageProvider.save(buffer, thumbnailFile.name);
  }

  if (id) {
    const before = await prisma.blogPost.findUniqueOrThrow({ where: { id } });
    const publishedAt = status === "PUBLISHED" && !before.publishedAt ? new Date() : before.publishedAt;
    const post = await prisma.blogPost.update({
      where: { id },
      data: { title, slug, excerpt, content, thumbnail, status, seoTitle, seoDescription, publishedAt },
    });
    await writeAuditLog({
      actorUserId,
      action: "BLOG_UPDATE",
      entityType: "BlogPost",
      entityId: id,
      beforeData: auditJson(before),
      afterData: auditJson(post),
    });
  } else {
    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        thumbnail,
        status,
        seoTitle,
        seoDescription,
        authorId: actorUserId,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
      },
    });
    await writeAuditLog({
      actorUserId,
      action: "BLOG_CREATE",
      entityType: "BlogPost",
      entityId: post.id,
      afterData: auditJson(post),
    });
  }

  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  redirect("/admin/blog");
}

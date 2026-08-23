"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAuditLog, auditJson } from "@/modules/audit/log";
import { storageProvider } from "@/providers/storage";

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

export async function upsertCategoryAction(id: string | null, formData: FormData) {
  const actorUserId = await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const sortOrder = Number(formData.get("sortOrder") ?? 0);
  const active = formData.get("active") === "on";
  const parentId = String(formData.get("parentId") ?? "").trim() || null;
  const keepExistingImage = formData.get("keepExistingImage") === "1";
  if (!name) throw new Error("Tên danh mục là bắt buộc");
  const slug = slugInput || slugify(name);

  let image: string | null = null;
  const imageFile = formData.get("imageFile");
  if (imageFile instanceof File && imageFile.size > 0) {
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    image = await storageProvider.save(buffer, imageFile.name);
  }

  if (id) {
    const before = await prisma.category.findUniqueOrThrow({ where: { id } });
    if (!image) image = keepExistingImage ? before.image : null;
    const category = await prisma.category.update({
      where: { id },
      data: { name, slug, description, image, sortOrder, active, parentId },
    });
    await writeAuditLog({
      actorUserId,
      action: "CATEGORY_UPDATE",
      entityType: "Category",
      entityId: id,
      beforeData: auditJson(before),
      afterData: auditJson(category),
    });
  } else {
    const category = await prisma.category.create({
      data: { name, slug, description, image, sortOrder, active, parentId },
    });
    await writeAuditLog({
      actorUserId,
      action: "CATEGORY_CREATE",
      entityType: "Category",
      entityId: category.id,
      afterData: auditJson(category),
    });
  }

  revalidatePath("/vat-pham");
  revalidatePath("/admin/categories");
}

export async function toggleCategoryActiveAction(id: string, active: boolean) {
  const actorUserId = await requireAdmin();

  if (active === false) {
    const inUse = await prisma.product.count({ where: { categoryId: id, active: true } });
    if (inUse > 0) {
      throw new Error("Không thể ẩn danh mục đang có sản phẩm hoạt động");
    }
  }

  const before = await prisma.category.findUniqueOrThrow({ where: { id } });
  const category = await prisma.category.update({ where: { id }, data: { active } });
  await writeAuditLog({
    actorUserId,
    action: "CATEGORY_UPDATE",
    entityType: "Category",
    entityId: id,
    beforeData: auditJson({ active: before.active }),
    afterData: auditJson({ active: category.active }),
  });

  revalidatePath("/vat-pham");
  revalidatePath("/admin/categories");
}

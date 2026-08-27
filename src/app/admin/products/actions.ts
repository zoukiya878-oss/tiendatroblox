"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { storageProvider } from "@/providers/storage";
import { toBigIntVnd } from "@/lib/money";
import { writeAuditLog, auditJson } from "@/modules/audit/log";
import {
  createProduct,
  updateProduct,
  duplicateProduct,
  toggleProductActive,
  type ProductInput,
} from "@/modules/products/admin-product-service";
import type { DeliveryType, ProductFieldType } from "@prisma/client";

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user?.id || (role !== "ADMIN" && role !== "SUPER_ADMIN")) {
    throw new Error("Không có quyền truy cập");
  }
  return session.user.id as string;
}

// ponytail: server-side guard — custom field key phải là slug an toàn (khách
// nhập field theo key này lúc mua), tránh key có dấu/khoảng trắng do gõ tay.
function slugifyKey(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function revalidateProductPages(slug?: string) {
  revalidatePath("/vat-pham");
  if (slug) revalidatePath(`/vat-pham/${slug}`);
}

async function buildProductInput(formData: FormData): Promise<ProductInput> {
  const imageFiles = formData.getAll("imageFiles").filter((f): f is File => f instanceof File && f.size > 0);
  const uploaded = await Promise.all(
    imageFiles.map(async (file) => {
      const buffer = Buffer.from(await file.arrayBuffer());
      const url = await storageProvider.save(buffer, file.name);
      return { url, alt: "", sortOrder: 0 };
    })
  );

  let existingImages: { url: string; alt: string; sortOrder: number }[] = [];
  try {
    existingImages = JSON.parse(String(formData.get("imagesJson") ?? "[]"));
  } catch {
    existingImages = [];
  }

  const images = [...existingImages, ...uploaded].map((img, idx) => ({
    url: img.url,
    alt: img.alt || undefined,
    sortOrder: idx,
  }));

  let fieldsParsed: {
    label: string;
    key: string;
    type: ProductFieldType;
    required: boolean;
    placeholder: string;
    options: string;
  }[] = [];
  try {
    fieldsParsed = JSON.parse(String(formData.get("fieldsJson") ?? "[]"));
  } catch {
    fieldsParsed = [];
  }
  const fields = fieldsParsed
    .map((f) => ({ ...f, key: slugifyKey(f.key || f.label) }))
    .filter((f) => f.label && f.key)
    .map((f, idx) => ({
      label: f.label,
      key: f.key,
      type: f.type,
      required: !!f.required,
      placeholder: f.placeholder || undefined,
      options: f.options || undefined,
      sortOrder: idx,
    }));

  const holdDaysRaw = formData.get("holdDays");
  const compareAtPriceRaw = formData.get("compareAtPrice");

  return {
    name: String(formData.get("name") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
    code: String(formData.get("code") ?? "").trim(),
    categoryId: String(formData.get("categoryId") ?? ""),
    price: toBigIntVnd(String(formData.get("price") ?? "0")),
    compareAtPrice: compareAtPriceRaw ? toBigIntVnd(String(compareAtPriceRaw)) : null,
    stock: Number(formData.get("stock") ?? 0),
    shortDescription: String(formData.get("shortDescription") ?? "").trim() || undefined,
    description: String(formData.get("description") ?? "").trim() || undefined,
    deliveryType: (String(formData.get("deliveryType") ?? "INSTANT") as DeliveryType),
    holdDays: holdDaysRaw ? Number(holdDaysRaw) : null,
    featured: formData.get("featured") === "on",
    active: formData.get("active") === "on",
    seoTitle: String(formData.get("seoTitle") ?? "").trim() || undefined,
    seoDescription: String(formData.get("seoDescription") ?? "").trim() || undefined,
    images,
    fields,
  };
}

export async function createProductAction(formData: FormData) {
  const actorUserId = await requireAdmin();
  const input = await buildProductInput(formData);
  if (!input.name || !input.slug || !input.code || !input.categoryId) {
    throw new Error("Thiếu thông tin bắt buộc");
  }

  const product = await createProduct(input);
  await writeAuditLog({
    actorUserId,
    action: "PRODUCT_CREATE",
    entityType: "Product",
    entityId: product.id,
    afterData: auditJson(product),
  });

  revalidateProductPages(product.slug);
  redirect("/admin/products");
}

export async function updateProductAction(id: string, formData: FormData) {
  const actorUserId = await requireAdmin();
  const before = await prisma.product.findUniqueOrThrow({ where: { id } });
  const input = await buildProductInput(formData);
  if (!input.name || !input.slug || !input.code || !input.categoryId) {
    throw new Error("Thiếu thông tin bắt buộc");
  }

  const product = await updateProduct(id, input);
  await writeAuditLog({
    actorUserId,
    action: "PRODUCT_UPDATE",
    entityType: "Product",
    entityId: product.id,
    beforeData: auditJson(before),
    afterData: auditJson(product),
  });

  revalidateProductPages(before.slug);
  revalidateProductPages(product.slug);
  redirect("/admin/products");
}

export async function duplicateProductAction(id: string) {
  const actorUserId = await requireAdmin();
  const product = await duplicateProduct(id);
  await writeAuditLog({
    actorUserId,
    action: "PRODUCT_CREATE",
    entityType: "Product",
    entityId: product.id,
    afterData: auditJson(product),
  });
  revalidateProductPages(product.slug);
  redirect(`/admin/products/${product.id}`);
}

export async function toggleProductActiveAction(id: string, active: boolean) {
  const actorUserId = await requireAdmin();
  const before = await prisma.product.findUniqueOrThrow({ where: { id } });
  const product = await toggleProductActive(id, active);
  await writeAuditLog({
    actorUserId,
    action: "PRODUCT_UPDATE",
    entityType: "Product",
    entityId: id,
    beforeData: auditJson({ active: before.active }),
    afterData: auditJson({ active: product.active }),
  });
  revalidateProductPages(product.slug);
}

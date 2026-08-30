import { prisma } from "@/lib/prisma";
import type { DeliveryType, ProductFieldType } from "@prisma/client";

// ponytail: bảo hiểm server-side — client (product-form.tsx) đã tự slugify,
// nhưng nếu có đường nhập liệu khác (import hàng loạt, API) bỏ qua bước đó,
// slug thô (có dấu cách/dấu tiếng Việt) sẽ vỡ route /vat-pham/[slug].
function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export interface ProductImageInput {
  url: string;
  alt?: string;
  sortOrder: number;
}

export interface ProductFieldInput {
  label: string;
  key: string;
  type: ProductFieldType;
  required: boolean;
  placeholder?: string;
  options?: string;
  sortOrder: number;
}

export interface ProductInput {
  name: string;
  slug: string;
  code: string;
  categoryId: string;
  price: bigint;
  compareAtPrice: bigint | null;
  stock: number;
  shortDescription?: string;
  description?: string;
  deliveryType: DeliveryType;
  holdDays: number | null;
  featured: boolean;
  active: boolean;
  seoTitle?: string;
  seoDescription?: string;
  accountUsername?: string;
  accountPassword?: string;
  images: ProductImageInput[];
  fields: ProductFieldInput[];
}

export async function createProduct(input: ProductInput) {
  return prisma.product.create({
    data: {
      name: input.name,
      slug: slugify(input.slug),
      code: input.code,
      categoryId: input.categoryId,
      price: input.price,
      compareAtPrice: input.compareAtPrice,
      stock: input.stock,
      shortDescription: input.shortDescription || null,
      description: input.description || null,
      deliveryType: input.deliveryType,
      holdDays: input.holdDays,
      featured: input.featured,
      active: input.active,
      seoTitle: input.seoTitle || null,
      seoDescription: input.seoDescription || null,
      accountUsername: input.accountUsername || null,
      accountPassword: input.accountPassword || null,
      images: { create: input.images },
      fields: { create: input.fields },
    },
  });
}

export async function updateProduct(id: string, input: ProductInput) {
  // Replace images/fields wholesale — simplest correct approach for a small admin form.
  return prisma.$transaction(async (tx) => {
    await tx.productImage.deleteMany({ where: { productId: id } });
    await tx.productField.deleteMany({ where: { productId: id } });
    return tx.product.update({
      where: { id },
      data: {
        name: input.name,
        slug: slugify(input.slug),
        code: input.code,
        categoryId: input.categoryId,
        price: input.price,
        compareAtPrice: input.compareAtPrice,
        stock: input.stock,
        shortDescription: input.shortDescription || null,
        description: input.description || null,
        deliveryType: input.deliveryType,
        holdDays: input.holdDays,
        featured: input.featured,
        active: input.active,
        seoTitle: input.seoTitle || null,
        seoDescription: input.seoDescription || null,
        images: { create: input.images },
        fields: { create: input.fields },
      },
    });
  });
}

export async function duplicateProduct(id: string) {
  const source = await prisma.product.findUniqueOrThrow({
    where: { id },
    include: { images: true, fields: true },
  });
  const code = `${source.code}-COPY-${Date.now().toString(36).toUpperCase()}`;
  const slug = `${source.slug}-copy-${Date.now().toString(36)}`;
  return prisma.product.create({
    data: {
      name: `${source.name} (bản sao)`,
      slug,
      code,
      categoryId: source.categoryId,
      price: source.price,
      compareAtPrice: source.compareAtPrice,
      stock: 0,
      shortDescription: source.shortDescription,
      description: source.description,
      deliveryType: source.deliveryType,
      holdDays: source.holdDays,
      featured: false,
      active: false,
      seoTitle: source.seoTitle,
      seoDescription: source.seoDescription,
      images: { create: source.images.map((i) => ({ url: i.url, alt: i.alt, sortOrder: i.sortOrder })) },
      fields: {
        create: source.fields.map((f) => ({
          label: f.label,
          key: f.key,
          type: f.type,
          required: f.required,
          placeholder: f.placeholder,
          options: f.options,
          sortOrder: f.sortOrder,
        })),
      },
    },
  });
}

export async function toggleProductActive(id: string, active: boolean) {
  return prisma.product.update({ where: { id }, data: { active } });
}

import { prisma } from "@/lib/prisma";
import type { DeliveryType, Prisma } from "@prisma/client";

export type ProductSort =
  | "newest"
  | "price_asc"
  | "price_desc"
  | "name_asc"
  | "best_selling";

export interface ListProductsParams {
  categoryId?: string;
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  deliveryType?: DeliveryType;
  inStockOnly?: boolean;
  sort?: ProductSort;
  page?: number;
  pageSize?: number;
}

const SORT_MAP: Record<ProductSort, Prisma.ProductOrderByWithRelationInput> = {
  newest: { createdAt: "desc" },
  price_asc: { price: "asc" },
  price_desc: { price: "desc" },
  name_asc: { name: "asc" },
  best_selling: { soldCount: "desc" },
};

export async function listProducts(params: ListProductsParams = {}) {
  const {
    categoryId,
    q,
    minPrice,
    maxPrice,
    deliveryType,
    inStockOnly,
    sort = "newest",
    page = 1,
    pageSize = 12,
  } = params;

  const where: Prisma.ProductWhereInput = {
    active: true,
    ...(categoryId && { categoryId }),
    ...(deliveryType && { deliveryType }),
    ...(inStockOnly && { stock: { gt: 0 } }),
    ...(q && { name: { contains: q, mode: "insensitive" } }),
    ...((minPrice !== undefined || maxPrice !== undefined) && {
      price: {
        ...(minPrice !== undefined && { gte: BigInt(Math.round(minPrice)) }),
        ...(maxPrice !== undefined && { lte: BigInt(Math.round(maxPrice)) }),
      },
    }),
  };

  const skip = (Math.max(1, page) - 1) * pageSize;

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: SORT_MAP[sort],
      skip,
      take: pageSize,
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 }, category: true },
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total, page: Math.max(1, page), pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getFeaturedProducts(limit = 8) {
  return prisma.product.findMany({
    where: { active: true, featured: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });
}

import { prisma } from "@/lib/prisma";

export async function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, active: true },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      fields: { orderBy: { sortOrder: "asc" } },
      category: true,
    },
  });
}

export async function getRelatedProducts(categoryId: string, excludeId: string, limit = 4) {
  return prisma.product.findMany({
    where: { categoryId, active: true, id: { not: excludeId } },
    orderBy: { soldCount: "desc" },
    take: limit,
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });
}

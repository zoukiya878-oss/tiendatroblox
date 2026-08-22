import { prisma } from "@/lib/prisma";

// ponytail: public order lookup by code only, no auth required per spec — do not add PII beyond order/items.
export async function lookupOrder(orderCode: string) {
  return prisma.order.findUnique({
    where: { orderCode },
    include: {
      items: true,
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
  });
}

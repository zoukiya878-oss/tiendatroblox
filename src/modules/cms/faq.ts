import { prisma } from "@/lib/prisma";

export async function getActiveFaqs() {
  return prisma.faq.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
}

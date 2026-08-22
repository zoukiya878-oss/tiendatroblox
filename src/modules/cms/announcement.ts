import { prisma } from "@/lib/prisma";

export async function getActiveAnnouncement() {
  const now = new Date();
  return prisma.announcement.findFirst({
    where: {
      active: true,
      OR: [{ startAt: null }, { startAt: { lte: now } }],
      AND: [{ OR: [{ endAt: null }, { endAt: { gte: now } }] }],
    },
    orderBy: { createdAt: "desc" },
  });
}

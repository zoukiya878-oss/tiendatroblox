import { prisma } from "@/lib/prisma";
import { maskUsername } from "@/lib/money";

export async function getRecentTopups(limit = 10) {
  const rows = await prisma.topup.findMany({
    where: { status: "SUCCESS" },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { user: { select: { username: true } } },
  });
  return rows.map((t) => ({
    id: t.id,
    username: maskUsername(t.user.username),
    amount: t.amount,
    provider: t.provider,
    createdAt: t.createdAt,
  }));
}

export async function getRecentPurchases(limit = 10) {
  const rows = await prisma.order.findMany({
    where: { status: { in: ["PAID", "COMPLETED"] } },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      user: { select: { username: true } },
      items: { take: 1, select: { productName: true } },
    },
  });
  return rows.map((o) => ({
    id: o.id,
    username: maskUsername(o.user.username),
    productName: o.items[0]?.productName ?? "",
    total: o.total,
    createdAt: o.createdAt,
  }));
}

export async function getMonthlyLeaderboard(limit = 10) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const grouped = await prisma.topup.groupBy({
    by: ["userId"],
    where: { status: "SUCCESS", createdAt: { gte: monthStart } },
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
    take: limit,
  });

  if (grouped.length === 0) return [];

  const users = await prisma.user.findMany({
    where: { id: { in: grouped.map((g) => g.userId) } },
    select: { id: true, username: true },
  });
  const usernameById = new Map(users.map((u) => [u.id, u.username]));

  return grouped.map((g) => ({
    userId: g.userId,
    username: maskUsername(usernameById.get(g.userId) ?? "???"),
    total: g._sum.amount ?? 0n,
  }));
}

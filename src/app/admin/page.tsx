import { prisma } from "@/lib/prisma";
import { formatVnd } from "@/lib/money";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

async function getStats() {
  const now = new Date();
  const today = startOfDay(now);
  const monthStart = startOfMonth(now);
  const paidStatuses = ["PAID", "COMPLETED"] as const;

  const [
    revenueToday,
    revenueMonth,
    ordersToday,
    totalUsers,
    topupVolume,
    pendingOrders,
    pendingTopups,
    lowStockProducts,
  ] = await Promise.all([
    prisma.order.aggregate({ _sum: { total: true }, where: { status: { in: [...paidStatuses] }, createdAt: { gte: today } } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: { in: [...paidStatuses] }, createdAt: { gte: monthStart } } }),
    prisma.order.count({ where: { createdAt: { gte: today } } }),
    prisma.user.count(),
    prisma.topup.aggregate({ _sum: { amount: true }, where: { status: "SUCCESS", createdAt: { gte: monthStart } } }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.topup.count({ where: { status: "PENDING" } }),
    prisma.product.count({ where: { active: true, stock: { lt: 5 } } }),
  ]);

  return {
    revenueToday: revenueToday._sum.total ?? 0n,
    revenueMonth: revenueMonth._sum.total ?? 0n,
    ordersToday,
    totalUsers,
    topupVolume: topupVolume._sum.amount ?? 0n,
    pendingOrders,
    pendingTopups,
    lowStockProducts,
  };
}

async function getLast7DaysRevenue() {
  const now = new Date();
  const days: { label: string; total: bigint }[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const nextDay = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1);
    const agg = await prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { in: ["PAID", "COMPLETED"] }, createdAt: { gte: day, lt: nextDay } },
    });
    days.push({ label: `${day.getDate()}/${day.getMonth() + 1}`, total: agg._sum.total ?? 0n });
  }
  return days;
}

function BarChart({ data }: { data: { label: string; total: bigint }[] }) {
  const max = Math.max(1, ...data.map((d) => Number(d.total)));
  return (
    <div className="flex h-40 items-end gap-2">
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
          <div
            className="w-full rounded-t bg-primary"
            style={{ height: `${Math.max(2, (Number(d.total) / max) * 100)}%` }}
            title={formatVnd(d.total)}
          />
          <span className="text-xs text-muted-foreground">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default async function AdminDashboardPage() {
  const [stats, chartData] = await Promise.all([getStats(), getLast7DaysRevenue()]);

  const cards = [
    { label: "Doanh thu hôm nay", value: formatVnd(stats.revenueToday) },
    { label: "Doanh thu tháng này", value: formatVnd(stats.revenueMonth) },
    { label: "Đơn hàng hôm nay", value: stats.ordersToday },
    { label: "Tổng người dùng", value: stats.totalUsers },
    { label: "Volume nạp tiền (tháng)", value: formatVnd(stats.topupVolume) },
    { label: "Đơn hàng chờ xử lý", value: stats.pendingOrders },
    { label: "Nạp tiền chờ xử lý", value: stats.pendingTopups },
    { label: "Sản phẩm sắp hết hàng", value: stats.lowStockProducts },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-normal text-muted-foreground">{c.label}</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">{c.value}</CardContent>
          </Card>
        ))}
      </div>
      <Card className="bg-card">
        <CardHeader>
          <CardTitle>Doanh thu 7 ngày gần nhất</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart data={chartData} />
        </CardContent>
      </Card>
    </div>
  );
}

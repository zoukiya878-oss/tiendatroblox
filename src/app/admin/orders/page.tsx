import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatVnd } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { OrderStatus, Prisma } from "@prisma/client";

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Chờ xử lý",
  PAID: "Đã thanh toán",
  PROCESSING: "Đang xử lý",
  DELIVERING: "Đang giao",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã huỷ",
  REFUNDED: "Đã hoàn tiền",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const where: Prisma.OrderWhereInput = {};
  if (sp.q) {
    where.OR = [
      { orderCode: { contains: sp.q, mode: "insensitive" } },
      { user: { username: { contains: sp.q, mode: "insensitive" } } },
      { user: { email: { contains: sp.q, mode: "insensitive" } } },
    ];
  }
  if (sp.status) where.status = sp.status as OrderStatus;
  if (sp.from || sp.to) {
    where.createdAt = {
      ...(sp.from && { gte: new Date(sp.from) }),
      ...(sp.to && { lte: new Date(sp.to + "T23:59:59") }),
    };
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: { select: { username: true, email: true } } },
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-2xl font-semibold">Đơn hàng</h1>

      <form className="flex flex-wrap items-end gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Tìm kiếm</label>
          <Input name="q" defaultValue={sp.q} placeholder="Mã đơn, username, email" className="w-56" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Trạng thái</label>
          <select
            name="status"
            defaultValue={sp.status ?? ""}
            className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm dark:bg-input/30"
          >
            <option value="">Tất cả</option>
            {Object.entries(STATUS_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Từ ngày</label>
          <Input name="from" type="date" defaultValue={sp.from} className="w-40" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Đến ngày</label>
          <Input name="to" type="date" defaultValue={sp.to} className="w-40" />
        </div>
        <Button type="submit">Lọc</Button>
      </form>

      <div className="overflow-x-auto rounded-xl bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã đơn</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Tổng tiền</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead>Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-mono text-xs">{o.orderCode}</TableCell>
                <TableCell>{o.user.username}</TableCell>
                <TableCell>{formatVnd(o.total)}</TableCell>
                <TableCell>
                  <Badge>{STATUS_LABEL[o.status]}</Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{o.createdAt.toLocaleString("vi-VN")}</TableCell>
                <TableCell>
                  <Button size="sm" variant="outline" render={<Link href={`/admin/orders/${o.id}`} />}>
                    Xem
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Không có đơn hàng nào
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

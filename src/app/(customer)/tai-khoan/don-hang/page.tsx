import Link from "next/link";
import { redirect } from "next/navigation";
import { PackageOpen, Store, ShoppingBag } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatVnd } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@prisma/client";

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Chờ xử lý",
  PAID: "Đã thanh toán",
  PROCESSING: "Đang xử lý",
  DELIVERING: "Đang giao",
  COMPLETED: "Hoàn tất",
  CANCELLED: "Đã huỷ",
  REFUNDED: "Đã hoàn tiền",
};

const FILTERS: { value: string; label: string; statuses?: OrderStatus[] }[] = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chờ", statuses: ["PENDING"] },
  { value: "processing", label: "Đang xử lý", statuses: ["PAID", "PROCESSING", "DELIVERING"] },
  { value: "completed", label: "Hoàn tất", statuses: ["COMPLETED"] },
  { value: "cancelled", label: "Đã huỷ", statuses: ["CANCELLED", "REFUNDED"] },
];

export default async function DonHangPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/dang-nhap?callbackUrl=/tai-khoan/don-hang");

  const { filter = "all" } = await searchParams;
  const activeFilter = FILTERS.find((f) => f.value === filter) ?? FILTERS[0];

  const orders = await prisma.order.findMany({
    where: {
      userId: session.user.id,
      ...(activeFilter.statuses ? { status: { in: activeFilter.statuses } } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl bg-gradient-to-br from-card via-card to-primary/10 p-6 ring-1 ring-foreground/10">
        <p className="text-xs font-bold tracking-widest text-primary uppercase">Đơn hàng</p>
        <h1 className="mt-1 font-heading text-2xl font-extrabold">Đơn Hàng Của Tôi</h1>
        <p className="mt-1 text-sm text-muted-foreground">Tra cứu và theo dõi toàn bộ đơn hàng của bạn</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={`/tai-khoan/don-hang?filter=${f.value}`}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              f.value === activeFilter.value
                ? "bg-gradient-to-r from-primary to-brand-pink text-white"
                : "bg-card text-muted-foreground ring-1 ring-foreground/10 hover:text-foreground"
            )}
          >
            {f.label}
          </Link>
        ))}
        <Link
          href="/vat-pham"
          className="ml-auto flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-brand-pink px-4 py-2 text-sm font-semibold text-white"
        >
          <ShoppingBag className="size-4" /> Mua thêm
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <PackageOpen className="size-16 text-muted-foreground/30" />
          <p className="text-muted-foreground">Bạn chưa có đơn hàng nào.</p>
          <Link
            href="/vat-pham"
            className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-brand-pink px-5 py-2.5 text-sm font-semibold text-white"
          >
            <Store className="size-4" /> Đến cửa hàng
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/don-hang/${order.orderCode}`}
              className="flex items-center justify-between gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10 transition-colors hover:ring-primary/40"
            >
              <div>
                <p className="font-mono text-sm font-medium text-primary">{order.orderCode}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(order.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold">{formatVnd(order.total)}</span>
                <Badge variant="outline">{STATUS_LABEL[order.status]}</Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
